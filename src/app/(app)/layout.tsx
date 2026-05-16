import { AppShell } from "@/components/layout/app-shell";
import { requireProfile } from "@/server/queries/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await requireProfile();

  return <AppShell profile={profile}>{children}</AppShell>;
}
