import React, { useState, useRef } from 'react';
import { Product } from '../../types';

interface ProductCard3DProps {
  product: Product;
  onEnquire: (p: Product) => void;
  onOpen360: (p: Product) => void;
  helplinePhone: string;
  isKannada?: boolean;
}

export const ProductCard3D: React.FC<ProductCard3DProps> = ({
  product,
  onEnquire,
  onOpen360,
  helplinePhone,
  isKannada,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glossPos, setGlossPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalizing between -1 and 1
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    // 3D tilt angles (max +/- 10 degrees)
    setTilt({
      x: -normY * 9,
      y: normX * 9,
    });

    // Gloss position percentages
    setGlossPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-3xl p-5 bg-white border border-[#dae2fd] shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group select-none"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isHovered ? '-6px' : '0px'})`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 1. Rising Water-Fill Aqua Effect from bottom on Hover */}
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#27c4d9]/15 via-[#0b74de]/10 to-transparent transition-all duration-500 pointer-events-none rounded-b-3xl"
        style={{
          height: isHovered ? '45%' : '0%',
        }}
      />

      {/* 2. Dynamic Glossy Specular Light Reflection moving with cursor */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 220px at ${glossPos.x}% ${glossPos.y}%, rgba(255, 255, 255, 0.45), transparent 80%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Top Image & Ripple Burst Container */}
      <div className="relative z-10">
        <div className="relative w-full h-56 rounded-2xl bg-gradient-to-b from-[#f0f9ff] to-white flex items-center justify-center p-4 mb-4 border border-[#dae2fd]/60 overflow-hidden">
          {/* Ripple burst behind product */}
          <div
            className={`absolute w-32 h-32 rounded-full border border-[#27c4d9]/40 transition-all duration-700 pointer-events-none ${
              isHovered ? 'scale-150 opacity-60' : 'scale-90 opacity-20'
            }`}
          />
          <div
            className={`absolute w-44 h-44 rounded-full border border-[#0b74de]/25 transition-all duration-1000 pointer-events-none ${
              isHovered ? 'scale-125 opacity-40' : 'scale-75 opacity-10'
            }`}
          />

          {/* Floating Product Image with 3D Pop */}
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-auto object-contain transition-all duration-300 filter drop-shadow-md z-10 ${
              isHovered ? 'scale-108 -translate-y-1' : 'scale-100'
            }`}
            loading="lazy"
          />

          {/* Stock Tag Top Right */}
          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#006c2e] flex items-center gap-1 shadow-xs z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006c2e] animate-pulse" />
            <span>{product.stockQuantity} in stock</span>
          </div>

          {/* Quick 360° View Button over image */}
          <button
            onClick={() => onOpen360(product)}
            className="absolute bottom-2 left-2 z-20 px-2.5 py-1 rounded-full bg-white/90 hover:bg-[#06284b] hover:text-white text-[#0b74de] text-[10px] font-bold border border-[#27c4d9]/40 shadow-xs flex items-center gap-1 transition-all"
            title="Inspect in 360°"
          >
            <span className="material-symbols-outlined text-[14px]">360</span>
            <span>360° View</span>
          </button>
        </div>

        {/* Category & Shimmer Price */}
        <div className="flex items-center justify-between mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#27c4d9]/20 text-[#06284b] text-[11px] font-bold">
            {product.category}
          </span>
          <span className="font-heading font-extrabold text-[21px] text-[#0b74de] animate-shimmer-tag px-2.5 py-0.5 rounded-xl shadow-2xs">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-heading font-bold text-[18px] text-[#06284b] group-hover:text-[#0b74de] transition-colors leading-tight mb-1.5">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-[#414753] line-clamp-2 leading-relaxed mb-3">
          {product.description}
        </p>

        {/* Water Source & Mount Type */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#006c2e] mb-3 bg-[#006c2e]/10 px-2.5 py-1 rounded-lg">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>{product.targetWaterType || 'Borewell & Kaveri'}</span>
          </span>
          <span className="text-[#414753] font-normal truncate max-w-[140px]">
            {product.mountType}
          </span>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {product.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-[#f2f3ff] text-[#414753] text-[11px] font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Action Buttons with Slide-Up Transition on Hover */}
      <div className="relative z-10 pt-3 border-t border-[#dae2fd] flex items-center gap-2">
        <button
          onClick={() => onEnquire(product)}
          className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
            isHovered
              ? 'bg-[#006c2e] hover:bg-[#00883c] text-white shadow-md scale-102'
              : 'bg-[#f2f3ff] text-[#06284b] hover:bg-[#006c2e] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">chat</span>
          <span>{isHovered ? 'Order Express via WhatsApp' : 'Enquire & Buy'}</span>
        </button>

        <a
          href={`tel:${helplinePhone.replace(/[^0-9]/g, '')}`}
          className="p-2.5 bg-[#f2f3ff] hover:bg-[#0b74de] hover:text-white text-[#0b74de] rounded-xl transition-colors"
          title="Direct Phone Call"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
        </a>
      </div>
    </div>
  );
};
