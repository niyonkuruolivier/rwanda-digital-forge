import { describe, expect, it } from "vitest";
import { accountAccess, safeAccountReturn } from "./account-access";
describe("Separate account access", () => {
  it("never grants admin to a customer", () => expect(accountAccess([{ role: "buyer", vendor_id: null }])).toEqual({ role: "buyer", vendorId: "" }));
  it("grants admin only for an assigned admin role", () => expect(accountAccess([{ role: "admin", vendor_id: null }]).role).toBe("admin"));
  it("binds a seller to their assigned store", () => expect(accountAccess([{ role: "vendor", vendor_id: "own-store" }])).toEqual({ role: "vendor", vendorId: "own-store" }));
  it("activates the same customer account when approval adds its vendor role", () => {
    const roles: Parameters<typeof accountAccess>[0] = [{ role: "buyer", vendor_id: null }];
    expect(accountAccess(roles).role).toBe("buyer");
    roles.push({ role: "vendor", vendor_id: "approved-store" });
    expect(accountAccess(roles)).toEqual({ role: "vendor", vendorId: "approved-store" });
  });
  it("rejects external sign-in return addresses", () => expect(safeAccountReturn("//evil.example")).toBe("/account"));
});