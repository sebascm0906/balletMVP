import type { UserRole } from "@/types/database";

type RoleGuardProps = {
  role: UserRole;
  allowed: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGuard({
  role,
  allowed,
  children,
  fallback = null,
}: RoleGuardProps) {
  if (!allowed.includes(role)) {
    return fallback;
  }

  return children;
}
