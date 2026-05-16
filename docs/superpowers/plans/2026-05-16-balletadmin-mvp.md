# BalletAdmin MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-usable internal admin MVP for a single ballet academy covering students, guardians, classes, enrollments, monthly charges, payments, proofs, PDF receipts, debts, reports, and balance.

**Architecture:** Use Next.js App Router with Server Components for reads, Server Actions for mutations, Supabase Auth/Postgres/Storage for backend services, Zod + React Hook Form for validation, and shadcn/ui + Tailwind for a desktop-first administrative UI.

**Tech Stack:** Next.js, TypeScript, Supabase, PostgreSQL, Tailwind CSS, shadcn/ui, Zod, React Hook Form, PDF generation library, CSV export, Vercel.

---

## Pre-Implementation Notes

- Workspace starts empty and is not currently a Git repository.
- Do not implement out-of-scope modules: parent portal, online payments, WhatsApp automation, attendance, fiscal invoicing, payroll, daily cash closing, multi-branch, imports, or historical migration.
- The approved V1 business assumptions are: optional enrollment fee, due day default 10, partial payments allowed, manual/idempotent monthly charge generation, CSV reports required, PDF receipts required.

## Task 1: Bootstrap Project

**Files:**

- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] Initialize Git repository.
- [ ] Scaffold Next.js App Router TypeScript project in the current directory.
- [ ] Install Tailwind CSS and shadcn/ui prerequisites.
- [ ] Install application dependencies: Supabase SSR/client packages, Zod, React Hook Form, resolver package, date utility, CSV helper, PDF library.
- [ ] Configure Tailwind and global CSS.
- [ ] Configure shadcn/ui.
- [ ] Add `.env.example` with Supabase URL and anon key placeholders.
- [ ] Run `npm run lint` or the generated equivalent.
- [ ] Commit with message `chore: bootstrap balletadmin`.

## Task 2: Supabase Foundation

**Files:**

- Create: `supabase/migrations/0001_initial_schema.sql`
- Create: `supabase/seed.sql`
- Create: `src/types/database.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`

- [ ] Write SQL migration for all approved tables.
- [ ] Add constraints, check constraints, foreign keys, partial unique indexes, and basic indexes.
- [ ] Enable RLS on all domain tables.
- [ ] Add policies for authenticated users, with stricter admin-only writes where needed.
- [ ] Add storage bucket setup notes or SQL for private `payment-proofs` and `receipts`.
- [ ] Add seed for default `app_settings`.
- [ ] Add typed Supabase client helpers.
- [ ] Generate or hand-maintain initial TypeScript DB types.
- [ ] Run migration locally or document the Supabase SQL editor execution path if local Supabase is unavailable.
- [ ] Commit with message `feat: add supabase schema`.

## Task 3: Auth, Profiles, and Route Protection

**Files:**

- Create: `middleware.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/login-form.tsx`
- Create: `src/server/queries/auth.ts`
- Create: `src/server/permissions/roles.ts`
- Create: `src/server/actions/auth.ts`
- Modify: `src/app/layout.tsx`

- [ ] Create login form with email and password.
- [ ] Implement Supabase sign-in Server Action or client auth flow.
- [ ] Add middleware route protection for all private routes.
- [ ] Redirect authenticated users away from `/login`.
- [ ] Implement `getCurrentProfile`.
- [ ] Implement `requireUser`.
- [ ] Implement `requireRole`.
- [ ] Add basic logout control in app shell later if shell exists.
- [ ] Test unauthenticated redirect.
- [ ] Test authenticated access.
- [ ] Commit with message `feat: add auth and route protection`.

## Task 4: App Shell and Navigation

**Files:**

- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/layout/sidebar-nav.tsx`
- Create: `src/components/layout/topbar.tsx`
- Create: `src/components/layout/role-guard.tsx`
- Create: `src/components/layout/page-header.tsx`
- Modify: private route layouts as needed.

- [ ] Build desktop-first shell with sidebar navigation.
- [ ] Include routes for dashboard, alumnas, tutores, grados, grupos, horarios, pagos, adeudos, reportes, configuración.
- [ ] Hide admin-only configuration/user controls from secretary where appropriate.
- [ ] Add responsive fallback navigation for tablet/mobile.
- [ ] Keep UI utilitarian and dense enough for administrative work.
- [ ] Commit with message `feat: add app shell`.

## Task 5: Shared Validation and Formatting

**Files:**

- Create: `src/lib/validations/student.ts`
- Create: `src/lib/validations/guardian.ts`
- Create: `src/lib/validations/grade.ts`
- Create: `src/lib/validations/group.ts`
- Create: `src/lib/validations/schedule.ts`
- Create: `src/lib/validations/enrollment.ts`
- Create: `src/lib/validations/payment.ts`
- Create: `src/lib/validations/settings.ts`
- Create: `src/lib/utils/format.ts`
- Create: `src/lib/utils/dates.ts`
- Create: `src/lib/utils/money.ts`

- [ ] Add Zod schemas for each form.
- [ ] Add money formatting helper.
- [ ] Add age calculation helper from birth date.
- [ ] Add date/month labels in Spanish.
- [ ] Add payment status and charge status label helpers.
- [ ] Add unit tests if the project test stack is installed; otherwise keep helpers pure and verify manually during feature tasks.
- [ ] Commit with message `feat: add validation schemas`.

## Task 6: Grades, Groups, and Schedules

**Files:**

- Create: `src/app/grados/page.tsx`
- Create: `src/app/grupos/page.tsx`
- Create: `src/app/horarios/page.tsx`
- Create: `src/components/forms/grade-form.tsx`
- Create: `src/components/forms/group-form.tsx`
- Create: `src/components/forms/schedule-form.tsx`
- Create: `src/server/actions/grades.ts`
- Create: `src/server/actions/groups.ts`
- Create: `src/server/actions/schedules.ts`
- Create: `src/server/queries/grades.ts`
- Create: `src/server/queries/groups.ts`
- Create: `src/server/queries/schedules.ts`

- [ ] Implement grade list, create, edit, activate, and inactivate.
- [ ] Implement group list, create, edit, activate, and inactivate.
- [ ] Show grade relationship on groups.
- [ ] Show group capacity and current active enrollment count.
- [ ] Implement schedule list by day and group.
- [ ] Implement schedule create/edit/inactivate.
- [ ] Validate end time is after start time.
- [ ] Commit with message `feat: manage classes and schedules`.

## Task 7: Students and Guardians

**Files:**

- Create: `src/app/alumnas/page.tsx`
- Create: `src/app/alumnas/new/page.tsx`
- Create: `src/app/alumnas/[id]/page.tsx`
- Create: `src/app/alumnas/[id]/edit/page.tsx`
- Create: `src/app/tutores/page.tsx`
- Create: `src/components/forms/student-form.tsx`
- Create: `src/components/forms/guardian-form.tsx`
- Create: `src/components/forms/link-guardian-form.tsx`
- Create: `src/server/actions/students.ts`
- Create: `src/server/actions/guardians.ts`
- Create: `src/server/queries/students.ts`
- Create: `src/server/queries/guardians.ts`

- [ ] Implement automatic student folio generation.
- [ ] Implement student create/edit.
- [ ] Implement activate/inactivate with date and reason.
- [ ] Implement guardian create/edit.
- [ ] Implement student-guardian linking.
- [ ] Enforce phone required for guardian.
- [ ] Enforce one primary guardian per student.
- [ ] Build student profile sections for general info, guardians, current group placeholder, charges placeholder, and payments placeholder.
- [ ] Commit with message `feat: manage students and guardians`.

## Task 8: Enrollments

**Files:**

- Create: `src/components/forms/enrollment-form.tsx`
- Create: `src/components/students/current-enrollment-card.tsx`
- Create: `src/components/students/enrollment-history.tsx`
- Create: `src/server/actions/enrollments.ts`
- Create: `src/server/queries/enrollments.ts`
- Modify: `src/app/alumnas/[id]/page.tsx`
- Modify: `src/app/grupos/page.tsx`

- [ ] Implement enroll student action.
- [ ] Validate student is active.
- [ ] Validate group is active.
- [ ] Validate group has capacity.
- [ ] Validate student has no active enrollment.
- [ ] Calculate final monthly fee from assigned fee and discount.
- [ ] Implement change group by finishing previous enrollment and creating a new one.
- [ ] Show current enrollment on student profile.
- [ ] Show enrollment history on student profile.
- [ ] Commit with message `feat: add student enrollments`.

## Task 9: Charges and Debts

**Files:**

- Create: `src/server/actions/charges.ts`
- Create: `src/server/queries/charges.ts`
- Create: `src/app/adeudos/page.tsx`
- Create: `src/components/reports/debts-table.tsx`
- Create: `src/components/forms/generate-charges-form.tsx`
- Modify: `src/app/alumnas/[id]/page.tsx`

- [ ] Implement idempotent `generateMonthlyCharges`.
- [ ] Use `app_settings.payment_due_day`.
- [ ] Generate charges from active enrollments.
- [ ] Mark zero-amount charges as `becada`.
- [ ] Avoid duplicate monthly charges.
- [ ] Compute effective status as `vencido` in debt queries when due date has passed and balance remains.
- [ ] Build debts page with filters: month, year, student, grade, group, status.
- [ ] Show primary guardian and phone in debts table.
- [ ] Show charges/debts on student profile.
- [ ] Commit with message `feat: generate charges and debts`.

## Task 10: Payments and Cancellation

**Files:**

- Create: `src/app/pagos/page.tsx`
- Create: `src/components/forms/payment-form.tsx`
- Create: `src/components/payments/cancel-payment-dialog.tsx`
- Create: `src/components/payments/payments-table.tsx`
- Create: `src/server/actions/payments.ts`
- Create: `src/server/queries/payments.ts`
- Create: `src/server/actions/audit.ts`
- Modify: `src/app/alumnas/[id]/page.tsx`

- [ ] Implement payment registration against a charge.
- [ ] Allow partial payment if amount is less than remaining balance.
- [ ] Reject amount greater than remaining balance.
- [ ] Generate unique receipt number.
- [ ] Recalculate `charges.amount_paid` from active payments.
- [ ] Update charge status after payment.
- [ ] Implement payment cancellation with required reason.
- [ ] Preserve original payment row.
- [ ] Set `cancelled_by`, `cancelled_at`, and `cancellation_reason`.
- [ ] Recalculate charge status after cancellation.
- [ ] Write audit logs for payment registration and cancellation.
- [ ] Show payments by student, month, and method.
- [ ] Commit with message `feat: add payment lifecycle`.

## Task 11: Payment Proof Uploads

**Files:**

- Create: `src/components/payments/payment-proof-uploader.tsx`
- Create: `src/server/actions/payment-proofs.ts`
- Create: `src/server/queries/payment-proofs.ts`
- Create: `src/lib/storage/payment-proofs.ts`
- Modify: `src/app/pagos/page.tsx`
- Modify: `src/app/alumnas/[id]/page.tsx`

- [ ] Validate file type PDF, JPG, or PNG.
- [ ] Validate file size limit.
- [ ] Upload to private Supabase Storage bucket.
- [ ] Insert `payment_proofs` metadata.
- [ ] Display proofs from payment table and student profile.
- [ ] Use signed URLs for viewing/downloading.
- [ ] Commit with message `feat: upload payment proofs`.

## Task 12: Receipt PDFs

**Files:**

- Create: `src/lib/pdf/receipt.ts`
- Create: `src/server/actions/receipts.ts`
- Create: `src/server/queries/receipts.ts`
- Create: `src/components/payments/receipt-download-button.tsx`
- Modify: `src/server/actions/payments.ts`
- Modify: `src/app/alumnas/[id]/page.tsx`

- [ ] Choose and install PDF generation package.
- [ ] Implement receipt PDF generation with academy branding.
- [ ] Include receipt number, student, concept, month/year, amount, method, date, registering user, and notes.
- [ ] Store receipt PDF in private storage or generate from immutable data on demand.
- [ ] Add download button from payment history and student profile.
- [ ] Ensure cancelled payments remain visible but do not present as valid active receipts without status context.
- [ ] Commit with message `feat: generate payment receipts`.

## Task 13: Dashboard

**Files:**

- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/dashboard/metric-card.tsx`
- Create: `src/components/dashboard/classes-today-list.tsx`
- Create: `src/components/dashboard/quick-actions.tsx`
- Create: `src/server/queries/dashboard.ts`

