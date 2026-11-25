// Building blocks for the /services/* pages. One template, so every service
// page shares the same rhythm: split hero → cream / white / dark bands →
// numbered process → comparison → FAQs beside an advisor panel → CTA band.
// Everything renders without data, so the build-time crawler render
// (script/ssr-pages.ts) carries the full text.
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, Check, ChevronRight, MessageCircle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqAccordionList } from "@/components/FaqAccordionList";

const PHONE_DISPLAY = "+20 106 361 8217";
const PHONE_TEL = "+201063618217";
const WHATSAPP = "https://wa.me/201063618217";

type Tone = "cream" | "white" | "dark";
const TONE: Record<Tone, string> = {
  cream: "bg-background",
  white: "bg-white",
  dark: "bg-primary text-white",
};

/** A page band with consistent vertical rhythm. */
export function Band({ tone = "cream", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <section className={`${TONE[tone]} py-16 md:py-24 ${className}`}>
      <div className="container mx-auto px-6 md:px-10 max-w-6xl">{children}</div>
    </section>
  );
}

/** Section heading + optional lead, left-aligned. */
export function SectionHead({ title, lead, dark = false }: { title: string; lead?: ReactNode; dark?: boolean }) {
  return (
    <div className="max-w-3xl mb-10 md:mb-14">
      <h2 className={`text-3xl md:text-[2.75rem] font-serif font-bold leading-[1.1] tracking-[-0.02em] text-balance ${dark ? "text-white" : "text-primary"}`}>
        {title}
      </h2>
      {lead && <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-white/75" : "text-muted-foreground"}`}>{lead}</p>}
    </div>
  );
}

export interface Crumb {
  name: string;
  href?: string;
}

/** Split hero: breadcrumb, H1, intro and actions on the left; a photo carrying the core promise on the right. */
export function ServiceHero({
  crumbs,
  title,
  intro,
  primary,
  image,
  imageAlt,
  promise,
  points,
}: {
  crumbs: Crumb[];
  title: string;
  intro: ReactNode;
  primary: { label: string; href: string };
  image: string;
  imageAlt: string;
  /** Short statement pinned on the photo, e.g. "Free for tenants". */
  promise: { title: string; text: string };
  /** Three short facts under the actions. */
  points: string[];
}) {
  return (
    <section className="pt-28 md:pt-36 pb-16 md:pb-24">
      <div className="container mx-auto px-6 md:px-10 max-w-6xl grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={c.name} className="inline-flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5" aria-hidden />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-primary transition-colors">{c.name}</Link>
                ) : (
                  <span className="text-primary font-medium" aria-current="page">{c.name}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="text-4xl md:text-[3.6rem] font-serif font-bold text-primary leading-[1.04] tracking-[-0.03em] text-balance">
            {title}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">{intro}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={primary.href}>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-7 h-13 text-base shadow-[0_10px_30px_-10px_rgba(232,64,74,0.6)] transition-transform hover:-translate-y-0.5">
                {primary.label} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-13 px-6 rounded-md border border-primary/15 bg-white text-primary font-semibold hover:border-primary/40 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp us
            </a>
          </div>
          <ul className="mt-10 grid sm:grid-cols-3 gap-x-6 gap-y-3 border-t border-primary/10 pt-6">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm font-medium text-primary">
                <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] lg:aspect-[4/5] max-h-[560px] w-full overflow-hidden rounded-2xl bg-muted">
            <img
              src={image}
              alt={imageAlt}
              width={800}
              height={1000}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-6 right-6 md:left-auto md:-left-8 md:right-auto md:max-w-[300px] rounded-2xl bg-primary text-white p-6 shadow-[0_24px_48px_-16px_rgba(17,17,17,0.45)]">
            <p className="text-xl font-serif font-bold leading-tight">{promise.title}</p>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">{promise.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Two-column list: bold label + description, separated by hairlines. */
export function DefinitionList({ items, dark = false }: { items: { title: string; desc: string }[]; dark?: boolean }) {
  return (
    <div className="grid md:grid-cols-2 gap-x-12">
      {items.map((it) => (
        <div key={it.title} className={`py-6 border-t ${dark ? "border-white/15" : "border-primary/10"}`}>
          <h3 className={`text-lg font-serif font-bold ${dark ? "text-white" : "text-primary"}`}>{it.title}</h3>
          <p className={`mt-2 leading-relaxed ${dark ? "text-white/70" : "text-muted-foreground"}`}>{it.desc}</p>
        </div>
      ))}
    </div>
  );
}

/** Checklist with accent ticks. */
export function Checklist({ items, dark = false, columns = 1 }: { items: string[]; dark?: boolean; columns?: 1 | 2 }) {
  return (
    <ul className={`grid gap-x-10 gap-y-4 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {items.map((s) => (
        <li key={s} className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <Check className="w-3 h-3" strokeWidth={3} aria-hidden />
          </span>
          <span className={dark ? "text-white/90" : "text-primary"}>{s}</span>
        </li>
      ))}
    </ul>
  );
}

/** Numbered steps: the order matters, so the numbers carry information. */
export function StepList({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <ol className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10">
      {steps.map((s, i) => (
        <li key={s.title} className="relative py-7 border-t border-primary/10">
          <span className="block text-5xl font-serif font-bold text-accent/90 leading-none tabular-nums" aria-hidden>
            {i + 1}
          </span>
          <h3 className="mt-4 text-lg font-serif font-bold text-primary">{s.title}</h3>
          <p className="mt-2 text-muted-foreground leading-relaxed">{s.desc}</p>
        </li>
      ))}
    </ol>
  );
}

/** "Us vs them" comparison: a table on desktop, stacked rows on phones. */
export function ComparisonTable({
  usLabel,
  themLabel,
  rows,
}: {
  usLabel: string;
  themLabel: string;
  rows: { label: string; us: string; them: string }[];
}) {
  return (
    <>
      <div className="md:hidden space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-2xl bg-white p-5 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.25)]">
            <h3 className="font-bold text-primary mb-3">{r.label}</h3>
            <p className="flex items-start gap-2 text-sm mb-2">
              <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden />
              <span><span className="font-semibold">{usLabel}:</span> {r.us}</span>
            </p>
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <X className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span><span className="font-semibold">{themLabel}:</span> {r.them}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_-24px_rgba(17,17,17,0.3)]">
        <table className="w-full text-base">
          <thead>
            <tr>
              <th className="p-5 w-[24%]" scope="col"><span className="sr-only">Compared on</span></th>
              <th className="p-5 text-left font-serif text-lg font-bold text-white bg-primary" scope="col">{usLabel}</th>
              <th className="p-5 text-left font-serif text-lg font-bold text-primary/70" scope="col">{themLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-primary/10">
                <th className="p-5 text-left font-semibold text-primary align-top" scope="row">{r.label}</th>
                <td className="p-5 align-top bg-primary/[0.03]">
                  <span className="flex items-start gap-2 text-primary">
                    <Check className="w-4 h-4 text-accent mt-1 shrink-0" aria-hidden />{r.us}
                  </span>
                </td>
                <td className="p-5 align-top text-muted-foreground">
                  <span className="flex items-start gap-2">
                    <X className="w-4 h-4 mt-1 shrink-0 text-primary/30" aria-hidden />{r.them}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Link rows (areas, related pages): title + one line, arrow on hover. */
export function LinkGrid({ items }: { items: { href: string; title: string; desc: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
      {items.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="group flex items-start justify-between gap-4 py-6 border-t border-primary/10"
        >
          <span>
            <span className="block text-lg font-serif font-bold text-primary group-hover:text-accent transition-colors">{a.title}</span>
            <span className="block mt-1.5 text-sm text-muted-foreground leading-relaxed">{a.desc}</span>
          </span>
          <ArrowRight className="w-4 h-4 mt-1.5 text-accent shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      ))}
    </div>
  );
}

/** FAQs beside a sticky "talk to an advisor" panel. */
export function FaqWithAdvisor({
  title,
  faqs,
  footer,
}: {
  title: string;
  faqs: { question: string; answer: string }[];
  footer?: ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-16 items-start">
      <div className="lg:sticky lg:top-28">
        <h2 className="text-3xl md:text-[2.75rem] font-serif font-bold text-primary leading-[1.1] tracking-[-0.02em] text-balance">{title}</h2>
        <div className="mt-8 rounded-2xl bg-primary text-white p-7">
          <p className="text-lg font-serif font-bold">Have a question that isn't here?</p>
          <p className="mt-2 text-sm text-white/75 leading-relaxed">Talk to an advisor. We'll answer it, no commitment.</p>
          <div className="mt-5 flex flex-col gap-2">
            <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-accent transition-colors">
              <Phone className="w-4 h-4" /> {PHONE_DISPLAY}
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-accent transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div>
        <FaqAccordionList faqs={faqs} />
        {footer && <p className="mt-6 text-sm text-muted-foreground">{footer}</p>}
      </div>
    </div>
  );
}

/** Closing call to action on a dark band. */
export function CtaBand({ title, text, primary }: { title: string; text: string; primary: { label: string; href: string } }) {
  return (
    <section className="bg-primary text-white">
      <div className="container mx-auto px-6 md:px-10 max-w-6xl py-16 md:py-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-[2.75rem] font-serif font-bold leading-[1.1] tracking-[-0.02em] text-balance text-white">{title}</h2>
          <p className="mt-4 text-lg text-white/75">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link href={primary.href}>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-7 h-13 text-base">
              {primary.label} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-13 px-6 rounded-md border border-white/25 text-white font-semibold hover:border-white/60 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export interface Audience {
  title: string;
  /** What this audience needs, in their words ("You need …"). */
  need: string;
  /** How PLACES helps ("We …"). */
  help: string;
  image: string;
  imageAlt: string;
}

/**
 * "Who this is for" as a selector: audience names on the left, one panel with
 * a photo and two short lines on the right. Every panel is in the HTML (the
 * inactive ones are only hidden), so crawlers read all of them.
 */
export function AudienceTabs({ items, label }: { items: Audience[]; label: string }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = e.key === "ArrowDown" || e.key === "ArrowRight" ? i + 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const n = (next + items.length) % items.length;
    setActive(n);
    document.getElementById(`${base}-tab-${n}`)?.focus();
  };
  return (
    <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6 lg:gap-12 items-start">
      <div role="tablist" aria-label={label} aria-orientation="vertical" className="flex lg:flex-col gap-2 overflow-x-auto pb-1 snap-x">
        {items.map((it, i) => {
          const on = i === active;
          return (
            <button
              key={it.title}
              id={`${base}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${base}-panel-${i}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={`group snap-start shrink-0 lg:shrink flex items-center justify-between gap-4 text-left rounded-xl px-5 py-4 lg:py-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                on ? "bg-primary text-white" : "bg-white/60 lg:bg-transparent text-primary hover:bg-white"
              }`}
            >
              <span className="text-base lg:text-xl font-serif font-bold whitespace-nowrap lg:whitespace-normal">{it.title}</span>
              <ArrowRight className={`hidden lg:block w-5 h-5 shrink-0 transition-transform ${on ? "text-accent translate-x-1" : "text-primary/30 group-hover:translate-x-1"}`} aria-hidden />
            </button>
          );
        })}
      </div>
      <div>
        {items.map((it, i) => (
          <div
            key={it.title}
            id={`${base}-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`${base}-tab-${i}`}
            className={i === active ? "block" : "hidden"}
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_-24px_rgba(17,17,17,0.35)]">
              <div className="aspect-[16/9] bg-muted overflow-hidden">
                <img src={it.image} alt={it.imageAlt} width={960} height={540} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-serif font-bold text-primary">{it.title}</h3>
                <p className="mt-3 text-lg text-primary/80 leading-relaxed">{it.need}</p>
                <p className="mt-4 flex items-start gap-3 text-primary font-medium leading-relaxed">
                  <span className="mt-0.5 inline-flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  {it.help}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface ServiceCardItem {
  href: string;
  name: string;
  desc: string;
  tags: string[];
  image: string;
  imageAlt: string;
}

/** Photo-led service cards; the first card is the featured one (wider on desktop). */
export function ServiceCards({ items }: { items: ServiceCardItem[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((s, i) => (
        <Link
          key={s.href}
          href={s.href}
          className={`group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_-20px_rgba(17,17,17,0.35)] transition-shadow hover:shadow-[0_20px_44px_-20px_rgba(17,17,17,0.45)] ${
            i === 0 ? "sm:col-span-2 lg:col-span-2" : ""
          }`}
        >
          <div className={`relative overflow-hidden bg-muted ${i === 0 ? "aspect-[16/7]" : "aspect-[16/10]"}`}>
            <img
              src={s.image}
              alt={s.imageAlt}
              width={960}
              height={600}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/15 to-transparent" aria-hidden />
            <h3 className="absolute left-5 right-5 bottom-4 text-2xl md:text-[1.7rem] font-serif font-bold text-white leading-tight">{s.name}</h3>
          </div>
          <div className="flex flex-1 flex-col p-5 md:p-6">
            <p className="text-primary/80 leading-relaxed">{s.desc}</p>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${s.name} is best for`}>
              {s.tags.map((t) => (
                <li key={t} className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary">
                  {t}
                </li>
              ))}
            </ul>
            <span className="mt-auto pt-5 inline-flex items-center text-accent font-semibold">
              Learn more <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
