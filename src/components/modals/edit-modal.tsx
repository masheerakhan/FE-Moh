import React, { useState } from "react";
import { X, Search, Calendar } from "lucide-react";

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  doctorsList: any[];
  onSave: (updatedData: any) => void;
}

export function EditAppointmentModal({
  isOpen,
  onClose,
  appointment,
  doctorsList,
  onSave,
}: EditAppointmentModalProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState(appointment?.doctor_id || "");
  const [types, setTypes] = useState<string[]>([appointment?.department_name || "General Medicine"]);
  const [purpose, setPurpose] = useState(appointment?.purpose || "");
  const [tokenNumber, setTokenNumber] = useState(appointment?.token_number || "");
  const [startTime, setStartTime] = useState(appointment?.time || appointment?.startTime || "");
  const [endTime, setEndTime] = useState(appointment?.endTime || "");

  if (!isOpen || !appointment) return null;

  const AVAILABLE_TYPES = ["General Medicine", "Cardiology", "Pediatrics", "Endocrinology", "Dietician", "1st Consultation"];

  const toggleType = (t: string) => {
    setTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const timeOptions = [
    "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45",
    "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15",
    "14:30", "14:45", "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45",
    "17:00", "17:15", "17:30", "17:45", "18:00"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      doctor_id: selectedDoctorId,
      department_name: types[0] || "General Medicine",
      purpose,
      token_number: tokenNumber,
      time: startTime,
      endTime,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl mx-auto bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-[#141e33]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="size-5 text-teal-400" /> Edit Appointment
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Modify appointment fields
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar flex flex-col gap-4">
          
          {/* Patient Badge Row */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Patient
            </label>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-sm font-semibold">
              {appointment.patient_name || appointment.patientName || "—"}
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Assigned Doctor *
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-11"
              required
            >
              <option value="">Select Doctor</option>
              {doctorsList.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.first_name} {d.last_name || ""} ({d.specialization || "General Medicine"})
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Types - Pill Badges */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Appointment Type / Department category
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TYPES.map((t) => {
                const isSelected = types.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                      isSelected
                        ? "bg-teal-600 border-teal-500 text-white shadow-sm"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Purpose & Token - Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Purpose of Visit
              </label>
              <input
                type="text"
                placeholder="e.g. Follow-up consultation"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Token No.
              </label>
              <input
                type="number"
                min="1"
                placeholder="Auto"
                value={tokenNumber}
                onChange={(e) => setTokenNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-11"
              />
            </div>
          </div>

          {/* Time Slot - Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Start Time *
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono h-11"
                required
              >
                <option value="">Select Start Time</option>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono h-11"
              >
                <option value="">Select End Time</option>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-sm font-semibold text-white transition-all shadow-md"
            >
              Update Appointment
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
