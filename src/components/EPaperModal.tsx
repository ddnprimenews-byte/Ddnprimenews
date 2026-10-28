'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Download, Printer, ZoomIn, ZoomOut, RotateCcw, 
  ChevronLeft, ChevronRight, Newspaper, 
  Share2, Check, Maximize2, Minimize2,
  FileText, MessageCircle, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import * as htmlToImage from 'html-to-image';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareToast, setShareToast] = useState('');
  
  // PDF Generation & Print State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [pdfProcessingPage, setPdfProcessingPage] = useState<number>(1);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [pdfSuccessModal, setPdfSuccessModal] = useState<{ isOpen: boolean; message: string; pdfUrl?: string } | null>(null);

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
  // ENGINE: SEQUENTIAL REAL BROADSHEET PDF GENERATION (jsPDF + html2canvas)
  // No negative coordinates, no opacity bugs, no blank white pages!
  // ===================================================================
  const generatePdfBlob = async (mode: 'all' | 'single', targetPage?: number): Promise<{ blob: Blob; fileName: string }> => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a3', // Standard broadsheet proportion (A3: 297mm x 420mm)
      compress: true,
    });

    const pagesToRender = mode === 'all' ? [1, 2, 3, 4, 5, 6, 7, 8] : [targetPage || pageNumber];
    const fileName = mode === 'all' 
      ? 'DDN_Prime_News_8_Pages_EPaper.pdf' 
      : `DDN_Prime_News_Page_${pagesToRender[0]}.pdf`;

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pagesToRender.length; i++) {
      const pNum = pagesToRender[i];
      setPdfProcessingPage(pNum);
      setPdfProgress(`पृष्ठ ${pNum} / ${pagesToRender.length} का ब्रॉडशीट तैयार हो रहा है...`);

      // Generous delay to allow React state update, DOM layout, and font/image paint
      await new Promise((resolve) => setTimeout(resolve, 380));

      const stageElement = document.getElementById('pdf-capture-stage');
      const screenElement = document.getElementById('active-broadsheet-page');
      const targetEl = stageElement || screenElement;

      if (targetEl) {
        let imgData: string | null = null;

        // Attempt 1: html2canvas-pro (full support for Tailwind v4 and modern CSS)
        try {
          const canvas = await html2canvas(targetEl, {
            scale: 1.25, // Crisp broadsheet print resolution
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#fcfbf7',
            windowWidth: 1050,
            scrollX: 0,
            scrollY: 0,
            logging: false,
          });
          imgData = canvas.toDataURL('image/jpeg', 0.88);
        } catch (canvasErr) {
          console.warn(`html2canvas-pro warning for page ${pNum}:`, canvasErr);
        }

        // Attempt 2: html-to-image (SVG foreignObject native browser rasterization)
        if (!imgData || imgData.length < 1000) {
          try {
            imgData = await htmlToImage.toJpeg(targetEl, {
              quality: 0.88,
              backgroundColor: '#fcfbf7',
              pixelRatio: 1.25,
            });
          } catch (h2iErr) {
            console.warn(`html-to-image warning for page ${pNum}:`, h2iErr);
          }
        }

        // Attempt 3: Direct capture of active on-screen element if needed
        if ((!imgData || imgData.length < 1000) && screenElement) {
          try {
            imgData = await htmlToImage.toJpeg(screenElement, {
              quality: 0.88,
              backgroundColor: '#fcfbf7',
              pixelRatio: 1.25,
            });
          } catch (e3) {
            console.warn(`Screen element capture fallback warning on page ${pNum}:`, e3);
          }
        }

        // Add page to PDF
        if (imgData && imgData.length > 500) {
          if (i > 0) {
            pdf.addPage('a3', 'portrait');
          }
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        } else {
          console.error(`Page ${pNum} could not be rendered into image data`);
        }
      }
    }

    // Fail-safe: If for any reason no pages were captured, snapshot active screen page
    if (pdf.getNumberOfPages() === 0 || !pdf.internal.pages[1]) {
      const screenEl = document.getElementById('active-broadsheet-page');
      if (screenEl) {
        try {
          const data = await htmlToImage.toJpeg(screenEl, { quality: 0.88, backgroundColor: '#fcfbf7' });
          pdf.addImage(data, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        } catch (e) {
          console.error('Final fail-safe capture error:', e);
        }
      }
    }

    const blob = pdf.output('blob');
    return { blob, fileName };
  };

  // 1. PDF DOWNLOAD: All 8 Pages
  const handleDownloadFullEditionPdf = async () => {
    setShowDownloadMenu(false);
    setIsGeneratingPdf(true);
    setPdfProgress('8-पृष्ठ संपूर्ण ई-पेपर ब्रॉडशीट PDF तैयार हो रहा है...');
    try {
      const { blob, fileName } = await generatePdfBlob('all');
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setPdfSuccessModal({
        isOpen: true,
        message: '8 पृष्ठों का संपूर्ण ई-पेपर ब्रॉडशीट PDF आपके डिवाइस पर सफलतापूर्वक डाउनलोड हो चुका है!',
        pdfUrl: downloadUrl,
      });
      setShareToast('8-पृष्ठ संपूर्ण ई-पेपर पीडीएफ डाउनलोड सफल!');
    } catch (err: any) {
      console.error('PDF download error:', err);
      window.print();
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
    setPdfProgress(`पृष्ठ ${pageNumber} पीडीएफ तैयार हो रहा है...`);
    try {
      const { blob, fileName } = await generatePdfBlob('single', pageNumber);
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setShareToast(`पृष्ठ ${pageNumber} पीडीएफ सफलतापूर्वक डाउनलोड हो गया!`);
    } catch (err: any) {
      console.error('Single page PDF download error:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
      setTimeout(() => setShareToast(''), 4000);
    }
  };

  // 3. WHATSAPP & WEB SHARE: Attaching Actual PDF Document + Clean Links (NO MSME NUMBER)
  const handleSharePdfToWhatsApp = async () => {
    setIsGeneratingPdf(true);
    setPdfProgress('व्हाट्सएप हेतु 8-पृष्ठ ई-पेपर पीडीएफ तैयार हो रहा है...');
    try {
      const { blob, fileName } = await generatePdfBlob('all');
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      // Step A: Auto-download the file to user's device so they have the file ready
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?view=epaper` : 'https://ddnprimenews.com';
      const cleanShareText = `📰 *दैनिक डिजिटल ई-पेपर (8 पृष्ठ संपूर्ण ब्रॉडशीट)*\n` +
        `🚩 *डी.डी.एन. प्राइम न्यूज़ (दरभंगा डिजिटल नेटवर्क)*\n` +
        `🗓️ *दिनांक: मंगलवार, 27 अक्टूबर 2026 · अंक 295*\n\n` +
        `📄 8 पृष्ठों का संपूर्ण ई-पेपर PDF आपके डिवाइस में डाउनलोड हो चुका है ('${fileName}')।\n` +
        `🌐 ऑनलाइन ई-पेपर यहाँ पढ़ें:\n${shareUrl}`;

      // Step B: Native Web Share API with File Attachment (Supported on Android Chrome & iOS Safari)
      let shareHandled = false;
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: '📰 दैनिक डिजिटल ई-पेपर | डीडीएन प्राइम न्यूज़ (8 पृष्ठ ब्रॉडशीट)',
            text: cleanShareText,
          });
          shareHandled = true;
          setShareToast('व्हाट्सएप पर ई-पेपर पीडीएफ साझा हो गया!');
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            console.log('Native share fallback:', shareErr);
          }
        }
      }

      // Step C: Fallback for WhatsApp (opens WhatsApp with full e-paper headline, NO MSME text)
      if (!shareHandled) {
        const waText = encodeURIComponent(
          `📰 *दैनिक डिजिटल ई-पेपर (8 पृष्ठ संपूर्ण ब्रॉडशीट)*\n` +
          `🚩 *डी.डी.एन. प्राइम न्यूज़ (दरभंगा डिजिटल नेटवर्क)*\n` +
          `🗓️ *दिनांक: मंगलवार, 27 अक्टूबर 2026 · अंक 295*\n\n` +
          `⭐ *मुख्य सुर्खियां:* दरभंगा में डिजिटल मीडिया विस्तार, मिथिलांचल धरोहर जीर्णोद्धार, शिक्षा व विकास डायरी, संपादकीय एवं खेल-युवा हलचल।\n\n` +
          `📄 *8 पृष्ठों का संपूर्ण ई-पेपर PDF:* आपके डिवाइस में डाउनलोड हो चुका है ('${fileName}')। कृपया नीचे 📎 (दस्तावेज़ / Document) पर टच करके इसे भेजें।\n\n` +
          `🌐 *डिजिटल ई-पेपर ऑनलाइन यहाँ पढ़ें:*\n${shareUrl}`
        );
        window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
        setPdfSuccessModal({
          isOpen: true,
          message: `8 पृष्ठों का संपूर्ण ई-पेपर PDF ('${fileName}') आपके डिवाइस में डाउनलोड हो चुका है और व्हाट्सएप चैट खुल गई है! चैट में 📎 (Paperclip / Document) पर क्लिक करके डाउनलोड की गई फाइल सेंड करें।`,
          pdfUrl: downloadUrl,
        });
      }
    } catch (err: any) {
      console.error('WhatsApp PDF share error:', err);
      const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?view=epaper` : 'https://ddnprimenews.com';
      const waText = encodeURIComponent(
        `📰 *दैनिक डिजिटल ई-पेपर (8 पृष्ठ ब्रॉडशीट)*\n🚩 *डी.डी.एन. प्राइम न्यूज़*\n\nआज का संपूर्ण 8 पृष्ठों का ई-पेपर ऑनलाइन पढ़ें:\n${shareUrl}`
      );
      window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  // Standard Web Share Link Fallback (NO MSME text)
  const handleShareLink = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?view=epaper&page=${pageNumber}` : 'https://ddnprimenews.com';
    const shareTitle = `डीडीएन प्राइम न्यूज़ - डिजिटल ई-पेपर (पृष्ठ ${pageNumber}: ${pageMeta[pageNumber - 1]?.title})`;
    const shareText = `दैनिक डिजिटल ई-पेपर (8 पृष्ठों का संपूर्ण ब्रॉडशीट संस्करण)। आज ही ऑनलाइन पढ़ें:`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User canceled share
      }
    } else {
      navigator.clipboard?.writeText(shareUrl);
      setShareToast('ई-पेपर लिंक कॉपी हो गया!');
      setTimeout(() => setShareToast(''), 3000);
    }
  };

  // Clean Print Handler
  const handlePrint = () => {
    window.print();
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
            padding: 4mm !important;
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
      <div className="bg-[#f0ebe1] rounded-none sm:rounded-xl shadow-2xl w-full max-w-[1450px] h-full sm:h-[98vh] overflow-hidden border border-stone-400 flex flex-col print:border-none print:h-auto print:rounded-none">
        
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
                प्रामाणिक समाचार पत्र लेआउट · MSME: UDYAM-BR-09-0028491
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
              onClick={handlePrint}
              className="px-2.5 py-1.5 bg-red-900 hover:bg-red-950 text-white rounded text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer border border-red-800"
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

        {/* Share Feedback Toast */}
        {shareToast && !isGeneratingPdf && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center font-bold animate-in fade-in slide-in-from-top-1 no-print">
            {shareToast}
          </div>
        )}

        {/* FULL-SCREEN PDF GENERATION OVERLAY WITH PROGRESS BAR */}
        {isGeneratingPdf && (
          <div className="fixed inset-0 z-100000 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 border border-stone-200 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-700 animate-pulse">
                <Newspaper className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900 font-serif">
                  ई-पेपर ब्रॉडशीट PDF तैयार हो रहा है
                </h3>
                <p className="text-xs text-stone-600 mt-1 font-sans">
                  मानक A3 आकार में सभी पृष्ठों का उच्च-गुणवत्ता ब्रॉडशीट लेआउट प्रोसेस किया जा रहा है
                </p>
              </div>

              {/* Progress pill & bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold font-sans text-stone-700">
                  <span>{pdfProgress || 'प्रोसेसिंग...'}</span>
                  <span className="text-red-700 font-mono">पृष्ठ {pdfProcessingPage} / 8</span>
                </div>
                <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-700 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(pdfProcessingPage / 8) * 100}%` }}
                  />
                </div>
              </div>
              
              <p className="text-[11px] text-stone-500 italic">
                कृपया ब्राउज़र विंडो बंद न करें, कुछ ही क्षणों में पीडीएफ डाउनलोड शुरू होगा...
              </p>
            </div>
          </div>
        )}

        {/* DEDICATED VISIBLE CAPTURE STAGE FOR PDF GENERATION */}
        {/* Kept permanently mounted in the DOM so element is NEVER null and all fonts/images are already loaded */}
        <div
          id="pdf-capture-stage"
          style={{
            position: 'fixed',
            top: isGeneratingPdf ? 0 : -99999,
            left: isGeneratingPdf ? 0 : -99999,
            width: '1050px',
            minHeight: '1485px',
            zIndex: isGeneratingPdf ? 99990 : -1000,
            backgroundColor: '#fcfbf7',
            pointerEvents: 'none',
            opacity: isGeneratingPdf ? 1 : 0,
            overflow: 'visible',
          }}
          className="p-7 font-serif text-stone-900 shadow-none border-none"
        >
          {renderPageContent(pdfProcessingPage, newsDataset, onSelectArticle)}
        </div>

        {/* ========================================================= */}
        {/* BROADSHEET CANVAS VIEWPORT (Screen View)                  */}
        {/* ========================================================= */}
        <div 
          id="newspaper-viewport" 
          className="flex-grow overflow-auto p-2 sm:p-6 flex items-start justify-center bg-stone-300/80 transition-all print:hidden"
        >
          {/* Main Printable / Renderable Container */}
          <div 
            id="newspaper-print-area"
            style={{ 
              width: `${zoomLevel}%`, 
              maxWidth: zoomLevel > 100 ? `${1050 * (zoomLevel / 100)}px` : '1050px',
              minWidth: '320px' 
            }}
            className="transition-all duration-150 shadow-2xl bg-[#fcfbf7] text-stone-900 border border-stone-400"
          >
            {/* Single active page view on screen */}
            <div id="active-broadsheet-page" className="broadsheet-page-wrapper p-4 sm:p-7">
              {renderPageContent(pageNumber, newsDataset, onSelectArticle)}
            </div>
          </div>
        </div>

        {/* PRINT CONTAINER: All 8 pages rendered for window.print() */}
        <div className="hidden print:block epaper-print-container">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <div key={`print-page-${num}`} className="epaper-sheet-page p-6 bg-white text-stone-900 font-serif">
              {renderPageContent(num, newsDataset, onSelectArticle)}
            </div>
          ))}
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
              मानक ब्रॉडशीट आकार (Standard Broadsheet)
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

      {/* PDF Success Helper Modal */}
      {pdfSuccessModal?.isOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 text-stone-900 space-y-4 border border-stone-300 animate-in fade-in">
            <div className="flex items-center gap-3 text-emerald-700 border-b border-stone-200 pb-3">
              <Check className="w-6 h-6 p-1 rounded-full bg-emerald-100" />
              <h3 className="font-bold font-serif text-base">ई-पेपर PDF सफलतापूर्वक तैयार!</h3>
            </div>
            
            <p className="text-xs text-stone-700 leading-relaxed">
              {pdfSuccessModal.message}
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-600 space-y-1.5">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp पर शेयर करने का तरीका:</span>
              </div>
              <p className="text-[11px]">
                1. WhatsApp चैट में जाएं।<br/>
                2. नीचे <strong>📎 (Paperclip / Document)</strong> पर टच करें।<br/>
                3. डाउनलोड फोल्डर से <strong>'DDN_Prime_News_8_Pages_EPaper.pdf'</strong> चुनें और सेंड करें।
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setPdfSuccessModal(null)}
                className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                ठीक है (Close)
              </button>
              {pdfSuccessModal.pdfUrl && (
                <>
                  <a
                    href={pdfSuccessModal.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-300" />
                    <span>PDF अभी देखें</span>
                  </a>
                  <a
                    href={pdfSuccessModal.pdfUrl}
                    download="DDN_Prime_News_8_Pages_EPaper.pdf"
                    className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>पुनः डाउनलोड करें</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ===================================================================
// DYNAMIC 8-PAGE AUTHENTIC BROADSHEET GENERATOR (Faithfully Matching Screenshot 2)
// ===================================================================
function renderPageContent(
  pageNum: number, 
  articles: Article[], 
  onSelectArticle?: (a: Article) => void
) {
  const currentDateStr = "मंगलवार, 27 अक्टूबर 2026";
  const editionInfo = "वर्ष 4 · अंक 295 · दरभंगा / पटना / दिल्ली · 8 पृष्ठ · डिजिटल संस्करण नि:शुल्क";
  const msmeReg = "भारत सरकार MSME पंजीकृत: UDYAM-BR-09-0028491";

  // Article selection helpers
  const leadArticle = articles.find(a => a.isLead) || articles[0];
  const otherArticles = articles.filter(a => a.id !== leadArticle?.id);

  switch (pageNum) {
    // ---------------------------------------------------------------
    // पृष्ठ 1: मुख्य पृष्ठ (Faithfully styled as in ddn_epaper_cover.jpg)
    // ---------------------------------------------------------------
    case 1: {
      const secondLead = otherArticles[0] || articles[1] || leadArticle;
      const thirdLead = otherArticles[1] || articles[2] || leadArticle;
      const briefs = otherArticles.slice(2, 6);

      return (
        <div className="space-y-3 font-serif text-stone-900">
          
          {/* 1. TOP HEADER & LOGO BANNER (Exact broadsheet layout from ddn_epaper_cover.jpg) */}
          <div className="border-b-2 border-black pb-2 text-center">
            
            {/* Top Subtitle */}
            <div className="text-xs font-sans font-bold text-stone-600 tracking-wider uppercase mb-0.5">
              दैनिक ब्रॉडशीट
            </div>

            {/* Massive Bold Newspaper Brand Title */}
            <div className="py-0.5">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#0f2347] font-serif leading-none">
                डी.डी.एन. प्राइम न्यूज़
              </h1>
            </div>

            {/* Sub-Brand Strip */}
            <div className="flex items-center justify-between text-xs font-sans text-stone-700 px-2 mt-1 border-t border-stone-300 pt-1">
              <span className="font-bold text-red-800">हिन्दी संस्करण</span>
              <span className="font-bold">सच्ची निर्भीक और निष्पक्ष पत्रकारिता · दरभंगा डिजिटल नेटवर्क</span>
              <span className="font-bold text-red-950 text-xs">दैनिक ब्रॉडशीट संस्करण (8 पृष्ठ)</span>
            </div>

            {/* Blue Dateline Bar */}
            <div className="mt-1.5 bg-[#173059] text-white px-3 py-1 flex flex-wrap items-center justify-between text-xs font-sans font-semibold">
              <div className="flex items-center gap-3">
                <span>नई दिल्ली · दरभंगा · पटना</span>
                <span className="text-amber-300 font-bold">{currentDateStr}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span>मौसम: 28°C साफ़</span>
                <span>{editionInfo}</span>
                <span className="bg-red-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">प्रथम पृष्ठ</span>
              </div>
            </div>
          </div>

          {/* 2. THREE-SECTION BROADSHEET BODY (Matching ddn_epaper_cover.jpg) */}
          <div className="grid grid-cols-12 gap-3 pt-1">
            
            {/* LEFT COLUMN: Stacked Vertical News (2.8 of 12 cols) */}
            <div className="col-span-12 md:col-span-3 space-y-3 md:border-r md:border-stone-400 md:pr-3">
              
              {/* Stack 1: शहनाई / संस्कृति */}
              <div className="border-b border-stone-300 pb-2">
                <span className="inline-block bg-red-700 text-white text-[10px] font-sans font-black px-2 py-0.5 uppercase mb-1">
                  शहनाई / संस्कृति
                </span>
                <div className="border border-stone-400 bg-stone-100 mb-1">
                  <img
                    src="/images/ddn_bihar_heritage.jpg"
                    alt="शहनाई संस्कृति"
                    className="w-full h-24 object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                <h4 className="text-xs font-bold text-black leading-snug">
                  जोड़ी सातों जनम की: मिथिला में गूंजी पारंपरिक शहनाई
                </h4>
                <p className="text-[10.5px] font-sans text-stone-700 mt-0.5 line-clamp-3 leading-relaxed">
                  विवाह के शुभ लग्न प्रारंभ होते ही पारंपरिक मैथिली गीतों और शहनाई की धुन से ग्रामीण अंचल गुंजायमान हैं।
                </p>
              </div>

              {/* Stack 2: विदेश / राष्ट्रीय */}
              <div className="border-b border-stone-300 pb-2">
                <span className="inline-block bg-red-700 text-white text-[10px] font-sans font-black px-2 py-0.5 uppercase mb-1">
                  विदेश / कूटनीति
                </span>
                <div className="border border-stone-400 bg-stone-100 mb-1">
                  <img
                    src="/images/ddn_reporter_press.jpg"
                    alt="विदेश वार्ता"
                    className="w-full h-24 object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                <h4 className="text-xs font-bold text-black leading-snug">
                  शिखर सम्मेलन: द्विपक्षीय व्यापार में नए समझौते पर सहमति
                </h4>
                <p className="text-[10.5px] font-sans text-stone-700 mt-0.5 line-clamp-2 leading-relaxed">
                  वैश्विक मंच पर भारत की कूटनीतिक जीत, ऊर्जा व तकनीकी साझेदारी पर हस्ताक्षर।
                </p>
              </div>

              {/* Stack 3: खेल जगत */}
              <div className="pb-1">
                <span className="inline-block bg-red-700 text-white text-[10px] font-sans font-black px-2 py-0.5 uppercase mb-1">
                  खेल जगत
                </span>
                <h4 className="text-xs font-bold text-black leading-snug">
                  टी-20 मुकाबला: अंतिम गेंद पर रोमांचक जीत दर्ज
                </h4>
                <p className="text-[10.5px] font-sans text-stone-700 mt-0.5 line-clamp-2 leading-relaxed">
                  युवा बल्लेबाजों ने दिखाया दम, मिथिलांचल कप फाइनल के लिए टीमें तय।
                </p>
                <div className="text-[10px] font-sans text-red-800 font-bold mt-1 text-right">
                  पृष्ठ 7 पर पढ़ें ➔
                </div>
              </div>

            </div>

            {/* CENTER & RIGHT SECTION: Main Headline, Lead Photo & Story (9.2 of 12 cols) */}
            <div className="col-span-12 md:col-span-9 space-y-3">
              
              {/* Grand Broadsheet Headline */}
              <div className="border-b-2 border-stone-400 pb-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black leading-tight tracking-tight">
                  {leadArticle.title}
                </h2>
                <h3 className="text-base sm:text-lg font-bold text-stone-800 mt-1 leading-snug">
                  {leadArticle.subtitle || 'दरभंगा डिजिटल नेटवर्क (MSME Registered) की नई डिजिटल पहल, ग्रामीण संवाददाताओं की सीधी भागीदारी से बदलेगा उत्तर बिहार का मीडिया परिदृश्य'}
                </h3>
              </div>

              {/* Lead Photo with Side Column (Grid 8 + 4) */}
              <div className="grid grid-cols-12 gap-3">
                {/* Center Big Lead Photo (8 cols) */}
                <div className="col-span-12 md:col-span-8 space-y-1.5">
                  <div className="border-2 border-black bg-stone-100">
                    <img
                      src={leadArticle.imageUrl || '/images/ddn_hero_news.jpg'}
                      alt={leadArticle.title}
                      className="w-full h-56 sm:h-64 object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="p-1 bg-stone-100 border-t border-black text-[10px] font-sans italic text-stone-800 flex justify-between">
                      <span>{leadArticle.imageCaption || 'दरभंगा डिजिटल नेटवर्क के लोकार्पण पर प्रेस ब्रीफिंग का दृश्य (फोटो: डीडीएन न्यूज)'}</span>
                      <span className="font-bold text-stone-900">विशेष ग्राउंड रिपोर्ट</span>
                    </div>
                  </div>

                  {/* Multi-column story body below photo */}
                  <div className="grid grid-cols-2 gap-3 text-[11px] font-sans text-stone-800 leading-relaxed text-justify pt-1">
                    <p className="border-r border-stone-300 pr-2">
                      <strong className="text-black font-serif text-xs">दरभंगा (ब्यूरो): </strong>
                      {leadArticle.summary}
                    </p>
                    <p>
                      {leadArticle.content?.[0] || 'दरभंगा डिजिटल नेटवर्क के अंतर्गत संचालित डीडीएन प्राइम न्यूज पोर्टल पर अब मिथिलांचल और समूचे बिहार के हर जिले और प्रखंड की खबरों को प्राथमिकता मिलेगी।'}
                    </p>
                  </div>
                </div>

                {/* Right Side Column Story (4 cols) */}
                <div className="col-span-12 md:col-span-4 bg-stone-50 p-2.5 rounded border border-stone-300 space-y-2">
                  <span className="inline-block bg-[#173059] text-white text-[10px] font-sans font-bold px-2 py-0.5 uppercase">
                    विशेष विश्लेषण
                  </span>
                  <h4 className="text-sm font-bold text-black leading-snug">
                    {secondLead.title}
                  </h4>
                  <p className="text-[11px] font-sans text-stone-700 leading-relaxed">
                    {secondLead.summary}
                  </p>
                  <div className="border-t border-stone-200 pt-1.5 text-[10.5px] font-sans text-red-800 font-bold">
                    ब्यूरो रिपोर्ट · {secondLead.location}
                  </div>
                </div>
              </div>

              {/* 3. LOWER HALF DUAL LEAD BOXES (Exactly as in ddn_epaper_cover.jpg) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t-2 border-black">
                
                {/* Lower Box 1: Left Lead */}
                <div className="border border-stone-300 p-2.5 bg-white space-y-1.5">
                  <span className="text-[10px] font-sans font-black bg-stone-800 text-white px-2 py-0.5 uppercase">
                    राजधानी एवं पर्यावरण
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-black leading-snug">
                    दिल्ली व उत्तर भारत में प्रदूषण का स्तर बढ़ा: हवा हुई ज़हरीली, सरकार चिंतित
                  </h4>
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-sans text-stone-800 pt-1">
                    <div className="col-span-4 border border-stone-300">
                      <img
                        src="/images/ddn_hero_news.jpg"
                        alt="प्रदूषण"
                        className="w-full h-16 object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <p className="col-span-8 leading-relaxed">
                      राजधानी में वायु गुणवत्ता सूचकांक (AQI) 400 के पार पहुंच गया है। ग्रैप-4 के कड़े प्रतिबंध लागू किए गए हैं।
                    </p>
                  </div>
                </div>

                {/* Lower Box 2: Right Lead */}
                <div className="border border-stone-300 p-2.5 bg-white space-y-1.5">
                  <span className="text-[10px] font-sans font-black bg-stone-800 text-white px-2 py-0.5 uppercase">
                    त्यौहार एवं बाज़ार
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-black leading-snug">
                    दीपावली व छठ से पहले मिथिलांचल के बाज़ारों में रौनक, सुरक्षा चाक-चौबंद
                  </h4>
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-sans text-stone-800 pt-1">
                    <div className="col-span-4 border border-stone-300">
                      <img
                        src="/images/default_news.jpg"
                        alt="बाजार रौनक"
                        className="w-full h-16 object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <p className="col-span-8 leading-relaxed">
                      त्यौहारों को लेकर दरभंगा, मधुबनी के बाजारों में भारी भीड़। पुलिस प्रशासन ने संवेदनशील स्थलों पर ड्रोन से निगरानी शुरू की।
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* 4. BOTTOM FOSTER STRIP & COLOR DOTS (Authentic Broadsheet Look) */}
          <div className="border-t-2 border-black pt-1.5 mt-2 flex flex-wrap items-center justify-between text-[11px] font-sans text-stone-600">
            <div className="flex items-center gap-1.5">
              {/* CMYK dots found on authentic newspapers */}
              <div className="flex gap-1 items-center mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-black inline-block"></span>
              </div>
              <span>डीडीएन प्राइम न्यूज़ · दैनिक डिजिटल ब्रॉडशीट</span>
            </div>

            <div className="font-bold text-black">
              पृष्ठ 1 (मुख्य पृष्ठ)
            </div>

            <div>
              शेष प्रादेशिक खबरें पृष्ठ 2 और 3 पर पढ़ें · www.ddnprimenews.com
            </div>
          </div>

        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 2: मिथिलांचल व दरभंगा प्रादेशिक (Mithila Regional)
    // ---------------------------------------------------------------
    case 2: {
      const p2Lead = articles.find(a => a.location.includes('दरभंगा') || a.category === 'bihar') || articles[0];
      const p2Others = articles.slice(1, 5);

      return (
        <div className="space-y-3 font-serif text-stone-900">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · मिथिलांचल व दरभंगा प्रादेशिक</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 2</span>
          </div>

          <div className="text-center py-1 border-b border-stone-300">
            <h2 className="text-2xl font-black text-black uppercase tracking-wide">
              मिथिलांचल विकास, संस्कृति एवं प्रादेशिक दर्पण
            </h2>
            <p className="text-xs text-stone-600 font-sans">
              दरभंगा, मधुबनी, समस्तीपुर एवं सीतामढ़ी की जनसमस्याएं और जमीनी रिपोर्ट
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4 pt-1">
            <div className="col-span-12 md:col-span-8 space-y-3 md:border-r md:border-stone-400 md:pr-4">
              <h3 className="text-2xl font-black text-black leading-tight">
                {p2Lead.title}
              </h3>
              <div className="border border-stone-400 bg-stone-100">
                <img
                  src={p2Lead.imageUrl || '/images/ddn_hero_news.jpg'}
                  alt={p2Lead.title}
                  className="w-full h-56 object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <p className="text-xs font-sans text-stone-800 leading-relaxed font-semibold">
                {p2Lead.summary}
              </p>
              <div className="grid grid-cols-2 gap-3 text-[11px] font-sans text-stone-700 leading-relaxed">
                <p>
                  दरभंगा एम्स के शोभन बाईपास स्थल पर निर्माण गतिविधियों में तेजी आ गई है। स्थानीय प्रशासन ने फोरलेन सड़क कनेक्टिविटी की समीक्षा की है।
                </p>
                <p>
                  दरभंगा एयरपोर्ट से नई उड़ानों के जुड़ने से मिथिलांचल के प्रवासियों और व्यापारियों को दिल्ली, मुंबई और बेंगलुरु जाने में अत्यंत सुविधा मिल रही है।
                </p>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 space-y-3">
              <div className="bg-amber-50 p-3 rounded border border-amber-300">
                <h4 className="text-xs font-black font-sans text-amber-950 uppercase border-b border-amber-300 pb-1 mb-1.5">
                  मिथिला विशेष: मखाना व हस्तशिल्प
                </h4>
                <p className="text-[11px] text-stone-700 leading-relaxed">
                  मिथिला के मखाना और मधुबनी पेंटिंग को वैश्विक स्तर पर जीआई टैग के साथ नया निर्यात प्रोत्साहन पैकेज दिया गया है।
                </p>
              </div>

              {p2Others.map((art, i) => (
                <div key={art.id || i} className="border-b border-stone-200 pb-2">
                  <h4 className="text-xs font-bold text-black leading-snug">{art.title}</h4>
                  <p className="text-[10.5px] font-sans text-stone-600 line-clamp-2 mt-0.5">{art.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-black pt-1 flex justify-between text-xs font-sans text-stone-600">
            <span>डीडीएन प्राइम न्यूज़ · दरभंगा संस्करण</span>
            <span>पृष्ठ 2</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 3: बिहार राज्य विशेष (Bihar Special)
    // ---------------------------------------------------------------
    case 3: {
      const p3Lead = articles[1] || articles[0];
      return (
        <div className="space-y-3 font-serif text-stone-900">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · बिहार राज्य विशेष</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 3</span>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-8 space-y-3 md:border-r md:border-stone-300 md:pr-4">
              <span className="text-[10px] font-sans font-bold bg-stone-900 text-white px-2 py-0.5 uppercase">
                सचिवालय एवं कैबिनेट निर्णय
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight">
                {p3Lead.title}
              </h2>
              <p className="text-xs font-sans font-semibold text-stone-800">
                {p3Lead.summary}
              </p>
              <div className="text-xs font-sans text-stone-700 space-y-2 leading-relaxed">
                {p3Lead.content?.map((c, idx) => (
                  <p key={idx}>{c}</p>
                ))}
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 space-y-3">
              <div className="bg-stone-100 p-3 rounded border border-stone-300 text-xs font-sans">
                <h4 className="font-black text-red-900 uppercase border-b border-red-800 pb-1 mb-2">
                  बिहार विकास डायरी
                </h4>
                <div className="space-y-2 text-[11px]">
                  <p>• <strong>सड़क निर्माण:</strong> 1200 किमी नए ग्रामीण पथों की प्रशासनिक स्वीकृति।</p>
                  <p>• <strong>शिक्षा सुधार:</strong> उच्च विद्यालयों में स्मार्ट लैब्स एवं शिक्षकों की उपस्थिति अनिवार्य।</p>
                  <p>• <strong>नलकूप योजना:</strong> हर खेत तक पानी पहुंचाने के लिए नए बिजली कनेक्शन।</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-1 flex justify-between text-xs font-sans text-stone-600">
            <span>डीडीएन प्राइम न्यूज़ · बिहार संस्करण</span>
            <span>पृष्ठ 3</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 4: देश एवं राष्ट्रीय परिदृश्य (National)
    // ---------------------------------------------------------------
    case 4: {
      const p4Lead = articles[2] || articles[0];
      return (
        <div className="space-y-3 font-serif text-stone-900">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · देश एवं राष्ट्रीय परिदृश्य</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 4</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight">
              {p4Lead.title}
            </h2>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-8 space-y-2 text-xs font-sans text-stone-800 leading-relaxed">
                <p className="font-semibold text-sm">{p4Lead.summary}</p>
                {p4Lead.content?.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
              <div className="col-span-12 md:col-span-4 bg-stone-100 p-3 rounded border border-stone-300 text-xs font-sans space-y-2">
                <h4 className="font-black text-red-900 uppercase border-b border-red-800 pb-1">
                  राष्ट्रीय मुख्य बिंदु
                </h4>
                <p>• संसद सत्र को लेकर सर्वदलीय बैठक संपन्न, प्रमुख विधेयकों पर चर्चा।</p>
                <p>• उच्चतम न्यायालय का ऐतिहासिक निर्देश: त्वरित न्याय हेतु डिजिटल सुनवाई पर जोर।</p>
                <p>• अर्थव्यवस्था में मजबूती, बुनियादी ढांचे पर पूंजीगत व्यय में रिकॉर्ड वृद्धि।</p>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-1 flex justify-between text-xs font-sans text-stone-600">
            <span>डीडीएन प्राइम न्यूज़ · राष्ट्रीय संस्करण</span>
            <span>पृष्ठ 4</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 5: संपादकीय एवं विचार मंथन (Op-Ed)
    // ---------------------------------------------------------------
    case 5: {
      return (
        <div className="space-y-3 font-serif text-stone-900">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · संपादकीय एवं विचार मंथन</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 5</span>
          </div>

          <div className="grid grid-cols-12 gap-5 pt-1">
            <div className="col-span-12 md:col-span-7 space-y-3 md:border-r md:border-stone-400 md:pr-4">
              <div className="border-b border-stone-300 pb-1">
                <span className="text-[10px] font-sans font-bold text-red-800 uppercase">मुख्य संपादकीय</span>
                <h3 className="text-2xl font-black text-black mt-0.5">
                  स्वतंत्र व निर्भीक पत्रकारिता: लोकतंत्र की अंतिम ढाल
                </h3>
                <p className="text-xs font-sans text-stone-500">
                  मुख्य संपादक: अमरनाथ पाठक
                </p>
              </div>
              <div className="text-xs font-sans text-stone-800 space-y-2 leading-relaxed text-justify">
                <p>
                  लोकतंत्र के चौथे स्तंभ के रूप में मीडिया की विश्वसनीयता तभी सुरक्षित रह सकती है जब वह बिना किसी पूर्वाग्रह, राजनीतिक दबाव या व्यावसायिक लाभ के केवल जनसरोकारों को प्राथमिकता दे।
                </p>
                <p>
                  डीडीएन प्राइम न्यूज़ की स्थापना इसी संकल्प के साथ की गई है कि हम सत्ता और प्रशासन के सामने आम जनता की निर्भीक आवाज बनेंगे। चाहे वह दरभंगा एम्स का निर्माण हो, बाढ़ प्रभावित ग्रामीण इलाकों का दर्द हो या नौजवानों के रोजगार का सवाल—सच्चाई को उजागर करना ही हमारा एकमात्र धर्म है।
                </p>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5 space-y-3">
              <div className="bg-stone-100 p-3 rounded border border-stone-300">
                <h4 className="text-xs font-black font-sans uppercase text-red-900 border-b border-red-800 pb-1 mb-1.5">
                  आज का प्रेरक सुविचार (Quote)
                </h4>
                <blockquote className="text-xs italic text-stone-800 border-l-2 border-red-700 pl-2">
                  "सत्य की राह कठिन हो सकती है, लेकिन उसकी विजय सदैव शाश्वत और अकाट्य होती है।"
                </blockquote>
              </div>

              <div className="border border-stone-300 p-3 bg-white text-xs font-sans">
                <h4 className="font-black uppercase text-stone-900 border-b border-stone-200 pb-1 mb-1.5">
                  पाठकों के पत्र (Letters to Editor)
                </h4>
                <div className="space-y-1.5 text-[11px] text-stone-700">
                  <p>• <strong>ग्रामीण सड़कें:</strong> बरसात के बाद क्षतिग्रस्त पुल-पुलियों की त्वरित मरम्मत हो। — <em>रमेश कुमार, दरभंगा</em></p>
                  <p>• <strong>युवा रोजगार:</strong> प्रखंड स्तर पर कौशल विकास केंद्र सक्रिय किए जाएं। — <em>सुनील झा, समस्तीपुर</em></p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-1 flex justify-between text-xs font-sans text-stone-600">
            <span>डीडीएन प्राइम न्यूज़ · विचार मंच</span>
            <span>पृष्ठ 5</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 6: अपराध एवं न्याय (Crime & Law)
    // ---------------------------------------------------------------
    case 6: {
      const p6Lead = articles.find(a => a.category === 'crime') || articles[3] || articles[0];
      return (
        <div className="space-y-3 font-serif text-stone-900">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · अपराध, पुलिस प्रशासन एवं न्याय</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 6</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black text-black leading-tight">
              {p6Lead.title}
            </h2>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-8 text-xs font-sans text-stone-800 space-y-2">
                <p className="font-semibold text-sm">{p6Lead.summary}</p>
                {p6Lead.content?.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
              <div className="col-span-12 md:col-span-4 bg-red-50 p-3 rounded border border-red-200 text-xs font-sans space-y-2">
                <h4 className="font-black text-red-950 uppercase border-b border-red-300 pb-1">
                  साइबर सुरक्षा जनहित अलर्ट
                </h4>
                <p className="text-[11px] text-stone-800">
                  • कभी भी अनजान लिंक पर क्लिक न करें।<br/>
                  • बैंक कभी फोन पर ओटीपी नहीं मांगता।<br/>
                  • किसी भी ऑनलाइन फ्रॉड की शिकायत तुरंत 1930 पर दर्ज कराएं।
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-1 flex justify-between text-xs font-sans text-stone-600">
            <span>डीडीएन प्राइम न्यूज़ · कानून व्यवस्था</span>
            <span>पृष्ठ 6</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 7: खेल जगत (Sports Arena)
    // ---------------------------------------------------------------
    case 7: {
      const p7Lead = articles.find(a => a.category === 'sports') || articles[4] || articles[0];
      return (
        <div className="space-y-3 font-serif text-stone-900">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · खेल जगत व युवा प्रतिभा</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 7</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black text-black leading-tight">
              {p7Lead.title}
            </h2>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-8 space-y-2 text-xs font-sans text-stone-800">
                <p className="font-semibold text-sm">{p7Lead.summary}</p>
                {p7Lead.content?.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
              <div className="col-span-12 md:col-span-4 bg-stone-100 p-3 rounded border border-stone-300 text-xs font-sans space-y-2">
                <h4 className="font-black text-red-900 uppercase border-b border-red-800 pb-1">
                  खेल स्कोरकार्ड व अपडेट
                </h4>
                <p>• <strong>क्रिकेट:</strong> भारतीय टीम का आगामी टेस्ट मैच हेतु अभ्यास सत्र शुरू।</p>
                <p>• <strong>बिहार क्रिकेट:</strong> रणजी ट्रॉफी चयन हेतु जिला स्तरीय ट्रायल्स संपन्न।</p>
                <p>• <strong>मिथिला कप:</strong> दरभंगा पोलो मैदान पर फुटबॉल फाइनल कल।</p>
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-1 flex justify-between text-xs font-sans text-stone-600">
            <span>डीडीएन प्राइम न्यूज़ · खेल जगत</span>
            <span>पृष्ठ 7</span>
            <span>www.ddnprimenews.com</span>
          </div>
        </div>
      );
    }

    // ---------------------------------------------------------------
    // पृष्ठ 8: मनोरंजन, स्वास्थ्य एवं लाइफस्टाइल (Lifestyle & Health)
    // ---------------------------------------------------------------
    case 8:
    default: {
      const p8Lead = articles.find(a => a.category === 'entertainment' || a.category === 'education-health') || articles[0];
      return (
        <div className="space-y-3 font-serif text-stone-900">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-red-800">डीडीएन प्राइम न्यूज़ · मनोरंजन, स्वास्थ्य एवं लाइफस्टाइल</span>
            <span>{currentDateStr}</span>
            <span className="bg-red-800 text-white px-2 py-0.5 rounded text-xs font-mono">पृष्ठ 8 (अंतिम पृष्ठ)</span>
          </div>

          <div className="grid grid-cols-12 gap-4 pt-1">
            <div className="col-span-12 md:col-span-7 space-y-3 md:border-r md:border-stone-400 md:pr-4">
              <h3 className="text-2xl font-black text-black">
                {p8Lead.title}
              </h3>
              <p className="text-xs font-sans text-stone-800 font-semibold">
                {p8Lead.summary}
              </p>
              <p className="text-xs font-sans text-stone-700 leading-relaxed">
                {p8Lead.content?.[0] || 'सिनेमा और कला जगत में नई रचनात्मकता सामने आ रही है। स्थानीय कलाकारों को भी बड़े मंचों पर अपनी प्रतिभा दिखाने का अवसर मिल रहा है।'}
              </p>

              {/* Hindi Health Guide Special Box */}
              <div className="bg-emerald-50 p-3 rounded border border-emerald-300 font-sans text-xs space-y-1">
                <span className="font-black text-emerald-900 uppercase text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded">
                  हिंदी हेल्थ गाइड (hindihealthguide.org) विशेष परामर्श
                </span>
                <h4 className="font-bold text-emerald-950 text-sm">
                  सर्दियों की शुरुआत में इम्यूनिटी बढ़ाने के 3 घरेलू उपाय
                </h4>
                <p className="text-stone-700 text-[11px] leading-relaxed">
                  तुलसी-अदरक का काढ़ा, पर्याप्त गुनगुना पानी और आंवले का नियमित सेवन बदलते मौसम में शरीर को संक्रमण से सुरक्षित रखता है।
                </p>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5 space-y-3 font-sans text-xs">
              <div className="bg-stone-100 p-3 rounded border border-stone-300">
                <h4 className="font-black text-red-900 uppercase border-b border-red-800 pb-1 mb-1.5 text-xs">
                  दैनिक राशिफल एवं सितारे
                </h4>
                <p className="text-[11px] text-stone-700 leading-relaxed">
                  <strong>मेष, वृष, मिथुन:</strong> व्यापारिक यात्राएं लाभप्रद रहेंगी।<br/>
                  <strong>कर्क, सिंह, कन्या:</strong> पारिवारिक सौहार्द बढ़ेगा, शुभ समाचार मिलेंगे।<br/>
                  <strong>तुला, वृश्चिक, धनु:</strong> आर्थिक मामलों में सूझबूझ से निर्णय लें।
                </p>
              </div>

              <div className="border border-red-900 bg-red-950 text-white p-3 rounded text-center">
                <p className="font-bold font-serif text-sm text-amber-300">
                  डीडीएन प्राइम न्यूज़ डिजिटल नेटवर्क
                </p>
                <p className="text-[10px] text-stone-300 mt-1">
                  दैनिक डिजिटल ई-पेपर पढ़ने के लिए धन्यवाद।<br/>
                  विज्ञापन एवं संपादकीय सहायता हेतु संपर्क: <strong>9931885888</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-black pt-1 flex justify-between text-xs font-sans text-stone-600">
            <span>डीडीएन प्राइम न्यूज़ डिजिटल ई-पेपर (सर्वाधिकार सुरक्षित)</span>
            <span>पृष्ठ 8 · अंक 295</span>
            <span>कल सुबह नए संस्करण के साथ पुनः मिलते हैं</span>
          </div>
        </div>
      );
    }
  }
}
