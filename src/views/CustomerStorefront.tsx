import React, { useState } from 'react';
import { Product, Review, StoreSettings, Lead, OrderType } from '../types';
import { BRAND_LOGO_URL } from '../data/initialData';
import { submitClientOrder, isSupabaseConfigured } from '../lib/supabaseClient';
import { LiveCameraSection } from '../components/LiveCameraSection';
import { HeroPurifier } from '../components/animations/HeroPurifier';
import { PurificationProcess } from '../components/animations/PurificationProcess';
import { BeforeAfterSlider } from '../components/animations/BeforeAfterSlider';
import { ProductCard3D } from '../components/animations/ProductCard3D';
import { Product360Modal } from '../components/animations/Product360Modal';
import { WaveDivider } from '../components/animations/WaveDivider';
import { WaterCursorTrail } from '../components/animations/WaterCursorTrail';
import { WaterLoader } from '../components/animations/WaterLoader';
import { OrderFormModal } from '../components/orders/OrderFormModal';
import { SupabaseConnectModal } from '../components/Modals/SupabaseConnectModal';

interface CustomerStorefrontProps {
  products: Product[];
  reviews: Review[];
  settings: StoreSettings;
  onReturnToAdmin: () => void;
  onSubmitLead: (lead: Lead) => void;
  isKannada: boolean;
  onToggleLanguage: () => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({
  products,
  reviews,
  settings,
  onReturnToAdmin,
  onSubmitLead,
  isKannada,
  onToggleLanguage,
}) => {
  // Free test booking form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Sira Gate, Tumakuru');
  const [waterType, setWaterType] = useState('Borewell Water (High Hardness)');
  const [submitted, setSubmitted] = useState(false);

  // 360 viewer modal state
  const [selected360Product, setSelected360Product] = useState<Product | null>(null);
  const [is360Open, setIs360Open] = useState(false);

  // Client Orders Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalProduct, setOrderModalProduct] = useState<Product | null>(null);
  const [orderModalType, setOrderModalType] = useState<OrderType>('purchase');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Active filter for products
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const cleanWaNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');

  const handleOpenOrderModal = (product: Product | null = null, type: OrderType = 'purchase') => {
    setOrderModalProduct(product);
    setOrderModalType(type);
    setIsOrderModalOpen(true);
  };

  const handleBookTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newLead: Lead = {
      id: `lead-store-${Date.now()}`,
      timestamp: 'Just now (Storefront Web)',
      customerName: name.trim(),
      phone: phone.trim(),
      locality: locality,
      spaceImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFoHrtTht-KsZhZaABctjclsTcQT1yPVnpmFjjlVewiNOpPhD75mLqAqNjBA2W-LOTtFhytcKNVod2L129Yc-UzcMyNfgen4NViG7aurpKxfRXF5bjzIp57zY-OFgNPLce4Dkk70ykutGPFFmGbE91pXjWQIdbr4cLrReJP0dW16Ntt6X_jlh69-imwxS1NzXmt2NCCN4hXu2m4ZozC0U6VbdNmAqRRkFpUoQJFdQcZ-Ocgg8kQHMw',
      spaceTitle: 'Direct Web Booking',
      waterSource: waterType,
      tdsPpm: 'Pending Test',
      membersCount: 4,
      aiRecommendation: 'Free In-Home Digital TDS Assessment Scheduled',
      aiTag: 'Doorstep Test',
      status: 'new',
      notes: `Direct booking from Tumakuru storefront website. Water source: ${waterType}.`,
      source: 'Web Direct Form',
    };

    onSubmitLead(newLead);

    // Also persist directly into Supabase Client Orders table!
    await submitClientOrder({
      customer_name: name.trim(),
      phone: phone.trim(),
      area: locality,
      order_type: 'enquiry',
      notes: `Doorstep TDS water testing requested. Water source: ${waterType}.`,
      source: 'website_form',
    });

    setSubmitted(true);
  };

  const handleEnquireProduct = (product: Product) => {
    handleOpenOrderModal(product, 'purchase');
  };

  const handleOpen360 = (product: Product) => {
    setSelected360Product(product);
    setIs360Open(true);
  };

