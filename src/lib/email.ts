import { randomBytes } from "node:crypto";
import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";

import {
  AdminAppointmentRequestNotificationEmail,
  AdminBlackoutCancellationEmail,
  AdminCreatedSignupEmail,
  AppointmentCancellationEmail,
  AppointmentReminderEmail,
  AppointmentRescheduledEmail,
  ProvisionalAppointmentEmail,
  RefusedAppointmentEmail,
  SignupConfirmationEmail,
  ValidatedAppointmentEmail,
  CustomAdminEmail,
  ContactAcknowledgementEmail,
  AdminContactNotificationEmail,
} from "@/lib/email-templates";
import { getAppUrl } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatAppointmentMode } from "@/lib/utils";
import type { AppointmentMode, EmailDeliveryStatus } from "@/types/domain";

type AppMailTemplateKey =
  | "confirmation_inscription"
  | "confirmation_inscription_admin"
  | "prise_rdv_provisoire"
  | "rendez_vous_valide"
  | "rappel_rendez_vous"
  | "rendez_vous_deplace"
  | "rendez_vous_annule"
  | "rendez_vous_annule_indisponibilite"
  | "rendez_vous_refuse"
  | "alerte_admin_nouvelle_demande"
  | "admin_message_personnalise"
  | "contact_accuse_reception"
  | "alerte_admin_nouveau_contact";

interface TransactionalEmailPayload {
  to: string;
  subject: string;
  templateKey: AppMailTemplateKey;
  sourceType: string;
  sourceLabel: string;
  appointmentId?: string;
  metadata?: Record<string, unknown>;
  attachments?: { filename: string; content: string | Buffer }[];
  buildTemplate: (reference: string) => ReactElement;
}

interface TransactionalEmailResult {
  delivered: boolean;
  reference: string;
  reason?: "email_not_configured" | "email_request_failed" | "no_recipient";
}

/**
 * Expéditeur unique de la plateforme. Le domaine est authentifié chez Resend
 * (SPF + DKIM) : garder toujours la même adresse et un nom lisible construit
 * la réputation d'envoi, là où « NOREPLY » en majuscules ressemble à du spam.
 */
const RESEND_FROM_NAME = "Mathieu Cerenzia";
const RESEND_FROM_EMAIL = "noreply@mathieucerenzia.fr";
const ADMIN_APPOINTMENT_REQUEST_NOTIFICATION_EMAIL = "mathieucerenzia@gmail.com";

