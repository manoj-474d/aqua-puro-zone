import React from 'react';
import { Product } from '../../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
  isKannada?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirm,
  isKannada,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[28px]">delete_forever</span>
        </div>

        <h3 className="text-lg font-heading font-extrabold text-[#131b2e]">
          {isKannada ? 'ಉತ್ಪನ್ನವನ್ನು ಶಾಶ್ವತವಾಗಿ ತೆಗೆದುಹಾಕಬೇಕೆ?' : 'Permanently Delete Product?'}
        </h3>

        <p className="text-xs text-[#414753] mt-2 leading-relaxed">
          {isKannada
            ? 'ಈ ಉತ್ಪನ್ನವನ್ನು ವೆಬ್‌ಸೈಟ್ ಮತ್ತು ಡೇಟಾಬೇಸ್‌ನಿಂದ ಸಂಪೂರ್ಣವಾಗಿ ಅಳಿಸಲಾಗುತ್ತದೆ:'
            : 'This will remove the product from the public website, search results, and database:'}
        </p>

        <div className="mt-3 p-3 bg-red-50/70 border border-red-200/80 rounded-2xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-red-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-[#131b2e] truncate">{product.name}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#414753]">
              <span className="px-1.5 py-0.2 bg-white rounded text-[10px] font-semibold">{product.category}</span>
              <span className="font-bold text-[#005cb3]">₹{product.price.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#414753] hover:bg-slate-100 transition-colors"
          >
            {isKannada ? 'ರದ್ದುಮಾಡಿ (Cancel)' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>{isKannada ? 'ಹೌದು, ಅಳಿಸಿ' : 'Yes, Delete Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
