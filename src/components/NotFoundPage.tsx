import React from 'react';
import { SUPPORT_WA, SUPPORT_LABEL } from '../lib/helpers';

interface NotFoundPageProps {
  phone: string;
  onBackToHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ phone, onBackToHome }) => {
  return (
    <div className="card">
      <div className="search-visual">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <h2 className="headline">Nomor Tidak Ditemukan</h2>
      <p className="error-text">Kami belum menemukan data membership untuk nomor:</p>
      <div className="phone-box">+{phone}</div>
      <p className="error-text">
        Coba cek kembali angka yang dimasukkan. Jika nomor sudah benar tetapi data tetap tidak muncul,
        silakan hubungi Student Advisor Retention center kamu untuk pengecekan data.
      </p>
      <br />
      <a
        className="wa-help-btn"
        href={SUPPORT_WA}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="18"
          height="18"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>{' '}
        Hubungi {SUPPORT_LABEL}
      </a>
      <br />
      <br />
      <button
        type="button"
        className="link-button"
        onClick={onBackToHome}
        style={{ border: 'none', cursor: 'pointer' }}
      >
        ← Coba Nomor Lain
      </button>
    </div>
  );
};
