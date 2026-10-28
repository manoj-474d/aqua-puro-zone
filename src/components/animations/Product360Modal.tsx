import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../../types';

interface Product360ModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEnquire: (p: Product) => void;
}

export const Product360Modal: React.FC<Product360ModalProps> = ({
  product,
  isOpen,
  onClose,
  onEnquire,
}) => {
  const [rotationAngle, setRotationAngle] = useState(0); // 0 to 360
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [autoSpin, setAutoSpin] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState<'360' | 'xray' | 'specs'>('360');

  // Auto-spin loop
  useEffect(() => {
    if (!autoSpin || !isOpen || isDragging) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1.5) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [autoSpin, isOpen, isDragging]);

  if (!isOpen || !product) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setAutoSpin(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    setRotationAngle((prev) => (prev + delta * 0.75 + 360) % 360);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      setStartX(e.touches[0].clientX);
      setAutoSpin(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const delta = e.touches[0].clientX - startX;
    setRotationAngle((prev) => (prev + delta * 0.75 + 360) % 360);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Optical transform calculation for 3D simulation
  // As it rotates around Y axis, calculate depth, specular sheen and scale
  const rad = (rotationAngle * Math.PI) / 180;
  const scaleX = Math.cos(rad);
  const depthZ = Math.sin(rad) * 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#06284b] text-white rounded-3xl overflow-hidden border-2 border-[#27c4d9]/50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#081f38]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#27c4d9]/20 flex items-center justify-center text-[#27c4d9]">
              <span className="material-symbols-outlined text-[20px]">360</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{product.name}</h3>
              <p className="text-xs text-[#27c4d9]">
                Interactive 360° Studio Inspection • Sira Gate Tumakuru
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('360')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 ${
              activeTab === '360'
                ? 'border-[#27c4d9] text-[#27c4d9] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            360° Turntable View
          </button>
          <button
            onClick={() => setActiveTab('xray')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'xray'
                ? 'border-[#27c4d9] text-[#27c4d9] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Internal X-Ray Filters
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'specs'
                ? 'border-[#27c4d9] text-[#27c4d9] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Full Hardware Specs
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[380px]">
          {activeTab === '360' && (
            <div className="w-full flex flex-col items-center select-none">
              {/* Interactive Rotator Canvas Area */}
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative w-full max-w-md h-72 rounded-2xl bg-gradient-to-b from-[#0a2342] to-[#04162a] border border-[#27c4d9]/30 flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden shadow-inner group"
                style={{ perspective: '1000px' }}
              >
                {/* Radial aqua pedestal light */}
                <div className="absolute inset-0 bg-radial from-[#27c4d9]/25 via-transparent to-transparent pointer-events-none" />

                {/* Rotating Turntable Ring at base */}
                <div className="absolute bottom-6 w-56 h-14 rounded-full border-2 border-dashed border-[#27c4d9]/40 pointer-events-none animate-spin" style={{ animationDuration: '20s' }} />

                {/* Simulated 3D Product Image with perspective yaw rotation */}
                <div
                  className="relative transition-transform duration-75 ease-out"
                  style={{
                    transform: `scale(${zoomLevel}) rotateY(${rotationAngle}deg) translateZ(${depthZ}px)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-56 w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] pointer-events-none"
                  />

                  {/* Dynamic Specular Lighting glint based on angle */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-xl"
                    style={{
                      background: `linear-gradient(${rotationAngle}deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)`,
                      opacity: Math.abs(scaleX),
                    }}
                  />
                </div>

                {/* Drag hint label */}
                <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                  <span className="text-[11px] font-mono text-[#5ee9ff] bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
                    ⇄ Drag horizontally to spin • Angle: {Math.round(rotationAngle)}°
                  </span>
                </div>
              </div>

              {/* Turntable Controls */}
              <div className="flex items-center gap-4 mt-5">
                <button
                  onClick={() => setRotationAngle((prev) => (prev - 45 + 360) % 360)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Rotate Left 45°"
                >
                  <span className="material-symbols-outlined text-[20px]">rotate_left</span>
                </button>

                <button
                  onClick={() => setAutoSpin(!autoSpin)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    autoSpin
                      ? 'bg-[#27c4d9] text-[#06284b]'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {autoSpin ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{autoSpin ? 'Pause 360° Auto-Spin' : 'Auto-Spin 360°'}</span>
                </button>

                <button
                  onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Rotate Right 45°"
                >
                  <span className="material-symbols-outlined text-[20px]">rotate_right</span>
                </button>

                <div className="h-5 w-[1px] bg-white/20 mx-1" />

                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.8, Math.min(1.4, z + (z > 1 ? -0.2 : 0.2))))}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                  <span>{zoomLevel > 1 ? 'Reset Zoom' : 'Zoom 1.2x'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'xray' && (
            <div className="w-full max-w-xl space-y-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#27c4d9] text-[24px]">layers</span>
                <div>
                  <h4 className="font-bold text-sm text-white">Multi-Layer Composite Shell</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Food-grade ABS outer housing with leak-proof brass fittings and antibacterial food-grade storage tank.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-400 text-[24px]">bolt</span>
                <div>
                  <h4 className="font-bold text-sm text-white">Active Copper Infusion Cartridge</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Charges every litre of water with 99.9% pure micro-copper ions that boost immunity and soothe digestive health.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <span className="material-symbols-outlined text-violet-400 text-[24px]">lightbulb</span>
                <div>
                  <h4 className="font-bold text-sm text-white">11W Philips UV Sterilizer</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Stainless steel chamber housing a quartz sleeve UV lamp that neutralizes 99.99% pathogens on instant contact.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="w-full max-w-xl grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">Tank Capacity</span>
                <span className="font-bold text-white text-sm">{product.capacity}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">Mounting Type</span>
                <span className="font-bold text-white text-sm">{product.mountType}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">Ideal Water Source</span>
                <span className="font-bold text-white text-sm">{product.targetWaterType || 'Borewell & Kaveri'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">Physical Warehouse Stock</span>
                <span className="font-bold text-[#4ae176] text-sm">{product.stockQuantity} Units In Stock</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-[#081f38] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-mono text-[#27c4d9]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-300">• Free Installation Included</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onEnquire(product)}
              className="px-5 py-2.5 rounded-xl bg-[#006c2e] hover:bg-[#00883c] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Enquire &amp; Order on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
