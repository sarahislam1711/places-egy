import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, ArrowRight, Check, Loader2, ChevronDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { detectPreferredLanguage } from "@/lib/detect-language";
import { useLocation } from "wouter";
import {
  conciergeAllowed,
  isCookieBannerOnScreen,
  isReportOnScreen,
  onPopupChange,
  setConciergeOnScreen,
} from "@/lib/magnet-coord";

// Concierge widget — a friendly bottom-LEFT chat-bubble prompt asking
// visitors what they're looking for. Positioned opposite the PDF market-
// report magnet (bottom-right) so they don't visually compete.
//
// Design goals (from user brief):
//   - Obvious + clear, not salesy or invasive
//   - Warm concierge voice, not "SIGN UP NOW"
//   - Doesn't block the page; user can ignore it entirely
//   - Only surfaces after 20s (gives them time to browse first — signals
//     "we noticed you're interested" rather than "PLEASE FILL THIS OUT")
//   - Session-only dismiss (X → hidden this tab). Come back tomorrow → visible.
//   - Permanent suppression only on successful submission.
//
// Fires:
//   - concierge_shown       — first paint (post-delay, not-suppressed)
//   - concierge_open        — user clicks the bubble → form expands
//   - concierge_dismiss     — user clicks X on the bubble OR expanded card
//   - concierge_intent      — user picks buy/rent/browsing/other
//   - concierge_submitted   — form POST returns 200

const DISMISS_KEY = "concierge_widget_dismissed_this_session";
const SUBMITTED_KEY = "concierge_widget_submitted_at";
// Mobile visitors see the concierge immediately on landing — small enough
// that it doesn't compete with the hero, but present from the start so
// the "we can help" moment is up-front. Desktop keeps the 3s soft entrance.
const SHOW_AFTER_MS_DESKTOP = 3_000;
const SHOW_AFTER_MS_MOBILE = 0;
function computeShowAfterMs(): number {
  if (typeof window === "undefined") return SHOW_AFTER_MS_DESKTOP;
  return window.matchMedia("(max-width: 767px)").matches
    ? SHOW_AFTER_MS_MOBILE
    : SHOW_AFTER_MS_DESKTOP;
}

type Intent = "buy" | "rent" | "browsing" | "other";
type AreaRange = "under-100" | "100-300" | "300-500" | "500-plus";
type Lang = "en" | "ar";

const COPY = {
  en: {
    bubblePrompt: "Looking for something specific?",
    bubbleSub: "We'll help you find it",
    headline: "Hi 👋 How can we help?",
    sub: "Tell us what you're looking for and a PLACES advisor will reach out with the right options.",
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
    messagePlaceholder: "Tell us more (optional) — size, budget, timeline…",
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
    submit: "Help me find the right office",
    submitting: "Sending…",
    success: "We got it — an advisor will reach out shortly.",
    close: "Close",
    validationEmail: "Please share your email so we can reach you.",
    validationPhone: "Please share your phone number.",
    validationName: "What's your name?",
    error: "Something went wrong — please try again.",
  },
  ar: {
    bubblePrompt: "تبحث عن شيء محدد؟",
    bubbleSub: "دعنا نساعدك في إيجاده",
    headline: "مرحبًا 👋 كيف يمكننا مساعدتك؟",
    sub: "أخبرنا بما تبحث عنه وسيتواصل معك مستشار PLACES بأفضل الخيارات المناسبة.",
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
    messagePlaceholder: "أخبرنا بالمزيد (اختياري) — المساحة، الميزانية، الوقت…",
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
    submit: "ساعدني في إيجاد المكتب المناسب",
    submitting: "جاري الإرسال…",
    success: "تم استلام طلبك — سيتواصل معك أحد مستشارينا قريبًا.",
    close: "إغلاق",
    validationEmail: "من فضلك شارك بريدك الإلكتروني حتى نتمكن من التواصل معك.",
    validationPhone: "من فضلك شارك رقم هاتفك.",
    validationName: "ما اسمك؟",
    error: "حدث خطأ ما — من فضلك حاول مرة أخرى.",
  },
} as const;

function isSuppressed(): boolean {
  try {
    if (localStorage.getItem(SUBMITTED_KEY)) return true;
    if (sessionStorage.getItem(DISMISS_KEY)) return true;
    return false;
  } catch {
    return false;
  }
}

