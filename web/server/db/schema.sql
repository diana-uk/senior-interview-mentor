-- Senior Interview Mentor — PostgreSQL Schema
-- Run this in Supabase SQL Editor or via migration tool
-- Requires: Supabase Auth (auth.users) enabled

-- ════════════════════════════════════════════
-- 1. PROFILES (extends Supabase auth.users)
-- ════════════════════════════════════════════

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  target_level text check (target_level in ('new-grad', 'mid', 'senior', 'staff')),
  preferred_language text default 'typescript' check (preferred_language in ('typescript', 'javascript', 'python')),
  plan text default 'free' check (plan in ('free', 'premium', 'pro')),
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ════════════════════════════════════════════
-- 2. PROBLEM PROGRESS
-- ════════════════════════════════════════════

create table if not exists public.problem_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  problem_id text not null,
  status text not null default 'attempted' check (status in ('unseen', 'attempted', 'solved')),
  attempts integer default 1,
  best_score numeric(3,1),
  best_time integer,                       -- seconds
  hints_used integer default 0,
  last_code text,
  last_attempted_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, problem_id)
);

create index idx_progress_user on public.problem_progress(user_id);
create index idx_progress_problem on public.problem_progress(problem_id);

-- ════════════════════════════════════════════
-- 3. SESSIONS (interview/practice records)
-- ════════════════════════════════════════════

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('TEACHER', 'INTERVIEWER', 'REVIEWER')),
  problem_id text,
  problem_title text,
  duration integer default 0,              -- seconds
  hints_used integer default 0,
  score numeric(3,1),
  patterns text[] default '{}',
  created_at timestamptz default now()
);

create index idx_sessions_user on public.sessions(user_id);
create index idx_sessions_date on public.sessions(created_at desc);

-- ════════════════════════════════════════════
-- 4. MISTAKES (spaced repetition)
-- ════════════════════════════════════════════

create table if not exists public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pattern text not null,
  problem_id text,
  problem_title text not null,
  description text not null,
  next_review timestamptz not null default now(),
  interval_days integer default 1,
  ease_factor numeric(4,2) default 2.50,   -- SM-2 ease (>= 1.3)
  repetitions integer default 0,
  streak integer default 0,
  created_at timestamptz default now()
);

create index idx_mistakes_user on public.mistakes(user_id);
create index idx_mistakes_review on public.mistakes(user_id, next_review);

-- ════════════════════════════════════════════
-- 5. REVIEWS (rubric scores)
-- ════════════════════════════════════════════

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  problem_id text,
  problem_title text not null,
  correctness integer check (correctness between 0 and 4),
  time_complexity integer check (time_complexity between 0 and 4),
  space_complexity integer check (space_complexity between 0 and 4),
  code_quality integer check (code_quality between 0 and 4),
  edge_cases integer check (edge_cases between 0 and 4),
  communication integer check (communication between 0 and 4),
  overall_score numeric(3,1),
  feedback text,
  improvement_plan text[] default '{}',
  created_at timestamptz default now()
);

create index idx_reviews_user on public.reviews(user_id);

-- ════════════════════════════════════════════
-- 6. STREAKS
-- ════════════════════════════════════════════

create table if not exists public.streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date default current_date
);

-- ════════════════════════════════════════════
-- 7. SUBSCRIPTIONS (future: Stripe)
-- ════════════════════════════════════════════

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  plan text not null default 'free' check (plan in ('free', 'premium', 'pro')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_subscriptions_stripe on public.subscriptions(stripe_customer_id);

-- ════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.problem_progress enable row level security;
alter table public.sessions enable row level security;
alter table public.mistakes enable row level security;
alter table public.reviews enable row level security;
alter table public.streaks enable row level security;
alter table public.subscriptions enable row level security;

-- Users can only access their own data
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users read own progress" on public.problem_progress for select using (auth.uid() = user_id);
create policy "Users write own progress" on public.problem_progress for insert with check (auth.uid() = user_id);
create policy "Users update own progress" on public.problem_progress for update using (auth.uid() = user_id);

create policy "Users read own sessions" on public.sessions for select using (auth.uid() = user_id);
create policy "Users write own sessions" on public.sessions for insert with check (auth.uid() = user_id);

create policy "Users read own mistakes" on public.mistakes for select using (auth.uid() = user_id);
create policy "Users write own mistakes" on public.mistakes for insert with check (auth.uid() = user_id);
create policy "Users update own mistakes" on public.mistakes for update using (auth.uid() = user_id);
create policy "Users delete own mistakes" on public.mistakes for delete using (auth.uid() = user_id);

create policy "Users read own reviews" on public.reviews for select using (auth.uid() = user_id);
create policy "Users write own reviews" on public.reviews for insert with check (auth.uid() = user_id);

create policy "Users read own streaks" on public.streaks for select using (auth.uid() = user_id);
create policy "Users write own streaks" on public.streaks for insert with check (auth.uid() = user_id);
create policy "Users update own streaks" on public.streaks for update using (auth.uid() = user_id);

create policy "Users read own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.update_updated_at();
