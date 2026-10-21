import React from 'react';
import { BrandLogo } from './BrandLogo';

interface LoadingPageProps {
  title: string;
  subtitle: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ title, subtitle }) => {
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
      <BrandLogo />
      <div className="divider"></div>
      <p className="headline loading-dots">{title}</p>
      <p className="sub">{subtitle}</p>
    </div>
  );
};
