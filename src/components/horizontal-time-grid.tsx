import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, FileText } from "lucide-react";

interface Appointment {
  id: string;
  patientId?: string;
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
  onAppointmentClick?: (apt: Appointment) => void;
}

export function HorizontalTimeGrid({
  appointments,
  doctors,
  selectedDate,
  onDateChange,
  onAppointmentClick,
}: HorizontalTimeGridProps) {
  // Operational hours: 09:00 to 17:00 (5:00 PM)
  const START_HOUR = 9;
  const END_HOUR = 17;
  const INTERVAL_MINUTES = 15;
  const SLOT_HEIGHT = 44; // Fine-tuned vertical spacing per 15-min slot

  // Generate 15-minute time slots
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      for (let min = 0; min < 60; min += INTERVAL_MINUTES) {
        slots.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Convert "HH:MM" to total minutes from START_HOUR
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h - START_HOUR) * 60 + m;
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

  const activeDoctors = doctors.length > 0 ? doctors : ["Dr. Riya Iyer"];

  return (
    <Card className="w-full overflow-hidden shadow-elegant border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">Vertical 15-Min Scheduler Grid</CardTitle>
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
      <CardContent className="p-0">
        {/* Header Row: Doctors */}
        <div
          className="grid bg-muted/40 border-b text-xs text-muted-foreground font-semibold text-center items-center divide-x"
          style={{
            gridTemplateColumns: `80px repeat(${activeDoctors.length}, 1fr)`,
          }}
        >
          <div className="p-3 font-medium text-left pl-4">Time</div>
          {activeDoctors.map((doc) => (
            <div key={doc} className="p-3 truncate text-foreground font-bold">
              {doc}
            </div>
          ))}
        </div>

        {/* Time Tracks & Doctor Columns Layout */}
        <div className="max-h-[600px] overflow-y-auto relative">
          <div
            className="grid divide-x"
            style={{
              gridTemplateColumns: `80px repeat(${activeDoctors.length}, 1fr)`,
              height: `${timeSlots.length * SLOT_HEIGHT}px`,
            }}
          >
            {/* Left Column: Time Slot Labels */}
            <div className="relative border-r bg-muted/10">
              {timeSlots.map((slot, i) => (
                <div
                  key={slot}
                  className="absolute left-0 right-0 border-b flex items-center justify-center text-[10px] font-mono text-muted-foreground/80"
                  style={{
                    top: `${i * SLOT_HEIGHT}px`,
                    height: `${SLOT_HEIGHT}px`,
                  }}
                >
                  {slot}
                </div>
              ))}
            </div>

            {/* Doctor Column Tracks */}
            {activeDoctors.map((doc) => {
              // Filter appointments matching current doctor & selected date
              const docAppointments = appointments.filter(
                (a) => a.doctorName === doc && a.date === selectedDate
              );

              return (
                <div
                  key={doc}
                  className="relative h-full bg-slate-50/10 dark:bg-slate-900/10"
                >
                  {/* Grid background lines */}
                  {timeSlots.map((_, i) => (
                    <div
                      key={`line-${i}`}
                      className="absolute left-0 right-0 border-b border-dashed border-muted-foreground/10"
                      style={{
                        top: `${i * SLOT_HEIGHT}px`,
                        height: `${SLOT_HEIGHT}px`,
                      }}
                    />
                  ))}

                  {/* Absolute Appointment Blocks */}
                  {docAppointments.map((apt) => {
                    const startMin = timeToMinutes(apt.startTime);
                    const endMin = timeToMinutes(apt.endTime);
                    
                    const startPercent = (startMin / 15) * SLOT_HEIGHT;
                    const durationHeight = ((endMin - startMin) / 15) * SLOT_HEIGHT;

                    return (
                      <div
                        key={apt.id}
                        onClick={() => onAppointmentClick?.(apt)}
                        className="absolute left-1.5 right-1.5 rounded border shadow-sm p-1.5 flex flex-col justify-between overflow-hidden group transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
                        style={{
                          top: `${startPercent}px`,
                          height: `${Math.max(SLOT_HEIGHT, durationHeight) - 2}px`,
                          background:
                            apt.status === "CONFIRMED"
                              ? "linear-gradient(to bottom, rgba(16, 185, 129, 0.18), rgba(16, 185, 129, 0.08))"
                              : "linear-gradient(to bottom, rgba(245, 158, 11, 0.18), rgba(245, 158, 11, 0.08))",
                          borderColor:
                            apt.status === "CONFIRMED"
                              ? "rgba(16, 185, 129, 0.4)"
                              : "rgba(245, 158, 11, 0.4)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-1 leading-tight">
                          <span className="text-[10px] font-bold text-foreground truncate flex items-center gap-0.5">
                            <User className="size-2.5 text-muted-foreground shrink-0" /> {apt.patientName}
                          </span>
                          <Badge
                            className={`text-[8px] h-3.5 px-0.5 font-normal rounded-sm shrink-0 scale-90 ${
                              apt.status === "CONFIRMED"
                                ? "bg-success/20 text-success hover:bg-success/20"
                                : "bg-warning/20 text-warning hover:bg-warning/20"
                            }`}
                          >
                            {apt.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-[8px] font-mono text-muted-foreground mt-0.5">
                          <span>{apt.startTime} - {apt.endTime}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-teal-500 font-sans">
                            <FileText className="size-2" /> Paste Lab Doc
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
