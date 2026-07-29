import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { getUserProfiles } from "@/lib/data-access";

export default async function AdminUsersPage() {
  const users = await getUserProfiles();

  return <AdminUsersTable users={users} />;
}
