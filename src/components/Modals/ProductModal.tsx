import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { PLACEHOLDER_PRODUCT_IMAGE } from '../../data/initialData';
import { uploadProductPhotoFile } from '../../lib/supabaseClient';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
  isKannada: boolean;
  defaultToWaterPurifier?: boolean;
}

interface PurifierTemplate {
  label: string;
  badge: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  capacity: string;
  mountType: string;
  targetWaterType: string;
  purificationStages: string;
  maxTds: string;
  warranty: string;
  tags: string;
  features: string;
  description: string;
  imageUrl: string;
}

const WATER_PURIFIER_TEMPLATES: PurifierTemplate[] = [
  {
    label: 'Copper Alkaline RO+UV',
    badge: 'Bestseller Tumakuru',
    name: 'AquaPure Copper Max Pro RO+UV+Alkaline',
    category: 'Water Purifier',
    brand: 'Aqua Puro Zone',
    price: 16499,
    originalPrice: 21999,
    capacity: '15 LPH Flow / 10L Storage Tank',
    mountType: 'Wall-Mounted / Countertop Placement',
    targetWaterType: 'Borewell',
    purificationStages: '8-Stage RO + UV-C LED + UF + Active Copper + Alkaline TDS Controller',
    maxTds: 'Up to 2000 PPM',
    warranty: '1 Year Comprehensive + 1 Free Filter Service + Free Installation',
    tags: '#borewell, #high_tds, #copper_charge, #alkaline, #ro_uv_uf',
    features: 'Active Copper Infusion, 100 GPD High Recovery RO Membrane, Digital TDS Purity LED, Food Grade Antibacterial Tank',
    description: 'Advanced 8-stage water purifier specially engineered for Tumakuru high-hardness borewell water. Infuses essential copper ions, balances pH between 7.5 to 8.5, and ensures 99.9% virus and pathogen removal.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUVE7DaOBBSuPezP7wcO14Xex0UztO4006u2e2ZeS6y4JktEhCZtgM10E9-VKyAae8cjxtBERTcKjLdWcOq5K1kNrxzP1lwo06VWwzkLEAsD3DDRuLZC0JN582KlztwFYwmxanszCaT9I5ShBkM6Z5VdJkaJ9KNEi4fAdEUHaVT3K9R0nP7rN9EUddAP0oqDkRdteJdCZT3O8F_0igxecxXmksJTrI0UJ4MD6bd2yjevqxVwDD8cg',
  },
  {
    label: 'Heavy Borewell 2500+ TDS',
    badge: 'Extra Hard Water',
    name: 'AquaPure Ultra-Shield Dual Pump RO 2500',
    category: 'Water Purifier',
    brand: 'Aqua Puro Zone Pro',
    price: 18999,
    originalPrice: 24500,
    capacity: '18 LPH Flow / 12L Food-Grade Tank',
    mountType: 'Wall-Mounted Heavy Duty Bracket',
    targetWaterType: 'Borewell',
    purificationStages: '9-Stage RO + Double UV + UF + Anti-Scalant Dosing + Mineralizer',
    maxTds: 'Up to 2800 PPM',
    warranty: '1 Year Warranty on Pump & SMPS + 2 Free Preventative Services',
    tags: '#heavy_borewell, #extreme_tds, #dual_pump, #industrial_membrane',
    features: 'Dual 150 GPD High-Pressure Booster Pumps, Heavy Anti-Scale Cartridge, Multi-stage Sediment Prefilter, Real-time TDS Meter',
    description: 'Designed for extreme hardness zones like Sira Gate, Kyatsandra, and Gubbi. Includes high-pressure booster pump and anti-scaling cartridge to prevent membrane clogging from silica and heavy salt deposits.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUVE7DaOBBSuPezP7wcO14Xex0UztO4006u2e2ZeS6y4JktEhCZtgM10E9-VKyAae8cjxtBERTcKjLdWcOq5K1kNrxzP1lwo06VWwzkLEAsD3DDRuLZC0JN582KlztwFYwmxanszCaT9I5ShBkM6Z5VdJkaJ9KNEi4fAdEUHaVT3K9R0nP7rN9EUddAP0oqDkRdteJdCZT3O8F_0igxecxXmksJTrI0UJ4MD6bd2yjevqxVwDD8cg',
  },
  {
    label: 'Compact Under-Sink RO',
    badge: 'Modular Kitchen',
    name: 'AquaPure Concealed Under-Sink RO+Hydro Tank',
    category: 'Water Purifier',
    brand: 'Aqua Puro Zone',
    price: 19500,
    originalPrice: 25000,
    capacity: '20 LPH High Flow / 8L Pressurized Tank',
    mountType: 'Under-Sink Cabinet / Concealed Plumbing',
    targetWaterType: 'Borewell',
    purificationStages: '7-Stage RO + Post Carbon Polisher + Alkaline Mineral Cartridge',
    maxTds: 'Up to 2000 PPM',
    warranty: '1 Year Comprehensive + Swan-Neck Faucet Included',
    tags: '#under_sink, #modular_kitchen, #hidden_ro, #chrome_faucet',
    features: 'Brushed Stainless Chrome Swan-Neck Faucet, Compact Under-Counter Footprint, Pressurized Sealed Steel Tank, Zero Kitchen Counter Clutter',
    description: 'Ideal for modern modular kitchens with zero wall space. Hides completely inside your sink cabinet and feeds clean drinking water directly into a countertop swan-neck spout.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUVE7DaOBBSuPezP7wcO14Xex0UztO4006u2e2ZeS6y4JktEhCZtgM10E9-VKyAae8cjxtBERTcKjLdWcOq5K1kNrxzP1lwo06VWwzkLEAsD3DDRuLZC0JN582KlztwFYwmxanszCaT9I5ShBkM6Z5VdJkaJ9KNEi4fAdEUHaVT3K9R0nP7rN9EUddAP0oqDkRdteJdCZT3O8F_0igxecxXmksJTrI0UJ4MD6bd2yjevqxVwDD8cg',
  },
  {
    label: 'Commercial 50 LPH RO',
    badge: 'Offices & Cafes',
    name: 'AquaPure Commercial 50 LPH Stainless RO Plant',
    category: 'Commercial RO',
    brand: 'Aqua Puro Zone Commercial',
    price: 24999,
    originalPrice: 32000,
    capacity: '50 Litres/Hour Continuous Industrial Flow',
    mountType: 'Floor Standing / Wall Heavy Angle Mount',
    targetWaterType: 'All',
    purificationStages: 'Commercial 5-Stage RO + Dual 300 GPD Membranes + Micron Prefiltration',
    maxTds: 'Up to 2500 PPM',
    warranty: '1 Year Commercial Warranty on Electricals + Free Setup',
    tags: '#commercial_ro, #50_lph, #office_school, #hospital_cafe, #heavy_duty',
    features: 'Dual 300 GPD High-Flux Membranes, Heavy Commercial Rotatory Pump, Pressure Gauge Monitoring, Stainless Steel Sturdy Skid',
    description: 'Built for shops, schools, hospitals, clinics, and offices across Tumakuru. High-output continuous pure water with heavy-duty rotatory pump and dual commercial membrane housing.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUVE7DaOBBSuPezP7wcO14Xex0UztO4006u2e2ZeS6y4JktEhCZtgM10E9-VKyAae8cjxtBERTcKjLdWcOq5K1kNrxzP1lwo06VWwzkLEAsD3DDRuLZC0JN582KlztwFYwmxanszCaT9I5ShBkM6Z5VdJkaJ9KNEi4fAdEUHaVT3K9R0nP7rN9EUddAP0oqDkRdteJdCZT3O8F_0igxecxXmksJTrI0UJ4MD6bd2yjevqxVwDD8cg',
  },
  {
    label: 'Kaveri Gravity UV+UF Pure',
    badge: 'Zero Wastage',
    name: 'AquaPure PureStream Kaveri UV+UF Purifier',
    category: 'Water Purifier',
    brand: 'Aqua Puro Zone',
    price: 8499,
    originalPrice: 11200,
    capacity: '8.5L Dual Stage Gravity Storage',
    mountType: 'Wall-Mounted or Tabletop',
    targetWaterType: 'Municipal',
    purificationStages: '0.01 Micron Ultra Filtration + 11W Philips UV Sterilization',
    maxTds: 'Up to 300 PPM (Municipal Kaveri Supply)',
    warranty: '1 Year Warranty + Free Home Delivery & Setup',
    tags: '#kaveri_water, #low_tds, #zero_wastage, #energy_saver, #uv_sterilization',
    features: '100% Zero Water Wastage, Philips 11W Disinfection Tube, 0.01 Micron Hollow Fiber UF, Retains Natural Minerals',
    description: 'Specially engineered for Kaveri municipal supply with low TDS. Retains all natural healthy minerals while eradicating 100% of bacteria, cysts, and viruses with zero water rejection.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUVE7DaOBBSuPezP7wcO14Xex0UztO4006u2e2ZeS6y4JktEhCZtgM10E9-VKyAae8cjxtBERTcKjLdWcOq5K1kNrxzP1lwo06VWwzkLEAsD3DDRuLZC0JN582KlztwFYwmxanszCaT9I5ShBkM6Z5VdJkaJ9KNEi4fAdEUHaVT3K9R0nP7rN9EUddAP0oqDkRdteJdCZT3O8F_0igxecxXmksJTrI0UJ4MD6bd2yjevqxVwDD8cg',
  },
];

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
    price: 16499,
    originalPrice: 21999,
    capacity: '15 LPH Flow / 10L Storage Tank',
    mountType: 'Wall-Mounted / Countertop Placement',
    tags: '#borewell, #high_tds, #copper_charge, #alkaline, #ro_uv_uf',
    image: WATER_PURIFIER_TEMPLATES[0].imageUrl,
    galleryImages: [] as string[],
    inStock: true,
    visibleOnStorefront: true,
    stockQuantity: 8,
    featured: false,
    targetWaterType: 'Borewell',
    purificationStages: '8-Stage RO + UV + UF + Copper + Alkaline TDS Controller',
    maxTds: 'Up to 2000 PPM',
    warranty: '1 Year Comprehensive + 1 Free Filter Service + Free Installation',
    features: 'Active Copper Infusion, 100 GPD RO Membrane, Digital TDS LED Readout, Food Grade Antibacterial Tank',
    description: 'Multi-stage RO+UV water purifier designed for Tumakuru high TDS water with copper infusion and mineral balance.',
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [showGalleryUrlField, setShowGalleryUrlField] = useState(false);
  const [activeTemplateIndex, setActiveTemplateIndex] = useState<number | null>(null);
  const [isUserUploadedPhoto, setIsUserUploadedPhoto] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

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
        brand: productToEdit.brand || 'Aqua Puro Zone',
        price: productToEdit.price,
        originalPrice: productToEdit.originalPrice || Math.round(productToEdit.price * 1.25),
        capacity: productToEdit.capacity,
        mountType: productToEdit.mountType,
        tags: productToEdit.tags.join(', '),
        image: productToEdit.image || PLACEHOLDER_PRODUCT_IMAGE,
        galleryImages: productToEdit.galleryImages || [],
        inStock: productToEdit.inStock,
        visibleOnStorefront: productToEdit.visibleOnStorefront ?? true,
        stockQuantity: productToEdit.stockQuantity ?? 5,
        featured: productToEdit.featured,
        targetWaterType: productToEdit.targetWaterType || 'Borewell',
        purificationStages: productToEdit.purificationStages || 'Multi-Stage RO+UV+UF Filtration',
        maxTds: typeof productToEdit.maxTds === 'string' ? productToEdit.maxTds : (productToEdit.maxTds ? `Up to ${productToEdit.maxTds} PPM` : 'Up to 2000 PPM'),
        warranty: productToEdit.warranty || '1 Year Comprehensive + Free Installation',
        features: Array.isArray(productToEdit.features) ? productToEdit.features.join(', ') : '',
        description: productToEdit.description || '',
      });
      setImageUrlInput(productToEdit.image || '');
      setGalleryUrlInput('');
      setActiveTemplateIndex(null);
      setIsUserUploadedPhoto(
        Boolean(
          productToEdit.is_user_uploaded &&
          productToEdit.image &&
          !productToEdit.image.includes('lh3.googleusercontent.com') &&
          !productToEdit.image.includes('images.unsplash.com') &&
          productToEdit.image !== PLACEHOLDER_PRODUCT_IMAGE
        )
      );
    } else {
      // Default to the first Water Purifier Template
      const defaultTemplate = WATER_PURIFIER_TEMPLATES[0];
      setFormData({
        name: defaultTemplate.name,
        category: defaultTemplate.category,
        brand: defaultTemplate.brand,
        price: defaultTemplate.price,
        originalPrice: defaultTemplate.originalPrice,
        capacity: defaultTemplate.capacity,
        mountType: defaultTemplate.mountType,
        tags: defaultTemplate.tags,
        image: defaultTemplate.imageUrl,
        galleryImages: [],
        inStock: true,
        visibleOnStorefront: true,
        stockQuantity: 8,
        featured: false,
        targetWaterType: defaultTemplate.targetWaterType,
        purificationStages: defaultTemplate.purificationStages,
        maxTds: defaultTemplate.maxTds,
        warranty: defaultTemplate.warranty,
        features: defaultTemplate.features,
        description: defaultTemplate.description,
      });
      setImageUrlInput(defaultTemplate.imageUrl);
      setGalleryUrlInput('');
      setActiveTemplateIndex(0);
      setIsUserUploadedPhoto(false);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (template: PurifierTemplate, idx: number) => {
    setActiveTemplateIndex(idx);
    setIsUserUploadedPhoto(false);
    setFormData((prev) => ({
      ...prev,
      name: template.name,
      category: template.category,
      brand: template.brand,
      price: template.price,
      originalPrice: template.originalPrice,
      capacity: template.capacity,
      mountType: template.mountType,
      targetWaterType: template.targetWaterType,
      purificationStages: template.purificationStages,
      maxTds: template.maxTds,
      warranty: template.warranty,
      tags: template.tags,
      features: template.features,
      description: template.description,
      image: template.imageUrl,
    }));
    setImageUrlInput(template.imageUrl);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      try {
        const { url } = await uploadProductPhotoFile(file);
        setFormData((prev) => ({
          ...prev,
          image: url,
        }));
        setIsUserUploadedPhoto(true);
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData((prev) => ({
            ...prev,
            image: event.target?.result as string,
          }));
          setIsUserUploadedPhoto(true);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      image: PLACEHOLDER_PRODUCT_IMAGE,
    }));
    setImageUrlInput('');
    setIsUserUploadedPhoto(false);
  };

  const handleApplyUrl = () => {
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        image: imageUrlInput.trim(),
      }));
      setShowUrlField(false);
    }
  };

  const handleGalleryPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            setFormData((prev) => ({
              ...prev,
              galleryImages: [...prev.galleryImages, result],
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleGalleryDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .forEach((file) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
              setFormData((prev) => ({
                ...prev,
                galleryImages: [...prev.galleryImages, result],
              }));
            }
          };
          reader.readAsDataURL(file);
        });
    }
  };

  const handleAddGalleryUrl = () => {
    if (galleryUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, galleryUrlInput.trim()],
      }));
      setGalleryUrlInput('');
      setShowGalleryUrlField(false);
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const featuresArray = formData.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const qty = Math.max(0, Number(formData.stockQuantity) || 0);
    const inStock = Boolean(formData.inStock && qty > 0);

    const newProduct: Product = {
      id: productToEdit ? productToEdit.id : `prod-purifier-${Date.now()}`,
      name: formData.name.trim(),
      slug: productToEdit?.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      category: formData.category,
      brand: formData.brand.trim() || 'Aqua Puro Zone',
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) || undefined,
      discountPrice: Number(formData.originalPrice) || undefined,
      capacity: formData.capacity.trim(),
      mountType: formData.mountType.trim(),
      tags: tagsArray,
      image: formData.image || PLACEHOLDER_PRODUCT_IMAGE,
      galleryImages: formData.galleryImages,
      inStock: inStock,
      visibleOnStorefront: formData.visibleOnStorefront,
      isPublished: formData.visibleOnStorefront,
      stockQuantity: qty,
      featured: formData.featured,
      targetWaterType: formData.targetWaterType,
      purificationStages: formData.purificationStages.trim(),
      maxTds: formData.maxTds.trim(),
      warranty: formData.warranty.trim(),
      features: featuresArray,
      description: formData.description.trim(),
      is_user_uploaded: isUserUploadedPhoto,
      updatedAt: new Date().toISOString(),
      createdAt: productToEdit?.createdAt || new Date().toISOString(),
    };

    onSave(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto border border-[#dae2fd]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#dae2fd]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#005cb3]/10 text-[#005cb3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">water_drop</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-[19px] text-[#131b2e]">
                {productToEdit
                  ? (isKannada ? `ಉತ್ಪನ್ನ ವಿವರ ತಿದ್ದುಪಡಿ: ${productToEdit.name}` : `Edit Product Details: ${productToEdit.name}`)
                  : (isKannada ? 'ಹೊಸ ವಾಟರ್ ಪ್ಯೂರಿಫೈಯರ್ ಸೇರಿಸಿ' : 'Add More Products / Water Purifiers')}
              </h3>
              <p className="text-[12px] text-[#717784]">
                {isKannada ? 'ನಿರ್ವಾಹಕರಿಗೆ ಉತ್ಪನ್ನಗಳನ್ನು ಸೇರಿಸಲು, ತಿದ್ದುಪಡಿ ಮಾಡಲು ಮತ್ತು ತೆಗೆದುಹಾಕಲು ಪೂರ್ಣ ಅನುಮತಿ ಇದೆ' : 'Admin full management: configure all specs, stages, warranty, photos & inventory'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#414753] hover:bg-[#eaedff] transition-colors flex items-center justify-center"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 1-Click Water Purifier Quick-Start Templates (Only show when creating new or easily accessible) */}
        {!productToEdit && (
          <div className="mt-4 p-4 bg-gradient-to-r from-[#e0f2fe]/60 via-[#f0f9ff] to-[#e0f2fe]/40 rounded-2xl border border-[#27c4d9]/40">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[12px] font-extrabold text-[#06284b] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#0b74de]">bolt</span>
                <span>Water Purifier 1-Click Templates (Tumakuru Models)</span>
              </span>
              <span className="text-[11px] font-bold text-[#006c2e] bg-[#6bff8f]/30 px-2 py-0.5 rounded-full">
                Fast Setup
              </span>
            </div>
            <p className="text-[12px] text-[#414753] mb-3">
              Click any purifier preset below to auto-fill high-TDS Tumakuru specs, capacity, warranty, and features instantly:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WATER_PURIFIER_TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl, idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold flex flex-col justify-between ${
                    activeTemplateIndex === idx
                      ? 'bg-[#005cb3] text-white border-[#005cb3] shadow-sm ring-2 ring-[#005cb3]/30'
                      : 'bg-white hover:bg-slate-50 text-[#131b2e] border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="font-bold text-[12px] truncate">{tpl.label}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                      activeTemplateIndex === idx ? 'bg-white/20 text-white' : 'bg-[#e2e7ff] text-[#005cb3]'
                    }`}>
                      {tpl.badge}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] opacity-90">
                    <span>₹{tpl.price.toLocaleString('en-IN')}</span>
                    <span className="text-[10px]">{tpl.category === 'Commercial RO' ? '50 LPH' : '15 LPH'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Photograph Management Section */}
          <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-bold text-[#131b2e] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#005cb3]">photo_camera</span>
                <span>Product Photograph (Storefront & Live AI Scanner)</span>
              </label>
              {formData.image && formData.image !== PLACEHOLDER_PRODUCT_IMAGE && (
                <span className="text-[10px] font-bold bg-[#6bff8f]/30 text-[#006c2e] px-2 py-0.5 rounded-full">
                  ✓ Photo Configured
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Preview Thumbnail */}
              <div className="w-28 h-28 rounded-2xl bg-white border-2 border-[#dae2fd] overflow-hidden flex items-center justify-center p-2 shrink-0 shadow-sm relative group">
                <img
                  src={formData.image || PLACEHOLDER_PRODUCT_IMAGE}
                  alt="Product Preview"
                  className="h-full w-full object-contain"
                />
                {formData.image && formData.image !== PLACEHOLDER_PRODUCT_IMAGE && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute inset-0 bg-red-900/75 text-white font-bold text-[11px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                    title="Click to remove current photo"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {/* Actions & Preset Buttons */}
              <div className="flex-1 w-full space-y-2.5">
                <div>
                  {isUserUploadedPhoto ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                      <span>Admin-Uploaded Photo • Active in AI Recommendation Engine</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-medium border border-amber-300">
                      <span className="material-symbols-outlined text-[15px] text-amber-600">info</span>
                      <span>Catalog Template Image • Upload your custom photo to enable AI recommendations</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 bg-[#005cb3] hover:bg-[#0b74de] text-white rounded-xl text-[12px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[15px]">upload_file</span>
                    <span>Upload Device Image</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  <label className="px-3 py-1.5 bg-[#006c2e] hover:bg-[#00883c] text-white rounded-xl text-[12px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                    <span>Snap Camera Photo</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  {formData.image && formData.image !== PLACEHOLDER_PRODUCT_IMAGE && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] rounded-xl text-[12px] font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Remove this photo"
                    >
                      <span className="material-symbols-outlined text-[15px]">no_photography</span>
                      <span>Remove Photo</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowUrlField(!showUrlField)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#414753] border border-[#dae2fd] rounded-xl text-[12px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">link</span>
                    <span>{showUrlField ? 'Hide URL' : 'Image URL'}</span>
                  </button>
                </div>

                {showUrlField && (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/water-purifier.jpg"
                      className="flex-1 px-3 py-1.5 bg-white rounded-xl text-[12px] border border-[#dae2fd] focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 bg-[#005cb3] text-white rounded-xl text-[12px] font-bold hover:bg-[#0b74de]"
                    >
                      Apply Link
                    </button>
                  </div>
                )}

                {/* Preset image selectors */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#414753] pt-1 border-t border-[#dae2fd]/60">
                  <span className="font-semibold text-slate-500">Fast Presets:</span>
                  {presetPhotos.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: preset.url }))}
                      className="text-[#005cb3] font-bold hover:underline px-2 py-0.5 rounded bg-white border border-[#dae2fd] text-[10px]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Product Images (Gallery) */}
            <div className="mt-4 pt-3 border-t border-[#dae2fd]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-bold text-[#131b2e] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#005cb3]">collections</span>
                  <span>Additional Gallery Photos ({formData.galleryImages.length})</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#005cb3] border border-[#dae2fd] rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">add_photo_alternate</span>
                    <span>+ Add Photos</span>
                    <input type="file" multiple accept="image/*" onChange={handleGalleryPhotoUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGalleryUrlField(!showGalleryUrlField)}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-[#414753] border border-[#dae2fd] rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    <span>{showGalleryUrlField ? 'Close URL' : '+ Image URL'}</span>
                  </button>
                </div>
              </div>

              {showGalleryUrlField && (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="url"
                    value={galleryUrlInput}
                    onChange={(e) => setGalleryUrlInput(e.target.value)}
                    placeholder="https://example.com/gallery-photo.jpg"
                    className="flex-1 px-3 py-1.5 bg-white rounded-xl text-xs border border-[#dae2fd] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    className="px-3 py-1.5 bg-[#005cb3] text-white rounded-xl text-xs font-bold hover:bg-[#0b74de]"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Batch Upload Dropzone in Modal */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleGalleryDrop}
                className="mt-2 mb-3 border-2 border-dashed border-[#005cb3]/30 hover:border-[#005cb3] bg-[#f8faff] hover:bg-[#eef5ff] rounded-2xl p-4 text-center transition-all cursor-pointer group"
                onClick={() => {
                  const input = document.getElementById('modal-gallery-batch-input');
                  input?.click();
                }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#005cb3]/10 text-[#005cb3] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">drive_folder_upload</span>
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-[12px] font-bold text-[#131b2e]">
                      Batch Uploading: Drag-and-drop or file selection supporting multiple images simultaneously on desktop and mobile
                    </p>
                    <p className="text-[11px] text-[#717784]">
                      Click to choose multiple files from computer/phone gallery or drop them here.
                    </p>
                  </div>
                </div>
                <input
                  id="modal-gallery-batch-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryPhotoUpload}
                  className="hidden"
                />
              </div>

              {formData.galleryImages.length === 0 ? (
                <p className="text-[11px] text-[#717784] italic">
                  No additional gallery photos yet. Add extra angles, filter cutaway, or installation photos to display on the product detail page.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {formData.galleryImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl bg-white border border-[#dae2fd] overflow-hidden p-1 group shrink-0">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute inset-0 bg-red-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Core Product Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                {isKannada ? 'ಉತ್ಪನ್ನದ ಹೆಸರು *' : 'Product Model & Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. AquaPure Copper Alkaline RO+UV"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0b74de]/20 border border-[#dae2fd]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Aqua Puro Zone"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd]"
              />
            </div>
          </div>

          {/* Category & Target Water Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Product Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd] font-medium"
              >
                <option value="Water Purifier">Water Purifier (RO+UV+UF)</option>
                <option value="Commercial RO">Commercial RO (25 / 50 / 100 LPH)</option>
                <option value="Whole House Softener">Whole House Softener / Resin Plant</option>
                <option value="Kitchen Chimney">Kitchen Chimney (Auto-Clean)</option>
                <option value="Sand / Iron Removal Filter">Sand / Iron Removal Filter</option>
                <option value="Spare Cartridges / Membrane">Spare Cartridges / Membrane</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Target Water Source (Tumakuru Conditions) *
              </label>
              <select
                value={formData.targetWaterType}
                onChange={(e) => setFormData({ ...formData, targetWaterType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd] font-medium"
              >
                <option value="Borewell">Borewell (High TDS & Hard Water)</option>
                <option value="Municipal">Municipal / Kaveri Supply (Low TDS)</option>
                <option value="Tanker">Private Tanker Supply (Variable Hardness)</option>
                <option value="All">All Water Sources (Universal Multi-Source)</option>
              </select>
            </div>
          </div>

          {/* Pricing & Stock Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd] font-mono font-bold text-[#005cb3]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                M.R.P / Original Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                placeholder="e.g. 21999"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd] font-mono"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Available Warehouse Stock (Units) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stockQuantity}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value) || 0);
                  setFormData((prev) => ({
                    ...prev,
                    stockQuantity: val,
                    inStock: val > 0 ? prev.inStock : false,
                  }));
                }}
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[14px] focus:outline-none border border-[#dae2fd] font-mono font-semibold"
              />
            </div>
          </div>

          {/* Detailed Specifications: Stages, Max TDS, Capacity, Mount Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Purification Stages / Technology *
              </label>
              <input
                type="text"
                value={formData.purificationStages}
                onChange={(e) => setFormData({ ...formData, purificationStages: e.target.value })}
                placeholder="e.g. 8-Stage RO + UV + UF + Copper + Alkaline"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] focus:outline-none border border-[#dae2fd]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Maximum TDS Level Supported *
              </label>
              <input
                type="text"
                value={formData.maxTds}
                onChange={(e) => setFormData({ ...formData, maxTds: e.target.value })}
                placeholder="e.g. Up to 2000 PPM / Up to 2800 PPM"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] focus:outline-none border border-[#dae2fd]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Capacity & Storage *
              </label>
              <input
                type="text"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g. 15 LPH Flow / 10L Storage Tank"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] focus:outline-none border border-[#dae2fd]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
                Mount Type & Installation Fit *
              </label>
              <input
                type="text"
                value={formData.mountType}
                onChange={(e) => setFormData({ ...formData, mountType: e.target.value })}
                placeholder="e.g. Wall-Mounted / Countertop / Under-Sink"
                className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] focus:outline-none border border-[#dae2fd]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
              Warranty & Service Guarantee
            </label>
            <input
              type="text"
              value={formData.warranty}
              onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
              placeholder="e.g. 1 Year Comprehensive + 1 Free Filter Service + Free Installation"
              className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] focus:outline-none border border-[#dae2fd]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
              Key Features & Highlights (comma separated)
            </label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="Active Copper Infusion, 100 GPD Membrane, Digital TDS LED, Food Grade Tank"
              className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] focus:outline-none border border-[#dae2fd]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
              AI Recommendation Matching Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="borewell, high_tds, compact_sink, copper_charge, ro_uv_uf"
              className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] font-mono text-[13px] focus:outline-none border border-[#dae2fd]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Full technical and benefits description for Tumakuru customers..."
              className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[#131b2e] text-[13px] focus:outline-none border border-[#dae2fd] resize-none"
            />
          </div>

          {/* Visibility and In-Stock Control Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd]">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.visibleOnStorefront}
                onChange={(e) => setFormData({ ...formData, visibleOnStorefront: e.target.checked })}
                className="w-4 h-4 text-[#005cb3] rounded border-gray-300 focus:ring-[#005cb3]"
              />
              <div>
                <span className="text-[13px] font-bold text-[#131b2e] block">
                  {formData.visibleOnStorefront ? '👁️ Customer Visible on Storefront' : '🚫 Hidden from Customers'}
                </span>
                <span className="text-[11px] text-[#717784]">
                  Controls display in the 2-grid public catalog
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    inStock: checked,
                    stockQuantity: checked && prev.stockQuantity === 0 ? 5 : prev.stockQuantity,
                  }));
                }}
                className="w-4 h-4 text-[#006c2e] rounded border-gray-300 focus:ring-[#006c2e]"
              />
              <div>
                <span className="text-[13px] font-bold text-[#131b2e] block">
                  {formData.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                </span>
                <span className="text-[11px] text-[#717784]">
                  {formData.inStock ? `${formData.stockQuantity} units available in warehouse` : 'Marked sold out (displays out of stock label)'}
                </span>
              </div>
            </label>
          </div>

          {/* Submit / Cancel Buttons */}
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
              <span>{isKannada ? 'ಉಳಿಸಿ (Save Product)' : 'Save Product & Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
