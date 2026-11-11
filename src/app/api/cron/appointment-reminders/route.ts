import { getAppointmentsDueForReminder } from "@/lib/data-access";
import { sendAppointmentReminderEmail } from "@/lib/email";
import { formatDateTimeFr } from "@/lib/utils";

/**
 * Rappels de rendez-vous, déclenchés par la tâche planifiée Vercel (voir
 * `vercel.json`). Vercel joint l'en-tête `Authorization: Bearer <CRON_SECRET>`.
 *
 * La tâche tourne une fois par jour, le matin : la fenêtre de 36 heures couvre
 * donc toute la journée du lendemain, et chaque client est prévenu la veille.
 * Appelée plus souvent, elle n'envoie rien en double : un rappel n'est émis
 * qu'une fois par créneau.
 */
const REMINDER_WINDOW_HOURS = 36;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    return Response.json({ error: "Rappels non configurés : CRON_SECRET manquant." }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const due = await getAppointmentsDueForReminder(REMINDER_WINDOW_HOURS);
  let sent = 0;
  let failed = 0;

  for (const { appointment, category } of due) {
    const result = await sendAppointmentReminderEmail({
      to: appointment.email,
      firstName: appointment.firstName,
      categoryTitle: category?.title ?? "Votre rendez-vous",
      startsAtLabel: formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" }),
      appointmentMode: category?.appointmentMode ?? "visioconference",
      phone: appointment.phone,
      appointmentId: appointment.id,
      startsAt: appointment.startsAt,
    });

    if (result.delivered) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return Response.json({ due: due.length, sent, failed });
}
