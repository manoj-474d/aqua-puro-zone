import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-[15px]', sub: 'text-[9px]' },
    md: { icon: 36, text: 'text-[18px]', sub: 'text-[10px]' },
    lg: { icon: 46, text: 'text-[22px]', sub: 'text-[12px]' },
    xl: { icon: 58, text: 'text-[28px]', sub: 'text-[14px]' },
  };

  const { icon, text, sub } = sizeMap[size];
  const isWhite = variant === 'white';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Purity Shield + Droplet Vector Icon */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-300 hover:scale-105"
        style={{ width: icon, height: icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,180,255,0.35)]"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D2FF" />
              <stop offset="50%" stopColor="#0B74DE" />
              <stop offset="100%" stopColor="#0A192F" />
            </linearGradient>
            <linearGradient id="dropGrad" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#E0F7FF" />
              <stop offset="35%" stopColor="#38BDF8" />
              <stop offset="85%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#00D2FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00D2FF" stopOpacity="0" />
            </radialGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ambient Glow Aura */}
          <circle cx="50" cy="50" r="44" fill="url(#ringGlow)" />

          {/* Outer Shield Hexagon/Shield contour */}
          <path
            d="M50 6 L84 20 V50 C84 72 69 88 50 94 C31 88 16 72 16 50 V20 L50 6 Z"
            fill="url(#shieldGrad)"
            stroke="#00D2FF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Protective Core */}
          <path
            d="M50 14 L76 25 V49 C76 67 64 80 50 85 C36 80 24 67 24 49 V25 L50 14 Z"
            fill="#0B1E36"
            stroke="#38BDF8"
            strokeWidth="1"
            opacity="0.85"
          />

          {/* Dynamic Hydro Droplet with Specular Highlight */}
          <path
            d="M50 25 C50 25 67 50 67 61 C67 70.4 59.4 78 50 78 C40.6 78 33 70.4 33 61 C33 50 50 25 50 25 Z"
            fill="url(#dropGrad)"
            filter="url(#glowFilter)"
          />

          {/* Droplet Specular Reflection Arc */}
          <path
            d="M44 45 C44 45 40 54 40 60 C40 63 41.5 65 43 66"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Purity Mineral Accent Dots */}
          <circle cx="50" cy="62" r="3" fill="#FFFFFF" opacity="0.95" />
          <circle cx="58" cy="57" r="1.5" fill="#E0F2FE" />
          <circle cx="55" cy="68" r="1.2" fill="#E0F2FE" />
        </svg>
      </div>

      {/* Typography Section */}
      {variant !== 'icon' && (
        <div className="flex flex-col leading-tight min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-heading font-extrabold tracking-tight ${text} ${
                isWhite
                  ? 'text-white'
                  : 'text-[#06284B] dark:text-white'
              }`}
            >
              AQUA <span className="text-[#00A3FF]">PURO</span>{' '}
              <span className="text-[#00D2FF]">ZONE</span>
            </span>
          </div>

          {variant !== 'compact' && (
            <span
              className={`font-semibold tracking-wider uppercase ${sub} ${
                isWhite ? 'text-[#38BDF8]/90' : 'text-[#475569]'
              }`}
            >
              Tumakuru • Water Technologies
            </span>
          )}
        </div>
      )}
    </div>
  );
};
