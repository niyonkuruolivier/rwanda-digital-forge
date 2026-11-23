import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { listHelpers, saveHelper } from "@/lib/staff.functions";
import { STAFF_TASKS, type StaffTask } from "@/lib/staff-tasks";

const label = (id: string) => STAFF_TASKS.find((t) => t.id === id)?.label ?? id;

export function TeamHelpers() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-helpers"], queryFn: () => listHelpers() });
  const [email, setEmail] = useState("");
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const save = useMutation({
    mutationFn: (v: { email: string; tasks: StaffTask[] }) => saveHelper({ data: v }),
    onSuccess: (_d, v) => { toast.success(v.tasks.length ? "Helper saved" : "Helper removed"); setEmail(""); setTasks([]); void qc.invalidateQueries({ queryKey: ["admin-helpers"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save helper."),
  });
  const toggle = (id: StaffTask) => setTasks((t) => t.includes(id) ? t.filter((x) => x !== id) : [...t, id]);
  return <div className="mt-4 space-y-6">
    <form className="rounded-lg border bg-card p-4" onSubmit={(e) => { e.preventDefault(); if (!tasks.length) { toast.error("Choose at least one task."); return; } save.mutate({ email, tasks }); }}>
      <h3 className="flex items-center gap-2 font-bold"><UserPlus className="size-4 text-primary" />Add a helper</h3>
      <p className="mt-1 text-sm text-muted-foreground">The person must already have an account. They only see and do the tasks you tick. Money and withdrawals stay with you.</p>
      <Input type="email" required placeholder="helper@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-3 max-w-sm" aria-label="Helper email" />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {STAFF_TASKS.map((t) => <label key={t.id} className="flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm"><Checkbox checked={tasks.includes(t.id)} onCheckedChange={() => toggle(t.id)} className="mt-0.5" /><span><b>{t.label}</b><span className="block text-xs text-muted-foreground">{t.hint}</span></span></label>)}
      </div>
      <Button type="submit" className="mt-4" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save helper"}</Button>
    </form>
    <section>
      <h3 className="font-bold">Your helpers</h3>
      {q.isLoading && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
      {q.data?.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No helpers yet.</p>}
      <div className="mt-3 space-y-2">{q.data?.map((h) => <article key={h.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <div className="min-w-0"><p className="font-semibold">{h.name || h.email}</p><p className="text-xs text-muted-foreground">{h.email}</p><div className="mt-2 flex flex-wrap gap-1">{h.tasks.map((t) => <span key={t} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{label(t)}</span>)}</div></div>
        <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setEmail(h.email); setTasks(h.tasks as StaffTask[]); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</Button><Button size="sm" variant="outline" aria-label="Remove helper" onClick={() => { if (confirm(`Remove ${h.email} as helper?`)) save.mutate({ email: h.email, tasks: [] }); }}><Trash2 /></Button></div>
      </article>)}</div>
    </section>
  </div>;
}
