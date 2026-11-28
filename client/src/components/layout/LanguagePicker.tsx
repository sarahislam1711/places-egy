import { useId } from "react";
import { Link, useLocation } from "wouter";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trackEvent } from "@/lib/analytics";
import { useLang } from "@/lib/ui-text";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";

// Language picker in the menu (29 Nov): flag dropdown on desktop, two buttons
// in the phone menu. Picks the same page in the other language when it exists;
// otherwise the other language's home page (Arabic pages always have a twin).
// Flags are inline SVG: flag emoji show as "EG"/"GB" letters on Windows.

function FlagEG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden>
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6.67" fill="#CE1126" />
      <rect y="13.33" width="30" height="6.67" fill="#000" />
      {/* The gold eagle, simplified (without it the flag reads as Yemen's). */}
      <path d="M15 7.4l1.6 1.1-.5 2.6H13.9l-.5-2.6z" fill="#C09300" />
      <rect x="13.6" y="11.3" width="2.8" height="0.9" rx="0.3" fill="#C09300" />
    </svg>
  );
}

function FlagGB({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden>
      <clipPath id={`gb-s-${id}`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`gb-t-${id}`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#gb-s-${id})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#gb-t-${id})`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

const OPTIONS: Array<{ lang: Lang; label: string; short: string; Flag: typeof FlagEG }> = [
  { lang: "en", label: "English", short: "EN", Flag: FlagGB },
  { lang: "ar", label: "العربية", short: "ع", Flag: FlagEG },
];

const flagClass = "h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/10 object-cover";

function useTargets() {
  const [location] = useLocation();
  const { lang, twin } = useLang();
  const hrefFor = (to: Lang) => (to === lang ? location : twin ?? (to === "ar" ? "/ar" : "/"));
  const pick = (to: Lang) => {
    if (to !== lang) trackEvent("language_switch", { to, from_path: location, same_page: Boolean(twin) });
  };
  return { lang, hrefFor, pick };
}

/** Desktop: flag + short code, opens a two-item dropdown. */
export function LanguagePicker({ className }: { className?: string }) {
  const { lang, hrefFor, pick } = useTargets();
  const current = OPTIONS.find((o) => o.lang === lang)!;
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={lang === "ar" ? "اختر اللغة" : "Choose language"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 h-9 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className,
        )}
      >
        <current.Flag className={flagClass} />
        <span>{current.short}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-[10rem]">
        {OPTIONS.map((o) => (
          <DropdownMenuItem key={o.lang} asChild className="cursor-pointer gap-2.5">
            <Link href={hrefFor(o.lang)} hrefLang={o.lang} lang={o.lang} onClick={() => pick(o.lang)}>
              <o.Flag className={flagClass} />
              <span className="flex-1">{o.label}</span>
              {o.lang === lang && <Check className="h-4 w-4 text-accent" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Phone menu: both languages side by side, current one highlighted. */
export function LanguagePickerInline({ onPick }: { onPick?: () => void }) {
  const { lang, hrefFor, pick } = useTargets();
  return (
    <div className="grid grid-cols-2 gap-2 py-2" role="group" aria-label={lang === "ar" ? "اللغة" : "Language"}>
      {OPTIONS.map((o) => (
        <Link
          key={o.lang}
          href={hrefFor(o.lang)}
          hrefLang={o.lang}
          lang={o.lang}
          aria-current={o.lang === lang ? "true" : undefined}
          onClick={() => {
            pick(o.lang);
            onPick?.();
          }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors",
            o.lang === lang ? "border-accent/60 bg-white/10 text-white" : "border-white/15 text-white/75 hover:text-white hover:bg-white/5",
          )}
        >
          <o.Flag className={flagClass} />
          {o.label}
        </Link>
      ))}
    </div>
  );
}
