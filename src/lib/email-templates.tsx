import type { CSSProperties, ReactNode } from "react";

import { getAppUrl } from "@/lib/env";

/**
 * Gabarits des emails envoyés par la plateforme.
 *
 * Mise en page volontairement sobre et écrite « à l'ancienne » (tableaux,
 * styles en ligne, police système, aucune image distante) : c'est ce qui
 * s'affiche correctement dans Gmail, Outlook, Yahoo et Apple Mail, et ce qui
 * ressemble le moins à un email publicitaire aux yeux des filtres anti-spam.
 */

const FONT_FAMILY = "Arial, Helvetica, sans-serif";
const COLOR_TEXT = "#1a1a1a";
const COLOR_MUTED = "#6b7280";
const COLOR_ACCENT = "#2563eb";
const COLOR_BORDER = "#e5e7eb";

type MailDetail = {
  label: string;
  value: string;
};

type MailNotice = {
  tone: "info" | "warning";
  text: string;
};

interface MailLayoutProps {
  /** Titre affiché en tête de l'email. */
  title: string;
  /** Résumé d'une ligne affiché par la messagerie à côté de l'objet. */
  preheader: string;
  greeting: string;
  /** Phrase d'ouverture : elle doit dire l'essentiel à elle seule. */
  lead: string;
  details?: MailDetail[];
  paragraphs?: string[];
  notice?: MailNotice;
  linkLabel?: string;
  linkHref?: string;
  reference: string;
  /** Les alertes internes n'ont pas besoin de formule de politesse. */
  hideSignature?: boolean;
  children?: ReactNode;
}

const paragraphStyle: CSSProperties = {
  margin: "0 0 16px",
  fontFamily: FONT_FAMILY,
  fontSize: "16px",
  lineHeight: "24px",
  color: COLOR_TEXT,
};

function MailLayout({
  title,
  preheader,
  greeting,
  lead,
  details = [],
  paragraphs = [],
  notice,
  linkLabel,
  linkHref,
  reference,
  hideSignature,
  children,
}: MailLayoutProps) {
  const siteUrl = getAppUrl();
  const siteLabel = siteUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>{title}</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f4f5f7" }}>
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden", opacity: 0, color: "#f4f5f7", fontSize: "1px", lineHeight: "1px" }}>
          {preheader}
        </div>

        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ backgroundColor: "#f4f5f7" }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: "24px 12px" }}>
                <table
                  role="presentation"
                  width={560}
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  style={{
                    width: "100%",
                    maxWidth: "560px",
                    backgroundColor: "#ffffff",
                    border: `1px solid ${COLOR_BORDER}`,
                    borderRadius: "8px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: "24px 32px 20px", borderBottom: `1px solid ${COLOR_BORDER}` }}>
                        <p style={{ margin: 0, fontFamily: FONT_FAMILY, fontSize: "15px", lineHeight: "22px", fontWeight: 700, color: COLOR_TEXT }}>
                          Mathieu Cerenzia
                        </p>
                        <p style={{ margin: 0, fontFamily: FONT_FAMILY, fontSize: "13px", lineHeight: "20px", color: COLOR_MUTED }}>
                          Prise de rendez-vous en ligne
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: "28px 32px 8px" }}>
                        <h1 style={{ margin: "0 0 20px", fontFamily: FONT_FAMILY, fontSize: "22px", lineHeight: "30px", fontWeight: 700, color: COLOR_TEXT }}>
                          {title}
                        </h1>

                        <p style={paragraphStyle}>{greeting}</p>
                        {lead ? <p style={paragraphStyle}>{lead}</p> : null}

                        {details.length > 0 ? (
                          <div style={{ margin: "8px 0 24px", borderTop: `1px solid ${COLOR_BORDER}` }}>
                            {/* Une ligne « Libellé : valeur » par information : lisible partout,
                                y compris dans la version texte de l'email. */}
                            {details.map((detail) => (
                              <p
                                key={detail.label}
                                style={{
                                  margin: 0,
                                  padding: "11px 0",
                                  borderBottom: `1px solid ${COLOR_BORDER}`,
                                  fontFamily: FONT_FAMILY,
                                  fontSize: "15px",
                                  lineHeight: "22px",
                                  color: COLOR_TEXT,
                                }}
                              >
                                <span style={{ color: COLOR_MUTED }}>{detail.label} : </span>
                                <strong>{detail.value}</strong>
                              </p>
                            ))}
                          </div>
                        ) : null}

                        {notice ? (
                          <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ margin: "0 0 20px" }}>
                            <tbody>
                              <tr>
                                <td
                                  style={{
                                    padding: "12px 16px",
                                    backgroundColor: notice.tone === "warning" ? "#fff7ed" : "#eff6ff",
                                    borderLeft: `3px solid ${notice.tone === "warning" ? "#ea580c" : COLOR_ACCENT}`,
                                    fontFamily: FONT_FAMILY,
                                    fontSize: "15px",
                                    lineHeight: "22px",
                                    color: COLOR_TEXT,
                                  }}
                                >
                                  {notice.text}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}

                        {paragraphs.map((paragraph) => (
                          <p key={paragraph} style={paragraphStyle}>
                            {paragraph}
                          </p>
                        ))}

                        {children}

                        {linkLabel && linkHref ? (
                          <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ margin: "8px 0 24px" }}>
                            <tbody>
                              <tr>
                                <td align="center" style={{ backgroundColor: COLOR_ACCENT, borderRadius: "6px" }}>
                                  <a
                                    href={linkHref}
                                    style={{
                                      display: "inline-block",
                                      padding: "12px 24px",
                                      fontFamily: FONT_FAMILY,
                                      fontSize: "16px",
                                      lineHeight: "24px",
                                      fontWeight: 700,
                                      color: "#ffffff",
                                      textDecoration: "none",
                                    }}
                                  >
                                    {linkLabel}
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}

                        {hideSignature ? null : (
                          <p style={{ ...paragraphStyle, margin: "0 0 24px" }}>
                            À bientôt,
                            <br />
                            Mathieu Cerenzia
                          </p>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: "20px 32px 24px", borderTop: `1px solid ${COLOR_BORDER}` }}>
                        <p style={{ margin: "0 0 6px", fontFamily: FONT_FAMILY, fontSize: "13px", lineHeight: "20px", color: COLOR_MUTED }}>
                          Cet email vous est envoyé automatiquement à la suite d&apos;une action sur{" "}
                          <a href={siteUrl} style={{ color: COLOR_MUTED, textDecoration: "underline" }}>
                            {siteLabel}
                          </a>
                          . Merci de ne pas y répondre : cette adresse n&apos;est pas consultée.
                        </p>
                        <p style={{ margin: 0, fontFamily: FONT_FAMILY, fontSize: "12px", lineHeight: "18px", color: "#9ca3af" }}>
                          Référence : {reference}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

