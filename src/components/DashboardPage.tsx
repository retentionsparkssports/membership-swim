import React from 'react';
import { Student } from '../types';
import { BrandLogo } from './BrandLogo';
import { ExpiryBanner } from './ExpiryBanner';
import { formatGreetingParentName, getInitials } from '../lib/helpers';

interface DashboardPageProps {
  students: Student[];
  phone: string;
  onSelectStudent: (studentId: string) => void;
  onBackToHome: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  students,
  phone: _phone,
  onSelectStudent,
  onBackToHome,
}) => {
  const parentsName = formatGreetingParentName(students[0]?.parentsName || '');
  const greeting = parentsName ? `Halo, ${parentsName}!` : 'Halo!';

  return (
    <div>
      <div className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-inner">
            <BrandLogo size="small" />
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="greeting-card">
          <div className="greeting-text">{greeting}</div>
          <div className="greeting-sub">Yuk cek status membership si kecil di Sparks.</div>
        </div>

        {students.length > 1 && (
          <div className="multi-note">
            👤 {students.length} anak terdaftar dengan nomor ini.
          </div>
        )}

        {students.map((student) => (
          <div key={student.studentId} className="student-card">
            <div className="card-top">
              <div className="avatar">{getInitials(student.studentName)}</div>
              <div className="card-info">
                <div className="student-name">
                  {student.studentName || 'Nama belum tersedia'}
                </div>
                <div className="student-id">{student.studentId}</div>
                <div>
                  <span className="center-badge">{student.center}</span>
                </div>
              </div>
            </div>

            <ExpiryBanner expiryDateStr={student.expiryDate} />

            <button
              type="button"
              className="detail-btn"
              onClick={() => onSelectStudent(student.studentId)}
              style={{ width: '100%', border: 'none', cursor: 'pointer' }}
            >
              Lihat Detail Attendance →
            </button>
          </div>
        ))}

        <button
          type="button"
          className="back-link"
          onClick={onBackToHome}
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
        >
          ← Cek nomor lain
        </button>
      </div>
    </div>
  );
};
