import { Link } from "wouter";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequirementsTrigger } from "@/components/RequirementsForm";
import { TENANT_REP_PATH, tenantRepCopy, type TenantRepVariant } from "@/lib/tenant-rep-cta";
import { localHref } from "@/lib/i18n";

// "Use a tenant rep" call-out for rent pages, listings, guides and FAQs.
// Left: headline, one line, three quick points. Right: the "EGP 0" promise and
// the actions (the requirements form opens in place; the text link explains
// the service). Two columns only on wide screens (lg); below that the promise
// becomes a band under the points, so nothing is squeezed or left empty.
// Crawlers get the same message from tenantRepHtml() in the server render.
export function TenantRepCallout({ variant = "rent", className = "", lang = "en" }: { variant?: TenantRepVariant; className?: string; lang?: "en" | "ar" }) {
  const c = tenantRepCopy(variant, lang);
  const ar = lang === "ar";
  return (
    <aside className={`overflow-hidden rounded-3xl bg-primary text-white ${className}`}>
      <div className="grid lg:grid-cols-[1.4fr_1fr]">
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
        <div className="flex flex-col justify-center bg-white/[0.05] p-6 md:px-10 md:py-8 lg:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between lg:flex-col lg:items-start lg:justify-center">
            <div>
              <p className="font-serif text-5xl md:text-6xl font-bold leading-none tracking-[-0.03em] text-white">{ar ? "0 ج.م" : "EGP 0"}</p>
              <p className="mt-3 text-sm md:text-base text-white/70">{ar ? "للمستأجر. المالك هو من يدفع أتعابنا." : "for tenants. The landlord pays our fee."}</p>
            </div>
            <div className="flex flex-col items-start gap-4">
              <RequirementsTrigger config={{ intent: "rent", pageName: c.formPage }} fallbackHref="/contact">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-6 h-12 text-base">
                  {ar ? "أرسل طلبك" : "Send us your requirements"} <ArrowRight className="ms-2 w-4 h-4 rtl:rotate-180" />
                </Button>
              </RequirementsTrigger>
              <Link
                href={localHref(TENANT_REP_PATH, lang)}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/75 hover:text-white transition-colors"
              >
                {c.link}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
