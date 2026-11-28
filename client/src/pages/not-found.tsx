import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOCATION_CONTENT } from "@/lib/location-content";
import { useLang } from "@/lib/ui-text";
import { areaAr } from "@/lib/listing-text-ar";

// Arabic on /ar/ addresses (29 Nov).
const T404 = {
  en: {
    title: "Page not found | PLACES",
    eyebrow: "Page not found",
    h1: "We couldn't find that page",
    lead: "The page may have moved, or the link may be mistyped. Search for an office or browse by location.",
    searchLabel: "Search offices",
    placeholder: "Area, project or developer",
    search: "Search",
    byLocation: "Offices by location",
    officesIn: (_slug: string, name: string) => `Offices in ${name}`,
    browse: "Browse all listings",
  },
  ar: {
    title: "الصفحة غير موجودة | PLACES",
    eyebrow: "الصفحة غير موجودة",
    h1: "لم نجد هذه الصفحة",
    lead: "ربما نُقلت الصفحة أو كُتب الرابط بشكل خاطئ. ابحث عن مكتب أو تصفح المكاتب حسب المنطقة.",
    searchLabel: "ابحث عن مكتب",
    placeholder: "المنطقة أو المشروع أو المطور",
    search: "بحث",
    byLocation: "المكاتب حسب المنطقة",
    officesIn: (slug: string, _name: string) => `مكاتب في ${areaAr(slug)}`,
    browse: "تصفح كل المكاتب",
  },
};

// Shown for unknown routes. The server already answers these with HTTP 404;
// this keeps the client view noindex and canonical-free to match.
function useNoIndex(title: string) {
  useEffect(() => {
    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robots?.getAttribute("content") ?? null;
    robots?.setAttribute("content", "noindex, follow");
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonical?.remove();
    const previousTitle = document.title;
    document.title = title;
    return () => {
      if (robots && previousRobots) robots.setAttribute("content", previousRobots);
      if (canonical) document.head.appendChild(canonical);
      document.title = previousTitle;
    };
  }, [title]);
}

export default function NotFound() {
  const { lang, isAr, href } = useLang();
  const t = T404[lang];
  useNoIndex(t.title);
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-background" lang={isAr ? "ar" : undefined}>
      <Navbar />
      <main className="flex-1 container mx-auto px-5 md:px-10 max-w-3xl pt-32 pb-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent mb-3">{t.eyebrow}</p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">{t.h1}</h1>
        <p className="text-muted-foreground mb-8">
          {t.lead}
        </p>

        <form
          role="search"
          className="flex gap-2 mb-10"
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            navigate(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings");
          }}
        >
          <label htmlFor="not-found-search" className="sr-only">{t.searchLabel}</label>
          <Input
            id="not-found-search"
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            className="bg-white"
          />
          <Button type="submit" className="bg-primary text-white shrink-0">
            <Search className="w-4 h-4 me-2" /> {t.search}
          </Button>
        </form>

        <h2 className="text-lg font-serif font-bold text-primary mb-3">{t.byLocation}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-10">
          {Object.values(LOCATION_CONTENT).map((loc) => (
            <li key={loc.slug}>
              <Link href={href(`/locations/${loc.slug}`)} className="text-primary hover:text-accent underline-offset-4 hover:underline">
                {t.officesIn(loc.slug, loc.displayName)}
              </Link>
            </li>
          ))}
        </ul>

        <Link href={href("/listings")}>
          <Button className="bg-accent hover:bg-accent/90 text-white">{t.browse}</Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
