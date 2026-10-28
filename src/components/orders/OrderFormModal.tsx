import React, { useState } from 'react';
import { Product, OrderType } from '../../types';
import { submitClientOrder, isSupabaseConfigured, SUPABASE_URL } from '../../lib/supabaseClient';
import { SupabaseConnectModal } from '../Modals/SupabaseConnectModal';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProduct?: Product | null;
  initialOrderType?: OrderType;
  whatsappNumber: string;
  isKannada?: boolean;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProduct = null,
  initialOrderType = 'purchase',
  whatsappNumber,
  isKannada = false,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Sira Gate, Tumakuru');
  const [orderType, setOrderType] = useState<OrderType>(initialOrderType);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || (products[0]?.id ?? '')
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');

  // Spam protection honeypot (bots fill this in, real humans cannot see it)
  const [honeypot, setHoneypot] = useState('');

  // Submission lifecycle state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);
  const [savedToSupabase, setSavedToSupabase] = useState<boolean>(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const unitPrice = selectedProduct?.price || 0;
  const totalAmount = orderType === 'enquiry' ? 0 : unitPrice * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Honeypot spam trap check
    if (honeypot) {
      console.warn('Bot submission blocked via honeypot');
      setSuccessOrderNumber('APZ-SPAM-BLOCKED');
      return;
    }

    // 2. Validate full name
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    // 3. Validate Indian 10-digit mobile number
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number (e.g., 98450 12345).');
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitClientOrder({
        customer_name: customerName,
        phone: phone.trim(),
        email: email.trim() || null,
        address: address.trim() || null,
        area: area || 'Sira Gate, Tumakuru',
        order_type: orderType,
        notes: notes.trim() || null,
        source: 'website_form',
        items:
          selectedProduct && orderType !== 'enquiry'
            ? [
                {
                  product_id: selectedProduct.id,
                  product_name: selectedProduct.name,
                  quantity: quantity,
                  price: unitPrice,
                },
              ]
            : [],
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to place order. Please try again.');
        setSubmitting(false);
        return;
      }

      setSavedToSupabase(Boolean(result.savedToSupabase));
      setSuccessOrderNumber(result.orderNumber || 'APZ-CONFIRMED');
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const cleanWa = whatsappNumber.replace(/\D/g, '');
    const text = `Hello Aqua Puro Zone Tumakuru! I placed order *#${successOrderNumber}* on your website for *${customerName}* (${phone}).\nItem: ${selectedProduct?.name || orderType}\nLocality: ${area}\nPlease confirm installation schedule.`;
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const resetForm = () => {
    setSuccessOrderNumber(null);
    setErrorMessage(null);
    setCustomerName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setSavedToSupabase(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-[#27c4d9]/50 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#06284b] via-[#0b74de] to-[#06284b] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#27c4d9]/20 flex items-center justify-center text-[#27c4d9]">
                <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-white">
                  {isKannada ? 'ಆರ್ಡರ್ ಅಥವಾ ಸೇವೆ ಬುಕ್ ಮಾಡಿ' : 'Order Now / Book Service'}
                </h3>
                <p className="text-xs text-[#27c4d9] font-medium">
                  Aqua Puro Zone • Sira Gate Tumakuru
                </p>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6">
            {successOrderNumber ? (
              /* Success State with Animation */
              <div className="text-center py-5 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg border-2 border-emerald-400 animate-bounce">
                  <span className="material-symbols-outlined text-[42px]">check_circle</span>
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-[#0b74de]/15 text-[#0b74de] font-mono font-bold text-xs">
                    ORDER ID: {successOrderNumber}
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#06284b] mt-2">
                    Order Received Successfully!
                  </h3>

                  {/* Supabase Sync Status Confirmation Banner */}
                  {savedToSupabase ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                      <span>Synced to Supabase Cloud Database (public.orders)</span>
                    </div>
                  ) : (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                      <span className="material-symbols-outlined text-[15px] text-amber-600">info</span>
                      <span>Recorded in Local Demo Mode (Supabase not connected)</span>
                    </div>
                  )}

                  <p className="text-sm text-[#414753] mt-2 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{customerName}</strong>! {savedToSupabase ? 'Your order is recorded live in our Supabase PostgreSQL database.' : 'Your order is saved locally.'} Our Sira Gate technician will call you on{' '}
                    <strong className="font-mono text-[#06284b]">{phone}</strong> shortly.
                  </p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-[#f0f9ff] border border-[#27c4d9]/40 rounded-2xl p-4 text-left text-xs text-[#06284b] max-w-md mx-auto space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#414753]">Appliance / Service:</span>
                    <span className="font-bold">{selectedProduct?.name || orderType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#414753]">Tumakuru Locality:</span>
                    <span className="font-bold">{area}</span>
                  </div>
                  {orderType !== 'enquiry' && (
                    <div className="flex justify-between border-t border-[#27c4d9]/30 pt-1.5 font-bold">
                      <span>Total Amount:</span>
                      <span className="text-emerald-700 font-mono text-sm">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex-1 py-3 bg-[#006c2e] hover:bg-[#00883c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:scale-102 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Confirm on WhatsApp (Instant)</span>
                  </button>
                  <button
                    onClick={resetForm}
                    className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-[#06284b] rounded-xl text-xs font-bold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Order Entry Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Supabase Connection Pill Indicator */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border text-xs bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-[11px] text-[#414753] truncate">
                      {isConfigured ? (
                        <>
                          <strong className="text-emerald-800">Connected:</strong> {SUPABASE_URL}
                        </>
                      ) : (
                        <>
                          <strong className="text-amber-800">Demo Mode:</strong> Supabase cloud not configured
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(true)}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-[#0b74de] font-bold border border-slate-200 shrink-0 ml-2"
                  >
                    {isConfigured ? 'Status' : 'Connect'}
                  </button>
                </div>

                {/* Invisible Honeypot Spam Trap */}
                <div className="hidden" aria-hidden="true">
                  <label>Do not fill this field if human</label>
                  <input
                    type="text"
                    name="hp_website"
                    tabIndex={-1}
                    value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Order Type Selector */}
              <div>
                <label className="block text-xs font-bold text-[#06284b] mb-1.5">
                  Order / Request Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'purchase', label: 'Buy New', icon: 'shopping_cart' },
                    { id: 'service', label: 'Service', icon: 'build' },
                    { id: 'installation', label: 'Install', icon: 'home_repair_service' },
                    { id: 'enquiry', label: 'Enquiry', icon: 'help_outline' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setOrderType(t.id as OrderType)}
                      className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                        orderType === t.id
                          ? 'bg-[#0b74de] text-white border-[#0b74de] shadow-xs'
                          : 'bg-[#f8faff] text-[#414753] border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Dropdown & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#06284b] mb-1">
                    Select Appliance / Model *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price.toLocaleString('en-IN')}
                      </option>
                    ))}
                    <option value="custom-service">General Service / Filter Replacement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#06284b] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30 text-center"
                  />
                </div>
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#06284b] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Gowda"
                    className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#06284b] mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98451 22390"
                    className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
                  />
                </div>
              </div>

              {/* Area & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#06284b] mb-1">
                    Tumakuru Locality / Area *
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs border border-slate-200 focus:outline-none font-medium"
                  >
                    <option>Sira Gate, Tumakuru</option>
                    <option>Kyatsandra, Tumakuru</option>
                    <option>Batwadi, Tumakuru</option>
                    <option>SS Puram, Tumakuru</option>
                    <option>Gubbi Gate, Tumakuru</option>
                    <option>Mandipet, Tumakuru</option>
                    <option>Siddaganga Mutt Road</option>
                    <option>Other Tumakuru Layout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#06284b] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
                  />
                </div>
              </div>

              {/* Address / Landmark */}
              <div>
                <label className="block text-xs font-bold text-[#06284b] mb-1">
                  Street Address &amp; Landmark (For Delivery / Installation)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near Old Shanimatma Temple, Satyamangala Road, House #42"
                  className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#06284b] mb-1">
                  Special Notes / Preferred Time
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. High borewell water TDS (around 750). Prefer installation after 4 PM."
                  className="w-full px-3.5 py-2 bg-[#f8faff] rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30 resize-none"
                />
              </div>

              {/* Amount Summary */}
              {orderType !== 'enquiry' && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f0f9ff] border border-[#27c4d9]/40 text-xs font-bold text-[#06284b]">
                  <span>Estimated Total (Inclusive of Free Delivery):</span>
                  <span className="text-base text-[#0b74de] font-mono">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#06284b] via-[#0b74de] to-[#27c4d9] hover:from-[#06284b] hover:to-[#0b74de] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    <span>Saving Order to Supabase...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Confirm Order &amp; Book Same-Day Slot</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>

    {/* Supabase Connection Setup Modal */}
    <SupabaseConnectModal
      isOpen={isConnectModalOpen}
      onClose={() => setIsConnectModalOpen(false)}
    />
  </>
);
};
