import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queue } from "@/lib/mock-data";
import { UserPlus, Phone, CreditCard, Trash2 } from "lucide-react";
import { useCollection } from "@/lib/use-collection";

type QueueItem = { id: string; token: string; patient: string; doctor: string; wait: string; status: string };
const seed: QueueItem[] = queue.map((q, i) => ({ id: `q${i}`, ...q }));

export const Route = createFileRoute("/_app/reception")({
  head: () => ({ meta: [{ title: "Reception — Helix OS" }] }),
  component: Reception,
});

function Reception() {
  const { items, create, remove, update } = useCollection<QueueItem>("reception_queue", seed);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [reason, setReason] = useState("");

  const issueToken = () => {
    if (!name.trim() || !mobile.trim()) { toast.error("Mobile and name are required"); return; }
    const nextNumber = String(items.length + 21).padStart(3, "0");
    create({
      token: `A-${nextNumber}`,
      patient: name,
      doctor: "Dr. Iyer",
      wait: "0 min",
      status: "Waiting",
    });
    toast.success(`Token A-${nextNumber} issued to ${name}`, { description: reason || "Walk-in registered" });
    setMobile(""); setName(""); setAge(""); setGender(""); setReason("");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Reception Desk" subtitle="Walk-ins, queue, billing, check-in and check-out — Apollo Bandra"
        actions={<><Button variant="outline" size="sm"><Phone className="size-4 mr-1" /> AI Receptionist</Button><Button size="sm"><UserPlus className="size-4 mr-1" /> Register Patient</Button></>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Quick Registration</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Input placeholder="Mobile / Aadhaar / ABHA" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
              <Input placeholder="Gender" value={gender} onChange={(e) => setGender(e.target.value)} />
            </div>
            <Input placeholder="Reason for visit" value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button className="w-full" style={{ background: "var(--gradient-primary)" }} onClick={issueToken}>Issue Token</Button>
            <div className="text-xs text-muted-foreground">OTP auto-sent · Aadhaar e-KYC available</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Live Queue</CardTitle>
            <Badge variant="outline">Avg wait 11 min</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {items.map((q) => (
                <div key={q.id} className="flex items-center gap-4 px-6 py-3">
                  <div className="font-mono text-sm text-primary w-14">{q.token}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{q.patient}</div>
                    <div className="text-xs text-muted-foreground">{q.doctor} · {q.wait} wait</div>
                  </div>
                  <Badge className={q.status === "In-room" ? "bg-success/15 text-success hover:bg-success/15" : q.status === "Vitals" ? "bg-info/15 text-info hover:bg-info/15" : "bg-warning/15 text-warning hover:bg-warning/15"}>{q.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => { update(q.id, { status: "In-room" }); toast.success(`${q.patient} checked in`); }}>Check-in</Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Billing opened for ${q.patient}`)}><CreditCard className="size-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { remove(q.id); toast.success(`Removed ${q.token}`); }}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}