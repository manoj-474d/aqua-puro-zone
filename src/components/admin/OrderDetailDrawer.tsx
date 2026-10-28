import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../../types';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  onUpdateDetails: (orderId: string, updates: Partial<Order>) => Promise<boolean>;
  onDeleteOrder: (orderId: string) => Promise<boolean>;
  whatsappNumber: string;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateDetails,
  onDeleteOrder,
  whatsappNumber,
}) => {
  if (!isOpen || !order) return null;

  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.payment_status);
  const [totalAmount, setTotalAmount] = useState<number>(order.total_amount);
  const [adminNotes, setAdminNotes] = useState<string>(order.admin_notes || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const cleanPhone = order.phone.replace(/\D/g, '');

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateDetails(order.id, {
      status,
      payment_status: paymentStatus,
      total_amount: Number(totalAmount) || 0,
      admin_notes: adminNotes.trim() || null,
    });
    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    await onDeleteOrder(order.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleWhatsAppCustomer = () => {
    const text = `Hello ${order.customer_name}, this is Aqua Puro Zone Sira Gate store manager regarding your order #${order.order_number}.`;
    window.open(`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-5 bg-[#06284b] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-black bg-[#27c4d9] text-[#06284b] px-2.5 py-0.5 rounded-md">
              {order.order_number}
            </span>
            <div>
              <h3 className="font-heading font-bold text-base text-white">{order.customer_name}</h3>
              <p className="text-[11px] text-[#27c4d9] font-medium">{order.area}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Quick Communication Action Bar */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${cleanPhone}`}
              className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0b74de] text-xs font-bold flex items-center justify-center gap-2 border border-blue-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>Call ({order.phone})</span>
            </a>

            <button
              onClick={handleWhatsAppCustomer}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006c2e] text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Message on WhatsApp</span>
            </button>
          </div>

          {/* Customer & Address Details */}
          <div className="bg-[#f8faff] rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-[#06284b] uppercase tracking-wider text-[11px]">
              Customer Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[#414753]">
              <div>
                <span className="text-slate-400 block text-[10px]">Mobile</span>
                <span className="font-mono font-bold text-[#06284b]">{order.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Email</span>
                <span className="font-medium text-[#06284b] truncate block">
                  {order.email || 'Not provided'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Tumakuru Delivery Address</span>
                <span className="font-medium text-[#06284b]">
                  {order.address ? `${order.address}, ${order.area}` : order.area}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Order Source</span>
                <span className="inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-mono">
                  {order.source}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {order.notes && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs">
              <span className="font-bold text-amber-800 block text-[11px] mb-1">
                Customer Note / Requirement:
              </span>
              <p className="text-amber-950 leading-relaxed italic">{order.notes}</p>
            </div>
          )}

          {/* Ordered Items List */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#06284b] uppercase tracking-wider text-[11px]">
              Appliance &amp; Service Items
            </h4>
            {order.order_items && order.order_items.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {order.order_items.map((item) => (
                  <div key={item.id} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#06284b]">{item.product_name}</div>
                      <div className="text-[11px] text-[#414753]">Quantity: {item.quantity}</div>
                    </div>
                    <div className="font-mono font-bold text-[#0b74de]">
                      ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                General Request / Free Doorstep TDS Assessment
              </div>
            )}
          </div>

          {/* Editable Admin Management Controls */}
          <div className="bg-[#f0f9ff] border border-[#27c4d9]/40 rounded-2xl p-4 space-y-3.5">
            <h4 className="font-bold text-[#06284b] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0b74de]">tune</span>
              <span>Order Status &amp; Financials</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#06284b] mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-slate-200 focus:outline-none"
                >
                  <option value="new">● New Order</option>
                  <option value="contacted">● Contacted</option>
                  <option value="confirmed">● Confirmed / Scheduled</option>
                  <option value="delivered">● Delivered / Installed</option>
                  <option value="cancelled">● Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#06284b] mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-slate-200 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="partial">Partial Advance</option>
                  <option value="paid">100% Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#06284b] mb-1">
                Total Order Amount (₹)
              </label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white rounded-xl text-xs font-mono font-bold border border-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#06284b] mb-1">
                Internal Admin / Technician Notes
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Technician Manjunath assigned. Extra 5-metre 1/4 inch tubing needed."
                className="w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-200 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Timestamps Audit */}
          <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
            <div>
              Created:{' '}
              <span className="font-mono text-slate-600">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              Last Updated:{' '}
              <span className="font-mono text-slate-600">
                {new Date(order.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-red-600 font-bold">Delete permanently?</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                title="Delete Order"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#414753] hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#0b74de] hover:bg-[#06284b] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
