-- ============================================================
-- STEP 1: Run this entire file in Supabase → SQL Editor
-- ============================================================

-- ── Table 1: Reference prompts (replaces Airtable "Web Image Analysis") ──
create table if not exists web_image_analysis (
  id              uuid primary key default gen_random_uuid(),
  airtable_id     text unique,          -- original Airtable record ID, useful during transition
  image_name      text,
  prompt_name     text,
  brand_name      text,
  format_layout   text,
  primary_object  text,
  subject         text,
  lighting        text,
  mood            text,
  background      text,
  positive_prompt text,
  negative_prompt text,
  created_at      timestamptz default now()
);

-- ── Table 2: Liked / favorited generated images ───────────────────────────
create table if not exists liked_images (
  id          uuid primary key default gen_random_uuid(),
  record_id   text unique,              -- used by like/unlike webhooks
  img_url     text not null,
  brand_name  text,
  created_at  timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────
-- The frontend (anon key) can READ both tables.
-- n8n (service role key) can do everything — service role bypasses RLS automatically.

alter table web_image_analysis enable row level security;
alter table liked_images        enable row level security;

create policy "anon can read web_image_analysis"
  on web_image_analysis for select using (true);

create policy "anon can read liked_images"
  on liked_images for select using (true);

-- ── Storage bucket for generated images ──────────────────────────────────
-- Creates a PUBLIC bucket — images get a permanent public URL (no auth needed).
insert into storage.buckets (id, name, public)
values ('generated-images', 'generated-images', true)
on conflict (id) do nothing;

create policy "public can view generated-images"
  on storage.objects for select
  using (bucket_id = 'generated-images');

create policy "service role can upload generated-images"
  on storage.objects for insert
  with check (bucket_id = 'generated-images');

create policy "service role can delete generated-images"
  on storage.objects for delete
  using (bucket_id = 'generated-images');
