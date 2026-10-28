import React, { useEffect, useState } from 'react';

interface WaterLoaderProps {
  onComplete?: () => void;
  brandName?: string;
}

export const WaterLoader: React.FC<WaterLoaderProps> = ({
  onComplete,
  brandName = 'Aqua Puro Zone',
}) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Fast, crisp 1.2s fill up
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDone(true);
            onComplete?.();
          }, 350);
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 8;
        return Math.min(100, prev + step);
      });
    }, 70);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06284b] text-white transition-opacity duration-500">
      {/* Background radial glow */}
      <div className="absolute w-96 h-96 rounded-full bg-[#0b74de]/20 blur-3xl pointer-events-none" />

      {/* Purifier Tank Silhouette */}
      <div className="relative w-36 h-52 rounded-2xl border-2 border-[#27c4d9]/50 p-2 bg-[#081a33]/80 backdrop-blur-md shadow-[0_0_40px_rgba(39,196,217,0.3)] flex flex-col justify-end overflow-hidden">
        {/* Top filter cap */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full bg-[#27c4d9]/40 border border-[#27c4d9]/60" />

        {/* Tank graduation ticks */}
        <div className="absolute right-2 top-8 bottom-8 flex flex-col justify-between items-end opacity-40 text-[8px] font-mono">
          <span>MAX</span>
          <span>8L</span>
          <span>5L</span>
          <span>2L</span>
          <span>MIN</span>
        </div>

        {/* Rising water body */}
        <div
          className="w-full rounded-b-xl relative transition-all duration-150 ease-out overflow-hidden"
          style={{
            height: `${progress}%`,
            background: 'linear-gradient(180deg, #5ee9ff 0%, #0b74de 60%, #06284b 100%)',
            boxShadow: '0 -4px 15px rgba(94, 233, 255, 0.6)',
          }}
        >
          {/* Animated wave crest */}
          <div className="absolute top-0 inset-x-0 h-3 -translate-y-1/2 opacity-70">
            <svg
              className="w-full h-full text-[#5ee9ff] fill-current animate-pulse"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
            >
              <path d="M0 10 Q 25 0, 50 10 T 100 10 V 20 H 0 Z" />
            </svg>
          </div>

          {/* Bubbles in tank */}
          <div className="absolute bottom-2 left-3 w-2 h-2 rounded-full bg-white/70 animate-bounce" />
          <div className="absolute bottom-6 right-4 w-1.5 h-1.5 rounded-full bg-white/60 animate-ping" />
        </div>

        {/* Digital Purity Readout */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
          <span className="text-2xl font-black font-mono tracking-tighter text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {progress}%
          </span>
          <span className="block text-[9px] font-semibold text-[#5ee9ff] uppercase tracking-wider drop-shadow">
            Purifying
          </span>
        </div>
      </div>

      {/* Brand & Loading Label */}
      <div className="mt-6 text-center space-y-1.5 z-10">
        <h3 className="text-lg font-bold tracking-tight text-white">{brandName}</h3>
        <p className="text-xs text-[#27c4d9] font-medium tracking-wide flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#27c4d9] animate-ping" />
          <span>Activating 100% Pure Mineral Flow • Tumakuru</span>
        </p>
      </div>
    </div>
  );
};
