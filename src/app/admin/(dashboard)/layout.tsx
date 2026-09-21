import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSession } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // L'administration est authentifiée et dépend de la base : jamais de prérendu
  // au build, même si les variables d'environnement Supabase y sont absentes.
  await connection();

  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    redirect("/admin/login");
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
