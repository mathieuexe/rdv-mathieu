import { getAdminSession } from "@/lib/auth";
import { getAppointmentById, getCategoryById, updateAppointmentStatus } from "@/lib/data-access";
import { sendValidatedAppointmentEmail } from "@/lib/email";
import { formatDateTimeFr } from "@/lib/utils";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return Response.json({ error: "Accès non autorisé." }, { status: 401 });
  }

  const { id } = await context.params;
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    return Response.json({ error: "Demande introuvable." }, { status: 404 });
  }

  const category = await getCategoryById(appointment.categoryId);
  const updated = await updateAppointmentStatus(id, "accepte");

  await sendValidatedAppointmentEmail({
    to: appointment.email,
    firstName: appointment.firstName,
    categoryTitle: category?.title ?? "Votre rendez-vous",
    startsAtLabel: formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" }),
    appointmentMode: category?.appointmentMode ?? "visioconference",
    phone: appointment.phone,
    appointmentId: appointment.id,
  });

  return Response.json({
    success: true,
    status: updated?.status ?? "accepte",
    message: "La demande a été acceptée et le client a été notifié si l'email est configuré.",
  });
}
