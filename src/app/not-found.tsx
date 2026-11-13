import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE } from "@/lib/site";

// Exported as out/404.html: Cloudflare Pages serves it with a real 404 status for unknown URLs.
export const metadata: Metadata = {
  title: { absolute: `Page introuvable (404) | ${SITE.name}` },
  description: "La page demandée n’existe pas ou a été déplacée. Retrouvez nos villas, restaurants et activités à Marrakech depuis l’accueil.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader lang="fr" alternates={{ fr: "/", en: "/en/" }} />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center px-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="ui-eyebrow mt-6">Erreur 404</p>
        <h1 className="ui-section-title mt-3">Page introuvable</h1>
        <p className="ui-prose mt-4 text-lg">
          La page que vous cherchez n&apos;existe pas ou a été déplacée. Revenez à l&apos;accueil pour découvrir nos villas, restaurants et activités à
          Marrakech.
        </p>
        <p className="mt-2 text-sm text-muted-foreground" lang="en">
          Page not found: the page you are looking for does not exist or has moved.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/en/"
            hrefLang="en"
            className="rounded-full border border-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Back to home (EN)
          </Link>
        </div>
      </main>
      <SiteFooter lang="fr" />
    </>
  );
}
