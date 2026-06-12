-- ============================================================================
-- PulsAkademin — Supabase schema (Postgres). Run this in the Supabase SQL editor
-- on a fresh project. It creates the tables, Row-Level Security policies, a
-- profile-on-signup trigger, and seed data matching the demo content.
-- The anon/public key + RLS is what makes this safe to call from the browser.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- profiles (1:1 with auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  role text not null default 'customer',         -- customer | company | instructor | admin
  company_name text,
  org_number text,
  created_at timestamptz not null default now()
);

-- admin check used by policies (security definer avoids recursive RLS)
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- create a profile row automatically for every new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, phone)
  values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- catalogue (public read) ----------
create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null, role text, bio text, certifications text, image text, active boolean default true
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  sort int default 0, slug text unique not null, title text not null,
  category text, audience text, description text, duration text,
  price_label text, price_unit text, price_incl_vat numeric, img text,
  active boolean default true, created_at timestamptz default now()
);

create table if not exists public.course_instances (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  city text, venue text, start_at timestamptz, end_at timestamptz,
  price_label text, seats_total int default 12, seats_left int default 12,
  instructor text, language text default 'Svenska', status text default 'open',
  created_at timestamptz default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, description text, image text, sort int default 0
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, brand text, usp text, description text,
  category_id uuid references public.product_categories(id),
  price_incl_vat numeric, price_excl_vat numeric, vat_rate numeric default 0.25,
  stock_status text default 'I lager', badges text[], img text,
  active boolean default true, created_at timestamptz default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text, excerpt text, body text, category text, image text,
  published boolean default true, created_at timestamptz default now()
);

-- ---------- transactions ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  course_instance_id uuid references public.course_instances(id),
  user_id uuid references auth.users(id),
  booking_type text default 'private', status text default 'confirmed',
  contact_name text, contact_email text, contact_phone text,
  company_name text, org_number text, created_at timestamptz default now()
);
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  first_name text, last_name text, email text, certificate_status text default 'pending'
);
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  company_name text, org_number text, contact_name text, email text, phone text,
  course_interest text, participant_count int, city text, preferred_date text,
  location_pref text, message text, status text default 'new', created_at timestamptz default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  order_number text unique, status text default 'received', payment_method text,
  total_incl_vat numeric, total_excl_vat numeric, vat numeric,
  customer_name text, customer_email text, customer_phone text,
  company_name text, org_number text, shipping_address text, created_at timestamptz default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_name text, sku text, qty int, unit_price_incl_vat numeric
);
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text, email text, phone text, subject text, kind text, message text,
  created_at timestamptz default now()
);

-- ---------- Row-Level Security ----------
alter table public.profiles          enable row level security;
alter table public.instructors       enable row level security;
alter table public.courses           enable row level security;
alter table public.course_instances  enable row level security;
alter table public.product_categories enable row level security;
alter table public.products          enable row level security;
alter table public.articles          enable row level security;
alter table public.bookings          enable row level security;
alter table public.participants      enable row level security;
alter table public.quote_requests    enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.contact_messages  enable row level security;

