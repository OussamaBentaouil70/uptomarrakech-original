import type { Lang } from "@/lib/types";

/** Kept for components copied from mymarrakechtrip. */
export type Locale = Lang;

/** French is the default language (no prefix); English lives under /en/. */
export function getLocaleFromPathname(pathname?: string | null): Lang {
  return pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "fr";
}

export function thankYouPath(lang: Lang, type: "reservation" | "contact" = "reservation"): string {
  return `${lang === "en" ? "/en/thank-you/" : "/merci/"}?type=${type}`;
}

export function getCategoryLabel(locale: Lang, categoryType: string): string {
  const labels: Record<string, [string, string]> = {
    accommodation: ["Hébergement", "Accommodation"],
    night_club: ["Boîte de nuit", "Night Club"],
    activity: ["Activité", "Activity"],
    beach_club: ["Beach Club", "Beach Club"],
    restaurant: ["Restaurant", "Restaurant"],
    car_rental: ["Location de voiture", "Car Rental"],
    tourist_transport: ["Transport touristique", "Tourist Transport"],
    spa: ["Spa", "Spa"],
    event: ["Événement", "Event"],
  };
  const pair = labels[categoryType];
  return pair ? pair[locale === "fr" ? 0 : 1] : categoryType;
}
