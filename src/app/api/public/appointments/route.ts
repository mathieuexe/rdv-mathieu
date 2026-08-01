import { createAppointmentRequest, getCategorySlots } from "@/lib/data-access";
import { extractClientContextFromHeaders } from "@/lib/account-activity";
import { createAccountActivityLog } from "@/lib/data-access";
import { getPublicUserSession } from "@/lib/auth";
import { sendAdminAppointmentRequestNotificationEmail, sendProvisionalAppointmentEmail } from "@/lib/email";
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

    const session = await getPublicUserSession();
    
    let customFieldResponses = {};
    if (parsed.data.customFieldResponsesJson) {
      try {
        customFieldResponses = JSON.parse(parsed.data.customFieldResponsesJson);
      } catch (e) {}
    }

    const result = await createAppointmentRequest({
      ...parsed.data,
      customFieldResponses
    }, {
      requestedByUserId:
        session.isAuthenticated && session.userId && session.email === parsed.data.email.toLowerCase() ? session.userId : undefined,
    });
    const startsAtLabel = formatDateTimeFr(result.appointment.startsAt, { dateStyle: "full", timeStyle: "short" });

    await sendProvisionalAppointmentEmail({
      to: result.appointment.email,
      firstName: result.appointment.firstName,
      categoryTitle: result.category.title,
      startsAtLabel,
      appointmentMode: result.category.appointmentMode,
      phone: result.appointment.phone,
      appointmentId: result.appointment.id,
    });

    await sendAdminAppointmentRequestNotificationEmail({
      firstName: result.appointment.firstName,
      lastName: result.appointment.lastName,
      clientEmail: result.appointment.email,
      clientPhone: result.appointment.phone,
      clientMessage: result.appointment.clientMessage,
      categoryTitle: result.category.title,
      startsAtLabel,
      appointmentMode: result.category.appointmentMode,
      appointmentId: result.appointment.id,
    });

    if (result.requestedByUserId) {
      const clientContext = extractClientContextFromHeaders(request.headers);

      await createAccountActivityLog({
        userId: result.requestedByUserId,
        actionType: "prise_rendez_vous",
        actionLabel: "Prise de rendez-vous",
        description: `Demande de rendez-vous pour ${result.category.title} le ${formatDateTimeFr(result.appointment.startsAt, {
          dateStyle: "full",
          timeStyle: "short",
        })}.`,
        appointmentId: result.appointment.id,
        ipAddress: clientContext.ipAddress,
        country: clientContext.country,
        region: clientContext.region,
        city: clientContext.city,
        deviceType: clientContext.deviceType,
        operatingSystem: clientContext.operatingSystem,
        browser: clientContext.browser,
        userAgent: clientContext.userAgent,
        metadata: {
          categoryTitle: result.category.title,
          appointmentMode: result.category.appointmentMode,
        },
      });
    }

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
