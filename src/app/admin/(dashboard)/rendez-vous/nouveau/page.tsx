import { AdminAppointmentForm } from "@/components/admin/admin-appointment-form";
import { isCategoryReachable } from "@/lib/booking";
import { getCategories, getUserProfiles } from "@/lib/data-access";

import { createAdminAppointmentAction } from "../../actions";

export default async function NewAdminAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [categories, registeredClients] = await Promise.all([
    // Tous les calendriers réservables : publics et privés (accessibles par lien).
    getCategories().then((items) => items.filter(isCategoryReachable)),
    getUserProfiles(),
  ]);

  return (
    <AdminAppointmentForm
      categories={categories}
      registeredClients={registeredClients}
      action={createAdminAppointmentAction}
      errorMessage={error}
    />
  );
}
