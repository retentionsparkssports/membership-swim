
import { createClient } from '@supabase/supabase-js';
import { Student, AttendanceRecord } from '../types';
import { formatDisplayDate, cleanCell } from './helpers';

const SUPABASE_URL = 'https://kiwgfcxuyozogqkskxow.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6lOq9casbX4_fkcfjagyAg_p8cfk3fU';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 600
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < attempts - 1) {
        await sleep(delayMs * (i + 1));
      }
    }
  }

  throw lastError;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

interface SupabaseStudentRow {
  membership_id: string;
  student_id: string;
  source_student_id: string;
  student_name: string;
  center_code: string;
  center_name: string;
  student_status: string;
  sessions_used: number;
  sessions_remaining: number;
}

interface SupabaseAttendanceRow {
  attendance_id: string;
  attendance_date: string;
  check_in_time: string | null;
  attendance_status: string | null;
  session_type: string | null;
  duration_minutes: number | null;
  scheduled_time: string | null;
  level: string | null;
  age_group: string | null;
  coach: string | null;
  student_advisor: string | null;
  coach_notes: string | null;
}

/**
 * Cari seluruh membership berdasarkan nomor telepon orang tua.
 * Nama kolom mengikuti hasil RPC get_swim_students_by_phone.
 */
export async function fetchStudentsByPhone(
  phone: string
): Promise<Student[]> {
  const normalizedPhone = cleanCell(phone);

  if (!normalizedPhone) {
    return [];
  }

  const rows = await withRetry(async () => {
    const { data, error } = await supabase.rpc(
      'get_swim_students_by_phone',
      { p_phone: normalizedPhone }
    );

    if (error) throw error;

    return (data ?? []) as SupabaseStudentRow[];
  });

  return rows.map((row) => ({
    membershipId: row.membership_id,
    studentId: row.source_student_id || row.student_id,
    studentName: row.student_name,
    center: row.center_name,
    phone: normalizedPhone,
    studentStatus: row.student_status ?? '',
    sessionsUsed: Number(row.sessions_used ?? 0),
    sessionsRemaining: Number(row.sessions_remaining ?? 0),
  }));
}

/**
 * Cari membership berdasarkan ID dan nomor telepon.
 * Nomor telepon wajib tersedia untuk memvalidasi hasil pencarian.
 */
export async function fetchStudentById(
  membershipId: string,
  phone: string
): Promise<Student | null> {
  if (!cleanCell(membershipId) || !cleanCell(phone)) {
    return null;
  }

  const students = await fetchStudentsByPhone(phone);

  return (
    students.find(
      (student) => student.membershipId === membershipId
    ) ?? null
  );
}

/**
 * Ambil riwayat attendance berdasarkan membership dan nomor telepon.
 */
export async function fetchAttendanceForStudent(
  membershipId: string,
  phone: string
): Promise<AttendanceRecord[]> {
  if (!cleanCell(membershipId) || !cleanCell(phone)) {
    return [];
  }

  const rows = await withRetry(async () => {
    const { data, error } = await supabase.rpc(
      'get_swim_attendance_by_membership',
      {
        p_membership_id: membershipId,
        p_phone: cleanCell(phone),
      }
    );

    if (error) throw error;

    return (data ?? []) as SupabaseAttendanceRow[];
  });

  return rows
    .map((row) => ({
      attendanceId: row.attendance_id,
      membershipId,
      rawDate: row.attendance_date,
      dateStr: formatDisplayDate(row.attendance_date),
      checkInTime: cleanCell(row.check_in_time),
      attendanceStatus: cleanCell(row.attendance_status),
      sessionType: cleanCell(row.session_type),
      durationMinutes: toNumberOrNull(row.duration_minutes),
      scheduledTime: cleanCell(row.scheduled_time),
      level: cleanCell(row.level),
      ageGroup: cleanCell(row.age_group),
      coach: cleanCell(row.coach),
      studentAdvisor: cleanCell(row.student_advisor),
      coachNotes: cleanCell(row.coach_notes),
    }))
    .sort((a, b) => {
      const dateComparison = b.rawDate.localeCompare(a.rawDate);

      if (dateComparison !== 0) return dateComparison;

      return b.checkInTime.localeCompare(a.checkInTime);
    });
}
