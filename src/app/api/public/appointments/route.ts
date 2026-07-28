import { createAppointmentRequest, getCategorySlots } from "@/lib/data-access";
import { sendTransactionalEmail } from "@/lib/email";
import { formatDateTimeFr } from "@/lib/utils";
import { appointmentRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = appointmentRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }

  const categoryPayload = await getCategorySlots(parsed.data.categorySlug);

  if (!categoryPayload) {
    return Response.json({ error: "Catégorie introuvable." }, { status: 404 });
  }

  const selectedSlot = categoryPayload.slots.find((slot) => slot.start === parsed.data.startsAt);

  if (!selectedSlot || selectedSlot.isBlocked) {
    return Response.json({ error: "Le créneau sélectionné n'est plus disponible." }, { status: 409 });
  }

  const result = await createAppointmentRequest(parsed.data);

  await sendTransactionalEmail({
    to: result.appointment.email,
    subject: "Votre demande de rendez-vous est en attente",
    html: `
      <h1>Demande enregistrée</h1>
      <p>Bonjour ${result.appointment.firstName},</p>
      <p>Votre demande pour <strong>${result.category.title}</strong> a bien été enregistrée.</p>
      <p>Créneau demandé : ${formatDateTimeFr(result.appointment.startsAt, { dateStyle: "full", timeStyle: "short" })}</p>
      <p>Statut actuel : en attente de validation administrateur.</p>
    `,
  });

  return Response.json({
    success: true,
    appointmentId: result.appointment.id,
    status: result.appointment.status,
    message: "Votre demande a bien été envoyée.",
  });
}
