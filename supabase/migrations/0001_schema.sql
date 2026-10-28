-- ============================================================================
-- Ever After Memoir — database schema
-- Run once in Supabase: Dashboard → SQL Editor → paste → Run.
-- Safe to re-run (idempotent where possible).
--
-- Publishing model
--   Every editable content table has `draft` and `published` (jsonb).
--   Save draft  → writes `draft` only.
--   Publish     → publish_content(): copies draft → published in ONE statement.
--                 If it fails, the previous published copy is untouched.
--   Unpublish   → unpublish_content(): status = 'draft', published = null.
--   The public (anon) role can read ONLY the published columns of published
--   rows (column-level grants + row-level security). `draft` is never readable
--   by anon.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Admin users & helper
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'owner' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Admins are added only from the SQL editor (see README). Nobody can add
-- themselves through the API.
alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;
grant all on table public.admin_users to service_role;
drop policy if exists "Users see their own admin row" on public.admin_users;
create policy "Users see their own admin row" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Content tables (identical publishing columns)
-- ---------------------------------------------------------------------------
create table if not exists public.pages (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  status       text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  draft        jsonb not null default '{}'::jsonb,
  published    jsonb,
  published_at timestamptz,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null,
  constraint pages_published_consistent check ((status = 'published') = (published is not null))
);

create table if not exists public.stories (
  id           uuid primary key default gen_random_uuid(),
  status       text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  draft        jsonb not null default '{}'::jsonb,
  published    jsonb,
  published_at timestamptz,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null,
  constraint stories_published_consistent check ((status = 'published') = (published is not null))
);

create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  status       text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  draft        jsonb not null default '{}'::jsonb,
  published    jsonb,
  published_at timestamptz,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null,
  constraint services_published_consistent check ((status = 'published') = (published is not null))
);

create table if not exists public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  status       text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  draft        jsonb not null default '{}'::jsonb,
  published    jsonb,
  published_at timestamptz,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null,
  constraint testimonials_published_consistent check ((status = 'published') = (published is not null))
);

create table if not exists public.social_items (
  id           uuid primary key default gen_random_uuid(),
  status       text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  draft        jsonb not null default '{}'::jsonb,
  published    jsonb,
  published_at timestamptz,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null,
  constraint social_items_published_consistent check ((status = 'published') = (published is not null))
);

create table if not exists public.site_settings (
  id           uuid primary key default gen_random_uuid(),
  singleton    boolean not null default true unique check (singleton),
  status       text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  draft        jsonb not null default '{}'::jsonb,
  published    jsonb,
  published_at timestamptz,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null,
  constraint site_settings_published_consistent check ((status = 'published') = (published is not null))
);

-- A published story slug must be unique (draft slugs are checked by the app).
create unique index if not exists stories_published_slug_key
  on public.stories ((published ->> 'slug')) where status = 'published';

create index if not exists stories_status_sort_idx      on public.stories (status, sort_order);
create index if not exists services_status_sort_idx     on public.services (status, sort_order);
create index if not exists testimonials_status_sort_idx on public.testimonials (status, sort_order);
create index if not exists social_items_status_sort_idx on public.social_items (status, sort_order);
create index if not exists pages_status_idx             on public.pages (status);

-- Common grants, RLS and triggers for every content table
do $$
declare
  t text;
  public_cols text;
