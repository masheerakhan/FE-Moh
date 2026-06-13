import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { labOrders } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/lab")({
  head: () => ({ meta: [{ title: "Lab — Helix OS" }] }),
  component: Lab,
});

function Lab() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Lab Management" subtitle="Test booking, sample collection, result entry, LIS integration, and AI report analysis."
        actions={<><Button variant="outline" size="sm">Home collection</Button><Button size="sm">New order</Button></>} />

      <Card>
        <CardHeader><CardTitle className="text-base">Today's orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-sm">
            <div className="grid grid-cols-6 px-6 py-2 text-xs text-muted-foreground font-medium"><div>Order</div><div className="col-span-2">Patient</div><div className="col-span-2">Panel</div><div>Status</div></div>
            {labOrders.map((o) => (
              <div key={o.id} className="grid grid-cols-6 px-6 py-3 items-center">
                <div className="font-mono text-xs">{o.id}</div>
                <div className="col-span-2">{o.patient}</div>
                <div className="col-span-2">{o.panel}<div className="text-xs text-muted-foreground">Collected {o.collected}</div></div>
                <div><Badge className={o.status === "Ready" ? "bg-success/15 text-success hover:bg-success/15" : o.status === "Processing" ? "bg-info/15 text-info hover:bg-info/15" : "bg-warning/15 text-warning hover:bg-warning/15"}>{o.status}</Badge></div>
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