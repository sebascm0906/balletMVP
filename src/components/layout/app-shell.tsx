import type { Database } from "@/types/database";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AppShellProps = {
  children: React.ReactNode;
  profile: Profile;
};

export function AppShell({ children, profile }: AppShellProps) {
  return (
    <div className="min-h-screen bg-muted/40">
      <SidebarNav role={profile.role} />
      <div className="min-h-screen lg:pl-64">
        <Topbar profile={profile} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
