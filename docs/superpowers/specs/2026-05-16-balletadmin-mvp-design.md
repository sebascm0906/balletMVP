# BalletAdmin MVP Design Spec

## Goal

Build BalletAdmin, an internal administrative web system for one ballet academy. The primary user is the secretary; the secondary user is the administrator/director. The MVP must manage students, guardians, grades, groups, schedules, enrollments, monthly charges, payments, payment proofs, debts, basic reports, administrative balance, and PDF receipts.

## Confirmed Scope

BalletAdmin V1 includes:

- Email/password login with Supabase Auth.
- Protected routes.
- Role-based access for `admin` and `secretaria`.
- Student, guardian, grade, group, schedule, and enrollment management.
- One active group enrollment per student.
- Automatic monthly charge generation.
- Optional one-time enrollment fee modeled as a charge.
- Payment registration, partial payments, cancellation with traceability, and no physical deletion of payments.
- Upload of transfer/payment proofs.
- PDF receipts per payment.
- Debt views.
- Basic exportable reports.
- Administrative balance dashboard.
- Basic brand configuration.

Out of scope for V1:

- Parent portal or parent login.
- Online payments, Mercado Pago, or payment provider integrations.
- Automatic WhatsApp notifications.
- Native mobile app.
- Attendance tracking.
- Fiscal invoicing.
- Teacher payroll.
- Daily cash closing.
- Multi-academy or multi-branch operation.
- Initial Excel import.
- Historical payment migration.

## Recommended Business Decisions

- Enrollment fee: support as optional `charges.type = 'inscripcion'`, controlled by settings.
- Payment due date: configurable in `app_settings.payment_due_day`, default day 10.
- Partial payments: allow from V1 because the charge/payment model already needs to track `amount_due`, `amount_paid`, and status.
- Initial scale: optimize list filters and indexes for at least 100 to 250 students.
- Monthly charge generation: start with a protected manual/idempotent server action in V1; schedule automation can be added later.
- Report exports: CSV required in V1; Excel can be added if low-cost after core flows work.

## Technical Stack

- Next.js App Router.
- TypeScript.
- Supabase Auth.
- Supabase PostgreSQL.
- Supabase Storage.
- Tailwind CSS.
- shadcn/ui.
- Zod.
- React Hook Form.
- Server Actions for mutations.
- Server-side query helpers for reads.
- Vercel deployment.

## Architecture

Use a simple App Router architecture:

- Server Components for pages and data loading.
- Client Components for forms, dialogs, filters, uploads, and interactive tables.
- Server Actions for mutations and business rules.
- Supabase server client for authenticated database access.
- Zod schemas shared by forms and server actions.
- RLS policies as a database-level safety net.
- Small domain-focused modules under `src/server/actions`, `src/server/queries`, and `src/lib/validations`.

Avoid a separate backend or broad internal REST API in V1. API routes should be reserved for file/download endpoints or PDF generation only if Server Actions are not suitable.

## Data Model

### `profiles`

Internal users linked to Supabase Auth.

- `id uuid primary key`
- `auth_user_id uuid unique not null references auth.users(id)`
- `full_name text not null`
- `role text not null check role in ('admin', 'secretaria')`
- `status text not null check status in ('active', 'inactive')`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `students`

- `id uuid primary key`
- `folio text unique not null`
- `full_name text not null`
- `birth_date date not null`
- `phone text`
- `status text not null check status in ('active', 'inactive')`
- `joined_at date not null`
- `left_at date`
- `left_reason text`
- `medical_notes text`
- `general_notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Age is calculated in application queries from `birth_date`, not stored.

### `guardians`

- `id uuid primary key`
- `full_name text not null`
- `phone text not null`
- `email text`
- `address text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relationship-specific fields live in `student_guardians`.

### `student_guardians`

