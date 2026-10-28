import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, OrderType } from '../../types';

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onSelectOrder: (order: Order) => void;
  onQuickUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  loading,
  onSelectOrder,
  onQuickUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Search check
      const query = searchTerm.toLowerCase();
      const matchSearch =
        o.order_number.toLowerCase().includes(query) ||
        o.customer_name.toLowerCase().includes(query) ||
        o.phone.includes(query) ||
        o.area.toLowerCase().includes(query);

      // Status check
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;

      // Type check
      const matchType = typeFilter === 'all' || o.order_type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [orders, searchTerm, statusFilter, typeFilter]);

  // Color badges for statuses
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'contacted':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'confirmed':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTypeBadge = (type: OrderType) => {
    switch (type) {
      case 'purchase':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'service':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'installation':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'enquiry':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center justify-between gap-4">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-200 rounded w-36" />
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="h-4 bg-slate-200 rounded w-20" />
            <div className="h-4 bg-slate-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order #, customer name, phone, or Tumakuru area..."
            className="w-full pl-9 pr-3.5 py-2 bg-[#f8faff] rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#f8faff] rounded-xl text-xs font-semibold border border-slate-200 text-[#06284b] focus:outline-none"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="new">● New ({orders.filter((o) => o.status === 'new').length})</option>
            <option value="contacted">● Contacted</option>
            <option value="confirmed">● Confirmed</option>
            <option value="delivered">● Delivered</option>
            <option value="cancelled">● Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-[#f8faff] rounded-xl text-xs font-semibold border border-slate-200 text-[#06284b] focus:outline-none"
          >
            <option value="all">All Order Types</option>
            <option value="purchase">Purchase</option>
            <option value="service">Service &amp; Repair</option>
            <option value="installation">Installation</option>
            <option value="enquiry">Free Demo / Enquiry</option>
          </select>

          {/* Table vs Card View Toggle for Mobile/Desktop */}
          <div className="flex items-center bg-[#f8faff] p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#0b74de] shadow-xs' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-white text-[#0b74de] shadow-xs' : 'text-slate-400'
              }`}
              title="Card Grid View"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <span className="material-symbols-outlined text-[28px]">search_off</span>
          </div>
          <h4 className="font-bold text-base text-[#06284b]">No orders match your filter</h4>
          <p className="text-xs text-[#414753] mt-1">
            Try clearing the search query or changing the status filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Responsive Desktop & Tablet Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faff] text-[#414753] uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone / Contact</th>
                  <th className="py-3 px-4">Locality / Area</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const cleanPhone = order.phone.replace(/\D/g, '');
                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="hover:bg-[#f0f9ff]/50 cursor-pointer transition-colors"
                    >
                      {/* Order Number & Time */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#06284b] text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                          {order.order_number}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Customer Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#06284b] text-[13px]">
                          {order.customer_name}
                        </div>
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="text-[11px] text-[#414753] truncate max-w-[180px]">
                            {order.order_items[0].product_name}
                          </div>
                        )}
                      </td>

                      {/* Phone with Quick Call */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="font-mono text-[#0b74de] hover:underline font-bold text-[12px]"
                            title="Call customer"
                          >
                            {order.phone}
                          </a>
                          <a
                            href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 rounded-md bg-emerald-50 text-[#006c2e] hover:bg-emerald-100 flex items-center justify-center"
                            title="Chat on WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[13px]">chat</span>
                          </a>
                        </div>
                      </td>

                      {/* Locality */}
                      <td className="py-3 px-4">
                        <span className="text-[#414753] text-[12px]">{order.area}</span>
                      </td>

                      {/* Order Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeBadge(
                            order.order_type
                          )}`}
                        >
                          {order.order_type}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onQuickUpdateStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          <option value="new">● New</option>
                          <option value="contacted">● Contacted</option>
                          <option value="confirmed">● Confirmed</option>
                          <option value="delivered">● Delivered</option>
                          <option value="cancelled">● Cancelled</option>
                        </select>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#06284b] text-[13px]">
                        ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0b74de] hover:text-white text-[#06284b] text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Mobile-First Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredOrders.map((order) => {
            const cleanPhone = order.phone.replace(/\D/g, '');
            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-[#06284b]">
                      {order.order_number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-[#06284b]">
                    {order.customer_name}
                  </h4>
                  <p className="text-xs text-[#414753] mt-0.5">{order.area}</p>

                  {order.notes && (
                    <p className="text-xs text-slate-500 italic mt-2 line-clamp-2 bg-slate-50 p-2 rounded-lg">
                      "{order.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-mono font-bold text-sm text-[#0b74de]">
                    ₹{Number(order.total_amount).toLocaleString('en-IN')}
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="p-2 rounded-lg bg-blue-50 text-[#0b74de] hover:bg-blue-100 flex items-center justify-center"
                      title="Call"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                    </a>
                    <a
                      href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-50 text-[#006c2e] hover:bg-emerald-100 flex items-center justify-center"
                      title="WhatsApp"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
