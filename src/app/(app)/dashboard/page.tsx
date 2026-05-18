import { ClassesTodayList } from "@/components/dashboard/classes-today-list";
import { MetricCard } from "@/components/dashboard/metric-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { PageHeader } from "@/components/layout/page-header";
import { paymentMethodLabels } from "@/lib/utils/format";
import { formatCurrency } from "@/lib/utils/money";
import { getDashboardSummary } from "@/server/queries/dashboard";

export default async function DashboardPage() {
  const { metrics, month, year, classesToday } = await getDashboardSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Resumen operativo y administrativo de ${month}/${year}.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Alumnas activas"
          value={String(metrics.activeStudents)}
          detail="Alumnas con estado activo"
        />
        <MetricCard
          label="Grupos activos"
          value={String(metrics.activeGroups)}
          detail="Grupos disponibles para inscripción"
        />
        <MetricCard
          label="Cobrado del mes"
          value={formatCurrency(metrics.monthlyCollected)}
          detail={`${metrics.collectionRate}% de cobranza`}
        />
        <MetricCard
          label="Pendiente del mes"
          value={formatCurrency(metrics.monthlyPending)}
          detail={`${metrics.studentsWithDebt} alumnas con adeudo`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">
            Balance administrativo
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Esperado"
              value={formatCurrency(metrics.monthlyExpected)}
              detail="Cargos generados"
            />
            <MetricCard
              label="Vencido"
              value={formatCurrency(metrics.overdueTotal)}
              detail="Saldo fuera de fecha"
            />
            <MetricCard
              label="Adeudos"
              value={String(metrics.studentsWithDebt)}
              detail="Alumnas con saldo pendiente"
            />
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground">Pagos por método</h3>
            <div className="mt-3 space-y-2">
              {metrics.paymentsByMethod.map((payment) => (
                <div
                  key={payment.method}
                  className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
                >
                  <span>{paymentMethodLabels[payment.method]}</span>
                  <span className="font-medium">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
              {metrics.paymentsByMethod.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay pagos registrados este mes.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <ClassesTodayList classes={classesToday} />
          <QuickActions />
        </div>
      </section>
    </div>
  );
}
