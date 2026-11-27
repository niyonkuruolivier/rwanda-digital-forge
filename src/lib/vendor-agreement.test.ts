import { describe, expect, it } from "vitest";
import { VENDOR_TERMS, snapshotAgreement, validateAgreement, type AgreementDraft } from "./vendor-agreement";
import { reviewApplication, type VendorApplication } from "./admin";
import { VENDORS } from "./data";
const draft: AgreementDraft = { registrationNumber: "REG-123", tin: "TIN-456", certificate: { name: "rdb.pdf", data: "data:application/pdf;base64,JVBERi0=", mime: "application/pdf" }, signedName: "Olivier", signedDate: "2026-11-14", accepted: Object.fromEntries(VENDOR_TERMS.map((t) => [t.id, true])) };
describe("vendor agreement requirements", () => {
  it("requires an RDB registered name", () => { expect(validateAgreement({ ...draft, registrationNumber: "" }, "2026-11-14")).toBeTruthy(); });
  it("requires a TIN", () => { expect(validateAgreement({ ...draft, tin: "" }, "2026-11-14")).toBeTruthy(); });
  it("requires an RDB certificate", () => { expect(validateAgreement({ ...draft, certificate: undefined }, "2026-11-14")).toBeTruthy(); });
  it("requires the vendor to accept responsibility for all delivery", () => {
    expect(validateAgreement({ ...draft, accepted: { ...draft.accepted, delivery: false } }, "2026-11-14")).toBe("Tick every agreement condition before submitting.");
    expect(validateAgreement({ ...draft, accepted: { ...draft.accepted, delivery: true } }, "2026-11-14")).toBeUndefined();
    expect(snapshotAgreement(draft, "2026-11-14T00:00:00Z").accepted.delivery).toBe(true);
  });
  for (const id of ["commission", "earnings", "hold", "complaints", "qualification", "service", "retention"] as const) it(`requires separate acceptance of ${id}`, () => { expect(validateAgreement({ ...draft, accepted: { ...draft.accepted, [id]: false } }, "2026-11-14")).toBeTruthy(); });
  it("requires a signed name", () => { expect(validateAgreement({ ...draft, signedName: " " }, "2026-11-14")).toBeTruthy(); });
  it("requires a valid signing date", () => { expect(validateAgreement({ ...draft, signedDate: "" }, "2026-11-14")).toBeTruthy(); expect(validateAgreement({ ...draft, signedDate: "2026-02-30" }, "2026-11-14")).toBeTruthy(); });
  it("accepts a complete signed application", () => { expect(validateAgreement(draft, "2026-11-14")).toBeUndefined(); });
  it("includes the company director and supplied signature for every new applicant", () => {
    for (const signedName of ["Olivier", "Another vendor"]) {
      const agreement = snapshotAgreement({ ...draft, signedName }, "2026-11-14T00:00:00Z");
      expect(agreement.company?.director).toBe("Niyonkuru Olivier");
      expect(agreement.company?.title).toBe("Managing Director");
      expect(agreement.company?.phone).toBe("0784254890");
      expect(agreement.company?.tin).toBe("156708391");
      expect(agreement.company?.signature).toMatch(/\/director-signature\.png$/);
      expect(agreement.company?.stamp).toMatch(/\/company-stamp\.png$/);
    }
  });
  it("keeps the submitted agreement and documents unchanged through admin review", () => {
    const vendor = VENDORS[0]; if (!vendor) throw new Error("Missing vendor");
    const agreement = snapshotAgreement(draft, "2026-11-14T00:00:00Z"); agreement.documentBase64 = "saved-word-bytes";
    const app: VendorApplication = { id: "APP-1", buyerId: "buyer", applicant: draft.signedName, email: "", vendor, agreement, submittedAt: agreement.submittedAt, status: "Pending" };
    const reviewed = reviewApplication(app, "Approved", "2026-11-14T01:00:00Z");
    expect(reviewed.agreement).toEqual(agreement); expect(reviewed.agreement?.documentBase64).toBe("saved-word-bytes");
    expect(agreement.terms).not.toBe(VENDOR_TERMS); expect(agreement.certificate).not.toBe(draft.certificate);
  });
});