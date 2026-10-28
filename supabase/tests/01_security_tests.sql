-- Security & publishing tests. Run on a LOCAL test database only
-- (after 00_supabase_stub.sql, 0001_schema.sql, 0002_seed.sql).
-- Every block raises an exception if a check fails.
\set ON_ERROR_STOP 1

-- Test users
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'owner@test.local'),
  ('22222222-2222-4222-8222-222222222222', 'stranger@test.local')
on conflict do nothing;
insert into public.admin_users (user_id) values ('11111111-1111-4111-8111-111111111111') on conflict do nothing;

create or replace function pg_temp.as_role(p_role text, p_sub text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_sub, ''), true);
  execute format('set local role %I', p_role);
end $$;

create or replace function pg_temp.expect_error(p_sql text, p_like text) returns void language plpgsql as $$
begin
  execute p_sql;
  raise exception 'EXPECTED ERROR (%), but statement succeeded: %', p_like, p_sql;
exception when others then
  if sqlerrm like 'EXPECTED ERROR%' then raise; end if;
  if sqlerrm not ilike '%' || p_like || '%' then
    raise exception 'Wrong error for %: got "%", wanted "%"', p_sql, sqlerrm, p_like;
  end if;
end $$;

-- 1. Anonymous visitors read published content only, never drafts
do $$ declare n int; begin
  perform pg_temp.as_role('anon', null);
  select count(*) into n from public.stories where status = 'published';
  if n <> 3 then raise exception 'T1a anon should see 3 published stories, saw %', n; end if;
  select count(*) into n from (select id, published from public.pages) p;
  if n <> 6 then raise exception 'T1b anon should see 6 pages, saw %', n; end if;
  perform pg_temp.expect_error('select draft from public.stories', 'permission denied');
  perform pg_temp.expect_error('select * from public.pages', 'permission denied');
  perform pg_temp.expect_error('select draft from public.site_settings', 'permission denied');
  raise notice 'PASS 1  anon reads published columns only; draft column is denied';
end $$;

-- 2. Anonymous visitors cannot touch inquiries, notes, admin tables or publish
do $$ begin
  perform pg_temp.as_role('anon', null);
  perform pg_temp.expect_error('select * from public.inquiries', 'permission denied');
  perform pg_temp.expect_error($q$insert into public.inquiries (full_name, email, consent) values ('x','x@y.z',true)$q$, 'permission denied');
  perform pg_temp.expect_error('select * from public.inquiry_notes', 'permission denied');
  perform pg_temp.expect_error('select * from public.admin_users', 'permission denied');
  perform pg_temp.expect_error('select * from public.audit_log', 'permission denied');
  perform pg_temp.expect_error('select * from public.content_versions', 'permission denied');
  perform pg_temp.expect_error($q$update public.stories set status = 'draft'$q$, 'permission denied');
  perform pg_temp.expect_error($q$select public.publish_content('stories', '00000000-0000-4000-8000-000000000101')$q$, 'permission denied');
  perform pg_temp.expect_error($q$insert into public.media_assets (url, type) values ('x','image')$q$, 'permission denied');
  raise notice 'PASS 2  anon blocked from inquiries, notes, admin tables, writes and publish';
end $$;

-- 3. A signed-in user who is NOT an admin gets nothing
do $$ declare n int; begin
  perform pg_temp.as_role('authenticated', '22222222-2222-4222-8222-222222222222');
  select count(*) into n from public.stories; if n <> 0 then raise exception 'T3a stranger saw % stories', n; end if;
  select count(*) into n from public.inquiries; if n <> 0 then raise exception 'T3b stranger saw inquiries'; end if;
  update public.pages set draft = '{}'::jsonb; get diagnostics n = row_count;
  if n <> 0 then raise exception 'T3c stranger updated % pages', n; end if;
  perform pg_temp.expect_error($q$select public.publish_content('pages', '00000000-0000-4000-8000-000000000401')$q$, 'not authorised');
  perform pg_temp.expect_error($q$insert into storage.objects (bucket_id, name) values ('media', 'evil.jpg')$q$, 'row-level security');
  perform pg_temp.expect_error($q$insert into public.admin_users (user_id) values ('22222222-2222-4222-8222-222222222222')$q$, 'permission denied');
  raise notice 'PASS 3  signed-in non-admin cannot read, edit, publish, upload or promote themselves';
end $$;

-- 4. Admin: draft → (anon unchanged) → publish → (anon sees new) → unpublish
do $$ declare v text; n int; begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  update public.pages set draft = jsonb_set(draft, '{title}', '"Home EDITED"') where slug = 'home';
  get diagnostics n = row_count; if n <> 1 then raise exception 'T4a admin could not save draft'; end if;
