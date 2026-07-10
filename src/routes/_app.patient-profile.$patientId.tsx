import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { patientApi, PatientProfile } from "@/lib/api/patient";
import { User, ShieldCheck, Activity, ArrowLeft, ChevronRight } from "lucide-react";
import { PatientHistoryModal } from "@/components/modals/patient-history-modal";

export const Route = createFileRoute("/_app/patient-profile/$patientId")({
  head: () => ({ meta: [{ title: "Patient Profile Details — Helix OS" }] }),
  component: PatientProfilePage,
});

function PatientProfilePage() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      setIsLoading(true);
      try {
        const data = await patientApi.getById(patientId);
        setPatientData(data);
      } catch (error) {
        console.error("Failed to fetch patient details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/appointments" })}
          className="gap-1.5 text-xs h-9"
        >
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Button>
      </div>

      <PageHeader
        title={`${patientData ? `${patientData.first_name} ${patientData.last_name || ""}` : "Patient"} Profile Directory`}
        subtitle="Full patient demographic registry, clinical metadata, and national health accounts linking state."
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="size-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
          <p className="text-sm text-slate-500">Loading profile details...</p>
        </div>
      ) : patientData ? (
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="size-5 text-teal-650" /> Personal Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">First Name</span>
                  <span className="mt-1 block text-base font-semibold text-slate-900">{patientData.first_name}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Last Name</span>
                  <span className="mt-1 block text-base font-semibold text-slate-900">{patientData.last_name || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Phone Number</span>
                  <span className="mt-1 block text-base font-semibold text-slate-900 font-mono">{patientData.phone || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Gender</span>
                  <span className="mt-1 block text-base font-semibold text-slate-900 capitalize">{patientData.gender?.toLowerCase() || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Date of Birth</span>
                  <span className="mt-1 block text-base font-semibold text-slate-900 font-mono">{patientData.date_of_birth || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Preferred Language</span>
                  <span className="mt-1 block text-base font-semibold text-slate-900">{patientData.preferred_language || "English"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="size-5 text-teal-650" /> ABHA Health ID & Aadhaar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm pb-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">ABHA Number</span>
                  <span className="mt-1 block text-base font-semibold text-slate-900 font-mono">{patientData.abha_number || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">ABHA Address</span>
                  <span className="mt-1 block text-base font-semibold text-slate-900 font-mono">{patientData.abha_address || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Aadhaar Number</span>
                  <span className="mt-1 block text-base font-semibold text-slate-900 font-mono">{(patientData as any).aadhaar_number || "—"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-teal-50 border border-teal-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-teal-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">National Health ID Status</span>
                    <span className="text-[11px] text-slate-500">Verified and synced with NHA Registry</span>
                  </div>
                </div>
                <Badge
                  className={
                    patientData.abha_status === "VERIFIED"
                      ? "bg-success/15 text-success hover:bg-success/15 text-[10px]"
                      : "bg-slate-200 text-slate-650 hover:bg-slate-200 text-[10px]"
                  }
                >
                  {patientData.abha_status === "VERIFIED" ? "VERIFIED" : "UNVERIFIED"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="size-5 text-teal-650" /> Clinical History Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-950">Longitudinal Timeline & Charts</h4>
                  <p className="text-xs text-slate-500">Inspect historical BIA body composition trends and structured laboratory panel entries.</p>
                </div>
                <Button
                  onClick={() => setIsHistoryOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5"
                >
                  View Clinical History <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">Patient profile not found.</div>
      )}

      {patientData && (
        <PatientHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          patientId={patientId}
          patientName={`${patientData.first_name} ${patientData.last_name || ""}`}
        />
      )}
    </div>
  );
}
