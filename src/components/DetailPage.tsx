
import React from 'react';
import { Student, AttendanceRecord } from '../types';
import { BrandLogo } from './BrandLogo';
import { getInitials, cleanCell } from '../lib/helpers';

interface DetailPageProps {
  student: Student;
  attendance: AttendanceRecord[];
  onBackToDashboard: () => void;
}

function formatTime(value: string): string {
  if (!value) return '-';

  // Mendukung waktu "HH:mm:ss" maupun timestamp ISO.
  const match = value.match(/T?(\d{2}):(\d{2})(?::\d{2})?/);
  if (match) return `${match[1]}:${match[2]}`;

  return value;
}

function formatDuration(value: number | null): string {
  if (value === null) return '-';
  return `${value} menit`;
}

function statusClass(status: string): string {
  const normalized = status.toLowerCase();

  if (normalized.includes('present') || normalized.includes('hadir')) {
    return 'attendance-status status-present';
  }

  if (normalized.includes('absent') || normalized.includes('tidak hadir')) {
    return 'attendance-status status-absent';
  }

  if (normalized.includes('cancel') || normalized.includes('batal')) {
    return 'attendance-status status-cancelled';
  }

  return 'attendance-status status-other';
}

export const DetailPage: React.FC<DetailPageProps> = ({
  student,
  attendance,
  onBackToDashboard,
}) => {
  const presentCount = attendance.filter((record) => {
    const status = record.attendanceStatus.toLowerCase();
    return status.includes('present') || status.includes('hadir');
  }).length;

  const absentCount = attendance.filter((record) => {
    const status = record.attendanceStatus.toLowerCase();
    return status.includes('absent') || status.includes('tidak hadir');
  }).length;

  return (
    <div className="card">
      <BrandLogo />

      <div className="divider" />

      <button
        type="button"
        className="secondary-button"
        onClick={onBackToDashboard}
      >
        ← Kembali ke daftar membership
      </button>

      <div className="student-card-header detail-student-header">
        <div className="student-avatar">
          {getInitials(student.studentName)}
        </div>

        <div className="student-info">
          <p className="sub">Detail Membership Swim</p>
          <h2>{student.studentName || 'Nama belum tersedia'}</h2>
          <p>{student.center || 'Center belum tersedia'}</p>
        </div>
      </div>

      <div className="student-details">
        <div className="detail-item">
          <span className="detail-label">ID siswa</span>
          <span className="detail-value">{student.studentId || '-'}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Status membership</span>
          <span className="detail-value">
            {student.studentStatus || 'Belum tersedia'}
          </span>
        </div>

        <div className="session-grid">
          <div className="session-box">
            <span className="detail-label">Sesi terpakai</span>
            <strong>{student.sessionsUsed}</strong>
          </div>

          <div className="session-box">
            <span className="detail-label">Sesi tersisa</span>
            <strong>{student.sessionsRemaining}</strong>
          </div>
        </div>
      </div>

      <div className="divider" />

      <h3>Riwayat Attendance</h3>
      <p className="sub">
        Menampilkan {attendance.length} catatan attendance untuk membership ini.
      </p>

      <div className="attendance-summary">
        <div className="session-box">
          <span className="detail-label">Total catatan</span>
          <strong>{attendance.length}</strong>
        </div>

        <div className="session-box">
          <span className="detail-label">Hadir</span>
          <strong>{presentCount}</strong>
        </div>

        <div className="session-box">
          <span className="detail-label">Tidak hadir</span>
          <strong>{absentCount}</strong>
        </div>
      </div>

      {attendance.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada riwayat attendance untuk membership ini.</p>
        </div>
      ) : (
        <div className="attendance-list">
          {attendance.map((record) => (
            <article
              className="attendance-card"
              key={record.attendanceId}
            >
              <div className="attendance-card-header">
                <div>
                  <strong>{record.dateStr || record.rawDate || '-'}</strong>
                  <p className="sub">
                    {formatTime(record.checkInTime)}
                  </p>
                </div>

                <span className={statusClass(record.attendanceStatus)}>
                  {record.attendanceStatus || 'Status belum tersedia'}
                </span>
              </div>

              <div className="attendance-fields">
                <div className="detail-item">
                  <span className="detail-label">Tipe sesi</span>
                  <span className="detail-value">
                    {record.sessionType || '-'}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Durasi</span>
                  <span className="detail-value">
                    {formatDuration(record.durationMinutes)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Jadwal</span>
                  <span className="detail-value">
                    {formatTime(record.scheduledTime)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Level</span>
                  <span className="detail-value">{record.level || '-'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Kelompok usia</span>
                  <span className="detail-value">
                    {record.ageGroup || '-'}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Coach</span>
                  <span className="detail-value">{record.coach || '-'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Student Advisor</span>
                  <span className="detail-value">
                    {record.studentAdvisor || '-'}
                  </span>
                </div>
              </div>

              {cleanCell(record.coachNotes) && (
                <div className="coach-notes">
                  <span className="detail-label">Catatan coach</span>
                  <p>{record.coachNotes}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <button
        type="button"
        className="secondary-button"
        onClick={onBackToDashboard}
      >
        ← Kembali ke daftar membership
      </button>
    </div>
  );
};
