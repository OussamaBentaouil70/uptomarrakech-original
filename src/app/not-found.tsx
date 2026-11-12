import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader lang="fr" alternates={{ fr: "/", en: "/en/" }} />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center px-4 py-24 text-center">
        <p className="ui-eyebrow">404</p>
        <h1 className="ui-section-title mt-3">Page introuvable · Page not found</h1>
        <p className="ui-prose mt-4">Cette page n&apos;existe plus. · This page no longer exists.</p>
        <div className="mt-8 flex gap-4">
          <Link href="/" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Accueil</Link>
          <Link href="/en/" className="rounded-full border border-primary px-6 py-3 text-sm font-bold text-primary">Home</Link>
        </div>
      </main>
      <SiteFooter lang="fr" />
    </>
  );
}
