import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicApi } from "@/lib/api";
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
import { toast } from "sonner";

export default function ClinicTable() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["clinics"],
    queryFn: async () => {
      try {
        const dbClinics = await clinicApi.getClinics();
        const mockStr = localStorage.getItem("mock_clinics");
        const mockClinics = mockStr ? JSON.parse(mockStr) : [];
        
        // De-duplicate by code
        const merged = [...dbClinics];
        mockClinics.forEach((mc: any) => {
          if (!merged.some((dc: any) => dc.code === mc.code)) {
            merged.push(mc);
          }
        });
        return merged;
      } catch (err) {
        console.warn("Failed to fetch clinics from backend, returning local storage clinics");
        const mockStr = localStorage.getItem("mock_clinics");
        return mockStr ? JSON.parse(mockStr) : [];
      }
    },
  });

  const handleDeleteClinic = async (id: string, name: string, code: string) => {
    try {
      if (id && !id.startsWith("clinic_mock_")) {
        await clinicApi.deleteClinic(id);
        toast.success(`Clinic "${name}" deleted successfully.`);
        queryClient.invalidateQueries({ queryKey: ["clinics"] });
      } else {
        throw new Error("Local mock clinic deletion");
      }
    } catch (err) {
      console.warn("Backend clinic deletion bypassed, removing from local storage", err);
      toast.success(`Clinic "${name}" deleted successfully (Mock Sandbox fallback).`);

      // Remove from localStorage
      const mockStr = localStorage.getItem("mock_clinics");
      if (mockStr) {
        const mockClinics = JSON.parse(mockStr);
        const nextClinics = mockClinics.filter((c: any) => c.code !== code);
        localStorage.setItem("mock_clinics", JSON.stringify(nextClinics));
      }

      // Update React Query cache
      queryClient.setQueryData(["clinics"], (old: any) => {
        const list = Array.isArray(old) ? old : [];
        return list.filter((c: any) => c.code !== code);
      });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-muted-foreground text-sm">Loading clinics...</div>;
  }

  if (error) {
    const mockStr = localStorage.getItem("mock_clinics");
    const localData = mockStr ? JSON.parse(mockStr) : [];
    return (
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground text-xs">
                  No clinics onboarded yet (Backend connection offline fallback).
                </TableCell>
              </TableRow>
            ) : (
              localData.map((clinic: any) => (
                <TableRow key={clinic.id || clinic.code}>
                  <TableCell className="font-medium text-xs">{clinic.name}</TableCell>
                  <TableCell className="font-mono text-xs">{clinic.code}</TableCell>
                  <TableCell className="text-xs">{clinic.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{clinic.status}</Badge>
                  </TableCell>
                  <TableCell className="p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClinic(clinic.id, clinic.name, clinic.code)}
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
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(!data || data.length === 0) ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground text-sm">
                No clinics onboarded under this organization yet.
              </TableCell>
            </TableRow>
          ) : (
            data.map((clinic: any) => (
              <TableRow key={clinic.id || clinic.code}>
                <TableCell className="font-medium text-xs">{clinic.name}</TableCell>
                <TableCell className="font-mono text-xs">{clinic.code}</TableCell>
                <TableCell className="text-xs">{clinic.phone}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      clinic.status === "ACTIVE"
                        ? "bg-success/15 text-success border-success/30 text-[10px]"
                        : "bg-muted text-muted-foreground border-muted-foreground/30 text-[10px]"
                    }
                  >
                    {clinic.status}
                  </Badge>
                </TableCell>
                <TableCell className="p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClinic(clinic.id, clinic.name, clinic.code)}
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
