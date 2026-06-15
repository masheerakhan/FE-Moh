import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Plus, Trash2, Pencil, ShieldCheck } from "lucide-react";
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
  head: () => ({ meta: [{ title: "Advanced RBAC — Helix OS" }] }),
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
      "admin.clinics": ["view", "create", "update"],
      "admin.subscriptions": ["view"],
      "admin.features": ["view", "update"],
      "admin.rbac": ["view", "create", "update"],
      "billing.invoices": ["view", "export"],
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

function RbacPage() {
  const { items: roles, create, update, remove } = useCollection<Role>("rbac_roles", SEED_ROLES);
  const [selectedId, setSelectedId] = useState<string>(roles[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const filtered = useMemo(
    () => roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [roles, search],
  );
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0];

  const togglePermission = (screenKey: string, action: Action) => {
    if (!selected) return;
    if (selected.system) {
      toast.error("System role permissions are read-only", { description: "Clone it to a custom role first." });
      return;
    }
    const current = selected.permissions[screenKey] ?? [];
    const next = current.includes(action) ? current.filter((a) => a !== action) : [...current, action];
    const nextPerms = { ...selected.permissions, [screenKey]: next };
    update(selected.id, { permissions: nextPerms, updated_at: new Date().toISOString(), updated_by: currentUser.name });
  };

  const handleSave = (role: Role) => {
    if (editing) {
      update(editing.id, { ...role, updated_at: new Date().toISOString(), updated_by: currentUser.name });
      toast.success(`Role "${role.name}" updated`);
    } else {
      create({ ...role, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), updated_by: currentUser.name });
      toast.success(`Role "${role.name}" created`);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (role: Role) => {
    if (role.system) {
      toast.error("System roles cannot be deleted");
      return;
    }
    remove(role.id);
    toast.success(`Role "${role.name}" deleted`);
    if (selectedId === role.id) setSelectedId(roles[0]?.id ?? "");
  };

  const cloneRole = (role: Role) => {
    const clone: Omit<Role, "id"> = {
      ...role,
      name: `${role.name} (Copy)`,
      system: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: currentUser.name,
    };
    const created = create(clone);
    setSelectedId(created.id);
    toast.success("Role cloned");
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

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Advanced RBAC" subtitle="Dynamic roles · screen-level · action-level · scoped to organization_id / clinic_id."
        actions={
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditing(null)}><Plus className="size-4 mr-1" /> New role</Button>
            </DialogTrigger>
            <RoleDialog initial={editing} onSave={handleSave} onCancel={() => { setDialogOpen(false); setEditing(null); }} />
          </Dialog>
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
                <Button size="sm" variant="outline" disabled={selected.system} onClick={() => { setEditing(selected); setDialogOpen(true); }}><Pencil className="size-3.5 mr-1" /> Edit</Button>
                <Button size="sm" variant="outline" disabled={selected.system} onClick={() => handleDelete(selected)}><Trash2 className="size-3.5 mr-1 text-destructive" /> Delete</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="matrix">
                <TabsList>
                  <TabsTrigger value="matrix">Permission matrix</TabsTrigger>
                  <TabsTrigger value="json">Policy JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="matrix" className="mt-4">
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-xs">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Module / Screen</th>
                          {ACTIONS.map((a) => <th key={a} className="px-2 py-2 capitalize font-medium">{a}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {grouped.map(([mod, screens]) => (
                          <>
                            <tr key={`g-${mod}`} className="bg-muted/20">
                              <td colSpan={ACTIONS.length + 1} className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{mod}</td>
                            </tr>
                            {screens.map((s) => (
                              <tr key={s.key} className="border-t">
                                <td className="px-3 py-2">{s.screen} <span className="text-xs text-muted-foreground">· {s.key}</span></td>
                                {ACTIONS.map((a) => {
                                  const checked = (selected.permissions[s.key] ?? []).includes(a);
                                  return (
                                    <td key={a} className="px-2 py-2 text-center">
                                      <Checkbox checked={checked} onCheckedChange={() => togglePermission(s.key, a)} disabled={selected.system} />
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                <TabsContent value="json" className="mt-4">
                  <pre className="bg-muted/40 rounded-md p-4 text-xs overflow-x-auto max-h-[480px]">
{JSON.stringify({ role: selected.name, scope: selected.scope, organization_id: selected.organization_id, clinic_id: selected.clinic_id, permissions: selected.permissions }, null, 2)}
                  </pre>
                </TabsContent>
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

  const submit = () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    const role: Role = {
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      scope,
      organization_id: scope === "platform" ? undefined : orgId,
      clinic_id: scope === "clinic" ? clinicId : undefined,
      system: false,
      permissions: initial?.permissions ?? {},
      created_at: initial?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: currentUser.name,
    };
    onSave(role);
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{initial ? "Edit role" : "Create custom role"}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Role name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Senior Cardiology Resident" />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this role can do…" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as RoleScope)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="platform">Platform</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="clinic">Clinic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {scope !== "platform" && (
            <div className="space-y-1.5">
              <Label>Organization</Label>
              <Select value={orgId} onValueChange={setOrgId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {organizations.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {scope === "clinic" && (
            <div className="space-y-1.5">
              <Label>Clinic</Label>
              <Select value={clinicId} onValueChange={setClinicId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {clinics.filter((c) => c.organization_id === orgId).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-start gap-2"><KeyRound className="size-3.5 mt-0.5" /> Permissions are edited from the matrix after the role is saved.</p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>{initial ? "Save changes" : "Create role"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}