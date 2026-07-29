import { createAppointmentRequest, getCategorySlots } from "@/lib/data-access";
import { sendProvisionalAppointmentEmail } from "@/lib/email";
import { isMaintenanceBypassedForHeaders } from "@/lib/maintenance";
import { formatDateTimeFr } from "@/lib/utils";
import { appointmentRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = appointmentRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
    }

    const initialPayload = await getCategorySlots(parsed.data.categorySlug);

    if (!initialPayload) {
      return Response.json({ error: "Catégorie introuvable." }, { status: 404 });
    }

    const bypassMaintenance = isMaintenanceBypassedForHeaders(request.headers, initialPayload.siteSettings);
    const categoryPayload = bypassMaintenance
      ? await getCategorySlots(parsed.data.categorySlug, { bypassMaintenance: true })
      : initialPayload;

    if (!categoryPayload) {
      return Response.json({ error: "Catégorie introuvable." }, { status: 404 });
    }

    const selectedSlot = categoryPayload.slots.find((slot) => slot.start === parsed.data.startsAt);

    if (!selectedSlot || selectedSlot.isBlocked) {
      return Response.json(
        {
          error: categoryPayload.siteSettings.maintenanceMode
            ? "Le site est actuellement en maintenance."
            : "Le créneau sélectionné n'est plus disponible.",
        },
        { status: categoryPayload.siteSettings.maintenanceMode ? 503 : 409 },
      );
    }

    const result = await createAppointmentRequest(parsed.data);

    await sendProvisionalAppointmentEmail({
      to: result.appointment.email,
      firstName: result.appointment.firstName,
      categoryTitle: result.category.title,
      startsAtLabel: formatDateTimeFr(result.appointment.startsAt, { dateStyle: "full", timeStyle: "short" }),
      appointmentMode: result.category.appointmentMode,
      phone: result.appointment.phone,
      appointmentId: result.appointment.id,
    });

    return Response.json({
      success: true,
      appointmentId: result.appointment.id,
      status: result.appointment.status,
      message: "Votre demande a bien été envoyée.",
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && error.message
            ? error.message
            : "Une erreur serveur est survenue lors de la prise de rendez-vous.",
      },
      { status: 500 },
    );
  }
}
