create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'secretaria')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  folio text unique not null,
  full_name text not null,
  birth_date date not null,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  joined_at date not null default current_date,
  left_at date,
  left_reason text,
  medical_notes text,
  general_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'inactive' and left_at is not null)
    or status = 'active'
  )
);

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_guardians (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  relationship text not null,
  is_primary boolean not null default false,
  is_emergency_contact boolean not null default false,
  created_at timestamptz not null default now(),
  unique (student_id, guardian_id)
);

create unique index student_guardians_one_primary_per_student
  on public.student_guardians (student_id)
  where is_primary;

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  suggested_min_age integer check (suggested_min_age is null or suggested_min_age >= 0),
  suggested_max_age integer check (suggested_max_age is null or suggested_max_age >= 0),
  base_monthly_fee numeric(12,2) not null default 0 check (base_monthly_fee >= 0),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    suggested_min_age is null
    or suggested_max_age is null
    or suggested_min_age <= suggested_max_age
  )
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id),
  name text not null,
  teacher_name text,
  classroom text,
  capacity integer not null check (capacity > 0),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (grade_id, name)
);

create table public.group_schedules (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  group_id uuid not null references public.groups(id),
  starts_on date not null default current_date,
  ends_on date,
  status text not null default 'active' check (status in ('active', 'finished', 'cancelled')),
  assigned_monthly_fee numeric(12,2) not null check (assigned_monthly_fee >= 0),
  discount_type text not null default 'none' check (discount_type in ('none', 'percentage', 'fixed')),
  discount_value numeric(12,2) not null default 0 check (discount_value >= 0),
  final_monthly_fee numeric(12,2) not null check (final_monthly_fee >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on <= ends_on),
  check (
    (discount_type = 'percentage' and discount_value <= 100)
    or discount_type in ('none', 'fixed')
  )
);

create unique index student_enrollments_one_active_per_student
  on public.student_enrollments (student_id)
  where status = 'active';

create table public.charges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  enrollment_id uuid references public.student_enrollments(id),
  month integer not null check (month between 1 and 12),
  year integer not null check (year >= 2000),
  type text not null check (type in ('mensualidad', 'inscripcion', 'otro')),
  concept text not null,
  amount_due numeric(12,2) not null check (amount_due >= 0),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  due_date date not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'pagado', 'parcial', 'vencido', 'cancelado', 'becada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_paid <= amount_due)
);

create unique index charges_one_monthly_charge_per_enrollment
  on public.charges (student_id, enrollment_id, month, year, type)
  where type = 'mensualidad';

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  charge_id uuid not null references public.charges(id),
  student_id uuid not null references public.students(id),
  amount numeric(12,2) not null check (amount > 0),
  method text not null check (method in ('efectivo', 'transferencia', 'tarjeta', 'deposito', 'otro')),
  paid_at timestamptz not null default now(),
  registered_by uuid not null references public.profiles(id),
  notes text,
  receipt_number text unique not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  cancellation_reason text,
  cancelled_by uuid references public.profiles(id),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'cancelled' and cancellation_reason is not null and cancelled_by is not null and cancelled_at is not null)
    or status = 'active'
  )
);

create table public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  student_id uuid not null references public.students(id),
  original_name text not null,
  content_type text not null check (content_type in ('application/pdf', 'image/jpeg', 'image/png')),
  storage_path text not null,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null unique references public.payments(id) on delete cascade,
  receipt_number text unique not null,
  storage_path text,
  generated_by uuid not null references public.profiles(id),
  generated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  academy_name text not null,
  logo_path text,
  primary_color text,
  secondary_color text,
  payment_due_day integer not null default 10 check (payment_due_day between 1 and 28),
  enrollment_fee_enabled boolean not null default false,
  enrollment_fee_amount numeric(12,2) not null default 0 check (enrollment_fee_amount >= 0),
  receipt_prefix text not null default 'REC',
  student_folio_prefix text not null default 'ALU',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index app_settings_single_row on public.app_settings ((true));

create index students_status_idx on public.students (status);
create index students_full_name_idx on public.students using gin (to_tsvector('spanish', full_name));
create index guardians_full_name_idx on public.guardians using gin (to_tsvector('spanish', full_name));
create index groups_grade_id_idx on public.groups (grade_id);
create index group_schedules_group_weekday_idx on public.group_schedules (group_id, weekday);
create index student_enrollments_student_status_idx on public.student_enrollments (student_id, status);
create index student_enrollments_group_status_idx on public.student_enrollments (group_id, status);
create index charges_month_year_status_idx on public.charges (year, month, status);
create index charges_student_idx on public.charges (student_id);
create index payments_paid_at_idx on public.payments (paid_at);
create index payments_student_idx on public.payments (student_id);
create index payments_method_idx on public.payments (method);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

create trigger guardians_set_updated_at
  before update on public.guardians
  for each row execute function public.set_updated_at();

create trigger grades_set_updated_at
  before update on public.grades
  for each row execute function public.set_updated_at();

create trigger groups_set_updated_at
  before update on public.groups
  for each row execute function public.set_updated_at();

create trigger group_schedules_set_updated_at
  before update on public.group_schedules
  for each row execute function public.set_updated_at();

create trigger student_enrollments_set_updated_at
  before update on public.student_enrollments
  for each row execute function public.set_updated_at();

create trigger charges_set_updated_at
  before update on public.charges
  for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.profiles
  where auth_user_id = auth.uid()
    and status = 'active'
  limit 1
$$;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where auth_user_id = auth.uid()
    and status = 'active'
  limit 1
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() in ('admin', 'secretaria')
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() = 'admin'
$$;

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.guardians enable row level security;
alter table public.student_guardians enable row level security;
alter table public.grades enable row level security;
alter table public.groups enable row level security;
alter table public.group_schedules enable row level security;
alter table public.student_enrollments enable row level security;
alter table public.charges enable row level security;
alter table public.payments enable row level security;
alter table public.payment_proofs enable row level security;
alter table public.receipts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_settings enable row level security;

create policy "profiles_select_staff"
  on public.profiles for select
  to authenticated
  using (public.is_staff());

create policy "profiles_insert_admin"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "students_staff_all"
  on public.students for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "guardians_staff_all"
  on public.guardians for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "student_guardians_staff_all"
  on public.student_guardians for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "grades_staff_all"
  on public.grades for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "groups_staff_all"
  on public.groups for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "group_schedules_staff_all"
  on public.group_schedules for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "student_enrollments_staff_all"
  on public.student_enrollments for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "charges_staff_all"
  on public.charges for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "payments_staff_select"
  on public.payments for select
  to authenticated
  using (public.is_staff());

create policy "payments_staff_insert"
  on public.payments for insert
  to authenticated
  with check (public.is_staff());

create policy "payments_staff_update"
  on public.payments for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "payment_proofs_staff_all"
  on public.payment_proofs for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "receipts_staff_all"
  on public.receipts for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "audit_logs_select_staff"
  on public.audit_logs for select
  to authenticated
  using (public.is_staff());

create policy "audit_logs_insert_staff"
  on public.audit_logs for insert
  to authenticated
  with check (public.is_staff());

create policy "app_settings_select_staff"
  on public.app_settings for select
  to authenticated
  using (public.is_staff());

create policy "app_settings_update_admin"
  on public.app_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('payment-proofs', 'payment-proofs', false),
  ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "payment_proofs_storage_staff_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'payment-proofs' and public.is_staff());

create policy "payment_proofs_storage_staff_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'payment-proofs' and public.is_staff());

create policy "receipts_storage_staff_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts' and public.is_staff());

create policy "receipts_storage_staff_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'receipts' and public.is_staff());
