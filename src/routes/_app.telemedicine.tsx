import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Mic, PhoneOff, MessageSquare, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/telemedicine")({
  head: () => ({ meta: [{ title: "Telemedicine — Helix OS" }] }),
  component: Tele,
});

function Tele() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Telemedicine" subtitle="Video, audio, chat consultations · e-Prescription · waiting room · AI scribe in-call." />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-8 overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-700 relative">
            <div className="absolute top-3 left-3 flex gap-2"><Badge className="bg-destructive/90 text-destructive-foreground">● REC</Badge><Badge className="bg-black/60 text-white border-0">Encrypted · E2E</Badge></div>
            <div className="absolute bottom-3 right-3 size-32 bg-slate-800 border-2 border-white/20 rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">Live with Sara Khan · 00:14:22</div>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 border-t bg-card">
            <Button size="icon" variant="outline"><Mic className="size-4" /></Button>
            <Button size="icon" variant="outline"><Video className="size-4" /></Button>
            <Button size="icon" variant="outline"><MessageSquare className="size-4" /></Button>
            <Button size="icon" className="bg-destructive hover:bg-destructive/90"><PhoneOff className="size-4" /></Button>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Live AI Scribe</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-3">
            <Bubble who="Patient" t="I've been feeling tired and my heart races sometimes." />
            <Bubble who="Doctor" t="Any tremor or weight changes?" />
            <Bubble who="Patient" t="Lost 3 kg in 2 months. My hands shake a little." />
            <div className="border rounded-md p-3 bg-primary/5">
              <div className="text-xs font-semibold mb-1 text-primary">Draft impression</div>
              <div className="text-xs">Possible hyperthyroidism. Order TSH, fT3, fT4. Consider thyroid USG.</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader><CardTitle className="text-base">Waiting room</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {["Neha Sharma · 2 min","Rohit Iyer · 6 min","Priya Das · 9 min"].map((p) => (
              <div key={p} className="flex justify-between border rounded-md p-2"><span>{p}</span><Button size="sm" variant="ghost">Admit</Button></div>
            ))}
          </CardContent>
        </Card>
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader><CardTitle className="text-base">Session metrics</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-4 gap-4 text-sm">
            {[["Latency","82ms"],["Packet loss","0.1%"],["Bitrate","1.4 Mbps"],["Network","HD"]].map(([l,v]) => (
              <div key={l} className="border rounded-md p-3"><div className="text-xs text-muted-foreground">{l}</div><div className="font-semibold">{v}</div></div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function Bubble({ who, t }: { who: string; t: string }) {
  return <div className="border rounded-md p-2"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{who}</div><div>{t}</div></div>;
}