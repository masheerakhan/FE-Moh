import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { risks } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/ai/risk")({
  head: () => ({ meta: [{ title: "AI Risk Engine — Helix OS" }] }),
  component: Risk,
});

function Risk() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="AI Risk Engine" subtitle="Predicts no-show, hospitalization, readmission, disease progression, medication non-adherence." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[["Models in prod","18"],["AUROC (avg)","0.87"],["Patients scored / day","2.1M"],["Interventions / day","18,420"]].map(([l,v]) => (
          <Card key={l}><CardContent className="p-5"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">High-risk patients</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {risks.map((r) => (
              <div key={r.patient} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div><div className="font-medium text-sm">{r.patient}</div><div className="text-xs text-muted-foreground">{r.risk} · {r.signal}</div></div>
                  <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15 font-mono">{r.score.toFixed(2)}</Badge>
                </div>
                <Progress value={r.score * 100} className="mt-2" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">ML architecture</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-3">
            {[
              ["1","Feature store","Patient, encounter, vitals, labs, claims — versioned in Feast on Postgres + S3."],
              ["2","Training","GBDT (LightGBM) + tabular transformers; longitudinal Temporal Fusion Transformer."],
              ["3","Serving","Online inference via FastAPI + Triton; batch scoring nightly to PGVector."],
              ["4","Monitoring","Drift, calibration, fairness tracked with Evidently."],
              ["5","Action","Risk streams to Care Coordinator + scheduler; SHAP explanations."],
            ].map(([n,t,d]) => (
              <div key={n} className="flex gap-3"><div className="size-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">{n}</div><div><div className="font-medium">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div></div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}