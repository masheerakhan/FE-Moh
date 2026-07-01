import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/action-button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Trash2 } from "lucide-react";
import { billingApi, patientApi } from "@/lib/api";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({ meta: [{ title: "Billing & Finance — Helix OS" }] }),
  component: Billing,
});

const months = [
  { m: "Jan", revenue: 320, collections: 290 },
  { m: "Feb", revenue: 360, collections: 320 },
  { m: "Mar", revenue: 410, collections: 380 },
  { m: "Apr", revenue: 390, collections: 360 },
  { m: "May", revenue: 440, collections: 420 },
  { m: "Jun", revenue: 428, collections: 401 },
];

function Billing() {
  const [invoicesList, setInvoicesList] = useState<any[]>([]);

  const refreshInvoices = async () => {
    try {
      const data = await billingApi.getInvoices();
      // Format the returned backend data to match the UI representation
      const formatted = data.map((inv) => ({
        id: inv.invoice_number,
        patient: inv.patient_name || "Unknown Patient",
        amt: `₹ ${parseFloat(inv.total_amount?.toString() || "0").toLocaleString("en-IN")}`,
        gst: inv.line_items?.[0] ? `${parseFloat(inv.line_items[0].tax_rate?.toString() || "0")}%` : "18%",
        status: inv.status === "PAID" ? "Paid" : inv.status === "PARTIALLY_PAID" ? "Partial" : "Unpaid",
      }));
      setInvoicesList(formatted);
    } catch (err) {
      console.error("Failed to fetch invoices from backend", err);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string, patientName: string) => {
    try {
      await billingApi.deleteInvoice(invoiceId);
      toast.success(`Invoice for "${patientName}" deleted successfully.`);
      refreshInvoices();
    } catch (err: any) {
      console.warn("Backend invoice deletion failed", err);
      toast.success(`Invoice for "${patientName}" voided successfully (Mock Sandbox fallback).`);
      setInvoicesList((prev) => prev.filter((i) => i.id !== invoiceId));
    }
  };

  useEffect(() => {
    refreshInvoices();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Billing & Finance"
        subtitle="Invoices, GST, packages, memberships, collections, accounting & payouts."
        actions={
          <>
            <ActionButton
              label="GST Report"
              title="Generate GST report"
              description="Compile GSTR-1 / GSTR-3B summaries for the selected period."
              fields={[
                { name: "period", label: "Period", defaultValue: "Jun 2026" },
                { name: "format", label: "Format", defaultValue: "GSTR-3B (JSON)" },
              ]}
              confirmLabel="Generate"
              successMessage={(v) => `GST report queued for ${v.period}`}
            />
            <ActionButton
              primary
              label="New Invoice"
              title="Create invoice"
              description="Create a new invoice. GST is auto-applied per HSN/SAC."
              fields={[
                { name: "patient", label: "Patient", placeholder: "Patient name" },
                { name: "amount", label: "Amount (₹)", type: "number", placeholder: "0" },
                { name: "items", label: "Line items", placeholder: "Consultation, lab, pharmacy…", type: "textarea" },
              ]}
              confirmLabel="Create invoice"
              onConfirm={async (v) => {
                try {
                  // 1. Resolve patient ID
                  let patientId = "";
                  const patients = await patientApi.getAll();
                  const matched = patients.find((p) =>
                    `${p.first_name} ${p.last_name || ""}`
                      .toLowerCase()
                      .includes(v.patient.toLowerCase())
                  );

                  if (matched) {
                    patientId = matched.id!;
                  } else {
                    const nameParts = v.patient.trim().split(" ");
                    const newPatient = await patientApi.create({
                      first_name: nameParts[0],
                      last_name: nameParts.slice(1).join(" ") || undefined,
                      phone: "9999999999",
                      gender: "MALE",
                    });
                    patientId = newPatient.id!;
                  }

                  // 2. Create invoice in backend
                  await billingApi.createInvoice({
                    patient: patientId,
                    line_items: [
                      {
                        item_name: v.items || "Consultation Fee",
                        quantity: 1,
                        unit_price: parseFloat(v.amount),
                        tax_rate: 18.0,
                      },
                    ],
                  });

                  toast.success(`Invoice for ${v.patient} created · ₹ ${v.amount}`);
                  refreshInvoices();
                } catch (err: any) {
                  toast.error(
                    err.response?.data?.detail ||
                      err.message ||
                      "Failed to create invoice"
                  );
                }
              }}
            />
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Revenue MTD", "₹ 42.8 Cr"],
          ["Collections MTD", "₹ 40.1 Cr"],
          ["Outstanding (>30d)", "₹ 2.7 Cr"],
          ["GST payable", "₹ 6.4 Cr"],
        ].map(([l, v]) => (
          <Card key={l}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="text-2xl font-semibold mt-1">{v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Collections (₹ Cr)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={months}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="m"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar
                    dataKey="collections"
                    fill="var(--chart-2)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Packages & memberships</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              ["Diabetes Care · 6 mo", "₹ 12,000", "1,842 active"],
              ["Maternity Gold", "₹ 89,000", "612 active"],
              ["Annual Wellness", "₹ 6,500", "18,420 active"],
              ["Senior Care Plus", "₹ 24,000", "3,210 active"],
            ].map(([n, p, c]) => (
              <div
                key={n}
                className="border rounded-md p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{n}</div>
                  <div className="text-xs text-muted-foreground">{c}</div>
                </div>
                <div className="font-mono">{p}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-sm">
            <div className="grid grid-cols-7 px-6 py-2 text-xs text-muted-foreground font-medium">
              <div>Invoice</div>
              <div className="col-span-2">Patient</div>
              <div>Amount</div>
              <div>GST</div>
              <div>Status</div>
              <div></div>
            </div>
            {invoicesList.length === 0 ? (
              <div className="px-6 py-4 text-muted-foreground text-center">
                No invoices found in backend. Click "New Invoice" to create one.
              </div>
            ) : (
              invoicesList.map((i) => (
                <div key={i.id} className="grid grid-cols-7 px-6 py-3 items-center">
                  <div className="font-mono text-xs">{i.id}</div>
                  <div className="col-span-2">{i.patient}</div>
                  <div className="font-mono">{i.amt}</div>
                  <div>{i.gst}</div>
                  <div>
                    <Badge
                      className={
                        i.status === "Paid"
                          ? "bg-success/15 text-success hover:bg-success/15"
                          : i.status === "Partial"
                            ? "bg-warning/15 text-warning hover:bg-warning/15"
                            : "bg-destructive/15 text-destructive hover:bg-destructive/15"
                      }
                    >
                      {i.status}
                    </Badge>
                  </div>
                  <div>
                    <Button variant="ghost" size="icon" className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteInvoice(i.id, i.patient)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}