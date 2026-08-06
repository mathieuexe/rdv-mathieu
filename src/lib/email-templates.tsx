import { getAppUrl } from "@/lib/env";
import { DiscordIcon } from "@/components/shared/discord-icon";

type MailDetail = {
  label: string;
  value: string;
  underline?: boolean;
};

interface MailLayoutProps {
  title: string;
  greeting: string;
  lead: string;
  userEmail?: string;
  details?: MailDetail[];
  paragraphs?: string[];
  highlightedParagraphs?: string[];
  linkLabel?: string;
  linkHref?: string;
  reference: string;
  children?: React.ReactNode;
}

function MailLayout({
  title,
  greeting,
  lead,
  userEmail,
  details = [],
  paragraphs = [],
  highlightedParagraphs = [],
  linkLabel,
  linkHref,
  reference,
  children,
}: MailLayoutProps) {
  return (
    <div
      style={{
        margin: 0,
        padding: "40px 0",
        backgroundColor: "#f8fafc", // slate-50
        color: "#0f172a", // slate-900
        textAlign: "left",
        fontFamily:
          'Inter, "Gilroy", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.6,
        fontSize: "15px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "32px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e2e8f0", // slate-200
        }}
      >
        <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
          Prise de rendez-vous - Mathieu CERENZIA
        </p>
        
        <h1 style={{ margin: "0 0 24px", fontSize: "24px", lineHeight: "1.3", color: "#0f172a", fontWeight: 700 }}>
          {title}
        </h1>

        {userEmail ? (
          <div style={{ margin: "0 0 24px", padding: "16px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 12px", color: "#0f172a", fontWeight: 600, fontSize: "14px" }}>Vos identifiants de connexion :</p>
            <p style={{ margin: "0 0 6px", color: "#334155", fontSize: "14px" }}>
              <strong style={{ color: "#0f172a" }}>E-mail :</strong> {userEmail}
            </p>
            <p style={{ margin: "0", color: "#334155", fontSize: "14px" }}>
              <strong style={{ color: "#0f172a" }}>Mot de passe :</strong> ****** <span style={{ fontSize: "12px", color: "#64748b" }}>(vous êtes le seul à le connaître, ne le communiquez à personne.)</span>
            </p>
          </div>
        ) : null}
        
        <p style={{ margin: "0 0 16px", color: "#334155", fontWeight: 500 }}>{greeting}</p>
        <p style={{ margin: "0 0 24px", color: "#475569" }}>{lead}</p>

        {details.length > 0 ? (
          <div style={{ margin: "0 0 24px", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
            {details.map((detail, index) => (
              <p key={detail.label} style={{ margin: index === 0 ? "0" : "12px 0 0", color: "#334155", fontSize: "14px" }}>
                <strong style={{ color: "#0f172a" }}>{detail.label} :</strong>{" "}
                <span style={detail.underline ? { textDecoration: "underline", textUnderlineOffset: "4px" } : undefined}>{detail.value}</span>
              </p>
            ))}
          </div>
        ) : null}

        {paragraphs.map((paragraph) => (
          <p key={paragraph} style={{ margin: "0 0 16px", color: "#475569" }}>
            {paragraph}
          </p>
        ))}

        {highlightedParagraphs.map((paragraph) => (
          <div key={paragraph} style={{ margin: "24px 0", padding: "16px", backgroundColor: "#fef2f2", borderLeft: "4px solid #ef4444", borderRadius: "0 8px 8px 0" }}>
            <p style={{ margin: 0, color: "#991b1b", fontWeight: 600 }}>
              {paragraph}
            </p>
          </div>
        ))}

        {children}

        {linkLabel && linkHref ? (
          <div style={{ margin: "32px 0 0" }}>
            <a 
              href={linkHref} 
              style={{ 
                display: "inline-block", 
                backgroundColor: "#2563eb", // blue-600
                color: "#ffffff", 
                textDecoration: "none", 
                padding: "12px 24px", 
                borderRadius: "6px", 
                fontWeight: 600,
                fontSize: "14px"
              }}
            >
              {linkLabel}
            </a>
          </div>
        ) : null}

        <div style={{ margin: "40px 0 0", padding: "24px", backgroundColor: "#eef2ff", borderRadius: "8px", border: "1px solid #c7d2fe", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "16px", color: "#3730a3", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <DiscordIcon className="size-5" style={{ width: "20px", height: "20px" }} />
            Rejoignez la communauté Discord
          </h3>
          <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#3730a3" }}>
            Venez échanger avec la communauté, partager vos idées et soumettre votre projet directement sur notre serveur Discord.
          </p>
          <a 
            href="https://discord.mathieucerenzia.fr" 
            style={{ 
              display: "inline-block", 
              backgroundColor: "#4f46e5", // indigo-600
              color: "#ffffff", 
              textDecoration: "none", 
              padding: "10px 20px", 
              borderRadius: "6px", 
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            Rejoindre le serveur
          </a>
        </div>

        <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e2e8f0" }}>
          <p style={{ margin: "0", color: "#64748b", fontSize: "13px" }}>
            Cet e-mail a été envoyé automatiquement. Merci de ne pas y répondre.
          </p>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12px" }}>Réf : {reference}</p>
        </div>
      </div>
    </div>
  );
}

interface SignupConfirmationEmailProps {
  firstName: string;
  email: string;
  reference: string;
}

export function SignupConfirmationEmail({ firstName, email, reference }: SignupConfirmationEmailProps) {
  return (
    <MailLayout
      title="Confirmation d'inscription"
      greeting={`Bonjour ${firstName},`}
      lead="Votre compte a bien été créé."
      userEmail={email}
      details={[
        { label: "Email", value: email, underline: true },
      ]}
      paragraphs={[
        "Si une vérification du compte est requise, pensez également à consulter l'email envoyé par le service d'authentification.",
        "Vous pouvez ensuite vous connecter et retrouver vos rendez-vous depuis votre espace compte.",
      ]}
      linkLabel="Connexion"
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

export function AdminCreatedSignupEmail({
  firstName,
  email,
  temporaryPassword,
  reference,
}: AdminCreatedSignupEmailProps) {
  return (
    <MailLayout
      title="Confirmation d'inscription"
      greeting={`Bonjour ${firstName},`}
      lead="Votre compte a été créé par l'administration."
      details={[
        { label: "Email", value: email, underline: true },
        { label: "Mot de passe temporaire", value: temporaryPassword, underline: true },
      ]}
      highlightedParagraphs={[
        "Lors de votre première connexion, il vous sera demandé de modifier ce mot de passe pour plus de sécurité.",
      ]}
      paragraphs={[
        "Vous pouvez vous connecter dès maintenant avec les identifiants ci-dessus.",
        "Conservez cet email jusqu'à votre première connexion.",
      ]}
      linkLabel="Connexion"
      linkHref={`${getAppUrl()}/connexion`}
      reference={reference}
    />
  );
}

interface ProvisionalAppointmentEmailProps {
  firstName: string;
  email: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentModeLabel: string;
  phone?: string;
  reference: string;
}

export function ProvisionalAppointmentEmail({
  firstName,
  email,
  categoryTitle,
  startsAtLabel,
  appointmentModeLabel,
  phone,
  reference,
}: ProvisionalAppointmentEmailProps) {
  return (
    <MailLayout
      title="Confirmation de prise de rendez-vous (provisoire)"
      greeting={`Bonjour ${firstName},`}
      lead={`Votre demande de rendez-vous pour « ${categoryTitle} » a bien été enregistrée à titre provisoire.`}
      userEmail={email}
      details={[
        { label: "Catégorie", value: categoryTitle, underline: true },
        { label: "Date et heure", value: startsAtLabel, underline: true },
        { label: "Type de rendez-vous", value: appointmentModeLabel, underline: true },
        { label: "Statut", value: "En attente de validation", underline: true },
      ]}
      highlightedParagraphs={["Votre demande reste provisoire tant qu'un administrateur ne l'a pas validée."]}
      linkLabel="Site"
      linkHref={getAppUrl()}
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

export function ValidatedAppointmentEmail({
  firstName,
  email,
  categoryTitle,
  startsAtLabel,
  appointmentModeLabel,
  phone,
  reference,
}: ValidatedAppointmentEmailProps) {
  return (
    <MailLayout
      title="Confirmation de rendez-vous validé"
      greeting={`Bonjour ${firstName},`}
      lead={`Votre rendez-vous pour « ${categoryTitle} » a bien été validé.`}
      userEmail={email}
      details={[
        { label: "Catégorie", value: categoryTitle, underline: true },
        { label: "Date et heure", value: startsAtLabel, underline: true },
        { label: "Type de rendez-vous", value: appointmentModeLabel, underline: true },
        { label: "Statut", value: "Validé", underline: true },
      ]}
      paragraphs={[
        "Conservez cet email. Vous pouvez retrouver l'historique de vos rendez-vous depuis votre espace compte.",
        ...(appointmentModeLabel === "Téléphonique" && phone
          ? [`Je vous appellerai sur le numéro de téléphone inscrit sur votre fiche client à savoir le : ${phone}.`]
          : []),
      ]}
      linkLabel="Mon compte"
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

export function AppointmentCancellationEmail({
  firstName,
  email,
  categoryTitle,
  startsAtLabel,
  reason,
  reference,
}: AppointmentCancellationEmailProps) {
  return (
    <MailLayout
      title="Confirmation d'annulation de rendez-vous"
      greeting={`Bonjour ${firstName},`}
      lead={`L'annulation de votre rendez-vous pour « ${categoryTitle} » a bien été prise en compte.`}
      userEmail={email}
      details={[
        { label: "Catégorie", value: categoryTitle, underline: true },
        { label: "Date et heure", value: startsAtLabel, underline: true },
        { label: "Motif", value: reason, underline: true },
      ]}
      paragraphs={["Si besoin, vous pouvez réserver un nouveau créneau directement depuis le site."]}
      linkLabel="Prendre un nouveau rendez-vous"
      linkHref={getAppUrl()}
      reference={reference}
    />
  );
}

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
      greeting="Bonjour,"
      lead="Une nouvelle demande de rendez-vous vient d'être enregistrée."
      details={[
        { label: "Date et heure", value: startsAtLabel, underline: true },
        { label: "Catégorie", value: categoryTitle, underline: true },
        { label: "Type de rendez-vous", value: appointmentModeLabel, underline: true },
        { label: "Client", value: clientFullName, underline: true },
        { label: "Email", value: clientEmail, underline: true },
        ...(clientPhone ? [{ label: "Téléphone", value: clientPhone, underline: true }] : []),
      ]}
      paragraphs={[
        ...(clientMessage ? [`Message du client : ${clientMessage}`] : []),
        "Vous pouvez consulter la fiche du rendez-vous via le lien ci-dessous.",
      ]}
      linkLabel="Voir le rendez-vous"
      linkHref={adminAppointmentUrl}
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

export function AdminBlackoutCancellationEmail({
  firstName,
  email,
  categoryTitle,
  appointmentDateLabel,
  appointmentTimeLabel,
  reason,
  reference,
}: AdminBlackoutCancellationEmailProps) {
  return (
    <MailLayout
      title="Annulation de rendez-vous"
      greeting={`Bonjour ${firstName},`}
      lead="Je vous informe que votre rendez-vous a été annulé en raison d'une indisponibilité."
      userEmail={email}
      details={[
        { label: "Date", value: appointmentDateLabel, underline: true },
        { label: "Heure", value: appointmentTimeLabel, underline: true },
        { label: "Type de rendez-vous", value: categoryTitle, underline: true },
        ...(reason ? [{ label: "Motif", value: reason, underline: true }] : []),
      ]}
      paragraphs={[
        `Vous aviez un rendez-vous le ${appointmentDateLabel} à ${appointmentTimeLabel} pour « ${categoryTitle} », mais je ne pourrai malheureusement pas l'honorer et il a donc été annulé.`,
        "Je vous présente mes sincères excuses pour la gêne occasionnée.",
        "Je vous invite à reprendre un rendez-vous sur un autre créneau disponible directement depuis le site.",
      ]}
      linkLabel="Prendre un nouveau rendez-vous"
      linkHref={getAppUrl()}
      reference={reference}
    />
  );
}

interface CustomAdminEmailProps {
  firstName: string;
  subject: string;
  message: string;
  reference: string;
}

export function CustomAdminEmail({
  firstName,
  subject,
  message,
  reference,
}: CustomAdminEmailProps) {
  return (
    <MailLayout
      title={subject}
      greeting={`Bonjour ${firstName},`}
      lead=""
      reference={reference}
    >
      <div style={{ whiteSpace: "pre-wrap", color: "#475569", margin: "0 0 16px" }}>
        {message}
      </div>
    </MailLayout>
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

export function RefusedAppointmentEmail({
  firstName,
  email,
  categoryTitle,
  startsAtLabel,
  reason,
  reference,
}: RefusedAppointmentEmailProps) {
  return (
    <MailLayout
      title="Demande de rendez-vous refusée"
      greeting={`Bonjour ${firstName},`}
      lead={`Votre demande pour « ${categoryTitle} » n'a pas pu être validée.`}
      userEmail={email}
      details={[
        { label: "Catégorie", value: categoryTitle, underline: true },
        { label: "Date et heure", value: startsAtLabel, underline: true },
        { label: "Motif", value: reason, underline: true },
      ]}
      paragraphs={["Vous pouvez choisir un autre créneau si vous souhaitez effectuer une nouvelle demande."]}
      linkLabel="Choisir un autre créneau"
      linkHref={getAppUrl()}
      reference={reference}
    />
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
  email,
  subject,
  isBookingBlocked,
  bookingBlockedMessage,
  reference,
}: ContactAcknowledgementEmailProps) {
  const paragraphs = [
    "Nous traiterons votre demande dans les plus brefs délais.",
    "Vous trouverez en pièce jointe de cet e-mail un récapitulatif de votre demande au format PDF.",
  ];

  const highlightedParagraphs = [];
  
  if (isBookingBlocked) {
    highlightedParagraphs.push(
      bookingBlockedMessage 
        ? `Information importante : ${bookingBlockedMessage}`
        : "Information importante : La prise de rendez-vous est actuellement suspendue."
    );
  }

  return (
    <MailLayout
      title="Accusé de réception de votre message"
      greeting={`Bonjour ${civility},`}
      lead="Nous avons bien reçu votre message."
      userEmail={email}
      details={[
        { label: "Objet", value: subject, underline: true },
      ]}
      paragraphs={paragraphs}
      highlightedParagraphs={highlightedParagraphs}
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

export function AdminContactNotificationEmail({
  civility,
  email,
  phone,
  subject,
  message,
  reference,
}: AdminContactNotificationEmailProps) {
  return (
    <MailLayout
      title="Nouveau message de contact"
      greeting="Bonjour,"
      lead="Vous avez reçu un nouveau message via le formulaire de contact urgence."
      details={[
        { label: "Civilité", value: civility },
        { label: "Email", value: email, underline: true },
        { label: "Téléphone", value: phone || "Non renseigné" },
        { label: "Objet", value: subject, underline: true },
      ]}
      paragraphs={[
        "Message :",
        message,
      ]}
      reference={reference}
    />
  );
}