import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail, Lock, Building, ArrowRight, Activity } from "lucide-react";
import { axiosInstance } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — MOH CLINICS" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultProfiles = [
    {
      label: "Super Admin",
      email: "super.admin@helix.health",
      pass: "superPass",
      slug: "platform-hq",
      desc: "Platform Owner / System Controller"
    },
    {
      label: "Organization Admin",
      email: "org.admin@helix.health",
      pass: "orgPass",
      slug: "apollo-india",
      desc: "Corporate Coordinator"
    },
    {
      label: "Clinic Admin",
      email: "riya.iyer@helix.health",
      pass: "adminPass",
      slug: "apollo-bandra",
      desc: "Dr. Riya Iyer (Clinic Director)"
    },
    {
      label: "Receptionist",
      email: "anita.sen@helix.health",
      pass: "recepPass",
      slug: "apollo-bandra",
      desc: "Nurse Anita Sen (Front Desk)"
    },
    {
      label: "Doctor",
      email: "amit.sharma@helix.health",
      pass: "docPass",
      slug: "apollo-bandra",
      desc: "Dr. Amit Sharma (General Medicine)"
    },
    {
      label: "Patient",
      email: "pallavi.sarbahi@gmail.com",
      pass: "patientPass",
      slug: "apollo-bandra",
      desc: "Pallavi Sarbahi (Outpatient)"
    }
  ];

  const handleQuickLogin = (p: typeof defaultProfiles[0]) => {
    setEmail(p.email);
    setPassword(p.pass);
    setWorkspaceSlug(p.slug);
    toast.info(`Selected profile: ${p.label}`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !workspaceSlug) {
      toast.error("Please fill in email, password, and tenant slug.");
      return;
    }

    setLoading(true);
    try {
      const matchedProfile = defaultProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      const payloadRole = matchedProfile ? matchedProfile.label : undefined;

      // POST to backend token login endpoint
      const response = await axiosInstance.post("/accounts/login/", {
        email,
        password,
        workspace_slug: workspaceSlug,
        role: payloadRole
      });

      const { token, user } = response.data;
      
      // Save credentials & permissions payload to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("active_user", JSON.stringify(user));
      
      // Dispatch storage change event to force AppShell sidebar to recalculate routes
      window.dispatchEvent(new Event("storage_user_change"));

      toast.success("Welcome Back!", {
        description: `Successfully authenticated as ${user.name} (${user.role}).`
      });

      // Route dynamically to matching home workspace
      const r = user.role?.toLowerCase() || "";
      if (r === "patient") {
        navigate({ to: "/patient" });
      } else if (r === "receptionist" || r === "clinical staff") {
        navigate({ to: "/reception" });
      } else if (r === "doctor") {
        navigate({ to: "/doctor" });
      } else if (r === "organization admin") {
        navigate({ to: "/admin/org" });
      } else if (r === "super admin" || r === "superadmin") {
        navigate({ to: "/admin/super" });
      } else if (r === "clinic admin" || r === "clinicadmin") {
        navigate({ to: "/admin/clinic" });
      } else {
        navigate({ to: "/" });
      }
    } catch (err: any) {
      console.error("Backend authentication failed", err);
      toast.error("Authentication Failed", {
        description: err.response?.data?.error || err.response?.data?.detail || "Invalid email, password, or tenant workspace combination."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing rings */}
      <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-success/5 blur-3xl" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_420px] gap-8 items-center z-10">
        
        {/* Left Side: Info branding panel */}
        <div className="hidden md:flex flex-col space-y-6 text-white pr-8">
          <div className="flex items-center gap-2 text-primary font-bold text-lg uppercase tracking-wider">
            <Activity className="size-6 text-primary-glow animate-pulse" /> MOH CLINICS
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Metabolic & Obesity <br />
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Health Operations</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            Unifying patient clinics, EMR charting, automated 18% Indian GST invoice splits, and sovereign data residency compliance under DPDP guidelines.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-mono">
            <div className="border border-slate-800 bg-slate-900/40 p-3 rounded-lg">
              <div className="text-slate-500 uppercase">Residency Pinned</div>
              <div className="text-slate-300 font-bold mt-1">India Sovereign Cloud</div>
            </div>
            <div className="border border-slate-800 bg-slate-900/40 p-3 rounded-lg">
              <div className="text-slate-500 uppercase">RBAC Scope Isolation</div>
              <div className="text-slate-300 font-bold mt-1">BaseTenantModel (RLS)</div>
            </div>
          </div>
        </div>

        {/* Right Side: Login form */}
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur text-white shadow-2xl relative">
            <CardHeader className="space-y-1.5 pb-4 border-b border-slate-800">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" /> Sign in to workspace
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Enter your credentials to link context keys.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="slug" className="text-xs font-semibold text-slate-300">Tenant Workspace Slug</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <Input
                      id="slug"
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value)}
                      placeholder="e.g. apollo-bandra"
                      className="pl-9 h-10 bg-slate-950 border-slate-800 text-xs focus-visible:ring-primary text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="pl-9 h-10 bg-slate-950 border-slate-800 text-xs focus-visible:ring-primary text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pass" className="text-xs font-semibold text-slate-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <Input
                      id="pass"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 h-10 bg-slate-950 border-slate-800 text-xs focus-visible:ring-primary text-slate-100"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold text-xs mt-3 flex items-center justify-center gap-1.5 transition-all">
                  {loading ? "Verifying..." : "Access Workspace"} <ArrowRight className="size-4" />
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col border-t border-slate-800 pt-4 space-y-2 bg-slate-950/40 rounded-b-lg">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider self-start px-1">
                Demo Quick Links:
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {defaultProfiles.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleQuickLogin(p)}
                    className="border border-slate-800 hover:border-slate-700 bg-slate-900/60 p-2 rounded text-left transition-all active:scale-95 flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-bold text-slate-200">{p.label}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 truncate">{p.desc}</span>
                  </button>
                ))}
              </div>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}
