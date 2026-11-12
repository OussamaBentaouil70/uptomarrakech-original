import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import type { Lang, Post, Product } from "@/lib/types";
import { getCategoryLabel } from "@/lib/locale";

const formatDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { year: "numeric", month: "long", day: "numeric" });

export function ProductCard({ item, lang }: { item: Product; lang: Lang }) {
  const cover = item.images[0];
  return (
    <Link href={item.path} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/40 bg-card/60 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-card/80 hover:shadow-xl">
        <div className="relative h-64 w-full overflow-hidden bg-secondary/30">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.src}
              alt={cover.alt || item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />
        </div>
        <div className="flex flex-1 flex-col p-6">
          {item.categoryType && (
            <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{getCategoryLabel(lang, item.categoryType)}</span>
          )}
          <h3 className="ui-heading mb-3 text-2xl font-semibold leading-tight">{item.title}</h3>
          <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
          <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors group-hover:text-primary">
            {lang === "fr" ? "Découvrir" : "Discover"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}

export function PostCard({ post, lang }: { post: Post; lang: Lang }) {
  return (
    <Link
      href={post.path}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="relative h-56 overflow-hidden bg-secondary/30">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.coverAlt || post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col space-y-3 p-6">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
          <Calendar className="h-3 w-3" /> {formatDate(post.date, lang)}
        </p>
        <h3 className="ui-heading text-xl font-bold leading-tight transition-colors group-hover:text-primary">{post.title}</h3>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <span className="pt-2 text-xs font-bold uppercase tracking-widest text-primary">{lang === "fr" ? "Lire l'article →" : "Read article →"}</span>
      </div>
    </Link>
  );
}

export { formatDate };
