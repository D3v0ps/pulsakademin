-- ============================================================================
-- PulsAkademin — Live content (CMS) migration.
-- Adds the site_content table that stores admin text overrides for the site.
-- Idempotent: safe to run on a project that already ran schema.sql.
-- ============================================================================

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
