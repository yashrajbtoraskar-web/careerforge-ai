-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run
-- This matches the current app data model (users, resumes, jobs, applications with
-- stage tracking + live interview rooms).

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  role text default 'user', -- 'user' or 'admin'
  created_at timestamp default now()
);

create table if not exists resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  file_name text,
  skills text[],
  experience text,
  career_goals text,
  uploaded_at timestamp default now()
);

create table if not exists jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company text not null,
  city text,
  type text,        -- Full-time, Contract, Internship...
  mode text,         -- Remote, Hybrid, On-site
  description text,
  skills text[],
  posted_at timestamp default now()
);

create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  job_id uuid references jobs on delete cascade,
  match_score int,
  stage text default 'Submitted', -- Submitted, Under Review, Interview, Offer, Rejected
  interview_room_id text,
  history jsonb default '[]',
  created_at timestamp default now()
);

alter table profiles enable row level security;
alter table resumes enable row level security;
alter table applications enable row level security;
alter table jobs enable row level security;

-- Candidates can see/edit only their own rows
create policy "Users view own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

create policy "Users view own resumes" on resumes for select using (auth.uid() = user_id);
create policy "Users insert own resumes" on resumes for insert with check (auth.uid() = user_id);

create policy "Users view own applications" on applications for select using (auth.uid() = user_id);
create policy "Users insert own applications" on applications for insert with check (auth.uid() = user_id);

-- Jobs are public to browse
create policy "Anyone can view jobs" on jobs for select using (true);

-- Admin override: a profile with role = 'admin' can see/update every row.
-- (Run this after you've manually set one profile's role to 'admin' in the Table Editor.)
create policy "Admins view all applications" on applications for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins update all applications" on applications for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins view all profiles" on profiles for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
