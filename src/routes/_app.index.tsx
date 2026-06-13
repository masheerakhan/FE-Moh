import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { kpis, visitsTrend, revenueSplit, aiAgents, todayAppointments } from "@/lib/mock-data";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import { ArrowUpRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  head: () => ({ meta: [{ title: "Helix OS — Command Center" }, { name: "description", content: "AI-powered Healthcare Operating System command center." }] }),
  component: Dashboard,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="rounded-2xl p-6 lg:p-8 text-primary-foreground relative overflow-hidden" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex items-start justify-between gap-6 relative z-10">
          <div>
            <Badge className="bg-white/15 hover:bg-white/15 text-primary-foreground border-0 mb-3"><Sparkles className="size-3 mr-1" /> AI Layer Active · 6 agents</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Good morning, Dr. Iyer.</h1>
            <p className="opacity-90 mt-1 max-w-xl">Your network handled <b>18,432</b> consultations today. AI Scribe drafted <b>14,802</b> SOAP notes — saving an estimated <b>1,230 clinician hours</b>.</p>
          </div>
          <div className="hidden md:flex gap-2">
            <Button variant="secondary" className="bg-white/15 text-primary-foreground hover:bg-white/25 border-0">Start Consult</Button>
            <Button className="bg-white text-primary hover:bg-white/90">Open Inbox <ArrowUpRight className="size-4 ml-1" /></Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-2xl font-semibold mt-1">{k.value}</div>
              <div className="text-xs mt-2 text-success">{k.delta} vs last week</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Network visit volume</CardTitle>
            <Badge variant="outline">Last 7 days</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={visitsTrend}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="visits" stroke="var(--chart-1)" fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="tele" stroke="var(--chart-3)" fill="url(#g2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenue mix</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={revenueSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {revenueSplit.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Today's appointments</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {todayAppointments.map((a) => (
                <div key={a.time + a.patient} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/40">
                  <div className="text-sm font-mono text-muted-foreground w-12">{a.time}</div>
                  <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">{a.patient.split(" ").map(x=>x[0]).join("")}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{a.patient}</div>
                    <div className="text-xs text-muted-foreground truncate">{a.reason}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">{a.type}</Badge>
                  <Badge className={
                    a.status === "In-room" ? "bg-success/15 text-success hover:bg-success/15" :
                    a.status === "Checked-in" ? "bg-info/15 text-info hover:bg-info/15" :
                    a.status === "Waiting" ? "bg-warning/15 text-warning hover:bg-warning/15" :
                    "bg-muted text-muted-foreground hover:bg-muted"}>
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>AI agents — live</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {aiAgents.map((a) => (
              <div key={a.name} className="flex items-center justify-between text-sm border rounded-lg p-3 hover:border-primary/40 transition">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.lang}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{a.calls.toLocaleString()}</div>
                  <div className="text-xs text-success">{a.resolved} resolved</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}