end $$;
do $$ declare v text; begin
  perform pg_temp.as_role('anon', null);
  select published ->> 'title' into v from public.pages where slug = 'home';
  if v <> 'Home' then raise exception 'T4b anon saw draft before publish: %', v; end if;
  raise notice 'PASS 4a saved draft is invisible to the public';
end $$;
do $$ begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  perform public.publish_content('pages', '00000000-0000-4000-8000-000000000401');
end $$;
do $$ declare v text; begin
  perform pg_temp.as_role('anon', null);
  select published ->> 'title' into v from public.pages where slug = 'home';
  if v <> 'Home EDITED' then raise exception 'T4c publish did not go live: %', v; end if;
  raise notice 'PASS 4b publish makes the draft live';
end $$;
do $$ declare n int; begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  select count(*) into n from public.content_versions where item_id = '00000000-0000-4000-8000-000000000401';
  if n < 1 then raise exception 'T4d no version snapshot recorded'; end if;
  select count(*) into n from public.audit_log where action = 'publish';
  if n < 1 then raise exception 'T4e no audit log entry'; end if;
  raise notice 'PASS 4c publish writes version history and audit log';
end $$;

-- 5. New draft story is hidden; publishing shows it; unpublishing hides it again
do $$ begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  insert into public.stories (id, draft) values ('33333333-3333-4333-8333-333333333333', '{"title":"Secret","slug":"secret"}');
end $$;
do $$ declare n int; begin
  perform pg_temp.as_role('anon', null);
  select count(*) into n from public.stories where id = '33333333-3333-4333-8333-333333333333';
  if n <> 0 then raise exception 'T5a draft story visible to anon'; end if;
end $$;
do $$ begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  perform public.publish_content('stories', '33333333-3333-4333-8333-333333333333');
end $$;
do $$ declare n int; begin
  perform pg_temp.as_role('anon', null);
  select count(*) into n from public.stories where published ->> 'slug' = 'secret';
  if n <> 1 then raise exception 'T5b published story not visible'; end if;
end $$;
do $$ begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  perform public.unpublish_content('stories', '33333333-3333-4333-8333-333333333333');
end $$;
do $$ declare n int; begin
  perform pg_temp.as_role('anon', null);
  select count(*) into n from public.stories where id = '33333333-3333-4333-8333-333333333333';
  if n <> 0 then raise exception 'T5c unpublished story still visible'; end if;
  raise notice 'PASS 5  draft hidden → publish visible → unpublish hidden';
end $$;

-- 6. A failed publish keeps the previous live version
do $$ begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  -- give the hidden story the same slug as a live story, then try to publish
  update public.stories set draft = '{"title":"Clash","slug":"a-day-to-remember"}' where id = '33333333-3333-4333-8333-333333333333';
  perform pg_temp.expect_error($q$select public.publish_content('stories', '33333333-3333-4333-8333-333333333333')$q$, 'duplicate key');
  -- edit a live story's draft to clash, publish must fail and live copy must stay
  update public.stories set draft = jsonb_set(draft, '{slug}', '"the-quiet-between-us"') where id = '00000000-0000-4000-8000-000000000101';
  perform pg_temp.expect_error($q$select public.publish_content('stories', '00000000-0000-4000-8000-000000000101')$q$, 'duplicate key');
end $$;
do $$ declare v text; begin
  perform pg_temp.as_role('anon', null);
  select published ->> 'slug' into v from public.stories where id = '00000000-0000-4000-8000-000000000101';
  if v <> 'a-day-to-remember' then raise exception 'T6 live version changed after failed publish: %', v; end if;
  raise notice 'PASS 6  failed publish leaves the live version untouched';
end $$;

-- 7. Media: public sees only assets used by published content
do $$ begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  insert into public.media_assets (id, url, type) values ('44444444-4444-4444-8444-444444444444', 'https://x/unreleased.jpg', 'image');
  update public.stories set draft = jsonb_set(draft, '{cover}', '{"id":"44444444-4444-4444-8444-444444444444","url":"https://x/unreleased.jpg","type":"image"}')
   where id = '00000000-0000-4000-8000-000000000102';
end $$;
do $$ declare n int; begin
  perform pg_temp.as_role('anon', null);
  select count(*) into n from public.media_assets where id = '44444444-4444-4444-8444-444444444444';
  if n <> 0 then raise exception 'T7a unreleased media visible to anon'; end if;
  select count(*) into n from public.media_assets where id = '00000000-0000-4000-8000-000000000001';
  if n <> 1 then raise exception 'T7b published hero media not visible'; end if;
  perform pg_temp.expect_error('select storage_path from public.media_assets', 'permission denied');
  raise notice 'PASS 7  media used only in drafts stays private';
