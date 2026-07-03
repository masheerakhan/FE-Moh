import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { KeyRound, Plus, Trash2, Pencil, ShieldCheck, Lock } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection } from "@/lib/use-collection";
import { organizations, clinics, currentUser } from "@/lib/tenant-context";

export const Route = createFileRoute("/_app/rbac")({
  head: () => ({ meta: [{ title: "Advanced RBAC — MOH CLINICS" }] }),
  component: RbacPage,
});

// ---------------------------------------------------------------------------
// Permission catalog — every protected screen × action across the platform.
// In production this would come from a /api/rbac/catalog endpoint.
// ---------------------------------------------------------------------------
const ACTIONS = ["view", "create", "update", "delete", "sign", "export"] as const;
type Action = (typeof ACTIONS)[number];

const SCREENS: { module: string; screen: string; key: string }[] = [
  { module: "Patient", screen: "Patient Registration", key: "patient.registration" },
  { module: "Patient", screen: "Patient Profile", key: "patient.profile" },
  { module: "Patient", screen: "Medical Records", key: "patient.records" },
  { module: "Doctor", screen: "Consultation", key: "doctor.consult" },
  { module: "Doctor", screen: "Prescriptions", key: "doctor.rx" },
  { module: "Doctor", screen: "Investigations", key: "doctor.orders" },
  { module: "Reception", screen: "Appointments", key: "reception.appointments" },
  { module: "Reception", screen: "Queue & Tokens", key: "reception.queue" },
  { module: "Billing", screen: "Invoices", key: "billing.invoices" },
  { module: "Billing", screen: "Refunds", key: "billing.refunds" },
  { module: "Pharmacy", screen: "Inventory", key: "pharmacy.inventory" },
  { module: "Pharmacy", screen: "Dispense", key: "pharmacy.dispense" },
  { module: "Lab", screen: "Orders", key: "lab.orders" },
  { module: "Lab", screen: "Results", key: "lab.results" },
  { module: "Admin", screen: "Organizations", key: "admin.orgs" },
  { module: "Admin", screen: "Clinics", key: "admin.clinics" },
  { module: "Admin", screen: "Subscriptions", key: "admin.subscriptions" },
  { module: "Admin", screen: "Feature Flags", key: "admin.features" },
  { module: "Admin", screen: "RBAC", key: "admin.rbac" },
  { module: "AI", screen: "Scribe", key: "ai.scribe" },
  { module: "AI", screen: "Copilot", key: "ai.copilot" },
  { module: "AI", screen: "Risk Engine", key: "ai.risk" },
];

export type RoleScope = "platform" | "organization" | "clinic";

export interface Role {
  id: string;
  name: string;
  description: string;
  scope: RoleScope;
  organization_id?: string;
  clinic_id?: string;
  system: boolean;
  permissions: Record<string, Action[]>; // screen.key -> actions
  created_at: string;
  updated_at: string;
  updated_by: string;
}

