export interface Student {
  center: string;
  studentId: string;
  studentName: string;
  phone: string;
  parentsName: string;
  retentionX?: string | null;
  expiryDateRaw?: string | null;
  expiryDate: string;
  sarName?: string | null;
  waLink?: string | null;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  center: string;
  rawDate: string;
  dateStr: string;
  class_: string;
  attendance: string;
  makeupReason?: string;
  statusClass?: string;
  previousClass?: string;
  previousDateStr?: string;
  term?: string;
  quarter?: string;
}

export interface ExpiryStatus {
  className: string;
  daysText: string;
  message: string;
  dateFormatted: string;
}
