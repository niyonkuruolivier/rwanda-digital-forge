import type { VendorAgreement } from "@/lib/vendor-agreement";

export function AgreementContent({ agreement: a, store, reference, preview = false }: { agreement: VendorAgreement; store: { name: string; location: string; phone?: string | undefined }; reference: string; preview?: boolean }) {
  const company = a.company;
  return <article className="agreement-print space-y-5 bg-card p-4 text-sm text-card-foreground sm:p-8">
    <header className="border-b-2 border-primary pb-5">
      {company && <img src={company.logo} alt="Murandasi company logo" className="mb-4 h-auto w-64 max-w-full" />}
      <h2 className="text-xl font-bold">Vendor Partnership Agreement</h2>
      <p className="mt-2">Murandasi Market · Rwanda</p>
      {company && <p className="mt-1">Company contact: {company.phone} · TIN: {company.tin}</p>}
      <p className="mt-3 break-all text-xs text-muted-foreground">Reference: {reference} · Policy version: {a.version}</p>
    </header>
    <section><h3 className="font-bold">Parties and business details</h3><p className="mt-2">This agreement records the terms accepted by {a.signedName}, representing {store.name}, and Murandasi Market{company ? `, represented by ${company.director}, ${company.title}` : ""}.</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2"><div><dt className="font-semibold">Vendor store</dt><dd>{store.name}</dd></div><div><dt className="font-semibold">Location / contact</dt><dd>{store.location} · {store.phone || "Not provided"}</dd></div><div><dt className="font-semibold">Business registration</dt><dd className="break-all">{a.registrationNumber}</dd></div><div><dt className="font-semibold">Vendor TIN</dt><dd className="break-all">{a.tin}</dd></div><div><dt className="font-semibold">RDB certificate on record</dt><dd className="break-all">{a.certificate.name}</dd></div></dl>
    </section>
    {a.terms.map((term, index) => <section key={term.id} className="border-t pt-4"><h3 className="font-bold">{index + 1}. {term.title}</h3><p className="mt-2 leading-relaxed">{term.text}</p></section>)}
    <section className="border-t pt-4"><h3 className="font-bold">Declaration and signatures</h3><p className="mt-2 leading-relaxed">The vendor confirms that the supplied business details are accurate and that every condition above has been individually accepted. The typed vendor name and date record acceptance. Submission remains subject to admin approval.</p>
      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div><h3 className="font-bold">For the vendor</h3><p className="mt-6 border-b pb-2 font-semibold">{a.signedName}</p><p className="mt-2">{store.name}</p><p>Date: {a.signedDate}</p></div>
        {company && <div><h3 className="font-bold">For Murandasi Market</h3><img src={company.signature} alt="Signature of Niyonkuru Olivier" className="mt-3 h-16 w-40 object-contain" /><p className="border-b pb-2 font-semibold">{company.director}</p><p className="mt-2">{company.title}</p><p>Company contact: {company.phone}</p><img src={company.stamp} alt="Murandasi company stamp" className="mt-3 h-28 w-28 object-contain" /></div>}
      </div>
    </section>
    <p className="border-t pt-3 text-xs text-muted-foreground">{preview ? "Prepared for review; not yet submitted." : `Submitted (UTC): ${a.submittedAt}. Retained submission copy.`} The company signature and stamp are reproduced images, not independently verified digital signatures. Demo records stay in this browser and are not tamper-proof legal storage.</p>
  </article>;
}