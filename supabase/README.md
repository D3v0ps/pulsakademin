# Supabase backend for PulsAkademin

The site (in `public/`) is wired to call Supabase from the browser via
`public/app/*.js`. Until a project is connected it renders from the demo data in
`public/data.js`; once connected, bookings, quote requests, orders, accounts and
the admin panel become fully functional.

## One-time setup (~5 min)

1. Create a free project at <https://supabase.com>.
2. **SQL Editor → New query →** paste all of [`schema.sql`](schema.sql) and run it.
   This creates every table, Row-Level Security policy, the signup trigger, and
   seed data (courses, dates, products, instructors).
3. **Project Settings → API** — copy the **Project URL** and the **anon public**
   key into [`public/app/config.js`](../public/app/config.js):
   ```js
   window.PA_CONFIG = {
     SUPABASE_URL: "https://YOURREF.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi...",   // the anon / public key — safe in the browser
   };
   ```
4. Commit & push — the GitHub Action redeploys to one.com and the site is live
   with a real backend.

## Make yourself an admin

After you sign up once on the site (`/logga-in.html`), run in the SQL editor:
```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```
Then `/admin.html` will load real bookings, orders and quote requests.

## Why the anon key is safe to commit
Row-Level Security (in `schema.sql`) governs every table: the public can read the
catalogue and submit bookings/orders/quotes/contact messages, but can only read
back their **own** records — and only an `admin` profile can read everything or
edit the catalogue. The anon key carries no privileges beyond those policies.

## Notes
- **Payments are simulated**: checkout and paid bookings create real `orders` /
  `bookings` rows and a confirmation, but no money moves. Add Stripe/Klarna/Swish
  later via a Supabase Edge Function without touching the data model.
- Email confirmations/reminders can be added later as Edge Functions
  (Resend/Postmark) triggered on insert.
