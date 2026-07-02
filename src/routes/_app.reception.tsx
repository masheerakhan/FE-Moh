import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Phone, CreditCard, Trash2, ChevronUp, ChevronDown, ShieldCheck, Calendar, Search } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { patientApi, schedulingApi, axiosInstance, appointmentApi } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/reception")({
  head: () => ({ meta: [{ title: "Reception — Helix OS" }] }),
  component: Reception,
});

function Reception() {
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [activeDoctorId, setActiveDoctorId] = useState<string>("");

  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [reason, setReason] = useState("");

  const [txnId, setTxnId] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [receptionistPermissions, setReceptionistPermissions] = useState<Record<string, string[]>>({
    "patient.registration": ["view", "create", "update"],
    "patient.profile": ["view"],
    "reception.appointments": ["view", "create", "update", "delete"],
    "reception.queue": ["view", "update"],
    "billing.invoices": ["view", "create"],
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("helix:org_default:clinic_default:rbac_roles");
      if (stored) {
        const roles = JSON.parse(stored);
        const recep = roles.find((r: any) => r.id === "role_receptionist");
        if (recep && recep.permissions) {
          setReceptionistPermissions(recep.permissions);
        }
      }
    } catch (e) {
      console.warn("Failed to load RBAC permissions", e);
    }
  }, []);

  const hasAccess = (moduleName: string, actionName: string): boolean => {
    const perms = receptionistPermissions[moduleName] || [];
    return perms.includes(actionName);
  };

  const refreshQueue = async () => {
    try {
      const qData = await schedulingApi.getQueue();
      setQueueItems(qData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load queue from backend", err);
    }
  };

  const refreshAppointments = async () => {
    try {
      const data = await appointmentApi.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.warn('Failed to fetch appointments', err);
    }
  };

  const handlePatientSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const allPatients = await patientApi.getAll();
      const filtered = allPatients.filter((p: any) =>
        `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (err) {
      console.warn('Patient search failed', err);
      setSearchResults([]);
    }
  };

  const handleReQueue = async (patient: any) => {
    if (!activeDoctorId) {
      toast.error('No active doctor profile found.');
      return;
    }
    try {
      const queueEntry = await schedulingApi.issueToken(patient.id, activeDoctorId);
      toast.success(`Token ${queueEntry.token} issued to ${patient.first_name} ${patient.last_name || ''}`);
      refreshQueue();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to re-queue patient');
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await axiosInstance.get("/doctors/");
      if (res.data && res.data.length > 0) {
        setActiveDoctorId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load doctor profiles", err);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const nextQueue = [...queueItems];
    const temp = nextQueue[index];
    nextQueue[index] = nextQueue[index - 1];
    nextQueue[index - 1] = temp;
    
    setQueueItems(nextQueue);
    
    try {
      const orderedIds = nextQueue.map((q) => q.id);
      await schedulingApi.reorderQueue(orderedIds);
      toast.success("Queue priority updated");
      refreshQueue();
    } catch (err) {
      console.warn("Backend queue reorder failed, fallback active");
      toast.success("Queue priority updated (Mock Sandbox fallback)");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === queueItems.length - 1) return;
    const nextQueue = [...queueItems];
    const temp = nextQueue[index];
    nextQueue[index] = nextQueue[index + 1];
    nextQueue[index + 1] = temp;
    
    setQueueItems(nextQueue);
    
    try {
      const orderedIds = nextQueue.map((q) => q.id);
      await schedulingApi.reorderQueue(orderedIds);
      toast.success("Queue priority updated");
      refreshQueue();
    } catch (err) {
      console.warn("Backend queue reorder failed, fallback active");
      toast.success("Queue priority updated (Mock Sandbox fallback)");
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string, patientName: string) => {
    const statusMap: Record<string, string> = {
      "WAITING": "VITALS",
      "VITALS": "IN_ROOM",
      "IN_ROOM": "COMPLETED",
      "COMPLETED": "WAITING",
    };
    const nextStatus = statusMap[currentStatus?.toUpperCase()] || "WAITING";
    try {
      await schedulingApi.updateQueueItem(id, { status: nextStatus as any });
      toast.success(`Updated ${patientName} status to ${nextStatus}`);
      refreshQueue();
    } catch (err) {
      toast.success(`Updated ${patientName} status to ${nextStatus} (Mock Sandbox fallback)`);
      setQueueItems((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: nextStatus } : q))
      );
    }
  };

  useEffect(() => {
    refreshQueue();
    loadDoctors();
    refreshAppointments();
  }, []);

  // Feature 4: Auto-refresh queue every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshQueue();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateAbhaOtp = async () => {
    if (!mobile.trim()) {
      toast.error("Please enter a mobile or Aadhaar number first.");
      return;
    }
    try {
      const resp = await patientApi.generateOtp(mobile);
      setTxnId(resp.txn_id);
      toast.success("ABHA verification OTP sent successfully!", {
        description: `Transaction ID: ${resp.txn_id} (Use mock OTP: 123456)`,
      });
    } catch (err: any) {
      toast.error("Failed to generate ABHA OTP");
    }
  };

  const handleVerifyAbhaOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP received.");
      return;
    }
    try {
      const resp = await patientApi.verifyOtp(txnId, otp);
      const demo = resp.demographics;
      setName(`${demo.first_name} ${demo.last_name || ""}`.trim());
      setMobile(demo.phone || mobile);
      setGender(demo.gender);
      setAge("35"); // Default age for mock demographics
      setReason("ABHA verified profile");
      setTxnId("");
      setOtp("");
      toast.success("ABHA demographics verified!", {
        description: `Verified Name: ${demo.first_name} · ABHA: ${demo.abha_number}`,
      });
    } catch (err: any) {
      toast.error("Invalid OTP or verification failure");
    }
  };

  const issueToken = async () => {
    if (!name.trim() || !mobile.trim()) {
      toast.error("Mobile and name are required");
      return;
    }

    if (!activeDoctorId) {
      toast.error("No active doctor profile found in backend. Please seed doctor profiles first.");
      return;
    }

    try {
      // 1. Create Patient Profile
      const nameParts = name.trim().split(" ");
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(" ");
      const patient = await patientApi.create({
        first_name,
        last_name: last_name || undefined,
        phone: mobile,
        gender: gender.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE",
      });

      // 2. Issue Queue Token
      const queueEntry = await schedulingApi.issueToken(patient.id!, activeDoctorId);

      toast.success(`Token ${queueEntry.token} issued to ${name}`, {
        description: reason || "Walk-in registered",
      });

      refreshQueue();

      setMobile("");
      setName("");
      setAge("");
      setGender("");
      setReason("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Failed to create patient profile in backend"
      );
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Reception Desk"
        subtitle="Walk-ins, queue, billing, check-in and check-out — Apollo Bandra"
        actions={
          <>
            <Badge variant="outline" className="h-9 px-3 gap-1.5 border-primary/30 bg-primary/5 text-primary text-xs">
              <ShieldCheck className="size-3.5 text-primary" /> RBAC: Receptionist Policy Active
            </Badge>
            <ActionButton
              label="AI Receptionist"
              icon={<Phone className="size-4" />}
              title="Hand off to AI Receptionist"
              description="Route inbound calls / WhatsApp to the AI receptionist agent."
              fields={[
                {
                  name: "channel",
                  label: "Channel",
                  defaultValue: "WhatsApp + IVR",
                },
              ]}
              confirmLabel="Activate"
              successMessage={() =>
                "AI Receptionist is now handling inbound traffic"
              }
            />
            {hasAccess("patient.registration", "create") && (
              <ActionButton
                primary
                label="Register Patient"
                icon={<UserPlus className="size-4" />}
                title="Register new patient"
                description="Create a full patient profile with ABHA / Aadhaar e-KYC."
                fields={[
                  { name: "name", label: "Full name", placeholder: "Patient name" },
                  { name: "mobile", label: "Mobile / ABHA", placeholder: "+91…" },
                  { name: "dob", label: "Date of birth", placeholder: "DD / MM / YYYY" },
                ]}
                confirmLabel="Create profile"
                onConfirm={async (v) => {
                  try {
                    const nameParts = v.name.trim().split(" ");
                    const first_name = nameParts[0];
                    const last_name = nameParts.slice(1).join(" ");
                    let formattedDob = undefined;
                    if (v.dob) {
                      const cleanDob = v.dob.replace(/\s+/g, "");
                      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDob)) {
                        formattedDob = cleanDob;
                      } else {
                        const parts = cleanDob.split(/[-/.]/);
                        if (parts.length === 3) {
                          if (parts[0].length === 4) {
                            formattedDob = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
                          } else {
                            const day = parts[0].padStart(2, "0");
                            const month = parts[1].padStart(2, "0");
                            const year = parts[2];
                            if (year.length === 4) {
                              formattedDob = `${year}-${month}-${day}`;
                            }
                          }
                        }
                      }
                    }

                    const patient = await patientApi.create({
                      first_name,
                      last_name: last_name || undefined,
                      phone: v.mobile,
                      gender: "MALE",
                      date_of_birth: formattedDob || v.dob || undefined,
                    });

                    if (activeDoctorId) {
                      await schedulingApi.issueToken(patient.id!, activeDoctorId);
                      refreshQueue();
                    }
                  } catch (err: any) {
                    toast.error(
                      err.response?.data?.detail ||
                        err.message ||
                        "Failed to create patient profile in backend"
                    );
                  }
                }}
                successMessage={(v) =>
                  `${v.name} registered and enqueued successfully.`
                }
              />
            )}
          </>
        }
      />

      {/* Feature 1: Queue Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">Patients Today</div>
            <div className="text-2xl font-semibold mt-1">{queueItems.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total registered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">Avg Wait</div>
            <div className="text-2xl font-semibold mt-1">{queueItems.length * 10} min</div>
            <div className="text-xs text-muted-foreground mt-1">Estimated average</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">In Consultation</div>
            <div className="text-2xl font-semibold mt-1">{queueItems.filter(q => q.status?.toUpperCase() === 'IN_ROOM').length}</div>
            <div className="text-xs text-muted-foreground mt-1">Currently with doctor</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">Completed</div>
            <div className="text-2xl font-semibold mt-1">{queueItems.filter(q => q.status?.toUpperCase() === 'COMPLETED').length}</div>
            <div className="text-xs text-muted-foreground mt-1">Done for the day</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature 3: Patient Search Tab — wraps Quick Registration */}
        {hasAccess("patient.registration", "view") ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Registration & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Tabs defaultValue="register">
                <TabsList className="w-full">
                  <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
                  <TabsTrigger value="search" className="flex-1">Search</TabsTrigger>
                </TabsList>
                <TabsContent value="register">
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Mobile / Aadhaar / ABHA"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="flex-1"
                        disabled={!hasAccess("patient.registration", "create")}
                      />
                      {!txnId ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleGenerateAbhaOtp}
                          className="shrink-0"
                          disabled={!hasAccess("patient.registration", "create")}
                        >
                          Verify ABHA
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleVerifyAbhaOtp}
                          className="shrink-0 bg-success hover:bg-success/90"
                        >
                          Verify OTP
                        </Button>
                      )}
                    </div>
                    {txnId && (
                      <Input
                        placeholder="Enter 6-Digit OTP (Mock: 123456)"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    )}
                    <Input
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!hasAccess("patient.registration", "create")}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        disabled={!hasAccess("patient.registration", "create")}
                      />
                      <Input
                        placeholder="Gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={!hasAccess("patient.registration", "create")}
                      />
                    </div>
                    <Input
                      placeholder="Reason for visit"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={!hasAccess("patient.registration", "create")}
                    />
                    <Button
                      className="w-full"
                      style={{ background: "var(--gradient-primary)" }}
                      onClick={issueToken}
                      disabled={!hasAccess("patient.registration", "create")}
                    >
                      Issue Token
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      OTP auto-sent · Aadhaar e-KYC available
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="search">
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Search patients by name..."
                        value={searchQuery}
                        onChange={(e) => handlePatientSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {searchResults.length > 0 ? (
                      <div className="divide-y max-h-64 overflow-y-auto">
                        {searchResults.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between py-2">
                            <div>
                              <div className="font-medium text-sm">{p.first_name} {p.last_name || ''}</div>
                              <div className="text-xs text-muted-foreground">{p.phone || 'No phone'}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2"
                              onClick={() => handleReQueue(p)}
                            >
                              Re-Queue
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery.trim() ? (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        No patients found matching "{searchQuery}"
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        Enter a name to search existing patients
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-muted-foreground" /> Quick Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="py-12 text-center text-xs text-muted-foreground">
              Access restricted by RBAC policy.
            </CardContent>
          </Card>
        )}

        {hasAccess("reception.queue", "view") ? (
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Live Queue</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Updated {lastRefresh.toLocaleTimeString()}</span>
                <Badge variant="outline">Avg wait {queueItems.length * 10} min</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-sm">
                <div className="grid grid-cols-6 px-6 py-2 text-xs text-muted-foreground font-medium font-semibold">
                  <div>Token</div>
                  <div className="col-span-2">Patient</div>
                  <div>Status</div>
                  <div className="text-right col-span-2">Actions</div>
                </div>
                {queueItems.length === 0 ? (
                  <div className="px-6 py-4 text-muted-foreground text-center">
                    No patients in queue today. Use Quick Registration to add one.
                  </div>
                ) : (
                  queueItems.map((q, idx) => (
                    <div key={q.id} className="grid grid-cols-6 px-6 py-3 items-center">
                      <div className="font-mono text-sm text-primary w-14">
                        {q.token}
                      </div>
                      <div className="col-span-2">
                        <div className="font-medium text-sm">{q.patient}</div>
                        <div className="text-xs text-muted-foreground">
                          {q.doctor} · {q.wait} wait
                        </div>
                      </div>
                      <div>
                        <Badge
                          className={
                            q.status?.toUpperCase() === "IN_ROOM"
                              ? "bg-success/15 text-success hover:bg-success/15 text-[10px]"
                              : q.status?.toUpperCase() === "VITALS"
                                ? "bg-info/15 text-info hover:bg-info/15 text-[10px]"
                                : q.status?.toUpperCase() === "COMPLETED"
                                  ? "bg-muted text-muted-foreground border-muted-foreground/30 text-[10px]"
                                  : "bg-warning/15 text-warning hover:bg-warning/15 text-[10px]"
                          }
                        >
                          {q.status}
                        </Badge>
                      </div>
                      <div className="text-right col-span-2 flex justify-end items-center gap-1">
                        {/* Priority Reordering Buttons */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          disabled={idx === 0 || !hasAccess("reception.queue", "update")}
                          onClick={() => handleMoveUp(idx)}
                          title="Move Up"
                        >
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          disabled={idx === queueItems.length - 1 || !hasAccess("reception.queue", "update")}
                          onClick={() => handleMoveDown(idx)}
                          title="Move Down"
                        >
                          <ChevronDown className="size-4" />
                        </Button>

                        {/* Status Transition Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2"
                          disabled={!hasAccess("reception.queue", "update")}
                          onClick={() => handleUpdateStatus(q.id, q.status, q.patient)}
                        >
                          {q.status?.toUpperCase() === "WAITING" && "Vitals"}
                          {q.status?.toUpperCase() === "VITALS" && "Check-in"}
                          {q.status?.toUpperCase() === "IN_ROOM" && "Complete"}
                          {q.status?.toUpperCase() === "COMPLETED" && "Reopen"}
                          {!["WAITING", "VITALS", "IN_ROOM", "COMPLETED"].includes(q.status?.toUpperCase() || "") && "Advance"}
                        </Button>

                        {/* Deep Link to Billing */}
                        {hasAccess("billing.invoices", "view") && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            asChild
                          >
                            <Link to="/billing" title="Open Billing Invoices Desk">
                              <CreditCard className="size-4" />
                            </Link>
                          </Button>
                        )}

                        {/* Delete from Queue */}
                        {hasAccess("reception.queue", "delete") && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 text-destructive hover:bg-destructive/10"
                            onClick={async () => {
                              try {
                                await schedulingApi.deleteQueueItem(q.id);
                                toast.success(`Removed ${q.token}`);
                                refreshQueue();
                              } catch (err) {
                                toast.error("Failed to remove from queue");
                              }
                            }}
                            title="Remove from Queue"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-muted-foreground" /> Live Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="py-12 text-center text-xs text-muted-foreground">
              Access restricted by RBAC policy.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feature 2: Today's Appointments Panel */}
      {hasAccess('reception.appointments', 'view') && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="size-4" /> Today's Appointments
            </CardTitle>
            <Badge variant="outline">{appointments.length} scheduled</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-sm">
              <div className="grid grid-cols-4 px-6 py-2 text-xs text-muted-foreground font-semibold">
                <div>Patient</div>
                <div>Doctor</div>
                <div>Time</div>
                <div>Status</div>
              </div>
              {appointments.length === 0 ? (
                <div className="px-6 py-4 text-muted-foreground text-center">
                  No appointments scheduled for today.
                </div>
              ) : (
                appointments.map((appt: any) => (
                  <div key={appt.id} className="grid grid-cols-4 px-6 py-3 items-center">
                    <div className="font-medium text-sm">{appt.patient_name || appt.patient_id}</div>
                    <div className="text-sm text-muted-foreground">{appt.doctor_name || appt.doctor_id}</div>
                    <div className="text-sm">{appt.time}</div>
                    <div>
                      <Badge
                        className={
                          appt.status === 'CONFIRMED'
                            ? 'bg-success/15 text-success hover:bg-success/15 text-[10px]'
                            : appt.status === 'CANCELLED'
                              ? 'bg-destructive/15 text-destructive hover:bg-destructive/15 text-[10px]'
                              : 'bg-warning/15 text-warning hover:bg-warning/15 text-[10px]'
                        }
                      >
                        {appt.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}