-- ============================================================================
-- Ever After Memoir — booking calendar
-- Run after 0001 and 0002 (Supabase → SQL Editor → paste → Run). Safe to re-run.
--
-- Only dates the owner marks are stored. Any date not listed is AVAILABLE.
--   booked      → shown as booked, cannot be chosen
--   unavailable → shown as unavailable, cannot be chosen
--   limited     → shown as "few slots left", can still be chosen
-- Visitors can read the date and its status only; the private note is admin-only.
-- ============================================================================

create table if not exists public.availability (
  day        date primary key,
  status     text not null check (status in ('booked', 'limited', 'unavailable')),
  note       text not null default '' check (char_length(note) <= 300),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

drop trigger if exists availability_touch on public.availability;
create trigger availability_touch before update on public.availability
  for each row execute function public.touch_updated_at();

alter table public.availability enable row level security;
revoke all on table public.availability from anon, authenticated;
grant select (day, status) on table public.availability to anon;
grant select, insert, update, delete on table public.availability to authenticated;
grant all on table public.availability to service_role;

drop policy if exists "Admins manage availability" on public.availability;
create policy "Admins manage availability" on public.availability
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public reads upcoming availability" on public.availability;
create policy "Public reads upcoming availability" on public.availability
  for select to anon using (day >= current_date);

-- Inquiries can now come from the booking calendar (WhatsApp) and may not
-- include an email address.
alter table public.inquiries add column if not exists source text not null default 'form';
alter table public.inquiries drop constraint if exists inquiries_source_check;
alter table public.inquiries add constraint inquiries_source_check check (source in ('form', 'booking'));

alter table public.inquiries alter column email set default '';
alter table public.inquiries drop constraint if exists inquiries_email_check;
alter table public.inquiries add constraint inquiries_email_check
  check (char_length(email) <= 254 and (email = '' or email like '%@%'));

create index if not exists inquiries_wedding_date_idx on public.inquiries (wedding_date);
