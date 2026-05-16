import { PageHeader } from "@/components/layout/page-header";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen operativo y administrativo de la academia."
      />
      <div className="rounded-lg border border-dashed border-border bg-background p-8 text-sm text-muted-foreground">
        Las métricas del dashboard se conectarán en la fase de reportes.
      </div>
    </div>
  );
}
