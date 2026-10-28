import React, { useState } from 'react';
import { Review } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (review: Review) => void;
  isKannada: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isKannada,
}) => {
  const [author, setAuthor] = useState('');
  const [badge, setBadge] = useState('Google 5★ Verified Installation');
  const [rating, setRating] = useState(5);
  const [installedProduct, setInstalledProduct] = useState('AquaPure Copper Max Pro RO+UV');
  const [locality, setLocality] = useState('Sira Gate, Tumakuru');
  const [textEn, setTextEn] = useState('');
  const [textKn, setTextKn] = useState('');
  const [visibleOnWeb, setVisibleOnWeb] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !textEn.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: author.trim(),
      badge,
      rating: Number(rating),
      installedProduct,
      locality,
      textEn: textEn.trim(),
      textKn: textKn.trim() || textEn.trim(),
      visibleOnWeb,
    };

    onSave(newRev);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#dae2fd]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#dae2fd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c2e] text-[24px]">rate_review</span>
            <h3 className="font-heading font-bold text-[18px] text-[#131b2e]">
              {isKannada ? 'ದೃಢೀಕರಿಸಿದ ವಿಮರ್ಶೆ ಸೇರಿಸಿ (Add Verified Review)' : 'Add Verified Customer Review'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                {isKannada ? 'ಗ್ರಾಹಕರ ಹೆಸರು *' : 'Customer Name *'}
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                {isKannada ? 'ಪ್ರದೇಶ / ಲೊಕಾಲಿಟಿ *' : 'Tumakuru Locality *'}
              </label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Kyatsandra, Tumakuru"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Verification Badge
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              >
                <option>Google 5★ Verified Installation</option>
                <option>Verified AMC Member (3 Years)</option>
                <option>Google 5★ Verified Purchase</option>
                <option>Walk-in Store Purchase (Sira Gate)</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Installed Product
              </label>
              <input
                type="text"
                value={installedProduct}
                onChange={(e) => setInstalledProduct(e.target.value)}
                placeholder="e.g. AquaPure Copper Max Pro"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
              Rating (Stars)
            </label>
            <div className="flex items-center gap-2">
              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-1 transition-all ${
                    rating === star
                      ? 'bg-[#006c2e] text-white shadow-xs'
                      : 'bg-[#eaedff] text-[#414753] hover:bg-[#dae2fd]'
                  }`}
                >
                  <span>{star}</span>
                  <span className="material-symbols-outlined text-[16px] fill-1 text-amber-400">star</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
              Review Quote (English) *
            </label>
            <textarea
              required
              rows={3}
              value={textEn}
              onChange={(e) => setTextEn(e.target.value)}
              placeholder="e.g. Excellent service at Sira Gate Tumakuru, technician reached in 2 hours..."
              className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] focus:outline-none border border-[#dae2fd]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
              ಕನ್ನಡ ವಿಮರ್ಶೆ (Kannada Quote - Optional)
            </label>
            <textarea
              rows={2}
              value={textKn}
              onChange={(e) => setTextKn(e.target.value)}
              placeholder="ತುಮಕೂರಿನಲ್ಲಿ ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಫಿಲ್ಟರ್ ಸೇವೆ..."
              className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] focus:outline-none border border-[#dae2fd]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={visibleOnWeb}
              onChange={(e) => setVisibleOnWeb(e.target.checked)}
              className="w-4 h-4 text-[#006c2e] rounded border-gray-300 focus:ring-[#006c2e]"
            />
            <span className="text-[13px] font-semibold text-[#131b2e]">
              Display publicly on Tumakuru storefront website
            </span>
          </label>

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
              className="px-6 py-2 bg-[#006c2e] hover:bg-[#00883c] text-white rounded-xl text-[13px] font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{isKannada ? 'ಪ್ರಕಟಿಸಿ (Publish Review)' : 'Publish Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
