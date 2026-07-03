import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Layers } from "lucide-react";

interface Appointment {
  id: string | number;
  patientName: string;
  departmentName: string;
  startTime: string; // e.g. "09:15", "10:30"
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
}

interface DepartmentCalendarProps {
  appointments: Appointment[];
  departments: string[];
  selectedDate?: string;
}

export function DepartmentCalendar({
  appointments,
  departments = ["General Medicine", "Cardiology", "Pediatrics", "Endocrinology"],
  selectedDate = new Date().toISOString().slice(0, 10),
}: DepartmentCalendarProps) {
  
  // Define time slots from 09:00 to 14:00 at 15-minute intervals
  const timeSlots = useMemo(() => {
    const slots = [];
    let h = 9;
    let m = 0;
    while (h < 14) {
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push(timeStr);
      m += 15;
      if (m >= 60) {
        h += 1;
        m = 0;
      }
    }
    return slots;
  }, []);

  // Calculate CSS grid column index for a department name
  const getColIndex = (deptName: string) => {
    const cleanName = deptName?.trim()?.toLowerCase() || "";
    const idx = departments.findIndex(d => d.trim().toLowerCase() === cleanName);
    return idx !== -1 ? idx : 0;
  };

  // Calculate CSS grid row index for a time string (e.g. "09:15" -> row index 1)
  const getRowIndex = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    const startMins = 9 * 60; // starts at 09:00
    const currentMins = h * 60 + m;
    const diff = currentMins - startMins;
    if (diff < 0) return 0;
    return Math.floor(diff / 15);
  };

  return (
    <Card className="border shadow-elegant bg-card w-full overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="size-4 text-primary" /> Clinic Department Scheduler
            </CardTitle>
            <CardDescription className="text-xs">
              Live department scheduler grid showing intersecting 15-minute time slots.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {selectedDate}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[800px] bg-slate-950/20 dark:bg-slate-900/10">
          
          {/* Calendar Grid Container */}
          <div 
            className="grid"
            style={{
              gridTemplateColumns: `100px repeat(${departments.length}, 1fr)`,
              gridTemplateRows: `40px repeat(${timeSlots.length}, 50px)`,
            }}
          >
            {/* Top-Left Corner Cell */}
            <div className="border-b border-r bg-muted/40 flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
              Time \ Dept
            </div>

            {/* Department X-Axis Headers */}
            {departments.map((dept, colIdx) => (
              <div 
                key={dept} 
                className="border-b border-r bg-muted/30 flex items-center justify-center font-bold text-xs text-foreground text-center px-2"
                style={{ gridColumn: colIdx + 2, gridRow: 1 }}
              >
                <Layers className="size-3 mr-1.5 text-primary" /> {dept}
              </div>
            ))}

            {/* Time Y-Axis Rows */}
            {timeSlots.map((time, rowIdx) => (
              <div 
                key={time} 
                className="border-b border-r bg-muted/10 flex items-center justify-center font-mono text-[10px] font-semibold text-muted-foreground"
                style={{ gridColumn: 1, gridRow: rowIdx + 2 }}
              >
                <Clock className="size-3 mr-1 text-slate-500" /> {time}
              </div>
            ))}

            {/* Inactive intersection cells for background grid styling */}
            {timeSlots.map((time, rowIdx) => 
              departments.map((dept, colIdx) => (
                <div 
                  key={`${rowIdx}-${colIdx}`} 
                  className="border-b border-r border-slate-800/10"
                  style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 2 }}
                />
              ))
            )}

            {/* Appointments Rendering Layer */}
            {appointments.map((appt) => {
              const col = getColIndex(appt.departmentName) + 2;
              const row = getRowIndex(appt.startTime) + 2;

              // Ensure appointment stays inside visible bounds
              if (row < 2 || row > timeSlots.length + 1) return null;

              return (
                <div
                  key={appt.id}
                  className="p-1"
                  style={{
                    gridColumn: col,
                    gridRow: row,
                    zIndex: 2,
                  }}
                >
                  <div 
                    className={`h-full w-full rounded p-1.5 flex flex-col justify-between border shadow-sm transition-all hover:scale-[1.02] cursor-pointer ${
                      appt.status === "CONFIRMED"
                        ? "bg-success/15 border-success/30 text-success-foreground"
                        : appt.status === "CANCELLED"
                          ? "bg-destructive/15 border-destructive/30 text-destructive-foreground"
                          : "bg-warning/15 border-warning/30 text-warning-foreground"
                    }`}
                  >
                    <div className="font-bold text-[10px] truncate leading-tight">
                      {appt.patientName}
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono leading-none">
                      <span>{appt.startTime}</span>
                      <Badge variant="outline" className="text-[8px] h-3 px-1 py-0 border-current bg-transparent uppercase">
                        {appt.status.slice(0, 4)}
                      </Badge>
                    </div>
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
