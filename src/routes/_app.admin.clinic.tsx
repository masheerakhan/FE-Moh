import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { LayoutDashboard, Users, Calendar, Pill, Plus, Trash2, Clock, CheckCircle2, AlertTriangle, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/action-button";

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

function ClinicAdminPage() {
  const [stats, setStats] = useState([
    { label: "Appointments today", value: "318" },
    { label: "Walk-ins", value: "74" },
    { label: "Collections (today)", value: "₹4.82 L" },
    { label: "Low-stock SKUs", value: "3" },
  ]);

  const [queue, setQueue] = useState<QueuePatient[]>(defaultQueue);
  const [roster, setRoster] = useState<StaffRoster[]>(defaultRoster);
  const [inventory, setInventory] = useState<InventoryItem[]>(defaultInventory);

  const loadData = () => {
    const savedQueue = localStorage.getItem("mock_clinic_queue");
    const savedRoster = localStorage.getItem("mock_clinic_roster");
    const savedInventory = localStorage.getItem("mock_clinic_inventory");
    const savedStats = localStorage.getItem("mock_clinic_stats");

    if (savedQueue) setQueue(JSON.parse(savedQueue));
    if (savedRoster) setRoster(JSON.parse(savedRoster));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedStats) setStats(JSON.parse(savedStats));
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveQueue = (next: QueuePatient[]) => {
    setQueue(next);
    localStorage.setItem("mock_clinic_queue", JSON.stringify(next));
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
      { label: "Collections (today)", value: "₹4.82 L" },
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
          title: "Revenue dashboard",
          items: [
            "Today vs MTD vs YTD",
            "Service-line split",
            "Refund / write-off monitor",
            "Cash vs digital",
            "GST snapshot",
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Card 1: Live Patient Queue */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4 text-primary" /> Live Patient Queue
            </CardTitle>
            <ActionButton
              label="Register Walk-in"
              title="Add Patient to Live Queue"
              description="Register a physical walk-in patient directly into the clinical token board."
              fields={[
                { name: "name", label: "Patient Full Name", placeholder: "e.g. Ramesh Kumar" },
                {
                  name: "doctor",
                  label: "Consulting Doctor",
                  type: "select",
                  options: doctorOptions.length > 0 ? doctorOptions : [{ label: "Dr. Riya Iyer", value: "Dr. Riya Iyer" }],
                },
              ]}
              confirmLabel="Add to Queue"
              onConfirm={handleAddQueue}
            />
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
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {pat.doctor}
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
          <CardContent className="space-y-3">
            {roster.map((staff) => (
              <div key={staff.name} className="border rounded-md p-3 flex items-center justify-between gap-3 text-sm">
                <div className="flex-1 min-w-0">
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
                      {staff.status}
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
            ))}
          </CardContent>
        </Card>

        {/* Card 3: Clinic Inventory Alert Board */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="size-4 text-primary" /> Inventory Alerts
            </CardTitle>
            <ActionButton
              label="Request Indent"
              title="Initiate Stock Reorder Indent"
              description="Request indent stocks from the centralized organization pharmacy vault."
              fields={[
                {
                  name: "item",
                  label: "Target Stock Item",
                  type: "select",
                  options: inventoryOptions,
                },
                { name: "quantity", label: "Order Quantity", defaultValue: "200" },
              ]}
              confirmLabel="Submit Indent"
              onConfirm={handleReorderStock}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {inventory.map((item) => {
              const isLow = item.stock < item.minLimit;
              return (
                <div key={item.id} className="border rounded-md p-3 flex items-center justify-between gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>Stock: <b>{item.stock}</b></span>
                      <span>•</span>
                      <span>Min Required: <b>{item.minLimit}</b></span>
                    </div>
                    {isLow && (
                      <div className="mt-2 flex items-center gap-1.5 text-destructive text-[10px] font-medium">
                        <AlertTriangle className="size-3.5" /> Low Stock Warning
                      </div>
                    )}
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className={
                        isLow
                          ? "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                          : "bg-success/15 text-success border-success/30 text-[10px]"
                      }
                    >
                      {isLow ? "Low Stock" : "Healthy"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </ModulePage>
  );
}