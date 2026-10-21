import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'small' | 'normal';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'normal' }) => {
  const [imgError, setImgError] = useState(false);
  const isSmall = size === 'small';

  return (
    <div className="logo-wrap">
      {!imgError ? (
        <img
          src="/logo.png"
          className={isSmall ? 'logo-img small' : 'logo-img'}
          alt="Sparks Sports Academy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`logo-fallback ${isSmall ? 'white' : ''}`}>
          Sparks <span className="star">★</span> {isSmall ? 'Sports Academy' : ''}
        </div>
      )}
    </div>
  );
};
