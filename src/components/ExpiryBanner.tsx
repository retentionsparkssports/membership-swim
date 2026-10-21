import React from 'react';
import { getExpiryStatus } from '../lib/helpers';

interface ExpiryBannerProps {
  expiryDateStr: string | null | undefined;
}

export const ExpiryBanner: React.FC<ExpiryBannerProps> = ({ expiryDateStr }) => {
  const { className, daysText, message, dateFormatted } = getExpiryStatus(expiryDateStr);

  return (
    <div className={`expiry-box ${className}`}>
      <div className="ex-label">Membership Berakhir</div>
      <div className="ex-date">{dateFormatted}</div>
      {daysText && <div className="ex-days">{daysText}</div>}
      <div className="ex-msg">{message}</div>
    </div>
  );
};
