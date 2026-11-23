-- =========================================================
-- AI Creator Labs Portal — skema database Supabase
-- Jalankan SEKALI di Supabase → SQL Editor → New query → Run.
-- Sebelum menjalankan, GANTI email di bagian paling bawah
-- dengan email Anda (akan menjadi Pemilik).
-- =========================================================

create extension if not exists pgcrypto;

-- ---------- Tabel ----------
create table if not exists public.admins (
  email      text primary key check (email = lower(email)),
  role       text not null check (role in ('owner', 'editor', 'contributor')),
  created_at timestamptz not null default now()
);

create table if not exists public.features (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text not null default '',
  template    text not null default 'kosong',
  system      boolean not null default false,
  fields      jsonb not null default '[]'::jsonb,
  sort        int not null default 0,
  visible     boolean not null default true,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  feature_id uuid not null references public.features(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  sort       int not null default 0,
  status     text not null default 'draft' check (status in ('draft', 'published')),
  deleted_at timestamptz,
  created_by text default lower(coalesce(auth.jwt() ->> 'email', '')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists items_feature_idx on public.items(feature_id, sort);

-- ---------- Peran pengguna yang sedang login ----------
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.admins where email = lower(coalesce(auth.jwt() ->> 'email', ''))
$$;
grant execute on function public.my_role() to anon, authenticated;

-- ---------- Aturan admin: maksimal 5, selalu ada minimal 1 Pemilik ----------
create or replace function public.guard_admins() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and (select count(*) from public.admins) >= 5 then
    raise exception 'Maksimal 5 admin';
  end if;
  if tg_op in ('UPDATE', 'DELETE') and old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner')
     and (select count(*) from public.admins where role = 'owner') <= 1 then
    raise exception 'Harus selalu ada minimal satu Pemilik';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  new.email := lower(new.email);
  return new;
end $$;
drop trigger if exists guard_admins on public.admins;
create trigger guard_admins before insert or update or delete on public.admins
  for each row execute function public.guard_admins();

-- ---------- Sampah: hanya Pemilik yang bisa memulihkan; fitur sistem dikunci ----------
create or replace function public.guard_features() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.deleted_at is not null and new.deleted_at is null and coalesce(public.my_role(), '') <> 'owner' then
    raise exception 'Hanya Pemilik yang bisa memulihkan dari Sampah';
  end if;
  if old.system and (new.deleted_at is not null or new.slug <> old.slug or new.fields <> old.fields or new.system <> old.system) then
    raise exception 'Fitur sistem tidak bisa dihapus atau diubah field-nya';
  end if;
  return new;
end $$;
drop trigger if exists guard_features on public.features;
create trigger guard_features before update on public.features
  for each row execute function public.guard_features();

create or replace function public.guard_items() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.deleted_at is not null and new.deleted_at is null and coalesce(public.my_role(), '') <> 'owner' then
    raise exception 'Hanya Pemilik yang bisa memulihkan dari Sampah';
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists guard_items on public.items;
create trigger guard_items before update on public.items
  for each row execute function public.guard_items();

-- ---------- Tidak ada pendaftaran publik ----------
-- Akun login hanya bisa dibuat untuk email yang sudah didaftarkan Pemilik di tabel admins.
create or replace function public.only_admins_signup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.admins where email = lower(new.email)) then
    raise exception 'Email ini tidak terdaftar sebagai admin';
  end if;
  return new;
end $$;
drop trigger if exists only_admins_signup on auth.users;
create trigger only_admins_signup before insert on auth.users
  for each row execute function public.only_admins_signup();

-- ---------- Row Level Security ----------
alter table public.admins   enable row level security;
alter table public.features enable row level security;
alter table public.items    enable row level security;

drop policy if exists admins_read  on public.admins;
drop policy if exists admins_write on public.admins;
create policy admins_read  on public.admins for select to authenticated using (public.my_role() is not null);
create policy admins_write on public.admins for all    to authenticated using (public.my_role() = 'owner') with check (public.my_role() = 'owner');

drop policy if exists features_public on public.features;
drop policy if exists features_admin  on public.features;
drop policy if exists features_insert on public.features;
drop policy if exists features_update on public.features;
drop policy if exists features_delete on public.features;
create policy features_public on public.features for select using (visible and deleted_at is null);
create policy features_admin  on public.features for select to authenticated using (public.my_role() is not null);
create policy features_insert on public.features for insert to authenticated with check (public.my_role() in ('owner', 'editor'));
create policy features_update on public.features for update to authenticated using (public.my_role() in ('owner', 'editor')) with check (public.my_role() in ('owner', 'editor'));
create policy features_delete on public.features for delete to authenticated using (public.my_role() = 'owner');

drop policy if exists items_public on public.items;
drop policy if exists items_admin  on public.items;
drop policy if exists items_insert on public.items;
drop policy if exists items_update on public.items;
drop policy if exists items_delete on public.items;
create policy items_public on public.items for select using (
  status = 'published' and deleted_at is null
  and exists (select 1 from public.features f where f.id = feature_id and f.visible and f.deleted_at is null)
);
create policy items_admin  on public.items for select to authenticated using (public.my_role() is not null);
create policy items_insert on public.items for insert to authenticated with check (
  public.my_role() in ('owner', 'editor')
  or (public.my_role() = 'contributor' and status = 'draft' and deleted_at is null)
);
create policy items_update on public.items for update to authenticated using (public.my_role() in ('owner', 'editor')) with check (public.my_role() in ('owner', 'editor'));
create policy items_delete on public.items for delete to authenticated using (public.my_role() = 'owner');

-- ---------- Penyimpanan gambar ----------
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
drop policy if exists media_read   on storage.objects;
drop policy if exists media_insert on storage.objects;
drop policy if exists media_delete on storage.objects;
create policy media_read   on storage.objects for select using (bucket_id = 'media');
create policy media_insert on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.my_role() is not null);
create policy media_delete on storage.objects for delete to authenticated using (bucket_id = 'media' and public.my_role() in ('owner', 'editor'));

-- ---------- Pemilik pertama ----------
-- GANTI email di bawah dengan email Anda sebelum menjalankan.
insert into public.admins (email, role) values ('email-anda@contoh.com', 'owner')
on conflict (email) do update set role = 'owner';
