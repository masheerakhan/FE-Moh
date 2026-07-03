import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  UserPlus, Phone, CreditCard, Trash2, ChevronUp, ChevronDown, 
  ShieldCheck, Calendar, Search, Send, FileText, Receipt, ClipboardList
} from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { patientApi, schedulingApi, axiosInstance, appointmentApi, billingApi } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HorizontalTimeGrid } from "@/components/horizontal-time-grid";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PatientRegistrationForm } from "@/components/patient-registration-form";

export const Route = createFileRoute("/_app/reception")({
  head: () => ({ meta: [{ title: "Reception Workspace — MOH CLINICS" }] }),
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
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Unstructured Lab Paste state
  const [unstructuredText, setUnstructuredText] = useState("");
  const [activePatientId, setActivePatientId] = useState("");
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [submittingLab, setSubmittingLab] = useState(false);

  // Appointment Booking States
  const [doctors, setDoctors] = useState<any[]>([]);
  const [bookPatientId, setBookPatientId] = useState("");
  const [bookDoctorId, setBookDoctorId] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookingApt, setBookingApt] = useState(false);

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
      setQueueItems(qData || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load queue from backend, fallback to mock storage", err);
      const stored = localStorage.getItem("mock_queue_items");
      if (stored) {
        setQueueItems(JSON.parse(stored));
      } else {
        setQueueItems([]);
      }
      setLastRefresh(new Date());
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

  const refreshInvoices = async () => {
    try {
      const res = await axiosInstance.get("/billing/invoices/");
      setInvoices(res.data || []);
    } catch (err) {
      console.warn("Failed to fetch invoices", err);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await patientApi.getAll();
      setPatientsList(data || []);
      if (data && data.length > 0) {
        setActivePatientId(data[0].id || "");
        setBookPatientId(data[0].id || "");
      }
    } catch (err) {
      console.warn("Failed to fetch patients, fallback to mock storage", err);
      const stored = localStorage.getItem("mock_patients");
      if (stored) {
        const parsed = JSON.parse(stored);
        setPatientsList(parsed);
        if (parsed.length > 0) {
          setActivePatientId(parsed[0].id || "");
          setBookPatientId(parsed[0].id || "");
        }
      }
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

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookPatientId || !bookDoctorId || !bookDate || !bookTime) {
      toast.error("Please fill in all booking fields.");
      return;
    }

    let normalizedDate = bookDate;
    if (normalizedDate.includes("/") || normalizedDate.includes("-")) {
      const parts = normalizedDate.split(/[-/]/);
      if (parts[0].length === 2 && parts[2].length === 4) {
        normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    setBookingApt(true);
    try {
      await appointmentApi.createAppointment({
        patient_id: bookPatientId,
        doctor_id: bookDoctorId,
        date: normalizedDate,
        time: bookTime,
        status: "PENDING",
        type: "Consultation"
      });
      toast.success("Appointment booked successfully.");
      setBookDate("");
      setBookTime("");
      refreshAppointments();
    } catch (err: any) {
      console.warn("Backend booking failed, fallback to mock sandbox list", err);
      const matchedPatient = patientsList.find(p => p.id === bookPatientId);
      const matchedDoctor = doctors.find(d => d.id === bookDoctorId);
      const newApt = {
        id: `apt-mock-${Date.now()}`,
        patient_id: bookPatientId,
        doctor_id: bookDoctorId,
        patient_name: matchedPatient ? `${matchedPatient.first_name} ${matchedPatient.last_name || ""}` : "Patient",
        doctor_name: matchedDoctor ? matchedDoctor.name : "Doctor",
        date: normalizedDate,
        time: bookTime,
        status: "PENDING"
      };
      toast.success("Appointment booked successfully (Mock Sandbox fallback).");
      setAppointments(prev => [newApt, ...prev]);
      setBookDate("");
      setBookTime("");
    } finally {
      setBookingApt(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await axiosInstance.get("/doctors/");
      setDoctors(res.data || []);
      if (res.data && res.data.length > 0) {
        setActiveDoctorId(res.data[0].id);
        setBookDoctorId(res.data[0].id);
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
    refreshInvoices();
    loadPatients();
  }, []);

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
      setName(`${resp.demographics.first_name} ${resp.demographics.last_name || ""}`);
      setGender(resp.demographics.gender);
      setAge(String(new Date().getFullYear() - new Date(resp.demographics.date_of_birth).getFullYear()));
      toast.success("ABHA profile verified successfully!", {
        description: "Demographics auto-populated into registration forms."
      });
    } catch (err: any) {
      toast.error("Invalid ABHA OTP provided.");
    }
  };

  const issueToken = async () => {
    if (!name.trim()) {
      toast.error("Patient name is required");
      return;
    }
    if (!activeDoctorId) {
      toast.error("No active doctor profile found");
      return;
    }
    try {
      let patientId = "";
      const allPatients = await patientApi.getAll();
      const matched = allPatients.find((p) =>
        `${p.first_name} ${p.last_name || ""}`.toLowerCase().includes(name.trim().toLowerCase())
      );
      if (matched) {
        patientId = matched.id!;
      } else {
        const parts = name.trim().split(" ");
        const created = await patientApi.create({
          first_name: parts[0],
          last_name: parts.slice(1).join(" ") || undefined,
          phone: mobile || "9999999999",
          gender: gender || "MALE",
        });
        patientId = created.id!;
      }

      const qItem = await schedulingApi.issueToken(patientId, activeDoctorId);
      toast.success(`Token ${qItem.token} issued to ${name}`);
      setName("");
      setMobile("");
      setAge("");
      setGender("");
      setReason("");
      setTxnId("");
      setOtp("");
      refreshQueue();
    } catch (err) {
      toast.error("Failed to enqueue patient");
    }
  };

  // Submit Pasted Report text
  const handleArchiveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unstructuredText.trim()) {
      toast.error("Paste some unstructured report text first.");
      return;
    }
    setSubmittingLab(true);
    try {
      await axiosInstance.post("/reception/lab-reports/", {
        patient: activePatientId,
        report_text: unstructuredText.trim()
      });
      toast.success("Unstructured report text archived successfully.");
      setUnstructuredText("");
    } catch (err) {
      toast.error("Failed to archive report text.");
    } finally {
      setSubmittingLab(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Reception Desk Workspace"
        subtitle="Live queue priority logs, dynamic BIA / measurements entry, unstructured report archiving, and automatic 18% GST splits."
        actions={
          <>
            {hasAccess("patient.registration", "create") && (
              <ActionButton
                label="Quick walk-in"
                title="Quick Walk-In Registration"
                description="Register a walk-in patient and issue a queue token instantly."
                fields={[
                  { name: "name", label: "Patient Name", placeholder: "e.g. Pallavi Sarbahi" },
                  { name: "mobile", label: "Mobile Number", placeholder: "e.g. 9876543210" },
                  { name: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD" },
                ]}
                onConfirm={async (v: Record<string, string>) => {
                  try {
                    let formattedDob = "";
                    if (v.dob) {
                      const d = new Date(v.dob);
                      if (!isNaN(d.getTime())) {
                        formattedDob = d.toISOString().slice(0, 10);
                      }
                    }

                    const parts = v.name.trim().split(" ");
                    const first_name = parts[0];
                    const last_name = parts.slice(1).join(" ");

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
                successMessage={(v: Record<string, string>) =>
                  `${v.name} registered and enqueued successfully.`
                }
              />
            )}
          </>
        }
      />

      {/* Queue Stats Row */}
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
        {/* Patient Search & Walk-In tab */}
        {hasAccess("patient.registration", "view") ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Patient Registration & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Tabs defaultValue="register">
                <TabsList className="w-full">
                  <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
                  <TabsTrigger value="search" className="flex-1">Search</TabsTrigger>
                  <TabsTrigger value="appointment" className="flex-1">Book Apt</TabsTrigger>
                </TabsList>
                <TabsContent value="register">
                  <div className="space-y-4 py-6 text-center">
                    <p className="text-slate-400 text-xs px-2 leading-relaxed">
                      Launch the clinical onboarding portal to capture demographics, calculate age, verify ABHA, and record vitals.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          disabled={!hasAccess("patient.registration", "create")}
                          className="w-full h-10 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold"
                        >
                          Open Registration Wizard
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800 p-1 text-white">
                        <PatientRegistrationForm
                          onSuccess={() => {
                            loadPatients();
                            refreshQueue();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
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
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        Search or select patient profiles to enqueue.
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="appointment">
                  <form onSubmit={handleBookAppointment} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">Select Patient</label>
                      <select
                        value={bookPatientId}
                        onChange={(e) => setBookPatientId(e.target.value)}
                        className="w-full h-9 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="">-- Choose Patient --</option>
                        {patientsList.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.first_name} {p.last_name || ""} ({p.phone || "No phone"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">Select Doctor</label>
                      <select
                        value={bookDoctorId}
                        onChange={(e) => setBookDoctorId(e.target.value)}
                        className="w-full h-9 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="">-- Choose Doctor --</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>
                            Dr. {d.name} ({d.specialty || "General Medicine"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">Date</label>
                        <Input
                          type="date"
                          value={bookDate}
                          onChange={(e) => setBookDate(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">Time</label>
                        <Input
                          type="time"
                          value={bookTime}
                          onChange={(e) => setBookTime(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={bookingApt}
                      className="w-full h-9 mt-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                      {bookingApt ? "Booking..." : "Book Appointment"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">Access Restricted</CardTitle>
            </CardHeader>
            <CardContent className="py-12 text-center text-xs text-muted-foreground">
              Unauthorized by RBAC policy parameters.
            </CardContent>
          </Card>
        )}

        {/* Live Queue Cards */}
        {hasAccess("reception.queue", "view") ? (
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Live Queue Tracker</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Updated {lastRefresh.toLocaleTimeString()}</span>
                <Badge variant="outline">Avg wait {queueItems.length * 10} min</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-sm">
                <div className="grid grid-cols-6 px-6 py-2 text-xs text-muted-foreground font-semibold">
                  <div>Token</div>
                  <div className="col-span-2">Patient</div>
                  <div>Status</div>
                  <div className="text-right col-span-2">Actions</div>
                </div>
                {queueItems.length === 0 ? (
                  <div className="px-6 py-8 text-center text-muted-foreground">
                    No patients in queue today.
                  </div>
                ) : (
                  queueItems.map((q, idx) => (
                    <div key={q.id} className="grid grid-cols-6 px-6 py-3 items-center">
                      <div className="font-mono text-sm text-primary font-bold">
                        {q.token}
                      </div>
                      <div className="col-span-2">
                        <div className="font-medium text-sm">{q.patient}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {q.doctor ? (q.doctor.startsWith("Dr.") ? q.doctor : `Dr. ${q.doctor}`) : "Unassigned"}
                        </div>
                      </div>
                      <div>
                        <Badge
                          className={
                            q.status?.toUpperCase() === "IN_ROOM"
                              ? "bg-success/15 text-success hover:bg-success/15 text-[10px]"
                              : q.status?.toUpperCase() === "VITALS"
                                ? "bg-info/15 text-info hover:bg-info/15 text-[10px]"
                                : "bg-warning/15 text-warning hover:bg-warning/15 text-[10px]"
                          }
                        >
                          {q.status}
                        </Badge>
                      </div>
                      <div className="text-right col-span-2 flex justify-end items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                        >
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          disabled={idx === queueItems.length - 1}
                          onClick={() => handleMoveDown(idx)}
                        >
                          <ChevronDown className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2"
                          onClick={() => handleUpdateStatus(q.id, q.status, q.patient)}
                        >
                          Status
                        </Button>
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
              <CardTitle className="text-base text-muted-foreground">Live Queue Restricted</CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Sync Grid: Horizontal 15-min calendar + Pasting Lab + Invoicing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scheduler & Pasting Lab */}
        <div className="lg:col-span-2 space-y-6">
          {/* Horizontal Time Grid */}
          <HorizontalTimeGrid
            appointments={appointments.map((a) => {
              let [h, m] = (a.time || "09:00").split(":").map(Number);
              m += 15;
              if (m >= 60) { h += 1; m -= 60; }
              const endTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
              return {
                id: a.id,
                patientName: a.patient_name || "Patient",
                doctorName: a.doctor_name || "Doctor Profile",
                startTime: a.time || "09:00",
                endTime: endTime,
                date: a.date,
                status: a.status === "CONFIRMED" ? "CONFIRMED" as const : "PENDING" as const
              };
            })}
            doctors={Array.from(new Set(appointments.map(a => a.doctor_name || "Doctor Profile")))}
            selectedDate={appointments[0]?.date || new Date().toISOString().slice(0, 10)}
            onDateChange={() => {}}
          />

          {/* Unstructured Lab Paste Intake */}
          <Card className="border shadow-elegant bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-primary" /> Unstructured Lab Document Paste
              </CardTitle>
              <CardDescription className="text-xs">
                Manually paste unformatted diagnostic text blocks directly into searchable database archives.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleArchiveReport} className="space-y-3">
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Select Patient Profile</Label>
                    <select
                      value={activePatientId}
                      onChange={(e) => setActivePatientId(e.target.value)}
                      className="w-full border rounded-md px-3 py-1.5 text-xs bg-card font-medium"
                    >
                      {patientsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.first_name} {p.last_name || ""} ({p.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Paste Physical Report Text</Label>
                  <Textarea
                    value={unstructuredText}
                    onChange={(e) => setUnstructuredText(e.target.value)}
                    placeholder="Paste lab analysis copy here (e.g. HbA1c: 6.8%, Fasting Blood Glucose: 110 mg/dL, HDL: 45 mg/dL, LDL: 130 mg/dL)"
                    className="min-h-[110px] text-xs font-mono"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={submittingLab} className="gap-1.5">
                    <Send className="size-3.5" /> Archive Report
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Invoicing with 9% CGST & 9% SGST splits */}
        <div>
          <Card className="border shadow-elegant bg-card h-full flex flex-col">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="size-4 text-primary" /> Invoicing & 18% Indian GST splits
              </CardTitle>
              <CardDescription className="text-xs">
                Audit logs showing CGST (9%) and SGST (9%) calculations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[580px]">
              {invoices.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No invoices recorded today.
                </div>
              ) : (
                <div className="divide-y text-xs">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="p-4 space-y-2 hover:bg-muted/10 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-primary font-bold">{inv.invoice_number}</span>
                        <Badge
                          variant="outline"
                          className={
                            inv.status === "PAID"
                              ? "bg-success/10 text-success border-success/30 hover:bg-success/10 text-[9px] h-5 rounded-sm"
                              : "bg-warning/10 text-warning border-warning/30 hover:bg-warning/10 text-[9px] h-5 rounded-sm"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>Patient: {inv.patient_name || "Profile"}</span>
                        <span>{inv.date}</span>
                      </div>
                      
                      {/* GST ledger breakdowns */}
                      <div className="border-t border-dashed pt-2 space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between">
                          <span>Base Cost:</span>
                          <span>₹{parseFloat(inv.sub_total).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>CGST (9.0%):</span>
                          <span>₹{parseFloat(inv.cgst_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>SGST (9.0%):</span>
                          <span>₹{parseFloat(inv.sgst_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t font-bold text-foreground pt-1 text-xs">
                          <span>Ledger Total:</span>
                          <span>₹{parseFloat(inv.total_amount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}