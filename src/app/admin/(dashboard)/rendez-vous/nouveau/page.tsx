import { AdminAppointmentForm } from "@/components/admin/admin-appointment-form";
import { getCategories, getUserProfiles } from "@/lib/data-access";

import { createAdminAppointmentAction } from "../../actions";

export default async function NewAdminAppointmentPage() {
  const [categories, registeredClients] = await Promise.all([
    getCategories().then((items) => items.filter((category) => category.isOnline)),
    getUserProfiles(),
  ]);

  return <AdminAppointmentForm categories={categories} registeredClients={registeredClients} action={createAdminAppointmentAction} />;
}
