import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const EXTRACT_PROMPT = `Extract opportunity details from this message. Return ONLY a JSON object, nothing else.

JSON format:
{"company":"org name","role":"position title","type":"Job","branch_eligible":"All","cgpa_required":null,"deadline":null,"location":"Not mentioned","stipend":"Not mentioned","apply_link":null}

Rules:
- type must be one of: Internship, Job, Hackathon, Scholarship
- deadline format: YYYY-MM-DD or null
- cgpa_required: number or null
- apply_link: URL string or null

Message:
`;

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
  // Remove markdown fences
  raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  
  // Find the first { and extract balanced JSON
  const start = raw.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in response");
  
  let depth = 0;
  let end = -1;
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === "{") depth++;
    else if (raw[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  
  if (end === -1) throw new Error("Unbalanced JSON braces");
  
  const jsonStr = raw.substring(start, end + 1);
  return JSON.parse(jsonStr);
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
    max_tokens: 400,
    temperature: 0,
    response_format: { type: "json_object" },
  });
  const raw = response.choices[0]?.message?.content?.trim() || "";
  console.log("[Groq] Response:", raw.substring(0, 300));
  return extractFirstJSON(raw);
}

async function extractWithGemini(text: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  // Try gemini-2.0-flash first, then gemini-1.5-flash
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
      
      if (res.status === 429) {
        console.log(`[Gemini] ${model} rate limited, trying next model...`);
        continue;
      }
      
      if (!res.ok) {
        console.error(`[Gemini] ${model} error:`, res.status);
        continue;
      }
      
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      console.log(`[Gemini ${model}] Response:`, raw.substring(0, 300));
      return extractFirstJSON(raw);
    } catch (err) {
      console.error(`[Gemini] ${model} failed:`, err);
      continue;
    }
  }
  
  throw new Error("All Gemini models failed or rate limited");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Clean non-ASCII chars for better AI parsing
    const cleanText = text.replace(/[^\x00-\x7F]/g, " ").replace(/\s+/g, " ").trim();

    let result;
    let groqError = "";
    let geminiError = "";

    // Try Groq first (fast), fallback to Gemini
    try {
      result = await extractWithGroq(cleanText);
    } catch (e1) {
      groqError = String(e1);
      console.error("[Extract] Groq failed:", groqError);
      try {
        result = await extractWithGemini(cleanText);
      } catch (e2) {
        geminiError = String(e2);
        console.error("[Extract] Gemini also failed:", geminiError);
        return NextResponse.json(
          { error: `Groq: ${groqError}. Gemini: ${geminiError}` },
          { status: 500 }
        );
      }
    }

    const { days_left, urgency } = calculateUrgency(result.deadline as string || null);
    result.days_left = days_left;
    result.urgency = urgency;
    result.raw_text = text;

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Extract] Unexpected error:", err);
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    );
  }
}
