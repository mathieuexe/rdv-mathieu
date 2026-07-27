import { getAdminSession } from "@/lib/auth";
import { getAppointmentById, getCategoryById, updateAppointmentStatus } from "@/lib/data-access";
import { sendTransactionalEmail } from "@/lib/email";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return Response.json({ error: "Accès non autorisé." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { reason?: string };
  const reason = body.reason?.trim();

  if (!reason) {
    return Response.json({ error: "Le motif de refus est obligatoire." }, { status: 400 });
  }

  const appointment = await getAppointmentById(id);

  if (!appointment) {
    return Response.json({ error: "Demande introuvable." }, { status: 404 });
  }

  const category = await getCategoryById(appointment.categoryId);
  const updated = await updateAppointmentStatus(id, "refuse", reason);

  await sendTransactionalEmail({
    to: appointment.email,
    subject: "Votre demande de rendez-vous a été refusée",
    html: `
      <h1>Demande refusée</h1>
      <p>Bonjour ${appointment.firstName},</p>
      <p>Votre demande pour <strong>${category?.title ?? "votre rendez-vous"}</strong> n'a pas pu être validée.</p>
      <p>Motif : ${reason}</p>
    `,
  });

  return Response.json({
    success: true,
    status: updated?.status ?? "refuse",
    message: "La demande a été refusée et le client a été notifié si l'email est configuré.",
  });
}
