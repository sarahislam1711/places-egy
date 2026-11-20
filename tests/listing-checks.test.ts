import test from "node:test";
import assert from "node:assert/strict";
import { listingIssues, titleSizes, type CheckableListing } from "../client/src/lib/listing-checks";

const clean: CheckableListing = {
  title: "Office for Rent in Mivida | 114 SQM | Finished",
  description: "A finished office.",
  area_sqm: 114,
  price: 114 * 600,
  price_per_meter: 600,
  currency: "EGP",
  transaction_type: "rent",
  furnishing: "finished",
};
const rules = (l: CheckableListing) => listingIssues(l).map((i) => i.rule);
const blocking = (l: CheckableListing) => listingIssues(l).filter((i) => i.severity === "block");

test("a consistent listing has no issues", () => {
  assert.deepEqual(rules(clean), []);
});

test("USD amount saved as EGP is a blocking issue", () => {
  const l = { ...clean, title: "Office for Rent in X | 450 SQM | Finished", area_sqm: 450, price: 20_250, price_per_meter: null, description: "Rent: $45 / SQM per month" };
  const b = blocking(l);
  assert.equal(b.length, 1);
  assert.equal(b[0].rule, "price is a USD amount saved as EGP");
  assert.equal(b[0].fix, "Set currency to USD");
});

test("the same listing with currency USD is clean", () => {
  const l = { ...clean, title: "Office for Rent in X | 450 SQM | Finished", area_sqm: 450, price: 20_250, price_per_meter: null, currency: "USD", description: "Rent: $45 / SQM per month" };
  assert.deepEqual(blocking(l), []);
});

test("650 + 350 m² title with the outdoor figure in the area field blocks", () => {
  const l = { ...clean, title: "Building for Rent | 650 SQM + 350 SQM Outdoor | Finished", area_sqm: 350, price: 385_000, price_per_meter: 1100, description: "EGP 1,100 / SQM" };
  assert.ok(blocking(l).some((i) => i.rule === "area field isn't the main area from the title"));
});

test("price that includes the outdoor amount blocks (counted twice)", () => {
  const l = { ...clean, area_sqm: 100, price: 100 * 600 + 50 * 300, price_per_meter: 600, outdoor_area_sqm: 50, outdoor_price_per_meter: 300, title: "Office for Rent in X | 100 SQM | Finished" };
  assert.ok(blocking(l).some((i) => i.rule.startsWith("price includes the")));
});

test("extra area with no rate blocks; with rate 0 it does not", () => {
  const base = { ...clean, outdoor_area_sqm: 40 };
  assert.ok(blocking({ ...base, outdoor_price_per_meter: null }).some((i) => i.field === "outdoor_price_per_meter"));
  assert.deepEqual(blocking({ ...base, outdoor_price_per_meter: 0 }), []);
});

test("a rate typed as the total price blocks", () => {
  assert.ok(blocking({ ...clean, price: 600, price_per_meter: null }).some((i) => i.rule.includes("too low")));
});

test("missing currency and empty title parts block", () => {
  assert.ok(blocking({ ...clean, currency: null }).some((i) => i.rule === "currency missing"));
  assert.ok(blocking({ ...clean, title: "Office for Rent in Hyde Park – | Finished" }).some((i) => i.rule === "title has an empty part"));
});

test("titleSizes reads sizes and ranges", () => {
  assert.deepEqual(titleSizes("1,080 SQM"), [1080]);
  assert.deepEqual(titleSizes("500 - 4,500 SQM"), [500, 4500]);
  assert.deepEqual(titleSizes("233 m²"), [233]);
});
