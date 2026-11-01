import React from 'react';
import { BRAND_LOGO_URL } from '../data/initialData';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../hooks/useAuth';

export type ScreenId = 
  | 'admin-dashboard' 
  | 'admin-products'
  | 'admin-ai-library'
  | 'admin-orders'
  | 'service-tickets-and-amc' 
  | 'inventory-and-appliances' 
  | 'tech-stack-and-architecture' 
  | 'snap-and-suggest-ai' 
  | 'home'
  | 'product-detail';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isKannada: boolean;
}

interface NavItem {
  id: ScreenId;
  icon: string;
  labelEn: string;
  labelKn: string;
  badge?: string;
  highlight?: boolean;
  subtext?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, isKannada }) => {
  const { logout } = useAuth();
  const navItems: NavSection[] = [
    {
      group: isKannada ? 'ಕಾರ್ಯಾಚರಣೆ ಕೇಂದ್ರ (OPERATIONS)' : 'Operations Core',
      items: [
        {
          id: 'admin-dashboard' as ScreenId,
          icon: 'space_dashboard',
          labelEn: 'Admin Overview',
          labelKn: 'ಅಡ್ಮಿನ್ ಅವಲೋಕನ',
        },
        {
          id: 'admin-products' as ScreenId,
          icon: 'category',
          labelEn: 'Manage Products',
          labelKn: 'ಉತ್ಪನ್ನಗಳ ನಿರ್ವಹಣೆ',
          badge: 'Catalog',
        },
        {
          id: 'admin-ai-library' as ScreenId,
          icon: 'add_photo_alternate',
          labelEn: 'Batch Upload & AI Images',
          labelKn: 'ಬ್ಯಾಚ್ ಇಮೇಜ್ ಅಪ್‌ಲೋಡ್ ಮತ್ತು AI',
          badge: 'Batch',
          highlight: true,
          subtext: 'Drag & Drop / Multi-file',
        },
        {
          id: 'admin-orders' as ScreenId,
          icon: 'receipt_long',
          labelEn: 'Client Orders (Supabase)',
          labelKn: 'ಗ್ರಾಹಕರ ಆರ್ಡರ್‌ಗಳು',
          badge: 'Live',
          highlight: true,
        },
        {
          id: 'service-tickets-and-amc' as ScreenId,
          icon: 'build_circle',
          labelEn: 'Service & AMC Queue',
          labelKn: 'ಸೇವೆ ಮತ್ತು AMC ಸರದಿ',
          badge: '5'
        },
        {
          id: 'inventory-and-appliances' as ScreenId,
          icon: 'inventory_2',
          labelEn: 'Filter & Unit Stock',
          labelKn: 'ದಾಸ್ತಾನು ಮತ್ತು ಬಿಡಿಭಾಗಗಳು',
          badge: 'Low: 3'
        },
      ]
    },
    {
      group: isKannada ? 'ಎಂಜಿನಿಯರಿಂಗ್ ಮತ್ತು ಡೇಟಾ' : 'Engineering & Data',
      items: [
        {
          id: 'tech-stack-and-architecture' as ScreenId,
          icon: 'schema',
          labelEn: 'SQL & Architecture Hub',
          labelKn: 'SQL ಮತ್ತು ಆರ್ಕಿಟೆಕ್ಚರ್',
        },
        {
          id: 'snap-and-suggest-ai' as ScreenId,
          icon: 'model_training',
          labelEn: 'AI Diagnostics Engine',
          labelKn: 'AI ವಾಟರ್ ತಪಾಸಣೆ',
          highlight: true
        },
      ]
    },
    {
      group: isKannada ? 'ಸಾರ್ವಜನಿಕ ಪೋರ್ಟಲ್' : 'Public Portal',
      items: [
        {
          id: 'home' as ScreenId,
          icon: 'storefront',
          labelEn: 'Customer Storefront',
          labelKn: 'ಗ್ರಾಹಕರ ಸ್ಟೋರ್‌ಫ್ರಂಟ್',
          subtext: 'Live Tumakuru Web'
        },
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#f2f3ff] z-50 flex flex-col shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#dae2fd]">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between bg-[#eaedff] border-b border-[#dae2fd]">
        <BrandLogo variant="compact" size="sm" />
      </div>

      {/* Node Status Indicator */}
      <div className="p-3">
        <div className="p-2.5 bg-[#e2e7ff] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006c2e] animate-pulse"></span>
            <span className="text-[11px] text-[#131b2e] font-semibold">
              {isKannada ? 'ತುಮಕೂರು ನೋಡ್ ಸಕ್ರಿಯ' : 'Tumakuru Node Active'}
            </span>
          </div>
          <span className="text-[11px] font-mono font-medium text-[#414753] bg-white/60 px-1.5 py-0.5 rounded">
            v2.4
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 space-y-3 overflow-y-auto pt-1 pb-4">
        {navItems.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-[#414753] uppercase tracking-wider">
              {section.group}
            </div>
            {section.items.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left group ${
                    isActive
                      ? 'bg-[#0b74de] text-white font-semibold shadow-sm'
                      : 'text-[#414753] hover:bg-[#e2e7ff] hover:text-[#131b2e] font-medium text-[13px]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`material-symbols-outlined text-[20px] transition-transform ${
                      isActive ? 'text-white' : 'text-[#414753] group-hover:text-[#005cb3]'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="truncate">
                      {isKannada ? item.labelKn : item.labelEn}
                    </span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#5ee9ff] text-[#004f58] font-bold">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Branch Profile Footer */}
      <div className="p-3.5 bg-[#e2e7ff]/60 border-t border-[#dae2fd]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#005cb3] flex items-center justify-center text-white shadow-sm font-semibold">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] text-[#131b2e] truncate font-semibold leading-tight">
              {isKannada ? 'ಶಾಖಾ ವ್ಯವಸ್ಥಾಪಕರು' : 'Branch Manager'}
            </span>
            <span className="text-[11px] text-[#414753] truncate">
              Sira Gate Store • Tumakuru
            </span>
          </div>
        </div>
        <button
          onClick={async () => {
            await logout();
            onNavigate('home');
          }}
          className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold border border-red-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">logout</span>
          <span>{isKannada ? 'ಲಾಗ್ ಔಟ್ ಮತ್ತು ಸ್ಟೋರ್‌ಫ್ರಂಟ್‌ಗೆ ಹಿಂತಿರುಗಿ' : 'Sign Out to Storefront'}</span>
        </button>
      </div>
    </aside>
  );
};
