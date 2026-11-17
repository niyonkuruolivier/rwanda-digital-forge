import { AGREEMENT_COMPANY } from "./agreement-company";
export const AGREEMENT_VERSION = "2026-11-18.1";
export const VENDOR_TERMS = [
  { id: "qualification", title: "Business qualification", text: "I provide my business registration number, TIN and RDB certificate, confirm that the information is accurate, and understand that admin must review and approve my application before my store opens." },
  { id: "commission", title: "Platform share · 13%", text: "I accept that Murandasi Market retains 13% of each completed payment. The buyer pays the item subtotal without an extra platform fee." },
  { id: "earnings", title: "Vendor share · 87%", text: "I accept that my vendor earnings are 87% of each completed payment, subject to holds, complaint decisions and recorded refunds." },
  { id: "hold", title: "Two-day payment hold", text: "My 87% share is held for two days (48 hours) after completed payment. It becomes available earlier if the buyer confirms satisfaction, or automatically after two days if there is no complaint. Only available funds may be requested for withdrawal; requests and successful withdrawals remain in history." },
  { id: "complaints", title: "Complaints stop the money", text: "If the buyer submits a complaint with a photo and written explanation during the hold, the affected purchase's funds stay held and cannot be withdrawn until admin resolves the complaint by releasing funds to the vendor or recording a refund to the buyer. Both vendor and admin can see the complaint." },
  { id: "service", title: "Store and customer responsibilities", text: "I will keep my shop name, location and contact details accurate, list available product sizes, colours and stock truthfully, fulfil purchases and cooperate with complaints. Purchase records retain shop details. Admin may block new purchases and publishing without deleting past purchases or money records." },
  { id: "delivery", title: "Delivery is the vendor’s responsibility", text: "I understand and accept that all delivery is my responsibility as the vendor, not Murandasi Market’s. I must arrange delivery of my products and coordinate delivery details directly with the buyer. Murandasi Market does not provide or manage delivery." },
  { id: "retention", title: "Signed agreement record", text: "I accept that my submitted name, date, business documents and this agreement are retained for the vendor and admin. The saved agreement can be printed and downloaded as a Word document, with no edit or delete control. This demo does not perform real verification, payments, escrow, refunds or withdrawals." },
] as const;
export type TermId = typeof VENDOR_TERMS[number]["id"];
export interface Certificate { name: string; data: string; mime: string }
export interface AgreementDraft { registrationNumber: string; tin: string; certificate?: Certificate | undefined; signedName: string; signedDate: string; accepted: Partial<Record<TermId, boolean>> }
export interface VendorAgreement extends AgreementDraft { certificate: Certificate; version: string; terms: { id: string; title: string; text: string }[]; submittedAt: string; documentBase64: string; company?: typeof AGREEMENT_COMPANY }
export function kigaliDate(now = new Date()) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kigali", year: "numeric", month: "2-digit", day: "2-digit" }).format(now); }
export function validateAgreement(draft: AgreementDraft, today = kigaliDate()) {
  if (!draft.registrationNumber.trim()) return "Provide your business registration number.";
  if (!draft.tin.trim()) return "Provide your TIN number.";
  if (!draft.certificate?.data || !draft.certificate.name) return "Upload your RDB certificate.";
  if (VENDOR_TERMS.some((term) => draft.accepted[term.id] !== true)) return "Tick every agreement condition before submitting.";
  if (!draft.signedName.trim()) return "Write your full name to sign the agreement.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.signedDate) || Number.isNaN(Date.parse(draft.signedDate)) || new Date(draft.signedDate).toISOString().slice(0, 10) !== draft.signedDate || draft.signedDate > today) return "Choose a valid signing date that is not in the future.";
  return undefined;
}
export function snapshotAgreement(draft: AgreementDraft, submittedAt: string): VendorAgreement {
  const error = validateAgreement(draft, kigaliDate(new Date(submittedAt)));
  if (error || !draft.certificate) throw new Error(error ?? "Upload your RDB certificate.");
  return { ...draft, registrationNumber: draft.registrationNumber.trim(), tin: draft.tin.trim(), signedName: draft.signedName.trim(), certificate: { ...draft.certificate }, accepted: { ...draft.accepted }, submittedAt, version: AGREEMENT_VERSION, terms: VENDOR_TERMS.map((t) => ({ ...t })), documentBase64: "", company: { ...AGREEMENT_COMPANY } };
}