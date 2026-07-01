import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { ActionButton, type ActionField } from "@/components/action-button";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface ModuleSection {
  title: string;
  items: string[];
}

export interface ModulePageProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  primaryAction?: string;
  primaryActionFields?: ActionField[];
  primaryActionDescription?: string;
  primaryActionConfirmLabel?: string;
  primaryActionSuccessMessage?: (values: Record<string, string>) => string;
  primaryActionOnConfirm?: (values: Record<string, string>) => void;
  stats?: { label: string; value: string; hint?: string }[];
  sections: ModuleSection[];
  workflow?: string[];
  children?: React.ReactNode;
}

export function ModulePage({
  title,
  subtitle,
  icon: Icon,
  primaryAction,
  primaryActionFields,
  primaryActionDescription,
  primaryActionConfirmLabel,
  primaryActionSuccessMessage,
  primaryActionOnConfirm,
  stats,
  sections,
  workflow,
  children,
}: ModulePageProps) {
  const handleItemClick = (it: string) => {
    const responses: Record<string, { desc: string; msg: string }> = {
      "Real-time tenant health": { msg: "Tenant Health Status", desc: "Uptime: 99.98%. All tenant database boundaries verified active." },
      "Org-level uptime & SLA": { msg: "SLA Audits", desc: "SLA status: 100% compliance. 0 active SLA breaches." },
      "Geo distribution map": { msg: "Geo-Traffic", desc: "Top region: Maharashtra. Uptime map refreshed." },
      "Top-grossing organizations": { msg: "Revenue Ranking", desc: "Apollo Health Group (₹1.8 Cr MTD) leads platform ranking." },
      "Anomaly alerts": { msg: "Security Alerts", desc: "Zero security anomalies or brute force alerts in past 24 hours." },
      "Provision / suspend orgs": { msg: "Org Provisioner", desc: "Tenant setup checklist initialized for mock organization." },
      "Tenant isolation checks": { msg: "Isolation Audit", desc: "Pass. No cross-tenant database boundary violations detected." },
      "Move clinics between orgs": { msg: "Clinic Relocator", desc: "Relocation wizard active. Select target clinic to move." },
      "Data residency controls": { msg: "DPDP Residency", desc: "DPDP compliance checked: All Indian patient records reside in Mumbai." },
      "Tenant-aware backups": { msg: "Backup Manager", desc: "All 512 organizations backed up successfully at 03:00 UTC." },
      "Platform MRR / ARR": { msg: "MRR Tracker", desc: "MRR: ₹38.4 Cr | ARR: ₹460.8 Cr. Reconciliation complete." },
      "Per-plan revenue split": { msg: "Plan Contribution", desc: "Enterprise plans account for 78% of ARR, Pro 18%, Growth 4%." },
      "Churn cohort analysis": { msg: "Retention Analysis", desc: "Retention: 99.2% MTD. Churn cohort details calculated." },
      "Subscription overrides": { msg: "Billing Overrides", desc: "Subscription package override configurations loaded." },
      "Dunning workflows": { msg: "Dunning Status", desc: "Dunning active: 4 retries pending. Automated dunning emails queued." },
      "Per-org feature toggles": { msg: "Feature Flags", desc: "Feature flag matrix retrieved for active organizations." },
      "Beta program enrolment": { msg: "Beta Program", desc: "Enrollment criteria matched. 12 orgs currently in beta test." },
      "AI agent quotas": { msg: "AI Token Quotas", desc: "Quota usage: 812M / 1B tokens consumed (81.2% capacity)." },
      "Token usage budgeting": { msg: "Token Alerts", desc: "Budget limits set. Warnings will trigger at 90% allocation." },
      "Model routing policies": { msg: "Model Router", desc: "Default router active. Secondary fallback to backup model active." },
      "Impersonation w/ audit": { msg: "Audit Log Active", desc: "Super admin session impersonation logged to security trail." },
      "SLA-tracked ticket queue": { msg: "Support Queue", desc: "Queue status: 2 active support tickets. Average response: 8.5m." },
      "Immutable audit logs": { msg: "Audit Validation", desc: "Hash verification: checksum verified successfully." },
      "DPDP / HIPAA evidence": { msg: "Compliance Packages", desc: "HIPAA / DPDP audit documents compiled and ready for export." },
      "SOC2 trust center": { msg: "SOC2 Compliance", desc: "SOC2 Type II validation checks passed. Certificate valid." },
      "Brand-A / B / C partners": { msg: "White-Label Registry", desc: "White-label themes verified active across partners." },
      "Domain & cert health": { msg: "SSL Status", desc: "All domains active. Certificates auto-renewing successfully." },
      "Template library status": { msg: "Template Registry", desc: "18 document templates compiled and active." },
      "Co-branded billing": { msg: "Billing Systems", desc: "Partner billing integrations synchronized." },
      "Partner revenue share": { msg: "Revenue Share Ledger", desc: "Monthly payouts calculated: 15% partner share ledger compiled." }
    };

    const res = responses[it] || { msg: "Capability Activated", desc: `Simulation run successful for "${it}".` };
    toast.success(res.msg, { description: res.desc });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.success(`${title} export queued`, {
                  description: "CSV will be emailed when ready.",
                })
              }
            >
              Export
            </Button>
            {primaryAction && (
              <ActionButton
                primary
                label={primaryAction}
                description={
                  primaryActionDescription ??
                  `Trigger the ${primaryAction.toLowerCase()} workflow for ${title}.`
                }
                fields={
                  primaryActionFields ?? [
                    {
                      name: "notes",
                      label: "Notes",
                      placeholder: "Optional context",
                      type: "textarea",
                    },
                  ]
                }
                confirmLabel={primaryActionConfirmLabel ?? primaryAction}
                successMessage={primaryActionSuccessMessage}
                onConfirm={primaryActionOnConfirm}
              />
            )}
          </>
        }
      />


      <div className="flex items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium"><Icon className="size-3.5" /> {title}</span>
        <Badge variant="outline">HIPAA · DPDP · HL7/FHIR</Badge>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-semibold mt-1">{s.value}</div>
                {s.hint && <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {children}

      <Tabs defaultValue="features">
        <TabsList>
          <TabsTrigger value="features">Capabilities</TabsTrigger>
          {workflow && <TabsTrigger value="workflow">Workflow</TabsTrigger>}
        </TabsList>
        <TabsContent value="features" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((sec) => (
              <Card key={sec.title}>
                <CardHeader><CardTitle className="text-base">{sec.title}</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {sec.items.map((it) => (
                      <li key={it} onClick={() => handleItemClick(it)} className="flex gap-2 cursor-pointer hover:text-primary transition-colors"><CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" /><span>{it}</span></li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        {workflow && (
          <TabsContent value="workflow" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <ol className="space-y-4">
                  {workflow.map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">{i + 1}</div>
                      <div className="text-sm pt-1">{step}</div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}