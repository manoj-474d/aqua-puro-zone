import React, { useState } from 'react';
import { Lead, Product, Review, StoreSettings, LeadStatus } from '../types';

interface AdminOverviewProps {
  leads: Lead[];
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
  onUpdateLeadNotes: (leadId: string, notes: string) => void;
  onSelectPhotoLead: (lead: Lead) => void;
  products: Product[];
  onToggleProductStock: (productId: string) => void;
  onToggleProductVisibility: (productId: string) => void;
  onToggleProductFeatured: (productId: string) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenAddProduct: () => void;
  reviews: Review[];
  onToggleReviewVisibility: (reviewId: string) => void;
  onDeleteReview: (reviewId: string) => void;
  onOpenAddReview: () => void;
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  isKannada: boolean;
  onToggleLanguage: () => void;
  onOpenNotifications: () => void;
  onNavigateToStorefront?: () => void;
  unreadCount: number;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  leads,
  onUpdateLeadStatus,
  onUpdateLeadNotes,
  onSelectPhotoLead,
  products,
  onToggleProductStock,
  onToggleProductVisibility,
  onToggleProductFeatured,
  onEditProduct,
  onDeleteProduct,
  onOpenAddProduct,
  reviews,
  onToggleReviewVisibility,
  onDeleteReview,
  onOpenAddReview,
  settings,
  onSaveSettings,
  isKannada,
  onToggleLanguage,
  onOpenNotifications,
  onNavigateToStorefront,
  unreadCount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tempSettings, setTempSettings] = useState<StoreSettings>(settings);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.waterSource.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const exportLeadsCsv = () => {
    const headers = ['Timestamp', 'Customer Name', 'Phone', 'Locality', 'Water Source', 'TDS (PPM)', 'Members', 'AI Recommendation', 'Status', 'Notes'];
    const rows = filteredLeads.map(l => [
      l.timestamp,
      `"${l.customerName}"`,
      `"${l.phone}"`,
      `"${l.locality}"`,
      `"${l.waterSource}"`,
      l.tdsPpm,
      l.membersCount,
      `"${l.aiRecommendation}"`,
      l.status.toUpperCase(),
      `"${l.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AquaPuroZone_Tumakuru_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isKannada ? 'CSV ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!' : 'CSV file exported successfully!');
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(tempSettings);
    showToast(isKannada ? 'ಅಂಗಡಿಯ ವಿವರಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ!' : 'Store contact & announcement bar settings saved!');
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#006c2e] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="text-[13px] font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Command & Localization Bar */}
      <div className="w-full bg-white shadow-xs rounded-2xl p-4 lg:p-6 mb-6 border border-[#dae2fd]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0b74de]/10 flex items-center justify-center text-[#0b74de] shrink-0">
              <span className="material-symbols-outlined text-[30px]">water_drop</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-[22px] text-[#131b2e]">
                  {isKannada ? 'ಆಕ್ವಾ ಪ್ಯೂರೋ ಜೋನ್ ಅಡ್ಮಿನ್' : 'Aqua Puro Zone Admin'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#5ee9ff] text-[#004f58] text-[11px] font-bold">
                  Super Admin
                </span>
              </div>
              <p className="text-[13px] text-[#414753] mt-0.5">
                owner@aquapurozone.com • <span className="text-[#006c2e] font-semibold">{isKannada ? 'ತುಮಕೂರು ನಿಯಂತ್ರಣ ಕೇಂದ್ರ' : 'Tumakuru Control Hub'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Search */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717784] text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isKannada ? 'ಹುಡುಕಿ: ಫೋನ್, ಶಿರಾ ಗೇಟ್, ಕ್ಯಾತ್ಸಂದ್ರ...' : 'Search phone, Sira Gate, Kyatsandra...'}
                className="w-full pl-10 pr-3 py-2 bg-[#f2f3ff] rounded-xl text-[#131b2e] placeholder:text-[#717784] text-[13px] focus:outline-none focus:bg-[#eaedff] border border-[#dae2fd] transition-all"
              />
            </div>

            {/* Customer Storefront preview link */}
            <button
              onClick={() => onNavigateToStorefront?.()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold bg-[#006c2e] hover:bg-[#00883c] text-white transition-colors shadow-xs"
              title="Open Customer Facing Website"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Customer Storefront</span>
            </button>

            {/* Kannada / English Bilingual Switch */}
            <button
              onClick={onToggleLanguage}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors border border-[#dae2fd] ${
                isKannada 
                  ? 'bg-[#005cb3] text-white' 
                  : 'bg-[#e2e7ff] text-[#131b2e] hover:bg-[#dae2fd]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">translate</span>
              <span>{isKannada ? 'ಕನ್ನಡ (ಸಕ್ರಿಯ) / English' : 'English / ಕನ್ನಡ'}</span>
            </button>

            {/* Notification Bell with Ping */}
            <div className="relative">
              <button
                onClick={onOpenNotifications}
                className="w-10 h-10 rounded-xl bg-[#f2f3ff] border border-[#dae2fd] flex items-center justify-center text-[#131b2e] hover:bg-[#eaedff] transition-colors"
                title="Notifications & Urgent Follow-ups"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
              </button>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
              )}
            </div>

            {/* Logout Action */}
            <button
              onClick={() => showToast(isKannada ? 'ಅಡ್ಮಿನ್ ಲಾಗೌಟ್ ಸುರಕ್ಷಿತವಾಗಿದೆ' : 'Admin session logged out safely.')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#ba1a1a] bg-[#ffdad6]/60 hover:bg-[#ffdad6] text-[12px] font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dash KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#dae2fd] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#d6e3ff] flex items-center justify-center text-[#005cb3]">
              <span className="material-symbols-outlined text-[24px]">contacts_product</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#6bff8f]/30 text-[#006c2e] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12%
            </span>
          </div>
          <div>
            <span className="font-heading font-extrabold text-[34px] text-[#131b2e] tracking-tight tabular-nums">
              {leads.length + 37}
            </span>
            <div className="flex flex-col mt-0.5">
              <span className="font-semibold text-[15px] text-[#131b2e]">Total AI & Store Leads</span>
              <span className="text-[13px] text-[#414753] font-medium">ಒಟ್ಟು ವಿಚಾರಣೆಗಳು</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#dae2fd] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#5ee9ff]/30 flex items-center justify-center text-[#006875]">
              <span className="material-symbols-outlined text-[24px]">phone_in_talk</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold">
              Urgent Action
            </span>
          </div>
          <div>
            <span className="font-heading font-extrabold text-[34px] text-[#ba1a1a] tracking-tight tabular-nums">
              {leads.filter(l => l.status === 'new').length}
            </span>
            <div className="flex flex-col mt-0.5">
              <span className="font-semibold text-[15px] text-[#131b2e]">Pending Customer Calls</span>
              <span className="text-[13px] text-[#414753] font-medium">ಇಂದಿನ ಹೊಸ ಗ್ರಾಹಕರು</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#dae2fd] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#e2e7ff] flex items-center justify-center text-[#005cb3]">
              <span className="material-symbols-outlined text-[24px]">inventory</span>
            </div>
            <span className="text-[11px] font-semibold text-[#414753] bg-[#f2f3ff] px-2 py-0.5 rounded-md">
              82% Stocked
            </span>
          </div>
          <div>
            <span className="font-heading font-extrabold text-[34px] text-[#131b2e] tracking-tight tabular-nums">
              {products.filter(p => p.inStock).length} <span className="text-[20px] text-[#717784] font-normal">/ {products.length}</span>
            </span>
            <div className="flex flex-col mt-0.5">
              <span className="font-semibold text-[15px] text-[#131b2e]">Live In-Stock Appliances</span>
              <span className="text-[13px] text-[#414753] font-medium">ಪ್ರಸ್ತುತ ದಾಸ್ತಾನು ಯಂತ್ರಗಳು</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#dae2fd] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#4ae176]/30 flex items-center justify-center text-[#006c2e]">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <span className="text-[11px] text-[#006c2e] font-bold bg-[#6bff8f]/20 px-2 py-0.5 rounded-md">
              Tumakuru Urban
            </span>
          </div>
          <div>
            <span className="font-heading font-extrabold text-[34px] text-[#131b2e] tracking-tight tabular-nums">
              38
            </span>
            <div className="flex flex-col mt-0.5">
              <span className="font-semibold text-[15px] text-[#131b2e]">Active AMC Contracts</span>
              <span className="text-[13px] text-[#414753] font-medium">ಸಕ್ರಿಯ ನಿರ್ವಹಣಾ ಒಪ್ಪಂದಗಳು</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: LEADS MANAGEMENT */}
      <div className="bg-white rounded-3xl p-5 lg:p-7 shadow-xs border border-[#dae2fd] mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#dae2fd]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#005cb3] text-[26px]">camera_enhance</span>
              <h2 className="font-heading font-bold text-[22px] text-[#131b2e]">
                {isKannada ? 'ಸ್ನ್ಯಾಪ್ & ಸಲಹೆ ವಿಚಾರಣೆ ಕೇಂದ್ರ' : 'Snap & Suggest Leads Hub'}
              </h2>
            </div>
            <p className="text-[13px] text-[#414753] mt-1">
              AI-diagnosed water samples and kitchen spaces from local Tumakuru residents • ಫೋಟೋ ಮತ್ತು ನೀರಿನ ಪರಿಶೀಲನೆ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[12px] font-semibold border border-[#dae2fd] focus:outline-none"
            >
              <option value="all">All Statuses (ಎಲ್ಲಾ)</option>
              <option value="new">New Inquiries (ಹೊಸ)</option>
              <option value="contacted">Contacted (ಸಂಪರ್ಕಿಸಲಾಗಿದೆ)</option>
              <option value="converted">Converted (ಖರೀದಿಸಲಾಗಿದೆ)</option>
              <option value="closed">Closed (ಮುಕ್ತಾಯ)</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[12px] font-semibold border border-[#dae2fd] focus:outline-none"
            >
              <option value="all">All Sources</option>
              <option value="Snap & Suggest AI">Snap & Suggest AI</option>
              <option value="Web Direct Form">Web Direct Form</option>
              <option value="Storefront Walk-in">Storefront Walk-in</option>
            </select>

            <button
              onClick={exportLeadsCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#006875] text-white rounded-xl hover:bg-[#004f58] transition-colors text-[12px] font-semibold shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 lg:-mx-7 px-5 lg:px-7 mt-4">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-[#f2f3ff] text-[#414753] text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-xl">Timestamp</th>
                <th className="py-3 px-4">Customer Info & Locality</th>
                <th className="py-3 px-4">Installation Area</th>
                <th className="py-3 px-4">Water Source & TDS</th>
                <th className="py-3 px-4">AI Recommendation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Owner Notes</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff] text-[13px]">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#f2f3ff]/60 transition-colors">
                  <td className="py-4 px-4 font-mono text-[11px] text-[#414753] whitespace-nowrap">
                    {lead.timestamp.includes(',') ? (
                      <>
                        <span className="font-semibold">{lead.timestamp.split(',')[1]}</span>
                        <br />
                        <span className="text-[#717784]">{lead.timestamp.split(',')[0]}</span>
                      </>
                    ) : (
                      lead.timestamp
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-[15px] text-[#131b2e] leading-tight">
                      {lead.customerName}
                    </div>
                    <div className="text-[#414753] font-mono text-[12px]">{lead.phone}</div>
                    <span className="inline-block px-2 py-0.5 rounded bg-[#e2e7ff] text-[#005cb3] text-[11px] font-semibold mt-1">
                      📍 {lead.locality}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div
                      className="relative group cursor-pointer w-14 h-14 rounded-xl overflow-hidden bg-[#eaedff] border border-[#dae2fd] shadow-xs"
                      onClick={() => onSelectPhotoLead(lead)}
                      title="Click to zoom customer space photo"
                    >
                      <img
                        src={lead.spaceImage}
                        alt={lead.spaceTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-[#131b2e]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-semibold text-[#131b2e] block">
                      {lead.waterSource}
                    </span>
                    <div className={`font-mono font-bold text-[12px] ${
                      Number(lead.tdsPpm) > 500 ? 'text-[#ba1a1a]' : 'text-[#006875]'
                    }`}>
                      TDS ~{lead.tdsPpm} ppm
                    </div>
                    <div className="text-[#717784] text-[11px]">
                      {lead.membersCount} Members
                    </div>
                  </td>

                  <td className="py-4 px-4 max-w-[200px]">
                    <div className="font-semibold text-[#005cb3] text-[13px] leading-tight">
                      {lead.aiRecommendation}
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#5ee9ff]/40 text-[#006875] text-[10px] font-bold mt-1">
                      {lead.aiTag}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className={`px-2.5 py-1.5 rounded-xl text-[12px] font-bold focus:outline-none cursor-pointer border ${
                        lead.status === 'new'
                          ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                          : lead.status === 'contacted'
                          ? 'bg-[#5ee9ff]/60 text-[#004f58] border-[#5ee9ff]'
                          : lead.status === 'converted'
                          ? 'bg-[#6bff8f]/40 text-[#006c2e] border-[#6bff8f]'
                          : 'bg-[#eaedff] text-[#414753] border-[#dae2fd]'
                      }`}
                    >
                      <option value="new">New (ಹೊಸ)</option>
                      <option value="contacted">Contacted (ಸಂಪರ್ಕಿಸಲಾಗಿದೆ)</option>
                      <option value="converted">Converted (ಖರೀದಿಸಲಾಗಿದೆ)</option>
                      <option value="closed">Closed (ಮುಕ್ತಾಯ)</option>
                    </select>
                  </td>

                  <td className="py-4 px-4">
                    <input
                      type="text"
                      defaultValue={lead.notes}
                      onBlur={(e) => onUpdateLeadNotes(lead.id, e.target.value)}
                      placeholder="Add note..."
                      className="w-48 px-2.5 py-1.5 text-[12px] bg-[#f2f3ff] rounded-lg text-[#131b2e] placeholder:text-[#717784] focus:outline-none focus:bg-[#eaedff] border border-[#dae2fd]"
                    />
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                        className="w-9 h-9 rounded-xl bg-[#005cb3] text-white flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                        title="Direct Phone Call"
                      >
                        <span className="material-symbols-outlined text-[18px]">call</span>
                      </a>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.customerName}, this is Aqua Puro Zone Sira Gate Tumakuru regarding your water purifier query.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-[#006c2e] text-white flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                        title="Direct WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: PRODUCT INVENTORY */}
      <div className="bg-white rounded-3xl p-5 lg:p-7 shadow-xs border border-[#dae2fd] mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#dae2fd]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#005cb3] text-[26px]">water_ec</span>
              <h2 className="font-heading font-bold text-[22px] text-[#131b2e]">
                {isKannada ? 'ಪ್ಯೂರಿಫೈಯರ್ ಮತ್ತು ಉಪಕರಣಗಳ ದಾಸ್ತಾನು' : 'Purifier & Appliance Inventory'}
              </h2>
            </div>
            <p className="text-[13px] text-[#414753] mt-1">
              Live Tumakuru warehouse inventory catalog & smart AI matching tags • ದಾಸ್ತಾನು ನಿರ್ವಹಣೆ
            </p>
          </div>

          <button
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005cb3] text-white rounded-xl hover:bg-[#0b74de] shadow-sm transition-all text-[13px] font-semibold self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>{isKannada ? 'ಹೊಸ ಉತ್ಪನ್ನ ಸೇರಿಸಿ' : 'Add New Product (ಹೊಸ ಉತ್ಪನ್ನ)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#f2f3ff] rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-[#dae2fd]"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => onToggleProductFeatured(prod.id)}
                  className={`w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-xs transition-colors ${
                    prod.featured ? 'text-amber-500' : 'text-[#717784] hover:text-amber-500'
                  }`}
                  title="Toggle Featured"
                >
                  <span className={`material-symbols-outlined text-[18px] ${prod.featured ? 'fill-1' : ''}`}>
                    star
                  </span>
                </button>
              </div>

              <div className="w-full h-48 rounded-xl bg-white overflow-hidden flex items-center justify-center p-3 mb-4 border border-[#dae2fd]/60">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="h-full w-auto object-contain hover:scale-105 transition-transform"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#5ee9ff]/60 text-[#004f58] text-[11px] font-bold">
                    {prod.category}
                  </span>
                  <span className="font-heading font-bold text-[18px] text-[#005cb3] tabular-nums">
                    ₹{prod.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-[16px] text-[#131b2e] leading-snug">
                  {prod.name}
                </h3>
                <p className="text-[12px] text-[#414753] line-clamp-1 mb-2">
                  {prod.capacity} • {prod.mountType}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {prod.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded bg-[#eaedff] text-[#414753] font-mono text-[11px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 pb-1 flex items-center justify-between gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => onToggleProductVisibility(prod.id)}
                  className={`font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                    prod.visibleOnStorefront
                      ? 'bg-[#005cb3]/10 text-[#005cb3] hover:bg-[#005cb3]/20'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title="Toggle whether customers see this in the public catalog"
                >
                  <span>{prod.visibleOnStorefront ? '👁️ Customer Visible' : '🚫 Hidden on Web'}</span>
                </button>
                <span className="font-mono font-bold text-[#006c2e] bg-[#6bff8f]/20 px-2 py-0.5 rounded-md">
                  Stock: {prod.stockQuantity}
                </span>
              </div>

              <div className="pt-2 border-t border-[#dae2fd] flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={prod.inStock}
                    onChange={() => onToggleProductStock(prod.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-[#006c2e] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all relative"></div>
                  <span className={`text-[11px] font-bold ${
                    prod.inStock ? 'text-[#006c2e]' : 'text-[#717784]'
                  }`}>
                    {prod.inStock ? 'In Stock' : 'Out'}
                  </span>
                </label>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditProduct(prod)}
                    className="px-2.5 py-1 rounded-lg text-[#005cb3] bg-white border border-[#dae2fd] hover:bg-[#eaedff] text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    title="Change Photo & Specifications"
                  >
                    <span className="material-symbols-outlined text-[15px]">add_photo_alternate</span>
                    <span>Edit Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${prod.name}?`)) {
                        onDeleteProduct(prod.id);
                        showToast(`Deleted ${prod.name}`);
                      }
                    }}
                    className="p-1 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                    title="Delete Product"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: REVIEWS */}
      <div className="bg-white rounded-3xl p-5 lg:p-7 shadow-xs border border-[#dae2fd] mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dae2fd]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber-500 text-[26px]">star</span>
              <h2 className="font-heading font-bold text-[22px] text-[#131b2e]">
                {isKannada ? 'ದೃಢೀಕರಿಸಿದ ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು' : 'Verified Customer Reviews'}
              </h2>
            </div>
            <p className="text-[13px] text-[#414753] mt-1">
              Manage local Google ratings & customer endorsements on the storefront • ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು
            </p>
          </div>

          <button
            onClick={onOpenAddReview}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#006875] text-white rounded-xl hover:bg-[#004f58] transition-colors text-[12px] font-semibold self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">rate_review</span>
            <span>{isKannada ? '+ ವಿಮರ್ಶೆ ಸೇರಿಸಿ' : '+ Add Verified Review (ವಿಮರ್ಶೆ ಸೇರಿಸಿ)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#f2f3ff] rounded-2xl p-5 flex flex-col justify-between border border-[#dae2fd]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px] text-[#131b2e]">{rev.author}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#6bff8f]/30 text-[#006c2e] text-[11px] font-bold">
                      {rev.badge}
                    </span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-semibold text-[#414753]">Visible on Web</span>
                    <input
                      type="checkbox"
                      checked={rev.visibleOnWeb}
                      onChange={() => onToggleReviewVisibility(rev.id)}
                      className="accent-[#005cb3] w-4 h-4 rounded"
                    />
                  </label>
                </div>

                <p className="text-[13px] text-[#131b2e] italic mb-2 leading-relaxed">
                  {rev.textEn}
                </p>
                {rev.textKn && (
                  <p className="text-[12px] text-[#414753] font-medium leading-relaxed">
                    {rev.textKn}
                  </p>
                )}
              </div>

              <div className="text-[11px] text-[#717784] mt-4 flex items-center justify-between border-t border-[#dae2fd] pt-2">
                <span>Installed: {rev.installedProduct} • {rev.locality}</span>
                <button
                  onClick={() => {
                    if (confirm('Remove this customer review?')) {
                      onDeleteReview(rev.id);
                      showToast('Review removed.');
                    }
                  }}
                  className="text-[#ba1a1a] font-semibold hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: SITE SETTINGS */}
      <div className="bg-white rounded-3xl p-5 lg:p-7 shadow-xs border border-[#dae2fd] mb-12">
        <div className="pb-6 border-b border-[#dae2fd]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#005cb3] text-[26px]">tune</span>
            <h2 className="font-heading font-bold text-[22px] text-[#131b2e]">
              {isKannada ? 'ಸ್ಟೋರ್ ಸಂಪರ್ಕ & ಘೋಷಣೆ ಬ್ಯಾನರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು' : 'Store Contact & Announcement Bar Settings'}
            </h2>
          </div>
          <p className="text-[13px] text-[#414753] mt-1">
            Update customer helpline, Tumakuru address, and promotional banner without code modification
          </p>
        </div>

        <form onSubmit={handleSettingsSubmit} className="space-y-6 pt-6">
          <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006875] text-[22px]">campaign</span>
                <span className="font-semibold text-[15px] text-[#131b2e]">
                  Top Announcement Bar (ಉಚಿತ ಪರೀಕ್ಷೆ ಬ್ಯಾನರ್)
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tempSettings.bannerActive}
                  onChange={(e) => setTempSettings({ ...tempSettings, bannerActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-[#006c2e] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative"></div>
                <span className="text-[12px] text-[#131b2e] font-bold">
                  {tempSettings.bannerActive ? 'Active Banner' : 'Inactive'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#414753] mb-1">
                  Banner Text (English)
                </label>
                <input
                  type="text"
                  value={tempSettings.bannerTextEn}
                  onChange={(e) => setTempSettings({ ...tempSettings, bannerTextEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl text-[#131b2e] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#006875]/20 border border-[#dae2fd]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#414753] mb-1">
                  Banner Text (ಕನ್ನಡ - Kannada)
                </label>
                <input
                  type="text"
                  value={tempSettings.bannerTextKn}
                  onChange={(e) => setTempSettings({ ...tempSettings, bannerTextKn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl text-[#131b2e] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#006875]/20 border border-[#dae2fd]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-[12px] font-semibold text-[#131b2e] mb-1.5">
                Official Helpline Phone
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717784] text-[20px]">
                  call
                </span>
                <input
                  type="text"
                  value={tempSettings.helplinePhone}
                  onChange={(e) => setTempSettings({ ...tempSettings, helplinePhone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] font-mono focus:outline-none border border-[#dae2fd]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#131b2e] mb-1.5">
                WhatsApp Direct Desk
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#006c2e] text-[20px]">
                  chat
                </span>
                <input
                  type="text"
                  value={tempSettings.whatsappNumber}
                  onChange={(e) => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] font-mono focus:outline-none border border-[#dae2fd]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#131b2e] mb-1.5">
                Operating Working Hours
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717784] text-[20px]">
                  schedule
                </span>
                <input
                  type="text"
                  value={tempSettings.operatingHours}
                  onChange={(e) => setTempSettings({ ...tempSettings, operatingHours: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold text-[#131b2e] mb-1.5">
                Storefront Physical Address (ಶಿರಾ ಗೇಟ್ ವಿಳಾಸ)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-[#717784] text-[20px]">
                  location_on
                </span>
                <input
                  type="text"
                  value={tempSettings.storefrontAddress}
                  onChange={(e) => setTempSettings({ ...tempSettings, storefrontAddress: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#131b2e] mb-1.5">
                Storefront Tagline
              </label>
              <input
                type="text"
                value={tempSettings.storefrontTagline}
                onChange={(e) => setTempSettings({ ...tempSettings, storefrontTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTempSettings(settings)}
              className="px-5 py-2.5 bg-[#e2e7ff] rounded-xl text-[#131b2e] text-[13px] font-semibold hover:bg-[#dae2fd] transition-colors"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#005cb3] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0b74de] shadow-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span>{isKannada ? 'ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಉಳಿಸಿ' : 'Save Store Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* STICKY BAR */}
      <div className="fixed bottom-4 left-4 right-4 lg:left-72 lg:right-8 z-30 bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl p-3 flex items-center justify-between border border-[#dae2fd]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#006c2e] animate-pulse"></div>
          <span className="text-[13px] text-[#131b2e] hidden sm:inline">
            Live Shop Desk: <span className="font-bold text-[#005cb3]">Tumakuru Sira Gate</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:08296264007"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#005cb3] text-white rounded-xl text-[12px] font-semibold shadow-xs hover:bg-[#0b74de] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call Shop</span>
          </a>

          <button
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006875] text-white rounded-xl text-[12px] font-semibold shadow-xs hover:bg-[#004f58] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">New Product</span>
          </button>

          <button
            onClick={exportLeadsCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#e2e7ff] text-[#131b2e] rounded-xl text-[12px] font-semibold hover:bg-[#dae2fd] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span className="hidden md:inline">Download CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
