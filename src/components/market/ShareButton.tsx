import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { shareUrl } from "@/lib/share";

type ShareButtonProps = {
  /** Page path to share, e.g. `/vendors/kigali-tech`. */
  path: string;
  title: string;
  text?: string;
} & ButtonProps;

export function ShareButton({ path, title, text, className, ...props }: ShareButtonProps) {
  const share = async () => {
    const url = shareUrl(path, window.location.origin);
    if (navigator.share) {
      const data: ShareData = text === undefined ? { title, url } : { title, text, url };
      try {
        await navigator.share(data);
      } catch {
        // The visitor closed the share sheet — nothing to report.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <Button
      variant="outline"
      className={cn("bg-card", className)}
      {...props}
      onClick={() => {
        void share();
      }}
    >
      <Share2 />Share
    </Button>
  );
}
