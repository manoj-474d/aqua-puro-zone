import React, { useState } from 'react';
import { Lead } from '../../types';

interface PhotoPreviewModalProps {
  lead: Lead | null;
  onClose: () => void;
  isKannada: boolean;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({ lead, onClose, isKannada }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#dae2fd] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#dae2fd] flex items-center justify-between bg-[#f2f3ff]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#005cb3]">photo_camera</span>
            <div>
              <h3 className="font-heading font-semibold text-[15px] text-[#131b2e]">
                {lead.customerName} • {lead.spaceTitle}
              </h3>
              <p className="text-[12px] text-[#414753]">
                {lead.locality} • TDS: <span className="font-mono font-bold text-[#ba1a1a]">{lead.tdsPpm} PPM</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
              className="p-1.5 rounded-lg bg-white border border-[#dae2fd] text-[#414753] hover:text-[#131b2e]"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>
            <span className="text-[11px] font-mono font-medium px-1 text-[#414753]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 rounded-lg bg-white border border-[#dae2fd] text-[#414753] hover:text-[#131b2e]"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
            <button
              onClick={onClose}
              className="ml-2 p-1.5 rounded-lg text-[#414753] hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Image Preview Canvas */}
        <div className="flex-1 bg-[#131b2e] p-4 flex items-center justify-center overflow-auto min-h-[300px] max-h-[520px]">
          <img
            src={lead.spaceImage}
            alt={lead.spaceTitle}
            className="rounded-lg object-contain transition-transform duration-200 shadow-lg max-h-[480px]"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        </div>

        {/* Footer with AI notes & quick contact */}
        <div className="px-5 py-3.5 bg-[#f2f3ff] border-t border-[#dae2fd] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[12px] text-[#414753] max-w-md">
            <span className="font-semibold text-[#005cb3]">
              {isKannada ? 'AI ಸಲಹೆ: ' : 'AI Analysis: '}
            </span>
            {lead.aiRecommendation}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
              className="px-3.5 py-1.5 bg-[#0b74de] text-white hover:bg-[#095eb3] rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              {isKannada ? 'ಕರೆ ಮಾಡಿ' : 'Call Customer'}
            </a>
            <a
              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.customerName}, this is Aqua Puro Zone Sira Gate Tumakuru regarding your water purifier inquiry.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-[#006c2e] text-white hover:bg-[#00883c] rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