/* =========================================================================
   COMPTE
   ========================================================================= */

interface SignupConfirmationEmailProps {
  firstName: string;
  email: string;
  reference: string;
}

/** Inscription réussie sur la plateforme. */
export function SignupConfirmationEmail({ firstName, email, reference }: SignupConfirmationEmailProps) {
  return (
    <MailLayout
      title="Votre compte est créé"
      preheader="Votre compte est prêt : vous pouvez prendre et suivre vos rendez-vous en ligne."
      greeting={`Bonjour ${firstName},`}
      lead="Votre inscription est bien enregistrée. Votre compte vous permet de prendre rendez-vous plus vite, de retrouver vos rendez-vous et de les annuler en ligne."
      details={[{ label: "Identifiant", value: email }]}
      paragraphs={[
        "Si un second email vous demande de confirmer votre adresse, cliquez sur le lien qu'il contient avant de vous connecter.",
      ]}
      linkLabel="Me connecter"
      linkHref={`${getAppUrl()}/connexion`}
      reference={reference}
    />
  );
}

interface AdminCreatedSignupEmailProps {
  firstName: string;
  email: string;
  temporaryPassword: string;
  reference: string;
}

export function AdminCreatedSignupEmail({ firstName, email, temporaryPassword, reference }: AdminCreatedSignupEmailProps) {
  return (
    <MailLayout
      title="Votre compte est créé"
      preheader="Un compte vient d'être créé pour vous. Voici comment vous connecter."
      greeting={`Bonjour ${firstName},`}
      lead="Un compte vient d'être créé pour vous. Il vous permet de retrouver vos rendez-vous et de les gérer en ligne."
      details={[
        { label: "Identifiant", value: email },
        { label: "Mot de passe provisoire", value: temporaryPassword },
      ]}
      notice={{
        tone: "info",
        text: "À votre première connexion, vous choisirez votre propre mot de passe.",
      }}
      linkLabel="Me connecter"
      linkHref={`${getAppUrl()}/connexion`}
      reference={reference}
    />
  );
}

