import { requireRole } from "@/lib/auth/require-role";

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}