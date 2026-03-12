# 🔔 OpportUnity — Never Miss an Opportunity Buried in WhatsApp

> **PROJECT REMEMBER ME** — Built in 24 hours for the hackathon

## 🎯 Problem

93M+ Indian college students miss internships, jobs, hackathons, and scholarships because opportunities are shared as unstructured WhatsApp forwards with no tracking, no reminders, and no organization.

## 💡 Solution

**Paste any WhatsApp message → AI extracts company, role, eligibility, deadline, link → saved as clean searchable card → deadline reminders automatically.**

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email/Password + Google OAuth) |
| AI Primary | Groq API (Llama 3.3 70B) |
| AI Backup | Gemini 1.5 Flash |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |

## 📁 Project Structure

```
opportunity/
├── frontend/          # Next.js 14 App
│   ├── app/           # Pages (Landing, Login, Extract, Dashboard, Community, Profile)
│   ├── components/    # Shared components (Navbar, OpportunityCard, etc.)
│   ├── lib/           # Supabase client + API utilities
│   └── middleware.ts   # Auth route protection
├── backend/           # FastAPI Python Server
│   ├── main.py        # All API endpoints
│   ├── requirements.txt
│   └── .env
└── README.md
```

## 🚀 Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
# Edit .env with your API keys
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
# Edit .env.local with your Supabase + API URL
npm run dev
```

### Supabase

Run the SQL schema in your Supabase SQL Editor to create the `users`, `opportunities`, `reminders`, and `upvotes` tables with RLS policies.

### Environment Variables

**Backend `.env`:**
```
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## ✨ Features

- **AI Extraction** — Paste any messy WhatsApp forward, AI extracts all details
- **Dashboard** — Track all opportunities with urgency badges and filters
- **Community Feed** — Discover opportunities shared by students across India
- **Upvote System** — Best opportunities rise to the top
- **Auth** — Email/password + Google OAuth with protected routes
- **Real-time** — Dashboard updates in real-time via Supabase subscriptions
- **Mobile Responsive** — Works perfectly on all devices

## 👥 Made for 93M Indian College Students

Built with ❤️ for PROJECT REMEMBER ME hackathon.
