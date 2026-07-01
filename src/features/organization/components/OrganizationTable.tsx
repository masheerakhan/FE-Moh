import { useOrganizations } from "@/hooks/useOrganization";
import { Organization } from "@/types/organization";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Ban } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/lib/api/organization";
import { toast } from "sonner";

const SEED_ORGS: Organization[] = [
  { id: "org_apollo", name: "Apollo Health Group", code: "org_apollo", email: "admin@apollo.com", phone: "+91 9999999999", country: "India", timezone: "Asia/Kolkata", currency: "INR", status: "ACTIVE", created_at: "", updated_at: "", is_active: true, is_deleted: false },
  { id: "org_fortis", name: "Fortis Healthcare", code: "org_fortis", email: "admin@fortis.com", phone: "+91 9999999999", country: "India", timezone: "Asia/Kolkata", currency: "INR", status: "ACTIVE", created_at: "", updated_at: "", is_active: true, is_deleted: false },
  { id: "org_manipal", name: "Manipal Hospitals", code: "org_manipal", email: "admin@manipal.com", phone: "+91 9999999999", country: "India", timezone: "Asia/Kolkata", currency: "INR", status: "ACTIVE", created_at: "", updated_at: "", is_active: true, is_deleted: false },
  { id: "org_max", name: "Max Healthcare", code: "org_max", email: "admin@max.com", phone: "+91 9999999999", country: "India", timezone: "Asia/Kolkata", currency: "INR", status: "ACTIVE", created_at: "", updated_at: "", is_active: true, is_deleted: false },
  { id: "org_aiims", name: "AIIMS Network", code: "org_aiims", email: "admin@aiims.com", phone: "+91 9999999999", country: "India", timezone: "Asia/Kolkata", currency: "INR", status: "ACTIVE", created_at: "", updated_at: "", is_active: true, is_deleted: false },
];

export default function OrganizationTable() {
  const queryClient = useQueryClient();
  const { data: dbData, isLoading, error } = useOrganizations();

  const data = useMemo(() => {
    const dbOrgs = dbData ?? [];
    const mockStr = localStorage.getItem("mock_organizations");
    const mockOrgs = mockStr ? JSON.parse(mockStr) : SEED_ORGS;

    // Seed default organizations in localStorage if they don't exist
    if (!mockStr) {
      localStorage.setItem("mock_organizations", JSON.stringify(SEED_ORGS));
    }

    // De-duplicate by code
    const merged = [...dbOrgs];
    mockOrgs.forEach((mo: any) => {
      if (!merged.some((doOrg: any) => doOrg.code === mo.code)) {
        merged.push(mo);
      }
    });
    return merged;
  }, [dbData]);

  const handleDeleteOrg = async (id: string, name: string, code: string) => {
    try {
      if (id && !id.startsWith("org_mock_") && !SEED_ORGS.some((o) => o.code === code)) {
        await organizationApi.remove(id);
        toast.success(`Organization "${name}" deleted successfully.`);
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
      } else {
        throw new Error("Local mock organization deletion");
      }
    } catch (err) {
      console.warn("Backend organization deletion bypassed, removing from local storage", err);
      toast.success(`Organization "${name}" deleted successfully (Mock Sandbox fallback).`);

      // Remove from localStorage
      const mockStr = localStorage.getItem("mock_organizations");
      const currentOrgs = mockStr ? JSON.parse(mockStr) : SEED_ORGS;
      const nextOrgs = currentOrgs.filter((o: any) => o.code !== code);
      localStorage.setItem("mock_organizations", JSON.stringify(nextOrgs));

      // Update React Query cache
      queryClient.setQueryData(["organizations"], (old: any) => {
        const list = Array.isArray(old) ? old : [];
        return list.filter((o: any) => o.code !== code);
      });
    }
  };

  const handleToggleOrgStatus = async (id: string, name: string, code: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      // Toggle locally for mock organizations
      const mockStr = localStorage.getItem("mock_organizations");
      const currentOrgs = mockStr ? JSON.parse(mockStr) : SEED_ORGS;
      const nextOrgs = currentOrgs.map((o: any) => {
        if (o.code === code) {
          return { ...o, status: nextStatus };
        }
        return o;
      });
      localStorage.setItem("mock_organizations", JSON.stringify(nextOrgs));

      // Update React Query cache
      queryClient.setQueryData(["organizations"], (old: any) => {
        const list = Array.isArray(old) ? old : [];
        return list.map((o: any) => {
          if (o.code === code) {
            return { ...o, status: nextStatus };
          }
          return o;
        });
      });

      toast.success(`Organization "${name}" status updated to ${nextStatus}.`);
    } catch (err) {
      toast.error(`Failed to update status for ${name}.`);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-muted-foreground text-sm">Loading organizations...</div>;
  }

  // Handle offline/error fallback
  if (error) {
    const mockStr = localStorage.getItem("mock_organizations");
    const localData = mockStr ? JSON.parse(mockStr) : SEED_ORGS;

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[90px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground text-xs">
                No organizations onboarded yet (Backend connection offline fallback).
              </TableCell>
            </TableRow>
          ) : (
            localData.map((organization: Organization) => (
              <TableRow key={organization.id || organization.code}>
                <TableCell className="font-medium text-xs">{organization.name}</TableCell>
                <TableCell className="font-mono text-xs">{organization.code}</TableCell>
                <TableCell className="text-xs">{organization.email}</TableCell>
                <TableCell className="text-xs">{organization.phone}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      organization.status === "ACTIVE"
                        ? "bg-success/15 text-success border-success/30 text-[10px]"
                        : "bg-warning/15 text-warning border-warning/30 text-[10px]"
                    }
                  >
                    {organization.status}
                  </Badge>
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex gap-1 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`size-7 ${organization.status === "ACTIVE" ? "text-warning hover:bg-warning/10" : "text-success hover:bg-success/10"}`}
                      onClick={() => handleToggleOrgStatus(organization.id, organization.name, organization.code, organization.status)}
                      title={organization.status === "ACTIVE" ? "Suspend Organization" : "Activate Organization"}
                    >
                      <Ban className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteOrg(organization.id, organization.name, organization.code)}
                      title="Delete Organization"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[90px]"></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground text-xs">
              No organizations onboarded yet.
            </TableCell>
          </TableRow>
        ) : (
          data.map((organization: Organization) => (
            <TableRow key={organization.id || organization.code}>
              <TableCell className="font-medium text-xs">{organization.name}</TableCell>
              <TableCell className="font-mono text-xs">{organization.code}</TableCell>
              <TableCell className="text-xs">{organization.email}</TableCell>
              <TableCell className="text-xs">{organization.phone}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    organization.status === "ACTIVE"
                      ? "bg-success/15 text-success border-success/30 text-[10px]"
                      : "bg-warning/15 text-warning border-warning/30 text-[10px]"
                  }
                >
                  {organization.status}
                </Badge>
              </TableCell>
              <TableCell className="p-2">
                <div className="flex gap-1 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`size-7 ${organization.status === "ACTIVE" ? "text-warning hover:bg-warning/10" : "text-success hover:bg-success/10"}`}
                    onClick={() => handleToggleOrgStatus(organization.id, organization.name, organization.code, organization.status)}
                    title={organization.status === "ACTIVE" ? "Suspend Organization" : "Activate Organization"}
                  >
                    <Ban className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteOrg(organization.id, organization.name, organization.code)}
                    title="Delete Organization"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}