const SEED_ROLES: Role[] = [
  {
    id: "role_super_admin",
    name: "Super Admin",
    description: "Full platform control — Super Admin Portal only.",
    scope: "platform",
    system: true,
    permissions: Object.fromEntries(SCREENS.map((s) => [s.key, [...ACTIONS]])),
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    updated_by: "system",
  },
  {
    id: "role_org_admin",
    name: "Organization Admin",
    description: "Manage clinics, doctors, staff and revenue across one organization.",
    scope: "organization",
    organization_id: "org_apollo",
    system: true,
    permissions: {
      "admin.orgs": ["view", "create", "update"],
      "admin.clinics": ["view", "create", "update", "delete"],
      "admin.subscriptions": ["view"],
      "admin.features": ["view", "update"],
      "admin.rbac": ["view", "create", "update", "delete"],
      "billing.invoices": ["view", "create", "update", "export"],
      "patient.registration": ["view", "create", "update"],
      "patient.profile": ["view", "update"],
      "reception.appointments": ["view", "create", "update", "delete"],
      "lab.orders": ["view", "create", "update"],
      "lab.results": ["view", "create", "update"],
    },
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    updated_by: "system",
  },
  {
    id: "role_doctor",
    name: "Doctor",
    description: "Consultations, prescriptions, investigations, EMR access.",
    scope: "clinic",
    organization_id: "org_apollo",
    clinic_id: "clinic_bandra",
    system: true,
    permissions: {
      "patient.profile": ["view", "update"],
      "patient.records": ["view", "create", "update", "sign"],
      "doctor.consult": ["view", "create", "update", "sign"],
      "doctor.rx": ["view", "create", "update", "sign"],
      "doctor.orders": ["view", "create"],
      "ai.scribe": ["view", "create"],
      "ai.copilot": ["view"],
    },
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    updated_by: "system",
  },
  {
    id: "role_receptionist",
    name: "Receptionist",
    description: "Front desk — registration, appointments, queue, billing.",
    scope: "clinic",
    organization_id: "org_apollo",
    clinic_id: "clinic_bandra",
    system: true,
    permissions: {
      "patient.registration": ["view", "create", "update"],
      "patient.profile": ["view"],
      "reception.appointments": ["view", "create", "update", "delete"],
      "reception.queue": ["view", "update"],
      "billing.invoices": ["view", "create"],
    },
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    updated_by: "system",
  },
];

