-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for bots
create table bots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  token text unique not null, -- Telegram Bot Token
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table bots enable row level security;

create policy "Users can view own bots." on bots
  for select using (auth.uid() = user_id);

create policy "Users can insert own bots." on bots
  for insert with check (auth.uid() = user_id);

create policy "Users can update own bots." on bots
  for update using (auth.uid() = user_id);

create policy "Users can delete own bots." on bots
  for delete using (auth.uid() = user_id);

-- Create a table for flows
create table flows (
  id uuid default gen_random_uuid() primary key,
  bot_id uuid references bots on delete cascade not null,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_published boolean default false
);

alter table flows enable row level security;

-- Policy helper: check if user owns the bot associated with the flow
create policy "Users can view owm flows." on flows
  for select using (
    exists ( select 1 from bots where bots.id = flows.bot_id and bots.user_id = auth.uid() )
  );

create policy "Users can insert own flows." on flows
  for insert with check (
    exists ( select 1 from bots where bots.id = flows.bot_id and bots.user_id = auth.uid() )
  );

create policy "Users can update own flows." on flows
  for update using (
    exists ( select 1 from bots where bots.id = flows.bot_id and bots.user_id = auth.uid() )
  );

create policy "Users can delete own flows." on flows
  for delete using (
    exists ( select 1 from bots where bots.id = flows.bot_id and bots.user_id = auth.uid() )
  );

-- Create a table for user sessions (tracking progression in flow)
create table sessions (
  id uuid default gen_random_uuid() primary key,
  bot_id uuid references bots on delete cascade not null,
  user_id text not null, -- Telegram User ID (string)
  current_node_id text,
  variables jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(bot_id, user_id)
);

alter table sessions enable row level security;
-- Sessions are internal, but policies can be added if needed for dashboard access
create policy "Users can view sessions for own bots." on sessions
  for select using (
    exists ( select 1 from bots where bots.id = sessions.bot_id and bots.user_id = auth.uid() )
  );


-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
