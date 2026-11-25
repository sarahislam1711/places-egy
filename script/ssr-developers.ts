// Renders each /developers/{slug} React page to static HTML at build time, so
// the served page carries the real content (description, key facts, projects)
// instead of only the menu. The text comes from the page components themselves,
// so it can't drift from what visitors see. Live units + FAQs are added per
// request by server/seo/render.ts (the React section renders nothing here,
// because there's no data during the build).
import { build as esbuild } from "esbuild";
import { readdir, rm } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const PAGES_DIR = "client/src/pages/developers";
const OUT = path.resolve("dist/ssr-developers.mjs");

/** Strip the app chrome and styling from rendered markup, keeping content and links. */
export function clean(html: string): string {
  return html
    .replace(/<header[\s\S]*?<\/header>/, "") // Navbar
    .replace(/<footer[\s\S]*<\/footer>/, "")
    .replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/<!-- -->/g, "")
    .replace(/<link rel="preload"[^>]*>/g, "")
    // server/seo/html.ts finds the end of the prerender block by its own <nav>,
    // so the page's breadcrumb <nav> becomes a div with the same role.
    .replace(/<nav\b/g, '<div role="navigation"')
    .replace(/<\/nav>/g, "</div>")
    .replace(/\s(?:class|style|data-[\w-]+|aria-hidden|fetchpriority|decoding)="[^"]*"/g, "")
    // The block is hidden once JS runs; lazy images there are never fetched.
    .replace(/<img(?![^>]*\sloading=)/g, '<img loading="lazy"')
    .replace(/<(div|span)>\s*<\/\1>/g, "")
    .trim();
}

export async function renderDeveloperBodies(): Promise<Record<string, string>> {
  const slugs = (await readdir(PAGES_DIR)).filter((f) => f.endsWith(".tsx")).map((f) => f.slice(0, -4));
  const entry =
    `import { renderToString } from "react-dom/server";\n` +
    `import { createElement as h } from "react";\n` +
    `import { Router } from "wouter";\n` +
    `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";\n` +
    slugs.map((s, i) => `import P${i} from "@/pages/developers/${s}";`).join("\n") +
    `\nconst pages = { ${slugs.map((s, i) => `${JSON.stringify(s)}: P${i}`).join(", ")} };\n` +
    `export function render(slug) {\n` +
    `  return renderToString(h(QueryClientProvider, { client: new QueryClient() },\n` +
    `    h(Router, { ssrPath: "/developers/" + slug }, h(pages[slug]))));\n` +
    `}\n`;

  await esbuild({
    stdin: { contents: entry, resolveDir: process.cwd(), loader: "tsx" },
    bundle: true,
    platform: "node",
    format: "esm",
    jsx: "automatic",
    alias: { "@": "./client/src" },
    // App code reads Vite's import.meta.env (e.g. the Supabase URL, the USD rate).
    define: {
      "import.meta.env": JSON.stringify(
        Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("VITE_"))),
      ),
    },
    packages: "external",
    loader: { ".png": "empty", ".jpg": "empty", ".webp": "empty", ".svg": "empty", ".css": "empty" },
    outfile: OUT,
    logLevel: "warning",
  });

  const out: Record<string, string> = {};
  try {
    const mod = (await import(pathToFileURL(OUT).href)) as { render: (slug: string) => string };
    for (const slug of slugs) {
      try {
        out[slug] = clean(mod.render(slug));
      } catch (err) {
        console.warn(`[ssr-developers] ${slug} failed to render; keeping the meta-only body`, err);
      }
    }
  } finally {
    await rm(OUT, { force: true });
  }
  console.log(`[ssr-developers] rendered ${Object.keys(out).length}/${slugs.length} developer pages`);
  return out;
}
