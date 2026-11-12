import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTiktok, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FOOTER_NAV, HOME_PATH, SITE, whatsappHref } from "@/lib/site";
import type { Lang } from "@/lib/types";

export function SiteFooter({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const socials = [
    { href: SITE.socials.instagram, icon: faInstagram, label: "Instagram" },
    { href: SITE.socials.facebook, icon: faFacebook, label: "Facebook" },
    { href: SITE.socials.tiktok, icon: faTiktok, label: "TikTok" },
  ];

  return (
    <footer className="mt-20 border-t border-border/70 bg-[linear-gradient(165deg,rgba(255,250,243,0.9),rgba(245,236,218,0.72))]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div className="space-y-3">
          <Link href={HOME_PATH[lang]} className="group inline-block" aria-label={SITE.name}>
            <div className="relative h-24 w-64 overflow-hidden transition-transform duration-500 group-hover:scale-105">
              <Image src={SITE.logo} alt={SITE.name} fill sizes="256px" className="object-contain object-left" />
            </div>
          </Link>
          <p className="ui-subtle">
            {fr
              ? "Villas, restaurants, activités, beach clubs et conciergerie à Marrakech."
              : "Villas, restaurants, activities, beach clubs and concierge services in Marrakech."}
          </p>
          <a href={`mailto:${SITE.email}`} className="block text-zinc-700 hover:text-zinc-950">{SITE.email}</a>
          <a href={SITE.phoneHref} className="block text-zinc-700 hover:text-zinc-950">{SITE.phoneDisplay}</a>
        </div>

        <div>
          <p className="ui-heading text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600">Navigation</p>
          <nav className="mt-3 grid grid-cols-2 gap-2">
            {FOOTER_NAV[lang].map((item) => (
              <Link key={item.href} href={item.href} className="text-zinc-700 transition-colors hover:text-zinc-950">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="ui-heading text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600">
            {fr ? "Contact direct" : "Direct contact"}
          </p>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-3 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="h-5 w-5" />
            <span>WhatsApp</span>
          </a>
          <div className="mt-5 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-white text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-white"
              >
                <FontAwesomeIcon icon={s.icon} className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="mt-5 text-zinc-500">Copyright © {new Date().getFullYear()} {SITE.name}</p>
        </div>
      </div>
    </footer>
  );
}
