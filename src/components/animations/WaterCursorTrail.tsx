import React, { useEffect, useRef } from 'react';

interface Droplet {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  vy: number;
  vx: number;
}

export const WaterCursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only run on non-touch devices with fine pointers and no reduced-motion preference
    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (mediaQueryMotion.matches || isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const droplets: Droplet[] = [];
    let lastX = 0;
    let lastY = 0;
    let throttleCount = 0;

    const handleMouseMove = (e: MouseEvent) => {
      throttleCount++;
      if (throttleCount % 2 !== 0) return; // limit frequency for 60fps

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 2 && droplets.length < 35) {
        droplets.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          radius: Math.random() * 3 + 2,
          alpha: 0.65,
          vy: Math.random() * 0.8 + 0.3,
          vx: (Math.random() - 0.5) * 0.6,
        });
      }

      lastX = e.clientX;
      lastY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.y += d.vy;
        d.x += d.vx;
        d.alpha -= 0.02;
        d.radius *= 0.98;

        if (d.alpha <= 0 || d.radius <= 0.5) {
          droplets.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
          d.x - d.radius * 0.3,
          d.y - d.radius * 0.3,
          d.radius * 0.1,
          d.x,
          d.y,
          d.radius
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${d.alpha})`);
        grad.addColorStop(0.4, `rgba(39, 196, 217, ${d.alpha * 0.8})`);
        grad.addColorStop(1, `rgba(11, 116, 222, ${d.alpha * 0.2})`);

        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(39, 196, 217, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-300"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
