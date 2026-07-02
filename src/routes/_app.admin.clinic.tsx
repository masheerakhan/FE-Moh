import { createFileRoute, Link } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { LayoutDashboard, Users, Calendar, Pill, Plus, Trash2, Clock, CheckCircle2, AlertTriangle, RefreshCcw, TrendingUp, Download, IndianRupee } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/action-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/admin/clinic")({
  head: () => ({ meta: [{ title: "Clinic Admin — Helix OS" }] }),
  component: ClinicAdminPage,
});

interface QueuePatient {
  token: string;
  name: string;
  doctor: string;
  status: "WAITING" | "IN_CONSULT" | "COMPLETED";
}

interface StaffRoster {
  name: string;
  role: string;
  shift: string;
  status: "ACTIVE" | "ON_LEAVE" | "BREAK";
}

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  minLimit: number;
}

const defaultQueue: QueuePatient[] = [
  { token: "T-102", name: "Rahul Verma", doctor: "Dr. Riya Iyer", status: "IN_CONSULT" },
  { token: "T-103", name: "Sonia Nair", doctor: "Dr. Amit Sharma", status: "WAITING" },
  { token: "T-104", name: "Amir Khan", doctor: "Dr. Riya Iyer", status: "WAITING" },
];

const defaultRoster: StaffRoster[] = [
  { name: "Dr. Riya Iyer", role: "Sr. Consultant", shift: "Morning (09:00 - 14:00)", status: "ACTIVE" },
  { name: "Dr. Amit Sharma", role: "General Physician", shift: "General (10:00 - 18:00)", status: "ACTIVE" },
  { name: "Nurse Anita Sen", role: "Head Staff Nurse", shift: "Morning (08:00 - 16:00)", status: "ACTIVE" },
  { name: "Dr. Pooja Joshi", role: "Pediatrician", shift: "Evening (16:00 - 20:00)", status: "ON_LEAVE" },
];

const defaultInventory: InventoryItem[] = [
  { id: "inv_1", name: "Paracetamol 500mg", stock: 120, minLimit: 200 },
  { id: "inv_2", name: "Amoxicillin 250mg", stock: 45, minLimit: 100 },
  { id: "inv_3", name: "Disposable Syringes 5ml", stock: 350, minLimit: 300 },
  { id: "inv_4", name: "Metformin 500mg", stock: 80, minLimit: 150 },
];

interface RevenueState {
  todayTotal: number;
  upi: number;
  card: number;
  cash: number;
  consultations: number;
  pharmacy: number;
  diagnostics: number;
}

const defaultRevenue: RevenueState = {
  todayTotal: 482000,
  upi: 361500,
  card: 67480,
  cash: 53020,
  consultations: 216900,
  pharmacy: 168700,
  diagnostics: 96400,
};

interface ClinicIncident {
  id: string;
  title: string;
  category: string;
  severity: "High" | "Medium" | "Low";
  status: "PENDING" | "RESOLVED";
  timestamp: string;
}

const defaultIncidents: ClinicIncident[] = [
  { id: "inc_1", title: "Critical delay in Pharmacy Billing Counter 2", category: "Billing Counter", severity: "High", status: "PENDING", timestamp: "10 minutes ago" },
  { id: "inc_2", title: "Cold storage temperature anomaly in Vaccine Fridge", category: "Facilities", severity: "Medium", status: "RESOLVED", timestamp: "1 hour ago" },
  { id: "inc_3", title: "Patient complaint regarding token sequence mismatch", category: "Queue", severity: "Low", status: "RESOLVED", timestamp: "2 hours ago" },
];

interface ClinicApproval {
  id: string;
  title: string;
  category: "Shift Swap" | "Leave Request" | "Inventory Indent";
  requestedBy: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  details?: Record<string, string>;
}

