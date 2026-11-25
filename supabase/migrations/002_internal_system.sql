-- ARYO becomes an internal management system: no public website.
drop table if exists public.aryo_bookings;
drop table if exists public.aryo_events;

alter table public.aryo_talent
  add column if not exists real_name text, add column if not exists email text, add column if not exists whatsapp text,
  add column if not exists tiktok text, add column if not exists rate numeric(12,2), add column if not exists rate_unit text default 'per night',
  add column if not exists payment_method text, add column if not exists mpesa_number text, add column if not exists mpesa_name text,
  add column if not exists bank_name text, add column if not exists bank_account text, add column if not exists notes text;
alter table public.aryo_talent drop column if exists featured;
alter table public.aryo_talent drop column if exists slug;

alter table public.aryo_clubs
  add column if not exists contact_person text, add column if not exists contact_phone text,
  add column if not exists contact_email text, add column if not exists notes text;
alter table public.aryo_clubs drop column if exists slug;
alter table public.aryo_partners
  add column if not exists contact_person text, add column if not exists contact_phone text,
  add column if not exists contact_email text, add column if not exists followers text, add column if not exists notes text;
alter table public.aryo_partners drop column if exists hero_brand;

create table if not exists public.aryo_gigs (
  id uuid primary key default gen_random_uuid(),
  gig_date date not null,
  start_time text,
  end_time text,
  talent_id uuid not null references public.aryo_talent(id) on delete cascade,
  club_id uuid references public.aryo_clubs(id) on delete set null,
  night text,
  status text not null default 'scheduled' check (status in ('scheduled','confirmed','completed','cancelled','no_show')),
  fee numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  paid_on date,
  payment_ref text,
  notes text,
  created_by uuid references public.aryo_staff(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists aryo_gigs_date_idx on public.aryo_gigs (gig_date);
create index if not exists aryo_gigs_talent_idx on public.aryo_gigs (talent_id);
create index if not exists aryo_gigs_club_idx on public.aryo_gigs (club_id);
create index if not exists aryo_gigs_created_by_idx on public.aryo_gigs (created_by);
alter table public.aryo_gigs enable row level security;

drop policy if exists aryo_talent_public on public.aryo_talent;
drop policy if exists aryo_clubs_public on public.aryo_clubs;
drop policy if exists aryo_partners_public on public.aryo_partners;
drop policy if exists aryo_settings_public on public.aryo_settings;
alter table public.aryo_settings drop column if exists happy_hour;
alter table public.aryo_settings drop column if exists map_url;
alter table public.aryo_settings rename column booking_alert_emails to alert_emails;
