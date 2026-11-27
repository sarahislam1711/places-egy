import { useEffect, useRef, useState } from "react";
import { X, FileText, ArrowRight, Check, Loader2, ChevronDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { pageLanguage } from "@/lib/detect-language";

// Developer survey lead magnet — the /guides/* magnet that hands out the
// PLACES Cairo Developer Price Survey PDF in exchange for name + phone +
// email + qualifiers.
//
// Two variants exposed via `variant` prop:
//   - "popup"  → fixed bottom-left card, appears 15s after landing on any
//               guide page, session-dismissable
//   - "inline" → in-flow branded block, rendered mid-guide by the guide
//               page files
//
// Both variants POST to /api/leads/developer-survey. Both respect
// magnet-coord.ts so they never overlap with the concierge widget.
// Permanent suppression on successful submission; session-only on X.

const DISMISS_KEY = "developer_survey_dismissed_this_session";
const SUBMITTED_KEY = "developer_survey_submitted_at";
const SHOW_AFTER_MS = 5_000;

type Intent = "buy" | "rent" | "browsing" | "other";
type AreaRange = "under-100" | "100-300" | "300-500" | "500-plus";
type Lang = "en" | "ar";

const COPY = {
  en: {
    hookHeadline: "What are Cairo developers actually charging?",
    hookSubtitle:
      "PLACES tracks what developers actually charge in New Cairo, Sheikh Zayed, and 6th October — collected on the ground. Get the 2026 survey delivered to your inbox.",
    ctaBubble: "Get the survey",
    intentLabel: "What are you looking for?",
    intents: {
      buy: "Office to buy",
      rent: "Office to rent",
      browsing: "Just browsing",
      other: "Something else",
    } as Record<Intent, string>,
    nameLabel: "Your name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    moreDetails: "Add more details (optional)",
    companyLabel: "Company",
    jobLabel: "Job title",
    areaLabel: "Area needed",
    areas: {
      "under-100": "Under 100 m²",
      "100-300": "100–300 m²",
      "300-500": "300–500 m²",
      "500-plus": "500+ m²",
    } as Record<AreaRange, string>,
    budgetLabel: "Budget range (EGP)",
    budgetFrom: "From",
    budgetTo: "To",
    submit: "Send me the survey",
    submitting: "Sending…",
    successTitle: "The survey is on its way. Check your inbox.",
    successBody:
      "You'll get the PDF within a couple of minutes. If you don't see it, check spam.",
    close: "Close",
    validationName: "What's your name?",
    validationEmail: "We need a valid email to send the survey.",
    validationPhone: "Please share your phone number.",
    error: "Something went wrong — please try again.",
  },
  ar: {
    hookHeadline: "ماذا يفرض المطورون في القاهرة فعلاً؟",
    hookSubtitle:
      "تتابع PLACES ما يفرضه المطورون فعلاً في التجمع الخامس والشيخ زايد و6 أكتوبر — بيانات ميدانية. احصل على استطلاع 2026 في بريدك.",
    ctaBubble: "احصل على الاستطلاع",
    intentLabel: "عن ماذا تبحث؟",
    intents: {
      buy: "مكتب للشراء",
      rent: "مكتب للإيجار",
      browsing: "أتصفح فقط",
      other: "شيء آخر",
    } as Record<Intent, string>,
    nameLabel: "اسمك",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
    moreDetails: "أضف المزيد من التفاصيل (اختياري)",
    companyLabel: "الشركة",
    jobLabel: "المسمى الوظيفي",
    areaLabel: "المساحة المطلوبة",
    areas: {
      "under-100": "أقل من 100 م²",
      "100-300": "100–300 م²",
      "300-500": "300–500 م²",
      "500-plus": "أكثر من 500 م²",
    } as Record<AreaRange, string>,
    budgetLabel: "نطاق الميزانية (جنيه)",
    budgetFrom: "من",
    budgetTo: "إلى",
    submit: "أرسل لي الاستطلاع",
    submitting: "جاري الإرسال…",
    successTitle: "الاستطلاع في الطريق. تحقق من بريدك.",
    successBody:
      "ستحصل على PDF خلال دقيقتين. إن لم تجده، تحقق من مجلد الرسائل غير المرغوب فيها.",
    close: "إغلاق",
    validationName: "ما اسمك؟",
    validationEmail: "نحتاج بريدًا إلكترونيًا صحيحًا لإرسال الاستطلاع.",
    validationPhone: "من فضلك شارك رقم هاتفك.",
    error: "حدث خطأ ما — من فضلك حاول مرة أخرى.",
  },
} as const;

type Props = {
  variant: "popup" | "inline";
  guideSlug?: string; // set by guide pages so admin sees which guide surfaced the magnet
};

function isSuppressed(): boolean {
  try {
    if (localStorage.getItem(SUBMITTED_KEY)) return true;
    if (sessionStorage.getItem(DISMISS_KEY)) return true;
    return false;
  } catch {
    return false;
  }
}

export function DeveloperSurveyMagnet({ variant, guideSlug }: Props) {
  const isPopup = variant === "popup";

  const [mounted, setMounted] = useState(!isPopup); // inline is mounted immediately; popup waits
  const [visible, setVisible] = useState(!isPopup); // same
  const [expanded, setExpanded] = useState(!isPopup); // inline always shows form; popup starts collapsed
  const [lang, setLang] = useState<Lang>("en");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [intent, setIntent] = useState<Intent | null>(null);
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [areaRange, setAreaRange] = useState<AreaRange | null>(null);
  const [budgetFrom, setBudgetFrom] = useState("");
  const [budgetTo, setBudgetTo] = useState("");
  const [message, setMessage] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Popup: delayed reveal + coord flag so PDF magnet doesn't stack with us.
  // Inline: always visible unless suppressed.
  useEffect(() => {
    if (variant === "inline") {
      if (isSuppressed()) {
        setMounted(false);
        setVisible(false);
      } else {
        trackEvent("developer_survey_shown", { variant, guide_slug: guideSlug ?? null });
      }
      return;
    }
    setLang(pageLanguage());
    if (isSuppressed()) return;
    // Guides get no concierge (see magnet-coord), so nothing to wait for.
    const t = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
      trackEvent("developer_survey_shown", { variant, guide_slug: guideSlug ?? null });
    }, SHOW_AFTER_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inline follows the page language too — but for form validation
  // strings only; no delayed mount logic to run.
  useEffect(() => {
    if (variant === "inline") setLang(pageLanguage());
  }, [variant]);

  // Focus name when popup expands.
  useEffect(() => {
    if (expanded && nameInputRef.current && isPopup) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [expanded, isPopup]);

  const t = COPY[lang];
  const isRtl = lang === "ar";

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    trackEvent("developer_survey_dismiss", {
      variant,
      guide_slug: guideSlug ?? null,
      expanded,
    });
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      setExpanded(false);
    }, 400);
  };

  const openForm = () => {
    setExpanded(true);
    trackEvent("developer_survey_open", {
      variant,
      guide_slug: guideSlug ?? null,
    });
  };

  const pickIntent = (i: Intent) => {
    setIntent(i);
    trackEvent("developer_survey_intent", { intent: i, variant });
  };

  const submit = async () => {
    setErrorText(null);
    if (!name.trim()) {
      setErrorText(t.validationName);
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorText(t.validationEmail);
      return;
    }
    if (!phone.trim() || phone.trim().length < 4) {
      setErrorText(t.validationPhone);
      return;
    }
    if (!intent) {
      setErrorText(t.intentLabel);
      return;
    }
    const parsedFrom = budgetFrom ? Number(budgetFrom.replace(/[^\d]/g, "")) : NaN;
    const parsedTo = budgetTo ? Number(budgetTo.replace(/[^\d]/g, "")) : NaN;
    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      intent,
      company: company.trim() || undefined,
      job_title: jobTitle.trim() || undefined,
      area_range: areaRange ?? undefined,
      budget_from: Number.isFinite(parsedFrom) ? parsedFrom : undefined,
      budget_to: Number.isFinite(parsedTo) ? parsedTo : undefined,
      message: message.trim() || undefined,
      placement: variant,
      guide_slug: guideSlug ?? null,
      preferred_language: lang,
      page_url:
        typeof window !== "undefined" ? window.location.pathname : undefined,
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/leads/developer-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      try {
        localStorage.setItem(SUBMITTED_KEY, String(Date.now()));
      } catch {
        // ignore
      }
      trackEvent("developer_survey_submit", {
        variant,
        intent,
        guide_slug: guideSlug ?? null,
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  // Progressive-disclosure qualifiers: reveal once the required fields are filled.
  const shouldAutoOpenQualifiers =
    name.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0;
  const qualifiersOpen = detailsOpen || shouldAutoOpenQualifiers;

  const formInner = (
    <>
      {status === "sent" ? (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-3">
            <Check className="w-6 h-6" />
          </div>
          <p className="text-sm md:text-base font-medium text-primary mb-1">
            {t.successTitle}
          </p>
          <p className="text-xs text-muted-foreground">{t.successBody}</p>
        </div>
      ) : (
        <div className={`${isPopup ? "p-5" : "p-6 md:p-7"} space-y-4`}>
          {/* Intent buttons */}
          <div>
            <label className="block text-xs font-medium text-primary mb-2">
              {t.intentLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(t.intents) as Intent[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => pickIntent(key)}
                  className={`text-xs font-medium px-3 py-2 rounded-full border transition-all ${
                    intent === key
                      ? "bg-accent text-white border-accent"
                      : "bg-white text-primary border-border/60 hover:border-accent/60 hover:bg-accent/5"
                  }`}
                >
                  {t.intents[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-primary mb-1">
                {t.nameLabel} <span className="text-accent">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary mb-1">
                {t.phoneLabel} <span className="text-accent">*</span>
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 …"
                className="w-full px-3 py-2 rounded-lg border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-primary mb-1">
              {t.emailLabel} <span className="text-accent">*</span>
            </label>
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-sm bg-white"
            />
          </div>

          {/* Progressive qualifiers */}
          <div className="border-t border-border/40 pt-3">
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              className="w-full flex items-center justify-between text-xs font-medium text-primary/80 hover:text-primary transition-colors"
            >
              <span>{t.moreDetails}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${qualifiersOpen ? "rotate-180" : ""}`}
              />
            </button>
            {qualifiersOpen && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-primary/80 mb-1">
                      {t.companyLabel}
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-primary/80 mb-1">
                      {t.jobLabel}
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-primary/80 mb-1.5">
                    {t.areaLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(t.areas) as AreaRange[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setAreaRange((cur) => (cur === key ? null : key))
                        }
                        className={`text-[11px] font-medium px-2.5 py-1.5 rounded-full border transition-all ${
                          areaRange === key
                            ? "bg-accent text-white border-accent"
                            : "bg-white text-primary border-border/60 hover:border-accent/60 hover:bg-accent/5"
                        }`}
                      >
                        {t.areas[key]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-primary/80 mb-1">
                    {t.budgetLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budgetFrom}
                      onChange={(e) =>
                        setBudgetFrom(e.target.value.replace(/[^\d,]/g, ""))
                      }
                      placeholder={t.budgetFrom}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-sm bg-white"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budgetTo}
                      onChange={(e) =>
                        setBudgetTo(e.target.value.replace(/[^\d,]/g, ""))
                      }
                      placeholder={t.budgetTo}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {intent === "other" && (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isRtl ? "أخبرنا بالمزيد (اختياري)" : "Tell us more (optional)"}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-sm bg-white resize-none"
            />
          )}

          {errorText && <p className="text-xs text-accent">{errorText}</p>}
          {status === "error" && <p className="text-xs text-accent">{t.error}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={status === "sending"}
            className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium py-2.5 rounded-full transition-colors disabled:opacity-60"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.submitting}
              </>
            ) : (
              <>
                {t.submit}
                <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              </>
            )}
          </button>
        </div>
      )}
    </>
  );

  // ── INLINE variant ────────────────────────────────────────────────────
  // Editorial-feel CTA banner that lives inside the guide text. Deliberately
  // NOT a form — dumping a full form mid-article is jarring and breaks the
  // reading flow. Instead this is a subtle branded aside that OPENS the
  // popup version of the magnet when clicked. The popup provides the form.
  if (variant === "inline") {
    if (!mounted) return null;
    return (
      <aside
        dir={isRtl ? "rtl" : "ltr"}
        // Dark charcoal promotional block — deliberately distinct visual
        // language from the KeyInsight editorial callout (which lives on
        // cream/white with a top accent stripe). Stacked one after the
        // other now reads as "editorial note" → "promotional CTA", not
        // as two similar cards.
        className="my-6 md:my-8 not-prose"
      >
        <div
          className="relative overflow-hidden rounded-2xl bg-primary text-white shadow-lg shadow-primary/20"
        >
          {/* Subtle accent glow in the far corner — brand identity without
              competing with the KeyInsight's top-stripe treatment. */}
          <div
            className={`pointer-events-none absolute -top-24 ${isRtl ? "-left-24" : "-right-24"} h-52 w-52 rounded-full bg-accent/25 blur-3xl`}
            aria-hidden="true"
          />

          <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-4 md:gap-8 p-5 sm:p-6 md:px-7 md:py-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1.5 inline-flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                {isRtl ? "استطلاع PLACES 2026" : "PLACES 2026 Survey"}
              </p>
              <h3 className="font-serif text-lg md:text-xl font-bold text-white leading-snug mb-1.5">
                {t.hookHeadline}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed max-w-xl">
                {isRtl
                  ? "أرقام فعلية من صفقات ميدانية عبر التجمع الخامس، الشيخ زايد، و6 أكتوبر."
                  : "Real transaction numbers from ground-level deals across New Cairo, Sheikh Zayed, and 6th October."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                trackEvent("developer_survey_open", {
                  variant: "inline",
                  guide_slug: guideSlug ?? null,
                });
                window.dispatchEvent(
                  new CustomEvent("places-open-developer-survey", {
                    detail: { source: "inline", guide_slug: guideSlug ?? null },
                  }),
                );
              }}
              className="group inline-flex items-center justify-center gap-2 whitespace-nowrap w-full md:w-auto bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-5 py-2.5 md:py-3 rounded-full transition-all shadow-md shadow-accent/30 hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5"
            >
              {isRtl ? "احصل على PDF مجاناً" : "Get the free PDF"}
              <ArrowRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // ── POPUP variant ─────────────────────────────────────────────────────
  if (!mounted) return null;
  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      // Bottom-RIGHT per user request 2026-09-07 (was bottom-left).
      // Safe here because this magnet only mounts on /guides/* pages,
      // where the CornerSlideMagnet (also bottom-right on other pages)
      // is not mounted. ConciergeWidget lives at top-right — no vertical
      // overlap on any viewport since concierge starts at top-20/top-24.
      className={`fixed right-4 bottom-[calc(var(--bottom-bar-offset,4.5rem)+env(safe-area-inset-bottom))] lg:bottom-6 lg:right-6 z-40 max-w-[calc(100vw-2rem)] transition-all duration-400 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      {expanded ? (
        <div className="w-[min(24rem,calc(100vw-2rem))] max-h-[calc(100dvh-10rem)] lg:max-h-[calc(100dvh-3rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-primary/10">
          <div className="bg-primary px-5 py-4 relative">
            <button
              type="button"
              onClick={dismiss}
              aria-label={t.close}
              className={`absolute top-3 ${isRtl ? "left-3" : "right-3"} text-white/60 hover:text-white transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/20 px-2.5 py-1 rounded-full mb-1.5">
              {isRtl ? "استطلاع مجاني · PDF" : "Free Survey · PDF"}
            </span>
            <h3 className="text-base md:text-lg font-serif font-bold text-white leading-tight pr-6">
              {t.hookHeadline}
            </h3>
          </div>
          {formInner}
        </div>
      ) : (
        <button
          type="button"
          onClick={openForm}
          className="group relative flex items-center gap-4 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 ring-1 ring-accent/30 pl-4 pr-7 py-4 max-w-md hover:shadow-accent/40 hover:ring-accent/60 transition-all duration-300 hover:-translate-y-0.5"
        >
          <span className="relative flex h-12 w-12 items-center justify-center shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-accent/40 animate-ping"
              aria-hidden="true"
            />
            <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg">
              <FileText className="w-5 h-5" />
            </span>
          </span>

          <div className={`text-${isRtl ? "right" : "left"} min-w-0 pr-6`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent leading-none mb-1.5">
              {isRtl ? "استطلاع مجاني · 2026" : "Free 2026 Survey"}
            </p>
            <p className="text-sm md:text-base font-serif font-bold leading-tight">
              {t.hookHeadline}
            </p>
            <p className="text-xs text-white/70 mt-1 inline-flex items-center gap-1 font-medium">
              {t.ctaBubble}
              <ArrowRight
                className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180" : ""}`}
              />
            </p>
          </div>

          <span
            role="button"
            tabIndex={0}
            aria-label={t.close}
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                dismiss();
              }
            }}
            className={`absolute top-2 ${isRtl ? "left-2" : "right-2"} flex items-center justify-center w-6 h-6 rounded-full text-white/40 hover:text-white hover:bg-white/10 cursor-pointer transition-colors`}
          >
            <X className="w-3.5 h-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}
