-- ARYO NAIROBI — database schema.
-- Lives inside the shared Supabase project, so every object is prefixed aryo_
-- and nothing here touches DATANOVA's tables.
-- All writes go through the app's server routes (service role). The public
-- (anon) key can only READ what is published on the website.

create extension if not exists pgcrypto;

create table if not exists public.aryo_staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  role text not null default 'staff' check (role in ('admin','staff')),
  title text,
  password_hash text not null,
  avatar_url text,
  must_change_password boolean not null default true,
  active boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.aryo_talent (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null check (category in ('dj','host','mc','artist','designer')),
  headline text,
  bio text,
  genres text,
  photo_url text,
  instagram text,
  phone text,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aryo_clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  is_flagship boolean not null default false,
  location text,
  map_url text,
  instagram text,
  photo_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.aryo_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'sponsor' check (kind in ('sponsor','media')),
  logo_url text,
  website text,
  instagram text,
  hero_brand boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.aryo_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  start_time text,
  description text,
  music_policy text,
  poster_url text,
  club_id uuid references public.aryo_clubs(id) on delete set null,
  lineup uuid[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.aryo_bookings (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  talent_id uuid references public.aryo_talent(id) on delete set null,
  client_name text not null,
  phone text not null,
  email text,
  event_date date not null,
  event_type text,
  venue text,
  guests int,
  budget text,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','declined','completed','cancelled')),
  admin_note text,
  handled_by uuid references public.aryo_staff(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aryo_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'ARYO Nairobi',
  tagline text default 'Where dining meets nightlife',
  email text default 'aryo@gmail.com',
  phone text,
  whatsapp text,
  instagram text default 'https://www.instagram.com/aryo_nairobi/',
  address text default 'Astrol Square, Red Hill Rd, Nairobi',
  map_url text,
  happy_hour text default 'Happy hour 4PM – 7PM',
  booking_alert_emails text default 'aryo@gmail.com',
  updated_at timestamptz not null default now()
);
insert into public.aryo_settings (id) values (1) on conflict do nothing;

create table if not exists public.aryo_otp (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.aryo_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_name text,
  action text not null,
  entity text,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists aryo_bookings_created_idx on public.aryo_bookings (created_at desc);
create index if not exists aryo_bookings_talent_idx on public.aryo_bookings (talent_id);
create index if not exists aryo_bookings_handled_idx on public.aryo_bookings (handled_by);
create index if not exists aryo_events_date_idx on public.aryo_events (event_date);
create index if not exists aryo_events_club_idx on public.aryo_events (club_id);
create index if not exists aryo_audit_created_idx on public.aryo_audit_log (created_at desc);
create index if not exists aryo_otp_email_idx on public.aryo_otp (email);

-- Row level security: on for every table. Public read only for website content.
alter table public.aryo_staff     enable row level security;
alter table public.aryo_talent    enable row level security;
alter table public.aryo_clubs     enable row level security;
alter table public.aryo_partners  enable row level security;
alter table public.aryo_events    enable row level security;
alter table public.aryo_bookings  enable row level security;
alter table public.aryo_settings  enable row level security;
alter table public.aryo_otp       enable row level security;
alter table public.aryo_audit_log enable row level security;

drop policy if exists aryo_talent_public on public.aryo_talent;
create policy aryo_talent_public on public.aryo_talent for select to anon, authenticated using (active);
drop policy if exists aryo_clubs_public on public.aryo_clubs;
create policy aryo_clubs_public on public.aryo_clubs for select to anon, authenticated using (active);
drop policy if exists aryo_partners_public on public.aryo_partners;
create policy aryo_partners_public on public.aryo_partners for select to anon, authenticated using (active);
drop policy if exists aryo_events_public on public.aryo_events;
create policy aryo_events_public on public.aryo_events for select to anon, authenticated using (published);
drop policy if exists aryo_settings_public on public.aryo_settings;
create policy aryo_settings_public on public.aryo_settings for select to anon, authenticated using (true);
-- aryo_staff, aryo_bookings, aryo_otp, aryo_audit_log: no policies = service role only.

-- Storage bucket for profile photos, posters and logos (public read).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aryo-media', 'aryo-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;
