-- Run this AFTER supabase-schema.sql, in the same SQL Editor.
-- It adjusts the applications table for the real (non-localStorage) app,
-- and adds a couple of missing RLS policies.

-- Jobs stay as static frontend data for now, so applications.job_id shouldn't be
-- a foreign key into the jobs table — make it a plain text id instead.
alter table applications drop constraint if exists applications_job_id_fkey;
alter table applications alter column job_id type text using job_id::text;

-- Store the candidate's name/email and the job's title/company/city directly on
-- the application row (denormalized, simplest for this stage of the project).
alter table applications add column if not exists user_name text;
alter table applications add column if not exists user_email text;
alter table applications add column if not exists title text;
alter table applications add column if not exists company text;
alter table applications add column if not exists city text;

-- Let a signed-up user create their own profile row right after signing up.
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Let a user update their existing resume (re-upload), not just insert once.
create policy "Users can update own resumes" on resumes for update using (auth.uid() = user_id);
alter table resumes add constraint resumes_user_id_key unique (user_id);

-- Enable Realtime on applications so status changes push to candidates instantly.
alter publication supabase_realtime add table applications;
