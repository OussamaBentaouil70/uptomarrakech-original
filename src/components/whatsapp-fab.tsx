import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { whatsappHref } from "@/lib/site";
import type { Lang } from "@/lib/types";

export function WhatsAppFAB({ lang }: { lang: Lang }) {
  const message =
    lang === "fr" ? "Bonjour, je souhaite avoir des informations sur vos services." : "Hello, I would like to inquire about your services.";

  return (
    <a
      href={whatsappHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-100 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all animate-float-y hover:scale-110 active:scale-95"
      aria-label={lang === "fr" ? "Contactez-nous sur WhatsApp" : "Contact us on WhatsApp"}
    >
      <span className="absolute -inset-2 rounded-full bg-[#25D366] opacity-20 blur-lg transition-opacity group-hover:opacity-40" />
      <FontAwesomeIcon icon={faWhatsapp} className="relative" style={{ width: 34, height: 34 }} />
      <span className="absolute right-full mr-4 hidden whitespace-nowrap rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block">
        {lang === "fr" ? "Discutons" : "Chat with us"}
      </span>
    </a>
  );
}
