import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Layers, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BookAppointmentModal } from "./book-appointment-modal";

interface Appointment {
  id: string | number;
  patientName: string;
  departmentName: string;
  startTime: string; // e.g. "09:15", "10:30"
  status: string;
}

interface DepartmentCalendarProps {
  appointments: Appointment[];
  departments: string[];
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  onAppointmentClick?: (id: string | number) => void;
}

interface CustomDatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

function CustomDatePicker({ selectedDate, onChange }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July

  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      if (parts.length === 3) {
        setCurrentYear(parts[0]);
        setCurrentMonth(parts[1] - 1);
      }
    }
  }, [selectedDate]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDays = () => {
    const days = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    // trailing prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevTotalDays - i,
        isCurrentMonth: false,
        dateString: `${currentMonth === 0 ? currentYear - 1 : currentYear}-${String(currentMonth === 0 ? 12 : currentMonth).padStart(2, '0')}-${String(prevTotalDays - i).padStart(2, '0')}`
      });
    }

    // current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        dateString: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    // next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        dateString: `${currentMonth === 11 ? currentYear + 1 : currentYear}-${String(currentMonth === 11 ? 1 : currentMonth + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    return days;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select Date";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
  };

  const daysGrid = getDays();

  return (
    <div className="relative z-45">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer shadow-sm hover:border-slate-300 transition-colors h-10 select-none"
      >
        <span className="font-mono text-sm tracking-wider">{formatDisplayDate(selectedDate)}</span>
        <CalendarIcon className="size-4 text-slate-500" />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-slate-800 z-50 select-none">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="font-bold text-sm text-slate-900">{monthNames[currentMonth]}, {currentYear}</span>
              <span className="text-[10px] text-slate-500">▼</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-600 font-bold text-base w-6 h-6 flex items-center justify-center border border-slate-200"
              >
                ↑
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-600 font-bold text-base w-6 h-6 flex items-center justify-center border border-slate-200"
              >
                ↓
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-600 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {daysGrid.map((d, idx) => {
              const isSelected = selectedDate === d.dateString;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(d.dateString);
                    setIsOpen(false);
                  }}
                  className={`w-9 h-9 cursor-pointer flex items-center justify-center font-semibold text-xs transition-all ${
                    !d.isCurrentMonth
                      ? "text-slate-400 hover:bg-slate-50"
                      : isSelected
                        ? "border-2 border-black bg-slate-500 text-white font-bold shadow-sm"
                        : "text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {d.day}
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center border-t border-slate-100 mt-4 pt-3 text-xs">
            <button 
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="text-blue-600 hover:underline font-bold text-xs"
            >
              Clear
            </button>
            <button 
              onClick={() => {
                const todayStr = new Date().toISOString().slice(0, 10);
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-blue-600 hover:underline font-bold text-xs"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DepartmentCalendar({
  appointments,
  departments = ["General Medicine", "Cardiology", "Pediatrics", "Endocrinology"],
  selectedDate = new Date().toISOString().slice(0, 10),
  onDateChange,
  onAppointmentClick,
}: DepartmentCalendarProps) {
  const [enabledDepartments, setEnabledDepartments] = useState<string[]>([
    'General Medicine', 'Cardiology', 'Pediatrics', 'Endocrinology'
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [popoverAnchor, setPopoverAnchor] = useState<{ time: string; columnId: string } | null>(null);
  const [quickStart, setQuickStart] = useState<string>('');
  const [quickEnd, setQuickEnd] = useState<string>('');

  const handleTimeSlotClick = (time: string, dept: string) => {
    setSelectedTime(time);
    setSelectedDept(dept);
    setIsModalOpen(true);
  };
  
  // Define time slots from 09:30 AM to 06:00 PM at 15-minute intervals
  const timeSlots = [
    '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15',
    '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45',
    '17:00', '17:15', '17:30', '17:45', '18:00'
  ];

  // Calculate CSS grid column index for a department name
  const getColIndex = (deptName: string) => {
    const cleanName = deptName?.trim()?.toLowerCase() || "";
    const idx = enabledDepartments.findIndex(d => d.trim().toLowerCase() === cleanName);
    return idx !== -1 ? idx : 0;
  };

  // Calculate CSS grid row index for a time string (e.g. "09:30" -> row index 1)
  const getRowIndex = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    const startMins = 9 * 60 + 30; // starts at 09:30
    const currentMins = h * 60 + m;
    const diff = currentMins - startMins;
    if (diff < 0) return 0;
    return Math.floor(diff / 15);
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-elegant bg-white dark:bg-slate-950 w-full overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="size-4 text-primary" /> Clinic Department Scheduler
            </CardTitle>
            <CardDescription className="text-xs">
              Live department scheduler grid showing intersecting 15-minute time slots.
            </CardDescription>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1 min-w-[220px]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                Filter view
              </label>
              <div className="relative group">
                <select
                  value={enabledDepartments.length === 1 ? enabledDepartments[0] : 'ALL'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEnabledDepartments(val === 'ALL' ? ['General Medicine', 'Cardiology', 'Pediatrics', 'Endocrinology'] : [val]);
                  }}
                  className="w-full bg-slate-50 text-slate-700 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-sm font-semibold tracking-tight outline-none shadow-sm transition-all duration-200 hover:bg-white hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer appearance-none"
                >
                  <option value="ALL">All Clinic Departments</option>
                  <option value="General Medicine">🩺 General Medicine</option>
                  <option value="Cardiology">❤️ Cardiology</option>
                  <option value="Pediatrics">👶 Pediatrics</option>
                  <option value="Endocrinology">🩸 Endocrinology</option>
                </select>
                
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition-colors group-hover:text-indigo-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <CustomDatePicker 
              selectedDate={selectedDate} 
              onChange={(date) => onDateChange?.(date)} 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[800px] bg-white dark:bg-slate-950">
          
          {/* Calendar Grid Container */}
          <div 
            className="grid"
            style={{
              gridTemplateColumns: `100px repeat(${enabledDepartments.length}, 1fr)`,
              gridTemplateRows: `40px repeat(${timeSlots.length}, 50px)`,
            }}
          >
            {/* Top-Left Corner Cell */}
            <div className="border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
              Time \ Dept
            </div>

            {/* Department X-Axis Headers */}
            {enabledDepartments.map((dept, colIdx) => (
              <div 
                key={dept} 
                className="border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-200 text-center px-2"
                style={{ gridColumn: colIdx + 2, gridRow: 1 }}
              >
                <Layers className="size-3 mr-1.5 text-primary" /> {dept}
              </div>
            ))}

            {/* Time Y-Axis Rows */}
            {timeSlots.map((time, rowIdx) => (
              <div 
                key={time} 
                className="border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-center font-mono text-[10px] font-semibold text-slate-500"
                style={{ gridColumn: 1, gridRow: rowIdx + 2 }}
              >
                <Clock className="size-3 mr-1 text-slate-500" /> {time}
              </div>
            ))}

            {/* Inactive intersection cells for background grid styling */}
            {timeSlots.map((time, rowIdx) => 
              enabledDepartments.map((dept, colIdx) => (
                <div 
                  key={`${rowIdx}-${colIdx}`} 
                  onClick={() => handleTimeSlotClick(time, dept)}
                  className="border-b border-r border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-blue-50/30 transition-colors bg-white dark:bg-slate-950"
                  style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 2 }}
                />
              ))
            )}

            {/* Appointments Rendering Layer */}
            {appointments.map((appt) => {
              const colIdx = enabledDepartments.findIndex(d => d.trim().toLowerCase() === appt.departmentName?.trim()?.toLowerCase());
              if (colIdx === -1) return null;
              const col = colIdx + 2;
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
                    onClick={() => onAppointmentClick?.(appt.id)}
                    className={`h-full w-full rounded p-1.5 flex flex-col justify-between border shadow-sm transition-all hover:scale-[1.02] cursor-pointer ${
                      appt.status === "CONFIRMED" || appt.status === "BOOKED"
                        ? "bg-success/15 border-success/30 text-success-foreground"
                        : appt.status === "CHECKED_IN"
                          ? "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400"
                          : appt.status === "CHECKED_OUT"
                            ? "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400"
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
                        {appt.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </CardContent>
      {isModalOpen && (
        <BookAppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialTime={selectedTime}
          initialDepartment={selectedDept}
          selectedScheduleDate={selectedDate}
          onSuccess={() => {
            setIsModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </Card>
  );
}
