import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bell, Search, Stethoscope, Users, Calendar, FileText, Receipt,
  Pill, FlaskConical, Video, Bot, Mic, Brain, HeartPulse, BarChart3,
  Building2, ShieldCheck, LayoutDashboard, UserRound, Sparkles,
  Palette, CreditCard, KeyRound, Crown, Flag, RefreshCw, Key, UserPlus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import mohLogo from "@/assets/moh-logo.png.asset.json";
import { currentUser as defaultUser } from "@/lib/tenant-context";
import { useRBAC } from "@/components/rbac-guard";

// Definition of all possible system navigation paths
const navGroups = [
  { group: "Overview", items: [
    { to: "/", label: "Command Center", icon: LayoutDashboard },
    // Hidden from frontend:
    // { to: "/clinics", label: "Multi-clinic", icon: Building2 },
    // { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ]},
  { group: "Clinical", items: [
    { to: "/doctor", label: "Doctor Workspace", icon: Stethoscope },
    // Hidden from frontend:
    // { to: "/emr", label: "EMR", icon: FileText },
    { to: "/telemedicine", label: "Telemedicine", icon: Video },
    { to: "/lab", label: "Lab", icon: FlaskConical },
    { to: "/pharmacy", label: "Pharmacy", icon: Pill },
  ]},
  { group: "Front Desk", items: [
    { to: "/appointments", label: "Appointments", icon: Calendar },
    { to: "/patient-onboarding", label: "Patient Onboarding", icon: UserPlus },
    // Hidden from frontend:
    // { to: "/reception", label: "Reception", icon: Users },
    { to: "/billing", label: "Billing & Finance", icon: Receipt },
  ]},
  { group: "Patient", items: [
    // Hidden from frontend:
    // { to: "/patient", label: "Patient App", icon: UserRound },
    // { to: "/patient-widget", label: "Patient Snapshot", icon: UserRound },
  ]},
  { group: "Enterprise", items: [
    { to: "/admin/super", label: "Super Admin", icon: Crown },
    { to: "/admin/org", label: "Organization Admin", icon: Building2 },
    { to: "/admin/clinic", label: "Clinic Admin", icon: LayoutDashboard },
    // Hidden from frontend:
    // { to: "/admin/features", label: "Feature Toggles", icon: Flag },
    // { to: "/whitelabel", label: "White Label", icon: Palette },
    { to: "/subscriptions", label: "Subscriptions", icon: CreditCard },
    { to: "/rbac", label: "Advanced RBAC", icon: KeyRound },
  ]},
  { group: "AI Layer", items: [
    { to: "/ai/receptionist", label: "AI Receptionist", icon: Bot },
    { to: "/ai/scribe", label: "AI Medical Scribe", icon: Mic },
    { to: "/ai/copilot", label: "AI Clinical Copilot", icon: Sparkles },
    { to: "/ai/reports", label: "AI Report Analysis", icon: Brain },
    { to: "/ai/care", label: "AI Care Coordinator", icon: HeartPulse },
    { to: "/ai/risk", label: "AI Risk Engine", icon: ShieldCheck },
  ]},
];

// Mock database of users by role for demo login switching
const SYSTEM_MOCK_USERS = [
  {
    id: "user_super_admin",
    name: "Super Admin Owner",
    email: "super.admin@helix.health",
    organization_id: "org_apollo",
    clinic_id: null,
    role: "Super Admin",
    specialization: "System Controller"
  },
  {
    id: "user_org_admin",
    name: "Corporate Admin",
    email: "org.admin@helix.health",
    organization_id: "org_apollo",
    clinic_id: null,
    role: "Organization Admin",
    specialization: "Corporate Coordinator"
  },
  {
    id: "user_riya",
    name: "Dr. Riya Iyer",
    email: "riya.iyer@helix.health",
    organization_id: "org_apollo",
    clinic_id: "clinic_bandra",
    role: "Clinic Admin",
    specialization: "Clinic Director"
  },
  {
    id: "user_anita",
    name: "Nurse Anita Sen",
    email: "anita.sen@helix.health",
    organization_id: "org_apollo",
    clinic_id: "clinic_bandra",
    role: "Receptionist",
    specialization: "Front Desk Supervisor"
  },
  {
    id: "user_amit",
    name: "Dr. Amit Sharma",
    email: "amit.sharma@helix.health",
    organization_id: "org_apollo",
    clinic_id: "clinic_bandra",
    role: "Doctor",
    specialization: "General Medicine"
  },
  {
    id: "user_pallavi",
    name: "Pallavi Sarbahi",
    email: "pallavi.sarbahi@gmail.com",
    organization_id: "org_apollo",
    clinic_id: "clinic_bandra",
    role: "Patient",
    specialization: "Outpatient"
  }
];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { permissions, userContext } = useRBAC();

  const [activeUser, setActiveUser] = useState(() => {
    const saved = localStorage.getItem("active_user");
    return saved ? JSON.parse(saved) : defaultUser;
  });

  // Keep state synced with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("active_user");
      if (saved) {
        setActiveUser(JSON.parse(saved));
      }
    };
    window.addEventListener("storage_user_change", handleStorageChange);
    return () => window.removeEventListener("storage_user_change", handleStorageChange);
  }, []);

  // Handle active user switching
  const handleUserSwitch = (userId: string) => {
    const targetUser = SYSTEM_MOCK_USERS.find((u) => u.id === userId);
    if (!targetUser) return;
    
    // Save to localStorage and dispatch event to trigger Route Guard updates
    localStorage.setItem("token", `dummy_jwt_token_${targetUser.id}`);
    localStorage.setItem("active_user", JSON.stringify(targetUser));
    setActiveUser(targetUser);
    window.dispatchEvent(new Event("storage_user_change"));

    toast.success("Role Switched Successfully", {
      description: `Logged in as: ${targetUser.name} (${targetUser.role})`
    });

    // Auto-redirect to appropriate homepage
    if (targetUser.role === "Patient") {
      navigate({ to: "/patient" });
    } else if (targetUser.role === "Receptionist") {
      navigate({ to: "/reception" });
    } else if (targetUser.role === "Doctor") {
      navigate({ to: "/doctor" });
    } else if (targetUser.role === "Organization Admin") {
      navigate({ to: "/admin/org" });
    } else if (targetUser.role === "Super Admin") {
      navigate({ to: "/admin/super" });
    } else if (targetUser.role === "Clinic Admin") {
      navigate({ to: "/admin/clinic" });
    } else {
      navigate({ to: "/" });
    }
  };

  const hasPermission = (permCode: string): boolean => {
    const userPerms = activeUser.permissions || [];
    return userPerms.includes(permCode);
  };

  const filteredNav = navGroups.map((group) => {
    const filteredItems = group.items.filter((item) => {
      const role = (userContext?.role || activeUser.role || "").toLowerCase();
      const userModules = permissions?.modules?.map((m) => m.toLowerCase()) || [];

      // SUPER ADMIN MASTER BYPASS RULE: Super Admin gets unconditional access to all sidebar items
      if (role === "super admin" || role === "superadmin") {
        return true;
      }

      // 1. Patient Profile constraints
      if (role === "patient") {
        return ["/patient", "/patient-widget"].includes(item.to);
      }

      // 2. Receptionist / Clinical Staff constraints
      if (["receptionist", "clinical staff"].includes(role)) {
        return ["/reception", "/appointments", "/billing"].includes(item.to);
      }

      // 2.5. Clinic Admin constraints
      if (role === "clinic admin" || role === "clinicadmin") {
        // EMR / Medical Records bypass check
        if (item.to === "/emr" && (userModules.includes("emr") || userModules.includes("medical_records") || hasPermission("can_parse_vitals"))) {
          return true;
        }

        if (["/patient", "/patient-widget", "/reception", "/appointments", "/billing", "/patient-onboarding"].includes(item.to)) {
          return false;
        }
        return ["/", "/clinics", "/admin/clinic", "/analytics", "/rbac"].includes(item.to);
      }

      // 3. Command Center (root /) constraints
      if (item.to === "/") {
        return ["super admin", "superadmin", "organization admin", "clinic admin", "clinicadmin"].includes(role);
      }

      // 4. Default permission-based gates

      // Super Admin only routes
      if (["/admin/super", "/whitelabel", "/subscriptions", "/admin/features"].includes(item.to)) {
        return userModules.includes("admin") || hasPermission("can_define_rbac_boundaries");
      }
      
      // Org Admin + Super Admin routes
      if (["/clinics", "/admin/org"].includes(item.to)) {
        return userModules.includes("admin") || hasPermission("can_define_rbac_boundaries");
      }

      if (["/analytics"].includes(item.to)) {
        return userModules.includes("analytics") || hasPermission("can_view_billing_consolidation");
      }

      if (["/rbac", "/admin/rbac"].includes(item.to)) {
        return (
          ["organization admin", "clinic admin", "clinicadmin"].includes(role) ||
          userModules.includes("rbac") ||
          hasPermission("can_manage_clinic_rbac")
        );
      }
      
      // Clinic Admin + Org Admin + Super Admin routes
      if (["/admin/clinic"].includes(item.to)) {
        return userModules.includes("admin") || hasPermission("can_manage_clinic_rbac");
      }
      
      // Front Desk / Receptionist routes
      if (["/reception"].includes(item.to)) {
        return userModules.includes("reception") || hasPermission("can_manage_patients");
      }

      if (["/patient-onboarding"].includes(item.to)) {
        return userModules.includes("reception") || hasPermission("can_manage_patients") || role === "receptionist";
      }

      if (["/appointments"].includes(item.to)) {
        return userModules.includes("scheduling") || hasPermission("can_schedule_appointments");
      }

      if (["/billing"].includes(item.to)) {
        return userModules.includes("billing") || hasPermission("can_issue_gst_invoices");
      }
      
      // Doctor / Clinical routes
      if (["/doctor", "/emr", "/telemedicine"].includes(item.to)) {
        if (["receptionist", "clinical staff"].includes(role)) return false;
        return userModules.includes("emr") || hasPermission("can_parse_vitals") || role === "doctor";
      }

      if (["/lab", "/pharmacy"].includes(item.to)) {
        return userModules.includes("lab") || userModules.includes("pharmacy") || hasPermission("can_paste_unstructured_labs");
      }

      if (item.to.startsWith("/ai/")) {
        if (["receptionist", "clinical staff"].includes(role)) return false;
        return userModules.includes("ai");
      }
      
      // Patient routes
      if (["/patient", "/patient-widget"].includes(item.to)) {
        return ["super admin", "superadmin", "organization admin", "clinic admin", "doctor"].includes(role);
      }
      
      return true;
    });

    return { ...group, items: filteredItems };
  }).filter((group) => group.items.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar navigation */}
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
          {filteredNav.map((g) => (
            <div key={g.group}>
              <div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">{g.group}</div>
              <div className="space-y-0.5">
                {g.items.map((it) => {
                  const active = pathname === it.to;
                  return (
                    <Link key={it.to} to={it.to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors sidebar-nav-link ${
                        active ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "hover:bg-sidebar-accent text-sidebar-foreground/90"
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
        <div className="p-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60 flex items-center justify-between">
          <span>HIPAA • DPDP • SOC2</span>
          <Badge variant="outline" className="text-[9px] h-4 bg-primary/10 text-primary uppercase border-primary/20">
            {activeUser.role.split(" ")[0]}
          </Badge>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b bg-card/80 backdrop-blur flex items-center px-4 gap-3 justify-between sticky top-0 z-10">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients, MRN, clinics, records..." className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:bg-card text-xs" />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Real-time Dynamic Role Switcher Dropdown */}
            <div className="flex items-center gap-1.5 border bg-muted/20 px-2 py-1 rounded-md text-xs font-semibold mr-2">
              <Key className="size-3.5 text-primary" />
              <label htmlFor="role-select" className="text-muted-foreground mr-1 text-[11px]">Role Switcher:</label>
              <select
                id="role-select"
                value={activeUser.id}
                onChange={(e) => handleUserSwitch(e.target.value)}
                className="bg-transparent border-0 font-bold focus:ring-0 cursor-pointer text-xs"
              >
                {SYSTEM_MOCK_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <Badge variant="outline" className="hidden md:inline-flex gap-1 border-success/40 text-success bg-success/5 text-[10px]">
              <span className="size-1.5 rounded-full bg-success" /> Nominals active
            </Badge>

            <Button variant="ghost" size="icon" className="relative size-8">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" />
            </Button>
            
            <div className="flex items-center gap-2 pl-2 border-l">
              <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {(userContext?.name || activeUser.name).split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-[11px] leading-tight">
                <div className="font-semibold text-foreground">{userContext?.name || activeUser.name}</div>
                <div className="text-muted-foreground">{userContext?.role || activeUser.role}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] text-destructive hover:bg-destructive/10 h-7 px-2 ml-1"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("active_user");
                  toast.success("Logged out successfully");
                  navigate({ to: "/login" });
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
