# ARYO Nairobi — website + management hub

Public website (3D cognac pour hero, talent roster, events, clubs, online booking) and an
ERP-style admin dashboard (light/dark mode) for ARYO Nairobi.

- **Stack:** Next.js 14 (App Router) · Tailwind · Supabase (Postgres + Storage) · three.js / React Three Fiber · Framer Motion · Recharts
- **Hosting:** Vercel. Database lives in the existing Supabase project (`datanova`), isolated in `aryo_*` tables and the `aryo-media` storage bucket — nothing touches DATANOVA's tables.

## Deploy (Vercel)

1. Import `mathewshem/aryo` in Vercel.
2. Add Environment Variables (Project → Settings → Environment Variables):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pvvmakrlfohctwplldad.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key (already in `.env.example`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (same one DATANOVA uses). **Server-only.** |
| `ARYO_SESSION_SECRET` | any long random string (`openssl rand -hex 32`) |
| `GMAIL_SENDER_EMAIL` / `GMAIL_APP_PASSWORD` | Gmail + 16-char App Password for booking alerts and reset codes (same setup as DATANOVA) |
| `NEXT_PUBLIC_SITE_URL` | the live URL, e.g. `https://aryo.vercel.app` |

3. Deploy.

The database schema is already applied. To recreate it elsewhere run `supabase/schema.sql`, then `supabase/seed.sql`.

## First sign-in

Go to `/admin/login`:

- Email: `aryo@gmail.com`
- Temporary password: shared privately (not stored in this repo)

You'll be asked to choose a new password straight away. Then add staff under **Staff** — each gets a temporary password by email.

## Roles

- **Admin** — everything, including deleting records, managing staff, settings and the activity log.
- **Staff** — add/edit talent, events, clubs, sponsors and handle bookings. Can't delete or manage accounts.

## What's where

| Dashboard | Website |
|---|---|
| Talent — DJs, hosts & entertainers, MCs, artists, designers. Circular profile photo upload with drag/zoom crop. | `/talent`, `/talent/[slug]` with a booking form |
| Bookings — approve/decline (client gets an email), WhatsApp/call the client | `/book` and every talent page |
| Events — poster, date, line-up from the roster | `/events`, homepage |
| Clubs — ARYO (flagship) and partner clubs | `/clubs`, homepage |
| Sponsors & Media — upload official logos; switch **"Use on the 3D bottle"** to put a sponsor's logo on the homepage bottle | homepage marquee + 3D bottle |
| Settings — phone, WhatsApp, booking alert emails, happy hour | footer, booking page |

Every row has a ⋮ menu (View / Edit / extra actions / Delete). All pop-ups are boxed modals; no browser alerts.

## 3D hero

`components/site/PourScene.js` builds the bottle, snifter and pour from code (no model files).
The label shows the logo uploaded for the sponsor marked "Use on the 3D bottle" — only use official
artwork the sponsor has approved. Add `?pour=3` to the homepage URL to freeze the animation at second 3 for previews.

## Local development

```bash
cp .env.example .env.local   # fill the server keys
npm install
npm run dev
```

No database access? `ARYO_FIXTURE_FILE=/path/data.json npm run dev` renders the public site from a JSON snapshot.
