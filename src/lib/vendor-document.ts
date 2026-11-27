import type { VendorAgreement } from "./vendor-agreement";
export async function agreementDocument(agreement: VendorAgreement, store: { name: string; location: string; phone?: string }, reference: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Footer, PageNumber, ImageRun } = await import("docx");
  const paragraph = (text: string) => new Paragraph({ spacing: { after: 100 }, children: [new TextRun(text)] });
  const company = agreement.company;
  const image = async (url: string, width: number, height: number, description: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not load the company signature or stamp. Try again.");
    // Asset delivery may optimize PNG uploads to WebP; Word needs actual PNG bytes.
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) { bitmap.close(); throw new Error("Could not prepare the agreement images. Try again."); }
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not prepare the agreement images. Try again.")), "image/png"));
    return new Paragraph({ children: [new ImageRun({ type: "png", data: new Uint8Array(await png.arrayBuffer()), transformation: { width, height }, altText: { title: description, description, name: description } })] });
  };
  const logo = company ? [await image(company.logo, 240, 80, "Murandasi company logo")] : [];
  const companySignature = company ? [new Paragraph({ heading: HeadingLevel.HEADING_2, text: "For Murandasi Market" }), await image(company.signature, 150, 84, "Signature of Niyonkuru Olivier"), paragraph(`${company.director} | ${company.title}`), paragraph(`Company contact: ${company.phone} | TIN: ${company.tin}`), await image(company.stamp, 100, 107, "Murandasi company stamp")] : [];
  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 21 } } }, paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Arial", size: 32, bold: true, color: "000000" }, paragraph: { spacing: { before: 200, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Arial", size: 24, bold: true, color: "000000" }, paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1, keepNext: true } },
    ] },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun("Murandasi Market · Vendor agreement · Page "), new TextRun({ children: [PageNumber.CURRENT] })] })] }) },
      children: [...logo, new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Vendor Partnership Agreement" }), paragraph("Murandasi Market · Rwanda"),
        ...(company ? [paragraph(`Company representative: ${company.director}, ${company.title}`), paragraph(`Company contact: ${company.phone} | TIN: ${company.tin}`)] : []),
        paragraph(`Reference: ${reference} | Policy version: ${agreement.version}`), paragraph(`Store: ${store.name} | Location: ${store.location}`), paragraph(`Shop contact: ${store.phone || "Not provided"}`),
        paragraph(`RDB registered name: ${agreement.registrationNumber} | TIN: ${agreement.tin}`), paragraph(`RDB certificate on record: ${agreement.certificate.name}`),
        ...agreement.terms.flatMap((term) => [new Paragraph({ heading: HeadingLevel.HEADING_2, text: term.title }), paragraph(`Accepted: ${term.text}`)]),
        new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Applicant declaration" }), paragraph("I have individually accepted every condition above. My typed name and date record my acceptance; submission is not admin approval or independent verification of my business."),
        paragraph(`Signed name: ${agreement.signedName}`), paragraph(`Signing date: ${agreement.signedDate}`), paragraph(`Submitted at (UTC): ${agreement.submittedAt}`),
        ...companySignature,
        ...(company ? [paragraph("The company signature and stamp are reproduced images, not independently verified digital signatures. Submission remains subject to admin approval.")] : []),
        paragraph("Retained submission copy. No edit or delete action is available in the marketplace. Browser-managed demo records are not tamper-proof legal storage."),
      ] }],
  });
  const blob = await Packer.toBlob(doc);
  return new Uint8Array(await blob.arrayBuffer());
}
export function bytesBase64(bytes: Uint8Array) { let text = ""; for (const byte of bytes) text += String.fromCharCode(byte); return btoa(text); }
export function downloadRecord(data: string, name: string, mime: string, base64 = false) {
  const bytes = Uint8Array.from(atob(base64 ? data : data.slice(data.indexOf(",") + 1)), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
export function printAgreement(content: HTMLElement | null) {
  if (!content) return;
  const popup = window.open("", "_blank", "width=900,height=1000");
  if (!popup) return;
  popup.document.title = "Murandasi Market · Signed vendor agreement";
  const style = popup.document.createElement("style");
  style.textContent = "@page { size: A4; margin: 18mm; } body { font: 11pt Arial, sans-serif; margin: 24px; } h2 { font-size: 18pt; } h3 { font-size: 12pt; margin-bottom: 6px; } p { line-height: 1.4; } section { break-inside: avoid; margin-top: 16px; } dt { font-weight: bold; margin-top: 10px; } dd { margin: 4px 0 0; } img { object-fit: contain; max-width: 240px; max-height: 100px; } section img { max-width: 150px; }";
  popup.document.head.append(style);
  popup.document.body.append(content.cloneNode(true));
  popup.focus();
  Promise.all(Array.from(popup.document.images).map((img) => img.decode().catch(() => undefined))).then(() => { if (!popup.closed) popup.print(); });
}