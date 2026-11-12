import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE } from "@/lib/site";

export type Crumb = { href: string; label: string };

/** Breadcrumbs with schema.org BreadcrumbList (first crumb = home). */
export function SiteBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length < 2) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${SITE.url}${c.href}` })),
  };

  return (
    <nav aria-label="Breadcrumb" className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="mx-auto flex w-full max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 text-xs sm:text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
              {isLast ? (
                <span className="whitespace-nowrap font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
