import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, UserPlus, Users, ToggleLeft, ToggleRight, Building } from "lucide-react";
import { axiosInstance } from "@/lib/api";
import { currentUser as defaultUser } from "@/lib/tenant-context";

export function StaffOnboarding({ forceClinicSelect = false }: { forceClinicSelect?: boolean }) {
  const [activeUser, setActiveUser] = useState(() => {
    const saved = localStorage.getItem("active_user");
    return saved ? JSON.parse(saved) : defaultUser;
  });

  // Track state synced with storage events
  useEffect(() => {
    const handleUserChange = () => {
      const saved = localStorage.getItem("active_user");
      if (saved) setActiveUser(JSON.parse(saved));
    };
    window.addEventListener("storage_user_change", handleUserChange);
    return () => window.removeEventListener("storage_user_change", handleUserChange);
  }, []);

  const hasPermission = (permCode: string): boolean => {
    if (activeUser.role === "Super Admin" || activeUser.role === "SUPERADMIN") return true;
    const userPerms = activeUser.permissions || [];
    return userPerms.includes(permCode);
  };

  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [allDepartments, setAllDepartments] = useState<any[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);
  const [clinicsList, setClinicsList] = useState<any[]>([]);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("defaultPassword123!");
  const [role, setRole] = useState("Doctor");
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [staffRes, clinicRes, deptRes] = await Promise.all([
        axiosInstance.get("/employees/").catch(() => ({ data: [] })),
        axiosInstance.get("/clinics/").catch(() => ({ data: [] })),
        axiosInstance.get("/departments/").catch(() => ({ data: [] }))
      ]);

      setStaffList(staffRes.data || []);
      setClinicsList(clinicRes.data || []);
      setAllDepartments(deptRes.data || []);

      // Default Clinic ID resolution with normalization mapping
      let userClinic = activeUser.clinic_id;
      if (userClinic && clinicRes.data && clinicRes.data.length > 0) {
        const matchedClinic = clinicRes.data.find(
          (c: any) => String(c.id) === String(userClinic) || String(c.code) === String(userClinic)
        );
        if (matchedClinic) {
          userClinic = matchedClinic.id;
        }
      } else if (clinicRes.data && clinicRes.data.length > 0) {
        userClinic = clinicRes.data[0].id;
      }
      setSelectedClinicId(userClinic || "");
    } catch (err) {
      console.warn("Failed to load setup data from backend, generating mock sandbox records");
      setClinicsList([{ id: "clinic_bandra", name: "Apollo Bandra Clinic", code: "clinic_bandra" }]);
      setAllDepartments([
        { id: "dept_gen", name: "General Medicine", clinic_id: "clinic_bandra" },
        { id: "dept_cardio", name: "Cardiology", clinic_id: "clinic_bandra" },
        { id: "dept_peds", name: "Pediatrics", clinic_id: "clinic_bandra" },
        { id: "dept_endo", name: "Endocrinology", clinic_id: "clinic_bandra" },
        { id: "dept_front", name: "Front Office", clinic_id: "clinic_bandra" }
      ]);
      setStaffList([
        { id: "e1", employee_code: "EMP_DOC_amit", user_name: "Dr. Amit Sharma", user_email: "amit.sharma@helix.health", designation: "Doctor", is_doctor: true, is_active_employee: true, department_name: "General Medicine", clinic_name: "Apollo Bandra Clinic" },
        { id: "e2", employee_code: "EMP_REC_anita", user_name: "Nurse Anita Sen", user_email: "anita.sen@helix.health", designation: "Receptionist", is_doctor: false, is_active_employee: true, department_name: "Front Office", clinic_name: "Apollo Bandra Clinic" }
      ]);
      setSelectedClinicId("clinic_bandra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [activeUser]);

  // Filter departments whenever the target clinic changes
  useEffect(() => {
    if (!selectedClinicId) {
      setFilteredDepartments([]);
      setDepartmentId("");
      return;
    }
    const matched = allDepartments.filter(
      (d) => String(d.clinic_id || d.clinic) === String(selectedClinicId)
    );
    setFilteredDepartments(matched);
    if (matched.length > 0) {
      setDepartmentId(matched[0].id);
    } else {
      setDepartmentId("");
    }
  }, [selectedClinicId, allDepartments]);

  if (!hasPermission("can_manage_staff_onboarding")) {
    return (
      <Card className="border-warning/30 bg-warning/5 max-w-4xl mx-auto my-6">
        <CardContent className="p-8 text-center space-y-4">
          <ShieldAlert className="size-12 text-warning mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-foreground">Access Restricted</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            You must possess 'can_manage_staff_onboarding' privileges to access the staff credentials panel. Please contact your Organization Admin.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !employeeCode || !selectedClinicId) {
      toast.error("Please fill in name, email, employee code, and clinic.");
      return;
    }

    if (!hasPermission("can_create_staff_profile")) {
      toast.error("Security Restriction: You do not possess 'can_create_staff_profile' permissions.");
      return;
    }

    setLoading(true);
    try {
      const parts = fullName.trim().split(" ");
      const first = parts[0];
      const last = parts.slice(1).join(" ") || "";

      // Action 1: Create user credentials
      const userRes = await axiosInstance.post("/accounts/users/", {
        username: email,
        email: email,
        password: password,
        first_name: first,
        last_name: last,
        is_active: true
      });

      const userId = userRes.data.id;

      // Action 2: Create Employee record linked to user & selected clinic
      await axiosInstance.post("/employees/", {
        user: userId,
        clinic: selectedClinicId,
        department: departmentId || null,
        designation: role,
        joining_date: new Date().toISOString().slice(0, 10),
        employee_code: employeeCode,
        gender: "MALE",
        is_doctor: role === "Doctor",
        is_active_employee: true
      });

      // Action 3: Assign Role
      await axiosInstance.post("/rbac/user-roles/", {
        user: userId,
        role_code: role === "Doctor" ? "role_doctor" : "role_receptionist"
      });

      toast.success(`Staff Profile "${fullName}" onboarded successfully.`);
      
      setFullName("");
      setEmail("");
      setEmployeeCode("");
      loadInitialData();
    } catch (err: any) {
      console.warn("Backend staff creation failed, fallback simulation active", err);

      const maxDocs = 10;
      const maxReceps = 10;

      if (role === "Doctor" && staffList.filter(s => s.is_doctor && s.is_active_employee).length >= maxDocs) {
        toast.error("Clinic Boundary Exceeded", {
          description: `Failed to onboard. Maximum permissible active Doctor profiles is limited to ${maxDocs} for this clinic context.`
        });
        setLoading(false);
        return;
      }

      if (role === "Receptionist" && staffList.filter(s => s.designation === "Receptionist" && s.is_active_employee).length >= maxReceps) {
        toast.error("Clinic Boundary Exceeded", {
          description: `Failed to onboard. Maximum permissible active Receptionist profiles is limited to ${maxReceps} for this clinic context.`
        });
        setLoading(false);
        return;
      }

      const mockEmployee = {
        id: `emp_mock_${Date.now()}`,
        employee_code: employeeCode,
        user_name: fullName,
        user_email: email,
        designation: role,
        is_doctor: role === "Doctor",
        is_active_employee: true,
        department_name: filteredDepartments.find(d => String(d.id) === String(departmentId))?.name || "Front Office",
        clinic_name: clinicsList.find(c => String(c.id) === String(selectedClinicId))?.name || "Bandra Clinic"
      };

      setStaffList((prev) => [...prev, mockEmployee]);
      toast.success(`Simulated staff onboarding success (Mock Sandbox fallback).`);
      setFullName("");
      setEmail("");
      setEmployeeCode("");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (emp: any) => {
    if (!hasPermission("can_modify_staff_status")) {
      toast.error("Security Restriction: You do not possess 'can_modify_staff_status' permissions.");
      return;
    }
    const nextStatus = !emp.is_active_employee;
    try {
      await axiosInstance.patch(`/employees/${emp.id}/`, {
        is_active_employee: nextStatus
      });
      toast.success(`Updated ${emp.user_name || emp.employee_code} status.`);
      loadInitialData();
    } catch (err) {
      setStaffList((prev) =>
        prev.map((s) => (s.id === emp.id ? { ...s, is_active_employee: nextStatus } : s))
      );
      toast.success(`Updated ${emp.user_name || emp.employee_code} status to ${nextStatus ? "Active" : "Inactive"} (Mock Sandbox fallback).`);
    }
  };

  // Determine if active user is Org-level or Super Admin and needs a clinic dropdown
  const showClinicSelect =
    forceClinicSelect ||
    activeUser.role?.toUpperCase() === "SUPER ADMIN" ||
    activeUser.role?.toUpperCase() === "SUPERADMIN" ||
    activeUser.role?.toUpperCase() === "ORGANIZATION ADMIN" ||
    !activeUser.clinic_id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto my-6">
      
      {/* Onboard form panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="size-4 text-primary" /> Onboard Team Staff
          </CardTitle>
          <CardDescription className="text-xs">
            Link credentials to departments and assign roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleOnboard} className="space-y-3.5">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Pooja Joshi"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. pooja.joshi@helix.health"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Employee Code</Label>
              <Input
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="e.g. EMP_DOC_POOJA"
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* Clinic Dropdown - displayed if logged in user manages multiple clinics */}
            {showClinicSelect && (
              <div className="space-y-1">
                <Label className="text-xs">Target Clinic Branch</Label>
                <select
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                  className="w-full h-9 border rounded-md px-2 text-xs bg-card font-medium"
                >
                  <option value="">-- Select Target Clinic --</option>
                  {clinicsList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Designation / Role</Label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-9 border rounded-md px-2 text-xs bg-card font-medium"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Assistant">Clinical Assistant</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full h-9 border rounded-md px-2 text-xs bg-card font-medium"
                  disabled={!selectedClinicId}
                >
                  {filteredDepartments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                  {filteredDepartments.length === 0 && (
                    <option value="">{selectedClinicId ? "No departments found" : "-- Choose Clinic First --"}</option>
                  )}
                </select>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-9 text-xs font-semibold mt-3">
              {loading ? "Registering..." : "Onboard Staff"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Roster list panel */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between pb-3 border-b">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4 text-primary" /> Active Clinic Roster
            </CardTitle>
            <CardDescription className="text-xs">
              Staff directory showing verification status and RBAC bindings.
            </CardDescription>
          </div>
          <Badge variant="outline">{staffList.length} total staff</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {hasPermission("can_view_staff_directory") ? (
            <div className="divide-y text-xs">
              <div className="grid grid-cols-6 px-6 py-2.5 font-semibold text-muted-foreground bg-muted/20">
                <div>Code</div>
                <div className="col-span-2">Name / Email</div>
                <div>Clinic Branch</div>
                <div>Role / Dept</div>
                <div className="text-right">Status</div>
              </div>
              {staffList.map((emp) => (
                <div key={emp.id} className="grid grid-cols-6 px-6 py-3 items-center">
                  <div className="font-mono text-primary font-bold">{emp.employee_code}</div>
                  <div className="col-span-2">
                    <div className="font-semibold text-sm">{emp.user_name || emp.user?.first_name || "Staff Member"}</div>
                    <div className="text-xs text-muted-foreground">{emp.user_email || emp.user?.email || "no email"}</div>
                  </div>
                  <div className="font-medium text-slate-300">{emp.clinic_name || emp.clinic?.name || "Global Org"}</div>
                  <div>
                    <div>{emp.designation}</div>
                    <div className="text-xs text-muted-foreground">{emp.department_name || emp.department?.name || "General Clinic"}</div>
                  </div>
                  <div className="text-right flex items-center justify-end gap-1.5">
                    <Badge variant={emp.is_active_employee ? "default" : "outline"} className={`text-[9px] h-5 ${emp.is_active_employee ? "bg-success/15 text-success border-success/30 hover:bg-success/20" : ""}`}>
                      {emp.is_active_employee ? "Active" : "Inactive"}
                    </Badge>
                    <button
                      onClick={() => toggleStatus(emp)}
                      className="text-muted-foreground hover:text-foreground transition-all ml-1.5"
                    >
                      {emp.is_active_employee ? <ToggleRight className="size-5 text-green-500" /> : <ToggleLeft className="size-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground">
              You do not possess 'can_view_staff_directory' permissions to audit the roster list.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
