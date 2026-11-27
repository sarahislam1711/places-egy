import { Link } from "wouter";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequirementsTrigger } from "@/components/RequirementsForm";
import { TENANT_REP_COPY, TENANT_REP_PATH, type TenantRepVariant } from "@/lib/tenant-rep-cta";

// "Use a tenant rep" call-out for rent pages, listings, guides and FAQs.
// Left: headline, one line, three quick points. Right: the "EGP 0" promise and
// the actions (the requirements form opens in place; the text link explains
// the service). Crawlers get the same message from tenantRepHtml() in the
// server render.
export function TenantRepCallout({ variant = "rent", className = "" }: { variant?: TenantRepVariant; className?: string }) {
  const c = TENANT_REP_COPY[variant];
  return (
    <aside className={`overflow-hidden rounded-3xl bg-primary text-white shadow-[0_24px_60px_-32px_rgba(17,17,17,0.6)] ${className}`}>
      <div className="grid md:grid-cols-[1.4fr_1fr]">
        <div className="p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight tracking-[-0.02em] text-white">{c.title}</h2>
          <p className="mt-2 text-base md:text-lg text-white/70">{c.lead}</p>
          <ul className="mt-6 space-y-3">
            {c.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-white/90">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                </span>
                <span className="leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center border-t border-white/10 bg-white/[0.04] p-6 md:border-l md:border-t-0 md:p-10">
          <p className="font-serif text-5xl md:text-6xl font-bold leading-none tracking-[-0.03em] text-white">
            EGP 0
          </p>
          <p className="mt-3 text-sm md:text-base text-white/70">for tenants. The landlord pays our fee.</p>
          <div className="mt-6 flex flex-col items-start gap-4">
            <RequirementsTrigger config={{ intent: "rent", pageName: c.formPage }} fallbackHref="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-6 h-12 text-base shadow-[0_10px_30px_-12px_rgba(232,64,74,0.7)]">
                Send us your requirements <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </RequirementsTrigger>
            <Link
              href={TENANT_REP_PATH}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/75 hover:text-white transition-colors"
            >
              {c.link}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
