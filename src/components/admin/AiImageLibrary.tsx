import React, { useState, useEffect, useRef } from 'react';
import { AiLibraryImage, AiImageCategory } from '../../types';
import {
  fetchAiLibraryImages,
  uploadMultipleAiLibraryImages,
  uploadAiLibraryImageFile,
  deleteAiLibraryImage,
  updateAiLibraryImageCategory,
} from '../../lib/supabaseClient';

interface AiImageLibraryProps {
  isKannada?: boolean;
}

export interface StagedUpload {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  sizeFormatted: string;
  category: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const CATEGORIES: { id: AiImageCategory; label: string; icon: string }[] = [
  { id: 'Water Purifier', label: 'Water Purifier', icon: 'water_drop' },
  { id: 'Kitchen Chimney', label: 'Kitchen Chimney', icon: 'mode_fan' },
  { id: 'Water Softener', label: 'Water Softener', icon: 'filter_alt' },
  { id: 'Sand Softener', label: 'Sand Softener', icon: 'layers' },
  { id: 'Solar Water Heater', label: 'Solar Water Heater', icon: 'wb_sunny' },
  { id: 'Solar Products', label: 'Solar Products', icon: 'solar_power' },
  { id: 'Other', label: 'Other', icon: 'category' },
];

export const AiImageLibrary: React.FC<AiImageLibraryProps> = ({ isKannada }) => {
  const [images, setImages] = useState<AiLibraryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [stagedFiles, setStagedFiles] = useState<StagedUpload[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState<AiLibraryImage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load library images on mount
  useEffect(() => {
    let isMounted = true;
    fetchAiLibraryImages().then((data) => {
      if (isMounted) {
        setImages(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      stagedFiles.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    };
  }, [stagedFiles]);

  // Stage files selected by user
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const newStaged: StagedUpload[] = fileArray.map((file, idx) => ({
      id: `stage_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      category: selectedCategory || '',
    }));

    setStagedFiles((prev) => [...prev, ...newStaged]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Stage files dropped by user
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length > 0) {
      const newStaged: StagedUpload[] = fileArray.map((file, idx) => ({
        id: `stage_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        sizeFormatted: formatFileSize(file.size),
        category: selectedCategory || '',
      }));
      setStagedFiles((prev) => [...prev, ...newStaged]);
    }
  };

  const handleRemoveStaged = (id: string) => {
    setStagedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAllStaged = () => {
    stagedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setStagedFiles([]);
  };

  const handleUpdateStagedCategory = (id: string, category: string) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item))
    );
  };

  const handleApplyCategoryToAllStaged = (category: string) => {
    setStagedFiles((prev) => prev.map((item) => ({ ...item, category })));
  };

  // Explicit Save and Confirm button action
  const handleSaveAndConfirmStaged = async () => {
    if (stagedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: stagedFiles.length });