- `id uuid primary key`
- `student_id uuid not null references students(id)`
- `guardian_id uuid not null references guardians(id)`
- `relationship text not null`
- `is_primary boolean not null default false`
- `is_emergency_contact boolean not null default false`
- `created_at timestamptz not null default now()`
- unique `(student_id, guardian_id)`

Enforce one primary guardian per student with a partial unique index.

### `grades`

- `id uuid primary key`
- `name text not null`
- `description text`
- `suggested_min_age integer`
- `suggested_max_age integer`
- `base_monthly_fee numeric(12,2) not null default 0`
- `status text not null check status in ('active', 'inactive')`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `groups`

- `id uuid primary key`
- `grade_id uuid not null references grades(id)`
- `name text not null`
- `teacher_name text`
- `classroom text`
- `capacity integer not null`
- `status text not null check status in ('active', 'inactive')`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `group_schedules`

- `id uuid primary key`
- `group_id uuid not null references groups(id)`
- `weekday integer not null check weekday between 0 and 6`
- `starts_at time not null`
- `ends_at time not null`
- `status text not null check status in ('active', 'inactive')`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `student_enrollments`

- `id uuid primary key`
- `student_id uuid not null references students(id)`
- `group_id uuid not null references groups(id)`
- `starts_on date not null`
- `ends_on date`
- `status text not null check status in ('active', 'finished', 'cancelled')`
- `assigned_monthly_fee numeric(12,2) not null`
- `discount_type text not null check discount_type in ('none', 'percentage', 'fixed')`
- `discount_value numeric(12,2) not null default 0`
- `final_monthly_fee numeric(12,2) not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Add a partial unique index on `(student_id)` where `status = 'active'`.

### `charges`

- `id uuid primary key`
- `student_id uuid not null references students(id)`
- `enrollment_id uuid references student_enrollments(id)`
- `month integer not null check month between 1 and 12`
- `year integer not null`
- `type text not null check type in ('mensualidad', 'inscripcion', 'otro')`
- `concept text not null`
- `amount_due numeric(12,2) not null`
- `amount_paid numeric(12,2) not null default 0`
- `due_date date not null`
- `status text not null check status in ('pendiente', 'pagado', 'parcial', 'vencido', 'cancelado', 'becada')`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Add a uniqueness constraint for monthly charges: `(student_id, enrollment_id, month, year, type)` where `type = 'mensualidad'`.

### `payments`

- `id uuid primary key`
- `charge_id uuid not null references charges(id)`
- `student_id uuid not null references students(id)`
- `amount numeric(12,2) not null`
- `method text not null check method in ('efectivo', 'transferencia', 'tarjeta', 'deposito', 'otro')`
- `paid_at timestamptz not null`
- `registered_by uuid not null references profiles(id)`
- `notes text`
- `receipt_number text unique not null`
- `status text not null check status in ('active', 'cancelled')`
- `cancellation_reason text`
- `cancelled_by uuid references profiles(id)`
- `cancelled_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Payments are never physically deleted.

### `payment_proofs`

- `id uuid primary key`
- `payment_id uuid not null references payments(id)`
- `student_id uuid not null references students(id)`
- `original_name text not null`
- `content_type text not null`
- `storage_path text not null`
- `uploaded_by uuid not null references profiles(id)`
- `created_at timestamptz not null default now()`

### `receipts`

- `id uuid primary key`
- `payment_id uuid not null unique references payments(id)`
- `receipt_number text unique not null`
- `storage_path text`
- `generated_by uuid not null references profiles(id)`
- `generated_at timestamptz not null default now()`

### `audit_logs`

- `id uuid primary key`
- `actor_profile_id uuid references profiles(id)`
- `action text not null`
- `entity_type text not null`
- `entity_id uuid`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null default now()`

### `app_settings`

Single-row table for V1.

- `id uuid primary key`
- `academy_name text not null`
- `logo_path text`
- `primary_color text`
- `secondary_color text`
- `payment_due_day integer not null default 10`
- `enrollment_fee_enabled boolean not null default false`
- `enrollment_fee_amount numeric(12,2) not null default 0`
- `receipt_prefix text not null default 'REC'`
- `student_folio_prefix text not null default 'ALU'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

