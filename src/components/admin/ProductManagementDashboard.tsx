import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { PLACEHOLDER_PRODUCT_IMAGE } from '../../data/initialData';
import { uploadProductPhotoFile } from '../../lib/supabaseClient';

interface ProductManagementDashboardProps {
  products: Product[];
  onOpenAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleProductVisibility: (productId: string) => void;
  onToggleProductStock: (productId: string) => void;
  onUpdateProductPhoto?: (productId: string, newImageUrl: string) => void;
  onRemoveProductPhoto?: (productId: string) => void;
  onViewProductDetail?: (product: Product) => void;
  onUpdateStockQuantity?: (productId: string, newQuantity: number) => void;
  onNavigateToAiLibrary?: () => void;
  isKannada: boolean;
}

type SortField = 'updatedAt' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc' | 'stockQuantity';
type ViewMode = 'table' | 'cards';

export const ProductManagementDashboard: React.FC<ProductManagementDashboardProps> = ({
  products,
  onOpenAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProductVisibility,
  onToggleProductStock,
  onUpdateProductPhoto,
  onRemoveProductPhoto,
  onViewProductDetail,
  onUpdateStockQuantity,
  onNavigateToAiLibrary,
  isKannada,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Categories list extracted dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted products
  const processedProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.slug && p.slug.toLowerCase().includes(query)) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          (p.purificationStages && p.purificationStages.toLowerCase().includes(query));

        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

        const isCurrentlyInStock = Boolean(p.inStock && (p.stockQuantity ?? 1) > 0);
        const matchesStock =
          stockFilter === 'all' ||
          (stockFilter === 'in_stock' && isCurrentlyInStock) ||
          (stockFilter === 'out_of_stock' && !isCurrentlyInStock);

        const isPublished = Boolean(p.visibleOnStorefront);
        const matchesVisibility =
          visibilityFilter === 'all' ||
          (visibilityFilter === 'published' && isPublished) ||
          (visibilityFilter === 'hidden' && !isPublished);

        return matchesSearch && matchesCategory && matchesStock && matchesVisibility;
      })
      .sort((a, b) => {
        if (sortField === 'priceAsc') return a.price - b.price;
        if (sortField === 'priceDesc') return b.price - a.price;
        if (sortField === 'nameAsc') return a.name.localeCompare(b.name);
        if (sortField === 'nameDesc') return b.name.localeCompare(a.name);
        if (sortField === 'stockQuantity') return (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0);

        // Default updatedAt / createdAt
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [products, searchTerm, categoryFilter, stockFilter, visibilityFilter, sortField]);

  // Pagination calculation
  const totalItems = processedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedProducts = processedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const totalCount = products.length;
  const inStockCount = products.filter((p) => p.inStock && (p.stockQuantity ?? 1) > 0).length;
  const outOfStockCount = totalCount - inStockCount;
  const publishedCount = products.filter((p) => p.visibleOnStorefront).length;
  const hiddenCount = totalCount - publishedCount;

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Name',
      'Slug',
      'Category',
      'Brand',
      'Price',
      'Original Price',
      'Stock Quantity',
      'In Stock',
      'Published',
      'Purification Stages',
      'Warranty',
      'Last Updated',
    ];

    const rows = processedProducts.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.slug || ''}"`,
      `"${p.category}"`,
      `"${p.brand}"`,
      p.price,
      p.originalPrice || '',
      p.stockQuantity ?? 0,
      p.inStock ? 'YES' : 'NO',
      p.visibleOnStorefront ? 'YES' : 'NO',
      `"${(p.purificationStages || '').replace(/"/g, '""')}"`,
      `"${(p.warranty || '').replace(/"/g, '""')}"`,
      `"${p.updatedAt || p.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AquaPuroZone_Products_Tumakuru_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCardPhotoUpload = async (productId: string, file: File) => {
    try {
      const { url } = await uploadProductPhotoFile(file);
      if (onUpdateProductPhoto) {
        onUpdateProductPhoto(productId, url);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (onUpdateProductPhoto) {
          onUpdateProductPhoto(productId, dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Live Metric KPI Tiles */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-[#dae2fd]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#dae2fd]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#005cb3] text-[28px]">inventory</span>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#131b2e]">
                {isKannada ? 'ಉತ್ಪನ್ನಗಳ ಸಂಪೂರ್ಣ ನಿರ್ವಹಣೆ' : 'Product Management Dashboard'}
              </h1>
            </div>
            <p className="text-[13px] text-[#414753] mt-1.5">
              {isKannada
                ? 'ತುಮಕೂರು ಸ್ಟೋರ್‌ನ ನೀರಿನ ಶುದ್ಧೀಕರಣ ಯಂತ್ರಗಳು ಮತ್ತು ಗೃಹೋಪಯೋಗಿ ಉಪಕರಣಗಳ ಪೂರ್ಣ ನಿಯಂತ್ರಣ • ಬೆಲೆ, ದಾಸ್ತಾನು ಮತ್ತು ಪ್ರಕಟಣೆ'
                : 'Direct database control over every water purifier, softener, and appliance displayed on the public storefront'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl border border-[#dae2fd] bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Download products CSV"
            >
              <span className="material-symbols-outlined text-[16px] text-[#005cb3]">download</span>
              <span>Export CSV</span>
            </button>

            {onNavigateToAiLibrary && (
              <button
                onClick={onNavigateToAiLibrary}
                className="px-4 py-2.5 bg-gradient-to-r from-[#06284B] to-[#005cb3] hover:from-[#005cb3] hover:to-[#0b74de] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all border border-[#00D2FF]/40"
                title="Batch Uploading: Drag-and-drop or file selection supporting multiple images simultaneously on desktop and mobile"
              >
                <span className="material-symbols-outlined text-[18px] text-[#00FFCC]">add_photo_alternate</span>
                <span>{isKannada ? 'ಬ್ಯಾಚ್ ಇಮೇಜ್ ಅಪ್‌ಲೋಡ್' : 'Batch Upload Images (AI)'}</span>
              </button>
            )}

            <button
              onClick={onOpenAddProduct}
              className="px-5 py-2.5 bg-[#005cb3] hover:bg-[#0b74de] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>{isKannada ? '+ ಹೊಸ ಉತ್ಪನ್ನ ಸೇರಿಸಿ' : '+ Add New Product'}</span>
            </button>
          </div>
        </div>

        {/* Batch Uploading Callout Banner */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#06284B] via-[#0B1E36] to-[#005cb3] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#00D2FF]/30 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <span className="material-symbols-outlined text-[24px] text-[#00FFCC]">cloud_upload</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-bold text-sm sm:text-base text-white">
                  Batch Uploading: Drag-and-drop or file selection supporting multiple images simultaneously on desktop and mobile
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-[#00FFCC]/20 text-[#00FFCC] text-[10px] font-bold border border-[#00FFCC]/30">
                  Visual AI Catalog
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
                Upload multiple water purifier, softener, and solar product photos directly without entering names, prices, or specs. Used for customer room visual matching.
              </p>
            </div>
          </div>
          {onNavigateToAiLibrary && (
            <button
              onClick={onNavigateToAiLibrary}
              className="shrink-0 px-4 py-2 bg-[#00FFCC] text-[#06284B] hover:bg-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
              <span>Open Batch Uploader</span>
            </button>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5">
          <div className="p-3.5 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd]">
            <span className="text-[11px] font-bold text-[#414753] uppercase tracking-wider block">
              Total Catalog
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#131b2e]">{totalCount}</span>
              <span className="text-[11px] text-[#717784]">units</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Live In Stock
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-700">{inStockCount}</span>
              <span className="text-[11px] text-emerald-600">available</span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Out of Stock
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-700">{outOfStockCount}</span>
              <span className="text-[11px] text-amber-600">sold out</span>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Published on Web
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#005cb3]">{publishedCount}</span>
              <span className="text-[11px] text-blue-600">customer visible</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Hidden / Drafts
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-700">{hiddenCount}</span>
              <span className="text-[11px] text-slate-500">unlisted</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search, Filter, Sort & View Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#dae2fd] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717784] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, model, tag, stage, TDS..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f2f3ff] rounded-xl text-xs sm:text-[13px] border border-[#dae2fd] focus:outline-none focus:ring-2 focus:ring-[#005cb3]/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-[#f2f3ff] rounded-xl text-xs sm:text-[13px] font-medium border border-[#dae2fd] focus:outline-none"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="md:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-[#f2f3ff] rounded-xl text-xs sm:text-[13px] font-medium border border-[#dae2fd] focus:outline-none"
            >
              <option value="all">Stock: All</option>
              <option value="in_stock">In Stock Only</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Visibility Filter */}
          <div className="md:col-span-3">
            <select
              value={visibilityFilter}
              onChange={(e) => {
                setVisibilityFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-[#f2f3ff] rounded-xl text-xs sm:text-[13px] font-medium border border-[#dae2fd] focus:outline-none"
            >
              <option value="all">Status: All</option>
              <option value="published">Published (Storefront)</option>
              <option value="hidden">Hidden from Customers</option>
            </select>
          </div>
        </div>

        {/* Secondary Bar: Sorting, View Mode & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#dae2fd]/60">
          <div className="flex items-center gap-2 text-xs text-[#414753]">
            <span>Showing</span>
            <span className="font-bold text-[#131b2e]">{processedProducts.length}</span>
            <span>of</span>
            <span className="font-bold text-[#131b2e]">{products.length}</span>
            <span>products</span>
            {searchTerm && <span className="text-[#005cb3] font-medium">matching "{searchTerm}"</span>}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#414753]">
              <span className="material-symbols-outlined text-[16px]">sort</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="px-2.5 py-1.5 bg-[#f2f3ff] rounded-lg text-xs font-semibold border border-[#dae2fd] focus:outline-none"
              >
                <option value="updatedAt">Last Updated</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="nameAsc">Name: A to Z</option>
                <option value="nameDesc">Name: Z to A</option>
                <option value="stockQuantity">Stock Quantity</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-[#f2f3ff] rounded-xl border border-[#dae2fd]">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                  viewMode === 'table' ? 'bg-white text-[#005cb3] shadow-2xs' : 'text-[#717784] hover:text-[#131b2e]'
                }`}
                title="Table View"
              >
                <span className="material-symbols-outlined text-[18px]">table_rows</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                  viewMode === 'cards' ? 'bg-white text-[#005cb3] shadow-2xs' : 'text-[#717784] hover:text-[#131b2e]'
                }`}
                title="Card Grid View"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Listings Display: Table or Cards */}
      {processedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#dae2fd] shadow-xs">
          <span className="material-symbols-outlined text-[48px] text-slate-300">inventory_2</span>
          <h3 className="text-base font-bold text-[#131b2e] mt-2">No matching products found</h3>
          <p className="text-xs text-[#717784] mt-1">Try resetting your search query or filters.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStockFilter('all');
              setVisibilityFilter('all');
            }}
            className="mt-3 px-4 py-2 bg-[#005cb3] text-white rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl shadow-xs border border-[#dae2fd] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-[#f2f3ff] border-b border-[#dae2fd] text-[11px] font-bold text-[#414753] uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16">Photo</th>
                  <th className="py-3.5 px-4">Product Name &amp; Model</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4 text-center">Stock Availability</th>
                  <th className="py-3.5 px-4 text-center">Storefront Status</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dae2fd]/60 text-xs text-[#131b2e]">
                {paginatedProducts.map((p) => {
                  const isCurrentInStock = Boolean(p.inStock && (p.stockQuantity ?? 1) > 0);
                  const isPublished = Boolean(p.visibleOnStorefront);
                  const isEligibleAdminUpload = Boolean(
                    p.is_user_uploaded &&
                    p.image &&
                    !p.image.includes('lh3.googleusercontent.com') &&
                    !p.image.includes('images.unsplash.com') &&
                    p.image !== PLACEHOLDER_PRODUCT_IMAGE
                  );

                  return (
                    <tr key={p.id} className="hover:bg-[#f8f9ff] transition-colors group">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div
                          className="relative w-12 h-12 rounded-xl bg-[#f2f3ff] border border-[#dae2fd] overflow-hidden flex items-center justify-center p-1 cursor-pointer shrink-0"
                          onClick={() => onViewProductDetail?.(p)}
                          title={isEligibleAdminUpload ? "Admin-Uploaded Photo (AI Recommender Active)" : "Default / Template Image"}
                        >
                          <img
                            src={p.image || PLACEHOLDER_PRODUCT_IMAGE}
                            alt={p.name}
                            className="w-full h-full object-contain"
                          />
                          {isEligibleAdminUpload && (
                            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" title="Admin Uploaded Photo (AI Recommender Active)" />
                          )}
                        </div>
                      </td>

                      {/* Product Name & Specs snippet */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-[#131b2e] leading-snug truncate hover:text-[#005cb3] transition-colors">
                          <button
                            type="button"
                            onClick={() => onViewProductDetail?.(p)}
                            className="text-left font-bold hover:underline"
                          >
                            {p.name}
                          </button>
                        </div>
                        <div className="text-[11px] text-[#717784] flex items-center gap-2 mt-0.5">
                          <span>{p.brand}</span>
                          {p.purificationStages && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[160px]">{p.purificationStages}</span>
                            </>
                          )}
                        </div>
                        {p.featured && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded mt-1">
                            ★ Featured
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#e2e7ff] text-[#005cb3] font-bold text-[11px] whitespace-nowrap">
                          {p.category}
                        </span>
                      </td>

                      {/* Price & Discount */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-[#005cb3] text-sm">
                          ₹{p.price.toLocaleString('en-IN')}
                        </div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{p.originalPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Stock availability & quantity */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => onToggleProductStock(p.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isCurrentInStock
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="Click to toggle stock status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isCurrentInStock ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                            <span>{isCurrentInStock ? 'In Stock' : 'Out of Stock'}</span>
                          </button>
                          <span className="text-[10px] text-[#717784] font-mono mt-0.5">
                            {p.stockQuantity ?? 0} units
                          </span>
                        </div>
                      </td>

                      {/* Publication Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleProductVisibility(p.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 mx-auto transition-all cursor-pointer ${
                            isPublished
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title={isPublished ? 'Click to hide from customers' : 'Click to show to customers'}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {isPublished ? 'visibility' : 'visibility_off'}
                          </span>
                          <span>{isPublished ? 'Published' : 'Hidden'}</span>
                        </button>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3 px-4 text-[11px] text-[#717784] whitespace-nowrap">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recently'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onViewProductDetail?.(p)}
                            className="p-1.5 rounded-lg text-[#005cb3] hover:bg-blue-50 transition-colors"
                            title="View Customer Page"
                          >
                            <span className="material-symbols-outlined text-[17px]">open_in_new</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 rounded-lg text-[#131b2e] hover:bg-slate-100 transition-colors"
                            title="Edit Product"
                          >
                            <span className="material-symbols-outlined text-[17px]">edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleProductVisibility(p.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isPublished ? 'text-amber-700 hover:bg-amber-50' : 'text-blue-700 hover:bg-blue-50'
                            }`}
                            title={isPublished ? 'Hide from public' : 'Publish product'}
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              {isPublished ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <span className="material-symbols-outlined text-[17px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW (2-Grid & 3-Grid) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedProducts.map((p) => {
            const isCurrentInStock = Boolean(p.inStock && (p.stockQuantity ?? 1) > 0);
            const isPublished = Boolean(p.visibleOnStorefront);

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-4 border border-[#dae2fd] shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                {/* Image Container with Quick Photo Overlays */}
                <div className="relative w-full h-44 rounded-2xl bg-[#f2f3ff] flex items-center justify-center p-3 mb-3 border border-[#dae2fd]/60 overflow-hidden">
                  <img
                    src={p.image || PLACEHOLDER_PRODUCT_IMAGE}
                    alt={p.name}
                    className="h-full w-auto object-contain transition-transform group-hover:scale-105"
                  />

                  {/* Badges on top */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs ${
                        isPublished ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {isPublished ? 'visibility' : 'visibility_off'}
                      </span>
                      <span>{isPublished ? 'Published' : 'Hidden'}</span>
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs ${
                        isCurrentInStock ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span>{isCurrentInStock ? `${p.stockQuantity} in stock` : 'Out of stock'}</span>
                    </span>
                  </div>

                  {/* Photo Hover Action Bar */}
                  <div className="absolute inset-x-2 bottom-2 bg-slate-900/85 backdrop-blur-xs rounded-xl p-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <label className="flex items-center gap-1 px-2 py-1 bg-[#005cb3] hover:bg-[#0b74de] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors">
                      <span className="material-symbols-outlined text-[13px]">upload</span>
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCardPhotoUpload(p.id, file);
                        }}
                        className="hidden"
                      />
                    </label>

                    {p.image && p.image !== PLACEHOLDER_PRODUCT_IMAGE && (
                      <button
                        type="button"
                        onClick={() => onRemoveProductPhoto?.(p.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        title="Remove custom photo"
                      >
                        <span className="material-symbols-outlined text-[13px]">delete</span>
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#005cb3] text-[10px] font-bold">
                      {p.category}
                    </span>
                    <span className="font-heading font-extrabold text-[17px] text-[#005cb3]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-[14px] text-[#131b2e] leading-snug line-clamp-2">
                    {p.name}
                  </h3>

                  <p className="text-[11px] text-[#717784] mt-1 line-clamp-2">
                    {p.purificationStages || p.description}
                  </p>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 mt-3 border-t border-[#dae2fd] flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => onViewProductDetail?.(p)}
                    className="flex-1 py-1.5 px-2 bg-[#f2f3ff] hover:bg-[#005cb3] hover:text-white text-[#005cb3] rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditProduct(p)}
                    className="flex-1 py-1.5 px-2 bg-[#f2f3ff] hover:bg-[#131b2e] hover:text-white text-[#131b2e] rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleProductVisibility(p.id)}
                    className="p-1.5 bg-[#f2f3ff] hover:bg-slate-200 text-[#414753] rounded-xl transition-colors"
                    title={isPublished ? 'Hide product' : 'Show product'}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isPublished ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    title="Delete product"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#dae2fd] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#414753]">
            Showing page <span className="font-bold text-[#131b2e]">{safeCurrentPage}</span> of{' '}
            <span className="font-bold text-[#131b2e]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-[#dae2fd] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                    pageNum === safeCurrentPage
                      ? 'bg-[#005cb3] text-white shadow-xs'
                      : 'text-[#414753] hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-[#dae2fd] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
