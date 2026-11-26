// FAQ content + types.
//
// Structure:
//   FAQ_SECTIONS — top-level array of 10 sections (matches the 10-step investor decision journey).
//   Each section has subsections (A, B, C, ...) and each subsection has Q&A items.
//
// Slugs are auto-derived from question text via slugify(). Anchor URLs are
// `/faqs#${slug}` so individual Q&As can be deep-linked.
//
// To add a question: append to the appropriate subsection's `items` array.
// To add a section: append a new entry to FAQ_SECTIONS.
// All schema.org / scroll-spy / search wiring picks up the new content automatically.

export type FAQItem = {
  q: string;
  a: string;
};

export type FAQSubsection = {
  id: string;
  title: string;
  items: FAQItem[];
};

export type FAQSection = {
  id: string;
  number: number;
  title: string;
  // Optional condensed label used in the sidebar / mobile dropdown where
  // space is tight. Falls back to `title` if omitted. Keep `title` long for
  // SEO + JSON-LD; keep `shortTitle` punchy for scanning.
  shortTitle?: string;
  intro: string;
  subsections: FAQSubsection[];
};

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80)
    .replace(/-+$/, "");
}

export const FAQ_SECTIONS: FAQSection[] = [
  {
    id: "early-thinking",
    number: 1,
    title: "Early Thinking & Understanding the Decision",
    shortTitle: "Early Thinking",
    intro:
      "Before evaluating any specific unit, get clear on whether commercial real estate fits your goals, finances, and time horizon.",
    subsections: [
      {
        id: "mindset-motivation",
        title: "Mindset & motivation",
        items: [
          {
            q: "Is investing in commercial real estate in Egypt worth it compared to bank certificates or foreign currency?",
            a: "Commercial real estate in Egypt usually outperforms bank certificates and foreign currency over the medium term. It offers rental yields between 8% and 14% per year, plus value growth over time. Certificates pay fixed returns that often fall behind inflation, and foreign currency on its own generates no income. The result depends on selection — a poorly chosen unit can underperform a savings account, which is why working with a specialized consultancy like PLACES helps.",
          },
          {
            q: "How do I know if I am financially ready to buy a commercial property in Egypt?",
            a: "You are financially ready when you can pay the down payment without using your emergency savings, continue paying installments even if your income drops, and cover a 6 to 18 month period before rental income starts. You should also be ready to keep the property for at least 5 to 7 years, since commercial real estate is a long-term investment, not a short-term resale.",
          },
          {
            q: "Why are more Egyptians and foreign investors buying commercial real estate instead of residential?",
            a: "Commercial real estate gives higher rental yields than residential — 8% to 14% per year compared to 3% to 6%. Lease contracts are longer, tenants are more stable, and tenants usually pay for their own fit-out, utilities, and maintenance. Residential supply has also grown faster than demand in many new cities, while demand for commercial space keeps rising in business areas.",
          },
          {
            q: "Is commercial real estate a better protection against inflation than residential property or other investments?",
            a: "Yes. Commercial lease contracts in Egypt usually include yearly rent increases linked to inflation, which residential leases rarely have. This means rental income rises as prices rise, protecting the value of your money. Combined with property value growth in good locations, commercial real estate has performed better than gold, residential rentals, and bank deposits over 5 to 10 year periods.",
          },
          {
            q: "Should I invest in commercial property now or wait for the market to improve?",
            a: "Waiting often costs more than buying now. Prices in main commercial areas have risen every year, and pre-launch and early-launch prices give the largest discounts. The more important question is not when to buy but what to buy — a strong unit in a strong project performs well in any market, while a weak unit underperforms even in a strong market.",
          },
          {
            q: "Can I invest in commercial real estate in Egypt without prior experience or being a full-time investor?",
            a: "Yes, if you work with a specialized advisor who handles selection, due diligence, and management. Most successful commercial investors in Egypt are business owners, professionals, and expats — not full-time real estate experts. A consultancy like PLACES guides you from selection to leasing, so you can invest without learning the market from scratch.",
          },
          {
            q: "How do I know if commercial real estate fits my long-term financial goals?",
            a: "Define your goals first: monthly income, long-term value growth, business use, or wealth protection. Commercial real estate fits goals that need stable cash flow, inflation protection, and a holding period of at least 5 years. It is not suitable if you need quick access to cash, cannot accept handover delays, or expect fast resale profits.",
          },
          {
            q: "What questions should I ask myself before looking at commercial units in Egypt?",
            a: "Ask: What is my goal — income, value growth, or business use? What is my full budget including extra costs? How many years can I hold the property? What is my risk tolerance if delivery is delayed? Do I want a passive investment or active management? Answering these first prevents emotional decisions and narrows your options to what fits your situation.",
          },
        ],
      },
      {
        id: "what-cre-is",
        title: "Commercial real estate basics",
        items: [
          {
            q: "What is commercial real estate in Egypt and how is it different from residential property?",
            a: "Commercial real estate is any property used to generate business income — offices, retail shops, medical units, malls, drive-thrus, and business parks. Unlike residential, commercial properties are valued by income potential, follow different licensing rules, and are leased on longer terms to businesses instead of individuals.",
          },
          {
            q: "What is the difference between commercial, administrative, medical, and retail real estate in Egypt?",
            a: "Administrative units are licensed for office work and corporate use. Commercial units cover retail and customer-facing businesses. Medical units are licensed for clinics, labs, and healthcare and have specific technical requirements. Retail is a type of commercial space focused on storefronts and customer traffic. Each has different pricing, licensing rules, and tenant types.",
          },
          {
            q: "How does the commercial real estate market in Egypt work for a buyer?",
            a: "Buyers choose between off-plan units (bought during construction with installment plans) and ready units (delivered or resale). Prices depend on location, developer, project quality, and unit specifications. After purchase, owners either lease the unit, use it for their own business, or sell it later. Most transactions go through brokers, sales agents, or specialized consultancies.",
          },
          {
            q: "What does the full process of buying a commercial unit in Egypt look like from start to finish?",
            a: "The process has six stages: defining your goal and budget, choosing locations and developers, evaluating specific units, negotiating price and contract terms, signing and paying installments, and finally handover, fit-out, and leasing. The full cycle from decision to first rental income takes 2 to 5 years for off-plan units, or 3 to 9 months for ready units.",
          },
          {
            q: "How is investing in commercial real estate different from investing in apartments or villas?",
            a: "Commercial properties generate 2 to 3 times higher rental yields, attract business tenants on longer leases, and usually require the tenant to handle fit-out and maintenance. Residential is easier to lease quickly but yields less and changes tenants more often. Commercial also requires more research before buying — location, tenant mix, and licensing matter more than design and finishing.",
          },
          {
            q: "What basic terms should I understand before entering the commercial real estate market?",
            a: "Key terms include: ROI (return on investment), rental yield (yearly rent divided by property value), capital appreciation (value growth over time), core and shell, fit-out, anchor tenant, footfall, masterplan, off-plan, ready unit, payment plan, maintenance fees, and zoning. Understanding these prevents confusion during sales meetings and contract reviews.",
          },
        ],
      },
      {
        id: "goals-expectations",
        title: "Goals & expectations",
        items: [
          {
            q: "Should my goal be rental income, value growth, or using the space for my own business?",
            a: "Your goal depends on your priority. For monthly income, focus on medical units or admin offices with corporate tenants. For long-term value growth, focus on pre-launch units in growing areas. For business use, focus on visibility, accessibility, and fit with your brand. Many investors mix goals, but one should lead the decision.",
          },
          {
            q: "What is the difference between buying for rental income and buying for long-term value growth?",
            a: "Rental income strategies focus on ready units in mature areas with immediate demand, accepting slower value growth for stable monthly income. Value growth strategies focus on off-plan units in developing areas, accepting delayed income for higher long-term price increases. Choose based on whether you need income now or wealth growth later.",
          },
          {
            q: "Should I be a short-term reseller or a long-term owner in commercial real estate?",
            a: "Most investors earn more as long-term owners. Short-term reselling needs deep market knowledge, strong developer connections, and access to pre-launch prices, and even then a holding period of 2 to 4 years usually performs better than quick resale after fees and taxes. Long-term ownership captures both rental income and full value growth.",
          },
          {
            q: "What is a realistic return on investment for commercial property in Egypt?",
            a: "Realistic ROI ranges from 12% to 20% per year when combining rental yield (8% to 14%) and value growth (4% to 8%) on well-selected commercial units. Drive-thru, medical, and prime mall units perform at the higher end. Standard admin offices in mature areas perform at the lower end. Off-plan units in growing areas can exceed 20% over full development cycles.",
          },
          {
            q: "How long does it take to recover my investment through rent alone?",
            a: "Most commercial units recover their full value through rent in 8 to 12 years, depending on yield and yearly rent increases. Higher-yield types like drive-thrus and medical hubs can recover in 6 to 9 years. This calculation does not include value growth, which usually doubles total returns when added.",
          },
          {
            q: "Is commercial real estate a passive investment or do I need to manage it actively?",
            a: "It can be either. Passive ownership means hiring a property manager or consultancy to handle leasing, tenants, and maintenance — common for investors abroad or with limited time. Active management means handling these tasks yourself, which saves fees but takes time and market knowledge. Most owners use a mix of both.",
          },
          {
            q: "How do I balance short-term income needs with long-term value growth when choosing a property?",
            a: "Split your strategy by property type: a ready unit in a mature area for immediate rental income, plus an off-plan unit in a high-growth area for value growth. If buying only one unit, choose based on your main need — income now favors ready and high-yield units; growth favors off-plan units in developing areas.",
          },
          {
            q: "How long should I hold a commercial property in Egypt before selling for the highest profit?",
            a: "Five to seven years is the most common holding period. This allows the project to fully deliver, fill with tenants, build a rental record, and grow in value. Selling before year three usually means losing potential profit. Holding beyond ten years can work but exposes you to market changes and shifts in the area.",
          },
        ],
      },
      {
        id: "budget-affordability",
        title: "Budget & affordability",
        items: [
          {
            q: "How much money do I need to start investing in commercial real estate in Egypt?",
            a: "Entry budgets start around 2 to 3 million EGP for small admin units in mid-tier projects, and rise to 10 million EGP or more for prime retail, medical, or drive-thru units in top developments. Most projects offer installment plans of 5 to 8 years, so the down payment — usually 5% to 20% — is the main cash you need upfront.",
          },
          {
            q: "What is the minimum down payment for buying a commercial unit in Egypt?",
            a: "Down payments usually range from 5% to 20% of the unit price, depending on the developer and project. Some developers offer plans starting at 0% to 5% down with extended installments, while premium projects often require 10% to 20% down. Larger down payments usually come with better discounts on the total price.",
          },
          {
            q: "How do I know if a commercial property fits my budget without overstretching?",
            a: "A property fits your budget if the down payment uses no more than 30% of your liquid savings, monthly installments stay under 30% of your monthly income, and you have enough reserves to cover 12 months of installments without rental income. If any of these limits are crossed, the unit is outside your safe budget range.",
          },
          {
            q: "Should I pay cash or use installments when buying a commercial unit in Egypt?",
            a: "Installments are the better choice in most cases. Cash payments earn discounts of 20% to 40%, but installments let you keep capital working in other investments and reduce inflation risk. With Egypt's inflation rates, paying off an EGP-denominated installment plan over 5 to 8 years often costs less in real terms than paying cash upfront.",
          },
          {
            q: "What hidden costs do first-time commercial property buyers in Egypt usually miss?",
            a: "Common hidden costs include maintenance fees (5% to 10% of unit price), club or facility fees, registration and legal fees (around 3% of value), fit-out costs (1,500 to 5,000 EGP per square meter), broker commissions, property management fees if leasing, and the income gap between handover and the first paying tenant. These can add 15% to 30% to the total cost.",
          },
          {
            q: "How do I plan for the gap between handover and the first rental income?",
            a: "Plan for 6 to 18 months of expenses with no rental income after handover. This covers fit-out time, marketing the unit, tenant negotiations, and lease finalization. Set aside cash to cover maintenance fees, installments, and utilities during this period. Working with a leasing-focused consultancy like PLACES shortens this gap by sourcing tenants before handover.",
          },
          {
            q: "What is the difference between the listed price and the true cost of owning a commercial property?",
            a: "The listed price is the unit price only. The true cost includes maintenance fees, registration costs, fit-out, financing costs on installments, vacancy periods, property management fees, and yearly service charges. True cost is usually 20% to 35% higher than the listed price over the full ownership period.",
          },
          {
            q: "How do I budget for maintenance, fit-out, and finishing costs on a commercial unit?",
            a: "Most commercial units are delivered as core and shell, meaning you handle finishing. Budget 1,500 to 5,000 EGP per square meter for fit-out, depending on use and quality. Maintenance fees are usually 5% to 10% of the unit price paid once at handover, then yearly service charges of 50 to 200 EGP per square meter. Medical units cost more to fit out than admin offices.",
          },
        ],
      },
      {
        id: "personal-fit",
        title: "Personal fit & lifestyle",
        items: [
          {
            q: "Do I need to live in Egypt to invest in commercial real estate here?",
            a: "No. Many investors based abroad own commercial property in Egypt and manage it remotely through a property manager, consultancy, or trusted representative. You will need a local contact for handover, leasing, and registration tasks, but day-to-day management can be handled fully remotely with the right service provider.",
          },
          {
            q: "What should I consider as an expat Egyptian before buying commercial property back home?",
            a: "Key considerations include currency exchange timing (buying during EGP devaluation gives lower USD-equivalent prices), tax implications in your country of residence, remote management options, power of attorney for transactions, and choosing a developer with a strong track record. Working with a consultancy that handles end-to-end remote service simplifies the process.",
          },
          {
            q: "Is commercial real estate the right investment if I am a business owner who needs space to operate?",
            a: "Yes, owning your business space gives you stable costs, builds equity instead of paying rent, and provides an asset that grows in value. The key is choosing a unit that fits both your business needs (visibility, size, location) and resale potential, so it remains valuable even if you outgrow it later.",
          },
          {
            q: "Should I buy a commercial unit in my personal name, my company's name, or a separate entity?",
            a: "The choice depends on tax planning, liability, and exit strategy. Personal name is simpler but offers less liability protection. Company name allows tax deductions on related expenses but mixes the asset with business risk. A separate holding entity protects the asset from business risk and is preferred for serious investors. Consult a tax and legal advisor before deciding.",
          },
          {
            q: "How much time per month does owning a commercial property in Egypt require?",
            a: "With professional management, 1 to 3 hours per month for reviewing reports and approving decisions. Without management, 5 to 15 hours per month for tenant communication, maintenance issues, payment collection, and leasing. Time spent is highest in the first year (fit-out and leasing) and lowest once a long-term tenant is in place.",
          },
          {
            q: "What is the difference between investing as an individual and as a corporate investor in Egypt?",
            a: "Individuals face simpler registration and lower setup costs but pay personal income tax on rental income and capital gains. Corporate investors get tax deductions on expenses, easier financing, and limited liability, but pay corporate tax and have higher administrative costs. Corporate ownership becomes more efficient when holding multiple properties.",
          },
          {
            q: "Do I need to be in Egypt or speak Arabic to buy a commercial unit?",
            a: "No. Most major developers have English-speaking sales teams, and contracts can be translated. You can sign through a power of attorney if you cannot travel. Working with a bilingual consultancy makes the entire process accessible from abroad without language or location barriers.",
          },
          {
            q: "How do I know if my risk tolerance fits commercial real estate investing?",
            a: "Commercial real estate suits investors comfortable with medium-term illiquidity, possible handover delays, and tenant turnover. If you need quick access to your money, panic at price fluctuations, or expect guaranteed returns, this is not the right investment. If you can hold for 5 or more years and accept normal market cycles, your risk tolerance fits.",
          },
        ],
      },
      {
        id: "market-context",
        title: "Market context",
        items: [
          {
            q: "What is driving demand for commercial real estate in Egypt right now?",
            a: "Demand is driven by population growth, expansion into new cities, the rise of medical and educational hubs, growing entrepreneurship, increased foreign investment, and the shift of businesses out of older areas into modern projects with better infrastructure. Inflation has also pushed investors toward income-generating assets, increasing competition for quality commercial units.",
          },
          {
            q: "Why are mixed-use developments and large malls expanding in Egypt's new urban areas?",
            a: "New urban areas need commercial infrastructure to serve growing residential populations. Mixed-use developments combine offices, retail, medical, and entertainment in one location, attracting steady foot traffic and longer tenant commitments. Developers prefer them because they create self-sustaining communities, and investors prefer them because units in mixed-use projects rent faster and hold value better.",
          },
          {
            q: "How is hybrid and remote work affecting demand for admin offices in Egypt?",
            a: "Demand has shifted toward smaller, more flexible admin units rather than large traditional offices. Companies want spaces with collaborative areas, meeting rooms, and quality infrastructure rather than large floor plates. Demand for premium Grade A admin offices has stayed strong, while older, lower-quality office buildings face higher vacancy rates.",
          },
          {
            q: "Are medical hubs in Egypt a long-term trend or short-term hype?",
            a: "Medical hubs are a long-term trend driven by Egypt's growing population, rising healthcare spending, and shortage of modern medical facilities. Demand for clinics, labs, and specialty centers continues to outpace supply in most major cities. Medical tenants sign 5 to 10 year leases and rarely relocate, making medical units one of the most stable commercial investments.",
          },
          {
            q: "Why are drive-thru units one of the most profitable commercial categories in Egypt?",
            a: "Drive-thru units serve high-traffic locations on major roads, attract premium global brands as tenants, and command rental rates 2 to 3 times higher than equivalent retail units. Egypt's car-dependent lifestyle and growing fast-food and coffee chain expansion have created strong demand. Limited supply of suitable corner locations keeps yields high.",
          },
          {
            q: "How does Egypt's commercial real estate market compare to other regional markets?",
            a: "Egypt offers lower entry prices and higher rental yields than Gulf markets like Dubai or Saudi Arabia, but with higher currency risk. Yields of 8% to 14% in Egypt compare to 5% to 8% in Gulf markets. Egypt's market is best suited for investors seeking growth and income in EGP, while Gulf markets offer USD-pegged stability with lower returns.",
          },
          {
            q: "What economic factors should I watch before investing in commercial property?",
            a: "Monitor inflation rates, EGP exchange rates, interest rates, GDP growth, foreign direct investment trends, and government infrastructure spending. Strong infrastructure investment in an area signals future commercial demand. Currency stability affects timing for foreign investors. Interest rate cuts usually push more money into real estate, raising prices.",
          },
          {
            q: "How is e-commerce affecting the value of physical retail and strip mall investments?",
            a: "E-commerce has reduced demand for traditional fashion and electronics retail, but increased demand for service-based retail — F&B, fitness, healthcare, beauty, and convenience stores. Strip malls focused on daily-use services have benefited, while purely shopping-focused retail has weakened. Drive-thrus and last-mile delivery hubs have gained value due to e-commerce growth.",
          },
          {
            q: "How do tourism, population growth, and new urban expansion shape commercial real estate demand?",
            a: "Population growth creates baseline demand for medical, educational, and retail services. New urban expansion concentrates this demand in specific corridors, raising commercial property values along main roads and entry points. Tourism boosts demand for hospitality-related commercial space in tourist zones. All three factors together drive long-term value growth in well-located commercial properties.",
          },
          {
            q: "How do interest rates and currency movements affect the timing of a commercial real estate investment?",
            a: "High interest rates usually mean lower property prices, since financing is more expensive and investor competition drops. EGP devaluation lowers the USD-equivalent price for foreign investors, making it a strong entry moment. Falling interest rates and strengthening currency usually push prices up. Timing entries during high-rate or post-devaluation periods often gives the best long-term returns.",
          },
        ],
      },
      {
        id: "red-flags",
        title: "Red flags & reality checks",
        items: [
          {
            q: "What are the most common misconceptions people have about commercial real estate in Egypt?",
            a: "Common misconceptions include: all commercial properties yield the same, location matters less than developer, rental income starts immediately after handover, off-plan is always cheaper than ready, and any unit will find a tenant. None are true. Returns vary widely by property type, location, and selection quality, which is why specialized consultation matters.",
          },
          {
            q: "How do I avoid getting emotionally attached to a commercial unit before checking the numbers?",
            a: "Set clear criteria before viewing: target ROI, maximum budget, required location features, and acceptable risk level. Calculate the rental yield and payback period before any second visit. If a unit fails the criteria, walk away regardless of how appealing it looks. Treating the purchase as a financial decision, not a lifestyle one, prevents emotional mistakes.",
          },
          {
            q: "What signs show that I am not ready to invest in commercial real estate?",
            a: "Signs you are not ready: you cannot define your investment goal, your budget depends on selling other assets quickly, you cannot sustain installments without rental income, you do not understand the property type you are considering, or you feel pressure to decide quickly. If any apply, slow down and consult a specialist before buying.",
          },
          {
            q: "Why do some first-time investors regret their commercial property purchase?",
            a: "Common regrets come from buying based on sales pitches rather than research, choosing the wrong property type for their goal, underestimating fit-out and vacancy costs, picking a low-quality developer, or buying in an oversupplied area. Most regrets trace back to skipping proper due diligence and not working with an objective advisor before committing.",
          },
          {
            q: "How do I tell the difference between real opportunities and sales-driven hype?",
            a: "Real opportunities are backed by data — tenant demand in the area, comparable rental rates, developer track record, and infrastructure plans. Hype relies on promises, projected appreciation, and pressure tactics. If a sales pitch focuses on \"limited offers\" and projected returns without showing market data, treat it as hype. Independent advisors verify claims before you commit.",
          },
        ],
      },
    ],
  },

  // ─── Sections 2-10 — placeholder seed content ────────────────────
  // Each has 2-3 sample Q&As so the layout/scroll-spy/search/schema all
  // validate end-to-end. Replace each placeholder Q&A with your real content
  // as it's drafted; no other code needs to change.

  {
    id: "admin-vs-commercial",
    number: 2,
    title: "Understanding Admin Offices vs Commercial Spaces",
    shortTitle: "Admin vs Commercial",
    intro:
      "Egyptian commercial real estate splits into many distinct categories — admin offices, mixed-use malls, mega malls, business parks, medical hubs, strip malls, and drive-thru units. This section explains how each works, who it attracts, and how to choose between them.",
    subsections: [
      {
        id: "core-definitions",
        title: "Core definitions",
        items: [
          {
            q: "What is the difference between an admin office and a commercial space in the Egyptian real estate market?",
            a: "An admin office is licensed for office work and corporate use — accounting firms, consultancies, tech companies, and back-office operations. A commercial space is licensed for customer-facing business activity — retail shops, restaurants, clinics, and showrooms. The classification affects licensing, utility tariffs, zoning rules, rental rates, and the type of tenants you can accept. Admin units usually sit in upper floors, while commercial units occupy ground floors with direct street access.",
          },
          {
            q: "Are admin offices considered commercial real estate or do they fall under their own category?",
            a: "Admin offices are part of commercial real estate as a sub-category, but they are licensed and regulated separately from retail commercial units. Both generate business income and are valued by yield rather than livability, but admin units serve office-based businesses while commercial units serve customer-facing ones. Most Egyptian developers classify them as separate product lines within the same project, with different price points and target tenants.",
          },
          {
            q: "What does \"administrative\" mean when developers list units as admin in their projects?",
            a: "Administrative means the unit is licensed for office-based business activities such as corporate offices, consulting firms, design studios, IT companies, and similar non-retail operations. Admin units cannot legally operate as retail shops, clinics, or restaurants without changing the license. The classification is fixed by the project's masterplan and approved by local authorities, and converting it later is difficult and often not allowed.",
          },
          {
            q: "What types of businesses can legally operate from an admin unit versus a commercial unit?",
            a: "Admin units host office-based businesses: law firms, accounting offices, consultancies, marketing agencies, software companies, and corporate headquarters. Commercial units host customer-facing businesses: retail stores, F&B outlets, banks, pharmacies, salons, and showrooms. Medical activities require a separate medical license. Operating the wrong activity in the wrong unit type can result in fines, forced closure, or refusal of a trade license.",
          },
          {
            q: "Why do developers separate admin and commercial units in the same project?",
            a: "Developers separate them to match the project masterplan, comply with zoning regulations, control tenant mix, and price each segment based on demand. Commercial units sit on ground floors for visibility and foot traffic, while admin units occupy upper floors with elevator access. This separation also lets developers create dedicated business zones, retail strips, and medical floors that attract specific tenant types and increase overall project value.",
          },
          {
            q: "How does the licensing process differ between an admin office and a commercial unit?",
            a: "Admin units require a commercial registry (Sigil Togari) and tax card matching the office activity, with simpler approval processes. Commercial units need additional licenses depending on activity — health permits for F&B, civil defense approvals for public access, and specific clearances for retail. Medical units require Ministry of Health approval. Licensing complexity directly affects how quickly you can lease the unit and what rent you can command.",
          },
        ],
      },
      {
        id: "admin-offices",
        title: "Admin offices",
        items: [
          {
            q: "What defines a high-quality admin office in the Egyptian market?",
            a: "A high-quality admin office has clear floor-to-ceiling height (3.0m or higher), strong HVAC systems, reliable backup power, fiber-optic internet readiness, adequate parking ratios (1 spot per 25–35 sqm), and efficient floor plates with minimal columns. Grade A buildings in prime areas like New Cairo's Fifth Settlement command rents around USD 334 per sqm per year, while lower-grade buildings rent for 30% to 60% less.",
          },
          {
            q: "What specifications should I look for when buying an admin office?",
            a: "Check ceiling height (3.0m clear minimum), floor loading capacity (250 kg/sqm or higher), HVAC type (central chilled water performs better than split units), parking ratio, elevator capacity, backup generator coverage, fiber internet readiness, and curtain wall quality. Also check the building's Grade classification (A, B, or C), facade visibility, and proximity to main roads. These specs determine both rentability and tenant quality.",
          },
          {
            q: "What is the ideal size for an admin office for different business types?",
            a: "Startups and small businesses fit in 30–80 sqm units. Small-to-medium companies use 80–200 sqm. Larger companies and regional offices need 200–500 sqm. Multinational headquarters and corporate floors take 500–2,000 sqm or full floors. The most liquid resale and leasing market in Egypt sits in the 80–200 sqm range, since this size matches the largest tenant pool.",
          },
          {
            q: "What is the difference between Grade A, Grade B, and Grade C admin offices in Egypt?",
            a: "Grade A buildings have premium specifications, central HVAC, professional management, prime locations, and corporate tenants. Rents reach USD 334 per sqm per year in Cairo. Grade B buildings have mid-tier specs, good locations, and SME tenants, typically renting 30% to 50% less. Grade C buildings are older or lower-spec properties with smaller local tenants, renting 50% to 70% below Grade A rates.",
          },
          {
            q: "Why are some admin offices delivered as core and shell while others are fully finished?",
            a: "Core and shell delivery lets each tenant design their own layout, branding, and finishes — preferred by larger corporate tenants who relocate every 5 to 10 years. Fully finished units serve smaller businesses that need to move in immediately without spending on fit-out. Most Egyptian developers deliver admin units as core and shell, which keeps the unit price lower and gives flexibility but requires fit-out budget from the buyer or tenant.",
          },
          {
            q: "What kind of tenants rent admin offices in Egypt and what do they look for?",
            a: "Typical tenants include law firms, consulting companies, IT and software firms, marketing agencies, regional offices of multinationals, and Gulf-backed companies expanding into Egypt. They prioritize building grade, parking availability, location prestige, internet infrastructure, and proximity to airports and main roads. Most prefer lease terms of 3 to 5 years with clear escalation clauses, and they favor buildings with professional management.",
          },
          {
            q: "How does the parking ratio of an admin building affect its value?",
            a: "Parking is one of the strongest factors in admin office rentability. A ratio of 1 parking spot per 25–35 sqm of office space is the corporate standard. Buildings below this ratio struggle to attract quality tenants and command 15% to 30% lower rents. Premium admin buildings in New Cairo and the New Administrative Capital often offer 1:20 ratios with dedicated tenant zones, justifying higher prices.",
          },
        ],
      },
      {
        id: "mixed-use-malls",
        title: "Mixed-use malls",
        items: [
          {
            q: "What is a mixed-use mall and how is it different from a traditional shopping mall?",
            a: "A mixed-use mall combines retail, F&B, offices, medical units, and sometimes residential or hospitality components in one development. A traditional shopping mall focuses only on retail and F&B. Mixed-use developments generate steadier foot traffic across day and night, attract longer-term tenants, and offer more resilient rental income because each component supports the others. They are now the dominant model in Egypt's new urban areas.",
          },
          {
            q: "Why are mixed-use developments dominating the new commercial real estate landscape in Egypt?",
            a: "Mixed-use projects serve modern lifestyle demand for walkable, all-in-one destinations and create self-sustaining traffic between residents, office workers, shoppers, and visitors. For developers, they reduce vacancy risk by diversifying tenant types. For investors, units in mixed-use projects rent faster and hold value better. Most major developers in New Cairo, Sheikh Zayed, and the New Administrative Capital now build primarily in this format.",
          },
          {
            q: "What are the advantages of buying a unit inside a mixed-use development versus a standalone project?",
            a: "Mixed-use units benefit from shared foot traffic between offices, retail, and residences — meaning your tenant gets customers from multiple sources. Vacancy risk is lower, tenant quality is higher, and resale liquidity is stronger. Mixed-use projects also attract better property management, more amenities, and stronger anchor tenants. The trade-off is higher service charges, which usually pay for themselves through better rental performance.",
          },
        ],
      },
      {
        id: "mega-malls",
        title: "Mega malls",
        items: [
          {
            q: "What qualifies a project as a mega mall in the Egyptian market?",
            a: "A mega mall typically has gross leasable area (GLA) above 80,000 sqm, multiple anchor tenants, a wide brand mix across fashion, F&B, entertainment, and services, and serves a regional rather than local catchment. Examples include Mall of Egypt, City Stars, and Cairo Festival City. Mega malls draw visitors from across Greater Cairo, supporting higher rental rates of 7.6% annual growth in prime malls, according to recent market data.",
          },
          {
            q: "What are the benefits and risks of buying a unit in a mega mall in Egypt?",
            a: "Benefits include high foot traffic, premium tenants, longer lease terms (5 to 9 years), and rental rates that grow 7% to 8% annually in successful malls. Risks include high entry prices (often EGP 100,000+ per sqm), high service charges, dependence on the mall's overall performance, and the fact that unit position within the mall (floor, zone, anchor proximity) heavily affects returns. A poorly placed unit in a great mall can underperform a well-placed unit in an average mall.",
          },
        ],
      },
      {
        id: "business-parks",
        title: "Business buildings & parks",
        items: [
          {
            q: "What is the difference between a business building and a business park in the Egyptian commercial market?",
            a: "A business building is a single structure dedicated to admin and corporate use, typically with one developer and shared services. A business park is a large-scale planned development of multiple business buildings sharing infrastructure, parking, amenities, and management — often 50,000 sqm or larger. Business parks attract corporate and multinational tenants, offer higher specs, and generally deliver more stable rental performance than standalone office buildings.",
          },
          {
            q: "Why are business parks becoming the preferred choice for corporate tenants?",
            a: "Business parks offer corporate-grade infrastructure, dedicated parking, professional management, security, and a tenant ecosystem that supports networking and recruiting. Companies like Vodafone, Orange, PwC, and Oracle prefer business parks for their long-term offices. This concentrated demand keeps occupancy high — Grade A office vacancy in prime buildings dropped to 4.5% in 2025 — and supports rental growth. Units in business parks resell faster and at higher prices than standalone admin offices.",
          },
        ],
      },
      {
        id: "medical-hubs",
        title: "Medical hubs",
        items: [
          {
            q: "What is a medical hub and how is it different from a regular commercial building?",
            a: "A medical hub is a building or development licensed and designed specifically for medical use — clinics, polyclinics, labs, imaging centers, and pharmacies. It includes specialized infrastructure: medical waste systems, higher floor loading for equipment, dedicated patient parking, separate service entrances, and zoning that allows medical activity. Regular commercial buildings cannot host medical tenants without proper licensing, which is difficult to obtain after the fact.",
          },
          {
            q: "Why are medical hubs booming in Egypt right now?",
            a: "Egypt's population of over 105 million, rising healthcare spending, shortage of modern medical facilities, and growing private healthcare sector have created sustained demand for clinic and medical units. Medical tenants — doctors, dental clinics, labs, imaging centers — sign long leases of 5 to 10 years and rarely relocate due to patient base loyalty. This makes medical units one of the most stable commercial investments in the Egyptian market.",
          },
          {
            q: "What technical specifications make a medical unit suitable for clinics or labs?",
            a: "Medical units require higher ceiling heights (3.2m or more), reinforced floors for heavy equipment, dedicated water and drainage lines, medical-grade HVAC, separate patient and staff entrances, fire safety upgrades, accessible elevators, and licensing approval from the Ministry of Health. Imaging centers need additional electrical capacity and lead-lined walls. Buying a unit not built to these standards limits your tenant pool to non-medical use.",
          },
        ],
      },
      {
        id: "strip-malls",
        title: "Strip malls",
        items: [
          {
            q: "What is a strip mall and how is it different from a community or mega mall?",
            a: "A strip mall is an open-air retail format with stores facing a parking lot or main road, typically anchored by a supermarket, pharmacy, or F&B chain. It serves daily-use retail rather than destination shopping. Community malls are larger and indoor-focused, while mega malls serve regional catchments. Open-air strip retail in Cairo is currently outperforming traditional malls, with community mall lease rates up 8.6% annually.",
          },
          {
            q: "Why are strip malls one of the most underrated commercial investments in Egypt?",
            a: "Strip malls benefit from low service charges, easy parking, high visibility, daily-use tenants (pharmacies, supermarkets, banks, F&B chains), and resilience against e-commerce. Tenants sign long leases because foot traffic depends on local residents rather than seasonal trends. Well-located strip mall units in growing residential areas can achieve rental yields of 10% to 14% — among the highest in the Egyptian commercial market.",
          },
        ],
      },
      {
        id: "drive-thru",
        title: "Drive-thru units",
        items: [
          {
            q: "What is a drive-thru unit and why is it considered a top commercial investment?",
            a: "A drive-thru unit is a corner or main-road location designed for vehicle-access service — primarily F&B brands like Costa, Dunkin', McDonald's, and KFC. Drive-thrus command rental rates 2 to 3 times higher than equivalent indoor retail because of premium brand demand, captive traffic, and limited supply. In Egypt's car-dependent lifestyle, drive-thru units in areas like Mostakbal City, the New Administrative Capital, and Sheikh Zayed are among the highest ROI commercial categories.",
          },
          {
            q: "What makes a drive-thru location succeed or fail?",
            a: "Success factors include corner positioning, direct access from a main road with traffic counts above 20,000 vehicles per day, easy entry and exit lanes, sufficient queue space, visibility from a distance, and proximity to residential or office traffic. Failure usually comes from poor traffic flow, restricted access, weak visibility, or oversaturation of similar brands nearby. Location quality matters more for drive-thrus than any other commercial format.",
          },
        ],
      },
      {
        id: "comparing-categories",
        title: "Comparing categories",
        items: [
          {
            q: "Which type of commercial property gives the highest rental yield in Egypt?",
            a: "Drive-thru units, well-located strip mall retail, and prime medical units typically deliver the highest yields, ranging from 10% to 15% annually. Standard admin offices in mature areas yield 7% to 10%. Mega mall retail yields 8% to 12% depending on placement. Off-plan units in growing areas can exceed these figures over full ownership cycles when capital appreciation is added.",
          },
          {
            q: "How do I decide between an admin office, retail unit, medical unit, or drive-thru?",
            a: "Match the property type to your goal, budget, and risk tolerance. Admin offices suit lower-budget investors seeking stable corporate tenants. Retail and strip mall units suit investors wanting higher yields with location-dependent risk. Medical units suit those wanting long leases and stable income but accepting higher fit-out costs. Drive-thrus suit higher-budget investors targeting maximum yield with premium brand tenants. A specialized advisor like PLACES can model each option against your specific situation.",
          },
          {
            q: "Which commercial property types are most resilient during economic downturns?",
            a: "Medical units, strip malls anchored by supermarkets and pharmacies, and drive-thrus serving daily-use F&B brands hold up best during downturns because they serve essential or convenience-driven demand. Premium admin offices with multinational tenants also remain stable. Higher-risk categories during downturns include luxury retail, large-format office space, and entertainment-focused mall units, which see the steepest occupancy and rent declines.",
          },
        ],
      },
      {
        id: "specifications-delivery",
        title: "Specifications & delivery",
        items: [
          {
            q: "What does core and shell mean and why are most commercial units delivered this way?",
            a: "Core and shell delivery means the unit comes with structural elements, exterior walls, basic MEP systems, and floor screed — but no interior walls, finishes, AC units, or fixtures. This lets each tenant customize the space. It keeps purchase prices lower and is the standard for Egyptian commercial units. Buyers must budget 1,500 to 5,000 EGP per square meter for fit-out, depending on use and quality.",
          },
          {
            q: "How much should I budget for fit-out and finishing on a commercial unit?",
            a: "Budget 1,500–2,500 EGP per sqm for basic admin office fit-out, 2,500–4,000 EGP per sqm for retail finishing, and 4,000–6,000 EGP per sqm for medical units due to specialized requirements. High-end corporate offices and premium retail can exceed 8,000 EGP per sqm. Fit-out usually takes 2 to 6 months, so factor this time into your leasing timeline and cash flow planning.",
          },
        ],
      },
      {
        id: "common-misconceptions",
        title: "Common misconceptions",
        items: [
          {
            q: "Is a \"commercial unit\" always a retail unit, or does the term cover more?",
            a: "The term covers more than retail. In the Egyptian market, \"commercial\" includes retail shops, F&B outlets, showrooms, clinics, banks, and any customer-facing business. Admin offices are sometimes grouped under commercial real estate as a broader category but are licensed and priced separately. When developers say \"commercial unit,\" they usually mean ground-floor retail or service space, not admin offices.",
          },
          {
            q: "Why do two units of the same size in the same project have different prices?",
            a: "Price differences come from floor level (ground vs upper), corner versus inline placement, facade visibility, proximity to main entrances and anchor tenants, parking access, ceiling height, and view. A corner ground-floor unit near a main entrance can cost 30% to 80% more per sqm than an inline upper-floor unit of the same size in the same project. These differences usually translate proportionally into rental rates.",
          },
          {
            q: "Is buying a commercial unit on the ground floor always better than upper floors?",
            a: "Not always. Ground-floor units cost more and yield more for retail and F&B uses where foot traffic matters. But upper floors are better for admin offices, medical units, and businesses that don't depend on walk-in customers. The right floor depends on the intended tenant type. A premium medical unit on the third floor can outperform a ground-floor retail unit if the building is designed for medical use.",
          },
          {
            q: "Are corner units worth the price premium?",
            a: "Yes for retail, F&B, drive-thru, and high-visibility uses — corner units typically command 20% to 40% higher rents because of dual-frontage exposure and stronger signage opportunities. For admin offices and medical units, the premium is smaller (5% to 15%) since visibility matters less than internal layout. The premium is worth paying when the intended tenant type values exposure and customer access.",
          },
        ],
      },
    ],
  },

  {
    id: "rent-buy-resale",
    number: 3,
    title: "Rent vs Buy vs Resale — Choosing the Right Path",
    shortTitle: "Rent vs Buy vs Resale",
    intro:
      "Whether to lease, buy primary, buy resale, or combine strategies — your choice shapes timeline, capital needs, risk, and total returns. This section covers when each path makes sense and how to match it to your goals.",
    subsections: [
      {
        id: "core-decision",
        title: "The core decision",
        items: [
          {
            q: "Should I rent or buy a commercial unit in Egypt for my business?",
            a: "Buy if you plan to stay in the same location for 7 or more years, want fixed costs, and have the capital available. Rent if you need flexibility, expect business growth that may require relocation, or prefer to keep capital working in your business. With Egyptian commercial rents rising 7% to 12% annually and ownership building equity, buying often outperforms renting over a 10-year period for established businesses.",
          },
          {
            q: "Is buying a commercial unit better than renting in the long term?",
            a: "Buying is usually better for long-term occupiers. You build equity instead of paying rising rents, lock in your costs against inflation, and own an asset that appreciates with the market. Egyptian commercial property prices have grown 13% to 20% annually in recent years. Renting is better for short-term needs, businesses still defining their model, or operations that need frequent relocation as they scale.",
          },
          {
            q: "What are the financial advantages of buying versus renting commercial real estate in Egypt?",
            a: "Buying converts rent expense into equity, protects against rent increases of 7% to 12% per year, allows tax benefits on depreciation and financing costs, and provides a sellable asset at the end. Renting preserves cash for business operations, keeps costs flexible, and avoids long-term commitment. The break-even point usually falls between years 5 and 7 of ownership.",
          },
          {
            q: "When does it make more sense to rent than to buy a commercial unit?",
            a: "Renting makes more sense when your business is in early growth stages, when you need a specific location you cannot afford to buy, when you expect to relocate within 3 to 5 years, or when your capital is better invested in operations than real estate. Renting also suits seasonal businesses, project-based operations, and tenants who want premium locations that exceed their purchase budget.",
          },
          {
            q: "How do I calculate whether buying or renting will save me more money?",
            a: "Compare total ownership costs (down payment, installments, maintenance, taxes, opportunity cost of capital) against total rent over your expected occupancy period. Add expected appreciation to the ownership side and rental escalation to the renting side. If buying breaks even within 5 to 7 years and you plan to stay longer, buy. If not, rent. Specialized commercial advisors like PLACES run these models for clients to remove guesswork.",
          },
        ],
      },
      {
        id: "primary-vs-resale",
        title: "Primary vs resale",
        items: [
          {
            q: "What is the difference between primary and resale commercial properties in Egypt?",
            a: "Primary properties are bought directly from the developer, usually off-plan with installment plans of 5 to 10 years and 5% to 20% down payment. Resale properties are bought from existing owners — either ready units or partially-paid contracts transferred to new buyers. Primary offers lower entry prices and longer payment terms; resale offers immediate ownership, no construction wait, and often pre-existing tenants.",
          },
          {
            q: "Should I buy a primary commercial unit or a resale unit?",
            a: "Primary suits investors with longer time horizons who want lower entry prices, the full appreciation cycle, and developer payment plans. Resale suits investors who want immediate income, want to skip handover delays, or want to verify the actual delivered product before buying. Resale prices typically run 30% to 60% below primary prices in the same project — for example, ZED East primary units start at 16.8 million EGP while resale units start at 5.8 million EGP.",
          },
          {
            q: "What are the advantages of buying primary commercial units off-plan?",
            a: "Off-plan units offer the lowest entry price (often 30% to 50% below ready unit prices), extended installment plans of 5 to 10 years, choice of best-positioned units before they sell out, and full capital appreciation through the development cycle. Investors who buy at pre-launch and sell before tenant move-in season can earn 25% to 60% appreciation without ever leasing the unit, according to recent market reports.",
          },
          {
            q: "What are the risks of buying primary off-plan commercial units?",
            a: "Risks include developer delivery delays of 1 to 3 years beyond promised dates, masterplan changes that affect unit value, developer financial issues that can stop construction, area development that lags expectations, and the income gap during the construction period. These risks are reduced by choosing established developers with strong delivery track records, registered contracts, and clear penalty clauses for delays.",
          },
          {
            q: "What are the advantages of buying resale commercial units?",
            a: "Resale units allow immediate ownership and income, no construction risk, no waiting period for handover, and the chance to inspect the actual unit, surroundings, and building quality before buying. Some resale units come with existing tenants, providing day-one rental income. Resale also offers room for negotiation, since sellers often need liquidity, and prices can be 30% to 50% below primary launch prices.",
          },
          {
            q: "What are the risks of buying resale commercial properties in Egypt?",
            a: "Risks include hidden defects in the unit or building, outstanding maintenance fees from previous owners, contracts that may not transfer cleanly, weak tenants locked in below-market leases, and lack of remaining payment plan flexibility. Due diligence is essential — verify ownership documents, registered contract status, outstanding fees, building condition, and existing lease terms before signing any resale agreement.",
          },
        ],
      },
      {
        id: "resale-strategy",
        title: "Resale strategy",
        items: [
          {
            q: "Can I buy a commercial property purely for resale rather than rental income?",
            a: "Yes. Many investors target capital appreciation through resale rather than rental yield. Strategies include buying at pre-launch and selling before delivery, buying during construction and selling after handover, or buying ready units in growing areas and selling after value increases. Successful resale strategies require strong developer relationships, market timing, and selecting projects with strong demand from end-users.",
          },
          {
            q: "How much can I earn from reselling a commercial unit in Egypt?",
            a: "Pre-launch to delivery resale typically earns 25% to 60% appreciation over 2 to 4 years, depending on project, location, and timing. Resale after full delivery and tenant placement can add another 20% to 40% as the unit becomes income-proven. Total appreciation cycles for well-selected commercial units have reached 90% to 130% over 5 years in nominal EGP terms in current market conditions.",
          },
          {
            q: "When is the best time to resell a commercial unit for maximum profit?",
            a: "The strongest resale moments are: just before handover (when end-users compete for ready units), just after handover when tenants are signed and income is proven, and at the 5 to 7 year mark when the area has matured. Selling too early misses appreciation; selling too late risks market cycle changes and area saturation. Resale timing should match local demand cycles and project completion phases.",
          },
          {
            q: "Who buys resale commercial properties in Egypt?",
            a: "Buyers include end-users (doctors, business owners, franchise operators) who want ready units for immediate use, investors seeking ready income-producing assets, businesses that want to own rather than rent their operating space, and other investors looking for value below primary market prices. End-users typically pay higher prices per square meter than pure investors because they value business utility over yield calculations.",
          },
          {
            q: "How do I price a commercial unit correctly for resale?",
            a: "Price based on three benchmarks: comparable resale listings in the same project, primary developer prices for similar units, and rental yield expectations of likely buyers. A unit producing 10% annual yield justifies a price 10 times the annual rent. Pricing 5% to 10% below primary developer prices typically attracts buyers, while overpricing extends time on market and weakens negotiation position.",
          },
        ],
      },
      {
        id: "rental-strategy",
        title: "Rental strategy",
        items: [
          {
            q: "Should I buy a commercial unit specifically to rent it out?",
            a: "Yes, if your goal is monthly income with long-term appreciation. Commercial units rented to stable tenants generate 8% to 15% annual yields in Egypt, with lease terms of 3 to 9 years and yearly rent increases of 7% to 10%. Categories like medical units, drive-thrus, and pharmacy strip malls perform best for buy-to-rent strategies because of long leases and tenant loyalty.",
          },
          {
            q: "What types of commercial properties generate the best rental income?",
            a: "Drive-thru units, prime medical clinic units, anchor strip mall positions, and ground-floor retail in mixed-use developments generate the highest rental income. Medical and F&B tenants sign 5 to 9 year leases with yearly increases. Branded retail and pharmacy chains often pay goodwill or key money to secure prime spots, adding to total returns. Drive-thrus command 2 to 3 times the rent of equivalent indoor retail.",
          },
          {
            q: "How long are commercial rental contracts in Egypt?",
            a: "Typical lease terms are 3 to 5 years for admin offices, 5 to 7 years for retail, 5 to 9 years for F&B, and 5 to 10 years for medical units and large anchor tenants. Most contracts include automatic renewal clauses and yearly rent escalations of 7% to 10%. Longer lease terms reduce vacancy risk and increase property value when reselling.",
          },
          {
            q: "What is the average rental yield for commercial property in Egypt?",
            a: "Commercial rental yields range from 8% to 15% per year, compared to 4% to 6% for residential. Grade A admin offices yield 7% to 10%, prime mall retail yields 8% to 12%, drive-thrus and prime medical units yield 10% to 15%, and well-located strip malls yield 10% to 14%. Net yields after maintenance, vacancy, and management run 1.5 to 2 percentage points below gross yields.",
          },
        ],
      },
      {
        id: "mixed-strategies",
        title: "Mixed strategies",
        items: [
          {
            q: "Can I combine rental income and resale strategies on the same property?",
            a: "Yes. The most common approach is to buy off-plan, hold through delivery, lease to a long-term tenant, then resell at year 5 to 7 with proven income that justifies a higher price. This captures both rental yield and capital appreciation, often producing total returns of 120% to 170% over 5 years in current market conditions. The leased unit also commands a premium because end-user buyers pay more for income-producing assets.",
          },
          {
            q: "Is it better to buy multiple smaller units or one large commercial unit?",
            a: "Multiple smaller units (50 to 150 sqm) offer better risk diversification, faster leasing, more flexibility for resale, and broader tenant pools. One large unit reduces management complexity, may attract a single anchor tenant, and can earn higher per-meter rates if positioned for corporate or medical use. Most investors building portfolios prefer multiple smaller units because vacancy risk is spread across several income streams.",
          },
          {
            q: "Should I buy ready units for income now or off-plan units for appreciation later?",
            a: "Mix both if budget allows. Ready units in mature areas generate immediate income at yields of 8% to 12%. Off-plan units in growing areas offer 30% to 50% lower entry prices and stronger appreciation but no immediate income. A balanced portfolio includes one income-generating ready unit plus one off-plan appreciation unit, smoothing cash flow while building long-term wealth.",
          },
        ],
      },
      {
        id: "choosing-by-goals",
        title: "Choosing by goals",
        items: [
          {
            q: "How do I match my investment goal to renting, buying, or reselling strategies?",
            a: "Match by time horizon and cash flow needs. For monthly income, buy and lease to long-term tenants. For wealth building, buy off-plan and hold through full cycles. For active gains, buy and resell at strategic points. For business use only without investment goals, renting is often more efficient unless ownership equity matters. Defining the goal first determines the right strategy.",
          },
          {
            q: "What is the most profitable commercial real estate strategy in Egypt right now?",
            a: "The highest-return strategies in current market conditions are: buying drive-thru and medical units off-plan in growing areas for combined yield and appreciation, buying strip mall units with strong anchor tenants for stable high-yield income, and pre-launch to delivery resale of prime-positioned units in proven developer projects. Each strategy can deliver total returns of 20%+ annually when executed with the right selection.",
          },
          {
            q: "How do I know which real estate strategy fits my budget and risk tolerance?",
            a: "Lower budgets and lower risk tolerance favor smaller admin units in established areas with stable tenants. Mid-range budgets favor strip mall units, medical clinics, and mid-tier mall retail. Higher budgets and higher risk tolerance allow drive-thru investments, prime mall positions, and multi-unit portfolios. A specialized advisor like PLACES can model different strategies against your budget, timeline, and goals before you commit.",
          },
        ],
      },
    ],
  },

  {
    id: "locations",
    number: 4,
    title: "Locations & Area Selection",
    shortTitle: "Locations",
    intro:
      "Location drives the largest share of commercial real estate returns. This section covers Egypt's main commercial zones, micro-location factors, catchment analysis, infrastructure, and how to evaluate areas before buying.",
    subsections: [
      {
        id: "choosing-area",
        title: "Choosing the right area",
        items: [
          {
            q: "What are the best locations to buy commercial real estate in Egypt?",
            a: "The strongest commercial real estate locations in Egypt are New Cairo (especially Fifth Settlement and the Golden Square), the New Administrative Capital, Sheikh Zayed, 6th of October City, Mostakbal City, and the North Coast. Greater Cairo holds 60.69% of Egypt's commercial real estate market share, with the New Administrative Capital and New Cairo leading new launches and demand. Each location serves different tenant types and investor goals.",
          },
          {
            q: "How do I choose the right area for my commercial investment in Egypt?",
            a: "Match the area to your strategy. For high-yield retail and F&B, choose dense residential catchments like New Cairo or Sheikh Zayed. For corporate offices and admin units, focus on established business corridors such as Fifth Settlement's 90th Street. For appreciation plays, target growing zones like the New Administrative Capital, Mostakbal City, or New Heliopolis. Match the location to your target tenant and holding period.",
          },
          {
            q: "What factors make a location good for commercial real estate?",
            a: "Strong commercial locations share six factors: high traffic counts, dense residential or office catchments, easy access from main roads, strong infrastructure (utilities, internet, transport), planned future development, and complementary commercial activity nearby. Daily foot traffic and visibility are the backbone of rental profitability. Areas with complete masterplans and active government infrastructure investment outperform isolated developments.",
          },
          {
            q: "Should I invest in a developed area or an emerging area?",
            a: "Developed areas offer immediate income, proven tenant demand, and lower risk but higher entry prices. Emerging areas like Mostakbal City, the New Administrative Capital's R7 and R8 districts, and New Heliopolis offer 30% to 50% lower prices and stronger appreciation potential but require longer holding periods. Most investors balance both, with established areas for income and emerging zones for growth.",
          },
        ],
      },
      {
        id: "major-zones",
        title: "Major zones",
        items: [
          {
            q: "Is New Cairo a good location for commercial real estate investment?",
            a: "Yes. New Cairo is one of Egypt's most active commercial markets, with a mature community, continuous resale activity, dense residential catchment, and corporate headquarters of major companies. Fifth Settlement and the Golden Square host the highest concentration of admin offices, malls, and medical hubs. Commercial unit prices in New Cairo start around 3 million EGP and reach 30+ million EGP for prime locations.",
          },
          {
            q: "What makes the New Administrative Capital attractive for commercial investment?",
            a: "The New Administrative Capital benefits from government ministry relocations, the USD 58 billion master investment, planned public transport links, organized commercial zoning, and rising office demand from both government and private sector tenants. It currently sees 11.41% CAGR growth, the fastest among Egyptian commercial markets. Commercial unit prices start around 2.8 million EGP, with strong appreciation potential as the city matures.",
          },
          {
            q: "Is Sheikh Zayed a good area for commercial real estate?",
            a: "Yes. Sheikh Zayed offers high-income residential catchment, modern infrastructure, established business parks, and strong demand for retail, medical, and admin units. Commercial unit prices start around 4.4 million EGP. Key projects include Ivory Business Park, Capital Mall, and Sky Ramp. Sheikh Zayed's affluent demographic supports premium F&B, healthcare, and lifestyle retail tenants with stable rent-paying capacity.",
          },
          {
            q: "How does 6th of October City compare to other commercial zones?",
            a: "6th of October City has evolved into a vibrant commercial hub, especially along the 26 July Axis and Al Wahat Road. It offers more affordable entry prices than New Cairo and Sheikh Zayed while serving a large residential population, industrial zones, and educational institutions. It suits investors targeting mid-market retail, medical units, and admin offices for SME tenants rather than premium corporate users.",
          },
          {
            q: "Is Mostakbal City a good area for commercial real estate investment?",
            a: "Mostakbal City is one of the fastest-growing emerging zones, attracting drive-thru clusters from brands like Costa and Dunkin', along with strip malls and lifestyle retail. It serves the eastward extension of New Cairo and benefits from younger demographic spending behavior. Drive-thru units of 20–50 sqm in Mostakbal City are projected to deliver some of the highest rental ROI in 2025–2026 among Egyptian commercial categories.",
          },
          {
            q: "Should I invest in commercial real estate in the North Coast?",
            a: "The North Coast is shifting from seasonal to year-round commercial activity, with branded restaurants, supermarkets, pharmacies, and banking services leasing at record rates. It accounted for 55% of Egypt's total real estate sales in 2024. Commercial investments suit areas like New Alamein and El Dabaa Road, which are transitioning into year-round cities. Risks include longer ramp-up periods and dependence on tourism cycles.",
          },
        ],
      },
      {
        id: "micro-location",
        title: "Micro-location factors",
        items: [
          {
            q: "How important is the exact micro-location within a commercial project?",
            a: "Micro-location matters more than the project itself. Two units of identical size in the same project can have 50% to 100% price differences based on floor, frontage, corner position, proximity to anchor tenants, parking access, and visibility. The most successful investors monitor masterplans and reserve early-phase units near main gates, parking entrances, elevators, and corner visibility points before public release.",
          },
          {
            q: "What is the best floor for a commercial unit?",
            a: "Ground floor is best for retail, F&B, drive-thru, and customer-facing businesses, commanding rents 30% to 80% higher than upper floors. First and second floors suit medical clinics, salons, and service businesses. Upper floors above the third level work for admin offices, corporate use, and law firms where visibility matters less. Floor selection should match the licensed activity and target tenant type.",
          },
          {
            q: "Are corner units worth the price premium in commercial projects?",
            a: "Yes for retail, F&B, and drive-thru uses, where corner units command 20% to 40% higher rents due to dual-frontage exposure and stronger signage opportunities. For admin offices and medical units, the corner premium is smaller (5% to 15%) since visibility matters less than internal layout. Corner units near main entrances and high-traffic corridors usually justify the higher price for visibility-dependent businesses.",
          },
          {
            q: "How does proximity to main roads and highways affect commercial property value?",
            a: "Proximity to main roads is one of the strongest value drivers in commercial real estate. Properties located near major highways, public transportation routes, and ring roads attract stronger interest from both buyers and tenants. Drive-thru units especially require frontage on roads with traffic counts above 20,000 vehicles per day. Distance from main roads of more than 500 meters typically reduces both rental rates and appreciation potential.",
          },
        ],
      },
      {
        id: "catchment-demographics",
        title: "Catchment & demographics",
        items: [
          {
            q: "What is a catchment area and why does it matter for commercial real estate?",
            a: "A catchment area is the geographic zone from which a commercial unit draws its customers — usually a 5 to 15 minute drive radius. The size, income level, density, and growth rate of the catchment directly determine tenant demand and rental rates. Strong catchments have at least 50,000 residents within a 10-minute drive, with mid-to-high income households and complementary services nearby.",
          },
          {
            q: "How do I evaluate the demographics of an area before investing?",
            a: "Look at population density, average household income, age distribution, residential growth rate, and business concentration. Areas with rising middle-class consumption, family-oriented compounds, and corporate offices generate the strongest commercial demand. Egypt's population of 105 million and 1.9% annual growth rate concentrate commercial demand in expanding urban zones, especially New Cairo, the New Administrative Capital, and West Cairo extensions.",
          },
          {
            q: "Should I invest in commercial property near residential compounds?",
            a: "Yes. Commercial units near or inside residential compounds benefit from captive customer bases, daily foot traffic, and lower marketing requirements for tenants. Strip malls anchored by supermarkets and pharmacies near gated communities perform exceptionally well. The strongest model is commercial units serving 3 to 5 nearby compounds with combined populations above 30,000 residents.",
          },
        ],
      },
      {
        id: "infrastructure-future",
        title: "Infrastructure & future",
        items: [
          {
            q: "How does new infrastructure affect commercial real estate value?",
            a: "New infrastructure — including the East Cairo Monorail launched in November 2025, ring roads, and metro extensions — directly increases nearby commercial property values. Areas connected to new transport links typically see 15% to 30% price growth within 1 to 2 years of completion. Government infrastructure spending signals long-term commercial demand and is one of the strongest leading indicators for area selection.",
          },
          {
            q: "What infrastructure should I look for when choosing a commercial area?",
            a: "Look for completed road networks, reliable utilities (electricity, water, sewage, fiber internet), public transport access, proximity to airports and ring roads, and government service buildings. The Golden Licence program and streamlined permitting in new urban zones support faster commercial activation. Areas with 80%+ infrastructure completion are ready for commercial activity, while areas below 50% require longer wait times before tenants arrive.",
          },
          {
            q: "How do I assess the future development potential of an area?",
            a: "Review the official masterplan, government investment commitments, residential delivery pipelines, planned commercial allocations, and major anchor projects (universities, hospitals, government buildings). Areas with confirmed mega-projects, residential handovers within 2 to 3 years, and rising land prices show strong future potential. Emerging zones around the New Administrative Capital and Mostakbal City show the strongest pipelines.",
          },
        ],
      },
      {
        id: "common-mistakes",
        title: "Common mistakes",
        items: [
          {
            q: "What are the most common location mistakes commercial investors make in Egypt?",
            a: "Common mistakes include buying in areas without confirmed residential delivery, overestimating future foot traffic in isolated locations, ignoring competing supply within the same area, choosing visually attractive projects in weak catchments, and trusting masterplan promises without verifying construction progress. A poorly located unit in a great project underperforms a well-located unit in an average project.",
          },
          {
            q: "How do I avoid investing in an oversupplied commercial area?",
            a: "Check the supply pipeline for the next 3 to 5 years in your target area. Areas where commercial supply growth significantly exceeds residential delivery show oversupply risk. The New Administrative Capital, while attractive, has rapid commercial supply expansion that requires careful unit selection. A specialized advisor like PLACES tracks supply pipelines and absorption rates by area to flag oversupply risks before they affect tenant demand.",
          },
          {
            q: "Is it risky to buy commercial property in an area without existing tenants?",
            a: "Yes, but the risk is manageable with the right indicators. Avoid areas where residential delivery is more than 3 years away, where infrastructure is below 50% complete, or where no anchor tenants have committed. Acceptable risk areas include those with confirmed residential handovers within 18 months, completed main roads, and at least one major anchor (university, hospital, government building) already operating.",
          },
          {
            q: "Should I buy commercial property in a brand-new area or an established one?",
            a: "Brand-new areas offer 30% to 50% lower entry prices, stronger long-term appreciation, and best unit selection but require 2 to 4 years before generating income. Established areas offer immediate tenant demand, proven rental rates, and lower vacancy risk but higher entry prices and slower appreciation. Most successful portfolios mix both, with established areas for income and new areas for growth.",
          },
        ],
      },
      {
        id: "decision-making",
        title: "Decision-making",
        items: [
          {
            q: "How do I compare two different commercial locations before deciding?",
            a: "Compare across six factors: current and projected catchment population, average rent per square meter, vacancy rates, comparable resale prices, infrastructure completion percentage, and supply pipeline. The location with stronger catchment density, lower vacancy, complete infrastructure, and balanced supply-demand is the better choice — even if entry prices are higher. Comparing on price alone leads to weak investments.",
          },
          {
            q: "What questions should I ask about a location before buying?",
            a: "Ask: What is the population within a 10-minute drive? What is the residential delivery pipeline for the next 3 years? What rent is currently being achieved by similar units? What is the vacancy rate? What infrastructure is committed and when? What competing commercial supply is planned? What major anchors (schools, hospitals, government buildings) are operating? Answers to these questions determine whether the location supports your investment goal.",
          },
          {
            q: "Should I rely on developer location claims or verify independently?",
            a: "Always verify independently. Developer marketing claims often exaggerate catchment size, future infrastructure, and demand projections. Verify population data from CAPMAS, infrastructure timelines from government sources, supply pipelines from market reports (CBRE, JLL, Knight Frank), and rental rates from active listings on Property Finder, Aqarmap, and similar platforms. A specialized commercial real estate advisor like PLACES verifies these claims before recommending any unit.",
          },
        ],
      },
    ],
  },

  {
    id: "developers",
    number: 5,
    title: "Developers & Project Considerations",
    shortTitle: "Developers & Projects",
    intro:
      "Choosing the right developer determines whether your investment delivers on time, holds value, and performs as marketed. This section covers how to evaluate developers, project masterplans, financial stability, after-sales service, and the verification steps that protect your capital.",
    subsections: [
      {
        id: "choosing-developer",
        title: "Choosing a developer",
        items: [
          {
            q: "How do I choose the right real estate developer for a commercial investment in Egypt?",
            a: "Choose a developer based on five factors: delivery track record, financial strength, project portfolio in commercial real estate, contract transparency, and after-sales service. The strongest commercial developers in Egypt include Talaat Moustafa Group (TMG), Emaar Misr, Palm Hills, Mountain View, SODIC, and Hassan Allam. Verify any developer's registration and project approval through the official platform realestate.gov.eg before committing.",
          },
          {
            q: "What is the most important factor when evaluating a real estate developer?",
            a: "Delivery track record is the most important factor. A developer's history of completing projects on time and to specification predicts how your investment will perform. Top-tier developers like Mountain View have delivered 17,500+ units over two decades; TMG manages a 125.9 million sqm land bank. Avoid developers with a history of delays, contract changes, or unfinished projects regardless of their marketing claims.",
          },
          {
            q: "Who are the top commercial real estate developers in Egypt?",
            a: "Leading commercial developers include Talaat Moustafa Group (TMG) — Egypt's largest with $8 billion in 2025 sales, Emaar Misr (Mivida, Uptown Cairo), Palm Hills (143 billion EGP in H1 2025 sales), Mountain View (104 billion EGP in 2025 sales), SODIC (Westown, Eastown), Hassan Allam, Misr Italia, Tatweer Misr, Hyde Park Developments, and Al Ahly Sabbour. Each has different strengths in commercial, mixed-use, and integrated developments.",
          },
          {
            q: "Should I buy from a large established developer or a smaller emerging one?",
            a: "Large established developers offer lower delivery risk, professional project management, stronger resale liquidity, and reliable after-sales service — but at higher prices. Smaller emerging developers offer 15% to 30% lower entry prices and unique designs but carry higher delivery risk. For commercial investments where rental performance matters, the established developer's reliability usually outweighs the price discount of smaller players.",
          },
          {
            q: "How do I verify a developer's track record before investing?",
            a: "Visit completed projects to inspect quality, finishing, and current condition. Talk to existing owners about delivery dates and developer responsiveness. Check official registration on realestate.gov.eg. Review the developer's financial reports, recent sales figures, and credit ratings if listed on EGX. Look for delivery history of at least 10 years and multiple completed projects in the same category as your target investment.",
          },
        ],
      },
      {
        id: "project-masterplan",
        title: "Project & masterplan",
        items: [
          {
            q: "What makes a commercial project worth investing in?",
            a: "A worthwhile commercial project has a complete masterplan, balanced tenant mix, strong location, professional management, adequate parking, modern infrastructure, and committed anchor tenants. Projects that combine residential, commercial, and entertainment components reduce vacancy risk and generate consistent foot traffic. Verify the masterplan's regulatory approval and check whether the commercial allocation matches the residential population it serves.",
          },
          {
            q: "How important is the project masterplan for commercial real estate investment?",
            a: "The masterplan is one of the strongest determinants of future value. It defines unit positioning, tenant zones, parking, circulation, anchor tenant placement, and phasing. A poorly designed masterplan creates dead zones with low foot traffic, while a strong masterplan generates value across all units. Review the masterplan in detail before buying — including future phases — since changes can reduce your unit's value.",
          },
          {
            q: "Can a developer change the masterplan after I buy?",
            a: "Yes, developers sometimes modify masterplans during construction, which can reduce or improve unit value. Protection requires clear contract clauses preventing material changes to your unit's surroundings — including building heights, road layouts, and adjacent unit types. Established developers rarely make negative changes, but smaller developers have done so. A specialized advisor helps verify masterplan protections in the contract.",
          },
          {
            q: "What red flags should I look for in a commercial project's masterplan?",
            a: "Red flags include excessive commercial supply relative to residential population, weak parking ratios (below 1:30 sqm for offices), poor circulation between zones, isolated commercial blocks far from main entrances, missing anchor tenants in late construction phases, and large unallocated areas that suggest future changes. Phased projects without clear timelines for later phases also signal risk to early buyers.",
          },
        ],
      },
      {
        id: "financial-health",
        title: "Financial health",
        items: [
          {
            q: "How do I check if a developer is financially stable?",
            a: "Review their financial statements if listed on the Egyptian Exchange (EGX), check recent sales figures and net profit growth, verify ongoing project completions, and confirm they have not faced delivery suspensions. Top developers like TMG reported $381 million net profit in 2025 with 43% growth. Strong developers maintain construction even during inflation or currency volatility, while weak ones pause projects and miss deadlines.",
          },
          {
            q: "What happens if my developer goes bankrupt or stops construction?",
            a: "Egyptian law provides limited protection — buyers must usually pursue refunds through court, which takes years. Government interventions occasionally rescue stalled projects but cannot be guaranteed. The risk is highest with under-capitalized developers and lowest with established ones backed by major financial institutions like TMG, Al Ahly Sabbour (partnered with the National Bank of Egypt), or SODIC. Avoid developers without strong financial backing for off-plan investments.",
          },
          {
            q: "How long does it usually take for a developer to deliver a commercial project?",
            a: "Construction periods range from 2 to 5 years for off-plan commercial projects. Mixed-use mega projects can take 5 to 8 years from launch to full completion across all phases. Established developers typically deliver within 6 to 12 months of contracted dates; weaker developers often run 12 to 24 months late. Always factor delivery delays of at least 6 to 12 months into your financial planning.",
          },
          {
            q: "What should I do if my developer delays delivery beyond the contracted date?",
            a: "Review the contract for delay penalty clauses — most include 3% to 5% annual penalties on paid amounts after a grace period of 6 months. Document all communications with the developer in writing. If delays exceed 12 months without justification, consult a real estate lawyer. Established developers usually compensate for delays through extended payment terms, free maintenance periods, or partial refunds rather than risking reputation damage.",
          },
        ],
      },
      {
        id: "developer-specialization",
        title: "Developer specialization",
        items: [
          {
            q: "Should I buy from a developer specialized in commercial real estate or one that does mostly residential?",
            a: "Developers specialized in commercial real estate understand tenant requirements, ceiling heights, MEP specifications, and parking ratios that drive rental performance. Residential-focused developers sometimes treat commercial as a secondary product, leading to weak specifications. For investment-grade commercial property, prioritize developers with strong commercial track records — like those who deliver dedicated business parks, mega malls, or medical hubs.",
          },
          {
            q: "How do I evaluate developer specialization in different commercial categories?",
            a: "Match the developer to the property type. For mixed-use mega projects, look at TMG, Emaar Misr, and Palm Hills. For business parks and admin offices, look at SODIC, Hassan Allam, and developers behind Capital Business Park or Cairo Festival City. For medical hubs and strip malls, look at developers with completed examples in operation. Visit their completed projects to see how their commercial spaces actually perform with tenants.",
          },
          {
            q: "Are developer-managed commercial projects better than independently managed ones?",
            a: "Developer-managed projects usually outperform independently managed ones because the developer maintains brand standards, tenant mix, and common areas. This is especially important for malls, business parks, and medical hubs where tenant mix and management quality directly affect unit value. Projects without dedicated property management often deteriorate within 3 to 5 years of delivery, reducing rental rates and resale value.",
          },
        ],
      },
      {
        id: "pricing-offers",
        title: "Pricing & offers",
        items: [
          {
            q: "How are commercial unit prices set by developers in Egypt?",
            a: "Developers set prices based on location, project specifications, unit positioning, market comparables, and target ROI. Pricing typically rises 10% to 20% per year during construction phases and another 15% to 30% upon delivery. Pre-launch and early-launch prices are usually 30% to 50% below post-delivery prices. Developers also adjust prices based on payment plan terms, with longer plans carrying higher total prices than cash payments.",
          },
          {
            q: "What are the typical payment plans offered by developers for commercial units?",
            a: "Common payment plans range from 5% to 20% down payment with installments over 5 to 10 years. Some developers offer plans like 5% down with 7 to 8 years of installments, or 15% down with 6-year plans, or 30% down with 3-year plans. Cash payments earn discounts of 20% to 40%. Longer payment plans favor investors managing cash flow, while shorter plans favor those wanting better total prices.",
          },
          {
            q: "Are developer discounts and promotions worth waiting for?",
            a: "Sometimes. Pre-launch and early-launch promotions offer the lowest prices and best unit selection. Cash discount campaigns of 20% to 40% can be valuable for investors with available capital. End-of-quarter and end-of-year sales pushes occasionally include better terms. However, waiting for the next promotion can mean losing the unit selection you wanted, since prime units sell out early regardless of market conditions.",
          },
        ],
      },
      {
        id: "after-sales",
        title: "After-sales service",
        items: [
          {
            q: "How important is after-sales service when choosing a developer?",
            a: "After-sales service is critical for commercial investments. Strong developers handle handover documentation, registration support, maintenance during the warranty period, and ongoing community management. Weak developers disappear after final payment, leaving buyers to handle problems independently. After-sales quality directly affects unit performance, since management failures reduce tenant quality and rental rates within 2 to 3 years.",
          },
          {
            q: "What ongoing services should a commercial developer provide?",
            a: "Quality developers provide: dedicated property management, common area maintenance, security, tenant coordination, marketing of vacant units within the project, infrastructure upkeep, and tenant mix curation in malls and business parks. Cairo Festival City Mall reopened in 2024–2025 after a USD 566.7 million upgrade — an example of how serious commercial developers reinvest in their properties to maintain value over time.",
          },
          {
            q: "How do maintenance fees and service charges work in commercial projects?",
            a: "Maintenance deposits are usually paid once at handover, ranging from 5% to 10% of unit price. Annual service charges range from 50 to 200 EGP per square meter depending on project amenities, and are higher in mixed-use malls and premium business parks. These fees fund security, cleaning, common area maintenance, and management. Compare service charges across projects, since high charges erode rental yields by 1 to 3 percentage points.",
          },
        ],
      },
      {
        id: "verification-due-diligence",
        title: "Verification & due diligence",
        items: [
          {
            q: "How do I verify a commercial project is legally registered and approved?",
            a: "Use the official Egyptian Real Estate Platform at realestate.gov.eg to verify developer registration, project approval status, and land ownership. The platform provides license verification, property data, and developer credentials. Any project not listed or not properly registered carries significant legal risk. Cross-check with the New Urban Communities Authority (NUCA) for projects in new cities and the relevant governorate for older areas.",
          },
          {
            q: "What documents should I request from the developer before buying?",
            a: "Request: land ownership documents, project approval and licensing certificates, masterplan with regulatory approvals, building permits for the specific phase, financial statements (if listed on EGX), sample contract for review, full price breakdown, payment plan details, and delivery timeline with penalty clauses. Established developers provide these without resistance; reluctance to share documents is a strong red flag.",
          },
          {
            q: "Should I work with a specialized advisor when choosing a developer and project?",
            a: "Yes. A specialized commercial real estate advisor objectively evaluates developers, projects, and units across multiple criteria, removing the bias of any single developer's sales pitch. Advisors like PLACES verify developer track records, project approvals, masterplan integrity, and unit positioning before recommending an investment, protecting buyers from common selection mistakes that show up only after handover.",
          },
        ],
      },
      {
        id: "common-mistakes",
        title: "Common mistakes",
        items: [
          {
            q: "What are the most common mistakes when choosing a developer in Egypt?",
            a: "Common mistakes include: choosing based on launch price alone without checking delivery history, trusting marketing renderings that don't match actual delivery, ignoring the project masterplan and surrounding phases, skipping site visits to completed projects, and assuming all developers offer similar quality. The cheapest unit from a weak developer often costs more in the long run than a fairly priced unit from an established one.",
          },
          {
            q: "How do I avoid buying into a project that fails to deliver?",
            a: "Avoid projects from developers without at least 10 years of delivery history, projects with unclear land ownership, projects with prices significantly below market for the area (a sign of financial pressure), projects without registered approvals on realestate.gov.eg, and projects where construction has not started 12+ months after launch. Strong indicators include active construction, regular sales updates, and progress visible during site visits.",
          },
        ],
      },
    ],
  },

  {
    id: "pricing-value",
    number: 6,
    title: "Pricing, Value & Unit Evaluation",
    shortTitle: "Pricing & Value",
    intro:
      "Pricing depends on more than just cost per square meter. This section covers how commercial prices are set, how to evaluate a specific unit, hidden costs of ownership, payment plan economics, yield calculations, negotiation, and the checklist that protects you before signing.",
    subsections: [
      {
        id: "understanding-pricing",
        title: "Understanding pricing",
        items: [
          {
            q: "How are commercial real estate prices set in Egypt?",
            a: "Commercial prices are set based on six factors: location and catchment, project quality and developer brand, unit positioning within the project, expected rental income, comparable market prices, and payment plan terms. Average commercial property prices in Cairo are around 157,629 EGP per sqm, with prime retail and office spaces in central business districts exceeding 200,000 EGP per sqm. Prices in top-tier developments can reach 350,000 EGP per sqm.",
          },
          {
            q: "What is the average price per square meter for commercial property in Egypt?",
            a: "Commercial prices range from 50,000 EGP per sqm in mid-tier projects to 350,000 EGP per sqm for prime locations in the New Administrative Capital and premium Cairo districts. Office real estate in New Cairo averages around 108,910 EGP per sqm, while Sheikh Zayed and the New Administrative Capital follow closely. Drive-thru, corner retail, and prime medical units command the highest per-meter prices in any project.",
          },
          {
            q: "Why do commercial properties cost more per square meter than residential?",
            a: "Commercial properties cost more because they generate higher rental income, support business activity rather than housing, and require higher specifications — better HVAC, parking ratios, fire systems, and infrastructure. Commercial rental yields of 8% to 15% justify higher entry prices than residential yields of 4% to 6%. Commercial properties also benefit from longer lease terms and stable corporate tenants, supporting premium pricing.",
          },
          {
            q: "How do commercial prices in Egypt compare across different cities and areas?",
            a: "New Cairo's Fifth Settlement and the New Administrative Capital lead pricing, with prime commercial units at 100,000 to 350,000 EGP per sqm. Sheikh Zayed and 6th of October typically run 15% to 30% lower. Mostakbal City and emerging zones offer 30% to 50% lower entry prices with stronger growth potential — Mostakbal City has seen annual price growth of 25% to 30%. North Coast commercial pricing is rising rapidly as the area shifts to year-round activity.",
          },
        ],
      },
      {
        id: "evaluating-unit-price",
        title: "Evaluating unit price",
        items: [
          {
            q: "How do I know if a commercial unit is fairly priced?",
            a: "Compare the asking price against three benchmarks: per-meter prices of similar units in the same project, comparable resale listings within a 1-km radius, and rental yield calculations (annual rent ÷ price should fall in the 8% to 14% range for primary commercial property). Units priced more than 15% above comparable benchmarks need clear justification — better positioning, higher specs, or stronger location.",
          },
          {
            q: "What factors make one unit worth more than another in the same project?",
            a: "Floor level, corner versus inline placement, facade visibility, proximity to main entrances and anchor tenants, parking access, ceiling height, view, and unit depth. A corner ground-floor unit near a main entrance can cost 30% to 80% more per sqm than an inline upper-floor unit of the same size in the same project. These differences usually translate proportionally into rental rates after delivery.",
          },
          {
            q: "Why do similar-sized units in the same project have such different prices?",
            a: "Price differences reflect rental potential, not unit size alone. Ground-floor retail near anchor tenants generates higher rent than upper-floor admin units, justifying higher per-meter prices. Corner units with dual exposure command 20% to 40% premiums. Drive-thru positions on main road frontage can cost 2 to 3 times more per meter than indoor retail in the same project. The price reflects expected income, not just construction cost.",
          },
          {
            q: "Is a higher-priced unit always a better investment?",
            a: "Not always. Higher-priced units in prime positions usually generate proportionally higher rents and stronger appreciation, but the ratio matters more than the absolute price. A unit priced 50% higher that earns only 20% more rent has weaker yield than a mid-priced unit. Calculate rental yield (annual rent ÷ price) for each option — the highest absolute price doesn't always produce the highest return.",
          },
        ],
      },
      {
        id: "hidden-costs",
        title: "Hidden costs",
        items: [
          {
            q: "What is the total cost of owning a commercial unit beyond the purchase price?",
            a: "Total cost of ownership runs 20% to 35% above the listed price over the full ownership period. Add maintenance deposit (5% to 10% of unit price), registration and legal fees (around 1% to 3%), fit-out costs (1,500 to 6,000 EGP per sqm), broker commissions, annual service charges (50 to 200 EGP per sqm), property tax, and the income gap between handover and the first paying tenant.",
          },
          {
            q: "What hidden costs do first-time commercial buyers usually miss?",
            a: "Commonly missed costs: maintenance deposits paid at handover, club and facility fees in mixed-use projects, registration fees of 1% of property value (reduced under Law 9/2022), fit-out and finishing budgets for core-and-shell delivery, vacancy periods of 6 to 18 months between handover and first tenant, property management fees of 5% to 10% of rental income, and currency conversion fees for foreign investors.",
          },
          {
            q: "How much should I budget for fit-out and finishing on a commercial unit?",
            a: "Budget 1,500 to 2,500 EGP per sqm for basic admin office fit-out, 2,500 to 4,000 EGP per sqm for retail finishing, and 4,000 to 6,000 EGP per sqm for medical units due to specialized requirements. Premium corporate offices and high-end retail can exceed 8,000 EGP per sqm. Most commercial units in Egypt are delivered as core and shell, so fit-out is the buyer's responsibility.",
          },
          {
            q: "What are the registration and legal fees for buying commercial property in Egypt?",
            a: "Registration fees were reduced to 1% of property value under Law No. 9/2022. Add legal fees of 0.5% to 1% for contract review and registration assistance, notarization fees, and any agent commissions if applicable. Foreign buyers may face additional documentation costs for power of attorney and translation. Total transaction costs for legal completion typically run 2% to 4% of unit price.",
          },
        ],
      },
      {
        id: "payment-plans",
        title: "Payment plans & value",
        items: [
          {
            q: "Do payment plans affect the total price of a commercial unit?",
            a: "Yes. Cash payments earn discounts of 20% to 40% compared to extended installment plans. A unit listed at 5 million EGP with a 7-year payment plan might sell for 3 to 4 million EGP cash. Longer payment plans build the developer's financing cost into the price. Calculate which option fits your cash flow — installments preserve capital for other investments while cash unlocks significant savings.",
          },
          {
            q: "How do I evaluate whether a long payment plan is worth the higher total price?",
            a: "Compare the total installment cost against the cash discount, then factor in the opportunity cost of capital. With Egyptian inflation averaging 12% to 15% and rental yields of 8% to 14%, paying off an EGP-denominated installment plan over 5 to 8 years often costs less in real terms than paying cash. Foreign investors with USD income especially benefit from long EGP installments during currency devaluation periods.",
          },
          {
            q: "What is the difference between primary launch prices and post-delivery prices?",
            a: "Primary off-plan launch prices are typically 30% to 50% below post-delivery prices in the same project. A unit launched at 5 million EGP can reach 8 to 10 million EGP after handover and tenant placement. Investors who buy at pre-launch and sell before tenant move-in season can earn 25% to 60% appreciation without ever leasing the unit. Post-delivery prices reflect proven income and reduced risk.",
          },
        ],
      },
      {
        id: "yield-roi",
        title: "Yield & ROI",
        items: [
          {
            q: "How do I calculate the rental yield on a commercial property?",
            a: "Gross rental yield = (annual rent ÷ purchase price) × 100. Net yield subtracts vacancy, maintenance, taxes, and management fees — usually 1.5 to 2 percentage points below gross. A unit costing 5 million EGP earning 500,000 EGP annual rent has a 10% gross yield. Commercial yields in Egypt range from 8% to 15%, with drive-thrus and prime medical units at the higher end and standard admin offices at the lower end.",
          },
          {
            q: "What is a good ROI for commercial real estate in Egypt?",
            a: "Total ROI combines rental yield (8% to 14%) and capital appreciation (4% to 8% in stable conditions, 10% to 20% in growing areas). Total annual returns of 12% to 25% are realistic for well-selected commercial units. Drive-thrus, medical units, and prime mall positions perform at the higher end. Off-plan units in growing areas like Mostakbal City and the New Administrative Capital can exceed 25% over full development cycles.",
          },
          {
            q: "How do I calculate the payback period for a commercial property?",
            a: "Payback period = purchase price ÷ annual net rental income. A unit costing 5 million EGP generating 500,000 EGP net annual rent has a 10-year payback. Most Egyptian commercial units recover their full value through rent in 8 to 12 years. Higher-yield categories like drive-thrus and medical hubs can achieve payback in 6 to 9 years. This calculation excludes appreciation, which often doubles total returns.",
          },
          {
            q: "What rent should a commercial unit generate to justify its purchase price?",
            a: "A unit should generate annual rent equal to 8% to 14% of its purchase price for an attractive yield. A 5 million EGP unit should generate 400,000 to 700,000 EGP annual rent. Below 8% yield, the property underperforms commercial market averages. Above 14% suggests either unusually strong location or hidden risks that need investigation. Compare projected rents against actual market rents from Property Finder, Aqarmap, and similar platforms.",
          },
        ],
      },
      {
        id: "negotiation-timing",
        title: "Negotiation & timing",
        items: [
          {
            q: "Is it possible to negotiate the price of a commercial unit in Egypt?",
            a: "Yes. Primary developer prices have moderate flexibility — typically 3% to 10% discount on launch prices, larger discounts during promotions or end-of-quarter pushes. Resale prices have higher flexibility — sellers often need liquidity and accept 5% to 20% below asking. Negotiation power increases with cash payment, multiple unit purchases, or longer commitment periods. Working with an experienced commercial advisor improves negotiation outcomes significantly.",
          },
          {
            q: "When is the best time to buy a commercial unit for the lowest price?",
            a: "Pre-launch and early-launch phases offer the lowest prices, with discounts of 30% to 50% versus post-delivery. End-of-quarter and end-of-year sales pushes occasionally include better terms. Currency devaluation periods favor foreign buyers with USD income. Periods of high interest rates (Central Bank rates currently at 20% deposit, 21% lending) reduce buyer competition, creating negotiation opportunities. Falling interest rates push prices up.",
          },
          {
            q: "Should I wait for prices to drop before buying?",
            a: "In most cases, no. Commercial prices in main Egyptian markets have risen 13% to 30% annually in recent years. Waiting often costs more than buying now. The exception is when buying in clearly oversupplied submarkets where prices may stagnate. Time in the market typically beats timing the market for commercial real estate. The right unit at a fair price usually outperforms waiting indefinitely for a perfect entry point.",
          },
        ],
      },
      {
        id: "evaluation-checklist",
        title: "Evaluation checklist",
        items: [
          {
            q: "What should I check before paying the down payment on a commercial unit?",
            a: "Verify: developer registration on realestate.gov.eg, project approval and land ownership, masterplan and unit positioning, contract terms including delivery date and penalty clauses, total cost breakdown including all fees, payment plan flexibility, finishing standards and delivery condition, parking allocation, and after-sales service commitments. Cross-check the price against comparable units in the same project and area.",
          },
          {
            q: "How do I evaluate the physical specifications of a commercial unit?",
            a: "Check ceiling height (minimum 3.0m for office, 3.2m+ for medical, 4.0m+ for retail), floor loading capacity, HVAC type, electrical capacity, plumbing access, fire safety systems, parking ratio (1:25–35 for offices), elevator capacity, internet and fiber readiness, facade and signage visibility, unit depth and column spacing, and access from main circulation areas. Specifications below market standard limit your tenant pool.",
          },
          {
            q: "What documents should I review before signing a commercial purchase contract?",
            a: "Review: land ownership title deed, project license and building permits, masterplan with approvals, sales contract with full payment terms, delivery date and penalty clauses, specifications sheet, payment receipt and breakdown, any existing tenant or lease agreements (for resale), and developer registration documents. A specialized advisor like PLACES verifies these documents before contract signing to flag missing or problematic items.",
          },
        ],
      },
      {
        id: "pricing-mistakes",
        title: "Pricing mistakes",
        items: [
          {
            q: "What pricing mistakes do first-time commercial buyers make?",
            a: "Common mistakes: focusing on price per meter without comparing rental yield, ignoring hidden costs, comparing only to other developer launch prices instead of resale and ready market rates, overpaying for \"premium\" finishings that don't increase rentability, underestimating fit-out costs, and accepting the first offered price without negotiation. Buying based on developer brand without verifying that the specific unit is fairly priced is a frequent error.",
          },
          {
            q: "How do I avoid overpaying for a commercial unit?",
            a: "Compare against three benchmarks before signing: comparable units in the same project, resale and ready market prices in the same area, and rental yield calculations. Verify pricing claims with independent listings on Property Finder, Aqarmap, and the official Egyptian Real Estate Platform. Use specialized commercial advisors who track market pricing across developers and projects to avoid emotional or pressured decisions during sales meetings.",
          },
        ],
      },
    ],
  },

  {
    id: "contracts-legal",
    number: 7,
    title: "Contracts, Legal & Due Diligence",
    shortTitle: "Contracts & Legal",
    intro:
      "Egyptian commercial contracts are governed by specific laws, registration procedures, and protections that determine how enforceable your ownership is. This section covers the legal framework, contract structure, due diligence steps, foreign investor rules, and the legal red flags that protect your capital.",
    subsections: [
      {
        id: "legal-framework",
        title: "Legal framework",
        items: [
          {
            q: "What laws govern commercial real estate transactions in Egypt?",
            a: "Commercial real estate transactions are governed by the Egyptian Civil Code (Law No. 131 of 1948), the Commercial Code (Law No. 17 of 1999), the Real Estate Registration Law (Law 114 of 1946 and amendments), and Investment Law No. 72 of 2017. Law No. 9 of 2022 reformed property registration, reducing fees to 1% of property value and streamlining the process. Articles 802 to 977 of the Civil Code cover ownership rights and property sale procedures.",
          },
          {
            q: "What is the difference between a registered contract and a notarized contract in Egypt?",
            a: "A registered contract through the Real Estate Publicity Department (Shahr El-Aqari) grants full legal ownership and complete protection. A notarized contract (signature validation, or Sahhat Tawqi) authenticates signatures at court but offers limited legal protection — it cannot be used for bank loans and provides weaker protection against third-party claims. Full registration is strongly recommended for commercial property, though signature validation still provides enforceable rights.",
          },
          {
            q: "How do I officially register a commercial property in Egypt?",
            a: "Property registration goes through the Real Estate Publicity Department. The process includes: verifying the title is free of disputes and encumbrances, signing a preliminary contract notarized at the Notary Public Office, paying registration fees of approximately 1% of property value, submitting documentation, and waiting for full registration. Court validation takes 2 to 4 weeks; full registration takes 3 to 6 months due to administrative procedures.",
          },
          {
            q: "Why is property registration so important in Egypt?",
            a: "Registration is the only way to obtain enforceable, third-party-protected ownership. As of recent reform debates, more than 90% of Egyptian properties were unregistered, which means many transactions happen outside the formal system where rights are harder to enforce. Without registration, you cannot use the property as collateral, face risks when reselling, and have weaker protection in disputes. Front-loaded registration is far more protective than relying on litigation later.",
          },
        ],
      },
      {
        id: "contract-structure",
        title: "Contract structure",
        items: [
          {
            q: "What does a commercial real estate purchase contract in Egypt include?",
            a: "A commercial purchase contract should include: complete unit specifications (size, location, license type), full purchase price and payment schedule, delivery date with penalty clauses for delays, finishing standards, parking allocation, common area definitions, registration commitment, default and termination clauses, dispute resolution mechanism, and warranty obligations. Egyptian commercial contracts are governed by the Civil Code and must be in writing for enforceability.",
          },
          {
            q: "What are the most important clauses to verify in a commercial real estate contract?",
            a: "Critical clauses include: exact unit specifications matching the masterplan, delivery date and grace period, penalty clauses for developer delays (typically 3% to 5% annually on paid amounts), payment schedule and default consequences, masterplan protection clauses, transfer rights for resale, registration commitments, and dispute resolution forum. Vague or missing clauses on any of these create future risk.",
          },
          {
            q: "What should a delivery clause include in a commercial property contract?",
            a: "The delivery clause should specify: exact delivery date, what \"delivery\" includes (core and shell vs finished), grace period before penalties begin (typically 6 months), penalty rate for delays beyond grace (3% to 5% annual on paid amounts), maximum delay before contract termination right, and inspection process at handover. Without clear delivery terms, buyers have weak protection against the 12 to 24 month delays common with weaker developers.",
          },
          {
            q: "What is a payment plan clause and what should it cover?",
            a: "The payment plan clause defines: down payment amount and timing, installment schedule, grace periods for late payment, penalties for buyer default (usually loss of percentage of paid amounts), early payment options, currency of payment, and consequences of missed installments. Egyptian installment structures typically include strict default clauses that can result in losing 20% to 40% of paid amounts if installments stop without legal cause.",
          },
        ],
      },
      {
        id: "due-diligence",
        title: "Due diligence",
        items: [
          {
            q: "What due diligence should I do before signing a commercial property contract?",
            a: "Verify: developer registration on realestate.gov.eg, project licensing and approvals, land ownership documentation, masterplan approvals from authorities, zoning and licensing match for intended commercial activity, no court-imposed restrictions or liens on the property, no informal tenants with possession claims, and the seller's legal authority to sell. Skip any of these and you risk transaction invalidation or future disputes.",
          },
          {
            q: "How do I verify the developer and project are legitimate?",
            a: "Use the Official Egyptian Real Estate Platform (realestate.gov.eg) to verify developer registration, project approval status, and license validity. Cross-check with the New Urban Communities Authority (NUCA) for projects in new cities and the relevant governorate for older areas. Visit completed projects to verify quality. Review financial reports if the developer is listed on EGX. Avoid any developer or project not properly registered through official channels.",
          },
          {
            q: "How do I verify the property's title is clear before buying?",
            a: "Conduct a title search at the Real Estate Publicity Department to verify ownership history, check for liens or mortgages, confirm no court-imposed restrictions, and conduct a litigation search in the property's jurisdiction. Verify that the property is not subject to inheritance disputes, fraudulent transfer claims, or precautionary court measures. Hiring a real estate lawyer for this verification is strongly recommended — informal title checks miss legal issues that surface later.",
          },
          {
            q: "Should I hire an independent inspector for a commercial unit?",
            a: "Yes. Independent structural inspections are not standard practice in Egypt the way they are in Western markets, so you must arrange one yourself. Hire an independent civil or structural engineer who reports only to you — not someone recommended by the seller or developer. The inspector should check concrete cracking, water ingress, waterproofing, electrical capacity, plumbing pressure, and verify finishing matches what was promised in the contract.",
          },
        ],
      },
      {
        id: "foreign-investors",
        title: "Foreign investors",
        items: [
          {
            q: "Can foreigners buy commercial real estate in Egypt?",
            a: "Yes, under Law No. 230 of 1996, foreigners can buy real estate in most Egyptian cities, subject to certain conditions. Foreign individuals are limited to two properties not exceeding 4,000 square meters total. Foreign companies can purchase commercial property if registered in Egypt. Investment Law No. 72 of 2017 provides additional protections and incentives. Foreign ownership is typically freehold, except in South Sinai where the system uses 99-year leasehold.",
          },
          {
            q: "What additional documents do foreign buyers need?",
            a: "Foreign buyers need: a valid passport, proof of legal entry to Egypt, official notarized power of attorney if buying through a representative, sale and purchase agreement (translated to Arabic), proof of payment via bank transfers and receipts, the seller's ownership documents, and possibly a copy of the entry visa. All foreign-language documents must be officially translated and notarized to be valid.",
          },
          {
            q: "Should foreign investors buy commercial property through an Egyptian company?",
            a: "Many foreign investors prefer this route for commercial investments. Buying through an Egyptian company allows full ownership of multiple commercial units, easier tax planning, and access to incentives under Investment Law No. 72 of 2017. The company must be registered with the General Authority for Investment (GAFI) and comply with ongoing tax and accounting obligations. This route requires more administrative work but is more efficient for serious commercial investments.",
          },
          {
            q: "What are the tax implications for foreign commercial property owners in Egypt?",
            a: "Foreign owners pay: registration fees of 1% of property value (capped under Law 9/2022), property tax of 10% on annual rental value after 30% expense deduction, capital gains tax on resale, and corporate tax if owning through a company. Foreign investors are guaranteed the right to repatriate profits and capital in convertible currencies. Double taxation treaties with several countries reduce overall tax burden — verify your home country's specific treaty.",
          },
        ],
      },
      {
        id: "legal-risks",
        title: "Legal risks & red flags",
        items: [
          {
            q: "What are the most common legal risks in Egyptian commercial real estate?",
            a: "Common risks include: unregistered properties with weak ownership protection, title gaps and competing ownership claims, developer overpromises that don't match contract terms, payment pressure that bypasses proper due diligence, informal tenants claiming possession rights, court-imposed property restrictions, and properties built without proper permits or infrastructure. Most risks are not dramatic fraud but procedural gaps that catch first-time buyers off guard.",
          },
          {
            q: "What red flags should make me walk away from a commercial property deal?",
            a: "Walk away if: the developer is not registered on realestate.gov.eg, the property has no clear title documents, the contract is verbal or untranslated, prices are significantly below market for the area (signaling distress or fraud), the developer pressures fast decisions, registration is \"not possible\" or \"not necessary,\" the masterplan lacks regulatory approval, or the property is built without proper permits. Each of these signals serious risk regardless of how attractive the price seems.",
          },
          {
            q: "Can I lose my property if the developer has financial problems?",
            a: "Yes, this is a real risk with under-capitalized developers. If a developer goes bankrupt with the project incomplete, recovering paid amounts requires court action that can take years. Properties with proper title registration and partial payments may be salvageable; off-plan properties without registration are at higher risk. This is why working only with established developers — TMG, Emaar Misr, Palm Hills, Mountain View, SODIC, Hassan Allam — significantly reduces this exposure.",
          },
          {
            q: "What happens if a contract is breached in Egypt?",
            a: "If a developer or seller breaches a commercial contract, you can pursue legal action through Egyptian courts, but enforcement is slow and outcomes uncertain. Court cases typically take 2 to 5 years to resolve. International arbitration is available for foreign investors under specific contract clauses. The practical reality is that front-loaded due diligence and registered paperwork provide far stronger protection than relying on litigation. Prevention is more reliable than legal remedy.",
          },
        ],
      },
      {
        id: "legal-professionals",
        title: "Legal professionals",
        items: [
          {
            q: "Should I hire a real estate lawyer in Egypt?",
            a: "Yes, especially for commercial transactions above 3 million EGP, foreign investors, or any complex deal. A qualified real estate lawyer reviews contracts, conducts title searches, verifies developer credentials, manages the registration process, and protects you from the procedural gaps that cause most buyer losses. Legal fees typically run 0.5% to 1% of property value, which is small compared to the risk reduction.",
          },
          {
            q: "What should a real estate lawyer do for me in a commercial transaction?",
            a: "A real estate lawyer should: conduct full legal due diligence on the property and seller, review and negotiate contract terms, verify title and registration status, check for liens and court restrictions, manage the registration process with the Real Estate Publicity Department, coordinate notarization, prepare power of attorney documents if needed, and provide ongoing support during construction phases for off-plan purchases.",
          },
          {
            q: "How do I find a qualified real estate lawyer in Egypt?",
            a: "Look for lawyers with documented commercial real estate experience, registration with the Egyptian Bar Association, references from completed transactions, fluency in your language for foreign investors, and clear fee structures. Major firms like ALZAYAT Law Firm, Andersen, and similar specialized practices handle commercial real estate. Working with a real estate consultancy like PLACES often includes coordination with vetted legal partners as part of the service.",
          },
        ],
      },
      {
        id: "lease-contracts",
        title: "Lease contracts",
        items: [
          {
            q: "How are commercial lease contracts structured in Egypt?",
            a: "Commercial leases in Egypt typically run 3 to 10 years depending on tenant type, with annual rent escalations of 7% to 10%. Leases exceeding 9 years must be registered with the Real Estate Publicity Department for legal enforceability. Standard commercial leases include clauses on permitted use, maintenance responsibilities, sub-letting restrictions, security deposits, and termination conditions. Medical and F&B tenants often pay key money or goodwill payments to secure prime spots.",
          },
          {
            q: "What should I include in a commercial lease as the property owner?",
            a: "Include: clear definition of permitted use matching the unit's license, exact rent amount and escalation schedule, security deposit and key money terms, maintenance responsibilities (usually tenant's), insurance requirements, sub-letting and assignment restrictions, default and termination clauses, renewal terms, and dispute resolution mechanism. The Official Egyptian Real Estate Platform now allows digital lease registration, e-invoicing, and direct linking to tenant IDs and business licenses.",
          },
        ],
      },
      {
        id: "contract-finalization",
        title: "Contract finalization",
        items: [
          {
            q: "What happens at handover of a commercial unit?",
            a: "At handover: the developer provides keys and documentation, the buyer inspects the unit against contract specifications, both parties sign a handover protocol noting any defects, the buyer pays final installment if applicable, the buyer pays maintenance deposit (5% to 10% of unit price), and the registration process begins. Document any defects in writing before signing the handover protocol — once signed without notes, it becomes difficult to claim issues later.",
          },
          {
            q: "How long does the full purchase process take from contract to ownership?",
            a: "Initial contract signing and down payment: 1 to 2 weeks. For ready units, court validation takes 2 to 4 weeks and full registration takes 3 to 6 months. For off-plan units, the construction period adds 2 to 5 years before handover. Total time from initial contract to fully registered ownership of a ready unit ranges from 4 to 8 months. A specialized advisor like PLACES coordinates this timeline and manages document flow throughout the process.",
          },
        ],
      },
    ],
  },

  {
    id: "investment-income",
    number: 8,
    title: "Investment & Income-Generating Properties",
    shortTitle: "Investment & Income",
    intro:
      "Commercial real estate can be an active wealth-building engine when chosen and managed well. This section covers investment fundamentals, choosing income-generating property types, building a portfolio, tenant acquisition and management, property operations, consultancy services, resale strategies, and protecting your rental income.",
    subsections: [
      {
        id: "investment-fundamentals",
        title: "Investment fundamentals",
        items: [
          {
            q: "What makes a commercial property a good income-generating investment?",
            a: "A strong income-generating commercial property combines: high-demand location with proven foot traffic, target tenant pool of stable businesses, rental yield of 8% to 14%, lease terms of 5+ years with escalation clauses, low vacancy risk in the surrounding area, and strong resale liquidity. Rental units account for 74.3% of Egypt's commercial real estate market, reflecting strong tenant demand for flexible, cost-effective spaces.",
          },
          {
            q: "How is commercial real estate in Egypt different from residential as an investment?",
            a: "Commercial properties yield 8% to 15% annually compared to 4% to 6% for residential, with longer lease terms (5 to 9 years vs 1 year), more stable tenants, and tenant-paid maintenance and fit-out. Commercial requires higher initial fit-out budgets but generates more consistent income with less hands-on management. Returns compound faster because annual rent escalations of 7% to 10% are standard in commercial leases but rare in residential.",
          },
          {
            q: "What is the average ROI for commercial real estate investment in Egypt?",
            a: "Total annual ROI ranges from 12% to 25% when combining rental yield and capital appreciation. Rental yields run 8% to 14%, with capital appreciation adding 4% to 10% annually in stable markets and 15% to 30% in growing zones. A New Cairo commercial unit purchased in 2021 typically shows 50% total appreciation by 2026 plus rental income — generating combined annual returns near 18%.",
          },
          {
            q: "Why are commercial properties considered better than other investment options in Egypt?",
            a: "Commercial real estate provides four advantages over alternatives: tangible asset unaffected by daily market volatility, dual income from rent plus capital appreciation, natural inflation hedge as prices and rents rise with inflation, and low-interest installment financing that enables investment with minimal upfront capital. Compared to gold (no income), bank certificates (often below inflation), and stocks (high volatility), commercial real estate combines stability with growth potential.",
          },
        ],
      },
      {
        id: "choosing-property-types",
        title: "Choosing property types",
        items: [
          {
            q: "Which types of commercial property generate the highest rental income?",
            a: "Drive-thru units lead with rental rates 2 to 3 times higher than equivalent indoor retail. Prime medical clinic units, anchor strip mall positions, and ground-floor F&B retail follow. Drive-thru units of 20–50 sqm with parking-facing visibility deliver the highest rental ROI in 2025–2026. Pharmacy and bank tenants pay premium rents for prime visibility, and clinics in medical hubs sign 7 to 10 year leases.",
          },
          {
            q: "Are admin offices a good income-generating investment?",
            a: "Yes, especially small executive units (30–100 sqm) and flexible co-working layouts. Demand is rising from startups, freelancers, and Gulf-backed companies expanding into Egypt. Admin offices generate slightly lower rent than retail (Grade A at USD 334 per sqm per year) but offer higher stability with less wear and tear. Office vacancy in Grade A buildings dropped to 4.5% in 2025, signaling strong demand.",
          },
          {
            q: "Are medical units a strong income-generating investment in Egypt?",
            a: "Yes, medical units near large communities like El Rehab, Madinaty, Sheikh Zayed, and the New Administrative Capital's Medical City rank among Egypt's most profitable commercial categories. Doctors and medical service providers lock leases for 7 to 10 years to build patient traffic and brand presence. Rental yields range from 10% to 14%, and tenant turnover is among the lowest in commercial real estate.",
          },
          {
            q: "Why are drive-thru units considered the best income-generating commercial property?",
            a: "Drive-thru units serve high-traffic locations on major roads, attract premium global brands like Costa, Dunkin', McDonald's, and KFC, and command rental rates 2 to 3 times higher than indoor retail. Egypt's car-dependent lifestyle and growing fast-food expansion create strong demand. Limited supply of suitable corner positions keeps yields high. Tenants sign 5 to 10 year leases with annual escalations.",
          },
          {
            q: "Are strip malls profitable for rental income?",
            a: "Yes, well-located strip mall units anchored by supermarkets, pharmacies, banks, and F&B chains can yield 10% to 14%. Strip mall rents in Egypt rose 8.6% annually in 2025. Tenants serve daily-use needs, making them resilient to e-commerce competition. Strip malls in growing residential catchments perform especially strongly because foot traffic depends on local residents rather than seasonal trends.",
          },
          {
            q: "Should I invest in mall units or standalone commercial units for rental income?",
            a: "Mall units benefit from shared foot traffic, professional management, and brand mix curation, generating stable rent in successful malls (8% to 12% yields). Mall rent in prime and super-regional malls grew 7.6% and 7.2% annually in 2025. Standalone units offer lower service charges and direct street access but require more active management and tenant sourcing. Mall units typically perform better for passive investors.",
          },
        ],
      },
      {
        id: "income-strategy",
        title: "Income strategy",
        items: [
          {
            q: "Should I build a portfolio of multiple commercial units or focus on one large unit?",
            a: "Multiple smaller units (50 to 150 sqm) provide diversification across tenant types, locations, and risk levels. Vacancy in one unit doesn't threaten total income. Mixing admin offices, retail, and medical units across a portfolio creates rental diversity and risk protection. One large unit reduces management complexity and may attract single anchor tenants but concentrates risk in one location and one tenant relationship.",
          },
          {
            q: "How do I build a balanced commercial real estate investment portfolio?",
            a: "Mix property types across the portfolio: one ready unit in a mature area for immediate income, one off-plan unit in a growing zone for appreciation, plus diversification across categories — admin, medical, retail, drive-thru. Diversify locations across 2 to 3 different submarkets to reduce area-specific risk. Aim for combined rental yield of 10%+ and total return of 18%+ across the portfolio.",
          },
          {
            q: "How much should I invest in commercial real estate to make it worthwhile?",
            a: "Entry-level commercial investments start around 2 to 3 million EGP for small admin or clinic units. Meaningful portfolios begin at 10 to 20 million EGP across multiple units. Beyond this scale, professional property management, dedicated tracking, and diversification become viable. Starting smaller with 1 to 2 well-selected units allows learning the market before scaling, reducing the risk of large early mistakes.",
          },
          {
            q: "What is the best income-generating strategy for new investors?",
            a: "Start with one ready or near-delivery unit in a mature area with proven tenant demand — admin offices in New Cairo's Fifth Settlement, medical units in established medical hubs, or strip mall units in dense residential catchments. This provides immediate or near-term income, faster learning, and lower risk. After the first unit performs as expected, expand into off-plan units and emerging zones for appreciation.",
          },
          {
            q: "What is high-rotation leasing and when does it make sense?",
            a: "High-rotation leasing means renting small units like kiosks, mini coffee bars, and accessory shops on short lease cycles at premium monthly rates with frequent tenant turnover. This strategy generates higher yields but requires active management. It works best for visible micro-units (10 to 30 sqm) in high-traffic areas where tenant demand is constant and replacement is fast. Most investors prefer long-term leasing for stability.",
          },
        ],
      },
      {
        id: "tenant-management",
        title: "Tenant management",
        items: [
          {
            q: "How do I find tenants for a commercial unit in Egypt?",
            a: "Tenant sourcing channels include: direct marketing on Property Finder, Aqarmap, and Bayut, specialized commercial brokers, networking with business owners and franchise operators, listing on the Official Egyptian Real Estate Platform, and working with property management companies. Specialized advisors like PLACES often source tenants before unit handover, reducing the vacancy gap from 6 to 18 months down to under 3 months.",
          },
          {
            q: "What types of tenants generate the most stable rental income?",
            a: "The most stable tenants include: medical professionals (7 to 10 year leases), banks and financial institutions, pharmacy chains, supermarket and convenience chains, branded F&B operators (5 to 9 year leases), and corporate office tenants. These tenants commit to long terms because relocation disrupts their business. They also typically pay key money or goodwill payments to secure prime locations.",
          },
          {
            q: "How do I evaluate a potential tenant before signing a lease?",
            a: "Verify business registration and trade license, request financial statements or bank statements, check business track record and current operations, confirm the use matches the unit's license, verify credit history if available, and require security deposits of 3 to 6 months rent. For high-value tenants, require bank guarantees or post-dated checks covering the full lease term. Background checks reduce default risk significantly.",
          },
          {
            q: "What rent should I charge for a commercial unit?",
            a: "Set rent based on three benchmarks: comparable units in the same project or area, target rental yield of 8% to 14% on your purchase price, and current market rates from active listings. Office rents in key Greater Cairo areas range from 3,916 EGP per sqm per year for Grade B to 6,560 EGP per sqm per year for Grade A. Adjust based on unit specifications, finishing, and location quality.",
          },
          {
            q: "Should I lease the unit furnished or unfinished?",
            a: "Most commercial units in Egypt are leased core and shell or with basic finishing — tenants prefer to fit out for their brand. The exception is admin offices for SMEs, where fully finished units command rental premiums of 20% to 35% from corporate tenants who want move-in ready spaces. Match the delivery condition to tenant type — corporate and franchise tenants typically prefer to handle their own fit-out.",
          },
          {
            q: "How do I structure a commercial lease for stability and protection?",
            a: "Include: clear permitted use matching the unit license, lease term of 5+ years for retail and 7+ years for medical, annual rent escalation of 7% to 10%, security deposit of 3 to 6 months rent, key money for prime positions, maintenance responsibilities (typically tenant's), restrictions on sub-letting, default and termination clauses, insurance requirements, and dispute resolution mechanism. Register leases longer than 9 years with the Real Estate Publicity Department for full enforceability.",
          },
          {
            q: "What is key money and when should I charge it?",
            a: "Key money (or goodwill) is a one-time payment from tenants to secure prime commercial spots, common in high-demand locations. Amounts range from 3 to 12 months of rent for premium positions, paid upfront in addition to rent and deposit. Charging key money is appropriate for prime corner units, mall positions near anchors, drive-thru spots, and high-visibility retail. It signals tenant commitment and adds upfront return.",
          },
        ],
      },
      {
        id: "property-operations",
        title: "Property operations",
        items: [
          {
            q: "Should I manage the commercial property myself or hire a manager?",
            a: "Hire a property manager if you own multiple units, live abroad, lack time for active management, or own units in malls and business parks where coordinated management matters. Self-manage if you own one or two units in your area with stable long-term tenants. Property management in Egypt costs 5% to 10% of monthly rent plus a separate leasing fee that can reach one month's rent for tenant placement.",
          },
          {
            q: "What does a commercial property management service include?",
            a: "Quality property management includes: tenant sourcing and screening, lease negotiation and signing, rent collection, maintenance coordination, tenant relations, monthly reporting, vacancy marketing, contract renewals, escalation enforcement, legal coordination for defaults, and annual property inspections. Services like PLACES and similar advisory firms also offer integrated investment-to-management packages where the same advisor handles selection, leasing, and ongoing oversight.",
          },
          {
            q: "How much does property management cost in Egypt?",
            a: "Standard property management fees are 5% to 10% of monthly rental income, plus one-time leasing fees of one month's rent for tenant placement. Some managers charge fixed fees for specific services like maintenance coordination or legal support. Compare service scope across providers — the cheapest option often excludes critical services like tenant screening and contract enforcement that protect rental income long-term.",
          },
          {
            q: "What ongoing costs should I plan for as a commercial property owner?",
            a: "Ongoing costs include: annual service charges (50 to 200 EGP per sqm), maintenance and repairs (1% to 2% of property value annually), property tax (10% of annual rental value after 30% expense deduction, but in practice 0.1% to 0.5% of property value), insurance, property management fees if applicable, vacancy periods between tenants, and periodic reinvestment in unit upgrades. Total ongoing costs run 1.5 to 3 percentage points below gross yield.",
          },
          {
            q: "How do I handle tenant defaults or non-payment?",
            a: "Issue formal written notices through registered mail, allow grace periods specified in the contract (typically 15 to 30 days), claim from security deposits, then proceed to legal action if needed. Egyptian commercial lease enforcement takes 6 to 18 months through courts. Prevention works better than remedy — strong tenant screening, security deposits, and post-dated checks for the full lease term reduce default risk significantly.",
          },
        ],
      },
      {
        id: "consultancy-services",
        title: "Consultancy services",
        items: [
          {
            q: "What is investment consultation for commercial real estate?",
            a: "Investment consultation provides objective analysis of market opportunities, property types, locations, and developers based on your specific goals, budget, and risk tolerance. Quality consultation includes financial modeling, ROI projections, risk assessment, due diligence support, and ongoing portfolio review. Specialized commercial real estate consultancies like PLACES focus on commercial categories specifically, offering deeper expertise than general real estate agents.",
          },
          {
            q: "What services do commercial real estate consultancies offer beyond selection?",
            a: "Full-service commercial consultancies offer: investment strategy planning, market research and area analysis, developer and project evaluation, unit selection, due diligence coordination, contract negotiation, registration support, fit-out coordination, tenant sourcing, lease negotiation, ongoing property management, and resale or exit planning. The advantage of integrated services is consistency — the same team that selected the unit also manages it for performance.",
          },
          {
            q: "How does a primary sales advisor differ from a resale specialist?",
            a: "Primary sales advisors source units directly from developers at launch prices, offering pre-launch and early-launch opportunities with the lowest entry prices. Resale specialists source ready or near-delivery units from existing owners, often below primary launch prices in the same project. Both have their place — primary for appreciation plays, resale for immediate income. Comprehensive advisors handle both channels.",
          },
          {
            q: "What is income-generating property service and how does it work?",
            a: "Income-generating property services help investors monetize commercial units through full-cycle support: unit selection focused on rental performance, pre-handover tenant sourcing, fit-out management to match tenant requirements, lease negotiation for optimal terms, and ongoing property management. Some services include financing options for fit-out costs. The goal is converting an empty unit into income-producing asset within months of handover.",
          },
          {
            q: "What is the difference between active and passive commercial real estate investing?",
            a: "Passive investing means hiring services to handle selection, leasing, and management — the investor reviews reports and approves major decisions but doesn't operate day-to-day. Active investing means the owner handles tenant relations, maintenance coordination, lease negotiations, and property decisions directly. Passive investing fits investors abroad, busy professionals, and first-time investors. Active investing fits experienced investors with time and local knowledge.",
          },
        ],
      },
      {
        id: "resale-strategies",
        title: "Resale strategies",
        items: [
          {
            q: "What is the best resale strategy for commercial property?",
            a: "Three proven strategies: pre-launch to delivery resale (25% to 60% appreciation in 2 to 4 years without leasing), buy-rent-resell after stabilization (5 to 7 year holds with combined yield and appreciation), and end-user resale (selling to doctors, franchise operators, or business owners at a premium 20% to 40% above pure investor pricing). The right strategy depends on capital availability, time horizon, and management appetite.",
          },
          {
            q: "When should I sell a commercial property to maximize profit?",
            a: "Strong selling moments include: just before handover when end-users compete for ready units, just after handover when tenants are signed and income is proven, and at year 5 to 7 when the area has matured. Selling too early misses appreciation; selling too late risks market cycle changes. Time the sale to project completion phases and local demand cycles. Net proceeds after capital gains tax and transfer fees should be your benchmark.",
          },
          {
            q: "How do I price a commercial unit for resale?",
            a: "Price based on: comparable resale listings in the same project (most reliable benchmark), primary developer prices for similar units, rental yield expectations of likely buyers (a unit with 10% yield supports a price 10x annual rent), and recent transaction comparables. Pricing 5% to 10% below primary developer prices typically attracts buyers quickly. Overpricing extends time on market and weakens negotiation position.",
          },
          {
            q: "Who buys commercial properties in the resale market in Egypt?",
            a: "Buyers include: end-users like doctors, franchise operators, and business owners who want ready units for immediate use, investors seeking ready income-producing assets, businesses converting from rent to own, and other investors looking for value below primary launch prices. End-users typically pay higher prices per square meter than pure investors because they value business utility over yield calculations.",
          },
        ],
      },
      {
        id: "risk-management",
        title: "Risk management",
        items: [
          {
            q: "How do I protect my commercial investment income from inflation?",
            a: "Egyptian commercial leases include annual rent escalation clauses of 7% to 10%, automatically adjusting income to inflation. Multi-year leases with longer terms compound this protection. Property values also rise with inflation — Egyptian commercial prices rose 13% to 30% annually in recent years. Diversifying across multiple units and tenant types adds protection. Foreign-currency leases are increasingly common for premium units.",
          },
          {
            q: "What happens to my rental income during economic downturns?",
            a: "Recession-resistant categories — medical units, pharmacies, supermarket-anchored strip malls, drive-thrus serving daily-use F&B — maintain occupancy and rents during downturns. Higher-risk categories like luxury retail and large entertainment spaces face occupancy drops of 10% to 30%. Long lease terms (5+ years) protect against short-term volatility. Cash reserves of 6 to 12 months of expenses help weather any vacancy periods.",
          },
          {
            q: "How do I diversify risk across a commercial real estate portfolio?",
            a: "Diversify across: property types (admin, retail, medical, drive-thru), locations (multiple submarkets within Greater Cairo), tenant industries (healthcare, F&B, professional services, retail), lease maturity dates (avoid all leases expiring in same year), and project quality tiers (mix of established and emerging developments). This reduces exposure to any single tenant default, area downturn, or category-specific risk.",
          },
          {
            q: "What is the biggest risk to commercial rental income in Egypt?",
            a: "The biggest risks are: vacancy in oversupplied submarkets, tenant default in economically pressured periods, currency devaluation reducing USD-equivalent income, area underperformance versus masterplan promises, and management failures that drive tenant turnover. Each risk is manageable through proper unit selection, tenant screening, location due diligence, and active oversight. Most rental income failures trace to selection mistakes rather than market conditions.",
          },
        ],
      },
      {
        id: "foreign-remote-ownership",
        title: "Foreign & remote ownership",
        items: [
          {
            q: "Can I invest in income-generating commercial property remotely from abroad?",
            a: "Yes. Many investors based abroad own commercial property in Egypt and manage it remotely through a property manager or specialized consultancy. You'll need a local representative or power of attorney for handover, leasing, and registration. Day-to-day management — tenant relations, rent collection, maintenance — can be handled fully remotely. Currency considerations and remote oversight require additional planning but don't prevent successful investment.",
          },
          {
            q: "What special considerations do expat Egyptians need for income-generating property?",
            a: "Expat Egyptians benefit from currency exchange timing (buying during EGP devaluation lowers USD-equivalent prices), tax planning across countries, and remote management infrastructure. Considerations include: choosing a developer with strong remote service, establishing power of attorney for transactions, planning for repatriation of rental income in convertible currencies (legally guaranteed), and working with consultancies that handle end-to-end remote service.",
          },
          {
            q: "How do foreign investors handle rental income from commercial properties?",
            a: "Foreign investors are guaranteed the right to repatriate rental income and capital in convertible currencies under Egyptian investment law. Most investors maintain Egyptian bank accounts for rent collection, then transfer net income periodically to home accounts. Currency risk can be managed by negotiating USD-denominated leases for premium units (increasingly common) or accepting EGP rent and timing currency conversions.",
          },
        ],
      },
      {
        id: "income-mistakes",
        title: "Income mistakes",
        items: [
          {
            q: "What are the most common mistakes income-focused investors make in Egypt?",
            a: "Common mistakes include: choosing units based on price rather than rental potential, underestimating vacancy periods between tenants, accepting first tenant offers without proper screening, signing short leases for higher rent that increase turnover, neglecting maintenance to save costs (reducing tenant quality over time), and skipping property management for properties that need it. Each mistake compounds over the holding period.",
          },
          {
            q: "How do I avoid weak rental performance after handover?",
            a: "Pre-handover preparation prevents most rental disappointments: select units in proven demand locations, source tenants 6 to 12 months before delivery, prepare for fit-out timing matching tenant move-in, set realistic rent based on market comparables not developer projections, and engage property management before handover. Working with a specialized consultancy like PLACES that combines selection with leasing services dramatically reduces the post-handover income gap.",
          },
          {
            q: "Is it worth investing in commercial real estate purely for rental income in 2026?",
            a: "Yes, for investors with the right time horizon and capital. Egyptian commercial rental yields of 8% to 14% significantly outpace bank certificates and many alternative investments. Annual rent escalations of 7% to 10% provide inflation protection. The combination of yield, appreciation, and tax efficiency through corporate ownership makes commercial real estate one of the strongest income strategies available to Egyptian and foreign investors today.",
          },
        ],
      },
    ],
  },

  {
    id: "advisors-brokers",
    number: 9,
    title: "Working With Advisors & Brokers",
    shortTitle: "Advisors & Brokers",
    intro:
      "Working with the right advisor can determine the success of your commercial real estate investment. This section covers the difference between brokers and advisors, how to choose one, services to expect, commission structures, red flags to avoid, and how to build long-term relationships that compound your investment outcomes.",
    subsections: [
      {
        id: "understanding-role",
        title: "Understanding the role",
        items: [
          {
            q: "What is the difference between a real estate broker and an advisor in Egypt?",
            a: "A broker focuses on transaction execution — connecting buyers with sellers and earning commission per deal. An advisor (or consultant) takes a strategic role, providing market analysis, investment planning, due diligence, and ongoing portfolio guidance. Brokers typically work on individual transactions, while advisors build long-term relationships across multiple properties. Specialized commercial real estate consultancies like PLACES combine both functions, handling strategy, selection, transaction, and post-purchase services.",
          },
          {
            q: "Why should I work with a real estate advisor for commercial property in Egypt?",
            a: "Commercial real estate transactions are complex, involve higher capital, and require deeper market knowledge than residential deals. A specialized advisor provides market expertise, access to exclusive listings (including pre-launch units), negotiation skills for better deals, due diligence support, legal coordination, and ongoing portfolio management. Working alone often takes longer, exposes you to fraud risks, and can miss the best units that go to advisor networks before public release.",
          },
          {
            q: "What is the difference between a commercial real estate advisor and a residential one?",
            a: "Commercial advisors specialize in income-generating properties — admin offices, retail, medical units, mall units, drive-thrus, and business parks. They understand tenant requirements, rental yield calculations, lease structures, zoning rules, and licensing for commercial activities. Residential advisors focus on homes for personal use. Choosing a commercial-focused advisor matters because residential agents often lack the specialized knowledge needed to evaluate commercial investments correctly.",
          },
          {
            q: "Do I really need an advisor or can I buy commercial property on my own?",
            a: "Buying alone saves commission costs but exposes you to longer timelines, weaker negotiation outcomes, missed opportunities on pre-launch units, and higher risk of fraud or selection mistakes. The 1.5% to 2.5% advisor commission typically delivers value far exceeding the cost through better unit selection, lower purchase prices, and ongoing support. Self-buying works for experienced investors with deep market knowledge, but most buyers lose more than they save going alone.",
          },
        ],
      },
      {
        id: "tenant-representation",
        title: "Tenant representation (renting an office)",
        items: [
          {
            q: "What is tenant representation, and is it free?",
            a: "Tenant representation means an advisor works only for the company renting the office, not for the landlord. The tenant representative defines what you need, searches the whole market, negotiates the lease and reviews the contract on your behalf. With PLACES it is free for the tenant: the landlord pays our fee when the lease is signed.",
          },
          {
            q: "What does a tenant representative do for a company looking for an office in Egypt?",
            a: "A tenant rep turns your headcount, budget and location needs into a brief, shortlists every suitable office across developers, business parks and buildings (including units not advertised online), arranges viewings, negotiates the rent, rent-free period, yearly increase, service charges and fit-out terms, and reviews the lease before you sign.",
          },
          {
            q: "What is the difference between a tenant rep broker and the landlord's broker?",
            a: "The landlord's broker is paid to fill the landlord's building on the landlord's terms. A tenant rep broker works for you: it compares options across the whole market and negotiates against the landlord, so the terms you sign reflect the market rather than one building's asking price.",
          },
          {
            q: "When should a company start working with a tenant representative?",
            a: "Ideally 6 to 9 months before you need to move or before your current lease ends. Most office searches in Cairo take 4 to 8 weeks to a signed lease, and a core and shell office then needs another 8 to 14 weeks of fit-out. Starting early gives you more options and more negotiating leverage, including on a renewal.",
          },
        ],
      },
      {
        id: "choosing-advisor",
        title: "Choosing the right advisor",
        items: [
          {
            q: "How do I choose the right commercial real estate advisor in Egypt?",
            a: "Choose based on six factors: specialization in commercial real estate (not just residential), track record of completed commercial transactions, market knowledge of your target areas, partnerships with major developers, transparency in fees and recommendations, and client references. Top commercial-focused firms in Egypt include New Avenue Real Estate, The Address Investments, ERA Real Estate Egypt, Coldwell Banker Egypt, and specialized consultancies like PLACES.",
          },
          {
            q: "What qualifications should a real estate advisor have?",
            a: "A qualified commercial advisor should have: official registration with relevant authorities, minimum 3 to 5 years of commercial real estate experience, demonstrated transactions in your target area and property type, knowledge of legal frameworks (Civil Code, Real Estate Registration Law, Investment Law), partnerships with established developers, and ongoing market research capabilities. Accreditation with international networks like RE/MAX, Coldwell Banker, or ERA adds credibility but isn't required.",
          },
          {
            q: "Should I work with a small specialized advisor or a large brokerage company?",
            a: "Large brokerages offer broader inventory, established processes, and global networks, but individual attention can be limited. Smaller specialized advisors provide deeper expertise in specific commercial categories, more personalized service, and stronger ongoing relationships. For commercial real estate where unit selection details matter heavily, specialized advisors with deep category knowledge often outperform large general brokerages. Match the advisor type to your investment scale and complexity.",
          },
          {
            q: "How do I verify a real estate advisor is legitimate and trustworthy?",
            a: "Verify: official business registration, physical office location, online presence and reviews, references from past clients, completed transaction history, partnerships with verified developers (cross-check on developer websites), and registration on official platforms. Avoid individual brokers without company affiliation, advisors who pressure quick decisions, those who can't show transaction history, and anyone unwilling to put commitments in writing.",
          },
          {
            q: "What questions should I ask a potential advisor before working with them?",
            a: "Ask: How many years have you specialized in commercial real estate? What types of commercial properties do you work with most? Which developers do you have direct partnerships with? Can you share recent transactions in my target area and property type? What is your full commission structure? What services do you provide beyond the transaction? Can you provide client references? Do you handle ongoing property management or just sales?",
          },
          {
            q: "Should I work with multiple advisors at the same time?",
            a: "Working with 2 or 3 advisors simultaneously can broaden your view of available units and provide comparison points, but it dilutes the relationship and sometimes results in advisors hesitating to share their best opportunities. The stronger approach is selecting one specialized commercial advisor as your primary, then verifying their recommendations with independent sources and limited consultation from other professionals when needed.",
          },
        ],
      },
      {
        id: "specialization-expertise",
        title: "Specialization & expertise",
        items: [
          {
            q: "What is a specialized commercial real estate consultancy?",
            a: "A specialized commercial consultancy focuses exclusively on commercial property — admin offices, retail, medical, mall units, drive-thrus, and business parks — rather than handling residential alongside. This specialization develops deeper expertise in commercial-specific factors: tenant demand, rental yield calculations, zoning rules, mall positioning, and commercial lease structures. Consultancies like PLACES focus on commercial categories specifically, offering expertise that general brokerages don't develop.",
          },
          {
            q: "Why does specialization matter when choosing a commercial advisor?",
            a: "Commercial real estate has different valuation methods, tenant pools, legal requirements, and performance drivers than residential. A residential agent may not understand how parking ratios affect office rents, why corner positions matter for drive-thrus, or how anchor tenant proximity drives mall unit values. Specialization translates directly into better selection, better negotiation, and better long-term performance. The specialization gap shows up most in unit positioning and tenant matching.",
          },
          {
            q: "Should I work with an advisor who specializes in a specific area or covers all of Egypt?",
            a: "Both approaches have merit. Area specialists know micro-markets deeply — specific projects, comparable rents, tenant patterns, and resale dynamics in their focus area. Multi-area advisors offer breadth and can compare opportunities across submarkets. For commercial investment, the strongest model is an advisor with deep specialization in 2 to 3 major commercial corridors plus working knowledge of the broader market.",
          },
          {
            q: "What is the difference between a primary sales advisor and a resale specialist?",
            a: "Primary sales advisors source units directly from developers at launch prices, working through partnership agreements that give them access to pre-launch and early-launch inventory. Resale specialists source ready or near-delivery units from existing owners, often below primary launch prices in the same project. Comprehensive advisors handle both channels — primary for appreciation plays and resale for immediate income — providing more complete options for your portfolio.",
          },
        ],
      },
      {
        id: "services-scope",
        title: "Services & scope",
        items: [
          {
            q: "What services does a quality commercial real estate advisor provide?",
            a: "Quality services include: investment strategy planning, market research and area analysis, developer and project evaluation, unit selection and shortlisting, financial modeling and ROI projections, due diligence coordination, contract negotiation, registration support, fit-out coordination, tenant sourcing, lease negotiation, ongoing property management, and resale or exit planning. Full-service consultancies handle the complete investment cycle, while transaction brokers focus narrowly on the buy-sell deal.",
          },
          {
            q: "What does an investment consultation include for commercial property?",
            a: "Investment consultation includes: assessment of your goals, budget, and risk tolerance, market analysis of suitable areas and property types, comparison of opportunities across developers and projects, financial projections including rental yield and capital appreciation forecasts, risk assessment, and a recommended action plan with specific units. Quality consultations are objective rather than sales-driven and prioritize fit with your situation over closing any specific deal.",
          },
          {
            q: "Should my advisor provide post-purchase services or just handle the transaction?",
            a: "Strong commercial advisors provide post-purchase services because the investment outcome depends on what happens after the deal closes — fit-out coordination, tenant sourcing, lease negotiation, and ongoing management. Advisors who disappear after commission collection often leave investors without support during the critical first 12 to 18 months. Look for advisors offering integrated services from selection through stabilized rental income.",
          },
          {
            q: "What is full-cycle commercial real estate service?",
            a: "Full-cycle service covers the complete investment journey: pre-purchase strategy and selection, transaction execution, registration and legal coordination, post-handover fit-out support, tenant sourcing and lease negotiation, ongoing property management, and exit or resale planning. The advantage is consistency — the same team that selected the unit also manages it for performance, with accountability across the full investment outcome rather than just the transaction.",
          },
          {
            q: "Can a commercial advisor help me with leasing my unit after purchase?",
            a: "Yes. Quality commercial advisors provide leasing services as part of post-purchase support — sourcing tenants, screening applicants, negotiating lease terms, and managing tenant transitions. Some advisors source tenants 6 to 12 months before unit handover, dramatically reducing the typical 6 to 18 month vacancy gap. This integrated approach is increasingly standard for specialized commercial consultancies like PLACES.",
          },
          {
            q: "Do advisors handle property management for commercial units?",
            a: "Some advisors offer property management directly, while others coordinate with specialized property management firms. Services typically include: rent collection, tenant relations, maintenance coordination, contract renewals, escalation enforcement, monthly reporting, and legal coordination for defaults. Property management fees range from 5% to 10% of monthly rent, separate from leasing fees of typically one month's rent for new tenant placement.",
          },
        ],
      },
      {
        id: "commission-fees",
        title: "Commission & fees",
        items: [
          {
            q: "How much commission do real estate brokers charge in Egypt?",
            a: "Real estate commissions in Egypt typically range from 1.5% to 2.5% of the transaction value for residential, with similar or slightly higher rates for commercial deals. Some commercial advisors charge fixed retainers for advisory services in addition to transaction commissions. Pre-launch and developer-led transactions sometimes have commissions paid by the developer rather than the buyer, depending on the agreement.",
          },
          {
            q: "Who pays the commission — the buyer, seller, or developer?",
            a: "For primary sales (off-plan and new launches), the developer typically pays the broker commission, so buyers don't pay extra. For resale transactions, commission is usually paid by the seller, sometimes split between seller's and buyer's brokers. For lease transactions, the landlord typically pays the leasing fee. Always clarify commission arrangements in writing before engaging an advisor to avoid disputes.",
          },
          {
            q: "Can I negotiate the commission rate with a real estate advisor?",
            a: "Yes. Commission rates can be negotiated, especially in the initial stages of engagement. The negotiation power increases with multiple unit purchases, larger transaction values, exclusive working relationships, or longer service commitments. Stick to the agreed rate after initial negotiation — frequent renegotiation damages the working relationship. Honor any prior commission agreements throughout the transaction.",
          },
          {
            q: "Are there hidden fees beyond the standard commission?",
            a: "Standard advisor commissions cover the transaction process. Additional services that may carry separate fees include: ongoing property management, post-purchase legal coordination, tenant sourcing for leasing, fit-out project management, and complex due diligence beyond standard. Quality advisors disclose all fees upfront in writing. If an advisor introduces unexpected fees mid-process, treat it as a red flag for the broader relationship.",
          },
          {
            q: "What is a retainer-based advisory service?",
            a: "Retainer-based advisory means paying a fixed monthly or annual fee for ongoing investment guidance — market analysis, portfolio review, opportunity sourcing, and strategic planning — rather than per-transaction commission. This model suits high-net-worth investors building multi-unit portfolios who want continuous expertise. Retainers typically run 50,000 to 500,000 EGP annually depending on portfolio scope, often combined with reduced transaction commissions.",
          },
        ],
      },
      {
        id: "working-effectively",
        title: "Working effectively",
        items: [
          {
            q: "How do I get the best results from my real estate advisor?",
            a: "Be clear about your goals, budget, timeline, and risk tolerance from the first meeting. Provide complete information about your financial situation and investment experience. Trust their recommendations but verify with independent sources. Maintain regular communication. Make decisions in reasonable timeframes — advisors often lose units to faster-deciding buyers. Build a long-term relationship rather than treating each transaction as a one-off.",
          },
          {
            q: "What information should I share with my advisor?",
            a: "Share: investment goals (income, appreciation, business use), available budget including reserves for hidden costs, target holding period, risk tolerance, preferred areas and property types, financial situation including income stability, prior investment experience, time availability for active management, and tax considerations. Comprehensive information allows the advisor to recommend genuinely fitting opportunities rather than generic options.",
          },
          {
            q: "How often should I communicate with my real estate advisor?",
            a: "During active deal evaluation, weekly check-ins keep momentum. After purchase during construction phases, monthly updates on project progress are reasonable. Post-handover, quarterly portfolio reviews work well, with ad-hoc communication for tenant or maintenance issues. The right cadence depends on relationship type — transaction-focused advisors work intensively then go quiet, while ongoing advisors maintain steady contact.",
          },
          {
            q: "What should I do if I disagree with my advisor's recommendations?",
            a: "Ask for the data and reasoning behind the recommendation. Quality advisors welcome questions and explain their analysis. If their reasoning is sound but you still disagree, your investment instincts may be valid — investors know their own goals and constraints best. If you frequently disagree, the fit may be wrong; consider switching to an advisor whose style matches yours. Don't proceed with deals that feel wrong despite strong advisor recommendations.",
          },
        ],
      },
      {
        id: "red-flags",
        title: "Red flags & risks",
        items: [
          {
            q: "What red flags should warn me away from a real estate advisor?",
            a: "Red flags include: pressure to decide quickly, refusal to provide written commitments, no verifiable transaction history, recommendations always favoring one developer (suggesting hidden incentives), reluctance to share market data or comparables, vague answers about fees, no physical office or business registration, and lack of specialization despite claiming expertise. Each signals risk regardless of how appealing their pitch sounds.",
          },
          {
            q: "Why should I avoid individual unregistered brokers?",
            a: "Individual brokers without company affiliation offer no institutional accountability, no recourse if problems arise, no documented track record, and often lack the legal and market knowledge needed for commercial transactions. The savings on commission are usually offset by weaker negotiation, missed opportunities, and exposure to fraud. Established brokerages and consultancies provide accountability that individual operators cannot match.",
          },
          {
            q: "Can my advisor have conflicts of interest?",
            a: "Yes, conflicts can exist when advisors receive higher commissions from specific developers, work as direct sales agents for one developer while claiming objectivity, or push specific units to clear inventory rather than match buyer needs. Quality advisors disclose all relationships and incentives. Independent commercial consultancies that maintain objectivity across multiple developers — rather than acting as developer sales arms — provide more reliable recommendations.",
          },
          {
            q: "How do I avoid being pressured into the wrong investment?",
            a: "Set your criteria before viewing units. Insist on time to review and compare. Verify advisor claims with independent sources including official platforms, market reports, and other advisors. Walk away from any deal requiring same-day decisions — legitimate opportunities rarely require this pressure. Take 48 to 72 hours minimum for major commercial decisions, longer for first-time investors. Patience protects against emotional and pressured mistakes.",
          },
        ],
      },
      {
        id: "foreign-remote",
        title: "Foreign & remote",
        items: [
          {
            q: "Can foreign investors work with Egyptian real estate advisors remotely?",
            a: "Yes. Quality commercial advisors handle remote investors regularly, providing video tours, digital documentation, video calls for consultations, and coordinated handover with local representatives. Look for advisors with bilingual teams, established remote service processes, and experience with foreign clients. International network firms (RE/MAX, Coldwell Banker, ERA) and specialized consultancies often have established remote-investor service models.",
          },
          {
            q: "What special considerations apply when working with an advisor as a foreign investor?",
            a: "Verify the advisor handles legal coordination across borders, can support power of attorney arrangements, has experience with currency considerations, and can coordinate remote handover and registration. Ensure they have legal partners qualified to support foreign investors, understanding of Investment Law No. 72 of 2017, and translation services for documents. Strong advisors maintain relationships with notaries, lawyers, and government offices to streamline foreign transactions.",
          },
          {
            q: "How do I find a trustworthy advisor from abroad?",
            a: "Verify online presence and reviews on multiple platforms, check international network affiliations (RE/MAX, Coldwell Banker, ERA), request video calls before committing, ask for client references including other foreign investors, verify business registration in Egypt, and consider working through your country's Egyptian community networks. Many specialized commercial consultancies maintain dedicated foreign investor services with English-speaking teams and international experience.",
          },
        ],
      },
      {
        id: "developer-agents",
        title: "Developer sales agents",
        items: [
          {
            q: "What is the difference between a developer's sales agent and an independent advisor?",
            a: "Developer sales agents work directly for one developer, selling only that developer's projects. They have detailed product knowledge but limited objectivity since their incentives align with the developer rather than the buyer. Independent advisors work across multiple developers and projects, providing objective comparisons but sometimes less depth on any single project. Use developer agents for project-specific information, independent advisors for objective comparisons.",
          },
          {
            q: "Should I buy directly from a developer or through an advisor?",
            a: "Going directly to a developer can occasionally yield small price savings but eliminates negotiation leverage, comparison opportunities, and post-purchase support that advisors provide. Quality advisors negotiate developer discounts, secure better unit positions, and coordinate the full transaction process — usually adding more value than their commission costs. For commercial property especially, the complexity makes advisor support worthwhile for most buyers.",
          },
          {
            q: "How do advisors get exclusive listings or pre-launch access?",
            a: "Established advisors maintain partnership agreements with major developers, giving them early access to project launches before public release. Top developers often allocate 30% to 50% of inventory to broker partners during pre-launch phases. Advisors with strong developer relationships secure prime units (corner positions, ground floor retail, premium drive-thru spots) before they reach public sales channels.",
          },
        ],
      },
      {
        id: "long-term-relationships",
        title: "Long-term relationships",
        items: [
          {
            q: "Should I build a long-term relationship with one advisor or change for each transaction?",
            a: "Long-term relationships typically deliver better results. Your advisor learns your preferences, risk tolerance, and goals over time, surfacing better-fitted opportunities. Long-term clients also receive priority access to pre-launch units and stronger negotiation support. Changing advisors per transaction loses these benefits and treats each deal as a separate engagement, often resulting in less personalized service.",
          },
          {
            q: "How can a real estate advisor help me build a long-term investment portfolio?",
            a: "A long-term advisor provides: ongoing market analysis to identify portfolio expansion opportunities, diversification recommendations across property types and locations, performance tracking on existing units, exit timing recommendations, and reinvestment strategy. The strongest commercial portfolios are built progressively over 5 to 15 years through consistent advisor relationships, not through one-time transactions with different brokers.",
          },
          {
            q: "What is the value of working with the same advisor across multiple investments?",
            a: "Working with the same advisor across multiple investments creates: portfolio-level strategy rather than transaction-by-transaction decisions, accumulated knowledge of your specific situation, consistent service standards, easier coordination across units (especially for management and leasing), better negotiation leverage from repeat business, and stronger advocacy when issues arise. The compounded value of long-term relationships often exceeds any short-term savings from comparison shopping.",
          },
        ],
      },
    ],
  },

  {
    id: "risks-mistakes",
    number: 10,
    title: "Risks, Mistakes & Best Practices",
    shortTitle: "Risks & Best Practices",
    intro:
      "Most commercial real estate failures trace to avoidable mistakes — skipped due diligence, weak developer selection, or chasing prestige over fundamentals. This section covers the major risks, common mistakes, and best practices that separate successful commercial investors from those who underperform.",
    subsections: [
      {
        id: "major-risks",
        title: "Major risks",
        items: [
          {
            q: "What are the biggest risks of investing in commercial real estate in Egypt?",
            a: "The biggest risks are: developer delivery delays of 12 to 24 months, oversupply in specific submarkets reducing rental rates, currency devaluation cutting USD-equivalent income, unregistered properties with weak ownership protection, weak tenant demand in poorly selected locations, and overvaluation of \"prestige\" projects. Egypt's economy showed 4.4% growth and inflation slowed to 11.9% in early 2026, but currency risk and submarket oversupply remain the top concerns.",
          },
          {
            q: "What is the biggest mistake commercial real estate investors make in Egypt?",
            a: "The biggest mistake is buying based on developer marketing rather than independent verification. According to industry research, 90% of foreign investors make avoidable mistakes — most rooted in skipping due diligence, trusting projected rental returns without comparable data, and choosing units based on price rather than rental potential. The cost of these mistakes typically runs 20% to 50% of expected returns over the holding period.",
          },
          {
            q: "What hidden risks do most investors overlook in Egyptian commercial property?",
            a: "Commonly overlooked risks include: unverified or unregistered projects (legal complications surface only when reselling or transferring ownership), delayed delivery causing capital lock-up, overvaluation in prestige projects with slow appreciation, weak post-handover property management reducing tenant quality, and zoning restrictions that limit allowed activities. Each can reduce returns significantly even when the headline investment looks attractive.",
          },
          {
            q: "How does currency risk affect commercial real estate investment in Egypt?",
            a: "EGP devaluation reduces USD-equivalent income and capital appreciation for foreign investors, even when nominal EGP returns look strong. The EGP has experienced multiple devaluations in recent years. Mitigations include: negotiating USD-denominated leases for premium units (increasingly common), buying during devaluation periods when USD-equivalent prices are lower, and diversifying across EGP and foreign-currency assets.",
          },
          {
            q: "What happens if a developer delays delivery or fails to complete the project?",
            a: "Delays of 12 to 24 months are common with weaker developers, locking up capital and delaying rental income. In severe cases, projects stop entirely if developers face financial difficulties. Recovery through Egyptian courts takes 2 to 5 years with uncertain outcomes. Working only with established developers like Talaat Moustafa Group, Emaar Misr, Palm Hills, Mountain View, SODIC, and Hassan Allam significantly reduces this exposure.",
          },
        ],
      },
      {
        id: "common-mistakes",
        title: "Common mistakes",
        items: [
          {
            q: "What are the most common mistakes first-time commercial investors make?",
            a: "Common mistakes include: buying based on sales pitches rather than research, ignoring micro-location factors that drive rental performance, underestimating fit-out and vacancy costs, choosing the wrong property type for their goal, picking developers without verifying delivery history, and skipping legal due diligence to save time. Each mistake typically costs 15% to 30% of expected returns and is fully preventable through proper preparation.",
          },
          {
            q: "How do investors mistakenly choose the wrong property type?",
            a: "Investors often select property types based on what they understand (admin offices) rather than what fits their goal (drive-thrus or medical units may yield more). They also choose based on price rather than tenant demand, buy in oversupplied categories, or pick units that don't match the target tenant pool in the area. Matching property type to investment goal and local demand is more important than price or familiarity.",
          },
          {
            q: "What pricing mistakes lead to weak commercial real estate returns?",
            a: "Pricing mistakes include: comparing only to other developer launch prices instead of resale and ready market rates, overpaying for \"premium\" finishings that don't increase rentability, focusing on price per square meter without comparing rental yield, and accepting first offers without negotiation. Always verify pricing against three benchmarks: comparable units in the same project, area resale prices, and rental yield calculations against market rents.",
          },
          {
            q: "Why do some commercial investors fail to find tenants after handover?",
            a: "Failures usually trace to: buying in areas without confirmed residential delivery, units with poor specifications (wrong ceiling height, inadequate parking, weak visibility), unrealistic rental expectations not aligned with market rates, missing pre-handover tenant sourcing, and lack of property management to handle leasing. Pre-handover tenant sourcing reduces the typical 6 to 18 month vacancy gap to under 3 months.",
          },
          {
            q: "What legal mistakes can invalidate a commercial property purchase?",
            a: "Critical legal mistakes include: skipping title verification at the Real Estate Publicity Department, signing contracts without legal review, not registering the property (more than 90% of Egyptian properties were unregistered as of recent reform debates), accepting verbal agreements, and missing court-imposed restrictions on the property. Each can lead to ownership disputes, transaction invalidation, or years of litigation to recover rights.",
          },
        ],
      },
      {
        id: "best-practices",
        title: "Best practices",
        items: [
          {
            q: "What are the most important best practices for commercial real estate investment in Egypt?",
            a: "Top best practices: define your investment goal clearly before searching, work with specialized commercial advisors, verify everything independently through realestate.gov.eg, conduct full legal due diligence before signing, choose established developers with documented delivery records, calculate rental yield and total cost of ownership before buying, register the property officially, and maintain professional property management post-handover.",
          },
          {
            q: "How do I avoid the most common commercial real estate mistakes?",
            a: "Follow a structured process: set clear goals and budget first, work with specialized advisors rather than going alone, verify developer registration and project approvals on official platforms, compare units against multiple benchmarks before deciding, conduct independent inspections, hire a real estate lawyer for contract review, register the property officially, and plan for 6 to 18 months of vacancy expenses post-handover.",
          },
          {
            q: "What due diligence steps should every commercial investor complete?",
            a: "Mandatory due diligence: verify developer registration on realestate.gov.eg, conduct title search at the Real Estate Publicity Department, check for liens and court-imposed restrictions, review project licenses and approvals, verify the masterplan with regulatory bodies, confirm zoning matches intended commercial activity, hire an independent structural inspector, review the contract with a real estate lawyer, and verify rental rate projections against actual market comparables.",
          },
          {
            q: "What financial best practices protect commercial investors?",
            a: "Financial best practices: keep down payment under 30% of liquid savings, ensure installments stay under 30% of monthly income, maintain reserves covering 12 months of installments without rental income, factor in 6 to 18 month vacancy gaps post-handover, budget 20% to 35% above listed price for total ownership costs, calculate rental yield and payback period before buying, and diversify across 2 to 3 different submarkets and property types when scaling.",
          },
          {
            q: "How do I protect my commercial investment from market downturns?",
            a: "Protection strategies: focus on recession-resistant categories (medical units, pharmacy strip malls, daily-use F&B drive-thrus), secure long lease terms (5+ years) with stable tenants, include annual rent escalation clauses of 7% to 10%, maintain cash reserves of 6 to 12 months expenses, diversify across property types and locations, and avoid overleveraged positions. Strong tenants with long leases protect income through any market cycle.",
          },
        ],
      },
      {
        id: "strategic-practices",
        title: "Strategic practices",
        items: [
          {
            q: "What is the best timing strategy for commercial real estate investment in Egypt?",
            a: "Buy during pre-launch and early-launch phases for 30% to 50% discounts versus post-delivery prices. Currency devaluation periods favor foreign buyers with USD income. Periods of high interest rates (Egypt's Central Bank deposit rate currently around 20%) reduce buyer competition and create negotiation opportunities. Time exits to project completion phases when end-user demand peaks. Avoid waiting for \"perfect\" timing — selective buying in the right unit usually outperforms market timing.",
          },
          {
            q: "How do successful commercial investors build portfolios in Egypt?",
            a: "Successful investors typically: start with one well-selected ready unit for immediate income and learning, expand into off-plan units in growing zones for appreciation after the first unit performs as expected, diversify across property types (admin, retail, medical, drive-thru) and 2 to 3 submarkets, mix established areas for income with emerging zones for growth, and build long-term relationships with specialized advisors who provide ongoing portfolio guidance.",
          },
          {
            q: "What separates successful commercial real estate investors from unsuccessful ones in Egypt?",
            a: "Successful investors prioritize selection quality over price, work with specialized advisors instead of going alone, follow structured due diligence processes, focus on tenant demand and rental yield rather than developer marketing, choose established developers despite higher prices, hold for 5 to 7 years minimum, and diversify across property types and locations. Unsuccessful investors typically rush decisions, skip verification, chase prestige, and underestimate hidden costs.",
          },
        ],
      },
      {
        id: "final-guidance",
        title: "Final guidance",
        items: [
          {
            q: "What should every commercial investor know before signing a contract?",
            a: "Before signing, verify: developer registration on realestate.gov.eg, project license and approval status, land ownership and title clarity, masterplan integrity, contract terms including delivery date and penalty clauses, full price breakdown including hidden costs, payment plan flexibility, finishing standards and delivery condition, parking allocation, and after-sales service commitments. Have a real estate lawyer review the contract — the 0.5% to 1% legal fee protects against far larger losses.",
          },
          {
            q: "How can a specialized commercial real estate consultancy help me avoid these risks and mistakes?",
            a: "Specialized consultancies like PLACES provide objective evaluation across developers and projects, verify regulatory approvals and developer track records, access pre-launch units before public release, model rental yields and total returns before recommendations, coordinate legal and registration processes, source tenants pre-handover to reduce vacancy gaps, and provide ongoing property management. The integrated approach addresses every risk category — selection, legal, financial, and operational — through one accountable relationship.",
          },
        ],
      },
    ],
  },
];