export function RbacPage() {
  const { items: roles, create, update, remove } = useCollection<Role>("rbac_roles", SEED_ROLES);
  const [selectedId, setSelectedId] = useState<string>(roles[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const [activeUser, setActiveUser] = useState(() => {
    const saved = localStorage.getItem("active_user");
    return saved ? JSON.parse(saved) : currentUser;
  });

  useEffect(() => {
    const handleUserChange = () => {
      const saved = localStorage.getItem("active_user");
      if (saved) setActiveUser(JSON.parse(saved));
    };
    window.addEventListener("storage_user_change", handleUserChange);
    return () => window.removeEventListener("storage_user_change", handleUserChange);
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const role = activeUser.role?.toLowerCase() || "";
    const isAuthorized = ["super admin", "superadmin", "organization admin", "clinic admin"].includes(role);
    if (!isAuthorized) {
      toast.error("Access Forbidden", {
        description: "You do not possess system privileges to administer role matrix definitions."
      });
      navigate({ to: "/" });
    }
  }, [activeUser, navigate]);

  const isSuperAdmin = activeUser.role?.toUpperCase() === "SUPER ADMIN" || activeUser.role?.toUpperCase() === "SUPERADMIN";

  // Auto-restore Receptionist role if deleted or missing from the loaded list
  useEffect(() => {
    if (roles.length > 0) {
      const hasReceptionist = roles.some((r) => r.id === "role_receptionist");
      if (!hasReceptionist) {
        const receptionistRole = SEED_ROLES.find((r) => r.id === "role_receptionist");
        if (receptionistRole) {
          create(receptionistRole);
          toast.success("Restored system Receptionist role successfully.");
        }
      }
    }
  }, [roles, create]);

  const filtered = useMemo(
    () => roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [roles, search],
  );
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0];

  const togglePermission = (screenKey: string, action: Action) => {
    if (!selected) return;
    const current = selected.permissions[screenKey] ?? [];
    const next = current.includes(action) ? current.filter((a) => a !== action) : [...current, action];
    const nextPerms = { ...selected.permissions, [screenKey]: next };
    update(selected.id, { permissions: nextPerms, updated_at: new Date().toISOString(), updated_by: currentUser.name });
  };

  const handleSave = (role: Role) => {
    const isEdit = roles.some((r) => r.id === role.id);
    if (isEdit) {
      update(role.id, { ...role, updated_at: new Date().toISOString(), updated_by: currentUser.name });
      toast.success(`Role "${role.name}" updated`);
    } else {
      const created = create(role);
      setSelectedId(created.id);
      toast.success(`Role "${role.name}" created`);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (role: Role) => {
    remove(role.id);
    toast.success(`${role.system ? "System role" : "Role"} "${role.name}" deleted`);
    if (selectedId === role.id) setSelectedId(roles[0]?.id ?? "");
  };

  const cloneRole = (role: Role) => {
    const cloneTarget: Role = {
      ...role,
      id: crypto.randomUUID(),
      name: `${role.name} (Copy)`,
      system: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: currentUser.name,
    };
    setEditing(cloneTarget);
    setDialogOpen(true);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, typeof SCREENS>();
    SCREENS.forEach((s) => {
      const list = map.get(s.module) ?? [];
      list.push(s);
      map.set(s.module, list);
    });
    return Array.from(map.entries());
  }, []);

  // --------------------------------------------------------------------------
  // Custom permissions — user-defined rows added directly to the live matrix
  // --------------------------------------------------------------------------
  const [customPerms, setCustomPerms] = useState<{ module: string; screen: string; key: string }[]>([]);
  const [addPermOpen, setAddPermOpen] = useState(false);
  const [newPermModule, setNewPermModule] = useState("");
  const [newPermScreen, setNewPermScreen] = useState("");
  const [newPermKey, setNewPermKey] = useState("");

  const addCustomPermission = () => {
    const key = newPermKey.trim() || `${newPermModule.toLowerCase().replace(/\s+/g, ".")}.${newPermScreen.toLowerCase().replace(/\s+/g, "_")}`;
    if (!newPermModule.trim() || !newPermScreen.trim()) {
      toast.error("Module and Screen name are required");
      return;
    }
    if (SCREENS.some((s) => s.key === key) || customPerms.some((s) => s.key === key)) {
      toast.error(`Permission key "${key}" already exists`);
      return;
    }
    setCustomPerms((prev) => [...prev, { module: newPermModule.trim(), screen: newPermScreen.trim(), key }]);
    setNewPermModule("");
    setNewPermScreen("");
    setNewPermKey("");
    setAddPermOpen(false);
    toast.success(`Custom permission "${key}" added to matrix`);
  };

  const removeCustomPermission = (key: string) => {
    setCustomPerms((prev) => prev.filter((p) => p.key !== key));
    if (selected) {
      const { [key]: _, ...rest } = selected.permissions;
      update(selected.id, { permissions: rest, updated_at: new Date().toISOString(), updated_by: currentUser.name });
    }
    toast.success(`Custom permission "${key}" removed`);
  };

  // Group all screens (built-in + custom) for the matrix
  const allGrouped = useMemo(() => {
    const map = new Map<string, { module: string; screen: string; key: string; custom?: boolean }[]>();
    SCREENS.forEach((s) => {
      const list = map.get(s.module) ?? [];
      list.push(s);
      map.set(s.module, list);
    });
    customPerms.forEach((s) => {
      const list = map.get(s.module) ?? [];
      list.push({ ...s, custom: true });
      map.set(s.module, list);
    });
    return Array.from(map.entries());
  }, [customPerms]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Advanced RBAC" subtitle="Dynamic roles · screen-level · action-level · scoped to organization_id / clinic_id."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("rbac_roles");
                window.location.reload();
              }}
            >
              Reset to Defaults
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setEditing(null)}><Plus className="size-4 mr-1" /> New role</Button>
              </DialogTrigger>
              <RoleDialog initial={editing} onSave={handleSave} onCancel={() => { setDialogOpen(false); setEditing(null); }} />
            </Dialog>
          </div>
        } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total roles", String(roles.length)],
          ["Custom roles", String(roles.filter((r) => !r.system).length)],
          ["Permissions catalog", `${SCREENS.length} × ${ACTIONS.length}`],
          ["Tenant scope", `${organizations.length} orgs · ${clinics.length} clinics`],
        ].map(([l, v]) => (
          <Card key={l}><CardContent className="p-5"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Roles</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Search roles…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="space-y-1 max-h-[520px] overflow-y-auto">
              {filtered.map((r) => (
                <button key={r.id} onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm border transition ${selected?.id === r.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{r.name}</div>
                    {r.system ? <Badge variant="outline" className="text-[10px]">System</Badge> : <Badge className="text-[10px] bg-info/15 text-info hover:bg-info/15">Custom</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">{r.scope}{r.organization_id ? ` · ${organizations.find((o) => o.id === r.organization_id)?.name ?? r.organization_id}` : ""}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> {selected.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <Badge variant="outline" className="capitalize">Scope: {selected.scope}</Badge>
                  {selected.organization_id && <Badge variant="outline">organization_id: {selected.organization_id}</Badge>}
                  {selected.clinic_id && <Badge variant="outline">clinic_id: {selected.clinic_id}</Badge>}
                  <Badge variant="outline">Updated {new Date(selected.updated_at).toLocaleDateString()} by {selected.updated_by}</Badge>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => cloneRole(selected)}>Clone</Button>
                <Button size="sm" variant="outline" onClick={() => { setEditing(selected); setDialogOpen(true); }}><Pencil className="size-3.5 mr-1" /> Edit</Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(selected)}><Trash2 className="size-3.5 mr-1 text-destructive" /> Delete</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="matrix">
                <TabsList>
                  <TabsTrigger value="matrix">Permission matrix</TabsTrigger>
                  {isSuperAdmin && <TabsTrigger value="json">Policy JSON</TabsTrigger>}
                </TabsList>
                <TabsContent value="matrix" className="mt-4">
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-xs">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Module / Screen</th>
                          {ACTIONS.map((a) => <th key={a} className="px-2 py-2 capitalize font-medium">{a}</th>)}
                          <th className="w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {allGrouped.map(([mod, screens]) => (
                          <>
                            <tr key={`g-${mod}`} className="bg-muted/20">
                              <td colSpan={ACTIONS.length + 2} className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{mod}</td>
                            </tr>
                            {screens.map((s) => (
                              <tr key={s.key} className="border-t">
                                <td className="px-3 py-2">
                                  <span>{s.screen}</span>
                                  <span className="text-xs text-muted-foreground"> · {s.key}</span>
                                  {(s as any).custom && (
                                    <Badge className="ml-1.5 text-[9px] bg-info/15 text-info hover:bg-info/15 h-4 px-1">Custom</Badge>
                                  )}
                                </td>
                                {ACTIONS.map((a) => {
                                  const checked = (selected.permissions[s.key] ?? []).includes(a);
                                  return (
                                    <td key={a} className="px-2 py-2 text-center">
                                      <Checkbox checked={checked} onCheckedChange={() => togglePermission(s.key, a)} />
                                    </td>
                                  );
                                })}
                                <td className="px-1 py-2 text-center">
                                  {(s as any).custom && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-6 text-destructive hover:bg-destructive/10"
                                      onClick={() => removeCustomPermission(s.key)}
                                      title="Remove custom permission"
                                    >
                                      <Trash2 className="size-3" />
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Custom Permission inline form */}
                  {addPermOpen ? (
                    <div className="mt-3 border rounded-lg p-4 bg-muted/20 space-y-3">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <Lock className="size-3.5 text-primary" /> Add New Permission
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Module</Label>
                          <Input
                            value={newPermModule}
                            onChange={(e) => setNewPermModule(e.target.value)}
                            placeholder="e.g. Radiology"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Screen Name</Label>
                          <Input
                            value={newPermScreen}
                            onChange={(e) => setNewPermScreen(e.target.value)}
                            placeholder="e.g. DICOM Viewer"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Permission Key (auto-generated if blank)</Label>
                          <Input
                            value={newPermKey}
                            onChange={(e) => setNewPermKey(e.target.value)}
                            placeholder="e.g. radiology.dicom"
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setAddPermOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={addCustomPermission}>
                          <Plus className="size-3.5 mr-1" /> Add Permission
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full border-dashed text-muted-foreground hover:text-foreground"
                      onClick={() => setAddPermOpen(true)}
                    >
                      <Plus className="size-3.5 mr-1.5" /> Add New Permission
                    </Button>
                  )}
                </TabsContent>
                {isSuperAdmin && (
                  <TabsContent value="json" className="mt-4">
                    <pre className="bg-muted/40 rounded-md p-4 text-xs overflow-x-auto max-h-[480px]">
{JSON.stringify({ role: selected.name, scope: selected.scope, organization_id: selected.organization_id, clinic_id: selected.clinic_id, permissions: selected.permissions }, null, 2)}
                    </pre>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RoleDialog({ initial, onSave, onCancel }: { initial: Role | null; onSave: (r: Role) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [scope, setScope] = useState<RoleScope>(initial?.scope ?? "clinic");
  const [orgId, setOrgId] = useState<string>(initial?.organization_id ?? currentUser.organization_id);
  const [clinicId, setClinicId] = useState<string>(initial?.clinic_id ?? currentUser.clinic_id);
  const [permissions, setPermissions] = useState<Record<string, Action[]>>(initial?.permissions ?? {});
  const [customDialogScreens, setCustomDialogScreens] = useState<{ module: string; screen: string; key: string }[]>([]);
  const [addRowOpen, setAddRowOpen] = useState(false);
  const [newRowModule, setNewRowModule] = useState("");
  const [newRowScreen, setNewRowScreen] = useState("");
  const [newRowKey, setNewRowKey] = useState("");

  // Update form states if initial changes (e.g. edit/clone targets load)
  useEffect(() => {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setScope(initial?.scope ?? "clinic");
    setOrgId(initial?.organization_id ?? currentUser.organization_id);
    setClinicId(initial?.clinic_id ?? currentUser.clinic_id);
    setPermissions(initial?.permissions ?? {});
    setCustomDialogScreens([]);
  }, [initial]);

  const addDialogPermission = () => {
    const key = newRowKey.trim() || `${newRowModule.toLowerCase().replace(/\s+/g, ".")}.${newRowScreen.toLowerCase().replace(/\s+/g, "_")}`;
    if (!newRowModule.trim() || !newRowScreen.trim()) {
      toast.error("Module and Screen name are required");
      return;
    }
    if (SCREENS.some((s) => s.key === key) || customDialogScreens.some((s) => s.key === key)) {
      toast.error(`Permission key "${key}" already exists`);
      return;
    }
    setCustomDialogScreens((prev) => [...prev, { module: newRowModule.trim(), screen: newRowScreen.trim(), key }]);
    setNewRowModule("");
    setNewRowScreen("");
    setNewRowKey("");
    setAddRowOpen(false);
    toast.success(`Permission "${key}" added to role`);
  };

  const removeDialogPermission = (key: string) => {
    setCustomDialogScreens((prev) => prev.filter((p) => p.key !== key));
    const { [key]: _, ...rest } = permissions;
    setPermissions(rest);
  };

  const toggleLocalPermission = (screenKey: string, action: Action) => {
    const current = permissions[screenKey] ?? [];
    const next = current.includes(action) ? current.filter((a) => a !== action) : [...current, action];
    setPermissions({ ...permissions, [screenKey]: next });
  };

  const submit = () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    const role: Role = {
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      scope,
      organization_id: scope === "platform" ? undefined : orgId,
      clinic_id: scope === "clinic" ? clinicId : undefined,
      system: initial ? initial.system : false,
      permissions: permissions,
      created_at: initial?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: currentUser.name,
    };
    onSave(role);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{initial ? "Edit role details & permissions" : "Create custom role w/ permissions"}</DialogTitle>
      </DialogHeader>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-[400px]">
          <TabsTrigger value="info">1. Role Information</TabsTrigger>
          <TabsTrigger value="perms">2. Grant Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Role name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Senior Cardiology Resident" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this role can do…" />
          </div>
          <div className="flex items-center gap-2.5 p-3.5 border rounded-lg bg-muted/20">
            <Checkbox
              id="clinic-scope"
              checked={scope === "clinic"}
              onCheckedChange={(checked) => {
                setScope(checked ? "clinic" : "organization");
              }}
            />
            <div className="grid gap-1">
              <Label htmlFor="clinic-scope" className="text-xs font-bold cursor-pointer">
                Scope this role strictly to current Clinic branch
              </Label>
              <p className="text-[10px] text-muted-foreground">
                If checked, permissions apply only within your active clinic branch. If unchecked, the role acts as a global organization-level template.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="perms" className="mt-4 space-y-4">
          <div className="rounded-md border max-h-[380px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-xs sticky top-0 z-10">
                <tr className="border-b">
                  <th className="text-left px-3 py-2 font-medium bg-card">Module / Screen</th>
                  {ACTIONS.map((a) => <th key={a} className="px-2 py-2 capitalize font-medium bg-card">{a}</th>)}
                  <th className="w-8 bg-card" />
                </tr>
              </thead>
              <tbody>
                {/* Built-in screens */}
                {SCREENS.map((s) => (
                  <tr key={s.key} className="border-t">
                    <td className="px-3 py-2">
                      <div className="font-medium text-xs">{s.screen}</div>
                      <div className="text-[10px] text-muted-foreground">{s.module} · {s.key}</div>
                    </td>
                    {ACTIONS.map((a) => {
                      const checked = (permissions[s.key] ?? []).includes(a);
                      return (
                        <td key={a} className="px-2 py-2 text-center">
                          <Checkbox checked={checked} onCheckedChange={() => toggleLocalPermission(s.key, a)} />
                        </td>
                      );
                    })}
                    <td />
                  </tr>
                ))}
                {/* Custom screens */}
                {customDialogScreens.map((s) => (
                  <tr key={s.key} className="border-t bg-info/5">
                    <td className="px-3 py-2">
                      <div className="font-medium text-xs flex items-center gap-1.5">
                        {s.screen}
                        <Badge className="text-[9px] bg-info/15 text-info hover:bg-info/15 h-4 px-1">Custom</Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{s.module} · {s.key}</div>
                    </td>
                    {ACTIONS.map((a) => {
                      const checked = (permissions[s.key] ?? []).includes(a);
                      return (
                        <td key={a} className="px-2 py-2 text-center">
                          <Checkbox checked={checked} onCheckedChange={() => toggleLocalPermission(s.key, a)} />
                        </td>
                      );
                    })}
                    <td className="px-1 text-center">
                      <Button
                        variant="ghost" size="icon"
                        className="size-6 text-destructive hover:bg-destructive/10"
                        onClick={() => removeDialogPermission(s.key)}
                        title="Remove custom permission"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add custom permission row */}
          {addRowOpen ? (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-3">
              <div className="text-xs font-semibold flex items-center gap-2 text-primary">
                <Lock className="size-3.5" /> New Custom Permission
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Module</Label>
                  <Input value={newRowModule} onChange={(e) => setNewRowModule(e.target.value)} placeholder="e.g. Radiology" className="h-7 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Screen Name</Label>
                  <Input value={newRowScreen} onChange={(e) => setNewRowScreen(e.target.value)} placeholder="e.g. DICOM Viewer" className="h-7 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Key (auto if blank)</Label>
                  <Input value={newRowKey} onChange={(e) => setNewRowKey(e.target.value)} placeholder="e.g. radiology.dicom" className="h-7 text-xs font-mono" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddRowOpen(false)}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs" onClick={addDialogPermission}>
                  <Plus className="size-3 mr-1" /> Add
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed text-muted-foreground hover:text-foreground"
              onClick={() => setAddRowOpen(true)}
            >
              <Plus className="size-3.5 mr-1.5" /> Add New Permission
            </Button>
          )}
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-4 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>{initial ? "Save changes" : "Create role"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}