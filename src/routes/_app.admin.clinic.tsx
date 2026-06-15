import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/_app/admin/clinic")({
  head: () => ({ meta: [{ title: "Clinic Admin — Helix OS" }] }),
  component: () => (
    <ModulePage title="Clinic Admin Portal" icon={LayoutDashboard} primaryAction="Daily ops board"
      subtitle="Single-clinic command surface for daily operations, revenue, staff and inventory — additive to existing reception, billing and EMR modules."
      stats={[
        { label: "Appointments today", value: "318" },
        { label: "Walk-ins", value: "74" },
        { label: "Collections (today)", value: "₹4.82 L" },
        { label: "Low-stock SKUs", value: "12" },
      ]}
      sections={[
        { title: "Daily operations", items: ["Live queue & token board", "Doctor utilization", "No-show & late tracking", "Cross-counter handoffs", "Incident log"] },
        { title: "Revenue dashboard", items: ["Today vs MTD vs YTD", "Service-line split", "Refund / write-off monitor", "Cash vs digital", "GST snapshot"] },
        { title: "Staff management", items: ["Roster & shift swaps", "Attendance & overtime", "Role-based access", "Performance notes", "Leave approvals"] },
        { title: "Inventory monitoring", items: ["Live stock vs reorder", "Expiry watchlist", "Batch traceability", "Indents to org pharmacy", "Wastage analytics"] },
      ]}
      workflow={[
        "Clinic admin opens dashboard scoped to clinic_id; KPIs hydrate from existing modules.",
        "Reviews queue, staffing gaps and escalations from reception / billing.",
        "Approves leave swaps and reorder indents without leaving the surface.",
        "Drilldowns deep-link into existing EMR, billing and pharmacy screens — no duplication.",
      ]}
    />
  ),
});