  // ONLY visible products that owner enabled on the storefront
  const visibleProducts = products.filter((p) => p.visibleOnStorefront);
  const visibleReviews = reviews.filter((r) => r.visibleOnWeb);

  // Filtered products list
  const filteredProducts = visibleProducts.filter((p) => {
    if (categoryFilter === 'All') return true;
    return p.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  const heroFeaturedProduct = visibleProducts[0] || products[0];

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#faf8ff] text-[#131b2e] antialiased overflow-x-hidden selection:bg-[#27c4d9] selection:text-[#06284b]">
      {/* 0. Desktop Cursor Water Droplets */}
      <WaterCursorTrail />

      {/* 0. Optional Initial Water Loader */}
      <WaterLoader brandName="Aqua Puro Zone Tumakuru" />

      {/* 1. Top Announcement Bar */}
      {settings.bannerActive && (
        <div className="bg-gradient-to-r from-[#06284b] via-[#0b74de] to-[#06284b] text-white px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-xs border-b border-[#27c4d9]/30">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27c4d9] animate-ping" />
            <span>{isKannada ? settings.bannerTextKn : settings.bannerTextEn}</span>
          </span>
          <a
            href={`tel:${settings.helplinePhone.replace(/[^0-9]/g, '')}`}
            className="underline font-bold text-[#5ee9ff] hover:text-white ml-1 inline-flex items-center gap-1"
          >
            {/* Tap outlet drip animation */}
            <span className="w-1 h-1.5 rounded-full bg-[#5ee9ff] animate-bounce" />
            <span>Call Now</span>
          </a>
        </div>
      )}

      {/* 2. Customer Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img src={BRAND_LOGO_URL} alt="Aqua Puro Zone" className="h-8 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-[17px] text-[#06284b] leading-tight">
              Aqua Puro Zone
            </span>
            <span className="text-[11px] text-[#414753] font-medium hidden sm:inline">
              Tumakuru • Sira Gate Store
            </span>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-[#414753]">
          <a href="#how-it-purifies" className="hover:text-[#0b74de] transition-colors">
            How It Purifies
          </a>
          <a href="#water-clarity" className="hover:text-[#0b74de] transition-colors">
            TDS Test &amp; Clarity
          </a>
          <a href="#live-photo-section" className="text-[#0b74de] hover:underline flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-[17px]">photo_camera</span>
            <span>Live Photo AI</span>
          </a>
          <a href="#visible-products" className="hover:text-[#0b74de] transition-colors">
            In-Stock Catalog ({visibleProducts.length})
          </a>
          <a href="#book-tds-test" className="hover:text-[#0b74de] transition-colors">
            Free Home Visit
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Order Online / Book Service Button */}
          <button
            onClick={() => handleOpenOrderModal(heroFeaturedProduct, 'purchase')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0b74de] hover:bg-[#06284b] text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
            <span className="hidden sm:inline">Order / Book Service</span>
            <span className="sm:hidden">Order</span>
          </button>

          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] border border-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">translate</span>
            <span>{isKannada ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Supabase Connection Status Pill */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isSupabaseConfigured()
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
            title={isSupabaseConfigured() ? 'Supabase Database Connected' : 'Supabase Not Connected: Click to Setup'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{isSupabaseConfigured() ? 'Supabase Live' : 'Connect Supabase'}</span>
          </button>

          <a
            href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent('Hello Aqua Puro Zone Tumakuru, I want to inquire about an in-stock water purifier.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#006c2e] hover:bg-[#00883c] text-white rounded-full text-xs font-semibold shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">chat</span>
            <span className="hidden sm:inline">WhatsApp Desk</span>
          </a>

          {/* Dedicated Owner Admin Panel Switcher */}
          <button
            onClick={onReturnToAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06284b] hover:bg-[#0b74de] text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            title="Switch to Dedicated Owner Admin Panel"
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            <span className="hidden md:inline">Admin Panel</span>
          </button>
        </div>
      </header>

      {/* 3. HERO SHOWCASE WITH HERO PURIFIER CENTERPIECE */}
      <section className="relative px-4 sm:px-8 pt-10 pb-16 lg:pt-14 lg:pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#27c4d9]/20 text-[#06284b] text-[12px] font-bold border border-[#27c4d9]/40">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006c2e] animate-ping" />
              <span>{isKannada ? 'ಲೈವ್ ಫೋಟೋ AI ತಂತ್ರಜ್ಞಾನ • ತಕ್ಷಣದ ದಾಸ್ತಾನು ಲಭ್ಯತೆ' : 'Tumakuru\'s #1 Mineral RO Showcase'}</span>
            </div>

            <h1 className="font-heading font-extrabold text-[36px] sm:text-[48px] text-[#06284b] leading-[1.15] tracking-tight">
              {isKannada
                ? 'ನಿಮ್ಮ ಅಡುಗೆಮನೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ - ಅಂಗಡಿಯ ದಾಸ್ತಾನಿನಲ್ಲಿರುವ ಪ್ಯೂರಿಫೈಯರ್ ಅನ್ನು ತಕ್ಷಣವೇ ಪಡೆಯಿರಿ'
                : 'Pure Water Engineered for Tumakuru Borewells.'}
            </h1>

            <p className="text-[15px] sm:text-[17px] text-[#414753] leading-relaxed max-w-xl">
              Experience medical-grade water purity. Our Copper Max Pro systems eliminate harsh minerals, bacteria, and borewell TDS while infusing natural alkaline minerals for sweet, wholesome taste.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => handleOpenOrderModal(heroFeaturedProduct, 'purchase')}
                className="px-6 py-3.5 bg-gradient-to-r from-[#06284b] via-[#0b74de] to-[#27c4d9] hover:from-[#06284b] hover:to-[#0b74de] text-white rounded-xl text-[14px] font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-98"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                <span>Order Now (Live Install)</span>
              </button>

              <a
                href="#live-photo-section"
                className="px-6 py-3.5 bg-white hover:bg-[#f0f9ff] text-[#06284b] border border-[#27c4d9]/50 rounded-xl text-[14px] font-bold transition-all flex items-center gap-2 shadow-xs hover:border-[#0b74de]"
              >
                <span className="material-symbols-outlined text-[20px] text-[#0b74de]">photo_camera</span>
                <span>{isKannada ? 'ಲೈವ್ ಫೋಟೋ ತೆಗೆಯಿರಿ' : 'Take Live Photo Scan'}</span>
              </a>

              <a
                href="#how-it-purifies"
                className="px-6 py-3.5 bg-white hover:bg-[#f0f9ff] text-[#06284b] border border-[#27c4d9]/50 rounded-xl text-[14px] font-bold transition-all flex items-center gap-2 shadow-xs hover:border-[#0b74de]"
              >
                <span className="material-symbols-outlined text-[20px] text-[#0b74de]">biotech</span>
                <span>Inside 6-Stage Filtration</span>
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-6 max-w-md border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c2e] text-[22px]">verified</span>
                <div>
                  <span className="text-[12px] font-bold text-[#06284b] block">100% In Stock</span>
                  <span className="text-[10px] text-[#414753]">Sira Gate Warehouse</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c2e] text-[22px]">bolt</span>
                <div>
                  <span className="text-[12px] font-bold text-[#06284b] block">Same-Day Install</span>
                  <span className="text-[10px] text-[#414753]">Tumakuru Urban</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c2e] text-[22px]">health_and_safety</span>
                <div>
                  <span className="text-[12px] font-bold text-[#06284b] block">99.9% Pure</span>
                  <span className="text-[10px] text-[#414753]">Certified Safe</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Purifier 3D Showcase */}
          <div className="lg:col-span-6">
            <HeroPurifier
              imageSrc={heroFeaturedProduct.image}
              name={heroFeaturedProduct.name}
              price={heroFeaturedProduct.price}
              onEnquire={() => handleEnquireProduct(heroFeaturedProduct)}
              onOpen360={() => handleOpen360(heroFeaturedProduct)}
            />
          </div>
        </div>
      </section>

      {/* Wave Transition */}
      <WaveDivider colorTop="#faf8ff" colorBottom="#ffffff" />

      {/* 4. "HOW IT PURIFIES" INTERACTIVE 6-STAGE CUTAWAY SCROLL ANIMATION */}
      <div id="how-it-purifies" className="bg-white">
        <PurificationProcess />
      </div>

      {/* Wave Transition */}
      <WaveDivider colorTop="#ffffff" colorBottom="#faf8ff" />

      {/* 5. BEFORE / AFTER SPLIT-GLASS WATER CLARITY SLIDER & ANIMATED TDS METER */}
      <div id="water-clarity">
        <BeforeAfterSlider />
      </div>

      {/* 6. DEDICATED LIVE CAMERA PHOTO SCANNER & AR PURIFIER PROJECTION */}
      <LiveCameraSection
        products={products}
        onSubmitLead={onSubmitLead}
        whatsappNumber={settings.whatsappNumber}
        isKannada={isKannada}
      />

      {/* 7. VISIBLE PRODUCTS CATALOG WITH 3D HOVER TILT, WATER FILL & 360° VIEW */}
      <section id="visible-products" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#0b74de]">inventory_2</span>
              <span className="text-[12px] font-bold text-[#0b74de] uppercase tracking-wider">
                {isKannada ? 'ಪ್ರಸ್ತುತ ಲಭ್ಯವಿರುವ ಉತ್ಪನ್ನಗಳು' : 'Live In-Stock Appliances'}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#06284b]">
              Owner's Live In-Stock Purifiers &amp; Softeners
            </h2>
            <p className="text-[14px] text-[#414753] mt-1">
              Every unit is physically available at the Sira Gate Tumakuru store with transparent prices and same-day installation.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#f0f4ff] rounded-xl border border-slate-200 shrink-0">
            {['All', 'Water Purifier', 'Softener', 'Chimney'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-white text-[#06284b] shadow-xs'
                    : 'text-[#414753] hover:text-[#06284b]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <span className="material-symbols-outlined text-[48px] text-slate-400">inventory_2</span>
            <h3 className="font-bold text-lg text-[#06284b] mt-2">No units found in this category</h3>
            <p className="text-xs text-[#414753] mt-1">
              Select another category or view all in-stock products.
            </p>
            <button
              onClick={() => setCategoryFilter('All')}
              className="mt-3 px-4 py-2 bg-[#0b74de] text-white rounded-xl text-xs font-semibold"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard3D
                key={p.id}
                product={p}
                onEnquire={handleEnquireProduct}
                onOpen360={handleOpen360}
                helplinePhone={settings.helplinePhone}
                isKannada={isKannada}
              />
            ))}
          </div>
        )}
      </section>

      {/* 8. Doorstep Water TDS Testing Booking Form */}
      <section id="book-tds-test" className="px-4 sm:px-8 py-14 bg-gradient-to-b from-[#f2f3ff] to-[#e0f2fe]/40 border-y border-slate-200">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#27c4d9]/40">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="px-3.5 py-1 bg-[#27c4d9]/20 text-[#06284b] text-[11px] font-bold rounded-full uppercase tracking-wider">
              100% Free Doorstep Testing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#06284b] mt-2">
              {isKannada ? 'ನಿಮ್ಮ ಮನೆಯ ನೀರಿನ ಉಚಿತ TDS ಪರೀಕ್ಷೆ ಬುಕ್ ಮಾಡಿ' : 'Book Free Water TDS Testing at Your Home'}
            </h2>
            <p className="text-[13px] text-[#414753] mt-1.5">
              Our technician visits your home in Tumakuru with a digital TDS meter to measure hardness and recommend the perfect purifier. Zero purchase obligation.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2">
              <span className="material-symbols-outlined text-[#006c2e] text-[40px]">check_circle</span>
              <h3 className="font-heading font-bold text-[18px] text-[#006c2e]">
                {isKannada ? 'ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಕೋರಿಕೆಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ.' : 'Booking Confirmed!'}
              </h3>
              <p className="text-[13px] text-[#414753]">
                Our Sira Gate store manager will call you shortly on <span className="font-mono font-bold text-[#06284b]">{phone}</span> to schedule technician arrival.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookTest} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#06284b] mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Murthy"
                  className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#06284b] mb-1">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-xs font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#06284b] mb-1">
                  Tumakuru Locality *
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-xs border border-slate-200 focus:outline-none font-medium"
                >
                  <option>Sira Gate, Tumakuru</option>
                  <option>Kyatsandra, Tumakuru</option>
                  <option>Batwadi, Tumakuru</option>
                  <option>SS Puram, Tumakuru</option>
                  <option>Gubbi Gate, Tumakuru</option>
                  <option>Mandipet, Tumakuru</option>
                  <option>Other Tumakuru Layout</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#06284b] mb-1">
                  Current Water Source
                </label>
                <select
                  value={waterType}
                  onChange={(e) => setWaterType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-xs border border-slate-200 focus:outline-none font-medium"
                >
                  <option>Borewell Water (High Hardness)</option>
                  <option>Kaveri River Water (Municipal)</option>
                  <option>Private Tanker Water</option>
                  <option>Not Sure (Need TDS Meter Check)</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#06284b] via-[#0b74de] to-[#27c4d9] hover:from-[#06284b] hover:to-[#0b74de] text-white rounded-xl text-[14px] font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  <span>{isKannada ? 'ಉಚಿತ ಭೇಟಿಯನ್ನು ಖಚಿತಪಡಿಸಿ' : 'Confirm Free TDS Testing Visit'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* 9. Verified Customer Reviews */}
      <section id="reviews" className="px-4 sm:px-8 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined fill-1 text-[22px]">star</span>
              ))}
            </div>
            <h2 className="text-3xl font-extrabold text-[#06284b]">
              Trusted by 1,200+ Tumakuru Families
            </h2>
            <p className="text-sm text-[#414753] mt-1">
              Real feedback from homeowners in Sira Gate, Kyatsandra, and Batawadi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#f8faff] rounded-2xl p-6 border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#06284b]">{rev.author}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {rev.badge}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#131b2e] italic mb-2 leading-relaxed">
                    {rev.textEn}
                  </p>
                  {rev.textKn && (
                    <p className="text-[12px] text-[#414753] leading-relaxed font-medium">
                      {rev.textKn}
                    </p>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-200">
                  📍 {rev.locality} • {rev.installedProduct}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Store Location & Footer */}
      <footer className="bg-[#06284b] text-white px-4 sm:px-8 py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="material-symbols-outlined text-[#27c4d9] text-[24px]">water_drop</span>
              <span className="font-heading font-bold text-lg text-white">Aqua Puro Zone</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tumakuru's authorized water purifier showroom, comprehensive AMC service provider, and kitchen chimney center.
            </p>
            <p className="text-xs text-slate-400 mt-3">
              Tagline: <span className="text-[#27c4d9] font-medium">{settings.storefrontTagline}</span>
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm mb-3 text-white">Visit Our Tumakuru Store</h4>
            <p className="text-xs text-slate-300 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#27c4d9] shrink-0 mt-0.5">location_on</span>
              <span>{settings.storefrontAddress}</span>
            </p>
            <p className="text-xs text-slate-300 flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-[18px] text-[#27c4d9]">schedule</span>
              <span>{settings.operatingHours}</span>
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm mb-3 text-white">Direct Dispatch Desk</h4>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#27c4d9]">call</span>
              <a href={`tel:${settings.helplinePhone}`} className="hover:text-white font-mono font-semibold">
                {settings.helplinePhone}
              </a>
            </p>
            <p className="text-xs text-slate-300 flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-[18px] text-[#4ae176]">chat</span>
              <a href={`https://wa.me/${cleanWaNumber}`} className="hover:text-white font-mono font-semibold">
                {settings.whatsappNumber}
              </a>
            </p>
            <button
              onClick={onReturnToAdmin}
              className="mt-4 px-4 py-2 bg-[#0b74de] hover:bg-[#27c4d9] hover:text-[#06284b] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Open Dedicated Owner Admin Panel</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Aqua Puro Zone Tumakuru. Pure Mineral Drinking Water Systems.
        </div>
      </footer>

      {/* 360° Interactive Product Modal */}
      {selected360Product && (
        <Product360Modal
          product={selected360Product}
          isOpen={is360Open}
          onClose={() => {
            setIs360Open(false);
            setSelected360Product(null);
          }}
          onEnquire={(p) => handleEnquireProduct(p)}
        />
      )}

      {/* Supabase Client Orders & Service Booking Modal */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        products={products}
        initialProduct={orderModalProduct}
        initialOrderType={orderModalType}
        whatsappNumber={settings.whatsappNumber}
        isKannada={isKannada}
      />

      {/* Supabase Connection Setup & Diagnostic Modal */}
      <SupabaseConnectModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