/* =========================================================================
   RENDEZ-VOUS
   ========================================================================= */

interface ProvisionalAppointmentEmailProps {
  firstName: string;
  email: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentModeLabel: string;
  phone?: string;
  reference: string;
}

/** Demande reçue, en attente de validation. */
export function ProvisionalAppointmentEmail({
  firstName,
  categoryTitle,
  startsAtLabel,
  appointmentModeLabel,
  reference,
}: ProvisionalAppointmentEmailProps) {
  return (
    <MailLayout
      title="Votre demande est bien reçue"
      preheader={`Demande de rendez-vous du ${startsAtLabel} : en attente de validation.`}
      greeting={`Bonjour ${firstName},`}
      lead="J'ai bien reçu votre demande de rendez-vous. Elle doit encore être validée : vous recevrez un second email dès que ce sera fait."
      details={[
        { label: "Rendez-vous", value: categoryTitle },
        { label: "Date et heure", value: startsAtLabel },
        { label: "Déroulement", value: appointmentModeLabel },
        { label: "Statut", value: "En attente de validation" },
      ]}
      notice={{
        tone: "warning",
        text: "Le rendez-vous n'est pas encore confirmé. Merci d'attendre l'email de confirmation.",
      }}
      reference={reference}
    />
  );
}

interface ValidatedAppointmentEmailProps {
  firstName: string;
  email: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentModeLabel: string;
  phone?: string;
  reference: string;
}

/** Confirmation de rendez-vous. */
export function ValidatedAppointmentEmail({
  firstName,
  categoryTitle,
  startsAtLabel,
  appointmentModeLabel,
  phone,
  reference,
}: ValidatedAppointmentEmailProps) {
  return (
    <MailLayout
      title="Votre rendez-vous est confirmé"
      preheader={`Rendez-vous confirmé : ${startsAtLabel}.`}
      greeting={`Bonjour ${firstName},`}
      lead="Bonne nouvelle : votre rendez-vous est confirmé. Voici le récapitulatif à conserver."
      details={[
        { label: "Rendez-vous", value: categoryTitle },
        { label: "Date et heure", value: startsAtLabel },
        { label: "Déroulement", value: appointmentModeLabel },
        ...(appointmentModeLabel === "Téléphonique" && phone ? [{ label: "Je vous appelle au", value: phone }] : []),
      ]}
      paragraphs={[
        "Un empêchement ? Vous pouvez annuler ce rendez-vous depuis votre espace, le plus tôt possible, afin de libérer le créneau.",
      ]}
      linkLabel="Voir mes rendez-vous"
      linkHref={`${getAppUrl()}/compte`}
      reference={reference}
    />
  );
}

interface AppointmentReminderEmailProps {
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentModeLabel: string;
  phone?: string;
  reference: string;
}

/** Rappel envoyé avant le rendez-vous. */
export function AppointmentReminderEmail({
  firstName,
  categoryTitle,
  startsAtLabel,
  appointmentModeLabel,
  phone,
  reference,
}: AppointmentReminderEmailProps) {
  return (
    <MailLayout
      title="Rappel de votre rendez-vous"
      preheader={`Rappel : votre rendez-vous a lieu ${startsAtLabel}.`}
      greeting={`Bonjour ${firstName},`}
      lead="Un petit rappel : votre rendez-vous approche."
      details={[
        { label: "Rendez-vous", value: categoryTitle },
        { label: "Date et heure", value: startsAtLabel },
        { label: "Déroulement", value: appointmentModeLabel },
        ...(appointmentModeLabel === "Téléphonique" && phone ? [{ label: "Je vous appelle au", value: phone }] : []),
      ]}
      paragraphs={["Si vous ne pouvez plus venir, merci d'annuler depuis votre espace pour libérer le créneau."]}
      linkLabel="Voir mes rendez-vous"
      linkHref={`${getAppUrl()}/compte`}
      reference={reference}
    />
  );
}

interface AppointmentRescheduledEmailProps {
  firstName: string;
  categoryTitle: string;
  previousStartsAtLabel: string;
  startsAtLabel: string;
  appointmentModeLabel: string;
  reason?: string;
  reference: string;
}

