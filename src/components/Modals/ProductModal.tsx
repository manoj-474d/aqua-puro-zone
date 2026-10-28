import React, { useState, useEffect } from 'react';
import { Product } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
  isKannada: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  isKannada,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Water Purifier',
    brand: 'Aqua Puro Zone',
    price: 15999,
    capacity: '15 LPH Flow / 8L Storage',
    mountType: 'Countertop & Wall-mount',
    tags: '#borewell, #high_tds, #countertop',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUVE7DaOBBSuPezP7wcO14Xex0UztO4006u2e2ZeS6y4JktEhCZtgM10E9-VKyAae8cjxtBERTcKjLdWcOq5K1kNrxzP1lwo06VWwzkLEAsD3DDRuLZC0JN582KlztwFYwmxanszCaT9I5ShBkM6Z5VdJkaJ9KNEi4fAdEUHaVT3K9R0nP7rN9EUddAP0oqDkRdteJdCZT3O8F_0igxecxXmksJTrI0UJ4MD6bd2yjevqxVwDD8cg',
    inStock: true,
    visibleOnStorefront: true,
    stockQuantity: 5,
    featured: false,
    targetWaterType: 'Borewell',
    description: '',
  });

  const presetPhotos = [
    {
      label: 'Copper RO Unit',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUVE7DaOBBSuPezP7wcO14Xex0UztO4006u2e2ZeS6y4JktEhCZtgM10E9-VKyAae8cjxtBERTcKjLdWcOq5K1kNrxzP1lwo06VWwzkLEAsD3DDRuLZC0JN582KlztwFYwmxanszCaT9I5ShBkM6Z5VdJkaJ9KNEi4fAdEUHaVT3K9R0nP7rN9EUddAP0oqDkRdteJdCZT3O8F_0igxecxXmksJTrI0UJ4MD6bd2yjevqxVwDD8cg',
    },
    {
      label: 'Softener Resin Plant',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2sS6I8zggyBQpXlJu85_c3ACTlS2eQ00WmQJAfJk0nYV3c6MN-rOqpttc53WcXE0rcrguZ65tF55IdK18yeDlK1y6MPK_PC7ulrwzyDwuJHWR9dIGtYGwaK2o3JjMi2cYmKfefGPzSNPxftC1mSQ3ScJiTSpZiRKF4L5tsFCUIIioB5pMH82jqDGmVvmQ14HkJqNr1XXhj8ZTQgJKPTpzpjwnA0MKelCNYVjcoyhZz-ZhWQ7OlYYu',
    },
    {
      label: 'Auto-Clean Chimney',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGfWLSoYHu53dHkGs1mb1qT1ahg_XudjJ84mmP9MjcG8F9yo3IzUYoFV9RN8tSrcOn9fq1EWp8bwQdidJfTxo2Mnp3dTDPjD9UgWer5D6F2-yutTAfK53sI6CmVBD9AA7Gf22w7EAThqr3XxhE_LzwBITfIGSI59j7ie8Gkn_aQN7dD9UY2gJvqZR80kWfEVb9Y3yHLLmjsMdZjjj9-FgW9-oC0jaeTkdrzEHK2D5rSm3q9a1WqHVn',
    },
  ];

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        category: productToEdit.category,
        brand: productToEdit.brand,
        price: productToEdit.price,
        capacity: productToEdit.capacity,
        mountType: productToEdit.mountType,
        tags: productToEdit.tags.join(', '),
        image: productToEdit.image,
        inStock: productToEdit.inStock,
        visibleOnStorefront: productToEdit.visibleOnStorefront ?? true,
        stockQuantity: productToEdit.stockQuantity ?? 5,
        featured: productToEdit.featured,
        targetWaterType: productToEdit.targetWaterType || 'Borewell',
        description: productToEdit.description,
      });
    } else {
      setFormData({
        name: '',
        category: 'Water Purifier',
        brand: 'Aqua Puro Zone',
        price: 15999,
        capacity: '15 LPH Flow / 8L Storage',
        mountType: 'Countertop & Wall-mount',
        tags: '#borewell, #high_tds, #alkaline',
        image: presetPhotos[0].url,
        inStock: true,
        visibleOnStorefront: true,
        stockQuantity: 5,
        featured: false,
        targetWaterType: 'Borewell',
        description: 'Multi-stage RO+UV water purifier designed for Tumakuru high TDS water.',
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          image: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const newProduct: Product = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      price: Number(formData.price),
      capacity: formData.capacity,
      mountType: formData.mountType,
      tags: tagsArray,
      image: formData.image,
      inStock: formData.inStock,
      visibleOnStorefront: formData.visibleOnStorefront,
      stockQuantity: Number(formData.stockQuantity),
      featured: formData.featured,
      targetWaterType: formData.targetWaterType,
      description: formData.description,
    };

    onSave(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#dae2fd]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#dae2fd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005cb3] text-[24px]">inventory_2</span>
            <h3 className="font-heading font-bold text-[18px] text-[#131b2e]">
              {productToEdit
                ? (isKannada ? `ಉತ್ಪನ್ನ ತಿದ್ದುಪಡಿ: ${productToEdit.name}` : `Owner Edit Product: ${productToEdit.name}`)
                : (isKannada ? 'ಹೊಸ ಉತ್ಪನ್ನ ಸೇರಿಸಿ (Add New Product)' : 'Add New Product (ಹೊಸ ಉತ್ಪನ್ನ)')}
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
          {/* Owner Photo Management Box */}
          <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd]">
            <label className="block text-[12px] font-bold text-[#131b2e] uppercase tracking-wider mb-2">
              📸 Product Photograph (What Customers See & AI Recommends)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-white border border-[#dae2fd] overflow-hidden flex items-center justify-center p-2 shrink-0 shadow-xs">
                <img src={formData.image} alt="Preview" className="h-full object-contain" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3.5 py-1.5 bg-[#005cb3] hover:bg-[#0b74de] text-white rounded-xl text-[12px] font-semibold cursor-pointer transition-all flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>Upload New Photo from Device</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#414753]">
                  <span>Or choose preset:</span>
                  {presetPhotos.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: preset.url }))}
                      className="text-[#005cb3] font-semibold hover:underline"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
              {isKannada ? 'ಉತ್ಪನ್ನದ ಹೆಸರು *' : 'Product Name *'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. AquaPure Copper RO+UV 15L"
              className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0b74de]/20 border border-[#dae2fd]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              >
                <option>Water Purifier</option>
                <option>Whole House Softener</option>
                <option>Kitchen Chimney</option>
                <option>Commercial RO</option>
                <option>Sand / Iron Removal Filter</option>
                <option>Spare Cartridges / Membrane</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Target Water Type
              </label>
              <select
                value={formData.targetWaterType}
                onChange={(e) => setFormData({ ...formData, targetWaterType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              >
                <option value="Borewell">Borewell (High TDS & Hardness)</option>
                <option value="Municipal">Municipal / Kaveri (Low TDS)</option>
                <option value="Tanker">Tanker / Overhead Sump</option>
                <option value="All">All Water Sources</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd] font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Warehouse Stock Count *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd] font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Purification / Capacity
              </label>
              <input
                type="text"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="15 LPH / 8 Litres"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
              AI Recommendation Matching Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="borewell, high_tds, compact_sink, hard_water"
              className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] font-mono text-[13px] focus:outline-none border border-[#dae2fd]"
            />
          </div>

          {/* Visibility and In-Stock Control Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.visibleOnStorefront}
                onChange={(e) => setFormData({ ...formData, visibleOnStorefront: e.target.checked })}
                className="w-4 h-4 text-[#005cb3] rounded border-gray-300 focus:ring-[#005cb3]"
              />
              <div>
                <span className="text-[13px] font-bold text-[#131b2e] block">
                  {formData.visibleOnStorefront ? '👁️ Visible on Customer Website' : '🚫 Hidden from Customers'}
                </span>
                <span className="text-[11px] text-[#717784]">
                  Controls whether this product shows in the customer catalog
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-4 h-4 text-[#006c2e] rounded border-gray-300 focus:ring-[#006c2e]"
              />
              <div>
                <span className="text-[13px] font-bold text-[#131b2e] block">
                  {formData.inStock ? '✅ In Stock for Live Photo AI' : '❌ Out of Stock (Do not suggest)'}
                </span>
                <span className="text-[11px] text-[#717784]">
                  Only in-stock products get suggested to live customer camera photos
                </span>
              </div>
            </label>
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
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{isKannada ? 'ಉಳಿಸಿ (Save Product)' : 'Save Product & Photo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
