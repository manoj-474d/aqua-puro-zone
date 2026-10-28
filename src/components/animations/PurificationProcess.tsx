import React, { useState, useEffect } from 'react';

interface Stage {
  id: number;
  title: string;
  tagline: string;
  desc: string;
  particleColor: string;
  waterColor: string;
  glowColor: string;
  icon: string;
  micron: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: 'Sediment Filter',
    tagline: 'Physical Particle Barrier',
    desc: 'Dense spun polypropylene captures rust, silt, sand grains, and mud from Tumakuru borewells.',
    particleColor: '#8d6e63', // brownish muddy
    waterColor: 'from-[#8d6e63]/40 to-[#a1887f]/30',
    glowColor: '#a1887f',
    icon: 'grain',
    micron: '5 Micron',
  },
  {
    id: 2,
    title: 'Activated Carbon Filter',
    tagline: 'Chemical & Odour Adsorption',
    desc: 'High-iodine coconut shell carbon traps chlorine, pesticides, VOCs, and foul organic smells.',
    particleColor: '#455a64', // carbon charcoal
    waterColor: 'from-[#546e7a]/30 to-[#78909c]/25',
    glowColor: '#607d8b',
    icon: 'filter_alt',
    micron: 'Adsorption',
  },
  {
    id: 3,
    title: '100 GPD RO Membrane',
    tagline: 'Molecular Heavy Metal Filtration',
    desc: 'Porous polyamide membrane blocks dissolved salts, fluoride, arsenic, and reduces TDS by 95%.',
    particleColor: '#0288d1', // clear aqua transition
    waterColor: 'from-[#0288d1]/30 to-[#29b6f6]/30',
    glowColor: '#0288d1',
    icon: 'grid_view',
    micron: '0.0001 Micron',
  },
  {
    id: 4,
    title: 'UV Sterilization Chamber',
    tagline: 'Germicidal Pathogen Destruction',
    desc: 'High-intensity 11W ultraviolet light destroys 99.99% of bacteria, viruses, and waterborne cysts.',
    particleColor: '#a855f7', // violet UV glow
    waterColor: 'from-[#9333ea]/35 via-[#c084fc]/30 to-[#38bdf8]/30',
    glowColor: '#a855f7',
    icon: 'lightbulb',
    micron: '254nm Rays',
  },
  {
    id: 5,
    title: 'Active Copper & Minerals',
    tagline: 'Alkaline Mineral Recharge',
    desc: 'Infuses pure copper ions, calcium, and magnesium, balancing pH to 7.8 and creating naturally sweet drinking water.',
    particleColor: '#f59e0b', // sparkling copper/gold
    waterColor: 'from-[#f59e0b]/25 via-[#27c4d9]/35 to-[#0b74de]/35',
    glowColor: '#f59e0b',
    icon: 'spa',
    micron: 'pH 7.8 Balanced',
  },
  {
    id: 6,
    title: 'Crystal Clear Water Glass',
    tagline: '100% Pure, Sweet & Safe to Drink',
    desc: 'Safe and revitalizing drinking water poured fresh into your glass, verified by digital TDS meter.',
    particleColor: '#27c4d9',
    waterColor: 'from-[#27c4d9] to-[#0b74de]',
    glowColor: '#27c4d9',
    icon: 'water_drop',
    micron: '0 Bacteria / 45 PPM',
  },
];

