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
  stats?: { label: string; value: string; hint?: string }[];
  sections: ModuleSection[];
  workflow?: string[];
  children?: React.ReactNode;
}

export function ModulePage({ title, subtitle, icon: Icon, primaryAction, primaryActionFields, primaryActionDescription, primaryActionConfirmLabel, stats, sections, workflow, children }: ModulePageProps) {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success(`${title} export queued`, { description: "CSV will be emailed when ready." })}>Export</Button>
            {primaryAction && (
              <ActionButton
                primary
                label={primaryAction}
                description={primaryActionDescription ?? `Trigger the ${primaryAction.toLowerCase()} workflow for ${title}.`}
                fields={primaryActionFields ?? [{ name: "notes", label: "Notes", placeholder: "Optional context", type: "textarea" }]}
                confirmLabel={primaryActionConfirmLabel ?? primaryAction}
                successMessage={() => `${primaryAction} — request submitted`}
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
                      <li key={it} className="flex gap-2"><CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" /><span>{it}</span></li>
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