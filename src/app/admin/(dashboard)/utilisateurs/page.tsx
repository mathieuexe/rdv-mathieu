import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { getUserProfiles } from "@/lib/data-access";

export default async function AdminUsersPage() {
  const users = await getUserProfiles();

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dossiers clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Recherchez et gérez les utilisateurs de la plateforme.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="p-0">
          <AdminUsersTable users={users} />
        </div>
      </section>
    </div>
  );
}
