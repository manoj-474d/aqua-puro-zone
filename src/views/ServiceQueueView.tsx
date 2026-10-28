import React, { useState } from 'react';
import { ServiceTicket } from '../types';

interface ServiceQueueViewProps {
  tickets: ServiceTicket[];
  onUpdateTicketStatus: (ticketId: string, status: ServiceTicket['status']) => void;
  onOpenCreateTicket: () => void;
  isKannada: boolean;
}

export const ServiceQueueView: React.FC<ServiceQueueViewProps> = ({
  tickets,
  onUpdateTicketStatus,
  onOpenCreateTicket,
  isKannada,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredTickets = tickets.filter((t) => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch =
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.locality.toLowerCase().includes(search.toLowerCase()) ||
      t.appliance.toLowerCase().includes(search.toLowerCase()) ||
      t.technician.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const scheduledCount = tickets.filter((t) => t.status === 'scheduled').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const overdueCount = tickets.filter((t) => t.status === 'overdue').length;

  return (
    <div className="flex flex-col w-full pb-16">
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#dae2fd] mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#005cb3]/10 flex items-center justify-center text-[#005cb3]">
              <span className="material-symbols-outlined text-[28px]">build_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-[22px] text-[#131b2e]">
                  {isKannada ? 'ಸೇವೆ ಮತ್ತು AMC ನಿರ್ವಹಣಾ ಸರದಿ' : 'Service & AMC Dispatch Queue'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#6bff8f]/30 text-[#006c2e] text-[11px] font-bold">
                  Tumakuru Field Ops
                </span>
              </div>
              <p className="text-[13px] text-[#414753] mt-0.5">
                On-site purifier repairs, membrane replacements, and chimney maintenance across Tumakuru
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCreateTicket}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005cb3] text-white rounded-xl hover:bg-[#0b74de] shadow-sm transition-all text-[13px] font-semibold self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[20px]">add_task</span>
            <span>{isKannada ? 'ಹೊಸ ಸೇವಾ ಟಿಕೆಟ್ ಬುಕ್ ಮಾಡಿ' : 'Dispatch Service Ticket'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#dae2fd]">
          <div 
            onClick={() => setFilter('all')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              filter === 'all' ? 'bg-[#e2e7ff] border-[#005cb3]' : 'bg-[#f2f3ff] border-[#dae2fd]'
            }`}
          >
            <span className="text-[11px] font-semibold text-[#414753] uppercase">All Tickets</span>
            <div className="text-[22px] font-heading font-bold text-[#131b2e]">{tickets.length}</div>
          </div>

          <div 
            onClick={() => setFilter('scheduled')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              filter === 'scheduled' ? 'bg-[#e2e7ff] border-[#005cb3]' : 'bg-[#f2f3ff] border-[#dae2fd]'
            }`}
          >
            <span className="text-[11px] font-semibold text-[#005cb3] uppercase">Scheduled Today</span>
            <div className="text-[22px] font-heading font-bold text-[#005cb3]">{scheduledCount}</div>
          </div>

          <div 
            onClick={() => setFilter('in_progress')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              filter === 'in_progress' ? 'bg-[#5ee9ff]/30 border-[#006875]' : 'bg-[#f2f3ff] border-[#dae2fd]'
            }`}
          >
            <span className="text-[11px] font-semibold text-[#006875] uppercase">On the Road</span>
            <div className="text-[22px] font-heading font-bold text-[#006875]">{inProgressCount}</div>
          </div>

          <div 
            onClick={() => setFilter('overdue')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              filter === 'overdue' ? 'bg-[#ffdad6] border-[#ba1a1a]' : 'bg-[#f2f3ff] border-[#dae2fd]'
            }`}
          >
            <span className="text-[11px] font-semibold text-[#ba1a1a] uppercase">Overdue / Follow-up</span>
            <div className="text-[22px] font-heading font-bold text-[#ba1a1a]">{overdueCount}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 lg:p-7 shadow-xs border border-[#dae2fd]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717784] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by customer, phone, locality..."
              className="w-full pl-10 pr-3 py-2 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] border border-[#dae2fd] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-[12px] text-[#414753] font-medium self-end sm:self-auto">
            <span>Showing {filteredTickets.length} of {tickets.length} tickets</span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 lg:-mx-7 px-5 lg:px-7">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#f2f3ff] text-[#414753] text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-xl">Ticket ID & Time</th>
                <th className="py-3 px-4">Customer & Phone</th>
                <th className="py-3 px-4">Locality & Appliance</th>
                <th className="py-3 px-4">Service Required</th>
                <th className="py-3 px-4">Assigned Tech</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff] text-[13px]">
              {filteredTickets.map((tck) => (
                <tr key={tck.id} className="hover:bg-[#f2f3ff]/50 transition-colors">
                  <td className="py-4 px-4 font-mono">
                    <span className="font-bold text-[#005cb3] text-[13px]">{tck.id}</span>
                    <div className="text-[11px] text-[#717784]">{tck.scheduledDate}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-[#131b2e]">{tck.customerName}</div>
                    <div className="text-[#414753] font-mono text-[12px]">{tck.phone}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-[#131b2e]">{tck.appliance}</div>
                    <span className="text-[11px] text-[#006875] font-medium">📍 {tck.locality}</span>
                  </td>

                  <td className="py-4 px-4 max-w-xs">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#e2e7ff] text-[#005cb3] text-[11px] font-semibold mb-1">
                      {tck.serviceType}
                    </span>
                    <p className="text-[12px] text-[#414753] line-clamp-1">{tck.issue}</p>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-[13px] font-semibold text-[#131b2e] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#006c2e]">person</span>
                      {tck.technician}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <select
                      value={tck.status}
                      onChange={(e) => onUpdateTicketStatus(tck.id, e.target.value as ServiceTicket['status'])}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border focus:outline-none cursor-pointer ${
                        tck.status === 'completed'
                          ? 'bg-[#6bff8f]/30 text-[#006c2e] border-[#6bff8f]'
                          : tck.status === 'in_progress'
                          ? 'bg-[#5ee9ff]/40 text-[#004f58] border-[#5ee9ff]'
                          : tck.status === 'overdue'
                          ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                          : 'bg-[#e2e7ff] text-[#005cb3] border-[#dae2fd]'
                      }`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In-Progress</option>
                      <option value="completed">Completed (ಪೂರ್ಣಗೊಂಡಿದೆ)</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`tel:${tck.phone.replace(/[^0-9+]/g, '')}`}
                        className="p-1.5 rounded-lg bg-[#f2f3ff] text-[#005cb3] hover:bg-[#eaedff]"
                        title="Call Customer"
                      >
                        <span className="material-symbols-outlined text-[18px]">call</span>
                      </a>
                      <a
                        href={`https://wa.me/${tck.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${tck.customerName}, Aqua Puro Zone service team technician ${tck.technician} is scheduled for your visit.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#6bff8f]/30 text-[#006c2e] hover:bg-[#6bff8f]/50"
                        title="WhatsApp Update"
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
    </div>
  );
};