## Routes

- `/login`
- `/dashboard`
- `/alumnas`
- `/alumnas/new`
- `/alumnas/[id]`
- `/alumnas/[id]/edit`
- `/tutores`
- `/grados`
- `/grupos`
- `/horarios`
- `/pagos`
- `/adeudos`
- `/reportes`
- `/configuracion`

## Main Screens

### Login

Email/password form with Supabase Auth. Authenticated users are redirected to `/dashboard`.

### Dashboard

Shows active students, active groups, payments received this month, pending charges, students with debt, today's classes, and quick actions.

### Students

Searchable table by name, folio, status, group, and guardian. Student profile includes general data, current group, schedules, guardians, charges, payments, debts, receipts, payment proofs, and enrollment history.

### Guardians

Create/edit guardians and link them to students. The link tracks relationship, primary contact, and emergency contact.

### Grades, Groups, and Schedules

CRUD for academic structure. Groups show current capacity usage and available seats.

### Enrollments

Handled from student profile or group context. Enrolling validates capacity and active enrollment uniqueness.

### Charges and Payments

Charges are generated monthly. Payments can be complete or partial. Cancellation preserves original payment and writes cancellation metadata.

### Debts

Filter by month, year, student, grade, group, and status. Show student, group, pending month, pending amount, status, primary guardian, and phone.

### Reports

Required reports:

- General administrative balance.
- Monthly payments.
- Debts.
- Group report.
- Active/inactive students.
- Group capacity.
- Payments by method.

## Components

- `AppShell`
- `SidebarNav`
- `Topbar`
- `RoleGuard`
- `PageHeader`
- `DataTable`
- `StatusBadge`
- `MoneyDisplay`
- `StudentForm`
- `GuardianForm`
- `GradeForm`
- `GroupForm`
- `ScheduleForm`
- `EnrollmentForm`
- `PaymentForm`
- `CancelPaymentDialog`
- `PaymentProofUploader`
- `ReceiptDownloadButton`
- `DashboardMetricCard`
- `ClassesTodayList`
- `ReportFilters`
- `ReportExportButton`

## Server Actions

- `createStudent`
- `updateStudent`
- `deactivateStudent`
- `activateStudent`
- `createGuardian`
- `updateGuardian`
- `linkGuardianToStudent`
- `setPrimaryGuardian`
- `createGrade`
- `updateGrade`
- `createGroup`
- `updateGroup`
- `createGroupSchedule`
- `updateGroupSchedule`
- `enrollStudent`
- `changeStudentGroup`
- `finishEnrollment`
- `generateMonthlyCharges`
- `registerPayment`
- `cancelPayment`
- `uploadPaymentProof`
- `generateReceiptPdf`
- `updateAppSettings`

## Query Helpers

- `getCurrentProfile`
- `requireUser`
- `requireRole`
- `getDashboardSummary`
- `getStudents`
- `getStudentProfile`
- `getGuardians`
- `getGrades`
- `getGroups`
- `getSchedules`
- `getChargesByStudent`
- `getDebts`
- `getPaymentsReport`
- `getGeneralBalanceReport`
- `getReportExportRows`

## Validation Strategy

Use Zod schemas for:

- Student form.
- Guardian form.
- Grade form.
- Group form.
- Schedule form.
- Enrollment form.
- Monthly charge generation form.
- Payment form.
- Payment cancellation form.
- Payment proof upload metadata.
- App settings.

Validation runs both client-side through React Hook Form and server-side inside Server Actions.

## Authentication and Authorization

