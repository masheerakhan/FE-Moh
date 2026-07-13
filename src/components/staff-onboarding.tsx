import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, UserPlus, Users, ToggleLeft, ToggleRight, Building } from "lucide-react";
import { axiosInstance } from "@/lib/api";
import { organizationApi, clinicApi, departmentApi } from "@/lib/api";
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
  const [organizationsList, setOrganizationsList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);

  // Form Fields
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(activeUser.organization_id || "");
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
      const [staffRes, orgRes, clinicRes, deptRes, roleRes] = await Promise.all([
        axiosInstance.get("/employees/"),
        organizationApi.getAll(),
        clinicApi.getClinics(),
        departmentApi.getDepartments(),
        axiosInstance.get("/rbac/roles/"),
      ]);

      const organizationRows = orgRes || [];
      const clinicRows = clinicRes || [];
      const departmentRows = deptRes || [];
      const roleRows = Array.isArray(roleRes?.data) ? roleRes.data : roleRes?.data?.results || [];
      const filteredClinics = clinicRows.filter((c: any) => {
        const orgValue = c.organization_id || c.organization || "";
        return !selectedOrganizationId || !orgValue || String(orgValue) === String(selectedOrganizationId);
      });

      setOrganizationsList(organizationRows);
      setStaffList(staffRes.data || []);
      setClinicsList(filteredClinics);
      setAllDepartments(departmentRows);
      setRolesList(roleRows);

      let userClinic = activeUser.clinic_id;
      if (userClinic && filteredClinics.length > 0) {
        const matchedClinic = filteredClinics.find(
          (c: any) => String(c.id) === String(userClinic) || String(c.code) === String(userClinic)
        );
        if (matchedClinic) {
          userClinic = matchedClinic.id;
        }
      } else if (filteredClinics.length > 0) {
        userClinic = filteredClinics[0].id;
      }
      setSelectedClinicId(userClinic || "");
    } catch (err: any) {
      setClinicsList([]);
      setAllDepartments([]);
      setStaffList([]);
      setSelectedClinicId("");
      toast.error("Unable to load clinic staff from the database", {
        description: err.response?.data?.detail || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedOrganizationId(activeUser.organization_id || "");
  }, [activeUser]);

  useEffect(() => {
    if (!organizationsList.length) return;

    const matchingOrg = organizationsList.find((org: any) => {
      const candidateIds = [org.id, org.uuid, org.organization_id].filter(Boolean);
      return candidateIds.some((value: string) => String(value) === String(selectedOrganizationId || activeUser.organization_id || ""));
    });

    const nextOrgId = matchingOrg
      ? matchingOrg.id || matchingOrg.uuid || matchingOrg.organization_id
      : organizationsList[0]?.id || organizationsList[0]?.uuid || organizationsList[0]?.organization_id || "";

    setSelectedOrganizationId((prev: string) => (prev && organizationsList.some((org: any) => {
      const candidateIds = [org.id, org.uuid, org.organization_id].filter(Boolean);
      return candidateIds.some((value: string) => String(value) === String(prev));
    })) ? prev : nextOrgId);
  }, [organizationsList, activeUser.organization_id, selectedOrganizationId]);

  useEffect(() => {
    loadInitialData();
  }, [activeUser, selectedOrganizationId]);

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
    return null;
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
      const effectiveOrganizationId = selectedOrganizationId || activeUser.organization_id || organizationsList[0]?.id || organizationsList[0]?.uuid || organizationsList[0]?.organization_id || null;
      const normalizedRole = String(role || "").trim().toLowerCase();
      const resolvedRole = rolesList.find((candidate: any) => {
        const roleName = String(candidate?.name || "").trim().toLowerCase();
        return roleName === normalizedRole || roleName.includes(normalizedRole);
      });
      const resolvedRoleId = resolvedRole?.id || null;

      // Action 2: Create Employee record linked to user, organization and selected clinic
      await axiosInstance.post("/employees/", {
        user: userId,
        organization: effectiveOrganizationId,
        organization_id: effectiveOrganizationId,
        clinic: selectedClinicId,
        clinic_id: selectedClinicId,
        department: departmentId || null,
        designation: role,
        joining_date: new Date().toISOString().slice(0, 10),
        employee_code: employeeCode,
        gender: "MALE",
        is_doctor: role === "Doctor",
        is_active_employee: true
      });

      // Action 3: Assign Role
      if (!resolvedRoleId) {
        throw new Error(`No matching backend role was found for "${role}".`);
      }
      await axiosInstance.post("/rbac/user-roles/", {
        user: userId,
        role: resolvedRoleId
      });

      toast.success(`Staff Profile "${fullName}" onboarded successfully.`);
      
      setFullName("");
      setEmail("");
      setEmployeeCode("");
      loadInitialData();
    } catch (err: any) {
      toast.error("Staff creation failed", {
        description: err.response?.data?.detail || err.response?.data?.message || err.message,
      });
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
    } catch (err: any) {
      toast.error("Staff status update failed", {
        description: err.response?.data?.detail || err.message,
      });
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

            <div className="space-y-1">
              <Label className="text-xs">Organization</Label>
              <select
                value={selectedOrganizationId}
                onChange={(e) => setSelectedOrganizationId(e.target.value)}
                className="w-full h-9 border rounded-md px-2 text-xs bg-card font-medium"
              >
                {organizationsList.map((org: any) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
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
              <div className="grid grid-cols-7 px-6 py-2.5 font-semibold text-muted-foreground bg-muted/20">
                <div>Code</div>
                <div className="col-span-2">Name / Email</div>
                <div>Organization</div>
                <div>Clinic Branch</div>
                <div>Role / Dept</div>
                <div className="text-right">Status</div>
              </div>
              {staffList.map((emp) => (
                <div key={emp.id} className="grid grid-cols-7 px-6 py-3 items-center">
                  <div className="font-mono text-primary font-bold">{emp.employee_code}</div>
                  <div className="col-span-2">
                    <div className="font-semibold text-sm">{emp.user_name || emp.user?.first_name || "Staff Member"}</div>
                    <div className="text-xs text-muted-foreground">{emp.user_email || emp.user?.email || "no email"}</div>
                  </div>
                  <div className="font-medium text-slate-300">{emp.organization_name || emp.organization?.name || "—"}</div>
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
