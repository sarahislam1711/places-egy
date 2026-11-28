import { useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, CheckCircle2, Loader2, MessageCircle, X } from "lucide-react";
import { submitLead, readUtmFromLocation, LOCATION_CHOICES, type LocationSlug } from "@/lib/leads";
import { pageLanguage } from "@/lib/detect-language";
import { trackEvent } from "@/lib/analytics";
import { areaAr } from "@/lib/listing-text-ar";

// "Send us your requirements" form that opens in place (bottom sheet on
// phones, centred pop-up on desktop) instead of sending people to /contact.
// Posts to the normal /api/leads endpoint, so the lead lands in the admin
// Leads table, admin@ gets the notification and the visitor gets the usual
// welcome email. The quick-tap answers are folded into the lead's message.

export type RequirementsIntent = "rent" | "buy" | "invest" | "other";

export interface RequirementsFormConfig {
  /** Pre-selected answer to "Looking to…" (matches the page's service). */
  intent: RequirementsIntent;
  /** Shown in the lead's message so the team knows which page it came from. */
  pageName: string;
}

const WHATSAPP = "https://wa.me/201063618217";

const INTENTS: { id: RequirementsIntent; label: string; long: string }[] = [
  { id: "rent", label: "Rent an office", long: "Rent an office" },
  { id: "buy", label: "Buy an office", long: "Buy an office" },
  { id: "invest", label: "Invest for income", long: "Invest for rental income" },
  { id: "other", label: "Not sure yet", long: "Not sure yet" },
];

const SIZES = ["Under 100 m²", "100–300 m²", "300–500 m²", "500+ m²"];

// On-screen text in the page's language (Arabic on /ar pages, 28 Nov). The
// lead message the team receives stays in English (INTENTS.long, SIZES).
const RF = {
  en: {
    intents: { rent: "Rent an office", buy: "Buy an office", invest: "Invest for income", other: "Not sure yet" } as Record<RequirementsIntent, string>,
    sizes: SIZES,
    errName: "Please add your name.",
    errPhone: "Please add a phone number we can reach you on.",
    errEmail: "Please add a valid email.",
    errGeneric: "Something went wrong. Please try again or WhatsApp us.",
    thanks: (first: string) => `Thanks, ${first}. We've got it.`,
    thanksBody: "A PLACES advisor will contact you shortly with options that fit. Need us sooner? Message us on WhatsApp.",
    whatsapp: "WhatsApp us",
    close: "Close",
    title: "Tell us what you need",
    sub: "Takes under a minute. An advisor will reply with offices that fit.",
    lookingTo: "I'm looking to",
    areas: "Areas",
    pickAny: "(pick any)",
    size: "Size",
    roughly: "(roughly)",
    name: "Name",
    company: "Company",
    phone: "Phone",
    email: "Email",
    else: "Anything else?",
    optional: "(optional)",
    notesPh: "Team size, budget, move-in date…",
    sending: "Sending…",
    send: "Send my requirements",
    fine: "Free, no commitment. We only use your details to reply to you.",
    area: (slug: string, label: string) => label,
  },
  ar: {
    intents: { rent: "إيجار مكتب", buy: "شراء مكتب", invest: "استثمار بعائد", other: "لم أقرر بعد" } as Record<RequirementsIntent, string>,
    sizes: ["أقل من 100 م²", "100–300 م²", "300–500 م²", "500+ م²"],
    errName: "من فضلك اكتب اسمك.",
    errPhone: "من فضلك اكتب رقم هاتف نتواصل معك عليه.",
    errEmail: "من فضلك اكتب بريدًا إلكترونيًا صحيحًا.",
    errGeneric: "حدث خطأ. حاول مرة أخرى أو راسلنا على واتساب.",
    thanks: (first: string) => `شكرًا يا ${first}، وصلنا طلبك.`,
    thanksBody: "سيتواصل معك مستشار من PLACES قريبًا بخيارات مناسبة. تحتاجنا أسرع؟ راسلنا على واتساب.",
    whatsapp: "راسلنا على واتساب",
    close: "إغلاق",
    title: "قل لنا ما تحتاجه",
    sub: "أقل من دقيقة، وسيرد عليك مستشار بالمكاتب المناسبة.",
    lookingTo: "أبحث عن",
    areas: "المناطق",
    pickAny: "(اختر ما يناسبك)",
    size: "المساحة",
    roughly: "(تقريبًا)",
    name: "الاسم",
    company: "الشركة",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    else: "أي تفاصيل أخرى؟",
    optional: "(اختياري)",
    notesPh: "عدد الفريق، الميزانية، موعد الانتقال…",
    sending: "جارٍ الإرسال…",
    send: "أرسل طلبي",
    fine: "مجاني وبدون أي التزام. نستخدم بياناتك فقط للرد عليك.",
    area: (slug: string, _label: string) => areaAr(slug),
  },
} as const;

const pill = (on: boolean) =>
  `rounded-full border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
    on ? "border-primary bg-primary text-white" : "border-primary/15 bg-white text-primary hover:border-primary/40"
  }`;

const input =
  "w-full rounded-xl border border-primary/15 bg-white px-3.5 py-2.5 text-base md:text-sm text-primary placeholder:text-primary/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

