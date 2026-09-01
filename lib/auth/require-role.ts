import { TeamRole } from "@/lib/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function requireRole(allowedRoles: TeamRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const membership = user.memberships.find((membership) =>
    allowedRoles.includes(membership.role),
  );

  if (!membership) {
    return null;
  }

  return {
    user,
    membership,
    team: membership.team,
  };
}