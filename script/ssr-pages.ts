// Renders static React pages (guides, services, hubs, legal) to HTML at build
// time, so crawlers that don't run JavaScript (AI bots, Google's first pass)
// get the page's real content instead of only a title and one sentence.
// Same approach as ssr-developers.ts: the text comes from the page components
// themselves, so it can't drift from what visitors see. Sections that load
// data in the browser (listings, projects) render their empty state here.
import { build as esbuild } from "esbuild";
import { rm } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { clean } from "./ssr-developers";

const OUT = path.resolve("dist/ssr-pages.mjs");

/** Route → page module (under client/src/pages), for pages with no server render of their own. */
export const STATIC_PAGE_COMPONENTS: Record<string, string> = {
  "/guides": "guides/index",
  "/guides/office-rental-prices-cairo-2026": "guides/office-rental-prices-cairo-2026",
  "/guides/how-to-rent-office-cairo": "guides/how-to-rent-office-cairo",
  "/guides/buy-vs-rent-office-cairo": "guides/buy-vs-rent-office-cairo",
  "/guides/office-size-guide": "guides/office-size-guide",
  "/guides/office-fit-out-costs-cairo": "guides/office-fit-out-costs-cairo",
  "/services": "services",
  "/services/tenant-representation": "services/tenant-representation",
  "/services/primary-property": "services/primary-property",
  "/services/property-resale": "services/property-resale",
  "/services/investment-consultation": "services/investment-consultation",
  "/services/income-generating-property": "services/income-generating-property",
  "/why-places": "why-places",
  "/admin": "admin",
  "/admin/business-building": "admin/business-building",
  "/admin/business-park": "admin/business-park",
  "/admin/mixed-use": "admin/mixed-use",
  "/developers": "developers",
  "/projects": "projects",
  "/locations": "locations",
  "/glossary": "resources/glossary",
  "/contact": "contact",
  "/privacy-policy": "privacy-policy",
  "/terms-of-service": "terms-of-service",
};

/** Smallest body (in words) worth shipping; anything less keeps the meta-only body. */
const MIN_WORDS = 80;

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

export async function renderStaticPageBodies(
  pages: Record<string, string> = STATIC_PAGE_COMPONENTS,
): Promise<Record<string, string>> {
  const routes = Object.keys(pages);
  const entry =
    `import { renderToString } from "react-dom/server";\n` +
    `import { createElement as h } from "react";\n` +
    `import { Router } from "wouter";\n` +
    `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";\n` +
    routes.map((r, i) => `import P${i} from "@/pages/${pages[r]}";`).join("\n") +
    `\nconst pages = { ${routes.map((r, i) => `${JSON.stringify(r)}: P${i}`).join(", ")} };\n` +
    `export function render(route) {\n` +
    `  return renderToString(h(QueryClientProvider, { client: new QueryClient() },\n` +
    `    h(Router, { ssrPath: route }, h(pages[route]))));\n` +
    `}\n`;

  await esbuild({
    stdin: { contents: entry, resolveDir: process.cwd(), loader: "tsx" },
    bundle: true,
    platform: "node",
    format: "esm",
    jsx: "automatic",
    alias: { "@": "./client/src" },
    define: {
      "import.meta.env": JSON.stringify(
        Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("VITE_"))),
      ),
    },
    packages: "external",
    loader: { ".png": "empty", ".jpg": "empty", ".jpeg": "empty", ".webp": "empty", ".svg": "empty", ".css": "empty", ".pdf": "empty" },
    outfile: OUT,
    logLevel: "warning",
  });

  const out: Record<string, string> = {};
  try {
    const mod = (await import(pathToFileURL(OUT).href)) as { render: (route: string) => string };
    for (const route of routes) {
      try {
        const body = clean(mod.render(route));
        const words = wordCount(body);
        if (words >= MIN_WORDS) out[route] = body;
        else console.warn(`[ssr-pages] ${route} rendered only ${words} words; keeping the meta-only body`);
      } catch (err) {
        console.warn(`[ssr-pages] ${route} failed to render; keeping the meta-only body`, err);
      }
    }
  } finally {
    await rm(OUT, { force: true });
  }
  console.log(`[ssr-pages] rendered ${Object.keys(out).length}/${routes.length} static pages`);
  return out;
}
