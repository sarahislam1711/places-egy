import { listingSnippet } from "./listing-text";
import { totalPrice } from "./listing-pricing";

const BASE_URL = "https://places-egy.com";

const LOCATIONS = [
  "New Cairo",
  "Sheikh Zayed",
  "6th October",
  "Downtown Cairo",
  "Sheraton",
  "Maadi",
];

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": `${BASE_URL}/#organization`,
  name: "PLACES",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/opengraph.jpg`,
    width: 1280,
    height: 720,
  },
  image: {
    "@type": "ImageObject",
    url: `${BASE_URL}/opengraph.jpg`,
    width: 1280,
    height: 720,
  },
  email: "admin@places-egy.com",
  telephone: "+201063618217",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  areaServed: LOCATIONS.map((name) => ({ "@type": "Place", name })),
  knowsAbout: [
    "Administrative office real estate",
    "Administrative office leasing",
    "Corporate leasing",
    "Office space in Cairo",
    "Office sales and acquisitions",
    "Real estate investment advisory",
  ],
  founder: [
    {
      "@type": "Person",
      name: "Mohamed Safwat",
      jobTitle: "Co-Founder",
      image: `${BASE_URL}/images/Mohamed%20Safwat%20.JPG`,
      worksFor: { "@id": `${BASE_URL}/#organization` },
    },
    {
      "@type": "Person",
      name: "Ahmed Eslam",
      jobTitle: "Co-Founder",
      image: `${BASE_URL}/images/Ahmed%20Eslam.JPG`,
      worksFor: { "@id": `${BASE_URL}/#organization` },
    },
  ],
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    value: 21,
  },
  slogan: "Egypt's specialized partner for administrative office real estate.",
  description:
    "PLACES specializes in administrative office real estate across Egypt — buy, lease, or resell with trusted developers.",
  sameAs: [
    "https://www.instagram.com/places.egy",
    "https://www.facebook.com/share/1CMGKrymLB/",
    "https://www.linkedin.com/company/places-egy/",
    "https://www.tiktok.com/@places.eg",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  name: "PLACES",
  url: `${BASE_URL}/`,
  publisher: { "@id": `${BASE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/listings?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    url: `${BASE_URL}${opts.url}`,
    provider: { "@id": `${BASE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "Egypt" },
  };
}

export function listingSchema(listing: {
  id: number;
  title: string;
  description?: string | null;
  images?: string[] | null;
  price?: number | null;
  currency?: string | null;
  transaction_type?: string | null;
  property_type?: string | null;
  subtype?: string | null;
  location?: string | null;
  area_sqm?: number | null;
  price_per_meter?: number | null;
  outdoor_area_sqm?: number | null;
  outdoor_price_per_meter?: number | null;
  price_is_lump_sum?: boolean | null;
}) {
  // Unit specs (area, transaction type, subtype) ride along as
  // additionalProperty entries.
  const additionalProperty: { "@type": "PropertyValue"; name: string; value: string | number; unitCode?: string }[] = [];
  if (listing.area_sqm) {
    additionalProperty.push({ "@type": "PropertyValue", name: "Floor area", value: listing.area_sqm, unitCode: "MTK" });
  }
  if (listing.transaction_type) {
    additionalProperty.push({ "@type": "PropertyValue", name: "Transaction type", value: listing.transaction_type });
  }
  if (listing.subtype) {
    additionalProperty.push({ "@type": "PropertyValue", name: "Subtype", value: listing.subtype });
  }

  // Build the canonical URL inline rather than importing listingUrl to keep
  // schema.ts dependency-free. Must match slugify() in lib/faq.ts exactly.
  const titleSlug = listing.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const url = `${BASE_URL}/listings/${listing.id}${titleSlug ? `-${titleSlug}` : ""}`;

  // Plain RealEstateListing, not Product: typing a lease as a Product made
  // Google check every listing as a shop item (GSC Merchant listings warned
  // about missing shipping and return policies on all of them). Descriptions
  // are stored as Markdown; schema gets plain text.
  const plainDescription = listing.description ? listingSnippet(listing.description, 5000) : "";
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    name: listing.title,
    url,
    ...(plainDescription && { description: plainDescription }),
    ...(listing.images?.length && {
      image: listing.images.map((url) => ({
        "@type": "ImageObject",
        url: url.startsWith("http") ? url : `${BASE_URL}${url}`,
        contentUrl: url.startsWith("http") ? url : `${BASE_URL}${url}`,
        caption: listing.title,
      })),
    }),
    ...(listing.property_type && { category: listing.property_type }),
    ...(listing.area_sqm && {
      floorSize: { "@type": "QuantitativeValue", value: listing.area_sqm, unitCode: "MTK" },
    }),
    ...(additionalProperty.length && { additionalProperty }),
    offers: {
      "@type": "Offer",
      priceCurrency: listing.currency === "USD" ? "USD" : "EGP",
      // Total incl. outdoor space (charged separately; see listing-pricing.ts).
      ...(listing.price && { price: totalPrice(listing) || listing.price }),
      availability: "https://schema.org/InStock",
      url,
      seller: { "@id": `${BASE_URL}/#organization` },
    },
    ...(listing.location && {
      areaServed: { "@type": "Place", name: listing.location },
    }),
  };
}

