import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { clinics } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/clinics")({
  head: () => ({ meta: [{ title: "Multi-clinic — Helix OS" }] }),
  component: Clinics,
});

function Clinics() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Multi-clinic & Hospital Network" subtitle="4,820 clinics · 512 hospitals · Centralized scheduling, inventory & analytics."
        actions={<><Button variant="outline" size="sm">Franchise console</Button><Button size="sm">Add branch</Button></>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[["Branches","4,820"],["Doctors","102,418"],["Beds","48,212"],["Avg utilization","82%"]].map(([l,v]) => (
          <Card key={l}><CardContent className="p-5"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Top branches today</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {clinics.map((c) => (
              <div key={c.name} className="grid grid-cols-12 items-center px-6 py-3 gap-4 text-sm">
                <div className="col-span-4">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.city}</div>
                </div>
                <div className="col-span-2"><div className="text-xs text-muted-foreground">Doctors</div><div className="font-mono">{c.doctors}</div></div>
                <div className="col-span-2"><div className="text-xs text-muted-foreground">Visits</div><div className="font-mono">{c.visits}</div></div>
                <div className="col-span-3"><div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Utilization</span><span>{c.util}%</span></div><Progress value={c.util} /></div>
                <div className="col-span-1 text-right"><Badge variant="outline">Live</Badge></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}