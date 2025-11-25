export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  status: "Active" | "On Leave" | "Terminated";
}

export interface TimeEntry {
  id: string;
  employee: string;
  date: string;
  hours: number;
  project: string;
}

export interface PayrollRecord {
  id: string;
  employee: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  payDate: string;
}