- Supabase Auth manages sessions.
- App Router middleware protects private routes.
- `profiles.role` determines app permissions.
- Server Actions call `requireRole` or `requireUser`.
- RLS policies restrict table access to authenticated users and role-appropriate operations.
- Admin-only capabilities include user management and general configuration.
- Secretary can cancel payments, but cancellation writes `cancelled_by`, `cancelled_at`, `cancellation_reason`, and an audit log row.

## Monthly Charge Generation

`generateMonthlyCharges(month, year)`:

1. Requires authenticated `admin` or `secretaria` if allowed operationally; recommended admin-only initially.
2. Reads active enrollments and active students.
3. Computes due date from `app_settings.payment_due_day`.
4. Creates one monthly charge per active enrollment if missing.
5. Uses `final_monthly_fee`.
6. Marks zero-amount charges as `becada`.
7. Does not duplicate existing charges.
8. Returns created/skipped counts.

Vencido state can be computed in queries or periodically updated. For V1, report/query logic can treat pending charges past due date as vencido.

## Payment Flow

`registerPayment`:

1. Validates charge, amount, method, date, and notes.
2. Rejects payment against cancelled or fully paid charges.
3. Generates receipt number.
4. Inserts payment with status `active`.
5. Recalculates charge `amount_paid`.
6. Updates charge status to `pagado`, `parcial`, or `pendiente`.
7. Creates audit log.
8. Generates receipt metadata/PDF.

`cancelPayment`:

1. Validates role, payment status, and reason.
2. Updates payment status to `cancelled`.
3. Sets cancellation metadata.
4. Recalculates charge from active payments only.
5. Updates charge status.
6. Creates audit log.

## Payment Proof Strategy

- Store files in private Supabase Storage bucket `payment-proofs`.
- Accept PDF, JPG, PNG.
- Use signed URLs for viewing.
- Store metadata in `payment_proofs`.
- Link proofs to both `payment_id` and `student_id`.

## Receipt PDF Strategy

Use server-side PDF generation with academy branding and payment data. Store generated receipts in private storage when feasible; otherwise generate on demand from immutable payment data. V1 should prefer stored PDF for stable receipt downloads.

Receipt data:

- Academy logo and name.
- Receipt number.
- Student name.
- Concept and month/year.
- Amount.
- Payment method.
- Payment date.
- User who received payment.
- Notes.

## Report Export Strategy

- Build reports as typed server-side row arrays.
- Use CSV as the required V1 export.
- Use current filters for export.
- Keep export actions permission-gated.
- Add Excel only if core flows are complete.

## Security

- Login required for all app routes except `/login`.
- Server-side validations on every mutation.
- RLS enabled on all domain tables.
- Private storage buckets for proofs and receipts.
- No public access to minors' data.
- No physical payment deletion.
- Audit logs for payment creation, payment cancellation, enrollment changes, and sensitive settings changes.

## Folder Structure

```txt
src/
  app/
    login/
    dashboard/
    alumnas/
    tutores/
    grados/
    grupos/
    horarios/
    pagos/
    adeudos/
    reportes/
    configuracion/
  components/
    ui/
    layout/
    forms/
    tables/
    dashboard/
    reports/
  lib/
    supabase/
    validations/
    utils/
    pdf/
    storage/
  server/
    actions/
    queries/
    permissions/
  types/
supabase/
  migrations/
  seed.sql
```

## Completion Criteria

The MVP is complete when users can:

- Log in as admin or secretary.
- Register students.
- Register guardians.
- Link students and guardians.
- Create grades, groups, and schedules.
- Enroll each student in one active group.
- Generate monthly charges.
- Register complete and partial payments.
- Upload payment proofs.
- Cancel payments with traceability.
- Generate PDF receipts.
- Consult debts.
- See administrative balance.
- View basic reports.
- Export reports.
- Use the app in production.

## Open Decisions Before Implementation

- Exact academy name, logo, and brand colors.
- Student folio format.
- Receipt number format.
- Whether monthly charge generation is admin-only or also secretary-accessible.
- Whether Excel export is required in V1 or CSV is enough.
