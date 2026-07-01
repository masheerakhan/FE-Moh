import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/action-button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Sparkles, PlusCircle, FileText, Stethoscope, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { emrApi, scribeApi, patientApi, referralApi } from "@/lib/api";

export const Route = createFileRoute("/_app/doctor")({
  head: () => ({ meta: [{ title: "Doctor Workspace — Helix OS" }] }),
  component: DoctorWorkspace,
});

function DoctorWorkspace() {
  const [activePatient, setActivePatient] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [isScribeActive, setIsScribeActive] = useState<boolean>(false);
  const [doctorNotes, setDoctorNotes] = useState<string>("");

  const [soap, setSoap] = useState({
    subjective: "Patient reports occasional dull frontal headaches in the morning, c/o mild fatigue for 2 weeks. No chest pain, palpitations or visual disturbance. Adherent to Telmisartan 40mg OD.",
    objective: "BP 138/86 (consistent w/ HBPM avg 136/84). HR regular. Heart S1S2, no murmurs. Chest clear. No pedal edema.",
    assessment: "Essential hypertension, sub-optimally controlled. Pre-diabetes — HbA1c due. Dyslipidemia.",
    plan: "Up-titrate Telmisartan 40 → 80mg OD. Continue Atorvastatin 10mg. Order HbA1c, lipid panel, RFT. Lifestyle counseling. Review in 4 weeks.",
  });

  const [prescriptions, setPrescriptions] = useState([
    { drug: "Telmisartan 80 mg", dose: "1-0-0", days: "30 days", note: "↑ from 40 mg" },
    { drug: "Atorvastatin 10 mg", dose: "0-0-1", days: "30 days" },
    { drug: "Aspirin 75 mg", dose: "0-1-0", days: "30 days", warn: "Check bleeding risk" },
  ]);

  const [orders, setOrders] = useState([
    { t: "HbA1c", why: "Pre-diabetes review" },
    { t: "Lipid Profile", why: "Statin efficacy" },
    { t: "RFT (Urea, Creat, eGFR)", why: "Pre ACE/ARB up-titration" },
    { t: "Urine ACR", why: "Microalbuminuria screen" },
  ]);

  const loadPatient = async () => {
    try {
      const patients = await patientApi.getAll();
      if (patients && patients.length > 0) {
        // Fetch first patient or patient with name matching Aarav Mehta
        const aarav = patients.find((p) => p.first_name.toLowerCase().includes("aarav")) || patients[0];
        setActivePatient(aarav);
      }
    } catch (err) {
      console.error("Failed to load patient profile", err);
    }
  };

  useEffect(() => {
    loadPatient();
  }, []);

  const handleApplySuggestions = () => {
    toast.success("AI safety and Differential suggestions applied to EMR draft");
    setSoap((prev) => ({
      ...prev,
      plan: prev.plan + "\n- Monitor renal function closely (Telmisartan + Aspirin combination check).",
    }));
  };

  const handleStartScribe = async (v: Record<string, string>) => {
    try {
      const session = await scribeApi.startSession(v.language || "English + Hindi");
      setSessionId(session.session_id);
      setIsScribeActive(true);
      toast.success("AI Scribe listening", { description: `Session ID: ${session.session_id}` });

      // Simulate ambient transcription and Claude SOAP note synthesis after 5 seconds
      setTimeout(async () => {
        try {
          const transcription = "Patient says he gets morning headaches, feels a bit tired. BP measured is 138/86. Doctor says lets increase Telmisartan to 80mg and order HbA1c review.";
          const synthesized = await scribeApi.synthesizeSoapNote(transcription);
          
          setSoap({
            subjective: synthesized.subjective,
            objective: synthesized.objective,
            assessment: synthesized.assessment,
            plan: synthesized.plan,
          });

          // Run safety interaction checks
          const safety = await scribeApi.checkDrugSafety(["Telmisartan", "Aspirin"], activePatient?.id || "patient_id");
          if (safety.has_warning) {
            toast.warning("AI Safety Alert", { description: safety.warnings.join(", ") });
          }

          setIsScribeActive(false);
          toast.success("AI Chart Note Synthesized successfully", { description: "SOAP plan updated based on speech transcription." });
        } catch (err) {
          console.error("Simulated Claude note synthesis failed", err);
        }
      }, 5000);

    } catch (err: any) {
      toast.error("Failed to initialize scribe session");
    }
  };

  const saveConsultation = async () => {
    if (!activePatient) {
      toast.error("No active patient context resolved");
      return;
    }

    try {
      // 1. Create Encounter record
      const enc = await emrApi.createEncounter({
        patient: activePatient.id!,
        doctor: "EMP-RIYA", // Seeded Doctor's Employee code reference
        encounter_date: new Date().toISOString().split("T")[0],
        type: "Consultation",
        notes: doctorNotes || undefined,
      });

      // 2. Save SOAP note linked to Encounter
      await emrApi.saveSoapNote(enc.id!, {
        subjective: soap.subjective,
        objective: soap.objective,
        assessment: soap.assessment,
        plan: soap.plan,
      });

      // 3. Add Prescriptions
      for (const rx of prescriptions) {
        await emrApi.addPrescription({
          encounter: enc.id!,
          drug_name: rx.drug,
          dosage: rx.dose,
          duration_days: 30,
          instructions: rx.note || undefined,
          warnings: rx.warn || undefined,
        });
      }

      toast.success("Consultation saved and locked in EMR.");
    } catch (err: any) {
      toast.error("Failed to commit consultation records to EMR");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Consultation Workspace"
        subtitle={`In-room with ${activePatient ? `${activePatient.first_name} ${activePatient.last_name || ""}` : "Aarav Mehta"} · ${activePatient?.gender || "MALE"} · MRN ${activePatient ? activePatient.id?.slice(-8).toUpperCase() : "HX-2284913"}`}
        actions={
          <>
            <ActionButton
              label="Templates"
              icon={<FileText className="size-4" />}
              title="Apply consultation template"
              description="Pre-fill the SOAP note from a saved template."
              fields={[
                {
                  name: "template",
                  label: "Template name",
                  placeholder: "e.g. Hypertension follow-up",
                  defaultValue: "Hypertension follow-up",
                },
              ]}
              confirmLabel="Apply template"
              onConfirm={(v) => {
                setSoap({
                  subjective: "Patient reports occasional morning headaches. Fatigue mild.",
                  objective: "BP 136/84. Heart sounds normal. No edema.",
                  assessment: "Hypertension, stable on Telmisartan.",
                  plan: "Continue active therapy. Order basic lab review.",
                });
                toast.success(`Template “${v.template}” applied`);
              }}
            />
            <ActionButton
              primary
              label={isScribeActive ? "Scribe Active" : "Start AI Scribe"}
              icon={<Mic className="size-4" />}
              title="Start AI Scribe session"
              description="Begin ambient transcription. Audio is encrypted end-to-end."
              fields={[{ name: "language", label: "Language", defaultValue: "English + Hindi" }]}
              confirmLabel="Start session"
              onConfirm={handleStartScribe}
            />
            <ActionButton
              label="Refer Patient"
              icon={<PlusCircle className="size-4" />}
              title="Outbound Referral / Handoff"
              description="Cleanly route patient longitudinal records to external specialist networks."
              fields={[
                { name: "provider", label: "Target Provider", placeholder: "e.g. Dr. Amit Sharma · Cardiology" },
                { name: "facility", label: "Target Facility / Grid", placeholder: "e.g. Apollo Hospital Grid" },
                { name: "scope", label: "Handoff Scope", defaultValue: "FULL_RECORD" },
                { name: "reason", label: "Clinical Handoff Reason", type: "textarea", placeholder: "Reason for specialist referral" }
              ]}
              confirmLabel="Publish Handoff"
              onConfirm={async (v: Record<string, string>) => {
                try {
                  await referralApi.createReferral({
                    patient_id: activePatient?.id || "patient_id",
                    target_provider: v.provider,
                    target_facility: v.facility,
                    scope: v.scope === "ACTIVE_CASE_ONLY" ? "ACTIVE_CASE_ONLY" : "FULL_RECORD",
                    reason: v.reason,
                  });
                  toast.success(`Referral to ${v.provider} published successfully.`);
                } catch (err: any) {
                  toast.error("Failed to publish outbound referral");
                }
              }}
            />
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Patient Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                {activePatient ? activePatient.first_name[0] : "AM"}
              </div>
              <div>
                <div className="font-medium">
                  {activePatient ? `${activePatient.first_name} ${activePatient.last_name || ""}` : "Aarav Mehta"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activePatient?.gender || "MALE"} · O+ · 76 kg
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Row k="BP" v="138/86 mmHg" tone="warning" />
              <Row k="HR" v="82 bpm" />
              <Row k="SpO₂" v="98%" />
              <Row k="Temp" v="98.4 °F" />
              <Row k="BMI" v="26.4" tone="warning" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">Allergies</div>
              <Badge variant="outline" className="text-destructive border-destructive/40">
                Sulfa drugs
              </Badge>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">Active problems</div>
              <div className="space-y-1 text-sm">
                <div>• Essential hypertension (I10)</div>
                <div>• Pre-diabetes (R73.03)</div>
                <div>• Dyslipidemia (E78.5)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">SOAP Note · AI-drafted</CardTitle>
            {isScribeActive && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 animate-pulse">
                <Sparkles className="size-3 mr-1" /> Scribe listening...
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="soap">
              <TabsList>
                <TabsTrigger value="soap">SOAP</TabsTrigger>
                <TabsTrigger value="rx">Prescription</TabsTrigger>
                <TabsTrigger value="orders">Investigations</TabsTrigger>
              </TabsList>
              <TabsContent value="soap" className="mt-4 space-y-4">
                <Field
                  label="Subjective"
                  value={soap.subjective}
                  onChange={(val) => setSoap({ ...soap, subjective: val })}
                />
                <Field
                  label="Objective"
                  value={soap.objective}
                  onChange={(val) => setSoap({ ...soap, objective: val })}
                />
                <Field
                  label="Assessment"
                  value={soap.assessment}
                  onChange={(val) => setSoap({ ...soap, assessment: val })}
                />
                <Field
                  label="Plan"
                  value={soap.plan}
                  onChange={(val) => setSoap({ ...soap, plan: val })}
                />
              </TabsContent>
              <TabsContent value="rx" className="mt-4 space-y-2 text-sm">
                {prescriptions.map((rx, idx) => (
                  <RxRow
                    key={idx}
                    drug={rx.drug}
                    dose={rx.dose}
                    days={rx.days}
                    note={rx.note}
                    warn={rx.warn}
                  />
                ))}
              </TabsContent>
              <TabsContent value="orders" className="mt-4 space-y-2 text-sm">
                {orders.map((o, idx) => (
                  <OrderRow key={idx} t={o.t} why={o.why} />
                ))}
              </TabsContent>
            </Tabs>

            <div className="mt-6 border rounded-lg p-3 bg-muted/30">
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Stethoscope className="size-3.5" /> Doctor add-on
              </div>
              <Textarea
                placeholder="Free-text any additional findings…"
                className="bg-card mb-3"
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
              />
              <Button className="w-full" onClick={saveConsultation}>
                Lock & Save EMR Consultation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Clinical Copilot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Suggestion
              title="Differential"
              body="Primary HTN sub-optimal control. Rule out secondary causes if eGFR ↓ or K+ ↓."
            />
            <Suggestion
              title="Drug check"
              body="Telmisartan + Aspirin: monitor renal function. No allergy match."
              tone="warning"
            />
            <Suggestion
              title="Guideline"
              body="ACC/AHA 2023: target <130/80 in DM/CKD risk. Consider adding amlodipine 5mg if BP > 135/85 in 4w."
            />
            <Suggestion
              title="Patient education"
              body="Auto-send 'DASH diet + sodium <2g/day' via WhatsApp."
            />
            <Button variant="outline" size="sm" className="w-full" onClick={handleApplySuggestions}>
              <PlusCircle className="size-4 mr-1" /> Apply all suggestions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: "warning" | "success" }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={tone === "warning" ? "text-warning font-medium" : "font-medium"}>{v}</span>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function Field({ label, value, onChange }: FieldProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm leading-relaxed border rounded-md p-3 bg-muted/20 w-full"
      />
    </div>
  );
}

function RxRow({
  drug,
  dose,
  days,
  note,
  warn,
}: {
  drug: string;
  dose: string;
  days: string;
  note?: string;
  warn?: string;
}) {
  return (
    <div className="flex items-center justify-between border rounded-md px-3 py-2">
      <div>
        <div className="font-medium">{drug}</div>
        <div className="text-xs text-muted-foreground">
          {dose} · {days} {note && <span className="text-primary">· {note}</span>}
        </div>
      </div>
      {warn && (
        <Badge variant="outline" className="text-warning border-warning/40">
          <AlertTriangle className="size-3 mr-1" /> {warn}
        </Badge>
      )}
    </div>
  );
}

function OrderRow({ t, why }: { t: string; why: string }) {
  return (
    <div className="flex items-center justify-between border rounded-md px-3 py-2">
      <div>
        <div className="font-medium">{t}</div>
        <div className="text-xs text-muted-foreground">{why}</div>
      </div>
      <Badge variant="outline">Queued</Badge>
    </div>
  );
}

function Suggestion({ title, body, tone }: { title: string; body: string; tone?: "warning" }) {
  return (
    <div className={`border rounded-md p-3 ${tone === "warning" ? "border-warning/40 bg-warning/5" : ""}`}>
      <div className="text-xs font-semibold mb-1">{title}</div>
      <div className="text-xs text-muted-foreground leading-relaxed">{body}</div>
    </div>
  );
}