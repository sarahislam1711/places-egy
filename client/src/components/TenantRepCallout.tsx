import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { TENANT_REP_COPY, TENANT_REP_PATH, type TenantRepVariant } from "@/lib/tenant-rep-cta";

// "Use a tenant rep" call-out for rent pages, listings, guides and FAQs.
// Crawlers get the same words from tenantRepHtml() in the server render.
export function TenantRepCallout({ variant = "rent", className = "" }: { variant?: TenantRepVariant; className?: string }) {
  const c = TENANT_REP_COPY[variant];
  return (
    <aside className={`rounded-2xl bg-primary text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10 ${className}`}>
      <div className="flex-1">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-white">{c.title}</h2>
        <p className="mt-2 text-white/75 leading-relaxed">{c.text}</p>
      </div>
      <Link
        href={TENANT_REP_PATH}
        className="inline-flex items-center justify-center gap-2 shrink-0 rounded-md bg-accent hover:bg-accent/90 text-white font-semibold px-5 h-11 transition-colors"
      >
        {c.link} <ArrowRight className="w-4 h-4" />
      </Link>
    </aside>
  );
}
