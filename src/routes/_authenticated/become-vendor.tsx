import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { VendorApplicationStatus } from "@/components/market/VendorApplicationStatus";
import { PhotoUpload } from "@/components/market/PhotoUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { CertificateUpload } from "@/components/market/CertificateUpload";
import { VendorAgreementRecord } from "@/components/market/VendorAgreementRecord";
import { VENDOR_TERMS, kigaliDate, snapshotAgreement, validateAgreement, type Certificate, type TermId, type VendorAgreement } from "@/lib/vendor-agreement";
import { agreementDocument, bytesBase64, downloadRecord, printAgreement } from "@/lib/vendor-document";
import type { Vendor } from "@/lib/data";
import { AgreementContent } from "@/components/market/AgreementContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/become-vendor")({
  head: () => ({ meta: [{ title: "Become a vendor — Murandasi Market" }, { name: "description", content: "Open your own store on Murandasi Market and start selling." }, { property: "og:title", content: "Become a vendor — Murandasi Market" }, { property: "og:description", content: "Open your own store on Murandasi Market and start selling." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Become,
});

function Become() {
  const { registerVendor, applications, buyer } = useStore();
  const auth = useAuth();
  const latest = applications.find((a) => a.buyerId === buyer.id);
  const rejected = latest?.status === "Rejected" ? latest : undefined;
  const pending = applications.find((a) => a.buyerId === buyer.id && a.status === "Pending");
  const nav = useNavigate();
  useEffect(() => { if (auth.role === "vendor") void nav({ to: "/dashboard", replace: true }); }, [auth.role, nav]);
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const [bannerBusy, setBannerBusy] = useState(false);
  const [certificate, setCertificate] = useState<Certificate>();
  const [certificateBusy, setCertificateBusy] = useState(false);
  const [accepted, setAccepted] = useState<Partial<Record<TermId, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [prepared, setPrepared] = useState<{ reference: string; agreement: VendorAgreement; vendor: Vendor }>();
  const printable = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!rejected) return;
    setLogo(rejected.vendor.logo);
    setBanner(rejected.vendor.banner);
    setCertificate(rejected.agreement?.certificate);
  }, [rejected?.id]);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) { toast("Your application is already waiting for admin review."); return; }
    if (logoBusy || bannerBusy || certificateBusy || saving) return;
    if (!logo) { toast.error("Choose a store photo."); return; }
    const f = new FormData(e.currentTarget);
    const draft = { registrationNumber: String(f.get("registrationNumber") ?? ""), tin: String(f.get("tin") ?? ""), certificate, signedName: String(f.get("signedName") ?? ""), signedDate: String(f.get("signedDate") ?? ""), accepted };
    const error = validateAgreement(draft);
    if (error) { toast.error(error); return; }
    const name = String(f.get("name"));
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-store"}-${crypto.randomUUID().slice(0, 8)}`;
    const vendor = { id, name, bio: String(f.get("bio")), location: String(f.get("location")), phone: String(f.get("phone")).trim(), rating: 5, joined: String(new Date().getFullYear()), logo, banner: banner || logo };
    setSaving(true);
    try {
      const reference = `APP-${crypto.randomUUID()}`;
      const agreement = snapshotAgreement(draft, new Date().toISOString());
      agreement.documentBase64 = bytesBase64(await agreementDocument(agreement, vendor, reference));
      setPrepared({ reference, agreement, vendor });
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not prepare your agreement. Try again."); }
    finally { setSaving(false); }
  };
  const confirmSubmission = async () => {
    if (!prepared) return;
    const result = await registerVendor(prepared.vendor, prepared.agreement, prepared.reference);
    if (result) { toast.error(result); return; }
    setPrepared(undefined);
    toast.success("Application and signed agreement saved for admin review.");
  };
  if (auth.role === "vendor") return <Navigate to="/dashboard" replace />;
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div>
        <Store className="h-10 w-10 text-primary" />
        <h1 className="mt-4 text-3xl font-extrabold">Apply to become a vendor</h1>
        <p className="mt-3 text-muted-foreground">Business details, RDB certificate and signed agreement are required for admin review.</p>
        <p className="mt-2 text-xs text-accent">Your application is saved to your account for administrator review. Payments remain demonstrations.</p>
        <Button variant="link" className="mt-4 px-0" onClick={() => nav({ to: "/dashboard" })}>Already a seller? Open your dashboard →</Button>
      </div>
      <VendorApplicationStatus />
      {applications.filter((a) => a.buyerId === buyer.id).map((a) => <article key={a.id} className="my-5 rounded-lg border bg-card p-4"><p className="text-sm"><b>{a.vendor.name}</b> · {a.status === "Pending" ? "Waiting for admin approval" : a.status}</p><VendorAgreementRecord application={a} />{a.rejectionReason && <p className="mt-3 break-words text-sm"><b>Reason from administrator: </b>{a.rejectionReason}</p>}</article>)}
      {!pending && <form onSubmit={submit} className="mt-6 space-y-5 border-t pt-6">
        <fieldset disabled={saving || Boolean(pending)} className="space-y-4">
        <h2 className="text-lg font-bold">{rejected ? "Correct your details & reapply" : "Store & business details"}</h2>
        <div><Label htmlFor="name">Store name</Label><Input id="name" name="name" defaultValue={rejected?.vendor.name ?? ""} required /></div>
        <div><Label htmlFor="location">Location</Label><Input id="location" name="location" defaultValue={rejected?.vendor.location ?? ""} required /></div>
        <div><Label htmlFor="phone">Shop phone number</Label><Input id="phone" name="phone" defaultValue={rejected?.vendor.phone ?? ""} type="tel" autoComplete="tel" required placeholder="+250 7xx xxx xxx" /></div>
        <PhotoUpload id="logo" label="Store photo" value={logo} onChange={setLogo} onBusyChange={setLogoBusy} />
        <PhotoUpload id="banner" label="Cover photo (optional)" value={banner} onChange={setBanner} onBusyChange={setBannerBusy} />
        <div><Label htmlFor="bio">Store bio</Label><Textarea id="bio" name="bio" defaultValue={rejected?.vendor.bio ?? ""} required rows={4} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="registrationNumber">Business registration number</Label><Input id="registrationNumber" name="registrationNumber" defaultValue={rejected?.agreement?.registrationNumber ?? ""} required /></div><div><Label htmlFor="tin">TIN number</Label><Input id="tin" name="tin" defaultValue={rejected?.agreement?.tin ?? ""} required /></div></div>
        <CertificateUpload value={certificate} onChange={setCertificate} onBusyChange={setCertificateBusy} />
        <section className="space-y-4 border-t pt-6"><h2 className="text-lg font-bold">Vendor agreement</h2>{VENDOR_TERMS.map((term) => <div key={term.id} className="flex items-start gap-3"><Checkbox id={`term-${term.id}`} required checked={accepted[term.id] === true} onCheckedChange={(checked) => setAccepted((old) => ({ ...old, [term.id]: checked === true }))} className="mt-1" /><Label htmlFor={`term-${term.id}`} className="min-w-0 cursor-pointer text-sm leading-relaxed"><span className="block font-bold">{term.title}</span><span className="font-normal text-muted-foreground">{term.text}</span></Label></div>)}</section>
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2"><div><Label htmlFor="signedName">Full name (signature)</Label><Input id="signedName" name="signedName" defaultValue={rejected?.agreement?.signedName ?? ""} required autoComplete="name" /></div><div><Label htmlFor="signedDate">Signing date</Label><Input id="signedDate" name="signedDate" type="date" required max={kigaliDate()} /></div></div>
        <Button type="submit" size="lg" disabled={logoBusy || bannerBusy || certificateBusy || saving || Boolean(pending)} className="w-full">{saving ? "Preparing your agreement…" : pending ? "Application pending" : "Prepare & preview agreement"}</Button>
        </fieldset>
      </form>}
      <Dialog open={Boolean(prepared)} onOpenChange={(open) => { if (!open) setPrepared(undefined); }}><DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>Preview your vendor agreement</DialogTitle><DialogDescription>Review the completed agreement before submitting for admin approval.</DialogDescription></DialogHeader>{prepared && <><div ref={printable}><AgreementContent agreement={prepared.agreement} store={prepared.vendor} reference={prepared.reference} preview /></div><div className="flex flex-wrap gap-2 border-t pt-4"><Button variant="outline" onClick={() => setPrepared(undefined)}>Back to edit</Button><Button variant="outline" onClick={() => printAgreement(printable.current)}>Print</Button><Button variant="outline" onClick={() => downloadRecord(prepared.agreement.documentBase64, `${prepared.reference}-vendor-agreement.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", true)}>Download Word</Button><Button onClick={confirmSubmission}>Confirm &amp; submit application</Button></div></>}</DialogContent></Dialog>
    </div>
  );
}
