import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/action-button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Sparkles, PlusCircle, FileText, Stethoscope, AlertTriangle, ChevronDown, Square, Loader2, Search } from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
import { emrApi, scribeApi, patientApi, referralApi } from "@/lib/api";

// Create a React Context for the active patient state propagation
const PatientContext = createContext<{
  activePatientContext: any;
  setActivePatientContext: (patient: any) => void;
} | null>(null);

export const Route = createFileRoute("/_app/doctor")({
  head: () => ({ meta: [{ title: "Doctor Workspace — MOH CLINICS" }] }),
  component: DoctorWorkspaceWrapper,
});

// Wrapper to provide PatientContext down to all child panels
function DoctorWorkspaceWrapper() {
  const defaultPatientLayout = {
    id: "hx-2284913",
    name: "Aarav Mehta",
    first_name: "Aarav",
    last_name: "Mehta",
    gender: "MALE",
    phone_number: "9876543210",
    email: "aarav.mehta@gmail.com",
    abha_number: "12-3456-7890-1234",
    abha_address: "aaravmehta@sbx",
    active_problems: ["Essential hypertension", "Pre-diabetes", "Dyslipidemia"],
    allergies: ["Sulfa drugs"],
    active_medications: ["Telmisartan", "Atorvastatin"],
    vitals: {
      bp: "138/86 mmHg",
      hr: "82 bpm",
      spo2: "98%",
      temp: "98.4 °F",
      bmi: "26.4",
      weight: "76 kg",
      height: "170 cm"
    }
  };

  const [activePatientContext, setActivePatientContext] = useState<any>(defaultPatientLayout);

  return (
    <PatientContext.Provider value={{ activePatientContext, setActivePatientContext }}>
      <DoctorWorkspace />
    </PatientContext.Provider>
  );
}