// Pre-compute slug-keyed lookup so the page can resolve hash anchors in O(1)
// and so the "people also ask" related-questions block can pull random items.
export type FAQItemWithMeta = FAQItem & {
  slug: string;
  sectionId: string;
  sectionTitle: string;
  subsectionId: string;
};

export const FAQ_ALL_ITEMS: FAQItemWithMeta[] = FAQ_SECTIONS.flatMap((section) =>
  section.subsections.flatMap((sub) =>
    sub.items.map((item) => ({
      ...item,
      slug: slugify(item.q),
      sectionId: section.id,
      sectionTitle: section.title,
      subsectionId: sub.id,
    })),
  ),
);

// Slug → Section lookup. Used by the dynamic /faqs/:slug route.
export function getFAQSectionBySlug(slug: string | undefined): FAQSection | undefined {
  if (!slug) return undefined;
  return FAQ_SECTIONS.find((s) => s.id === slug);
}

// Question count rollup — surfaced on section cards so users see "23 questions"
// before clicking in.
export function countQuestionsInSection(section: FAQSection): number {
  return section.subsections.reduce((sum, sub) => sum + sub.items.length, 0);
}

// A few representative questions per section (the first of each of the first
// subsections) for the /faqs hub. The hub links to these on the section page
// instead of repeating every question and answer, so each section page is the
// only home of its Q&As (and their FAQPage markup).
export function faqSampleQuestions(section: FAQSection, n = 3): Array<FAQItem & { slug: string }> {
  const firsts = section.subsections.map((sub) => sub.items[0]).filter(Boolean);
  const rest = section.subsections.flatMap((sub) => sub.items.slice(1));
  return [...firsts, ...rest].slice(0, n).map((item) => ({ ...item, slug: slugify(item.q) }));
}