- [ ] Show active student count.
- [ ] Show active group count.
- [ ] Show current month received payments.
- [ ] Show current month pending amount.
- [ ] Show students with debt.
- [ ] Show classes for current day.
- [ ] Add quick actions for student, payment, debts, schedules, and search.
- [ ] Commit with message `feat: add dashboard`.

## Task 14: Reports and Exports

**Files:**

- Create: `src/app/reportes/page.tsx`
- Create: `src/components/reports/report-filters.tsx`
- Create: `src/components/reports/balance-report.tsx`
- Create: `src/components/reports/report-export-button.tsx`
- Create: `src/server/queries/reports.ts`
- Create: `src/server/actions/reports.ts`
- Create: `src/lib/utils/csv.ts`

- [ ] Implement general administrative balance filters: month, year, grade, group.
- [ ] Show total active/inactive students.
- [ ] Show active groups.
- [ ] Show expected, collected, pending, and overdue totals.
- [ ] Show students with debt.
- [ ] Show collection percentage.
- [ ] Show payments by method.
- [ ] Show groups with higher debt and better compliance.
- [ ] Show group capacity availability.
- [ ] Implement reports for monthly payments, debts, groups, students, capacity, and payment methods.
- [ ] Implement CSV export using current filters.
- [ ] Commit with message `feat: add reports and exports`.

