import React, { useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { SupabaseConnectModal } from './Modals/SupabaseConnectModal';

interface HeaderProps {
  onToggleSidebarMobile?: () => void;
  whatsappNumber: string;
  dispatchPhone: string;
  isKannada: boolean;
  unreadCount?: number;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebarMobile,
  whatsappNumber,
  dispatchPhone,
  isKannada,
  unreadCount = 2,
  onOpenNotifications,
}) => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-4 sm:px-6 border-b border-[#dae2fd]">
      <div className="w-full h-full flex items-center justify-between">
        {/* Left: Mobile hamburger + HQ info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="lg:hidden p-2 rounded-xl text-[#414753] hover:bg-[#eaedff] transition-colors"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <span className="px-3 py-1 bg-[#eaedff] text-[#005cb3] rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
            <span className="material-symbols-outlined text-[15px]">domain</span>
            {isKannada ? 'ತುಮಕೂರು ಮುಖ್ಯ ಕಚೇರಿ' : 'Tumakuru HQ'}
          </span>

          <span className="hidden sm:inline-block text-[13px] text-[#414753] font-medium font-mono">
            • {dispatchPhone} {isKannada ? 'ಸಹಾಯವಾಣಿ' : 'Dispatch'}
          </span>
        </div>

        {/* Right: Sync Status + WhatsApp Desk + Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
              isSupabaseConfigured()
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
            title="Click to check or configure Supabase cloud database connection"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>
              {isSupabaseConfigured()
                ? isKannada ? 'ಸೂಪರ್‌ಬೇಸ್ ಲೈವ್' : 'Supabase Live'
                : isKannada ? 'ಸೂಪರ್‌ಬೇಸ್ ಸಂಪರ್ಕಿಸಿ' : 'Connect Supabase'}
            </span>
          </button>

          <a
            href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent('Hello Aqua Puro Zone Tumakuru Operations Desk')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#006c2e] text-white hover:bg-[#00883c] rounded-full text-[12px] font-semibold transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span className="hidden sm:inline">{isKannada ? 'ವಾಟ್ಸಾಪ್ ಡೆಸ್ಕ್' : 'WhatsApp Desk'}</span>
          </a>

          {/* Quick Notification trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#131b2e] hover:bg-[#e2e7ff] transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          <div className="w-9 h-9 rounded-full bg-[#005cb3] flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>

    {/* Supabase Connection Modal */}
    <SupabaseConnectModal
      isOpen={isConnectModalOpen}
      onClose={() => setIsConnectModalOpen(false)}
    />
  </>
);
};
