import { LogOut, Menu, UserRound } from "lucide-react";

import { logoutAction } from "@/server/actions/auth";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type TopbarProps = {
  profile: Profile;
};

export function Topbar({ profile }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground lg:hidden"
            aria-label="Abrir navegación"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium text-foreground lg:hidden">
            BalletAdmin
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-foreground">{profile.full_name}</div>
            <div className="text-xs capitalize text-muted-foreground">{profile.role}</div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserRound className="h-4 w-4" />
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
