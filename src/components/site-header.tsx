"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faHouse } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { HOME_PATH, NAV, SITE } from "@/lib/site";
import type { Lang } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Props = {
  lang: Lang;
  /** Path of this page in each language (language switcher). */
  alternates: Partial<Record<Lang, string>>;
};

function LanguageSwitch({ lang, alternates, transparent, size = "md" }: Props & { transparent: boolean; size?: "sm" | "md" }) {
  const item = (target: Lang, flag: string, label: string) => (
    // Plain <a>: switching language is a full page load (different <html lang>).
    <a
      href={alternates[target] ?? HOME_PATH[target]}
      hrefLang={target}
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center justify-center rounded-full transition-all",
        size === "sm" ? "h-6 w-6" : "h-7 w-7",
        lang === target ? "ring-2 ring-primary" : "opacity-50 hover:opacity-100",
      )}
    >
      <span className={cn("fi rounded-sm", flag, size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
    </a>
  );
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border p-1 transition-colors duration-300",
        transparent ? "border-white/30 bg-white/10" : "border-border/70 bg-white shadow-sm",
      )}
    >
      {item("fr", "fi-fr", "Français")}
      {item("en", "fi-gb", "English")}
    </div>
  );
}

export function SiteHeader({ lang, alternates }: Props) {
  const pathname = usePathname();
  const links = NAV[lang];
  const home = HOME_PATH[lang];
  const isHomePage = pathname === home || pathname === home.replace(/\/$/, "");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCurrent = (href: string) => href !== home && (pathname === href || pathname === href.replace(/\/$/, "") || pathname.startsWith(href));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHomePage && !scrolled;
  const linkClass = (active: boolean) =>
    cn(
      "group relative px-3 py-2 text-sm font-medium transition-colors duration-300",
      "after:absolute after:-bottom-0.5 after:left-3 after:h-0.5 after:w-[calc(100%-1.5rem)] after:origin-left after:scale-x-0 after:rounded-full after:transition-transform after:duration-300",
      active
        ? transparent
          ? "text-white after:bg-white after:scale-x-100"
          : "text-zinc-800 after:bg-zinc-900 after:scale-x-100"
        : transparent
          ? "text-white/90 hover:text-white after:bg-white hover:after:scale-x-100"
          : "text-zinc-700 hover:text-zinc-900 after:bg-zinc-900 hover:after:scale-x-100",
    );

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-50 transition-all duration-500",
        transparent ? "fixed bg-transparent py-4" : "sticky bg-white/90 py-2 shadow-sm supports-backdrop-filter:backdrop-blur-md",
      )}
      suppressHydrationWarning
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between gap-4">
          <Link href={home} className="group py-1" aria-label={SITE.name}>
            <div className="relative h-16 w-44 overflow-hidden transition-transform duration-500 group-hover:scale-105 md:h-20 md:w-52">
              <Image
                src={SITE.logo}
                alt={SITE.name}
                fill
                priority
                sizes="208px"
                className={cn("object-contain transition-[filter] duration-500", transparent && "brightness-0 invert")}
              />
            </div>
          </Link>

          {/* Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitch lang={lang} alternates={alternates} transparent={transparent} size="sm" />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                aria-label="Menu"
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all",
                  transparent
                    ? "border-white/60 bg-white/10 text-white supports-backdrop-filter:backdrop-blur-sm hover:bg-white/20"
                    : "border-border/70 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50",
                )}
              >
                <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[86vw] max-w-sm bg-white p-0">
                <SheetHeader className="border-b border-border/60 px-5 py-4">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-4">
                  <Link href={home} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-zinc-700">
                    <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
                    {lang === "fr" ? "Accueil" : "Home"}
                  </Link>
                  {links.map((link) =>
                    "children" in link ? (
                      <div key={link.label} className="space-y-1 px-2 py-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{link.label}</p>
                        {link.children.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn("block px-2 py-2 text-sm font-medium", isCurrent(sub.href) ? "text-zinc-900" : "text-zinc-600")}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn("px-2 py-2.5 text-sm font-medium", isCurrent(link.href) ? "text-zinc-900" : "text-zinc-600")}
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                  <div className="mt-4 space-y-2 border-t border-border/60 px-2 pt-4 text-sm text-zinc-600">
                    <a href={SITE.phoneHref} className="block">{SITE.phoneDisplay}</a>
                    <a href={`mailto:${SITE.email}`} className="block">{SITE.email}</a>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link href={home} aria-label={lang === "fr" ? "Accueil" : "Home"} className={cn(linkClass(isHomePage), "inline-flex items-center")}>
              <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
            </Link>
            {links.map((link) =>
              "children" in link ? (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger className={cn(linkClass(link.children.some((c) => isCurrent(c.href))), "flex items-center gap-1 outline-none")}>
                    {link.label} <ChevronDown className="h-3 w-3 opacity-60 transition-transform group-data-open:rotate-180" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 rounded-2xl border-border/40 bg-white/95 p-2 shadow-2xl backdrop-blur-md">
                    {link.children.map((sub) => (
                      <DropdownMenuItem key={sub.href} className="overflow-hidden rounded-xl p-0 data-highlighted:bg-black data-highlighted:text-white">
                        <Link
                          href={sub.href}
                          className={cn(
                            "flex w-full items-center px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-black hover:text-white",
                            isCurrent(sub.href) && "bg-primary/10 font-semibold text-primary",
                          )}
                        >
                          {sub.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={link.href} href={link.href} className={linkClass(isCurrent(link.href))}>
                  {link.label}
                </Link>
              ),
            )}
            <div className="ml-2">
              <LanguageSwitch lang={lang} alternates={alternates} transparent={transparent} />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
