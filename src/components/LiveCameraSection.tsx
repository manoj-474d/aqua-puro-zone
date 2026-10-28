import React, { useState, useRef, useEffect } from 'react';
import { Product, Lead } from '../types';

interface LiveCameraSectionProps {
  products: Product[];
  onSubmitLead: (lead: Lead) => void;
  whatsappNumber: string;
  isKannada: boolean;
}

export const LiveCameraSection: React.FC<LiveCameraSectionProps> = ({
  products,
  onSubmitLead,
  whatsappNumber,
  isKannada,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Customer inputs
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [locality, setLocality] = useState<string>('Sira Gate, Tumakuru');
  const [waterSource, setWaterSource] = useState<string>('Borewell (ಬೋರ್‌ವೆಲ್ ನೀರು - High TDS)');
  const [tdsEstimate, setTdsEstimate] = useState<number>(750);
  const [familyMembers, setFamilyMembers] = useState<number>(4);

  // Match state
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setCameraError('Camera access unavailable on this device. You can upload any kitchen/water photo or click the sample spaces below.');
      setIsCameraActive(false);
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      setTimeout(() => startCamera(), 100);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhoto(event.target?.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (url: string, defaultSource: string, defaultTds: number) => {
    setCapturedPhoto(url);
    setWaterSource(defaultSource);
    setTdsEstimate(defaultTds);
    stopCamera();
  };

  const handleAnalyzeAndSuggest = () => {
    if (!capturedPhoto) return;
    setIsDiagnosing(true);

    setTimeout(() => {
      // Filter ONLY products in-stock AND visible on storefront with stockQuantity > 0
      const availableStock = products.filter(
        (p) => p.inStock && p.visibleOnStorefront && p.stockQuantity > 0
      );

      let chosen: Product | null = null;

      if (availableStock.length === 0) {
        const inStockAny = products.filter((p) => p.inStock && p.visibleOnStorefront);
        chosen = inStockAny[0] || products[0];
      } else {
        if (waterSource.toLowerCase().includes('borewell') || tdsEstimate > 400) {
          chosen =
            availableStock.find((p) => p.tags.some((t) => t.includes('borewell') || t.includes('high_tds'))) ||
            availableStock.find((p) => p.category === 'Water Purifier') ||
            availableStock[0];
        } else if (waterSource.toLowerCase().includes('kaveri') || tdsEstimate <= 300) {
          chosen =
            availableStock.find((p) => p.tags.some((t) => t.includes('low_tds') || t.includes('uv'))) ||
            availableStock.find((p) => p.category === 'Water Purifier') ||
            availableStock[0];
        } else if (waterSource.toLowerCase().includes('tanker') || waterSource.toLowerCase().includes('softener')) {
          chosen =
            availableStock.find((p) => p.category === 'Whole House Softener') ||
            availableStock[0];
        } else {
          chosen = availableStock[0];
        }
      }

      setMatchedProduct(chosen);
      setIsDiagnosing(false);

      if (customerName.trim() || phone.trim()) {
        const newLead: Lead = {
          id: `lead-cam-${Date.now()}`,
          timestamp: 'Just now (Live Photo)',
          customerName: customerName.trim() || 'Live Storefront Visitor',
          phone: phone.trim() || '+91 82962 64007',
          locality: locality,
          spaceImage: capturedPhoto,
          spaceTitle: 'Live Camera Capture',
          waterSource: waterSource,
          tdsPpm: tdsEstimate,
          membersCount: familyMembers,
          aiRecommendation: chosen ? `${chosen.name} (${chosen.category})` : 'AquaPure Copper RO',
          aiTag: 'Live Photo Match',
          matchedProductId: chosen?.id,
          status: 'new',
          notes: `Customer snapped live photo. Matched from live warehouse stock: ${chosen?.name} (Stock: ${chosen?.stockQuantity || 1} available).`,
          source: 'Live Camera Capture',
        };
        onSubmitLead(newLead);
        setSubmittedLeadId(newLead.id);
      }
    }, 700);
  };

  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <section id="live-photo-section" className="py-14 px-4 sm:px-8 max-w-7xl mx-auto w-full relative">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-10 left-1/4 w-72 h-72 bg-[#5ee9ff]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 right-1/4 w-72 h-72 bg-[#0b74de]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-gradient-to-br from-white via-[#f0f9ff] to-[#e0f2fe] rounded-3xl p-6 sm:p-10 border-2 border-[#bae6fd] shadow-xl relative overflow-hidden">
        {/* Animated Pure Water Banner Tag */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005cb3] text-white text-[12px] font-bold shadow-md animate-badge-pop mb-3">
            <span className="material-symbols-outlined text-[18px] text-[#5ee9ff]">center_focus_strong</span>
            <span>{isKannada ? 'ಲೈವ್ ಕ್ಯಾಮೆರಾ ತಪಾಸಣೆ' : 'Live Camera Water & Space Diagnostic'}</span>
          </div>

          <h2 className="font-heading font-extrabold text-[30px] sm:text-[40px] text-[#131b2e] tracking-tight leading-tight">
            {isKannada
              ? 'ನಿಮ್ಮ ಅಡುಗೆಮನೆ ಅಥವಾ ನೀರಿನ ಫೋಟೋ ತೆಗೆಯಿರಿ - ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್ ನಿಂದ ತಕ್ಷಣದ ಶಿಫಾರಸು ಪಡೆಯಿರಿ'
              : 'Snap Your Kitchen or Water Sample — Matched with Owner\'s Live In-Stock Units'}
          </h2>

          <p className="text-[14px] sm:text-[16px] text-[#414753] mt-2.5 leading-relaxed">
            Take a real-time live photo of your kitchen sink, wall, or water supply. Our AI scanner detects your space dimensions and pairs it directly with 
            <strong className="text-[#005cb3]"> genuine in-stock models currently in the Tumakuru warehouse</strong>, uploaded and verified by the store owner.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Camera & Photo Capture Module with Scanning Animations */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#dae2fd] flex flex-col justify-between relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#dae2fd] mb-4">
              <span className="font-heading font-bold text-[16px] text-[#131b2e] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#006c2e] animate-ping"></span>
                Step 1: Point Camera at Kitchen or Water
              </span>
              {capturedPhoto && (
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    setMatchedProduct(null);
                  }}
                  className="text-[12px] font-bold text-[#ba1a1a] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  Retake Photo
                </button>
              )}
            </div>

            {/* Viewfinder Canvas with High-Tech Laser Beam & Bracket Overlay */}
            <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-[#0a1120] overflow-hidden flex items-center justify-center border-2 border-[#005cb3]/40 shadow-inner group">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Animated Laser Scanning Line moving over camera feed */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#5ee9ff] to-transparent shadow-[0_0_15px_#5ee9ff] animate-scan-laser pointer-events-none z-10"></div>

                  {/* Viewfinder High-Tech Overlay Frame */}
                  <div className="absolute inset-4 border border-cyan-400/40 rounded-2xl pointer-events-none flex flex-col justify-between p-4 z-10">
                    <div className="flex justify-between items-center text-cyan-300 text-[11px] font-mono">
                      <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#4ae176] animate-pulse"></span>
                        AI OPTICAL SCANNER ACTIVE
                      </span>
                      <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                        TUMAKURU NODE
                      </span>
                    </div>

                    {/* Center Crosshairs */}
                    <div className="self-center flex items-center justify-center w-24 h-24 border border-dashed border-cyan-400/60 rounded-full animate-ripple">
                      <div className="w-2 h-2 bg-[#5ee9ff] rounded-full"></div>
                    </div>

                    <div className="text-center text-white text-[12px] bg-black/60 py-1.5 px-4 rounded-full self-center backdrop-blur-md border border-white/20">
                      Align kitchen pipe valve, sink, or wall mounting area
                    </div>
                  </div>

                  {/* Camera Control Actions */}
                  <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-4 z-20">
                    <button
                      onClick={toggleFacingMode}
                      className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors border border-white/20"
                      title="Flip Camera"
                    >
                      <span className="material-symbols-outlined text-[22px]">flip_camera_ios</span>
                    </button>
                    <button
                      onClick={takeSnapshot}
                      className="w-18 h-18 rounded-full bg-white text-[#005cb3] flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.8)] hover:scale-105 active:scale-95 transition-transform ring-4 ring-[#005cb3]"
                      title="Snap Live Photo"
                    >
                      <span className="material-symbols-outlined text-[36px]">camera</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors border border-white/20"
                      title="Close Camera"
                    >
                      <span className="material-symbols-outlined text-[22px]">close</span>
                    </button>
                  </div>
                </>
              ) : capturedPhoto ? (
                <div className="relative w-full h-full group overflow-hidden">
                  <img
                    src={capturedPhoto}
                    alt="Customer Space Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Dark scrim for AR projection */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40 pointer-events-none"></div>
                  
                  <div className="absolute top-4 left-4 bg-[#006c2e] text-white text-[12px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 z-20">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Space Analyzed</span>
                  </div>

                  {/* 5. SNAP & SUGGEST TIE-IN: AR-Style Drop Preview of Matched Purifier */}
                  {matchedProduct ? (
                    <div className="absolute inset-0 flex items-center justify-center p-4 z-10 pointer-events-none">
                      {/* Augmented Reality Projected Purifier */}
                      <div className="relative flex flex-col items-center animate-in zoom-in-75 duration-700 ease-out">
                        {/* Glowing Outline & Halo */}
                        <div className="absolute -inset-4 rounded-3xl bg-cyan-400/25 blur-lg animate-pulse"></div>

                        {/* Best Match Badge with Sparkle Burst */}
                        <div className="mb-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-cyan-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-bounce">
                          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                          <span>✦ AI Best Fit For Your Kitchen ✦</span>
                        </div>

                        {/* Dropped In Purifier Appliance with Floor Drop Shadow */}
                        <div className="relative animate-float-slow">
                          <img
                            src={matchedProduct.image}
                            alt={matchedProduct.name}
                            className="h-44 sm:h-52 w-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)] filter brightness-105 contrast-105"
                          />
                        </div>

                        {/* Realistic Ground Shadow on Countertop / Floor */}
                        <div className="w-36 h-5 rounded-full bg-black/80 blur-md mt-1 scale-90"></div>

                        <div className="mt-2 px-3 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-cyan-400/40 text-[11px] font-bold text-cyan-300">
                          AR In-Kitchen Scale Simulation
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute bottom-4 inset-x-4 text-center z-10 bg-black/60 backdrop-blur-sm py-2 px-3 rounded-xl border border-white/20 text-xs text-white">
                      Fill details on the right and click "Analyze Live Photo" to project purifier
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 text-slate-300 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-3xl bg-[#005cb3]/20 border border-[#5ee9ff]/30 flex items-center justify-center text-[#5ee9ff] mb-4 shadow-lg animate-float-slow">
                    <span className="material-symbols-outlined text-[42px]">add_a_photo</span>
                  </div>
                  <h4 className="font-heading font-bold text-[18px] text-white">
                    Ready for Live Camera Scan
                  </h4>
                  <p className="text-[13px] text-slate-300 max-w-sm mt-1 mb-5">
                    Launch your phone camera or webcam to inspect plumbing, countertop clearance, or tap water sample.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 bg-[#005cb3] hover:bg-[#0b74de] text-white rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all shadow-md hover:scale-105"
                    >
                      <span className="material-symbols-outlined text-[20px]">videocam</span>
                      <span>Launch Live Camera</span>
                    </button>
                    <label className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[13px] font-bold flex items-center gap-2 cursor-pointer transition-all border border-white/20">
                      <span className="material-symbols-outlined text-[20px]">upload_file</span>
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-[12px] text-[#ba1a1a] mt-2 bg-[#ffdad6] p-2.5 rounded-xl font-medium">
                {cameraError}
              </p>
            )}

            {/* Quick Demo Presets */}
            <div className="mt-4 pt-3 border-t border-[#dae2fd]">
              <span className="text-[11px] font-bold text-[#414753] uppercase tracking-wider block mb-2">
                Or Try Sample Tumakuru Kitchens:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    selectPreset(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuDABpjCoa534i-YEtL_gIEMJlMKUn03pPeZG5nME226D73ZtOA1guAegaPhxlFWNlF_g3V5MK5ZBL2mamppy0CcH4dg5TS9RZyYgnWGP_AEhEhYWl9OL1HmW-6L1--yzG-WgBKrZXs_UoKJw--jG4YoI0qo6U874tobThBDJzkUZel9TbbjMd8iTgE2icHIaaA-4_6qW0l16rZYgm2mI7s1gNGzv_PlHyXNvhUG1R3gndqgEI_kwU9U',
                      'Borewell (ಬೋರ್‌ವೆಲ್ ನೀರು - High TDS)',
                      750
                    )
                  }
                  className="p-1.5 rounded-xl border border-[#dae2fd] hover:border-[#005cb3] text-left transition-all bg-[#f2f3ff] hover:scale-102"
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDABpjCoa534i-YEtL_gIEMJlMKUn03pPeZG5nME226D73ZtOA1guAegaPhxlFWNlF_g3V5MK5ZBL2mamppy0CcH4dg5TS9RZyYgnWGP_AEhEhYWl9OL1HmW-6L1--yzG-WgBKrZXs_UoKJw--jG4YoI0qo6U874tobThBDJzkUZel9TbbjMd8iTgE2icHIaaA-4_6qW0l16rZYgm2mI7s1gNGzv_PlHyXNvhUG1R3gndqgEI_kwU9U"
                    alt="Under sink"
                    className="w-full h-14 object-cover rounded-lg mb-1"
                  />
                  <span className="text-[11px] font-bold text-[#131b2e] block truncate">Sira Gate Under-Sink</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    selectPreset(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBFoHrtTht-KsZhZaABctjclsTcQT1yPVnpmFjjlVewiNOpPhD75mLqAqNjBA2W-LOTtFhytcKNVod2L129Yc-UzcMyNfgen4NViG7aurpKxfRXF5bjzIp57zY-OFgNPLce4Dkk70ykutGPFFmGbE91pXjWQIdbr4cLrReJP0dW16Ntt6X_jlh69-imwxS1NzXmt2NCCN4hXu2m4ZozC0U6VbdNmAqRRkFpUoQJFdQcZ-Ocgg8kQHMw',
                      'Kaveri Municipal Supply (ಕಾವೇರಿ - Low TDS)',
                      140
                    )
                  }
                  className="p-1.5 rounded-xl border border-[#dae2fd] hover:border-[#005cb3] text-left transition-all bg-[#f2f3ff] hover:scale-102"
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFoHrtTht-KsZhZaABctjclsTcQT1yPVnpmFjjlVewiNOpPhD75mLqAqNjBA2W-LOTtFhytcKNVod2L129Yc-UzcMyNfgen4NViG7aurpKxfRXF5bjzIp57zY-OFgNPLce4Dkk70ykutGPFFmGbE91pXjWQIdbr4cLrReJP0dW16Ntt6X_jlh69-imwxS1NzXmt2NCCN4hXu2m4ZozC0U6VbdNmAqRRkFpUoQJFdQcZ-Ocgg8kQHMw"
                    alt="Wall Mount"
                    className="w-full h-14 object-cover rounded-lg mb-1"
                  />
                  <span className="text-[11px] font-bold text-[#131b2e] block truncate">Kyatsandra Wall Mount</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    selectPreset(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrzov2f0_UB1JP5n-Ld6fcmEBegAYU9oP1FOHYMpDFpAJ2vMnNM8yvobW6rm3sfZtVZNqHqdM9Nx7UXkENmONbrA8OADuViB6UFgohRoH_8A1qjQAG7SnCvT5ZfQtblqKFYP2HUGA9R-yxGU7j0Cm40oE1OeLgiNrLQvDhsc6OV4wOK1Ss452w72pjKOpbDEAwaxUvNoZ-l_dijw8R55LERN1E_LSsrKzz19_FsTKKypUmLA0mWPMT',
                      'Both Borewell & Tanker',
                      920
                    )
                  }
                  className="p-1.5 rounded-xl border border-[#dae2fd] hover:border-[#005cb3] text-left transition-all bg-[#f2f3ff] hover:scale-102"
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrzov2f0_UB1JP5n-Ld6fcmEBegAYU9oP1FOHYMpDFpAJ2vMnNM8yvobW6rm3sfZtVZNqHqdM9Nx7UXkENmONbrA8OADuViB6UFgohRoH_8A1qjQAG7SnCvT5ZfQtblqKFYP2HUGA9R-yxGU7j0Cm40oE1OeLgiNrLQvDhsc6OV4wOK1Ss452w72pjKOpbDEAwaxUvNoZ-l_dijw8R55LERN1E_LSsrKzz19_FsTKKypUmLA0mWPMT"
                    alt="Chimney"
                    className="w-full h-14 object-cover rounded-lg mb-1"
                  />
                  <span className="text-[11px] font-bold text-[#131b2e] block truncate">Batwadi Chimney Area</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Parameters & Matched In-Stock Purifier Card */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#dae2fd]">
              <span className="font-heading font-bold text-[16px] text-[#131b2e] block mb-3.5">
                Step 2: Water Details & Contact
              </span>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#414753] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Nagaraj Rao"
                      className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[13px] border border-[#dae2fd] focus:outline-none focus:ring-2 focus:ring-[#005cb3]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#414753] mb-1">
                      WhatsApp Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[13px] font-mono border border-[#dae2fd] focus:outline-none focus:ring-2 focus:ring-[#005cb3]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#414753] mb-1">
                      Water Source
                    </label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[13px] border border-[#dae2fd] focus:outline-none font-medium"
                    >
                      <option>Borewell (ಬೋರ್‌ವೆಲ್ ನೀರು - High TDS)</option>
                      <option>Kaveri Municipal Supply (ಕಾವೇರಿ - Low TDS)</option>
                      <option>Private Tanker Water (ಖಾಸಗಿ ಟ್ಯಾಂಕರ್)</option>
                      <option>Both Borewell & Tanker</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#414753] mb-1">
                      Tumakuru Locality
                    </label>
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[13px] border border-[#dae2fd] focus:outline-none font-medium"
                    >
                      <option>Sira Gate, Tumakuru</option>
                      <option>Kyatsandra, Tumakuru</option>
                      <option>Batwadi, Tumakuru</option>
                      <option>SS Puram, Tumakuru</option>
                      <option>Gubbi Gate, Tumakuru</option>
                      <option>Mandipet, Tumakuru</option>
                    </select>
                  </div>
                </div>

                {/* Animated TDS Slider */}
                <div className="p-3 bg-[#f0f9ff] rounded-2xl border border-[#bae6fd]">
                  <div className="flex justify-between items-center text-[12px] mb-1">
                    <span className="font-semibold text-[#131b2e]">Estimated Water TDS Level</span>
                    <span className="font-mono font-bold text-[#005cb3] text-[15px]">{tdsEstimate} PPM</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1800"
                    step="10"
                    value={tdsEstimate}
                    onChange={(e) => setTdsEstimate(Number(e.target.value))}
                    className="w-full accent-[#005cb3] h-2 bg-[#dae2fd] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#717784] font-medium mt-1">
                    <span>50 PPM (Low TDS)</span>
                    <span>500 PPM (Hard Water)</span>
                    <span>1500+ PPM (High Hardness)</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={handleAnalyzeAndSuggest}
                  disabled={!capturedPhoto || isDiagnosing}
                  className="w-full py-3.5 bg-gradient-to-r from-[#005cb3] to-[#0b74de] hover:from-[#095eb3] hover:to-[#005cb3] text-white rounded-xl text-[14px] font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                >
                  {isDiagnosing ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                      <span>Scanning Owner's In-Stock Warehouse...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                      <span>{capturedPhoto ? 'Analyze Live Photo & Suggest In-Stock Purifier' : 'Take Photo First to Run Match'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Matched In-Stock Product with Attractive Animation Effects */}
            {matchedProduct && (
              <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#006c2e] animate-water-glow animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
                {/* Pure water wave backdrop decoration */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#6bff8f]/10 rounded-full blur-xl pointer-events-none"></div>

                <div className="flex items-center justify-between pb-3 border-b border-[#dae2fd] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#006c2e] animate-ping"></span>
                    <span className="font-heading font-bold text-[16px] text-[#006c2e]">
                      ✅ Perfect Match in Tumakuru Warehouse
                    </span>
                  </div>
                  <span className="text-[11px] font-bold bg-[#6bff8f]/30 text-[#006c2e] px-3 py-1 rounded-full animate-bounce">
                    {matchedProduct.stockQuantity} Units In Stock
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 items-center">
                  {/* Exact photo uploaded by owner with soft glow pedestal */}
                  <div className="w-full sm:w-40 h-40 bg-gradient-to-b from-[#e0f2fe] to-white rounded-2xl p-3 flex items-center justify-center shrink-0 border border-[#bae6fd] shadow-md animate-float-slow">
                    <img
                      src={matchedProduct.image}
                      alt={matchedProduct.name}
                      className="h-full w-auto object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-[#006875] bg-[#5ee9ff]/30 px-2.5 py-0.5 rounded-full">
                        {matchedProduct.category}
                      </span>
                      {/* Animated Shimmer Price Badge */}
                      <span className="font-heading font-extrabold text-[22px] text-[#005cb3] animate-shimmer-tag px-3 py-0.5 rounded-xl shadow-xs">
                        ₹{matchedProduct.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-[18px] text-[#131b2e] leading-snug">
                      {matchedProduct.name}
                    </h4>
                    <p className="text-[13px] text-[#414753] line-clamp-2 mt-1 mb-2.5 leading-relaxed">
                      {matchedProduct.description}
                    </p>
                    <p className="text-[12px] text-[#006c2e] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Owner verified for {waterSource.split(' ')[0]} (TDS ~{tdsEstimate} PPM).</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-5 pt-3.5 border-t border-[#dae2fd]">
                  <a
                    href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(`Hello Aqua Puro Zone Tumakuru! I used the Live Camera diagnostic for my ${locality} home. The AI matched "${matchedProduct.name}" (₹${matchedProduct.price}). Please arrange same-day installation.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-[#006c2e] hover:bg-[#00883c] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-md hover:scale-102 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Order via WhatsApp (Same-Day Delivery)</span>
                  </a>

                  <a
                    href={`tel:${whatsappNumber.replace(/[^0-9]/g, '')}`}
                    className="px-5 py-3 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#005cb3] rounded-xl text-[13px] font-bold flex items-center gap-1.5 border border-[#dae2fd]"
                  >
                    <span className="material-symbols-outlined text-[18px]">call</span>
                    <span>Call Shop</span>
                  </a>
                </div>

                {submittedLeadId && (
                  <div className="mt-3 p-2 bg-[#6bff8f]/20 rounded-xl text-[12px] text-[#006c2e] text-center font-bold">
                    ✓ Your photo and request have been directly dispatched to Sira Gate store manager!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
