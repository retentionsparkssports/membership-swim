import { ExpiryStatus } from '../types';

export const SUPPORT_WA = 'https://wa.me/6281390006606';
export const SUPPORT_LABEL = 'Tim Customer Support Sparks Sports';

export function cleanCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

export function parseExpiryDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const v = String(value).trim();
  if (v === '-' || v.toLowerCase() === 'not yet renewal' || v.toLowerCase() === 'xxxxx' || v.startsWith('#')) {
    return null;
  }
  const fb = new Date(v);
  return isNaN(fb.getTime()) ? null : fb;
}

export function formatDisplayDate(value: string | null | undefined): string {
  const date = parseExpiryDate(value);
  if (!date) return value ? String(value) : '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(date);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - today.getTime()) / 86400000);
}

export function getExpiryStatus(expiryStr: string | null | undefined): ExpiryStatus {
  const date = parseExpiryDate(expiryStr);
  if (!date || date.getFullYear() < 2020) {
    return {
      className: 'expiry-unknown',
      daysText: '',
      message: 'Status membership belum tersedia. Yuk hubungi Student Advisor Retention untuk bantu cek ya.',
      dateFormatted: 'Belum tersedia',
    };
  }

  const days = daysUntil(date);
  let className: string;
  let daysText: string;
  let message: string;

  if (days < 0) {
    className = 'expiry-expired';
    daysText = `${Math.abs(days)} hari yang lalu`;
    message = 'Yah, membership si kecil sudah habis. Yuk perpanjang sekarang supaya tetap bisa lanjut seru-seruan di Sparks!';
  } else if (days === 0) {
    className = 'expiry-urgent';
    daysText = 'Berakhir hari ini';
    message = 'Duh, membership si kecil berakhir hari ini nih. Yuk segera perpanjang supaya tetap aktif!';
  } else if (days <= 14) {
    className = 'expiry-urgent';
    daysText = `${days} hari lagi`;
    message = 'Duh, membership si kecil sudah mendekati masa berakhir nih. Yuk segera perpanjang ya!';
  } else if (days <= 30) {
    className = 'expiry-soon';
    daysText = `${days} hari lagi`;
    message = 'Duh, membership si kecil sudah mendekati waktu expired. Yuk mulai perpanjang dari sekarang ya.';
  } else {
    className = 'expiry-active';
    daysText = `${days} hari lagi`;
    message = 'Yeay, membership si kecil masih aktif! Tinggal lanjut latihan dan have fun bareng Sparks!';
  }

  return {
    className,
    daysText,
    message,
    dateFormatted: formatDisplayDate(expiryStr),
  };
}

export function getClassLabel(raw: string | undefined): string {
  if (!raw) return 'Kelas';
  const parts = raw.split('|').map((p) => p.trim());
  return parts.length >= 3 ? parts[2] : raw;
}

export function simplifyClassName(raw: string | undefined, switcher = 1): string {
  if (!raw) return '';
  const parts = raw.split('|').map((p) => p.trim());
  if (parts.length >= 5 && switcher === 2) return `${parts[2]}`;
  if (parts.length >= 5) return `${parts[2]} · ${parts[3]} ${parts[4]}`;
  return raw;
}

export function normalizeStatusClass(statusClass: string | undefined): string {
  return cleanCell(statusClass)
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isRegularClass(statusClass: string | undefined): boolean {
  return normalizeStatusClass(statusClass).startsWith('regular class');
}

export function isTrialChangeClass(statusClass: string | undefined): boolean {
  return normalizeStatusClass(statusClass).startsWith('trial change class');
}

export function isMakeUpClass(statusClass: string | undefined): boolean {
  return normalizeStatusClass(statusClass).startsWith('make up class');
}

export function isLeaveAttendance(attendance: string | undefined): boolean {
  return cleanCell(attendance).includes('Leave');
}

export function getStatusBadge(attendanceLabel: string): { badge: string; dot: string } {
  if (attendanceLabel === 'Present') return { badge: 'badge-present', dot: 'dot-present' };
  if (attendanceLabel === 'Leave') return { badge: 'badge-leave', dot: 'dot-leave' };
  return { badge: 'badge-absent', dot: 'dot-absent' };
}

export function formatGreetingParentName(name: string | undefined): string {
  if (!name) return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (['mom', 'dad', 'mama', 'papa', 'bunda', 'ayah', 'ibu', 'mr', 'mrs'].some((p) => lower.startsWith(p))) {
    return trimmed;
  }
  return `Mom/Dad ${trimmed}`;
}

export function getSafeWhatsAppLink(link: string | null | undefined): string {
  if (!link) return SUPPORT_WA;
  try {
    const url = new URL(link);
    return url.protocol === 'https:' && url.hostname === 'wa.me' ? url.href : SUPPORT_WA;
  } catch {
    return SUPPORT_WA;
  }
}

export function getInitials(name: string | undefined): string {
  if (!name) return '?';
  const clean = name.replace(/\s*\(.*\)\s*$/, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
}