function DoctorWorkspace() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("DoctorWorkspace must be used within a PatientContextProvider");
  }

  const { activePatientContext, setActivePatientContext } = context;
  const [patientList, setPatientList] = useState<any[]>([]);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState<string>("Patient was cooperative during the visit.");

  // Controlled EMR States
  const [soap, setSoap] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Scribe State & Media Recording Engine
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("soap");

  // Search Dropdown States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Initialize/Clean EMR Workspace state whenever active patient changes
  useEffect(() => {
    if (activePatientContext) {
      // Clear/Initialize SOAP notes cleanly
      setSoap({
        subjective: `Patient reports for management of ${activePatientContext.active_problems.join(", ")}.`,
        objective: `Vitals recorded: BP ${activePatientContext.vitals.bp}, HR ${activePatientContext.vitals.hr}, SpO2 ${activePatientContext.vitals.spo2}, BMI ${activePatientContext.vitals.bmi}.`,
        assessment: `Active problems: ${activePatientContext.active_problems.join(", ")}.`,
        plan: `Continue current therapeutic guidelines. Active prescriptions: ${activePatientContext.active_medications.join(", ")}.`,
      });

      // Clear prescriptions and investigations dynamic arrays for new AI Scribe generation
      setPrescriptions([]);
      setOrders([]);
    }
  }, [activePatientContext]);

  // Timer Effect for active recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const loadPatientList = async () => {
    try {
      const patients = await patientApi.getAll();
      setPatientList(patients || []);
    } catch (err) {
      console.error("Failed to load patient profile list", err);
    }
  };

  useEffect(() => {
    loadPatientList();
  }, []);

  // Debounced search for Patient Dropdown
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        handleSearchPatients(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const getActiveTenantContext = () => {
    // 1. Attempt to extract from global session / auth context (if stored in window/global auth)
    let activeOrgId = (window as any).__GLOBAL_AUTH_STORE__?.organization_id || "";
    let activeClinicId = (window as any).__GLOBAL_AUTH_STORE__?.clinic_id || "";

    // 2. Fallback to active user profile schema payload or localStorage context
    if (!activeOrgId || !activeClinicId) {
      console.warn("Active tenant context not found in global auth store. Fetching fallbacks from local storage.");
      const savedUserStr = localStorage.getItem("active_user");
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          activeOrgId = activeOrgId || parsed.organization_id || "";
          activeClinicId = activeClinicId || parsed.clinic_id || "";
        } catch (e) {}
      }
    }

    return { activeOrgId, activeClinicId };
  };

  const handleSearchPatients = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const { activeOrgId, activeClinicId } = getActiveTenantContext();

      if (!activeOrgId || !activeClinicId) {
        console.warn("Empty tenant parameters detected for patient search request. Using fallback organization and clinic context.");
      }

      const response = await fetch(`http://localhost:8000/api/v1/patients/search/?q=${encodeURIComponent(query)}&organization_id=${activeOrgId}&clinic_id=${activeClinicId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
          "X-Organization-ID": activeOrgId,
          "X-Clinic-ID": activeClinicId,
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to retrieve matching patient records");
      }
      
      const result = await response.json();
      setSearchResults(result.patients || []);
    } catch (err) {
      console.error("Patient query dispatch error", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplySuggestions = () => {
    toast.success("AI safety and Differential suggestions applied to EMR draft");
    setSoap((prev) => ({
      ...prev,
      plan: prev.plan + "\n- Monitor renal function closely (Telmisartan + Aspirin combination check).",
    }));
  };

  // Scrape context keywords directly from activePatientContext problems/medications
  const getContextKeywords = () => {
    if (!activePatientContext) return [];
    const problems = activePatientContext.active_problems || [];
    const medications = activePatientContext.active_medications || activePatientContext.current_medications || [];
    return Array.from(new Set([...problems, ...medications]));
  };

  // Start MediaRecorder audio capture
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop()); // release micro resources

        // Gather context-aware keywords directly from state
        const keywords = getContextKeywords();

        // Dispatch request payload to FastAPI backend
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("context_keywords", JSON.stringify(keywords));

        setIsProcessing(true);
        toast.info("AI Scribe transcribing consultation", {
          description: "Ambient listening complete. Synthesizing records using Claude 3.5...",
        });

        try {
          const response = await fetch("http://localhost:8001/api/v1/scribe/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`FastAPI server returned ${response.status}`);
          }

          const result = await response.json();

          // Smoothly override controlled text areas
          setSoap({
            subjective: result.soap.subjective,
            objective: result.soap.objective,
            assessment: result.soap.assessment,
            plan: result.soap.plan,
          });

          // Append new prescriptions
          const newRx = result.prescriptions.map((p: any) => ({
            drug: p.drug_name,
            dose: p.frequency,
            days: p.duration,
            note: p.dosage !== p.drug_name ? `dosage: ${p.dosage}` : undefined,
          }));
          setPrescriptions(newRx);

          // Append new investigations
          const newOrders = result.investigations.map((inv: string) => ({
            t: inv,
            why: "AI Suggested diagnostic screening",
          }));
          setOrders(newOrders);

          // Run safety interaction warnings
          const drugNames = newRx.map((r: any) => r.drug.split(" ")[0]);
          const safety = await scribeApi.checkDrugSafety(drugNames, activePatientContext?.id || "patient_id");
          if (safety.has_warning) {
            toast.warning("AI Clinical Safety Alert", {
              description: safety.warnings.join(", "),
              duration: 8000,
            });
          }

          // Switch active tab programmatically to render entries
          setActiveTab("soap");
          toast.success("Consultation successfully transcribed & structured!");

        } catch (err: any) {
          console.error("FastAPI AI Scribe call failed", err);
          toast.error("AI Scribe Processing Failed", {
            description: err.message || "Ensure your FastAPI microservice is running on port 8001.",
          });
        } finally {
          setIsProcessing(false);
        }
      };

      setMediaRecorder(recorder);
      setAudioChunks([]);
      recorder.start();
      setIsRecording(true);
      toast.success("AI Scribe Active", { description: "Recording ambient speech now..." });
    } catch (err: any) {
      console.error("Microphone capture access denied", err);
      toast.error("Microphone Access Required", {
        description: "Please check system/browser configuration permissions.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const saveConsultation = async () => {
    if (!activePatientContext) {
      toast.error("No active patient context resolved");
      return;
    }

    try {
      const enc = await emrApi.createEncounter({
        patient: activePatientContext.id!,
        doctor: "EMP-RIYA",
        encounter_date: new Date().toISOString().split("T")[0],
        type: "Consultation",
        notes: doctorNotes || undefined,
      });

      await emrApi.saveSoapNote(enc.id!, {
        subjective: soap.subjective,
        objective: soap.objective,
        assessment: soap.assessment,
        plan: soap.plan,
      });

      for (const rx of prescriptions) {
        await emrApi.addPrescription({
          encounter: enc.id!,
          drug_name: rx.drug,
          dosage: rx.dose,
          duration_days: parseInt(rx.days) || 30,
          instructions: rx.note || undefined,
          warnings: rx.warn || undefined,
        });
      }

      toast.success("Consultation successfully saved & finalized in local EMR ledger.");
    } catch (err: any) {
      toast.error("Failed to commit consultation records to EMR");
    }
  };

  // Resolved dynamic vital ranges from activePatientContext
  const vitals = activePatientContext?.vitals || {
    bp: "120/80 mmHg",
    hr: "72 bpm",
    spo2: "98%",
    temp: "98.6 °F",
    bmi: "24.2",
    weight: "70 kg",
    height: "170 cm"
  };

  // Resolved dynamic clinical parameters from activePatientContext
  const activeProblems = activePatientContext?.active_problems || [];
  const allergies = activePatientContext?.allergies || [];

  return (
    <div className="p-6 lg:p-8 space-y-6 relative">
      {/* Absolute Loading Backdrop when AI Scribe processes */}
      {isProcessing && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-card rounded-2xl border shadow-xl flex flex-col items-center max-w-sm text-center">
            <Loader2 className="size-10 text-primary animate-spin mb-4" />
            <h4 className="font-semibold text-lg flex items-center gap-1.5 justify-center">
              <Sparkles className="size-4 text-primary animate-pulse" /> Generating EMR Records
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Transcribing audio and synthesizing subjective, objective, prescriptions and tests via Claude 3.5...
            </p>
          </div>
        </div>
      )}

      <PageHeader
        title="Consultation Workspace"
        subtitle={`In-room with ${activePatientContext ? activePatientContext.name : "Select Patient"} · ${activePatientContext?.gender || "MALE"} · MRN ${activePatientContext ? activePatientContext.id?.slice(-8).toUpperCase() : "NO CONTEXT"}`}
        actions={
          <>
            {/* Searchable Patient Dropdown Selector */}
            <div className="relative flex items-center gap-1.5 z-40">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search name, phone, or MRN..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowPatientPicker(true);
                  }}
                  onFocus={() => setShowPatientPicker(true)}
                  className="w-56 h-9 pl-3 pr-8 text-sm border rounded-md bg-card focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                />
                <button
                  onClick={() => handleSearchPatients(searchQuery)}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                  title="Execute search"
                >
                  <Search className="size-4" />
                </button>
              </div>

              {showPatientPicker && (searchQuery.trim().length > 0 || searchResults.length > 0) && (
                <div className="absolute right-0 top-10 bg-card border rounded-lg shadow-lg w-72 max-h-80 overflow-y-auto divide-y z-50">
                  {isSearching ? (
                    <div className="px-4 py-3.5 text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
                      <Loader2 className="size-3.5 animate-spin" /> Querying registry...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActivePatientContext(p);
                          setShowPatientPicker(false);
                          setSearchQuery("");
                          toast.success(`Active patient context set: ${p.name}`);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors flex flex-col space-y-0.5"
                      >
                        <div className="font-semibold text-sm text-foreground flex items-center justify-between">
                          <span>{p.name}</span>
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                            {p.id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>{p.phone_number || "No Phone"}</span>
                          <span>{p.gender} · BP: {p.vitals.bp}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                      No matching records found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <ActionButton
              label="Templates"
              icon={<FileText className="size-4" />}
              title="Apply consultation template"
              description="Pre-fill the SOAP note from a saved template."
              fields={[
                {
                  name: "template",
                  label: "Template name",
                  placeholder: "e.g. Hypertension follow-up",
                  defaultValue: "Hypertension follow-up",
                },
              ]}
              confirmLabel="Apply template"
              onConfirm={(v) => {
                setSoap({
                  subjective: "Patient reports occasional morning headaches. Fatigue mild.",
                  objective: "BP 136/84. Heart sounds normal. No edema.",
                  assessment: "Hypertension, stable on Telmisartan.",
                  plan: "Continue active therapy. Order basic lab review.",
                });
                toast.success(`Template “${v.template}” applied`);
              }}
            />

            {/* AI Ambient Scribe Recording controls */}
            {isRecording ? (
              <Button
                variant="destructive"
                className="animate-pulse flex items-center gap-2 h-9"
                onClick={handleStopRecording}
              >
                <Square className="size-4 fill-current" />
                Stop AI Scribe ({formatTime(recordingSeconds)})
              </Button>
            ) : (
              <Button
                disabled={isProcessing}
                onClick={handleStartRecording}
                className="flex items-center gap-2 h-9 bg-primary text-primary-foreground hover:bg-primary/95"
              >
                <Mic className="size-4" />
                Start AI Scribe
              </Button>
            )}

            <ActionButton
              label="Refer Patient"
              icon={<PlusCircle className="size-4" />}
              title="Outbound Referral / Handoff"
              description="Cleanly route patient longitudinal records to external specialist networks."
              fields={[
                { name: "provider", label: "Target Provider", placeholder: "e.g. Dr. Amit Sharma · Cardiology" },
                { name: "facility", label: "Target Facility / Grid", placeholder: "e.g. Apollo Hospital Grid" },
                { name: "scope", label: "Handoff Scope", defaultValue: "FULL_RECORD" },
                { name: "reason", label: "Clinical Handoff Reason", type: "textarea", placeholder: "Reason for specialist referral" }
              ]}
              confirmLabel="Publish Handoff"
              onConfirm={async (v: Record<string, string>) => {
                try {
                  await referralApi.createReferral({
                    patient_id: activePatientContext?.id || "patient_id",
                    target_provider: v.provider,
                    target_facility: v.facility,
                    scope: v.scope === "ACTIVE_CASE_ONLY" ? "ACTIVE_CASE_ONLY" : "FULL_RECORD",
                    reason: v.reason,
                  });
                  toast.success(`Referral to ${v.provider} published successfully.`);
                } catch (err: any) {
                  toast.error("Failed to publish outbound referral");
                }
              }}
            />
          </>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Patient Snapshot Panel (Left Panel) */}
        <Card className="col-span-12 lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Patient Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                {activePatientContext ? activePatientContext.name[0] : "AM"}
              </div>
              <div>
                <div className="font-medium">
                  {activePatientContext ? activePatientContext.name : "Aarav Mehta"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activePatientContext?.gender || "MALE"} · O+ · {vitals.weight}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Row k="BP" v={vitals.bp} tone="warning" />
              <Row k="HR" v={vitals.hr} />
              <Row k="SpO₂" v={vitals.spo2} />
              <Row k="Temp" v={vitals.temp} />
              <Row k="BMI" v={vitals.bmi} tone="warning" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">Allergies</div>
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((allg: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-destructive border-destructive/40 bg-destructive/5">
                    {allg}
                  </Badge>
                ))}
                {allergies.length === 0 && (
                  <span className="text-xs text-muted-foreground">No known allergies.</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">Active problems</div>
              <div className="space-y-1 text-sm text-foreground/80">
                {activeProblems.map((prob: string, idx: number) => (
                  <div key={idx}>• {prob}</div>
                ))}
                {activeProblems.length === 0 && (
                  <span className="text-xs text-muted-foreground">No active chronic problems.</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SOAP Note & Medical Records Workspace (Center Panel) */}
        <Card className="col-span-12 lg:col-span-6">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">SOAP Note · AI-drafted</CardTitle>
            {isRecording && (
              <Badge className="bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/10 animate-pulse">
                <span className="size-1.5 rounded-full bg-destructive mr-1 animate-ping" /> Scribe listening...
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="soap">SOAP</TabsTrigger>
                <TabsTrigger value="rx">Prescription</TabsTrigger>
                <TabsTrigger value="orders">Investigations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="soap" className="mt-4 space-y-4">
                <Field
                  label="Subjective"
                  value={soap.subjective}
                  onChange={(val) => setSoap({ ...soap, subjective: val })}
                />
                <Field
                  label="Objective"
                  value={soap.objective}
                  onChange={(val) => setSoap({ ...soap, objective: val })}
                />
                <Field
                  label="Assessment"
                  value={soap.assessment}
                  onChange={(val) => setSoap({ ...soap, assessment: val })}
                />
                <Field
                  label="Plan"
                  value={soap.plan}
                  onChange={(val) => setSoap({ ...soap, plan: val })}
                />
              </TabsContent>
              
              <TabsContent value="rx" className="mt-4 space-y-2 text-sm">
                {prescriptions.map((rx, idx) => (
                  <RxRow
                    key={idx}
                    drug={rx.drug}
                    dose={rx.dose}
                    days={rx.days}
                    note={rx.note}
                    warn={rx.warn}
                  />
                ))}
                {prescriptions.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground text-xs">No active medications drafted. Ready for AI Scribe.</div>
                )}
              </TabsContent>
              
              <TabsContent value="orders" className="mt-4 space-y-2 text-sm">
                {orders.map((o, idx) => (
                  <OrderRow key={idx} t={o.t} why={o.why} />
                ))}
                {orders.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground text-xs">No diagnostic investigations ordered. Ready for AI Scribe.</div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 border rounded-lg p-3 bg-muted/30">
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Stethoscope className="size-3.5" /> Doctor add-on
              </div>
              <Textarea
                placeholder="Free-text any additional findings…"
                className="bg-card mb-3 text-sm leading-relaxed"
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
              />
              <Button className="w-full font-medium" onClick={saveConsultation}>
                Lock & Save EMR Consultation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Copilot Advice Panel */}
        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Clinical Copilot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Suggestion
              title="Differential"
              body="Primary HTN sub-optimal control. Rule out secondary causes if eGFR ↓ or K+ ↓."
            />
            <Suggestion
              title="Drug check"
              body="Telmisartan + Aspirin: monitor renal function. No allergy match."
              tone="warning"
            />
            <Suggestion
              title="Guideline"
              body="ACC/AHA 2023: target <130/80 in DM/CKD risk. Consider adding amlodipine 5mg if BP > 135/85 in 4w."
            />
            <Suggestion
              title="Patient education"
              body="Auto-send 'DASH diet + sodium <2g/day' via WhatsApp."
            />
            <Button variant="outline" size="sm" className="w-full" onClick={handleApplySuggestions}>
              <PlusCircle className="size-4 mr-1" /> Apply all suggestions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Subcomponents helper methods

function Row({ k, v, tone }: { k: string; v: string; tone?: "warning" | "success" }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={tone === "warning" ? "text-warning font-medium" : "font-medium"}>{v}</span>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function Field({ label, value, onChange }: FieldProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm leading-relaxed border rounded-md p-3 bg-card w-full"
      />
    </div>
  );
}

function RxRow({
  drug,
  dose,
  days,
  note,
  warn,
}: {
  drug: string;
  dose: string;
  days: string;
  note?: string;
  warn?: string;
}) {
  return (
    <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-card">
      <div>
        <div className="font-medium">{drug}</div>
        <div className="text-xs text-muted-foreground">
          {dose} · {days} {note && <span className="text-primary font-medium">· {note}</span>}
        </div>
      </div>
      {warn && (
        <Badge variant="outline" className="text-warning border-warning/40 bg-warning/5">
          <AlertTriangle className="size-3 mr-1" /> {warn}
        </Badge>
      )}
    </div>
  );
}

function OrderRow({ t, why }: { t: string; why: string }) {
  return (
    <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-card">
      <div>
        <div className="font-medium">{t}</div>
        <div className="text-xs text-muted-foreground">{why}</div>
      </div>
      <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">Queued</Badge>
    </div>
  );
}

function Suggestion({ title, body, tone }: { title: string; body: string; tone?: "warning" }) {
  return (
    <div className={`border rounded-md p-3 ${tone === "warning" ? "border-warning/40 bg-warning/5" : "bg-card"}`}>
      <div className="text-xs font-semibold mb-1">{title}</div>
      <div className="text-xs text-muted-foreground leading-relaxed">{body}</div>
    </div>
  );
}