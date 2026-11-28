import { Link } from "wouter";
import { GuideLayout } from "@/components/guides/GuideLayout";
import {
  HighlightNumber,
  StatCallout,
  KeyInsight,
  PullQuote,
  BudgetBreakdown,
  GuideImage,
} from "@/components/guides/GuideElements";
import { findGuide } from "@/lib/guides";

const guide = findGuide("office-fit-out-costs-cairo")!;

const WORD_COUNT = 2040;

export default function OfficeFitOutCostsCairoGuide() {
  return (
    <GuideLayout guide={guide} wordCount={WORD_COUNT}>
      <p className="lead">
        Fitting out a Cairo office in 2026 costs between{" "}
        <HighlightNumber>EGP 3,500 and EGP 12,000 per m²</HighlightNumber>{" "}
        depending on the finish level. A modest professional-services
        office at 300 m² lands around{" "}
        <HighlightNumber>EGP 1.8–2.4 million all-in</HighlightNumber>;
        a fully custom-finished tech HQ can be{" "}
        <HighlightNumber>EGP 3.5 million+</HighlightNumber>. This guide
        breaks the budget down by category so you know where the money
        goes and where you can cut without regret.
      </p>

      <StatCallout
        value="EGP 3,500 – 12,000"
        label="Per m², depending on finish tier"
        caption="Basic functional at the low end, premium bespoke at the top. A mid-market corporate fit-out lands around EGP 7,000/m²."
      />

      <h2 id="quick-benchmark">Quick benchmark: three finish tiers</h2>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Finish level</th>
              <th>EGP per m²</th>
              <th>What you get</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic functional</td>
              <td>3,500 – 5,500</td>
              <td>Painted walls, vinyl or ceramic flooring, standard lighting, basic partitions, off-the-shelf furniture</td>
            </tr>
            <tr>
              <td>Mid-market corporate</td>
              <td>5,500 – 8,500</td>
              <td>Better partitions with acoustic treatment, LED lighting throughout, mid-tier flooring (LVT or carpet tiles), branded reception, decent furniture, good AV in meeting rooms</td>
            </tr>
            <tr>
              <td>Premium / bespoke</td>
              <td>8,500 – 12,000+</td>
              <td>Custom joinery, high-end furniture (Herman Miller-tier), integrated AV, upgraded HVAC, feature lighting, biophilic elements, high-end finishes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        A quick reality check on these numbers: they're for
        shell-and-core units in institutional buildings, delivered
        turnkey. Older or smaller buildings can spike the cost 20–30%
        due to constraints — see the "hidden costs" section below.
      </p>

      <h2 id="cost-breakdown">The itemized budget: what each category costs</h2>

      <p>
        For a mid-market 300 m² office fit-out at ~EGP 7,000/m² (total
        ~EGP 2.1M), here's how the budget typically breaks down:
      </p>

      <BudgetBreakdown
        total="EGP 2.1M for a 300 m² mid-market fit-out"
        rows={[
          { label: "Partitions + doors", pct: 17 },
          { label: "HVAC + MEP", pct: 18 },
          { label: "Furniture", pct: 17 },
          { label: "Flooring", pct: 12 },
          { label: "Ceiling + lighting", pct: 10 },
          { label: "IT + AV", pct: 10 },
          { label: "Reception + branding", pct: 8 },
          { label: "Contingency + permits", pct: 8 },
        ]}
      />

      <h3>1. Partitions and doors — 15–20% of budget (~EGP 315k–420k)</h3>

      <p>
        Includes drywall, glazed partitions, acoustic treatment,
        internal doors, ironmongery. Glazed partitions (which most
        modern offices want) run <strong>EGP 1,800 – 2,800 per running
        meter</strong> depending on frame quality and glass thickness.
        Acoustic-rated partitions cost 40% more than standard drywall.
      </p>

      <h3>2. Flooring — 10–15% of budget (~EGP 210k–315k)</h3>

      <p>
        Cost varies enormously by material:
      </p>

      <ul>
        <li>Ceramic tiles: EGP 400–800/m² supplied + fitted</li>
        <li>Vinyl (LVT): EGP 500–1,100/m²</li>
        <li>Carpet tiles: EGP 400–950/m²</li>
        <li>Engineered wood: EGP 1,400–2,800/m²</li>
        <li>Polished concrete: EGP 700–1,300/m²</li>
      </ul>

      <p>
        Most Cairo offices mix — carpet or LVT in workspaces, ceramic
        or wood in reception, sometimes exposed polished concrete in
        break-out areas for the industrial look.
      </p>

      <h3>3. HVAC + MEP — 15–20% of budget (~EGP 315k–420k)</h3>

      <p>
        MEP (mechanical, electrical, plumbing) is where budgets
        blow out. Most shell-and-core buildings deliver bare cooling
        (chilled water supply at unit boundary), and the tenant
        installs distribution ducts, VAV boxes, thermostats, and grilles.
      </p>

      <p>
        In older buildings without central HVAC, expect to install
        split-unit AC across the space at EGP 30,000–45,000 per unit,
        with 1 unit per 30–40 m². For a 300 m² office that's 8–10
        units — <strong>EGP 250,000–400,000</strong> for HVAC alone.
      </p>

      <p>
        Electrical distribution — power outlets, lighting circuits,
        emergency lighting, fire alarm integration — runs <strong>EGP
        400–800 per square meter</strong>.
      </p>

      <h3>4. Ceiling + lighting — 8–12% of budget (~EGP 170k–250k)</h3>

      <p>
        Suspended acoustic ceilings run <strong>EGP 380–620 per
        m²</strong>. LED lighting is standard now — panel lights at
        EGP 600–1,400 each, feature pendants in reception areas at
        EGP 2,500–8,000 each. A well-lit 300 m² office needs 40–60
        light points depending on layout.
      </p>

      <h3>5. Furniture — 15–20% of budget (~EGP 315k–420k)</h3>

      <p>
        Furniture is where budgets range most wildly.
      </p>

      <ul>
        <li>
          <strong>Task chair.</strong> EGP 3,500 (basic mesh) to EGP
          38,000+ (Herman Miller Aeron). Most Cairo offices land around
          EGP 8,000–14,000 per chair for something durable that lasts.
        </li>
        <li>
          <strong>Workstation desk.</strong> EGP 4,500–12,000 per seat
          for standard laminate. Sit-stand adjustable adds EGP 8,000–15,000.
        </li>
        <li>
          <strong>Meeting room table.</strong> EGP 8,000 (6-person) to
          EGP 45,000+ (12-person boardroom in solid wood).
        </li>
        <li>
          <strong>Meeting room chairs.</strong> EGP 3,000–8,000 each.
        </li>
        <li>
          <strong>Reception furniture.</strong> EGP 40,000–150,000
          depending on brand statement.
        </li>
      </ul>

      <p>
        A rough shortcut: budget <strong>EGP 25,000–45,000 per
        employee</strong> for furniture at mid-market spec.
      </p>

      <h3>6. IT + AV — 8–12% of budget (~EGP 170k–250k)</h3>

      <p>
        The invisible cost most tenants underestimate:
      </p>

      <ul>
        <li>Cat 6 structured cabling: EGP 250–450 per drop point</li>
        <li>Wi-Fi access points: EGP 4,500–14,000 each installed</li>
        <li>Server rack + patch panels: EGP 25,000–60,000</li>
        <li>
          Meeting room AV (TV + camera + mic + speakers): EGP
          22,000–75,000 per room depending on quality
        </li>
        <li>Boardroom AV (larger displays, ceiling arrays): EGP 80,000–250,000</li>
      </ul>

      <p>
        A 300 m² office with 30 workstations and 3 meeting rooms
        typically needs <strong>EGP 180,000–280,000 in IT + AV</strong>.
      </p>

      <h3>7. Reception + branding — 5–10% of budget (~EGP 105k–210k)</h3>

      <p>
        Reception counter, backwall with logo, feature lighting,
        artwork, plants. This is where many offices under-invest and
        it shows to every visitor. Even at mid-market, plan for at
        least <strong>EGP 150,000</strong> on reception if client
        perception matters to your business.
      </p>


      <h2 id="hidden-costs">The four categories most tenants underestimate</h2>

      <h3>1. Permits and approvals</h3>

      <p>
        Fit-out work in most institutional Cairo buildings requires
        landlord approval and (for changes to MEP or structural
        elements) civil defense approval. Budget <strong>EGP
        30,000–80,000</strong> for permits, drawings, and
        pre-approvals. This also adds 2–4 weeks to your timeline.
      </p>

      <h3>2. Landlord fit-out oversight fees</h3>

      <p>
        Many prime buildings charge tenants a fit-out oversight fee
        during construction — typically <strong>EGP 25,000–100,000</strong>{" "}
        for a 300 m² project. This is separate from any deposit and
        is rarely refundable.
      </p>

      <h3>3. Reinstatement obligation</h3>

      <p>
        Almost every Cairo commercial lease requires the tenant to
        return the unit to shell-and-core condition at the end of the
        lease. That means demolishing the fit-out you just built.
      </p>

      <p>
        Reinstatement typically costs <strong>25–35% of the original
        fit-out cost</strong>. On a EGP 2.1M fit-out, budget EGP
        500,000–750,000 for reinstatement at lease end. Negotiate this
        clause hard — some landlords will waive reinstatement if the
        incoming tenant is willing to take the fit-out.
      </p>

      <h3>4. Contingency</h3>

      <p>
        Something always goes wrong. Discovered a load-bearing column
        where the drawings didn't show one. The HVAC contractor's
        estimate was 20% low. The landlord required an upgraded fire
        system halfway through. Budget <strong>10–15%
        contingency</strong> on top of your fit-out estimate. Cairo
        contractors generally price optimistically; the real number
        drifts up.
      </p>

      <h2 id="who-does-fitout">Who actually does the fit-out?</h2>

      <p>
        Three models are common in Cairo:
      </p>

      <h3>Turnkey contractor</h3>

      <p>
        A single fit-out contractor handles design, procurement, and
        construction. Best for tenants who want one point of contact
        and don't have in-house project management capability.
        Downside: harder to compare pricing, and quality varies wildly
        between contractors. Cost premium: 8–15% over separated
        contracts.
      </p>

      <h3>Separated (architect + main contractor)</h3>

      <p>
        Hire an interior architect (EGP 300–800 per m² fee) to design
        + tender + supervise, then compete the build across 3–4
        contractors. More work for the tenant but usually cheaper and
        higher quality outcome. Best for offices over 250 m².
      </p>

      <h3>Landlord fit-out program</h3>

      <p>
        Some institutional landlords (SODIC, Emaar) offer a
        landlord-delivered fit-out program where they build to your
        spec and roll the cost into the rent. Convenient but expensive
        — the effective rate can be 30–50% above what you'd pay
        directly. Only makes sense for tenants without capital or time.
      </p>

      <GuideImage
        src="/images/Mivida-Business-Park.jpg"
        alt="Mivida Business Park office building"
        caption="Fit-out timelines are the difference between paying rent on empty space and moving in on schedule. Every landlord meeting starts with 'we can hand over in 2 weeks' — plan for 8."
      />

      <h2 id="timeline">Timeline: how long fit-out actually takes</h2>

      <p>
        For a 300 m² office:
      </p>

      <ul>
        <li>Design + drawings: 3–5 weeks</li>
        <li>Landlord + permit approvals: 2–4 weeks (can overlap with design)</li>
        <li>Tendering + contract award: 2–3 weeks</li>
        <li>Construction: 6–10 weeks</li>
        <li>Snagging + handover: 1–2 weeks</li>
      </ul>

      <p>
        <strong>Total: 12–18 weeks from lease signing to move-in.</strong>{" "}
        Ask your landlord for rent-free during construction — most
        will grant 8–12 weeks on a 3+ year lease. See{" "}
        <Link href="/guides/how-to-rent-office-cairo">
          our rent negotiation guide
        </Link>{" "}
        for how to structure this.
      </p>

      <h2 id="what-to-do-next">What to do next</h2>

      <p>
        The fit-out budget is only useful once you have a specific
        unit and layout in mind. To get there:
      </p>

      <ol>
        <li>
          Read our{" "}
          <Link href="/guides/office-size-guide">
            office size guide
          </Link>{" "}
          if you're still sizing your requirement.
        </li>
        <li>
          <Link href="/listings">Browse PLACES listings</Link> filtered
          to your target district and size.
        </li>
        <li>
          <Link href="/contact">Talk to a PLACES advisor</Link> — we
          can introduce you to fit-out contractors we've worked with
          and pre-vetted.
        </li>
      </ol>

      <p>
        We don't take referral fees from contractors — the introductions
        are on merit only, so the incentives stay aligned.
      </p>
    </GuideLayout>
  );
}
