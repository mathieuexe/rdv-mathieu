import { getAppUrl } from "@/lib/env";

type MailDetail = {
  label: string;
  value: string;
  underline?: boolean;
};

interface MailLayoutProps {
  title: string;
  greeting: string;
  lead: string;
  details?: MailDetail[];
  paragraphs?: string[];
  highlightedParagraphs?: string[];
  linkLabel?: string;
  linkHref?: string;
  reference: string;
}

function MailLayout({
  title,
  greeting,
  lead,
  details = [],
  paragraphs = [],
  highlightedParagraphs = [],
  linkLabel,
  linkHref,
  reference,
}: MailLayoutProps) {
  return (
    <div
      style={{
        margin: 0,
        padding: "0",
        backgroundColor: "#ffffff",
        color: "#111111",
        textAlign: "left",
        fontFamily:
          'Gilroy, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.7,
        fontSize: "15px",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "8px 0",
          textAlign: "left",
        }}
      >
        <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#555555" }}>
          Prise de rendez-vous - Mathieu CERENZIA
        </p>
        <p style={{ margin: 0, fontSize: "18px", lineHeight: "1.5", color: "#111111", fontWeight: 700 }}>{title}</p>
        <p style={{ margin: "18px 0 0", color: "#111111" }}>{greeting}</p>
        <p style={{ margin: "10px 0 0", color: "#111111" }}>{lead}</p>

        {details.length > 0 ? (
          <div style={{ marginTop: "18px" }}>
            {details.map((detail) => (
              <p key={detail.label} style={{ margin: detail === details[0] ? "0" : "8px 0 0", color: "#111111" }}>
                <strong>{detail.label} :</strong>{" "}
                <span style={detail.underline ? { textDecoration: "underline" } : undefined}>{detail.value}</span>
              </p>
            ))}
          </div>
        ) : null}

        {paragraphs.map((paragraph) => (
          <p key={paragraph} style={{ margin: "14px 0 0", color: "#111111" }}>
            {paragraph}
          </p>
        ))}

        {highlightedParagraphs.map((paragraph) => (
          <p key={paragraph} style={{ margin: "14px 0 0", color: "#dc2626", fontWeight: 700 }}>
            {paragraph}
          </p>
        ))}

        {linkLabel && linkHref ? (
          <p style={{ margin: "18px 0 0", color: "#111111" }}>
            <strong>{linkLabel} :</strong>{" "}
            <a href={linkHref} style={{ color: "#111111", textDecoration: "underline" }}>
              {linkHref}
            </a>
          </p>
        ) : null}

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #dddddd" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#555555" }}>
            Mail envoyé automatiquement, merci de ne pas y répondre.
          </p>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#555555" }}>Réf mail : {reference}</p>
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
  categoryTitle: string;
  startsAtLabel: string;
  appointmentModeLabel: string;
  phone?: string;
  reference: string;
}

export function ProvisionalAppointmentEmail({
  firstName,
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
      details={[
        { label: "Catégorie", value: categoryTitle, underline: true },
        { label: "Date et heure", value: startsAtLabel, underline: true },
        { label: "Type de rendez-vous", value: appointmentModeLabel, underline: true },
        { label: "Statut", value: "En attente de validation", underline: true },
      ]}
      highlightedParagraphs={["Votre demande reste provisoire tant qu'un administrateur ne l'a pas validée."]}
      paragraphs={[
        ...(appointmentModeLabel === "Téléphonique" && phone
          ? [`Je vous appellerai sur le numéro de téléphone inscrit sur votre fiche client à savoir le : ${phone}.`]
          : []),
      ]}
      linkLabel="Site"
      linkHref={getAppUrl()}
      reference={reference}
    />
  );
}

interface ValidatedAppointmentEmailProps {
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  appointmentModeLabel: string;
  phone?: string;
  reference: string;
}

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
      title="Confirmation de rendez-vous validé"
      greeting={`Bonjour ${firstName},`}
      lead={`Votre rendez-vous pour « ${categoryTitle} » a bien été validé.`}
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
  categoryTitle: string;
  startsAtLabel: string;
  reason: string;
  reference: string;
}

export function AppointmentCancellationEmail({
  firstName,
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

interface RefusedAppointmentEmailProps {
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  reason: string;
  reference: string;
}

export function RefusedAppointmentEmail({
  firstName,
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
