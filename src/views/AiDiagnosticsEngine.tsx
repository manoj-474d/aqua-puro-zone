import React, { useState } from 'react';
import { Lead } from '../types';

interface AiDiagnosticsEngineProps {
  onAddLead: (lead: Lead) => void;
  isKannada: boolean;
}

export const AiDiagnosticsEngine: React.FC<AiDiagnosticsEngineProps> = ({
  onAddLead,
  isKannada,
}) => {
  const sampleSpaces = [
    {
      title: 'Under-Sink Modular Cabinet',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDABpjCoa534i-YEtL_gIEMJlMKUn03pPeZG5nME226D73ZtOA1guAegaPhxlFWNlF_g3V5MK5ZBL2mamppy0CcH4dg5TS9RZyYgnWGP_AEhEhYWl9OL1HmW-6L1--yzG-WgBKrZXs_UoKJw--jG4YoI0qo6U874tobThBDJzkUZel9TbbjMd8iTgE2icHIaaA-4_6qW0l16rZYgm2mI7s1gNGzv_PlHyXNvhUG1R3gndqgEI_kwU9U',
      defaultTds: 750,
      source: 'Borewell (ಬೋರ್‌ವೆಲ್)',
    },
    {
      title: 'Kitchen Granite Wall Mount',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFoHrtTht-KsZhZaABctjclsTcQT1yPVnpmFjjlVewiNOpPhD75mLqAqNjBA2W-LOTtFhytcKNVod2L129Yc-UzcMyNfgen4NViG7aurpKxfRXF5bjzIp57zY-OFgNPLce4Dkk70ykutGPFFmGbE91pXjWQIdbr4cLrReJP0dW16Ntt6X_jlh69-imwxS1NzXmt2NCCN4hXu2m4ZozC0U6VbdNmAqRRkFpUoQJFdQcZ-Ocgg8kQHMw',
      defaultTds: 140,
      source: 'Kaveri Municipal Supply (ಕಾವೇರಿ)',
    },
    {
      title: 'Kitchen Chimney Overhead Duct',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrzov2f0_UB1JP5n-Ld6fcmEBegAYU9oP1FOHYMpDFpAJ2vMnNM8yvobW6rm3sfZtVZNqHqdM9Nx7UXkENmONbrA8OADuViB6UFgohRoH_8A1qjQAG7SnCvT5ZfQtblqKFYP2HUGA9R-yxGU7j0Cm40oE1OeLgiNrLQvDhsc6OV4wOK1Ss452w72pjKOpbDEAwaxUvNoZ-l_dijw8R55LERN1E_LSsrKzz19_FsTKKypUmLA0mWPMT',
      defaultTds: 920,
      source: 'Both Borewell & Tanker',
    },
  ];

  const [selectedSpaceIdx, setSelectedSpaceIdx] = useState<number>(0);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [tdsPpm, setTdsPpm] = useState<number>(750);
  const [waterSource, setWaterSource] = useState<string>('Borewell (ಬೋರ್‌ವೆಲ್ ನೀರು)');
  const [familyMembers, setFamilyMembers] = useState<number>(5);
  const [locality, setLocality] = useState<string>('Sira Gate, Tumakuru');
  const [customerName, setCustomerName] = useState<string>('Chandrashekar H.');
  const [phone, setPhone] = useState<string>('+91 98452 77102');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [savedToLeads, setSavedToLeads] = useState<boolean>(false);

  const activeSpace = customImage
    ? { title: 'User Uploaded Photo', image: customImage, defaultTds: tdsPpm, source: waterSource }
    : sampleSpaces[selectedSpaceIdx];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runDiagnostics = () => {
    setIsAnalyzing(true);
    setSavedToLeads(false);

    setTimeout(() => {
      let rating = 'Acceptable';
      let recommendation = '';
      let tag = '';
      let productMatch = '';
      let estPrice = '';
      let healthNotes = '';

      if (tdsPpm > 500) {
        rating = 'High Dissolved Solids (Hard Water)';
        recommendation = 'AquaPure Copper Max Pro RO+UV (High Hardness Solution)';
        tag = 'High TDS RO';
        productMatch = 'AquaPure Copper Max Pro RO+UV';
        estPrice = '₹16,499';
        healthNotes =
          'TDS above 500 PPM contains heavy minerals, calcium, and magnesium. Direct drinking without high-rejection RO membrane may cause kidney stress and hair fall.';
      } else if (tdsPpm > 250) {
        rating = 'Moderate Dissolved Solids';
        recommendation = 'AquaPure RO+UF Alkaline Balancing Purifier';
        tag = 'Alkaline RO';
        productMatch = 'AquaPure Copper Max Pro';
        estPrice = '₹14,999';
        healthNotes = 'Suitable for standard RO purification with mineral retention cartridge.';
      } else {
        rating = 'Low TDS Pure Inflow';
        recommendation = 'UltraViolet + Active Carbon (Gravity or Wall Mount)';
        tag = 'Low TDS UV+UF';
        productMatch = 'AquaPure Gravity UV+UF Safe';
        estPrice = '₹7,999';
        healthNotes =
          'TDS is below 250 PPM. High-pressure RO is NOT required as it strips vital natural minerals. UV sterilization + 0.01 micron UF is medically ideal.';
      }

      setDiagnosticResult({
        tds: tdsPpm,
        rating,
        recommendation,
        tag,
        productMatch,
        estPrice,
        healthNotes,
        spaceFit: 'Optimal Under-Sink or Wall Clearance Verified',
        powerReady: 'Requires standard 220V 16A earthing wall socket within 1.5m',
      });
      setIsAnalyzing(false);
    }, 600);
  };

  const handlePushToLeads = () => {
    if (!diagnosticResult) return;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      timestamp: 'Just now',
      customerName: customerName || 'Walk-in Customer',
      phone: phone || '+91 82962 64007',
      locality: locality || 'Tumakuru Urban',
      spaceImage: activeSpace.image,
      spaceTitle: activeSpace.title,
      waterSource: waterSource,
      tdsPpm: tdsPpm,
      membersCount: familyMembers,
      aiRecommendation: diagnosticResult.recommendation,
      aiTag: diagnosticResult.tag,
      status: 'new',
      notes: `AI Diagnosed TDS: ${tdsPpm} PPM. Recommended ${diagnosticResult.productMatch}.`,
      source: 'Snap & Suggest AI',
    };

    onAddLead(newLead);
    setSavedToLeads(true);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#dae2fd] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#006875]/10 flex items-center justify-center text-[#006875]">
            <span className="material-symbols-outlined text-[28px]">model_training</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-[22px] text-[#131b2e]">
                {isKannada ? 'ಸ್ನ್ಯಾಪ್ & ಸಲಹೆ AI ತಪಾಸಣಾ ಎಂಜಿನ್' : 'Snap & Suggest AI Diagnostics Engine'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#5ee9ff] text-[#004f58] text-[11px] font-bold">
                Smart Water Chemistry & Vision
              </span>
            </div>
            <p className="text-[13px] text-[#414753] mt-0.5">
              Analyze water sample photos, kitchen installation spaces, and TDS hardness to suggest optimal purifiers
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#dae2fd]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-bold text-[15px] text-[#131b2e]">
                1. Installation Space or Water Sample
              </span>
              <label className="text-[11px] font-semibold text-[#005cb3] bg-[#e2e7ff] hover:bg-[#dae2fd] px-2.5 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">upload_file</span>
                <span>Upload Custom</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-[#131b2e] border border-[#dae2fd] flex items-center justify-center">
              <img
                src={activeSpace.image}
                alt={activeSpace.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                <span className="text-[12px] font-bold">{activeSpace.title}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              {sampleSpaces.map((space, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedSpaceIdx(idx);
                    setCustomImage(null);
                    setTdsPpm(space.defaultTds);
                    setWaterSource(space.source);
                  }}
                  className={`h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedSpaceIdx === idx && !customImage
                      ? 'border-[#005cb3] scale-98 shadow-sm'
                      : 'border-[#dae2fd] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={space.image} alt={space.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#dae2fd]">
            <span className="font-heading font-bold text-[15px] text-[#131b2e] block mb-3">
              Customer Contact Details
            </span>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#414753] mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-[13px] border border-[#dae2fd] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#414753] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-[13px] font-mono border border-[#dae2fd] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#414753] mb-1">
                    Tumakuru Locality
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f2f3ff] rounded-xl text-[13px] border border-[#dae2fd] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="bg-white rounded-3xl p-5 lg:p-7 shadow-xs border border-[#dae2fd]">
            <span className="font-heading font-bold text-[16px] text-[#131b2e] block mb-4">
              2. Water Chemistry & Consumption Parameters
            </span>

            <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd] mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-[#131b2e]">
                  Water Total Dissolved Solids (TDS Reading)
                </span>
                <span className={`text-[18px] font-heading font-extrabold font-mono tabular-nums ${
                  tdsPpm > 500 ? 'text-[#ba1a1a]' : tdsPpm > 250 ? 'text-amber-600' : 'text-[#006c2e]'
                }`}>
                  {tdsPpm} PPM
                </span>
              </div>

              <input
                type="range"
                min="50"
                max="1800"
                step="10"
                value={tdsPpm}
                onChange={(e) => setTdsPpm(Number(e.target.value))}
                className="w-full accent-[#005cb3] h-2 bg-[#dae2fd] rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] font-semibold text-[#717784] mt-2">
                <span className="text-[#006c2e]">50 (Kaveri River / Municipal)</span>
                <span className="text-amber-600">300 (Standard Tanker)</span>
                <span className="text-[#ba1a1a]">1000+ (Tumakuru Deep Borewell)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[12px] font-semibold text-[#131b2e] mb-1.5">
                  Water Source Type
                </label>
                <select
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f2f3ff] rounded-xl text-[13px] border border-[#dae2fd] focus:outline-none"
                >
                  <option>Borewell (ಬೋರ್‌ವೆಲ್ ನೀರು - High TDS)</option>
                  <option>Kaveri Municipal Supply (ಕಾವೇರಿ - Low TDS)</option>
                  <option>Private Tanker Water (ಖಾಸಗಿ ಟ್ಯಾಂಕರ್)</option>
                  <option>Open Well / Sump Mix (ತೆರೆದ ಬಾವಿ)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#131b2e] mb-1.5">
                  Family Members Count
                </label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 6, '8+'].map((num: any) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFamilyMembers(num === '8+' ? 8 : num)}
                      className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition-all ${
                        (num === '8+' && familyMembers >= 8) || familyMembers === num
                          ? 'bg-[#005cb3] text-white shadow-xs'
                          : 'bg-[#f2f3ff] text-[#414753] hover:bg-[#e2e7ff]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={runDiagnostics}
              disabled={isAnalyzing}
              className="w-full py-3 bg-[#006875] hover:bg-[#004f58] text-white rounded-xl text-[14px] font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                  <span>Analyzing Water Chemistry & Space Fit...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                  <span>Run AI Water & Space Diagnostics</span>
                </>
              )}
            </button>
          </div>

          {diagnosticResult && (
            <div className="bg-white rounded-3xl p-5 lg:p-7 shadow-xs border border-[#dae2fd] animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#dae2fd] mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c2e] text-[24px]">verified</span>
                  <h3 className="font-heading font-bold text-[17px] text-[#131b2e]">
                    AI Diagnostic Analysis Result
                  </h3>
                </div>
                <span className="px-3 py-1 bg-[#6bff8f]/30 text-[#006c2e] text-[11px] font-bold rounded-full">
                  BIS 10500 Certified Rule
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd]">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#414753]">Water Quality Classification:</span>
                    <span className="text-[13px] font-bold text-[#ba1a1a]">{diagnosticResult.rating}</span>
                  </div>
                  <p className="text-[12px] text-[#414753] mt-2 leading-relaxed">
                    {diagnosticResult.healthNotes}
                  </p>
                </div>

                <div className="p-4 bg-[#e2e7ff] rounded-2xl border border-[#005cb3]/30">
                  <span className="text-[11px] font-bold text-[#005cb3] uppercase tracking-wider block mb-1">
                    Recommended Solution
                  </span>
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-heading font-bold text-[18px] text-[#131b2e]">
                      {diagnosticResult.productMatch}
                    </h4>
                    <span className="font-mono font-extrabold text-[18px] text-[#005cb3]">
                      {diagnosticResult.estPrice}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-[#414753] mt-2">
                    <span>✓ {diagnosticResult.spaceFit}</span>
                    <span>✓ {diagnosticResult.powerReady}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handlePushToLeads}
                    disabled={savedToLeads}
                    className="flex-1 py-2.5 bg-[#005cb3] hover:bg-[#0b74de] text-white rounded-xl text-[13px] font-semibold shadow-xs flex items-center justify-center gap-1.5 disabled:bg-[#006c2e]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {savedToLeads ? 'check_circle' : 'add_task'}
                    </span>
                    <span>{savedToLeads ? 'Saved to Leads Hub!' : 'Save Direct to Leads Hub'}</span>
                  </button>

                  <a
                    href={`https://wa.me/918296264007?text=${encodeURIComponent(`Aqua Puro Zone Diagnostic Quotation for ${customerName} (${locality}):\nWater: ${waterSource} (TDS ${tdsPpm} PPM)\nRecommended: ${diagnosticResult.productMatch} (${diagnosticResult.estPrice})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-[#006c2e] hover:bg-[#00883c] text-white rounded-xl text-[13px] font-semibold shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    <span>Share WhatsApp Quotation</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
