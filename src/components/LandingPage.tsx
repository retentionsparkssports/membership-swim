import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { SUPPORT_WA, SUPPORT_LABEL } from '../lib/helpers';

interface LandingPageProps {
  onSearch: (phone: string) => void;
  initialPhone?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSearch, initialPhone = '' }) => {
  const [phoneNumber, setPhoneNumber] = useState(
    initialPhone.replace(/^62/, '').replace(/^0/, '')
  );
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError('');
    let raw = phoneNumber.trim().replace(/[^0-9]/g, '');

    if (!raw) {
      setValidationError('Masukkan nomor WhatsApp terlebih dahulu.');
      return;
    }
    if (raw.length < 8) {
      setValidationError('Nomor terlalu pendek.');
      return;
    }

    if (raw.startsWith('0')) {
      raw = '62' + raw.slice(1);
    } else if (raw.startsWith('8')) {
      raw = '62' + raw;
    }

    onSearch(raw);
  };

  const handleQuickDemo = () => {
    setPhoneNumber('8111000549');
    setValidationError('');
    onSearch('628111000549');
  };

  return (
    <div className="card">
      <BrandLogo />
      <div className="divider"></div>
      <p className="headline">Cek Status Membership Anak</p>
      <p className="sub">
        Masukkan nomor WhatsApp orang tua yang terdaftar untuk melihat status membership Sparks.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="phone">Nomor WhatsApp</label>
        <div className="input-row has-icon">
          <div className="field-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v2.2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 3.4 2 2 0 0 1 4.11 1.2h2.2a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.8a2 2 0 0 1-.45 2.1L7.6 8.75a16 16 0 0 0 7.65 7.65l.93-.93a2 2 0 0 1 2.1-.45c.9.31 1.84.53 2.8.66A2 2 0 0 1 22 16.92Z" />
            </svg>
          </div>
          <div className="prefix">+62</div>
          <input
            type="tel"
            id="phone"
            placeholder="8111000549"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={16}
            value={phoneNumber}
            onChange={(e) => {
              setValidationError('');
              setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''));
            }}
          />
        </div>

        {validationError ? (
          <p className="hint" style={{ color: '#c0392b', fontWeight: 600 }}>
            {validationError}
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <p className="hint" style={{ margin: 0 }}>
              Tanpa angka 0 di depan. Contoh: 8111000549
            </p>
            <button
              type="button"
              onClick={handleQuickDemo}
              style={{
                background: 'none',
                border: 'none',
                color: '#2db87a',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 6px',
                height: 'auto',
                width: 'auto',
                textDecoration: 'underline',
              }}
            >
              Coba Contoh
            </button>
          </div>
        )}

        <button type="submit" id="btn">
          Cek Status Membership →
        </button>
      </form>

      <p className="small-note">
        Butuh bantuan? Hubungi{' '}
        <a
          href={SUPPORT_WA}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--green)', fontWeight: 700 }}
        >
          {SUPPORT_LABEL}
        </a>{' '}
        untuk pengecekan data membership.
      </p>
    </div>
  );
};
