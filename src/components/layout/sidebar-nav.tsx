"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  ChartNoAxesCombined,
  Gauge,
  GraduationCap,
  Landmark,
  LayoutGrid,
  Settings,
  Users,
  WalletCards,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/alumnas", label: "Alumnas", icon: GraduationCap },
  { href: "/tutores", label: "Tutores", icon: Users },
  { href: "/grados", label: "Grados", icon: Landmark },
  { href: "/grupos", label: "Grupos", icon: LayoutGrid },
  { href: "/horarios", label: "Horarios", icon: CalendarDays },
  { href: "/pagos", label: "Pagos", icon: Banknote },
  { href: "/adeudos", label: "Adeudos", icon: WalletCards },
  { href: "/reportes", label: "Reportes", icon: ChartNoAxesCombined },
  { href: "/configuracion", label: "Configuración", icon: Settings, adminOnly: true },
];

type SidebarNavProps = {
  role: UserRole;
};

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => !item.adminOnly || role === "admin");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-background lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-5 py-4">
          <Link href="/dashboard" className="block">
            <div className="text-lg font-semibold tracking-normal text-foreground">
              BalletAdmin
            </div>
            <div className="text-xs text-muted-foreground">Administración interna</div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground">
          Datos protegidos por sesión y roles
        </div>
      </div>
    </aside>
  );
}
