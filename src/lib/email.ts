import { randomBytes } from "node:crypto";
import type { ReactElement } from "react";
import { Resend } from "resend";

import {
  AppointmentCancellationEmail,
  ProvisionalAppointmentEmail,
  RefusedAppointmentEmail,
  SignupConfirmationEmail,
  ValidatedAppointmentEmail,
} from "@/lib/email-templates";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EmailDeliveryStatus } from "@/types/domain";

type AppMailTemplateKey =
  | "confirmation_inscription"
  | "prise_rdv_provisoire"
  | "rendez_vous_valide"
  | "rendez_vous_annule"
  | "rendez_vous_refuse";

interface TransactionalEmailPayload {
  to: string;
  subject: string;
  templateKey: AppMailTemplateKey;
  sourceType: string;
  sourceLabel: string;
  appointmentId?: string;
  metadata?: Record<string, unknown>;
  buildTemplate: (reference: string) => ReactElement;
}

interface TransactionalEmailResult {
  delivered: boolean;
  reference: string;
  reason?: "email_not_configured" | "email_request_failed";
}

function createMailReference() {
  return `REF-${randomBytes(3).toString("hex").toUpperCase()}`;
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

  await supabase
    .from("email_logs")
    .update({
      delivery_status: input.deliveryStatus,
      resend_email_id: input.resendEmailId ?? null,
      metadata: input.metadata ?? {},
    })
    .eq("id", emailLogId);
}

export async function sendTransactionalEmail({
  to,
  subject,
  templateKey,
  sourceType,
  sourceLabel,
  appointmentId,
  metadata,
  buildTemplate,
}: TransactionalEmailPayload): Promise<TransactionalEmailResult> {
  const reference = createMailReference();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  const emailLogId = await createEmailLog({
    reference,
    templateKey,
    sourceType,
    sourceLabel,
    recipientEmail: to,
    subject,
    appointmentId,
    deliveryStatus: apiKey && from ? "sent" : "not_configured",
    metadata,
  });

  if (!apiKey || !from) {
    return {
      delivered: false,
      reference,
      reason: "email_not_configured",
    };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    react: buildTemplate(reference),
  });

  if (error) {
    await updateEmailLog(emailLogId, {
      deliveryStatus: "failed",
      metadata: {
        ...(metadata ?? {}),
        resendError: error.message,
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
    metadata,
  });

  return {
    delivered: true,
    reference,
  };
}

export async function sendSignupConfirmationEmail(input: {
  to: string;
  firstName: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: "Confirmation d'inscription",
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

export async function sendProvisionalAppointmentEmail(input: {
  to: string;
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentId: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: "Confirmation de prise de rendez-vous (provisoire)",
    templateKey: "prise_rdv_provisoire",
    sourceType: "rendez_vous_provisoire",
    sourceLabel: "Confirmation de prise de rendez-vous (provisoire)",
    appointmentId: input.appointmentId,
    metadata: {
      categoryTitle: input.categoryTitle,
      startsAtLabel: input.startsAtLabel,
    },
    buildTemplate: (reference) =>
      ProvisionalAppointmentEmail({
        firstName: input.firstName,
        categoryTitle: input.categoryTitle,
        startsAtLabel: input.startsAtLabel,
        reference,
      }),
  });
}

export async function sendValidatedAppointmentEmail(input: {
  to: string;
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentId: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: "Confirmation de rendez-vous (valide)",
    templateKey: "rendez_vous_valide",
    sourceType: "rendez_vous_valide",
    sourceLabel: "Confirmation de rendez-vous (valide)",
    appointmentId: input.appointmentId,
    metadata: {
      categoryTitle: input.categoryTitle,
      startsAtLabel: input.startsAtLabel,
    },
    buildTemplate: (reference) =>
      ValidatedAppointmentEmail({
        firstName: input.firstName,
        categoryTitle: input.categoryTitle,
        startsAtLabel: input.startsAtLabel,
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
    subject: "Confirmation annulation rendez-vous",
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
        categoryTitle: input.categoryTitle,
        startsAtLabel: input.startsAtLabel,
        reason: input.reason,
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
    subject: "Votre demande de rendez-vous a ete refusee",
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
        categoryTitle: input.categoryTitle,
        startsAtLabel: input.startsAtLabel,
        reason: input.reason,
        reference,
      }),
  });
}
