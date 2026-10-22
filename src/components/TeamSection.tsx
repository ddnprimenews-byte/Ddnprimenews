'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, Award, Mail, Phone, MapPin, 
  Send, CheckCircle, MessageSquare, AlertCircle, User 
} from 'lucide-react';

export const TeamSection: React.FC = () => {
  const [tipForm, setTipForm] = useState({
    name: '',
    phone: '',
    location: '',
    message: '',
  });
  const [tipSubmitted, setTipSubmitted] = useState(false);

  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipForm.message) return;
    setTipSubmitted(true);
    setTimeout(() => {
      setTipForm({ name: '', phone: '', location: '', message: '' });
      setTipSubmitted(false);
    }, 4000);
  };

  const handleWhatsAppTip = () => {
    const text = encodeURIComponent(
      `नमस्ते डीडीएन प्राइम न्यूज (संपादक राजेश कुमार साहू जी),\nमेरे पास दरभंगा/बिहार से संबंधित एक महत्वपूर्ण समाचार/सूचना है:`
    );
    window.open(`https://api.whatsapp.com/send?phone=919341050287&text=${text}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="bg-white rounded-lg border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded border border-amber-300">
                MSME Registered
              </span>
              <span className="text-xs text-stone-500 font-medium">
                भारत सरकार सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय द्वारा मान्यता प्राप्त
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              संपादकीय मंडल एवं संगठन संरचना
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              दरभंगा डिजिटल नेटवर्क (DDN Prime News) सच्ची, निर्भीक और निष्पक्ष पत्रकारिता के सिद्धांतों पर संचालित एक स्वतंत्र डिजिटल मीडिया संस्थान है।
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={handleWhatsAppTip}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>संपादक को WhatsApp करें</span>
            </button>
          </div>
        </div>

        {/* Chief Editor Spotlight Card */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-stone-50 p-6 rounded-lg border border-stone-200">
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-3 border-red-600 shadow-md bg-stone-200 mb-3">
              <img
                src="/images/ddn_reporter_press.jpg"
                alt="Rajesh Kumar Sahu"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/ddn_hero_news.jpg';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 font-serif">
              राजेश कुमार साहू
            </h2>
            <p className="text-xs font-bold text-red-700 tracking-wide uppercase">
              मुख्य संपादक (Chief Editor)
            </p>
            <p className="text-xs text-stone-500 mt-1">
              दरभंगा डिजिटल नेटवर्क
            </p>
          </div>

          <div className="md:col-span-8 space-y-3 text-xs sm:text-sm text-stone-700">
            <h3 className="font-bold text-stone-900 text-base">
              संपादकीय वक्तव्य एवं पत्रकारिता का संकल्प
            </h3>
            <p className="leading-relaxed">
              "हमारा ध्येय किसी राजनीतिक दबाव या व्यक्तिगत लाभ से परे रहकर मिथिलांचल, कोसी और समूचे बिहार के आम नागरिकों की वास्तविक समस्याओं को शासन-प्रशासन के समक्ष मजबूती से प्रस्तुत करना है। डीडीएन प्राइम न्यूज जमीनी स्तर पर हर पीड़ित, किसान, युवा और श्रमिक की निर्भीक आवाज है।"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-200 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600 shrink-0" />
                <span><strong>मोबाइल:</strong> 9341050287</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600 shrink-0" />
                <span><strong>ईमेल:</strong> ddnprimenews@gmail.com</span>
              </div>
              <div className="sm:col-span-2 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  <strong>मुख्यालय कार्यालय:</strong> वार्ड नंबर 9, पैगंबरपुर, पोस्ट- दरमा, P.S.- क्यूटी, जिला- दरभंगा, बिहार - 847121
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Core Values & Bureau Network */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="w-9 h-9 rounded-md bg-red-50 text-red-700 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-sm mb-1.5">सच्ची एवं निष्पक्ष पत्रकारिता</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            बिना किसी दल या विचारधारा के पक्षपात के केवल तथ्यों के आधार पर समाचार विश्लेषण और प्रस्तुतीकरण।
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-sm mb-1.5">MSME पंजीकृत संस्थान</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            भारत सरकार द्वारा पंजीकृत डिजिटल पब्लिशिंग इकाई, जो मीडिया के कानूनी और नैतिक मानकों का पूर्णतः पालन करती है।
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-sm mb-1.5">तथ्य सत्यापन (Fact Check)</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            सोशल मीडिया पर वायरल भ्रामक अफवाहों और फर्जी खबरों की स्वतंत्र जांच कर सच्चाई पाठकों तक पहुंचाना।
          </p>
        </div>
      </div>

      {/* District Bureau Network */}
      <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs">
        <h3 className="font-bold text-stone-900 text-base mb-4 font-serif">
          जिला एवं प्रमंडलीय संवाददाता नेटवर्क
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-stone-50 rounded border border-stone-200 text-xs">
            <p className="font-bold text-stone-900">दरभंगा ब्यूरो (मुख्यालय)</p>
            <p className="text-stone-500 mt-0.5">संजय चौधरी, मुख्य संवाददाता</p>
            <p className="text-stone-400 text-[11px] mt-1">फोन: 9341050287</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded border border-stone-200 text-xs">
            <p className="font-bold text-stone-900">मधुबनी जिला डेस्क</p>
            <p className="text-stone-500 mt-0.5">रमेश झा, वरिष्ठ संवाददाता</p>
            <p className="text-stone-400 text-[11px] mt-1">कार्यक्षेत्र: झंझारपुर, बेनीपट्टी</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded border border-stone-200 text-xs">
            <p className="font-bold text-stone-900">समस्तीपुर ब्यूरो</p>
            <p className="text-stone-500 mt-0.5">आलोक कुमार, संवाददाता</p>
            <p className="text-stone-400 text-[11px] mt-1">कार्यक्षेत्र: रोसड़ा, दलसिंहसराय</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded border border-stone-200 text-xs">
            <p className="font-bold text-stone-900">पटना विशेष संवाददाता</p>
            <p className="text-stone-500 mt-0.5">अमित आनंद, राज्य ब्यूरो</p>
            <p className="text-stone-400 text-[11px] mt-1">सचिवालय एवं विधानसभा कवरेज</p>
          </div>
        </div>
      </div>

      {/* Submit News Tip or Grievance Form */}
      <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs">
        <div className="max-w-2xl">
          <h3 className="font-bold text-stone-900 text-base mb-1 font-serif">
            समाचार सूचना भेजें या शिकायत दर्ज करें (News Tip Desk)
          </h3>
          <p className="text-xs text-stone-600 mb-4">
            यदि आपके क्षेत्र में कोई जनसमस्या, भ्रष्टाचार, दुर्घटना या महत्वपूर्ण घटना घटी है, तो हमें सीधे विवरण भेजें।
          </p>

          {tipSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>आपकी सूचना संपादकीय डेस्क को प्राप्त हो गई है। तथ्य सत्यापन के उपरांत रिपोर्टर संपर्क करेगा।</span>
            </div>
          ) : (
            <form onSubmit={handleTipSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="आपका नाम (वैकल्पिक)"
                  value={tipForm.name}
                  onChange={(e) => setTipForm({ ...tipForm, name: e.target.value })}
                  className="p-2 text-xs border border-stone-300 rounded focus:border-red-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="फोन नंबर या व्हाट्सएप"
                  value={tipForm.phone}
                  onChange={(e) => setTipForm({ ...tipForm, phone: e.target.value })}
                  className="p-2 text-xs border border-stone-300 rounded focus:border-red-600 focus:outline-none font-mono"
                />
              </div>

              <input
                type="text"
                placeholder="स्थान (जिला, प्रखंड, गांव/वार्ड)"
                value={tipForm.location}
                onChange={(e) => setTipForm({ ...tipForm, location: e.target.value })}
                className="w-full p-2 text-xs border border-stone-300 rounded focus:border-red-600 focus:outline-none"
              />

              <textarea
                required
                rows={3}
                placeholder="समाचार का संक्षिप्त विवरण लिखें... *"
                value={tipForm.message}
                onChange={(e) => setTipForm({ ...tipForm, message: e.target.value })}
                className="w-full p-2 text-xs border border-stone-300 rounded focus:border-red-600 focus:outline-none"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-500">
                  गोपनीयता की पूर्ण गारंटी है।
                </span>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>सूचना भेजें</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
