import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { X, Search, Clock, User, Layers, Info, Calendar } from "lucide-react";
import { axiosInstance, patientApi } from "@/lib/api";

const secureApi = axiosInstance;

interface Patient {
  id: string;
  first_name: string;
  last_name?: string;
  phone?: string;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name?: string;
  department_name?: string;
  specialization?: string;
}

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTime: string;
  initialDepartment: string;
  selectedScheduleDate: string;
  onSuccess: () => void;
}

export function BookAppointmentModal({
  isOpen,
  onClose,
  initialTime,
  initialDepartment,
  selectedScheduleDate,
  onSuccess,
}: BookAppointmentModalProps) {
  // 1. Core States
  const [patientQuery, setPatientQuery] = useState("");
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [activeDoctorId, setActiveDoctorId] = useState<string>('');

  useEffect(() => {
    const loadActiveDoctors = async () => {
      try {
        const response: any = await secureApi.get('/doctors');
        setDoctorsList(response?.data || response?.data?.doctors || []);
      } catch (err) { 
        console.error('Doctor load error:', err); 
      }
    };
    loadActiveDoctors();
  }, []);

  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment);
  const [startTime, setStartTime] = useState(initialTime);
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tokenNumber, setTokenNumber] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync initial department and times on load
  useEffect(() => {
    if (isOpen) {
      setSelectedDepartment(initialDepartment);
      setStartTime(initialTime);
      
      // Calculate 30-min block end-time automatically
      const [h, m] = initialTime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        let endM = m + 30;
        let endH = h;
        if (endM >= 60) {
          endH += 1;
          endM -= 60;
        }
        setEndTime(`${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`);
      }
      
      // Reset form variables
      setPatientQuery("");
      setSelectedPatient(null);
      setPurpose("");
      setTokenNumber("");
      loadInitialData();
    }
  }, [isOpen, initialTime, initialDepartment]);

  // Load backend patients lists
  const loadInitialData = async () => {
    try {
      // Load patients
      const pts = await patientApi.getAll();
      const mappedPts: Patient[] = (pts || []).map((p: any) => ({
        id: p.id || "",
        first_name: p.first_name,
        last_name: p.last_name,
        phone: p.phone,
      })).filter((p) => !!p.id);
      setAllPatients(mappedPts);
    } catch (err) {
      console.error("Failed to load initial data in booking modal:", err);
    }
  };


  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live autocomplete lookup as-you-type (debounced to prevent API flooding)
  useEffect(() => {
    if (patientQuery.trim().length < 2) {
      setFilteredPatients([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const response = await axiosInstance.get(`/patients/search?q=${patientQuery}`);
        if (response.data && response.data.patients) {
          setFilteredPatients(response.data.patients);
        }
      } catch (err) {
        console.error("Patient directory database lookup failure:", err);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [patientQuery]);

  // Dynamically filter doctors by selected department category
  const filteredDoctorsList = useMemo(() => {
    if (!selectedDepartment) return doctorsList;
    const deptLower = selectedDepartment.toLowerCase();
    return doctorsList.filter((d) => {
      const docDept = d.department_name?.toLowerCase() || "";
      const docSpec = d.specialization?.toLowerCase() || "";
      return docDept.includes(deptLower) || docSpec.includes(deptLower);
    });
  }, [selectedDepartment, doctorsList]);

  // Auto-select doctor if list updates
  useEffect(() => {
    if (filteredDoctorsList.length > 0) {
      setActiveDoctorId(filteredDoctorsList[0].id);
    } else {
      setActiveDoctorId("");
    }
  }, [filteredDoctorsList]);

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("Please search and select a patient first.");
      return;
    }
    if (!activeDoctorId) {
      toast.error("Please select a doctor to assign.");
      return;
    }
    if (!startTime || !endTime) {
      toast.error("Please fill in start and end times.");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post("/appointments/create", {
        patient_id: selectedPatient.id,
        doctor_id: activeDoctorId,
        appointment_date: selectedScheduleDate,
        start_time: startTime,
        end_time: endTime,
        purpose: purpose,
        token_number: tokenNumber ? parseInt(tokenNumber, 10) : undefined,
      });


      toast.success(`Appointment allocated successfully for ${selectedPatient.first_name}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Database appointment allocation failure:", err);
      toast.error(err?.response?.data?.detail || "Failed to persist slot allocation to backend.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const DEPARTMENTS = ["General Medicine", "Cardiology", "Pediatrics", "Endocrinology"];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-[calc(100%-2rem)] sm:w-full sm:max-w-md mx-auto overflow-hidden text-slate-100 shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Calendar className="size-4 text-teal-500" /> Book Appointment Slot
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Schedule Date: {selectedScheduleDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Form body */}
        <form onSubmit={handleSaveAppointment} className="p-5 space-y-4 flex-1">
          
          {/* Patient Search Autocomplete */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Search Patient (Name, Phone or ID) *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type name or phone to query database..."
                value={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name || ""}`.trim() : patientQuery}
                disabled={!!selectedPatient}
                onChange={(e) => {
                  setPatientQuery(e.target.value);
                  setIsPatientDropdownOpen(true);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 pl-8 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
              <Search className="absolute left-2.5 top-2 size-3.5 text-slate-500" />
              {selectedPatient && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientQuery("");
                  }}
                  className="absolute right-2 top-2 text-[10px] font-bold text-teal-400 hover:text-teal-300 hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown List */}
            {isPatientDropdownOpen && filteredPatients.length > 0 && !selectedPatient && (
              <div className="absolute left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded shadow-xl z-50 divide-y divide-slate-900 max-h-[160px] overflow-y-auto">
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPatient(p);
                      setIsPatientDropdownOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-slate-800 cursor-pointer text-xs flex flex-col"
                  >
                    <span className="font-semibold text-white">
                      {p.first_name} {p.last_name || ""}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Phone: {p.phone || "N/A"} | ID: {p.id.slice(0, 8)}...
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Patient notice */}
            {isPatientDropdownOpen && patientQuery.trim() && filteredPatients.length === 0 && !selectedPatient && (
              <div className="absolute left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded p-2.5 text-center text-[10px] text-slate-400 z-50">
                No matching patients found. Register patient in the Receptionist list first.
              </div>
            )}
          </div>

          {/* Time Slot Sync Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Start Time *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  required
                />
                <Clock className="absolute right-2.5 top-2 size-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                End Time *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  required
                />
                <Clock className="absolute right-2.5 top-2 size-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Appointment Type/Department Selection Chips */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Department Category / Column
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEPARTMENTS.map((dept) => {
                const isActive = selectedDepartment === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDepartment(dept)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      isActive 
                        ? "bg-teal-600 border-teal-500 text-white shadow-sm" 
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doctor Assignment Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Assigned Doctor *
            </label>
            <select
              value={activeDoctorId}
              onChange={(e) => setActiveDoctorId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            >
              {filteredDoctorsList.length === 0 ? (
                <option value="">No doctors available in {selectedDepartment}</option>
              ) : (
                filteredDoctorsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.first_name} {d.last_name || ""} ({d.specialization || selectedDepartment})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Purpose of Visit & Token Number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Purpose of Visit
              </label>
              <input
                type="text"
                placeholder="e.g. Routine checkup"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Token No.
              </label>
              <input
                type="number"
                placeholder="Auto"
                value={tokenNumber}
                onChange={(e) => setTokenNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Actions Command Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 rounded bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? "Booking..." : "Book Appointment"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
