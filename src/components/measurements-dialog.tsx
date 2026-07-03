import React, { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ShieldCheck, Plus, X } from "lucide-react";
import { axiosInstance } from "@/lib/api";

interface MeasurementsDialogProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function MeasurementsDialog({
  patientId,
  patientName,
  onClose,
  onSaveSuccess,
}: MeasurementsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState<"cm" | "ft">("cm");

  // Core metrics
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");

  // BIA Fields
  const [bia, setBia] = useState({
    bmi_device: "",
    fat_mass: "",
    fat_percentage: "",
    skeletal_muscle_mass: "",
    skeletal_muscle_percentage: "",
    lean_mass: "",
    lean_mass_percentage: "",
    total_water: "",
    water_percentage: "",
    health_score: "",
    body_age: "",
    body_symmetry: "",
    t_score: "",
    z_score: "",
  });

  // Calculate standard conversion for height
  const handleHeightChange = (val: string) => {
    setHeight(val);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalHeight = parseFloat(height) || null;
      if (unit === "ft" && height) {
        // Simple ft to cm conversion for saving to database
        finalHeight = parseFloat(height) * 30.48;
      }

      const payload = {
        patient: patientId,
        height: finalHeight,
        weight: parseFloat(weight) || null,
        waist_circumference: parseFloat(waist) || null,
        hip_circumference: parseFloat(hip) || null,
        
        bmi_device: parseFloat(bia.bmi_device) || null,
        fat_mass: parseFloat(bia.fat_mass) || null,
        fat_percentage: parseFloat(bia.fat_percentage) || null,
        skeletal_muscle_mass: parseFloat(bia.skeletal_muscle_mass) || null,
        skeletal_muscle_percentage: parseFloat(bia.skeletal_muscle_percentage) || null,
        lean_mass: parseFloat(bia.lean_mass) || null,
        lean_mass_percentage: parseFloat(bia.lean_mass_percentage) || null,
        total_water: parseFloat(bia.total_water) || null,
        water_percentage: parseFloat(bia.water_percentage) || null,
        health_score: parseInt(bia.health_score) || null,
        body_age: parseInt(bia.body_age) || null,
        body_symmetry: bia.body_symmetry || null,
        t_score: parseFloat(bia.t_score) || null,
        z_score: parseFloat(bia.z_score) || null,
      };

      await axiosInstance.post("/reception/measurements/", payload);
      toast.success(`Measurements saved for ${patientName}`);
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save measurements.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border rounded-lg shadow-elegant">
      <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <DialogTitle className="text-base font-bold text-foreground">
          Measurements: {patientName}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Core Inputs Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold text-muted-foreground">Height</Label>
              <div className="flex bg-muted rounded p-0.5 text-[10px] font-bold">
                <button
                  onClick={() => setUnit("cm")}
                  className={`px-1.5 py-0.5 rounded-sm ${unit === "cm" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  cm
                </button>
                <button
                  onClick={() => setUnit("ft")}
                  className={`px-1.5 py-0.5 rounded-sm ${unit === "ft" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  ft / in
                </button>
              </div>
            </div>
            <Input
              value={height}
              onChange={(e) => handleHeightChange(e.target.value)}
              placeholder={unit === "cm" ? "e.g. 165" : "e.g. 5.4"}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Weight (kg)</Label>
            <Input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 70"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Waist Circumference (cm)</Label>
            <Input
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder="e.g. 80"
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Core Inputs Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Hip Circumference (cm)</Label>
            <Input
              value={hip}
              onChange={(e) => setHip(e.target.value)}
              placeholder="e.g. 95"
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* BIA Tabbed Container */}
        <div className="border rounded-lg overflow-hidden bg-muted/10 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
              ⚡ Body Composition Analysis (BIA)
            </div>
            <Button variant="outline" size="sm" className="h-7 text-[10px] border-dashed border-primary text-primary hover:bg-primary/5">
              Add Impedance Data
            </Button>
          </div>

          <Tabs defaultValue="overall" className="w-full">
            <TabsList className="grid grid-cols-5 w-full h-8 bg-muted/40 p-0.5">
              <TabsTrigger value="overall" className="text-[10px] h-7">Overall</TabsTrigger>
              <TabsTrigger value="fat" className="text-[10px] h-7">Fat Distrib.</TabsTrigger>
              <TabsTrigger value="muscle" className="text-[10px] h-7">Muscle</TabsTrigger>
              <TabsTrigger value="water" className="text-[10px] h-7">Water & Elements</TabsTrigger>
              <TabsTrigger value="vitals" className="text-[10px] h-7">Vital Signs</TabsTrigger>
            </TabsList>

            <TabsContent value="overall" className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
              {[
                { label: "BMI (device)", key: "bmi_device", placeholder: "—" },
                { label: "Fat Mass (kg)", key: "fat_mass", placeholder: "—" },
                { label: "Fat Percentage (%)", key: "fat_percentage", placeholder: "—" },
                { label: "Skeletal Muscle Mass (kg)", key: "skeletal_muscle_mass", placeholder: "—" },
                { label: "Skeletal Muscle % (%)", key: "skeletal_muscle_percentage", placeholder: "—" },
                { label: "Lean Mass (kg)", key: "lean_mass", placeholder: "—" },
                { label: "Lean Mass % (%)", key: "lean_mass_percentage", placeholder: "—" },
                { label: "Total Water (kg)", key: "total_water", placeholder: "—" },
                { label: "Water % (%)", key: "water_percentage", placeholder: "—" },
                { label: "Health Score", key: "health_score", placeholder: "—" },
                { label: "Body Age (years)", key: "body_age", placeholder: "—" },
                { label: "Body Symmetry", key: "body_symmetry", placeholder: "—" },
                { label: "T-Score", key: "t_score", placeholder: "—" },
                { label: "Z-Score", key: "z_score", placeholder: "—" },
              ].map((item) => (
                <div key={item.key} className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">{item.label}</Label>
                  <Input
                    value={(bia as any)[item.key]}
                    onChange={(e) => setBia({ ...bia, [item.key]: e.target.value })}
                    placeholder={item.placeholder}
                    className="h-8 text-xs bg-card"
                  />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="fat" className="mt-4 text-xs text-muted-foreground text-center py-4">
              Segmented Fat Distribution parameters load automatically upon impedance sync.
            </TabsContent>
            <TabsContent value="muscle" className="mt-4 text-xs text-muted-foreground text-center py-4">
              Muscular balance tracking and structural integrity indexing.
            </TabsContent>
            <TabsContent value="water" className="mt-4 text-xs text-muted-foreground text-center py-4">
              Extracellular vs intracellular fluid analytics.
            </TabsContent>
            <TabsContent value="vitals" className="mt-4 text-xs text-muted-foreground text-center py-4">
              Pulse waveform and peripheral vital sign analysis.
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <DialogFooter className="border-t pt-4 flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/95">
          Save Measurements
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
