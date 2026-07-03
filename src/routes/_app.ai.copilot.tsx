import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai/copilot")({
  head: () => ({ meta: [{ title: "AI Clinical Copilot — MOH CLINICS" }] }),
  component: () => (
    <ModulePage title="AI Clinical Copilot" icon={Sparkles} primaryAction="Try on a case"
      subtitle="Diagnosis assistance, investigation suggestions, treatment recommendations, drug-interaction & allergy checks."
      primaryActionFields={[
        { name: "case_id", label: "Case / Patient ID", placeholder: "e.g. PAT-2026-0042" },
      ]}
      primaryActionConfirmLabel="Launch Copilot"
      primaryActionOnConfirm={(v) => {
        toast.success(`Copilot session started for ${v.case_id}`, { description: "Differential diagnosis engine active. Evidence loaded." });
      }}
      stats={[
        { label: "Cases assisted", value: "5,340" },
        { label: "Dx top-3 accuracy", value: "91%" },
        { label: "Interactions caught", value: "812" },
        { label: "Allergy alerts", value: "129" },
      ]}
      sections={[
        { title: "Reasoning", items: ["Differential diagnosis", "Bayesian ranking", "Guideline-grounded", "Specialty prompts", "Explainable trail"] },
        { title: "Safety", items: ["Drug-drug interaction", "Drug-allergy detection", "Renal/hepatic dose", "Pediatric/pregnancy gates", "Red-flag escalation"] },
        { title: "Workflow", items: ["Inline suggestions", "One-tap apply", "Cite source", "Override learning", "Patient summary"] },
      ]}
      workflow={[
        "Copilot subscribes to active SOAP draft + EMR snapshot.",
        "Builds differential list with evidence and guideline citations.",
        "Suggests investigations and treatment with cost / availability awareness.",
        "Runs safety checks before showing Rx.",
        "Doctor accepts / edits; overrides feed continuous learning.",
      ]}
    />
  ),
});