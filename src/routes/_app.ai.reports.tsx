import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { Brain } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai/reports")({
  head: () => ({ meta: [{ title: "AI Report Analysis — Helix OS" }] }),
  component: () => (
    <ModulePage title="AI Report Analysis" icon={Brain} primaryAction="Upload report"
      subtitle="PDF parsing, OCR, trend analysis, abnormality detection, risk scoring across labs & imaging."
      primaryActionFields={[
        { name: "report_type", label: "Report Type", placeholder: "e.g. Blood Panel CBC" },
      ]}
      primaryActionConfirmLabel="Upload & Analyze"
      primaryActionOnConfirm={(v) => {
        toast.success(`Report "${v.report_type}" analysis complete`, { description: "Key findings extracted. Abnormalities flagged." });
      }}
      stats={[
        { label: "Reports parsed (24h)", value: "3,120" },
        { label: "Critical alerts", value: "188" },
        { label: "OCR accuracy", value: "99.1%" },
        { label: "Trend models", value: "42" },
      ]}
      sections={[
        { title: "Ingestion", items: ["PDF / image / HL7 ORU", "Multi-lab parsers", "Layout-aware OCR", "FHIR mapping", "DICOM extraction"] },
        { title: "Analysis", items: ["Reference range checks", "Longitudinal trends", "Abnormality clustering", "Cardio/renal/hepatic risk", "Imaging triage"] },
        { title: "Action", items: ["Push to patient app", "Physician alert", "Suggest follow-up tests", "Care plan update", "Population dashboards"] },
      ]}
      workflow={[
        "Report uploaded; pipeline classifies type and parser.",
        "OCR + structure extraction → normalized FHIR Observations.",
        "Trend & abnormality models score risk to patient profile.",
        "Critical results alert physician + plain-language explainer to patient.",
      ]}
    />
  ),
});