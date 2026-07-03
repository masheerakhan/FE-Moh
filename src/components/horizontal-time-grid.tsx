import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, User } from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  startTime: string; // e.g. "09:15"
  endTime: string;   // e.g. "10:00"
  date: string;      // e.g. "2026-07-03"
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
}

interface HorizontalTimeGridProps {
  appointments: Appointment[];
  doctors: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function HorizontalTimeGrid({
  appointments,
  doctors,
  selectedDate,
  onDateChange,
}: HorizontalTimeGridProps) {
  // Operational hours: 09:00 to 17:00 (5:00 PM)
  const START_HOUR = 9;
  const END_HOUR = 17;
  const INTERVAL_MINUTES = 15;

  // Generate 15-minute time slots
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      for (let min = 0; min < 60; min += INTERVAL_MINUTES) {
        const hStr = String(hour).padStart(2, "0");
        const mStr = String(min).padStart(2, "0");
        slots.push(`${hStr}:${mStr}`);
      }
    }
    // Add the final end slot (17:00)
    slots.push(`${String(END_HOUR).padStart(2, "0")}:00`);
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Convert "HH:MM" to slot index
  const timeToSlotIndex = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const totalMinutes = (h - START_HOUR) * 60 + m;
    const index = Math.floor(totalMinutes / INTERVAL_MINUTES);
    return Math.max(0, Math.min(index, timeSlots.length - 1));
  };

  // Navigate date
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  return (
    <Card className="w-full overflow-hidden shadow-elegant border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">Horizontal 15-Min Scheduler Grid</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="size-8" onClick={handlePrevDay}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-mono font-medium px-2">{selectedDate}</span>
          <Button variant="outline" size="icon" className="size-8" onClick={handleNextDay}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header Row: Time Slots */}
          <div className="grid grid-cols-[160px_1fr] bg-muted/40 border-b text-[11px] text-muted-foreground font-mono">
            <div className="p-3 border-r font-medium flex items-center gap-1.5 bg-muted/20">
              <Clock className="size-3.5" /> Doctor / Resource
            </div>
            <div className="relative h-12 flex">
              {timeSlots.map((slot, i) => (
                <div
                  key={slot}
                  className="absolute border-l h-full text-center flex flex-col justify-between pt-1 pb-1"
                  style={{
                    left: `${(i / (timeSlots.length - 1)) * 100}%`,
                    width: `${100 / (timeSlots.length - 1)}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <span className="font-semibold text-[10px]">{slot}</span>
                  <div className="h-2 w-px bg-muted-foreground/30 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Grid Rows: Doctors */}
          <div className="divide-y">
            {doctors.map((doctor) => {
              // Filter appointments for this doctor on selected date
              const docAppointments = appointments.filter(
                (a) => a.doctorName === doctor && a.date === selectedDate
              );

              return (
                <div key={doctor} className="grid grid-cols-[160px_1fr] min-h-[76px] items-stretch">
                  {/* Doctor Title Column */}
                  <div className="p-4 border-r flex flex-col justify-center bg-card font-medium text-xs">
                    <span className="text-foreground font-semibold">{doctor}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">15-Min Slots Available</span>
                  </div>

                  {/* Horizontal Time Slots Track */}
                  <div className="relative h-full bg-slate-50/40 dark:bg-slate-900/10 flex items-center">
                    {/* Vertical grid line guides */}
                    {timeSlots.map((_, i) => (
                      <div
                        key={`line-${i}`}
                        className="absolute top-0 bottom-0 border-l border-dashed border-muted-foreground/10"
                        style={{
                          left: `${(i / (timeSlots.length - 1)) * 100}%`,
                        }}
                      />
                    ))}

                    {/* Stretched Horizontal Appointment Blocks */}
                    {docAppointments.map((apt) => {
                      const startIdx = timeToSlotIndex(apt.startTime);
                      const endIdx = timeToSlotIndex(apt.endTime);
                      
                      const leftPercent = (startIdx / (timeSlots.length - 1)) * 100;
                      const widthPercent = ((endIdx - startIdx) / (timeSlots.length - 1)) * 100;

                      return (
                        <div
                          key={apt.id}
                          className="absolute h-[46px] rounded-lg border shadow-sm p-2 flex flex-col justify-between overflow-hidden group transition-all hover:scale-[1.01] cursor-pointer"
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            background:
                              apt.status === "CONFIRMED"
                                ? "linear-gradient(to right, var(--success-15, rgba(16, 185, 129, 0.15)), var(--success-5, rgba(16, 185, 129, 0.05)))"
                                : "linear-gradient(to right, var(--warning-15, rgba(245, 158, 11, 0.15)), var(--warning-5, rgba(245, 158, 11, 0.05)))",
                            borderColor:
                              apt.status === "CONFIRMED"
                                ? "rgba(16, 185, 129, 0.3)"
                                : "rgba(245, 158, 11, 0.3)",
                          }}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-semibold text-foreground truncate flex items-center gap-1">
                              <User className="size-3 text-muted-foreground" /> {apt.patientName}
                            </span>
                            <Badge
                              className={`text-[8px] h-4 px-1 rounded-sm ${
                                apt.status === "CONFIRMED"
                                  ? "bg-success/15 text-success hover:bg-success/15"
                                  : "bg-warning/15 text-warning hover:bg-warning/15"
                              }`}
                            >
                              {apt.status}
                            </Badge>
                          </div>
                          <div className="text-[9px] font-mono text-muted-foreground flex justify-between">
                            <span>{apt.startTime} - {apt.endTime}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">18% GST</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
