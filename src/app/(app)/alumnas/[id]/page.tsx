import { notFound } from "next/navigation";

import { LinkGuardianForm } from "@/components/forms/link-guardian-form";
import { PageHeader } from "@/components/layout/page-header";
import { activateStudentAction, deactivateStudentAction } from "@/server/actions/students";
import { getGuardians } from "@/server/queries/guardians";
import { getStudentProfile } from "@/server/queries/students";
import { calculateAge } from "@/lib/utils/dates";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, guardians] = await Promise.all([
    getStudentProfile(id),
    getGuardians(),
  ]);

  if (!profile) {
    notFound();
  }

  const { student, guardianLinks, enrollments } = profile;

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.full_name}
        description={`${student.folio} · ${calculateAge(student.birth_date)} años`}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Estado" value={student.status} />
        <InfoCard label="Ingreso" value={student.joined_at} />
        <InfoCard label="Teléfono" value={student.phone ?? "-"} />
      </section>

      <section className="rounded-lg border border-border bg-background p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Tutores relacionados</h2>
        </div>
        <div className="mb-5 space-y-2">
          {guardianLinks.map((link) => {
            const guardian = Array.isArray(link.guardians) ? link.guardians[0] : link.guardians;
            return (
              <div key={link.id} className="rounded-md border border-border p-3 text-sm">
                <div className="font-medium">{guardian?.full_name ?? "Tutor"}</div>
                <div className="text-muted-foreground">
                  {link.relationship} · {guardian?.phone ?? "Sin teléfono"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {link.is_primary ? "Principal" : null}
                  {link.is_primary && link.is_emergency_contact ? " · " : null}
                  {link.is_emergency_contact ? "Emergencia" : null}
                </div>
              </div>
            );
          })}
          {guardianLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin tutores relacionados.</p>
          ) : null}
        </div>
        <LinkGuardianForm studentId={student.id} guardians={guardians} />
      </section>

      <section className="rounded-lg border border-border bg-background p-5">
        <h2 className="mb-3 text-base font-semibold">Inscripciones</h2>
        {enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay historial de inscripciones.
          </p>
        ) : (
          <div className="space-y-2">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-md border border-border p-3 text-sm">
                {enrollment.status} · {enrollment.starts_on}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-background p-5">
        <h2 className="mb-3 text-base font-semibold">Estado de alumna</h2>
        {student.status === "active" ? (
          <form action={deactivateStudentAction} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
            <input name="studentId" type="hidden" value={student.id} />
            <input className="form-input" name="leftAt" type="date" required />
            <input className="form-input" name="leftReason" placeholder="Motivo de baja" required />
            <button className="btn-secondary" type="submit">
              Inactivar
            </button>
          </form>
        ) : (
          <form action={activateStudentAction}>
            <input name="studentId" type="hidden" value={student.id} />
            <button className="btn-primary" type="submit">
              Activar alumna
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium capitalize">{value}</div>
    </div>
  );
}