export function ConciergeWidget() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [intent, setIntent] = useState<Intent | null>(null);
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [areaRange, setAreaRange] = useState<AreaRange | null>(null);
  const [budgetFrom, setBudgetFrom] = useState("");
  const [budgetTo, setBudgetTo] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLang(detectPreferredLanguage());
  }, []);

  // Shown only on pages the rules in magnet-coord give it, and never while the
  // market report popup is on screen. Leaving for a research page hides it
  // (typed answers are kept); coming back shows it again straight away.
  const [location] = useLocation();
  const allowed = conciergeAllowed(location);
  const shownRef = useRef(false);
  useEffect(() => {
    if (!allowed || isSuppressed()) {
      setVisible(false);
      setConciergeOnScreen(false);
      return;
    }
    if (shownRef.current) {
      setVisible(true);
      setConciergeOnScreen(true);
      return;
    }
    let unsubscribe = () => {};
    const show = () => {
      if (isReportOnScreen() || isCookieBannerOnScreen()) {
        unsubscribe = onPopupChange(() => {
          if (isReportOnScreen() || isCookieBannerOnScreen()) return;
          unsubscribe();
          show();
        });
        return;
      }
      shownRef.current = true;
      setMounted(true);
      setConciergeOnScreen(true);
      requestAnimationFrame(() => setVisible(true));
      trackEvent("concierge_shown", {});
    };
    const t = setTimeout(show, computeShowAfterMs());
    return () => {
      clearTimeout(t);
      unsubscribe();
    };
  }, [allowed]);

  useEffect(() => () => setConciergeOnScreen(false), []);

  // Focus name field when the form expands — small UX polish so keyboard
  // users don't have to tab through the whole widget to start typing.
  useEffect(() => {
    if (expanded && nameInputRef.current) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [expanded]);

  const t = COPY[lang];
  const isRtl = lang === "ar";

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore — worst case they see it again next tab
    }
    // Frees the report popup to appear 15s from now (homepage).
    setConciergeOnScreen(false);
    trackEvent("concierge_dismiss", { expanded });
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      setExpanded(false);
    }, 400);
  };

  const openForm = () => {
    setExpanded(true);
    trackEvent("concierge_open", {});
  };

  const pickIntent = (i: Intent) => {
    setIntent(i);
    trackEvent("concierge_intent", { intent: i });
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
      message: message.trim() || undefined,
      company: company.trim() || undefined,
      job_title: jobTitle.trim() || undefined,
      area_range: areaRange ?? undefined,
      budget_from: Number.isFinite(parsedFrom) ? parsedFrom : undefined,
      budget_to: Number.isFinite(parsedTo) ? parsedTo : undefined,
      preferred_language: lang,
      page_url: typeof window !== "undefined" ? window.location.pathname : undefined,
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/leads/concierge", {
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
      trackEvent("concierge_submitted", { intent });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (!mounted) return null;

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      // Top-right, offset below the navbar. Slides down on entry so the
      // motion cue reads as "notification arriving" rather than "sales
      // popup rising up at you". Avoids the Book-a-Meeting float
      // (bottom-left) and the PDF corner magnet (bottom-right).
      className={`fixed top-20 right-4 md:top-24 md:right-6 z-40 max-w-[calc(100vw-2rem)] transition-all duration-400 ease-out ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      {expanded ? (
        // ── Expanded form card ──────────────────────────────────────────
        // Height is capped so the whole card never exceeds the viewport.
        // 100dvh - top offset (top-20 on mobile = 80px, +16px breathing
        // room) - a couple rem for below-card breathing = generous but
        // bounded. Card becomes a flex column: header + scrollable body
        // + sticky submit footer. Guarantees the CTA is always visible.
        <div
          className="w-[min(24rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl border border-primary/10 overflow-hidden flex flex-col"
          style={{
            maxHeight: "calc(100dvh - 6rem)",
          }}
        >
          <div className="bg-primary px-5 py-4 relative shrink-0">
            <button
              type="button"
              onClick={dismiss}
              aria-label={t.close}
              className={`absolute top-3 ${isRtl ? "left-3" : "right-3"} text-white/60 hover:text-white transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base md:text-lg font-serif font-bold text-white leading-tight pr-6">
              {t.headline}
            </h3>
            <p className="text-xs text-white/70 mt-1 leading-snug">{t.sub}</p>
          </div>

          {status === "sent" ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-3">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-primary">{t.success}</p>
            </div>
          ) : (
            <div className="p-5 pb-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              {/* Intent picker — big obvious buttons */}
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

              {/* Name + Phone side-by-side (denser first row), Email full
                  width below. Keeps the base form to 2 rows instead of 3. */}
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

              {intent === "other" && (
                <div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.messagePlaceholder}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-sm bg-white resize-none"
                  />
                </div>
              )}

              {/* Optional qualifiers — progressively disclosed. Once the
                  user has committed to filling out the form (name AND
                  contact typed), we auto-reveal the extra qualifier
                  fields. This surfaces them without punishing casual
                  visitors who bounce after the first field. Users can
                  also expand/collapse manually via the header. */}
              {(() => {
                const shouldAutoOpen =
                  name.trim().length > 0 &&
                  email.trim().length > 0 &&
                  phone.trim().length > 0;
                const open = detailsOpen || shouldAutoOpen;
                return (
                  <div className="border-t border-border/40 pt-3">
                    <button
                      type="button"
                      onClick={() => setDetailsOpen((v) => !v)}
                      className="w-full flex items-center justify-between text-xs font-medium text-primary/80 hover:text-primary transition-colors"
                    >
                      <span>{t.moreDetails}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    {open && (
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
                );
              })()}

            </div>
          )}
          {/* Sticky footer — errors + submit button live OUTSIDE the
              scrollable body so the CTA is always visible on mobile even
              when the qualifier fields push the form taller than the
              viewport. Only rendered while the form is active (not on
              success), matches the previous behavior. */}
          {status !== "sent" && (
            <div className="shrink-0 border-t border-primary/5 bg-white px-5 py-3 space-y-2">
              {errorText && (
                <p className="text-xs text-accent">{errorText}</p>
              )}
              {status === "error" && (
                <p className="text-xs text-accent">{t.error}</p>
              )}
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
        </div>
      ) : (
        // ── Collapsed bubble ──────────────────────────────────────────
        <button
          type="button"
          onClick={openForm}
          // Mobile: chunky round accent-red pill — eye-catchy against
          // the site's cream backgrounds without hijacking the whole
          // viewport. The white card + text layout is kept intact for
          // md+ so desktop reads exactly as before.
          className="group relative flex items-center gap-2.5 md:gap-4 bg-accent md:bg-white text-white md:text-primary rounded-full md:rounded-2xl shadow-2xl shadow-accent/40 md:shadow-primary/25 ring-2 ring-primary md:ring-1 md:ring-primary/10 pl-2 md:pl-4 pr-3 md:pr-7 py-2 md:py-4 max-w-md hover:shadow-accent/50 md:hover:shadow-primary/35 hover:ring-primary md:hover:ring-accent/40 transition-all duration-300 hover:-translate-y-0.5"
        >
          <span className="relative flex h-12 w-12 md:h-12 md:w-12 items-center justify-center shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-white/40 md:bg-accent/30 animate-ping"
              aria-hidden="true"
            />
            <span className="relative inline-flex h-12 w-12 md:h-12 md:w-12 items-center justify-center rounded-full bg-white md:bg-accent text-accent md:text-white shadow-md">
              <MessageCircle className="w-6 h-6" />
            </span>
          </span>

          {/* Mobile: shows a short label next to the icon so the icon has
              a "handle" without feeling like a full text card. Desktop keeps
              the fuller two-line pitch. */}
          <span className={`md:hidden text-sm font-semibold whitespace-nowrap pr-1 ${isRtl ? "text-right" : "text-left"}`}>
            {isRtl ? "نساعدك؟" : "How can we help?"}
          </span>

          <div className={`hidden md:block text-${isRtl ? "right" : "left"} min-w-0 pr-6`}>
            <p className="text-base md:text-lg font-serif font-bold leading-tight">
              {t.bubblePrompt}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-tight">
              {t.bubbleSub}
            </p>
          </div>

          {/* Close X — hidden on mobile (icon-only bubble handles both
              actions on tap: open form. Dismiss is on the expanded card.) */}
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
            className={`hidden md:flex absolute top-2 ${isRtl ? "left-2" : "right-2"} items-center justify-center w-6 h-6 rounded-full text-muted-foreground hover:text-accent hover:bg-accent/10 cursor-pointer transition-colors`}
          >
            <X className="w-3.5 h-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}
