import { useState } from "react";

// True when the served HTML already carries a JSON-LD block with this @id
// (index.html's organization/website blocks, or the server-rendered listing,
// blog and developer pages). Rendering it again from React gave Google two
// copies of the same entity on every page.
function servedInHead(schema: object): boolean {
  const id = (schema as { "@id"?: unknown })["@id"];
  if (typeof id !== "string" || typeof document === "undefined") return false;
  const norm = (s: string) => {
    try {
      return decodeURI(s).toLowerCase();
    } catch {
      return s.toLowerCase();
    }
  };
  const want = norm(id);
  for (const el of Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'))) {
    try {
      const parsed = JSON.parse(el.textContent ?? "") as { "@id"?: unknown };
      if (typeof parsed["@id"] === "string" && norm(parsed["@id"]) === want) return true;
    } catch {
      // ignore malformed blocks
    }
  }
  return false;
}

export function SchemaMarkup({ schema }: { schema: object }) {
  // Decided once on mount: the served head doesn't change afterwards.
  const [skip] = useState(() => servedInHead(schema));
  if (skip) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
