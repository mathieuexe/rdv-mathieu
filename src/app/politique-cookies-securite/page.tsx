import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export default function CookieAndSecurityPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicHeader />

      <main className="flex-1 px-6 pb-20 pt-12 sm:pt-16">
        <div className="mx-auto max-w-[720px] space-y-10">
          <div>
            <h1 className="da-display text-[32px] leading-[1.15] sm:text-[40px]">Politique en matière de cookies et de sécurité</h1>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-500">
              Cette page explique les cookies techniques utilisés par le site, les données personnelles collectées,
              ainsi que les informations de sécurité et de journalisation enregistrées lors de l&apos;utilisation du
              service.
            </p>
          </div>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Pourquoi utilisons-nous des cookies ?</h2>
            <p>
              Les cookies et données de session sont utilisés pour assurer le bon fonctionnement du site, maintenir la
              connexion à votre compte, sécuriser l&apos;authentification et permettre l&apos;accès à votre historique de
              rendez-vous.
            </p>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Cookies et sessions utilisés</h2>
            <p>
              Le site utilise principalement des cookies techniques de session liés à Supabase Auth. Ils permettent de
              reconnaître un utilisateur connecté, de conserver sa session après actualisation de page et d&apos;éviter de se
              reconnecter à chaque visite tant que la session est valide.
            </p>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Données personnelles collectées</h2>
            <p>Selon les formulaires et fonctionnalités utilisés, nous pouvons collecter les informations suivantes :</p>
            <ul className="list-disc space-y-2 pl-6 marker:text-accent">
              <li>adresse email ;</li>
              <li>prénom et nom ;</li>
              <li>mot de passe chiffré via le fournisseur d&apos;authentification ;</li>
              <li>numéro de téléphone ;</li>
              <li>message libre saisi dans le cadre d&apos;une demande de rendez-vous ;</li>
              <li>historique des rendez-vous, statuts, motifs de refus ou d&apos;annulation ;</li>
              <li>historique des modifications du profil client ;</li>
              <li>historique des connexions, déconnexions, prises de rendez-vous et annulations ;</li>
              <li>adresse IP ;</li>
              <li>pays, région et ville approximatifs lorsque ces informations sont transmises par l&apos;hébergeur ;</li>
              <li>type d&apos;appareil, système d&apos;exploitation, navigateur et chaîne user-agent ;</li>
              <li>données minimales de session nécessaires au maintien de la connexion.</li>
            </ul>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">À quoi servent ces données ?</h2>
            <p>Ces informations sont nécessaires pour :</p>
            <ul className="list-disc space-y-2 pl-6 marker:text-accent">
              <li>créer et gérer votre compte utilisateur ;</li>
              <li>lier vos rendez-vous à votre compte et afficher votre historique ;</li>
              <li>vous permettre d&apos;annuler un rendez-vous et d&apos;en conserver la trace ;</li>
              <li>envoyer les confirmations et informations relatives à vos demandes ;</li>
              <li>permettre à l&apos;administrateur de traiter les rendez-vous ;</li>
              <li>détecter, tracer et comprendre certaines actions liées à la sécurité du compte ;</li>
              <li>assurer la sécurité et le maintien de votre session connectée.</li>
            </ul>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Sécurité et journalisation</h2>
            <p>
              Afin de sécuriser l&apos;accès à l&apos;espace client et de conserver une traçabilité des actions réalisées, le site
              journalise certains événements tels que les connexions, déconnexions, mises à jour du profil, prises de
              rendez-vous et annulations.
            </p>
            <p>
              Ces journaux peuvent inclure des informations techniques telles que l&apos;adresse IP, une localisation
              approximative, le type d&apos;appareil, le système d&apos;exploitation, le navigateur et l&apos;horodatage de
              l&apos;action.
            </p>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Services externes</h2>
            <p>
              Lorsque certaines options sont activées, le site peut charger des services externes, comme un widget de
              contact WhatsApp fourni par Elfsight. Ces services peuvent appliquer leurs propres mécanismes techniques,
              soumis à leurs politiques respectives.
            </p>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Pourquoi ces informations sont nécessaires ?</h2>
            <p>
              Sans cookies techniques ni données d&apos;identification, le site ne pourrait pas reconnaître un utilisateur
              connecté, rattacher les rendez-vous au bon compte, afficher un historique personnel fiable ni proposer la
              gestion des annulations depuis l&apos;espace compte.
            </p>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Conservation et droits</h2>
            <p>
              Les cookies techniques sont conservés le temps nécessaire au fonctionnement du service ou jusqu&apos;à
              expiration de la session. Les données personnelles liées au compte, aux rendez-vous et aux journaux
              d&apos;activité sont conservées pour assurer le suivi de la relation utilisateur, la sécurité du service et la
              gestion administrative du site.
            </p>
            <p>
              Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données personnelles en contactant
              l&apos;éditeur du site via les coordonnées mentionnées dans les mentions légales.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
