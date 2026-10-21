import { createClient } from '@supabase/supabase-js';
import { Student, AttendanceRecord } from '../types';
import { formatDisplayDate, cleanCell } from './helpers';

const SUPABASE_URL = 'https://cfdjsilmcomflleqhqii.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bUL-eM8mbA8fgFYoUpXVFg_DTWaUKdf';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 600): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await sleep(delayMs * (i + 1));
    }
  }
  throw lastErr;
}

// Built-in demo fallback for testing the example number
const DEMO_STUDENTS: Student[] = [
  {
    center: 'Bintaro U-Town',
    studentId: 'SPK-BIN-0891',
    studentName: 'Kenzo Aradhana',
    phone: '628111000549',
    parentsName: 'Bunda Rania',
    retentionX: 'Active',
    expiryDateRaw: new Date(Date.now() + 24 * 86400000).toISOString().split('T')[0],
    expiryDate: formatDisplayDate(new Date(Date.now() + 24 * 86400000).toISOString().split('T')[0]),
    sarName: 'Coach Adit (SAR Bintaro)',
    waLink: 'https://wa.me/6281390006606',
  },
  {
    center: 'Bintaro U-Town',
    studentId: 'SPK-BIN-0892',
    studentName: 'Keira Aradhana',
    phone: '628111000549',
    parentsName: 'Bunda Rania',
    retentionX: 'Urgent Renewal',
    expiryDateRaw: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
    expiryDate: formatDisplayDate(new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]),
    sarName: 'Coach Maya (SAR Bintaro)',
    waLink: 'https://wa.me/6281390006606',
  },
];

const DEMO_ATTENDANCE: Record<string, AttendanceRecord[]> = {
  'SPK-BIN-0891': [
    {
      studentId: 'SPK-BIN-0891',
      studentName: 'Kenzo Aradhana',
      center: 'Bintaro U-Town',
      rawDate: '2026-10-18',
      dateStr: '18 Okt 2026',
      class_: 'C1 | Bintaro U-Town | Dolphins Level 2 | Sabtu 09:00',
      attendance: 'Present',
      statusClass: 'Regular Class',
      term: 'Term 4 2026',
      quarter: '2026-Q4',
    },
    {
      studentId: 'SPK-BIN-0891',
      studentName: 'Kenzo Aradhana',
      center: 'Bintaro U-Town',
      rawDate: '2026-10-12',
      dateStr: '12 Okt 2026',
      class_: 'C1 | Bintaro U-Town | Dolphins Level 2 | Minggu 10:00',
      attendance: 'Present',
      statusClass: 'Make Up Class',
      makeupReason: 'Izin sakit flu pada sesi Sabtu',
      previousClass: 'C1 | Bintaro U-Town | Dolphins Level 2 | Sabtu 09:00',
      previousDateStr: '11 Okt 2026',
      term: 'Term 4 2026',
      quarter: '2026-Q4',
    },
    {
      studentId: 'SPK-BIN-0891',
      studentName: 'Kenzo Aradhana',
      center: 'Bintaro U-Town',
      rawDate: '2026-10-11',
      dateStr: '11 Okt 2026',
      class_: 'C1 | Bintaro U-Town | Dolphins Level 2 | Sabtu 09:00',
      attendance: 'Leave',
      statusClass: 'Regular Class',
      makeupReason: 'Sakit flu',
      term: 'Term 4 2026',
      quarter: '2026-Q4',
    },
    {
      studentId: 'SPK-BIN-0891',
      studentName: 'Kenzo Aradhana',
      center: 'Bintaro U-Town',
      rawDate: '2026-10-04',
      dateStr: '04 Okt 2026',
      class_: 'C1 | Bintaro U-Town | Sharks Advanced | Rabu 16:00',
      attendance: 'Present',
      statusClass: 'Trial Change Class',
      makeupReason: 'Evaluasi kenaikan level Sharks',
      previousClass: 'C1 | Bintaro U-Town | Dolphins Level 2 | Sabtu 09:00',
      previousDateStr: '03 Okt 2026',
      term: 'Term 4 2026',
      quarter: '2026-Q4',
    },
    {
      studentId: 'SPK-BIN-0891',
      studentName: 'Kenzo Aradhana',
      center: 'Bintaro U-Town',
      rawDate: '2026-09-27',
      dateStr: '27 Sep 2026',
      class_: 'C1 | Bintaro U-Town | Dolphins Level 2 | Sabtu 09:00',
      attendance: 'Present',
      statusClass: 'Regular Class',
      term: 'Term 3 2026',
      quarter: '2026-Q3',
    },
  ],
  'SPK-BIN-0892': [
    {
      studentId: 'SPK-BIN-0892',
      studentName: 'Keira Aradhana',
      center: 'Bintaro U-Town',
      rawDate: '2026-10-18',
      dateStr: '18 Okt 2026',
      class_: 'C1 | Bintaro U-Town | Tadpole Toddler | Sabtu 10:30',
      attendance: 'Present',
      statusClass: 'Regular Class',
      term: 'Term 4 2026',
      quarter: '2026-Q4',
    },
    {
      studentId: 'SPK-BIN-0892',
      studentName: 'Keira Aradhana',
      center: 'Bintaro U-Town',
      rawDate: '2026-10-11',
      dateStr: '11 Okt 2026',
      class_: 'C1 | Bintaro U-Town | Tadpole Toddler | Sabtu 10:30',
      attendance: 'Present',
      statusClass: 'Regular Class',
      term: 'Term 4 2026',
      quarter: '2026-Q4',
    },
  ],
};

