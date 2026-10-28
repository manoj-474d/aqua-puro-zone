import React from 'react';
import { Lead, ServiceTicket } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pendingLeads: Lead[];
  urgentTickets: ServiceTicket[];
  onSelectLead: (lead: Lead) => void;
  isKannada: boolean;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  pendingLeads,
  urgentTickets,
  onSelectLead,
  isKannada,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#dae2fd] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#dae2fd] flex items-center justify-between bg-[#f2f3ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005cb3] text-[22px]">notifications_active</span>
            <h3 className="font-heading font-bold text-[16px] text-[#131b2e]">
              {isKannada ? 'ಸೂಚನೆಗಳು ಮತ್ತು ತುರ್ತು ಕಾರ್ಯಗಳು' : 'Operational Notifications'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#414753] hover:bg-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Urgent Leads Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-[#ba1a1a] uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping"></span>
                {isKannada ? 'ಹೊಸ ಗ್ರಾಹಕರ ಕರೆಗಳು (Pending Leads)' : 'Action Required: Pending Calls'}
              </span>
              <span className="text-[11px] font-mono font-bold bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full">
                {pendingLeads.length} Urgent
              </span>
            </div>

            <div className="space-y-2">
              {pendingLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => {
                    onSelectLead(lead);
                    onClose();
                  }}
                  className="p-3 bg-[#faf8ff] border border-[#dae2fd] rounded-xl hover:bg-[#eaedff] cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[13px] font-bold text-[#131b2e]">{lead.customerName}</h4>
                      <p className="text-[12px] text-[#414753] font-mono">{lead.phone}</p>
                      <p className="text-[11px] text-[#005cb3] font-medium mt-0.5">
                        📍 {lead.locality} • TDS ~{lead.tdsPpm} PPM
                      </p>
                    </div>
                    <span className="text-[10px] bg-[#ffdad6] text-[#ba1a1a] font-bold px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </div>
                  <p className="text-[11px] text-[#414753] italic mt-1.5 line-clamp-1 border-t border-[#dae2fd] pt-1">
                    "{lead.notes || 'Interested in Water Purifier installation'}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Service Tickets */}
          <div>
            <div className="flex items-center justify-between mb-2 pt-2 border-t border-[#dae2fd]">
              <span className="text-[12px] font-bold text-[#006875] uppercase tracking-wider">
                {isKannada ? 'ಸೇವಾ ಭೇಟಿಗಳು (Service Tickets)' : 'Today\'s Dispatch Queue'}
              </span>
              <span className="text-[11px] font-mono font-bold bg-[#5ee9ff] text-[#004f58] px-2 py-0.5 rounded-full">
                {urgentTickets.length} Scheduled
              </span>
            </div>

            <div className="space-y-2">
              {urgentTickets.map((tck) => (
                <div key={tck.id} className="p-3 bg-[#faf8ff] border border-[#dae2fd] rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#005cb3]">{tck.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tck.priority === 'urgent'
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : 'bg-[#e2e7ff] text-[#005cb3]'
                    }`}>
                      {tck.priority.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-[13px] font-semibold text-[#131b2e] mt-1">{tck.customerName}</h4>
                  <p className="text-[11px] text-[#414753]">
                    {tck.appliance} • {tck.locality}
                  </p>
                  <div className="text-[11px] text-[#006c2e] font-semibold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    <span>Tech: {tck.technician}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#f2f3ff] border-t border-[#dae2fd] text-center">
          <p className="text-[11px] text-[#414753]">
            Sira Gate Dispatch Hotline: <span className="font-mono font-bold text-[#131b2e]">082962 64007</span>
          </p>
        </div>
      </div>
    </div>
  );
};
