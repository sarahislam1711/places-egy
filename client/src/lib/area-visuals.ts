import { LOCATION_CONTENT } from "@/lib/location-content";

// One photo per area for tiles and cards (tenant rep "Areas we cover", the
// /rent /buy /income-property area grid). Each area page's hero, except two
// that don't show offices in that area (6th October's is a villa; Sheraton's
// is the Nile hotel) — checked visually 2026-11-26.
const OVERRIDES: Record<string, { image: string; alt: string }> = {
  "6th-october": { image: "/images/business-complex.jpg", alt: "A business park with office buildings" },
  sheraton: { image: "/images/city-center-almaza.webp", alt: "City Centre Almaza in the Sheraton area" },
};

export function areaPhoto(slug: string): { image: string; alt: string } {
  const override = OVERRIDES[slug];
  if (override) return override;
  const area = Object.values(LOCATION_CONTENT).find((a) => a.slug === slug);
  return { image: area?.heroImage ?? "/images/offices-hero.jpg", alt: area ? `${area.displayName}, Cairo` : "Office buildings in Cairo" };
}
