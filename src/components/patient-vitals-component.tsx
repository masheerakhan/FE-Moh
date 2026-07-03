import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { HeartPulse, Check, AlertCircle, FileUp, Sparkles, Plus, Edit } from "lucide-react";
import { axiosInstance } from "@/lib/api";

interface PatientVitalsComponentProps {
  patientId: string;
  onVitalsSaved?: () => void;
}

export function PatientVitalsComponent({ patientId, onVitalsSaved }: PatientVitalsComponentProps) {
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrStaging, setOcrStaging] = useState<any>(null);
  
  // Vitals State
  const [vitals, setVitals] = useState({
    weight: "",
    height: "",
    blood_pressure: "",
    pulse: "",
    temperature: "",
    spo2: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Manual save
  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        patient: patientId,
        weight: vitals.weight ? parseFloat(vitals.weight) : null,
        height: vitals.height ? parseFloat(vitals.height) : null,
        blood_pressure: vitals.blood_pressure || null,
        pulse: vitals.pulse ? parseInt(vitals.pulse) : null,
        temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
        spo2: vitals.spo2 ? parseInt(vitals.spo2) : null,
      };

      const res = await axiosInstance.post("/reception/vitals/", payload);
      toast.success("Vitals recorded successfully.");
      setVitals({ weight: "", height: "", blood_pressure: "", pulse: "", temperature: "", spo2: "" });
      if (onVitalsSaved) onVitalsSaved();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        toast.error("Validation failed. Please correct the highlighted errors.");
      } else {
        toast.error("Failed to save vitals.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Simulate OCR Parser trigger
  const handleOcrSubmit = async () => {
    if (!ocrText.trim()) {
      toast.error("Please paste unstructured OCR report text first.");
      return;
    }
    setLoading(true);
    setOcrStaging(null);
    setErrors({});

    try {
      // Send unstructured text to the OCR endpoint
      // To simulate, we parse keys from report text e.g., "wt: 72.5, ht: abc, bp: 120/80, pulse: 75, temp: 98.6, spo2: 99"
      // We will parse standard strings from it and send to the backend patch/post
      const parseRegex = (key: string) => {
        const regex = new RegExp(`${key}\\s*:\\s*([^,\\s]+)`, "i");
        const match = ocrText.match(regex);
        return match ? match[1] : undefined;
      };

      const parsedPayload = {
        patient: patientId,
        weight: parseRegex("wt") || parseRegex("weight"),
        height: parseRegex("ht") || parseRegex("height"),
        blood_pressure: parseRegex("bp") || parseRegex("blood_pressure") || parseRegex("pressure"),
        pulse: parseRegex("pulse") || parseRegex("hr") || parseRegex("heart"),
        temperature: parseRegex("temp") || parseRegex("temperature") || parseRegex("body"),
        spo2: parseRegex("spo2") || parseRegex("oxygen"),
      };

      const res = await axiosInstance.post("/reception/vitals/parse-ocr/", parsedPayload);
      
      if (res.data.is_staging) {
        setOcrStaging(res.data);
        setVitals({
          weight: res.data.original_data.weight || "",
          height: res.data.original_data.height || "",
          blood_pressure: res.data.original_data.blood_pressure || "",
          pulse: res.data.original_data.pulse || "",
          temperature: res.data.original_data.temperature || "",
          spo2: res.data.original_data.spo2 || "",
        });
        setErrors(res.data.errors || {});
        toast.warning("OCR Parser completed with warnings. Review staging values.", {
          description: "Malformed fields highlighted in red for manual resolution."
        });
      } else {
        toast.success("OCR Parser saved data cleanly without warning.");
        setOcrText("");
        if (onVitalsSaved) onVitalsSaved();
      }
    } catch (err: any) {
      toast.error("Failed to parse OCR content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background">
      {/* Vitals Entry Form */}
      <Card className="shadow-elegant border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">Patient Vital Tracker</CardTitle>
            </div>
            {ocrStaging && (
              <Badge className="bg-warning/15 text-warning border-warning/30 hover:bg-warning/15 flex gap-1 items-center">
                <AlertCircle className="size-3" /> Staging Payload
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Enter numerical vitals manually or resolve parsed staging records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveVitals} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-xs font-semibold">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="text"
                  placeholder="e.g. 72.5"
                  value={vitals.weight}
                  onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  className={errors.weight ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.weight && <span className="text-[10px] text-destructive block mt-1">{errors.weight}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-xs font-semibold">Height (cm)</Label>
                <Input
                  id="height"
                  type="text"
                  placeholder="e.g. 175.2"
                  value={vitals.height}
                  onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                  className={errors.height ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.height && <span className="text-[10px] text-destructive block mt-1">{errors.height}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="blood_pressure" className="text-xs font-semibold">Blood Pressure</Label>
                <Input
                  id="blood_pressure"
                  type="text"
                  placeholder="e.g. 120/80"
                  value={vitals.blood_pressure}
                  onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                  className={errors.blood_pressure ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.blood_pressure && <span className="text-[10px] text-destructive block mt-1">{errors.blood_pressure}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pulse" className="text-xs font-semibold">Pulse / Heart Rate (bpm)</Label>
                <Input
                  id="pulse"
                  type="text"
                  placeholder="e.g. 72"
                  value={vitals.pulse}
                  onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                  className={errors.pulse ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.pulse && <span className="text-[10px] text-destructive block mt-1">{errors.pulse}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="temperature" className="text-xs font-semibold">Temperature (°F)</Label>
                <Input
                  id="temperature"
                  type="text"
                  placeholder="e.g. 98.6"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  className={errors.temperature ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.temperature && <span className="text-[10px] text-destructive block mt-1">{errors.temperature}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="spo2" className="text-xs font-semibold">SpO2 (%)</Label>
                <Input
                  id="spo2"
                  type="text"
                  placeholder="e.g. 98"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                  className={errors.spo2 ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.spo2 && <span className="text-[10px] text-destructive block mt-1">{errors.spo2}</span>}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              {ocrStaging && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setOcrStaging(null);
                    setVitals({ weight: "", height: "", blood_pressure: "", pulse: "", temperature: "", spo2: "" });
                    setErrors({});
                  }}
                >
                  Discard Staging
                </Button>
              )}
              <Button type="submit" disabled={loading} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95">
                <Check className="size-4" /> Save Vitals
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* OCR Simulator Panel */}
      <Card className="shadow-elegant border bg-card flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary-glow animate-pulse" />
            <CardTitle className="text-base font-semibold">AI Vitals OCR Parser (Simulator)</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Paste raw text from physical patient summaries or metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <Textarea
            value={ocrText}
            onChange={(e) => setOcrText(e.target.value)}
            placeholder="Paste report summary text. Try pasting:&#10;weight: 78.4, height: error_text, bp: 130/85, pulse: 140, temp: 99.2, spo2: 97"
            className="flex-1 min-h-[140px] text-xs font-mono"
          />
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setOcrText(
                  "CRITICAL CARE VITALS CHECK: patient weight is wt: 72.5kg, height is ht: 176.4cm, blood pressure bp: 120/80, heart pulse rate is hr: 78, temperature temp: 98.4, and SpO2 levels measured spo2: 99%"
                )
              }
              className="text-xs"
            >
              Fill Clean Sample
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setOcrText(
                  "PATIENT VITAL LOG: weight wt: 88.2, height ht: text_error, bp: 125, pulse hr: 82, temp: 98.6, spo2: 40"
                )
              }
              className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Fill Malformed Sample
            </Button>
            <Button onClick={handleOcrSubmit} disabled={loading} className="gap-1.5">
              <FileUp className="size-3.5" /> Parse report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
