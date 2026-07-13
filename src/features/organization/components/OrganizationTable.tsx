import { useOrganizations } from "@/hooks/useOrganization";
import type { Organization } from "@/types/organization";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/lib/api/organization";
import { toast } from "sonner";

export default function OrganizationTable() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, error } = useOrganizations();

  const handleDelete = async (organization: Organization) => {
    try {
      await organizationApi.remove(organization.id);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success(`Organization "${organization.name}" deleted.`);
    } catch (err: any) {
      toast.error("Organization deletion failed", { description: err.response?.data?.detail || err.message });
    }
  };

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Loading organizations...</div>;
  if (error) return <div className="p-4 text-destructive text-sm">Unable to load organizations from the database.</div>;

  return (
    <Table>
      <TableHeader><TableRow>
        <TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Email</TableHead>
        <TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="w-[60px]" />
      </TableRow></TableHeader>
      <TableBody>
        {data.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground text-xs">No organizations exist in the database.</TableCell></TableRow> :
          data.map((organization) => <TableRow key={organization.id}>
            <TableCell className="font-medium text-xs">{organization.name}</TableCell>
            <TableCell className="font-mono text-xs">{organization.code}</TableCell>
            <TableCell className="text-xs">{organization.email}</TableCell>
            <TableCell className="text-xs">{organization.phone}</TableCell>
            <TableCell><Badge variant="outline" className="text-[10px]">{organization.status}</Badge></TableCell>
            <TableCell><Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => handleDelete(organization)}><Trash2 className="size-3.5" /></Button></TableCell>
          </TableRow>)}
      </TableBody>
    </Table>
  );
}
