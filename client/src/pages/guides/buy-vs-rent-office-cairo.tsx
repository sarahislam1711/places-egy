import { Link } from "wouter";
import { GuideLayout } from "@/components/guides/GuideLayout";
import {
  HighlightNumber,
  StatCallout,
  KeyInsight,
  PullQuote,
  ComparisonPanel,
  GuideImage,
} from "@/components/guides/GuideElements";
import { findGuide } from "@/lib/guides";

const guide = findGuide("buy-vs-rent-office-cairo")!;

const WORD_COUNT = 1950;

export default function BuyVsRentOfficeCairoGuide() {
  return (
    <GuideLayout guide={guide} wordCount={WORD_COUNT}>
      <p className="lead">
        For Cairo office space in 2026, <strong>renting is the right
        call for most businesses under 50 people</strong>, and{" "}
        <strong>buying starts to make financial sense past a 5–7 year
        holding period</strong> if you have the capital. But the
        decision isn't just financial. This guide walks through the
        real trade-offs, the break-even math with current 2026 numbers,
        and the four situations where owning wins outright.
      </p>

      <StatCallout
        value="~4 years"
        label="Break-even point in a stable Cairo market"
        caption="Ownership starts winning against renting somewhere around year 4 on a prime New Cairo unit — but only if the down-payment capital wasn't better deployed in your operating business."
      />

      <h2 id="tldr">TL;DR</h2>

      <ComparisonPanel
        left={{
          label: "Rent if",
          points: [
            "You're growing fast and don't know your 3-year headcount",
            "Capital would earn more deployed in the operating business",
            "Your district commitment is still uncertain",
            "You want break-clause optionality mid-lease",
          ],
        }}
        right={{
          label: "Buy if",
          tone: "accent",
          points: [
            "Stable 50+ person team, 7+ year holding view",
            "Excess capital not better deployed in the business",
            "Long-term commitment to a specific district",
            "You need deep customisation of the space",
          ],
        }}
      />

      <h2 id="financial-comparison">The financial comparison</h2>

      <p>
        Let's use a real 2026 example — a 300 m² office in a decent
        Sheikh Zayed business park.
      </p>

      <h3>The rent scenario</h3>

      <ul>
        <li>Asking rent: <HighlightNumber>EGP 750/m²/month</HighlightNumber></li>
        <li>Monthly rent: EGP 225,000</li>
        <li>Service charges: EGP 24,000/month (EGP 80/m²)</li>
        <li>Total monthly outlay: <strong>EGP 249,000</strong></li>
        <li>Annual outlay: <strong>EGP 2.99M</strong></li>
        <li>5-year total (with 8% annual escalation): <strong>~EGP 17.5M</strong></li>
        <li>Fit-out (one-time, amortized over lease): EGP 2.4M</li>
        <li>
          Total 5-year cost:{" "}
          <HighlightNumber>~EGP 19.9M</HighlightNumber>
        </li>
      </ul>

      <h3>The buy scenario</h3>

      <ul>
        <li>
          Purchase price:{" "}
          <HighlightNumber>EGP 24M</HighlightNumber> (~EGP 80,000/m² for
          admin space in this district)
        </li>
        <li>Financing: 40% down (EGP 9.6M), 60% financed (EGP 14.4M)</li>
        <li>Bank rate: <HighlightNumber>22%</HighlightNumber> (typical corporate rate at time of writing)</li>
        <li>Monthly mortgage payment (7-year): ~EGP 380,000</li>
        <li>Service charges: EGP 24,000/month</li>
        <li>Property taxes + insurance: ~EGP 8,000/month</li>
        <li>Total monthly outlay: <strong>EGP 412,000</strong></li>
        <li>Fit-out: EGP 2.4M</li>
        <li>
          5-year total cash outlay:{" "}
          <HighlightNumber>~EGP 27.3M</HighlightNumber> — significantly
          higher than renting.
        </li>
      </ul>

      <h3>But then you own an asset</h3>

      <p>
        The buy scenario ends year 5 with:
      </p>

      <ul>
        <li>An asset worth ~EGP 34M (assuming 7% annual appreciation, historically conservative for Cairo prime admin space)</li>
        <li>Remaining loan balance: ~EGP 8.5M</li>
        <li><strong>Net equity: ~EGP 25.5M</strong></li>
      </ul>

      <p>
        Compared to renting, the buy scenario is <strong>~EGP 17.6M
        ahead</strong> at end of year 5 in equity terms (EGP 25.5M asset
        minus EGP 7.4M higher outlay). The break-even flips positive
        around <strong>year 4</strong> in a stable market.
      </p>


      <KeyInsight label="The 5-year gap">
        The buy scenario ends year 5 roughly{" "}
        <HighlightNumber>EGP 17.6M ahead</HighlightNumber> in equity terms
        — but only if that <HighlightNumber>EGP 9.6M</HighlightNumber> down
        payment wouldn't have earned more compounding inside your operating
        business. That's the real trade-off.
      </KeyInsight>

      <h2 id="the-catch">The catch: opportunity cost</h2>

      <p>
        The calculation above ignores what the EGP 9.6M down payment
        could have earned in the business. If that capital deployed
        into the operating business at even a 25% ROI (a modest number
        for a growing SMB), the equivalent 5-year return is ~EGP 29M —
        more than the property equity gain.
      </p>

      <p>
        This is the real trade-off: buying an office locks up capital
        that could otherwise fund hiring, marketing, inventory, or
        product development. For a business that is capital-constrained
        or growth-limited, renting is almost always the right call —
        even when the "buy math" looks favorable.
      </p>

      <h2 id="when-buying-wins">The four situations where buying wins outright</h2>

      <h3>1. You have excess capital that isn't better deployed elsewhere</h3>

      <p>
        Mature businesses with strong cash flows and a saturated
        addressable market can generate more shareholder value by
        acquiring real assets than by reinvesting in the operating
        business. Cairo prime admin real estate has been a strong
        inflation hedge — historically outperforming EGP-denominated
        deposits and bonds. If your alternative is EGP in a bank
        account, buying office space is a better inflation hedge.
      </p>

      <h3>2. Your team + district commitment is locked in for 7+ years</h3>

      <p>
        A law firm founded in Zamalek that's been there for 20 years is
        never leaving Zamalek. A family business whose founders bought
        into a district decades ago has near-zero mobility. In those
        cases, renting is just paying someone else to hold your
        headquarters — and buying flips the equation.
      </p>

      <h3>3. You want to fully control the space and fit-out</h3>

      <p>
        Owners can do things tenants can't — knock walls, add mezzanine
        floors, install industrial-scale server rooms, replace the HVAC.
        For businesses whose operations require heavy customization
        (data centers, specialty medical practices, high-end
        professional services with brand-critical interiors), ownership
        is the only viable path. Landlords rarely approve deep changes,
        and even when they do, the tenant pays for improvements they
        don't own.
      </p>

      <h3>4. You want the rental income optionality</h3>

      <p>
        Buying a floor plate larger than you need today lets you sublet
        the excess space and grow into it later. This is a common
        pattern with family businesses: buy a full floor, occupy half,
        rent out the other half at market rates. When you need to
        expand, the sublet ends and you take the space back. This
        strategy only works if you have the capital AND a district you're
        committed to.
      </p>

      <h2 id="when-renting-wins">The three situations where renting wins outright</h2>

      <h3>1. You're growing fast and don't know your 3-year size</h3>

      <p>
        Uncertainty is expensive to own around. A business that might
        double or halve in 18 months can't afford to be locked into
        a specific floor plate. Rental leases with break clauses give
        you the flexibility to right-size — buying doesn't.
      </p>

      <h3>2. Your capital is better deployed in the business</h3>

      <p>
        If a marginal EGP 1M in the business generates EGP 300,000+ in
        annual profit, and the same EGP 1M in real estate generates
        7–10% annual returns, the business is the higher-value
        deployment. This is the case for almost every business under
        50 people.
      </p>

      <h3>3. You want optionality on district + building</h3>

      <p>
        Cairo's office market is dynamic — new developments come online,
        new districts emerge (10th of Ramadan City is starting to see
        credible admin buildings, for example), and the "prime" district
        for your business today may not be prime in 5 years. Renting
        preserves the option to move; buying commits you.
      </p>

      <PullQuote>
        The right answer for most Cairo businesses under 50 people is
        rent. The right answer for most family businesses with capital on
        the books and a district they've been in for 20+ years is buy.
        Everyone else lives in the middle.
      </PullQuote>

      <h2 id="hybrid">The hybrid model: rent core, buy the trophy</h2>

      <p>
        A pattern we're seeing more of in 2026: businesses rent their
        working office space in a prime district, then separately buy a
        smaller "trophy" space — typically a Zamalek villa or Downtown
        Belle Époque floor — for founder use, board meetings, and
        client dinners. The trophy space serves brand + status; the
        rented office serves headcount.
      </p>

      <p>
        This model unlocks the reputational upside of ownership
        without over-committing capital to a large operational
        footprint. Not for everyone, but worth considering for
        professional services firms whose brand rests on prestigious
        addresses.
      </p>

      <h2 id="egyptian-specifics">Egyptian-specific factors</h2>

      <p>
        A few things that are specific to Cairo and worth knowing:
      </p>

      <ul>
        <li>
          <strong>EGP inflation.</strong> Egyptian pound inflation has
          been 15–35% annually across most of the past decade, which is
          why real estate ownership has historically outperformed
          bank deposits. This favors buying if you're bullish on EGP
          weakness continuing.
        </li>
        <li>
          <strong>Corporate financing rates.</strong> Egyptian bank
          rates for commercial real estate loans have been 20–27% —
          much higher than developed markets. This eats into the
          financial case for buying. If you have the cash to buy
          outright, the math looks much better; if you need to finance
          70%, it barely works.
        </li>
        <li>
          <strong>Registration + transfer costs.</strong> Buying an
          office incurs registration fees (~2.5% of purchase price)
          plus a transfer stamp tax. Budget an additional 3–4% on top
          of the purchase price for closing costs.
        </li>
        <li>
          <strong>Property tax.</strong> Egypt's property tax on
          commercial real estate is modest — about 10% of "rental
          value" as assessed by the government, which is typically far
          below market. Practically, this is EGP 15,000 – 60,000 per
          year for the size of office we're discussing.
        </li>
      </ul>

      <h2 id="what-to-do-next">What to do next</h2>

      <p>
        Whether you're leaning rent or buy, the next step is the same:
        get real numbers for buildings that fit your requirements.
      </p>

      <ol>
        <li>
          <Link href="/listings">
            Browse PLACES listings
          </Link>{" "}
          — both rental and sale — filtered by your target district.
        </li>
        <li>
          Read our{" "}
          <Link href="/guides/office-rental-prices-cairo-2026">
            2026 rental prices guide
          </Link>{" "}
          to benchmark the rent side of the equation.
        </li>
        <li>
          <Link href="/contact">
            Talk to a PLACES advisor
          </Link>{" "}
          — we handle both rental and sale transactions and can build
          you a proper financial model for your specific situation.
        </li>
      </ol>

      <p>
        There's no fee for the analysis — we make money on the
        transaction, not on the advice.
      </p>
    </GuideLayout>
  );
}
