// Shared by the listing page, the build-time listing prerender, and the admin
// save path. Keep free of "@/" imports: scripts and the server import it directly.

// Titles get pasted from WhatsApp (*bold*) or Markdown (# heading).
export function cleanListingTitle(title: string): string {
  return title
    .replace(/^\s*#+\s*/, "")
    .replace(/[*`~]+/g, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s|]+|[\s|]+$/g, "")
    .trim();
}

// "Rented · available from 1 Feb 2027" / "Rented · date to be confirmed".
export function rentedLabel(l: { rental_end?: string | null }): string {
  if (!l.rental_end) return "Rented · date to be confirmed";
  const d = new Date(`${l.rental_end}T00:00:00`);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `Rented · available from ${date}`;
}

// Descriptions are markdown; search snippets need plain text of ~155 chars.
export function listingSnippet(markdown: string, max = 155): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|[-*+]|\d+[.)])\s+/gm, "")
    .replace(/[*_`~>#|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:–—-]+$/, "") + "…";
}

// "650 m² + 350 m² roof" when the unit has an extra (outdoor/roof/terrace/garden) area,
// else "650 m²". area_sqm is always the unit itself.
export function areaLabel(l: { area_sqm?: number | null; outdoor_area_sqm?: number | null; outdoor_area_type?: string | null }): string {
  const fmt = (n: number) => Number(n).toLocaleString("en-US");
  const word = ["roof", "terrace", "garden"].includes(l.outdoor_area_type ?? "") ? l.outdoor_area_type : "outdoor";
  const main = l.area_sqm ? `${fmt(l.area_sqm)} m²` : "";
  const outdoor = l.outdoor_area_sqm ? `${fmt(l.outdoor_area_sqm)} m² ${word}` : "";
  return [main, outdoor].filter(Boolean).join(" + ");
}
