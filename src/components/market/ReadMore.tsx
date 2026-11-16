import { useState } from "react";

export function ReadMore({ text, className = "" }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 140;
  return (
    <div className={className}>
      <p className={`break-words leading-relaxed ${open || !long ? "" : "line-clamp-3"}`}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="mt-1 text-sm font-semibold text-primary hover:underline">
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
