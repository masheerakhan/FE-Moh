import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_app/emr")({
  head: () => ({ meta: [{ title: "EMR — Helix OS" }] }),
  component: EMR,
});

const timeline = [
  { date: "13 Jun 2026", who: "Dr. Iyer · Internal Med", what: "Consultation · HTN follow-up", tag: "Consult" },
  { date: "01 Jun 2026", who: "Helix Labs", what: "Lipid Profile, HbA1c, RFT", tag: "Lab" },
  { date: "28 May 2026", who: "Helix Pharmacy", what: "Telmisartan 40mg · 30d refill", tag: "Rx" },
  { date: "12 Apr 2026", who: "Dr. Iyer", what: "Consultation · Annual review", tag: "Consult" },
  { date: "08 Apr 2026", who: "Helix Imaging", what: "ECG · Sinus rhythm, no abnormality", tag: "Imaging" },
  { date: "15 Mar 2026", who: "Apollo Vaccination Clinic", what: "Influenza vaccine", tag: "Vaccine" },
  { date: "02 Jan 2026", who: "Helix Labs", what: "CBC, LFT, TSH", tag: "Lab" },
];

export function EMR() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Electronic Medical Record"
        subtitle="Aarav Mehta · MRN HX-2284913 · Longitudinal record · FHIR R4 · ABDM linked"
        actions={<><Button variant="outline" size="sm"><Download className="size-4 mr-1" /> Export FHIR</Button><Button size="sm">Share with patient</Button></>} />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader><CardTitle className="text-base">Problem List</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {[
              ["I10", "Essential (primary) hypertension", "Active · since 2023"],
              ["E78.5", "Dyslipidemia, unspecified", "Active · since 2024"],
              ["R73.03", "Pre-diabetes", "Active · since 2025"],
              ["J45.909", "Asthma, unspecified (mild)", "Resolved · 2022"],
            ].map(([code, name, status]) => (
              <div key={code} className="flex items-start justify-between border rounded-md p-3">
                <div><div className="font-medium">{name}</div><div className="text-xs text-muted-foreground">{status}</div></div>
                <Badge variant="outline" className="font-mono text-[10px]">{code}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-8">
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Clinical timeline</CardTitle><Badge variant="outline" className="text-success border-success/40"><ShieldCheck className="size-3 mr-1" /> Audit logged</Badge></CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="consult">Consults</TabsTrigger><TabsTrigger value="lab">Labs</TabsTrigger><TabsTrigger value="rx">Rx</TabsTrigger></TabsList>
              <TabsContent value="all" className="mt-4">
                <ol className="relative border-l ml-3 space-y-5">
                  {timeline.map((t, i) => (
                    <li key={i} className="ml-6">
                      <span className="absolute -left-1.5 size-3 rounded-full bg-primary" />
                      <div className="text-xs text-muted-foreground">{t.date}</div>
                      <div className="font-medium text-sm">{t.what}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">{t.who} <Badge variant="outline" className="text-[10px]">{t.tag}</Badge></div>
                    </li>
                  ))}
                </ol>
              </TabsContent>
              <TabsContent value="consult" className="mt-4 text-sm text-muted-foreground">Filtered to Consults.</TabsContent>
              <TabsContent value="lab" className="mt-4 text-sm text-muted-foreground">Filtered to Labs.</TabsContent>
              <TabsContent value="rx" className="mt-4 text-sm text-muted-foreground">Filtered to Prescriptions.</TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="col-span-12">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="size-4" /> Data model · key entities</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {["patients","encounters","conditions","procedures","medications","allergies","immunizations","observations","diagnostic_reports","documents","care_plans","audit_log"].map((t) => (
              <div key={t} className="border rounded-md p-3 font-mono">{t}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}