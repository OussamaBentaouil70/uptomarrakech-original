"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { getLocaleFromPathname } from "@/lib/locale";
import { LEGAL_PATHS, SITE } from "@/lib/site";
import type { Lang } from "@/lib/types";

/**
 * Cookie consent (Law 09-08 / GDPR / ePrivacy):
 * - nothing non-essential is loaded before the visitor chooses;
 * - "Refuse" is as easy as "Accept"; "Customise" allows per-category choice;
 * - the choice is stored for 6 months and can be changed via <CookieSettingsLink />.
 */
const STORAGE_KEY = "upto-consent";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182; // ~6 months
const OPEN_EVENT = "upto:open-cookie-settings";

type Consent = { v: 1; analytics: boolean; date: number };

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    if (c.v !== 1 || Date.now() - c.date > MAX_AGE_MS) return null;
    return c;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, analytics, date: Date.now() } satisfies Consent));
  } catch {
    /* storage blocked: the banner will simply show again next visit */
  }
}

let analyticsLoaded = false;

/** Google tag (same ID as the WordPress site), injected only after consent. */
function loadAnalytics() {
  if (analyticsLoaded || typeof window === "undefined") return;
  analyticsLoaded = true;
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", SITE.googleTag, { anonymize_ip: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${SITE.googleTag}`;
  document.head.appendChild(s);
}

/** Remove Google Analytics cookies after consent is withdrawn. */
function clearAnalyticsCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (/^_ga|^_gid|^_gat/.test(name)) {
      for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}

const TEXT = {
  fr: {
    title: "Votre vie privée",
    body: "Nous utilisons des cookies strictement nécessaires au fonctionnement et à la sécurité du site. Avec votre accord, nous utilisons aussi des cookies de mesure d’audience (Google Analytics) pour améliorer le site. Vous pouvez changer d’avis à tout moment.",
    more: "Politique de confidentialité",
    accept: "Tout accepter",
    refuse: "Tout refuser",
    customize: "Personnaliser",
    save: "Enregistrer mes choix",
    necessary: "Strictement nécessaires",
    necessaryDesc: "Sécurité, protection anti-spam des formulaires et mémorisation de votre choix. Toujours actifs.",
    analytics: "Mesure d’audience",
    analyticsDesc: "Google Analytics : pages consultées, durée de visite, type d’appareil. Déposés uniquement avec votre accord (13 mois max).",
    always: "Toujours actifs",
    close: "Fermer",
  },
  en: {
    title: "Your privacy",
    body: "We use cookies that are strictly necessary for the site to work and stay secure. With your consent, we also use audience measurement cookies (Google Analytics) to improve the site. You can change your mind at any time.",
    more: "Privacy policy",
    accept: "Accept all",
    refuse: "Refuse all",
    customize: "Customise",
    save: "Save my choices",
    necessary: "Strictly necessary",
    necessaryDesc: "Security, anti-spam protection of forms and remembering your choice. Always on.",
    analytics: "Audience measurement",
    analyticsDesc: "Google Analytics: pages viewed, visit duration, device type. Only set with your consent (13 months max).",
    always: "Always on",
    close: "Close",
  },
} as const;

export function CookieConsent() {
  const pathname = usePathname();
  const lang: Lang = getLocaleFromPathname(pathname);
  const t = TEXT[lang];
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    // Read the stored choice after hydration (the static HTML never contains the banner).
    const timer = window.setTimeout(() => {
      const c = readConsent();
      if (c) {
        setAnalytics(c.analytics);
        if (c.analytics) loadAnalytics();
      } else {
        setOpen(true);
      }
    }, 0);
    const onOpen = () => {
      setAnalytics(readConsent()?.analytics ?? false);
      setCustom(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  const decide = useCallback((allowAnalytics: boolean) => {
    const before = readConsent()?.analytics ?? false;
    saveConsent(allowAnalytics);
    setAnalytics(allowAnalytics);
    setOpen(false);
    setCustom(false);
    if (allowAnalytics) loadAnalytics();
    else if (before || analyticsLoaded) {
      clearAnalyticsCookies();
      // A loaded Google tag can't be unloaded: reload so it is gone from the page.
      window.location.reload();
    }
  }, []);

  if (!open) return null;

  const btn = "rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all";

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-3 bottom-3 z-[130] mx-auto max-w-3xl rounded-3xl border border-border/60 bg-white p-5 shadow-2xl sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
          <Cookie className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h2 id="cookie-title" className="ui-heading text-xl font-semibold">
              {t.title}
            </h2>
            {readConsent() && (
              <button type="button" onClick={() => setOpen(false)} aria-label={t.close} className="p-1 text-zinc-400 hover:text-zinc-800">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <p className="text-sm leading-relaxed text-zinc-600">
            {t.body}{" "}
            <Link href={LEGAL_PATHS.privacy[lang]} className="font-semibold text-primary underline-offset-2 hover:underline">
              {t.more}
            </Link>
          </p>

          {custom && (
            <div className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{t.necessary}</p>
                  <p className="text-xs text-zinc-500">{t.necessaryDesc}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-500">{t.always}</span>
              </div>
              <label className="flex cursor-pointer items-start justify-between gap-4">
                <span>
                  <span className="block text-sm font-semibold text-zinc-900">{t.analytics}</span>
                  <span className="block text-xs text-zinc-500">{t.analyticsDesc}</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="relative mt-1 h-6 w-11 shrink-0 rounded-full bg-zinc-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary"
                />
              </label>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={() => decide(false)} className={`${btn} border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900`}>
              {t.refuse}
            </button>
            {custom ? (
              <button type="button" onClick={() => decide(analytics)} className={`${btn} border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900`}>
                {t.save}
              </button>
            ) : (
              <button type="button" onClick={() => setCustom(true)} className={`${btn} border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900`}>
                {t.customize}
              </button>
            )}
            <button type="button" onClick={() => decide(true)} className={`${btn} border border-primary bg-primary text-primary-foreground hover:brightness-110`}>
              {t.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Link/button that reopens the cookie settings (footer, privacy policy). */
export function CookieSettingsLink({ lang, className }: { lang: Lang; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className={className ?? "font-semibold text-primary underline-offset-2 hover:underline"}
    >
      {lang === "fr" ? "Gérer les cookies" : "Manage cookies"}
    </button>
  );
}
