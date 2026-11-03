'use client';

import React, { useState, useRef } from 'react';
import { ReporterApplication } from '../types/news';
import { 
  X, Printer, Download, ShieldCheck, CheckCircle2, 
  MapPin, Phone, Mail, Award, FileText, QrCode, RefreshCw
} from 'lucide-react';

interface ReporterIdCardModalProps {
  reporter: ReporterApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReporterIdCardModal: React.FC<ReporterIdCardModalProps> = ({
  reporter,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pvc-card' | 'letterhead'>('pvc-card');
  const [cardOrientation, setCardOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !reporter) return null;

  const getSafePhotoUrl = (url?: any): string => {
    if (!url || typeof url !== 'string') return '/images/ddn_reporter_press.jpg';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('/images/')) {
      return trimmed;
    }
    if (trimmed.length > 50 && !trimmed.includes(' ')) {
      return `data:image/jpeg;base64,${trimmed}`;
    }
    return '/images/ddn_reporter_press.jpg';
  };

  const safePhoto = getSafePhotoUrl(reporter.photoUrl);
  const repId = String(reporter.id || 'DDN-REP-0001');
  const repName = String(reporter.fullName || 'अधिकृत संवाददाता');
  const pressId = `DDN-PRESS-${repId.replace('app-', '').toUpperCase().padStart(4, '0')}`;
  const verifyUrl = `https://ddnprimenews.com/verify-reporter?id=${encodeURIComponent(repId)}&name=${encodeURIComponent(repName)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verifyUrl)}&color=0b192c&bgcolor=ffffff&qzone=1`;

  const issueDate = reporter.appliedDate || new Date().toLocaleDateString('hi-IN');
  const validTillDate = '31 मार्च 2027';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvasModule = await import('html2canvas');
      const html2canvas: any = html2canvasModule.default || html2canvasModule;

      const element = document.getElementById(activeTab === 'pvc-card' ? 'pvc-card-render-area' : 'letterhead-render-area');
      if (!element) {
        alert('दस्तावेज रेंडरिंग एरिया नहीं मिला। कृपया पुनः प्रयास करें।');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      if (activeTab === 'pvc-card') {
        // Standard PVC CR80 size: 85.6mm x 53.98mm (or reversed if vertical)
        const isVert = cardOrientation === 'vertical';
        const pdf = new jsPDF({
          orientation: isVert ? 'portrait' : 'landscape',
          unit: 'mm',
          format: isVert ? [54, 86] : [86, 54],
        });
        const pdfWidth = isVert ? 54 : 86;
        const pdfHeight = isVert ? 86 : 54;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${reporter.fullName.replace(/\s+/g, '_')}_DDN_Press_ID_${cardSide}.pdf`);
      } else {
        // A4 Letterhead size: 210mm x 297mm
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save(`${reporter.fullName.replace(/\s+/g, '_')}_DDN_Appointment_Letter.pdf`);
      }
    } catch (err) {
      console.error('PDF export error:', err);
      // Fallback: trigger print dialog directly
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-100 rounded-2xl shadow-2xl max-w-4xl w-full my-auto flex flex-col overflow-hidden border border-stone-300 max-h-[96vh]">
        
        {/* Top Modal Controls Header */}
        <div className="bg-stone-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-yellow-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm sm:text-base font-headline leading-tight flex items-center gap-2">
                <span>प्रेस पहचान पत्र एवं अधिकृत नियुक्ति पत्र</span>
                <span className="text-[10px] font-mono bg-red-700 text-white px-2 py-0.5 rounded-full">
                  PVC CR80 Standard
                </span>
              </h3>
              <p className="text-[11px] text-stone-300">
                संवाददाता: <strong className="text-white">{reporter.fullName}</strong> | आईडी: <span className="font-mono text-yellow-300">{pressId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="inline-flex p-0.5 bg-stone-800 rounded-lg border border-stone-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('pvc-card')}
                className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'pvc-card' ? 'bg-red-700 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>PVC प्रेस आईडी कार्ड</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('letterhead')}
                className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'letterhead' ? 'bg-red-700 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>अधिकृत नियुक्ति पत्र (Letterhead)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-white px-4 sm:px-6 py-2.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {activeTab === 'pvc-card' ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-stone-500 font-semibold">कार्ड लेआउट:</span>
              <button
                type="button"
                onClick={() => setCardOrientation('vertical')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  cardOrientation === 'vertical' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                लंबवत (Vertical Lanyard)
              </button>
              <button
                type="button"
                onClick={() => setCardOrientation('horizontal')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  cardOrientation === 'horizontal' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                क्षैतिज (Horizontal Pocket)
              </button>

              <div className="h-4 w-px bg-stone-300 mx-1 hidden sm:block" />

              <span className="text-stone-500 font-semibold">पहलू (Side):</span>
              <button
                type="button"
                onClick={() => setCardSide('front')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  cardSide === 'front' ? 'bg-red-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                मुख पृष्ठ (Front)
              </button>
              <button
                type="button"
                onClick={() => setCardSide('back')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  cardSide === 'back' ? 'bg-red-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                पृष्ठ भाग (Back)
              </button>
            </div>
          ) : (
            <div className="text-stone-600 font-medium">
              A4 लीगल नियुक्ति एवं प्राधिकार पत्र (संपादकीय डेस्क मुहर व हस्ताक्षर सहित)
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg border border-stone-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-stone-700" />
              <span>प्रिंट करें (Print)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>PDF बन रहा है...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF डाउनलोड करें</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Document Content Viewport */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center items-start bg-stone-200/70" ref={printRef}>
          
          {/* ========================================================= */}
          {/* OPTION 1: PVC PRESS ID CARD (CR80 Standard Ratio)         */}
          {/* ========================================================= */}
          {activeTab === 'pvc-card' && (
            <div id="pvc-card-render-area" className="relative transition-all duration-200">
              {cardOrientation === 'vertical' ? (
                /* VERTICAL PVC CARD (Standard Lanyard Badge: 53.98mm x 85.6mm -> approx 340px x 540px) */
                <div className="w-[340px] h-[540px] bg-white rounded-2xl shadow-xl overflow-hidden relative border-2 border-stone-400 flex flex-col select-none text-stone-900">
                  
                  {/* Subtle Background Official Seal Watermark */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.06] bg-center bg-no-repeat bg-contain m-8"
                    style={{ backgroundImage: `url('/images/official_seal.png')` }}
                  />

                  {cardSide === 'front' ? (
                    /* VERTICAL FRONT */
                    <div className="relative flex flex-col h-full justify-between">
                      {/* Top Lanyard Slot / Header */}
                      <div>
                        {/* Lanyard punch hole preview indicator */}
                        <div className="w-full flex justify-center pt-2 pb-1">
                          <div className="w-10 h-2 bg-stone-300 rounded-full border border-stone-400/60" />
                        </div>

                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white px-3 py-2 text-center shadow-xs">
                          <div className="flex items-center justify-center gap-1.5 mb-0.5">
                            <img src="/images/official_seal.png" alt="DDN Seal" className="w-7 h-7 object-contain drop-shadow" />
                            <div className="text-left">
                              <h1 className="text-[13px] font-black tracking-wide leading-tight font-serif uppercase">
                                DDN PRIME NEWS
                              </h1>
                              <p className="text-[8px] font-bold text-yellow-300 tracking-wider">
                                दरभंगा डिजिटल नेटवर्क
                              </p>
                            </div>
                          </div>
                          <div className="text-[7.5px] text-red-100 border-t border-red-600/60 pt-0.5 mt-0.5 flex justify-between px-1 font-mono">
                            <span>REG: UDYAM-BR-09-0028491</span>
                            <span>प्रेस मान्यता</span>
                          </div>
                        </div>

                        {/* Gold PRESS Riband */}
                        <div className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 text-stone-900 text-center py-0.5 font-black text-[10px] tracking-widest uppercase shadow-2xs border-y border-yellow-600/40">
                          ★ PRESS / मीडिया पहचान पत्र ★
                        </div>
                      </div>

                      {/* Photo & Identity Section */}
                      <div className="px-4 py-2 flex flex-col items-center text-center">
                        {/* Candidate Photo */}
                        <div className="relative w-24 h-28 rounded-xl overflow-hidden border-2 border-red-700 shadow-md bg-stone-100 mb-2">
                          <img
                            src={safePhoto}
                            alt={repName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-red-800/90 text-white text-[7.5px] font-bold py-0.5 font-mono">
                            {pressId}
                          </div>
                        </div>

                        {/* Name & Title */}
                        <h2 className="text-base font-extrabold text-stone-950 leading-tight font-serif">
                          {reporter.fullName}
                        </h2>
                        <p className="text-[11px] font-bold text-red-800 mt-0.5">
                          {reporter.beatPreference ? `${reporter.beatPreference} संवाददाता` : 'अधिकृत जिला संवाददाता'}
                        </p>
                        <span className="text-[9px] bg-red-50 text-red-900 border border-red-200 font-semibold px-2 py-0.5 rounded-full mt-1">
                          कार्यक्षेत्र: {reporter.district} ({reporter.block})
                        </span>
                      </div>

                      {/* Details Strip */}
                      <div className="px-4 text-[10px] space-y-1 bg-stone-50/90 mx-3 p-2 rounded-lg border border-stone-200">
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-semibold">पिता का नाम:</span>
                          <span className="font-bold text-stone-900">{reporter.fatherName || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-semibold">मोबाइल:</span>
                          <span className="font-mono font-bold text-stone-900">{reporter.mobile}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-semibold">जारी तिथि:</span>
                          <span className="font-mono text-stone-800">{issueDate}</span>
                        </div>
                        <div className="flex justify-between text-emerald-800 font-bold">
                          <span>वैधता (Valid Till):</span>
                          <span className="font-mono">{validTillDate}</span>
                        </div>
                      </div>

                      {/* QR & Official Sign/Seal Footer */}
                      <div className="px-3 pb-3 pt-2">
                        <div className="flex items-center justify-between gap-2 border-t border-stone-200 pt-1.5">
                          {/* Real QR Code */}
                          <div className="flex flex-col items-center">
                            <img
                              src={qrCodeUrl}
                              alt="Scan to Verify"
                              className="w-14 h-14 rounded border border-stone-300 p-0.5 bg-white shadow-2xs"
                            />
                            <span className="text-[7px] text-stone-500 font-mono mt-0.5 font-bold">
                              स्कैन कर सत्यापित करें
                            </span>
                          </div>

                          {/* Official Seal and Signature */}
                          <div className="flex flex-col items-center relative">
                            {/* Official Seal Stamp */}
                            <img
                              src="/images/official_seal.png"
                              alt="DDN Official Seal"
                              className="w-12 h-12 object-contain absolute -top-4 opacity-75 pointer-events-none"
                            />
                            {/* Editor Rajesh Kumar Sahu Signature */}
                            <img
                              src="/images/editor_signature.png"
                              alt="Editor Rajesh Kumar Sahu Signature"
                              className="h-9 w-24 object-contain relative z-10 drop-shadow-xs"
                            />
                            <div className="text-center relative z-10">
                              <span className="block text-[8px] font-black text-stone-900 uppercase">
                                राजेश कुमार साहू
                              </span>
                              <span className="block text-[7px] font-bold text-red-800">
                                मुख्य संपादक (Chief Editor)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Disclaimer */}
                        <div className="text-[6.5px] text-center text-stone-500 border-t border-stone-200 mt-1 pt-0.5">
                          दरभंगा डिजिटल नेटवर्क | www.ddnprimenews.com | हेल्पलाइन: +91 9341050287
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* VERTICAL BACK */
                    <div className="relative flex flex-col h-full justify-between p-4 bg-white text-stone-900">
                      <div>
                        {/* Top punch hole */}
                        <div className="w-full flex justify-center pb-2">
                          <div className="w-10 h-2 bg-stone-300 rounded-full border border-stone-400/60" />
                        </div>

                        <div className="bg-red-800 text-white p-2 text-center rounded-lg mb-3">
                          <h4 className="text-xs font-bold font-serif">प्रेस मान्यता निर्देश एवं नियम</h4>
                          <p className="text-[8px] text-red-200">Darbhanga Digital Network Guidelines</p>
                        </div>

                        <div className="space-y-2 text-[9.5px] text-stone-700 leading-relaxed">
                          <p className="flex items-start gap-1">
                            <span className="text-red-700 font-bold">1.</span>
                            <span>यह पहचान पत्र <strong>दरभंगा डिजिटल नेटवर्क (DDN Prime News)</strong> की संपत्ति है।</span>
                          </p>
                          <p className="flex items-start gap-1">
                            <span className="text-red-700 font-bold">2.</span>
                            <span>कार्ड धारक को समाचार संकलन, प्रेस वार्ता एवं जनहित रिपोर्टिंग हेतु अधिकृत किया जाता है।</span>
                          </p>
                          <p className="flex items-start gap-1">
                            <span className="text-red-700 font-bold">3.</span>
                            <span>समस्त प्रशासनिक एवं पुलिस अधिकारियों से अपील है कि इन्हें विधि सम्मत पत्रकारिता में यथोचित सहयोग दें।</span>
                          </p>
                          <p className="flex items-start gap-1">
                            <span className="text-red-700 font-bold">4.</span>
                            <span>कार्ड खो जाने पर तुरंत नजदीकी थाने एवं डीडीएन प्राइम न्यूज कार्यालय को सूचित करें।</span>
                          </p>
                        </div>
                      </div>

                      {/* Address & Helpline */}
                      <div className="space-y-2 border-t border-stone-200 pt-2 text-[8.5px]">
                        <div className="bg-stone-50 p-2 rounded border border-stone-200 space-y-1">
                          <strong className="block text-stone-900 text-[9px] font-bold">
                            मुख्यालय एवं संपादकीय कार्यालय:
                          </strong>
                          <p className="text-stone-600">
                            दोनार रोड, रेलवे गुमती के समीप, दरभंगा, बिहार - 846004
                          </p>
                          <p className="text-stone-600">
                            <strong>ईमेल:</strong> ddnprimenews@gmail.com
                          </p>
                          <p className="text-stone-600 font-mono">
                            <strong>हेल्पलाइन:</strong> +91 9341050287 / 9431422780
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="text-[7.5px] text-stone-500 font-mono">
                            वेब पोर्टल: www.ddnprimenews.com
                          </div>
                          <div className="flex items-center gap-1 text-[8px] text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            सत्यापित पहचान पत्र
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* HORIZONTAL PVC CARD (Standard Pocket CR80: 85.6mm x 53.98mm -> approx 500px x 315px) */
                <div className="w-[500px] h-[315px] bg-white rounded-2xl shadow-xl overflow-hidden relative border-2 border-stone-400 flex flex-col select-none text-stone-900">
                  
                  {/* Subtle Background Watermark */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.06] bg-center bg-no-repeat bg-contain m-6"
                    style={{ backgroundImage: `url('/images/official_seal.png')` }}
                  />

                  {cardSide === 'front' ? (
                    <div className="relative flex flex-col h-full justify-between">
                      {/* Top Banner */}
                      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white px-4 py-2 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2">
                          <img src="/images/official_seal.png" alt="DDN Seal" className="w-8 h-8 object-contain drop-shadow" />
                          <div>
                            <h1 className="text-sm font-black font-serif tracking-wide leading-none uppercase">
                              DDN PRIME NEWS
                            </h1>
                            <p className="text-[9px] font-bold text-yellow-300 tracking-wider">
                              दरभंगा डिजिटल नेटवर्क
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-yellow-400 text-stone-900 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            PRESS / मीडिया
                          </div>
                          <div className="text-[7px] text-red-200 font-mono mt-0.5">
                            UDYAM-BR-09-0028491
                          </div>
                        </div>
                      </div>

                      {/* Middle Card Body */}
                      <div className="px-4 py-2 flex items-center gap-4 flex-1">
                        {/* Candidate Photo */}
                        <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-red-700 shadow-md bg-stone-100 shrink-0 relative">
                          <img
                            src={safePhoto}
                            alt={repName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-red-800/90 text-white text-[7px] font-bold py-0.5 text-center font-mono">
                            {pressId}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h2 className="text-base font-extrabold text-stone-950 font-serif leading-tight truncate">
                            {reporter.fullName}
                          </h2>
                          <p className="text-xs font-bold text-red-800">
                            {reporter.beatPreference ? `${reporter.beatPreference} संवाददाता` : 'अधिकृत प्रेस संवाददाता'}
                          </p>

                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px] pt-1">
                            <div>
                              <span className="text-stone-500 font-semibold">पिता:</span>{' '}
                              <strong className="text-stone-800">{reporter.fatherName || '—'}</strong>
                            </div>
                            <div>
                              <span className="text-stone-500 font-semibold">मोबाइल:</span>{' '}
                              <strong className="font-mono text-stone-800">{reporter.mobile}</strong>
                            </div>
                            <div>
                              <span className="text-stone-500 font-semibold">जिला / प्रखंड:</span>{' '}
                              <strong className="text-stone-800">{reporter.district} / {reporter.block}</strong>
                            </div>
                            <div>
                              <span className="text-stone-500 font-semibold">वैधता:</span>{' '}
                              <strong className="text-emerald-800 font-mono">{validTillDate}</strong>
                            </div>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="shrink-0 flex flex-col items-center">
                          <img
                            src={qrCodeUrl}
                            alt="Scan"
                            className="w-16 h-16 rounded border border-stone-300 p-0.5 bg-white shadow-2xs"
                          />
                          <span className="text-[6.5px] text-stone-500 font-mono mt-0.5">
                            स्कैन सत्यापन
                          </span>
                        </div>
                      </div>

                      {/* Bottom Footer with Signature */}
                      <div className="px-4 py-1.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[8px]">
                        <span className="text-stone-500">
                          हेल्पलाइन: +91 9341050287 | ddnprimenews@gmail.com
                        </span>

                        <div className="flex items-center gap-2 relative">
                          <img
                            src="/images/official_seal.png"
                            alt="Seal"
                            className="w-8 h-8 object-contain opacity-70"
                          />
                          <div className="flex flex-col items-center">
                            <img
                              src="/images/editor_signature.png"
                              alt="Signature"
                              className="h-6 w-20 object-contain drop-shadow-xs"
                            />
                            <span className="text-[7px] font-bold text-red-900 leading-none">
                              राजेश कुमार साहू (मुख्य संपादक)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* HORIZONTAL BACK */
                    <div className="relative flex flex-col h-full justify-between p-4 bg-white text-stone-900 text-[9.5px]">
                      <div className="bg-red-800 text-white p-1.5 text-center rounded">
                        <strong className="text-[11px] font-serif">दरभंगा डिजिटल नेटवर्क (DDN Prime News) — नियम व शर्तें</strong>
                      </div>
                      <div className="space-y-1.5 py-2 leading-relaxed text-stone-700">
                        <p>1. यह कार्ड केवल अधिकृत पत्रकारिता एवं समाचार संकलन कार्यों हेतु मान्य है।</p>
                        <p>2. प्रशासनिक एवं पुलिस महकमे से अपील है कि विधि सम्मत पत्रकारिता में यथोचित सहयोग प्रदान करें।</p>
                        <p>3. कार्ड गुम होने पर तुरंत संस्थान के हेल्पलाइन नंबर या ddnprimenews@gmail.com पर सूचित करें।</p>
                      </div>
                      <div className="border-t border-stone-200 pt-2 flex justify-between text-[8.5px] text-stone-600">
                        <div>
                          <strong>मुख्यालय:</strong> दोनार रोड, रेलवे गुमती के समीप, दरभंगा - 846004
                        </div>
                        <div className="font-mono text-emerald-800 font-bold">
                          www.ddnprimenews.com
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* OPTION 2: AUTHORIZATION LETTERHEAD (A4 Appointment Letter) */}
          {/* ========================================================= */}
          {activeTab === 'letterhead' && (
            <div
              id="letterhead-render-area"
              className="w-[680px] min-h-[960px] bg-white rounded-lg shadow-2xl p-8 relative flex flex-col justify-between text-stone-900 border border-stone-300 font-sans"
            >
              {/* Background Watermark */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.05] bg-center bg-no-repeat bg-contain m-16"
                style={{ backgroundImage: `url('/images/official_seal.png')` }}
              />

              {/* TOP HEADER */}
              <div className="relative border-b-2 border-red-800 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/official_seal.png"
                      alt="DDN Logo"
                      className="w-16 h-16 object-contain drop-shadow"
                    />
                    <div>
                      <h1 className="text-2xl font-black font-serif text-red-800 tracking-wide uppercase leading-tight">
                        DARBHANGA DIGITAL NETWORK
                      </h1>
                      <h2 className="text-base font-bold text-stone-900 leading-snug">
                        दरभंगा डिजिटल नेटवर्क (DDN Prime News)
                      </h2>
                      <p className="text-[10px] text-stone-600 font-medium">
                        भारत सरकार सूक्ष्म, लघु एवं मध्यम उद्यम पंजीकृत इकाई | MSME Reg: <strong>UDYAM-BR-09-0028491</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <img
                      src={qrCodeUrl}
                      alt="Verify QR"
                      className="w-16 h-16 rounded border border-stone-300 p-0.5 bg-white shadow-2xs ml-auto"
                    />
                    <span className="text-[8px] text-stone-500 font-mono block mt-0.5 font-bold">
                      स्कैन कर प्रमाणिकता जांचें
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-stone-500 border-t border-stone-200 mt-3 pt-1 font-mono">
                  <span>पत्रांक / Ref: <strong>DDN/ED/REP/{new Date().getFullYear()}/{pressId}</strong></span>
                  <span>दिनांक / Date: <strong>{issueDate}</strong></span>
                </div>
              </div>

              {/* LETTER TITLE */}
              <div className="relative text-center my-4">
                <span className="inline-block px-4 py-1 bg-red-800 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-2xs">
                  अधिकृत संवाददाता नियुक्ति एवं प्रेस प्राधिकार पत्र
                </span>
                <p className="text-[11px] text-stone-600 mt-1 font-semibold">
                  (Press Reporter Authorization & Appointment Letter)
                </p>
              </div>

              {/* CANDIDATE PARTICULARS */}
              <div className="relative bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div>
                      <span className="text-stone-500 font-semibold">संवाददाता का नाम:</span>{' '}
                      <strong className="text-sm text-stone-950 font-bold">{reporter.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 font-semibold">पिता का नाम:</span>{' '}
                      <strong className="text-stone-800">{reporter.fatherName || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 font-semibold">स्थायी पता / कार्यक्षेत्र:</span>{' '}
                      <strong className="text-stone-800">
                        प्रखंड: {reporter.block}, जिला: {reporter.district}, राज्य: {reporter.state || 'बिहार'}
                      </strong>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-0.5 text-[11px]">
                      <span><strong>मोबाइल:</strong> <span className="font-mono">{reporter.mobile}</span></span>
                      <span><strong>व्हाट्सएप:</strong> <span className="font-mono">{reporter.whatsapp || reporter.mobile}</span></span>
                      <span><strong>ईमेल:</strong> <span className="font-mono">{reporter.email || '—'}</span></span>
                    </div>
                  </div>

                  <div className="w-20 h-24 rounded-lg overflow-hidden border border-stone-300 shrink-0 bg-stone-100 shadow-xs">
                    <img
                      src={safePhoto}
                      alt={repName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* LEGAL APPOINTMENT BODY TEXT */}
              <div className="relative my-4 text-xs text-stone-800 leading-relaxed space-y-3 text-justify">
                <p>
                  <strong>विषय:</strong> दरभंगा डिजिटल नेटवर्क (DDN Prime News) के अंतर्गत <strong>{reporter.beatPreference || 'क्षेत्रीय पत्रकारिता'}</strong> बीट हेतु अधिकृत संवाददाता के रूप में नियुक्ति के संबंध में।
                </p>

                <p>
                  प्रमाणित किया जाता है कि श्री/सुश्री <strong>{reporter.fullName}</strong>, आत्मज श्री <strong>{reporter.fatherName}</strong>, निवासी जिला <strong>{reporter.district}</strong> (बिहार) को दरभंगा डिजिटल नेटवर्क (DDN Prime News - डिजिटल एवं वीडियो समाचार पोर्टल) के संपादकीय मंडल द्वारा <strong>{reporter.district}</strong> जिला अंतर्गत <strong>{reporter.block}</strong> क्षेत्र हेतु <strong>{reporter.beatPreference || 'विशेष'} संवाददाता</strong> के रूप में अधिकृत किया जाता है।
                </p>

                <p>
                  इन्हें अपने कार्यक्षेत्र में जनहित से जुड़े सामाजिक, प्रशासनिक, विकासात्मक, शैक्षिक एवं निष्पक्ष समाचारों के संकलन, साक्षात्कार, फोटोग्राफी एवं वीडियो रिपोर्टिंग का दायित्व सौंपा गया है। यह प्रेस काउंसिल ऑफ इंडिया की आचार संहिता एवं भारतीय संविधान के तहत प्रदत्त प्रेस स्वतंत्रता के अनुरूप पूर्णतः सत्यनिष्ठ पत्रकारिता हेतु उत्तरदायी हैं।
                </p>

                <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 text-[11px] text-amber-950">
                  <strong>प्रशासनिक एवं पुलिस सहयोग की अपील:</strong><br />
                  समस्त प्रशासनिक, पुलिस, न्यायिक अधिकारियों एवं जन-प्रतिनिधियों से सादर अनुरोध है कि स्वतंत्र एवं निष्पक्ष पत्रकारिता के निर्वहन हेतु इन्हें यथोचित मार्गदर्शन एवं प्रशासनिक सहयोग प्रदान करने की कृपा करें।
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono pt-1 text-stone-600">
                  <span>प्रेस आईडी संख्या: <strong className="text-red-800">{pressId}</strong></span>
                  <span>वैधता अवधि: <strong>{validTillDate}</strong> तक</span>
                </div>
              </div>

              {/* SIGNATURE & STAMP SECTION */}
              <div className="relative border-t border-stone-200 pt-4 flex items-end justify-between">
                <div className="text-[10px] text-stone-500 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>डिजिटल रूप से सत्यापित एवं अनुमोदित</span>
                  </div>
                  <p>यह पत्र संस्थान की आधिकारिक डिजिटल मुहर एवं हस्ताक्षर से जारी है।</p>
                </div>

                <div className="flex flex-col items-center relative">
                  {/* Official Seal Stamp */}
                  <img
                    src="/images/official_seal.png"
                    alt="DDN Seal"
                    className="w-20 h-20 object-contain absolute -top-8 right-6 opacity-80 pointer-events-none"
                  />
                  {/* Signature */}
                  <img
                    src="/images/editor_signature.png"
                    alt="Rajesh Kumar Sahu Signature"
                    className="h-12 w-36 object-contain relative z-10"
                  />
                  <div className="text-center relative z-10 mt-1">
                    <span className="block text-xs font-black text-stone-900 font-serif">
                      राजेश कुमार साहू
                    </span>
                    <span className="block text-[10px] font-bold text-red-800">
                      मुख्य संपादक (Chief Editor)
                    </span>
                    <span className="block text-[9px] text-stone-500 font-sans">
                      दरभंगा डिजिटल नेटवर्क (DDN Prime News)
                    </span>
                  </div>
                </div>
              </div>

              {/* DUAL ADDRESS EXTENDED FOOTER */}
              <div className="relative border-t-2 border-red-800 mt-6 pt-3 text-[9px] text-stone-600 space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border-r border-stone-200 pr-2">
                    <strong className="text-stone-900 block font-bold text-[10px]">
                      📍 मुख्यालय (Head Office):
                    </strong>
                    <p>
                      दरभंगा डिजिटल नेटवर्क, दोनार रोड, रेलवे गुमती के समीप, दरभंगा, बिहार - 846004
                    </p>
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-bold text-[10px]">
                      📍 क्षेत्रीय संपादकीय डेस्क (Regional Editorial Desk):
                    </strong>
                    <p>
                      डाकबंगला चौराहा / बोरिंग कैनाल रोड, पटना, बिहार - 800001
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center border-t border-stone-200 pt-1 text-[8.5px] font-mono text-stone-500">
                  <span>हेल्पलाइन: +91 9341050287, 9431422780</span>
                  <span>ईमेल: ddnprimenews@gmail.com</span>
                  <span>वेबसाइट: www.ddnprimenews.com</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