-- public catalogue: anyone may read
do $$ declare t text;
begin
  foreach t in array array['instructors','courses','course_instances','product_categories','products','articles']
  loop
    execute format('drop policy if exists pub_read on public.%I;', t);
    execute format('create policy pub_read on public.%I for select using (true);', t);
    execute format('drop policy if exists admin_write on public.%I;', t);
    execute format('create policy admin_write on public.%I for all using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

-- profiles: a user sees/edits own row; admins see all
create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_self_upd  on public.profiles for update using (id = auth.uid());

-- leads (bookings/quotes/orders/contact): anyone may INSERT (guest + simulated
-- checkout); owners read their own; admins read everything.
do $$ declare t text;
begin
  foreach t in array array['bookings','quote_requests','orders']
  loop
    execute format('drop policy if exists lead_insert on public.%I;', t);
    execute format('create policy lead_insert on public.%I for insert with check (true);', t);
    execute format('drop policy if exists lead_read on public.%I;', t);
    execute format('create policy lead_read on public.%I for select using (user_id = auth.uid() or public.is_admin());', t);
    execute format('drop policy if exists lead_admin on public.%I;', t);
    execute format('create policy lead_admin on public.%I for all using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

create policy contact_insert on public.contact_messages for insert with check (true);
create policy contact_admin  on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

-- child rows: insert open (parent created in same flow); read via admin or owner of parent
create policy participants_insert on public.participants for insert with check (true);
create policy participants_read   on public.participants for select using (public.is_admin() or exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));
create policy orderitems_insert   on public.order_items for insert with check (true);
create policy orderitems_read     on public.order_items for select using (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- ---------- seed: instructors ----------
insert into public.instructors (name, role, certifications) values
  ('Hamza Samara', 'Instruktör HLR & S-HLR', 'HLR-rådet'),
  ('Sara Mahmud', 'Utbildnings- & kvalitetsansvarig', 'HLR-rådet')
on conflict do nothing;

-- ---------- seed: courses ----------
insert into public.courses (sort, slug, title, category, audience, description, duration, price_label, price_unit, price_incl_vat, img) values
  (1,'hlr-vuxen','HLR vuxen','HLR','Alla','Grundläggande hjärt-lungräddning på vuxna med träning på docka och hjärtstartare.','2 timmar','699 kr','/person',699,'Bild: HLR vuxen'),
  (2,'hlr-barn','HLR barn','HLR','Alla','HLR anpassad för spädbarn och barn – för föräldrar, förskola och skola.','2 timmar','699 kr','/person',699,'Bild: HLR barn'),
  (3,'s-hlr-vuxen','S-HLR vuxen','S-HLR','Vårdpersonal','Sjukvårds-HLR med hjärtstartare och teamarbete för vårdpersonal.','3 timmar','Offert','',null,'Bild: S-HLR'),
  (4,'forsta-hjalpen','Första hjälpen & HLR','Första hjälpen','Företag','Första hjälpen-åtgärder kombinerat med HLR och hjärtstartare.','Halvdag','Från 995 kr','/person',995,'Bild: Första hjälpen'),
  (5,'brandskydd','Grundläggande brandskydd','Brandskydd','Företag','Förebyggande brandskydd, släckutrustning och utrymning i praktiken.','Halvdag','Offert','',null,'Bild: Brandskydd'),
  (6,'krishantering','Krishantering & beredskap','Kris','Företag','Krisberedskap och första psykologiska hjälpen för arbetsplatsen.','Halvdag','Offert','',null,'Bild: Krishantering'),
  (7,'hot-vald','Hot, våld & aggressivt beteende','Säkerhet','Företag','Förebygga och hantera hotfulla situationer och aggressivt beteende.','Halvdag','Offert','',null,'Bild: Hot & våld'),
  (8,'repetition','Repetition HLR vuxen & barn','Repetition','Alla','Kort uppdateringskurs för att hålla kompetensbeviset aktuellt.','1 timme','499 kr','/person',499,'Bild: Repetition')
on conflict (slug) do nothing;

-- ---------- seed: course instances ----------
insert into public.course_instances (course_id, city, venue, start_at, end_at, price_label, seats_total, seats_left, instructor)
select c.id, v.city, v.venue, v.start_at, v.end_at, v.price_label, v.seats_total, v.seats_left, v.instructor
from (values
  ('hlr-vuxen','Stockholm','Kungsgatan 12', timestamptz '2026-06-12 09:00+02', timestamptz '2026-06-12 11:00+02','699 kr',12,8,'Hamza Samara'),
  ('hlr-barn','Uppsala','Dragarbrunnsg. 3', timestamptz '2026-06-14 13:00+02', timestamptz '2026-06-14 15:00+02','699 kr',12,3,'Sara Mahmud'),
  ('s-hlr-vuxen','Tierp','Centralgatan 14', timestamptz '2026-06-18 09:00+02', timestamptz '2026-06-18 12:00+02','Offert',10,6,'Hamza Samara'),
  ('forsta-hjalpen','Göteborg','Avenyn 21', timestamptz '2026-06-20 09:00+02', timestamptz '2026-06-20 13:00+02','995 kr',14,0,'Sara Mahmud'),
  ('hlr-vuxen','Gävle','Norra Kungsg. 5', timestamptz '2026-06-24 17:00+02', timestamptz '2026-06-24 19:00+02','699 kr',12,12,'Hamza Samara'),
  ('repetition','Stockholm','Kungsgatan 12', timestamptz '2026-06-27 12:00+02', timestamptz '2026-06-27 13:00+02','499 kr',16,2,'Sara Mahmud'),
  ('hlr-barn','Göteborg','Avenyn 21', timestamptz '2026-07-02 09:00+02', timestamptz '2026-07-02 11:00+02','699 kr',12,9,'Sara Mahmud'),
  ('s-hlr-vuxen','Uppsala','Dragarbrunnsg. 3', timestamptz '2026-07-05 13:00+02', timestamptz '2026-07-05 16:00+02','Offert',10,5,'Hamza Samara')
) as v(slug,city,venue,start_at,end_at,price_label,seats_total,seats_left,instructor)
join public.courses c on c.slug = v.slug;

-- ---------- seed: product categories + products ----------
insert into public.product_categories (slug, name, sort) values
  ('hjartstartare','Hjärtstartare',1),('batterier','Batterier',2),('elektroder','Elektroder',3),
  ('skap','Skåp & väggfästen',4),('vaskor','Väskor',5),('paket','Paketlösningar',6)
on conflict (slug) do nothing;

insert into public.products (slug, name, brand, usp, price_incl_vat, price_excl_vat, stock_status, badges, img, category_id)
select v.slug, v.name, v.brand, v.usp, v.incl, v.excl, v.stock, v.badges, v.img, pc.id
from (values
  ('smarty-saver','Smarty Saver Halvautomatisk','Smarty Saver','Barnläge · IP56 · 10 års garanti',11999,9599,'I lager', array['Populär','Barnläge'],'Bild: Smarty Saver'),
  ('defisign-life','DefiSign LIFE AED','DefiSign','Pekskärm med guidning · Hel-/halvautomatisk',18499,14799,'I lager', array['Skärm'],'Bild: DefiSign LIFE'),
  ('philips-hs1','Philips HeartStart HS1','Philips','Marknadsledande · Enkel & pålitlig',19999,15999,'Få i lager', array['Bästsäljare'],'Bild: Philips HS1'),
  ('primedic-heartsave','Primedic HeartSave AED','Primedic','Robust · För utomhusbruk',14999,11999,'I lager', array['Utomhus'],'Bild: Primedic'),
  ('cu-medical-sp1','CU Medical iPAD SP1','CU Medical','Automatisk barn-/vuxenläge',13499,10799,'I lager', array['Barnläge'],'Bild: CU Medical SP1'),
  ('mindray-c1a','Mindray BeneHeart C1A','Mindray','Kompakt · QR-guidning i realtid',15999,12799,'I lager', array['Nyhet'],'Bild: Mindray C1A')
) as v(slug,name,brand,usp,incl,excl,stock,badges,img)
left join public.product_categories pc on pc.slug = 'hjartstartare'
on conflict (slug) do nothing;

create table if not exists public.site_content (
  key text primary key,                 -- e.g. "index.hero.title"
  value text not null,
  page text,                            -- e.g. "index.html" (where it was edited)
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.site_content enable row level security;

drop policy if exists content_pub_read on public.site_content;
create policy content_pub_read on public.site_content for select using (true);

drop policy if exists content_admin_write on public.site_content;
create policy content_admin_write on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());
