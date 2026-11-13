/**
 * Mention de propriété affichée au pied de chaque widget intégré : le logiciel
 * de prise de rendez-vous appartient à Mathieu Cerenzia, quel que soit le site
 * qui l'affiche.
 */
export function EmbedCopyright() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-4 border-t border-slate-100 pt-3 text-center text-[11px] leading-relaxed text-slate-400">
      <p>
        © {year}{" "}
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
        >
          Mathieu Cerenzia
        </a>{" "}
        · Logiciel de prise de rendez-vous · Tous droits réservés
      </p>
    </footer>
  );
}
