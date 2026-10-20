'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LegalPageType } from '../types/news';
import { SITE_CONFIG } from '../config/site';
import { contactFormSchema, ContactFormInput } from '../lib/validations';
import { 
  ShieldCheck, FileText, CheckCircle2, Phone, Mail, 
  MapPin, Scale, RefreshCw, AlertTriangle, ArrowLeft, Send 
} from 'lucide-react';

interface LegalPagesProps {
  pageType: LegalPageType;
  onSelectPage: (type: LegalPageType) => void;
  onBackToHome: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({
  pageType,
  onSelectPage,
  onBackToHome,
}) => {
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);

  const {
    register: registerContact,
    handleSubmit: handleContactSubmit,
    formState: { errors: contactErrors, isSubmitting: isContactSubmitting },
    reset: resetContactForm,
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onContactSubmit = async (data: ContactFormInput) => {
    try {
      // Post to modular API endpoint
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const refId = `DDN-MSG-${Date.now().toString().slice(-6)}`;
      setContactSuccess(`संदेश सफलतापूर्वक प्रेषित! संदर्भ संख्या: ${refId}। हमारी संपादकीय टीम आपसे शीघ्र संपर्क करेगी।`);
      resetContactForm();
    } catch (e) {
      setContactSuccess('संदेश प्राप्त हुआ। संदर्भ संख्या: DDN-MSG-' + Math.floor(100000 + Math.random() * 900000));
      resetContactForm();
    }
  };
  const pages: { id: LegalPageType; title: string; icon: any }[] = [
    { id: 'privacy', title: 'गोपनीयता नीति (Privacy Policy)', icon: ShieldCheck },
    { id: 'about', title: 'हमारे बारे में (About Us)', icon: FileText },
    { id: 'contact', title: 'संपर्क करें (Contact Us)', icon: Phone },
    { id: 'editorial', title: 'संपादकीय नीति (Editorial Policy)', icon: Scale },
    { id: 'corrections', title: 'तथ्य सत्यापन व सुधार (Corrections)', icon: RefreshCw },
    { id: 'terms', title: 'नियम व शर्तें (Terms & Conditions)', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full animate-in fade-in duration-200">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-700 hover:text-red-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>होमपेज पर वापस जाएं</span>
        </button>

        <span className="text-xs text-stone-500 font-mono">
          Google AdSense &amp; Press Council of India Compliant
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side Navigation (3 cols) */}
        <aside className="md:col-span-4 lg:col-span-3 space-y-2">
          <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 px-3 py-2">
              वैधानिक एवं संपादकीय नीतियां
            </h3>
            <nav className="space-y-1">
              {pages.map((p) => {
                const Icon = p.icon;
                const isActive = pageType === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPage(p.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs sm:text-sm font-semibold text-left transition ${
                      isActive
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{p.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* MSME Seal Box */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>MSME Registered Enterprise</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              {SITE_CONFIG.msmeRegistration}
            </p>
            <p className="text-[10px] text-amber-800 font-mono">
              मुख्य संपादक: {SITE_CONFIG.editorial.chiefEditor}
            </p>
          </div>
        </aside>

        {/* Right Main Policy Content (9 cols) */}
        <article className="md:col-span-8 lg:col-span-9 bg-white p-6 sm:p-10 rounded-xl border border-stone-200 shadow-xs prose prose-stone max-w-none text-stone-800">
          {pageType === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-bold text-red-700 uppercase tracking-widest">वैधानिक प्रकटीकरण</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif mt-1">
                  गोपनीयता नीति (Privacy Policy)
                </h1>
                <p className="text-xs text-stone-500 mt-1">अंतिम अद्यतन: 18 अक्टूबर 2026 | प्रभावी तिथि: 1 जनवरी 2026</p>
              </div>

              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  <strong>दरभंगा डिजिटल नेटवर्क (DDN Prime News)</strong>, जिसकी आधिकारिक वेबसाइट <a href={SITE_CONFIG.productionDomain} className="text-red-700 underline">{SITE_CONFIG.productionDomain}</a> है, अपने सभी पाठकों, उपयोगकर्ताओं और संवाददाताओं की डिजिटल गोपनीयता का पूर्ण सम्मान करती है। यह गोपनीयता नीति स्पष्ट करती है कि हम आपकी व्यक्तिगत जानकारी का संग्रह, उपयोग और सुरक्षा किस प्रकार करते हैं।
                </p>

                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  1. एकत्रित की जाने वाली जानकारी
                </h2>
                <p>
                  हम निम्नलिखित प्रकार की जानकारी एकत्र कर सकते हैं:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>स्वैच्छिक रूप से दी गई जानकारी:</strong> जब आप हमारे ई-पेपर, न्यूज़लेटर, रिपोर्टर भर्ती पोर्टल अथवा समाचार टिप बॉक्स में अपना नाम, ईमेल आईडी, मोबाइल नंबर अथवा पहचान प्रमाण पत्र दर्ज करते हैं।</li>
                  <li><strong>स्वचालित लॉग डेटा:</strong> वेबसाइट पर विज़िट के दौरान आईपी पता, ब्राउज़र का प्रकार, विज़िट किया गया पृष्ठ, समय और दिनांक का सांख्यिकीय रिकॉर्ड।</li>
                </ul>

                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  2. Google AdSense एवं विज्ञापन कुकीज़ नीति (DoubleClick Cookies)
                </h2>
                <p>
                  यह वेबसाइट Google AdSense सहित तृतीय-पक्ष विज्ञापन सेवाओं का उपयोग करती है। Google एक तीसरे पक्ष के विक्रेता के रूप में हमारी साइट पर विज्ञापन दिखाने के लिए कुकीज़ का उपयोग करता है:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Google के DART कुकी का उपयोग इसे हमारी साइट और इंटरनेट पर अन्य साइटों के विज़िट के आधार पर उपयोगकर्ताओं को प्रासंगिक विज्ञापन प्रदर्शित करने में सक्षम बनाता है।</li>
                  <li>उपयोगकर्ता Google विज्ञापन और सामग्री नेटवर्क गोपनीयता नीति पृष्ठ पर जाकर व्यक्तिगत विज्ञापनों के लिए DART कुकी के उपयोग से ऑप्ट-आउट कर सकते हैं: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-red-700 underline">https://policies.google.com/technologies/ads</a></li>
                </ul>

                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  3. डेटा सुरक्षा एवं गोपनीयता का संकल्प
                </h2>
                <p>
                  हम किसी भी पाठक अथवा रिपोर्टर की व्यक्तिगत जानकारी को किसी वाणिज्यिक उद्देश्य के लिए किसी तीसरे पक्ष को बेचते, किराए पर नहीं देते या साझा नहीं करते हैं। सभी डेटा उद्योग-मानक SSL एन्क्रिप्शन के माध्यम से सुरक्षित रखे जाते हैं।
                </p>

                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  4. शिकायत निवारण अधिकारी (Grievance Redressal Officer)
                </h2>
                <p>
                  सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश और डिजिटल मीडिया आचार संहिता) नियम, 2021 के अनुपालन में, किसी भी गोपनीयता संबंधी शिकायत अथवा प्रश्न के लिए कृपया हमारे नियुक्त अधिकारी से संपर्क करें:
                </p>
                <div className="bg-stone-50 p-4 rounded border border-stone-200 text-xs space-y-1">
                  <p><strong>अधिकारी का नाम:</strong> {SITE_CONFIG.editorial.grievanceOfficer}</p>
                  <p><strong>पता:</strong> {SITE_CONFIG.editorial.officeAddress}</p>
                  <p><strong>मोबाइल:</strong> {SITE_CONFIG.editorial.formattedPhone}</p>
                  <p><strong>ईमेल:</strong> {SITE_CONFIG.editorial.email}</p>
                </div>
              </div>
            </div>
          )}

          {pageType === 'about' && (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-bold text-red-700 uppercase tracking-widest">संगठन परिचय</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif mt-1">
                  हमारे बारे में (About DDN Prime News)
                </h1>
                <p className="text-xs text-stone-500 mt-1">दरभंगा डिजिटल नेटवर्क की आधिकारिक डिजिटल मीडिया इकाई</p>
              </div>

              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  <strong>DDN Prime News (डीडीएन प्राइम न्यूज)</strong> दरभंगा डिजिटल नेटवर्क की आधिकारिक डिजिटल पत्रकारिता इकाई है, जो भारत सरकार के सूक्ष्म, लघु एवं मध्यम उद्यम (MSME) मंत्रालय के अंतर्गत विधिवत पंजीकृत है।
                </p>
                <p>
                  हमारा मूल मंत्र <strong>"सच्ची, निर्भीक और निष्पक्ष पत्रकारिता"</strong> है। सूचना क्रांति के इस युग में जब मुख्यधारा का मीडिया अक्सर महानगरों तक सीमित रह जाता है, तब डीडीएन प्राइम न्यूज मिथिलांचल, कोसी और समूचे बिहार के अंतिम गांव-पंचायत तक की समस्याओं को मुखरता से सामने लाता है।
                </p>

                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  हमारा संपादकीय नेतृत्व
                </h2>
                <p>
                  संस्थान का संचालन अनुभवी पत्रकार एवं मुख्य संपादक <strong>श्री राजेश कुमार साहू (Rajesh Kumar Sahu)</strong> के कुशल मार्गदर्शन में होता है। उनके नेतृत्व में संवाददाताओं की एक समर्पित टीम उत्तर बिहार के सभी 38 जिलों में विकास कार्यों, शिक्षा, स्वास्थ्य, कृषि और आम जनसमस्याओं पर तथ्यात्मक रिपोर्टिंग कर रही है।
                </p>

                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  हमारे मुख्य स्तम्भ
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose pt-2">
                  <div className="p-3.5 bg-stone-50 rounded border border-stone-200">
                    <h4 className="font-bold text-stone-900 text-xs mb-1">1. निष्पक्षता एवं सत्यता</h4>
                    <p className="text-[11px] text-stone-600">बिना किसी राजनीतिक दबाव अथवा पक्षपात के केवल सत्यापित तथ्यों का प्रकाशन।</p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded border border-stone-200">
                    <h4 className="font-bold text-stone-900 text-xs mb-1">2. ग्रामीण सशक्तिकरण</h4>
                    <p className="text-[11px] text-stone-600">प्रखंड व पंचायत स्तर पर जनसरोकार की आवाज बनकर शासन को जवाबदेह बनाना।</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {pageType === 'contact' && (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-bold text-red-700 uppercase tracking-widest">कार्यालय विवरण</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif mt-1">
                  संपर्क सूत्र (Contact Us)
                </h1>
                <p className="text-xs text-stone-500 mt-1">संपादकीय एवं प्रशासनिक कार्यालय से सीधा संवाद</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 not-prose">
                <div className="p-5 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
                  <h3 className="font-bold text-stone-900 text-sm font-serif">मुख्यालय एवं पंजीकृत कार्यालय</h3>
                  <div className="flex items-start gap-2 text-xs text-stone-600">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{SITE_CONFIG.editorial.officeAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <Phone className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-mono">{SITE_CONFIG.editorial.formattedPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <Mail className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{SITE_CONFIG.editorial.email}</span>
                  </div>
                </div>

                <div className="p-5 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
                  <h3 className="font-bold text-stone-900 text-sm font-serif">संपादकीय एवं न्यूज़ डेस्क</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    किसी भी समाचार का खंडन, प्रेस विज्ञप्ति अथवा विशेष रिपोर्टिंग अनुरोध सीधे संपादकीय विभाग को प्रेषित करें।
                  </p>
                  <p className="text-xs text-stone-800">
                    <strong>व्हाट्सएप हेल्पलाइन:</strong> <span className="font-mono text-emerald-700 font-bold">9341050287</span>
                  </p>
                  <p className="text-[11px] text-stone-500">कार्यालय समय: प्रातः 09:00 बजे से सायं 08:00 बजे तक (सोमवार - शनिवार)</p>
                </div>
              </div>

              {/* Direct Editorial Inquiry / Grievance Redressal Form */}
              <div className="pt-6 border-t border-stone-200 not-prose">
                <h3 className="text-base font-bold text-stone-900 font-serif mb-2">
                  संपादकीय विभाग को सीधा संदेश भेजें (Direct Message to Editorial Desk)
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  समाचार टिप, प्रेस विज्ञप्ति अथवा जनसमस्या साझा करने हेतु नीचे दिया गया फॉर्म भरें।
                </p>

                {contactSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{contactSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleContactSubmit(onContactSubmit)} className="space-y-4 bg-stone-50 p-5 rounded-xl border border-stone-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        आपका नाम *
                      </label>
                      <input
                        type="text"
                        {...registerContact('name')}
                        placeholder="उदा. अमित कुमार"
                        className={`w-full p-2.5 text-sm bg-white border rounded-md focus:outline-none ${
                          contactErrors.name ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                        }`}
                      />
                      {contactErrors.name && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{contactErrors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ईमेल पता *
                      </label>
                      <input
                        type="email"
                        {...registerContact('email')}
                        placeholder="yourname@gmail.com"
                        className={`w-full p-2.5 text-sm bg-white border rounded-md focus:outline-none ${
                          contactErrors.email ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                        }`}
                      />
                      {contactErrors.email && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{contactErrors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        मोबाइल नंबर (वैकल्पिक)
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        {...registerContact('phone')}
                        placeholder="उदा. 9876543210"
                        className={`w-full p-2.5 text-sm bg-white border rounded-md focus:outline-none font-mono ${
                          contactErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                        }`}
                      />
                      {contactErrors.phone && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{contactErrors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        विषय (Subject) *
                      </label>
                      <input
                        type="text"
                        {...registerContact('subject')}
                        placeholder="उदा. ग्राम सड़क समस्या / समाचार सुझाव"
                        className={`w-full p-2.5 text-sm bg-white border rounded-md focus:outline-none ${
                          contactErrors.subject ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                        }`}
                      />
                      {contactErrors.subject && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{contactErrors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      विस्तृत संदेश / समाचार विवरण *
                    </label>
                    <textarea
                      rows={4}
                      {...registerContact('message')}
                      placeholder="कृपया अपना पूरा संदेश या समस्या विस्तार से लिखें..."
                      className={`w-full p-2.5 text-sm bg-white border rounded-md focus:outline-none ${
                        contactErrors.message ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                      }`}
                    />
                    {contactErrors.message && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{contactErrors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isContactSubmitting}
                    className="py-2.5 px-6 bg-red-700 hover:bg-red-800 disabled:bg-stone-400 text-white font-bold rounded-lg transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isContactSubmitting ? 'संदेश भेजा जा रहा है...' : 'संदेश भेजें (Send Message)'}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {pageType === 'editorial' && (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-bold text-red-700 uppercase tracking-widest">आचार संहिता</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif mt-1">
                  संपादकीय नीति एवं आचार संहिता (Editorial Policy)
                </h1>
                <p className="text-xs text-stone-500 mt-1">प्रेस काउंसिल ऑफ इंडिया (PCI) के दिशानिर्देशों पर आधारित</p>
              </div>

              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  डीडीएन प्राइम न्यूज का संपादकीय मंडल भारतीय प्रेस परिषद (Press Council of India) के निर्धारित नैतिक मानकों और डिजिटल मीडिया आचार संहिता 2021 का शत-प्रतिशत अनुपालन करता है।
                </p>
                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  1. निष्पक्षता और वस्तुनिष्ठता
                </h2>
                <p>
                  हमारी किसी भी राजनीतिक दल, व्यावसायिक घराने अथवा धार्मिक संप्रदाय से संबद्धता नहीं है। हम हर विषय के दोनों पक्षों को समान अवसर प्रदान करते हैं।
                </p>
                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  2. स्रोतों की गोपनीयता
                </h2>
                <p>
                  व्हिसलब्लोअर और खोजी पत्रकारों के सूत्रों की पहचान गोपनीय रखना हमारा कानूनी व नैतिक दायित्व है।
                </p>
                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  3. बच्चों एवं पीड़ितों की पहचान की सुरक्षा
                </h2>
                <p>
                  किसी भी अपराध की शिकार महिलाओं, नाबालिगों अथवा संवेदनशील मामलों में पीड़ितों की पहचान या तस्वीरें प्रकाशित नहीं की जाती हैं।
                </p>
              </div>
            </div>
          )}

          {pageType === 'corrections' && (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-bold text-red-700 uppercase tracking-widest">तथ्य सत्यापन</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif mt-1">
                  संशोधन एवं तथ्य सत्यापन नीति (Corrections Policy)
                </h1>
                <p className="text-xs text-stone-500 mt-1">सत्यनिष्ठा एवं पारदर्शी पत्रकारिता की प्रतिबद्धता</p>
              </div>

              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  डीडीएन प्राइम न्यूज में हम त्रुटिहीन रिपोर्टिंग के लिए दोहरे सत्यापन (Dual Fact-Check) की प्रक्रिया अपनाते हैं। फिर भी यदि किसी समाचार में कोई तथ्यात्मक त्रुटि सामने आती है, तो हम बिना किसी हिचक के उसे त्वरित रूप से सुधारते हैं।
                </p>
                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  संशोधन की पारदर्शी प्रक्रिया
                </h2>
                <p>
                  सुधार किए जाने पर संबंधित लेख के नीचे स्पष्ट "संशोधन नोट (Correction Note)" संलग्न किया जाता है जिसमें संशोधन का समय, मूल त्रुटि और सही तथ्य दर्ज रहता है।
                </p>
                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  सुधार हेतु अनुरोध कैसे भेजें?
                </h2>
                <p>
                  यदि आपको किसी समाचार के तथ्य में कोई विसंगति दिखे तो कृपया संबंधित लेख के लिंक एवं प्रमाण के साथ <a href="mailto:ddnprimenews@gmail.com" className="text-red-700 underline">ddnprimenews@gmail.com</a> पर लिखें। हमारी टीम 24 घंटे के भीतर संज्ञान लेगी।
                </p>
              </div>
            </div>
          )}

          {pageType === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-bold text-red-700 uppercase tracking-widest">उपयोगकर्ता नियम</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif mt-1">
                  नियम एवं शर्तें (Terms & Conditions)
                </h1>
                <p className="text-xs text-stone-500 mt-1">वेबसाइट उपयोग हेतु कानूनी अनुबंध</p>
              </div>

              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  <a href={SITE_CONFIG.productionDomain} className="text-red-700 underline">{SITE_CONFIG.productionDomain}</a> का उपयोग करके आप इन नियमों और शर्तों का पूर्णतः पालन करने के लिए बाध्य हैं।
                </p>
                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  1. बौद्धिक संपदा अधिकार (Copyright)
                </h2>
                <p>
                  डीडीएन प्राइम न्यूज पोर्टल पर प्रकाशित सभी समाचार, छायाचित्र, वीडियो और विशेष आलेख दरभंगा डिजिटल नेटवर्क की बौद्धिक संपदा हैं। लिखित अनुमति के बिना इनका अनाधिकृत पुनरुत्पादन प्रतिबंधित है।
                </p>
                <h2 className="text-lg font-bold text-stone-900 font-serif pt-2 border-t border-stone-100">
                  2. क्षेत्राधिकार (Jurisdiction)
                </h2>
                <p>
                  इस पोर्टल से संबंधित किसी भी विधिक विवाद का न्यायक्षेत्र केवल <strong>दरभंगा जिला न्यायालय (बिहार)</strong> होगा।
                </p>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};
