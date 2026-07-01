import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bell, Search, Stethoscope, Users, Calendar, FileText, Receipt,
  Pill, FlaskConical, Video, Bot, Mic, Brain, HeartPulse, BarChart3,
  Building2, ShieldCheck, LayoutDashboard, UserRound, Sparkles,
  Palette, CreditCard, KeyRound, Crown,
  Flag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import mohLogo from "@/assets/moh-logo.png.asset.json";


const nav = [
  // { group: "Overview", items: [
  //   { to: "/", label: "Command Center", icon: LayoutDashboard },
  //   { to: "/clinics", label: "Multi-clinic", icon: Building2 },
  //   { to: "/analytics", label: "Analytics", icon: BarChart3 },
  // ]},
  // { group: "Clinical", items: [
  //   { to: "/doctor", label: "Doctor Workspace", icon: Stethoscope },
  //   { to: "/emr", label: "EMR", icon: FileText },
  //   { to: "/telemedicine", label: "Telemedicine", icon: Video },
  //   { to: "/lab", label: "Lab", icon: FlaskConical },
  //   { to: "/pharmacy", label: "Pharmacy", icon: Pill },
  // ]},
  { group: "Front Desk", items: [
    { to: "/reception", label: "Reception", icon: Users },
    // { to: "/appointments", label: "Appointments", icon: Calendar },
    // { to: "/billing", label: "Billing & Finance", icon: Receipt },
  ]},
  { group: "Patient", items: [
    { to: "/patient", label: "Patient App", icon: UserRound },
  ]},
  { group: "Enterprise", items: [
    { to: "/admin/super", label: "Super Admin", icon: Crown },
    { to: "/admin/org", label: "Organization Admin", icon: Building2 },
    { to: "/admin/clinic", label: "Clinic Admin", icon: LayoutDashboard },
    // { to: "/admin/features", label: "Feature Toggles", icon: Flag },
    // { to: "/whitelabel", label: "White Label", icon: Palette },
    // { to: "/subscriptions", label: "Subscriptions", icon: CreditCard },
    { to: "/rbac", label: "Advanced RBAC", icon: KeyRound },
  ]},
  // { group: "AI Layer", items: [
  //   { to: "/ai/receptionist", label: "AI Receptionist", icon: Bot },
  //   { to: "/ai/scribe", label: "AI Medical Scribe", icon: Mic },
  //   { to: "/ai/copilot", label: "AI Clinical Copilot", icon: Sparkles },
  //   { to: "/ai/reports", label: "AI Report Analysis", icon: Brain },
  //   { to: "/ai/care", label: "AI Care Coordinator", icon: HeartPulse },
  //   { to: "/ai/risk", label: "AI Risk Engine", icon: ShieldCheck },
  // ]},
];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="bg-white rounded-lg p-2 flex items-center justify-center">
            <img src={mohLogo.url} alt="MOH Clinics — Metabolic and Obesity Health" className="h-12 w-auto object-contain" />
          </div>
          <div className="mt-2 text-[11px] text-sidebar-foreground/70 text-center tracking-wide">
            Healthcare Operating System
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {nav.map((g) => (
            <div key={g.group}>
              <div className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">{g.group}</div>
              <div className="space-y-0.5">
                {g.items.map((it) => {
                  const active = pathname === it.to;
                  return (
                    <Link key={it.to} to={it.to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        active ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent text-sidebar-foreground/90"
                      }`}>
                      <it.icon className="size-4" />
                      {it.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60">
          HIPAA • DPDP • HL7/FHIR • SOC2
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card/80 backdrop-blur flex items-center px-4 gap-3 sticky top-0 z-10">
          <div className="relative flex-1 max-w-xl">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients, MRN, drugs, ICD-10…" className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:bg-card" />
          </div>
          <Badge variant="outline" className="hidden md:inline-flex gap-1 border-success/40 text-success">
            <span className="size-1.5 rounded-full bg-success" /> All systems nominal
          </Badge>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" />
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l">
            <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center text-xs font-semibold">DR</div>
            <div className="hidden sm:block text-xs leading-tight">
              <div className="font-medium">Dr. Riya Iyer</div>
              <div className="text-muted-foreground">Internal Medicine</div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