const defaultApprovals: ClinicApproval[] = [
  {
    id: "app_1",
    title: "Shift Swap: Nurse Anita Sen to General shift on Friday",
    category: "Shift Swap",
    requestedBy: "Nurse Anita Sen",
    status: "PENDING",
    details: { name: "Nurse Anita Sen", targetShift: "General (10:00 - 18:00)" },
  },
  {
    id: "app_2",
    title: "Leave Request: Dr. Amit Sharma casual leave on 5th July",
    category: "Leave Request",
    requestedBy: "Dr. Amit Sharma",
    status: "PENDING",
    details: { name: "Dr. Amit Sharma" },
  },
  {
    id: "app_3",
    title: "Stock Indent: Amoxicillin 250mg (200 units) Central Reorder",
    category: "Inventory Indent",
    requestedBy: "Pharmacist Roy",
    status: "PENDING",
  },
];

function ClinicAdminPage() {
  const [stats, setStats] = useState([
    { label: "Appointments today", value: "318" },
    { label: "Walk-ins", value: "74" },
    { label: "Low-stock SKUs", value: "3" },
  ]);

  const [queue, setQueue] = useState<QueuePatient[]>(defaultQueue);
  const [roster, setRoster] = useState<StaffRoster[]>(defaultRoster);
  const [inventory, setInventory] = useState<InventoryItem[]>(defaultInventory);
  const [revenue, setRevenue] = useState<RevenueState>(defaultRevenue);
  const [incidents, setIncidents] = useState<ClinicIncident[]>(defaultIncidents);
  const [approvals, setApprovals] = useState<ClinicApproval[]>(defaultApprovals);

  const loadData = () => {
    const savedQueue = localStorage.getItem("mock_clinic_queue");
    const savedRoster = localStorage.getItem("mock_clinic_roster");
    const savedInventory = localStorage.getItem("mock_clinic_inventory");
    const savedStats = localStorage.getItem("mock_clinic_stats");
    const savedRevenue = localStorage.getItem("mock_clinic_revenue");
    const savedIncidents = localStorage.getItem("mock_clinic_incidents");
    const savedApprovals = localStorage.getItem("mock_clinic_approvals");

    if (savedQueue) setQueue(JSON.parse(savedQueue));
    if (savedRoster) setRoster(JSON.parse(savedRoster));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedRevenue) setRevenue(JSON.parse(savedRevenue));
    if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
    if (savedApprovals) setApprovals(JSON.parse(savedApprovals));
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveQueue = (next: QueuePatient[]) => {
    setQueue(next);
    localStorage.setItem("mock_clinic_queue", JSON.stringify(next));
  };

  const saveRevenue = (next: RevenueState) => {
    setRevenue(next);
    localStorage.setItem("mock_clinic_revenue", JSON.stringify(next));
  };



  const saveIncidents = (next: ClinicIncident[]) => {
    setIncidents(next);
    localStorage.setItem("mock_clinic_incidents", JSON.stringify(next));
  };

  const handleAddIncident = (v: Record<string, string>) => {
    const newInc: ClinicIncident = {
      id: `inc_${Date.now()}`,
      title: v.title,
      category: v.category,
      severity: v.severity as any,
      status: "PENDING",
      timestamp: "Just now",
    };
    const next = [newInc, ...incidents];
    saveIncidents(next);
    toast.success(`Logged new incident: "${v.title}".`);
  };

  const handleResolveIncident = (id: string, title: string) => {
    const next = incidents.map((inc) => (inc.id === id ? { ...inc, status: "RESOLVED" as const } : inc));
    saveIncidents(next);
    toast.success(`Incident "${title}" marked as resolved.`);
  };

  const handleRemoveIncident = (id: string, title: string) => {
    const next = incidents.filter((inc) => inc.id !== id);
    saveIncidents(next);
    toast.success(`Removed incident log entry for "${title}".`);
  };

  const saveApprovals = (next: ClinicApproval[]) => {
    setApprovals(next);
    localStorage.setItem("mock_clinic_approvals", JSON.stringify(next));
  };

  const handleApproveRequest = (id: string, category: string, title: string, details?: Record<string, string>) => {
    // 1. Update status to APPROVED
    const next = approvals.map((app) => (app.id === id ? { ...app, status: "APPROVED" as const } : app));
    saveApprovals(next);

    // 2. Cascade changes to Roster
    if (category === "Leave Request" && details?.name) {
      const nextRoster = roster.map((staff) => (staff.name === details.name ? { ...staff, status: "ON_LEAVE" as const } : staff));
      saveRoster(nextRoster);
      toast.success(`Approved leave. Updated ${details.name} status in Shift Roster.`);
    } else if (category === "Shift Swap" && details?.name && details?.targetShift) {
      const nextRoster = roster.map((staff) => (staff.name === details.name ? { ...staff, shift: details.targetShift } : staff));
      saveRoster(nextRoster);
      toast.success(`Approved shift swap. Updated ${details.name} shift in Shift Roster.`);
    } else {
      toast.success(`Approved request: "${title}".`);
    }
  };

  const handleRejectRequest = (id: string, title: string) => {
    const next = approvals.map((app) => (app.id === id ? { ...app, status: "REJECTED" as const } : app));
    saveApprovals(next);
    toast.error(`Rejected request: "${title}".`);
  };

  const saveRoster = (next: StaffRoster[]) => {
    setRoster(next);
    localStorage.setItem("mock_clinic_roster", JSON.stringify(next));
  };

  const saveInventory = (next: InventoryItem[]) => {
    setInventory(next);
    localStorage.setItem("mock_clinic_inventory", JSON.stringify(next));
    
    // Update low stock stats count
    const lowStockCount = next.filter((i) => i.stock < i.minLimit).length;
    const nextStats = stats.map((s) => {
      if (s.label === "Low-stock SKUs") {
        return { ...s, value: lowStockCount.toString() };
      }
      return s;
    });
    setStats(nextStats);
    localStorage.setItem("mock_clinic_stats", JSON.stringify(nextStats));
  };

  const handleUpdateOps = (v: Record<string, string>) => {
    const lowStockCount = inventory.filter((i) => i.stock < i.minLimit).length;
    const nextStats = [
      { label: "Appointments today", value: v.appointments || "318" },
      { label: "Walk-ins", value: v.walkins || "74" },
      { label: "Low-stock SKUs", value: lowStockCount.toString() },
    ];
    setStats(nextStats);
    localStorage.setItem("mock_clinic_stats", JSON.stringify(nextStats));
    toast.success("Clinic daily operations board updated successfully.");
  };

  const handleAddQueue = (v: Record<string, string>) => {
    const tokenNum = 100 + queue.length + 1;
    const newPatient: QueuePatient = {
      token: `T-${tokenNum}`,
      name: v.name,
      doctor: v.doctor || "Dr. Amit Sharma",
      status: "WAITING",
    };
    const next = [...queue, newPatient];
    saveQueue(next);
    toast.success(`Patient "${v.name}" registered into live queue under token T-${tokenNum}.`);
  };

  const handleUpdateQueueStatus = (token: string, newStatus: "WAITING" | "IN_CONSULT" | "COMPLETED") => {
    const next = queue.map((p) => {
      if (p.token === token) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    saveQueue(next);
    toast.success(`Patient token ${token} updated to status "${newStatus}".`);
  };

  const handleRemoveQueue = (token: string, name: string) => {
    const next = queue.filter((p) => p.token !== token);
    saveQueue(next);
    toast.success(`Patient "${name}" (token: ${token}) offboarded from queue.`);
  };

  const handleAddRoster = (v: Record<string, string>) => {
    const newStaff: StaffRoster = {
      name: v.name,
      role: v.role || "Consultant",
      shift: v.shift || "General (10:00 - 18:00)",
      status: "ACTIVE",
    };
    const next = [...roster, newStaff];
    saveRoster(next);
    toast.success(`Staff profile "${v.name}" assigned shift roster successfully.`);
  };

  const handleUpdateRosterStatus = (name: string, nextStatus: "ACTIVE" | "ON_LEAVE" | "BREAK") => {
    const next = roster.map((s) => {
      if (s.name === name) {
        return { ...s, status: nextStatus };
      }
      return s;
    });
    saveRoster(next);
    toast.success(`Staff status for "${name}" updated to "${nextStatus}".`);
  };

  const handleReorderStock = (v: Record<string, string>) => {
    const itemId = v.item;
    const addQty = parseInt(v.quantity || "100", 10);
    const next = inventory.map((i) => {
      if (i.id === itemId) {
        return { ...i, stock: i.stock + addQty };
      }
      return i;
    });
    saveInventory(next);
    const matched = inventory.find((i) => i.id === itemId);
    toast.success(`Stock indent requested: ${addQty} units of "${matched?.name || itemId}" added.`);
  };

  const doctorOptions = roster
    .filter((s) => s.role.includes("Consultant") || s.role.includes("Physician") || s.role.includes("Pediatrician"))
    .map((s) => ({ label: s.name, value: s.name }));

  const shiftOptions = [
    { label: "Morning (09:00 - 14:00)", value: "Morning (09:00 - 14:00)" },
    { label: "General (10:00 - 18:00)", value: "General (10:00 - 18:00)" },
    { label: "Evening (16:00 - 20:00)", value: "Evening (16:00 - 20:00)" },
    { label: "Night Shift (20:00 - 08:00)", value: "Night Shift (20:00 - 08:00)" },
  ];

  const inventoryOptions = inventory.map((i) => ({
    label: `${i.name} (Stock: ${i.stock})`,
    value: i.id,
  }));

  return (
    <ModulePage
      title="Clinic Admin Portal"
      icon={LayoutDashboard}
      primaryAction="Daily ops board"
      primaryActionFields={[
        { name: "appointments", label: "Appointments Today", defaultValue: "325" },
        { name: "walkins", label: "Walk-ins Active", defaultValue: "82" },
      ]}
      primaryActionConfirmLabel="Apply Adjustments"
      primaryActionOnConfirm={handleUpdateOps}
      stats={stats}
      subtitle="Single-clinic command surface for daily operations, revenue, staff and inventory — additive to existing reception, billing and EMR modules."
      sections={[
        {
          title: "Daily operations",
          items: [
            "Live queue & token board",
            "Doctor utilization",
            "No-show & late tracking",
            "Cross-counter handoffs",
            "Incident log",
          ],
        },
        {
          title: "Staff management",
          items: [
            "Roster & shift swaps",
            "Attendance & overtime",
            "Role-based access",
            "Performance notes",
            "Leave approvals",
          ],
        },
        {
          title: "Inventory monitoring",
          items: [
            "Live stock vs reorder",
            "Expiry watchlist",
            "Batch traceability",
            "Indents to org pharmacy",
            "Wastage analytics",
          ],
        },
      ]}
      workflow={[
        "Clinic admin opens dashboard scoped to clinic_id; KPIs hydrate from existing modules.",
        "Reviews queue, staffing gaps and escalations from reception / billing.",
        "Approves leave swaps and reorder indents without leaving the surface.",
        "Drilldowns deep-link into existing EMR, billing and pharmacy screens — no duplication.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Card 1: Live Patient Queue */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4 text-primary" /> Live Patient Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">
                All queues cleared. No patients waiting.
              </div>
            ) : (
              queue.map((pat) => (
                <div key={pat.token} className="border rounded-md p-3 flex items-center justify-between gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted">
                        {pat.token}
                      </span>
                      <span className="font-semibold truncate">{pat.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate flex items-center justify-between">
                      <span>{pat.doctor}</span>
                      <Link to="/emr" className="text-[10px] text-primary hover:underline">View EMR &rarr;</Link>
                    </div>
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className={
                          pat.status === "WAITING"
                            ? "bg-warning/15 text-warning border-warning/30 text-[10px]"
                            : pat.status === "IN_CONSULT"
                              ? "bg-success/15 text-success border-success/30 text-[10px]"
                              : "bg-muted text-muted-foreground border-muted-foreground/30 text-[10px]"
                        }
                      >
                        {pat.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {pat.status === "WAITING" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-success hover:bg-success/10"
                        onClick={() => handleUpdateQueueStatus(pat.token, "IN_CONSULT")}
                        title="Mark In Consult"
                      >
                        <Clock className="size-3.5" />
                      </Button>
                    )}
                    {pat.status === "IN_CONSULT" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-success hover:bg-success/10"
                        onClick={() => handleUpdateQueueStatus(pat.token, "COMPLETED")}
                        title="Mark Completed"
                      >
                        <CheckCircle2 className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveQueue(pat.token, pat.name)}
                      title="Offboard from Queue"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Card 2: Staff Shift Roster */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="size-4 text-primary" /> Shift Roster
            </CardTitle>
            <ActionButton
              label="Assign Staff"
              title="Add Staff to Shift"
              description="Assign shift slots and allocate departments for clinical staff."
              fields={[
                { name: "name", label: "Staff Member Name", placeholder: "e.g. Nurse Kiran Pal" },
                { name: "role", label: "Designated Role", placeholder: "e.g. Staff Nurse" },
                {
                  name: "shift",
                  label: "Shift Timing Slot",
                  type: "select",
                  options: shiftOptions,
                },
              ]}
              confirmLabel="Assign Shift"
              onConfirm={handleAddRoster}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 w-full h-8 text-[11px] p-0.5 mb-3 bg-muted/40">
                <TabsTrigger value="all" className="py-1 text-[10px]">All Staff</TabsTrigger>
                <TabsTrigger value="doctors" className="py-1 text-[10px]">Doctors</TabsTrigger>
                <TabsTrigger value="nurses" className="py-1 text-[10px]">Nurses & Support</TabsTrigger>
              </TabsList>

              {["all", "doctors", "nurses"].map((tabVal) => {
                const filteredRoster = roster.filter((staff) => {
                  const isDoc =
                    staff.name.startsWith("Dr.") ||
                    staff.role.toLowerCase().includes("consultant") ||
                    staff.role.toLowerCase().includes("physician") ||
                    staff.role.toLowerCase().includes("pediatrician");
                  if (tabVal === "doctors") return isDoc;
                  if (tabVal === "nurses") return !isDoc;
                  return true;
                });

                return (
                  <TabsContent key={tabVal} value={tabVal} className="space-y-3 mt-0">
                    {filteredRoster.length === 0 ? (
                      <div className="text-center text-muted-foreground text-xs py-6">
                        No staff members matching this category.
                      </div>
                    ) : (
                      filteredRoster.map((staff) => (
                        <div key={staff.name} className="border rounded-md p-3 flex items-center justify-between gap-3 text-sm bg-card hover:bg-muted/10 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold truncate">{staff.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{staff.role}</div>
                            <div className="text-[10px] font-mono text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="size-3" /> {staff.shift}
                            </div>
                            <div className="mt-2">
                              <Badge
                                variant="outline"
                                className={
                                  staff.status === "ACTIVE"
                                    ? "bg-success/15 text-success border-success/30 text-[10px]"
                                    : staff.status === "ON_LEAVE"
                                      ? "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                                      : "bg-warning/15 text-warning border-warning/30 text-[10px]"
                                }
                              >
                                {staff.status === "ACTIVE" ? "ACTIVE" : staff.status === "BREAK" ? "ON BREAK" : "ON LEAVE"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            {staff.status === "ACTIVE" ? (
                              <>
                                <Button
                                  variant="outline"
                                  className="text-[10px] h-6 px-1.5"
                                  onClick={() => handleUpdateRosterStatus(staff.name, "BREAK")}
                                >
                                  Break
                                </Button>
                                <Button
                                  variant="outline"
                                  className="text-[10px] h-6 px-1.5 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleUpdateRosterStatus(staff.name, "ON_LEAVE")}
                                >
                                  Leave
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                className="text-[10px] h-6 px-1.5 text-success hover:bg-success/10"
                                onClick={() => handleUpdateRosterStatus(staff.name, "ACTIVE")}
                              >
                                Active
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>


      </div>

      {/* Grid container for Incidents (span 2) and Pending Approvals (span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Incident Log & Escalation Center */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="size-4 text-primary" /> Operations Incident Log & Escalations
            </CardTitle>
            <ActionButton
              label="Log Incident"
              title="Report Clinic Operations Incident"
              description="Escalate operational issues, billing counter delays, queue mismatches, or facility alerts."
              fields={[
                { name: "title", label: "Incident Title / Description", placeholder: "e.g. Printer offline at Counter 1" },
                {
                  name: "category",
                  label: "Incident Category",
                  type: "select",
                  options: [
                    { label: "Billing Counter", value: "Billing Counter" },
                    { label: "Queue Board", value: "Queue Board" },
                    { label: "Facilities & IT", value: "Facilities" },
                    { label: "Staff Scheduling", value: "Staff" },
                    { label: "Clinical / Patient Care", value: "Clinical" },
                  ],
                },
                {
                  name: "severity",
                  label: "Severity Classification",
                  type: "select",
                  options: [
                    { label: "High Severity", value: "High" },
                    { label: "Medium Severity", value: "Medium" },
                    { label: "Low Severity", value: "Low" },
                  ],
                },
              ]}
              confirmLabel="Log Incident"
              onConfirm={handleAddIncident}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {incidents.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">
                No active operational incidents or escalations.
              </div>
            ) : (
              <div className="divide-y border rounded-md">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors text-sm bg-card">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">{inc.title}</span>
                        <Badge variant="outline" className={`${
                          inc.severity === "High"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : inc.severity === "Medium"
                              ? "bg-warning/10 text-warning border-warning/20"
                              : "bg-info/10 text-info border-info/20"
                        } text-[9px] font-semibold px-1.5 py-0.5`}>
                          {inc.severity} Severity
                        </Badge>
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/20 text-[9px] px-1.5 py-0.5">
                          {inc.category}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                        <span>Logged: <b>{inc.timestamp}</b></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          Status:
                          <span className={inc.status === "PENDING" ? "text-warning font-semibold" : "text-success font-semibold"}>
                            {inc.status}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {inc.status === "PENDING" && (
                        <Button
                          variant="outline"
                          className="text-[10px] h-6 px-1.5 text-success hover:bg-success/10"
                          onClick={() => handleResolveIncident(inc.id, inc.title)}
                        >
                          Resolve
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveIncident(inc.id, inc.title)}
                        title="Delete Entry"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Operations Approvals */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" /> Operations Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvals.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">
                All requests processed. Zero pending approvals.
              </div>
            ) : (
              approvals.map((app) => (
                <div key={app.id} className="border rounded-md p-3 flex flex-col gap-2 text-sm bg-card hover:bg-muted/5 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <span className="font-semibold text-xs block text-foreground leading-tight">
                        {app.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-1">
                        Requested by: <b>{app.requestedBy}</b>
                      </span>
                      {app.category === "Inventory Indent" && (
                        <Link to="/pharmacy" className="text-[10px] text-primary hover:underline mt-1 block">
                          Check Central Pharmacy Stock &rarr;
                        </Link>
                      )}
                    </div>
                    <Badge variant="outline" className={`${
                      app.status === "PENDING"
                        ? "bg-warning/15 text-warning border-warning/30"
                        : app.status === "APPROVED"
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-destructive/15 text-destructive border-destructive/30"
                    } text-[9px] font-semibold`}>
                      {app.status}
                    </Badge>
                  </div>
                  
                  {app.status === "PENDING" && (
                    <div className="flex gap-2 justify-end mt-1.5 pt-1.5 border-t">
                      <Button
                        variant="outline"
                        className="text-[10px] h-6 px-2 text-destructive hover:bg-destructive/10 border-destructive/20"
                        onClick={() => handleRejectRequest(app.id, app.title)}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        className="text-[10px] h-6 px-2"
                        onClick={() => handleApproveRequest(app.id, app.category, app.title, app.details)}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </ModulePage>
  );
}