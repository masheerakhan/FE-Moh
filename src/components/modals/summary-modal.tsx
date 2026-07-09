import React, { useState } from "react";
import { X, Calendar, Check, LogOut, Ban, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AppointmentSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onEdit: () => void;
  onMeasurements: () => void;
  onLabReport: () => void;
  onBilling: () => void;
  onDelete: () => void;
  onSaveNote: (note: string) => void;
}

export function AppointmentSummaryModal({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onMeasurements,
  onLabReport,
  onBilling,
  onDelete,
  onSaveNote,
}: AppointmentSummaryModalProps) {
  const [note, setNote] = useState(appointment?.notes || "");

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="size-5 text-slate-700" /> {appointment.patient_name || appointment.patientName || "Patient Details"}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Quick Actions Summary
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide block font-semibold">Time & Date</span>
              <span className="text-sm font-semibold text-slate-900">
                {appointment.time || appointment.startTime || "—"} | {appointment.date || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide block font-semibold">Doctor</span>
              <span className="text-sm font-semibold text-slate-900">
                {appointment.doctor_name || appointment.doctorName || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide block font-semibold">Type</span>
              <span className="text-sm font-semibold text-slate-900">
                {appointment.department_name || appointment.departmentName || "General Consultation"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide block font-semibold">Status</span>
              <div className="mt-1">
                <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                  appointment.status === 'CHECKED_IN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  appointment.status === 'CHECKED_OUT' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  appointment.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {appointment.status === 'CHECKED_IN' && <Check className="size-3 mr-1 inline" />}
                  {appointment.status === 'CHECKED_OUT' && <LogOut className="size-3 mr-1 inline" />}
                  {appointment.status === 'CANCELLED' && <Ban className="size-3 mr-1 inline" />}
                  {(!appointment.status || appointment.status === 'PENDING') && <Clock className="size-3 mr-1 inline" />}
                  {appointment.status || 'PENDING'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions Buttons Grid */}
          <div className="space-y-2">
            <span className="text-xs text-slate-500 uppercase tracking-wide block font-semibold">Quick Actions</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={onEdit}
                className="w-full px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={onMeasurements}
                className="w-full px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100 cursor-pointer"
              >
                Measurements
              </button>
              <button
                onClick={onLabReport}
                className="w-full px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 cursor-pointer"
              >
                Lab Report
              </button>
              <button
                onClick={onBilling}
                className="w-full px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 cursor-pointer"
              >
                Billing
              </button>
              <button
                onClick={onDelete}
                className="w-full px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 cursor-pointer col-span-2 sm:col-span-1"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Notes Box */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <label className="text-xs text-slate-500 uppercase tracking-wide block font-semibold">
              Notes
            </label>
            <textarea
              className="w-full h-24 bg-white border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 text-sm resize-none"
              placeholder="Add patient notes, clinical summaries, or reminders..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  onSaveNote(note);
                  toast.success("Note saved successfully.");
                }}
                className="py-1.5 px-4 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
