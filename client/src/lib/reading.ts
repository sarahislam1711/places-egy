import { useEffect, useState } from "react";

// Reading helpers shared by the guides and the blog posts (28 Nov):
// contents built from the article's H2s, the section in view, reading
// progress, and a jump that lands a section just below the fixed navbar.

export type TocItem = { id: string; text: string };

/** Turn a heading into an id. Keeps Arabic letters so Arabic posts get readable ids. */
export function slugifyHeading(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "section"
  );
}

/**
 * Contents from the H2s inside `ref`. H2s without an id get one (blog posts
 * come from WordPress without ids). `key` re-runs the scan when the content
 * changes (e.g. a new post loads).
 */
export function useAutoToc(ref: React.RefObject<HTMLElement | null>, key?: unknown): TocItem[] {
  const [items, setItems] = useState<TocItem[]>([]);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const used = new Set<string>();
    const list: TocItem[] = [];
    root.querySelectorAll<HTMLHeadingElement>("h2").forEach((h) => {
      const text = h.textContent?.trim() ?? "";
      if (!text) return;
      if (!h.id) {
        let id = slugifyHeading(text);
        let n = 2;
        while (used.has(id) || document.getElementById(id)) id = `${slugifyHeading(text)}-${n++}`;
        h.id = id;
      }
      used.add(h.id);
      list.push({ id: h.id, text });
    });
    setItems(list);
  }, [ref, key]);
  return items;
}

/** The section being read: the last H2 above a line ~30% down the screen. */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const joined = ids.join("|");
  useEffect(() => {
    if (!ids.length) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current ?? ids[0]);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);
  return active;
}

/** 0–1 progress through the element. */
export function useReadingProgress(ref: React.RefObject<HTMLElement | null>, key?: unknown): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / Math.max(total, 1))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, key]);
  return p;
}

/**
 * Jump to a section so its heading sits just below the fixed navbar. Runs two
 * frames later so a menu that closes on tap has already collapsed (otherwise
 * the page shifts mid-scroll and the jump stops short).
 */
export function scrollToSection(id: string) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const bar = document.querySelector("header");
      const offset = Math.max(bar ? bar.getBoundingClientRect().bottom : 0, 81) + 20;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
      history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    }),
  );
}
