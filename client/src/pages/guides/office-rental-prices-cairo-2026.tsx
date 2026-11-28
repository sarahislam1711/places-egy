import { Link } from "wouter";
import { GuideLayout } from "@/components/guides/GuideLayout";
import {
  HighlightNumber,
  StatCallout,
  KeyInsight,
  PullQuote,
  PriceRangeBar,
  GuideImage,
} from "@/components/guides/GuideElements";
import { findGuide } from "@/lib/guides";

const guide = findGuide("office-rental-prices-cairo-2026")!;

const WORD_COUNT = 1780;

// Shared district-price dataset — used by the PriceRangeBar chart and by
// the reference table below. Kept as a constant so any future price
// update propagates to both places from a single edit.
const DISTRICT_PRICES = [
  { label: "New Cairo (Fifth Settlement)", min: 700, max: 1400 },
  { label: "Sheikh Zayed / West Cairo", min: 500, max: 1100 },
  { label: "Maadi", min: 400, max: 900 },
  { label: "6th of October City", min: 350, max: 750 },
  { label: "Sheraton / Nasr City", min: 300, max: 650 },
  { label: "Downtown Cairo", min: 200, max: 550 },
];

export default function OfficeRentalPricesCairo2026Guide() {
  return (
    <GuideLayout guide={guide} wordCount={WORD_COUNT}>
      <p className="lead">
        Office rents in Cairo range from about{" "}
        <HighlightNumber>EGP 200 per square meter per month</HighlightNumber>{" "}
        in older Downtown buildings to{" "}
        <HighlightNumber>EGP 1,400 per square meter per month</HighlightNumber>{" "}
        for prime shell-and-core space in New Cairo's Fifth Settlement. This
        guide breaks down what you'll actually pay across every major business
        district in 2026 — what drives the differences, and where PLACES is
        seeing the best value right now.
      </p>

      <StatCallout
        value="EGP 200 – 1,400"
        label="The Cairo office rental spread, 2026"
        caption="Per m² per month, shell-and-core, exclusive of maintenance and VAT. The 7× gap between low and high is one of the widest in any MENA city market."
      />

      <p>
        A quick note on how we're using numbers: the ranges below are real
        2026 asking rents for administrative office space —{" "}
        <strong>not serviced or coworking</strong>, and not retail. Every
        number is for a shell-and-core or lightly-finished unit, exclusive of
        maintenance fees, VAT, and utilities. Where a district trades in USD
        (which happens for prime premises let by international-standard
        developers), we've converted at{" "}
        <HighlightNumber>~EGP 48/USD</HighlightNumber>.
      </p>

      <h2 id="quick-reference">Rent ranges at a glance</h2>

      <p>
        Six districts, one chart — sorted from most to least expensive so you
        can eyeball your options in seconds. The wider the bar, the wider the
        real-world spread within that district.
      </p>

      <PriceRangeBar rows={DISTRICT_PRICES} unit="EGP / m² / month" />

      <p>
        And if you need the full table with USD equivalents and typical unit
        sizes:
      </p>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>District</th>
              <th>Rent (EGP/m²/month)</th>
              <th>Rent (USD/m²/month)</th>
              <th>Typical unit size</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>New Cairo (Fifth Settlement)</td>
              <td>700 – 1,400</td>
              <td>$15 – $29</td>
              <td>80 – 500 m²</td>
            </tr>
            <tr>
              <td>Sheikh Zayed / West Cairo</td>
              <td>500 – 1,100</td>
              <td>$10 – $23</td>
              <td>90 – 400 m²</td>
            </tr>
            <tr>
              <td>6th of October City</td>
              <td>350 – 750</td>
              <td>$7 – $16</td>
              <td>100 – 600 m²</td>
            </tr>
            <tr>
              <td>Downtown Cairo</td>
              <td>200 – 550</td>
              <td>$4 – $11</td>
              <td>60 – 300 m²</td>
            </tr>
            <tr>
              <td>Sheraton / Nasr City</td>
              <td>300 – 650</td>
              <td>$6 – $14</td>
              <td>80 – 350 m²</td>
            </tr>
            <tr>
              <td>Maadi</td>
              <td>400 – 900</td>
              <td>$8 – $19</td>
              <td>70 – 400 m²</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: "0.85rem", color: "#64748B" }}>
        Ranges reflect Q3 2026 asking rents for administrative office space
        (shell-and-core or lightly-finished). Serviced offices trade at a
        premium of 40–70% over the top of these ranges.
      </p>

      <h2 id="new-cairo">New Cairo (Fifth Settlement)</h2>

      <GuideImage
        src="/images/cairo-festival-city.webp"
        alt="Cairo Festival City Business Park, New Cairo"
        caption="Cairo Festival City Business Park — anchor of New Cairo's prime price band at ~EGP 1,100–1,400/m² per month."
      />

      <p>
        <strong>The premium district.</strong> Egypt's most sought-after
        office market in 2026 — and where PLACES sees the strongest tenant
        demand. Prime buildings in Waterway, Cairo Festival City Business
        Park, and the CBD spine along the 90th Street commercial belt
        command <HighlightNumber>EGP 1,100 – 1,400 per m²</HighlightNumber>,
        with international-standard shell-and-core units in newer towers
        pushing the top of that range.
      </p>

      <p>
        Older or smaller admin buildings — think converted floors above
        street-level retail on 90th Street or in the First Settlement — rent
        from around <HighlightNumber>EGP 700</HighlightNumber>. That's the
        entry point for a business that wants a New Cairo address without
        paying prime rates.
      </p>

      <p>
        <strong>What drives the premium:</strong> proximity to residential
        catchment (Fifth Settlement is where most senior decision-makers
        live), road access via the Ring Road and Suez Road, and building
        quality — most stock is post-2015 with proper HVAC, elevators, and
        parking ratios of ~1 space per 40 m² of leased area.
      </p>

      <KeyInsight label="Watch out">
        Prime buildings quote all-in figures that include maintenance, but
        many landlords have raised service charges{" "}
        <HighlightNumber>15–25%</HighlightNumber> over 2025 rates — so
        confirm the split before signing. PLACES generally negotiates a
        service-charge cap into new leases at this price point.
      </KeyInsight>

      <h2 id="sheikh-zayed">Sheikh Zayed & West Cairo</h2>

      <GuideImage
        src="/images/Sheikh-zayed.jpg"
        alt="Sheikh Zayed business district"
        caption="Sheikh Zayed has closed most of the price gap with New Cairo — prime rents now sit at EGP 900–1,100/m², roughly 15–20% behind Fifth Settlement."
      />

      <p>
        <strong>The tech and corporate hub of West Cairo.</strong> Sheikh
        Zayed has closed most of the price gap with New Cairo over the past
        three years, driven by tech tenants who wanted campus-style
        buildings closer to Sheikh Zayed and 6th October residential stock.
        Prime rents in{" "}
        <strong>SODIC West, Beverly Hills Business Park, and Zed West</strong>{" "}
        now sit at <HighlightNumber>EGP 900 – 1,100 per m²</HighlightNumber>,
        roughly 15–20% behind New Cairo prime.
      </p>

      <p>
        The mid-market — small business parks along the 26th of July axis
        and the Cairo–Alex road exit — offers substantially more space for
        the money: <HighlightNumber>EGP 500 – 750</HighlightNumber> gets you
        a decent shell unit in a low-rise building with parking. That's
        where most SMB tenants land.
      </p>

      <p>
        <strong>Positioning:</strong> pick Sheikh Zayed if your team lives
        west (Zayed / October / Sheikh Zayed North Extensions), if your
        clients are in the Alexandria corridor, or if you want lower rents
        without giving up modern-building quality.
      </p>

      <h2 id="6th-october">6th of October City</h2>

      <GuideImage
        src="/images/October Plaza Business District.webp"
        alt="October Plaza Business District, 6th of October City"
        caption="6th of October's newer business parks — where you get the most square meters per pound in Greater Cairo, at EGP 350–750/m²."
      />

      <p>
        <strong>The value district.</strong> 6th October is where you get
        the most square meters per pound in Greater Cairo — with the
        trade-off of being furthest from the New Cairo / Downtown / Nasr
        City decision-maker corridor.
      </p>

      <p>
        Rents span <HighlightNumber>EGP 350 – 750 per m²</HighlightNumber>,
        with the higher end reflecting newer buildings in the Central Axis
        (near Mall of Arabia) and larger business parks like{" "}
        <strong>
          O West Business Park and 6th of October Central Business District
        </strong>
        . Older stock in the industrial pockets (which get quoted as
        "administrative" but are really warehouse conversions) trades below
        EGP 350.
      </p>

      <p>
        <strong>Best fit for:</strong> back-office operations, call centers,
        logistics coordination, factories that need attached admin floors,
        and cost-sensitive corporates that don't need a prime address to
        close deals.
      </p>

      <h2 id="downtown-cairo">Downtown Cairo</h2>

      <GuideImage
        src="/images/downtown-cairo.jpg"
        alt="Downtown Cairo architecture"
        caption="Downtown Cairo — restored Belle Époque stock in Garden City and Zamalek still commands EGP 450–550/m², while older CBD buildings drop as low as EGP 200/m²."
      />

      <p>
        <strong>The cheapest quality office rents in Greater Cairo</strong>{" "}
        — but with an asterisk. Downtown covers a wide spread from{" "}
        <strong>Garden City and Zamalek</strong> (still command{" "}
        <HighlightNumber>EGP 450 – 550 per m²</HighlightNumber> for restored
        Belle Époque stock) down to older buildings in the CBD around Kasr
        El Nil and Talaat Harb, where rents can drop as low as{" "}
        <HighlightNumber>EGP 200 – 300</HighlightNumber>.
      </p>

      <p>
        The catch: Downtown stock is mostly pre-1970 and has real constraints
        — no dedicated parking (street parking only, and it's brutal),
        narrow elevators, single-phase power in many buildings, and
        structural quirks that limit fit-out flexibility. For a law firm or
        a small consultancy that wants a prestigious address in a period
        building, Downtown works beautifully. For a 30-person tech team with
        racks of gear, it doesn't.
      </p>

      <KeyInsight label="Watch out">
        Lease structures in Downtown often include a "furniture" clause that
        inflates the effective rent by <HighlightNumber>20–30%</HighlightNumber>
        {" "}
        — common in older buildings owned by families rather than
        institutional landlords. Always ask for the naked-rent breakdown.
      </KeyInsight>

      <h2 id="sheraton-nasr-city">Sheraton & Nasr City</h2>

      <p>
        <strong>The airport-adjacent play.</strong> Sheraton — technically
        Al-Nozha and Heliopolis Extension — is the district for businesses
        that need to be close to Cairo International. Rents run{" "}
        <HighlightNumber>EGP 300 – 650 per m²</HighlightNumber>, with newer
        buildings on Al-Nozha Road and around the Sheraton and JW Marriott
        commanding the top of the range.
      </p>

      <p>
        Nasr City proper (Abbas El Akkad, Makram Ebeid, City Stars axis)
        overlaps in price but attracts a different tenant profile —
        retail-adjacent office space, medical practices, and back-office for
        the CBD-headquartered banks.
      </p>

      <p>
        <strong>Best fit for:</strong> aviation, logistics, MENA regional
        HQs where visiting executives fly in monthly, and businesses whose
        client base sits east of the ring.
      </p>

      <h2 id="maadi">Maadi</h2>

      <GuideImage
        src="/images/Maadi.jpg"
        alt="Maadi tree-lined streets"
        caption="Maadi's residential character carries through to its office market — near-zero large floorplates, mostly villa conversions, rents from EGP 400–900/m²."
      />

      <p>
        <strong>The niche high-end district.</strong> Maadi supplies a small
        but loyal office market — mostly NGOs, embassies' economic sections,
        professional services, and businesses whose founders live in Old
        Maadi. Rents run <HighlightNumber>EGP 400 – 900 per m²</HighlightNumber>,
        with the premium end (Cornich El Nil and Road 9) pulling closer to
        New Cairo pricing than the tree-lined residential streets.
      </p>

      <p>
        Supply is very tight — Maadi has near-zero large-floorplate
        buildings, so most stock is villa conversions or small blocks. If
        you need more than <HighlightNumber>~250 m²</HighlightNumber> of
        contiguous space, expect a long search.
      </p>

      <h2 id="pricing-mechanics">How Cairo office pricing actually works</h2>

      <p>
        A few things that surprise most first-time office tenants in Cairo:
      </p>

      <ul>
        <li>
          <strong>Rents are usually quoted per square meter per month, not
          per year.</strong> The annual figure is 12× the quoted rate, so an
          EGP 800/m²/month unit at 200 m² is{" "}
          <HighlightNumber>EGP 1.92 million per year</HighlightNumber>.
        </li>
        <li>
          <strong>USD-denominated leases are common in prime buildings.</strong>{" "}
          Landlords in New Cairo and prime Sheikh Zayed often quote in USD
          to hedge against EGP devaluation, then convert to EGP monthly at
          the day-of-payment rate. This shifts FX risk to the tenant —
          negotiate a fixed exchange rate or a cap.
        </li>
        <li>
          <strong>Escalation clauses are near-universal.</strong> Most Cairo
          office leases include an annual escalation of{" "}
          <HighlightNumber>5–12%</HighlightNumber> baked into the contract.
          A "cheap" rent with 12% escalation compounds fast — verify the
          effective 3-year and 5-year totals before signing.
        </li>
        <li>
          <strong>Service charges are quoted separately.</strong> Expect{" "}
          <HighlightNumber>EGP 40–120 per m²</HighlightNumber> on top of
          rent for maintenance, security, elevators, and common-area
          cleaning. Prime buildings quote the higher end. Always confirm
          what's included.
        </li>
      </ul>

      <PullQuote attribution="PLACES advisory team, 2026">
        The tenants who win in Cairo are the ones who read the total 3-year
        cost — not the sticker rent. Escalation clauses and uncapped service
        charges account for more nasty surprises than any other line item.
      </PullQuote>

      <h2 id="what-drives-price-differences">
        What actually drives the price differences
      </h2>

      <p>
        Beyond the district-level averages, four factors set your final rent
        within a district:
      </p>

      <ol>
        <li>
          <strong>Building age.</strong> A 2022 building at the same address
          as a 2005 one rents{" "}
          <HighlightNumber>20–35% higher</HighlightNumber>, all else equal.
        </li>
        <li>
          <strong>Floor plate.</strong> Bigger floor plates (500+ m²) trade
          at a per-meter discount versus smaller units (~80 m²) because
          fewer tenants can absorb them.
        </li>
        <li>
          <strong>Fit-out state.</strong> Fully finished furnished units
          command a premium of{" "}
          <HighlightNumber>40–70%</HighlightNumber> over shell-and-core, but
          that premium disappears if you have specific requirements the
          existing fit-out doesn't match.
        </li>
        <li>
          <strong>Parking allocation.</strong> Buildings with dedicated
          parking (rather than shared or street) command{" "}
          <HighlightNumber>10–15% higher</HighlightNumber> rents. In New
          Cairo and Sheikh Zayed this is table stakes; in Downtown it's
          almost never available.
        </li>
      </ol>

      <h2 id="what-to-do-next">What to do next</h2>

      <p>If you're actively looking, three practical next steps:</p>

      <ol>
        <li>
          <strong>
            <Link href="/listings">Browse current PLACES listings</Link>
          </strong>{" "}
          filtered to your district and budget. Rent asking prices are right
          on the card.
        </li>
        <li>
          <strong>
            Read our companion guide on{" "}
            <Link href="/guides/how-to-rent-office-cairo">
              how to actually rent an office in Cairo
            </Link>
          </strong>{" "}
          — the process, the negotiation levers, and the mistakes to avoid.
        </li>
        <li>
          <strong>
            <Link href="/contact">Talk to a PLACES advisor</Link>
          </strong>{" "}
          — tell us your size, budget, and district preferences and we'll
          send back a short-list of actual buildings that fit. There's no
          fee for <Link href="/services/tenant-representation">tenant representation</Link>.
        </li>
      </ol>

      <p>
        Prices update whenever the Egyptian pound moves or a large
        speculative building delivers into a district. We refresh this guide
        quarterly — last update:{" "}
        <strong>August 2026</strong>.
      </p>
    </GuideLayout>
  );
}
