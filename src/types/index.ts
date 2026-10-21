
export interface Student {
  membershipId: string;
  studentId: string;
  studentName: string;
  center: string;
  phone: string;
  studentStatus: string;
  sessionsUsed: number;
  sessionsRemaining: number;
}

export interface AttendanceRecord {
  attendanceId: string;
  membershipId: string;
  rawDate: string;
  dateStr: string;
  checkInTime: string;
  attendanceStatus: string;
  sessionType: string;
  durationMinutes: number | null;
  scheduledTime: string;
  level: string;
  ageGroup: string;
  coach: string;
  studentAdvisor: string;
  coachNotes: string;
}

export interface ExpiryStatus {
  className: string;
  daysText: string;
  message: string;
  dateFormatted: string;
}
