import { GradeForm } from "@/components/forms/grade-form";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/utils/money";
import { updateGradeStatusAction } from "@/server/actions/grades";
import { getGrades } from "@/server/queries/grades";

export default async function GradesPage() {
  const grades = await getGrades();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grados"
        description="Niveles, mensualidad base y estado académico."
      />

      <section className="rounded-lg border border-border bg-background p-5">
        <h2 className="mb-4 text-base font-semibold">Nuevo grado</h2>
        <GradeForm />
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Edad sugerida</th>
              <th className="px-4 py-3">Mensualidad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td className="px-4 py-3 font-medium text-foreground">{grade.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {grade.suggested_min_age ?? "-"} a {grade.suggested_max_age ?? "-"}
                </td>
                <td className="px-4 py-3">{formatCurrency(grade.base_monthly_fee)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                    {grade.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={updateGradeStatusAction}>
                    <input name="id" type="hidden" value={grade.id} />
                    <input
                      name="status"
                      type="hidden"
                      value={grade.status === "active" ? "inactive" : "active"}
                    />
                    <button className="btn-secondary" type="submit">
                      {grade.status === "active" ? "Inactivar" : "Activar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {grades.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                  No hay grados registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
