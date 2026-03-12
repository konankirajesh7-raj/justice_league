import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const EXTRACT_PROMPT = `You are an expert opportunity parser for Indian college students. Extract details from this student opportunity message and return ONLY valid JSON with absolutely no extra text, no markdown, no backticks:
{
  "company": "company name",
  "role": "job/internship title",
  "type": "Internship or Job or Hackathon or Scholarship",
  "branch_eligible": "CSE, ECE, IT or All",
  "cgpa_required": 7.5 or null,
  "deadline": "YYYY-MM-DD" or null,
  "location": "city name or Remote",
  "stipend": "amount with rupee symbol or Not mentioned",
  "apply_link": "https://... or null"
}
Message: `;

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

async function extractWithGroq(text: string) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: EXTRACT_PROMPT + text }],
    max_tokens: 500,
  });
  let raw = response.choices[0]?.message?.content?.trim() || "";
  raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(raw);
}

async function extractWithGemini(text: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: EXTRACT_PROMPT + text }] }],
      }),
    }
  );
  const data = await res.json();
  let raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(raw);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    let result;

    // Try Groq first, fallback to Gemini
    try {
      result = await extractWithGroq(text);
    } catch {
      try {
        result = await extractWithGemini(text);
      } catch (e2) {
        return NextResponse.json(
          { error: `AI extraction failed: ${String(e2)}` },
          { status: 500 }
        );
      }
    }

    const { days_left, urgency } = calculateUrgency(result.deadline || null);
    result.days_left = days_left;
    result.urgency = urgency;
    result.raw_text = text;

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    );
  }
}
