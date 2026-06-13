import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inventory } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/pharmacy")({
  head: () => ({ meta: [{ title: "Pharmacy — Helix OS" }] }),
  component: Pharmacy,
});

function Pharmacy() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Pharmacy Management" subtitle="Inventory, batches, expiry, purchase orders, Rx mapping, refill reminders."
        actions={<><Button variant="outline" size="sm">PO · Auto-suggest</Button><Button size="sm">Dispense Rx</Button></>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[["SKUs", "18,420"],["Low-stock", "264"],["Expiring < 90d", "1,128"],["Today's dispenses", "9,840"]].map(([l,v]) => (
          <Card key={l}><CardContent className="p-5"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Inventory</CardTitle><Badge variant="outline">Live across 4,820 clinics</Badge></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-sm">
            <div className="grid grid-cols-6 px-6 py-2 text-xs text-muted-foreground font-medium"><div>SKU</div><div className="col-span-2">Item</div><div>Batch · Expiry</div><div>Stock</div><div>Status</div></div>
            {inventory.map((i) => (
              <div key={i.sku} className="grid grid-cols-6 px-6 py-3 items-center">
                <div className="font-mono text-xs">{i.sku}</div>
                <div className="col-span-2 font-medium">{i.name}</div>
                <div className="text-xs text-muted-foreground">{i.batch} · {i.expiry}</div>
                <div className="font-mono">{i.stock}</div>
                <div><Badge className={i.status === "OK" ? "bg-success/15 text-success hover:bg-success/15" : i.status === "Low" ? "bg-warning/15 text-warning hover:bg-warning/15" : "bg-destructive/15 text-destructive hover:bg-destructive/15"}>{i.status}</Badge></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}