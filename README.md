# ARYO Nairobi — Management Hub

Internal system for ARYO Nairobi (staff sign-in only; no public website). Tabs follow the director's brief:

| Tab | What it holds |
|---|---|
| **DJ bookings** | ARYO's schedule: who plays which night, set times, agreed fee, amount paid, M-Pesa code, status. 7-day strip at the top. |
| **DJs · Hosts & Entertainers · Designers · Artists · MCs** | Profiles with round photo, real name, bio, genres/speciality, phone, WhatsApp, email, Instagram, TikTok, usual fee, how to pay them (M-Pesa/bank/cash), staff notes. Each person has a full profile page with their booking history, nights per month, total paid and amount owed. |
| **Clubs** | ARYO (the mother) and partner/sister clubs: location, contact person, notes. |
| **Sponsors** | Hennessy, Martell, EABL… logo, contact person, deal notes. |
| **Online presence** | Pages/platforms that feature ARYO (e.g. Nightlife 254): link, reach, contact, notes. |
| Staff · Settings · Activity log | Accounts (admin/staff roles), ARYO's details, who changed what. |

Every row has a ⋮ menu (open/edit/actions/delete); every form is a boxed pop-up. Light/dark switch in the header.

- **Stack:** Next.js 14 · Tailwind · Supabase (Postgres + Storage) · Recharts · React Three Fiber (3D pour on the sign-in page)
- **Data:** the shared Supabase project (`datanova`), isolated in `aryo_*` tables and the `aryo-media` bucket. No table is readable with the public key; everything goes through the server with the service key.

## Vercel environment variables

| Name | Value |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → a **secret key** (`sb_secret_…`). Server-only. |
| `ARYO_SESSION_SECRET` | any long random text (32+ characters) |
| `GMAIL_SENDER_EMAIL` / `GMAIL_APP_PASSWORD` | Gmail + App Password, for password-reset codes and new-staff emails |
| `NEXT_PUBLIC_SITE_URL` | the live URL |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional — defaults are built in |

Redeploy after changing them.

## Sign in

`/admin/login` (the home page redirects there). First account: `aryo@gmail.com` with the temporary password shared privately — you're asked to set your own on first sign-in.

**Roles:** admin = everything incl. delete, staff accounts, settings, activity log. Staff = add/edit profiles and bookings, no deleting.

## Database

`supabase/schema.sql` + `supabase/seed.sql` created the first version; `supabase/migrations/002_internal_system.sql` turns it into the internal system (DJ bookings table, profile/payment fields, contacts, no public access).
