import React, { useState, useEffect } from "react";
import { X, Clock, Ruler, ClipboardList, TrendingUp } from "lucide-react";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

const secureApi = axiosInstance;

interface PatientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

export function PatientHistoryModal({
  isOpen,
  onClose,
  patientId,
  patientName,
}: PatientHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"measurements" | "labs">("measurements");
  const [measurementsHistory, setMeasurementsHistory] = useState<any[]>([]);
  const [labsHistory, setLabsHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchHistory = async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const [measRes, labsRes] = await Promise.all([
        secureApi.get("/reception/measurements/"),
        secureApi.get("/reception/structured-lab-reports/"),
      ]);
      
      const rawMeas = Array.isArray(measRes.data) ? measRes.data : measRes.data?.results || [];
      const rawLabs = Array.isArray(labsRes.data) ? labsRes.data : labsRes.data?.results || [];
      
      const filteredMeas = rawMeas
        .filter((m: any) => String(m.patient) === String(patientId))
        .sort((a: any, b: any) => new Date(a.created_at || a.date || 0).getTime() - new Date(b.created_at || b.date || 0).getTime());
        
      const filteredLabs = rawLabs
        .filter((l: any) => String(l.patient) === String(patientId))
        .sort((a: any, b: any) => new Date(a.date_of_report || 0).getTime() - new Date(b.date_of_report || 0).getTime());

      setMeasurementsHistory(filteredMeas);
      setLabsHistory(filteredLabs);
    } catch (error) {
      console.error("Failed to fetch patient history:", error);
      toast.error("Could not load patient history logs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patientId) {
      fetchHistory();
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  // Simple SVG sparkline generator for trend charts
  const renderSparkline = (data: number[], color: string = "#0d9488") => {
    if (!data || data.length < 2) return <div className="text-sm text-slate-500 text-center py-8">Need at least 2 data points for trend chart</div>;
    const maxVal = Math.max(...data) * 1.1 || 1;
    const minVal = Math.min(...data) * 0.9 || 0;
    const range = maxVal - minVal || 1;
    
    const width = 300;
    const height = 100;
    const padding = 10;
    
    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(" ");

    return (
      <div className="relative w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center">
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#cbd5e1" strokeDasharray="3,3" />
          {/* Main Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {/* Data Points */}
          {data.map((val, idx) => {
            const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
            return (
              <g key={idx} className="group">
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  className="fill-white stroke-2 cursor-pointer transition-all hover:r-7"
                  style={{ stroke: color }}
                />
                <title>{val}</title>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900 animate-scaleIn">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Timeline & History</h3>
              <p className="text-xs text-slate-500 mt-0.5">Patient: <span className="font-semibold text-teal-600">{patientName}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-50/60 border-b border-slate-200 px-6 py-2 flex gap-4">
          <button
            onClick={() => setActiveTab("measurements")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "measurements" ? "bg-teal-600 text-white shadow-sm" : "text-slate-650 hover:text-slate-900"
            }`}
          >
            <Ruler className="size-3.5" /> Measurements (BIA)
          </button>
          <button
            onClick={() => setActiveTab("labs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "labs" ? "bg-teal-600 text-white shadow-sm" : "text-slate-650 hover:text-slate-900"
            }`}
          >
            <ClipboardList className="size-3.5" /> Lab Diagnostics
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
              <p className="text-sm text-slate-500">Loading historical data logs...</p>
            </div>
          ) : (
            <>
              {activeTab === "measurements" && (
                <div className="space-y-6">
                  {measurementsHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-250 rounded-xl bg-slate-50/50">
                      No measurements or BIA records registered for this patient.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Charts Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">Weight Trend (kg)</span>
                            <TrendingUp className="size-4 text-teal-600" />
                          </div>
                          {renderSparkline(measurementsHistory.map(m => parseFloat(m.weight)).filter(v => !isNaN(v)), "#3b82f6")}
                        </div>
                        
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">BMI Trend</span>
                            <TrendingUp className="size-4 text-teal-600" />
                          </div>
                          {renderSparkline(measurementsHistory.map(m => parseFloat(m.bmi_device)).filter(v => !isNaN(v)), "#10b981")}
                        </div>

                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">Fat Percentage Trend (%)</span>
                            <TrendingUp className="size-4 text-teal-600" />
                          </div>
                          {renderSparkline(measurementsHistory.map(m => parseFloat(m.fat_percentage)).filter(v => !isNaN(v)), "#f59e0b")}
                        </div>

                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">Skeletal Muscle % Trend (%)</span>
                            <TrendingUp className="size-4 text-teal-600" />
                          </div>
                          {renderSparkline(measurementsHistory.map(m => parseFloat(m.skeletal_muscle_percentage)).filter(v => !isNaN(v)), "#ec4899")}
                        </div>
                      </div>

                      {/* Log Table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div className="grid grid-cols-5 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 border-b border-slate-200">
                          <div>Date</div>
                          <div>Weight (kg)</div>
                          <div>BMI</div>
                          <div>Fat %</div>
                          <div>Muscle %</div>
                        </div>
                        <div className="divide-y divide-slate-100 text-sm">
                          {measurementsHistory.map((m, idx) => (
                            <div key={m.id || idx} className="grid grid-cols-5 px-4 py-3 hover:bg-slate-50/50">
                              <div className="font-mono text-slate-500">{new Date(m.created_at || m.date).toLocaleDateString()}</div>
                              <div className="font-medium text-slate-800">{m.weight || "—"}</div>
                              <div className="text-slate-800">{m.bmi_device || "—"}</div>
                              <div className="text-slate-800">{m.fat_percentage || "—"}%</div>
                              <div className="text-slate-800">{m.skeletal_muscle_percentage || "—"}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "labs" && (
                <div className="space-y-6">
                  {labsHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-250 rounded-xl bg-slate-50/50">
                      No structured lab reports archived for this patient.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* HbA1c Trend */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">HbA1c Glycemic Trend (%)</span>
                            <TrendingUp className="size-4 text-teal-600" />
                          </div>
                          {renderSparkline(labsHistory.map(l => parseFloat(l.hba1c)).filter(v => !isNaN(v)), "#ef4444")}
                        </div>
                        
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">Fasting Blood Sugar Trend (mg/dL)</span>
                            <TrendingUp className="size-4 text-teal-600" />
                          </div>
                          {renderSparkline(labsHistory.map(l => parseFloat(l.fasting_sugar)).filter(v => !isNaN(v)), "#f97316")}
                        </div>
                      </div>

                      {/* Log Table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div className="grid grid-cols-6 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 border-b border-slate-200">
                          <div>Date</div>
                          <div>HbA1c (%)</div>
                          <div>Fasting (mg/dL)</div>
                          <div>PP2 (mg/dL)</div>
                          <div>Cholesterol</div>
                          <div>LDL / HDL</div>
                        </div>
                        <div className="divide-y divide-slate-100 text-sm">
                          {labsHistory.map((l, idx) => (
                            <div key={l.id || idx} className="grid grid-cols-6 px-4 py-3 hover:bg-slate-50/50">
                              <div className="font-mono text-slate-500">{new Date(l.date_of_report).toLocaleDateString()}</div>
                              <div className="font-semibold text-rose-600">{l.hba1c || "—"}</div>
                              <div className="text-slate-800">{l.fasting_sugar || "—"}</div>
                              <div className="text-slate-800">{l.pp2_sugar || "—"}</div>
                              <div className="text-slate-800">{l.total_cholesterol || "—"}</div>
                              <div className="text-slate-800">{l.ldl || "—"} / {l.hdl || "—"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
          >
            Close Timeline
          </button>
        </div>

      </div>
    </div>
  );
}