## Task 15: Configuration and Admin Users

**Files:**

- Create: `src/app/configuracion/page.tsx`
- Create: `src/components/forms/settings-form.tsx`
- Create: `src/components/forms/internal-user-form.tsx`
- Create: `src/server/actions/settings.ts`
- Create: `src/server/actions/profiles.ts`
- Create: `src/server/queries/settings.ts`
- Create: `src/server/queries/profiles.ts`

- [ ] Implement academy name, colors, logo path, payment due day, enrollment fee settings, receipt prefix, and folio prefix.
- [ ] Restrict settings to admin.
- [ ] Implement internal user list.
- [ ] Implement user role/status management if Supabase permissions allow; otherwise document manual invite flow for V1.
- [ ] Commit with message `feat: add admin configuration`.

## Task 16: Security Hardening

**Files:**

- Modify: `supabase/migrations/0001_initial_schema.sql`
- Modify: all server actions as needed.
- Create: `docs/security.md`

- [ ] Review every Server Action for server-side Zod validation.
- [ ] Review every Server Action for `requireUser` or `requireRole`.
- [ ] Review RLS policies against role requirements.
- [ ] Confirm secretary can cancel payments.
- [ ] Confirm secretary cannot edit settings or manage users.
- [ ] Confirm no unauthenticated route exposes private data.
- [ ] Confirm private storage buckets are not public.
- [ ] Document security posture and operational setup.
- [ ] Commit with message `chore: harden security`.

## Task 17: Production Readiness

**Files:**

- Create: `README.md`
- Create: `docs/deployment.md`
- Modify: `.env.example`
- Modify: package scripts as needed.

- [ ] Document setup steps.
- [ ] Document Supabase project setup.
- [ ] Document required environment variables.
- [ ] Document migration execution.
- [ ] Document seed/admin creation.
- [ ] Document Vercel deployment.
- [ ] Run lint.
- [ ] Run build.
- [ ] Run a manual QA script for core MVP flows.
- [ ] Commit with message `docs: add setup and deployment guide`.

## Manual QA Checklist

- [ ] Admin can log in.
- [ ] Secretary can log in.
- [ ] Unauthenticated user is redirected to `/login`.
- [ ] Admin can access configuration.
- [ ] Secretary cannot access admin-only configuration.
- [ ] Student can be created, edited, activated, and inactivated.
- [ ] Guardian can be created and linked to student.
- [ ] Primary guardian works.
- [ ] Grade can be created.
- [ ] Group can be created with capacity.
- [ ] Schedule can be created for group.
- [ ] Student can be enrolled in one active group.
- [ ] Second active enrollment is rejected.
- [ ] Full group rejects new enrollment.
- [ ] Monthly charges generate once and do not duplicate.
- [ ] Debts page shows unpaid charges.
- [ ] Payment can be registered.
- [ ] Partial payment sets charge to `parcial`.
- [ ] Full payment sets charge to `pagado`.
- [ ] Payment cancellation requires reason.
- [ ] Cancelled payment remains in history.
- [ ] Charge recalculates after cancellation.
- [ ] Payment proof upload accepts PDF/JPG/PNG.
- [ ] Receipt PDF downloads.
- [ ] Dashboard metrics match seed/manual data.
- [ ] Balance report computes expected, collected, pending, overdue, and collection percentage.
- [ ] CSV exports use current filters.

## Implementation Stop Conditions

Stop and ask for direction if:

- Supabase Auth admin-user creation requires service role access not available in the local environment.
- The academy requires Excel exports as mandatory before CSV reports are complete.
- Receipt layout/branding requires exact assets that have not been provided.
- Production deployment credentials are unavailable.

## Recommended Execution Order

Implement tasks in order. Each task should leave the app runnable or closer to runnable, with no half-built unrelated features. Prioritize correctness in payment, charge, role, and audit logic over visual flourish.
