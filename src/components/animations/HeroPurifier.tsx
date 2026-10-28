import React, { useState, useEffect, useRef } from 'react';

interface HeroPurifierProps {
  imageSrc?: string;
  name?: string;
  price?: number;
  onEnquire?: () => void;
  onOpen360?: () => void;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
}

interface SplashRipple {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export const HeroPurifier: React.FC<HeroPurifierProps> = ({
  imageSrc = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUVE7DaOBBSuPezP7wcO14Xex0UztO4006u2e2ZeS6y4JktEhCZtgM10E9-VKyAae8cjxtBERTcKjLdWcOq5K1kNrxzP1lwo06VWwzkLEAsD3DDRuLZC0JN582KlztwFYwmxanszCaT9I5ShBkM6Z5VdJkaJ9KNEi4fAdEUHaVT3K9R0nP7rN9EUddAP0oqDkRdteJdCZT3O8F_0igxecxXmksJTrI0UJ4MD6bd2yjevqxVwDD8cg',
  name = 'AquaPure Copper Max Pro RO+UV',
  price = 16499,
  onEnquire,
  onOpen360,
}) => {
  // 3D Mouse Parallax & Tilt State
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Canvas for falling droplets and splash ripples
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Floating glass badges orbiting around the purifier
  const badges = [
    { label: 'RO + UV + UF', sub: 'Triple Barrier Purity', icon: 'shield', color: 'from-[#27c4d9]/30 to-[#0b74de]/20' },
    { label: '99.9% Pure', sub: 'Zero Bacteria Guarantee', icon: 'verified', color: 'from-[#006c2e]/20 to-[#27c4d9]/20' },
    { label: 'Free Installation', sub: 'Same-Day in Tumakuru', icon: 'local_shipping', color: 'from-[#0b74de]/25 to-[#06284b]/20' },
    { label: '5.0 ★ Rated', sub: 'Over 1,200+ Homes', icon: 'star', color: 'from-amber-500/20 to-[#27c4d9]/20' },
  ];

  // Active badge orbital rotation index
  const [activeBadgeIdx, setActiveBadgeIdx] = useState(0);

  useEffect(() => {
    const badgeInterval = setInterval(() => {
      setActiveBadgeIdx((prev) => (prev + 1) % badges.length);
    }, 3200);
    return () => clearInterval(badgeInterval);
  }, [badges.length]);

  // Handle 3D Tilt on Desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Constrain tilt to max +/- 12 degrees
    const tiltX = -(mouseY / (rect.height / 2)) * 10;
    const tiltY = (mouseX / (rect.width / 2)) * 12;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Falling water droplets & splash canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Droplet {
      x: number;
      y: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const droplets: Droplet[] = [];
    const splashes: SplashRipple[] = [];

    // Base splash plane at 85% of height
    const baseLine = height * 0.86;

    let spawnTimer = 0;
    let animId: number;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Spawn new droplets periodically
      spawnTimer++;
      if (spawnTimer % 28 === 0 && droplets.length < 8) {
        droplets.push({
          x: width * 0.5 + (Math.random() - 0.5) * (width * 0.45),
          y: 0,
          vy: Math.random() * 2.5 + 3.5,
          radius: Math.random() * 2 + 2,
          alpha: 0.8,
        });
      }

      // Update and draw droplets
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.y += d.vy;

        if (d.y >= baseLine) {
          // Splash ripple triggered
          splashes.push({
            id: Date.now() + Math.random(),
            x: d.x,
            y: baseLine,
            radius: 2,
            maxRadius: Math.random() * 18 + 14,
            opacity: 0.85,
          });
          droplets.splice(i, 1);
          continue;
        }

        // Draw falling teardrop
        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(39, 196, 217, ${d.alpha})`;
        ctx.shadowColor = 'rgba(94, 233, 255, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();

        // Droplet tail
        ctx.beginPath();
        ctx.moveTo(d.x - d.radius * 0.8, d.y);
        ctx.lineTo(d.x, d.y - d.radius * 2.5);
        ctx.lineTo(d.x + d.radius * 0.8, d.y);
        ctx.fillStyle = `rgba(39, 196, 217, ${d.alpha * 0.6})`;
        ctx.fill();
        ctx.restore();
      }

      // Update and draw splash ripples
      for (let j = splashes.length - 1; j >= 0; j--) {
        const s = splashes[j];
        s.radius += 0.8;
        s.opacity -= 0.025;

        if (s.opacity <= 0 || s.radius >= s.maxRadius) {
          splashes.splice(j, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        // Elliptical ripple on horizontal floor
        ctx.ellipse(s.x, s.y, s.radius * 1.6, s.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(94, 233, 255, ${s.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-xl mx-auto flex flex-col items-center justify-center select-none py-6"
      style={{ perspective: '1100px' }}
    >
      {/* 1. Glowing Aqua Radial-Gradient Background Circle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Pulsing Outer Aqua Aura */}
        <div className="w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-[#06284b] via-[#0b74de]/40 to-[#27c4d9]/45 blur-2xl animate-pulse opacity-80" />

        {/* Orbiting concentric water ripples expanding outward */}
        <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-[#27c4d9]/30 animate-ping opacity-25" style={{ animationDuration: '4s' }} />
        <div className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full border-2 border-[#5ee9ff]/40 animate-ping opacity-35" style={{ animationDuration: '3s' }} />

        {/* Center glowing disk */}
        <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-radial from-[#27c4d9]/40 via-[#0b74de]/20 to-transparent blur-xl" />
      </div>

      {/* 2. Interactive Canvas Layer (falling droplets and splash ripples) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* 3. Rising Tiny Bubbles with random drift */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-t from-white/70 to-[#5ee9ff]/90 border border-white/50 backdrop-blur-2xs animate-float-slow"
            style={{
              width: `${(i % 4) * 3 + 4}px`,
              height: `${(i % 4) * 3 + 4}px`,
              left: `${15 + (i * 6.5) % 70}%`,
              bottom: `${10 + (i * 7) % 65}%`,
              animationDuration: `${3.5 + (i % 3) * 1.2}s`,
              animationDelay: `${i * 0.4}s`,
              opacity: 0.7,
              boxShadow: '0 0 8px rgba(94, 233, 255, 0.6)',
            }}
          />
        ))}
      </div>

      {/* 4. Purifier Stage with 3D Tilt & Gentle 3-4s Float Loop */}
      <div
        className="relative z-20 flex flex-col items-center transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isHovered ? '-4px' : '0px'})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Floating Purifier Container */}
        <div className="relative group">
          {/* Gentle Float Keyframe applied to Purifier Image */}
          <div className="animate-float-slow relative">
            <img
              src={imageSrc}
              alt={name}
              className="h-72 sm:h-84 md:h-96 w-auto object-contain filter drop-shadow-[0_20px_35px_rgba(6,40,75,0.4)] transition-transform duration-300 group-hover:scale-102"
              loading="eager"
            />

            {/* Light sparkles / shine sweep gleam effect across the purifier */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
              <div
                className="absolute -inset-full top-0 w-[60%] h-full bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-25deg] pointer-events-none animate-shimmer"
                style={{ animationDuration: '4.5s', animationIterationCount: 'indefinite' }}
              />
            </div>

            {/* Tap outlet with drip drop animation */}
            <div className="absolute bottom-14 right-6 sm:right-10 flex flex-col items-center pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ee9ff] shadow-[0_0_8px_#5ee9ff] animate-ping" />
              <span className="w-1 h-2 rounded-full bg-[#27c4d9]/80 animate-bounce mt-0.5" />
            </div>
          </div>

          {/* Synchronized Ground Shadow scaling with float loop */}
          <div className="w-48 sm:w-64 h-6 sm:h-8 mx-auto mt-2 rounded-full bg-radial from-[#06284b]/60 via-[#0b74de]/20 to-transparent blur-md transition-all duration-300 scale-95 group-hover:scale-90 opacity-75" />
        </div>

        {/* 5. Orbiting Glass-Style Floating Badges */}
        <div className="absolute -top-3 -left-2 sm:-left-8 z-30 transition-all duration-500 ease-out">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/85 dark:bg-[#06284b]/85 backdrop-blur-md border border-[#27c4d9]/40 shadow-lg hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px] text-[#0b74de]">
              {badges[activeBadgeIdx].icon}
            </span>
            <div>
              <div className="text-[12px] font-bold text-[#06284b] dark:text-white leading-tight">
                {badges[activeBadgeIdx].label}
              </div>
              <div className="text-[9px] text-[#414753] dark:text-[#27c4d9] font-medium">
                {badges[activeBadgeIdx].sub}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-1/3 -right-2 sm:-right-8 z-30 transition-all duration-500 ease-out">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/85 dark:bg-[#06284b]/85 backdrop-blur-md border border-[#27c4d9]/40 shadow-lg hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px] text-amber-500">
              star
            </span>
            <div>
              <div className="text-[12px] font-bold text-[#06284b] dark:text-white leading-tight">
                5.0 ★ Rated
              </div>
              <div className="text-[9px] text-[#414753] dark:text-[#27c4d9] font-medium">
                Tumakuru Families
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-16 -left-3 sm:-left-6 z-30 transition-all duration-500 ease-out">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/85 dark:bg-[#06284b]/85 backdrop-blur-md border border-[#006c2e]/40 shadow-lg hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px] text-[#006c2e]">
              verified
            </span>
            <div>
              <div className="text-[12px] font-bold text-[#006c2e] leading-tight">
                99.9% Pure
              </div>
              <div className="text-[9px] text-[#414753] dark:text-[#27c4d9] font-medium">
                Copper Mineralized
              </div>
            </div>
          </div>
        </div>

        {/* 6. Quick Interactive Controls below the Purifier */}
        <div className="mt-4 flex items-center gap-2.5 z-30">
          {onOpen360 && (
            <button
              onClick={onOpen360}
              className="px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#06284b]/90 backdrop-blur-md text-[#0b74de] hover:text-white hover:bg-[#0b74de] border border-[#27c4d9]/50 text-[12px] font-bold shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[16px]">360</span>
              <span>Interactive 360° View</span>
            </button>
          )}

          <div className="px-3 py-1 rounded-full bg-[#27c4d9]/20 text-[#06284b] dark:text-[#27c4d9] text-[11px] font-bold border border-[#27c4d9]/30">
            ₹{price.toLocaleString('en-IN')} • In Stock
          </div>
        </div>
      </div>
    </div>
  );
};