export const PurificationProcess: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Auto-progress stages if isPlaying is true
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev >= 6 ? 1 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = STAGES[activeStage - 1];

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full relative">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b74de]/10 border border-[#0b74de]/30 text-[#0b74de] text-[12px] font-bold mb-3">
          <span className="material-symbols-outlined text-[18px]">biotech</span>
          <span>Interactive Cutaway Journey</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#06284b] tracking-tight">
          How It Purifies: Inside the 6-Stage Chamber
        </h2>
        <p className="text-[15px] text-[#414753] mt-2 leading-relaxed">
          Watch raw, murky borewell water transform stage-by-stage into sweet, crystal-clear drinking water. Click any stage or let the simulation play.
        </p>

        {/* Play / Pause Toggle */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-1.5 rounded-full bg-white border border-[#27c4d9]/50 text-[#06284b] text-[12px] font-bold shadow-xs flex items-center gap-1.5 hover:bg-[#f0f9ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0b74de]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? 'Pause Auto Tour' : 'Resume Auto Tour'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Stage Progress Nav & Details */}
        <div className="lg:col-span-5 space-y-3">
          {STAGES.map((s) => {
            const isActive = s.id === activeStage;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveStage(s.id);
                  setIsPlaying(false);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                  isActive
                    ? 'bg-white border-[#0b74de] shadow-lg scale-102 ring-2 ring-[#27c4d9]/30'
                    : 'bg-white/60 hover:bg-white border-slate-200/80 opacity-80 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold transition-colors ${
                    isActive ? 'bg-[#0b74de] shadow-md' : 'bg-slate-300'
                  }`}
                  style={{
                    backgroundColor: isActive ? s.glowColor : undefined,
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0b74de]">
                      Stage 0{s.id} • {s.micron}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-[#27c4d9]/20 text-[#06284b] text-[10px] font-bold animate-pulse">
                        Active Flow
                      </span>
                    )}
                  </div>
                  <h4 className="text-[16px] font-bold text-[#06284b] mt-0.5">{s.title}</h4>
                  <p className="text-[13px] text-[#414753] line-clamp-2 mt-1">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Cutaway X-Ray Graphic Simulator */}
        <div className="lg:col-span-7 bg-[#06284b] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border-2 border-[#27c4d9]/30 text-white min-h-[480px] flex flex-col justify-between">
          {/* Ambient Glow according to active stage */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-35 transition-colors duration-700 pointer-events-none"
            style={{ backgroundColor: current.glowColor }}
          />

          {/* Top Inflow Pipe */}
          <div className="relative flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              <span className="text-xs font-mono text-slate-300">RAW WATER INLET: BOREWELL (750 PPM)</span>
            </div>
            <span className="text-xs font-mono text-[#5ee9ff] font-bold">
              STAGE {activeStage}/6: {current.title.toUpperCase()}
            </span>
          </div>

          {/* Central Cutaway Chamber Simulator */}
          <div className="relative my-6 flex-1 flex flex-col items-center justify-center">
            {/* Purifier Cutaway Cylinder */}
            <div className="relative w-full max-w-md h-64 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#081f38] border-2 border-[#27c4d9]/40 p-4 overflow-hidden flex flex-col justify-between shadow-[0_0_50px_rgba(39,196,217,0.25)]">
              {/* Internal Chamber Cutaway Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#27c4d9_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

              {/* Water Stream Flowing through */}
              <div
                className={`absolute inset-x-6 top-0 bottom-0 bg-gradient-to-b ${current.waterColor} opacity-70 transition-all duration-700 rounded-xl overflow-hidden`}
              >
                {/* Flowing animated stream lines */}
                <div className="w-full h-full relative">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 rounded-full bg-white/70 animate-pulse"
                      style={{
                        height: `${Math.random() * 25 + 15}px`,
                        left: `${10 + i * 11}%`,
                        top: `${(i * 12) % 60}%`,
                        animationDuration: '1.2s',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Special Stage Overlay Visuals */}
              {activeStage === 4 && (
                /* Stage 4: UV Violet Pulsing Glow */
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-52 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-400 to-violet-600 blur-md opacity-90 animate-pulse shadow-[0_0_60px_#a855f7]" />
                  <div className="absolute text-center">
                    <span className="text-xs font-mono font-black text-fuchsia-200 tracking-wider bg-black/60 px-3 py-1 rounded-full border border-fuchsia-400">
                      ⚡ 254nm GERMICIDAL UV ACTIVE
                    </span>
                  </div>
                </div>
              )}

              {activeStage === 5 && (
                /* Stage 5: Copper & Mineral Sparkling Cartridge */
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-36 rounded-2xl bg-gradient-to-r from-amber-600/40 via-amber-400/30 to-cyan-400/30 border border-amber-400/60 flex items-center justify-center p-3">
                    <div className="text-center">
                      <span className="text-xs font-mono font-bold text-amber-300 block">
                        ✦ Cu²⁺ ACTIVE COPPER IONS ✦
                      </span>
                      <span className="text-[10px] text-amber-100 font-mono">
                        Ca + Mg Mineral Balancing
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeStage === 6 && (
                /* Stage 6: Pouring into Glass with Wave Motion & Checkmark */
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="relative w-24 h-32 rounded-b-2xl border-2 border-white/60 bg-white/10 backdrop-blur-md overflow-hidden flex flex-col justify-end p-1 shadow-2xl">
                    {/* Realistic wave fluid fill */}
                    <div className="w-full h-24 bg-gradient-to-t from-[#0b74de] to-[#27c4d9] rounded-b-xl relative overflow-hidden animate-pulse">
                      <svg
                        className="absolute top-0 inset-x-0 w-full h-4 text-cyan-200 fill-current -translate-y-2 animate-bounce"
                        viewBox="0 0 100 25"
                        preserveAspectRatio="none"
                      >
                        <path d="M0 10 Q 25 0, 50 10 T 100 10 V 25 H 0 Z" />
                      </svg>
                    </div>

                    {/* Pop-in Pure & Safe Tick */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#006c2e] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                        <span className="material-symbols-outlined text-[26px]">check</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#5ee9ff] mt-2 font-mono">
                    PURE &amp; SAFE TO DRINK • 45 PPM
                  </span>
                </div>
              )}

              {/* Stage Title in Chamber */}
              <div className="relative z-10 flex justify-between items-center text-xs text-white/90">
                <span className="font-bold tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#27c4d9] animate-ping" />
                  {current.title}
                </span>
                <span className="font-mono text-cyan-300">{current.micron}</span>
              </div>

              {/* Bottom stage badge */}
              <div className="relative z-10 bg-black/50 backdrop-blur-sm p-2 rounded-xl border border-white/10 text-center">
                <p className="text-xs text-slate-200 font-medium">{current.tagline}</p>
              </div>
            </div>
          </div>

          {/* Bottom Outlet Metrics Bar */}
          <div className="relative pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#27c4d9] text-[18px]">verified</span>
              <span>Tumakuru Lab Tested: Zero Heavy Metals</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Flow Status:</span>
              <span className="font-bold text-[#5ee9ff] font-mono">
                {activeStage === 6 ? '✓ 100% PURE OUTPUT' : 'ACTIVE FILTRATION'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
