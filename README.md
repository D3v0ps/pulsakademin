# PulsAkademin

A complete, responsive marketing + e-commerce **demo website** for PulsAkademin —
a Swedish HLR (CPR) training academy and defibrillator (hjärtstartare) webshop.

It is built as a **zero-build static site** (plain HTML + CSS + vanilla JS) so it can be
uploaded straight to one.com (or any static host) with no compile step. The design is a
fresh "bold & modern medical" direction: a warm cream canvas, deep bordeaux + ink, an
energetic coral for calls-to-action, and a recurring ECG "pulse" motif tied to the brand name.

> **Status:** hi-fi front-end demo. Pages look and feel real, but forms, filters, the cart
> and checkout do not submit/persist yet — they are wired to demo data. The
> [Backend roadmap](#backend-roadmap-supabase) below covers making them live.

---

## Repository layout

```
pulsakademin/
├── public/            ← the deployable site. Upload the CONTENTS of this folder.
│   ├── index.html         (+ 24 more pages — see "Pages" below)
│   ├── styles.css         design system (tokens, components, layout)
│   ├── site.js            shared header, mega-menus, mobile drawer, footer, favicon
│   ├── data.js            shared demo data (courses, dates, products, FAQ)
│   ├── favicon.svg        brand ECG mark
│   └── robots.txt         blocks indexing of the DEMO subdomain (see deploy notes)
├── docs/
│   ├── bildprompts.md     ready-to-use AI prompts for every image placeholder
│   └── screenshots/       design reference renders of the home page
└── README.md
```

Everything the browser needs lives in `public/`. The `docs/` folder is reference material
and is **not** part of the deployed site.

## How it fits together

- **One stylesheet, one script, shared everywhere.** Every page links `styles.css` and
  `site.js`. The script renders the topbar, header (with mega-menus), mobile drawer and
  footer into `<div id="site-header">` / `<div id="site-footer">`, so navigation is
  identical on every page and editable in **one** place.
- **Demo content is centralised** in `data.js` (`PA_COURSES`, `PA_DATES`, `PA_PRODUCTS`,
  `PA_FAQ`). Pages render cards/tables from those arrays — change the data once, it updates
  across pages.
- **Images are labelled placeholders** (the cream hatched boxes). Each one has a matching
  generation prompt in [`docs/bildprompts.md`](docs/bildprompts.md). Drop real photos in
  and replace the `.ph` blocks with `<img>`.
- **Only external dependency is Google Fonts** (Bricolage Grotesque, Hanken Grotesk,
  IBM Plex Mono), loaded over HTTPS from the stylesheet. No frameworks, no build tools.

## Pages (25)

| Area | Page | File |
|---|---|---|
| **Marketing** | Home | `index.html` |
| | About | `om-oss.html` |
| | Team & instructors | `team.html` |
| | Contact | `kontakt.html` |
| | Knowledge base | `kunskapsbank.html` |
| | Article | `artikel.html` |
| **Training** | Course catalogue | `utbildningar.html` |
| | Course detail (HLR vuxen template) | `kurs-hlr-vuxen.html` |
| | Book a course (dates + status) | `boka.html` |
| | Booking flow (steps) | `boka-flode.html` |
| | Price list | `prislista.html` |
| | For companies | `foretag.html` |
| | Request a quote | `offert.html` |
| **E-commerce** | Defibrillators (filtered category) | `hjartstartare.html` |
| | Webshop home | `webbshop.html` |
| | Product detail | `produkt.html` |
| | Cart | `kundvagn.html` |
| | Checkout | `kassa.html` |
| | Rent a defibrillator | `hyr.html` |
| | Service & maintenance | `service.html` |
| **Account & legal** | Log in | `logga-in.html` |
| | Member portal | `portal.html` |
| | Terms | `villkor.html` |
| | Privacy policy (+ cookie/GDPR UI) | `integritetspolicy.html` |
| **Back office** | Admin dashboard | `admin.html` |

The handover also harmonised the brand details that were inconsistent on the old site:
single phone number `0293-76 10 11`, address `Centralgatan 14, 815 38 Tierp`,
`kontakt@pulsakademin.se`, full org. number, and no `[lägg in …]` legal placeholders.

---

## Preview locally

Because the shared chrome is rendered by JavaScript, just serve the `public/` folder over
HTTP (opening files via `file://` mostly works too, but a server is cleaner):

```bash
cd public
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works (`npx serve public`, VS Code Live Server, etc.).

---

## Deploy to one.com (customer demo)

Target for the demo: **`pulsakademin.karimkhalil.se`**.
Your one.com web root for this space is **`/webroots/4e82917c`** (PHP 8.5 is available, but
this site is fully static and needs no PHP).

1. **Create the subdomain** in the one.com control panel
   (*Domain settings → Subdomains*): `pulsakademin` under `karimkhalil.se`. Point it at a
   folder, e.g. `/webroots/4e82917c/pulsakademin` (or the web root itself if this space is
   dedicated to the demo).
2. **Upload the contents of `public/`** into that folder using one.com's File Manager or
   SFTP — upload the *files inside* `public/`, not the `public` folder itself, so that
   `index.html` sits at the subdomain root.
   ```
   <webroot>/pulsakademin/
   ├── index.html
   ├── styles.css
   ├── site.js
   ├── data.js
   ├── favicon.svg
   ├── robots.txt
   └── … the rest of the .html pages
   ```
   _(SFTP example)_
   ```bash
   sftp your-user@ssh.karimkhalil.se
   # then: cd /webroots/4e82917c/pulsakademin
   #       put -r public/*
   ```
3. **Visit** `https://pulsakademin.karimkhalil.se` — `index.html` is served automatically.
   Enable the free SSL certificate in the one.com panel if it isn't on already.

`robots.txt` ships with `Disallow: /` so the demo stays out of Google while it lives under
`karimkhalil.se`. Remove or replace it when you go live (see below).

### Going live on `pulsakademin.se`

No code changes are required — every internal link is **relative** (`href="boka.html"`),
so the same files work at any domain or subfolder. When you migrate to the customer's
domain:

1. Upload the same `public/` contents to the `pulsakademin.se` web root.
2. Replace `robots.txt` with an allow-all version + a `Sitemap:` line (the file has the
   exact snippet in a comment).
3. Add per-page Open Graph/Twitter meta and a `sitemap.xml` for SEO (next step, not in the
   demo).

---

## Backend roadmap (Supabase)

The front-end is intentionally decoupled from data, which makes a Supabase (Postgres + Auth
+ Storage) backend a clean fit. Suggested path:

1. **Auth** — Supabase Auth for `logga-in.html` / `portal.html` (course participants,
   company accounts, instructors, admin via row-level security roles).
2. **Database** — model the catalogue and commerce as Postgres tables. The original
   handover sketches the schema; a practical first cut:
   `courses`, `course_instances`, `bookings`, `participants`, `quote_requests`,
   `products`, `product_categories`, `orders`, `order_items`, `instructors`, `reviews`.
3. **Replace demo data** — swap the static `data.js` arrays for `@supabase/supabase-js`
   queries (course cards, upcoming dates, product grids, FAQ). Start read-only.
4. **Forms → rows** — point the contact, quote (`offert.html`) and booking
   (`boka-flode.html`) forms at Supabase inserts or Edge Functions; trigger emails
   (Resend/Postmark) for confirmations and admin notifications.
5. **Commerce** — cart/checkout (`kundvagn.html` / `kassa.html`) backed by `orders` +
   a payment provider (Stripe/Klarna/Swish); invoice option for companies.
6. **Admin** — `admin.html` becomes a real dashboard over the same tables (RLS-guarded),
   or use the Supabase Studio to start.
7. **Storage** — Supabase Storage (or one.com files) for product images and certificates.

Because the site is static, the front-end can stay on one.com while the API lives on
Supabase — only the `fetch`/SDK calls and the keys change.

---

## Design system quick reference

- **Colours:** bordeaux `#8E1B2E`/`#6B1422`, ink `#1A1714`, cream `#FBF6F0`, coral `#FF5640`,
  plus green/amber/red/blue status tokens. All defined as CSS variables in `styles.css`.
- **Type:** Bricolage Grotesque (display), Hanken Grotesk (body), IBM Plex Mono
  (labels/stats).
- **Components:** buttons, badges/chips, cards, course & product cards, forms, FAQ
  accordion, step indicator, breadcrumbs, tables, mega-menu, drawer, cookie/GDPR UI,
  filter sidebar, callouts — all in `styles.css`.
- **Accessibility:** semantic HTML, visible focus styles, `sr-only` helper, labelled
  controls, `lang="sv"`. WCAG 2.2 AA is the target as the site becomes functional.

## Credits

Designed in [Claude Design](https://claude.ai/design) and implemented for static hosting.
Image placeholders → prompts in [`docs/bildprompts.md`](docs/bildprompts.md).
