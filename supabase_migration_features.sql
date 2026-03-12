-- ═══════════════════════════════════════════════════════
-- OpportUnity Feature Migration
-- Adds: communities, community_members, community_posts, 
--        notifications, age column, skills column
-- ═══════════════════════════════════════════════════════

-- 1. COMMUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description TEXT,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read communities" ON public.communities
  FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creator can update community" ON public.communities
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creator can delete community" ON public.communities
  FOR DELETE USING (auth.uid() = created_by);

-- 2. COMMUNITY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read community members" ON public.community_members
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can join communities" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON public.community_members
  FOR DELETE USING (auth.uid() = user_id);

-- 3. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read community posts" ON public.community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_posts.community_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY "Members can share to community" ON public.community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = shared_by AND
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_posts.community_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY "Owner can delete own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = shared_by);

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- 5. ADD AGE TO USERS
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age INTEGER;

-- 6. ADD REQUIRED_SKILLS TO OPPORTUNITIES
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS required_skills TEXT;

-- 7. ENABLE REALTIME FOR NEW TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
