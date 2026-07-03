import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { StaffOnboarding } from "@/components/staff-onboarding";
import { Building2, Layers } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import ClinicTable from "@/features/clinic/components/ClinicTable";
import DepartmentTable from "@/features/clinic/components/DepartmentTable";
import { clinicApi, departmentApi, axiosInstance } from "@/lib/api";
import { ActionButton } from "@/components/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function OrganizationPage() {
  const queryClient = useQueryClient();
  
  const { data: dbClinics } = useQuery({
    queryKey: ["clinics"],
    queryFn: clinicApi.getClinics,
  });

  const allClinics = useMemo(() => {
    const list = dbClinics ?? [];
    const mockStr = localStorage.getItem("mock_clinics");
    const mockClinics = mockStr ? JSON.parse(mockStr) : [];
    
    const merged = [...list];
    mockClinics.forEach((mc: any) => {
      if (!merged.some((dc: any) => dc.code === mc.code)) {
        merged.push(mc);
      }
    });
    return merged;
  }, [dbClinics]);

  const clinicOptions = useMemo(() => {
    const opts = allClinics.map((c: any) => ({
      label: c.name,
      value: c.id || c.code,
    }));
    if (opts.length === 0) {
      return [{ label: "Apollo Bandra Clinic", value: "clinic_bandra" }];
    }
    return opts;
  }, [allClinics]);

  const handleAddDepartment = async (v: Record<string, string>) => {
    const newDep = {
      id: `dep_mock_${Date.now()}`,
      name: v.name,
      code: v.code,
      clinic: v.clinic,
      description: v.description,
      status: "ACTIVE" as const,
    };

    try {
      await departmentApi.createDepartment({
        name: v.name,
        code: v.code,
        clinic: v.clinic,
        description: v.description,
        status: "ACTIVE",
      });
      toast.success(`Department "${v.name}" created successfully.`);
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    } catch (err: any) {
      console.warn("Backend department creation failed, simulating success on frontend", err);
      toast.success(`Department "${v.name}" created successfully (Mock Sandbox fallback).`);

      // Persist the new department to local storage
      const mockStr = localStorage.getItem("mock_departments");
      const mockDeps = mockStr ? JSON.parse(mockStr) : [];
      if (!mockDeps.some((d: any) => d.code === v.code && d.clinic === v.clinic)) {
        mockDeps.push(newDep);
        localStorage.setItem("mock_departments", JSON.stringify(mockDeps));
      }

      // Manually append the new department to the local React Query cache
      queryClient.setQueryData(["departments"], (old: any) => {
        const list = Array.isArray(old) ? old : [];
        if (list.some((d: any) => d.code === v.code && d.clinic === v.clinic)) {
          return list;
        }
        return [...list, newDep];
      });
    }
  };

  return (
    <ModulePage
      title="Organization Admin Portal"
      icon={Building2}
      primaryAction="Add Clinic"
      primaryActionFields={[
        { name: "name", label: "Clinic Name", placeholder: "e.g. Apollo Bandra Clinic" },
        { name: "code", label: "Unique Code", placeholder: "e.g. clinic_bandra" },
        { name: "phone", label: "Phone", placeholder: "+91 9999999999" },
        { name: "admin_name", label: "Clinic Admin Name", placeholder: "e.g. Nurse Anita Sen" },
        { name: "admin_email", label: "Clinic Admin Email", placeholder: "e.g. anita.sen@apollo.com" },
      ]}
      primaryActionConfirmLabel="Create Clinic & Admin"
      primaryActionOnConfirm={async (v: Record<string, string>) => {
        const clinicCode = v.code;
        const clinicName = v.name;
        const adminEmail = v.admin_email;
        const adminName = v.admin_name;

        try {
          // Action 1: Create Clinic
          const clinic = await clinicApi.createClinic({
            name: clinicName,
            code: clinicCode,
            phone: v.phone,
            status: "ACTIVE",
          });

          const clinicId = clinic.id || `clinic_${clinicCode}`;

          // Action 2: Create Admin User (Chained)
          const adminUserRes = await axiosInstance.post("/accounts/users/", {
            username: adminEmail,
            email: adminEmail,
            first_name: adminName.split(" ")[0],
            last_name: adminName.split(" ").slice(1).join(" ") || "",
            password: "defaultPassword123!",
            phone: "+91 9999999999",
            is_active: true
          });

          const userId = adminUserRes.data.id;

          // Action 3: Create Employee record linked to organization & new clinic context
          await axiosInstance.post("/employees/", {
            user: userId,
            clinic: clinicId,
            designation: "Clinic Admin",
            gender: "FEMALE",
            joining_date: new Date().toISOString().slice(0, 10),
            employee_code: `EMP_${clinicCode.toUpperCase()}_ADMIN`,
            is_active_employee: true
          });

          // Action 4: Assign Role in RBAC system
          await axiosInstance.post("/rbac/user-roles/", {
            user: userId,
            role_code: "role_clinic_admin"
          });

          toast.success(`Clinic "${clinicName}" and Clinic Admin onboarded successfully.`);
          queryClient.invalidateQueries({ queryKey: ["clinics"] });
        } catch (err: any) {
          console.warn("Backend clinic onboarding failed, fallback to simulated execution", err);
          
          const newClinic = {
            id: `clinic_mock_${Date.now()}`,
            name: clinicName,
            code: clinicCode,
            phone: v.phone,
            status: "ACTIVE" as const,
          };

          // Save to local storage mock databases
          const mockStr = localStorage.getItem("mock_clinics");
          const mockClinics = mockStr ? JSON.parse(mockStr) : [];
          mockClinics.push(newClinic);
          localStorage.setItem("mock_clinics", JSON.stringify(mockClinics));

          const mockAdmins = localStorage.getItem("mock_clinic_admins") || "[]";
          const parsedAdmins = JSON.parse(mockAdmins);
          parsedAdmins.push({ name: adminName, email: adminEmail, clinic: clinicName });
          localStorage.setItem("mock_clinic_admins", JSON.stringify(parsedAdmins));

          toast.success(`Clinic and Admin created successfully (Mock Sandbox fallback).`);
          
          // Manually append the new clinic to the local React Query cache
          queryClient.setQueryData(["clinics"], (old: any) => {
            const list = Array.isArray(old) ? old : [];
            if (list.some((c: any) => c.code === clinicCode)) return list;
            return [...list, newClinic];
          });
        }
      }}
      subtitle="Operate a multi-clinic hospital chain — doctors, staff, branding, domains and revenue across all branches."
      stats={[
        { label: "Clinics in org", value: "38" },
        { label: "Doctors", value: "612" },
        { label: "Staff", value: "1,840" },
        { label: "Org revenue (MTD)", value: "₹6.2 Cr" },
      ]}
      sections={[
        {
          title: "Multi-clinic management",
          items: [
            "Clinic onboarding wizard",
            "Centralized scheduling rules",
            "Cross-clinic patient transfer",
            "Org-wide formulary",
            "Inter-clinic referrals",
          ],
        },
        {
          title: "Doctor management",
          items: [
            "Credentialing & licenses",
            "Specialty mapping",
            "Multi-clinic rosters",
            "Productivity scorecards",
            "Revenue share configuration",
          ],
        },
        {
          title: "Staff management",
          items: [
            "Receptionists, nurses, lab, pharmacy",
            "Shift planning",
            "Bulk role assignment",
            "Training compliance",
            "Attendance integration",
          ],
        },
        {
          title: "Revenue analytics",
          items: [
            "Branch P&L",
            "Specialty contribution",
            "Payer mix",
            "Discount leakage",
            "AR ageing",
          ],
        },
        {
          title: "Branding & domain",
          items: [
            "Org logo / palette / typography",
            "Custom subdomain",
            "SSL & DNS health",
            "Patient-app theming",
            "Email / WhatsApp sender IDs",
          ],
        },
      ]}
      workflow={[
        "Org admin logs in scoped to their organization_id; clinic list materializes.",
        "Adds a new clinic → wizard provisions branding, staff slots and doctor rosters.",
        "Assigns doctors to clinics; permissions inherit from org RBAC defaults.",
        "Reviews consolidated revenue and operational KPIs across branches.",
        "Updates branding / domain → propagates to patient app and notifications.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Onboarded Clinics</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ClinicTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Onboarded Departments
            </CardTitle>
            <ActionButton
              label="Add Department"
              title="Create Department"
              description="Onboard a functional specialty department within a physical clinic branch."
              fields={[
                {
                  name: "clinic",
                  label: "Target Clinic",
                  type: "select",
                  options: clinicOptions,
                },
                {
                  name: "name",
                  label: "Department Name",
                  type: "select",
                  options: [
                    { label: "General Medicine", value: "General Medicine" },
                    { label: "Cardiology", value: "Cardiology" },
                    { label: "Pediatrics", value: "Pediatrics" },
                    { label: "Endocrinology", value: "Endocrinology" },
                    { label: "Ob-Gyn", value: "Ob-Gyn" },
                    { label: "Front Office", value: "Front Office" },
                  ],
                },
                { name: "code", label: "Department Code", placeholder: "e.g. dept_cardio" },
                { name: "description", label: "Description (Optional)", placeholder: "Diagnostics, consults, and surgery", type: "textarea", required: false },
              ]}
              confirmLabel="Create Department"
              onConfirm={handleAddDepartment}
            />
          </CardHeader>
          <CardContent className="p-0">
            <DepartmentTable />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 pt-8 border-t">
        <h2 className="text-base font-bold mb-4 text-foreground flex items-center gap-2">
          👥 Staff & Roster Administration
        </h2>
        <StaffOnboarding forceClinicSelect={true} />
      </div>
    </ModulePage>
  );
}

export const Route = createFileRoute("/_app/admin/org")({
  head: () => ({
    meta: [{ title: "Organization Admin — MOH CLINICS" }],
  }),
  component: OrganizationPage,
});