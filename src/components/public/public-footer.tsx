import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5 text-sm text-neutral-600">
        <p>Copyright © {new Date().getFullYear()} RDV Mathieu. Tous droits reserves.</p>
        <Link href="/mentions-legales" className="underline underline-offset-4">
          Mentions legales
        </Link>
      </div>
    </footer>
  );
}
