import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Mic, PhoneOff, MessageSquare, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { telemedicineApi } from "@/lib/api";

export const Route = createFileRoute("/_app/telemedicine")({
  head: () => ({ meta: [{ title: "Telemedicine — Helix OS" }] }),
  component: Tele,
});

const defaultWaitingRoom = [
  { id: "wait0", patient_id: "p1", patient_name: "Neha Sharma", duration_minutes: 2 },
  { id: "wait1", patient_id: "p2", patient_name: "Rohit Iyer", duration_minutes: 6 },
  { id: "wait2", patient_id: "p3", patient_name: "Priya Das", duration_minutes: 9 },
];

function Tele() {
  const [waitingList, setWaitingList] = useState<any[]>(defaultWaitingRoom);
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [recordingId, setRecordingId] = useState<string>("");

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
      // Fallback
      setWaitingList(defaultWaitingRoom);
    }
  };

  useEffect(() => {
    refreshWaitingRoom();
  }, []);

  const handleAdmit = async (patientId: string, name: string) => {
    try {
      if (patientId.startsWith("wait")) {
        setWaitingList((prev) => prev.filter((item) => item.id !== patientId));
      } else {
        await telemedicineApi.admitPatient(patientId);
        refreshWaitingRoom();
      }
      toast.success(`${name} admitted to consultation`);
    } catch (err) {
      toast.error("Failed to admit patient from virtual waiting room");
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording
        const txnId = recordingId || "REC-9812";
        await telemedicineApi.stopRecording(txnId);
        setIsRecording(false);
        toast.info("WebRTC call recording stopped & archived in MinIO bucket.");
      } else {
        // Start recording
        const result = await telemedicineApi.startRecording("consultation-channel");
        setRecordingId(result.recording_id);
        setIsRecording(true);
        toast.success("WebRTC call recording started (E2E Encrypted)");
      }
    } catch (err) {
      // Simulate toggle for development fallbacks
      setIsRecording(!isRecording);
      toast.info("Recording status toggled (Local Fallback)");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Telemedicine"
        subtitle="Video, audio, chat consultations · e-Prescription · waiting room · AI scribe in-call."
      />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-8 overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-700 relative">
            <div className="absolute top-3 left-3 flex gap-2">
              {isRecording && (
                <Badge className="bg-destructive/90 text-destructive-foreground animate-pulse">
                  ● REC
                </Badge>
              )}
              <Badge className="bg-black/60 text-white border-0">Encrypted · E2E</Badge>
            </div>
            <div className="absolute bottom-3 right-3 size-32 bg-slate-800 border-2 border-white/20 rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">
              Live with Sara Khan · 00:14:22
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 border-t bg-card">
            <Button size="icon" variant="outline" onClick={toggleRecording}>
              <Mic className="size-4" />
            </Button>
            <Button size="icon" variant="outline">
              <Video className="size-4" />
            </Button>
            <Button size="icon" variant="outline">
              <MessageSquare className="size-4" />
            </Button>
            <Button size="icon" className="bg-destructive hover:bg-destructive/90">
              <PhoneOff className="size-4" />
            </Button>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Live AI Scribe
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <Bubble who="Patient" t="I've been feeling tired and my heart races sometimes." />
            <Bubble who="Doctor" t="Any tremor or weight changes?" />
            <Bubble who="Patient" t="Lost 3 kg in 2 months. My hands shake a little." />
            <div className="border rounded-md p-3 bg-primary/5">
              <div className="text-xs font-semibold mb-1 text-primary">Draft impression</div>
              <div className="text-xs">
                Possible hyperthyroidism. Order TSH, fT3, fT4. Consider thyroid USG.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Waiting room</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {waitingList.map((p) => (
              <div key={p.id} className="flex justify-between items-center border rounded-md p-2">
                <span>
                  {p.patient_name} · {p.duration_minutes} min
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAdmit(p.id, p.patient_name)}
                >
                  Admit
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-base">Session metrics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4 text-sm">
            {[
              ["Latency", "82ms"],
              ["Packet loss", "0.1%"],
              ["Bitrate", "1.4 Mbps"],
              ["Network", "HD"],
            ].map(([l, v]) => (
              <div key={l} className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">{l}</div>
                <div className="font-semibold">{v}</div>
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