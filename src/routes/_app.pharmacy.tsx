import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Pencil, Check, X, AlertTriangle } from "lucide-react";
import { inventory as defaultInventory } from "@/lib/mock-data";
import { ActionButton } from "@/components/action-button";
import { pharmacyApi } from "@/lib/api";

export const Route = createFileRoute("/_app/pharmacy")({
  head: () => ({ meta: [{ title: "Pharmacy — MOH CLINICS" }] }),
  component: Pharmacy,
});

function Pharmacy() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [draft, setDraft] = useState({
    sku: "",
    name: "",
    batch: "",
    expiry: "",
    stock: 0,
    status: "OK" as "OK" | "Low" | "Critical",
  });

  const refreshInventory = async () => {
    try {
      const data = await pharmacyApi.getInventory();
      if (data && data.length > 0) {
        setItems(data);
      } else {
        // Seed initial view with mock database models
        setItems(defaultInventory.map((i, idx) => ({ id: `inv${idx}`, ...i })));
      }
    } catch (err) {
      console.error("Failed to load inventory from backend", err);
      // Failover safely
      setItems(defaultInventory.map((i, idx) => ({ id: `inv${idx}`, ...i })));
    }
  };

  useEffect(() => {
    refreshInventory();
  }, []);

  const submit = async () => {
    if (!draft.sku || !draft.name) {
      toast.error("SKU and name are required");
      return;
    }

    try {
      await pharmacyApi.addInventoryItem(draft);
      toast.success(`${draft.name} added to inventory`);
      setDraft({ sku: "", name: "", batch: "", expiry: "", stock: 0, status: "OK" });
      setOpen(false);
      refreshInventory();
    } catch (err: any) {
      toast.error("Failed to add inventory item in backend");
    }
  };

  const removeSKU = async (id: string, name: string) => {
    try {
      if (id.startsWith("inv")) {
        // Mock item removal from state
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        await pharmacyApi.deleteInventoryItem(id);
        refreshInventory();
      }
      toast.success(`${name} removed`);
    } catch (err) {
      toast.error("Failed to remove item in backend");
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditStock(item.stock);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStock(0);
  };

  const saveStock = async (item: any) => {
    try {
      if (!item.id.startsWith("inv")) {
        await pharmacyApi.updateStock(item.id, editStock);
      }
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, stock: editStock } : i));
      toast.success(`${item.name} stock updated to ${editStock}`);
    } catch (err) {
      toast.error("Failed to update stock in backend");
    } finally {
      setEditingId(null);
    }
  };

  const isExpiringSoon = (expiry: string) => {
    if (!expiry) return false;
    const parts = expiry.match(/(\w+)\s+(\d{4})/);
    if (!parts) return false;
    const months: Record<string, number> = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
    const exp = new Date(Number(parts[2]), months[parts[1]] ?? 0);
    const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    return diff < 3; // Expiring within 3 months
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Pharmacy Management"
        subtitle="Inventory, batches, expiry, purchase orders, Rx mapping, refill reminders."
        actions={
          <>
            <ActionButton
              label="PO · Auto-suggest"
              title="Auto-suggest purchase order"
              description="AI builds a PO from low-stock SKUs, consumption velocity, and lead times."
              fields={[
                { name: "vendor", label: "Vendor", defaultValue: "MedPlus Distributors" },
                { name: "horizon", label: "Coverage horizon", defaultValue: "30 days" },
              ]}
              confirmLabel="Generate PO"
              onConfirm={(v) => {
                const lowStockItems = items.filter((i) => i.status === "Low" || i.status === "Critical");
                toast.success(`PO drafted for ${v.vendor} · ${v.horizon} cover`, {
                  description: `${lowStockItems.length} low-stock SKUs included: ${lowStockItems.slice(0, 3).map((i) => i.name).join(", ")}${lowStockItems.length > 3 ? "..." : ""}`,
                });
              }}
              successMessage={(v) => `PO drafted for ${v.vendor} · ${v.horizon} cover`}
            />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4 mr-1" /> New SKU
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add inventory item</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>SKU</Label>
                      <Input
                        value={draft.sku}
                        onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                        placeholder="MED-00999"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Name</Label>
                      <Input
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        placeholder="Drug name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Batch</Label>
                      <Input
                        value={draft.batch}
                        onChange={(e) => setDraft({ ...draft, batch: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Expiry</Label>
                      <Input
                        value={draft.expiry}
                        onChange={(e) => setDraft({ ...draft, expiry: e.target.value })}
                        placeholder="Mar 2027"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        value={draft.stock}
                        onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select
                        value={draft.status}
                        onValueChange={(v: "OK" | "Low" | "Critical") =>
                          setDraft({ ...draft, status: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OK">OK</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submit}>Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["SKUs", String(items.length)],
          ["Low-stock", String(items.filter((i) => i.status === "Low").length)],
          ["Critical", String(items.filter((i) => i.status === "Critical").length)],
          ["Total units", String(items.reduce((n, i) => n + i.stock, 0))],
        ].map(([l, v]) => (
          <Card key={l}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="text-2xl font-semibold mt-1">{v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Inventory</CardTitle>
          <Badge variant="outline">Live across 4,820 clinics</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-sm">
            <div className="grid grid-cols-7 px-6 py-2 text-xs text-muted-foreground font-medium">
              <div>SKU</div>
              <div className="col-span-2">Item</div>
              <div>Batch · Expiry</div>
              <div>Stock</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            {items.map((i) => (
              <div key={i.id} className={`grid grid-cols-7 px-6 py-3 items-center ${i.status === "Critical" ? "bg-destructive/5" : ""}`}>
                <div className="font-mono text-xs">{i.sku}</div>
                <div className="col-span-2 font-medium">{i.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {i.batch} · {i.expiry}
                  {isExpiringSoon(i.expiry) && (
                    <span title="Expiring soon"><AlertTriangle className="size-3 text-warning" /></span>
                  )}
                </div>
                <div className="font-mono">
                  {editingId === i.id ? (
                    <Input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(Number(e.target.value))}
                      className="h-7 w-20 text-xs"
                      autoFocus
                    />
                  ) : (
                    <span className={i.stock < 20 ? "text-warning font-semibold" : ""}>{i.stock}</span>
                  )}
                </div>
                <div>
                  <Badge
                    className={
                      i.status === "OK"
                        ? "bg-success/15 text-success hover:bg-success/15"
                        : i.status === "Low"
                          ? "bg-warning/15 text-warning hover:bg-warning/15"
                          : "bg-destructive/15 text-destructive hover:bg-destructive/15"
                    }
                  >
                    {i.status}
                  </Badge>
                </div>
                <div className="text-right flex items-center justify-end gap-1">
                  {editingId === i.id ? (
                    <>
                      <Button size="icon" variant="ghost" className="size-7 text-success hover:bg-success/10" onClick={() => saveStock(i)} title="Save">
                        <Check className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit} title="Cancel">
                        <X className="size-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => startEdit(i)} title="Edit stock">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeSKU(i.id!, i.name)}
                        title="Remove SKU"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}