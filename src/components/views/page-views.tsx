import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Lang, Page, TextBlock } from "@/lib/types";
import { HOME_PATH, SITE } from "@/lib/site";
import { ContactForm } from "@/components/contact-form";
import { InquiryForm } from "@/components/inquiry-form";

/** Group extracted Elementor text into { heading, paragraphs } sections. */
export function toSections(blocks: TextBlock[]) {
  const sections: { tag: string; heading: string; paragraphs: string[] }[] = [];
  for (const b of blocks) {
    if (/^h[1-6]$/.test(b.tag)) sections.push({ tag: b.tag, heading: b.text, paragraphs: [] });
    else if (sections.length) sections.at(-1)!.paragraphs.push(b.text);
  }
  return sections;
}

/** Descriptions of the photos used on the transport and contact pages (alt text). */
const PHOTO_ALT: Record<string, { fr: string; en: string }> = {
  "navettes.jpg": { fr: "Passagère souriante installée à l’arrière d’une voiture avec chauffeur", en: "Smiling passenger seated in the back of a chauffeur-driven car" },
  "voiture-avec-chauffeur.jpg": { fr: "Chauffeur en costume ouvrant la portière d’une berline noire à une cliente", en: "Chauffeur in a suit opening the door of a black sedan for a client" },
  "event-transport.jpg": { fr: "Autocars garés devant un centre de congrès, sous les palmiers", en: "Coaches parked outside a conference centre, under palm trees" },
  "voiture-marriage.jpg": { fr: "Bouquet de mariée posé sur le capot d’une voiture de mariage", en: "Bridal bouquet on the bonnet of a wedding car" },
  "pexels-mehdi-el-marouazi-884979055-20700637-scaled.jpg": { fr: "Minaret de la Koutoubia à Marrakech sous un ciel nuageux", en: "Koutoubia minaret in Marrakech under a cloudy sky" },
};
const photoAlt = (src: string, lang: Lang, fallback: string) => PHOTO_ALT[src.split("/").pop() ?? ""]?.[lang] ?? fallback;

/** Only real uploaded images (Elementor pages also contain plugin icons). */
export const contentImages = (page: Page) => page.images.filter((src) => src.startsWith("/wp-content/uploads/"));

export function ContentPageView({ lang, page }: { lang: Lang; page: Page }) {
  const isCar = /range-rover/.test(page.slug);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-12 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <h1 className="ui-display mb-8 text-4xl font-bold tracking-tight md:text-5xl">{page.title}</h1>
          <div className="prose max-w-none text-lg" dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
        </article>
        <aside>
          <div className="ui-surface sticky top-28 border-primary/15 bg-linear-to-b from-white to-card p-6 shadow-2xl">
            <InquiryForm itemId={String(page.id)} itemSlug={page.slug} categoryType={isCar ? "car_rental" : "activity"} />
          </div>
        </aside>
      </div>
    </div>
  );
}

