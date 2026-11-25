import { Link } from "wouter";
import { GuideLayout } from "@/components/guides/GuideLayout";
import {
  HighlightNumber,
  StatCallout,
  KeyInsight,
  PullQuote,
  GuideImage,
} from "@/components/guides/GuideElements";
import { findGuide } from "@/lib/guides";

const guide = findGuide("how-to-rent-office-cairo")!;

const WORD_COUNT = 2100;

export default function HowToRentOfficeCairoGuide() {
  return (
    <GuideLayout guide={guide} wordCount={WORD_COUNT}>
      <p className="lead" style={{ fontSize: "1.15rem" }}>
        Renting an office in Cairo is straightforward if you follow a
        clean process — and expensive if you don't. This guide walks
        through the actual 7-step sequence PLACES uses with clients,
        including the four negotiation levers most tenants leave on the
        table.
      </p>

      <p>
        Whether you're a founder taking your first office or a corporate
        real estate lead scaling a Cairo footprint, the process below is
        the one that keeps you from signing a lease you regret twelve
        months in.
      </p>

      <StatCallout
        value="7 steps"
        label="From first requirements list to signed lease"
        caption="Rushing any step compounds cost over the 3–5 year lease. Doing them in order takes 4–8 weeks and typically saves 15–30% on total lease cost through better negotiation."
      />

      <h2 id="step-1-requirements">Step 1: Nail down your requirements</h2>

      <p>
        Every wasted week in the search comes from starting the search
        before defining the target. Before you talk to a single broker,
        write down:
      </p>

      <ul>
        <li>
          <strong>Headcount today, in 12 months, and in 36 months.</strong>{" "}
          Lease terms in Cairo run 3–5 years — plan for the end of the
          lease, not the start.
        </li>
        <li>
          <strong>Total square meters you actually need.</strong> If
          you're not sure, see our{" "}
          <Link href="/guides/office-size-guide">office size guide</Link>{" "}
          which gives m² per employee benchmarks by role type and
          hybrid ratio.
        </li>
        <li>
          <strong>Districts that work.</strong> Where do most of your
          team live? Where are your clients? Where do your customers
          expect a Cairo business to be based? Narrow to 2–3 districts,
          not 6.
        </li>
        <li>
          <strong>Budget — all-in.</strong> Rent per month + service
          charges + utilities + fit-out amortization + parking. A "cheap"
          rent that requires EGP 1.5M of fit-out isn't cheap.
        </li>
        <li>
          <strong>Move-in date.</strong> Cairo landlords rarely negotiate
          on units you need to occupy tomorrow. Six-week runway gives
          you real leverage.
        </li>
        <li>
          <strong>Must-haves vs nice-to-haves.</strong> Dedicated parking?
          Backup generator? Fiber internet? Building certifications?
          List them and mark each MH or NH.
        </li>
      </ul>

      <p>
        Written requirements are what turn a broker from a "send me
        options" salesperson into a filter that only surfaces buildings
        that actually match.
      </p>

      <h2 id="step-2-shortlist-districts">Step 2: Shortlist districts (before buildings)</h2>

      <p>
        Cairo has six real office districts —{" "}
        <Link href="/admin/new-cairo">New Cairo</Link>,{" "}
        <Link href="/admin/sheikh-zayed">Sheikh Zayed</Link>,{" "}
        <Link href="/admin/6th-october">6th of October</Link>,{" "}
        <Link href="/admin/downtown-cairo">Downtown</Link>,{" "}
        <Link href="/admin/sheraton">Sheraton</Link>, and{" "}
        <Link href="/admin/maadi">Maadi</Link>. Each attracts a distinct
        tenant profile, has a distinct price band, and comes with
        distinct trade-offs.
      </p>

      <p>
        Cross-reference your requirements against{" "}
        <Link href="/guides/office-rental-prices-cairo-2026">
          our 2026 district-by-district pricing guide
        </Link>{" "}
        and narrow to 2–3 districts BEFORE you shortlist specific
        buildings. Otherwise you'll waste time comparing units in
        districts that were never a real fit.
      </p>


      <h2 id="step-3-shortlist-buildings">Step 3: Build a proper shortlist</h2>

      <p>
        Aim for <strong>6–10 shortlisted buildings</strong> across your
        target districts. Fewer than 5 and you have no comparison
        pricing power. More than 10 and you'll burn out before you make
        a decision.
      </p>

      <p>
        For each shortlisted building, capture:
      </p>

      <ul>
        <li>Asking rent per m² per month + service charges + currency</li>
        <li>Available floor plate sizes + total available units</li>
        <li>Fit-out state (shell, semi-finished, fully finished)</li>
        <li>Parking allocation (spaces per unit or per m²)</li>
        <li>Building age + last major refurbishment</li>
        <li>
          Escalation clause standard for the building (5% annual vs 12%
          annual makes a huge difference over 5 years)
        </li>
        <li>Landlord type (developer, institutional REIT, family owner)</li>
      </ul>

      <p>
        Landlord type matters more than most tenants realize. Institutional
        landlords in New Cairo enforce their standard leases with less
        flexibility but deliver more consistently. Family landlords in
        Downtown Zamalek negotiate hard but can be unpredictable on
        maintenance and repairs.
      </p>

      <h2 id="step-4-site-visits">Step 4: Site visits — what to actually check</h2>

      <p>
        Visit every shortlisted building in person. Don't rent an office
        from photos. On the visit, check the boring things:
      </p>

      <ul>
        <li>
          <strong>Elevator wait times</strong> at 9 AM and 5 PM. If
          they're 4+ minutes now, they'll be 6+ when the building
          fills.
        </li>
        <li>
          <strong>Ventilation and AC noise.</strong> Central AC systems
          in older buildings often can't cope with dense open-plan
          layouts — walk into an empty unit and listen.
        </li>
        <li>
          <strong>Natural light + views.</strong> Sounds soft but
          predicts staff retention better than most people think.
        </li>
        <li>
          <strong>Restroom quality + count.</strong> One toilet per 15
          people is the practical minimum. Fewer = friction.
        </li>
        <li>
          <strong>Backup generator + fuel arrangements.</strong> Cairo
          has stable grid power in most districts now, but a generator
          contract for outages is standard in prime buildings.
        </li>
        <li>
          <strong>Fiber and telecom infrastructure.</strong> Ask which
          ISPs serve the building. In older stock, expect to add your
          own fiber run at your cost.
        </li>
        <li>
          <strong>Common areas.</strong> Lobbies, reception, corridors —
          if the landlord doesn't maintain the common areas well, don't
          expect them to maintain your unit any better.
        </li>
      </ul>

      <h2 id="step-5-negotiate">Step 5: Negotiate the four levers</h2>

      <p>
        This is where most tenants leave money on the table. The
        headline rent gets all the attention, but four other levers
        move the total cost of the lease by 20–40%.
      </p>

      <GuideImage
        src="/images/general-office.jpg"
        alt="Interior of a Cairo office space during a site visit"
        caption="Site visits are where 80% of the elimination happens. Elevator wait times at 9 AM, HVAC noise in an empty unit, and restroom count tell you more than any brochure."
      />

      <h3>Lever 1: The rent-free period</h3>

      <p>
        Cairo landlords routinely give{" "}
        <HighlightNumber>1–4 months</HighlightNumber> rent-free at the
        start of a lease — but only if you ask. It's the easiest concession
        to win and worth{" "}
        <HighlightNumber>2–7% off the effective rent</HighlightNumber>{" "}
        depending on lease length. Ask for 3 months rent-free on a 3-year
        lease and 4 on a 5-year.
      </p>

      <h3>Lever 2: The annual escalation</h3>

      <p>
        Most landlords quote{" "}
        <HighlightNumber>10–12% annual escalation</HighlightNumber> as
        "standard." It isn't — it's the opening offer. On
        institutional-quality buildings you can typically negotiate down to{" "}
        <HighlightNumber>5–7%</HighlightNumber>. On smaller buildings, the
        escalation is often tied to inflation with a cap. Push for capped
        escalation on any lease longer than 3 years.
      </p>

      <KeyInsight label="High-leverage moment">
        The four negotiation levers — rent-free, escalation, service
        charges, and fit-out contribution — collectively move total
        lease cost by <HighlightNumber>20–40%</HighlightNumber>. Most
        tenants only negotiate the headline rent. Read this section
        twice.
      </KeyInsight>

      <h3>Lever 3: Service charges</h3>

      <p>
        Cap service charges. Most Cairo office leases quote a rate today
        but let the landlord raise it annually with no cap. Get a
        service-charge cap of 8–10% annually written into the contract,
        or negotiate a fixed multi-year rate.
      </p>

      <h3>Lever 4: The fit-out contribution</h3>

      <p>
        On shell-and-core units, most institutional landlords will
        contribute EGP 1,000 – 3,000 per m² toward tenant fit-out for a
        3+ year lease. This isn't advertised — you have to ask. On a
        200 m² unit, that's up to{" "}
        <HighlightNumber>EGP 600,000</HighlightNumber> the landlord pays
        toward your fit-out. This alone often flips the buy-vs-rent
        economics for a growing business (
        <Link href="/guides/buy-vs-rent-office-cairo">
          full analysis here
        </Link>
        ).
      </p>

      <h2 id="step-6-due-diligence">Step 6: Due diligence before signing</h2>

      <p>
        Once you've picked a building and agreed rough commercial terms,
        do the legal + technical due diligence BEFORE signing.
      </p>

      <ul>
        <li>
          <strong>Title verification.</strong> Confirm the landlord
          actually owns the unit. In Egypt this is done through the Real
          Estate Publicity Department. A registered contract of sale
          under the landlord's name is what you're looking for.
        </li>
        <li>
          <strong>Building license + usage classification.</strong>{" "}
          Confirm the building is licensed for "administrative" usage
          (not just residential or commercial retail). A residential
          building rented as office space is at risk of enforcement
          action.
        </li>
        <li>
          <strong>Existing tenant status.</strong> If the unit is
          occupied, confirm the existing tenant's vacate date IN
          WRITING. Cairo landlords sometimes overpromise on vacate
          timelines.
        </li>
        <li>
          <strong>Structural + MEP inspection.</strong> For units over
          200 m² or older buildings, hire an independent surveyor for
          EGP 15,000 – 30,000. They'll flag the things the landlord
          won't tell you.
        </li>
      </ul>

      <h2 id="step-7-sign-and-register">Step 7: Sign and register</h2>

      <p>
        Egyptian commercial leases are enforceable on signature, but
        <strong> tenants should always register the lease</strong> with
        the local notary office (Al-Shahr Al-Aqari). Registration:
      </p>

      <ul>
        <li>Costs approximately 0.5% of the total lease value in fees</li>
        <li>
          Protects the tenant if the landlord tries to sell the building
          — a registered lease survives a change of ownership
        </li>
        <li>
          Provides legal standing in any future dispute over rent,
          maintenance, or eviction
        </li>
      </ul>

      <p>
        Landlords sometimes discourage registration to keep the rental
        income informal. That's exactly why you should insist on it.
      </p>

      <PullQuote attribution="PLACES advisory team">
        The single biggest mistake we see in Cairo commercial leases:
        signing the landlord's standard contract unedited. Every one of
        them is lopsided. Expect to negotiate roughly 20 changes.
      </PullQuote>

      <h2 id="mistakes">Common mistakes to avoid</h2>

      <p>
        Four traps we see in Cairo repeatedly:
      </p>

      <ol>
        <li>
          <strong>Signing the landlord's standard lease unedited.</strong>{" "}
          It will be lopsided in the landlord's favor. Have a lawyer
          review before signing. Expect to negotiate ~20 changes into
          any standard commercial lease.
        </li>
        <li>
          <strong>Overlooking the fit-out timeline.</strong> A shell
          unit takes 8–14 weeks to fit out. If your lease starts on
          signing rather than on handover, you're paying rent on empty
          space. Negotiate a rent-free fit-out period.
        </li>
        <li>
          <strong>Under-budgeting the fit-out.</strong> Cairo fit-out
          costs range from EGP 3,500 – 12,000 per m² depending on
          quality and specification. Full breakdown in{" "}
          <Link href="/guides/office-fit-out-costs-cairo">
            our fit-out cost guide
          </Link>
          .
        </li>
        <li>
          <strong>Signing without a clear break clause.</strong> A
          business that doubles headcount in 18 months needs an out.
          Negotiate a break clause at the 2- or 3-year mark on a 5-year
          lease.
        </li>
      </ol>

      <h2 id="next-steps">Next steps</h2>

      <p>
        If you're actively looking:
      </p>

      <ol>
        <li>
          <Link href="/listings">
            Browse live PLACES office listings
          </Link>{" "}
          filtered by your target district.
        </li>
        <li>
          Read the{" "}
          <Link href="/guides/office-rental-prices-cairo-2026">
            2026 rental prices guide
          </Link>{" "}
          to benchmark asking rents before negotiating.
        </li>
        <li>
          <Link href="/contact">
            Talk to a PLACES advisor
          </Link>{" "}
          — tell us your requirements and we'll drive the process end-to-end.
        </li>
      </ol>

      <p>
        <Link href="/services/tenant-representation">Tenant representation with PLACES is free</Link> — landlords pay our
        fee. That means we're never paid by the same party we're
        negotiating with, which keeps the incentives aligned.
      </p>
    </GuideLayout>
  );
}
