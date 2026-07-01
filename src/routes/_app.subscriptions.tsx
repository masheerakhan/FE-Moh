import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions — Helix OS" }] }),
  component: () => (
    <ModulePage title="SaaS Subscription Engine" icon={CreditCard} primaryAction="Create plan"
      subtitle="Plans, feature toggles, metered billing, renewals and dunning across organizations and white-label partners."
      primaryActionFields={[
        { name: "name", label: "Plan Name", placeholder: "e.g. Enterprise Plus" },
        { name: "price", label: "Monthly Price (₹)", type: "number", placeholder: "0" },
        { name: "seats", label: "Included Seats", type: "number", placeholder: "e.g. 50" },
      ]}
      primaryActionConfirmLabel="Create Plan"
      primaryActionOnConfirm={(v) => {
        toast.success(`Plan "${v.name}" created`, { description: `₹${v.price}/mo · ${v.seats} seats included.` });
      }}
      stats={[
        { label: "Active subscriptions", value: "498" },
        { label: "MRR", value: "₹38.4 Cr" },
        { label: "Net retention", value: "118%" },
        { label: "Failed renewals (7d)", value: "6" },
      ]}
      sections={[
        { title: "Plans & pricing", items: ["Starter / Growth / Enterprise", "Per-doctor & per-clinic tiers", "Add-on AI agent packs", "Annual vs monthly", "Custom enterprise quotes"] },
        { title: "Feature toggles", items: ["Plan-gated modules", "Org-level overrides", "Beta flag rollout", "Hard vs soft limits", "Telemetry-driven upsell"] },
        { title: "Billing", items: ["Tax & GST invoicing", "Metered AI token billing", "Usage-based overage", "Wallet & credits", "Multi-currency"] },
        { title: "Renewals & dunning", items: ["Auto-renewal scheduler", "Retry & grace windows", "Smart dunning emails", "Churn-risk scoring", "Win-back campaigns"] },
      ]}
      workflow={[
        "Organization subscribes to a plan via self-serve or sales-assisted quote.",
        "Feature toggle service activates plan-gated modules and AI quotas.",
        "Usage metered into billing engine; invoices issued on cycle boundary.",
        "Renewals processed automatically; failures enter dunning + CS workflow.",
      ]}
    />
  ),
});