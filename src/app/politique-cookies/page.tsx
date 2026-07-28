import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export default function CookiePolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <PublicHeader />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-3xl font-semibold">Politique en matiere de cookies</h1>
            <p className="mt-3 text-sm text-neutral-600">
              Cette page explique les cookies utilises par le site ainsi que les donnees personnelles collectées lors de
              l&apos;utilisation des formulaires, de l&apos;espace compte et de la prise de rendez-vous.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Pourquoi utilisons-nous des cookies ?</h2>
            <p>
              Les cookies et donnees de session sont utilises pour assurer le bon fonctionnement du site, maintenir la
              connexion a votre compte, securiser l&apos;authentification et permettre l&apos;acces a votre historique de
              rendez-vous.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Cookies et sessions utilises</h2>
            <p>
              Le site utilise principalement des cookies techniques de session lies a Supabase Auth. Ils permettent de
              reconnaitre un utilisateur connecte, de conserver sa session apres actualisation de page et d&apos;eviter de se
              reconnecter a chaque visite tant que la session est valide.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Donnees personnelles collectées</h2>
            <p>Selon les formulaires utilises, nous pouvons collecter les informations suivantes :</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>adresse email ;</li>
              <li>prenom et nom ;</li>
              <li>mot de passe chiffre via le fournisseur d&apos;authentification ;</li>
              <li>numero de telephone ;</li>
              <li>message libre saisi dans le cadre d&apos;une demande de rendez-vous ;</li>
              <li>historique des rendez-vous, statuts, motifs de refus ou d&apos;annulation ;</li>
              <li>donnees minimales de session necessaires au maintien de la connexion.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">A quoi servent ces donnees ?</h2>
            <p>Ces informations sont necessaires pour :</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>creer et gerer votre compte utilisateur ;</li>
              <li>lier vos rendez-vous a votre compte et afficher votre historique ;</li>
              <li>vous permettre d&apos;annuler un rendez-vous et d&apos;en conserver la trace ;</li>
              <li>envoyer les confirmations et informations relatives a vos demandes ;</li>
              <li>permettre a l&apos;administrateur de traiter les rendez-vous ;</li>
              <li>assurer la securite et le maintien de votre session connectee.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Pourquoi ces informations sont necessaires ?</h2>
            <p>
              Sans cookies techniques ni donnees d&apos;identification, le site ne pourrait pas reconnaitre un utilisateur
              connecte, rattacher les rendez-vous au bon compte, afficher un historique personnel fiable ni proposer la
              gestion des annulations depuis l&apos;espace compte.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Conservation et droits</h2>
            <p>
              Les cookies techniques sont conserves le temps necessaire au fonctionnement du service ou jusqu&apos;a expiration
              de la session. Les donnees personnelles liees au compte et aux rendez-vous sont conservees pour assurer le
              suivi de la relation utilisateur et la gestion administrative du service.
            </p>
            <p>
              Vous pouvez demander l&apos;acces, la rectification ou la suppression de vos donnees personnelles en contactant
              l&apos;editeur du site via les coordonnees mentionnees dans les mentions legales.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
