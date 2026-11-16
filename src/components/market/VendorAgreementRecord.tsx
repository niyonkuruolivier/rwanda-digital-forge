import { useEffect, useRef, useState } from "react";
import { Download, Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { VendorApplication } from "@/lib/admin";
import { downloadRecord, printAgreement } from "@/lib/vendor-document";
import { AgreementContent } from "./AgreementContent";

export function VendorAgreementRecord({ application }: { application: VendorApplication }) {
  const [open, setOpen] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string>();
  const printable = useRef<HTMLDivElement>(null);
  const a = application.agreement;
  useEffect(() => {
    if (!certificateOpen || !a) return;
    const bytes = Uint8Array.from(atob(a.certificate.data.slice(a.certificate.data.indexOf(",") + 1)), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: a.certificate.mime }));
    setCertificateUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [certificateOpen, a]);
  if (!a) return <p className="mt-3 text-xs text-muted-foreground">Legacy demo application · business documents and signed agreement not provided.</p>;
  const content = <div ref={printable}><AgreementContent agreement={a} store={application.vendor} reference={application.id} /></div>;
  return <div className="mt-4 flex flex-wrap gap-2">
    <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Eye />View agreement</Button>
    <Button size="sm" variant="outline" onClick={() => downloadRecord(a.documentBase64, `${application.id}-vendor-agreement.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", true)}><Download />Download agreement</Button>
    <Button size="sm" variant="outline" onClick={() => setCertificateOpen(true)}><Eye />View RDB certificate</Button>
    <Button size="sm" variant="outline" onClick={() => downloadRecord(a.certificate.data, a.certificate.name, a.certificate.mime)}><Download />Download RDB certificate</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85dvh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>Signed vendor agreement</DialogTitle><DialogDescription>Submitted copy · {application.status} · no edit or delete action</DialogDescription></DialogHeader>{content}<Button variant="outline" onClick={() => printAgreement(printable.current)}><Printer />Print agreement</Button></DialogContent></Dialog>
    <Dialog open={certificateOpen} onOpenChange={setCertificateOpen}><DialogContent className="max-h-[85dvh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>RDB certificate</DialogTitle><DialogDescription className="break-all">{a.certificate.name}</DialogDescription></DialogHeader>{certificateUrl && (a.certificate.mime.startsWith("image/") ? <img src={certificateUrl} alt="Submitted RDB certificate" className="max-h-[60dvh] w-full object-contain" /> : <a href={certificateUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Open certificate</a>)}<Button variant="outline" onClick={() => downloadRecord(a.certificate.data, a.certificate.name, a.certificate.mime)}><Download />Download RDB certificate</Button></DialogContent></Dialog>
  </div>;
}