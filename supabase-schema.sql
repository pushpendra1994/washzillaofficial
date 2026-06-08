create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null check (customer_phone ~ '^[0-9]{10}$'),
  vehicle_type text not null,
  service_name text not null,
  booking_date date not null,
  booking_time text not null,
  notes text,
  source text not null default 'website',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

drop policy if exists "allow_public_booking_insert" on public.bookings;
create policy "allow_public_booking_insert"
on public.bookings
for insert
to anon, authenticated
with check (source = 'website');

drop policy if exists "deny_public_booking_reads" on public.bookings;
create policy "deny_public_booking_reads"
on public.bookings
for select
to anon, authenticated
using (false);
