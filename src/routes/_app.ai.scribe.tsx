import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { Mic } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai/scribe")({
  head: () => ({ meta: [{ title: "AI Medical Scribe — MOH CLINICS" }] }),
  component: () => (
    <ModulePage title="AI Medical Scribe" icon={Mic} primaryAction="Open live session"
      subtitle="Ambient speech → SOAP notes + ICD-10 / CPT codes + draft prescription, reviewed by clinician."
      primaryActionFields={[
        { name: "doctor", label: "Doctor Name", placeholder: "e.g. Dr. Mehta" },
      ]}
      primaryActionConfirmLabel="Start Session"
      primaryActionOnConfirm={(v) => {
        toast.success(`Live scribe session started for ${v.doctor}`, { description: "Ambient listening active. SOAP note will auto-generate." });
      }}
      stats={[
        { label: "Notes drafted (24h)", value: "14,802", hint: "98% accepted" },
        { label: "Hours saved (24h)", value: "1,230" },
        { label: "WER (medical)", value: "4.2%" },
        { label: "ICD-10 F1", value: "0.94" },
      ]}
      sections={[
        { title: "Speech & language", items: ["Whisper-Medical ASR", "Speaker diarization", "Code-switched Hindi-English", "Noise robustness", "On-device fallback"] },
        { title: "Note generation", items: ["SOAP / DAP templates", "Specialty-aware prompts", "Patient memory (EMR)", "ICD-10 & CPT mapping", "Rx draft + safety check"] },
        { title: "Human in the loop", items: ["One-tap accept / edit", "Section confidence", "Diff → fine-tune", "Audit log + signature", "Patient summary export"] },
      ]}
      workflow={[
        "Doctor taps Start; audio streams to edge with E2E encryption.",
        "Whisper-Med transcribes with diarization; PII tagged in real time.",
        "RAG over EMR + guidelines builds context; Med-LLM drafts SOAP.",
        "ICD-10 / CPT mapped with top-K candidates and evidence pointers.",
        "Doctor reviews, edits, signs — diffs feed active-learning pipeline.",
        "Final note written to EMR, Rx queued to pharmacy, orders to lab.",
      ]}
    />
  ),
});