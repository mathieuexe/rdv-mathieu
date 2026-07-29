import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export default function LegalNoticePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <PublicHeader />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-3xl font-semibold">Mentions légales</h1>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Éditeur du site</h2>
            <p>Nom ou raison sociale : M. CERENZIA Mathieu</p>
            <p>Responsable de la publication : M. CERENZIA Mathieu</p>
            <p>Adresse : Sauvian, France</p>
            <p>Email : info@mathieucerenzia.fr</p>
            <p>SIREN / SIRET : 883272437</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Hébergement</h2>
            <p>Hébergeur principal : Vercel Inc.</p>
            <p>Site web : https://vercel.com</p>
            <p>Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Activité du site</h2>
            <p>
              Ce site permet la prise de rendez-vous en ligne, la gestion des demandes de contact et, selon les cas,
              l&apos;accès à un espace utilisateur.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Données personnelles</h2>
            <p>
              Les données collectées via les formulaires sont utilisées uniquement pour la gestion des comptes, des
              rendez-vous et des échanges liés au service proposé.
            </p>
            <p>
              Conformément à la réglementation applicable, vous pouvez demander l&apos;accès, la rectification ou la
              suppression de vos données en contactant l&apos;éditeur du site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Propriété intellectuelle</h2>
            <p>
              Les contenus, textes, éléments graphiques et composants du site sont protégés par le droit applicable. Toute
              reproduction ou réutilisation sans autorisation préalable est interdite.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