export function glossarySchema(terms: { term: string; definition: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "PLACES Real Estate Glossary",
    url: `${BASE_URL}/glossary`,
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.definition,
      inDefinedTermSet: `${BASE_URL}/glossary`,
    })),
  };
}

// Approximate centroids for Cairo's six business districts PLACES serves.
// Values are the district center in decimal degrees (WGS84). Used to populate
// `geo` on Place entities so LLMs and Google Maps can associate location pages
// with actual coordinates — unlocks "office near X" style queries and
// improves local pack ranking.
const DISTRICT_GEO: Record<string, { latitude: number; longitude: number }> = {
  "New Cairo": { latitude: 30.0286, longitude: 31.4972 },
  "Sheikh Zayed": { latitude: 30.0713, longitude: 30.9749 },
  "6th October": { latitude: 29.9694, longitude: 30.9375 },
  "Downtown Cairo": { latitude: 30.0444, longitude: 31.2357 },
  Sheraton: { latitude: 30.1010, longitude: 31.3648 },
  Maadi: { latitude: 29.9603, longitude: 31.2569 },
};

// Google Maps search URL for a district — used as `hasMap` on Place entities.
function districtMapUrl(name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ", Cairo, Egypt")}`;
}

export function placeSchema(opts: {
  name: string;
  description: string;
  url?: string;
}) {
  const geo = DISTRICT_GEO[opts.name];
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: opts.name,
    description: opts.description,
    address: {
      "@type": "PostalAddress",
      addressRegion: opts.name,
      addressLocality: "Cairo",
      addressCountry: "EG",
    },
    ...(geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
      hasMap: districtMapUrl(opts.name),
    }),
    ...(opts.url && { url: `${BASE_URL}${opts.url}` }),
  };
}

export function locationsCollectionSchema(
  places: { name: string; description: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "PLACES Locations",
    url: `${BASE_URL}/locations`,
    hasPart: places.map((p) => {
      const geo = DISTRICT_GEO[p.name];
      return {
        "@type": "Place",
        name: p.name,
        description: p.description,
        address: {
          "@type": "PostalAddress",
          addressRegion: p.name,
          addressLocality: "Cairo",
          addressCountry: "EG",
        },
        ...(geo && {
          geo: {
            "@type": "GeoCoordinates",
            latitude: geo.latitude,
            longitude: geo.longitude,
          },
          hasMap: districtMapUrl(p.name),
        }),
      };
    }),
  };
}

export function contactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact PLACES",
    url: `${BASE_URL}/contact`,
    mainEntity: { "@id": `${BASE_URL}/#organization` },
  };
}

