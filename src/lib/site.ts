import type { Lang } from "@/lib/types";

export const SITE = {
  name: "Up To Marrakech",
  url: "https://uptomarrakech.com",
  email: "contact@uptomarrakech.com",
  phoneDisplay: "+212 6 99-12 47 35",
  phoneHref: "tel:+212699124735",
  whatsappNumber: "212699124735",
  logo: "/assets/brand/uptomarrakech-logo.png",
  googleTag: "GT-KVML6VR3",
  googleSiteVerification: "34hvOPhFEMjBIJMe_DllyCKILd2SF3keFfLChF9AXMs",
  socials: {
    instagram: "https://www.instagram.com/uptomarrakech/",
    facebook: "https://www.facebook.com/profile.php?id=61560347476465",
    tiktok: "https://www.tiktok.com/@uptomarrakech",
  },
};

export const whatsappHref = (message?: string) =>
  `https://wa.me/${SITE.whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export type NavLink = { href: string; label: string } | { label: string; children: { href: string; label: string }[] };

/** Same menu as the WordPress site (header). */
export const NAV: Record<Lang, NavLink[]> = {
  fr: [
    { href: "/location-villas/", label: "Hébergement" },
    { href: "/activites/", label: "Activités" },
    { href: "/beach-club-marrakech/", label: "Beach clubs" },
    { href: "/boites-de-nuit/", label: "Boîtes de nuit" },
    { href: "/restaurants/", label: "Restaurants" },
    { href: "/spas/", label: "Spa" },
    {
      label: "Transport",
      children: [
        { href: "/location-de-voiture/", label: "Location de voiture" },
        { href: "/transport-touristique/", label: "Transport touristique" },
      ],
    },
    { href: "/blog/", label: "Blog" },
    { href: "/contactez-nous/", label: "Contact" },
  ],
  en: [
    { href: "/en/rent-villa/", label: "Accommodation" },
    { href: "/en/activities/", label: "Activities" },
    { href: "/en/beach-club/", label: "Beach clubs" },
    { href: "/en/night-club/", label: "Night clubs" },
    { href: "/en/restaurants/", label: "Restaurants" },
    { href: "/en/spas/", label: "Spa" },
    {
      label: "Transport",
      children: [
        { href: "/en/car-rental/", label: "Car rental" },
        { href: "/en/tourist-transportation/", label: "Tourist transport" },
      ],
    },
    { href: "/en/blog/", label: "Blog" },
    { href: "/en/contact-us/", label: "Contact" },
  ],
};

export const FOOTER_NAV: Record<Lang, { href: string; label: string }[]> = {
  fr: [
    { href: "/", label: "Accueil" },
    { href: "/location-villas/", label: "Hébergement" },
    { href: "/activites/", label: "Activités" },
    { href: "/restaurants/", label: "Restaurants" },
    { href: "/organisation-evenements/", label: "Événements" },
    { href: "/location-de-voiture/", label: "Location de voiture" },
    { href: "/blog/", label: "Blog" },
    { href: "/contactez-nous/", label: "Contact" },
  ],
  en: [
    { href: "/en/", label: "Home" },
    { href: "/en/rent-villa/", label: "Accommodation" },
    { href: "/en/activities/", label: "Activities" },
    { href: "/en/restaurants/", label: "Restaurants" },
    { href: "/en/event-organization/", label: "Events" },
    { href: "/en/car-rental/", label: "Car rental" },
    { href: "/en/blog/", label: "Blog" },
    { href: "/en/contact-us/", label: "Contact" },
  ],
};

/** Partner logos shown on the home page (same as the WordPress home page), linked to their pages. */
export const PARTNERS: { name: string; logo: string; href: Record<Lang, string> }[] = [
  {
    name: "Rooftop Garden by Nobu",
    logo: "/assets/partners/nobu.png",
    href: { fr: "/restaurants/rooftop-marrakech/", en: "/en/restaurants/rooftop-garden-by-nobu/" },
  },
  {
    name: "Nouba",
    logo: "/assets/partners/nouba.png",
    href: { fr: "/restaurants/nouba-restaurant-marrakech/", en: "/en/restaurants/nouba/" },
  },
  {
    name: "Theatro",
    logo: "/assets/partners/theatro.png",
    href: { fr: "/boites-de-nuit/club-marrakech/", en: "/en/night-club/theatro/" },
  },
  {
    name: "Nommos",
    logo: "/assets/partners/nommos.png",
    href: { fr: "/restaurants/nommos-marrakech/", en: "/en/restaurants/nommos/" },
  },
  {
    name: "L'Epicurien",
    logo: "/assets/partners/epicurien.png",
    href: { fr: "/restaurants/lepicurien-marrakech-restaurant/", en: "/en/restaurants/the-epicurean/" },
  },
];

export const HOME_HERO_IMAGE = "/assets/hero-home.jpg";
/** "Votre référence…" section (Pixabay #7396510, Ben Youssef Madrasa — Pixabay Content License). */
export const HOME_ABOUT_IMAGE = "/assets/home-about.jpg";

export const HOME_PATH: Record<Lang, string> = { fr: "/", en: "/en/" };
export const BLOG_PATH: Record<Lang, string> = { fr: "/blog/", en: "/en/blog/" };
