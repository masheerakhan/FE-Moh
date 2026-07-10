import React, { useState, useEffect } from "react";
import { X, Ruler } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

const secureApi = axiosInstance;

interface MeasurementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  initialData?: any;
  onSave: (measurementsData: any) => void;
}

export function MeasurementsModal({
  isOpen,
  onClose,
  appointment,
  initialData,
  onSave,
}: MeasurementsModalProps) {
  // Height & Weight State
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");

  // Tab: 'overall'
  const [bmi, setBmi] = useState("");
  const [fatMass, setFatMass] = useState("");
  const [fatPercent, setFatPercent] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [musclePercent, setMusclePercent] = useState("");
  const [leanMass, setLeanMass] = useState("");
  const [leanPercent, setLeanPercent] = useState("");
  const [totalWater, setTotalWater] = useState("");
  const [waterPercent, setWaterPercent] = useState("");
  const [healthScore, setHealthScore] = useState("");
  const [bodyAge, setBodyAge] = useState("");
  const [bodySymmetry, setBodySymmetry] = useState("");
  const [tScore, setTScore] = useState("");
  const [zScore, setZScore] = useState("");

  // Tab: 'fat_distrib'
  const [subcutaneousFatMass, setSubcutaneousFatMass] = useState("");
  const [subcutaneousFatPercent, setSubcutaneousFatPercent] = useState("");
  const [visceralFatMass, setVisceralFatMass] = useState("");
  const [visceralFatLevel, setVisceralFatLevel] = useState("");
  const [trunkFat, setTrinkFat] = useState("");
  const [fatControl, setFatControl] = useState("");
  const [leftArmFat, setLeftArmFat] = useState("");
  const [rightArmFat, setRightArmFat] = useState("");
  const [leftLegFat, setLeftLegFat] = useState("");
  const [rightLegFat, setRightLegFat] = useState("");
  const [leftArmMuscFatRatio, setLeftArmMuscFatRatio] = useState("");
  const [rightArmMuscFatRatio, setRightArmMuscFatRatio] = useState("");
  const [leftLegMuscFatRatio, setLeftLegMuscFatRatio] = useState("");
  const [rightLegMuscFatRatio, setRightLegMuscFatRatio] = useState("");
  const [trunkMuscFatRatio, setTrunkMuscFatRatio] = useState("");

  // Tab: 'muscle'
  const [muscleControl, setMuscleControl] = useState("");
  const [leftArmMuscle, setLeftArmMuscle] = useState("");
  const [rightArmMuscle, setRightArmMuscle] = useState("");
  const [leftLegMuscle, setLeftLegMuscle] = useState("");
  const [rightLegMuscle, setRightLegMuscle] = useState("");
  const [trunkMuscle, setTrunkMuscle] = useState("");
  const [upperLowerBalance, setUpperLowerBalance] = useState("");
  const [trunkLimbBalance, setTrunkLimbBalance] = useState("");

  // Tab: 'water_elements'
  const [intracellularWater, setIntracellularWater] = useState("");
  const [extracellularWater, setExtracellularWater] = useState("");
  const [waterBalance, setWaterBalance] = useState("");
  const [proteinMass, setProteinMass] = useState("");
  const [proteinPercent, setProteinPercent] = useState("");
  const [boneMass, setBoneMass] = useState("");
  const [mineral, setMineral] = useState("");
  const [bodyCellMass, setBodyCellMass] = useState("");

  // Tab: 'vital_signs'
  const [heartRate, setHeartRate] = useState("");
  const [bmr, setBmr] = useState("");
  const [recommendedCalories, setRecommendedCalories] = useState("");
  const [fatFreeMass, setFatFreeMass] = useState("");
  const [idealWeight, setIdealWeight] = useState("");
  const [weightControl, setWeightControl] = useState("");

  useEffect(() => {
    if (initialData) {
      setHeight(initialData.height ? String(initialData.height) : "");
      setWeight(initialData.weight ? String(initialData.weight) : "");
      setWaist(initialData.waist_circumference ? String(initialData.waist_circumference) : "");
      setHip(initialData.hip_circumference ? String(initialData.hip_circumference) : "");
      setBmi(initialData.bmi_device ? String(initialData.bmi_device) : "");
      setFatMass(initialData.fat_mass ? String(initialData.fat_mass) : "");
      setFatPercent(initialData.fat_percentage ? String(initialData.fat_percentage) : "");
      setMuscleMass(initialData.skeletal_muscle_mass ? String(initialData.skeletal_muscle_mass) : "");
      setMusclePercent(initialData.skeletal_muscle_percentage ? String(initialData.skeletal_muscle_percentage) : "");
      setLeanMass(initialData.lean_mass ? String(initialData.lean_mass) : "");
      setLeanPercent(initialData.lean_mass_percentage ? String(initialData.lean_mass_percentage) : "");
      setTotalWater(initialData.total_water ? String(initialData.total_water) : "");
      setWaterPercent(initialData.water_percentage ? String(initialData.water_percentage) : "");
      setHealthScore(initialData.health_score ? String(initialData.health_score) : "");
      setBodyAge(initialData.body_age ? String(initialData.body_age) : "");
      setBodySymmetry(initialData.body_symmetry ? String(initialData.body_symmetry) : "");
      setTScore(initialData.t_score ? String(initialData.t_score) : "");
      setZScore(initialData.z_score ? String(initialData.z_score) : "");
      
      setSubcutaneousFatMass(initialData.subcutaneous_fat_mass ? String(initialData.subcutaneous_fat_mass) : "");
      setSubcutaneousFatPercent(initialData.subcutaneous_fat_percentage ? String(initialData.subcutaneous_fat_percentage) : "");
      setVisceralFatMass(initialData.visceral_fat_mass ? String(initialData.visceral_fat_mass) : "");
      setVisceralFatLevel(initialData.visceral_fat_level ? String(initialData.visceral_fat_level) : "");
      setTrinkFat(initialData.trunk_fat_mass ? String(initialData.trunk_fat_mass) : "");
      setLeftArmFat(initialData.left_arm_fat_mass ? String(initialData.left_arm_fat_mass) : "");
      setRightArmFat(initialData.right_arm_fat_mass ? String(initialData.right_arm_fat_mass) : "");
      setLeftLegFat(initialData.left_leg_fat_mass ? String(initialData.left_leg_fat_mass) : "");
      setRightLegFat(initialData.right_leg_fat_mass ? String(initialData.right_leg_fat_mass) : "");
      setFatControl(initialData.fat_control ? String(initialData.fat_control) : "");
      
      setLeftArmMuscFatRatio(initialData.left_arm_muscle_to_fat_ratio ? String(initialData.left_arm_muscle_to_fat_ratio) : "");
      setRightArmMuscFatRatio(initialData.right_arm_muscle_to_fat_ratio ? String(initialData.right_arm_muscle_to_fat_ratio) : "");
      setLeftLegMuscFatRatio(initialData.left_leg_muscle_to_fat_ratio ? String(initialData.left_leg_muscle_to_fat_ratio) : "");
      setRightLegMuscFatRatio(initialData.right_leg_muscle_to_fat_ratio ? String(initialData.right_leg_muscle_to_fat_ratio) : "");
      setTrunkMuscFatRatio(initialData.trunk_muscle_to_fat_ratio ? String(initialData.trunk_muscle_to_fat_ratio) : "");

      setMuscleControl(initialData.muscle_control ? String(initialData.muscle_control) : "");
      setLeftArmMuscle(initialData.left_arm_muscle_mass ? String(initialData.left_arm_muscle_mass) : "");
      setRightArmMuscle(initialData.right_arm_muscle_mass ? String(initialData.right_arm_muscle_mass) : "");
      setLeftLegMuscle(initialData.left_leg_muscle_mass ? String(initialData.left_leg_muscle_mass) : "");
      setRightLegMuscle(initialData.right_leg_muscle_mass ? String(initialData.right_leg_muscle_mass) : "");
      setTrunkMuscle(initialData.trunk_muscle_mass ? String(initialData.trunk_muscle_mass) : "");
      setUpperLowerBalance(initialData.upper_lower_muscle_balance ? String(initialData.upper_lower_muscle_balance) : "");
      setTrunkLimbBalance(initialData.trunk_limb_muscle_balance ? String(initialData.trunk_limb_muscle_balance) : "");

      setIntracellularWater(initialData.intracellular_water ? String(initialData.intracellular_water) : "");
      setExtracellularWater(initialData.extracellular_water ? String(initialData.extracellular_water) : "");
      setWaterBalance(initialData.water_balance ? String(initialData.water_balance) : "");
      setProteinMass(initialData.protein_mass ? String(initialData.protein_mass) : "");
      setProteinPercent(initialData.protein_percentage ? String(initialData.protein_percentage) : "");
      setBoneMass(initialData.bone_mass ? String(initialData.bone_mass) : "");
      setMineral(initialData.mineral ? String(initialData.mineral) : "");
      setBodyCellMass(initialData.body_cell_mass ? String(initialData.body_cell_mass) : "");

      setHeartRate(initialData.heart_rate ? String(initialData.heart_rate) : "");
      setBmr(initialData.bmr_kcal ? String(initialData.bmr_kcal) : "");
      setRecommendedCalories(initialData.recommended_calorie_intake ? String(initialData.recommended_calorie_intake) : "");
      setIdealWeight(initialData.ideal_weight ? String(initialData.ideal_weight) : "");
      setWeightControl(initialData.weight_control ? String(initialData.weight_control) : "");
      setFatFreeMass(initialData.fat_free_mass ? String(initialData.fat_free_mass) : "");

      setResistance5khz(initialData.resistance_5khz ? String(initialData.resistance_5khz) : "");
      setResistance50khz(initialData.resistance_50khz ? String(initialData.resistance_50khz) : "");
      setResistance250khz(initialData.resistance_250khz ? String(initialData.resistance_250khz) : "");
      setReactance5khz(initialData.reactance_5khz ? String(initialData.reactance_5khz) : "");
      setReactance50khz(initialData.reactance_50khz ? String(initialData.reactance_50khz) : "");
      setReactance250khz(initialData.reactance_250khz ? String(initialData.reactance_250khz) : "");
      setPhaseAngle(initialData.phase_angle ? String(initialData.phase_angle) : "");
    } else if (isOpen) {
      setHeight("");
      setWeight("");
      setWaist("");
      setHip("");
      setBmi("");
      setFatMass("");
      setFatPercent("");
      setMuscleMass("");
      setMusclePercent("");
      setLeanMass("");
      setLeanPercent("");
      setTotalWater("");
      setWaterPercent("");
      setHealthScore("");
      setBodyAge("");
      setBodySymmetry("");
      setTScore("");
      setZScore("");
      setSubcutaneousFatMass("");
      setSubcutaneousFatPercent("");
      setVisceralFatMass("");
      setVisceralFatLevel("");
      setTrinkFat("");
      setLeftArmFat("");
      setRightArmFat("");
      setLeftLegFat("");
      setRightLegFat("");
      setFatControl("");
      setLeftArmMuscFatRatio("");
      setRightArmMuscFatRatio("");
      setLeftLegMuscFatRatio("");
      setRightLegMuscFatRatio("");
      setTrunkMuscFatRatio("");
      setMuscleControl("");
      setLeftArmMuscle("");
      setRightArmMuscle("");
      setLeftLegMuscle("");
      setRightLegMuscle("");
      setTrunkMuscle("");
      setUpperLowerBalance("");
      setTrunkLimbBalance("");
      setIntracellularWater("");
      setExtracellularWater("");
      setWaterBalance("");
      setProteinMass("");
      setProteinPercent("");
      setBoneMass("");
      setMineral("");
      setBodyCellMass("");
      setHeartRate("");
      setBmr("");
      setRecommendedCalories("");
      setIdealWeight("");
      setWeightControl("");
      setFatFreeMass("");
      setResistance5khz("");
      setResistance50khz("");
      setResistance250khz("");
      setReactance5khz("");
      setReactance50khz("");
      setReactance250khz("");
      setPhaseAngle("");
    }
  }, [initialData, isOpen]);

  // Impedance States
  const [isImpedanceOpen, setIsImpedanceOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [resistance5khz, setResistance5khz] = useState("");
  const [resistance50khz, setResistance50khz] = useState("");
  const [resistance250khz, setResistance250khz] = useState("");
  const [reactance5khz, setReactance5khz] = useState("");
  const [reactance50khz, setReactance50khz] = useState("");
  const [reactance250khz, setReactance250khz] = useState("");
  const [phaseAngle, setPhaseAngle] = useState("");

  useEffect(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const heightInMeters = heightUnit === "cm" ? h / 100 : (h * 2.54) / 100;
      const computedBmi = w / (heightInMeters * heightInMeters);
      setBmi(computedBmi.toFixed(1));
    } else {
      setBmi("");
    }
  }, [height, weight, heightUnit]);

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
      waterPercent,
      healthScore,
      bodyAge,
      bodySymmetry,
      tScore,
      zScore,
      subcutaneousFatMass,
      subcutaneousFatPercent,
      visceralFatMass,
      visceralFatLevel,
      trunkFat,
      leftArmFat,
      rightArmFat,
      leftLegFat,
      rightLegFat,
      fatControl,
      leftArmMuscFatRatio,
      rightArmMuscFatRatio,
      leftLegMuscFatRatio,
      rightLegMuscFatRatio,
      trunkMuscFatRatio,
      muscleControl,
      leftArmMuscle,
      rightArmMuscle,
      leftLegMuscle,
      rightLegMuscle,
      trunkMuscle,
      upperLowerBalance,
      trunkLimbBalance,
      intracellularWater,
      extracellularWater,
      waterBalance,
      proteinMass,
      proteinPercent,
      boneMass,
      mineral,
      bodyCellMass,
      heartRate,
      bmr,
      recommendedCalories,
      idealWeight,
      weightControl,
      fatFreeMass,
      resistance_5khz: resistance5khz,
      resistance_50khz: resistance50khz,
      resistance_250khz: resistance250khz,
      reactance_5khz: reactance5khz,
      reactance_50khz: reactance50khz,
      reactance_250khz: reactance250khz,
      phase_angle: phaseAngle,
    });
  };


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await secureApi.post("/reception/measurements/parse-pdf/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const parsedData = response.data.data;
      const extractedFields: string[] = response.data.extracted_fields || [];
      const missingFields: string[] = response.data.missing_fields || [];

      // Map null-safe values to state — null from backend becomes "" in UI
      const safeStr = (val: any) => (val !== null && val !== undefined ? String(val) : "");

      // --- Core Body Composition ---
      if (parsedData.weight) setWeight(safeStr(parsedData.weight));
      setBmi(safeStr(parsedData.bmi_device));
      setFatMass(safeStr(parsedData.fat_mass));
      setFatPercent(safeStr(parsedData.fat_percentage));
      setMuscleMass(safeStr(parsedData.skeletal_muscle_mass));
      setMusclePercent(safeStr(parsedData.skeletal_muscle_percentage));
      setLeanMass(safeStr(parsedData.lean_mass));
      setLeanPercent(safeStr(parsedData.lean_mass_percentage));
      setTotalWater(safeStr(parsedData.total_water));
      setWaterPercent(safeStr(parsedData.water_percentage));
      setHealthScore(safeStr(parsedData.health_score));
      setBodyAge(safeStr(parsedData.body_age));
      setBodySymmetry(safeStr(parsedData.body_symmetry));
      setTScore(safeStr(parsedData.t_score));
      setZScore(safeStr(parsedData.z_score));

      // --- Segmental Fat Distribution ---
      setSubcutaneousFatMass(safeStr(parsedData.subcutaneous_fat_mass));
      setSubcutaneousFatPercent(safeStr(parsedData.subcutaneous_fat_percentage));
      setVisceralFatMass(safeStr(parsedData.visceral_fat_mass));
      setVisceralFatLevel(safeStr(parsedData.visceral_fat_level));
      setTrinkFat(safeStr(parsedData.trunk_fat_mass));
      setLeftArmFat(safeStr(parsedData.left_arm_fat_mass));
      setRightArmFat(safeStr(parsedData.right_arm_fat_mass));
      setLeftLegFat(safeStr(parsedData.left_leg_fat_mass));
      setRightLegFat(safeStr(parsedData.right_leg_fat_mass));
      setFatControl(safeStr(parsedData.fat_control));

      // --- Segmental Muscle Mass ---
      setMuscleControl(safeStr(parsedData.muscle_control));
      setLeftArmMuscle(safeStr(parsedData.left_arm_muscle_mass));
      setRightArmMuscle(safeStr(parsedData.right_arm_muscle_mass));
      setLeftLegMuscle(safeStr(parsedData.left_leg_muscle_mass));
      setRightLegMuscle(safeStr(parsedData.right_leg_muscle_mass));
      setTrunkMuscle(safeStr(parsedData.trunk_muscle_mass));

      // --- Body Water ---
      setIntracellularWater(safeStr(parsedData.intracellular_water));
      setExtracellularWater(safeStr(parsedData.extracellular_water));
      setWaterBalance(safeStr(parsedData.water_balance));

      // --- Body Elements ---
      setProteinMass(safeStr(parsedData.protein_mass));
      setProteinPercent(safeStr(parsedData.protein_percentage));
      setBoneMass(safeStr(parsedData.bone_mass));
      setMineral(safeStr(parsedData.mineral));
      setBodyCellMass(safeStr(parsedData.body_cell_mass));

      // --- Vital Signs ---
      setHeartRate(safeStr(parsedData.heart_rate));
      setBmr(safeStr(parsedData.bmr_kcal));
      setRecommendedCalories(safeStr(parsedData.recommended_calorie_intake));
      setIdealWeight(safeStr(parsedData.ideal_weight));
      setWeightControl(safeStr(parsedData.weight_control));
      setFatFreeMass(safeStr(parsedData.fat_free_mass));

      // --- Segmental Muscle to Fat Ratio & Balance ---
      setLeftArmMuscFatRatio(safeStr(parsedData.left_arm_muscle_to_fat_ratio));
      setRightArmMuscFatRatio(safeStr(parsedData.right_arm_muscle_to_fat_ratio));
      setLeftLegMuscFatRatio(safeStr(parsedData.left_leg_muscle_to_fat_ratio));
      setRightLegMuscFatRatio(safeStr(parsedData.right_leg_muscle_to_fat_ratio));
      setTrunkMuscFatRatio(safeStr(parsedData.trunk_muscle_to_fat_ratio));
      setUpperLowerBalance(safeStr(parsedData.upper_lower_muscle_balance));
      setTrunkLimbBalance(safeStr(parsedData.trunk_limb_muscle_balance));


      // --- Impedance (null for FITTR consumer reports) ---
      setResistance5khz(safeStr(parsedData.resistance_5khz));
      setResistance50khz(safeStr(parsedData.resistance_50khz));
      setResistance250khz(safeStr(parsedData.resistance_250khz));
      setReactance5khz(safeStr(parsedData.reactance_5khz));
      setReactance50khz(safeStr(parsedData.reactance_50khz));
      setReactance250khz(safeStr(parsedData.reactance_250khz));
      setPhaseAngle(safeStr(parsedData.phase_angle));

      // Show appropriate feedback
      if (missingFields.length === 0) {
        toast.success(`PDF parsed successfully. All ${extractedFields.length} fields extracted.`);
      } else if (extractedFields.length > 0) {
        toast.success(
          `PDF parsed: ${extractedFields.length} fields extracted. ${missingFields.length} fields not found — please fill them in manually.`
        );
      } else {
        toast.warning("PDF was read but no recognisable BIA data was found. Please fill in values manually.");
      }

      setIsImpedanceOpen(false);

      // Trigger parent save with the full parsed payload
      const uiData = {
        height: height,
        weight: parsedData.weight ? safeStr(parsedData.weight) : weight,
        waist: waist,
        hip: hip,
        bmi: safeStr(parsedData.bmi_device),
        fatMass: safeStr(parsedData.fat_mass),
        fatPercent: safeStr(parsedData.fat_percentage),
        muscleMass: safeStr(parsedData.skeletal_muscle_mass),
        musclePercent: safeStr(parsedData.skeletal_muscle_percentage),
        leanMass: safeStr(parsedData.lean_mass),
        leanPercent: safeStr(parsedData.lean_mass_percentage),
        totalWater: safeStr(parsedData.total_water),
        waterPercent: safeStr(parsedData.water_percentage),
        healthScore: safeStr(parsedData.health_score),
        bodyAge: safeStr(parsedData.body_age),
        bodySymmetry: safeStr(parsedData.body_symmetry),
        tScore: safeStr(parsedData.t_score),
        zScore: safeStr(parsedData.z_score),

        // Segmental fat
        subcutaneousFatMass: safeStr(parsedData.subcutaneous_fat_mass),
        subcutaneousFatPercent: safeStr(parsedData.subcutaneous_fat_percentage),
        visceralFatMass: safeStr(parsedData.visceral_fat_mass),
        visceralFatLevel: safeStr(parsedData.visceral_fat_level),
        trunkFat: safeStr(parsedData.trunk_fat_mass),
        leftArmFat: safeStr(parsedData.left_arm_fat_mass),
        rightArmFat: safeStr(parsedData.right_arm_fat_mass),
        leftLegFat: safeStr(parsedData.left_leg_fat_mass),
        rightLegFat: safeStr(parsedData.right_leg_fat_mass),
        fatControl: safeStr(parsedData.fat_control),

        // Segmental muscle & Ratios
        muscleControl: safeStr(parsedData.muscle_control),
        leftArmMuscle: safeStr(parsedData.left_arm_muscle_mass),
        rightArmMuscle: safeStr(parsedData.right_arm_muscle_mass),
        leftLegMuscle: safeStr(parsedData.left_leg_muscle_mass),
        rightLegMuscle: safeStr(parsedData.right_leg_muscle_mass),
        trunkMuscle: safeStr(parsedData.trunk_muscle_mass),
        leftArmMuscFatRatio: safeStr(parsedData.left_arm_muscle_to_fat_ratio),
        rightArmMuscFatRatio: safeStr(parsedData.right_arm_muscle_to_fat_ratio),
        leftLegMuscFatRatio: safeStr(parsedData.left_leg_muscle_to_fat_ratio),
        rightLegMuscFatRatio: safeStr(parsedData.right_leg_muscle_to_fat_ratio),
        trunkMuscFatRatio: safeStr(parsedData.trunk_muscle_to_fat_ratio),
        upperLowerBalance: safeStr(parsedData.upper_lower_muscle_balance),
        trunkLimbBalance: safeStr(parsedData.trunk_limb_muscle_balance),

        // Water & Elements
        intracellularWater: safeStr(parsedData.intracellular_water),
        extracellularWater: safeStr(parsedData.extracellular_water),
        waterBalance: safeStr(parsedData.water_balance),
        proteinMass: safeStr(parsedData.protein_mass),
        proteinPercent: safeStr(parsedData.protein_percentage),
        boneMass: safeStr(parsedData.bone_mass),
        mineral: safeStr(parsedData.mineral),
        bodyCellMass: safeStr(parsedData.body_cell_mass),

        // Vitals & Fitness goals
        heartRate: safeStr(parsedData.heart_rate),
        bmr: safeStr(parsedData.bmr_kcal),
        recommendedCalories: safeStr(parsedData.recommended_calorie_intake),
        idealWeight: safeStr(parsedData.ideal_weight),
        weightControl: safeStr(parsedData.weight_control),
        fatFreeMass: safeStr(parsedData.fat_free_mass),

        // Impedance
        resistance_5khz: safeStr(parsedData.resistance_5khz),
        resistance_50khz: safeStr(parsedData.resistance_50khz),
        resistance_250khz: safeStr(parsedData.resistance_250khz),
        reactance_5khz: safeStr(parsedData.reactance_5khz),
        reactance_50khz: safeStr(parsedData.reactance_50khz),
        reactance_250khz: safeStr(parsedData.reactance_250khz),
        phase_angle: safeStr(parsedData.phase_angle),
      };


      await onSave(uiData);
    } catch (err: any) {
      console.error("Failed to upload BIA report:", err);
      const detail = err.response?.data?.detail || "Failed to parse PDF report. Ensure it is a valid BIA PDF with selectable text (not a scanned image).";
      toast.error(detail);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveImpedance = async () => {
    try {
      const payload = {
        patient: appointment.patient_id || appointment.patient,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        waist_circumference: waist ? parseFloat(waist) : null,
        hip_circumference: hip ? parseFloat(hip) : null,
        resistance_5khz: resistance5khz ? parseFloat(resistance5khz) : null,
        resistance_50khz: resistance50khz ? parseFloat(resistance50khz) : null,
        resistance_250khz: resistance250khz ? parseFloat(resistance250khz) : null,
        reactance_5khz: reactance5khz ? parseFloat(reactance5khz) : null,
        reactance_50khz: reactance50khz ? parseFloat(reactance50khz) : null,
        reactance_250khz: reactance250khz ? parseFloat(reactance250khz) : null,
        phase_angle: phaseAngle ? parseFloat(phaseAngle) : null,
      };

      if (initialData?.id) {
        await secureApi.patch(`/reception/measurements/${initialData.id}/`, payload);
      } else {
        await secureApi.post(`/reception/measurements/`, payload);
      }
      
      toast.success("Impedance data saved successfully.");
      setIsImpedanceOpen(false);
      onSave(payload);
    } catch (err) {
      console.error("Failed to save impedance:", err);
      toast.error("Failed to save impedance data.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ruler className="size-5 text-teal-650" /> Measurements & BIA
            </h3>
            <p className="text-xs text-slate-650 font-mono mt-1">
              Patient: {appointment.patient_name || appointment.patientName || "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-650 hover:text-slate-900 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Top Section Grid (1 col mobile, 3 cols desktop) */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-1 uppercase tracking-wider text-xs">
              Anthropometrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Height with unit toggle */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700">Height</label>
                  <div className="flex bg-white rounded p-0.5 text-xs font-semibold border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setHeightUnit("cm")}
                      className={`px-2 py-0.5 rounded-sm transition-all ${
                        heightUnit === "cm" ? "bg-teal-600 text-slate-900 shadow-sm" : "text-slate-650 hover:text-slate-900"
                      }`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeightUnit("in")}
                      className={`px-2 py-0.5 rounded-sm transition-all ${
                        heightUnit === "in" ? "bg-teal-600 text-slate-900 shadow-sm" : "text-slate-650 hover:text-slate-900"
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
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent  h-11"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent  h-11"
                />
              </div>

              {/* Waist & Hip */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Waist"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent  h-11"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Hip (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Hip"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent  h-11"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* BIA Section Tabs */}
          <div>
            <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-1">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-xs">
                Bioelectrical Impedance Analysis (BIA)
              </h4>
              <button
                type="button"
                onClick={() => setIsImpedanceOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-700 rounded hover:bg-teal-100 transition-colors"
              >
                + Add Impedance Data
              </button>
            </div>
            <Tabs defaultValue="overall" className="w-full">
              <TabsList className="bg-white w-full justify-start p-1 h-auto flex flex-wrap gap-1 border border-slate-200 rounded-xl">
                <TabsTrigger value="overall" className="text-xs py-2 px-3">Overall</TabsTrigger>
                <TabsTrigger value="fat_distrib" className="text-xs py-2 px-3">Fat Distrib.</TabsTrigger>
                <TabsTrigger value="muscle" className="text-xs py-2 px-3">Muscle</TabsTrigger>
                <TabsTrigger value="water_elements" className="text-xs py-2 px-3">Water & Elements</TabsTrigger>
                <TabsTrigger value="vital_signs" className="text-xs py-2 px-3">Vital Signs</TabsTrigger>
              </TabsList>

              <TabsContent value="overall" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">BMI (device)</label>
                    <input
                      type="number"
                      step="any"
                      value={bmi}
                      onChange={(e) => setBmi(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Fat Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={fatMass}
                      onChange={(e) => setFatMass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Fat Percentage (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={fatPercent}
                      onChange={(e) => setFatPercent(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Skeletal Muscle Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={muscleMass}
                      onChange={(e) => setMuscleMass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Skeletal Muscle % (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={musclePercent}
                      onChange={(e) => setMusclePercent(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Lean Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={leanMass}
                      onChange={(e) => setLeanMass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Lean Mass % (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={leanPercent}
                      onChange={(e) => setLeanPercent(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Total Water (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={totalWater}
                      onChange={(e) => setTotalWater(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Water % (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={waterPercent}
                      onChange={(e) => setWaterPercent(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Health Score</label>
                    <input
                      type="number"
                      value={healthScore}
                      onChange={(e) => setHealthScore(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Body Age (years)</label>
                    <input
                      type="number"
                      value={bodyAge}
                      onChange={(e) => setBodyAge(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Body Symmetry</label>
                    <input
                      type="text"
                      value={bodySymmetry}
                      onChange={(e) => setBodySymmetry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">T-Score</label>
                    <input
                      type="number"
                      step="any"
                      value={tScore}
                      onChange={(e) => setTScore(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Z-Score</label>
                    <input
                      type="number"
                      step="any"
                      value={zScore}
                      onChange={(e) => setZScore(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fat_distrib" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Subcutaneous Fat Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={subcutaneousFatMass}
                      onChange={(e) => setSubcutaneousFatMass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Subcutaneous Fat (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={subcutaneousFatPercent}
                      onChange={(e) => setSubcutaneousFatPercent(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Visceral Fat Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={visceralFatMass}
                      onChange={(e) => setVisceralFatMass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Visceral Fat Level</label>
                    <input
                      type="number"
                      step="any"
                      value={visceralFatLevel}
                      onChange={(e) => setVisceralFatLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Trunk Fat Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={trunkFat}
                      onChange={(e) => setTrinkFat(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Fat Control (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={fatControl}
                      onChange={(e) => setFatControl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Left Arm Fat Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={leftArmFat}
                      onChange={(e) => setLeftArmFat(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Right Arm Fat Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={rightArmFat}
                      onChange={(e) => setRightArmFat(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Left Leg Fat Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={leftLegFat}
                      onChange={(e) => setLeftLegFat(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Right Leg Fat Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={rightLegFat}
                      onChange={(e) => setRightLegFat(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Left Arm Musc:Fat Ratio</label>
                    <input
                      type="number"
                      step="any"
                      value={leftArmMuscFatRatio}
                      onChange={(e) => setLeftArmMuscFatRatio(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Right Arm Musc:Fat Ratio</label>
                    <input
                      type="number"
                      step="any"
                      value={rightArmMuscFatRatio}
                      onChange={(e) => setRightArmMuscFatRatio(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Left Leg Musc:Fat Ratio</label>
                    <input
                      type="number"
                      step="any"
                      value={leftLegMuscFatRatio}
                      onChange={(e) => setLeftLegMuscFatRatio(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Right Leg Musc:Fat Ratio</label>
                    <input
                      type="number"
                      step="any"
                      value={rightLegMuscFatRatio}
                      onChange={(e) => setRightLegMuscFatRatio(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Trunk Musc:Fat Ratio</label>
                    <input
                      type="number"
                      step="any"
                      value={trunkMuscFatRatio}
                      onChange={(e) => setTrunkMuscFatRatio(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="muscle" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Muscle Control (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={muscleControl}
                      onChange={(e) => setMuscleControl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Left Arm Muscle Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={leftArmMuscle}
                      onChange={(e) => setLeftArmMuscle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Right Arm Muscle Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={rightArmMuscle}
                      onChange={(e) => setRightArmMuscle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Left Leg Muscle Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={leftLegMuscle}
                      onChange={(e) => setLeftLegMuscle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Right Leg Muscle Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={rightLegMuscle}
                      onChange={(e) => setRightLegMuscle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Trunk Muscle Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={trunkMuscle}
                      onChange={(e) => setTrunkMuscle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Upper/Lower Balance</label>
                    <input
                      type="text"
                      value={upperLowerBalance}
                      onChange={(e) => setUpperLowerBalance(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Trunk/Limb Balance</label>
                    <input
                      type="text"
                      value={trunkLimbBalance}
                      onChange={(e) => setTrunkLimbBalance(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="water_elements" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Intracellular Water (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={intracellularWater}
                      onChange={(e) => setIntracellularWater(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Extracellular Water (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={extracellularWater}
                      onChange={(e) => setExtracellularWater(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Water Balance</label>
                    <input
                      type="text"
                      value={waterBalance}
                      onChange={(e) => setWaterBalance(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Protein Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={proteinMass}
                      onChange={(e) => setProteinMass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Protein % (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={proteinPercent}
                      onChange={(e) => setProteinPercent(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Bone Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={boneMass}
                      onChange={(e) => setBoneMass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Mineral (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={mineral}
                      onChange={(e) => setMineral(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Body Cell Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={bodyCellMass}
                      onChange={(e) => setBodyCellMass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vital_signs" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">BMR (kcal/day)</label>
                    <input
                      type="number"
                      step="any"
                      value={bmr}
                      onChange={(e) => setBmr(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Recommended Calories (kcal)</label>
                    <input
                      type="number"
                      value={recommendedCalories}
                      onChange={(e) => setRecommendedCalories(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Fat-Free Mass (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={fatFreeMass}
                      onChange={(e) => setFatFreeMass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Ideal Weight (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={idealWeight}
                      onChange={(e) => setIdealWeight(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Weight Control (kg)</label>
                    <input
                      type="number"
                      step="any"
                      value={weightControl}
                      onChange={(e) => setWeightControl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent "
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white transition-all shadow-md"
            >
              Save Measurements
            </button>
          </div>

        </form>
 
      </div>
      {isImpedanceOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900 animate-scaleIn animate-duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Raw Impedance Data</h3>
              <button
                type="button"
                onClick={() => setIsImpedanceOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Upload Zone */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="size-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
                  <p className="text-sm font-semibold text-slate-700">Uploading and parsing BIA report...</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept="application/pdf" 
                    onChange={handleFileUpload} 
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <span className="text-sm font-medium text-slate-650">Click to upload or drag & drop</span>
                    <span className="block text-xs text-slate-400 mt-1">PDF reports only</span>
                  </label>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsImpedanceOpen(false)}
                className="px-5 py-2.5 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
