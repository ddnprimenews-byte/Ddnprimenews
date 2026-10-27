'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Download, Printer, ZoomIn, ZoomOut, RotateCcw, 
  Calendar, ChevronLeft, ChevronRight, Newspaper, 
  Share2, Check, ExternalLink, Maximize2, Minimize2,
  FileText, Sparkles, BookOpen, MessageCircle, Info, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Article } from '../types/news';
import { INITIAL_ARTICLES } from '../data/newsData';

interface EPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles?: Article[];
  onSelectArticle?: (article: Article) => void;
}

export const EPaperModal: React.FC<EPaperModalProps> = ({ 
  isOpen, 
  onClose,
  articles = INITIAL_ARTICLES,
  onSelectArticle
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageNumber, setPageNumber] = useState(1);
  const [printAllPages, setPrintAllPages] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareToast, setShareToast] = useState('');
  
  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const totalPages = 8;

  // Keyboard navigation for page flip
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setPageNumber((p) => Math.min(p + 1, totalPages));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setPageNumber((p) => Math.max(p - 1, 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Page titles metadata
  const pageMeta = useMemo(() => [
    { num: 1, title: 'मुख्य पृष्ठ', tag: 'महा-सुर्खी एवं ब्रेकिंग न्यूज़' },
    { num: 2, title: 'मिथिलांचल व दरभंगा', tag: 'क्षेत्रीय विकास एवं प्रादेशिक' },
    { num: 3, title: 'बिहार राज्य विशेष', tag: 'शासन, नीति एवं विकास डायरी' },
    { num: 4, title: 'देश एवं राष्ट्रीय', tag: 'संसद, कानून व राष्ट्रीय हलचल' },
    { num: 5, title: 'संपादकीय व विचार', tag: 'निष्पक्ष विश्लेषण व दृष्टिकोण' },
    { num: 6, title: 'अपराध व न्याय', tag: 'कानून व्यवस्था एवं सुरक्षा अलर्ट' },
    { num: 7, title: 'खेल व युवा जगत', tag: 'क्रिकेट, एथलेटिक्स व युवा प्रतिभा' },
    { num: 8, title: 'मनोरंजन व स्वास्थ्य', tag: 'सिनेमा, लाइफस्टाइल व पंचांग' },
  ], []);

  // Filter articles by category for pages
  const newsDataset = articles && articles.length > 0 ? articles : INITIAL_ARTICLES;

  if (!isOpen) return null;

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 75));
  const handleZoomReset = () => setZoomLevel(100);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // ===================================================================
  // ENGINE: REAL 8-PAGE BROADSHEET PDF GENERATION (jsPDF + html2canvas)
  // ===================================================================
  const generatePdfBlob = async (mode: 'all' | 'single', targetPage?: number): Promise<{ blob: Blob; fileName: string }> => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a3', // Standard broadsheet newspaper proportion
      compress: true,
    });

    const pagesToRender = mode === 'all' ? [1, 2, 3, 4, 5, 6, 7, 8] : [targetPage || pageNumber];
    const fileName = mode === 'all' 
      ? 'DDN_Prime_News_8_Pages_EPaper.pdf' 
      : `DDN_Prime_News_Page_${pagesToRender[0]}.pdf`;

    for (let i = 0; i < pagesToRender.length; i++) {
      const pNum = pagesToRender[i];
      setPdfProgress(`पेज ${pNum} / ${pagesToRender.length} तैयार हो रहा है...`);

      const pageEl = document.getElementById(`newspaper-broadsheet-page-${pNum}`);
      if (pageEl) {
        const canvas = await html2canvas(pageEl, {
          scale: 1.6, // Sharp resolution for broadsheet newspaper
          useCORS: true,
          logging: false,
          backgroundColor: '#fcfbf7',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        if (i > 0) {
          pdf.addPage('a3', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    }

    const blob = pdf.output('blob');
    return { blob, fileName };
  };

  // 1. PDF DOWNLOAD: All 8 Pages
  const handleDownloadFullEditionPdf = async () => {
    setShowDownloadMenu(false);
    setIsGeneratingPdf(true);
    setPdfProgress('8-पृष्ठ संपूर्ण ई-पेपर पीडीएफ तैयार हो रहा है...');
    try {
      const { blob, fileName } = await generatePdfBlob('all');
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      setShareToast('8-पृष्ठ संपूर्ण ई-पेपर पीडीएफ सफलतापूर्वक डाउनलोड हो गया!');
    } catch (err: any) {
      console.error('PDF download error:', err);
      setShareToast('पीडीएफ डाउनलोड करने में त्रुटि, कृपया पुनः प्रयास करें।');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
      setTimeout(() => setShareToast(''), 5000);
    }
  };

  // 2. PDF DOWNLOAD: Current Page Only
  const handleDownloadCurrentPagePdf = async () => {
    setShowDownloadMenu(false);
    setIsGeneratingPdf(true);
    setPdfProgress(`पेज ${pageNumber} पीडीएफ तैयार हो रहा है...`);
    try {
      const { blob, fileName } = await generatePdfBlob('single', pageNumber);
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      setShareToast(`पेज ${pageNumber} पीडीएफ सफलतापूर्वक डाउनलोड हो गया!`);
    } catch (err: any) {
      console.error('Single page PDF download error:', err);
      setShareToast('पीडीएफ डाउनलोड करने में त्रुटि, कृपया पुनः प्रयास करें।');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
      setTimeout(() => setShareToast(''), 5000);
    }
  };

  // 3. WHATSAPP & WEB SHARE: With Actual PDF Document Attachment & Online Link
  const handleSharePdfToWhatsApp = async () => {
    setIsGeneratingPdf(true);
    setPdfProgress('व्हाट्सएप हेतु 8-पृष्ठ ई-पेपर पीडीएफ तैयार हो रहा है...');
    try {
      const { blob, fileName } = await generatePdfBlob('all');
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
      
      const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?view=epaper` : 'https://ddnprimenews.com';
      const shareText = `📰 *डीडीएन प्राइम न्यूज़ - दैनिक डिजिटल ई-पेपर (8 पृष्ठ संपूर्ण PDF)*\n\n📄 8 पृष्ठों का संपूर्ण ब्रॉडशीट ई-पेपर पीडीएफ संलग्न है।\n🌐 ऑनलाइन पढ़ने के लिए लिंक:\n${shareUrl}\n\n(दरभंगा डिजिटल नेटवर्क · MSME Reg: UDYAM-BR-09-0028491)`;

      // Check if navigator supports native file sharing (Mobile Android Chrome / WhatsApp)
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: 'डीडीएन प्राइम न्यूज़ - डिजिटल ई-पेपर (8 पृष्ठ संपूर्ण PDF)',
          text: shareText,
        });
        setShareToast('व्हाट्सएप पर ई-पेपर पीडीएफ सफलतापूर्वक भेजा गया!');
      } else {
        // Fallback for browsers without direct file-sharing API:
        // 1. Download the PDF file directly to device
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        // 2. Open WhatsApp with pre-filled message and link
        const waText = encodeURIComponent(
          `*डीडीएन प्राइम न्यूज़ - दैनिक डिजिटल ई-पेपर (8 पृष्ठ)*\n\n📄 8 पृष्ठों की ई-पेपर पीडीएफ आपके डिवाइस पर डाउनलोड हो गई है, कृपया उसे चैट में अटैच करें।\n\n🌐 ऑनलाइन ई-पेपर लिंक:\n${shareUrl}\n\n(दरभंगा डिजिटल नेटवर्क · MSME Reg: UDYAM-BR-09-0028491)`
        );
        window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
        setShareToast('पीडीएफ डाउनलोड हो गया है एवं व्हाट्सएप विंडो खुल गई है!');
      }
    } catch (err: any) {
      console.error('WhatsApp PDF share error:', err);
      setShareToast('पीडीएफ साझा करने में त्रुटि, कृपया पुनः प्रयास करें।');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
      setTimeout(() => setShareToast(''), 5000);
    }
  };

  // Standard Web Share Link Fallback
  const handleShareLink = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?view=epaper&page=${pageNumber}` : 'https://ddnprimenews.com';
    const shareTitle = `डीडीएन प्राइम न्यूज़ - डिजिटल ई-पेपर (पृष्ठ ${pageNumber}: ${pageMeta[pageNumber - 1]?.title})`;
    const shareText = `दैनिक डिजिटल ई-पेपर (8 पृष्ठों का संपूर्ण ब्रॉडशीट संस्करण) - दरभंगा डिजिटल नेटवर्क। आज ही ऑनलाइन पढ़ें:`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareText}\n${shareUrl}`,
          url: shareUrl,
        });
        return;
      } catch (err) {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`);
      setCopiedLink(true);
      setShareToast('ई-पेपर लिंक कॉपी हो गया है!');
      setTimeout(() => {
        setCopiedLink(false);
        setShareToast('');
      }, 4000);
    }
  };

  // 4. PRINT MODE: High-res print dialog
  const handlePrintCurrentPage = () => {
    setPrintAllPages(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePrintFullEdition = () => {
    setPrintAllPages(true);
    setTimeout(() => {
      window.print();
      setPrintAllPages(false);
    }, 150);
  };

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-0 sm:p-2 font-sans select-none print:p-0 print:bg-white print:fixed-none"
    >
      {/* Newspaper Broadsheet Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #newspaper-print-area, #newspaper-print-area * {
            visibility: visible;
          }
          #newspaper-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .broadsheet-page-wrapper {
            width: 100% !important;
            height: 100vh !important;
            max-height: 100vh !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            padding: 6mm !important;
            background: white !important;
            box-sizing: border-box !important;
          }
          @page {
            size: A3 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="bg-[#f2efe9] rounded-none sm:rounded-xl shadow-2xl w-full max-w-[1400px] h-full sm:h-[98vh] overflow-hidden border border-stone-400 flex flex-col print:border-none print:h-auto print:rounded-none">
        
        {/* ========================================================= */}
        {/* TOP CONTROL BAR (Hide on print)                           */}
        {/* ========================================================= */}
        <div className="bg-[#800000] text-white px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 no-print border-b-2 border-red-950 shadow-md">
          
          {/* Brand & Edition Info */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 text-[#800000] flex items-center justify-center font-black shadow-inner">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black font-serif tracking-tight text-white">
                  डीडीएन प्राइम न्यूज · ई-पेपर
                </h2>
                <span className="bg-amber-400 text-red-950 text-[10px] font-black px-1.5 py-0.5 rounded uppercase">
                  8 पृष्ठ ब्रॉडशीट PDF
                </span>
              </div>
              <p className="text-[11px] text-amber-200">
                मानक समाचार पत्र आकार · MSME: UDYAM-BR-09-0028491
              </p>
            </div>
          </div>

          {/* Center: Quick Page Navigator */}
          <div className="flex items-center gap-1 bg-[#5e0000] px-2 py-1 rounded-lg border border-red-900/60 text-xs">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
              className="p-1 hover:bg-red-800 rounded disabled:opacity-30 transition cursor-pointer text-white"
              title="पिछला पृष्ठ (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-amber-300 px-2 font-mono whitespace-nowrap">
              पृष्ठ {pageNumber} / {totalPages}
            </span>
            <button
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber((p) => Math.min(p + 1, totalPages))}
              className="p-1 hover:bg-red-800 rounded disabled:opacity-30 transition cursor-pointer text-white"
              title="अगला पृष्ठ (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Tools: 3 Modes (WhatsApp PDF Share, PDF Download, Print) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* 1. WHATSAPP PDF SHARE (Direct PDF file + Link in WhatsApp) */}
            <button
              onClick={handleSharePdfToWhatsApp}
              disabled={isGeneratingPdf}
              className="px-2.5 sm:px-3 py-1.5 bg-[#25D366] hover:bg-[#1faa50] text-white rounded text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
              title="व्हाट्सएप पर 8-पृष्ठ ई-पेपर पीडीएफ भेजें"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp पर PDF भेजें</span>
            </button>

            {/* 2. PDF DOWNLOAD DROPDOWN (Full 8 Pages or Single Page) */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                disabled={isGeneratingPdf}
                className="px-2.5 sm:px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-red-950 rounded text-xs font-black transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-60"
                title="पीडीएफ डाउनलोड विकल्प"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF डाउनलोड</span>
              </button>

              {showDownloadMenu && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white text-stone-900 rounded-lg shadow-2xl border border-stone-300 py-1.5 z-50 animate-in fade-in text-xs font-semibold">
                  <button
                    onClick={handleDownloadFullEditionPdf}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 hover:text-red-800 flex items-center gap-2 cursor-pointer border-b border-stone-100"
                  >
                    <Newspaper className="w-4 h-4 text-red-700" />
                    <div>
                      <div className="font-bold">संपूर्ण 8 पृष्ठ डाउनलोड करें</div>
                      <div className="text-[10px] text-stone-500 font-normal">पूरा 8-पेज ब्रॉडशीट PDF एडिशन</div>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadCurrentPagePdf}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 hover:text-red-800 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-stone-600" />
                    <div>
                      <div className="font-bold">केवल पृष्ठ {pageNumber} डाउनलोड करें</div>
                      <div className="text-[10px] text-stone-500 font-normal">{pageMeta[pageNumber - 1]?.title}</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 3. PRINT MODE */}
            <button
              onClick={handlePrintFullEdition}
              className="px-2.5 py-1.5 bg-red-900 hover:bg-red-950 text-white rounded text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer border border-red-800 hidden md:inline-flex"
              title="8 पृष्ठ प्रिंट करें"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>प्रिंट</span>
            </button>

            {/* General Share Link */}
            <button
              onClick={handleShareLink}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded transition cursor-pointer"
              title="ई-पेपर लिंक शेयर करें"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex p-1.5 bg-red-900 hover:bg-red-800 rounded text-stone-200 transition cursor-pointer"
              title={isFullscreen ? 'फुलस्क्रीन बंद करें' : 'फुलस्क्रीन देखें'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 bg-red-950 hover:bg-black rounded text-stone-200 hover:text-white transition cursor-pointer ml-1"
              title="ई-पेपर बंद करें (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECONDARY TOOLBAR: Page Jump Bar & Zoom Controls           */}
        {/* ========================================================= */}
        <div className="bg-white border-b border-stone-300 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs text-stone-700 shrink-0 no-print gap-2 shadow-xs">
          
          {/* Quick Page Jump Pills (All 8 Pages) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="font-bold text-stone-500 mr-1 text-[11px] hidden sm:inline">पृष्ठ:</span>
            {pageMeta.map((p) => (
              <button
                key={p.num}
                onClick={() => setPageNumber(p.num)}
                className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                  pageNumber === p.num
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
                title={p.tag}
              >
                <span>{p.num}</span>
                <span className="hidden md:inline font-medium text-[11px]">
                  {p.title}
                </span>
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1.5 bg-stone-100 px-2 py-1 rounded border border-stone-200 text-xs shrink-0">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-stone-200 rounded text-stone-600 transition cursor-pointer"
              title="ज़ूम आउट (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs tabular-nums w-10 text-center font-bold text-stone-800">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-stone-200 rounded text-stone-600 transition cursor-pointer"
              title="ज़ूम इन (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1 hover:bg-stone-200 rounded text-stone-600 transition cursor-pointer text-[11px] font-bold"
              title="रीसेट 100%"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* PDF Generation Progress Bar */}
        {isGeneratingPdf && (
          <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-black flex items-center justify-center gap-2 shrink-0 animate-pulse no-print shadow-inner">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{pdfProgress || 'ई-पेपर उच्च-गुणवत्ता ब्रॉडशीट PDF तैयार हो रहा है, कृपया प्रतीक्षा करें...'}</span>
          </div>
        )}

        {/* Share Feedback Toast */}
        {shareToast && !isGeneratingPdf && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center font-bold animate-in fade-in slide-in-from-top-1 no-print">
            {shareToast}
          </div>
        )}

        {/* ========================================================= */}
        {/* BROADSHEET CANVAS VIEWPORT                                */}
        {/* ========================================================= */}
        <div 
          id="newspaper-viewport" 
          className="flex-grow overflow-auto p-2 sm:p-6 flex items-start justify-center bg-stone-300/80 transition-all print:p-0 print:bg-white print:overflow-visible"
        >
          {/* Main Printable / Renderable Container */}
          <div 
            id="newspaper-print-area"
            style={{ 
              width: `${zoomLevel}%`, 
              maxWidth: zoomLevel > 100 ? `${1050 * (zoomLevel / 100)}px` : '1050px',
              minWidth: '320px' 
            }}
            className="transition-all duration-150 shadow-2xl bg-[#fdfbf7] text-stone-900 border border-stone-400 print:shadow-none print:border-none print:w-full print:max-w-none print:bg-white"
          >
            {/* If user selected "Print All Pages", render all 8 pages sequentially */}
            {printAllPages ? (
              <div>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <div key={num} className="broadsheet-page-wrapper">
                    {renderPageContent(num, newsDataset, onSelectArticle)}
                  </div>
                ))}
              </div>
            ) : (
              /* Single active page view on screen, while retaining full HTML node for instant PDF extraction */
              <div className="broadsheet-page-wrapper">
                {renderPageContent(pageNumber, newsDataset, onSelectArticle)}
              </div>
            )}
          </div>

          {/* Hidden off-screen container holding all 8 pages so html2canvas can capture ANY or ALL 8 pages on-demand without glitching! */}
          <div className="hidden" aria-hidden="true">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div 
                key={`offscreen-${num}`}
                id={`newspaper-broadsheet-page-${num}`}
                style={{ width: '1050px', minHeight: '1485px', maxHeight: '1485px', overflow: 'hidden' }}
                className="bg-[#fcfbf7] text-stone-900 p-8 font-serif"
              >
                {renderPageContent(num, newsDataset, onSelectArticle)}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM FOLIO & SHORTCUTS (No print)                       */}
        {/* ========================================================= */}
        <div className="bg-white border-t border-stone-300 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs text-stone-600 shrink-0 no-print gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-800 font-serif">
              डीडीएन प्राइम न्यूज़ डिजिटल ई-पेपर (8 पृष्ठ संपूर्ण संस्करण)
            </span>
            <span className="text-stone-400">|</span>
            <span className="hidden sm:inline">
              पेज पलटने हेतु <strong>Left / Right Arrow</strong> दबाएं
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
              मानक ब्रॉडशीट आकार (A3 Broadsheet)
            </span>
            <button
              onClick={handleSharePdfToWhatsApp}
              className="text-[#1faa50] font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp PDF</span>
            </button>
            <button
              onClick={handleDownloadFullEditionPdf}
              className="text-red-700 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Download className="w-3 h-3" />
              <span>8-पेज PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ===================================================================
// DYNAMIC 8-PAGE NEWSPAPER GENERATOR (Broadsheet Scale & Proportions)
// ===================================================================
function renderPageContent(
  pageNum: number, 
  articles: Article[], 
  onSelectArticle?: (a: Article) => void
) {
  const currentDateStr = "मंगलवार, 27 अक्टूबर 2026";
  const editionInfo = "वर्ष 4 · अंक 295 · दरभंगा/पटना · 8 पृष्ठ · डिजिटल संस्करण नि:शुल्क";
  const msmeReg = "भारत सरकार MSME पंजीकृत: UDYAM-BR-09-0028491";

  // Article selection helpers
  const leadArticle = articles.find(a => a.isLead) || articles[0];
  const otherArticles = articles.filter(a => a.id !== leadArticle?.id);

  switch (pageNum) {
    // ---------------------------------------------------------------
    // पृष्ठ 1: मुख्य पृष्ठ (Front Page / Lead Broadsheet)
    // ---------------------------------------------------------------
    case 1: {
      const secondLead = otherArticles[0] || articles[1] || leadArticle;
      const briefs = otherArticles.slice(1, 5);

      return (
        <div className="space-y-4 font-serif">
          {/* Top Super Strip: Weather & Panchang */}
          <div className="border-b border-black pb-1 flex flex-wrap items-center justify-between text-xs font-sans text-stone-700">
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-800">मौसम:</span>
              <span>दरभंगा 28°C · पटना 29°C · मुजफ्फरपुर 28°C · भागलपुर 30°C</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-800">पंचांग:</span>
              <span>कार्तिक मास, कृष्ण पक्ष, द्वितीया तिथि · अमृत काल: प्रातः 08:45 से 10:15</span>
            </div>
            <div className="font-mono text-red-950 font-bold text-xs">
              {msmeReg}
            </div>
          </div>

          {/* Authentic Newspaper Masthead */}
          <div className="border-b-4 border-double border-black pb-3 pt-1 text-center">
            <div className="flex items-center justify-between mb-1 text-xs font-sans text-stone-600">
              <span className="uppercase tracking-widest font-semibold">
                उत्तर बिहार का अग्रणी डिजिटल समाचार पत्र
              </span>
              <span className="font-bold text-red-800 uppercase tracking-wider bg-red-100 px-2 py-0.5 rounded">
                दैनिक ब्रॉडशीट संस्करण
              </span>
              <span>
                www.ddnprimenews.com
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-red-950 leading-none py-1">
              डीडीएन प्राइम न्यूज़
            </h1>
            <p className="text-sm sm:text-base font-bold text-black tracking-widest mt-1">
              सच्ची निर्भीक और निष्पक्ष पत्रकारिता · दरभंगा डिजिटल नेटवर्क
            </p>

            <div className="mt-2 pt-1 border-t border-black flex flex-wrap items-center justify-between text-xs font-sans font-semibold text-stone-800 px-2">
              <span>दरभंगा · पटना · दिल्ली</span>
              <span>{currentDateStr}</span>
              <span>{editionInfo}</span>
            </div>
          </div>

          {/* Front Page Grid Layout: 3 Columns */}
          <div className="grid grid-cols-12 gap-5 pt-1">
            
            {/* Column 1: Front Page Lead Story (7 cols) */}
            <div className="col-span-12 md:col-span-7 space-y-3 md:border-r md:border-stone-400 md:pr-4">
              <div className="border-b-2 border-red-800 pb-1.5">
                <span className="text-xs font-sans font-black bg-red-700 text-white px-2 py-0.5 uppercase tracking-wider">
                  प्रथम पृष्ठ महा-सुर्खी
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-950 leading-tight mt-1 hover:text-red-800 transition">
                  {leadArticle.title}
                </h2>
                {leadArticle.subtitle && (
                  <p className="text-sm font-bold text-stone-700 mt-1 italic">
                    {leadArticle.subtitle}
                  </p>
                )}
              </div>

              {/* Lead Image & Caption */}
              {leadArticle.imageUrl && (
                <div className="relative border border-stone-400 bg-stone-100">
                  <img
                    src={leadArticle.imageUrl}
                    alt={leadArticle.title}
                    className="w-full h-64 sm:h-72 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/ddn_hero_news.jpg';
                    }}
                  />
                  {leadArticle.imageCaption && (
                    <p className="p-1.5 text-xs text-stone-700 font-sans italic bg-stone-50 border-t border-stone-200">
                      {leadArticle.imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Byline & Lead Content (Newspaper 2-column flow) */}
              <div className="text-xs font-sans text-stone-800 space-y-2 leading-relaxed text-justify">
                <div className="font-bold text-red-900 border-b border-stone-200 pb-1 flex justify-between text-xs">
                  <span>ब्यूरो रिपोर्ट: {leadArticle.author} ({leadArticle.authorRole})</span>
                  <span>{leadArticle.location}</span>
                </div>
                <p className="font-semibold text-stone-900 text-sm">
                  {leadArticle.summary}
                </p>
                {leadArticle.content?.slice(0, 2).map((para, idx) => (
                  <p key={idx} className="indent-4 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Column 2: Second Lead & Briefs (5 cols) */}
            <div className="col-span-12 md:col-span-5 space-y-4">
              {/* Second Lead Story */}
              <div className="border-b-2 border-stone-400 pb-3">
                <span className="text-xs font-sans font-black bg-stone-800 text-white px-2 py-0.5 uppercase">
                  प्रादेशिक हलचल
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-stone-950 mt-1 leading-snug">
                  {secondLead.title}
                </h3>
                <p className="text-xs text-stone-700 mt-1.5 font-sans leading-relaxed">
                  {secondLead.summary}
                </p>
                <div className="text-xs font-sans text-red-800 font-bold mt-1">
                  — {secondLead.location} संवाददाता
                </div>
              </div>

              {/* Today's Briefs Box (एक नज़र में 4 बड़ी खबरें) */}
              <div className="bg-stone-100 p-3.5 rounded border border-stone-300">
                <h4 className="text-xs font-black font-sans uppercase tracking-wider text-red-900 border-b border-red-800 pb-1 mb-2">
                  आज की 4 बड़ी सुर्खियां (संक्षेप में)
                </h4>
                <div className="space-y-3">
                  {briefs.map((b, idx) => (
                    <div key={b.id || idx} className="border-b border-stone-200 pb-2 last:border-none last:pb-0">
                      <span className="text-xs font-sans font-bold text-red-700 mr-1.5">
                        [{idx + 1}]
                      </span>
                      <span className="text-xs font-bold text-stone-900 hover:text-red-800 transition">
                        {b.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Front Page Official Box */}
              <div className="border-2 border-red-800 p-3 bg-red-50 text-center text-xs font-sans">
                <p className="font-bold text-red-950 text-sm">
                  डीडीएन प्राइम रिपोर्टर भर्ती अभियान 2026
                </p>
                <p className="text-xs text-stone-700 mt-1">
                  अपने प्रखंड और पंचायत से निष्पक्ष रिपोर्टिंग हेतु ऑनलाइन आवेदन करें: www.ddnprimenews.com/reporter
                </p>
              </div>
            </div>

          </div>

          {/* Front Page Footer Folio */}
          <div className="border-t-2 border-black pt-2 text-center text-xs font-sans text-stone-600 flex justify-between">
            <span>डीडीएन प्राइम न्यूज़ डिजिटल नेटवर्क</span>
            <span>पृष्ठ 1 (मुख्य पृष्ठ)</span>
            <span>शेष खबरें पृष्ठ 2 और 3 पर पढ़ें</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 2: मिथिलांचल व दरभंगा प्रादेशिक (Mithila & Darbhanga Regional)
    // ---------------------------------------------------------------
    case 2: {
      const regionalItems = articles.filter(a => a.location.includes('दरभंगा') || a.location.includes('मधुबनी') || a.location.includes('समस्तीपुर') || a.category === 'bihar');
      const p2Lead = regionalItems[0] || articles[0];
      const p2Other = regionalItems.slice(1, 5);

      return (
        <div className="space-y-4 font-serif">
          {/* Running Page Folio */}
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · मिथिलांचल व दरभंगा प्रादेशिक</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 2</span>
          </div>

          <div className="text-center py-1 border-b border-stone-300">
            <h2 className="text-2xl font-black text-stone-950 uppercase tracking-wide">
              मिथिलांचल विकास, संस्कृति एवं प्रादेशिक दर्पण
            </h2>
            <p className="text-xs text-stone-600 font-sans">
              दरभंगा, मधुबनी, समस्तीपुर एवं सीतामढ़ी की जनसमस्याएं और जमीनी रिपोर्ट
            </p>
          </div>

          {/* Regional Lead Story */}
          <div className="grid grid-cols-12 gap-5 pt-1">
            <div className="col-span-12 md:col-span-8 space-y-3 md:border-r md:border-stone-400 md:pr-4">
              <h3 className="text-2xl sm:text-3xl font-black text-red-950 leading-tight">
                {p2Lead.title}
              </h3>
              {p2Lead.imageUrl && (
                <img
                  src={p2Lead.imageUrl}
                  alt={p2Lead.title}
                  className="w-full h-64 object-cover border border-stone-300"
                />
              )}
              <p className="text-xs font-sans text-stone-800 leading-relaxed font-semibold">
                {p2Lead.summary}
              </p>
              <p className="text-xs font-sans text-stone-700 leading-relaxed">
                {p2Lead.content?.[0] || 'मिथिलांचल में विकास की नई गति देखने को मिल रही है। दरभंगा एम्स शोभन बाईपास पर बुनियादी ढांचे का निर्माण कार्य युद्धस्तर पर जारी है।'}
              </p>
              <p className="text-xs font-sans text-stone-700 leading-relaxed">
                {p2Lead.content?.[1] || 'दरभंगा एयरपोर्ट से विभिन्न महानगरों के लिए नई उड़ानों की शुरुआत से मिथिलांचल के प्रवासियों को आवागमन में भारी सुविधा मिल रही है।'}
              </p>
            </div>

            {/* Mithila Highlights Sidebar */}
            <div className="col-span-12 md:col-span-4 space-y-3">
              <div className="bg-amber-50 p-3.5 rounded border border-amber-300">
                <h4 className="text-xs font-black font-sans text-amber-950 uppercase border-b border-amber-300 pb-1 mb-2">
                  मिथिला विशेष स्तंभ: मखाना एवं कला
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  मिथिला के मखाना और मधुबनी पेंटिंग को वैश्विक स्तर पर बढ़ावा देने के लिए नए प्रोत्साहन पैकेज की घोषणा की गई है। किसानों को सीधा निर्यात लाभ मिलेगा।
                </p>
              </div>

              {p2Other.map((art, i) => (
                <div key={art.id || i} className="border-b border-stone-200 pb-2">
                  <h4 className="text-xs font-bold text-stone-950 leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-xs font-sans text-stone-600 mt-1 line-clamp-2">
                    {art.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Page Footer Folio */}
          <div className="border-t border-black pt-2 text-center text-xs font-sans text-stone-600 flex justify-between">
            <span>डीडीएन प्राइम न्यूज़ · दरभंगा मुख्य संस्करण</span>
            <span>पृष्ठ 2</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 3: बिहार राज्य विशेष (Bihar State Special)
    // ---------------------------------------------------------------
    case 3: {
      const stateNews = articles.filter(a => a.category === 'bihar');
      const p3Lead = stateNews[0] || articles[1] || articles[0];
      const p3List = stateNews.slice(1, 5);

      return (
        <div className="space-y-4 font-serif">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · बिहार राज्य विशेष</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 3</span>
          </div>

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-8 space-y-3 md:border-r md:border-stone-300 md:pr-4">
              <span className="text-xs font-sans font-bold bg-stone-900 text-white px-2 py-0.5 uppercase">
                सचिवालय एवं कैबिनेट निर्णय
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-950 leading-tight">
                {p3Lead.title}
              </h2>
              <p className="text-xs font-sans font-semibold text-stone-800">
                {p3Lead.summary}
              </p>
              {p3Lead.content?.map((c, idx) => (
                <p key={idx} className="text-xs font-sans text-stone-700 leading-relaxed">
                  {c}
                </p>
              ))}
            </div>

            <div className="col-span-12 md:col-span-4 space-y-3">
              <div className="bg-stone-100 p-3.5 rounded border border-stone-300">
                <h4 className="text-xs font-black font-sans uppercase text-red-900 border-b border-red-800 pb-1 mb-2">
                  बिहार विकास डायरी
                </h4>
                <div className="space-y-2.5 text-xs font-sans">
                  <p>• <strong>सड़क निर्माण:</strong> ग्रामीण पथ योजना अंतर्गत 1200 किमी नई सड़कों की स्वीकृति।</p>
                  <p>• <strong>शिक्षा सुधार:</strong> राज्य के उच्च विद्यालयों में आधुनिक स्मार्ट लैब्स का विस्तार।</p>
                  <p>• <strong>कृषि सिंचाई:</strong> हर खेत तक पानी पहुंचाने हेतु नए नलकूप अधिष्ठापन की गति तेज।</p>
                </div>
              </div>

              {p3List.map((item, idx) => (
                <div key={item.id || idx} className="border-b border-stone-200 pb-2">
                  <h4 className="text-xs font-bold text-stone-900 leading-snug">{item.title}</h4>
                  <p className="text-xs font-sans text-stone-600 mt-1 line-clamp-2">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-black pt-2 text-center text-xs font-sans text-stone-600 flex justify-between">
            <span>डीडीएन प्राइम न्यूज़ · बिहार संस्करण</span>
            <span>पृष्ठ 3</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 4: देश एवं राष्ट्रीय परिदृश्य (National Affairs)
    // ---------------------------------------------------------------
    case 4: {
      const nationalNews = articles.filter(a => a.category === 'national' || a.category === 'politics');
      const p4Lead = nationalNews[0] || articles[0];

      return (
        <div className="space-y-4 font-serif">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · देश एवं राष्ट्रीय परिदृश्य</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 4</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 leading-tight">
              {p4Lead.title}
            </h2>
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-8 space-y-2 text-xs font-sans text-stone-800 leading-relaxed">
                <p className="font-semibold text-sm">{p4Lead.summary}</p>
                {p4Lead.content?.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
              <div className="col-span-12 md:col-span-4 bg-stone-100 p-3.5 rounded border border-stone-300 text-xs font-sans space-y-2.5">
                <h4 className="font-black text-red-900 uppercase border-b border-red-800 pb-1">
                  राष्ट्रीय मुख्य बिंदु
                </h4>
                <p>• संसद के आगामी सत्र को लेकर सर्वदलीय बैठक की रूपरेखा तैयार।</p>
                <p>• उच्चतम न्यायालय का महत्वपूर्ण फैसला: डिजिटल निजता व जनसुरक्षा पर कड़े निर्देश।</p>
                <p>• भारतीय अर्थव्यवस्था में निरंतर सुधार, विदेशी प्रत्यक्ष निवेश में अभूतपूर्व वृद्धि।</p>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-2 text-center text-xs font-sans text-stone-600 flex justify-between">
            <span>डीडीएन प्राइम न्यूज़ · राष्ट्रीय संस्करण</span>
            <span>पृष्ठ 4</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 5: संपादकीय एवं विचार मंथन (Editorial & Op-Ed)
    // ---------------------------------------------------------------
    case 5: {
      return (
        <div className="space-y-4 font-serif">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · संपादकीय एवं विचार मंथन</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 5</span>
          </div>

          <div className="grid grid-cols-12 gap-6 pt-1">
            {/* Main Editorial Column (7 cols) */}
            <div className="col-span-12 md:col-span-7 space-y-3 md:border-r md:border-stone-400 md:pr-4">
              <div className="border-b border-stone-300 pb-1">
                <span className="text-xs font-sans font-bold text-red-800 uppercase">संपादकीय स्तंभ</span>
                <h3 className="text-2xl font-black text-stone-950 mt-1">
                  स्वतंत्र व निर्भीक पत्रकारिता: लोकतंत्र की अंतिम ढाल
                </h3>
                <p className="text-xs font-sans text-stone-500 mt-0.5">
                  मुख्य संपादक: अमरनाथ पाठक
                </p>
              </div>
              <div className="text-xs font-sans text-stone-800 space-y-2.5 leading-relaxed text-justify">
                <p>
                  लोकतंत्र के चौथे स्तंभ के रूप में मीडिया की विश्वसनीयता तभी सुरक्षित रह सकती है जब वह बिना किसी पूर्वाग्रह, राजनीतिक दबाव या व्यावसायिक लाभ के केवल जनसरोकारों को प्राथमिकता दे। आज डिजिटल क्रांति के इस दौर में सूचनाओं की बाढ़ है, लेकिन प्रमाणिकता और सत्यनिष्ठा की चुनौती सबसे बड़ी है।
                </p>
                <p>
                  डीडीएन प्राइम न्यूज़ की स्थापना इसी संकल्प के साथ की गई है कि हम सत्ता और प्रशासन के सामने आम जनता की निर्भीक आवाज बनेंगे। चाहे वह दरभंगा एम्स का निर्माण हो, बाढ़ प्रभावित ग्रामीण इलाकों का दर्द हो या नौजवानों के रोजगार का सवाल—सच्चाई को उजागर करना ही हमारा एकमात्र धर्म है।
                </p>
                <p>
                  जब तक पत्रकारिता में सत्य और साहस जीवित है, तब तक समाज का कोई भी वर्ग अपने अधिकारों से वंचित नहीं रह सकता।
                </p>
              </div>
            </div>

            {/* Op-Ed & Letters (5 cols) */}
            <div className="col-span-12 md:col-span-5 space-y-4">
              <div className="bg-stone-100 p-3.5 rounded border border-stone-300">
                <h4 className="text-xs font-black font-sans uppercase text-red-900 border-b border-red-800 pb-1 mb-2">
                  आज का प्रेरक सुविचार (Quote)
                </h4>
                <blockquote className="text-xs italic text-stone-800 border-l-2 border-red-700 pl-2">
                  "सत्य की राह कठिन हो सकती है, लेकिन उसकी विजय सदैव शाश्वत और अकाट्य होती है।"
                </blockquote>
              </div>

              <div className="border border-stone-300 p-3.5 bg-white">
                <h4 className="text-xs font-black font-sans uppercase text-stone-900 border-b border-stone-200 pb-1 mb-2">
                  पाठकों के पत्र (Letters to Editor)
                </h4>
                <div className="space-y-2.5 text-xs font-sans text-stone-700">
                  <p><strong>• स्वास्थ्य सुविधाओं की सुलभता:</strong> ग्रामीण अस्पतालों में डॉक्टरों की नियमित उपस्थिति सुनिश्चित की जाए। — <em>रमेश कुमार, लहेरियासराय</em></p>
                  <p><strong>• युवाओं के लिए खेल मैदान:</strong> प्रखंड स्तर पर खेल प्रतिभाओं के लिए पर्याप्त सुविधाएं उपलब्ध हों। — <em>सुनील झा, बेनीपुर</em></p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-2 text-center text-xs font-sans text-stone-600 flex justify-between">
            <span>डीडीएन प्राइम न्यूज़ · विचार मंच</span>
            <span>पृष्ठ 5</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 6: अपराध, कानून व्यवस्था एवं न्याय (Crime & Justice)
    // ---------------------------------------------------------------
    case 6: {
      const crimeItems = articles.filter(a => a.category === 'crime');
      const p6Lead = crimeItems[0] || articles[2] || articles[0];

      return (
        <div className="space-y-4 font-serif">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · अपराध, पुलिस प्रशासन एवं न्याय</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 6</span>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-sans font-bold bg-red-800 text-white px-2 py-0.5 uppercase">
              विशेष अपराध समीक्षा
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 leading-tight">
              {p6Lead.title}
            </h2>
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-8 text-xs font-sans text-stone-800 space-y-2">
                <p className="font-semibold text-sm">{p6Lead.summary}</p>
                {p6Lead.content?.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
              <div className="col-span-12 md:col-span-4 bg-red-50 p-3.5 rounded border border-red-200 text-xs font-sans space-y-2">
                <h4 className="font-black text-red-950 uppercase border-b border-red-300 pb-1">
                  साइबर सुरक्षा जनहित अलर्ट
                </h4>
                <p className="text-xs text-stone-800">
                  • कभी भी अनजान लिंक पर क्लिक न करें।<br/>
                  • बैंक कभी फोन पर ओटीपी नहीं मांगता।<br/>
                  • किसी भी ऑनलाइन फ्रॉड की शिकायत तुरंत 1930 पर दर्ज कराएं।
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-2 text-center text-xs font-sans text-stone-600 flex justify-between">
            <span>डीडीएन प्राइम न्यूज़ · कानून व्यवस्था</span>
            <span>पृष्ठ 6</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 7: खेल एवं युवा जगत (Sports Arena)
    // ---------------------------------------------------------------
    case 7: {
      const sportsItems = articles.filter(a => a.category === 'sports');
      const p7Lead = sportsItems[0] || articles[1] || articles[0];

      return (
        <div className="space-y-4 font-serif">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · खेल जगत व युवा प्रतिभा</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 7</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 leading-tight">
              {p7Lead.title}
            </h2>
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-8 space-y-2 text-xs font-sans text-stone-800">
                <p className="font-semibold text-sm">{p7Lead.summary}</p>
                {p7Lead.content?.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
              <div className="col-span-12 md:col-span-4 bg-stone-100 p-3.5 rounded border border-stone-300 text-xs font-sans space-y-2">
                <h4 className="font-black text-red-900 uppercase border-b border-red-800 pb-1">
                  खेल स्कोरकार्ड व अपडेट
                </h4>
                <p>• <strong>क्रिकेट:</strong> भारतीय टीम का आगामी टेस्ट मैच हेतु अभ्यास सत्र शुरू।</p>
                <p>• <strong>बिहार क्रिकेट:</strong> रणजी ट्रॉफी चयन हेतु जिला स्तरीय ट्रायल्स संपन्न।</p>
                <p>• <strong>मिथिला कप:</strong> दरभंगा पोलो मैदान पर अंतर-कॉलेज फुटबॉल फाइनल कल।</p>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-2 text-center text-xs font-sans text-stone-600 flex justify-between">
            <span>डीडीएन प्राइम न्यूज़ · खेल जगत</span>
            <span>पृष्ठ 7</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 8: मनोरंजन, स्वास्थ्य, विज्ञान एवं लाइफस्टाइल (Lifestyle & Health)
    // ---------------------------------------------------------------
    case 8:
    default: {
      const entItems = articles.filter(a => a.category === 'entertainment' || a.category === 'education-health');
      const p8Lead = entItems[0] || articles[0];

      return (
        <div className="space-y-4 font-serif">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · मनोरंजन, स्वास्थ्य एवं लाइफस्टाइल</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 8 (अंतिम पृष्ठ)</span>
          </div>

          <div className="grid grid-cols-12 gap-5 pt-1">
            <div className="col-span-12 md:col-span-7 space-y-3 md:border-r md:border-stone-400 md:pr-4">
              <h3 className="text-2xl font-black text-stone-950">
                {p8Lead.title}
              </h3>
              <p className="text-xs font-sans text-stone-800 font-semibold">
                {p8Lead.summary}
              </p>
              <p className="text-xs font-sans text-stone-700 leading-relaxed">
                {p8Lead.content?.[0] || 'सिनेमा और कला जगत में नई रचनात्मकता सामने आ रही है। स्थानीय कलाकारों को भी बड़े मंचों पर अपनी प्रतिभा दिखाने का अवसर मिल रहा है।'}
              </p>

              {/* Hindi Health Guide Special Box */}
              <div className="bg-emerald-50 p-3.5 rounded border border-emerald-300 font-sans text-xs space-y-1.5">
                <span className="font-black text-emerald-900 uppercase text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded">
                  हिंदी हेल्थ गाइड (hindihealthguide.org) विशेष परामर्श
                </span>
                <h4 className="font-bold text-emerald-950 text-sm">
                  सर्दियों की शुरुआत में इम्यूनिटी बढ़ाने के 3 घरेलू उपाय
                </h4>
                <p className="text-stone-700 text-xs leading-relaxed">
                  तुलसी-अदरक का काढ़ा, पर्याप्त गुनगुना पानी और आंवले का नियमित सेवन बदलते मौसम में शरीर को संक्रमण से सुरक्षित रखता है।
                </p>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5 space-y-3 font-sans text-xs">
              {/* Daily Horoscope & Panchang */}
              <div className="bg-stone-100 p-3.5 rounded border border-stone-300">
                <h4 className="font-black text-red-900 uppercase border-b border-red-800 pb-1 mb-2 text-xs">
                  दैनिक राशिफल एवं सितारे
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  <strong>मेष, वृष, मिथुन:</strong> व्यापारिक यात्राएं लाभप्रद रहेंगी।<br/>
                  <strong>कर्क, सिंह, कन्या:</strong> पारिवारिक सौहार्द बढ़ेगा, शुभ समाचार मिलेंगे।<br/>
                  <strong>तुला, वृश्चिक, धनु:</strong> आर्थिक मामलों में सूझबूझ से निर्णय लें।
                </p>
              </div>

              {/* Colophon & Contact */}
              <div className="border border-red-900 bg-red-950 text-white p-3.5 rounded text-center">
                <p className="font-bold font-serif text-sm text-amber-300">
                  डीडीएन प्राइम न्यूज़ डिजिटल नेटवर्क
                </p>
                <p className="text-xs text-stone-300 mt-1">
                  दैनिक डिजिटल ई-पेपर पढ़ने के लिए धन्यवाद।<br/>
                  विज्ञापन एवं संपादकीय सहायता हेतु संपर्क: <strong>9931885888</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-black pt-2 text-center text-xs font-sans text-stone-600 flex justify-between">
            <span>डीडीएन प्राइम न्यूज़ डिजिटल ई-पेपर (सर्वाधिकार सुरक्षित)</span>
            <span>पृष्ठ 8 · अंक 295</span>
            <span>कल सुबह नए संस्करण के साथ पुनः मिलते हैं</span>
          </div>
        </div>
      );
    }
  }
}
