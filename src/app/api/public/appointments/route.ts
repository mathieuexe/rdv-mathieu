import { createAppointmentRequest, getCategorySlots } from "@/lib/data-access";
import { sendProvisionalAppointmentEmail } from "@/lib/email";
import { formatDateTimeFr } from "@/lib/utils";
import { appointmentRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    // #region debug-point D:route-entry
    fetch("http://127.0.0.1:7781/event",{method:"POST",body:JSON.stringify({sessionId:"appointment-api-500",runId:"pre-fix",hypothesisId:"D",location:"src/app/api/public/appointments/route.ts:8",msg:"[DEBUG] route entry",data:{hasCategorySlug:typeof payload?.categorySlug==="string",hasStartsAt:typeof payload?.startsAt==="string",hasEmail:typeof payload?.email==="string"},ts:Date.now()})}).catch(()=>{});
    // #endregion
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

    // #region debug-point E:before-create
    fetch("http://127.0.0.1:7781/event",{method:"POST",body:JSON.stringify({sessionId:"appointment-api-500",runId:"pre-fix",hypothesisId:"E",location:"src/app/api/public/appointments/route.ts:29",msg:"[DEBUG] before createAppointmentRequest",data:{categorySlug:parsed.data.categorySlug,startsAt:parsed.data.startsAt},ts:Date.now()})}).catch(()=>{});
    // #endregion
    const result = await createAppointmentRequest(parsed.data);

    // #region debug-point E:before-email
    fetch("http://127.0.0.1:7781/event",{method:"POST",body:JSON.stringify({sessionId:"appointment-api-500",runId:"pre-fix",hypothesisId:"E",location:"src/app/api/public/appointments/route.ts:33",msg:"[DEBUG] before provisional email send",data:{appointmentId:result.appointment.id,email:result.appointment.email,categoryTitle:result.category.title},ts:Date.now()})}).catch(()=>{});
    // #endregion
    await sendProvisionalAppointmentEmail({
      to: result.appointment.email,
      firstName: result.appointment.firstName,
      categoryTitle: result.category.title,
      startsAtLabel: formatDateTimeFr(result.appointment.startsAt, { dateStyle: "full", timeStyle: "short" }),
      appointmentId: result.appointment.id,
    });

    // #region debug-point D:route-success
    fetch("http://127.0.0.1:7781/event",{method:"POST",body:JSON.stringify({sessionId:"appointment-api-500",runId:"pre-fix",hypothesisId:"D",location:"src/app/api/public/appointments/route.ts:41",msg:"[DEBUG] route success response",data:{appointmentId:result.appointment.id,status:result.appointment.status},ts:Date.now()})}).catch(()=>{});
    // #endregion

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
