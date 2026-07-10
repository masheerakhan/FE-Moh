import React, { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  initialData?: any;
  onSave: (labReportData: any) => void;
  onViewHistory?: () => void;
}

export function LabReportModal({
  isOpen,
  onClose,
  appointment,
  initialData,
  onSave,
  onViewHistory,
}: LabReportModalProps) {
  const [reportDate, setReportDate] = useState("");

  // Blood Sugar State
  const [hba1c, setHba1c] = useState("");
  const [fastingSugar, setFastingSugar] = useState("");
  const [pp2Sugar, setPp2Sugar] = useState("");

  // Lipid Profile
  const [cholesterol, setCholesterol] = useState("");
  const [ldl, setLdl] = useState("");
  const [hdl, setHdl] = useState("");
  const [triglycerides, setTriglycerides] = useState("");

  // Liver Function
  const [sgot, setSgot] = useState("");
  const [sgpt, setSgpt] = useState("");

  // USG Abdomen
  const [gallStones, setGallStones] = useState("");
  const [fattyLiver, setFattyLiver] = useState("");

  // Thyroid Function
  const [tsh, setTsh] = useState("");
  const [t3, setT3] = useState("");
  const [t4, setT4] = useState("");

  useEffect(() => {
    if (initialData) {
      setReportDate(initialData.date_of_report || "");
      setHba1c(initialData.hba1c ? String(initialData.hba1c) : "");
      setFastingSugar(initialData.fasting_sugar ? String(initialData.fasting_sugar) : "");
      setPp2Sugar(initialData.pp2_sugar ? String(initialData.pp2_sugar) : "");
      setCholesterol(initialData.total_cholesterol ? String(initialData.total_cholesterol) : "");
      setLdl(initialData.ldl ? String(initialData.ldl) : "");
      setHdl(initialData.hdl ? String(initialData.hdl) : "");
      setTriglycerides(initialData.triglycerides ? String(initialData.triglycerides) : "");
      setSgot(initialData.sgot_ast ? String(initialData.sgot_ast) : "");
      setSgpt(initialData.sgpt_alt ? String(initialData.sgpt_alt) : "");
      setGallStones(initialData.gall_stones || "Not tested");
      setFattyLiver(initialData.fatty_liver || "Not tested");
      setTsh(initialData.tsh ? String(initialData.tsh) : "");
      setT3(initialData.t3 ? String(initialData.t3) : "");
      setT4(initialData.t4 ? String(initialData.t4) : "");
    } else {
      setReportDate(new Date().toISOString().slice(0, 10));
      setHba1c("");
      setFastingSugar("");
      setPp2Sugar("");
      setCholesterol("");
      setLdl("");
      setHdl("");
      setTriglycerides("");
      setSgot("");
      setSgpt("");
      setGallStones("Not tested");
      setFattyLiver("Not tested");
      setTsh("");
      setT3("");
      setT4("");
    }
  }, [initialData, isOpen]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      reportDate,
      hba1c,
      fastingSugar,
      pp2Sugar,
      cholesterol,
      ldl,
      hdl,
      triglycerides,
      sgot,
      sgpt,
      gallStones,
      fattyLiver,
      tsh,
      t3,
      t4,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="size-5 text-pink-650" /> Lab Report Upload
            </h3>
            <p className="text-xs text-slate-650 font-mono mt-1">
              Patient: {appointment.patient_name || appointment.patientName || "—"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                View History
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg text-slate-650 hover:text-slate-900 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>


        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Report Date */}
          <div className="w-full max-w-xs">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Date of Lab Report
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-10"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Blood Sugar Section */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-pink-650 uppercase tracking-wider border-b border-slate-200 pb-1">
                Blood Sugar
              </h4>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">HbA1c (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 5.7"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">Fasting Blood Sugar</label>
                <input
                  type="number"
                  placeholder="mg/dL"
                  value={fastingSugar}
                  onChange={(e) => setFastingSugar(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">PP2 Blood Sugar</label>
                <input
                  type="number"
                  placeholder="mg/dL"
                  value={pp2Sugar}
                  onChange={(e) => setPp2Sugar(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Lipid Profile */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-pink-650 uppercase tracking-wider border-b border-slate-200 pb-1">
                Lipid Profile
              </h4>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">Total Cholesterol</label>
                <input
                  type="number"
                  placeholder="mg/dL"
                  value={cholesterol}
                  onChange={(e) => setCholesterol(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="block text-[10px] text-slate-650">LDL</label>
                  <input
                    type="number"
                    value={ldl}
                    onChange={(e) => setLdl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] text-slate-650">HDL</label>
                  <input
                    type="number"
                    value={hdl}
                    onChange={(e) => setHdl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">Triglycerides</label>
                <input
                  type="number"
                  value={triglycerides}
                  onChange={(e) => setTriglycerides(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Thyroid Function */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-pink-650 uppercase tracking-wider border-b border-slate-200 pb-1">
                Thyroid Function
              </h4>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">TSH (uIU/mL)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tsh}
                  onChange={(e) => setTsh(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">T3</label>
                <input
                  type="number"
                  step="0.01"
                  value={t3}
                  onChange={(e) => setT3(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">T4</label>
                <input
                  type="number"
                  step="0.01"
                  value={t4}
                  onChange={(e) => setT4(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Liver Function */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-pink-650 uppercase tracking-wider border-b border-slate-200 pb-1">
                Liver Function
              </h4>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">SGOT / AST</label>
                <input
                  type="number"
                  value={sgot}
                  onChange={(e) => setSgot(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">SGPT / ALT</label>
                <input
                  type="number"
                  value={sgpt}
                  onChange={(e) => setSgpt(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* USG Abdomen */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-pink-650 uppercase tracking-wider border-b border-slate-200 pb-1">
                USG Abdomen
              </h4>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">Gall Stones</label>
                <select
                  value={gallStones}
                  onChange={(e) => setGallStones(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 h-9"
                >
                  <option value="">Select Option</option>
                  <option value="DETECTED">Detected</option>
                  <option value="NOT_DETECTED">Not Detected</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-650">Fatty Liver</label>
                <select
                  value={fattyLiver}
                  onChange={(e) => setFattyLiver(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 h-9"
                >
                  <option value="">Select Option</option>
                  <option value="NORMAL">Normal</option>
                  <option value="GRADE_1">Grade 1 Fatty Liver</option>
                  <option value="GRADE_2">Grade 2 Fatty Liver</option>
                  <option value="GRADE_3">Grade 3 Fatty Liver</option>
                </select>
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white transition-all shadow-md"
            >
              Save Lab Report
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
