import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Flag, Plus, Trash2, History, Search } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection } from "@/lib/use-collection";
import { organizations, currentUser } from "@/lib/tenant-context";

export const Route = createFileRoute("/_app/admin/features")({
  head: () => ({ meta: [{ title: "Feature Management — MOH CLINICS" }] }),
  component: FeaturesPage,
});

type Stage = "ga" | "beta" | "alpha" | "internal";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  stage: Stage;
  default_enabled: boolean;
  /** organization_id -> enabled */
  overrides: Record<string, boolean>;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  organization_id?: string;
  feature_key: string;
  action: "created" | "deleted" | "default_changed" | "override_set" | "override_cleared" | "stage_changed";
  from?: string | boolean;
  to?: string | boolean;
  note?: string;
}

const SEED_FLAGS: FeatureFlag[] = [
  { id: "ff_1", key: "ai.scribe", name: "AI Medical Scribe", description: "Ambient SOAP note generation with ICD-10 mapping.", stage: "ga", default_enabled: true, overrides: { org_aiims: false }, created_at: "2025-02-12T10:00:00Z", updated_at: "2025-05-04T08:11:00Z", updated_by: "Platform Ops" },
  { id: "ff_2", key: "ai.copilot", name: "AI Clinical Copilot", description: "Differential diagnosis & guideline assistance.", stage: "beta", default_enabled: false, overrides: { org_apollo: true, org_fortis: true }, created_at: "2025-03-01T10:00:00Z", updated_at: "2025-05-10T08:11:00Z", updated_by: "Platform Ops" },
  { id: "ff_3", key: "telemedicine.recording", name: "Tele consult recording", description: "Encrypted recording with patient consent.", stage: "ga", default_enabled: true, overrides: {}, created_at: "2025-01-09T10:00:00Z", updated_at: "2025-04-18T08:11:00Z", updated_by: "Platform Ops" },
  { id: "ff_4", key: "whatsapp.outbound.marketing", name: "WhatsApp marketing templates", description: "Promotional HSM templates beyond transactional.", stage: "alpha", default_enabled: false, overrides: { org_max: true }, created_at: "2025-04-22T10:00:00Z", updated_at: "2025-05-22T08:11:00Z", updated_by: "Platform Ops" },
  { id: "ff_5", key: "billing.gst.einvoice", name: "GST e-Invoice generation", description: "IRN + QR code on invoices > ₹50k.", stage: "ga", default_enabled: true, overrides: {}, created_at: "2025-02-01T10:00:00Z", updated_at: "2025-05-04T08:11:00Z", updated_by: "Platform Ops" },
  { id: "ff_6", key: "patient.app.familycare", name: "Family Care accounts", description: "Multi-member patient app accounts with linked records.", stage: "beta", default_enabled: false, overrides: { org_apollo: true }, created_at: "2025-03-19T10:00:00Z", updated_at: "2025-05-29T08:11:00Z", updated_by: "Platform Ops" },
];

const SEED_AUDIT: AuditEntry[] = [
  { id: "a1", ts: "2025-05-29T08:11:00Z", actor: "Platform Ops", organization_id: "org_apollo", feature_key: "patient.app.familycare", action: "override_set", from: false, to: true, note: "Apollo pilot batch — 12 clinics." },
  { id: "a2", ts: "2025-05-22T08:11:00Z", actor: "Platform Ops", organization_id: "org_max", feature_key: "whatsapp.outbound.marketing", action: "override_set", from: false, to: true, note: "Marketing campaign enablement." },
  { id: "a3", ts: "2025-05-10T08:11:00Z", actor: "Platform Ops", feature_key: "ai.copilot", action: "stage_changed", from: "alpha", to: "beta" },
];

const stageStyle: Record<Stage, string> = {
  ga: "bg-success/15 text-success hover:bg-success/15",
  beta: "bg-info/15 text-info hover:bg-info/15",
  alpha: "bg-warning/15 text-warning hover:bg-warning/15",
  internal: "bg-muted text-muted-foreground hover:bg-muted",
};

