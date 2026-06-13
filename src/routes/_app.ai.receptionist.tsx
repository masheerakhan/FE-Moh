import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/ai/receptionist")({
  head: () => ({ meta: [{ title: "AI Receptionist — Helix OS" }] }),
  component: AIReceptionist,
});

const transcript = [
  { who: "Patient", t: "Hi, mujhe kal Dr. Iyer ke saath appointment chahiye." },
  { who: "AI", t: "Sure! Dr. Iyer (Internal Medicine) has 10:30 AM, 12:00 PM, and 4:15 PM open tomorrow at Apollo Bandra. Which works?" },
  { who: "Patient", t: "12 baje theek hai." },
  { who: "AI", t: "Booked 12:00 PM. Sending confirmation on WhatsApp. Anything else? Reminder for fasting labs perhaps?" },
];

function AIReceptionist() {
  return (
    <div className="space-y-6">
      <ModulePage
        title="AI Receptionist"
        subtitle="Voice + WhatsApp + IVR agent for appointment booking, FAQs, follow-ups, in 12 Indian languages."
        icon={Bot}
        primaryAction="Open agent console"
        stats={[
          { label: "Calls handled (24h)", value: "12,480", hint: "94% resolved" },
          { label: "Avg handle time", value: "1:42", hint: "vs human 4:10" },
          { label: "Booking conversion", value: "61%", hint: "+18 pts" },
          { label: "Languages live", value: "12", hint: "Hindi · Tamil · Bangla …" },
        ]}
        sections={[
          { title: "Channels", items: ["Voice (PSTN + SIP)", "WhatsApp Cloud API", "Web chat", "Instagram & Messenger", "Outbound campaigns"] },
          { title: "Skills", items: ["Book / reschedule / cancel", "Clinic FAQs & directions", "Insurance & document upload", "Symptom triage → specialty match", "Post-visit follow-up & NPS"] },
          { title: "Escalation", items: ["Confidence-based handoff", "Live agent whisper transcript", "Clinical red-flag → MD ping", "Payment dispute → Finance", "DPDP consent + recording opt-out"] },
        ]}
        workflow={[
          "Inbound call lands on telephony; speech-to-text via Whisper-medical with diarization.",
          "Intent + entity extraction routed to Claude/Llama with clinic-context tools (slots, doctors, packages).",
          "Agent confirms intent in patient's language, calls booking API, takes payment if required.",
          "Confidence threshold or red-flag keyword → silent handoff to human with full context.",
          "Conversation logged, PII redacted, summary written to EMR appointment notes."
        ]}
      />
      <div className="px-6 lg:px-8 -mt-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Live transcript · WhatsApp · Multilingual</CardTitle><Badge variant="outline" className="text-success border-success/40">Confidence 0.94</Badge></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {transcript.map((m, i) => (
              <div key={i} className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.who === "AI" ? "bg-primary/10 ml-auto" : "bg-muted"}`}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{m.who}</div>
                {m.t}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}