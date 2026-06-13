import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/_app/appointments")({
  head: () => ({ meta: [{ title: "Appointments — Helix OS" }] }),
  component: () => (
    <ModulePage
      title="Appointment Scheduling"
      subtitle="Online + walk-in + tele appointments across all clinics with smart slot allocation and AI no-show prediction."
      icon={Calendar}
      primaryAction="New Appointment"
      stats={[
        { label: "Booked today", value: "18,432", hint: "+12.4% WoW" },
        { label: "Tele share", value: "27%", hint: "+3 pts" },
        { label: "No-show risk flagged", value: "642", hint: "By AI Risk Engine" },
        { label: "Avg wait", value: "11 min", hint: "Across 4,820 clinics" },
      ]}
      sections={[
        { title: "Booking channels", items: ["Patient app + web", "WhatsApp / IVR / AI Receptionist", "Walk-in queue", "Doctor follow-up auto-book", "Referral inbox"] },
        { title: "Smart scheduling", items: ["Doctor templates + leaves", "Resource & room allocation", "Multi-clinic load balancing", "Recurring follow-ups", "Buffer & double-book rules"] },
        { title: "Reminders & no-shows", items: ["T-24h / T-2h reminders", "AI no-show probability score", "Auto-rebook waitlist", "Cancel / reschedule self-serve", "Deposit / hold-slot payments"] },
      ]}
      workflow={[
        "Patient initiates booking (app, web, WhatsApp, IVR, or AI Receptionist).",
        "System resolves clinic + doctor + slot with constraints (specialty, language, gender, in-clinic/tele).",
        "AI Risk Engine scores no-show probability; high-risk slots offered with deposit.",
        "Confirmation across SMS + WhatsApp + Email + Push; calendar invite generated.",
        "T-24h and T-2h reminders fire; self-serve reschedule available.",
        "On arrival, token issued and patient enters queue; tele patients enter waiting room.",
        "Post-visit: follow-up auto-suggested, feedback NPS captured, billing reconciled.",
      ]}
    />
  ),
});