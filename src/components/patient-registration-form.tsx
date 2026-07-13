import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Sparkles, Activity, FileText, CheckCircle2 } from "lucide-react";
import { patientApi, schedulingApi, axiosInstance, organizationApi, clinicApi, departmentApi } from "@/lib/api";
import { currentUser as defaultUser } from "@/lib/tenant-context";

interface PatientRegistrationFormProps {
  onSuccess?: () => void;
  initialData?: any; // Used for the new edit mode
}

const secureApi = axiosInstance;

export function PatientRegistrationForm({ onSuccess, initialData }: PatientRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState(() => {
    const saved = localStorage.getItem("active_user");
    return saved ? JSON.parse(saved) : defaultUser;
  });
  const [organizationsList, setOrganizationsList] = useState<any[]>([]);
  const [clinicsList, setClinicsList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedDepartmentName, setSelectedDepartmentName] = useState("");

  // Form States
  // 1. Patient Name
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  // 2. Personal Details
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");

  // 3. Contact Information
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [email, setEmail] = useState("");

  // 4. Other Details
  const [language, setLanguage] = useState("English");
  const [guardianName, setGuardianName] = useState("");
  const [anniversary, setAnniversary] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [homeAddress, setHomeAddress] = useState("");

  // 5. ABHA Verification Handshake
  const [abhaInput, setAbhaInput] = useState("");
  const [txnId, setTxnId] = useState("");
  const [otp, setOtp] = useState("");
  const [abhaStatus, setAbhaStatus] = useState("UNVERIFIED"); // UNVERIFIED, VERIFYING, VERIFIED
  const [abhaDetails, setAbhaDetails] = useState<any>(null);

  // 6. Clinical & Emergency
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bp, setBp] = useState("");
  const [insurance, setInsurance] = useState("");

  // 7. Live Enqueuing
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [autoEnqueue, setAutoEnqueue] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("active_user");
    if (saved) {
      try {
        setActiveUser(JSON.parse(saved));
      } catch (e) {
        setActiveUser(defaultUser);
      }
    }
  }, []);

  useEffect(() => {
    const loadClinicContext = async () => {
      try {
        const [orgRes, clinicRes, deptRes] = await Promise.all([
          organizationApi.getAll(),
          clinicApi.getClinics(),
          departmentApi.getDepartments(),
        ]);

        const organizationRows = orgRes || [];
        const clinicRows = clinicRes || [];
        const departmentRows = deptRes || [];
        const filteredClinics = clinicRows.filter((c: any) => {
          const orgValue = c.organization_id || c.organization || "";
          return !activeUser.organization_id || !orgValue || String(orgValue) === String(activeUser.organization_id);
        });

        setOrganizationsList(organizationRows);
        setClinicsList(filteredClinics);
        setDepartmentsList(departmentRows);

        const defaultClinicId = filteredClinics.find((c: any) => String(c.id) === String(activeUser.clinic_id) || String(c.code) === String(activeUser.clinic_id))?.id || filteredClinics[0]?.id || "";
        setSelectedClinicId(defaultClinicId);
      } catch (err) {
        console.warn("Failed to fetch clinic context for registration form", err);
      }
    };

    loadClinicContext();
  }, [activeUser.organization_id, activeUser.clinic_id]);

  useEffect(() => {
    if (!selectedClinicId) {
      setSelectedDepartmentId("");
      setSelectedDepartmentName("");
      setDoctorsList([]);
      setSelectedDoctorId("");
      return;
    }

    const matchedDepartments = departmentsList.filter((d: any) => {
      const clinicValue = d.clinic_id || d.clinic || "";
      return String(clinicValue) === String(selectedClinicId);
    });

    setDepartmentsList((prev) => prev); // keep state stable
    const defaultDepartment = matchedDepartments[0];
    const nextDepartmentId = defaultDepartment?.id || "";
    const nextDepartmentName = defaultDepartment?.name || "";
    setSelectedDepartmentId(nextDepartmentId);
    setSelectedDepartmentName(nextDepartmentName);

    if (!nextDepartmentId) {
      setDoctorsList([]);
      setSelectedDoctorId("");
      return;
    }

    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get("/appointments/available-doctors/", {
          params: {
            organization_id: activeUser.organization_id,
            clinic_id: selectedClinicId,
            department: nextDepartmentName,
          },
        });
        const doctorRows = res.data?.doctors || res.data || [];
        setDoctorsList(Array.isArray(doctorRows) ? doctorRows : []);
        if (doctorRows.length > 0) {
          setSelectedDoctorId(doctorRows[0].id);
        } else {
          setSelectedDoctorId("");
        }
      } catch (err) {
        console.warn("Failed to fetch doctors list in registration form", err);
        setDoctorsList([]);
        setSelectedDoctorId("");
      }
    };

    fetchDoctors();
  }, [selectedClinicId, departmentsList, activeUser.organization_id]);

  // Load initialData for edit mode
  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.first_name || "");
      setMiddleName(initialData.middle_name || "");
      setLastName(initialData.last_name || "");
      setDob(initialData.date_of_birth || "");
      if (initialData.date_of_birth) {
        handleDobChange(initialData.date_of_birth);
      }
      setGender(initialData.gender === "MALE" ? "Male" : initialData.gender === "FEMALE" ? "Female" : initialData.gender || "Male");
      setPhone(initialData.phone || "");
      setAlternatePhone(initialData.alternate_phone || "");
      setEmail(initialData.email || "");
      setLanguage(initialData.preferred_language || "English");
      setGuardianName(initialData.guardian_name || "");
      setAnniversary(initialData.marriage_anniversary || "");
      setReferredBy(initialData.referred_by_doctor || "");
      setHomeAddress(initialData.home_address || "");
      setAbhaInput(initialData.abha_number || "");
      setAbhaStatus(initialData.abha_status || "UNVERIFIED");
      setEmergencyName(initialData.emergency_contact_name || "");
      setEmergencyPhone(initialData.emergency_contact_phone || "");
      setAllergies(initialData.known_allergies || "");
      setConditions(initialData.chronic_conditions || "");
      setWeight(initialData.weight ? String(initialData.weight) : "");
      setHeight(initialData.height ? String(initialData.height) : "");
      setBp(initialData.blood_pressure || "");
      setInsurance(initialData.insurance_policy || "");
    }
  }, [initialData]);

  // Auto-calculate Age when DOB changes
  const handleDobChange = (val: string) => {
    setDob(val);
    if (!val) {
      setAge("");
      return;
    }
    const birthDate = new Date(val);
    if (isNaN(birthDate.getTime())) {
      setAge("");
      return;
    }
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge >= 0 ? calculatedAge.toString() : "0");
  };

  // Generate ABHA OTP
  const handleGenerateAbhaOtp = async () => {
    if (!abhaInput.trim()) {
      toast.error("Please enter a valid Aadhaar, Mobile, or ABHA ID.");
      return;
    }
    setAbhaStatus("VERIFYING");
    try {
      const resp = await patientApi.generateOtp(abhaInput);
      setTxnId(resp.txn_id);
      toast.success("OTP Generated successfully!", {
        description: "Please enter the 6-digit code sent to your device (Mock: 123456)."
      });
    } catch (err: any) {
      toast.error("Failed to generate ABHA OTP.");
      setAbhaStatus("UNVERIFIED");
    }
  };

  // Verify ABHA OTP
  const handleVerifyAbhaOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    try {
      const resp = await patientApi.verifyOtp(txnId, otp);
      setAbhaStatus("VERIFIED");
      setAbhaDetails(resp.demographics);
      
      // Auto-populate demographics
      setFirstName(resp.demographics.first_name);
      setLastName(resp.demographics.last_name || "");
      setPhone(resp.demographics.phone || "");
      setGender(resp.demographics.gender === "FEMALE" ? "Female" : "Male");
      if (resp.demographics.date_of_birth) {
        handleDobChange(resp.demographics.date_of_birth);
      }
      setAbhaInput(resp.demographics.abha_number || resp.demographics.abha_address);
      
      toast.success("ABHA Identity Verified!", {
        description: `Successfully linked profile for ${resp.demographics.first_name}.`
      });
    } catch (err: any) {
      toast.error("ABHA OTP verification failed. Please try again.");
    }
  };

  const handleClear = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setDob("");
    setAge("");
    setGender("Male");
    setPhone("");
    setAlternatePhone("");
    setEmail("");
    setLanguage("English");
    setGuardianName("");
    setAnniversary("");
    setReferredBy("");
    setHomeAddress("");
    setAbhaInput("");
    setTxnId("");
    setOtp("");
    setAbhaStatus("UNVERIFIED");
    setAbhaDetails(null);
    setEmergencyName("");
    setEmergencyPhone("");
    setAllergies("");
    setConditions("");
    setWeight("");
    setHeight("");
    setBp("");
    setInsurance("");
    toast.info("Registration form cleared.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !dob) {
      toast.error("Verification Error", {
        description: "First Name, Last Name, Phone Number, and Date of Birth are strictly required fields."
      });
      return;
    }

    const payload = {
      first_name: firstName.trim(),
      middle_name: middleName.trim() || undefined,
      last_name: lastName.trim(),
      phone: phone.trim(),
      alternate_phone: alternatePhone.trim() || undefined,
      email: email.trim() || undefined,
      gender: gender.toUpperCase(),
      date_of_birth: dob,
      preferred_language: language,
      guardian_name: guardianName.trim() || undefined,
      marriage_anniversary: anniversary || undefined,
      referred_by_doctor: referredBy.trim() || undefined,
      home_address: homeAddress.trim() || undefined,
      abha_number: abhaDetails?.abha_number || undefined,
      abha_address: abhaDetails?.abha_address || undefined,
      abha_status: abhaStatus,
      emergency_contact_name: emergencyName.trim() || undefined,
      emergency_contact_phone: emergencyPhone.trim() || undefined,
      known_allergies: allergies.trim() || undefined,
      chronic_conditions: conditions.trim() || undefined,
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
      blood_pressure: bp.trim() || undefined,
      insurance_policy: insurance.trim() || undefined,
    };

    setLoading(true);
    try {
      let responseData;
      if (initialData?.id) {
        const response = await secureApi.put(`/patients/${initialData.id}/`, payload);
        responseData = response.data;
        toast.success("Patient updated successfully!");
      } else {
        const response = await secureApi.post('/patients/', payload);
        responseData = response.data;
        toast.success("Patient registered successfully!");
      }

      // Handle Auto-Enqueue to Live Consultation Queue
      if (!initialData?.id && autoEnqueue && selectedDoctorId) {
        try {
          await schedulingApi.issueToken(responseData.id!, selectedDoctorId);
          toast.success("Token Issued Successfully", {
            description: `Patient ${responseData.first_name} enqueued in live consultation queue.`
          });
        } catch (queueErr) {
          console.warn("Failed to issue token for registered patient", queueErr);
        }
      }
      
      handleClear();
      onSuccess?.();
    } catch (err: any) {
      console.warn("Backend patient registration/update failed, falling back to mock persistence context", err);
      
      if (initialData?.id) {
        const currentPatients = JSON.parse(localStorage.getItem("mock_patients") || "[]");
        const updatedPatients = currentPatients.map((p: any) => p.id === initialData.id ? { ...p, ...payload, id: initialData.id } : p);
        localStorage.setItem("mock_patients", JSON.stringify(updatedPatients));
        toast.success("Simulated Patient Update Success (Mock Sandbox fallback).");
      } else {
        // Sandbox mock fallback simulation
        const mockPatient = {
          id: `pat_mock_${Date.now()}`,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          gender: gender.toUpperCase(),
          date_of_birth: dob,
          abha_number: abhaInput || undefined,
          abha_status: abhaStatus
        };
        
        const currentPatients = JSON.parse(localStorage.getItem("mock_patients") || "[]");
        currentPatients.push(mockPatient);
        localStorage.setItem("mock_patients", JSON.stringify(currentPatients));

        if (autoEnqueue && selectedDoctorId) {
          const mockQueueItem = {
            id: `q_mock_${Date.now()}`,
            patient_id: mockPatient.id,
            patient: `${mockPatient.first_name} ${mockPatient.last_name || ""}`.trim(),
            doctor_id: selectedDoctorId,
            doctor: doctorsList.find(d => d.id === selectedDoctorId)?.name || "Doctor",
            token: `T-${100 + Math.floor(Math.random() * 900)}`,
            sequence: currentPatients.length + 1,
            status: "WAITING",
            check_in_time: new Date().toISOString(),
            estimated_wait_time: 15,
            wait: "15 min"
          };
          const currentQueue = JSON.parse(localStorage.getItem("mock_queue_items") || "[]");
          currentQueue.push(mockQueueItem);
          localStorage.setItem("mock_queue_items", JSON.stringify(currentQueue));
        }
        
        toast.success("Simulated Registration Success (Mock Sandbox fallback).");
      }
      handleClear();
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border-slate-200 bg-white text-slate-900 border-slate-200 shadow-2xl">
      <CardHeader className="border-b border-slate-200 pb-4">
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary animate-pulse" /> Register New Patient
          </div>
          <Badge variant="outline" className="text-[10px] uppercase bg-success/10 text-success border-success/30">
            Multi-Tenant Isolation (RLS)
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700">Organization</Label>
              <select
                value={activeUser.organization_id || ""}
                onChange={() => {}}
                className="w-full h-9 border border-slate-300 rounded-md px-2 text-xs bg-card font-medium"
                disabled
              >
                {organizationsList.map((org: any) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700">Clinic Branch</Label>
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="w-full h-9 border border-slate-300 rounded-md px-2 text-xs bg-card font-medium"
              >
                {clinicsList.map((clinic: any) => (
                  <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700">Department</Label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => {
                  const dept = departmentsList.find((d: any) => String(d.id) === String(e.target.value));
                  setSelectedDepartmentId(e.target.value);
                  setSelectedDepartmentName(dept?.name || "");
                }}
                className="w-full h-9 border border-slate-300 rounded-md px-2 text-xs bg-card font-medium"
              >
                {departmentsList.filter((d: any) => String(d.clinic_id || d.clinic) === String(selectedClinicId)).map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700">Assigned Doctor</Label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full h-9 border border-slate-300 rounded-md px-2 text-xs bg-card font-medium"
              >
                {doctorsList.length === 0 ? (
                  <option value="">No doctors available for this clinic/department</option>
                ) : doctorsList.map((doctor: any) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.doctor_name || doctor.name || `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ABHA National Identification Verification Handshake */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-650 flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" /> ABHA Identity Handshake
              </Label>
              <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wide ${
                abhaStatus === "VERIFIED" ? "bg-success/15 text-success border-success/30" : 
                abhaStatus === "VERIFYING" ? "bg-warning/15 text-warning border-warning/30 animate-pulse" : 
                "bg-slate-800/50 text-slate-650 border-slate-200"
              }`}>
                {abhaStatus}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Enter Aadhaar Number / Mobile / ABHA Address"
                value={abhaInput}
                onChange={(e) => setAbhaInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-9 flex-1"
              />
              {!txnId ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAbhaOtp}
                  className="h-9 border-slate-200 text-slate-700 bg-white hover:bg-slate-200 text-xs"
                >
                  Verify ABHA
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleVerifyAbhaOtp}
                  className="h-9 bg-success hover:bg-success/90 text-slate-900 text-xs"
                >
                  Confirm OTP
                </Button>
              )}
            </div>
            {txnId && abhaStatus !== "VERIFIED" && (
              <div className="space-y-1.5 animate-fadeIn">
                <Label className="text-xs text-slate-700">Verification OTP</Label>
                <Input
                  placeholder="Enter 6-Digit OTP (Mock Sandbox code is 123456)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900 h-9 font-mono"
                />
              </div>
            )}
          </div>

          {/* Section: Patient Name */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-650 border-b border-slate-200 pb-1">
              Patient Name
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">First Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Middle Name</Label>
                <Input
                  placeholder="Middle name (optional)"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Last Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section: Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-650 border-b border-slate-200 pb-1">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Date of Birth <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => handleDobChange(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900 h-10 block"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Age</Label>
                <Input
                  value={age}
                  disabled
                  placeholder="Auto-filled from DOB"
                  className="bg-white/50 border-slate-200 text-xs text-slate-650 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500 block pl-1">Calculated from DOB</span>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Sex</Label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-10 bg-white border border-slate-200 rounded-md px-2.5 text-xs text-slate-900 font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Contact Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-650 border-b border-slate-200 pb-1">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Phone Number <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Primary contact number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Alternate Phone Number</Label>
                <Input
                  placeholder="Secondary number (optional)"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Email Address</Label>
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section: Other Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-650 border-b border-slate-200 pb-1">
              Other Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Preferred Language</Label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-10 bg-white border border-slate-200 rounded-md px-2.5 text-xs text-slate-900 font-medium"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Urdu">Urdu</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Punjabi">Punjabi</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Parent / Guardian Name</Label>
                <Input
                  placeholder="Name of parent or guardian"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Marriage Anniversary</Label>
                <Input
                  type="date"
                  value={anniversary}
                  onChange={(e) => setAnniversary(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900 h-10 block"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Referred By Doctor</Label>
                <Input
                  placeholder="Referring doctor's name"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs text-slate-700">Home Address</Label>
              <textarea
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="Street, city, state..."
                className="w-full min-h-[70px] bg-white border border-slate-200 rounded-md p-3 text-xs text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Section: Clinical Metadata & Emergency */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-650 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <FileText className="size-4 text-primary" /> Clinical Timeline & Emergency Coordinates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Emergency Contact Person</Label>
                <Input
                  placeholder="Emergency contact full name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Emergency Contact Phone</Label>
                <Input
                  placeholder="Emergency contact mobile number"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Known Drug/Environmental Allergies</Label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Pollen..."
                  className="w-full min-h-[60px] bg-white border border-slate-200 rounded-md p-2.5 text-xs text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Primary Chronic Conditions</Label>
                <textarea
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma..."
                  className="w-full min-h-[60px] bg-white border border-slate-200 rounded-md p-2.5 text-xs text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 72.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Height (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 175.2"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700">Blood Pressure (BP)</Label>
                <Input
                  placeholder="e.g. 120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="bg-white border-slate-200 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700">Insurance Policy Details</Label>
              <Input
                placeholder="Carrier & Policy Reference (e.g. Star Health POL-88273)"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                className="bg-white border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Section: Queue Enqueuing options */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-650">
                Live consultation enqueuing
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoEnqueue"
                  checked={autoEnqueue}
                  onChange={(e) => setAutoEnqueue(e.target.checked)}
                  className="rounded border-slate-200 bg-white text-teal-600 focus:ring-teal-500"
                />
                <Label htmlFor="autoEnqueue" className="text-xs text-slate-700 select-none cursor-pointer">
                  Auto-Enqueue on registration
                </Label>
              </div>
            </div>

            {autoEnqueue && (
              <div className="space-y-1.5 animate-fadeIn">
                <Label className="text-xs text-slate-700">Assign to Physician</Label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full h-10 bg-white border border-slate-200 rounded-md px-2.5 text-xs text-slate-900 font-medium"
                >
                  {doctorsList.length === 0 ? (
                    <option value="">No Active Doctors Found</option>
                  ) : (
                    doctorsList.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name || `Dr. ${doc.first_name} ${doc.last_name || ""}`}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200/80 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="h-10 text-xs px-6 border-slate-200 text-slate-700 hover:bg-slate-200/50"
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 text-xs px-8 bg-teal-600 hover:bg-teal-700 text-slate-900 font-bold"
            >
              {loading ? "Registering..." : "Register Patient"}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
