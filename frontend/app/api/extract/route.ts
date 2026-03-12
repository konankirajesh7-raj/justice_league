import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const EXTRACT_PROMPT = `Extract opportunity details from this message. Return ONLY a JSON object, nothing else.

JSON format:
{"company":"org name","role":"position title","type":"Job","branch_eligible":"All","cgpa_required":null,"deadline":null,"location":"Not mentioned","stipend":"Not mentioned","apply_link":null,"required_skills":"skill1, skill2, skill3"}

Rules:
- type must be one of: Internship, Job, Hackathon, Scholarship
- deadline format: YYYY-MM-DD or null
- cgpa_required: number or null 
- apply_link: URL string or null
- required_skills: extract any skills, technologies, qualifications mentioned (e.g. "Python, React, Data Analysis, Communication") or null if none mentioned

Message:
`;

// Spam detection keywords
const SPAM_KEYWORDS = [
  "guaranteed placement", "100% placement", "deposit required", "pay first",
  "registration fee", "lottery", "winner", "congratulations you won",
  "claim your prize", "earn from home", "mlm", "network marketing",
  "click here urgently", "limited time only", "act now", "whatsapp only"
];

const SUSPICIOUS_PATTERNS = [
  /bit\.ly/i, /tinyurl/i, /short\.link/i,
  /\d{10,}/, // very long numbers
];

function detectSpam(text: string, extracted: Record<string, unknown>): { isSpam: boolean; score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  const lowerText = text.toLowerCase();

  // Check for spam keywords
  for (const keyword of SPAM_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      score += 30;
      reasons.push(`Contains suspicious phrase: "${keyword}"`);
    }
  }

  // Check for suspicious URL patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      score += 15;
      reasons.push("Contains suspicious URL shortener or pattern");
      break;
    }
  }

  // Missing company name
  if (!extracted.company || extracted.company === "Unknown") {
    score += 10;
    reasons.push("No company/organization name found");
  }

  // No apply link and no deadline — could be vague
  if (!extracted.apply_link && !extracted.deadline) {
    score += 10;
    reasons.push("No apply link or deadline found");
  }

  return { isSpam: score >= 30, score, reasons };
}

function calculateUrgency(deadlineStr: string | null): { days_left: number; urgency: string } {
  if (!deadlineStr) return { days_left: 99, urgency: "green" };
  try {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { days_left: 0, urgency: "red" };
    if (days <= 3) return { days_left: days, urgency: "red" };
    if (days <= 7) return { days_left: days, urgency: "yellow" };
    return { days_left: days, urgency: "green" };
  } catch {
    return { days_left: 99, urgency: "green" };
  }
}

function extractFirstJSON(raw: string): Record<string, unknown> {
  raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = raw.indexOf("{");
  if (start === -1) throw new Error("No JSON object found");
  let depth = 0;
  let end = -1;
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === "{") depth++;
    else if (raw[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error("Unbalanced JSON braces");
  return JSON.parse(raw.substring(start, end + 1));
}

async function extractWithGroq(text: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");
  const groq = new Groq({ apiKey });
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You output only valid JSON. No explanations, no markdown, just a single JSON object." },
      { role: "user", content: EXTRACT_PROMPT + text }
    ],
    max_tokens: 500,
    temperature: 0,
    response_format: { type: "json_object" },
  });
  const raw = response.choices[0]?.message?.content?.trim() || "";
  return extractFirstJSON(raw);
}

async function extractWithGemini(text: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: EXTRACT_PROMPT + text }] }],
            generationConfig: { temperature: 0, responseMimeType: "application/json" },
          }),
        }
      );
      if (res.status === 429) continue;
      if (!res.ok) continue;
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      return extractFirstJSON(raw);
    } catch { continue; }
  }
  throw new Error("All Gemini models failed");
}

async function checkDuplicate(userId: string, company: string, role: string, deadline: string | null) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  let query = supabase
    .from("opportunities")
    .select("id, company, role")
    .eq("user_id", userId)
    .ilike("company", `%${company}%`)
    .ilike("role", `%${role}%`);
  
  if (deadline) {
    query = query.eq("deadline", deadline);
  }

  const { data } = await query.limit(1);
  return data && data.length > 0 ? data[0] : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, userId } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const cleanText = text.replace(/[^\x00-\x7F]/g, " ").replace(/\s+/g, " ").trim();

    let result;
    try {
      result = await extractWithGroq(cleanText);
    } catch {
      try {
        result = await extractWithGemini(cleanText);
      } catch (e2) {
        return NextResponse.json({ error: `AI extraction failed: ${String(e2)}` }, { status: 500 });
      }
    }

    // Calculate urgency
    const { days_left, urgency } = calculateUrgency(result.deadline as string || null);
    result.days_left = days_left;
    result.urgency = urgency;
    result.raw_text = text;

    // Spam detection
    const spam = detectSpam(text, result);
    result.isSpam = spam.isSpam;
    result.spamScore = spam.score;
    result.spamReasons = spam.reasons;

    // Duplicate detection (if userId provided)
    if (userId && result.company && result.role) {
      const duplicate = await checkDuplicate(
        userId,
        result.company as string,
        result.role as string,
        result.deadline as string || null
      );
      if (duplicate) {
        result.isDuplicate = true;
        result.duplicateId = duplicate.id;
      } else {
        result.isDuplicate = false;
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: `Server error: ${String(err)}` }, { status: 500 });
  }
}