function FeaturesPage() {
  const { items: flags, create, update, remove, setItems } = useCollection<FeatureFlag>("feature_flags", SEED_FLAGS);
  const { items: audit, create: logAudit } = useCollection<AuditEntry>("feature_audit", SEED_AUDIT);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  // Persist setItems to avoid lint warning about unused
  void setItems;

  const filtered = useMemo(() => flags.filter((f) =>
    (stageFilter === "all" || f.stage === stageFilter) &&
    (f.name.toLowerCase().includes(search.toLowerCase()) || f.key.toLowerCase().includes(search.toLowerCase()))
  ), [flags, search, stageFilter]);

  const log = (entry: Omit<AuditEntry, "id" | "ts" | "actor">) => {
    logAudit({ ...entry, ts: new Date().toISOString(), actor: currentUser.name });
  };

  const handleCreate = (draft: Pick<FeatureFlag, "key" | "name" | "description" | "stage" | "default_enabled">) => {
    if (!draft.key.trim() || !draft.name.trim()) { toast.error("Key and name are required"); return; }
    if (flags.some((f) => f.key === draft.key)) { toast.error("Feature key already exists"); return; }
    const now = new Date().toISOString();
    const flag: Omit<FeatureFlag, "id"> = { ...draft, overrides: {}, created_at: now, updated_at: now, updated_by: currentUser.name };
    create(flag);
    log({ feature_key: draft.key, action: "created", to: draft.default_enabled, note: `Stage: ${draft.stage}` });
    toast.success(`Feature "${draft.name}" created`);
    setDialogOpen(false);
  };

  const handleDelete = (flag: FeatureFlag) => {
    remove(flag.id);
    log({ feature_key: flag.key, action: "deleted" });
    toast.success(`Feature "${flag.name}" deleted`);
  };

  const toggleDefault = (flag: FeatureFlag, next: boolean) => {
    update(flag.id, { default_enabled: next, updated_at: new Date().toISOString(), updated_by: currentUser.name });
    log({ feature_key: flag.key, action: "default_changed", from: flag.default_enabled, to: next });
  };

  const setOverride = (flag: FeatureFlag, orgId: string, next: boolean | null) => {
    const prev = flag.overrides[orgId];
    const overrides = { ...flag.overrides };
    if (next === null) delete overrides[orgId]; else overrides[orgId] = next;
    update(flag.id, { overrides, updated_at: new Date().toISOString(), updated_by: currentUser.name });
    log({
      feature_key: flag.key,
      organization_id: orgId,
      action: next === null ? "override_cleared" : "override_set",
      from: prev,
      to: next === null ? undefined : next,
    });
  };

  const changeStage = (flag: FeatureFlag, stage: Stage) => {
    update(flag.id, { stage, updated_at: new Date().toISOString(), updated_by: currentUser.name });
    log({ feature_key: flag.key, action: "stage_changed", from: flag.stage, to: stage });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Feature Management" subtitle="Platform feature toggles with per-organization overrides and full audit trail."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="size-4 mr-1" /> New feature</Button></DialogTrigger>
            <NewFeatureDialog onCreate={handleCreate} onCancel={() => setDialogOpen(false)} />
          </Dialog>
        } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total features", String(flags.length)],
          ["GA", String(flags.filter((f) => f.stage === "ga").length)],
          ["Beta / Alpha", String(flags.filter((f) => f.stage === "beta" || f.stage === "alpha").length)],
          ["Org overrides", String(flags.reduce((n, f) => n + Object.keys(f.overrides).length, 0))],
        ].map(([l, v]) => (
          <Card key={l}><CardContent className="p-5"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="flags">
        <TabsList>
          <TabsTrigger value="flags"><Flag className="size-3.5 mr-1" /> Feature flags</TabsTrigger>
          <TabsTrigger value="audit"><History className="size-3.5 mr-1" /> Audit trail ({audit.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="flags" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by key or name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as Stage | "all")}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                <SelectItem value="ga">GA</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="alpha">Alpha</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.map((flag) => (
              <Card key={flag.id}>
                <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{flag.name}</CardTitle>
                      <Badge className={stageStyle[flag.stage]}>{flag.stage.toUpperCase()}</Badge>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{flag.key}</code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">Updated {new Date(flag.updated_at).toLocaleString()} by {flag.updated_by}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Select value={flag.stage} onValueChange={(v) => changeStage(flag, v as Stage)}>
                      <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ga">GA</SelectItem>
                        <SelectItem value="beta">Beta</SelectItem>
                        <SelectItem value="alpha">Alpha</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Default</span>
                      <Switch checked={flag.default_enabled} onCheckedChange={(v) => toggleDefault(flag, v)} />
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(flag)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Per-organization overrides</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {organizations.map((org) => {
                      const override = flag.overrides[org.id];
                      const effective = override ?? flag.default_enabled;
                      const isOverridden = override !== undefined;
                      return (
                        <div key={org.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border bg-card">
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{org.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {isOverridden ? <span className="text-info">Override</span> : "Inherits default"} · {effective ? "enabled" : "disabled"}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Switch checked={effective} onCheckedChange={(v) => setOverride(flag, org.id, v)} />
                            {isOverridden && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setOverride(flag, org.id, null)}>Reset</Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">No features match your filters.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="grid grid-cols-12 px-6 py-2 text-xs text-muted-foreground font-medium">
                  <div className="col-span-3">Timestamp</div>
                  <div className="col-span-2">Actor</div>
                  <div className="col-span-2">Feature</div>
                  <div className="col-span-2">Organization</div>
                  <div className="col-span-3">Change</div>
                </div>
                {audit.map((a) => (
                  <div key={a.id} className="grid grid-cols-12 px-6 py-3 items-center text-sm">
                    <div className="col-span-3 font-mono text-xs">{new Date(a.ts).toLocaleString()}</div>
                    <div className="col-span-2">{a.actor}</div>
                    <div className="col-span-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{a.feature_key}</code></div>
                    <div className="col-span-2 text-xs text-muted-foreground">{a.organization_id ? (organizations.find((o) => o.id === a.organization_id)?.name ?? a.organization_id) : "—"}</div>
                    <div className="col-span-3 text-xs">
                      <Badge variant="outline" className="mr-2 capitalize">{a.action.replace(/_/g, " ")}</Badge>
                      {a.from !== undefined && <span className="text-muted-foreground">{String(a.from)} → </span>}
                      {a.to !== undefined && <span className="font-medium">{String(a.to)}</span>}
                      {a.note && <div className="text-muted-foreground mt-0.5">{a.note}</div>}
                    </div>
                  </div>
                ))}
                {audit.length === 0 && <div className="text-center text-sm text-muted-foreground py-10">No audit entries yet.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewFeatureDialog({ onCreate, onCancel }: { onCreate: (d: Pick<FeatureFlag, "key" | "name" | "description" | "stage" | "default_enabled">) => void; onCancel: () => void }) {
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<Stage>("alpha");
  const [defaultEnabled, setDefaultEnabled] = useState(false);

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Create feature flag</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5"><Label>Key</Label><Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="module.feature.subfeature" /></div>
        <div className="space-y-1.5"><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AI Risk Engine" /></div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Stage</Label>
            <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ga">GA</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="alpha">Alpha</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Default for all orgs</Label>
            <div className="flex items-center h-9"><Switch checked={defaultEnabled} onCheckedChange={setDefaultEnabled} /></div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onCreate({ key, name, description, stage, default_enabled: defaultEnabled })}>Create</Button>
      </DialogFooter>
    </DialogContent>
  );
}