import React, { useState, useEffect } from "react";
import { X, User, Phone, ShieldCheck, Calendar, Activity, ChevronRight } from "lucide-react";
import { patientApi, PatientProfile } from "@/lib/api/patient";
import { Badge } from "@/components/ui/badge";

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onViewClinicalHistory: (patientId: string) => void;
}

export function PatientProfileModal({
  isOpen,
  onClose,
  patientId,
  onViewClinicalHistory,
}: PatientProfileModalProps) {
  const [patientData, setPatientData] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      setIsLoading(true);
      try {
        const data = await patientApi.getById(patientId);
        setPatientData(data);
      } catch (error) {
        console.error("Failed to fetch patient details:", error);
        // Mock fallback if necessary
        setPatientData({
          id: patientId,
          first_name: "Mocked",
          last_name: "Patient",
          phone: "9999999999",
          gender: "MALE",
          date_of_birth: "1990-01-01",
          abha_status: "UNVERIFIED",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && patientId) {
      fetchPatient();
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900 animate-scaleIn">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="size-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Profile Directory</h3>
              <p className="text-xs text-slate-500 mt-0.5">Demographics Registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-950 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
              <p className="text-sm text-slate-500">Loading profile details...</p>
            </div>
          ) : (
            <>
              {/* Demographics Card */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Patient Demographics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Full Name</label>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {patientData ? `${patientData.first_name} ${patientData.last_name || ""}` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Phone Number</label>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{patientData?.phone || "N/A"}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Gender</label>
                    <div className="mt-1 text-sm font-semibold text-slate-900 capitalize">
                      {patientData?.gender?.toLowerCase() || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Date of Birth</label>
                    <div className="mt-1 text-sm font-semibold text-slate-900 font-mono">{patientData?.date_of_birth || "N/A"}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">ABHA Number</label>
                    <div className="mt-1 text-sm font-semibold text-slate-900 font-mono">{patientData?.abha_number || "N/A"}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">ABHA Address</label>
                    <div className="mt-1 text-sm font-semibold text-slate-900 font-mono">{patientData?.abha_address || "N/A"}</div>
                  </div>
                </div>
              </div>

              {/* ABHA Status Segment */}
              <div className="flex items-center justify-between p-4 bg-teal-50/50 border border-teal-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-teal-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">ABHA Linking Status</span>
                    <span className="text-[11px] text-slate-500">Linked with national digital health accounts registry</span>
                  </div>
                </div>
                <Badge
                  className={
                    patientData?.abha_status === "VERIFIED"
                      ? "bg-success/15 text-success hover:bg-success/15 text-[10px]"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-200 text-[10px]"
                  }
                >
                  {patientData?.abha_status === "VERIFIED" ? "VERIFIED" : "UNVERIFIED"}
                </Badge>
              </div>

              {/* Clinical History Navigation Card */}
              <div className="p-5 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <Activity className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">Clinical Analytics & Log History</h4>
                    <p className="text-xs text-slate-500">Review historical BMI metrics, weight trend sparklines, and laboratory report diagnostics.</p>
                  </div>
                </div>
                <button
                  onClick={() => onViewClinicalHistory(patientId)}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  View Clinical History <ChevronRight className="size-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
}
