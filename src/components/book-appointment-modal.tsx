import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { X, Search, Clock, User, Layers, Info, Calendar } from "lucide-react";
import { axiosInstance, patientApi } from "@/lib/api";
import { currentUser } from "@/lib/tenant-context";

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
  const [patientQuery, setPatientQuery] = useState<string>('');
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState<boolean>(true);
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment || "General Medicine");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const activeDoctorId = selectedDoctorId;
  const setActiveDoctorId = setSelectedDoctorId;
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      const savedUserStr = localStorage.getItem("active_user");
      let organizationId = currentUser.organization_id || "";
      let clinicId = currentUser.clinic_id || "";

      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          organizationId = parsed.organization_id || organizationId;
          clinicId = parsed.clinic_id || clinicId;
        } catch (e) {}
      }

      if (!selectedDepartment) {
        setDoctorsList([]);
        setIsLoadingDoctors(false);
        return;
      }

      try {
        setIsLoadingDoctors(true);
        const response = await secureApi.get(`/appointments/available-doctors/`, {
          params: {
            organization_id: organizationId,
            clinic_id: clinicId,
            department: selectedDepartment
          }
        });

        const fetchedDocs = response.data.doctors || response.data || [];
        setDoctorsList(Array.isArray(fetchedDocs) ? fetchedDocs : []);
      } catch (err: any) {
        console.error("Doctor fetch error:", err.response?.data || err);
        setDoctorsList([]);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    if (isOpen) {
      fetchDoctors();
    }
  }, [selectedDepartment, isOpen]);

  // Real-time effect for debounced patient search autocomplete query
  useEffect(() => {
    const searchPatients = async () => {
      if (!patientQuery || patientQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        // 'search' is the standard Django filter parameter
        const response = await secureApi.get(`/patients/`, {
          params: { search: patientQuery.trim() } 
        });
        
        // Handle both DRF paginated responses and flat arrays safely
        const results = response.data.results || response.data || [];
        setSearchResults(results);
      } catch (err) {
        console.error("Patient search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [patientQuery]);

  const [startTime, setStartTime] = useState(initialTime);
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tokenNumber, setTokenNumber] = useState<number | string>("Auto");

  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync initial department and times on load
  useEffect(() => {
    if (isOpen) {
      setSelectedDepartment(initialDepartment || "General Medicine");
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
      setTokenNumber("Auto");
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

  // Dynamically filter doctors by selected department category
  const filteredDoctorsList = useMemo(() => {
    if (!selectedDepartment) return doctorsList;
    const deptLower = selectedDepartment.toLowerCase();
    return doctorsList.filter((d) => {
      const docDept = d.department_name?.toLowerCase() || "";
      const docSpec = d.specialization?.toLowerCase() || d.specialty?.toLowerCase() || "";
      return (
        docDept.includes(deptLower) ||
        docSpec.includes(deptLower) ||
        deptLower.includes(docSpec) ||
        (deptLower.includes("general") && docSpec.includes("general")) ||
        (deptLower.includes("general") && docSpec.includes("physician"))
      );
    });
  }, [selectedDepartment, doctorsList]);

  // Auto-select doctor if list updates
  useEffect(() => {
    if (filteredDoctorsList.length > 0) {
      setSelectedDoctorId(filteredDoctorsList[0].id);
    } else {
      setSelectedDoctorId("");
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
        token_number: typeof tokenNumber === "number" ? tokenNumber : (tokenNumber && tokenNumber !== "Auto" ? parseInt(tokenNumber, 10) : undefined),
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
      <div className="relative w-full max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden sm:m-4 m-2 text-slate-900">
        
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="size-5 text-teal-650" /> Book Appointment Slot
            </h3>
            <p className="text-xs text-slate-650 font-mono mt-1">
              Schedule Date: {selectedScheduleDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-650 hover:text-slate-900 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form body */}
        <form onSubmit={handleSaveAppointment} className="px-8 py-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          
          {/* Patient Search Autocomplete */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-11 pl-10"
                required
              />
              <Search className="absolute left-3 top-3 size-4 text-slate-500" />
              {selectedPatient && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientQuery("");
                  }}
                  className="absolute right-3 top-3 text-xs font-bold text-teal-650 hover:text-teal-300 hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown List */}
            {isPatientDropdownOpen && searchResults.length > 0 && !selectedPatient && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-xl z-50 divide-y divide-slate-900 max-h-[160px] overflow-y-auto">
                {searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPatient(p);
                      setIsPatientDropdownOpen(false);
                    }}
                    className="px-4 py-3 hover:bg-slate-200 cursor-pointer text-sm flex flex-col"
                  >
                    <span className="font-semibold text-slate-900">
                      {p.first_name} {p.last_name || ""}
                    </span>
                    <span className="text-xs text-slate-650 font-mono mt-0.5">
                      Phone: {p.phone || "N/A"} | ID: {p.id.slice(0, 8)}...
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Patient notice */}
            {isPatientDropdownOpen && patientQuery.trim() && searchResults.length === 0 && !selectedPatient && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg p-3 text-center text-sm text-slate-650 z-50">
                No matching patients found. Register patient in the Receptionist list first.
              </div>
            )}
          </div>

          {/* Time Slot Sync Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono h-11"
                min="09:30"
                max="18:00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono h-11"
                min="09:30"
                max="18:00"
                required
              />
            </div>
          </div>


          {/* Appointment Type/Department Selection Chips */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Department Category
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => {
                const isActive = selectedDepartment === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDepartment(dept)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                      isActive
                        ? "bg-teal-600 border-teal-500 text-slate-900 shadow-sm"
                        : "bg-white border-slate-200 text-slate-650 hover:text-slate-900 hover:border-slate-500"
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Assigned Doctor *
            </label>
            <select
              value={activeDoctorId}
              onChange={(e) => setActiveDoctorId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-11"
              required
            >
              {isLoadingDoctors ? (
                <option value="" disabled>Loading Doctors...</option>
              ) : filteredDoctorsList.length === 0 ? (
                <option value="" disabled>No doctors available in this clinic facility</option>
              ) : (
                <>
                  <option value="" disabled>Select a Doctor</option>
                  {filteredDoctorsList.map((doc: any) => {
                    const doctorName = doc.doctor_name || doc.name || doc.full_name || [doc.first_name, doc.last_name].filter(Boolean).join(" ") || "Doctor";
                    const specialty = doc.specialty || doc.specialization || doc.department_name || doc.department || "General Physician";
                    return (
                      <option key={doc.id} value={doc.id}>
                        {doctorName} ({specialty})
                      </option>
                    );
                  })}
                </>
              )}
            </select>
          </div>

          {/* Purpose of Visit & Token Number */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Purpose of Visit
              </label>
              <input
                type="text"
                placeholder="e.g. Routine checkup"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-11"
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
                value={tokenNumber === "Auto" ? "" : tokenNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTokenNumber(val > 0 ? val : "");
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-11"
              />
            </div>
          </div>

          {/* Actions Command Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? "Booking..." : "Book Appointment"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
