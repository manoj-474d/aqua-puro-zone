import React, { useState } from 'react';
import { ServiceTicket } from '../../types';

interface ServiceTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: ServiceTicket) => void;
  isKannada: boolean;
}

export const ServiceTicketModal: React.FC<ServiceTicketModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isKannada,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [locality, setLocality] = useState('Sira Gate, Tumakuru');
  const [appliance, setAppliance] = useState('AquaPure Copper Max Pro RO');
  const [serviceType, setServiceType] = useState<ServiceTicket['serviceType']>('Filter Replacement');
  const [priority, setPriority] = useState<ServiceTicket['priority']>('medium');
  const [issue, setIssue] = useState('');
  const [technician, setTechnician] = useState('Manjunath (Sira Gate Central)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const newTicket: ServiceTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      locality,
      appliance,
      serviceType,
      priority,
      issue: issue.trim() || 'General service & maintenance inspection requested',
      status: 'scheduled',
      technician,
      scheduledDate: 'Today, within 3 hours',
    };

    onSave(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#dae2fd]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#dae2fd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005cb3] text-[24px]">build_circle</span>
            <h3 className="font-heading font-bold text-[18px] text-[#131b2e]">
              {isKannada ? 'ಹೊಸ ಸೇವಾ ಟಿಕೆಟ್ ಬುಕ್ ಮಾಡಿ' : 'Dispatch New Service & AMC Ticket'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#414753] hover:bg-[#eaedff] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                {isKannada ? 'ಗ್ರಾಹಕರ ಹೆಸರು *' : 'Customer Name *'}
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Nagaraj Gowda"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                {isKannada ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *' : 'Phone Number *'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Tumakuru Locality
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              >
                <option>Sira Gate, Tumakuru</option>
                <option>Kyatsandra, Tumakuru</option>
                <option>Batwadi, Tumakuru</option>
                <option>SS Puram, Tumakuru</option>
                <option>Gubbi Gate, Tumakuru</option>
                <option>Mandipet, Tumakuru</option>
                <option>Belagumba, Tumakuru</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceTicket['serviceType'])}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              >
                <option>Filter Replacement</option>
                <option>Installation</option>
                <option>Motor Repair</option>
                <option>AMC Routine</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Appliance Model
              </label>
              <input
                type="text"
                value={appliance}
                onChange={(e) => setAppliance(e.target.value)}
                placeholder="e.g. AquaPure Copper Max Pro"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Assign Tumakuru Technician
              </label>
              <select
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              >
                <option>Manjunath (Sira Gate Central)</option>
                <option>Chethan Service Tech</option>
                <option>Praveen Senior Water Engineer</option>
                <option>Suresh (Quick Bike Dispatch)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ServiceTicket['priority'])}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              >
                <option value="urgent">🔴 Urgent (Water stopped / Leak)</option>
                <option value="medium">🟡 Medium (Regular Service)</option>
                <option value="routine">🟢 Routine AMC Visit</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Issue Description
              </label>
              <input
                type="text"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="e.g. Water taste changed, pre-filter choked"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#dae2fd]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#eaedff] rounded-xl text-[#131b2e] text-[13px] font-semibold hover:bg-[#e2e7ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#005cb3] hover:bg-[#0b74de] text-white rounded-xl text-[13px] font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>{isKannada ? 'ಟಿಕೆಟ್ ರಚಿಸಿ (Dispatch)' : 'Dispatch Technician'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
