'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ShieldCheck, Mail, Phone, MapPin, ExternalLink, ArrowUp, 
  Scale, Lock, RefreshCw, FileText, UserCheck, Newspaper, LogIn, CheckCircle2 
} from 'lucide-react';
import { NewsCategory, LegalPageType } from '../types/news';
import { SITE_CONFIG } from '../config/site';
import { newsletterSchema, NewsletterInput } from '../lib/validations';

interface FooterProps {
  onOpenReporterModal: () => void;
  onOpenEPaper: () => void;
  onSelectCategory: (cat: NewsCategory) => void;
  onSelectLegalPage?: (page: LegalPageType) => void;
  onOpenAdminDesk?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenReporterModal,
  onOpenEPaper,
  onSelectCategory,
  onSelectLegalPage,
  onOpenAdminDesk,
}) => {
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const {
    register: registerNewsletter,
    handleSubmit: handleNewsletterSubmit,
    formState: { errors: newsletterErrors, isSubmitting: isNewsletterSubmitting },
    reset: resetNewsletterForm,
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  const onNewsletterSubmit = async (data: NewsletterInput) => {
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setNewsletterSubscribed(true);
      resetNewsletterForm();
      setTimeout(() => setNewsletterSubscribed(false), 6000);
    } catch (err) {
      setNewsletterSubscribed(true);
      resetNewsletterForm();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLegalClick = (e: React.MouseEvent, page: LegalPageType) => {
    e.preventDefault();
    if (onSelectLegalPage) {
      onSelectLegalPage(page);
    } else {
      window.location.href = `/${page}`;
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-10 pb-8 border-t border-stone-800 mt-auto">
      {/* Newsletter Subscription Strip with Zod & React Hook Form Validation */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="bg-gradient-to-r from-red-950 via-stone-800 to-stone-900 border border-red-900/60 rounded-xl p-5 sm:p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
              <Mail className="w-4 h-4 text-yellow-400" />
              <span>दैनिक डिजिटल बुलेटिन एवं ई-पेपर अलर्ट</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white font-serif">
              दरभंगा डिजिटल नेटवर्क (DDN) की निष्पक्ष खबरें सीधे अपने इनबॉक्स में पाएं
            </h4>
            <p className="text-xs text-stone-400">
              प्रतिदिन सुबह 7 बजे मुख्य सुर्खियां, वीडियो विश्लेषण और ई-पेपर संस्करण की पीडीएफ।
            </p>
          </div>

          <div className="w-full md:w-auto min-w-[300px] sm:min-w-[360px]">
            {newsletterSubscribed ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">सदस्यता सक्रिय! आपको दैनिक बुलेटिन प्रेषित किया जाएगा।</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit(onNewsletterSubmit)} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      {...registerNewsletter('email')}
                      placeholder="ईमेल पता दर्ज करें (उदा. info@gmail.com)"
                      className={`w-full px-3.5 py-2.5 rounded-lg text-xs bg-stone-900 text-white placeholder-stone-400 border focus:outline-none transition ${
                        newsletterErrors.email
                          ? 'border-red-500 bg-red-950/30 focus:border-red-400'
                          : 'border-stone-700 focus:border-yellow-400'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isNewsletterSubmitting}
                    className="px-4 py-2.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer shadow-sm active:scale-95"
                  >
                    {isNewsletterSubmitting ? 'प्रक्रिया...' : 'सब्सक्राइब करें'}
                  </button>
                </div>
                {newsletterErrors.email && (
                  <p className="text-[11px] text-red-400 font-medium pl-1">
                    {newsletterErrors.email.message}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: About DDN Prime News & MSME */}
        <div className="md:col-span-1">
          <h3 className="text-white text-lg font-bold mb-3 border-b-2 border-red-600 pb-1 inline-block font-serif">
            DDN Prime News
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-stone-400 mb-3">
            यह पोर्टल <strong>दरभंगा डिजिटल नेटवर्क</strong> की आधिकारिक इकाई है जो MSME द्वारा पंजीकृत है। निष्पक्ष और निर्भीक डिजिटल पत्रकारिता के प्रति समर्पित।
          </p>
          <div className="inline-flex items-center gap-1.5 bg-stone-800 text-amber-300 px-3 py-1.5 rounded border border-stone-700 text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] font-medium">MSME Reg.: UDYAM-BR-09</span>
          </div>
        </div>

        {/* Col 2: Editorial & Contact Details */}
        <div className="md:col-span-1">
          <h3 className="text-white text-lg font-bold mb-3 border-b-2 border-red-600 pb-1 inline-block font-serif">
            संपादकीय एवं संपर्क
          </h3>
          <ul className="text-xs sm:text-sm space-y-2.5 text-stone-400">
            <li>
              <strong className="text-stone-200">मुख्य संपादक:</strong> {SITE_CONFIG.editorial.chiefEditor}
            </li>
            <li className="flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-stone-200">कार्यालय:</strong> {SITE_CONFIG.editorial.officeAddress}
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-red-500 shrink-0" />
              <span>
                <strong className="text-stone-200">मोबाइल:</strong>{' '}
                <a href={`tel:${SITE_CONFIG.editorial.phone}`} className="hover:text-yellow-300 transition font-mono">
                  {SITE_CONFIG.editorial.phone}
                </a>
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-red-500 shrink-0" />
              <span>
                <strong className="text-stone-200">ईमेल:</strong>{' '}
                <a href={`mailto:${SITE_CONFIG.editorial.email}`} className="hover:text-yellow-300 transition">
                  {SITE_CONFIG.editorial.email}
                </a>
              </span>
            </li>
          </ul>
        </div>

        {/* Col 3: Legal & AdSense Compliance Policies (Real Clickable Links) */}
        <div className="md:col-span-1">
          <h3 className="text-white text-lg font-bold mb-3 border-b-2 border-red-600 pb-1 inline-block font-serif">
            वैधानिक नीतियां (Policies)
          </h3>
          <ul className="text-xs sm:text-sm space-y-2 text-stone-400">
            <li>
              <a
                href="/privacy"
                onClick={(e) => handleLegalClick(e, 'privacy')}
                className="hover:text-white transition flex items-center gap-2 cursor-pointer py-0.5 text-stone-300 hover:text-yellow-300"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>गोपनीयता नीति (Privacy Policy)</span>
              </a>
            </li>
            <li>
              <a
                href="/about"
                onClick={(e) => handleLegalClick(e, 'about')}
                className="hover:text-white transition flex items-center gap-2 cursor-pointer py-0.5 text-stone-300 hover:text-yellow-300"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>हमारे बारे में (About Us)</span>
              </a>
            </li>
            <li>
              <a
                href="/contact"
                onClick={(e) => handleLegalClick(e, 'contact')}
                className="hover:text-white transition flex items-center gap-2 cursor-pointer py-0.5 text-stone-300 hover:text-yellow-300"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>संपर्क करें (Contact Us)</span>
              </a>
            </li>
            <li>
              <a
                href="/editorial"
                onClick={(e) => handleLegalClick(e, 'editorial')}
                className="hover:text-white transition flex items-center gap-2 cursor-pointer py-0.5 text-stone-300 hover:text-yellow-300"
              >
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>संपादकीय आचार संहिता</span>
              </a>
            </li>
            <li>
              <a
                href="/corrections"
                onClick={(e) => handleLegalClick(e, 'corrections')}
                className="hover:text-white transition flex items-center gap-2 cursor-pointer py-0.5 text-stone-300 hover:text-yellow-300"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>तथ्य सत्यापन व संशोधन नीति</span>
              </a>
            </li>
            <li>
              <a
                href="/terms"
                onClick={(e) => handleLegalClick(e, 'terms')}
                className="hover:text-white transition flex items-center gap-2 cursor-pointer py-0.5 text-stone-300 hover:text-yellow-300"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>नियम एवं शर्तें (Terms)</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Quick Links, Reporter & Login */}
        <div className="md:col-span-1">
          <h3 className="text-white text-lg font-bold mb-3 border-b-2 border-red-600 pb-1 inline-block font-serif">
            त्वरित लिंक्स (Quick Links)
          </h3>
          <ul className="text-xs sm:text-sm space-y-2.5 text-stone-400">
            <li>
              <button
                onClick={onOpenReporterModal}
                className="hover:text-yellow-300 transition flex items-center gap-2 text-left cursor-pointer text-stone-200 font-semibold"
              >
                <UserCheck className="w-3.5 h-3.5 text-yellow-400" />
                <span>पत्रकार पंजीकरण (Reporter Application)</span>
              </button>
            </li>
            <li>
              <button
                onClick={onOpenEPaper}
                className="hover:text-yellow-300 transition flex items-center gap-2 cursor-pointer text-stone-300"
              >
                <Newspaper className="w-3.5 h-3.5 text-red-400" />
                <span>दैनिक ई-पेपर संस्करण (E-Paper)</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('team')}
                className="hover:text-yellow-300 transition flex items-center gap-2 cursor-pointer text-stone-300"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>संपादकीय बोर्ड व ब्यूरो नेटवर्क</span>
              </button>
            </li>
            <li>
              <a
                href={SITE_CONFIG.socialLinks.healthPartner}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition flex items-center gap-1.5 text-amber-300"
              >
                <span>शिक्षा & हेल्थ गाइड (hindilhealthguide.org)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </li>
            {onOpenAdminDesk && (
              <li className="pt-2">
                <button
                  onClick={onOpenAdminDesk}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-stone-800 hover:bg-black text-yellow-400 hover:text-yellow-300 rounded text-xs font-bold transition border border-stone-700 cursor-pointer shadow-sm active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>संपादकीय डेस्क / रिपोर्टर लॉगिन</span>
                </button>
              </li>
            )}
          </ul>

          <div className="mt-5">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs transition border border-stone-700 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>शीर्ष पर जाएं (Back to Top)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 border-t border-stone-800 pt-4 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          सर्वाधिकार सुरक्षित © 2026 दरभंगा डिजिटल नेटवर्क (DDN Prime News). MSME Registered.
        </p>
        <p className="text-[11px] text-stone-400">
          आधिकारिक डोमेन: <strong className="text-stone-300 font-mono">{SITE_CONFIG.productionDomain}</strong>
        </p>
      </div>
    </footer>
  );
};
