import React, { useState } from "react";
import { X, Ruler } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface MeasurementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onSave: (measurementsData: any) => void;
}

export function MeasurementsModal({
  isOpen,
  onClose,
  appointment,
  onSave,
}: MeasurementsModalProps) {
  // Height & Weight State
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");

  // BIA 'Overall' State
  const [bmi, setBmi] = useState("");
  const [fatMass, setFatMass] = useState("");
  const [fatPercent, setFatPercent] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [musclePercent, setMusclePercent] = useState("");
  const [leanMass, setLeanMass] = useState("");
  const [leanPercent, setLeanPercent] = useState("");
  const [totalWater, setTotalWater] = useState("");

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      height,
      heightUnit,
      weight,
      waist,
      hip,
      bmi,
      fatMass,
      fatPercent,
      muscleMass,
      musclePercent,
      leanMass,
      leanPercent,
      totalWater,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-3xl mx-auto bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-[#141e33]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ruler className="size-5 text-emerald-400" /> Measurements & BIA
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Patient: {appointment.patient_name || appointment.patientName || "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Top Section Grid (1 col mobile, 3 cols desktop) */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-1 uppercase tracking-wider text-xs">
              Anthropometrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Height with unit toggle */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">Height</label>
                  <div className="flex bg-slate-950 rounded p-0.5 text-xs font-semibold border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setHeightUnit("cm")}
                      className={`px-2 py-0.5 rounded-sm transition-all ${
                        heightUnit === "cm" ? "bg-teal-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeightUnit("in")}
                      className={`px-2 py-0.5 rounded-sm transition-all ${
                        heightUnit === "in" ? "bg-teal-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      in
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-11"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-11"
                />
              </div>

              {/* Waist & Hip */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Waist"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-11"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Hip (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Hip"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-11"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* BIA Section Tabs */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-1 uppercase tracking-wider text-xs">
              Bioelectrical Impedance Analysis (BIA)
            </h4>
            <Tabs defaultValue="overall" className="w-full">
              <TabsList className="bg-slate-950 w-full justify-start p-1 h-auto flex flex-wrap gap-1 border border-slate-800 rounded-xl">
                <TabsTrigger value="overall" className="text-xs py-2 px-3">Overall</TabsTrigger>
                <TabsTrigger value="fat" className="text-xs py-2 px-3">Fat Distrib.</TabsTrigger>
                <TabsTrigger value="muscle" className="text-xs py-2 px-3">Muscle</TabsTrigger>
                <TabsTrigger value="water" className="text-xs py-2 px-3">Water & Elements</TabsTrigger>
                <TabsTrigger value="vitals" className="text-xs py-2 px-3">Vital Signs</TabsTrigger>
              </TabsList>

              <TabsContent value="overall" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">BMI</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 22.5"
                      value={bmi}
                      onChange={(e) => setBmi(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Fat Mass (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={fatMass}
                      onChange={(e) => setFatMass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Fat Percentage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={fatPercent}
                      onChange={(e) => setFatPercent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Skeletal Muscle Mass (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={muscleMass}
                      onChange={(e) => setMuscleMass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Skeletal Muscle %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={musclePercent}
                      onChange={(e) => setMusclePercent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Lean Mass (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={leanMass}
                      onChange={(e) => setLeanMass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Lean Mass %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={leanPercent}
                      onChange={(e) => setLeanPercent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Total Body Water (L)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={totalWater}
                      onChange={(e) => setTotalWater(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fat" className="mt-4 text-slate-400 text-xs p-4 text-center border border-dashed border-slate-850 rounded-xl bg-slate-950">
                Segmental Fat analysis and fat distribution models will map dynamically.
              </TabsContent>

              <TabsContent value="muscle" className="mt-4 text-slate-400 text-xs p-4 text-center border border-dashed border-slate-850 rounded-xl bg-slate-950">
                Segmental Lean Mass and Muscle balance readings.
              </TabsContent>

              <TabsContent value="water" className="mt-4 text-slate-400 text-xs p-4 text-center border border-dashed border-slate-850 rounded-xl bg-slate-950">
                Intracellular, Extracellular water and Mineral element analysis.
              </TabsContent>

              <TabsContent value="vitals" className="mt-4 text-slate-400 text-xs p-4 text-center border border-dashed border-slate-850 rounded-xl bg-slate-950">
                Blood Pressure, Pulse rate, and O2 saturation inputs.
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-sm font-semibold text-white transition-all shadow-md"
            >
              Save Measurements
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
