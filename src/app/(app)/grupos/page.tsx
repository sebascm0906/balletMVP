import { GroupForm } from "@/components/forms/group-form";
import { PageHeader } from "@/components/layout/page-header";
import { updateGroupStatusAction } from "@/server/actions/groups";
import { getGrades } from "@/server/queries/grades";
import { getGroups } from "@/server/queries/groups";

export default async function GroupsPage() {
  const [grades, groups] = await Promise.all([getGrades(), getGroups()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grupos"
        description="Clases concretas por grado, maestra, salón y cupo."
      />

      <section className="rounded-lg border border-border bg-background p-5">
        <h2 className="mb-4 text-base font-semibold">Nuevo grupo</h2>
        <GroupForm grades={grades.filter((grade) => grade.status === "active")} />
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3">Grado</th>
              <th className="px-4 py-3">Maestra</th>
              <th className="px-4 py-3">Cupo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {groups.map((group) => (
              <tr key={group.id}>
                <td className="px-4 py-3 font-medium">{group.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{group.grade_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{group.teacher_name ?? "-"}</td>
                <td className="px-4 py-3">
                  {group.active_enrollments}/{group.capacity}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                    {group.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={updateGroupStatusAction}>
                    <input name="id" type="hidden" value={group.id} />
                    <input
                      name="status"
                      type="hidden"
                      value={group.status === "active" ? "inactive" : "active"}
                    />
                    <button className="btn-secondary" type="submit">
                      {group.status === "active" ? "Inactivar" : "Activar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {groups.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                  No hay grupos registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
