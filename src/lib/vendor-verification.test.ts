import { expect, it } from "vitest";
import { VENDORS } from "./data";
import { canVendorTrade } from "./admin";
import { requireVerificationAdministrator, verifiedVendors } from "./vendor-verification";

it("only administrators can change verification", () => {
  expect(() => requireVerificationAdministrator(false)).toThrow("Administrator access required");
  expect(() => requireVerificationAdministrator(true, new Error("Lookup failed"))).toThrow();
  expect(() => requireVerificationAdministrator(true)).not.toThrow();
});
it("only saved administrator status grants a badge, never a seller profile value", () => {
  const vendor = VENDORS[0];
  if (!vendor) throw new Error("Missing fixture");
  expect(verifiedVendors([{ ...vendor, verified: true }], [])[0]?.verified).toBe(false);
  expect(verifiedVendors([vendor], [{ vendor_id: vendor.id, verified: true }])[0]?.verified).toBe(true);
  expect(verifiedVendors([vendor], [{ vendor_id: vendor.id, verified: false }])[0]?.verified).toBe(false);
});
it("unverified active vendors can still sell", () => {
  const vendor = VENDORS[0];
  if (!vendor) throw new Error("Missing fixture");
  const unverified = verifiedVendors([{ ...vendor, status: "Active" }], [])[0];
  expect(unverified?.verified).toBe(false);
  expect(canVendorTrade(unverified)).toBe(true);
});