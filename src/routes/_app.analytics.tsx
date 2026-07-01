import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { visitsTrend as defaultVisitsTrend } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { analyticsApi } from "@/lib/api";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Helix OS" }] }),
  component: Analytics,
});

const defaultCohorts = [
  { week: "W1", retained: 100 },
  { week: "W2", retained: 78 },
  { week: "W3", retained: 62 },
  { week: "W4", retained: 54 },
  { week: "W5", retained: 48 },
  { week: "W6", retained: 44 },
  { week: "W7", retained: 41 },
];

const defaultDx = [
  { d: "HTN", n: 84 },
  { d: "T2DM", n: 71 },
  { d: "URI", n: 52 },
  { d: "Asthma", n: 38 },
  { d: "Hypothy", n: 29 },
  { d: "Anemia", n: 24 },
];

const defaultMetrics = [
  ["Active patients", "1.24M", "+8%"],
  ["Tele share", "27%", "+3pt"],
  ["NPS", "72", "+4"],
  ["Readmit rate", "5.2%", "−1.1pt"],
];

function Analytics() {
  const [metrics, setMetrics] = useState<any[]>(defaultMetrics);
  const [visitsTrend, setVisitsTrend] = useState<any[]>(defaultVisitsTrend);
  const [cohorts, setCohorts] = useState<any[]>(defaultCohorts);
  const [dx, setDx] = useState<any[]>(defaultDx);

  const loadAnalyticsData = async () => {
    try {
      const dataMetrics = await analyticsApi.getMetrics();
      if (dataMetrics) {
        setMetrics([
          ["Active patients", dataMetrics.active_patients, "+8%"],
          ["Tele share", dataMetrics.tele_share, "+3pt"],
          ["NPS", dataMetrics.nps, "+4"],
          ["Readmit rate", dataMetrics.readmit_rate, "−1.1pt"],
        ]);
      }

      const trend = await analyticsApi.getVisitsTrend();
      if (trend && trend.length > 0) setVisitsTrend(trend);

      const ret = await analyticsApi.getRetentions();
      if (ret && ret.length > 0) setCohorts(ret);

      const diagnoses = await analyticsApi.getTopDiagnoses();
      if (diagnoses && diagnoses.length > 0) setDx(diagnoses);
    } catch (err) {
      console.error("Failed to load analytics dashboard data from backend", err);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Analytics Platform"
        subtitle="Doctor, clinic, revenue, patient, and AI-insight dashboards · Population health."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(([l, v, d]) => (
          <Card key={l}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="text-2xl font-semibold mt-1">{v}</div>
              <div className="text-xs text-success mt-1">{d}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Visit volume</CardTitle>
            <Badge variant="outline">7d</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={visitsTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Patient retention cohort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={cohorts}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="retained"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top diagnoses (network)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={dx}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="d"
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Bar
                    dataKey="n"
                    fill="var(--chart-3)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}