/** Déplacement d'un rendez-vous sur un nouveau créneau. */
export function AppointmentRescheduledEmail({
  firstName,
  categoryTitle,
  previousStartsAtLabel,
  startsAtLabel,
  appointmentModeLabel,
  reason,
  reference,
}: AppointmentRescheduledEmailProps) {
  return (
    <MailLayout
      title="Votre rendez-vous est déplacé"
      preheader={`Nouveau créneau : ${startsAtLabel}.`}
      greeting={`Bonjour ${firstName},`}
      lead="Votre rendez-vous a été déplacé. Voici le nouveau créneau, qui remplace le précédent."
      details={[
        { label: "Rendez-vous", value: categoryTitle },
        { label: "Nouveau créneau", value: startsAtLabel },
        { label: "Ancien créneau", value: previousStartsAtLabel },
        { label: "Déroulement", value: appointmentModeLabel },
        ...(reason ? [{ label: "Motif", value: reason }] : []),
      ]}
      paragraphs={[
        "Si ce nouveau créneau ne vous convient pas, vous pouvez annuler le rendez-vous depuis votre espace et en choisir un autre.",
      ]}
      linkLabel="Voir mes rendez-vous"
      linkHref={`${getAppUrl()}/compte`}
      reference={reference}
    />
  );
}

interface AppointmentCancellationEmailProps {
  firstName: string;
  email: string;
  categoryTitle: string;
  startsAtLabel: string;
  reason: string;
  reference: string;
}

/** Confirmation d'annulation demandée par le client. */
export function AppointmentCancellationEmail({
  firstName,
  categoryTitle,
  startsAtLabel,
  reason,
  reference,
}: AppointmentCancellationEmailProps) {
  return (
    <MailLayout
      title="Votre rendez-vous est annulé"
      preheader={`Annulation confirmée pour le rendez-vous du ${startsAtLabel}.`}
      greeting={`Bonjour ${firstName},`}
      lead="Votre annulation est bien prise en compte. Le créneau est libéré, vous n'avez rien d'autre à faire."
      details={[
        { label: "Rendez-vous", value: categoryTitle },
        { label: "Date et heure", value: startsAtLabel },
        { label: "Motif", value: reason },
      ]}
      paragraphs={["Vous pouvez reprendre rendez-vous quand vous le souhaitez."]}
      linkLabel="Prendre un nouveau rendez-vous"
      linkHref={getAppUrl()}
      reference={reference}
    />
  );
}

interface AdminBlackoutCancellationEmailProps {
  firstName: string;
  email: string;
  categoryTitle: string;
  appointmentDateLabel: string;
  appointmentTimeLabel: string;
  reason?: string;
  reference: string;
}

/** Indisponibilité sur un créneau déjà réservé : le rendez-vous est annulé. */
export function AdminBlackoutCancellationEmail({
  firstName,
  categoryTitle,
  appointmentDateLabel,
  appointmentTimeLabel,
  reason,
  reference,
}: AdminBlackoutCancellationEmailProps) {
  return (
    <MailLayout
      title="Votre rendez-vous ne peut pas avoir lieu"
      preheader={`Je ne serai pas disponible le ${appointmentDateLabel} : votre rendez-vous est annulé.`}
      greeting={`Bonjour ${firstName},`}
      lead="Je suis désolé : je ne serai pas disponible sur le créneau que vous aviez réservé. Votre rendez-vous est donc annulé."
      details={[
        { label: "Rendez-vous", value: categoryTitle },
        { label: "Date", value: appointmentDateLabel },
        { label: "Heure", value: appointmentTimeLabel },
        ...(reason ? [{ label: "Motif", value: reason }] : []),
      ]}
      paragraphs={[
        "Je vous présente mes excuses pour ce contretemps. Vous pouvez choisir dès maintenant un autre créneau parmi les disponibilités à jour.",
      ]}
      linkLabel="Choisir un autre créneau"
      linkHref={getAppUrl()}
      reference={reference}
    />
  );
}

interface RefusedAppointmentEmailProps {
  firstName: string;
  email: string;
  categoryTitle: string;
  startsAtLabel: string;
  reason: string;
  reference: string;
}