export function TransportView({ lang, page }: { lang: Lang; page: Page }) {
  const fr = lang === "fr";
  const sections = toSections(page.blocks);
  const h1 = sections.find((s) => s.tag === "h1");
  const intro = sections.find((s) => s.tag === "h2" && s.paragraphs.length);
  const services = sections.filter((s) => s.tag === "h3" && s.paragraphs.length);
  const extras = sections.filter((s) => s.tag === "h3" && !s.paragraphs.length);
  const images = contentImages(page);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border/40">
        {images[0] && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[0]} alt={photoAlt(images[0], lang, h1?.heading ?? page.title)} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}
        <div className="relative px-6 py-24 text-center md:py-28">
          <h1 className="ui-display mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">{h1?.heading ?? page.title}</h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-6 py-16">
        {intro && (
          <section className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="ui-heading text-3xl font-semibold">{intro.heading}</h2>
            {intro.paragraphs.map((p) => (
              <p key={p} className="text-lg leading-relaxed text-muted-foreground">{p}</p>
            ))}
          </section>
        )}

        {services.length > 0 && (
          <section className="space-y-10">
            <div className="text-center">
              <p className="ui-eyebrow">{fr ? "Nos services" : "Our services"}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {services.map((s, i) => (
                <article
                  key={s.heading}
                  className="group relative flex flex-col rounded-[2rem] border border-border/50 bg-white p-3 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-2xl"
                >
                  {images[i] && (
                    <div className="relative aspect-[3/2] overflow-hidden rounded-[1.5rem] bg-secondary/30">
                      {/* Same 3:2 ratio as the photos, so nothing is cropped */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={images[i]}
                        alt={photoAlt(images[i], lang, s.heading)}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 font-sans text-sm font-semibold tracking-wider text-zinc-900 shadow-md backdrop-blur-md">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-6">
                    <h3 className="ui-heading text-2xl font-semibold leading-tight">{s.heading}</h3>
                    {s.paragraphs.map((p) => (
                      <p key={p} className="text-[15px] leading-relaxed text-muted-foreground">{p}</p>
                    ))}
                    <a
                      href="#devis"
                      className="mt-auto inline-flex items-center gap-2 pt-3 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:text-zinc-900"
                    >
                      {fr ? "Demander un devis" : "Request a quote"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section id="devis" className="grid scroll-mt-28 gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="ui-heading text-3xl font-semibold">{fr ? "Demandez votre devis personnalisé" : "Request a personalised quote"}</h2>
            <p className="text-muted-foreground">
              {fr
                ? "Remplissez le formulaire et notre équipe vous recontactera rapidement."
                : "Fill in the form and our team will get back to you quickly."}
            </p>
            {extras.length > 0 && (
              <ul className="space-y-2 pt-4">
                {extras.map((e) => (
                  <li key={e.heading} className="flex items-start gap-2 text-sm text-zinc-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {e.heading}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ContactForm lang={lang} serviceType={fr ? "Transport touristique" : "Tourist transport"} />
        </section>
      </div>
    </div>
  );
}

export function ContactView({ lang, page }: { lang: Lang; page: Page }) {
  const fr = lang === "fr";
  const sections = toSections(page.blocks);
  const intro = page.blocks.find((b) => b.tag === "h6")?.text;
  const hours = sections.find((s) => /horaires|opening/i.test(s.heading))?.paragraphs[0];
  const image = contentImages(page)[0];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:py-12">
      <section className="overflow-hidden rounded-[2rem] border border-border/50 bg-[linear-gradient(150deg,rgba(255,255,255,0.82),rgba(248,238,221,0.92))] shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
            <p className="ui-eyebrow mb-3">{fr ? "Commencez votre voyage" : "Begin your journey"}</p>
            <h1 className="ui-section-title max-w-xl">{page.title}</h1>
            {intro && <p className="ui-prose mt-4 max-w-xl text-base sm:text-lg">{intro}</p>}
          </div>
          <div className="relative min-h-80 lg:min-h-full">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={photoAlt(image, lang, "Marrakech")} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <ContactForm lang={lang} />
        <div className="ui-surface-soft space-y-5 p-5 sm:p-6">
          <p className="ui-heading text-lg font-semibold">{SITE.name}</p>
          <p className="flex items-center gap-3 text-zinc-700"><Mail className="h-4 w-4 text-primary" /> <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
          <p className="flex items-center gap-3 text-zinc-700"><Phone className="h-4 w-4 text-primary" /> <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a></p>
          <p className="flex items-center gap-3 text-zinc-700"><MapPin className="h-4 w-4 text-primary" /> Marrakech, {fr ? "Maroc" : "Morocco"}</p>
          {hours && <p className="flex items-center gap-3 text-zinc-700"><Clock className="h-4 w-4 text-primary" /> {hours}</p>}
        </div>
      </div>
    </div>
  );
}

export function ThankYouView({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <CheckCircle2 className="h-16 w-16 text-primary" />
      <h1 className="ui-section-title mt-6">{fr ? "Merci !" : "Thank you!"}</h1>
      <p className="ui-prose mt-4 text-lg">
        {fr
          ? "Votre demande a bien été envoyée. Notre équipe vous répondra très rapidement. Un email de confirmation vous a été envoyé."
          : "Your request has been sent. Our team will get back to you very soon. A confirmation email is on its way."}
      </p>
      <Link href={HOME_PATH[lang]} className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground">
        {fr ? "Retour à l'accueil" : "Back to home"}
      </Link>
    </div>
  );
}
