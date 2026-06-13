export const kpis = [
  { label: "Active Patients", value: "1.24M", delta: "+8.2%", tone: "primary" },
  { label: "Consultations Today", value: "18,432", delta: "+12.4%", tone: "info" },
  { label: "AI Scribe Hours Saved", value: "9,210h", delta: "+22.1%", tone: "success" },
  { label: "Revenue (MTD)", value: "₹42.8 Cr", delta: "+6.7%", tone: "warning" },
];

export const visitsTrend = [
  { day: "Mon", visits: 12400, tele: 3200 },
  { day: "Tue", visits: 13980, tele: 3600 },
  { day: "Wed", visits: 15100, tele: 4100 },
  { day: "Thu", visits: 14210, tele: 3850 },
  { day: "Fri", visits: 16780, tele: 4520 },
  { day: "Sat", visits: 19230, tele: 5210 },
  { day: "Sun", visits: 11200, tele: 2900 },
];

export const revenueSplit = [
  { name: "Consultations", value: 38 },
  { name: "Pharmacy", value: 24 },
  { name: "Labs", value: 19 },
  { name: "Procedures", value: 12 },
  { name: "Subscriptions", value: 7 },
];

export const todayAppointments = [
  { time: "09:00", patient: "Aarav Mehta", type: "In-clinic", status: "Checked-in", reason: "Follow-up • Hypertension" },
  { time: "09:30", patient: "Sara Khan", type: "Tele", status: "Waiting", reason: "Thyroid review" },
  { time: "10:00", patient: "Vikram Rao", type: "In-clinic", status: "In-room", reason: "Diabetes Type 2" },
  { time: "10:30", patient: "Neha Sharma", type: "Tele", status: "Upcoming", reason: "Pediatric • Fever" },
  { time: "11:00", patient: "Rohit Iyer", type: "In-clinic", status: "Upcoming", reason: "Orthopedic review" },
  { time: "11:30", patient: "Priya Das", type: "Tele", status: "Upcoming", reason: "Dermatology" },
];

export const queue = [
  { token: "A-021", patient: "Aarav Mehta", doctor: "Dr. Iyer", wait: "4 min", status: "In-room" },
  { token: "A-022", patient: "Sara Khan", doctor: "Dr. Patel", wait: "8 min", status: "Vitals" },
  { token: "A-023", patient: "Vikram Rao", doctor: "Dr. Iyer", wait: "12 min", status: "Waiting" },
  { token: "A-024", patient: "Neha Sharma", doctor: "Dr. Rao", wait: "15 min", status: "Waiting" },
  { token: "A-025", patient: "Rohit Iyer", doctor: "Dr. Patel", wait: "19 min", status: "Waiting" },
];

export const aiAgents = [
  { name: "AI Receptionist", calls: 12480, resolved: "94%", lang: "12 langs" },
  { name: "AI Medical Scribe", calls: 8420, resolved: "98%", lang: "SOAP + ICD-10" },
  { name: "AI Care Coordinator", calls: 6210, resolved: "89%", lang: "WhatsApp" },
  { name: "AI Report Analyzer", calls: 3120, resolved: "96%", lang: "Lab + Imaging" },
  { name: "AI Clinical Copilot", calls: 5340, resolved: "92%", lang: "Dx + Rx" },
  { name: "AI Risk Engine", calls: 920, resolved: "—", lang: "ML models" },
];

export const inventory = [
  { sku: "MED-00231", name: "Metformin 500mg", batch: "B23A91", expiry: "Mar 2026", stock: 1240, status: "OK" },
  { sku: "MED-00118", name: "Atorvastatin 10mg", batch: "B22F12", expiry: "Aug 2025", stock: 320, status: "Low" },
  { sku: "MED-00422", name: "Amoxicillin 500mg", batch: "B24C03", expiry: "Jan 2027", stock: 980, status: "OK" },
  { sku: "MED-00091", name: "Insulin Glargine", batch: "B23H07", expiry: "Nov 2025", stock: 64, status: "Critical" },
  { sku: "MED-00765", name: "Paracetamol 650mg", batch: "B24B22", expiry: "Jul 2026", stock: 2480, status: "OK" },
];

export const labOrders = [
  { id: "LAB-9821", patient: "Aarav Mehta", panel: "Lipid + HbA1c", collected: "08:42", status: "Processing" },
  { id: "LAB-9822", patient: "Sara Khan", panel: "TSH, T3, T4", collected: "08:55", status: "Ready" },
  { id: "LAB-9823", patient: "Vikram Rao", panel: "CBC, CRP", collected: "09:10", status: "Pending" },
  { id: "LAB-9824", patient: "Neha Sharma", panel: "Dengue NS1", collected: "09:25", status: "Processing" },
];

export const clinics = [
  { name: "Apollo — Bandra", city: "Mumbai", doctors: 42, visits: 412, util: 86 },
  { name: "Fortis — Indiranagar", city: "Bengaluru", doctors: 38, visits: 388, util: 82 },
  { name: "Manipal — Gachibowli", city: "Hyderabad", doctors: 29, visits: 296, util: 74 },
  { name: "Max — Saket", city: "Delhi NCR", doctors: 51, visits: 502, util: 91 },
  { name: "AIIMS — Anna Nagar", city: "Chennai", doctors: 33, visits: 318, util: 78 },
];

export const risks = [
  { patient: "Mr. Sharma, 62", risk: "Readmission", score: 0.82, signal: "CHF • 3 admits in 90d" },
  { patient: "Ms. Khan, 54", risk: "Hospitalization", score: 0.71, signal: "Uncontrolled HbA1c 9.4" },
  { patient: "Mr. Rao, 47", risk: "Medication non-adherence", score: 0.66, signal: "Refill gap 21 days" },
  { patient: "Mrs. Das, 71", risk: "Fall risk", score: 0.59, signal: "Polypharmacy + vertigo" },
];
