import { useState } from "react";
import { Link } from "wouter";
import { Handshake, Building2, Repeat, TrendingUp, Coins, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Handshake,
    title: "Tenant Representation",
    desc: "We represent your company, not the landlord: we find, compare and negotiate your office across Cairo and review the lease. Free for tenants.",
    link: "/services/tenant-representation",
  },
  {
    icon: Building2,
    title: "Primary Property",
    desc: "Buy directly from the developer. We give you access to off-plan and newly launched units across Egypt's most active developments.",
    link: "/services/primary-property",
  },
  {
    icon: Repeat,
    title: "Property Resale",
    desc: "Buy or sell a unit that has already been transacted. We connect serious buyers with motivated sellers and provide full market context on both sides.",
    link: "/services/property-resale",
  },
  {
    icon: TrendingUp,
    title: "Investment Consultation",
    desc: "Not sure where to put your money? We analyze yield potential, vacancy risk, and capital appreciation across administrative office assets in Egypt.",
    link: "/services/investment-consultation",
  },
  {
    icon: Coins,
    title: "Income Generating Property",
    desc: "Find units that generate consistent rental income. We identify assets with strong tenant demand and sustainable yield in Egypt's most active business districts.",
    link: "/services/income-generating-property",
  },
];

export function ServicesExplorer() {
  const [active, setActive] = useState(0);
  const current = services[active];

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6 items-stretch">
      {/* Left — service list */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:justify-between">
        {services.map((service, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all whitespace-nowrap md:whitespace-normal shrink-0 md:shrink ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-primary hover:bg-primary/5 border border-border/40"
              }`}
            >
              <service.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-accent" : "text-primary/50"}`} />
              <span className="text-sm font-medium">{service.title}</span>
            </button>
          );
        })}
      </div>

      {/* Right — detail panel */}
      <div className="bg-white rounded-2xl border border-border/40 shadow-sm shadow-primary/5 p-8 md:p-10 min-h-[280px] flex flex-col justify-between">
        <div>
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
            <current.icon className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-primary mb-4">{current.title}</h3>
          <p className="text-muted-foreground leading-relaxed text-base">
            {current.desc}
          </p>
        </div>
        <Link
          href={current.link}
          className="inline-flex items-center text-accent font-medium hover:text-primary transition-colors mt-6"
        >
          Learn more <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
