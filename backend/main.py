from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import google.generativeai as genai
from supabase import create_client
from datetime import datetime, date
import json, os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="OpportUnity API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

EXTRACT_PROMPT = """You are an expert opportunity parser for Indian college students. Extract details from this student opportunity message and return ONLY valid JSON with absolutely no extra text, no markdown, no backticks:
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
Message: """


class ExtractRequest(BaseModel):
    text: str


class SaveRequest(BaseModel):
    user_id: str
    company: str
    role: str
    type: str
    branch_eligible: str
    cgpa_required: float = None
    deadline: str = None
    location: str
    stipend: str
    apply_link: str = None
    raw_text: str


class UpvoteRequest(BaseModel):
    user_id: str


def calculate_urgency(deadline_str):
    if not deadline_str:
        return 99, "green"
    try:
        deadline = datetime.strptime(deadline_str, "%Y-%m-%d").date()
        days = (deadline - date.today()).days
        if days <= 0:
            return 0, "red"
        elif days <= 3:
            return days, "red"
        elif days <= 7:
            return days, "yellow"
        else:
            return days, "green"
    except Exception:
        return 99, "green"


@app.get("/health")
def health():
    return {"status": "live", "version": "1.0.0"}


@app.post("/extract")
def extract(req: ExtractRequest):
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": EXTRACT_PROMPT + req.text
            }],
            max_tokens=500,
        )
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)
    except Exception as e:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(EXTRACT_PROMPT + req.text)
            raw = response.text.strip()
            raw = raw.replace("```json", "").replace("```", "").strip()
            result = json.loads(raw)
        except Exception as e2:
            raise HTTPException(
                status_code=500,
                detail=f"AI extraction failed: {str(e2)}"
            )

    days_left, urgency = calculate_urgency(result.get("deadline"))
    result["days_left"] = days_left
    result["urgency"] = urgency
    result["raw_text"] = req.text
    return result


@app.post("/save")
def save(req: SaveRequest):
    days_left, urgency = calculate_urgency(req.deadline)
    data = {
        "user_id": req.user_id,
        "company": req.company,
        "role": req.role,
        "type": req.type,
        "branch_eligible": req.branch_eligible,
        "cgpa_required": req.cgpa_required,
        "deadline": req.deadline,
        "location": req.location,
        "stipend": req.stipend,
        "apply_link": req.apply_link,
        "raw_text": req.raw_text,
        "days_left": days_left,
        "urgency": urgency,
    }
    result = supabase.table("opportunities").insert(data).execute()
    return result.data[0]


@app.get("/opportunities/{user_id}")
def get_opportunities(user_id: str):
    result = (
        supabase.table("opportunities")
        .select("*")
        .eq("user_id", user_id)
        .order("deadline", desc=False)
        .execute()
    )
    return result.data


@app.delete("/opportunities/{opportunity_id}")
def delete_opportunity(opportunity_id: str):
    supabase.table("opportunities").delete().eq("id", opportunity_id).execute()
    return {"message": "Deleted successfully"}


@app.put("/opportunities/{opportunity_id}/applied")
def mark_applied(opportunity_id: str):
    result = (
        supabase.table("opportunities")
        .update({"is_applied": True})
        .eq("id", opportunity_id)
        .execute()
    )
    return result.data[0]


@app.put("/opportunities/{opportunity_id}/public")
def toggle_public(opportunity_id: str):
    current = (
        supabase.table("opportunities")
        .select("is_public")
        .eq("id", opportunity_id)
        .single()
        .execute()
    )
    new_val = not current.data["is_public"]
    result = (
        supabase.table("opportunities")
        .update({"is_public": new_val})
        .eq("id", opportunity_id)
        .execute()
    )
    return result.data[0]


@app.get("/community")
def get_community():
    result = (
        supabase.table("opportunities")
        .select("*, users(name, college, branch)")
        .eq("is_public", True)
        .order("upvotes", desc=True)
        .execute()
    )
    return result.data


@app.post("/community/{opportunity_id}/upvote")
def upvote(opportunity_id: str, req: UpvoteRequest):
    try:
        supabase.table("upvotes").insert({
            "opportunity_id": opportunity_id,
            "user_id": req.user_id,
        }).execute()
        current = (
            supabase.table("opportunities")
            .select("upvotes")
            .eq("id", opportunity_id)
            .single()
            .execute()
        )
        new_count = (current.data["upvotes"] or 0) + 1
        supabase.table("opportunities").update({"upvotes": new_count}).eq(
            "id", opportunity_id
        ).execute()
        return {"upvotes": new_count, "voted": True}
    except Exception:
        return {"message": "Already upvoted", "voted": False}
