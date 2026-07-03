import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { clinics } from "@/lib/mock-data";
import { useCollection } from "@/lib/use-collection";

type Clinic = { id: string; name: string; city: string; doctors: number; visits: number; util: number };
const seed: Clinic[] = clinics.map((c, i) => ({ id: `c${i}`, ...c }));

export const Route = createFileRoute("/_app/clinics")({
  head: () => ({ meta: [{ title: "Multi-clinic — MOH CLINICS" }] }),
  component: Clinics,
});

function Clinics() {
  const { items, create, remove } = useCollection<Clinic>("clinics_list", seed);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", city: "", doctors: 0, visits: 0, util: 70 });

  const submit = () => {
    if (!draft.name || !draft.city) { toast.error("Name and city are required"); return; }
    create(draft);
    toast.success(`Branch "${draft.name}" added`);
    setDraft({ name: "", city: "", doctors: 0, visits: 0, util: 70 });
    setOpen(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Multi-clinic & Hospital Network" subtitle="4,820 clinics · 512 hospitals · Centralized scheduling, inventory & analytics."
        actions={
          <>
            <Button variant="outline" size="sm">Franchise console</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="size-4 mr-1" /> Add branch</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add clinic branch</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label>Branch name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>City</Label><Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5"><Label>Doctors</Label><Input type="number" value={draft.doctors} onChange={(e) => setDraft({ ...draft, doctors: Number(e.target.value) })} /></div>
                    <div className="space-y-1.5"><Label>Visits/day</Label><Input type="number" value={draft.visits} onChange={(e) => setDraft({ ...draft, visits: Number(e.target.value) })} /></div>
                    <div className="space-y-1.5"><Label>Utilization %</Label><Input type="number" value={draft.util} onChange={(e) => setDraft({ ...draft, util: Number(e.target.value) })} /></div>
                  </div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Add</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[["Branches", String(items.length)],["Doctors", String(items.reduce((n, c) => n + c.doctors, 0))],["Visits today", String(items.reduce((n, c) => n + c.visits, 0))],["Avg utilization", `${Math.round(items.reduce((n, c) => n + c.util, 0) / Math.max(items.length, 1))}%`]].map(([l,v]) => (
          <Card key={l}><CardContent className="p-5"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Top branches today</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((c) => (
              <div key={c.id} className="grid grid-cols-12 items-center px-6 py-3 gap-4 text-sm">
                <div className="col-span-4">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.city}</div>
                </div>
                <div className="col-span-2"><div className="text-xs text-muted-foreground">Doctors</div><div className="font-mono">{c.doctors}</div></div>
                <div className="col-span-2"><div className="text-xs text-muted-foreground">Visits</div><div className="font-mono">{c.visits}</div></div>
                <div className="col-span-3"><div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Utilization</span><span>{c.util}%</span></div><Progress value={c.util} /></div>
                <div className="col-span-1 text-right"><Button size="icon" variant="ghost" onClick={() => { remove(c.id); toast.success(`${c.name} removed`); }}><Trash2 className="size-4 text-destructive" /></Button></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}