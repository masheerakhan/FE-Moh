import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
 
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
  const [purpose, setPurpose] = useState(appointment?.purpose_of_visit || appointment?.notes || appointment?.purpose || "");
  const [tokenNumber, setTokenNumber] = useState(appointment?.token_number || "");
  const [startTime, setStartTime] = useState(appointment?.time || appointment?.startTime || "");
  const [endTime, setEndTime] = useState(appointment?.endTime || "");

  useEffect(() => {
    if (appointment) {
      setSelectedDoctorId(appointment.doctor_id || "");
      setTypes([appointment.department_name || "General Medicine"]);
      setPurpose(appointment.purpose_of_visit || appointment.notes || appointment.purpose || "");
      setTokenNumber(appointment.token_number || "");
      setStartTime(appointment.time || appointment.startTime || "");
      setEndTime(appointment.endTime || "");
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;


  const AVAILABLE_TYPES = ["General Medicine", "Cardiology", "Pediatrics", "Endocrinology", "Dietician", "1st Consultation"];

  const toggleType = (t: string) => {
    setTypes([t]);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      doctor_id: selectedDoctorId,
      department_name: types[0] || "General Medicine",
      purpose,
      notes: purpose,
      token_number: tokenNumber,
      time: startTime,
      endTime,
      end_time: endTime,
    });
  };

  const inputClass = "w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-11";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900 animate-scaleIn">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="size-5 text-teal-650" /> Edit Appointment
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Modify appointment fields
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-950 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar flex flex-col gap-4">
          
          {/* Patient Badge Row */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Patient
            </label>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-sm font-semibold">
              {appointment.patient_name || appointment.patientName || "—"}
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Assigned Doctor *
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select Doctor</option>
              {doctorsList.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.name || `${d.first_name || ""} ${d.last_name || ""}`.trim() || "Physician"} ({d.specialization || d.specialty || "General Medicine"})
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Types - Pill Badges */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Appointment Type / Department Category
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
                        ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Purpose of Visit
              </label>
              <input
                type="text"
                placeholder="e.g. Follow-up consultation"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Token No.
              </label>
              <input
                type="number"
                min="1"
                placeholder="Auto"
                value={tokenNumber}
                onChange={(e) => setTokenNumber(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Time Slot - Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
                min="09:30"
                max="18:00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputClass}
                min="09:30"
                max="18:00"
              />
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
              Update Appointment
            </button>
          </div>

        </form>
 
      </div>
    </div>
  );
}
