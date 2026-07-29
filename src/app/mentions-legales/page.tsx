import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export default function LegalNoticePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <PublicHeader />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-3xl font-semibold">Mentions legales</h1>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Editeur du site</h2>
            <p>Nom ou raison sociale : M. CERENZIA Mathieu</p>
            <p>Responsable de la publication : M. CERENZIA Mathieu</p>
            <p>Adresse : Sauvian, France</p>
            <p>Email : info@mathieucerenzia.fr</p>
            <p>SIREN / SIRET : 883272437</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Hebergement</h2>
            <p>Hebergeur principal : Vercel Inc.</p>
            <p>Site web : https://vercel.com</p>
            <p>Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, Etats-Unis</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Activite du site</h2>
            <p>
              Ce site permet la prise de rendez-vous en ligne, la gestion des demandes de contact et, selon les cas,
              l&apos;acces a un espace utilisateur.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Donnees personnelles</h2>
            <p>
              Les donnees collectees via les formulaires sont utilisees uniquement pour la gestion des comptes, des
              rendez-vous et des echanges lies au service propose.
            </p>
            <p>
              Conformement a la reglementation applicable, vous pouvez demander l&apos;acces, la rectification ou la
              suppression de vos donnees en contactant l&apos;editeur du site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Propriete intellectuelle</h2>
            <p>
              Les contenus, textes, elements graphiques et composants du site sont proteges par le droit applicable. Toute
              reproduction ou reutilisation sans autorisation prealable est interdite.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