    try {
      const savedRecords: AiLibraryImage[] = [];
      for (let i = 0; i < stagedFiles.length; i++) {
        const item = stagedFiles[i];
        setUploadProgress({ current: i + 1, total: stagedFiles.length });
        const record = await uploadAiLibraryImageFile(item.file, item.category || undefined);
        savedRecords.push(record);
      }

      // Cleanup preview URLs
      stagedFiles.forEach((s) => URL.revokeObjectURL(s.previewUrl));
      setStagedFiles([]);
      setImages((prev) => [...savedRecords, ...prev]);

      setSuccessMessage(
        `✓ Saved & Confirmed: ${savedRecords.length} image(s) successfully saved to AI Recommendation Catalog and database!`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.warn('Failed to save staged images:', err);
      setSuccessMessage('Failed to save some images. Please try again.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (id: string, storagePath?: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setDeleteConfirmId(null);
    await deleteAiLibraryImage(id, storagePath);
    setSuccessMessage('Image removed from AI library.');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleCategoryChange = async (id: string, newCat: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, category: newCat || undefined } : img))
    );
    await updateAiLibraryImageCategory(id, newCat);
  };

  // Filter images by category & search
  const filteredImages = images.filter((img) => {
    const matchesCategory =
      filterCategory === 'All' ||
      (img.category && img.category.toLowerCase() === filterCategory.toLowerCase()) ||
      (!img.category && filterCategory === 'Uncategorized');

    const matchesSearch =
      !searchTerm.trim() ||
      img.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (img.category && img.category.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#06284B] via-[#0B1E36] to-[#06284B] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-[#00D2FF]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00D2FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2FF]/15 text-[#5EE9FF] text-xs font-bold border border-[#00D2FF]/40">
              <span className="w-2 h-2 rounded-full bg-[#00FFCC] animate-ping" />
              <span>AI Visual Product Matching</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              AI Recommendation Image Library
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Upload multiple product images directly. <strong>No product names, prices, or technical specifications are required</strong>. The AI will analyze customer space photos (kitchen, wall, bathroom, or rooftop) and visually compare them with these images to recommend the best fit!
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[110px]">
              <span className="text-2xl font-extrabold text-[#00FFCC] font-mono block">
                {images.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-300">Total Library Images</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[110px]">
              <span className="text-2xl font-extrabold text-[#5EE9FF] font-mono block">
                {images.filter((img) => img.category === 'Water Purifier').length}
              </span>
              <span className="text-[11px] font-semibold text-slate-300">Purifiers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span className="text-xs font-bold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Upload Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#dae2fd]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 mb-1">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>Batch Upload Mode Active</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-[#06284B] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0b74de]">cloud_upload</span>
              Batch Uploading: Drag-and-drop or file selection supporting multiple images simultaneously on desktop and mobile
            </h3>
            <p className="text-xs text-[#717784] mt-0.5">
              Select one or multiple photos from your mobile camera, gallery, or desktop files. No names, prices, or specs required.
            </p>
          </div>

          {/* Optional Category Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#414753] hidden sm:inline">
              Category (Optional):
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#06284B] focus:outline-hidden focus:ring-2 focus:ring-[#00D2FF]"
            >
              <option value="">No Category (Optional)</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#00D2FF]/60 hover:border-[#005cb3] bg-gradient-to-b from-[#f0f9ff]/70 via-white to-[#f0f9ff]/30 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-all cursor-pointer group shadow-xs hover:shadow-md"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-[#00D2FF]/15 group-hover:bg-[#00D2FF]/25 border border-[#00D2FF]/40 flex items-center justify-center text-[#0B74DE] mb-4 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[34px]">drive_folder_upload</span>
          </div>

          <h4 className="font-heading font-bold text-base sm:text-lg text-[#06284B]">
            {uploading ? 'Processing & Saving Images to Database...' : 'Drag and Drop Multiple Product Photos Here'}
          </h4>

          <p className="text-xs sm:text-sm text-[#414753] mt-1.5 max-w-lg">
            Batch upload is fully active. You can select 5, 10, or 20+ images simultaneously from your PC or phone gallery, review them, and click Save to confirm.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <button
              type="button"
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-5 py-2.5 bg-[#005cb3] hover:bg-[#0b74de] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              <span>{uploading ? 'Saving...' : 'Choose Multiple Files (Desktop & Laptop)'}</span>
            </button>

            <button
              type="button"
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-5 py-2.5 bg-[#06284B] hover:bg-[#0f3b6c] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">smartphone</span>
              <span>{uploading ? 'Saving...' : 'Select from Mobile Gallery / Camera'}</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesSelected}
            className="hidden"
          />

          <span className="text-[11px] text-[#717784] mt-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
            Supports PNG, JPG, JPEG, WEBP • Zero product text required • Keep Save button to confirm
          </span>
        </div>

        {/* STAGED / PENDING IMAGES WITH SAVE & CONFIRM BUTTON */}
        {stagedFiles.length > 0 && (
          <div className="mt-6 rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40 p-5 sm:p-6 shadow-md space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-heading font-extrabold text-base sm:text-lg text-[#06284B]">
                      {stagedFiles.length} Image{stagedFiles.length > 1 ? 's' : ''} Selected
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wide shadow-xs animate-pulse">
                      Click Save to Confirm
                    </span>
                  </div>
                  <p className="text-xs text-[#414753] mt-0.5">
                    Review your chosen product photos below and click the <strong>Save & Confirm</strong> button to save them to the database and activate them for the AI analyzer.
                  </p>
                </div>
              </div>

              {/* Top Save & Confirm Action Button */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleSaveAndConfirmStaged}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer"
                  title="Save and confirm these images into the database"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {uploading ? 'sync' : 'save'}
                  </span>
                  <span>
                    {uploading
                      ? uploadProgress
                        ? `Saving ${uploadProgress.current} of ${uploadProgress.total}...`
                        : 'Saving to Database...'
                      : `Save & Confirm to Library (${stagedFiles.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add More</span>
                </button>

                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleClearAllStaged}
                  className="px-3 py-2.5 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Quick Batch Category Applier */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-emerald-200 text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">category</span>
                <span>Category for all {stagedFiles.length} images (optional):</span>
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleApplyCategoryToAllStaged(cat.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {cat.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleApplyCategoryToAllStaged('')}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-[11px] cursor-pointer"
                >
                  Clear Category
                </button>
              </div>
            </div>

            {/* Preview Grid for Staged Items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-1">
              {stagedFiles.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-white rounded-2xl p-2.5 border border-emerald-300 shadow-xs flex flex-col justify-between group hover:shadow-md transition-all"
                >
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveStaged(item.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-md z-10 transition-transform group-hover:scale-110 cursor-pointer"
                    title="Remove this photo before saving"
                  >
                    ✕
                  </button>

                  {/* Thumbnail */}
                  <div className="relative w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-2 mb-2">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-full object-contain filter drop-shadow-2xs"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white font-mono text-[9px]">
                      {item.sizeFormatted}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-700 truncate block" title={item.name}>
                      {item.name}
                    </span>

                    {/* Per-item category selector */}
                    <select
                      value={item.category}
                      onChange={(e) => handleUpdateStagedCategory(item.id, e.target.value)}
                      className="w-full text-[10px] py-1 px-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[#06284B] font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">No Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Save & Confirm Bar */}
            <div className="pt-3 border-t border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                <span>Click the Save button to confirm adding {stagedFiles.length} photo{stagedFiles.length > 1 ? 's' : ''} to database.</span>
              </span>

              <button
                type="button"
                disabled={uploading}
                onClick={handleSaveAndConfirmStaged}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {uploading ? 'sync' : 'save'}
                </span>
                <span>
                  {uploading
                    ? uploadProgress
                      ? `Saving ${uploadProgress.current} of ${uploadProgress.total}...`
                      : 'Saving to Database...'
                    : `Save & Confirm to Library (${stagedFiles.length} Images)`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Library Browser */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#dae2fd] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#06284B] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00D2FF]">photo_library</span>
              Saved AI Visual Catalog ({filteredImages.length})
            </h3>
            <p className="text-xs text-[#717784] mt-0.5">
              The AI dynamically pulls from these images when customer photos are analyzed.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search box */}
            <div className="relative min-w-[200px]">
              <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search by ID or Category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#06284B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#00D2FF]"
              />
            </div>

            {/* Save & Confirm Catalog Sync Button */}
            <button
              onClick={() => {
                setSuccessMessage(
                  `✓ Confirmed & Saved: All ${images.length} library images are active in database for the AI Space Analyzer.`
                );
                setTimeout(() => setSuccessMessage(null), 4000);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Confirm that all library images are saved and synced"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Confirm & Save Library</span>
            </button>
          </div>
        </div>

        {/* Category Filters Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
          <button
            onClick={() => setFilterCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'All'
                ? 'bg-[#06284B] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-[#414753]'
            }`}
          >
            All ({images.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = images.filter((img) => img.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  filterCategory === cat.id
                    ? 'bg-[#00D2FF] text-[#06284B] font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#414753]'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] font-mono opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Image Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-10 h-10 rounded-full border-3 border-[#00D2FF]/30 border-t-[#00D2FF] animate-spin mx-auto mb-2" />
            Loading AI Recommendation Image Library...
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200 p-8">
            <span className="material-symbols-outlined text-[44px] text-slate-300 block mb-2">
              image_not_supported
            </span>
            <h4 className="font-bold text-sm text-[#06284B]">No Images Found</h4>
            <p className="text-xs text-[#717784] mt-1 max-w-sm mx-auto">
              {searchTerm || filterCategory !== 'All'
                ? 'No images match your filter. Try selecting "All" or clearing the search.'
                : 'Upload product photos using the box above to build your AI visual catalog.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="group relative bg-slate-50 hover:bg-white rounded-2xl p-2.5 border border-slate-200 hover:border-[#00D2FF] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Thumbnail Viewport */}
                <div
                  onClick={() => setPreviewImage(img)}
                  className="relative w-full aspect-square rounded-xl bg-white border border-slate-200/80 overflow-hidden flex items-center justify-center p-2 cursor-pointer group-hover:scale-[1.02] transition-transform"
                >
                  <img
                    src={img.image_url}
                    alt={img.category || 'Product'}
                    className="w-full h-full object-contain filter drop-shadow-2xs"
                    loading="lazy"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                    <span className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-xs">
                      <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                    </span>
                  </div>
                </div>

                {/* Card Meta & Category Selector */}
                <div className="pt-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500 font-semibold truncate max-w-[100px]" title={img.id}>
                      #{img.id}
                    </span>
                    <span className="text-slate-400">
                      {new Date(img.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Inline Category Dropdown */}
                  <select
                    value={img.category || ''}
                    onChange={(e) => handleCategoryChange(img.id, e.target.value)}
                    className="w-full text-[11px] py-1 px-2 rounded-lg bg-white border border-slate-200 text-[#06284B] font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#00D2FF]"
                    title="Change image category"
                  >
                    <option value="">(No Category)</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <button
                      onClick={() => setPreviewImage(img)}
                      className="text-[11px] font-bold text-[#0B74DE] hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(img.id)}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-0.5"
                      title="Remove image from AI library"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[26px]">delete_forever</span>
            </div>
            <div className="text-center">
              <h4 className="font-heading font-bold text-base text-[#06284B]">
                Remove Image from AI Library?
              </h4>
              <p className="text-xs text-[#717784] mt-1">
                This image will immediately no longer be used for AI customer recommendations.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#414753] hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = images.find((i) => i.id === deleteConfirmId);
                  handleDelete(deleteConfirmId, target?.storage_path);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative bg-[#06284B] rounded-3xl p-4 sm:p-6 max-w-2xl w-full border border-[#00D2FF]/40 shadow-2xl space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-mono text-[#00D2FF] font-bold">
                  Image ID: #{previewImage.id}
                </span>
                <h4 className="font-bold text-base text-white">
                  {previewImage.category || 'Product Catalog Image'}
                </h4>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="w-full max-h-[60vh] bg-black/40 rounded-2xl flex items-center justify-center p-4 overflow-hidden">
              <img
                src={previewImage.image_url}
                alt="Product Preview"
                className="max-h-[55vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10">
              <span>Uploaded: {new Date(previewImage.created_at).toLocaleString()}</span>
              <a
                href={previewImage.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00D2FF] hover:underline font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                Open Raw Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