export function blogIndexSchema(opts: {
  posts: { title: string; slug: string; date: string; excerpt?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BASE_URL}/blog#blog`,
    name: "PLACES Blog",
    url: `${BASE_URL}/blog`,
    description:
      "Market insights, investor guides, and location analysis for administrative office real estate in Egypt.",
    publisher: { "@id": `${BASE_URL}/#organization` },
    blogPost: opts.posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${BASE_URL}/blog/${p.slug}`,
      datePublished: p.date,
      ...(p.excerpt && { description: p.excerpt }),
    })),
  };
}

export function blogPostingSchema(post: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  author: { name: string };
  featuredImage?: { url: string; width?: number; height?: number };
  categories: { name: string }[];
  tags?: { name: string }[];
}, basePath: "/blog" | "/ar/blog" = "/blog") {
  // Arabic posts live under /ar/blog; /blog/<arabic-slug> only 301s there.
  const url = `${BASE_URL}${basePath}/${post.slug}`;
  // wordCount is required for Article rich-result eligibility on long-form posts.
  const wordCount = post.content
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    wordCount,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: { "@id": `${BASE_URL}/#organization` },
    ...(post.featuredImage && {
      image: {
        "@type": "ImageObject",
        url: post.featuredImage.url.startsWith("http")
          ? post.featuredImage.url
          : `${BASE_URL}${post.featuredImage.url}`,
        ...(post.featuredImage.width && { width: post.featuredImage.width }),
        ...(post.featuredImage.height && { height: post.featuredImage.height }),
      },
    }),
    articleSection: post.categories.map((c) => c.name),
    ...(post.tags?.length && { keywords: post.tags.map((t) => t.name).join(", ") }),
  };
}

// JSON-LD for the /guides/* long-form pages. Distinct from blogPostingSchema
// (which is BlogPosting) — guides are timeless reference content, so we use
// Article + inLanguage + educationalLevel so AI answer engines (ChatGPT,
// Perplexity, Google AI Overviews, Claude) treat them as authoritative
// evergreen resources rather than dated blog posts.
export function articleSchema(opts: {
  headline: string;
  description: string;
  slug: string;
  wordCount?: number;
  datePublished: string;
  dateModified: string;
  imageUrl?: string;
  section?: string; // e.g. "Renting", "Costs"
  readMinutes?: number;
}) {
  const url = `${BASE_URL}/guides/${opts.slug}`;
  const image = opts.imageUrl
    ? opts.imageUrl.startsWith("http")
      ? opts.imageUrl
      : `${BASE_URL}${opts.imageUrl}`
    : `${BASE_URL}/images/offices-hero.jpg`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: opts.headline,
    description: opts.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    inLanguage: "en",
    ...(opts.wordCount && { wordCount: opts.wordCount }),
    ...(opts.readMinutes && { timeRequired: `PT${opts.readMinutes}M` }),
    ...(opts.section && { articleSection: opts.section }),
    author: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "PLACES",
    },
    publisher: { "@id": `${BASE_URL}/#organization` },
    image: {
      "@type": "ImageObject",
      url: image,
    },
  };
}

// JSON-LD for the /guides hub index page. Combines CollectionPage (Google
// understands "this is a curated collection") with an inline ItemList of
// every guide so crawlers get all URLs from one JSON-LD block.
export function guidesCollectionSchema(items: {
  name: string;
  url: string;
  description: string;
}[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}/guides#collection`,
    name: "PLACES Cairo Office Guides",
    description:
      "Practical, data-backed guides on renting, buying, sizing, and fitting out an office in Cairo. Written by PLACES, Egypt's admin-office specialists.",
    url: `${BASE_URL}/guides`,
    inLanguage: "en",
    isPartOf: { "@id": `${BASE_URL}/#website` },
    publisher: { "@id": `${BASE_URL}/#organization` },
    hasPart: items.map((item) => ({
      "@type": "Article",
      name: item.name,
      description: item.description,
      url: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function itemListSchema(opts: {
  name: string;
  url: string;
  items: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    url: `${BASE_URL}${opts.url}`,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
      name: item.name,
    })),
  };
}

export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Why PLACES",
    url: `${BASE_URL}/why-places`,
    description:
      "Meet the team and mission behind PLACES — Egypt's specialized partner for administrative office real estate across Cairo, New Cairo, Sheikh Zayed, 6th October, Downtown Cairo, Sheraton, and Maadi.",
    mainEntity: { "@id": `${BASE_URL}/#organization` },
    significantLink: [
      `${BASE_URL}/listings`,
      `${BASE_URL}/contact`,
      `${BASE_URL}/locations`,
    ],
  };
}
