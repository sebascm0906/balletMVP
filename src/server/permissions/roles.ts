import type { UserRole } from "@/types/database";

export const ADMIN_ROLE: UserRole = "admin";
export const SECRETARY_ROLE: UserRole = "secretaria";
export const STAFF_ROLES: UserRole[] = [ADMIN_ROLE, SECRETARY_ROLE];

export function canManageSettings(role: UserRole) {
  return role === ADMIN_ROLE;
}

export function canCancelPayments(role: UserRole) {
  return role === ADMIN_ROLE || role === SECRETARY_ROLE;
}