export function RefusedAppointmentEmail({ firstName, categoryTitle, startsAtLabel, reason, reference }: RefusedAppointmentEmailProps) {
  return (
    <MailLayout
      title="Votre demande n'a pas pu être acceptée"
      preheader={`Demande de rendez-vous du ${startsAtLabel} : non acceptée.`}
      greeting={`Bonjour ${firstName},`}
      lead="Je ne peux malheureusement pas accepter votre demande de rendez-vous sur ce créneau."
      details={[
        { label: "Rendez-vous", value: categoryTitle },
        { label: "Date et heure", value: startsAtLabel },
        { label: "Motif", value: reason },
      ]}
      paragraphs={["Vous pouvez faire une nouvelle demande sur un autre créneau."]}
      linkLabel="Choisir un autre créneau"
      linkHref={getAppUrl()}
      reference={reference}
    />
  );
}

/* =========================================================================
   MESSAGES ET ALERTES
   ========================================================================= */

interface AdminAppointmentRequestNotificationEmailProps {
  categoryTitle: string;
  startsAtLabel: string;
  appointmentModeLabel: string;
  clientFullName: string;
  clientEmail: string;
  clientPhone?: string;
  clientMessage?: string;
  adminAppointmentUrl: string;
  reference: string;
}

export function AdminAppointmentRequestNotificationEmail({
  categoryTitle,
  startsAtLabel,
  appointmentModeLabel,
  clientFullName,
  clientEmail,
  clientPhone,
  clientMessage,
  adminAppointmentUrl,
  reference,
}: AdminAppointmentRequestNotificationEmailProps) {
  return (
    <MailLayout
      title="Nouvelle demande de rendez-vous"
      preheader={`${clientFullName} demande un rendez-vous le ${startsAtLabel}.`}
      greeting="Bonjour,"
      lead="Une nouvelle demande de rendez-vous attend votre validation."
      details={[
        { label: "Date et heure", value: startsAtLabel },
        { label: "Rendez-vous", value: categoryTitle },
        { label: "Déroulement", value: appointmentModeLabel },
        { label: "Client", value: clientFullName },
        { label: "Email", value: clientEmail },
        ...(clientPhone ? [{ label: "Téléphone", value: clientPhone }] : []),
        ...(clientMessage ? [{ label: "Message", value: clientMessage }] : []),
      ]}
      linkLabel="Ouvrir la demande"
      linkHref={adminAppointmentUrl}
      reference={reference}
      hideSignature
    />
  );
}

interface CustomAdminEmailProps {
  firstName: string;
  subject: string;
  message: string;
  reference: string;
}

export function CustomAdminEmail({ firstName, subject, message, reference }: CustomAdminEmailProps) {
  return (
    <MailLayout title={subject} preheader={message.slice(0, 120)} greeting={`Bonjour ${firstName},`} lead="" reference={reference}>
      <p style={{ ...paragraphStyle, whiteSpace: "pre-wrap" }}>{message}</p>
    </MailLayout>
  );
}

export interface ContactAcknowledgementEmailProps {
  civility: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isBookingBlocked?: boolean;
  bookingBlockedMessage?: string | null;
  reference: string;
}

export function ContactAcknowledgementEmail({
  civility,
  subject,
  isBookingBlocked,
  bookingBlockedMessage,
  reference,
}: ContactAcknowledgementEmailProps) {
  return (
    <MailLayout
      title="Votre message est bien reçu"
      preheader="J'ai bien reçu votre message et je vous réponds dès que possible."
      greeting={`Bonjour ${civility},`}
      lead="J'ai bien reçu votre message et je vous réponds dès que possible."
      details={[{ label: "Objet", value: subject }]}
      notice={
        isBookingBlocked
          ? { tone: "warning", text: bookingBlockedMessage || "La prise de rendez-vous est actuellement suspendue." }
          : undefined
      }
      paragraphs={["Vous trouverez en pièce jointe un récapitulatif de votre demande au format PDF."]}
      reference={reference}
    />
  );
}

export interface AdminContactNotificationEmailProps {
  civility: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  reference: string;
}

export function AdminContactNotificationEmail({ civility, email, phone, subject, message, reference }: AdminContactNotificationEmailProps) {
  return (
    <MailLayout
      title="Nouveau message de contact"
      preheader={`${civility} — ${subject}`}
      greeting="Bonjour,"
      lead="Un nouveau message vient d'arriver par le formulaire de contact."
      details={[
        { label: "Civilité", value: civility },
        { label: "Email", value: email },
        { label: "Téléphone", value: phone || "Non renseigné" },
        { label: "Objet", value: subject },
      ]}
      reference={reference}
      hideSignature
    >
      <p style={{ ...paragraphStyle, whiteSpace: "pre-wrap" }}>{message}</p>
    </MailLayout>
  );
}
