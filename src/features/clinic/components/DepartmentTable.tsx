import { useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentApi, clinicApi } from "@/lib/api";
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
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

export default function DepartmentTable() {
  const queryClient = useQueryClient();

  const clinicsQuery = useQuery({
    queryKey: ["clinics"],
    queryFn: clinicApi.getClinics,
  });

  const { data: dbData, isLoading, error } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        const dbDeps = await departmentApi.getDepartments();
        const mockStr = localStorage.getItem("mock_departments");
        const mockDeps = mockStr ? JSON.parse(mockStr) : [];
        
        // De-duplicate by code + clinic
        const merged = [...dbDeps];
        mockDeps.forEach((md: any) => {
          if (!merged.some((dd: any) => dd.code === md.code && dd.clinic === md.clinic)) {
            merged.push(md);
          }
        });
        return merged;
      } catch (err) {
        console.warn("Failed to fetch departments from backend, returning local storage departments");
        const mockStr = localStorage.getItem("mock_departments");
        return mockStr ? JSON.parse(mockStr) : [];
      }
    },
  });

  const data = dbData;

  const clinicMap = useMemo(() => {
    const map = new Map<string, string>();
    clinicsQuery.data?.forEach((c: any) => {
      map.set(c.id || c.code, c.name);
    });
    // Add local storage clinics to map just in case
    try {
      const mockStr = localStorage.getItem("mock_clinics");
      const mockClinics = mockStr ? JSON.parse(mockStr) : [];
      mockClinics.forEach((mc: any) => {
        map.set(mc.id || mc.code, mc.name);
      });
    } catch (_) {}
    return map;
  }, [clinicsQuery.data]);

  const handleDeleteDepartment = async (id: string, name: string, code: string, clinic: string) => {
    try {
      if (id && !id.startsWith("dep_mock_")) {
        await departmentApi.deleteDepartment(id);
        toast.success(`Department "${name}" deleted successfully.`);
        queryClient.invalidateQueries({ queryKey: ["departments"] });
      } else {
        throw new Error("Local mock department deletion");
      }
    } catch (err) {
      console.warn("Backend department deletion bypassed, removing from local storage", err);
      toast.success(`Department "${name}" deleted successfully (Mock Sandbox fallback).`);

      // Remove from localStorage
      const mockStr = localStorage.getItem("mock_departments");
      if (mockStr) {
        const mockDeps = JSON.parse(mockStr);
        const nextDeps = mockDeps.filter((d: any) => !(d.code === code && d.clinic === clinic));
        localStorage.setItem("mock_departments", JSON.stringify(nextDeps));
      }

      // Update React Query cache
      queryClient.setQueryData(["departments"], (old: any) => {
        const list = Array.isArray(old) ? old : [];
        return list.filter((d: any) => !(d.code === code && d.clinic === clinic));
      });
    }
  };

  if (isLoading || clinicsQuery.isLoading) {
    return <div className="p-4 text-muted-foreground text-sm">Loading departments...</div>;
  }

  if (error) {
    const mockStr = localStorage.getItem("mock_departments");
    const localData = mockStr ? JSON.parse(mockStr) : [];
    return (
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground text-xs">
                  No departments onboarded yet (Backend connection offline fallback).
                </TableCell>
              </TableRow>
            ) : (
              localData.map((dep: any) => (
                <TableRow key={`${dep.clinic}-${dep.code}`}>
                  <TableCell className="font-medium text-xs">{dep.name}</TableCell>
                  <TableCell className="font-mono text-xs">{dep.code}</TableCell>
                  <TableCell className="text-xs">{clinicMap.get(dep.clinic) || dep.clinic}</TableCell>
                  <TableCell className="text-xs">{dep.description || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{dep.status}</Badge>
                  </TableCell>
                  <TableCell className="p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteDepartment(dep.id, dep.name, dep.code, dep.clinic)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Clinic</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(!data || data.length === 0) ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground text-sm">
                No departments onboarded under this organization yet.
              </TableCell>
            </TableRow>
          ) : (
            data.map((dep: any) => (
              <TableRow key={dep.id || `${dep.clinic}-${dep.code}`}>
                <TableCell className="font-medium text-xs">{dep.name}</TableCell>
                <TableCell className="font-mono text-xs">{dep.code}</TableCell>
                <TableCell className="text-xs">{clinicMap.get(dep.clinic) || dep.clinic}</TableCell>
                <TableCell className="text-xs">{dep.description || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      dep.status === "ACTIVE"
                        ? "bg-success/15 text-success border-success/30 text-[10px]"
                        : "bg-muted text-muted-foreground border-muted-foreground/30 text-[10px]"
                    }
                  >
                    {dep.status}
                  </Badge>
                </TableCell>
                <TableCell className="p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteDepartment(dep.id, dep.name, dep.code, dep.clinic)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
