import React from 'react';

interface WaveDividerProps {
  colorTop?: string;
  colorBottom?: string;
  flip?: boolean;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({
  colorTop = '#faf8ff',
  colorBottom = '#06284b',
  flip = false,
}) => {
  return (
    <div
      className={`relative w-full overflow-hidden leading-none pointer-events-none select-none ${
        flip ? 'rotate-180' : ''
      }`}
      style={{ height: '70px', marginTop: '-1px', marginBottom: '-1px' }}
    >
      <svg
        className="relative block w-full h-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#27c4d9" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#0b74de" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#27c4d9" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorBottom} stopOpacity="1" />
            <stop offset="100%" stopColor={colorBottom} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Back animated soft wave */}
        <path
          d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,50 L1200,120 L0,120 Z"
          fill="url(#waveGrad1)"
          className="transition-all duration-1000 ease-in-out"
        >
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="
              M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,50 L1200,120 L0,120 Z;
              M0,0 C200,30 400,100 600,40 C800,-20 1000,90 1200,30 L1200,120 L0,120 Z;
              M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,50 L1200,120 L0,120 Z
            "
          />
        </path>

        {/* Front solid wave */}
        <path
          d="M0,30 C200,100 450,0 700,60 C950,120 1100,20 1200,40 L1200,120 L0,120 Z"
          fill="url(#waveGrad2)"
        >
          <animate
            attributeName="d"
            dur="7s"
            repeatCount="indefinite"
            values="
              M0,30 C200,100 450,0 700,60 C950,120 1100,20 1200,40 L1200,120 L0,120 Z;
              M0,45 C300,10 550,110 800,40 C1050,-10 1150,80 1200,60 L1200,120 L0,120 Z;
              M0,30 C200,100 450,0 700,60 C950,120 1100,20 1200,40 L1200,120 L0,120 Z
            "
          />
        </path>
      </svg>
    </div>
  );
};
