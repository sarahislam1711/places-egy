import test from "node:test";
import assert from "node:assert/strict";
import { blockingProblems, touchesCheckedFields } from "../server/listing-gate";

const good = { title: "Office for Rent in Mivida | 114 SQM | Finished", area_sqm: 114, price: 68_400, price_per_meter: 600, currency: "EGP", transaction_type: "rent", furnishing: "finished" };

test("a consistent listing may be saved", () => {
  assert.deepEqual(blockingProblems(good), []);
});

test("a USD amount saved as EGP is refused with the fix in the message", () => {
  const p = blockingProblems({ ...good, area_sqm: 450, price: 20_250, price_per_meter: null, title: "Office for Rent in X | 450 SQM | Finished", description: "$45 / SQM" });
  assert.equal(p.length, 1);
  assert.match(p[0], /Set currency to USD/);
});

test("an unpriced extra area is refused", () => {
  assert.equal(blockingProblems({ ...good, outdoor_area_sqm: 30 }).length, 1);
});

test("unrelated edits are not re-checked, price edits are", () => {
  assert.equal(touchesCheckedFields({ status: "available", images: [] }), false);
  assert.equal(touchesCheckedFields({ price: 1 }), true);
  assert.equal(touchesCheckedFields({ currency: "USD" }), true);
});

import { humanizeError } from "../client/src/lib/error-messages";

test("a refusal containing 401 or 429 is shown as is, not as a session or rate-limit error", () => {
  const msg = "Listing not saved. price is too low for the area: If 401 is the rate per m², the monthly rent is 1,429 EGP/month | currency missing: Choose EGP or USD";
  const out = humanizeError(msg);
  assert.doesNotMatch(out, /session expired|Too many requests/);
  assert.match(out, /price is too low for the area/);
  assert.match(out, /\ncurrency missing/);
});
