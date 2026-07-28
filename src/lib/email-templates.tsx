import { getAppUrl } from "@/lib/env";

type MailDetail = {
  label: string;
  value: string;
};

interface MailLayoutProps {
  title: string;
  intro: string;
  details?: MailDetail[];
  paragraphs?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  reference: string;
}

function MailLayout({ title, intro, details = [], paragraphs = [], ctaLabel, ctaHref, reference }: MailLayoutProps) {
  return (
    <div
      style={{
        margin: 0,
        padding: "32px 16px",
        backgroundColor: "#f5f5f4",
        color: "#111111",
        fontFamily:
          'Gilroy, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          border: "1px solid #e7e5e4",
          borderRadius: "24px",
          padding: "32px",
        }}
      >
        <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#78716c" }}>
          Prise de rendez-vous - Mathieu CERENZIA
        </p>
        <h1 style={{ margin: "16px 0 0", fontSize: "28px", lineHeight: "1.2", color: "#111111" }}>{title}</h1>
        <p style={{ margin: "16px 0 0", fontSize: "16px", lineHeight: "1.7", color: "#44403c" }}>{intro}</p>

        {details.length > 0 ? (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              borderRadius: "18px",
              border: "1px solid #e7e5e4",
              backgroundColor: "#fafaf9",
            }}
          >
            {details.map((detail) => (
              <div key={detail.label} style={{ marginTop: detail === details[0] ? 0 : "14px" }}>
                <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#78716c" }}>
                  {detail.label}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: "15px", lineHeight: "1.6", color: "#111111" }}>{detail.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {paragraphs.map((paragraph) => (
          <p key={paragraph} style={{ margin: "18px 0 0", fontSize: "15px", lineHeight: "1.7", color: "#44403c" }}>
            {paragraph}
          </p>
        ))}

        {ctaLabel && ctaHref ? (
          <div style={{ marginTop: "28px" }}>
            <a
              href={ctaHref}
              style={{
                display: "inline-block",
                borderRadius: "999px",
                backgroundColor: "#111111",
                color: "#ffffff",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {ctaLabel}
            </a>
          </div>
        ) : null}

        <div style={{ marginTop: "28px", borderTop: "1px solid #e7e5e4", paddingTop: "18px" }}>
          <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.7", color: "#78716c" }}>
            Mail envoye automatiquement merci de ne pas y repondre
          </p>
          <p style={{ margin: "8px 0 0", fontSize: "12px", lineHeight: "1.7", color: "#78716c" }}>ref mail : {reference}</p>
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
      intro={`Bonjour ${firstName}, votre compte a bien ete cree.`}
      details={[
        { label: "Email", value: email },
        { label: "Connexion", value: `${getAppUrl()}/connexion` },
      ]}
      paragraphs={[
        "Si une verification de compte est requise, pensez egalement a consulter l'email de confirmation de connexion envoye par le service d'authentification.",
        "Vous pouvez ensuite vous connecter et retrouver vos rendez-vous depuis votre espace compte.",
      ]}
      ctaLabel="Ouvrir la connexion"
      ctaHref={`${getAppUrl()}/connexion`}
      reference={reference}
    />
  );
}

interface ProvisionalAppointmentEmailProps {
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  reference: string;
}

export function ProvisionalAppointmentEmail({
  firstName,
  categoryTitle,
  startsAtLabel,
  reference,
}: ProvisionalAppointmentEmailProps) {
  return (
    <MailLayout
      title="Confirmation de prise de rendez-vous"
      intro={`Bonjour ${firstName}, votre demande pour "${categoryTitle}" a bien ete enregistree a titre provisoire.`}
      details={[
        { label: "Categorie", value: categoryTitle },
        { label: "Date et heure", value: startsAtLabel },
        { label: "Statut", value: "En attente de validation" },
      ]}
      paragraphs={["Votre demande reste provisoire tant qu'un administrateur ne l'a pas validee."]}
      ctaLabel="Voir le site"
      ctaHref={getAppUrl()}
      reference={reference}
    />
  );
}

interface ValidatedAppointmentEmailProps {
  firstName: string;
  categoryTitle: string;
  startsAtLabel: string;
  reference: string;
}

export function ValidatedAppointmentEmail({
  firstName,
  categoryTitle,
  startsAtLabel,
  reference,
}: ValidatedAppointmentEmailProps) {
  return (
    <MailLayout
      title="Confirmation de rendez-vous"
      intro={`Bonjour ${firstName}, votre rendez-vous pour "${categoryTitle}" est valide.`}
      details={[
        { label: "Categorie", value: categoryTitle },
        { label: "Date et heure", value: startsAtLabel },
        { label: "Statut", value: "Valide" },
      ]}
      paragraphs={["Conservez cet email. Vous pouvez retrouver l'historique de vos rendez-vous depuis votre espace compte."]}
      ctaLabel="Acceder a mon compte"
      ctaHref={`${getAppUrl()}/compte`}
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
      title="Confirmation annulation rendez-vous"
      intro={`Bonjour ${firstName}, l'annulation de votre rendez-vous pour "${categoryTitle}" a bien ete prise en compte.`}
      details={[
        { label: "Categorie", value: categoryTitle },
        { label: "Date et heure", value: startsAtLabel },
        { label: "Motif", value: reason },
      ]}
      paragraphs={["Si besoin, vous pouvez reserver un nouveau creneau directement depuis le site."]}
      ctaLabel="Prendre un nouveau rendez-vous"
      ctaHref={getAppUrl()}
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
      title="Demande de rendez-vous refusee"
      intro={`Bonjour ${firstName}, votre demande pour "${categoryTitle}" n'a pas pu etre validee.`}
      details={[
        { label: "Categorie", value: categoryTitle },
        { label: "Date et heure", value: startsAtLabel },
        { label: "Motif", value: reason },
      ]}
      paragraphs={["Vous pouvez choisir un autre creneau si vous souhaitez refaire une demande."]}
      ctaLabel="Choisir un autre creneau"
      ctaHref={getAppUrl()}
      reference={reference}
    />
  );
}
