import { useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentApi, clinicApi } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

export default function DepartmentTable() {
  const queryClient = useQueryClient();
  const clinicsQuery = useQuery({ queryKey: ["clinics"], queryFn: clinicApi.getClinics });
  const departmentsQuery = useQuery({ queryKey: ["departments"], queryFn: departmentApi.getDepartments });
  const clinicMap = useMemo(() => new Map((clinicsQuery.data ?? []).map((clinic: any) => [String(clinic.id), clinic.name])), [clinicsQuery.data]);

  const handleDelete = async (id: string, name: string) => {
    try {
      await departmentApi.deleteDepartment(id);
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success(`Department "${name}" deleted.`);
    } catch (err: any) {
      toast.error("Department deletion failed", { description: err.response?.data?.detail || err.message });
    }
  };

  if (departmentsQuery.isLoading || clinicsQuery.isLoading) return <div className="p-4 text-muted-foreground text-sm">Loading departments...</div>;
  if (departmentsQuery.error || clinicsQuery.error) return <div className="p-4 text-destructive text-sm">Unable to load departments from the database.</div>;
  const data = departmentsQuery.data ?? [];

  return <div className="rounded-md border bg-card"><Table>
    <TableHeader><TableRow><TableHead>Department Name</TableHead><TableHead>Code</TableHead><TableHead>Clinic</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead className="w-[60px]" /></TableRow></TableHeader>
    <TableBody>{data.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground text-sm">No departments exist in the database for this organization.</TableCell></TableRow> : data.map((department: any) =>
      <TableRow key={department.id}><TableCell className="font-medium text-xs">{department.name}</TableCell><TableCell className="font-mono text-xs">{department.code}</TableCell><TableCell className="text-xs">{clinicMap.get(String(department.clinic)) || department.clinic}</TableCell><TableCell className="text-xs">{department.description || "-"}</TableCell><TableCell><Badge variant="outline" className="text-[10px]">{department.status}</Badge></TableCell><TableCell><Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => handleDelete(department.id, department.name)}><Trash2 className="size-3.5" /></Button></TableCell></TableRow>
    )}</TableBody>
  </Table></div>;
}
