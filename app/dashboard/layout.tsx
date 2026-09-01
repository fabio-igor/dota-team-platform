import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";

const navigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Jogadores", href: "/dashboard/players" },
  { label: "Heróis", href: "/dashboard/heroes" },
  { label: "Partidas", href: "/dashboard/matches" },
  { label: "Draft", href: "/dashboard/draft" },
  { label: "Treinos", href: "/dashboard/training" },
  { label: "Relatórios", href: "/dashboard/reports" },
];

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const membership = user.memberships[0];

  if (!membership) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Dota Team Platform
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              {membership.team.name}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {membership.role}
            </p>
          </div>

          <nav className="space-y-1 p-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-8">
            <div>
              <p className="text-sm text-zinc-400">
                Ambiente competitivo
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium">
                {user.name}
              </p>

              <p className="text-xs text-zinc-500">
                {user.email}
              </p>
            </div>
          </header>

          <div className="flex-1 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}