import { AdminAppointmentForm } from "@/components/admin/admin-appointment-form";
import { getCategories } from "@/lib/data-access";

import { createAdminAppointmentAction } from "../../actions";

export default async function NewAdminAppointmentPage() {
  const categories = (await getCategories()).filter((category) => category.isOnline);

  return <AdminAppointmentForm categories={categories} action={createAdminAppointmentAction} />;
}
