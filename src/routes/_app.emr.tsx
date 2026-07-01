import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { emrApi, patientApi } from "@/lib/api";

export const Route = createFileRoute("/_app/emr")({
  head: () => ({ meta: [{ title: "EMR — Helix OS" }] }),
  component: EMR,
});

const defaultTimeline = [
  { date: "13 Jun 2026", who: "Dr. Iyer · Internal Med", what: "Consultation · HTN follow-up", tag: "Consult" },
  { date: "01 Jun 2026", who: "Helix Labs", what: "Lipid Profile, HbA1c, RFT", tag: "Lab" },
  { date: "28 May 2026", who: "Helix Pharmacy", what: "Telmisartan 40mg · 30d refill", tag: "Rx" },
  { date: "12 Apr 2026", who: "Dr. Iyer", what: "Consultation · Annual review", tag: "Consult" },
  { date: "08 Apr 2026", who: "Helix Imaging", what: "ECG · Sinus rhythm, no abnormality", tag: "Imaging" },
];

const defaultProblems = [
  ["I10", "Essential (primary) hypertension", "Active · since 2023"],
  ["E78.5", "Dyslipidemia, unspecified", "Active · since 2024"],
  ["R73.03", "Pre-diabetes", "Active · since 2025"],
];

export function EMR() {
  const [activePatient, setActivePatient] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>(defaultProblems);
  const [timeline, setTimeline] = useState<any[]>(defaultTimeline);

  const loadEMRData = async () => {
    try {
      const patients = await patientApi.getAll();
      if (patients && patients.length > 0) {
        const patient = patients.find((p) => p.first_name.toLowerCase().includes("aarav")) || patients[0];
        setActivePatient(patient);

        // Fetch conditions from backend EMR database
        const conds = await emrApi.getConditions(patient.id!);
        if (conds && conds.length > 0) {
          setProblems(conds.map((c) => [c.code, c.name, `${c.status} · onset ${c.onset_date || "2026"}`]));
        }

        // Fetch encounters/history
        const encs = await emrApi.getEncounters(patient.id!);
        if (encs && encs.length > 0) {
          const encTimeline = encs.map((e) => ({
            date: e.encounter_date,
            who: e.doctor || "Medical Practitioner",
            what: `${e.type} · ${e.notes || "Routine follow-up"}`,
            tag: "Consult",
          }));
          setTimeline([...encTimeline, ...defaultTimeline]);
        }
      }
    } catch (err) {
      console.error("Failed to load EMR records from backend", err);
    }
  };

  useEffect(() => {
    loadEMRData();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Electronic Medical Record"
        subtitle={`Patient: ${activePatient ? `${activePatient.first_name} ${activePatient.last_name || ""}` : "Aarav Mehta"} · MRN ${activePatient ? activePatient.id?.slice(-8).toUpperCase() : "HX-2284913"} · Longitudinal record · FHIR R4`}
        actions={
          <>
            <ActionButton
              label="Export FHIR"
              icon={<Download className="size-4" />}
              title="Export FHIR R4 bundle"
              description="Generates a signed FHIR R4 JSON bundle for the patient record."
              fields={[{ name: "scope", label: "Date range", defaultValue: "Last 5 years" }]}
              confirmLabel="Generate bundle"
              successMessage={() => "FHIR bundle generated · download link emailed"}
              onConfirm={() => toast.info("Bundle ID: FHIR-" + Date.now().toString().slice(-6))}
            />
            <ActionButton
              primary
              label="Share with patient"
              title="Share record with patient"
              description="Send a secure, time-limited link to the patient app."
              fields={[
                { name: "channel", label: "Channel", defaultValue: "WhatsApp + Email" },
                { name: "expires", label: "Expires in", defaultValue: "7 days" },
              ]}
              confirmLabel="Send"
              successMessage={(v) => `Record shared via ${v.channel}`}
            />
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Problem List</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {problems.map(([code, name, status]) => (
              <div key={code} className="flex items-start justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground">{status}</div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {code}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-8">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Clinical timeline</CardTitle>
            <Badge variant="outline" className="text-success border-success/40">
              <ShieldCheck className="size-3 mr-1" /> Audit logged
            </Badge>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="consult">Consults</TabsTrigger>
                <TabsTrigger value="lab">Labs</TabsTrigger>
                <TabsTrigger value="rx">Rx</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <ol className="relative border-l ml-3 space-y-5">
                  {timeline.map((t, i) => (
                    <li key={i} className="ml-6">
                      <span className="absolute -left-1.5 size-3 rounded-full bg-primary" />
                      <div className="text-xs text-muted-foreground">{t.date}</div>
                      <div className="font-medium text-sm">{t.what}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {t.who} <Badge variant="outline" className="text-[10px]">{t.tag}</Badge>
                      </div>
                    </li>
                  ))}
                </ol>
              </TabsContent>
              <TabsContent value="consult" className="mt-4 text-sm text-muted-foreground">
                Filtered to Consults.
              </TabsContent>
              <TabsContent value="lab" className="mt-4 text-sm text-muted-foreground">
                Filtered to Labs.
              </TabsContent>
              <TabsContent value="rx" className="mt-4 text-sm text-muted-foreground">
                Filtered to Prescriptions.
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="col-span-12">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4" /> Data model · key entities
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              "patients",
              "encounters",
              "conditions",
              "procedures",
              "medications",
              "allergies",
              "immunizations",
              "observations",
              "diagnostic_reports",
              "documents",
              "care_plans",
              "audit_log",
            ].map((t) => (
              <div key={t} className="border rounded-md p-3 font-mono">
                {t}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}