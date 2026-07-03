import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { Palette } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/whitelabel")({
  head: () => ({ meta: [{ title: "White Label — MOH CLINICS" }] }),
  component: () => (
    <ModulePage title="White Label Management" icon={Palette} primaryAction="New brand partner"
      subtitle="Run Brand A, B, C and beyond on one codebase — isolated branding, domains, users, configuration and messaging templates per tenant."
      primaryActionFields={[
        { name: "brand", label: "Brand Name", placeholder: "e.g. HealthFirst" },
        { name: "domain", label: "Custom Domain", placeholder: "e.g. app.healthfirst.in" },
        { name: "contact", label: "Partner Contact Email", placeholder: "partner@example.com", type: "email" },
      ]}
      primaryActionConfirmLabel="Onboard Partner"
      primaryActionOnConfirm={(v) => {
        toast.success(`Brand partner "${v.brand}" onboarded`, { description: `Domain: ${v.domain} · Contact: ${v.contact}` });
      }}
      stats={[
        { label: "Brand partners", value: "27" },
        { label: "Custom domains live", value: "412" },
        { label: "Template variants", value: "1,284" },
        { label: "Tenant isolation", value: "100%" },
      ]}
      sections={[
        { title: "Visual identity", items: ["Custom logo & favicon", "Primary / accent palette", "Light & dark theme tokens", "Typography presets", "Login & patient-app skinning"] },
        { title: "Domain & deliverability", items: ["Custom domain + SSL", "Reverse-proxy routing", "SPF / DKIM / DMARC per tenant", "Sender ID provisioning", "Health & cert monitoring"] },
        { title: "Messaging templates", items: ["Email templates (transactional + marketing)", "SMS templates", "WhatsApp HSM templates", "Per-language variants", "Approval workflows"] },
        { title: "Configuration", items: ["Feature toggle overrides", "AI agent persona / voice", "Patient-app modules per brand", "Legal / consent text", "Tenant-scoped seeds"] },
        { title: "Isolation & compliance", items: ["organization_id on every row", "Row-level security policies", "Per-tenant encryption keys (KMS)", "Cross-tenant audit", "DPDP residency tagging"] },
      ]}
      workflow={[
        "Partner onboarding wizard captures brand assets, domain and locale.",
        "Tenant provisioned with isolated schema scope and KMS key.",
        "Template library cloned from base; partner edits in WYSIWYG editor.",
        "Domain DNS verified → SSL issued → patient app reachable on brand URL.",
        "All notifications (WhatsApp / Email / SMS) routed through partner sender IDs.",
      ]}
    />
  ),
});