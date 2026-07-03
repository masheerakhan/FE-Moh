import React, { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/api";

interface LabReportDialogProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function LabReportDialog({
  patientId,
  patientName,
  onClose,
  onSaveSuccess,
}: LabReportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dateOfReport, setDateOfReport] = useState(new Date().toISOString().slice(0, 10));

  // Blood Sugar
  const [hba1c, setHba1c] = useState("");
  const [fastingSugar, setFastingSugar] = useState("");
  const [pp2Sugar, setPp2Sugar] = useState("");

  // Lipid
  const [cholesterol, setCholesterol] = useState("");
  const [ldl, setLdl] = useState("");
  const [hdl, setHdl] = useState("");
  const [triglycerides, setTriglycerides] = useState("");

  // Liver
  const [sgot, setSgot] = useState("");
  const [sgpt, setSgpt] = useState("");

  // USG
  const [gallStones, setGallStones] = useState("Not tested");
  const [fattyLiver, setFattyLiver] = useState("Not tested");

  // Thyroid
  const [tsh, setTsh] = useState("");
  const [t3, setT3] = useState("");
  const [t4, setT4] = useState("");

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        patient: patientId,
        date_of_report: dateOfReport,
        
        hba1c: hba1c ? parseFloat(hba1c) : null,
        fasting_sugar: fastingSugar ? parseFloat(fastingSugar) : null,
        pp2_sugar: pp2Sugar ? parseFloat(pp2Sugar) : null,
        
        total_cholesterol: cholesterol ? parseFloat(cholesterol) : null,
        ldl: ldl ? parseFloat(ldl) : null,
        hdl: hdl ? parseFloat(hdl) : null,
        triglycerides: triglycerides ? parseFloat(triglycerides) : null,
        
        sgot_ast: sgot ? parseFloat(sgot) : null,
        sgpt_alt: sgpt ? parseFloat(sgpt) : null,
        
        gall_stones: gallStones,
        fatty_liver: fattyLiver,
        
        tsh: tsh ? parseFloat(tsh) : null,
        t3: t3 ? parseFloat(t3) : null,
        t4: t4 ? parseFloat(t4) : null,
      };

      await axiosInstance.post("/reception/structured-lab-reports/", payload);
      toast.success(`Lab Report saved for ${patientName}`);
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save lab report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border rounded-lg shadow-elegant">
      <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <DialogTitle className="text-base font-bold text-foreground">
          Lab Report: {patientName}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Date of Report */}
        <div className="space-y-1.5 max-w-[200px]">
          <Label className="text-xs font-semibold text-muted-foreground">Date of Lab Report</Label>
          <Input
            type="date"
            value={dateOfReport}
            onChange={(e) => setDateOfReport(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <hr className="border-muted/30" />

        {/* Blood Sugar Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Blood Sugar</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">HbA1c (%)</Label>
              <Input
                value={hba1c}
                onChange={(e) => setHba1c(e.target.value)}
                placeholder="e.g. 5.7"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">Fasting Blood Sugar (mg/dL)</Label>
              <Input
                value={fastingSugar}
                onChange={(e) => setFastingSugar(e.target.value)}
                placeholder="e.g. 90"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">PP2 Blood Sugar (mg/dL)</Label>
              <Input
                value={pp2Sugar}
                onChange={(e) => setPp2Sugar(e.target.value)}
                placeholder="e.g. 120"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Lipid Profile Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Lipid Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">Total Cholesterol (mg/dL)</Label>
              <Input
                value={cholesterol}
                onChange={(e) => setCholesterol(e.target.value)}
                placeholder="e.g. 180"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">LDL (mg/dL)</Label>
              <Input
                value={ldl}
                onChange={(e) => setLdl(e.target.value)}
                placeholder="e.g. 100"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">HDL (mg/dL)</Label>
              <Input
                value={hdl}
                onChange={(e) => setHdl(e.target.value)}
                placeholder="e.g. 55"
                className="h-9 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">Triglycerides (mg/dL)</Label>
              <Input
                value={triglycerides}
                onChange={(e) => setTriglycerides(e.target.value)}
                placeholder="e.g. 130"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Liver Function Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Liver Function</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">SGOT / AST (U/L)</Label>
              <Input
                value={sgot}
                onChange={(e) => setSgot(e.target.value)}
                placeholder="e.g. 25"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">SGPT / ALT (U/L)</Label>
              <Input
                value={sgpt}
                onChange={(e) => setSgpt(e.target.value)}
                placeholder="e.g. 28"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* USG Abdomen Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">USG Abdomen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">Gall Stones</Label>
              <Select value={gallStones} onValueChange={setGallStones}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not tested">— Not tested —</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">Fatty Liver</Label>
              <Select value={fattyLiver} onValueChange={setFattyLiver}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not tested">— Not tested —</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Thyroid Function Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Thyroid Function</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">TSH (mIU/L)</Label>
              <Input
                value={tsh}
                onChange={(e) => setTsh(e.target.value)}
                placeholder="e.g. 2.5"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">T3 (ng/dL)</Label>
              <Input
                value={t3}
                onChange={(e) => setT3(e.target.value)}
                placeholder="e.g. 100"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">T4 (µg/dL)</Label>
              <Input
                value={t4}
                onChange={(e) => setT4(e.target.value)}
                placeholder="e.g. 8"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="border-t pt-4 flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/95">
          Save Lab Report
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
