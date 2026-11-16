import { Link } from "@tanstack/react-router";
import { Clock3, Store, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function VendorApplicationStatus() {
  const s = useStore();
  const application = s.applications.find((a) => a.buyerId === s.buyer.id);
  if (!application && s.role !== "vendor") return null;
  const approved = s.role === "vendor";
  const pending = application?.status === "Pending";
  return <section aria-label="Vendor application status" className="border-y py-5">
    <div className="flex items-start gap-3">
      {approved ? <Store className="size-6 shrink-0 text-primary" /> : pending ? <Clock3 className="size-6 shrink-0 text-accent" /> : <CircleAlert className="size-6 shrink-0 text-destructive" />}
      <div className="min-w-0"><h2 className="text-lg font-bold">{approved ? "Congratulations! Your vendor account is ready" : pending ? "Application pending" : application?.status === "Approved" ? "Activating your vendor account" : "Application not approved"}</h2>
        <p className="mt-1 break-words text-sm text-muted-foreground">{application?.vendor.name}</p>
        <p role="status" className="mt-2 text-sm text-muted-foreground">{approved ? "Your store is approved. Proceed to your dashboard to upload products and start selling." : pending ? "Waiting for administrator approval. Your vendor account will activate automatically when approved." : application?.status === "Approved" ? "Your store has been approved. Seller access is being updated." : "Correct the issues below, then submit a new application for review."}</p>
        {application?.status === "Rejected" && <p className="mt-3 break-words text-sm"><b>Reason from administrator: </b>{application.rejectionReason || "No reason was recorded for this earlier review."}</p>}
        <Button asChild className="mt-3" variant={approved ? "default" : "outline"}><Link to={approved ? "/dashboard" : "/become-vendor"}>{approved ? "Proceed to dashboard" : pending ? "View application" : "Correct & reapply"}</Link></Button>
      </div>
    </div>
  </section>;
}