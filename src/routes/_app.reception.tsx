import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Phone, CreditCard, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { patientApi, schedulingApi, axiosInstance } from "@/lib/api";

export const Route = createFileRoute("/_app/reception")({
  head: () => ({ meta: [{ title: "Reception — Helix OS" }] }),
  component: Reception,
});

function Reception() {
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [activeDoctorId, setActiveDoctorId] = useState<string>("");

  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [reason, setReason] = useState("");

  const [txnId, setTxnId] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const refreshQueue = async () => {
    try {
      const qData = await schedulingApi.getQueue();
      setQueueItems(qData);
    } catch (err) {
      console.error("Failed to load queue from backend", err);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await axiosInstance.get("/doctors/");
      if (res.data && res.data.length > 0) {
        setActiveDoctorId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load doctor profiles", err);
    }
  };

  useEffect(() => {
    refreshQueue();
    loadDoctors();
  }, []);

  const handleGenerateAbhaOtp = async () => {
    if (!mobile.trim()) {
      toast.error("Please enter a mobile or Aadhaar number first.");
      return;
    }
    try {
      const resp = await patientApi.generateOtp(mobile);
      setTxnId(resp.txn_id);
      toast.success("ABHA verification OTP sent successfully!", {
        description: `Transaction ID: ${resp.txn_id} (Use mock OTP: 123456)`,
      });
    } catch (err: any) {
      toast.error("Failed to generate ABHA OTP");
    }
  };

  const handleVerifyAbhaOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP received.");
      return;
    }
    try {
      const resp = await patientApi.verifyOtp(txnId, otp);
      const demo = resp.demographics;
      setName(`${demo.first_name} ${demo.last_name || ""}`.trim());
      setMobile(demo.phone || mobile);
      setGender(demo.gender);
      setAge("35"); // Default age for mock demographics
      setReason("ABHA verified profile");
      setTxnId("");
      setOtp("");
      toast.success("ABHA demographics verified!", {
        description: `Verified Name: ${demo.first_name} · ABHA: ${demo.abha_number}`,
      });
    } catch (err: any) {
      toast.error("Invalid OTP or verification failure");
    }
  };

  const issueToken = async () => {
    if (!name.trim() || !mobile.trim()) {
      toast.error("Mobile and name are required");
      return;
    }

    if (!activeDoctorId) {
      toast.error("No active doctor profile found in backend. Please seed doctor profiles first.");
      return;
    }

    try {
      // 1. Create Patient Profile
      const nameParts = name.trim().split(" ");
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(" ");
      const patient = await patientApi.create({
        first_name,
        last_name: last_name || undefined,
        phone: mobile,
        gender: gender.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE",
      });

      // 2. Issue Queue Token
      const queueEntry = await schedulingApi.issueToken(patient.id!, activeDoctorId);

      toast.success(`Token ${queueEntry.token} issued to ${name}`, {
        description: reason || "Walk-in registered",
      });

      refreshQueue();

      setMobile("");
      setName("");
      setAge("");
      setGender("");
      setReason("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Failed to create patient profile in backend"
      );
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Reception Desk"
        subtitle="Walk-ins, queue, billing, check-in and check-out — Apollo Bandra"
        actions={
          <>
            <ActionButton
              label="AI Receptionist"
              icon={<Phone className="size-4" />}
              title="Hand off to AI Receptionist"
              description="Route inbound calls / WhatsApp to the AI receptionist agent."
              fields={[
                {
                  name: "channel",
                  label: "Channel",
                  defaultValue: "WhatsApp + IVR",
                },
              ]}
              confirmLabel="Activate"
              successMessage={() =>
                "AI Receptionist is now handling inbound traffic"
              }
            />
            <ActionButton
              primary
              label="Register Patient"
              icon={<UserPlus className="size-4" />}
              title="Register new patient"
              description="Create a full patient profile with ABHA / Aadhaar e-KYC."
              fields={[
                { name: "name", label: "Full name", placeholder: "Patient name" },
                { name: "mobile", label: "Mobile / ABHA", placeholder: "+91…" },
                { name: "dob", label: "Date of birth", placeholder: "DD / MM / YYYY" },
              ]}
              confirmLabel="Create profile"
              onConfirm={async (v) => {
                try {
                  const nameParts = v.name.trim().split(" ");
                  const first_name = nameParts[0];
                  const last_name = nameParts.slice(1).join(" ");
                  const patient = await patientApi.create({
                    first_name,
                    last_name: last_name || undefined,
                    phone: v.mobile,
                    gender: "MALE",
                    date_of_birth: v.dob || undefined,
                  });

                  if (activeDoctorId) {
                    await schedulingApi.issueToken(patient.id!, activeDoctorId);
                    refreshQueue();
                  }
                } catch (err: any) {
                  toast.error(
                    err.response?.data?.detail ||
                      err.message ||
                      "Failed to create patient profile in backend"
                  );
                }
              }}
              successMessage={(v) =>
                `${v.name} registered and enqueued successfully.`
              }
            />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-2">
              <Input
                placeholder="Mobile / Aadhaar / ABHA"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="flex-1"
              />
              {!txnId ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateAbhaOtp}
                  className="shrink-0"
                >
                  Verify ABHA
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleVerifyAbhaOtp}
                  className="shrink-0 bg-success hover:bg-success/90"
                >
                  Verify OTP
                </Button>
              )}
            </div>
            {txnId && (
              <Input
                placeholder="Enter 6-Digit OTP (Mock: 123456)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            )}
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <Input
                placeholder="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </div>
            <Input
              placeholder="Reason for visit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              className="w-full"
              style={{ background: "var(--gradient-primary)" }}
              onClick={issueToken}
            >
              Issue Token
            </Button>
            <div className="text-xs text-muted-foreground">
              OTP auto-sent · Aadhaar e-KYC available
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Live Queue</CardTitle>
            <Badge variant="outline">Avg wait {queueItems.length * 10} min</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-sm">
              <div className="grid grid-cols-6 px-6 py-2 text-xs text-muted-foreground font-medium font-semibold">
                <div>Token</div>
                <div className="col-span-2">Patient</div>
                <div>Status</div>
                <div className="text-right col-span-2">Actions</div>
              </div>
              {queueItems.length === 0 ? (
                <div className="px-6 py-4 text-muted-foreground text-center">
                  No patients in queue today. Use Quick Registration to add one.
                </div>
              ) : (
                queueItems.map((q) => (
                  <div key={q.id} className="grid grid-cols-6 px-6 py-3 items-center">
                    <div className="font-mono text-sm text-primary w-14">
                      {q.token}
                    </div>
                    <div className="col-span-2">
                      <div className="font-medium text-sm">{q.patient}</div>
                      <div className="text-xs text-muted-foreground">
                        {q.doctor} · {q.wait} wait
                      </div>
                    </div>
                    <div>
                      <Badge
                        className={
                          q.status === "In-room"
                            ? "bg-success/15 text-success hover:bg-success/15"
                            : q.status === "Vitals"
                              ? "bg-info/15 text-info hover:bg-info/15"
                              : "bg-warning/15 text-warning hover:bg-warning/15"
                        }
                      >
                        {q.status}
                      </Badge>
                    </div>
                    <div className="text-right col-span-2 flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await schedulingApi.updateQueueItem(q.id, {
                              status: "IN_ROOM",
                            });
                            toast.success(`${q.patient} checked in`);
                            refreshQueue();
                          } catch (err: any) {
                            toast.error("Failed to check-in patient");
                          }
                        }}
                      >
                        Check-in
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.info(`Billing opened for ${q.patient}`)}
                      >
                        <CreditCard className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await schedulingApi.deleteQueueItem(q.id);
                            toast.success(`Removed ${q.token}`);
                            refreshQueue();
                          } catch (err) {
                            toast.error("Failed to remove from queue");
                          }
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}