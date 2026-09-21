import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export default function LegalNoticePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicHeader />

      <main className="flex-1 px-6 pb-20 pt-12 sm:pt-16">
        <div className="mx-auto max-w-[720px] space-y-10">
          <div>
            <h1 className="da-display text-[32px] leading-[1.15] sm:text-[40px]">Mentions légales</h1>
          </div>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Éditeur du site</h2>
            <p>Nom ou raison sociale : M. CERENZIA Mathieu</p>
            <p>Responsable de la publication : M. CERENZIA Mathieu</p>
            <p>Adresse : Sauvian, France</p>
            <p>Email : info@mathieucerenzia.fr</p>
            <p>SIREN / SIRET : 883272437</p>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Hébergement</h2>
            <p>Hébergeur principal : Vercel Inc.</p>
            <p>Site web : https://vercel.com</p>
            <p>Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Activité du site</h2>
            <p>
              Ce site permet la prise de rendez-vous en ligne, la gestion des demandes de contact et, selon les cas,
              l&apos;accès à un espace utilisateur.
            </p>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Données personnelles</h2>
            <p>
              Les données collectées via les formulaires sont utilisées uniquement pour la gestion des comptes, des
              rendez-vous et des échanges liés au service proposé.
            </p>
            <p>
              Conformément à la réglementation applicable, vous pouvez demander l&apos;accès, la rectification ou la
              suppression de vos données en contactant l&apos;éditeur du site.
            </p>
          </section>

          <section className="da-reveal space-y-3 text-[15px] leading-relaxed text-slate-500">
            <h2 className="da-title text-[20px]">Propriété intellectuelle</h2>
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
