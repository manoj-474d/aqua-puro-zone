import React, { useState } from 'react';
import { Product, StoreSettings, OrderType } from '../types';
import { BRAND_LOGO_URL, PLACEHOLDER_PRODUCT_IMAGE } from '../data/initialData';
import { BrandLogo } from '../components/BrandLogo';

interface ProductDetailViewProps {
  product: Product | null;
  allProducts: Product[];
  settings: StoreSettings;
  onBackToCatalog: () => void;
  onSelectProduct: (p: Product) => void;
  onEnquireProduct: (product: Product, type?: OrderType) => void;
  onOpen360?: (product: Product) => void;
  isKannada: boolean;
  onToggleLanguage: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  settings,
  onBackToCatalog,
  onSelectProduct,
  onEnquireProduct,
  onOpen360,
  isKannada,
  onToggleLanguage,
}) => {
  // If product is not found or is hidden (and not in admin mode)
  if (!product || (!product.visibleOnStorefront && !product.isPublished)) {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
          <span className="material-symbols-outlined text-[44px]">search_off</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#06284b]">
          {isKannada ? 'ಉತ್ಪನ್ನ ಲಭ್ಯವಿಲ್ಲ' : 'Product Not Available'}
        </h1>
        <p className="text-sm text-[#414753] max-w-md mt-2">
          {isKannada
            ? 'ಈ ಉತ್ಪನ್ನವನ್ನು ಸದ್ಯಕ್ಕೆ ಸಾರ್ವಜನಿಕ ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ ಅಥವಾ ಬದಲಾಯಿಸಲಾಗಿದೆ.'
            : 'This product has been unlisted, archived, or is currently undergoing warehouse maintenance.'}
        </p>
        <button
          onClick={onBackToCatalog}
          className="mt-6 px-6 py-2.5 bg-[#0b74de] hover:bg-[#005cb3] text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>{isKannada ? 'ಕ್ಯಾಟಲಾಗ್‌ಗೆ ಹಿಂತಿರುಗಿ' : 'Back to Storefront Catalog'}</span>
        </button>
      </div>
    );
  }

  // Gallery array: primary image + additional gallery images
  const allImages = [
    product.image || PLACEHOLDER_PRODUCT_IMAGE,
    ...(product.galleryImages || []),
  ].filter(Boolean);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const currentImage = allImages[selectedImageIndex] || product.image || PLACEHOLDER_PRODUCT_IMAGE;

  const isCurrentInStock = Boolean(product.inStock && (product.stockQuantity ?? 1) > 0);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  // Related products from the same category or other visible products
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.visibleOnStorefront)
    .slice(0, 3);

  const cleanPhone = settings.helplinePhone.replace(/[^0-9]/g, '');
  const cleanWa = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const waEnquiryText = encodeURIComponent(
    `Hello Aqua Puro Zone Tumakuru, I want to enquire about ${product.name} (₹${product.price}). Please share installation details & technician demo.`
  );

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col antialiased">
      {/* 1. Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <BrandLogo variant="full" size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-[#f2f3ff] text-[#06284b]"
          >
            {isKannada ? 'English' : 'ಕನ್ನಡ'}
          </button>

          <button
            onClick={onBackToCatalog}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-[#06284b] flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>{isKannada ? 'ಕ್ಯಾಟಲಾಗ್‌ಗೆ ಹಿಂತಿರುಗಿ' : 'Back to Store'}</span>
          </button>
        </div>
      </header>

      {/* 2. Breadcrumbs */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-[#717784]">
          <button onClick={onBackToCatalog} className="hover:text-[#0b74de] transition-colors">
            {isKannada ? 'ಮುಖಪುಟ' : 'Home'}
          </button>
          <span>/</span>
          <button onClick={onBackToCatalog} className="hover:text-[#0b74de] transition-colors">
            {product.category}
          </button>
          <span>/</span>
          <span className="font-semibold text-[#131b2e] truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* 3. Main Product Showcase Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT: Image Gallery & 360 viewer */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary High-Res Photo View */}
            <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-white border border-[#dae2fd] shadow-sm flex items-center justify-center p-6 overflow-hidden group">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              />

              {/* Discount / In-Stock Tag overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
                    isCurrentInStock
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>
                    {isCurrentInStock
                      ? isKannada
                        ? 'ದಾಸ್ತಾನು ಲಭ್ಯವಿದೆ (In Stock)'
                        : 'In Stock • Ready for Tumakuru Dispatch'
                      : isKannada
                      ? 'ದಾಸ್ತಾನು ಮುಗಿದಿದೆ (Out of Stock)'
                      : 'Out of Stock • Order for Next Delivery'}
                  </span>
                </span>

                {discountPercent && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white shadow-xs self-start">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* 360 Interactive Inspect Button */}
              {onOpen360 && (
                <button
                  onClick={() => onOpen360(product)}
                  className="absolute bottom-4 right-4 z-10 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-[#06284b] hover:text-white text-[#0b74de] text-xs font-bold border border-[#27c4d9]/40 shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">360</span>
                  <span>Interactive 360° View</span>
                </button>
              )}
            </div>

            {/* Thumbnail Gallery Picker */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl bg-white border-2 overflow-hidden p-1.5 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-[#005cb3] shadow-md ring-2 ring-[#005cb3]/20 scale-105'
                        : 'border-[#dae2fd] hover:border-slate-400 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-[#dae2fd] text-center">
              <div>
                <span className="material-symbols-outlined text-[#006c2e] text-[22px]">verified</span>
                <span className="block text-xs font-bold text-[#131b2e] mt-0.5">100% Genuine</span>
                <span className="text-[10px] text-[#717784]">Authorized Dealer</span>
              </div>
              <div>
                <span className="material-symbols-outlined text-[#005cb3] text-[22px]">local_shipping</span>
                <span className="block text-xs font-bold text-[#131b2e] mt-0.5">Same-Day Install</span>
                <span className="text-[10px] text-[#717784]">Within Tumakuru</span>
              </div>
              <div>
                <span className="material-symbols-outlined text-[#006c2e] text-[22px]">shield_check</span>
                <span className="block text-xs font-bold text-[#131b2e] mt-0.5">Free 1st Service</span>
                <span className="text-[10px] text-[#717784]">Certified Engineers</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Information, Specs & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Category & Brand */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#e2e7ff] text-[#005cb3] text-xs font-bold">
                  {product.category}
                </span>
                <span className="text-xs font-semibold text-[#717784]">
                  Brand: <strong className="text-[#131b2e]">{product.brand}</strong>
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#06284b] leading-tight">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-heading font-black text-3xl sm:text-4xl text-[#005cb3]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-slate-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Save ₹{(product.originalPrice! - product.price).toLocaleString('en-IN')} ({discountPercent}%)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#717784] mt-1">
                Inclusive of all taxes • Free professional doorstep installation included in Tumakuru Urban
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="p-5 bg-white rounded-3xl border border-[#dae2fd] shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onEnquireProduct(product, 'purchase')}
                  className={`flex-1 py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                    isCurrentInStock
                      ? 'bg-[#005cb3] hover:bg-[#0b74de] text-white hover:scale-102'
                      : 'bg-[#414753] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                  <span>{isCurrentInStock ? 'Order & Book Installation' : 'Pre-Order / Enquire'}</span>
                </button>

                <a
                  href={`https://wa.me/${cleanWa}?text=${waEnquiryText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-6 rounded-2xl bg-[#006c2e] hover:bg-[#00883c] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-102"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-[#414753]">
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#005cb3] hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>Call Store: {settings.helplinePhone}</span>
                </a>

                <span className="text-[11px] text-[#717784]">
                  Warehouse stock: <strong>{product.stockQuantity ?? 0} units</strong>
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-heading font-bold text-base text-[#06284b] mb-1.5">
                {isKannada ? 'ಉತ್ಪನ್ನದ ವಿವರಣೆ' : 'Product Description'}
              </h3>
              <p className="text-sm text-[#414753] leading-relaxed whitespace-pre-line">
                {product.description ||
                  'Engineered for Tumakuru high TDS water conditions, providing pure, mineral-rich, and healthy drinking water for families and offices.'}
              </p>
            </div>

            {/* Technical Specifications Table */}
            <div>
              <h3 className="font-heading font-bold text-base text-[#06284b] mb-2.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#005cb3] text-[20px]">tune</span>
                <span>Technical Specifications</span>
              </h3>
              <div className="bg-white rounded-2xl border border-[#dae2fd] overflow-hidden text-xs">
                <div className="grid grid-cols-2 p-3 border-b border-[#dae2fd]/60 bg-[#f8f9ff]">
                  <span className="font-bold text-[#414753]">Purification Technology</span>
                  <span className="font-semibold text-[#131b2e]">{product.purificationStages || 'RO + UV + UF Filtration'}</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-[#dae2fd]/60">
                  <span className="font-bold text-[#414753]">Storage Capacity / Flow Rate</span>
                  <span className="font-semibold text-[#131b2e]">{product.capacity || '10 Litres Tank'}</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-[#dae2fd]/60 bg-[#f8f9ff]">
                  <span className="font-bold text-[#414753]">Max Supported TDS</span>
                  <span className="font-semibold text-[#131b2e]">{product.maxTds || 'Up to 2000 PPM'}</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-[#dae2fd]/60">
                  <span className="font-bold text-[#414753]">Mount Type</span>
                  <span className="font-semibold text-[#131b2e]">{product.mountType || 'Wall-Mounted / Countertop'}</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-[#dae2fd]/60 bg-[#f8f9ff]">
                  <span className="font-bold text-[#414753]">Target Water Source</span>
                  <span className="font-semibold text-[#006c2e]">{product.targetWaterType || 'Borewell & Kaveri'}</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="font-bold text-[#414753]">Warranty & AMC</span>
                  <span className="font-semibold text-[#005cb3]">{product.warranty || '1 Year Comprehensive Warranty'}</span>
                </div>
              </div>
            </div>

            {/* Key Features & Benefits */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="font-heading font-bold text-base text-[#06284b] mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#006c2e] text-[20px]">check_circle</span>
                  <span>Key Features &amp; Benefits</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 bg-white rounded-xl border border-[#dae2fd]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006c2e] mt-1.5 shrink-0" />
                      <span className="text-[#131b2e] font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 4. Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#dae2fd]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-[#005cb3] uppercase tracking-wider block">
                  Tumakuru Warehouse
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#06284b]">
                  {isKannada ? 'ಇದೇ ವರ್ಗದ ಇತರ ಮಾದರಿಗಳು' : 'More In-Stock Water Purifiers & Appliances'}
                </h2>
              </div>
              <button
                onClick={onBackToCatalog}
                className="text-xs font-bold text-[#005cb3] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectProduct(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-3xl p-4 border border-[#dae2fd] shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-full h-44 rounded-2xl bg-[#f2f3ff] flex items-center justify-center p-3 mb-3 border border-[#dae2fd]/60 overflow-hidden">
                    <img
                      src={rel.image || PLACEHOLDER_PRODUCT_IMAGE}
                      alt={rel.name}
                      className="h-full w-auto object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#005cb3] text-[10px] font-bold">
                      {rel.category}
                    </span>
                    <h4 className="font-heading font-bold text-sm text-[#131b2e] mt-1 group-hover:text-[#005cb3] transition-colors line-clamp-1">
                      {rel.name}
                    </h4>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-heading font-extrabold text-base text-[#005cb3]">
                        ₹{rel.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        In Stock
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
