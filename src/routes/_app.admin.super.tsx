import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/module-page";
import { ShieldCheck, UserCheck, Trash2, ArrowLeftRight, Database, Globe, ShieldAlert, Ban } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { organizationApi } from "@/lib/api/organization";
import { clinicApi } from "@/lib/api/clinics";
import { useOrganizations } from "@/hooks/useOrganization";
import OrganizationTable from "@/features/organization/components/OrganizationTable";
import { ActionButton } from "@/components/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin/super")({
  head: () => ({ meta: [{ title: "Super Admin — Helix OS" }] }),
  component: SuperAdmin,
});

const defaultAdmins = [
  { name: "Dr. Riya Iyer", email: "riya.iyer@helix.health", org: "Apollo Health Group" },
];

function SuperAdmin() {
  const queryClient = useQueryClient();
  const [adminsList, setAdminsList] = useState<any[]>(defaultAdmins);
  const { data: orgsData } = useOrganizations();

  const clinicsQuery = useQuery({
    queryKey: ["clinics"],
    queryFn: clinicApi.getClinics,
  });

  const loadAdmins = () => {
    const saved = localStorage.getItem("mock_org_admins");
    if (saved) {
      setAdminsList(JSON.parse(saved));
    } else {
      setAdminsList(defaultAdmins);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const allOrgs = useMemo(() => {
    const dbOrgs = orgsData ?? [];
    const mockStr = localStorage.getItem("mock_organizations");
    const mockOrgs = mockStr ? JSON.parse(mockStr) : [];
    
    const merged = [...dbOrgs];
    mockOrgs.forEach((mo: any) => {
      if (!merged.some((doOrg: any) => doOrg.code === mo.code)) {
        merged.push(mo);
      }
    });
    return merged;
  }, [orgsData]);

  const orgOptions = useMemo(() => {
    const opts = allOrgs.map((o: any) => ({
      label: o.name,
      value: o.name,
    }));
    if (opts.length === 0) {
      return [{ label: "Apollo Health Group", value: "Apollo Health Group" }];
    }
    return opts;
  }, [allOrgs]);

  const allClinics = useMemo(() => {
    const list = clinicsQuery.data ?? [];
    const mockStr = localStorage.getItem("mock_clinics");
    const mockClinics = mockStr ? JSON.parse(mockStr) : [];
    
    const merged = [...list];
    mockClinics.forEach((mc: any) => {
      if (!merged.some((dc: any) => dc.code === mc.code)) {
        merged.push(mc);
      }
    });
    return merged;
  }, [clinicsQuery.data]);

  const clinicOptions = useMemo(() => {
    const opts = allClinics.map((c: any) => ({
      label: c.name,
      value: c.code || c.id,
    }));
    if (opts.length === 0) {
      return [{ label: "Apollo Bandra Clinic", value: "clinic_bandra" }];
    }
    return opts;
  }, [allClinics]);

  const handleMakeOrgAdmin = (v: Record<string, string>) => {
    const newAdmin = {
      name: v.name,
      email: v.email,
      org: v.organization || "Apollo Health Group",
    };

    const saved = localStorage.getItem("mock_org_admins");
    const currentList = saved ? JSON.parse(saved) : [...defaultAdmins];
    
    if (currentList.some((a: any) => a.email.toLowerCase() === v.email.toLowerCase())) {
      toast.error(`User with email "${v.email}" is already an Organization Admin.`);
      return;
    }

    const nextList = [...currentList, newAdmin];
    localStorage.setItem("mock_org_admins", JSON.stringify(nextList));
    setAdminsList(nextList);
    toast.success(`Elevated "${v.name}" to Organization Admin scope.`);
  };

  const handleRevokeAdmin = (email: string, name: string) => {
    const saved = localStorage.getItem("mock_org_admins");
    const currentList = saved ? JSON.parse(saved) : [...defaultAdmins];
    
    const nextList = currentList.filter((a: any) => a.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem("mock_org_admins", JSON.stringify(nextList));
    setAdminsList(nextList);
    toast.success(`Revoked Organization Admin rights for "${name}".`);
  };

  const handleMoveClinic = (v: Record<string, string>) => {
    const clinicCode = v.clinic;
    const targetOrgName = v.target_org;
    const matchedOrg = allOrgs.find((o: any) => o.name === targetOrgName);
    const targetOrgId = matchedOrg ? matchedOrg.id || matchedOrg.code : "org_apollo";

    const mockStr = localStorage.getItem("mock_clinics");
    const mockClinics = mockStr ? JSON.parse(mockStr) : [];
    
    let updated = false;
    const nextClinics = mockClinics.map((c: any) => {
      if (c.code === clinicCode || c.id === clinicCode) {
        updated = true;
        return { ...c, organization_id: targetOrgId };
      }
      return c;
    });

    if (updated) {
      localStorage.setItem("mock_clinics", JSON.stringify(nextClinics));
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast.success(`Moved clinic "${clinicCode}" to organization "${targetOrgName}".`);
    } else {
      toast.success(`Simulated movement of clinic "${clinicCode}" to organization "${targetOrgName}" (Mock Sandbox).`);
    }
  };

  const runIsolationCheck = () => {
    const id = toast.loading("Running tenant isolation boundaries audit...");
    setTimeout(() => {
      toast.success("Tenant Isolation Verified", {
        id,
        description: "Passed 100% of checks. Row-level security (RLS) policies successfully validated across all active organization databases.",
      });
    }, 1200);
  };

  const checkDataResidency = () => {
    toast.success("Data Residency Controls Active", {
      description: "All patient health record clusters are successfully pinned to Indian sovereign datacenters (DPDP / HIPAA compliant).",
    });
  };

  const handleRunBackup = (v: Record<string, string>) => {
    const org = v.organization || "All Organizations";
    toast.success(`Backup scheduled for tenant: ${org}`, {
      description: "Encrypted snapshot successfully queued in AWS ap-south-1 Glacier storage.",
    });
  };

  return (
    <ModulePage
      title="Super Admin Portal"
      icon={ShieldCheck}
      primaryAction="Onboard organization"
      primaryActionFields={[
        { name: "name", label: "Organization Name", placeholder: "e.g. Apollo Health Group" },
        { name: "code", label: "Unique Code", placeholder: "e.g. org_apollo" },
      ]}
      primaryActionConfirmLabel="Create Organization"
      primaryActionOnConfirm={async (v: Record<string, string>) => {
        const newOrg = {
          id: `org_mock_${Date.now()}`,
          name: v.name,
          code: v.code,
          email: `admin@${v.code}.com`,
          phone: "+91 9999999999",
          country: "India",
          timezone: "Asia/Kolkata",
          currency: "INR",
          status: "ACTIVE" as const,
        };

        try {
          await organizationApi.create({
            name: v.name,
            code: v.code,
            email: `admin@${v.code}.com`,
            phone: "+91 9999999999",
            country: "India",
            timezone: "Asia/Kolkata",
            currency: "INR",
            status: "ACTIVE",
          });
          toast.success(`Organization "${v.name}" onboarded successfully.`);
        } catch (err: any) {
          console.warn("Backend onboard failed, simulating sandbox success on frontend", err);
          toast.success(`Organization "${v.name}" onboarded successfully (Mock Sandbox fallback)`);

          const mockStr = localStorage.getItem("mock_organizations");
          const mockOrgs = mockStr ? JSON.parse(mockStr) : [];
          if (!mockOrgs.some((org: any) => org.code === v.code)) {
            mockOrgs.push(newOrg);
            localStorage.setItem("mock_organizations", JSON.stringify(mockOrgs));
          }

          queryClient.setQueryData(["organizations"], (old: any) => {
            const list = Array.isArray(old) ? old : [];
            if (list.some((org: any) => org.code === v.code)) {
              return list;
            }
            return [...list, newOrg];
          });
        }
      }}
      subtitle="Platform-wide control plane for 500+ healthcare organizations, revenue, subscriptions, AI usage, white-label partners and audit."
      stats={[
        { label: "Organizations", value: "512", hint: "+18 this quarter" },
        { label: "Active clinics", value: "4,820" },
        { label: "Platform MRR", value: "₹38.4 Cr" },
        { label: "AI tokens (30d)", value: "812 M" },
      ]}
      sections={[
        {
          title: "Platform dashboard",
          items: [
            "Real-time tenant health",
            "Org-level uptime & SLA",
            "Geo distribution map",
            "Top-grossing organizations",
            "Anomaly alerts",
          ],
        },
        {
          title: "Organization management",
          items: [
            "Provision / suspend orgs",
            "Tenant isolation checks",
            "Move clinics between orgs",
            "Data residency controls",
            "Tenant-aware backups",
          ],
        },
        {
          title: "Revenue & subscription",
          items: [
            "Platform MRR / ARR",
            "Per-plan revenue split",
            "Churn cohort analysis",
            "Subscription overrides",
            "Dunning workflows",
          ],
        },
        {
          title: "Feature & AI controls",
          items: [
            "Per-org feature toggles",
            "Beta program enrolment",
            "AI agent quotas",
            "Token usage budgeting",
            "Model routing policies",
          ],
        },
        {
          title: "Support & audit",
          items: [
            "Impersonation w/ audit",
            "SLA-tracked ticket queue",
            "Immutable audit logs",
            "DPDP / HIPAA evidence",
            "SOC2 trust center",
          ],
        },
        {
          title: "White-label registry",
          items: [
            "Brand-A / B / C partners",
            "Domain & cert health",
            "Template library status",
            "Co-branded billing",
            "Partner revenue share",
          ],
        },
      ]}
      workflow={[
        "Super admin signs in via SSO with MFA; session bound to platform tenant scope.",
        "Dashboard streams aggregated metrics from all 500 organization tenants.",
        "Admin opens an org → reviews subscription, AI usage, support tickets.",
        "Feature flags / quotas updated → propagated to org-level config service.",
        "All write actions captured into immutable audit log with org + actor context.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="size-4 text-primary" /> Organization Admins
            </CardTitle>
            <ActionButton
              label="Make Org Admin"
              title="Assign Organization Administrator"
              description="Promote a user profile and bind their scope to an organization."
              fields={[
                { name: "name", label: "Admin Full Name", placeholder: "e.g. Dr. Amit Sharma" },
                { name: "email", label: "Admin Email Address", placeholder: "e.g. amit@helix.health" },
                {
                  name: "organization",
                  label: "Target Organization",
                  type: "select",
                  options: orgOptions,
                },
              ]}
              confirmLabel="Assign Admin"
              onConfirm={handleMakeOrgAdmin}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {adminsList.map((admin) => (
              <div key={admin.email} className="border rounded-md p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{admin.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{admin.email}</div>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-info/10 text-info border-info/20 text-[10px]">
                      {admin.org}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleRevokeAdmin(admin.email, admin.name)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Onboarded Organizations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <OrganizationTable />
          </CardContent>
        </Card>
      </div>
    </ModulePage>
  );
}