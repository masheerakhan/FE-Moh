import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/_app/admin/org")({
  head: () => ({ meta: [{ title: "Organization Admin — Helix OS" }] }),
  component: () => (
    <ModulePage title="Organization Admin Portal" icon={Building2} primaryAction="Add clinic"
      subtitle="Operate a multi-clinic hospital chain — doctors, staff, branding, domains and revenue across all branches."
      stats={[
        { label: "Clinics in org", value: "38" },
        { label: "Doctors", value: "612" },
        { label: "Staff", value: "1,840" },
        { label: "Org revenue (MTD)", value: "₹6.2 Cr" },
      ]}
      sections={[
        { title: "Multi-clinic management", items: ["Clinic onboarding wizard", "Centralized scheduling rules", "Cross-clinic patient transfer", "Org-wide formulary", "Inter-clinic referrals"] },
        { title: "Doctor management", items: ["Credentialing & licenses", "Specialty mapping", "Multi-clinic rosters", "Productivity scorecards", "Revenue share configuration"] },
        { title: "Staff management", items: ["Receptionists, nurses, lab, pharmacy", "Shift planning", "Bulk role assignment", "Training compliance", "Attendance integration"] },
        { title: "Revenue analytics", items: ["Branch P&L", "Specialty contribution", "Payer mix", "Discount leakage", "AR ageing"] },
        { title: "Branding & domain", items: ["Org logo / palette / typography", "Custom subdomain", "SSL & DNS health", "Patient-app theming", "Email / WhatsApp sender IDs"] },
      ]}
      workflow={[
        "Org admin logs in scoped to their organization_id; clinic list materializes.",
        "Adds a new clinic → wizard provisions branding, staff slots and doctor rosters.",
        "Assigns doctors to clinics; permissions inherit from org RBAC defaults.",
        "Reviews consolidated revenue and operational KPIs across branches.",
        "Updates branding / domain → propagates to patient app and notifications.",
      ]}
    />
  ),
});