end $$;
do $$ declare n int; begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  select count(*) into n from public.media_usage('44444444-4444-4444-8444-444444444444') where in_draft and not in_published;
  if n <> 1 then raise exception 'T7c media_usage did not report the draft usage'; end if;
  raise notice 'PASS 7b media usage report works for admins';
end $$;

-- 8. Admin can upload to storage; reorder works
do $$ declare n int; begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  insert into storage.objects (bucket_id, name) values ('media', 'uploads/ok.jpg');
  perform public.reorder_content('services', array['00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000202']::uuid[]);
  select sort_order into n from public.services where id = '00000000-0000-4000-8000-000000000203';
  if n <> 1 then raise exception 'T8 reorder failed, got %', n; end if;
  raise notice 'PASS 8  admin upload policy and reorder work';
end $$;

-- 9. Inquiries: only the server (service role) inserts; admin reads, updates, notes
do $$ begin
  perform pg_temp.as_role('service_role', null);
  insert into public.inquiries (id, full_name, email, consent) values ('55555555-5555-4555-8555-555555555555', 'Test Couple', 'couple@test.local', true);
  insert into public.inquiry_rate_limits (ip_hash) values ('abc');
end $$;
do $$ declare n int; begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  select count(*) into n from public.inquiries; if n <> 1 then raise exception 'T9a admin cannot see inquiry'; end if;
  update public.inquiries set status = 'contacted' where id = '55555555-5555-4555-8555-555555555555';
  insert into public.inquiry_notes (inquiry_id, note, author_id) values ('55555555-5555-4555-8555-555555555555', 'Called back', auth.uid());
  perform pg_temp.expect_error($q$update public.inquiries set status = 'maybe'$q$, 'check constraint');
  perform pg_temp.expect_error('select * from public.inquiry_rate_limits', 'permission denied');
  raise notice 'PASS 9  inquiries: server inserts, admin manages, rate-limit table private';
end $$;

-- 10. Version history keeps the last 10
do $$ declare n int; begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  for i in 1..12 loop perform public.publish_content('services', '00000000-0000-4000-8000-000000000201'); end loop;
  select count(*) into n from public.content_versions where item_id = '00000000-0000-4000-8000-000000000201';
  if n <> 10 then raise exception 'T10 expected 10 versions, got %', n; end if;
  raise notice 'PASS 10 version history pruned to 10';
end $$;

-- 11. Data integrity checks
do $$ begin
  perform pg_temp.expect_error($q$update public.stories set status = 'published', published = null where id = '33333333-3333-4333-8333-333333333333'$q$, 'check constraint');
  perform pg_temp.expect_error($q$insert into public.site_settings (draft) values ('{}')$q$, 'duplicate key');
  raise notice 'PASS 11 status/published consistency and single settings row enforced';
end $$;

-- 12. Availability: public sees date + status of upcoming days only; never the note
do $$ begin
  perform pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
  insert into public.availability (day, status, note) values (current_date + 30, 'booked', 'Private couple name'), (current_date - 3, 'booked', 'Past');
end $$;
do $$ declare n int; begin
  perform pg_temp.as_role('anon', null);
  select count(*) into n from public.availability where day = current_date + 30 and status = 'booked';
  if n <> 1 then raise exception 'T12a anon cannot see an upcoming booked date'; end if;
  select count(*) into n from public.availability where day < current_date;
  if n <> 0 then raise exception 'T12b anon can see past dates'; end if;
  perform pg_temp.expect_error('select note from public.availability', 'permission denied');
  perform pg_temp.expect_error($q$insert into public.availability (day, status) values (current_date + 40, 'booked')$q$, 'permission denied');
  perform pg_temp.expect_error($q$delete from public.availability$q$, 'permission denied');
  raise notice 'PASS 12 availability: public reads upcoming date + status only, cannot write';
end $$;
do $$ begin
  perform pg_temp.as_role('authenticated', '22222222-2222-4222-8222-222222222222');
  perform pg_temp.expect_error($q$insert into public.availability (day, status) values (current_date + 41, 'booked')$q$, 'row-level security');
  raise notice 'PASS 12b non-admin cannot change availability';
end $$;

-- 13. Booking inquiries may come without an email
do $$ begin
  perform pg_temp.as_role('service_role', null);
  insert into public.inquiries (full_name, consent, source, wedding_date) values ('WhatsApp Couple', true, 'booking', current_date + 60);
  perform pg_temp.expect_error($q$insert into public.inquiries (full_name, email, consent) values ('X', 'not-an-email', true)$q$, 'check constraint');
  perform pg_temp.expect_error($q$insert into public.inquiries (full_name, consent, source) values ('X', true, 'other')$q$, 'check constraint');
  raise notice 'PASS 13 booking inquiries without email accepted; bad email and source rejected';
end $$;

select 'ALL SECURITY TESTS PASSED' as result;
