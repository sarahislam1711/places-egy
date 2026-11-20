// Run: npm test   (node's built-in test runner, no extra dependencies)
import test from "node:test";
import assert from "node:assert/strict";
import { totalPrice, outdoorAmount, maintenanceArea, extraAreaUnpriced } from "../client/src/lib/listing-pricing";
import { priceInEgp } from "../client/src/lib/currency";

test("price is the indoor price; extra area is added on top", () => {
  const l = { price: 715_000, area_sqm: 650, outdoor_area_sqm: 350, outdoor_price_per_meter: 275 };
  assert.equal(outdoorAmount(l), 96_250);
  assert.equal(totalPrice(l), 811_250);
});

test("no extra area: total equals the typed price", () => {
  assert.equal(totalPrice({ price: 50_000, area_sqm: 100 }), 50_000);
});

test("extra area without a rate adds nothing and is flagged unpriced", () => {
  const l = { price: 100_000, outdoor_area_sqm: 40, outdoor_price_per_meter: null };
  assert.equal(outdoorAmount(l), 0);
  assert.equal(extraAreaUnpriced(l), true);
});

test("a rate of 0 means the extra area is included: priced, adds nothing", () => {
  const l = { price: 100_000, outdoor_area_sqm: 40, outdoor_price_per_meter: 0 };
  assert.equal(extraAreaUnpriced(l), false);
  assert.equal(totalPrice(l), 100_000);
});

test("lump-sum listings add nothing on top", () => {
  const l = { price: 9_000_000, outdoor_area_sqm: 500, outdoor_price_per_meter: 300, price_is_lump_sum: true };
  assert.equal(outdoorAmount(l), 0);
  assert.equal(totalPrice(l), 9_000_000);
});

test("missing or zero price gives a zero total", () => {
  assert.equal(totalPrice({ price: null }), 0);
  assert.equal(totalPrice({ price: 0, outdoor_area_sqm: 10, outdoor_price_per_meter: 5 }), 0);
});

test("maintenance applies to indoor plus extra area", () => {
  assert.equal(maintenanceArea({ area_sqm: 650, outdoor_area_sqm: 350 }), 1000);
  assert.equal(maintenanceArea({ area_sqm: 120 }), 120);
});

test("USD listings convert the all-in total to EGP; EGP listings stay as typed", () => {
  const usd = { price: 20_250, currency: "USD", area_sqm: 450, outdoor_area_sqm: 100, outdoor_price_per_meter: 10 };
  assert.equal(priceInEgp(usd, 50), (20_250 + 1_000) * 50);
  assert.equal(priceInEgp({ price: 80_000, currency: "EGP" }, 50), 80_000);
  assert.equal(priceInEgp({ price: 0, currency: "EGP" }, 50), null);
});
