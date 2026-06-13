import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Syringe, HeartPulse, FileText, Calendar, Video } from "lucide-react";

export const Route = createFileRoute("/_app/patient")({
  head: () => ({ meta: [{ title: "Patient App — Helix OS" }] }),
  component: Patient,
});

function Patient() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Patient Experience" subtitle="What Aarav sees on his Helix app — bookings, records, medications, family, wellness." />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-4 overflow-hidden">
          <div className="p-6 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
            <div className="text-xs uppercase tracking-wider opacity-80">Health score</div>
            <div className="text-4xl font-semibold">82<span className="text-xl opacity-70">/100</span></div>
            <div className="text-sm opacity-90 mt-1">Improved by 4 pts this month</div>
          </div>
          <CardContent className="p-5 space-y-3">
            <Action icon={Calendar} t="Book appointment" s="See doctors near you" />
            <Action icon={Video} t="Start tele-consult" s="Avg wait 3 min" />
            <Action icon={FileText} t="View records" s="Lifetime medical timeline" />
            <Action icon={Pill} t="Order refill" s="Telmisartan due in 4 days" />
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Pill className="size-4" /> Medications</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[["Telmisartan 80mg","1-0-0","Next: 9:00 AM"],["Atorvastatin 10mg","0-0-1","Next: 10:00 PM"],["Vitamin D3","Weekly","Sun"]].map(([d,r,n]) => (
              <div key={d} className="border rounded-md p-3 flex items-center justify-between"><div><div className="font-medium">{d}</div><div className="text-xs text-muted-foreground">{r}</div></div><Badge variant="outline" className="text-xs">{n}</Badge></div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><HeartPulse className="size-4" /> Vitals · 7d</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[["BP avg","134/84","↓ 2"],["Steps","8,420/day","↑"],["Sleep","6h 48m","→"],["Resting HR","68 bpm","→"]].map(([l,v,t]) => (
              <div key={l} className="border rounded-md p-3 flex items-center justify-between"><span className="text-muted-foreground">{l}</span><span className="font-medium">{v} <span className="text-xs text-muted-foreground">{t}</span></span></div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader><CardTitle className="text-base">Family accounts</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[["Riya Mehta","Spouse"],["Anaya Mehta","Daughter · 6"],["Rajesh Mehta","Father · 67"],["Sunita Mehta","Mother · 62"]].map(([n,r]) => (
              <div key={n} className="border rounded-md p-3 flex items-center gap-3"><div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">{n.split(" ").map(x=>x[0]).join("")}</div><div className="text-sm"><div className="font-medium">{n}</div><div className="text-xs text-muted-foreground">{r}</div></div></div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Syringe className="size-4" /> Vaccinations & wellness</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[["Influenza","Mar 2026","Complete"],["Tdap booster","Due Sep 2026","Upcoming"],["Annual master health","Oct 2026","Scheduled"],["Diabetes program · Wk 8/24","Active","On track"]].map(([n,d,s]) => (
              <div key={n} className="border rounded-md p-3 flex items-center justify-between"><div><div className="font-medium">{n}</div><div className="text-xs text-muted-foreground">{d}</div></div><Badge variant="outline">{s}</Badge></div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function Action({ icon: Icon, t, s }: { icon: any; t: string; s: string }) {
  return <Button variant="outline" className="w-full justify-start h-auto py-3"><Icon className="size-4 mr-3 text-primary" /><div className="text-left"><div className="font-medium text-sm">{t}</div><div className="text-xs text-muted-foreground font-normal">{s}</div></div></Button>;
}