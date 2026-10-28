import React, { useState, useRef, useCallback } from 'react';
import { TDSMeter } from './TDSMeter';

export const BeforeAfterSlider: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#006c2e]/10 border border-[#006c2e]/30 text-[#006c2e] text-[12px] font-bold mb-3">
          <span className="material-symbols-outlined text-[18px]">compare</span>
          <span>Interactive Water Clarity Test</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#06284b] tracking-tight">
          See the Difference: Tap Water vs. Aqua Puro Zone
        </h2>
        <p className="text-[15px] text-[#414753] mt-2 leading-relaxed">
          Drag the center handle horizontally to inspect microscopic sediment, dissolved hardness, and crystal-clear alkaline clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Split-Glass Comparison Slider */}
        <div className="lg:col-span-7">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="relative w-full h-[400px] sm:h-[460px] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#27c4d9]/40 cursor-ew-resize select-none bg-slate-900"
          >
            {/* RIGHT SIDE: Aqua Puro Zone Pure Sparkling Water */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#06284b] via-[#0b74de] to-[#27c4d9] flex items-center justify-center p-6 text-white overflow-hidden">
              {/* Sparkles / Light Reflections */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white animate-ping"
                    style={{
                      width: `${(i % 3) * 2 + 3}px`,
                      height: `${(i % 3) * 2 + 3}px`,
                      left: `${20 + (i * 13) % 75}%`,
                      top: `${15 + (i * 17) % 70}%`,
                      animationDuration: `${2.2 + (i % 4) * 0.7}s`,
                      boxShadow: '0 0 10px #ffffff, 0 0 20px #5ee9ff',
                    }}
                  />
                ))}
              </div>

              {/* Water Glass Graphic on pure side */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-40 sm:w-48 h-64 sm:h-72 rounded-b-3xl border-4 border-white/80 bg-white/15 backdrop-blur-md overflow-hidden flex flex-col justify-end p-2 shadow-[0_0_50px_rgba(94,233,255,0.5)]">
                  {/* Crystal pure water fill */}
                  <div className="w-full h-56 bg-gradient-to-t from-[#0b74de] via-[#27c4d9]/90 to-transparent rounded-b-2xl relative">
                    <div className="absolute top-2 inset-x-0 text-center">
                      <span className="text-[11px] font-mono font-bold text-white tracking-wider bg-black/30 px-2 py-0.5 rounded-full">
                        45 PPM • Sweet &amp; Alkaline
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#006c2e] text-white text-xs font-bold shadow-md">
                    ✓ Aqua Puro Zone Pure Water
                  </span>
                </div>
              </div>

              {/* Right Side Header Label */}
              <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold text-[#5ee9ff]">
                ✦ Mineral Rich • 100% Clear
              </div>
            </div>

            {/* LEFT SIDE (Clipped): Raw Tap / Borewell Water with Murky Cloud & Particles */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden bg-gradient-to-br from-[#3e2723] via-[#4e342e] to-[#2e1d13] text-white"
              style={{ width: `${sliderPos}%` }}
            >
              {/* Cloudy murky texture overlay */}
              <div className="absolute inset-0 bg-[#795548]/30 backdrop-blur-xs pointer-events-none" />

              {/* Floating Murky Particles (rust, sand, scale) */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-[#d7ccc8] animate-bounce opacity-80"
                    style={{
                      width: `${(i % 5) * 2 + 2}px`,
                      height: `${(i % 5) * 2 + 2}px`,
                      left: `${10 + (i * 9) % 85}%`,
                      top: `${10 + (i * 11) % 80}%`,
                      animationDuration: `${1.8 + (i % 3) * 0.8}s`,
                    }}
                  />
                ))}
              </div>

              {/* Left Side Header Label */}
              <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold text-amber-200">
                ⚠ Raw Borewell Tap Water
              </div>

              {/* Murky Glass representation */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="w-40 sm:w-48 h-64 sm:h-72 rounded-b-3xl border-4 border-amber-200/50 bg-amber-950/40 overflow-hidden flex flex-col justify-end p-2">
                  <div className="w-full h-56 bg-gradient-to-t from-[#3e2723] to-[#5d4037]/80 rounded-b-2xl relative flex items-center justify-center p-2 text-center">
                    <span className="text-[11px] font-mono font-bold text-amber-200 bg-black/60 px-2 py-0.5 rounded-full">
                      650+ PPM Hardness
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Dividing Bar & Drag Handle */}
            <div
              className="absolute inset-y-0 z-30 w-1 bg-white shadow-[0_0_15px_#27c4d9]"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Circular Thumb Handle with Arrow Icons */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white text-[#06284b] shadow-2xl flex items-center justify-center border-2 border-[#27c4d9] font-bold text-xs hover:scale-110 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-between items-center text-xs text-[#414753] font-medium px-2">
            <span>← Slide left for Pure Mineral View</span>
            <span>Slide right for Raw Borewell View →</span>
          </div>
        </div>

        {/* Right: Real-time Animated TDS Meter */}
        <div className="lg:col-span-5">
          <TDSMeter initialTds={650} pureTds={45} />
        </div>
      </div>
    </section>
  );
};
