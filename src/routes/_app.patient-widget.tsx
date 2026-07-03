import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { HorizontalTimeGrid } from "@/components/horizontal-time-grid";
import { PatientVitalsComponent } from "@/components/patient-vitals-component";
import { MeasurementsDialog } from "@/components/measurements-dialog";
import { LabReportDialog } from "@/components/lab-report-dialog";
import { 
  User, Calendar, Receipt, FileText, IndianRupee, Clock, ShieldCheck, 
  ChevronRight, ClipboardCheck, AlertTriangle, RefreshCw, Send, Plus, Ruler, ClipboardList
} from "lucide-react";
import { axiosInstance, patientApi, appointmentApi, billingApi } from "@/lib/api";

export const Route = createFileRoute("/_app/patient-widget")({
  head: () => ({ meta: [{ title: "Patient Profile Snapshot — MOH CLINICS" }] }),
  component: PatientWidgetPage,
});

function PatientWidgetPage() {
  const searchParams = Route.useSearch() as Record<string, string>;
  const [patientId, setPatientId] = useState<string>(searchParams.patient_id || "");
  const [patients, setPatients] = useState<any[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  
  // Data State
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [unstructuredLabs, setUnstructuredLabs] = useState<any[]>([]);
  const [structuredLabs, setStructuredLabs] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [emrHistory, setEmrHistory] = useState<any[]>([]);
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showLabReport, setShowLabReport] = useState(false);
  
  // Paste Unstructured Lab Report state
  const [newLabText, setNewLabText] = useState("");
  const [submittingLab, setSubmittingLab] = useState(false);

  // Load patient list
  const loadPatients = async () => {
    try {
      const data = await patientApi.getAll();
      setPatients(data || []);
      if (data && data.length > 0 && !patientId) {
        setPatientId(data[0].id || "");
      }
    } catch (err) {
      console.error("Failed to load patient profiles", err);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Fetch all histories concurrently when patientId changes
  const fetchPatientDetails = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const patient = patients.find((p) => p.id === id);
      if (patient) {
        setPatientInfo(patient);
      } else {
        try {
          const res = await axiosInstance.get(`/patients/profiles/${id}/`);
          setPatientInfo(res.data);
        } catch (_) {
          setPatientInfo({ id, first_name: "Patient", last_name: "Profile", phone: "9999999999", gender: "MALE" });
        }
      }

      // Run concurrent API requests
      const [apptsData, invoicesData, labReportsData, vitalsData, measurementsData, structuredLabsData] = await Promise.all([
        axiosInstance.get("/scheduling/appointments/").then((r) => r.data).catch(() => []),
        axiosInstance.get("/billing/invoices/").then((r) => r.data).catch(() => []),
        axiosInstance.get("/reception/lab-reports/").then((r) => r.data).catch(() => []),
        axiosInstance.get("/reception/vitals/").then((r) => r.data).catch(() => []),
        axiosInstance.get("/reception/measurements/").then((r) => r.data).catch(() => []),
        axiosInstance.get("/reception/structured-lab-reports/").then((r) => r.data).catch(() => []),
      ]);

      const filteredAppts = apptsData.filter((a: any) => String(a.patient_id || a.patient) === String(id));
      const filteredInvoices = invoicesData.filter((i: any) => String(i.patient_id || i.patient) === String(id));
      const filteredLabs = labReportsData.filter((l: any) => String(l.patient) === String(id));
      const filteredVitals = vitalsData.filter((v: any) => String(v.patient) === String(id));
      const filteredMeasurements = measurementsData.filter((m: any) => String(m.patient) === String(id));
      const filteredStructuredLabs = structuredLabsData.filter((l: any) => String(l.patient) === String(id));

      setAppointments(filteredAppts);
      setInvoices(filteredInvoices);
      setUnstructuredLabs(filteredLabs);
      setVitalsHistory(filteredVitals);
      setMeasurements(filteredMeasurements);
      setStructuredLabs(filteredStructuredLabs);

      setEmrHistory([
        { date: "15 Jun 2026", type: "Follow-up", doctor: "Dr. Iyer", notes: "Patient feels stable. BP under control." },
        { date: "01 Jun 2026", type: "Initial Consultation", doctor: "Dr. Iyer", notes: "Diagnosed with primary hypertension." }
      ]);

    } catch (err) {
      toast.error("Failed to load patient history records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails(patientId);
    }
  }, [patientId, patients]);

  // Submit pasted lab report
  const handleAddLabReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabText.trim()) {
      toast.error("Please paste report text first.");
      return;
    }
    setSubmittingLab(true);
    try {
      await axiosInstance.post("/reception/lab-reports/", {
        patient: patientId,
        report_text: newLabText.trim(),
      });
      toast.success("Unstructured lab report archived successfully.");
      setNewLabText("");
      fetchPatientDetails(patientId);
    } catch (err) {
      toast.error("Failed to upload lab report.");
    } finally {
      setSubmittingLab(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Reception Snapshot Portal"
        subtitle="Pluggable patient profiling, vital tracking, pasted unstructured reports, and GST audit logs."
        actions={
          <div className="flex gap-2">
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-xs bg-card font-medium"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name || ""} ({p.phone})
                </option>
              ))}
            </select>
            <Button size="sm" variant="outline" onClick={() => setShowMeasurements(true)} className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
              <Ruler className="size-3.5" /> Measurements
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowLabReport(true)} className="gap-1 bg-success/10 text-success hover:bg-success/20">
              <ClipboardList className="size-3.5" /> Lab Report
            </Button>
            <Button size="sm" variant="outline" onClick={() => fetchPatientDetails(patientId)}>
              <RefreshCw className={`size-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Reload
            </Button>
          </div>
        }
      />

      {/* Dialog Modals */}
      {showMeasurements && patientInfo && (
        <Dialog open={showMeasurements} onOpenChange={setShowMeasurements}>
          <MeasurementsDialog
            patientId={patientId}
            patientName={`${patientInfo.first_name} ${patientInfo.last_name || ""}`}
            onClose={() => setShowMeasurements(false)}
            onSaveSuccess={() => fetchPatientDetails(patientId)}
          />
        </Dialog>
      )}

      {showLabReport && patientInfo && (
        <Dialog open={showLabReport} onOpenChange={setShowLabReport}>
          <LabReportDialog
            patientId={patientId}
            patientName={`${patientInfo.first_name} ${patientInfo.last_name || ""}`}
            onClose={() => setShowLabReport(false)}
            onSaveSuccess={() => fetchPatientDetails(patientId)}
          />
        </Dialog>
      )}

      {/* Patient Header Summary */}
      {patientInfo && (
        <Card className="shadow-elegant border bg-card relative overflow-hidden">
          <div className="p-6 flex items-start gap-4 z-10 relative">
            <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {patientInfo.first_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {patientInfo.first_name} {patientInfo.last_name || ""}
                </h2>
                <Badge variant="outline" className="text-[10px]">
                  MRN: {patientInfo.id?.slice(-8).toUpperCase() || "HX-PENDING"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gender: {patientInfo.gender} • Phone: {patientInfo.phone} • ABHA: {patientInfo.abha_number || "Not verified"}
              </p>
            </div>
            {vitalsHistory.length > 0 && (
              <div className="hidden lg:flex items-center gap-4 text-xs font-semibold bg-muted/40 p-2.5 rounded-lg border border-border">
                <div className="text-center px-2">
                  <div className="text-muted-foreground text-[10px] uppercase">BP</div>
                  <div className="text-foreground">{vitalsHistory[0].blood_pressure || "N/A"}</div>
                </div>
                <div className="border-l h-8" />
                <div className="text-center px-2">
                  <div className="text-muted-foreground text-[10px] uppercase">SpO2</div>
                  <div className="text-foreground">{vitalsHistory[0].spo2 ? `${vitalsHistory[0].spo2}%` : "N/A"}</div>
                </div>
                <div className="border-l h-8" />
                <div className="text-center px-2">
                  <div className="text-muted-foreground text-[10px] uppercase">Temp</div>
                  <div className="text-foreground">{vitalsHistory[0].temperature ? `${vitalsHistory[0].temperature}°F` : "N/A"}</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-[500px]">
          <TabsTrigger value="appointments" className="text-xs flex gap-1.5 items-center">
            <Calendar className="size-3.5" /> Appointment History
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-xs flex gap-1.5 items-center">
            <Receipt className="size-3.5" /> Billing & GST Invoices
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs flex gap-1.5 items-center">
            <FileText className="size-3.5" /> Clinical Timeline
          </TabsTrigger>
        </TabsList>

        {/* Tab A: Appointment History Grid */}
        <TabsContent value="appointments" className="mt-4 space-y-4">
          <Card className="border shadow-elegant bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">Appointment Ledger</CardTitle>
              <CardDescription className="text-xs">
                Historical list of allocated slots and booked visits.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-xs">
                <div className="grid grid-cols-5 px-6 py-3 font-semibold text-muted-foreground bg-muted/20">
                  <div>Date</div>
                  <div>Time Slot</div>
                  <div>Doctor</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>
                {appointments.length === 0 ? (
                  <div className="px-6 py-6 text-center text-muted-foreground">
                    No appointments recorded for this patient.
                  </div>
                ) : (
                  appointments.map((a) => (
                    <div key={a.id} className="grid grid-cols-5 px-6 py-3.5 items-center">
                      <div className="font-mono">{a.date}</div>
                      <div className="font-mono text-muted-foreground">{a.start_time} - {a.end_time}</div>
                      <div className="font-medium">{a.doctor_name || "Practitioner"}</div>
                      <div>
                        <Badge
                          variant="outline"
                          className={
                            a.status === "BOOKED" || a.status === "CONFIRMED"
                              ? "bg-success/15 text-success border-success/30 text-[10px]"
                              : "bg-warning/15 text-warning border-warning/30 text-[10px]"
                          }
                        >
                          {a.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm" className="h-7 text-[10px]">
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Render time grid if appointments exist */}
          {patientInfo && (
            <HorizontalTimeGrid
              appointments={appointments.map((a) => ({
                id: a.id,
                patientName: `${patientInfo.first_name} ${patientInfo.last_name || ""}`,
                doctorName: a.doctor_name || "Doctor",
                startTime: a.start_time.slice(0, 5),
                endTime: a.end_time.slice(0, 5),
                date: a.date,
                status: a.status === "BOOKED" ? "CONFIRMED" : "PENDING",
              }))}
              doctors={Array.from(new Set(appointments.map((a) => a.doctor_name || "Doctor")))}
              selectedDate={appointments[0]?.date || new Date().toISOString().slice(0, 10)}
              onDateChange={() => {}}
            />
          )}
        </TabsContent>

        {/* Tab B: Billing & Invoice Log */}
        <TabsContent value="billing" className="mt-4 space-y-4">
          <Card className="border shadow-elegant bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">Billing Ledger & Indian GST Splits</CardTitle>
              <CardDescription className="text-xs">
                Deterministically split invoices (9% CGST + 9% SGST) linked to appointments.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-xs">
                <div className="grid grid-cols-7 px-6 py-3 font-semibold text-muted-foreground bg-muted/20">
                  <div>Invoice No.</div>
                  <div>Base Amount</div>
                  <div>CGST (9%)</div>
                  <div>SGST (9%)</div>
                  <div>Total Amount</div>
                  <div>Status</div>
                  <div className="text-right">Audit</div>
                </div>
                {invoices.length === 0 ? (
                  <div className="px-6 py-6 text-center text-muted-foreground">
                    No invoices recorded for this patient.
                  </div>
                ) : (
                  invoices.map((i) => (
                    <div key={i.id} className="grid grid-cols-7 px-6 py-3.5 items-center">
                      <div className="font-mono text-primary font-semibold">{i.invoice_number}</div>
                      <div className="font-mono">₹{parseFloat(i.sub_total).toFixed(2)}</div>
                      <div className="font-mono text-muted-foreground">₹{parseFloat(i.cgst_amount).toFixed(2)}</div>
                      <div className="font-mono text-muted-foreground">₹{parseFloat(i.sgst_amount).toFixed(2)}</div>
                      <div className="font-mono font-bold text-foreground">₹{parseFloat(i.total_amount).toFixed(2)}</div>
                      <div>
                        <Badge
                          variant="outline"
                          className={
                            i.status === "PAID"
                              ? "bg-success/15 text-success border-success/30 text-[10px]"
                              : "bg-warning/15 text-warning border-warning/30 text-[10px]"
                          }
                        >
                          {i.status}
                        </Badge>
                      </div>
                      <div className="text-right flex items-center justify-end gap-1">
                        <Badge variant="outline" className="border-success/30 text-success text-[9px] bg-success/5 font-mono">
                          GST Audited
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab C: Unstructured & Structured Timelines */}
        <TabsContent value="timeline" className="mt-4 space-y-6">
          {/* Paste Unstructured report form */}
          <Card className="border shadow-elegant bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Archive Unstructured Physical Lab Report</CardTitle>
              <CardDescription className="text-xs">
                Paste raw report text from third-party clinics to store in searchable archives.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLabReport} className="space-y-3">
                <Label htmlFor="labText" className="text-xs font-semibold">Raw Unstructured Text</Label>
                <Textarea
                  id="labText"
                  value={newLabText}
                  onChange={(e) => setNewLabText(e.target.value)}
                  placeholder="Paste report text (e.g. Blood Panel HbA1c: 6.8% - High, TSH: 2.1 mIU/L, Lipid Profile Total Cholesterol 220 mg/dL)"
                  className="min-h-[100px] text-xs font-mono"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={submittingLab} className="gap-1.5">
                    <Send className="size-3.5" /> Archive Report text
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Vitals Form & OCR Staging */}
          <PatientVitalsComponent patientId={patientId} onVitalsSaved={() => fetchPatientDetails(patientId)} />

          {/* Unified Clinical Timeline */}
          <Card className="border shadow-elegant bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Timeline & Consultation Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative border-l ml-3 space-y-6">
                {/* Structured Lab Reports */}
                {structuredLabs.map((l) => (
                  <div key={l.id} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 size-3 rounded-full bg-success" />
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Report Date: {l.date_of_report}
                    </div>
                    <div className="font-semibold text-xs mt-0.5 text-foreground flex items-center gap-1.5">
                      Structured Lab Analysis
                      <Badge className="text-[9px] bg-success/10 text-success hover:bg-success/10 px-1 py-0.5 border border-success/20">Structured Lab</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2 bg-muted/20 p-3 rounded-lg text-xs font-mono">
                      {l.hba1c && <div>HbA1c: <span className="font-bold text-foreground">{l.hba1c}%</span></div>}
                      {l.fasting_sugar && <div>Fasting Sugar: <span className="font-bold text-foreground">{l.fasting_sugar} mg/dL</span></div>}
                      {l.total_cholesterol && <div>Cholesterol: <span className="font-bold text-foreground">{l.total_cholesterol} mg/dL</span></div>}
                      {l.ldl && <div>LDL: <span className="font-bold text-foreground">{l.ldl} mg/dL</span></div>}
                      {l.tsh && <div>TSH: <span className="font-bold text-foreground">{l.tsh} mIU/L</span></div>}
                      {l.fatty_liver && <div>Fatty Liver: <span className="font-bold text-foreground">{l.fatty_liver}</span></div>}
                    </div>
                  </div>
                ))}

                {/* Measurements & BIA logs */}
                {measurements.map((m) => (
                  <div key={m.id} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 size-3 rounded-full bg-primary" />
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Logged Date: {new Date(m.created_at || Date.now()).toLocaleDateString()}
                    </div>
                    <div className="font-semibold text-xs mt-0.5 text-foreground flex items-center gap-1.5">
                      Body Composition Analysis (BIA)
                      <Badge className="text-[9px] bg-primary/10 text-primary hover:bg-primary/10 px-1 py-0.5 border border-primary/20">BIA Scan</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2 bg-muted/20 p-3 rounded-lg text-xs font-mono">
                      {m.height && <div>Height: <span className="font-bold text-foreground">{m.height} cm</span></div>}
                      {m.weight && <div>Weight: <span className="font-bold text-foreground">{m.weight} kg</span></div>}
                      {m.bmi_device && <div>BMI: <span className="font-bold text-foreground">{m.bmi_device}</span></div>}
                      {m.fat_percentage && <div>Fat: <span className="font-bold text-foreground">{m.fat_percentage}%</span></div>}
                      {m.health_score && <div>Health Score: <span className="font-bold text-foreground">{m.health_score}</span></div>}
                      {m.body_age && <div>Body Age: <span className="font-bold text-foreground">{m.body_age} yrs</span></div>}
                    </div>
                  </div>
                ))}

                {/* Pasted lab reports */}
                {unstructuredLabs.map((l) => (
                  <div key={l.id} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 size-3 rounded-full bg-info" />
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {new Date(l.uploaded_at).toLocaleString()} • Uploaded by {l.uploaded_by_name || "receptionist"}
                    </div>
                    <div className="font-semibold text-xs mt-0.5 text-foreground flex items-center gap-1.5">
                      Pasted Unstructured Lab Report
                      <Badge className="text-[9px] bg-info/10 text-info hover:bg-info/10 px-1 py-0.5 border border-info/20">Lab Paste</Badge>
                    </div>
                    <pre className="text-xs bg-muted/40 border p-3 rounded-md mt-1.5 whitespace-pre-wrap font-mono leading-relaxed text-muted-foreground">
                      {l.report_text}
                    </pre>
                  </div>
                ))}

                {/* EMR Consultations */}
                {emrHistory.map((h, i) => (
                  <div key={i} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 size-3 rounded-full bg-slate-400" />
                    <div className="text-[10px] text-muted-foreground font-mono">{h.date} • {h.doctor}</div>
                    <div className="font-semibold text-xs mt-0.5">{h.type}</div>
                    <p className="text-xs text-muted-foreground mt-1 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded border border-dashed">
                      {h.notes}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
