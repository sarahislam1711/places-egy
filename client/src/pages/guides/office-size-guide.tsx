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

const guide = findGuide("office-size-guide")!;

const WORD_COUNT = 1620;

export default function OfficeSizeGuidePage() {
  return (
    <GuideLayout guide={guide} wordCount={WORD_COUNT}>
      <p className="lead">
        A simple rule of thumb: <strong>plan for{" "}
        <HighlightNumber>8–12 m² per full-time employee</HighlightNumber>{" "}
        in Cairo</strong>. That covers workstations, meeting rooms,
        kitchen, reception, and circulation. But the useful version of
        this question depends on your role mix, meeting density, and
        hybrid ratio. This guide gives you the sizing table PLACES uses
        with real clients.
      </p>

      <StatCallout
        value="8 – 12 m²"
        label="Per full-time employee, all-in"
        caption="Below 8 = your team feels cramped and starts leaving. Above 14 = you're overpaying rent for space that doesn't earn its keep."
      />

      <h2 id="the-formula">The formula</h2>

      <p>
        For a Cairo office in 2026, calculate total space needed as:
      </p>

      <div
        style={{
          background: "#F8F5F1",
          border: "1px solid #EAE4DA",
          borderRadius: "12px",
          padding: "20px 24px",
          fontFamily: "monospace",
          fontSize: "0.95rem",
          margin: "1.5rem 0",
        }}
      >
        Total m² = <br />
        &nbsp;&nbsp;(workstation seats × m² per seat) +<br />
        &nbsp;&nbsp;meeting room space +<br />
        &nbsp;&nbsp;shared amenities +<br />
        &nbsp;&nbsp;15–20% circulation
      </div>

      <p>
        The variables depend on your role mix and how open your layout
        is. Let's break each one down.
      </p>

      <h2 id="workstation-space">Workstation space per seat</h2>

      <p>
        In Cairo offices, per-seat allocations typically fall into
        three tiers:
      </p>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Layout type</th>
              <th>m² per seat</th>
              <th>Best for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dense open-plan (bench desks)</td>
              <td>4 – 5</td>
              <td>Tech, call centers, junior teams</td>
            </tr>
            <tr>
              <td>Standard open-plan (individual desks)</td>
              <td>5.5 – 7</td>
              <td>Most corporate offices, professional services</td>
            </tr>
            <tr>
              <td>Cubicles / semi-private</td>
              <td>7 – 9</td>
              <td>Financial services, government-adjacent</td>
            </tr>
            <tr>
              <td>Private offices (mid-level)</td>
              <td>9 – 14</td>
              <td>Law firms, consulting partners</td>
            </tr>
            <tr>
              <td>Corner offices (senior)</td>
              <td>18 – 30</td>
              <td>C-suite, senior partners</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        These figures are for the workstation footprint plus immediately
        adjacent circulation — they don't include meeting rooms, kitchen,
        or reception, which come next.
      </p>


      <GuideImage
        src="/images/general-office.jpg"
        alt="Modern open-plan office with rows of desks"
        caption="Standard open-plan at ~6 m² per seat — the sweet spot most Cairo corporates land at, balancing density with tolerable acoustic + circulation quality."
      />

      <h2 id="meeting-rooms">Meeting rooms</h2>

      <p>
        The standard Cairo benchmark:
      </p>

      <ul>
        <li>
          <strong>4-person huddle room</strong> — 8–10 m² each. Need
          1 per 12–15 workstations.
        </li>
        <li>
          <strong>6-person meeting room</strong> — 14–18 m² each. Need
          1 per 25 workstations.
        </li>
        <li>
          <strong>10-person conference room</strong> — 25–35 m² each.
          Need 1 for offices over 25 people.
        </li>
        <li>
          <strong>Boardroom</strong> — 40–60 m². Need 1 for offices with
          C-suite presence.
        </li>
      </ul>

      <p>
        For a modern hybrid office where 60–70% of the team is in on
        any given day, you need MORE meeting rooms proportionally than
        the old benchmarks — because in-office days concentrate
        collaborative work, and video calls require enclosed spaces
        to avoid interrupting open-plan neighbors.
      </p>

      <h2 id="shared-amenities">Shared amenities</h2>

      <p>
        A Cairo office typically needs:
      </p>

      <ul>
        <li>
          <strong>Reception</strong> — 8–20 m² depending on client-facing
          intensity. Law firms and consultancies budget more; back-office
          operations can skip a dedicated reception.
        </li>
        <li>
          <strong>Kitchen / pantry</strong> — 8–15 m² for teams up to 30,
          scaling to 20–30 m² for 30+ teams. Include space for a fridge,
          coffee setup, water dispenser, microwave, and 4–6 people to
          congregate.
        </li>
        <li>
          <strong>Storage / server room</strong> — 5–10 m² baseline, more
          if you have physical archives or on-premise servers.
        </li>
        <li>
          <strong>Break-out / lounge</strong> — 15–25 m² for teams that
          value informal collaboration space. Optional but increasingly
          expected by younger tenants.
        </li>
        <li>
          <strong>Restrooms.</strong> Buildings vary — some include
          shared floor restrooms in the common areas, some require
          you to build within your unit. Budget 3–5 m² per restroom,
          minimum 2 (one M, one F) for teams under 15.
        </li>
      </ul>

      <h2 id="circulation">Circulation</h2>

      <p>
        You can't use every square meter. Corridors, awkward corners,
        walkways to shared amenities — realistic circulation overhead
        is <strong>15–20% of total floor area</strong>. Dense open-plan
        can hit 12%; heavily-partitioned layouts run 20–25%.
      </p>

      <h2 id="worked-example">Worked example: a 30-person office</h2>

      <p>
        Let's size an office for a typical 30-person professional
        services firm in Cairo:
      </p>

      <ul>
        <li>25 open-plan workstations × 6 m² = <strong>150 m²</strong></li>
        <li>5 private offices × 12 m² = <strong>60 m²</strong></li>
        <li>2 huddle rooms × 9 m² = <strong>18 m²</strong></li>
        <li>1 meeting room × 16 m² = <strong>16 m²</strong></li>
        <li>1 conference room × 30 m² = <strong>30 m²</strong></li>
        <li>Reception = <strong>15 m²</strong></li>
        <li>Kitchen = <strong>14 m²</strong></li>
        <li>Storage + server = <strong>8 m²</strong></li>
        <li>Break-out lounge = <strong>18 m²</strong></li>
        <li>Restrooms (built within unit) = <strong>10 m²</strong></li>
      </ul>

      <p>
        <strong>Subtotal: 339 m²</strong>. Add 18% circulation:{" "}
        <HighlightNumber>~400 m² total</HighlightNumber> — or about{" "}
        <HighlightNumber>13 m² per person</HighlightNumber>.
      </p>

      <KeyInsight label="Reality check">
        Aggressive hot-desking (below <HighlightNumber>0.7:1</HighlightNumber>{" "}
        seat ratio) works in tech companies where employees expect no fixed
        desks. It usually doesn't work in Egyptian professional services
        firms where senior staff expect assigned space. Size for what your
        culture actually is, not what you wish it were.
      </KeyInsight>

      <p>
        That's for a firm with a reasonable mix of privacy and open-plan.
        A tech company with the same headcount but fully open-plan and
        smaller private offices lands closer to <strong>~280 m² (9 m²
        per person)</strong>.
      </p>

      <h2 id="hybrid-adjustment">Adjusting for hybrid working</h2>

      <p>
        If your team is fully in-office five days a week, the tables
        above give you the right answer. If you're hybrid, you can
        reduce the workstation count while keeping meeting-room and
        amenity counts the same.
      </p>

      <p>
        The common patterns:
      </p>

      <ul>
        <li>
          <strong>1:1 hot-desking (100% seat ratio)</strong> — one seat
          per employee. What most Cairo offices still run.
        </li>
        <li>
          <strong>0.8:1 ratio (80% seats)</strong> — for teams with
          1–2 fixed remote days per week. Cuts space needs ~15%.
        </li>
        <li>
          <strong>0.6:1 ratio (60% seats)</strong> — for aggressive
          hybrid models with 2–3 remote days average. Cuts space ~30%.
          Requires solid meeting-room booking systems and workstation
          reservation software.
        </li>
      </ul>

      <p>
        A word of caution: aggressive hot-desking (below 0.7:1) works
        in tech companies where employees are used to no fixed desks.
        It usually doesn't work in Egyptian professional services
        firms where senior staff expect assigned space. Size for what
        your culture actually is, not what you wish it were.
      </p>

      <h2 id="what-to-do-next">What to do next</h2>

      <p>
        Once you have a rough total, cross-reference against{" "}
        <Link href="/guides/office-rental-prices-cairo-2026">
          Cairo rental prices by district
        </Link>{" "}
        to get an all-in budget. Then:
      </p>

      <ol>
        <li>
          <Link href="/listings">Browse listings</Link> filtered to your
          size range — most Cairo units come in 80, 120, 150, 200, 300,
          and 500+ m² floor plates.
        </li>
        <li>
          Read{" "}
          <Link href="/guides/how-to-rent-office-cairo">
            our rent process guide
          </Link>{" "}
          for what to check on site visits.
        </li>
        <li>
          <Link href="/contact">Talk to a PLACES advisor</Link> — send
          us your headcount and role mix and we'll build you a proper
          space plan.
        </li>
      </ol>
    </GuideLayout>
  );
}
