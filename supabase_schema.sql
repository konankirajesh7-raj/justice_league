-- ═══════════════════════════════════════════════════════
-- OpportUnity Database Schema (FRESH INSTALL)
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/vmuwwjzmzaojsotjuapz/sql/new
-- ═══════════════════════════════════════════════════════

-- 0. DROP EXISTING TABLES (clean slate)
DROP TABLE IF EXISTS public.upvotes CASCADE;
DROP TABLE IF EXISTS public.reminders CASCADE;
DROP TABLE IF EXISTS public.opportunities CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS update_opportunity_urgency() CASCADE;

-- 1. USERS TABLE
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  branch TEXT,
  cgpa DECIMAL(4,2),
  college TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- 2. OPPORTUNITIES TABLE
CREATE TABLE public.opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL DEFAULT 'Unknown',
  role TEXT NOT NULL DEFAULT 'Unknown',
  type TEXT DEFAULT 'Internship',
  branch_eligible TEXT DEFAULT 'All',
  cgpa_required DECIMAL(4,2),
  deadline DATE,
  location TEXT DEFAULT 'Remote',
  stipend TEXT DEFAULT 'Not mentioned',
  apply_link TEXT,
  raw_text TEXT,
  days_left INTEGER,
  urgency TEXT DEFAULT 'Normal',
  is_applied BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own opportunities" ON public.opportunities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own opportunities" ON public.opportunities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own opportunities" ON public.opportunities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own opportunities" ON public.opportunities
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read public opportunities" ON public.opportunities
  FOR SELECT USING (is_public = TRUE);

-- 3. REMINDERS TABLE
CREATE TABLE public.reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id);

-- 4. UPVOTES TABLE
CREATE TABLE public.upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own upvotes" ON public.upvotes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read upvotes" ON public.upvotes
  FOR SELECT USING (TRUE);

-- 5. AUTO-UPDATE days_left AND urgency FUNCTION
CREATE OR REPLACE FUNCTION update_opportunity_urgency()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deadline IS NOT NULL THEN
    NEW.days_left := (NEW.deadline - CURRENT_DATE);
    IF NEW.days_left <= 0 THEN
      NEW.urgency := 'Expired';
    ELSIF NEW.days_left <= 3 THEN
      NEW.urgency := 'Urgent';
    ELSIF NEW.days_left <= 7 THEN
      NEW.urgency := 'Soon';
    ELSE
      NEW.urgency := 'Normal';
    END IF;
  ELSE
    NEW.days_left := NULL;
    NEW.urgency := 'Normal';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_urgency
  BEFORE INSERT OR UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION update_opportunity_urgency();

-- 6. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;

-- ✅ Done! All tables created with RLS policies.
