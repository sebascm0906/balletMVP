import Link from "next/link";

const actions = [
  { href: "/alumnas/new", label: "Registrar alumna" },
  { href: "/pagos", label: "Registrar pago" },
  { href: "/adeudos", label: "Ver adeudos" },
  { href: "/horarios", label: "Ver horarios" },
  { href: "/alumnas", label: "Buscar alumna" },
];

export function QuickActions() {
  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Accesos rápidos</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <Link key={action.href} className="btn-secondary justify-start" href={action.href}>
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
