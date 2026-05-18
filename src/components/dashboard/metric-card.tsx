type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
        {value}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{detail}</div>
    </div>
  );
}