function createMailReference() {
  return `REF-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function getResendFromValue() {
  return `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`;
}

function serializeUnknownError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Erreur inconnue";
  }
}

async function createEmailLog(input: {
  reference: string;
  templateKey: AppMailTemplateKey;
  sourceType: string;
  sourceLabel: string;
  recipientEmail: string;
  subject: string;
  appointmentId?: string;
  deliveryStatus: EmailDeliveryStatus;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data } = await supabase
      .from("email_logs")
      .insert({
        reference: input.reference,
        template_key: input.templateKey,
        source_type: input.sourceType,
        source_label: input.sourceLabel,
        recipient_email: input.recipientEmail,
        subject: input.subject,
        appointment_id: input.appointmentId ?? null,
        delivery_status: input.deliveryStatus,
        metadata: input.metadata ?? {},
      })
      .select("id")
      .maybeSingle();

    return typeof data?.id === "string" ? data.id : null;
  } catch {
    return null;
  }
}

async function updateEmailLog(
  emailLogId: string | null,
  input: {
    deliveryStatus: EmailDeliveryStatus;
    resendEmailId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  if (!emailLogId) {
    return;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  try {
    await supabase
      .from("email_logs")
      .update({
        delivery_status: input.deliveryStatus,
        resend_email_id: input.resendEmailId ?? null,
        metadata: input.metadata ?? {},
      })
      .eq("id", emailLogId);
  } catch {}
}

export async function sendTransactionalEmail({
  to,
  subject,
  templateKey,
  sourceType,
  sourceLabel,
  appointmentId,
  metadata,
  attachments,
  buildTemplate,
}: TransactionalEmailPayload): Promise<TransactionalEmailResult> {
  const reference = createMailReference();

  // Rendez-vous saisi par l'administration pour un prospect sans email :
  // il n'y a personne à prévenir, aucun envoi ni journal.
  if (!to?.trim()) {
    return { delivered: false, reference, reason: "no_recipient" };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getResendFromValue();
  const isConfigured = Boolean(apiKey && from);
  const emailLogId = await createEmailLog({
    reference,
    templateKey,
    sourceType,
    sourceLabel,
    recipientEmail: to,
    subject,
    appointmentId,
    deliveryStatus: isConfigured ? "failed" : "not_configured",
    metadata: {
      ...(metadata ?? {}),
      provider: "resend",
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(from),
      from,
    },
  });

  if (!isConfigured) {
    return {
      delivered: false,
      reference,
      reason: "email_not_configured",
    };
  }

  const resend = new Resend(apiKey);
  try {
    const template = buildTemplate(reference);
    // Version texte en plus du HTML : un email sans alternative texte est un
    // signal négatif pour les filtres anti-spam, et certains lecteurs l'exigent.
    const [html, text] = await Promise.all([render(template), render(template, { plainText: true })]);

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      attachments,
      // Étiquette d'usage (statistiques Resend). Aucun en-tête de désinscription :
      // ce sont des emails de service, déclenchés par une action du destinataire.
      tags: [{ name: "category", value: templateKey }],
    });

    if (error) {
      await updateEmailLog(emailLogId, {
        deliveryStatus: "failed",
        metadata: {
          ...(metadata ?? {}),
          provider: "resend",
          hasApiKey: Boolean(apiKey),
          hasFrom: Boolean(from),
          from,
          resendError: error.message,
        },
      });

      return {
        delivered: false,
        reference,
        reason: "email_request_failed",
      };
    }

    if (!data?.id) {
      await updateEmailLog(emailLogId, {
        deliveryStatus: "failed",
        metadata: {
          ...(metadata ?? {}),
          provider: "resend",
          hasApiKey: Boolean(apiKey),
          hasFrom: Boolean(from),
          from,
          resendError: "Resend n'a retourne aucun identifiant d'email.",
          resendResponse: data ?? null,
        },
      });

      return {
        delivered: false,
        reference,
        reason: "email_request_failed",
      };
    }

    await updateEmailLog(emailLogId, {
      deliveryStatus: "sent",
      resendEmailId: data?.id,
      metadata: {
        ...(metadata ?? {}),
        provider: "resend",
        hasApiKey: Boolean(apiKey),
        hasFrom: Boolean(from),
        from,
        resendResponse: data,
      },
    });

    return {
      delivered: true,
      reference,
    };
  } catch (error) {
    await updateEmailLog(emailLogId, {
      deliveryStatus: "failed",
      metadata: {
        ...(metadata ?? {}),
        provider: "resend",
        hasApiKey: Boolean(apiKey),
        hasFrom: Boolean(from),
        from,
        resendError: serializeUnknownError(error),
      },
    });

    return {
      delivered: false,
      reference,
      reason: "email_request_failed",
    };
  }
}

export async function sendSignupConfirmationEmail(input: {
  to: string;
  firstName: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: "Votre compte est créé",
    templateKey: "confirmation_inscription",
    sourceType: "inscription",
    sourceLabel: "Confirmation d'inscription",
    metadata: {
      firstName: input.firstName,
    },
    buildTemplate: (reference) =>
      SignupConfirmationEmail({
        firstName: input.firstName,
        email: input.to,
        reference,
      }),
  });
}

export async function sendContactAcknowledgementEmail(input: {
  civility: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  pdfAttachmentBase64: string;
  isBookingBlocked?: boolean;
  bookingBlockedMessage?: string | null;
}) {
  return sendTransactionalEmail({
    to: input.email,
    subject: "Votre message est bien reçu",
    templateKey: "contact_accuse_reception",
    sourceType: "formulaire_contact",
    sourceLabel: "Accusé de réception formulaire de contact",
    metadata: {
      civility: input.civility,
      subject: input.subject,
    },
    attachments: [
      {
        filename: "recapitulatif_demande.pdf",
        content: input.pdfAttachmentBase64,
      },
    ],
    buildTemplate: (reference) =>
      ContactAcknowledgementEmail({
        civility: input.civility,
        email: input.email,
        subject: input.subject,
        message: input.message,
        isBookingBlocked: input.isBookingBlocked,
        bookingBlockedMessage: input.bookingBlockedMessage,
        reference,
      }),
  });
}

export async function sendAdminContactNotificationEmail(input: {
  civility: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  return sendTransactionalEmail({
    to: ADMIN_APPOINTMENT_REQUEST_NOTIFICATION_EMAIL,
    subject: `Nouveau message de contact : ${input.subject}`,
    templateKey: "alerte_admin_nouveau_contact",
    sourceType: "alerte_admin_nouveau_contact",
    sourceLabel: "Alerte administrateur nouveau message de contact",
    metadata: {
      civility: input.civility,
      clientEmail: input.email,
      clientPhone: input.phone,
      subject: input.subject,
    },
    buildTemplate: (reference) =>
      AdminContactNotificationEmail({
        civility: input.civility,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
        reference,
      }),
  });
}

export async function sendAdminCreatedSignupEmail(input: {
  to: string;
  firstName: string;
  temporaryPassword: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: "Votre compte est créé",
    templateKey: "confirmation_inscription_admin",
    sourceType: "inscription_admin",
    sourceLabel: "Confirmation d'inscription créée par l'administration",
    metadata: {
      firstName: input.firstName,
      temporaryPassword: input.temporaryPassword,
    },
    buildTemplate: (reference) =>
      AdminCreatedSignupEmail({
        firstName: input.firstName,
        email: input.to,
        temporaryPassword: input.temporaryPassword,
        reference,
      }),
  });
}

export async function sendProvisionalAppointmentEmail(input: {
  to: string;
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentMode: AppointmentMode;
  phone?: string;
  appointmentId: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: `Demande de rendez-vous reçue pour le ${input.startsAtLabel}`,
    templateKey: "prise_rdv_provisoire",
    sourceType: "rendez_vous_provisoire",
    sourceLabel: "Confirmation de prise de rendez-vous (provisoire)",
    appointmentId: input.appointmentId,
    metadata: {
      categoryTitle: input.categoryTitle,
      startsAtLabel: input.startsAtLabel,
      appointmentMode: input.appointmentMode,
      phone: input.phone,
    },
    buildTemplate: (reference) =>
      ProvisionalAppointmentEmail({
        firstName: input.firstName,
        email: input.to,
        categoryTitle: input.categoryTitle,
        startsAtLabel: input.startsAtLabel,
        appointmentModeLabel: formatAppointmentMode(input.appointmentMode),
        phone: input.phone,
        reference,
      }),
  });
}

export async function sendAdminAppointmentRequestNotificationEmail(input: {
  firstName: string;
  lastName: string;
  clientEmail: string;
  clientPhone?: string;
  clientMessage?: string;
  clientCompany?: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentMode: AppointmentMode;
  appointmentId: string;
}) {
  const adminAppointmentUrl = `${getAppUrl()}/admin/rendez-vous/${input.appointmentId}`;

  return sendTransactionalEmail({
    to: ADMIN_APPOINTMENT_REQUEST_NOTIFICATION_EMAIL,
    subject: "Nouvelle demande de rendez-vous",
    templateKey: "alerte_admin_nouvelle_demande",
    sourceType: "alerte_admin_nouvelle_demande",
    sourceLabel: "Alerte administrateur nouvelle demande de rendez-vous",
    appointmentId: input.appointmentId,
    metadata: {
      clientFullName: `${input.firstName} ${input.lastName}`.trim(),
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      clientMessage: input.clientMessage,
      categoryTitle: input.categoryTitle,
      startsAtLabel: input.startsAtLabel,
      appointmentMode: input.appointmentMode,
      adminAppointmentUrl,
    },
    buildTemplate: (reference) =>
      AdminAppointmentRequestNotificationEmail({
        categoryTitle: input.categoryTitle,
        startsAtLabel: input.startsAtLabel,
        appointmentModeLabel: formatAppointmentMode(input.appointmentMode),
        clientFullName: `${input.firstName} ${input.lastName}`.trim(),
        clientCompany: input.clientCompany,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        clientMessage: input.clientMessage,
        adminAppointmentUrl,
        reference,
      }),
  });
}

export async function sendValidatedAppointmentEmail(input: {
  to: string;
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentMode: AppointmentMode;
  phone?: string;
  appointmentId: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: `Rendez-vous confirmé : ${input.startsAtLabel}`,
    templateKey: "rendez_vous_valide",
    sourceType: "rendez_vous_valide",
    sourceLabel: "Confirmation de rendez-vous (valide)",
    appointmentId: input.appointmentId,
    metadata: {
      categoryTitle: input.categoryTitle,
      startsAtLabel: input.startsAtLabel,
      appointmentMode: input.appointmentMode,
      phone: input.phone,
    },
    buildTemplate: (reference) =>
      ValidatedAppointmentEmail({
        firstName: input.firstName,
        email: input.to,
        categoryTitle: input.categoryTitle,
        startsAtLabel: input.startsAtLabel,
        appointmentModeLabel: formatAppointmentMode(input.appointmentMode),
        phone: input.phone,
        reference,
      }),
  });
}

export async function sendAppointmentCancellationEmail(input: {
  to: string;
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  reason: string;
  appointmentId: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: `Rendez-vous annulé : ${input.startsAtLabel}`,
    templateKey: "rendez_vous_annule",
    sourceType: "rendez_vous_annule",
    sourceLabel: "Confirmation annulation rendez-vous",
    appointmentId: input.appointmentId,
    metadata: {
      categoryTitle: input.categoryTitle,
      startsAtLabel: input.startsAtLabel,
      reason: input.reason,
    },
    buildTemplate: (reference) =>
      AppointmentCancellationEmail({
        firstName: input.firstName,
        email: input.to,
        categoryTitle: input.categoryTitle,
        startsAtLabel: input.startsAtLabel,
        reason: input.reason,
        reference,
      }),
  });
}

export async function sendBlackoutAppointmentCancellationEmail(input: {
  to: string;
  firstName: string;
  categoryTitle: string;
  appointmentDateLabel: string;
  appointmentTimeLabel: string;
  reason?: string;
  appointmentId: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: `Votre rendez-vous du ${input.appointmentDateLabel} ne peut pas avoir lieu`,
    templateKey: "rendez_vous_annule_indisponibilite",
    sourceType: "rendez_vous_annule_indisponibilite",
    sourceLabel: "Annulation automatique pour indisponibilité",
    appointmentId: input.appointmentId,
    metadata: {
      categoryTitle: input.categoryTitle,
      appointmentDateLabel: input.appointmentDateLabel,
      appointmentTimeLabel: input.appointmentTimeLabel,
      reason: input.reason,
    },
    buildTemplate: (reference) =>
      AdminBlackoutCancellationEmail({
        firstName: input.firstName,
        email: input.to,
        categoryTitle: input.categoryTitle,
        appointmentDateLabel: input.appointmentDateLabel,
        appointmentTimeLabel: input.appointmentTimeLabel,
        reason: input.reason,
        reference,
      }),
  });
}

export async function sendAdminCustomEmailToUser(input: {
  to: string;
  firstName: string;
  subject: string;
  message: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: input.subject,
    templateKey: "admin_message_personnalise",
    sourceType: "admin_message",
    sourceLabel: "Message envoyé depuis l'administration",
    metadata: {
      subject: input.subject,
      message: input.message,
    },
    buildTemplate: (reference) =>
      CustomAdminEmail({
        firstName: input.firstName,
        subject: input.subject,
        message: input.message,
        reference,
      }),
  });
}

export async function sendRefusedAppointmentEmail(input: {
  to: string;
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  reason: string;
  appointmentId: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: "Votre demande de rendez-vous n'a pas pu être acceptée",
    templateKey: "rendez_vous_refuse",
    sourceType: "rendez_vous_refuse",
    sourceLabel: "Demande de rendez-vous refusee",
    appointmentId: input.appointmentId,
    metadata: {
      categoryTitle: input.categoryTitle,
      startsAtLabel: input.startsAtLabel,
      reason: input.reason,
    },
    buildTemplate: (reference) =>
      RefusedAppointmentEmail({
        firstName: input.firstName,
        email: input.to,
        categoryTitle: input.categoryTitle,
        startsAtLabel: input.startsAtLabel,
        reason: input.reason,
        reference,
      }),
  });
}

export async function sendAppointmentReminderEmail(input: {
  to: string;
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentMode: AppointmentMode;
  phone?: string;
  appointmentId: string;
  /** Instant du rendez-vous : sert à ne jamais envoyer deux rappels pour le même créneau. */
  startsAt: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: `Rappel : votre rendez-vous du ${input.startsAtLabel}`,
    templateKey: "rappel_rendez_vous",
    sourceType: "rappel_rendez_vous",
    sourceLabel: "Rappel de rendez-vous",
    appointmentId: input.appointmentId,
    metadata: {
      startsAt: input.startsAt,
      categoryTitle: input.categoryTitle,
      startsAtLabel: input.startsAtLabel,
      appointmentMode: input.appointmentMode,
    },
    buildTemplate: (reference) =>
      AppointmentReminderEmail({
        firstName: input.firstName,
        categoryTitle: input.categoryTitle,
        startsAtLabel: input.startsAtLabel,
        appointmentModeLabel: formatAppointmentMode(input.appointmentMode),
        phone: input.phone,
        reference,
      }),
  });
}

export async function sendAppointmentRescheduledEmail(input: {
  to: string;
  firstName: string;
  categoryTitle: string;
  previousStartsAtLabel: string;
  startsAtLabel: string;
  appointmentMode: AppointmentMode;
  reason?: string;
  appointmentId: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: `Rendez-vous déplacé au ${input.startsAtLabel}`,
    templateKey: "rendez_vous_deplace",
    sourceType: "rendez_vous_deplace",
    sourceLabel: "Déplacement de rendez-vous",
    appointmentId: input.appointmentId,
    metadata: {
      categoryTitle: input.categoryTitle,
      previousStartsAtLabel: input.previousStartsAtLabel,
      startsAtLabel: input.startsAtLabel,
      reason: input.reason,
    },
    buildTemplate: (reference) =>
      AppointmentRescheduledEmail({
        firstName: input.firstName,
        categoryTitle: input.categoryTitle,
        previousStartsAtLabel: input.previousStartsAtLabel,
        startsAtLabel: input.startsAtLabel,
        appointmentModeLabel: formatAppointmentMode(input.appointmentMode),
        reason: input.reason,
        reference,
      }),
  });
}
