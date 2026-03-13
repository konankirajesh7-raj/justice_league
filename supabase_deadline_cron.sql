-- ═══════════════════════════════════════════════════════
-- OpportUnity — Deadline Notification Scheduler
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vmuwwjzmzaojsotjuapz/sql/new
-- ═══════════════════════════════════════════════════════

-- 1. Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Enable pg_net extension (needed to call Edge Functions via HTTP)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Schedule deadline notification check — runs every day at 8:00 AM UTC
-- This calls the "notify-deadlines" Edge Function
SELECT cron.schedule(
  'daily-deadline-notifications',     -- job name (unique)
  '0 8 * * *',                         -- cron: every day at 08:00 UTC
  $$
    SELECT net.http_post(
      url := 'https://vmuwwjzmzaojsotjuapz.supabase.co/functions/v1/notify-deadlines',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdXd3anptemFvanNvdGp1YXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzY5NTYsImV4cCI6MjA4ODU1Mjk1Nn0.NC_ovlZ6gYoG5haNa9_z7H2heYdKNbzraK0OKjrHqAk'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- 4. (Optional) Run it immediately to test
-- SELECT net.http_post(
--   url := 'https://vmuwwjzmzaojsotjuapz.supabase.co/functions/v1/notify-deadlines',
--   headers := jsonb_build_object(
--     'Content-Type', 'application/json',
--     'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdXd3anptemFvanNvdGp1YXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzY5NTYsImV4cCI6MjA4ODU1Mjk1Nn0.NC_ovlZ6gYoG5haNa9_z7H2heYdKNbzraK0OKjrHqAk'
--   ),
--   body := '{}'::jsonb
-- );

-- 5. View scheduled jobs (to confirm)
-- SELECT * FROM cron.job;

-- 6. To remove/change the schedule:
-- SELECT cron.unschedule('daily-deadline-notifications');
