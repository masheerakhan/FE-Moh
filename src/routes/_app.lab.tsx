import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { labOrders } from "@/lib/mock-data";
import { useCollection } from "@/lib/use-collection";

type Order = { id: string; orderNo: string; patient: string; panel: string; collected: string; status: string };
const seed: Order[] = labOrders.map((o, i) => ({ id: `ord${i}`, orderNo: o.id, patient: o.patient, panel: o.panel, collected: o.collected, status: o.status }));

export const Route = createFileRoute("/_app/lab")({
  head: () => ({ meta: [{ title: "Lab — Helix OS" }] }),
  component: Lab,
});

function Lab() {
  const { items, create, remove, update } = useCollection<Order>("lab_orders", seed);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ patient: "", panel: "", status: "Pending" });

  const submit = () => {
    if (!draft.patient || !draft.panel) { toast.error("Patient and panel are required"); return; }
    const orderNo = `LAB-${9824 + items.length + 1}`;
    const now = new Date(); const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    create({ orderNo, patient: draft.patient, panel: draft.panel, collected: time, status: draft.status });
    toast.success(`${orderNo} created for ${draft.patient}`);
    setDraft({ patient: "", panel: "", status: "Pending" });
    setOpen(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Lab Management" subtitle="Test booking, sample collection, result entry, LIS integration, and AI report analysis."
        actions={
          <>
            <Button variant="outline" size="sm">Home collection</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="size-4 mr-1" /> New order</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create lab order</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label>Patient</Label><Input value={draft.patient} onChange={(e) => setDraft({ ...draft, patient: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Panel</Label><Input value={draft.panel} onChange={(e) => setDraft({ ...draft, panel: e.target.value })} placeholder="e.g. CBC, CRP" /></div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Processing">Processing</SelectItem><SelectItem value="Ready">Ready</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Create</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        } />

      <Card>
        <CardHeader><CardTitle className="text-base">Today's orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-sm">
            <div className="grid grid-cols-7 px-6 py-2 text-xs text-muted-foreground font-medium"><div>Order</div><div className="col-span-2">Patient</div><div className="col-span-2">Panel</div><div>Status</div><div className="text-right">Actions</div></div>
            {items.map((o) => (
              <div key={o.id} className="grid grid-cols-7 px-6 py-3 items-center">
                <div className="font-mono text-xs">{o.orderNo}</div>
                <div className="col-span-2">{o.patient}</div>
                <div className="col-span-2">{o.panel}<div className="text-xs text-muted-foreground">Collected {o.collected}</div></div>
                <div><Badge className={o.status === "Ready" ? "bg-success/15 text-success hover:bg-success/15" : o.status === "Processing" ? "bg-info/15 text-info hover:bg-info/15" : "bg-warning/15 text-warning hover:bg-warning/15"}>{o.status}</Badge></div>
                <div className="text-right flex justify-end gap-1">
                  {o.status !== "Ready" && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { update(o.id, { status: o.status === "Pending" ? "Processing" : "Ready" }); toast.success("Status advanced"); }}>Advance</Button>}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { remove(o.id); toast.success(`${o.orderNo} removed`); }}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ["Phlebotomists", "812 active", "Across 26 cities"],
          ["TAT — Routine", "4.2 hrs", "−18% MoM"],
          ["AI-flagged reports", "1,284", "Critical alerts to MD"],
        ].map(([l, v, s]) => (
          <Card key={l}><CardContent className="p-5"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-semibold mt-1">{v}</div><div className="text-xs text-muted-foreground mt-1">{s}</div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}