interface SupabaseStudentRow {
  center: string;
  student_id: string;
  student_name: string;
  phone_number: string;
  parents_name: string;
  retention_x?: string;
  expiry_date_raw?: string;
  sar_name?: string;
  wa_link?: string;
}

interface SupabaseAttendanceRow {
  student_id: string;
  student_name: string;
  center: string;
  raw_date: string;
  date_str?: string;
  class_: string;
  attendance: string;
  makeup_reason?: string;
  status_class?: string;
  previous_class?: string;
  previous_date_str?: string;
  term?: string;
  quarter?: string;
}

export async function fetchStudentsByPhone(phone: string): Promise<Student[]> {
  try {
    const data = await withRetry(async () => {
      const { data, error } = await supabase.rpc('get_students_by_phone', { search_phone: phone });
      if (error) throw error;
      return (data || []) as SupabaseStudentRow[];
    });

    if (data.length > 0) {
      return data.map((row) => ({
        center: row.center,
        studentId: row.student_id,
        studentName: row.student_name,
        phone: row.phone_number,
        parentsName: row.parents_name,
        retentionX: row.retention_x,
        expiryDateRaw: row.expiry_date_raw,
        expiryDate: formatDisplayDate(row.expiry_date_raw),
        sarName: row.sar_name,
        waLink: row.wa_link,
      }));
    }

    // Check demo number fallback for example 8111000549
    if (phone === '628111000549' || phone === '8111000549') {
      return DEMO_STUDENTS;
    }

    return [];
  } catch (error) {
    if (phone === '628111000549' || phone === '8111000549') {
      return DEMO_STUDENTS;
    }
    throw error;
  }
}

export async function fetchStudentById(studentId: string): Promise<Student | null> {
  try {
    const data = await withRetry(async () => {
      const { data, error } = await supabase.rpc('get_student_by_id', { search_id: studentId });
      if (error) throw error;
      return (data || []) as SupabaseStudentRow[];
    });

    if (data.length > 0) {
      const row = data[0];
      return {
        center: row.center,
        studentId: row.student_id,
        studentName: row.student_name,
        phone: row.phone_number,
        parentsName: row.parents_name,
        retentionX: row.retention_x,
        expiryDateRaw: row.expiry_date_raw,
        expiryDate: formatDisplayDate(row.expiry_date_raw),
        sarName: row.sar_name,
        waLink: row.wa_link,
      };
    }

    const demo = DEMO_STUDENTS.find((s) => s.studentId === studentId);
    return demo || null;
  } catch (error) {
    const demo = DEMO_STUDENTS.find((s) => s.studentId === studentId);
    if (demo) return demo;
    throw error;
  }
}

export async function fetchAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
  try {
    const rows = await withRetry(async () => {
      const { data, error } = await supabase.rpc('get_attendance_by_student_id', { search_id: studentId });
      if (error) throw error;
      return (data || []) as SupabaseAttendanceRow[];
    });

    if (rows.length > 0) {
      return rows.map((row) => ({
        studentId: row.student_id,
        studentName: row.student_name,
        center: row.center,
        rawDate: row.raw_date,
        dateStr: row.date_str || formatDisplayDate(row.raw_date),
        class_: row.class_,
        attendance: cleanCell(row.attendance),
        makeupReason: row.makeup_reason,
        statusClass: cleanCell(row.status_class),
        previousClass: row.previous_class,
        previousDateStr: row.previous_date_str,
        term: cleanCell(row.term),
        quarter: cleanCell(row.quarter),
      }));
    }

    if (DEMO_ATTENDANCE[studentId]) {
      return DEMO_ATTENDANCE[studentId];
    }

    return [];
  } catch (error) {
    if (DEMO_ATTENDANCE[studentId]) {
      return DEMO_ATTENDANCE[studentId];
    }
    throw error;
  }
}
