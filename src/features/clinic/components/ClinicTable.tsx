import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicApi } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ClinicTable() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["clinics"], queryFn: clinicApi.getClinics });

  const handleDelete = async (id: string, name: string) => {
    try {
      await clinicApi.deleteClinic(id);
      await queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast.success(`Clinic "${name}" deleted.`);
    } catch (err: any) {
      toast.error("Clinic deletion failed", { description: err.response?.data?.detail || err.message });
    }
  };

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Loading clinics...</div>;
  if (error) return <div className="p-4 text-destructive text-sm">Unable to load clinics from the database.</div>;

  return <div className="rounded-md border bg-card"><Table>
    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="w-[60px]" /></TableRow></TableHeader>
    <TableBody>{data.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground text-sm">No clinics exist in the database for this organization.</TableCell></TableRow> : data.map((clinic) =>
      <TableRow key={clinic.id}><TableCell className="font-medium text-xs">{clinic.name}</TableCell><TableCell className="font-mono text-xs">{clinic.code}</TableCell><TableCell className="text-xs">{clinic.phone}</TableCell><TableCell><Badge variant="outline" className="text-[10px]">{clinic.status}</Badge></TableCell><TableCell><Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => handleDelete(clinic.id!, clinic.name)}><Trash2 className="size-3.5" /></Button></TableCell></TableRow>
    )}</TableBody>
  </Table></div>;
}
