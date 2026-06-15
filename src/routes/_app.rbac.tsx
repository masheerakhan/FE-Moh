import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/_app/rbac")({
  head: () => ({ meta: [{ title: "Advanced RBAC — Helix OS" }] }),
  component: () => (
    <ModulePage title="Advanced RBAC" icon={KeyRound} primaryAction="New role"
      subtitle="Dynamic roles and granular permissions at module, screen and action level — across Super Admin, Org, Clinic, Doctor, Nurse, Reception, Lab, Pharmacy, Care Coordinator and Patient."
      stats={[
        { label: "System roles", value: "11" },
        { label: "Custom roles", value: "182" },
        { label: "Permissions catalog", value: "612" },
        { label: "Policy evaluations / day", value: "48 M" },
      ]}
      sections={[
        { title: "Role hierarchy", items: ["Super Admin", "Organization Admin", "Clinic Admin", "Doctor / Nurse", "Receptionist", "Lab Technician", "Pharmacist", "Care Coordinator", "Patient"] },
        { title: "Dynamic roles", items: ["Org-defined custom roles", "Inheritance & composition", "Time-bound roles", "Locum / temporary access", "Break-glass elevation"] },
        { title: "Permission granularity", items: ["Module-level grants", "Screen-level visibility", "Action-level (create / read / update / delete / sign)", "Field-level masking (PHI)", "Conditional ABAC rules"] },
        { title: "Tenant scoping", items: ["organization_id + clinic_id scoping", "Cross-clinic doctor access", "Patient consent overrides", "Delegated admin", "Service accounts for AI agents"] },
        { title: "Governance", items: ["Policy versioning", "Approval workflows", "Access reviews", "SoD conflict detection", "Full audit + replay"] },
      ]}
      workflow={[
        "Org admin defines a custom role composing base permissions + scope.",
        "Permission catalog enumerates every module / screen / action across the platform.",
        "Policy engine evaluates per-request with tenant + consent + ABAC context.",
        "Decisions logged; periodic access reviews flag dormant or excessive grants.",
      ]}
    />
  ),
});