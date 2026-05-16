import { ScheduleForm, getWeekdayLabel } from "@/components/forms/schedule-form";
import { PageHeader } from "@/components/layout/page-header";
import { updateGroupScheduleStatusAction } from "@/server/actions/schedules";
import { getGroups } from "@/server/queries/groups";
import { getSchedules } from "@/server/queries/schedules";

export default async function SchedulesPage() {
  const [groups, schedules] = await Promise.all([getGroups(), getSchedules()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horarios"
        description="Vista semanal y horarios activos por grupo."
      />

      <section className="rounded-lg border border-border bg-background p-5">
        <h2 className="mb-4 text-base font-semibold">Nuevo horario</h2>
        <ScheduleForm groups={groups.filter((group) => group.status === "active")} />
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Día</th>
              <th className="px-4 py-3">Horario</th>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3">Grado</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="px-4 py-3 font-medium">{getWeekdayLabel(schedule.weekday)}</td>
                <td className="px-4 py-3">
                  {schedule.starts_at.slice(0, 5)} - {schedule.ends_at.slice(0, 5)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{schedule.group_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{schedule.grade_name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                    {schedule.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={updateGroupScheduleStatusAction}>
                    <input name="id" type="hidden" value={schedule.id} />
                    <input
                      name="status"
                      type="hidden"
                      value={schedule.status === "active" ? "inactive" : "active"}
                    />
                    <button className="btn-secondary" type="submit">
                      {schedule.status === "active" ? "Inactivar" : "Activar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {schedules.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                  No hay horarios registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
