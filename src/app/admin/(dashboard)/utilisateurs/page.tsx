import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { getUserProfiles } from "@/lib/data-access";

export default async function AdminUsersPage() {
  const users = await getUserProfiles();

  return (
    <div className="adm-page">
      <section className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Dossiers clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Recherchez et gérez les utilisateurs de la plateforme.
          </p>
        </div>
      </section>

      <section className="adm-card">
        <div className="p-0">
          <AdminUsersTable users={users} />
        </div>
      </section>
    </div>
  );
}
