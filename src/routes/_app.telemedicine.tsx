import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/components/action-button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Sparkles, FileText, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { telemedicineApi, emrApi, patientApi } from "@/lib/api";

export const Route = createFileRoute("/_app/telemedicine")({
  head: () => ({ meta: [{ title: "Telemedicine — MOH CLINICS" }] }),
  component: Tele,
});

const defaultWaitingRoom = [
  { id: "wait0", patient_id: "p1", patient_name: "Neha Sharma", duration_minutes: 2 },
  { id: "wait1", patient_id: "p2", patient_name: "Rohit Iyer", duration_minutes: 6 },
  { id: "wait2", patient_id: "p3", patient_name: "Priya Das", duration_minutes: 9 },
];

const defaultTranscript = [
  { who: "Patient", t: "I've been feeling tired and my heart races sometimes." },
  { who: "Doctor",  t: "Any tremor or weight changes?" },
  { who: "Patient", t: "Lost 3 kg in 2 months. My hands shake a little." },
];

function Tele() {
  const [waitingList, setWaitingList]     = useState<any[]>(defaultWaitingRoom);
  const [isRecording, setIsRecording]     = useState<boolean>(true);
  const [recordingId, setRecordingId]     = useState<string>("");
  const [micOn,  setMicOn]               = useState(true);
  const [videoOn, setVideoOn]            = useState(true);
  const [chatOpen, setChatOpen]          = useState(false);
  const [chatMsg, setChatMsg]            = useState("");
  const [chatLog, setChatLog]            = useState<{ from: string; text: string }[]>([]);
  const [sessionSecs, setSessionSecs]    = useState(0);
  const [inCall, setInCall]              = useState(true);
  const [activeName, setActiveName]      = useState("Sara Khan");
  const [impression, setImpression]      = useState(
    "Possible hyperthyroidism. Order TSH, fT3, fT4. Consider thyroid USG."
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session clock
  useEffect(() => {
    if (inCall) {
      intervalRef.current = setInterval(() => setSessionSecs((s) => s + 1), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [inCall]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const refreshWaitingRoom = async () => {
    try {
      const data = await telemedicineApi.getWaitingRoom();
      if (data && data.length > 0) {
        setWaitingList(data);
      } else {
        setWaitingList(defaultWaitingRoom);
      }
    } catch (err) {
      console.error("Failed to load waiting room queue from backend", err);
      setWaitingList(defaultWaitingRoom);
    }
  };

  useEffect(() => {
    refreshWaitingRoom();
  }, []);

  const handleAdmit = async (patientId: string, name: string) => {
    try {
      if (!patientId.startsWith("p")) {
        await telemedicineApi.admitPatient(patientId);
        refreshWaitingRoom();
      } else {
        setWaitingList((prev) => prev.filter((item) => item.id !== patientId));
      }
      setActiveName(name);
      setInCall(true);
      setSessionSecs(0);
      toast.success(`${name} admitted to consultation`);
    } catch (err) {
      toast.error("Failed to admit patient from virtual waiting room");
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        const txnId = recordingId || "REC-9812";
        await telemedicineApi.stopRecording(txnId);
        setIsRecording(false);
        toast.info("WebRTC call recording stopped & archived in MinIO bucket.");
      } else {
        const result = await telemedicineApi.startRecording("consultation-channel");
        setRecordingId(result.recording_id);
        setIsRecording(true);
        toast.success("WebRTC call recording started (E2E Encrypted)");
      }
    } catch (err) {
      setIsRecording(!isRecording);
      toast.info("Recording status toggled (Local Fallback)");
    }
  };

  const toggleMic = () => {
    setMicOn((v) => !v);
    toast.info(micOn ? "Microphone muted" : "Microphone unmuted");
  };

  const toggleVideo = () => {
    setVideoOn((v) => !v);
    toast.info(videoOn ? "Camera off" : "Camera on");
  };

  const endCall = () => {
    setInCall(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    toast.info("Call ended. Session archived.");
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatLog((prev) => [...prev, { from: "Doctor", text: chatMsg }]);
    setChatMsg("");
    // Simulate patient response
    setTimeout(() => {
      setChatLog((prev) => [...prev, { from: activeName, text: "Understood, thank you Doctor." }]);
    }, 1500);
  };

  const handleEPrescribe = async (v: Record<string, string>) => {
    try {
      const patients = await patientApi.getAll();
      const patient = patients.find((p) =>
        `${p.first_name} ${p.last_name || ""}`.toLowerCase().includes(activeName.toLowerCase())
      ) || patients[0];

      if (patient) {
        const enc = await emrApi.createEncounter({
          patient: patient.id!,
          doctor: "EMP-RIYA",
          encounter_date: new Date().toISOString().slice(0, 10),
          type: "Tele-Consultation",
          notes: impression,
        });
        await emrApi.addPrescription({
          encounter: enc.id!,
          drug_name: v.drug,
          dosage: v.dose,
          duration_days: parseInt(v.days || "7", 10) || 7,
          instructions: `${v.frequency || "OD"} · ${impression}`,
        });
        toast.success(`e-Prescription sent for ${v.drug}`, {
          description: `${v.dose} · ${v.frequency || "OD"} · ${v.days || "7 days"}`,
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to issue e-prescription");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Telemedicine"
        subtitle="Video, audio, chat consultations · e-Prescription · waiting room · AI scribe in-call."
        actions={
          <ActionButton
            primary
            label="e-Prescribe"
            icon={<FileText className="size-4" />}
            title="Issue e-Prescription"
            description="Digitally sign and send a prescription to the patient's pharmacy of choice."
            fields={[
              { name: "drug", label: "Drug name", placeholder: "e.g. Levothyroxine 50mcg" },
              { name: "dose", label: "Dosage", placeholder: "e.g. 50mcg" },
              { name: "frequency", label: "Frequency", placeholder: "OD / BD / TDS" },
              { name: "days", label: "Duration", placeholder: "e.g. 30 days" },
            ]}
            confirmLabel="Sign & Send"
            onConfirm={handleEPrescribe}
            successMessage={(v) => `e-Prescription for ${v.drug} sent`}
          />
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Main Video Panel */}
        <Card className="col-span-12 lg:col-span-8 overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-700 relative">
            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {isRecording && (
                <Badge className="bg-destructive/90 text-destructive-foreground animate-pulse">
                  ● REC
                </Badge>
              )}
              <Badge className="bg-black/60 text-white border-0">Encrypted · E2E</Badge>
              {!micOn && <Badge className="bg-black/60 text-white border-0">🎤 Muted</Badge>}
              {!videoOn && <Badge className="bg-black/60 text-white border-0">📷 Camera off</Badge>}
            </div>

            {/* Session clock */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              <Clock className="size-3" />
              {formatTime(sessionSecs)}
            </div>

            {/* Patient thumbnail */}
            <div className="absolute bottom-3 right-3 size-32 bg-slate-800 border-2 border-white/20 rounded-lg flex items-center justify-center text-white/40 text-xs">
              You
            </div>

            {/* Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
              {inCall ? (
                <>
                  <div className="size-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold">
                    {activeName.charAt(0)}
                  </div>
                  <div className="text-sm">Live with {activeName}</div>
                </>
              ) : (
                <div className="text-sm text-white/50">Call ended</div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 p-4 border-t bg-card">
            <Button
              size="icon"
              variant={micOn ? "outline" : "secondary"}
              onClick={toggleMic}
              title={micOn ? "Mute mic" : "Unmute mic"}
            >
              {micOn ? <Mic className="size-4" /> : <MicOff className="size-4 text-destructive" />}
            </Button>
            <Button
              size="icon"
              variant={videoOn ? "outline" : "secondary"}
              onClick={toggleVideo}
              title={videoOn ? "Turn camera off" : "Turn camera on"}
            >
              {videoOn ? <Video className="size-4" /> : <VideoOff className="size-4 text-destructive" />}
            </Button>
            <Button
              size="icon"
              variant={chatOpen ? "default" : "outline"}
              onClick={() => setChatOpen((v) => !v)}
              title="Toggle chat"
            >
              <MessageSquare className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={toggleRecording}
              title={isRecording ? "Stop recording" : "Start recording"}
              className={isRecording ? "border-destructive text-destructive" : ""}
            >
              <span className={`size-2 rounded-full ${isRecording ? "bg-destructive animate-pulse" : "bg-muted-foreground"}`} />
            </Button>
            <Button
              size="icon"
              className="bg-destructive hover:bg-destructive/90"
              onClick={endCall}
              title="End call"
            >
              <PhoneOff className="size-4" />
            </Button>
          </div>

          {/* Chat panel */}
          {chatOpen && (
            <div className="border-t p-4 space-y-3 bg-muted/30">
              <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                {chatLog.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center">No messages yet</div>
                ) : (
                  chatLog.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "Doctor" ? "justify-end" : "justify-start"}`}>
                      <div className={`rounded-lg px-3 py-1.5 text-xs max-w-xs ${m.from === "Doctor" ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                        <div className="font-medium mb-0.5">{m.from}</div>
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type a message..."
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  className="h-9 resize-none text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                />
                <Button size="sm" onClick={sendChat}>Send</Button>
              </div>
            </div>
          )}
        </Card>

        {/* AI Scribe */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Live AI Scribe
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            {defaultTranscript.map((b, i) => (
              <Bubble key={i} who={b.who} t={b.t} />
            ))}
            <div className="border rounded-md p-3 bg-primary/5">
              <div className="text-xs font-semibold mb-1.5 text-primary">Draft impression</div>
              <Textarea
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                className="text-xs min-h-16 resize-none"
                placeholder="Edit AI-generated impression…"
              />
            </div>
          </CardContent>
        </Card>

        {/* Waiting Room */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Waiting room</CardTitle>
            <Badge variant="outline">{waitingList.length} waiting</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {waitingList.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-3">
                Waiting room is empty.
              </div>
            ) : (
              waitingList.map((p) => (
                <div key={p.id} className="flex justify-between items-center border rounded-md p-2.5">
                  <div>
                    <div className="font-medium">{p.patient_name}</div>
                    <div className="text-xs text-muted-foreground">{p.duration_minutes} min wait</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdmit(p.id, p.patient_name)}
                  >
                    Admit
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Session Metrics */}
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-base">Session metrics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4 text-sm">
            {[
              ["Latency", "82ms", "text-success"],
              ["Packet loss", "0.1%", "text-success"],
              ["Bitrate", "1.4 Mbps", ""],
              ["Duration", formatTime(sessionSecs), "text-primary"],
            ].map(([l, v, c]) => (
              <div key={l} className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">{l}</div>
                <div className={`font-semibold mt-0.5 ${c}`}>{v}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Bubble({ who, t }: { who: string; t: string }) {
  return (
    <div className="border rounded-md p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{who}</div>
      <div>{t}</div>
    </div>
  );
}