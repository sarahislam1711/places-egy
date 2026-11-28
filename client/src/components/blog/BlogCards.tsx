import { Link } from "wouter";
import { ArrowRight, Clock } from "lucide-react";
import { formatPostDate, pickBlogImage, stripHtml, type BlogLang, type BlogPost } from "@/lib/blog";
import { topicLabel } from "@/lib/blog-topics";

// Blog cards (28 Nov redesign), same family as the guides hub cards: white
// card on the cream page, photo on top, no borders or resting shadows.

const T = {
  en: { min: "min read", read: "Read article" },
  ar: { min: "دقيقة قراءة", read: "اقرأ المقال" },
} as const;

function serif(lang: BlogLang) {
  return lang === "ar" ? "font-serif-ar" : "font-serif";
}

function Meta({ post, lang, date = true }: { post: BlogPost; lang: BlogLang; date?: boolean }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      {date && (
        <>
          <span>{formatPostDate(post.date)}</span>
          <span aria-hidden>·</span>
        </>
      )}
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" aria-hidden /> {post.readingTimeMinutes} {T[lang].min}
      </span>
    </span>
  );
}

export function TopicPill({ post, lang, className = "" }: { post: BlogPost; lang: BlogLang; className?: string }) {
  const label = topicLabel(post, lang);
  if (!label) return null;
  return (
    <span className={`inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent ${className}`}>{label}</span>
  );
}

export function PostCard({ post, lang, basePath }: { post: BlogPost; lang: BlogLang; basePath: string }) {
  return (
    <Link
      href={`${basePath}/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative aspect-[1.91/1] overflow-hidden bg-muted">
        {post.featuredImage && (
          <img
            src={pickBlogImage(post.featuredImage, "related") ?? post.featuredImage.url}
            alt={post.featuredImage.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <TopicPill post={post} lang={lang} className="self-start" />
        <h3 className={`mt-3 text-lg font-bold leading-snug text-primary transition-colors group-hover:text-accent ${serif(lang)}`}>
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{stripHtml(post.excerpt)}</p>
        <span className="mt-auto pt-4">
          <Meta post={post} lang={lang} />
        </span>
      </div>
    </Link>
  );
}

/** The newest post, large. */
export function FeaturedPost({ post, lang, basePath }: { post: BlogPost; lang: BlogLang; basePath: string }) {
  return (
    <Link
      href={`${basePath}/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative aspect-[1.91/1] overflow-hidden bg-muted">
        {post.featuredImage && (
          <img
            src={pickBlogImage(post.featuredImage, "hero") ?? post.featuredImage.url}
            alt={post.featuredImage.alt}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <span className="flex flex-wrap items-center gap-3">
          <TopicPill post={post} lang={lang} />
          <Meta post={post} lang={lang} />
        </span>
        <h3 className={`mt-4 text-2xl md:text-[1.9rem] font-bold leading-tight text-primary transition-colors group-hover:text-accent ${serif(lang)}`}>
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 leading-relaxed text-muted-foreground">{stripHtml(post.excerpt)}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
          {T[lang].read} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

/** A compact row: small photo + title. Used for "Latest" next to the featured post. */
export function PostRow({ post, lang, basePath }: { post: BlogPost; lang: BlogLang; basePath: string }) {
  return (
    <Link
      href={`${basePath}/${post.slug}`}
      className="group flex items-center gap-4 rounded-2xl bg-white p-3 pe-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="relative aspect-[1.91/1] w-32 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44">
        {post.featuredImage && (
          <img
            src={pickBlogImage(post.featuredImage, "card") ?? post.featuredImage.url}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </span>
      <span className="min-w-0">
        <span className={`line-clamp-3 text-[15px] font-bold leading-snug text-primary transition-colors group-hover:text-accent ${serif(lang)}`}>
          {post.title}
        </span>
        <span className="mt-1.5 block">
          <Meta post={post} lang={lang} date={false} />
        </span>
      </span>
    </Link>
  );
}
