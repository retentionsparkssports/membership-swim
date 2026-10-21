
import React from 'react';
import { Student } from '../types';
import { BrandLogo } from './BrandLogo';
import { getInitials } from '../lib/helpers';

interface DashboardPageProps {
  students: Student[];
  phone: string;
  onSelectStudent: (membershipId: string) => void;
  onBackToHome: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  students,
  phone,
  onSelectStudent,
  onBackToHome,
}) => {
  return (
    <div className="card">
      <BrandLogo />

      <div className="divider" />

      <p className="headline">Membership Swim Anak</p>
      <p className="sub">
        Berikut informasi membership yang terhubung dengan nomor WhatsApp
        yang kamu masukkan.
      </p>

      <div className="membership-summary">
        <div>
          <span className="summary-label">Jumlah membership</span>
          <strong>{students.length}</strong>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada membership yang dapat ditampilkan.</p>
        </div>
      ) : (
        <div className="student-list">
          {students.map((student) => (
            <div
              className="student-card"
              key={student.membershipId}
            >
              <div className="student-card-header">
                <div className="student-avatar">
                  {getInitials(student.studentName)}
                </div>

                <div className="student-info">
                  <h3>{student.studentName || 'Nama belum tersedia'}</h3>
                  <p>{student.center || 'Center belum tersedia'}</p>
                </div>
              </div>

              <div className="student-details">
                <div className="detail-item">
                  <span className="detail-label">ID siswa</span>
                  <span className="detail-value">
                    {student.studentId || '-'}
                  </span>
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

              <button
                type="button"
                onClick={() => onSelectStudent(student.membershipId)}
              >
                Lihat Riwayat Attendance →
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="secondary-button"
        onClick={onBackToHome}
      >
        Kembali
      </button>
    </div>
  );
};
