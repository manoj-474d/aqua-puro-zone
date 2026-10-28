import React, { useState } from 'react';
import { SparePart, Product } from '../types';

interface StockInventoryViewProps {
  spareParts: SparePart[];
  products: Product[];
  onUpdatePartStock: (partId: string, delta: number) => void;
  onAddPart: (part: SparePart) => void;
  isKannada: boolean;
}

export const StockInventoryView: React.FC<StockInventoryViewProps> = ({
  spareParts,
  products,
  onUpdatePartStock,
  onAddPart,
  isKannada,
}) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'appliances'>('parts');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New part form
  const [newPartName, setNewPartName] = useState('');
  const [newPartCategory, setNewPartCategory] = useState<SparePart['category']>('Cartridges');
  const [newPartSku, setNewPartSku] = useState('');
  const [newPartStock, setNewPartStock] = useState(10);
  const [newPartMinStock, setNewPartMinStock] = useState(5);
  const [newPartPrice, setNewPartPrice] = useState(250);

  const lowStockParts = spareParts.filter((p) => p.stock <= p.minStock);

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;

    const newP: SparePart = {
      id: `SP-${Date.now()}`,
      name: newPartName.trim(),
      category: newPartCategory,
      sku: newPartSku.trim() || `SKU-${Math.floor(100 + Math.random() * 900)}`,
      stock: Number(newPartStock),
      minStock: Number(newPartMinStock),
      price: Number(newPartPrice),
      unit: 'pcs',
      reorderStatus: Number(newPartStock) <= Number(newPartMinStock) ? 'low' : 'optimal',
    };

    onAddPart(newP);
    setNewPartName('');
    setIsAddOpen(false);
  };

  const filteredParts = spareParts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#dae2fd] mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#006875]/10 flex items-center justify-center text-[#006875]">
              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-[22px] text-[#131b2e]">
                  {isKannada ? 'ಫಿಲ್ಟರ್ ಕಾರ್ಟ್ರಿಡ್ಜ್ ಮತ್ತು ಬಿಡಿಭಾಗಗಳ ದಾಸ್ತಾನು' : 'Filter & Unit Stock Inventory'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e2e7ff] text-[#005cb3] text-[11px] font-bold">
                  Sira Gate Warehouse
                </span>
              </div>
              <p className="text-[13px] text-[#414753] mt-0.5">
                Real-time tracking of RO membranes, spun candles, booster pumps, resin beads, and units
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005cb3] text-white rounded-xl hover:bg-[#0b74de] shadow-sm transition-all text-[13px] font-semibold self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>{isKannada ? '+ ಹೊಸ ಬಿಡಿಭಾಗ ಸೇರಿಸಿ' : '+ Add Spare Part'}</span>
          </button>
        </div>

        {/* Low Stock Warning Callout */}
        {lowStockParts.length > 0 && (
          <div className="mt-5 p-3.5 bg-[#ffdad6]/60 border border-[#ffdad6] rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
              <span className="text-[13px] font-semibold text-[#93000a]">
                {lowStockParts.length} critical spare parts are below minimum safety stock levels:
                {' '}
                <span className="font-normal">{lowStockParts.map(p => p.name).join(', ')}</span>
              </span>
            </div>
            <a
              href="tel:08296264007"
              className="px-3 py-1 bg-[#ba1a1a] text-white rounded-lg text-[11px] font-bold hover:bg-[#93000a] whitespace-nowrap"
            >
              Reorder Supplier
            </a>
          </div>
        )}

        {/* Segmented control tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#dae2fd]">
          <button
            onClick={() => setActiveTab('parts')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
              activeTab === 'parts'
                ? 'bg-[#005cb3] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#414753] hover:bg-[#e2e7ff]'
            }`}
          >
            Spare Parts & Cartridges ({spareParts.length})
          </button>
          <button
            onClick={() => setActiveTab('appliances')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
              activeTab === 'appliances'
                ? 'bg-[#005cb3] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#414753] hover:bg-[#e2e7ff]'
            }`}
          >
            Completed Appliance Units ({products.length})
          </button>
        </div>
      </div>

      {activeTab === 'parts' ? (
        /* Spare Parts Grid / Table */
        <div className="bg-white rounded-3xl p-5 lg:p-7 shadow-xs border border-[#dae2fd]">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717784] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SKU or Part Name..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] border border-[#dae2fd] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#f2f3ff] text-[#414753] text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Part SKU & Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Min. Threshold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Adjust Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] text-[13px]">
                {filteredParts.map((part) => {
                  const isLow = part.stock <= part.minStock;
                  return (
                    <tr key={part.id} className="hover:bg-[#f2f3ff]/50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono text-[11px] font-bold text-[#005cb3] bg-[#e2e7ff] px-1.5 py-0.5 rounded">
                          {part.sku}
                        </span>
                        <div className="font-semibold text-[#131b2e] mt-1">{part.name}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#006875] text-[11px] font-semibold">
                          {part.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-[#131b2e]">
                        ₹{part.price}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`text-[16px] font-heading font-extrabold tabular-nums ${
                          isLow ? 'text-[#ba1a1a]' : 'text-[#006c2e]'
                        }`}>
                          {part.stock} {part.unit}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-[#717784]">
                        {part.minStock} {part.unit}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isLow ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#6bff8f]/30 text-[#006c2e]'
                        }`}>
                          {isLow ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onUpdatePartStock(part.id, -1)}
                            disabled={part.stock <= 0}
                            className="w-8 h-8 rounded-lg bg-[#f2f3ff] hover:bg-[#ffdad6] text-[#ba1a1a] font-bold flex items-center justify-center disabled:opacity-40"
                            title="Decrease Stock (-1)"
                          >
                            -
                          </button>
                          <span className="font-mono font-semibold px-1 text-[13px]">{part.stock}</span>
                          <button
                            onClick={() => onUpdatePartStock(part.id, 1)}
                            className="w-8 h-8 rounded-lg bg-[#e2e7ff] hover:bg-[#6bff8f]/40 text-[#006c2e] font-bold flex items-center justify-center"
                            title="Increase Stock (+1)"
                          >
                            +
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
        /* Appliances Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 shadow-xs border border-[#dae2fd]">
              <div className="w-full h-40 bg-[#f2f3ff] rounded-xl flex items-center justify-center p-3 mb-3">
                <img src={p.image} alt={p.name} className="h-full object-contain" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#006875] bg-[#5ee9ff]/30 px-2 py-0.5 rounded-full">
                  {p.category}
                </span>
                <span className={`text-[11px] font-bold ${p.inStock ? 'text-[#006c2e]' : 'text-[#ba1a1a]'}`}>
                  {p.inStock ? '● In Stock' : '○ Out of Stock'}
                </span>
              </div>
              <h3 className="font-heading font-bold text-[15px] text-[#131b2e]">{p.name}</h3>
              <p className="text-[12px] text-[#414753] line-clamp-1 mt-1">{p.capacity}</p>
              <div className="font-heading font-extrabold text-[16px] text-[#005cb3] mt-2">
                ₹{p.price.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Part Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#dae2fd]">
            <div className="flex items-center justify-between pb-3 border-b border-[#dae2fd] mb-4">
              <h3 className="font-heading font-bold text-[16px] text-[#131b2e]">Add New Spare Part / Cartridge</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-[#414753]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreatePart} className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#131b2e] mb-1">Part Name *</label>
                <input
                  type="text"
                  required
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="e.g. 100 GPD Booster Pump Head"
                  className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] border border-[#dae2fd] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#131b2e] mb-1">Category</label>
                  <select
                    value={newPartCategory}
                    onChange={(e) => setNewPartCategory(e.target.value as SparePart['category'])}
                    className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] border border-[#dae2fd] focus:outline-none"
                  >
                    <option>Cartridges</option>
                    <option>Membranes</option>
                    <option>Pumps & Motors</option>
                    <option>Tubes & Fittings</option>
                    <option>Chimney Filters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#131b2e] mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newPartSku}
                    onChange={(e) => setNewPartSku(e.target.value)}
                    placeholder="e.g. PUMP-KEM-100"
                    className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] border border-[#dae2fd] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#131b2e] mb-1">Initial Qty</label>
                  <input
                    type="number"
                    value={newPartStock}
                    onChange={(e) => setNewPartStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] border border-[#dae2fd] font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#131b2e] mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={newPartMinStock}
                    onChange={(e) => setNewPartMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] border border-[#dae2fd] font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#131b2e] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newPartPrice}
                    onChange={(e) => setNewPartPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] border border-[#dae2fd] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dae2fd]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-[#eaedff] text-[#131b2e] rounded-xl text-[12px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005cb3] text-white rounded-xl text-[12px] font-semibold shadow-xs"
                >
                  Save Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