function RequirementsFormBody({ config, onDone }: { config: RequirementsFormConfig; onDone: () => void }) {
  const lang = pageLanguage();
  const t = RF[lang];
  const [intent, setIntent] = useState<RequirementsIntent>(config.intent);
  const [areas, setAreas] = useState<Set<LocationSlug>>(new Set());
  const [size, setSize] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const toggleArea = (slug: LocationSlug) =>
    setAreas((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError(t.errName);
    if (phone.trim().length < 6) return setError(t.errPhone);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError(t.errEmail);

    const areaLabels = LOCATION_CHOICES.filter((l) => areas.has(l.slug)).map((l) => l.label);
    const message = [
      `Looking to: ${INTENTS.find((i) => i.id === intent)?.long}`,
      areaLabels.length ? `Areas: ${areaLabels.join(", ")}` : null,
      size ? `Size: ${size}` : null,
      company.trim() ? `Company: ${company.trim()}` : null,
      notes.trim() ? `Notes: ${notes.trim()}` : null,
      `Sent from: ${config.pageName} page${lang === "ar" ? " (Arabic page — reply in Arabic)" : ""}`,
    ]
      .filter(Boolean)
      .join("\n");

    setStatus("sending");
    try {
      await submitLead({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        locations: Array.from(areas),
        message,
        lead_source: "service_page_form",
        // Welcome email in the language of the page they filled the form on.
        preferred_language: pageLanguage(),
        page_url: window.location.pathname,
        ...(honeypot ? { website: honeypot } : {}),
        ...readUtmFromLocation(),
      });
      trackEvent("contact_form_submit", { source: "service_page_form", intent, page: window.location.pathname });
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(lang === "ar" ? t.errGeneric : (err as Error).message || t.errGeneric);
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </span>
        <DialogPrimitive.Title className="mt-5 text-2xl font-serif font-bold text-primary" role="status">
          {t.thanks(name.trim().split(" ")[0])}
        </DialogPrimitive.Title>
        <p className="mt-2 max-w-sm text-primary/70">
          {t.thanksBody}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-6 font-semibold text-white hover:bg-[#1fb855]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden /> {t.whatsapp}
          </a>
          <button type="button" onClick={onDone} className="inline-flex h-12 items-center rounded-full border border-primary/20 px-6 font-semibold text-primary hover:border-primary/50">
            {t.close}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="shrink-0 px-6 pt-5 pb-5 md:px-8 md:pt-8">
        <DialogPrimitive.Title className="pe-10 text-2xl md:text-3xl font-serif font-bold leading-tight text-primary">
          {t.title}
        </DialogPrimitive.Title>
        <p className="mt-1.5 pe-6 text-sm md:text-base text-primary/65">
          {t.sub}
        </p>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6 md:px-8">
        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold text-primary">{t.lookingTo}</legend>
          <div className="flex flex-wrap gap-2">
            {INTENTS.map((i) => (
              <button key={i.id} type="button" aria-pressed={intent === i.id} onClick={() => setIntent(i.id)} className={pill(intent === i.id)}>
                {t.intents[i.id]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold text-primary">
            {t.areas} <span className="font-normal text-primary/50">{t.pickAny}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {LOCATION_CHOICES.map((l) => (
              <button key={l.slug} type="button" aria-pressed={areas.has(l.slug)} onClick={() => toggleArea(l.slug)} className={pill(areas.has(l.slug))}>
                {areas.has(l.slug) && <Check className="-ms-0.5 me-1 inline h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
                {t.area(l.slug, l.label)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold text-primary">
            {t.size} <span className="font-normal text-primary/50">{t.roughly}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s, i) => (
              <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(size === s ? null : s)} className={pill(size === s)}>
                {t.sizes[i]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">
              {t.name} <span className="text-accent">*</span>
            </span>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">{t.company}</span>
            <input className={input} value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">
              {t.phone} <span className="text-accent">*</span>
            </span>
            <input className={input} type="tel" inputMode="tel" dir="ltr" placeholder="+20 1…" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">
              {t.email} <span className="text-accent">*</span>
            </span>
            <input className={input} type="email" inputMode="email" dir="ltr" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">
            {t.else} <span className="font-normal text-primary/50">{t.optional}</span>
          </span>
          <textarea
            className={`${input} resize-none`}
            rows={2}
            placeholder={t.notesPh}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        {/* Honeypot: hidden from people, bots fill it. */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          name="website"
        />
      </div>

      <div className="shrink-0 border-t border-primary/10 bg-white px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-8">
        {error && (
          <p role="alert" className="mb-3 text-sm text-accent">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(232,64,74,0.6)] transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {status === "sending" ? t.sending : t.send}
        </button>
        <p className="mt-2.5 text-center text-xs text-primary/50">{t.fine}</p>
      </div>
    </form>
  );
}

/**
 * Wraps a button so it opens the requirements form. Renders a real link to
 * `fallbackHref` (/contact) so it still works without JavaScript and crawlers
 * still see the link; the click is intercepted to open the form instead.
 */
export function RequirementsTrigger({
  config,
  fallbackHref,
  children,
}: {
  config: RequirementsFormConfig;
  fallbackHref: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // Remount the form on every open so a sent form starts fresh next time.
  const [key, setKey] = useState(0);
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setKey((k) => k + 1);
    setOpen(true);
    trackEvent("requirements_form_open", { page: window.location.pathname });
  };
  return (
    <>
      <a href={fallbackHref} onClick={onClick}>
        {children}
      </a>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed z-[61] inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl bg-[#F5F0EA] shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[min(40rem,calc(100vw-3rem))] md:max-h-[88vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:data-[state=open]:slide-in-from-bottom-4 md:data-[state=open]:fade-in-0"
          >
            <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-primary/15 md:hidden" aria-hidden />
            <DialogPrimitive.Close
              className="absolute end-4 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-primary/60 hover:bg-primary/5 hover:text-primary md:end-5 md:top-5"
              aria-label={RF[pageLanguage()].close}
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
            <RequirementsFormBody key={key} config={config} onDone={() => setOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
