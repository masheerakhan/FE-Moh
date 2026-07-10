import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";
import { Calendar, Check, LogOut, Ban, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { appointmentApi, axiosInstance } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentCalendar } from "@/components/department-calendar";
import { BookAppointmentModal } from "@/components/book-appointment-modal";
import { AppointmentSummaryModal } from "@/components/modals/summary-modal";
import { EditAppointmentModal } from "@/components/modals/edit-modal";
import { MeasurementsModal } from "@/components/modals/measurements-modal";
import { LabReportModal } from "@/components/modals/lab-report-modal";
import { PatientHistoryModal } from "@/components/modals/patient-history-modal";
import { PatientProfileModal } from "@/components/modals/patient-profile-modal";

const secureApi = axiosInstance;

export const Route = createFileRoute("/_app/appointments")({
  head: () => ({ meta: [{ title: "Appointments — MOH CLINICS" }] }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const navigate = useNavigate();
  const [activeDoctorId, setActiveDoctorId] = useState<string>("");

  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [activeScheduleDate, setActiveScheduleDate] = useState<string>("2026-07-08");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'summary' | 'edit' | 'measurements' | 'labReport' | null>(null);
  const [measurementsInitialData, setMeasurementsInitialData] = useState<any>(null);
  
  // History Modal states
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyPatientId, setHistoryPatientId] = useState<string>("");
  const [historyPatientName, setHistoryPatientName] = useState<string>("");
  
  // Profile Modal states
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [profilePatientId, setProfilePatientId] = useState<string>("");
  const [profilePatientName, setProfilePatientName] = useState<string>("");

  const [currentLabReport, setCurrentLabReport] = useState<any>(null);

  useEffect(() => {
    const fetchExistingLabReport = async () => {
      if (activeModal === 'labReport' && selectedAppointment?.patient_id) {
        try {
          const res = await secureApi.get("/reception/structured-lab-reports/");
          const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
          const patientReports = list.filter((r: any) => String(r.patient) === String(selectedAppointment.patient_id));
          if (patientReports.length > 0) {
            setCurrentLabReport(patientReports[0]);
          } else {
            setCurrentLabReport(null);
          }
        } catch (err) {
          console.error("Failed to load existing lab report:", err);
          setCurrentLabReport(null);
        }
      } else {
        setCurrentLabReport(null);
      }
    };
    fetchExistingLabReport();
  }, [activeModal, selectedAppointment]);

  const filteredAppointments = appointments.filter((app: any) => {

    const status = (app.status || '').toUpperCase().trim();

    if (statusFilter === 'ALL') return true;

    if (statusFilter === 'CONFIRMED') {
      return status === 'CONFIRMED' || status === 'BOOKED';
    }

    if (statusFilter === 'CHECKED_IN') {
      return status === 'CHECKED_IN';
    }

    if (statusFilter === 'CHECKED_OUT') {
      return status === 'CHECKED_OUT';
    }

    if (statusFilter === 'CANCELLED') {
      return status === 'CANCELLED' || status === 'CANCELED' || status === 'BLOCKED';
    }

    return false;
  });

  const calendarAppointments = filteredAppointments.filter(
    (a: any) => a.date === activeScheduleDate
  );

  const cancelledCount = appointments.filter(a => a.status?.toUpperCase() === 'CANCELLED').length;

  const loadDoctors = async () => {
    try {
      const res = await axiosInstance.get("/doctors/");
      if (res.data) {
        setDoctorsList(res.data);
        if (res.data.length > 0) {
          setActiveDoctorId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load doctor profiles in appointments dashboard", err);
    }
  };

  const refreshAppointments = async () => {
    try {
      const data = await appointmentApi.getAppointments() as any;
      const list = data.slots || data || [];
      if (Array.isArray(list)) {
        const merged = list.map((a: any) => ({
          ...a,
          purpose_of_visit: a.purpose_of_visit || a.purpose || "",
          purpose: a.purpose_of_visit || a.purpose || "",
          notes: a.notes || "",
        }));
        setAppointments(merged);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.warn("Failed to fetch appointments", err);
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadDoctors();
    refreshAppointments();
  }, []);

  const handleCancel = async (id: string | number) => {
    try {
      // Soft delete / status update
      await secureApi.patch(`/appointments/${id}/`, { status: 'CANCELLED' });
      toast.success("Appointment cancelled successfully");
      refreshAppointments();
    } catch (error) {
      console.error("Cancel failed:", error);
      toast.error("Failed to cancel appointment.");
    }
  };

  const handleDelete = async (id: any) => {
    if (!window.confirm("Permanently delete?")) return;
    try {
      await secureApi.delete(`/appointments/${id}/`);
      await refreshAppointments();
    } catch (e) { 
      console.error(e); 
    }
  };
  const handleConfirm = async (id: string | number) => {
    try {
      await secureApi.patch(`/appointments/${id}/`, { status: 'CONFIRMED' });
      toast.success("Appointment status confirmed");
      refreshAppointments();
    } catch (error) {
      console.error("Confirm failed:", error);
      toast.error("Failed to confirm appointment.");
    }
  };

  const updateStatus = async (id: any, newStatus: string) => {
    try {
      await appointmentApi.updateAppointment(id, { status: newStatus as any }); 
      await refreshAppointments(); // Force state refresh
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (e) { 
      console.error(e); 
      toast.error("Failed to update status.");
    }
  };
  return (
    <ModulePage
      title="Appointment Scheduling"
      subtitle="Online + walk-in + tele appointments across all clinics with smart slot allocation and AI no-show prediction."
      icon={Calendar}
      primaryAction="New Appointment"
      primaryActionOnClick={() => setIsBookingModalOpen(true)}
      stats={[
        { label: "Booked today", value: appointments.length.toString(), hint: "+12.4% WoW" },
        { label: "Tele share", value: "27%", hint: "+3 pts" },
        { label: "No-show risk flagged", value: cancelledCount.toString(), hint: "By AI Risk Engine" },
        { label: "Avg wait", value: "11 min", hint: "Across 4,820 clinics" },
      ]}
      sections={[
        {
          title: "Booking channels",
          items: [
            "Patient app + web",
            "WhatsApp / IVR / AI Receptionist",
            "Walk-in queue",
            "Doctor follow-up auto-book",
            "Referral inbox",
          ],
        },
        {
          title: "Smart scheduling",
          items: [
            "Doctor templates + leaves",
            "Resource & room allocation",
            "Multi-clinic load balancing",
            "Recurring follow-ups",
            "Buffer & double-book rules",
          ],
        },
        {
          title: "Reminders & no-shows",
          items: [
            "T-24h / T-2h reminders",
            "AI no-show probability score",
            "Auto-rebook waitlist",
            "Cancel / reschedule self-serve",
            "Deposit / hold-slot payments",
          ],
        },
      ]}
      workflow={[
        "Patient initiates booking (app, web, WhatsApp, IVR, or AI Receptionist).",
        "System resolves clinic + doctor + slot with constraints (specialty, language, gender, in-clinic/tele).",
        "AI Risk Engine scores no-show probability; high-risk slots offered with deposit.",
        "Confirmation across SMS + WhatsApp + Email + Push; calendar invite generated.",
        "T-24h and T-2h reminders fire; self-serve reschedule available.",
        "On arrival, token issued and patient enters queue; tele patients enter waiting room.",
        "Post-visit: follow-up auto-suggested, feedback NPS captured, billing reconciled.",
      ]}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
           <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
            <TabsList>
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="CHECKED_IN">Checked-in</TabsTrigger>
              <TabsTrigger value="CHECKED_OUT">Checked-out</TabsTrigger>
              <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex bg-muted rounded p-0.5 text-xs font-semibold">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded-sm transition-all ${
              viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1 rounded-sm transition-all ${
              viewMode === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Grid View
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-12 px-6 py-2 text-xs text-muted-foreground font-medium border-b">
                  <div className="col-span-2">Patient</div>
                  <div className="col-span-2">Doctor</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1">Time</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-3"></div>
                </div>
                {filteredAppointments.length === 0 ? (
                  <div className="px-6 py-8 text-muted-foreground text-center text-xs">
                    No appointments found. Click &quot;New Appointment&quot; to create one.
                  </div>
                ) : (
                  filteredAppointments.map((app: any) => {
                    const appStatus = (app.status || '').toUpperCase().trim();
                    return (
                      <div
                        key={app.id}
                        className="grid grid-cols-12 px-6 py-3 items-center hover:bg-slate-50 transition-colors border-t border-slate-100"
                      >
                        <div 
                          onClick={() => {
                            setSelectedAppointment(app);
                            setActiveModal('summary');
                          }}
                          className="col-span-2 font-medium text-slate-900 text-xs truncate pr-2 hover:underline cursor-pointer"
                        >
                          {app.patient_name || app.patientName || "—"}
                        </div>
                        <div className="col-span-2 text-slate-600 text-xs truncate pr-2">
                          {app.doctor_name || app.doctorName || "—"}
                        </div>
                        <div className="col-span-2 font-mono text-slate-600 text-xs">{app.date || app.schedule_date || app.scheduleDate || "—"}</div>
                        <div className="col-span-1 font-mono text-slate-600 text-xs">{app.time || app.startTime || "—"}</div>
                        
                        {/* Status Cell */}
                        <div className="col-span-2 flex items-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            appStatus === 'CHECKED_IN' ? 'bg-blue-50/80 text-blue-700 border-blue-200 shadow-sm' :
                            appStatus === 'CHECKED_OUT' ? 'bg-purple-50/80 text-purple-700 border-purple-200 shadow-sm' :
                            appStatus === 'CANCELLED' ? 'bg-rose-50/80 text-rose-700 border-rose-200 shadow-sm' :
                            'bg-amber-50/80 text-amber-700 border-amber-200 shadow-sm'
                          }`}>
                            {appStatus === 'CHECKED_IN' && <Check className="size-3 text-blue-500" />}
                            {appStatus === 'CHECKED_OUT' && <LogOut className="size-3 text-purple-500" />}
                            {appStatus === 'CANCELLED' && <Ban className="size-3 text-rose-500" />}
                            {(!appStatus || appStatus === 'PENDING' || appStatus === 'AVAILABLE' || appStatus === 'BOOKED') && <Clock className="size-3 text-amber-500" />}
                            <span className="tracking-wide">
                              {appStatus === 'BOOKED' ? 'CONFIRMED' : (appStatus || 'PENDING')}
                            </span>
                          </span>
                        </div>

                        {/* Real-time Responsive Action Controls */}
                        <div className="col-span-3 flex items-center justify-end gap-1.5 flex-nowrap whitespace-nowrap">
                          <button 
                            disabled={appStatus === 'CHECKED_IN' || appStatus === 'CHECKED_OUT'}
                            onClick={() => updateStatus(app.id, 'CHECKED_IN')} 
                            title="Check In Patient"
                            className="flex items-center gap-0.5 px-2 py-1 text-[11px] font-semibold rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white disabled:opacity-40 disabled:hover:bg-blue-50 disabled:hover:text-blue-700 transition-all shadow-sm active:scale-95 cursor-pointer"
                          >
                            <Check className="size-3" />
                            <span>In</span>
                          </button>
                          
                          <button 
                            disabled={appStatus !== 'CHECKED_IN'}
                            onClick={() => updateStatus(app.id, 'CHECKED_OUT')} 
                            title="Check Out Patient"
                            className="flex items-center gap-0.5 px-2 py-1 text-[11px] font-semibold rounded bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white disabled:opacity-40 disabled:hover:bg-purple-50 disabled:hover:text-purple-700 transition-all shadow-sm active:scale-95 cursor-pointer"
                          >
                            <LogOut className="size-3" />
                            <span>Out</span>
                          </button>
                          
                          <button 
                            disabled={appStatus === 'CANCELLED' || appStatus === 'CHECKED_OUT'}
                            onClick={() => updateStatus(app.id, 'CANCELLED')} 
                            title="Cancel Appointment"
                            className="flex items-center gap-0.5 px-2 py-1 text-[11px] font-semibold rounded bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-500 hover:text-white disabled:opacity-40 disabled:hover:bg-amber-50 disabled:hover:text-amber-700 transition-all shadow-sm active:scale-95 cursor-pointer"
                          >
                            <Ban className="size-3" />
                            <span>Cancel</span>
                          </button>
 
                          <button 
                            onClick={() => handleDelete(app.id)} 
                            title="Permanently Delete Appointment"
                            className="flex items-center gap-0.5 px-2 py-1 text-[11px] font-semibold rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4">
          <DepartmentCalendar
            appointments={calendarAppointments.map((a: any) => ({
              id: a.id,
              patientName: a.patient_name || "Patient",
              departmentName: a.department_name || "General Medicine",
              startTime: a.time || "09:00",
              status: a.status === "BOOKED" ? "CONFIRMED" : (a.status || "PENDING"),
            }))}
            departments={["General Medicine", "Cardiology", "Pediatrics", "Endocrinology"]}
            selectedDate={activeScheduleDate}
            onDateChange={setActiveScheduleDate}
            onAppointmentClick={(id) => {
              const appt = appointments.find((a: any) => a.id === id);
              if (appt) {
                setSelectedAppointment(appt);
                setActiveModal('summary');
              }
            }}
          />
        </div>
      )}

      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialTime=""
        initialDepartment=""
        selectedScheduleDate={activeScheduleDate}
        onSuccess={() => {
          refreshAppointments();
          setIsBookingModalOpen(false);
        }}
      />

      {/* Appointment Summary Modal */}
      {activeModal === 'summary' && selectedAppointment && (
        <AppointmentSummaryModal
          isOpen={activeModal === 'summary'}
          onClose={() => {
            setActiveModal(null);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onEdit={() => setActiveModal('edit')}
          onMeasurements={async () => {
            try {
              if (selectedAppointment.patient_id) {
                const res = await secureApi.get("/reception/measurements/");
                const list = res.data || [];
                const patientData = list.filter((m: any) => m.patient === selectedAppointment.patient_id);
                if (patientData.length > 0) {
                  setMeasurementsInitialData(patientData[0]);
                } else {
                  setMeasurementsInitialData(null);
                }
              }
            } catch (err) {
              console.error("Failed to load patient measurements:", err);
            }
            setActiveModal('measurements');
          }}
          onLabReport={() => setActiveModal('labReport')}
          onBilling={() => {
            toast.success("Billing route activated for " + (selectedAppointment.patient_name || "Patient"));
          }}
          onDelete={async () => {
            const id = selectedAppointment.id;
            setActiveModal(null);
            setSelectedAppointment(null);
            await handleDelete(id);
          }}
          onSaveNote={async (noteText) => {
            try {
              await secureApi.patch(`/appointments/${selectedAppointment.id}/`, { notes: noteText });
              toast.success("Notes saved successfully.");
              await refreshAppointments();
            } catch (e: any) {
              console.error("Failed to save note:", e.response?.data || e.message);
              throw e;
            }
          }}
          onProfile={(patientId) => {
            navigate({ to: `/patient-profile/${patientId}` });
          }}

        />
      )}

      {/* Edit Appointment Modal */}
      {activeModal === 'edit' && selectedAppointment && (
        <EditAppointmentModal
          isOpen={activeModal === 'edit'}
          onClose={() => setActiveModal('summary')}
          appointment={selectedAppointment}
          doctorsList={doctorsList}
          onSave={async (updatedData) => {
            const purposeVal = updatedData.purpose_of_visit || updatedData.purpose || updatedData.notes || "";
            const payload = {
              doctor_id: updatedData.doctor_id,
              time: updatedData.time || null,
              end_time: updatedData.end_time || null,
              purpose_of_visit: purposeVal,
            };
            console.log("PATCH Payload:", payload);
            try {
              const response = await secureApi.patch(`/appointments/${selectedAppointment.id}/`, payload);
              if (response.status === 200 || response.status === 201) {
                toast.success("Saved to database successfully");
                setActiveModal(null);
                setSelectedAppointment(null);
                await refreshAppointments();
              }
            } catch (e: any) {
              console.error("Backend Error Response:", e.response?.data || e.message);
              toast.error("Failed to save to database. Check console.");
            }
          }}
        />
      )}

      {/* Measurements Modal */}
      {activeModal === 'measurements' && selectedAppointment && (
        <MeasurementsModal
          isOpen={activeModal === 'measurements'}
          onClose={() => setActiveModal('summary')}
          appointment={selectedAppointment}
          initialData={measurementsInitialData}
          onSave={async (measurementsData) => {
            try {
              if (!selectedAppointment.patient_id) {
                toast.error("No patient associated with this appointment slot");
                return;
              }
              const payload = {
                patient: selectedAppointment.patient_id,
                height: measurementsData.height ? parseFloat(measurementsData.height) : null,
                weight: measurementsData.weight ? parseFloat(measurementsData.weight) : null,
                waist_circumference: measurementsData.waist ? parseFloat(measurementsData.waist) : null,
                hip_circumference: measurementsData.hip ? parseFloat(measurementsData.hip) : null,
                bmi_device: measurementsData.bmi ? parseFloat(measurementsData.bmi) : null,
                fat_mass: measurementsData.fatMass ? parseFloat(measurementsData.fatMass) : null,
                fat_percentage: measurementsData.fatPercent ? parseFloat(measurementsData.fatPercent) : null,
                skeletal_muscle_mass: measurementsData.muscleMass ? parseFloat(measurementsData.muscleMass) : null,
                skeletal_muscle_percentage: measurementsData.musclePercent ? parseFloat(measurementsData.musclePercent) : null,
                lean_mass: measurementsData.leanMass ? parseFloat(measurementsData.leanMass) : null,
                lean_mass_percentage: measurementsData.leanPercent ? parseFloat(measurementsData.leanPercent) : null,
                total_water: measurementsData.totalWater ? parseFloat(measurementsData.totalWater) : null,
                water_percentage: measurementsData.waterPercent ? parseFloat(measurementsData.waterPercent) : null,
                health_score: measurementsData.healthScore ? parseInt(measurementsData.healthScore) : null,
                body_age: measurementsData.bodyAge ? parseInt(measurementsData.bodyAge) : null,
                body_symmetry: measurementsData.bodySymmetry || null,
                t_score: measurementsData.tScore ? parseFloat(measurementsData.tScore) : null,
                z_score: measurementsData.zScore ? parseFloat(measurementsData.zScore) : null,
                
                subcutaneous_fat_mass: measurementsData.subcutaneousFatMass ? parseFloat(measurementsData.subcutaneousFatMass) : null,
                subcutaneous_fat_percentage: measurementsData.subcutaneousFatPercent ? parseFloat(measurementsData.subcutaneousFatPercent) : null,
                visceral_fat_mass: measurementsData.visceralFatMass ? parseFloat(measurementsData.visceralFatMass) : null,
                visceral_fat_level: measurementsData.visceralFatLevel ? parseFloat(measurementsData.visceralFatLevel) : null,
                trunk_fat_mass: measurementsData.trunkFat ? parseFloat(measurementsData.trunkFat) : null,
                left_arm_fat_mass: measurementsData.leftArmFat ? parseFloat(measurementsData.leftArmFat) : null,
                right_arm_fat_mass: measurementsData.rightArmFat ? parseFloat(measurementsData.rightArmFat) : null,
                left_leg_fat_mass: measurementsData.leftLegFat ? parseFloat(measurementsData.leftLegFat) : null,
                right_leg_fat_mass: measurementsData.rightLegFat ? parseFloat(measurementsData.rightLegFat) : null,
                fat_control: measurementsData.fatControl ? parseFloat(measurementsData.fatControl) : null,

                left_arm_muscle_to_fat_ratio: measurementsData.leftArmMuscFatRatio ? parseFloat(measurementsData.leftArmMuscFatRatio) : null,
                right_arm_muscle_to_fat_ratio: measurementsData.rightArmMuscFatRatio ? parseFloat(measurementsData.rightArmMuscFatRatio) : null,
                left_leg_muscle_to_fat_ratio: measurementsData.leftLegMuscFatRatio ? parseFloat(measurementsData.leftLegMuscFatRatio) : null,
                right_leg_muscle_to_fat_ratio: measurementsData.rightLegMuscFatRatio ? parseFloat(measurementsData.rightLegMuscFatRatio) : null,
                trunk_muscle_to_fat_ratio: measurementsData.trunkMuscFatRatio ? parseFloat(measurementsData.trunkMuscFatRatio) : null,

                muscle_control: measurementsData.muscleControl ? parseFloat(measurementsData.muscleControl) : null,
                left_arm_muscle_mass: measurementsData.leftArmMuscle ? parseFloat(measurementsData.leftArmMuscle) : null,
                right_arm_muscle_mass: measurementsData.rightArmMuscle ? parseFloat(measurementsData.rightArmMuscle) : null,
                left_leg_muscle_mass: measurementsData.leftLegMuscle ? parseFloat(measurementsData.leftLegMuscle) : null,
                right_leg_muscle_mass: measurementsData.rightLegMuscle ? parseFloat(measurementsData.rightLegMuscle) : null,
                trunk_muscle_mass: measurementsData.trunkMuscle ? parseFloat(measurementsData.trunkMuscle) : null,
                upper_lower_muscle_balance: measurementsData.upperLowerBalance ? parseFloat(measurementsData.upperLowerBalance) : null,
                trunk_limb_muscle_balance: measurementsData.trunkLimbBalance ? parseFloat(measurementsData.trunkLimbBalance) : null,

                intracellular_water: measurementsData.intracellularWater ? parseFloat(measurementsData.intracellularWater) : null,
                extracellular_water: measurementsData.extracellularWater ? parseFloat(measurementsData.extracellularWater) : null,
                water_balance: measurementsData.waterBalance ? parseFloat(measurementsData.waterBalance) : null,
                protein_mass: measurementsData.proteinMass ? parseFloat(measurementsData.proteinMass) : null,
                protein_percentage: measurementsData.proteinPercent ? parseFloat(measurementsData.proteinPercent) : null,
                bone_mass: measurementsData.boneMass ? parseFloat(measurementsData.boneMass) : null,
                mineral: measurementsData.mineral ? parseFloat(measurementsData.mineral) : null,
                body_cell_mass: measurementsData.bodyCellMass ? parseFloat(measurementsData.bodyCellMass) : null,

                heart_rate: measurementsData.heartRate ? parseFloat(measurementsData.heartRate) : null,
                bmr_kcal: measurementsData.bmr ? parseFloat(measurementsData.bmr) : null,
                recommended_calorie_intake: measurementsData.recommendedCalories ? parseFloat(measurementsData.recommendedCalories) : null,
                ideal_weight: measurementsData.idealWeight ? parseFloat(measurementsData.idealWeight) : null,
                weight_control: measurementsData.weightControl ? parseFloat(measurementsData.weightControl) : null,
                fat_free_mass: measurementsData.fatFreeMass ? parseFloat(measurementsData.fatFreeMass) : null,
                
                resistance_5khz: measurementsData.resistance_5khz ? parseFloat(measurementsData.resistance_5khz) : null,
                resistance_50khz: measurementsData.resistance_50khz ? parseFloat(measurementsData.resistance_50khz) : null,
                resistance_250khz: measurementsData.resistance_250khz ? parseFloat(measurementsData.resistance_250khz) : null,
                reactance_5khz: measurementsData.reactance_5khz ? parseFloat(measurementsData.reactance_5khz) : null,
                reactance_50khz: measurementsData.reactance_50khz ? parseFloat(measurementsData.reactance_50khz) : null,
                reactance_250khz: measurementsData.reactance_250khz ? parseFloat(measurementsData.reactance_250khz) : null,
                phase_angle: measurementsData.phase_angle ? parseFloat(measurementsData.phase_angle) : null,
              };

              
              let response;
              if (measurementsInitialData?.id) {
                response = await secureApi.patch(`/reception/measurements/${measurementsInitialData.id}/`, payload);
              } else {
                response = await secureApi.post("/reception/measurements/", payload);
              }
              
              if (response.status === 200 || response.status === 201) {
                toast.success("Saved to database successfully");
                setActiveModal(null);
                setSelectedAppointment(null);
                await refreshAppointments();
              }
            } catch (e: any) {
              console.error("Database Save Error:", e.response?.data || e.message);
              toast.error("Failed to save to database. Check console.");
            }
          }}
        />
      )}

      {/* Lab Report Modal */}
      {activeModal === 'labReport' && selectedAppointment && (
        <LabReportModal
          isOpen={activeModal === 'labReport'}
          onClose={() => setActiveModal('summary')}
          appointment={selectedAppointment}
          initialData={currentLabReport}
          onViewHistory={() => {
            setHistoryPatientId(selectedAppointment.patient_id);
            setHistoryPatientName(selectedAppointment.patient_name || "Patient");
            setIsHistoryOpen(true);
          }}
          onSave={async (labData) => {
            try {
              if (!selectedAppointment.patient_id) {
                toast.error("No patient associated with this appointment slot");
                return;
              }
              const payload = {
                patient: selectedAppointment.patient_id,
                date_of_report: labData.reportDate,
                hba1c: labData.hba1c ? parseFloat(labData.hba1c) : null,
                fasting_sugar: labData.fastingSugar ? parseFloat(labData.fastingSugar) : null,
                pp2_sugar: labData.pp2Sugar ? parseFloat(labData.pp2Sugar) : null,
                total_cholesterol: labData.cholesterol ? parseFloat(labData.cholesterol) : null,
                ldl: labData.ldl ? parseFloat(labData.ldl) : null,
                hdl: labData.hdl ? parseFloat(labData.hdl) : null,
                triglycerides: labData.triglycerides ? parseFloat(labData.triglycerides) : null,
                sgot_ast: labData.sgot ? parseFloat(labData.sgot) : null,
                sgpt_alt: labData.sgpt ? parseFloat(labData.sgpt) : null,
                gall_stones: labData.gallStones || "Not tested",
                fatty_liver: labData.fattyLiver || "Not tested",
                tsh: labData.tsh ? parseFloat(labData.tsh) : null,
                t3: labData.t3 ? parseFloat(labData.t3) : null,
                t4: labData.t4 ? parseFloat(labData.t4) : null,
              };

              let response;
              if (currentLabReport?.id) {
                response = await secureApi.patch(`/reception/structured-lab-reports/${currentLabReport.id}/`, payload);
              } else {
                response = await secureApi.post("/reception/structured-lab-reports/", payload);
              }
              
              if (response.status === 200 || response.status === 201) {
                toast.success("Saved to database successfully");
                setActiveModal(null);
                setSelectedAppointment(null);
                await refreshAppointments();
              }
            } catch (e: any) {
              if (e.response) {
                console.error("Django Validation Error:", e.response.data);
                toast.error(`Error: ${JSON.stringify(e.response.data)}`);
              } else {
                console.error("Network Error:", e.message);
                toast.error("Network error. Check console/logs.");
              }
            }
          }}
        />
      )}

      <PatientHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        patientId={historyPatientId}
        patientName={historyPatientName}
      />


    </ModulePage>
  );
}