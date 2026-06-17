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

export const Route = createFileRoute("/_app/doctor")({
  head: () => ({ meta: [{ title: "Doctor Workspace — Helix OS" }] }),
  component: DoctorWorkspace,
});

function DoctorWorkspace() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Consultation Workspace"
        subtitle="In-room with Aarav Mehta · 38M · MRN HX-2284913 · Last visit 12 days ago"
        actions={<>
          <ActionButton
            label="Templates"
            icon={<FileText className="size-4" />}
            title="Apply consultation template"
            description="Pre-fill the SOAP note from a saved template."
            fields={[{ name: "template", label: "Template name", placeholder: "e.g. Hypertension follow-up", defaultValue: "Hypertension follow-up" }]}
            confirmLabel="Apply template"
            successMessage={(v) => `Template “${v.template}” applied`}
          />
          <ActionButton
            primary
            label="Start AI Scribe"
            icon={<Mic className="size-4" />}
            title="Start AI Scribe session"
            description="Begin ambient transcription. Audio is encrypted end-to-end."
            fields={[{ name: "language", label: "Language", defaultValue: "English + Hindi" }]}
            confirmLabel="Start session"
            successMessage={() => "AI Scribe is now listening"}
            onConfirm={() => toast.info("Session ID: SCR-" + Math.floor(Math.random() * 90000 + 10000))}
          />
        </>}
      />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-3">
          <CardHeader><CardTitle className="text-base">Patient Snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">AM</div>
              <div>
                <div className="font-medium">Aarav Mehta</div>
                <div className="text-xs text-muted-foreground">38M · O+ · 76 kg</div>
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
              <Badge variant="outline" className="text-destructive border-destructive/40">Sulfa drugs</Badge>
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
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="size-3 mr-1" /> Scribe listening</Badge>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="soap">
              <TabsList>
                <TabsTrigger value="soap">SOAP</TabsTrigger>
                <TabsTrigger value="rx">Prescription</TabsTrigger>
                <TabsTrigger value="orders">Investigations</TabsTrigger>
              </TabsList>
              <TabsContent value="soap" className="mt-4 space-y-4">
                <Field label="Subjective" value="Patient reports occasional dull frontal headaches in the morning, c/o mild fatigue for 2 weeks. No chest pain, palpitations or visual disturbance. Adherent to Telmisartan 40mg OD." />
                <Field label="Objective" value="BP 138/86 (consistent w/ HBPM avg 136/84). HR regular. Heart S1S2, no murmurs. Chest clear. No pedal edema." />
                <Field label="Assessment" value="Essential hypertension, sub-optimally controlled. Pre-diabetes — HbA1c due. Dyslipidemia." />
                <Field label="Plan" value="Up-titrate Telmisartan 40 → 80mg OD. Continue Atorvastatin 10mg. Order HbA1c, lipid panel, RFT. Lifestyle counseling. Review in 4 weeks." />
              </TabsContent>
              <TabsContent value="rx" className="mt-4 space-y-2 text-sm">
                <RxRow drug="Telmisartan 80 mg" dose="1-0-0" days="30 days" note="↑ from 40 mg" />
                <RxRow drug="Atorvastatin 10 mg" dose="0-0-1" days="30 days" />
                <RxRow drug="Aspirin 75 mg" dose="0-1-0" days="30 days" warn="Check bleeding risk" />
              </TabsContent>
              <TabsContent value="orders" className="mt-4 space-y-2 text-sm">
                <OrderRow t="HbA1c" why="Pre-diabetes review" />
                <OrderRow t="Lipid Profile" why="Statin efficacy" />
                <OrderRow t="RFT (Urea, Creat, eGFR)" why="Pre ACE/ARB up-titration" />
                <OrderRow t="Urine ACR" why="Microalbuminuria screen" />
              </TabsContent>
            </Tabs>

            <div className="mt-6 border rounded-lg p-3 bg-muted/30">
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Stethoscope className="size-3.5" /> Doctor add-on</div>
              <Textarea placeholder="Free-text any additional findings…" className="bg-card" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-3">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Clinical Copilot</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Suggestion title="Differential" body="Primary HTN sub-optimal control. Rule out secondary causes if eGFR ↓ or K+ ↓." />
            <Suggestion title="Drug check" body="Telmisartan + Aspirin: monitor renal function. No allergy match." tone="warning" />
            <Suggestion title="Guideline" body="ACC/AHA 2023: target <130/80 in DM/CKD risk. Consider adding amlodipine 5mg if BP > 135/85 in 4w." />
            <Suggestion title="Patient education" body="Auto-send 'DASH diet + sodium <2g/day' via WhatsApp." />
            <Button variant="outline" size="sm" className="w-full"><PlusCircle className="size-4 mr-1" /> Apply all suggestions</Button>
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
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>
      <div className="text-sm leading-relaxed border rounded-md p-3 bg-muted/20">{value}</div>
    </div>
  );
}
function RxRow({ drug, dose, days, note, warn }: { drug: string; dose: string; days: string; note?: string; warn?: string }) {
  return (
    <div className="flex items-center justify-between border rounded-md px-3 py-2">
      <div>
        <div className="font-medium">{drug}</div>
        <div className="text-xs text-muted-foreground">{dose} · {days} {note && <span className="text-primary">· {note}</span>}</div>
      </div>
      {warn && <Badge variant="outline" className="text-warning border-warning/40"><AlertTriangle className="size-3 mr-1" /> {warn}</Badge>}
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