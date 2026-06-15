import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_app/admin/super")({
  head: () => ({ meta: [{ title: "Super Admin — Helix OS" }] }),
  component: () => (
    <ModulePage title="Super Admin Portal" icon={ShieldCheck} primaryAction="Onboard organization"
      subtitle="Platform-wide control plane for 500+ healthcare organizations, revenue, subscriptions, AI usage, white-label partners and audit."
      stats={[
        { label: "Organizations", value: "512", hint: "+18 this quarter" },
        { label: "Active clinics", value: "4,820" },
        { label: "Platform MRR", value: "₹38.4 Cr" },
        { label: "AI tokens (30d)", value: "812 M" },
      ]}
      sections={[
        { title: "Platform dashboard", items: ["Real-time tenant health", "Org-level uptime & SLA", "Geo distribution map", "Top-grossing organizations", "Anomaly alerts"] },
        { title: "Organization management", items: ["Provision / suspend orgs", "Tenant isolation checks", "Move clinics between orgs", "Data residency controls", "Tenant-aware backups"] },
        { title: "Revenue & subscription", items: ["Platform MRR / ARR", "Per-plan revenue split", "Churn cohort analysis", "Subscription overrides", "Dunning workflows"] },
        { title: "Feature & AI controls", items: ["Per-org feature toggles", "Beta program enrolment", "AI agent quotas", "Token usage budgeting", "Model routing policies"] },
        { title: "Support & audit", items: ["Impersonation w/ audit", "SLA-tracked ticket queue", "Immutable audit logs", "DPDP / HIPAA evidence", "SOC2 trust center"] },
        { title: "White-label registry", items: ["Brand-A / B / C partners", "Domain & cert health", "Template library status", "Co-branded billing", "Partner revenue share"] },
      ]}
      workflow={[
        "Super admin signs in via SSO with MFA; session bound to platform tenant scope.",
        "Dashboard streams aggregated metrics from all 500 organization tenants.",
        "Admin opens an org → reviews subscription, AI usage, support tickets.",
        "Feature flags / quotas updated → propagated to org-level config service.",
        "All write actions captured into immutable audit log with org + actor context.",
      ]}
    />
  ),
});