begin
  foreach t in array array['pages', 'stories', 'services', 'testimonials', 'social_items', 'site_settings'] loop
    public_cols := case when t = 'pages'
      then 'id, slug, status, published, published_at, sort_order'
      else 'id, status, published, published_at, sort_order' end;

    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('grant select (%s) on table public.%I to anon', public_cols, t);
    execute format('grant all on table public.%I to service_role', t);

    execute format('drop policy if exists "Admins manage %s" on public.%I', t, t);
    execute format(
      'create policy "Admins manage %s" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t, t);

    execute format('drop policy if exists "Public reads published %s" on public.%I', t, t);
    execute format(
      'create policy "Public reads published %s" on public.%I for select to anon using (status = %L)',
      t, t, 'published');

    execute format('drop trigger if exists %I on public.%I', t || '_touch', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.touch_updated_at()',
      t || '_touch', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Media library
-- ---------------------------------------------------------------------------
create table if not exists public.media_assets (
  id           uuid primary key default gen_random_uuid(),
  storage_path text unique,                         -- null for bundled sample files
  url          text not null,
  type         text not null check (type in ('image', 'video')),
  mime         text not null default '',
  size_bytes   bigint not null default 0 check (size_bytes >= 0),
  width        integer,
  height       integer,
  duration     numeric,
  alt_text     text not null default '' check (char_length(alt_text) <= 300),
  caption      text not null default '' check (char_length(caption) <= 500),
  folder       text not null default 'General' check (char_length(folder) <= 60),
  is_sample    boolean not null default false,
  uploaded_by  uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists media_assets_created_idx on public.media_assets (created_at desc);
create index if not exists media_assets_folder_idx  on public.media_assets (folder);

drop trigger if exists media_assets_touch on public.media_assets;
create trigger media_assets_touch before update on public.media_assets
  for each row execute function public.touch_updated_at();

-- True when an asset is referenced by any PUBLISHED content.
create or replace function public.media_is_published(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
       exists (select 1 from public.pages         where status = 'published' and published::text like '%' || p_id::text || '%')
    or exists (select 1 from public.stories       where status = 'published' and published::text like '%' || p_id::text || '%')
    or exists (select 1 from public.services      where status = 'published' and published::text like '%' || p_id::text || '%')
    or exists (select 1 from public.testimonials  where status = 'published' and published::text like '%' || p_id::text || '%')
    or exists (select 1 from public.social_items  where status = 'published' and published::text like '%' || p_id::text || '%')
    or exists (select 1 from public.site_settings where status = 'published' and published::text like '%' || p_id::text || '%');
$$;

revoke all on function public.media_is_published(uuid) from public;
grant execute on function public.media_is_published(uuid) to anon, authenticated, service_role;

alter table public.media_assets enable row level security;
revoke all on table public.media_assets from anon, authenticated;
grant select, insert, update, delete on table public.media_assets to authenticated;
grant select (id, url, type, mime, width, height, alt_text, caption) on table public.media_assets to anon;
grant all on table public.media_assets to service_role;

drop policy if exists "Admins manage media" on public.media_assets;
create policy "Admins manage media" on public.media_assets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public reads media used by published content" on public.media_assets;
create policy "Public reads media used by published content" on public.media_assets
  for select to anon using (public.media_is_published(id));

-- Where is an asset used? (admin only — runs with the caller's RLS)
create or replace function public.media_usage(p_id uuid)
returns table (content_type text, item_id uuid, label text, in_published boolean, in_draft boolean)
language sql
stable
security invoker
set search_path = ''
as $$
  with all_content as (
    select 'pages'::text as content_type, id, coalesce(draft ->> 'title', slug) as label, draft, published from public.pages
    union all select 'stories', id, draft ->> 'title', draft, published from public.stories
    union all select 'services', id, draft ->> 'name', draft, published from public.services
    union all select 'testimonials', id, draft ->> 'displayName', draft, published from public.testimonials
    union all select 'social_items', id, coalesce(draft ->> 'caption', 'Social tile'), draft, published from public.social_items
    union all select 'site_settings', id, 'Website settings', draft, published from public.site_settings
  )
  select content_type, id, coalesce(label, 'Untitled'),
         coalesce(published::text like '%' || p_id::text || '%', false),
         draft::text like '%' || p_id::text || '%'
  from all_content
  where public.is_admin()
    and (draft::text like '%' || p_id::text || '%' or coalesce(published::text, '') like '%' || p_id::text || '%');
$$;

revoke all on function public.media_usage(uuid) from public, anon;
grant execute on function public.media_usage(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Version history & audit log
-- ---------------------------------------------------------------------------
create table if not exists public.content_versions (
  id           bigint generated always as identity primary key,
  content_type text not null,
  item_id      uuid not null,
  snapshot     jsonb not null,
  published_by uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists content_versions_item_idx on public.content_versions (content_type, item_id, id desc);

create table if not exists public.audit_log (
  id         bigint generated always as identity primary key,
  actor      uuid references auth.users (id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  text,
  detail     jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

alter table public.content_versions enable row level security;
alter table public.audit_log enable row level security;
revoke all on table public.content_versions from anon, authenticated;
revoke all on table public.audit_log from anon, authenticated;
grant select, insert, delete on table public.content_versions to authenticated;
grant select, insert on table public.audit_log to authenticated;
grant all on table public.content_versions to service_role;
grant all on table public.audit_log to service_role;

drop policy if exists "Admins manage versions" on public.content_versions;
create policy "Admins manage versions" on public.content_versions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins read and write audit" on public.audit_log;
create policy "Admins read and write audit" on public.audit_log
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Keep the 10 most recent published snapshots per item
create or replace function public.prune_content_versions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.content_versions v
  where v.content_type = new.content_type
    and v.item_id = new.item_id
    and v.id not in (
      select id from public.content_versions
      where content_type = new.content_type and item_id = new.item_id
      order by id desc limit 10
    );
  return null;
end;
$$;

drop trigger if exists content_versions_prune on public.content_versions;
create trigger content_versions_prune after insert on public.content_versions
  for each row execute function public.prune_content_versions();

-- ---------------------------------------------------------------------------
-- Publishing functions (run with the caller's permissions; admin only)
-- ---------------------------------------------------------------------------
create or replace function public.assert_content_table(p_table text)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_table not in ('pages', 'stories', 'services', 'testimonials', 'social_items', 'site_settings') then
    raise exception 'Unknown content type: %', p_table using errcode = '22023';
  end if;
end;
$$;

create or replace function public.publish_content(p_table text, p_id uuid)
returns timestamptz
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_snapshot jsonb;
  v_at timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  perform public.assert_content_table(p_table);

  execute format(
    'update public.%I
        set published = draft, status = ''published'', published_at = now(), updated_by = auth.uid()
      where id = $1
      returning published, published_at', p_table)
    into v_snapshot, v_at
    using p_id;

  if v_snapshot is null then
    raise exception 'Item not found' using errcode = 'P0002';
  end if;

  insert into public.content_versions (content_type, item_id, snapshot, published_by)
  values (p_table, p_id, v_snapshot, auth.uid());

  insert into public.audit_log (actor, action, entity, entity_id)
  values (auth.uid(), 'publish', p_table, p_id::text);

  return v_at;
end;
$$;

create or replace function public.unpublish_content(p_table text, p_id uuid, p_archive boolean default false)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_found uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  perform public.assert_content_table(p_table);
  if p_table in ('pages', 'site_settings') and p_archive then
    raise exception 'Pages and settings cannot be archived' using errcode = '22023';
  end if;

  execute format(
    'update public.%I
        set status = $2, published = null, published_at = null, updated_by = auth.uid()
      where id = $1
      returning id', p_table)
    into v_found
    using p_id, case when p_archive then 'archived' else 'draft' end;

  if v_found is null then
    raise exception 'Item not found' using errcode = 'P0002';
  end if;

  insert into public.audit_log (actor, action, entity, entity_id)
  values (auth.uid(), case when p_archive then 'archive' else 'unpublish' end, p_table, p_id::text);
end;
$$;

-- Set sort_order from the order of ids given
create or replace function public.reorder_content(p_table text, p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  perform public.assert_content_table(p_table);
  execute format(
    'update public.%I t set sort_order = o.ord
       from unnest($1::uuid[]) with ordinality as o(id, ord)
      where t.id = o.id', p_table)
    using p_ids;
end;
$$;

-- Copy an old published snapshot back into the draft
create or replace function public.restore_version(p_version_id bigint)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v public.content_versions%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  select * into v from public.content_versions where id = p_version_id;
  if v.id is null then
    raise exception 'Version not found' using errcode = 'P0002';
  end if;
  perform public.assert_content_table(v.content_type);
  execute format('update public.%I set draft = $1, updated_by = auth.uid() where id = $2', v.content_type)
    using v.snapshot, v.item_id;
  insert into public.audit_log (actor, action, entity, entity_id, detail)
  values (auth.uid(), 'restore_version', v.content_type, v.item_id::text, jsonb_build_object('version', p_version_id));
end;
$$;

revoke all on function public.publish_content(text, uuid) from public, anon;
revoke all on function public.unpublish_content(text, uuid, boolean) from public, anon;
revoke all on function public.reorder_content(text, uuid[]) from public, anon;
revoke all on function public.restore_version(bigint) from public, anon;
grant execute on function public.publish_content(text, uuid) to authenticated;
grant execute on function public.unpublish_content(text, uuid, boolean) to authenticated;
grant execute on function public.reorder_content(text, uuid[]) to authenticated;
grant execute on function public.restore_version(bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- Inquiries (private). Inserted only by the server with the service role.
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null check (char_length(full_name) between 1 and 120),
  partner_name     text not null default '' check (char_length(partner_name) <= 120),
  email            text not null check (char_length(email) <= 254 and email like '%@%'),
  whatsapp         text not null default '' check (char_length(whatsapp) <= 30),
  wedding_date     date,
  location         text not null default '' check (char_length(location) <= 200),
  celebration_type text not null default '' check (char_length(celebration_type) <= 80),
  service_interest text not null default '' check (char_length(service_interest) <= 120),
  budget           text not null default '' check (char_length(budget) <= 80),
  notes            text not null default '' check (char_length(notes) <= 4000),
  consent          boolean not null check (consent),
  status           text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed')),
  ip_hash          text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists inquiries_status_created_idx on public.inquiries (status, created_at desc);
create index if not exists inquiries_created_idx on public.inquiries (created_at desc);

drop trigger if exists inquiries_touch on public.inquiries;
create trigger inquiries_touch before update on public.inquiries
  for each row execute function public.touch_updated_at();

create table if not exists public.inquiry_notes (
  id         uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  note       text not null check (char_length(note) between 1 and 4000),
  author_id  uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists inquiry_notes_inquiry_idx on public.inquiry_notes (inquiry_id, created_at);

create table if not exists public.inquiry_rate_limits (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index if not exists inquiry_rate_limits_idx on public.inquiry_rate_limits (ip_hash, created_at desc);

alter table public.inquiries enable row level security;
alter table public.inquiry_notes enable row level security;
alter table public.inquiry_rate_limits enable row level security;

revoke all on table public.inquiries from anon, authenticated;
revoke all on table public.inquiry_notes from anon, authenticated;
revoke all on table public.inquiry_rate_limits from anon, authenticated;
grant select, update, delete on table public.inquiries to authenticated;
grant select, insert, delete on table public.inquiry_notes to authenticated;
grant all on table public.inquiries to service_role;
grant all on table public.inquiry_notes to service_role;
grant all on table public.inquiry_rate_limits to service_role;

drop policy if exists "Admins manage inquiries" on public.inquiries;
create policy "Admins manage inquiries" on public.inquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage inquiry notes" on public.inquiry_notes;
create policy "Admins manage inquiry notes" on public.inquiry_notes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- inquiry_rate_limits: no policies → only the service role can touch it.

-- Delete closed inquiries older than N months (admin only)
create or replace function public.purge_closed_inquiries(p_months integer)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if p_months is null or p_months < 1 then
    raise exception 'Months must be 1 or more' using errcode = '22023';
  end if;
  delete from public.inquiries
   where status = 'closed' and created_at < now() - make_interval(months => p_months);
  get diagnostics v_count = row_count;
  insert into public.audit_log (actor, action, entity, detail)
  values (auth.uid(), 'purge_inquiries', 'inquiries', jsonb_build_object('months', p_months, 'deleted', v_count));
  return v_count;
end;
$$;
revoke all on function public.purge_closed_inquiries(integer) from public, anon;
grant execute on function public.purge_closed_inquiries(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for media (public read; only admins can write)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins read media objects" on storage.objects;
create policy "Admins read media objects" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "Admins upload media objects" on storage.objects;
create policy "Admins upload media objects" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "Admins update media objects" on storage.objects;
create policy "Admins update media objects" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "Admins delete media objects" on storage.objects;
create policy "Admins delete media objects" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
