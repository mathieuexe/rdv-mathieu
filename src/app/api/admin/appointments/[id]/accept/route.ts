import { getAdminSession } from "@/lib/auth";
import { getAppointmentById, getCategoryById, updateAppointmentStatus } from "@/lib/data-access";
import { sendTransactionalEmail } from "@/lib/email";

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

  await sendTransactionalEmail({
    to: appointment.email,
    subject: "Votre rendez-vous est confirmé",
    html: `
      <h1>Rendez-vous confirmé</h1>
      <p>Bonjour ${appointment.firstName},</p>
      <p>Votre demande pour <strong>${category?.title ?? "votre rendez-vous"}</strong> a été acceptée.</p>
      <p>Date : ${new Date(appointment.startsAt).toLocaleString("fr-FR")}</p>
    `,
  });

  return Response.json({
    success: true,
    status: updated?.status ?? "accepte",
    message: "La demande a été acceptée et le client a été notifié si l'email est configuré.",
  });
}
