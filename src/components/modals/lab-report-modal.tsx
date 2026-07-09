import React, { useState } from "react";
import { X, FileText } from "lucide-react";

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onSave: (labReportData: any) => void;
}

export function LabReportModal({
  isOpen,
  onClose,
  appointment,
  onSave,
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
      <div className="relative w-full max-w-4xl mx-auto bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-[#141e33]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="size-5 text-pink-400" /> Lab Report Upload
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Patient: {appointment.patient_name || appointment.patientName || "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Report Date */}
          <div className="w-full max-w-xs">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Date of Lab Report
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-10"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Blood Sugar Section */}
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                Blood Sugar
              </h4>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">HbA1c (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 5.7"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">Fasting Blood Sugar</label>
                <input
                  type="number"
                  placeholder="mg/dL"
                  value={fastingSugar}
                  onChange={(e) => setFastingSugar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">PP2 Blood Sugar</label>
                <input
                  type="number"
                  placeholder="mg/dL"
                  value={pp2Sugar}
                  onChange={(e) => setPp2Sugar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Lipid Profile */}
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                Lipid Profile
              </h4>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">Total Cholesterol</label>
                <input
                  type="number"
                  placeholder="mg/dL"
                  value={cholesterol}
                  onChange={(e) => setCholesterol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="block text-[10px] text-slate-400">LDL</label>
                  <input
                    type="number"
                    value={ldl}
                    onChange={(e) => setLdl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] text-slate-400">HDL</label>
                  <input
                    type="number"
                    value={hdl}
                    onChange={(e) => setHdl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">Triglycerides</label>
                <input
                  type="number"
                  value={triglycerides}
                  onChange={(e) => setTriglycerides(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Thyroid Function */}
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                Thyroid Function
              </h4>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">TSH (uIU/mL)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tsh}
                  onChange={(e) => setTsh(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">T3</label>
                <input
                  type="number"
                  step="0.01"
                  value={t3}
                  onChange={(e) => setT3(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">T4</label>
                <input
                  type="number"
                  step="0.01"
                  value={t4}
                  onChange={(e) => setT4(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Liver Function */}
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                Liver Function
              </h4>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">SGOT / AST</label>
                <input
                  type="number"
                  value={sgot}
                  onChange={(e) => setSgot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">SGPT / ALT</label>
                <input
                  type="number"
                  value={sgpt}
                  onChange={(e) => setSgpt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* USG Abdomen */}
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                USG Abdomen
              </h4>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">Gall Stones</label>
                <select
                  value={gallStones}
                  onChange={(e) => setGallStones(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500 h-9"
                >
                  <option value="">Select Option</option>
                  <option value="DETECTED">Detected</option>
                  <option value="NOT_DETECTED">Not Detected</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">Fatty Liver</label>
                <select
                  value={fattyLiver}
                  onChange={(e) => setFattyLiver(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500 h-9"
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
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-sm font-semibold text-white transition-all shadow-md"
            >
              Save Lab Report
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
