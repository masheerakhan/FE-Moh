import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pill, Syringe, HeartPulse, FileText, Calendar, Video } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { patientApi, appointmentApi, axiosInstance } from "@/lib/api";

export const Route = createFileRoute("/_app/patient")({
  head: () => ({ meta: [{ title: "Patient App — MOH CLINICS" }] }),
  component: Patient,
});

const defaultFamily = [
  { n: "Riya Mehta", r: "Spouse" },
  { n: "Anaya Mehta", r: "Daughter · 6" },
  { n: "Rajesh Mehta", r: "Father · 67" },
  { n: "Sunita Mehta", r: "Mother · 62" },
];

const defaultMeds = [
  ["Telmisartan 80mg", "1-0-0", "Next: 9:00 AM"],
  ["Atorvastatin 10mg", "0-0-1", "Next: 10:00 PM"],
  ["Vitamin D3", "Weekly", "Sun"],
];

function Patient() {
  const [activePatient, setActivePatient] = useState<any>(null);
  const [activeDoctorId, setActiveDoctorId] = useState<string>("");
  const [family, setFamily] = useState<any[]>(defaultFamily);
  const [meds, setMeds] = useState<any[]>(defaultMeds);

  const loadPatientData = async () => {
    try {
      const patients = await patientApi.getAll();
      let aarav = null;
      if (patients && patients.length > 0) {
        aarav = patients.find((p) => p.first_name.toLowerCase().includes("aarav")) || patients[0];
      } else {
        // Auto-seed active patient profile for Aarav Mehta
        aarav = await patientApi.create({
          first_name: "Aarav",
          last_name: "Mehta",
          phone: "9876543210",
          gender: "MALE",
          date_of_birth: "1991-01-01",
        });
      }

      if (aarav) {
        setActivePatient(aarav);

        // Fetch family links
        const links = await patientApi.getFamilyLinks();
        if (links && links.length > 0) {
          const formattedLinks = links
            .filter((l) => l.primary_patient === aarav.id)
            .map((l) => ({
              n: l.member_patient || "Family Member",
              r: l.relationship.charAt(0) + l.relationship.slice(1).toLowerCase(),
            }));
          if (formattedLinks.length > 0) {
            setFamily(formattedLinks);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load patient dashboard values", err);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await axiosInstance.get("/doctors/");
      if (res.data && res.data.length > 0) {
        setActiveDoctorId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load doctor profiles inside patient app", err);
    }
  };

  useEffect(() => {
    loadPatientData();
    loadDoctors();
  }, []);

  const handleBookAppointment = async (v: Record<string, string>) => {
    if (!activePatient) {
      toast.error("No active patient profile loaded. Please create a patient profile first.");
      return;
    }
    if (!activeDoctorId) {
      toast.error("No active doctor profile found in backend database.");
      return;
    }

    try {
      await appointmentApi.createAppointment({
        patient_id: activePatient.id!,
        doctor_id: activeDoctorId,
        date: v.date,
        time: v.time,
        status: "CONFIRMED",
        type: "Consultation",
      });
      toast.success("Appointment booked successfully!", {
        description: `Scheduled with Dr. Riya Iyer on ${v.date} at ${v.time}.`,
      });
    } catch (err) {
      toast.error("Failed to book appointment in backend");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Patient Experience"
        subtitle={`What ${activePatient ? activePatient.first_name : "Aarav"} sees on his Helix app — bookings, records, medications, family, wellness.`}
      />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-4 overflow-hidden">
          <div
            className="p-6 text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <div className="text-xs uppercase tracking-wider opacity-80">Health score</div>
            <div className="text-4xl font-semibold">
              82<span className="text-xl opacity-70">/100</span>
            </div>
            <div className="text-sm opacity-90 mt-1">Improved by 4 pts this month</div>
          </div>
          <CardContent className="p-5 space-y-3">
            <Action
              icon={Calendar}
              t="Book appointment"
              s="See doctors near you"
              title="Book Clinic Appointment"
              description="Schedule a face-to-face consultation with your physician."
              fields={[
                { name: "date", label: "Date", placeholder: "YYYY-MM-DD", defaultValue: "2026-07-01" },
                { name: "time", label: "Time Slot", placeholder: "HH:MM", defaultValue: "10:00" },
              ]}
              confirmLabel="Book Appointment"
              onConfirm={handleBookAppointment}
            />
            <Action
              icon={Video}
              t="Start tele-consult"
              s="Avg wait 3 min"
              title="Start Teleconsultation"
              description="Instantly request a secure video consult room setup."
              confirmLabel="Request Consult"
              onConfirm={() => toast.success("Teleconsult requested. Doctor will admit you shortly.")}
            />
            <Action
              icon={FileText}
              t="View records"
              s="Lifetime medical timeline"
              title="Access Lifetime Records"
              description="Review prescription history, lab reports, and vitals charts."
              confirmLabel="Open Timeline"
              onConfirm={() => toast.info("Longitudinal EMR Timeline loaded.")}
            />
            <Action
              icon={Pill}
              t="Order refill"
              s="Telmisartan due in 4 days"
              title="Request Medication Refill"
              description="Automatically send a refill authorization request to the pharmacy."
              fields={[{ name: "drug", label: "Medication", defaultValue: "Telmisartan 80mg" }]}
              confirmLabel="Request Refill"
              onConfirm={(v) => toast.success(`Refill requested for ${v.drug}`)}
            />
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="size-4" /> Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {meds.map(([d, r, n]) => (
              <div key={d} className="border rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{d}</div>
                  <div className="text-xs text-muted-foreground">{r}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {n}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="size-4" /> Vitals · 7d
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["BP avg", "134/84", "↓ 2"],
              ["Steps", "8,420/day", "↑"],
              ["Sleep", "6h 48m", "→"],
              ["Resting HR", "68 bpm", "→"],
            ].map(([l, v, t]) => (
              <div key={l} className="border rounded-md p-3 flex items-center justify-between">
                <span className="text-muted-foreground">{l}</span>
                <span className="font-medium">
                  {v} <span className="text-xs text-muted-foreground">{t}</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-base">Family accounts</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {family.map((f) => (
              <div key={f.n} className="border rounded-md p-3 flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                  {f.n
                    .split(" ")
                    .map((x: string) => x[0])
                    .join("")}
                </div>
                <div className="text-sm">
                  <div className="font-medium">{f.n}</div>
                  <div className="text-xs text-muted-foreground">{f.r}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Syringe className="size-4" /> Vaccinations & wellness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["Influenza", "Mar 2026", "Complete"],
              ["Tdap booster", "Due Sep 2026", "Upcoming"],
              ["Annual master health", "Oct 2026", "Scheduled"],
              ["Diabetes program · Wk 8/24", "Active", "On track"],
            ].map(([n, d, s]) => (
              <div key={n} className="border rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{n}</div>
                  <div className="text-xs text-muted-foreground">{d}</div>
                </div>
                <Badge variant="outline">{s}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Action({
  icon: Icon,
  t,
  s,
  fields = [],
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
}: {
  icon: any;
  t: string;
  s: string;
  fields?: any[];
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm?: (values: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""]))
  );

  const handleSubmit = () => {
    for (const f of fields) {
      if (!values[f.name]?.toString().trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    onConfirm?.(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start h-auto py-3">
          <Icon className="size-4 mr-3 text-primary" />
          <div className="text-left">
            <div className="font-medium text-sm">{t}</div>
            <div className="text-xs text-muted-foreground font-normal">{s}</div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? t}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {fields.length > 0 && (
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={`action-field-${f.name}`}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={`action-field-${f.name}`}
                    placeholder={f.placeholder}
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  />
                ) : (
                  <Input
                    id={`action-field-${f.name}`}
                    type={f.type ?? "text"}
                    placeholder={f.placeholder}
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}