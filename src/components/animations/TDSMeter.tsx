import React, { useState, useEffect, useRef } from 'react';

interface TDSMeterProps {
  initialTds?: number;
  pureTds?: number;
}

export const TDSMeter: React.FC<TDSMeterProps> = ({
  initialTds = 650,
  pureTds = 45,
}) => {
  const [currentTds, setCurrentTds] = useState(initialTds);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    // Smooth countdown from initialTds (650) to pureTds (45)
    let start = initialTds;
    const duration = 2200; // ms
    const stepTime = 25;
    const steps = duration / stepTime;
    const decrement = (initialTds - pureTds) / steps;

    const timer = setInterval(() => {
      start -= decrement;
      if (start <= pureTds) {
        setCurrentTds(pureTds);
        clearInterval(timer);
      } else {
        setCurrentTds(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, initialTds, pureTds]);

  // Calculate gauge angle: 0 PPM = -90deg (green), 1000 PPM = 90deg (red)
  // Our range: 0 to 800 PPM maps from -90 to +90 degrees
  const clampedTds = Math.min(800, Math.max(0, currentTds));
  const needleAngle = -90 + (clampedTds / 800) * 180;

  // Status text and color
  let statusText = 'Excellent Purity (Mineralized)';
  let statusColor = '#006c2e'; // pure green
  let gaugeColor = '#006c2e';

  if (currentTds > 500) {
    statusText = 'High Hardness (Unsafe Borewell)';
    statusColor = '#ba1a1a'; // red
    gaugeColor = '#ba1a1a';
  } else if (currentTds > 250) {
    statusText = 'Moderate Minerals (Needs RO)';
    statusColor = '#d97706'; // amber
    gaugeColor = '#d97706';
  }

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className="text-xs font-bold uppercase tracking-wider text-[#0b74de] mb-1 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px]">speed</span>
        <span>Digital Purity Analyzer</span>
      </div>

      <h3 className="text-xl font-bold text-[#06284b]">
        Total Dissolved Solids (TDS) Reduction
      </h3>
      <p className="text-xs text-[#414753] mt-1 max-w-sm">
        Measured in PPM (Parts Per Million). Tumakuru borewells typically range 600–900 PPM.
      </p>

      {/* Semicircular Gauge SVG */}
      <div className="relative w-64 h-36 mt-6 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 200 110">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#006c2e" />
              <stop offset="40%" stopColor="#22c55e" />
              <stop offset="65%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Semicircle track arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Color gradient arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Needle pivot */}
          <circle cx="100" cy="100" r="8" fill="#06284b" />
          <circle cx="100" cy="100" r="4" fill="#27c4d9" />

          {/* Needle Line */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="#06284b"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: '100px 100px',
              transition: 'transform 0.1s ease-out',
            }}
          />
        </svg>

        {/* Labels at extremities */}
        <span className="absolute bottom-1 left-4 text-[10px] font-bold text-emerald-700">
          0 PPM
        </span>
        <span className="absolute bottom-1 right-4 text-[10px] font-bold text-red-600">
          800+ PPM
        </span>
      </div>

      {/* Numerical Readout */}
      <div className="mt-3">
        <div
          className="text-4xl sm:text-5xl font-black font-mono tracking-tight transition-colors duration-300"
          style={{ color: gaugeColor }}
        >
          {currentTds}{' '}
          <span className="text-lg font-bold font-sans text-slate-500">PPM</span>
        </div>

        <div
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300"
          style={{
            backgroundColor: `${statusColor}15`,
            color: statusColor,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: statusColor }}
          />
          <span>{statusText}</span>
        </div>
      </div>

      {/* Comparison badge */}
      <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-4 border-t border-slate-100 text-left">
        <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200/60">
          <span className="text-[10px] uppercase font-bold text-red-700 block">
            Tap / Borewell
          </span>
          <span className="text-sm font-bold text-red-950 font-mono">650 - 920 PPM</span>
          <p className="text-[10px] text-red-700 mt-0.5">Heavy scale, salts, dissolved iron</p>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">
            Aqua Puro Zone
          </span>
          <span className="text-sm font-bold text-emerald-950 font-mono">40 - 60 PPM</span>
          <p className="text-[10px] text-emerald-700 mt-0.5">Sweet taste, pure alkaline copper</p>
        </div>
      </div>
    </div>
  );
};
