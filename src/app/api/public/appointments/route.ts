import { createAppointmentRequest, getCategorySlots } from "@/lib/data-access";
import { sendProvisionalAppointmentEmail } from "@/lib/email";
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

  await sendProvisionalAppointmentEmail({
    to: result.appointment.email,
    firstName: result.appointment.firstName,
    categoryTitle: result.category.title,
    startsAtLabel: formatDateTimeFr(result.appointment.startsAt, { dateStyle: "full", timeStyle: "short" }),
    appointmentId: result.appointment.id,
  });

  return Response.json({
    success: true,
    appointmentId: result.appointment.id,
    status: result.appointment.status,
    message: "Votre demande a bien été envoyée.",
  });
}
