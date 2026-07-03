import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { HeartPulse } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai/care")({
  head: () => ({ meta: [{ title: "AI Care Coordinator — MOH CLINICS" }] }),
  component: () => (
    <ModulePage title="AI Care Coordinator" icon={HeartPulse} primaryAction="View cohorts"
      subtitle="Chronic disease monitoring, medication adherence, WhatsApp follow-ups, symptom tracking & escalation."
      primaryActionFields={[
        { name: "cohort", label: "Cohort Name", placeholder: "e.g. Diabetes Type-2 High Risk" },
      ]}
      primaryActionConfirmLabel="View Cohort"
      primaryActionOnConfirm={(v) => {
        toast.success(`Cohort "${v.cohort}" loaded`, { description: "42 patients matched. Care pathways displayed." });
      }}
      stats={[
        { label: "Patients enrolled", value: "412,820" },
        { label: "Adherence", value: "84%", hint: "+11 pts" },
        { label: "Escalations (24h)", value: "1,084" },
        { label: "WhatsApp msgs", value: "1.4M / day" },
      ]}
      sections={[
        { title: "Programs", items: ["Diabetes", "Hypertension", "CHF / CAD", "Asthma / COPD", "Maternity & pediatric"] },
        { title: "Engagement", items: ["WhatsApp check-ins", "Vitals capture", "Med-time nudges", "Lifestyle missions", "Caregiver loop"] },
        { title: "Escalation", items: ["Threshold → nurse call", "Symptom + comorbidity → MD", "Missed meds 3d → coordinator", "ER risk → navigator", "Auto-book follow-up"] },
      ]}
      workflow={[
        "Doctor enrolls patient at discharge or in OPD.",
        "Agent schedules personalized daily check-ins on WhatsApp.",
        "Rule engine + LLM assess vitals / answers.",
        "Breaches escalate to nurse / physician with full context.",
        "Outcomes feed AI Risk Engine to refine cohorts.",
      ]}
    />
  ),
});