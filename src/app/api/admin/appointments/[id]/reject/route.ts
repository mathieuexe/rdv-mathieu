import { getAdminSession } from "@/lib/auth";
import { getAppointmentById, getCategoryById, updateAppointmentStatus } from "@/lib/data-access";
import { sendRefusedAppointmentEmail } from "@/lib/email";
import { formatDateTimeFr } from "@/lib/utils";

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

  await sendRefusedAppointmentEmail({
    to: appointment.email,
    firstName: appointment.firstName,
    categoryTitle: category?.title ?? "Votre rendez-vous",
    startsAtLabel: formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" }),
    reason,
    appointmentId: appointment.id,
  });

  return Response.json({
    success: true,
    status: updated?.status ?? "refuse",
    message: "La demande a été refusée et le client a été notifié si l'email est configuré.",
  });
}
