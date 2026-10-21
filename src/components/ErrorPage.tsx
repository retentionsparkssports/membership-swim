import React from 'react';

interface ErrorPageProps {
  message: string;
  onBack: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ message, onBack }) => {
  return (
    <div className="card">
      <div className="icon warning">⚠️</div>
      <h2 className="headline">Data Belum Bisa Dimuat</h2>
      <p className="error-text">{message}</p>
      <p className="error-text">
        Silakan muat ulang halaman ini. Jika masih belum bisa, hubungi tim Sparks untuk pengecekan
        database.
      </p>
      <br />
      <br />
      <button
        type="button"
        className="link-button"
        onClick={onBack}
        style={{ border: 'none', cursor: 'pointer' }}
      >
        ← Kembali
      </button>
    </div>
  );
};

interface AttendanceErrorPageProps {
  onRetry: () => void;
  onBack: () => void;
  isRetrying?: boolean;
}

export const AttendanceErrorPage: React.FC<AttendanceErrorPageProps> = ({
  onRetry,
  onBack,
  isRetrying = false,
}) => {
  return (
    <div className="card">
      <div className="icon warning">⚠️</div>
      <h2 className="headline">Data Attendance Belum Bisa Dimuat</h2>
      <p className="error-text">
        Kami sempat gagal memuat riwayat kehadiran. Ini biasanya karena koneksi yang lambat.
      </p>
      <br />
      <button
        type="button"
        id="retry-btn"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? 'Memuat ulang...' : 'Coba Lagi'}
      </button>
      <br />
      <br />
      <button
        type="button"
        className="link-button"
        onClick={onBack}
        style={{ border: 'none', cursor: 'pointer' }}
      >
        ← Kembali ke daftar anak
      </button>
    </div>
  );
};
