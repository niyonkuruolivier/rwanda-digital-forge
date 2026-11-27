import { Link } from "@tanstack/react-router";
import { Clock3, Store, CircleAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { hasSellerAccess } from "@/lib/account-access";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export function VendorApplicationStatus() {
  const s = useStore();
  const application = s.applications.find((a) => a.buyerId === s.buyer.id);
  const auth = useAuth();
  const approved = hasSellerAccess(s.role, s.myVendorId);
  const activating = application?.status === "Approved" && !approved;
  useEffect(() => {
    if (!activating) return;
    void auth.refresh();
    const timer = window.setInterval(() => { void auth.refresh(); }, 5000);
    return () => window.clearInterval(timer);
  }, [activating, auth.refresh]);
  if (!application && !approved) return null;
  const pending = application?.status === "Pending";
  if (pending && !approved) return <section aria-label="Vendor application status" className="border-y border-primary/20 bg-primary/5 py-8 sm:py-10">
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
      <CheckCircle2 className="size-12 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-primary">Application received</p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Thank you for choosing Murandasi Market!</h2>
        <p className="mt-3 break-words text-base font-semibold">Your application for {application.vendor.name} has been submitted successfully.</p>
        <p role="status" className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Our administrator will review your business details and signed agreement. Please wait for approval; you do not need to apply again. Your application is safely saved in your account.</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Once approved, your seller account will activate automatically and open your seller dashboard. If any corrections are needed, the administrator’s explanation will appear here.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3"><span className="flex items-center gap-2 text-sm font-semibold text-primary"><Clock3 className="size-4" />Waiting for administrator approval</span><Button asChild variant="outline"><Link to="/become-vendor">View submitted agreement</Link></Button></div>
      </div>
    </div>
  </section>;
  return <section aria-label="Vendor application status" className="border-y py-5">
    <div className="flex items-start gap-3">
      {approved ? <Store className="size-6 shrink-0 text-primary" /> : pending || activating ? <Clock3 className="size-6 shrink-0 text-primary" /> : <CircleAlert className="size-6 shrink-0 text-destructive" />}
      <div className="min-w-0"><h2 className="text-lg font-bold">{approved ? "Congratulations! Your vendor account is ready" : pending ? "Application pending" : application?.status === "Approved" ? "Activating your vendor account" : "Application not approved"}</h2>
        <p className="mt-1 break-words text-sm text-muted-foreground">{application?.vendor.name}</p>
        <p role="status" className="mt-2 text-sm text-muted-foreground">{approved ? "Your store is approved. Proceed to your dashboard to upload products and start selling." : pending ? "Waiting for administrator approval. Your vendor account will activate automatically when approved." : application?.status === "Approved" ? "Your store has been approved. Seller access is being updated." : "Correct the issues below, then submit a new application for review."}</p>
        {application?.status === "Rejected" && <p className="mt-3 break-words text-sm"><b>Reason from administrator: </b>{application.rejectionReason || "No reason was recorded for this earlier review."}</p>}
        {!activating && <Button asChild className="mt-3" variant={approved ? "default" : "outline"}><Link to={approved ? "/dashboard" : "/become-vendor"}>{approved ? "Proceed to dashboard" : pending ? "View application" : "Correct & reapply"}</Link></Button>}
      </div>
    </div>
  </section>;
}