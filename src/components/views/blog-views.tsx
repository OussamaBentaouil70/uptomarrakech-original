import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, User } from "lucide-react";
import type { Lang, Page, Post, Product } from "@/lib/types";
import { BLOG_PATH, SITE } from "@/lib/site";
import { PostCard, formatDate } from "@/components/views/cards";

export function BlogIndexView({ lang, page, posts }: { lang: Lang; page: Page | null; posts: Post[] }) {
  const fr = lang === "fr";
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <section className="ui-shell ui-shell-ornament mb-8 bg-primary/5">
        <p className="ui-eyebrow mb-2">{fr ? "Journal" : "Journal"}</p>
        <h1 className="ui-section-title">{page?.title || "Blog"}</h1>
        <p className="mt-2 text-sm text-zinc-600 md:text-base">
          {fr
            ? "Guides, inspirations et bonnes adresses pour vivre Marrakech autrement."
            : "Guides, inspiration and local recommendations from Marrakech."}
        </p>
      </section>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} lang={lang} />
        ))}
      </div>
    </div>
  );
}

/** "Book this place" card linking the article to the venue / activity it is about. */
function RelatedProductCard({ lang, product }: { lang: Lang; product: Product }) {
  const fr = lang === "fr";
  const img = product.images[1] ?? product.images[0];
  return (
    <Link href={product.path} className="group ui-surface mt-12 grid overflow-hidden sm:grid-cols-[220px_1fr]">
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.src} alt={img.alt || product.title} loading="lazy" className="h-48 w-full object-cover sm:h-full" />
      )}
      <div className="space-y-3 p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{fr ? "Réservez avec Up To Marrakech" : "Book with Up To Marrakech"}</p>
        <h2 className="ui-heading text-2xl font-semibold">{product.title}</h2>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.excerpt}</p>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors group-hover:text-primary">
          {fr ? "Voir et réserver" : "View & book"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function PostView({ lang, post, related, product }: { lang: Lang; post: Post; related: Post[]; product: Product | null }) {
  const fr = lang === "fr";
  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[60vh] w-full overflow-hidden bg-secondary/30">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.coverAlt || post.title} className="h-full w-full object-cover" fetchPriority="high" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 flex items-end justify-center px-6 pb-16">
          <div className="w-full max-w-4xl space-y-6 text-center">
            <Link
              href={BLOG_PATH[lang]}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-primary transition-opacity hover:opacity-70"
            >
              <ArrowLeft className="h-3 w-3" /> {fr ? "Retour au blog" : "Back to the blog"}
            </Link>
            <h1 className="ui-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">{post.title}</h1>
            <div className="flex items-center justify-center gap-8 pt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-3 w-3" /> <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
              </span>
              <span className="flex items-center gap-2">
                <User className="h-3 w-3" /> {fr ? "Par" : "By"} {SITE.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        {product && <RelatedProductCard lang={lang} product={product} />}
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl space-y-6 px-6 pb-12">
          <h2 className="ui-heading border-b border-border/40 pb-4 text-3xl font-semibold">{fr ? "À lire aussi" : "Read next"}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
