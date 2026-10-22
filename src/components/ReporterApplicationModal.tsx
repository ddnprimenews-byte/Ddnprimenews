'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  X, UserCheck, Upload, CheckCircle2, Printer, 
  ShieldCheck, Award, FileText, ArrowLeft, Download, AlertCircle 
} from 'lucide-react';
import { ReporterApplication } from '../types/news';
import { reporterApplicationSchema, ReporterApplicationInput } from '../lib/validations';

interface ReporterApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BIHAR_DISTRICTS = [
  'दरभंगा (Darbhanga)',
  'मधुबनी (Madhubani)',
  'समस्तीपुर (Samastipur)',
  'मुजफ्फरपुर (Muzaffarpur)',
  'सीतामढ़ी (Sitamarhi)',
  'पटना (Patna)',
  'बेगूसराय (Begusarai)',
  'सहरसा (Saharsa)',
  'खगड़िया (Khagaria)',
  'पूर्णिया (Purnea)',
  'भागलपुर (Bhagalpur)',
  'गया (Gaya)',
  'पूर्वी चंपारण (East Champaran)',
  'पश्चिमी चंपारण (West Champaran)',
  'वैशाली (Vaishali)',
  'अन्य जिला'
];

export const ReporterApplicationModal: React.FC<ReporterApplicationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetHookForm,
  } = useForm<ReporterApplicationInput>({
    resolver: zodResolver(reporterApplicationSchema),
    defaultValues: {
      fullName: '',
      fatherName: '',
      mobile: '',
      whatsapp: '',
      email: '',
      district: 'दरभंगा (Darbhanga)',
      block: '',
      panchayat: '',
      qualification: 'स्नातक (Graduate)',
      experience: 'फ्रेशर (नया पत्रकार)',
      beatPreference: 'ग्रामीण विकास एवं जनसमस्याएं',
      agreement: false,
    },
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofName, setIdProofName] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<ReporterApplication | null>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('कृपया केवल वैध फोटो (JPG, PNG, WEBP) ही अपलोड करें।');
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        alert('फोटो का आकार 3MB से अधिक नहीं होना चाहिए।');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowed.includes(file.type)) {
        alert('पहचान पत्र केवल PDF या इमेज (JPG, PNG) प्रारूप में ही अपलोड करें।');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('पहचान पत्र का आकार 5MB से अधिक नहीं होना चाहिए।');
        return;
      }
      setIdProofFile(file);
      setIdProofName(file.name);
    }
  };

  const onValidSubmit = async (validData: ReporterApplicationInput) => {
    setFirebaseError(null);
    const regId = `DDN-REP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    let finalPhotoUrl = photoPreview || '/images/ddn_reporter_press.jpg';
    let idDocUrl = '';

    try {
      const { uploadReporterPhoto, uploadReporterIdDocument, submitReporterApplicationToFirestore } = await import('../lib/firebase');

      // 1. Upload photo to Firebase Storage
      if (photoFile) {
        try {
          finalPhotoUrl = await uploadReporterPhoto(photoFile, regId);
        } catch (storageErr: any) {
          console.warn('Storage photo note:', storageErr.message);
        }
      }

      // 2. Upload identity document to secure private storage
      if (idProofFile) {
        try {
          idDocUrl = await uploadReporterIdDocument(idProofFile, regId);
        } catch (idErr: any) {
          console.warn('Storage ID document note:', idErr.message);
        }
      }

      // 3. New application record begins strictly with status: 'pending'
      const newApp: ReporterApplication = {
        id: regId,
        fullName: validData.fullName,
        fatherName: validData.fatherName,
        mobile: validData.mobile,
        whatsapp: validData.whatsapp || validData.mobile,
        email: validData.email,
        district: validData.district,
        block: validData.block || 'सदर',
        panchayat: validData.panchayat || 'वार्ड 1',
        qualification: validData.qualification,
        experience: validData.experience,
        beatPreference: validData.beatPreference,
        photoUrl: finalPhotoUrl,
        idDocumentUrl: idDocUrl,
        appliedDate: new Date().toLocaleDateString('hi-IN'),
        status: 'pending', // Strictly pending verification by Editorial Board
      };

      // 4. Persist to genuine Firebase Firestore
      await submitReporterApplicationToFirestore(newApp);

      // 5. Sync to modular API endpoint
      try {
        await fetch('/api/reporter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validData),
        });
      } catch (apiErr) {
        console.warn('Modular API reporter sync note:', apiErr);
      }

      setSubmittedApp(newApp);
    } catch (err: any) {
      console.error('Firebase reporter submission error:', err);
      setFirebaseError(err?.message || 'फायरबेस डेटाबेस में आवेदन सुरक्षित करने में समस्या। कृपया पुनः प्रयास करें।');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setSubmittedApp(null);
    setPhotoPreview(null);
    setIdProofName(null);
    resetHookForm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/75 backdrop-blur-xs flex justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-auto overflow-hidden border border-stone-200 animate-in fade-in duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#800000] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <UserCheck className="w-5 h-5 text-yellow-300" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                डीडीएन प्राइम न्यूज - पत्रकार / रिपोर्टर पंजीकरण पोर्टल
              </h2>
              <p className="text-[11px] text-red-200">
                दरभंगा डिजिटल नेटवर्क (MSME Registered) · जिला एवं प्रखंड स्तरीय भर्ती 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-200 hover:text-white hover:bg-red-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 flex-grow">
          {!submittedApp ? (
            /* Application Form with Zod & React Hook Form Validation */
            <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-5">
              <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <Award className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>सच्ची और निर्भीक पत्रकारिता का हिस्सा बनें:</strong> डीडीएन प्राइम न्यूज मिथिलांचल और संपूर्ण बिहार के हर पंचायत में ईमानदार संवाददाताओं को अवसर प्रदान कर रहा है। फॉर्म भरकर तुरंत अपनी डिजिटल प्रेस आईडी की स्वीकृति प्राप्त करें।
                </div>
              </div>

              {firebaseError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{firebaseError}</span>
                </div>
              )}

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    आवेदक का पूरा नाम (Full Name) *
                  </label>
                  <input
                    type="text"
                    {...register('fullName')}
                    placeholder="उदा. राहुल कुमार शर्मा"
                    className={`w-full p-2 text-sm border rounded focus:outline-none ${
                      errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पिता/संरक्षक का नाम (Father's Name) *
                  </label>
                  <input
                    type="text"
                    {...register('fatherName')}
                    placeholder="उदा. श्री रामचंद्र शर्मा"
                    className={`w-full p-2 text-sm border rounded focus:outline-none ${
                      errors.fatherName ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                    }`}
                  />
                  {errors.fatherName && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.fatherName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    मोबाइल नंबर (Contact Number) *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register('mobile')}
                    placeholder="उदा. 9876543210"
                    className={`w-full p-2 text-sm border rounded focus:outline-none font-mono ${
                      errors.mobile ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                    }`}
                  />
                  {errors.mobile && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.mobile.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    व्हाट्सएप नंबर (WhatsApp Number)
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register('whatsapp')}
                    placeholder="उदा. 9876543210"
                    className={`w-full p-2 text-sm border rounded focus:outline-none font-mono ${
                      errors.whatsapp ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                    }`}
                  />
                  {errors.whatsapp && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.whatsapp.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ईमेल आईडी (Email) *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="yourname@gmail.com"
                    className={`w-full p-2 text-sm border rounded focus:outline-none ${
                      errors.email ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    कार्यक्षेत्र जिला (District) *
                  </label>
                  <select
                    {...register('district')}
                    className="w-full p-2 text-sm border border-stone-300 rounded focus:border-red-600 focus:outline-none bg-white cursor-pointer"
                  >
                    {BIHAR_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.district.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    प्रखंड / तहसील (Block) *
                  </label>
                  <input
                    type="text"
                    {...register('block')}
                    placeholder="उदा. क्यूटी, बहादुरपुर, बेनीपुर"
                    className={`w-full p-2 text-sm border rounded focus:outline-none ${
                      errors.block ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                    }`}
                  />
                  {errors.block && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.block.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पंचायत / वार्ड संख्या (Panchayat/Ward) *
                  </label>
                  <input
                    type="text"
                    {...register('panchayat')}
                    placeholder="उदा. पैगंबरपुर / वार्ड 9"
                    className={`w-full p-2 text-sm border rounded focus:outline-none ${
                      errors.panchayat ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                    }`}
                  />
                  {errors.panchayat && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.panchayat.message}</p>
                  )}
                </div>
              </div>

              {/* Qualifications & Beat */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    शैक्षणिक योग्यता
                  </label>
                  <select
                    {...register('qualification')}
                    className="w-full p-2 text-sm border border-stone-300 rounded focus:border-red-600 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="12वीं पास (Intermediate)">12वीं पास (Intermediate)</option>
                    <option value="स्नातक (Graduate)">स्नातक (Graduate)</option>
                    <option value="परास्नातक (Post Graduate)">परास्नातक (Post Graduate)</option>
                    <option value="मास कॉम / पत्रकारिता डिप्लोमा">मास कॉम / पत्रकारिता डिप्लोमा</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पत्रकारिता अनुभव
                  </label>
                  <select
                    {...register('experience')}
                    className="w-full p-2 text-sm border border-stone-300 rounded focus:border-red-600 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="फ्रेशर (नया पत्रकार)">फ्रेशर (नया पत्रकार)</option>
                    <option value="1 से 2 वर्ष">1 से 2 वर्ष</option>
                    <option value="3 वर्ष से अधिक">3 वर्ष से अधिक (वरिष्ठ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    रुचि का क्षेत्र (Beat)
                  </label>
                  <select
                    {...register('beatPreference')}
                    className="w-full p-2 text-sm border border-stone-300 rounded focus:border-red-600 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="ग्रामीण विकास एवं जनसमस्याएं">ग्रामीण विकास एवं जनसमस्याएं</option>
                    <option value="राजनीति एवं प्रशासनिक">राजनीति एवं प्रशासनिक</option>
                    <option value="अपराध एवं कानून व्यवस्था">अपराध एवं कानून व्यवस्था</option>
                    <option value="शिक्षा एवं खेलकूद">शिक्षा एवं खेलकूद</option>
                    <option value="कला, संस्कृति एवं पर्यटन">कला, संस्कृति एवं पर्यटन</option>
                  </select>
                </div>
              </div>

              {/* Photo & ID proof upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पासपोर्ट साइज फोटो अपलोड करें
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-xs font-semibold text-stone-700 transition">
                      <Upload className="w-4 h-4 text-red-600" />
                      <span>फोटो चुनें</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {photoPreview && (
                      <div className="w-10 h-10 rounded overflow-hidden border border-stone-300">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    आधार / पहचान पत्र (ID Proof)
                  </label>
                  <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-xs font-semibold text-stone-700 transition">
                    <FileText className="w-4 h-4 text-stone-600" />
                    <span>{idProofName ? `अपलोड: ${idProofName}` : 'आईडी प्रूफ चुनें'}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleIdProofUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Code of Ethics checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-2 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('agreement')}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <span>
                    मैं शपथ लेता/लेती हूँ कि मैं सच्ची, निष्पक्ष और निर्भीक पत्रकारिता के नियमों का पालन करूंगा/करूंगी एवं दरभंगा डिजिटल नेटवर्क (DDN Prime News) की साख बनाए रखूंगा/रखूंगी।
                  </span>
                </label>
                {errors.agreement && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{errors.agreement.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-stone-400 text-white font-bold rounded-lg shadow-sm transition active:scale-98 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'डेटा सत्यापित एवं पंजीकृत किया जा रहा है...' : 'आवेदन जमा करें एवं पावती प्राप्त करें'}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* Application Submitted View: Acknowledgement Receipt or Verified Card */
            <div className="space-y-6 animate-in fade-in">
              {submittedApp.status === 'pending' ? (
                /* 1. Official Acknowledgement Receipt for Pending Application */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg flex items-start gap-3 text-amber-950 text-xs sm:text-sm">
                    <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-base text-amber-950">
                        आवेदन सफलतापूर्वक दर्ज — सत्यापन प्रक्रियाधीन (Pending Verification)
                      </h4>
                      <p className="text-amber-900 text-xs mt-1 leading-relaxed">
                        आपका पंजीकरण संख्या: <strong className="font-mono text-sm text-stone-900 bg-amber-200/60 px-1.5 py-0.5 rounded">{submittedApp.id}</strong> है। आपका आवेदन DDN Prime News संपादकीय बोर्ड के पास समीक्षा हेतु पहुंच गया है।
                      </p>
                    </div>
                  </div>

                  {/* Printable Acknowledgement Receipt */}
                  <div id="printable-press-card" className="border-2 border-stone-300 rounded-xl bg-white p-6 shadow-sm">
                    <div className="border-b border-stone-200 pb-4 text-center">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded">
                        संवाददाता भर्ती पावती रसीद / APPLICATION RECEIPT
                      </span>
                      <h3 className="text-xl font-bold font-headline text-stone-900 mt-2">
                        DDN PRIME NEWS (डीडीएन प्राइम न्यूज)
                      </h3>
                      <p className="text-xs text-stone-500">दरभंगा डिजिटल नेटवर्क — MSME Registered (UDYAM-BR-09-0028491)</p>
                    </div>

                    <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div className="sm:col-span-2 space-y-2 text-xs">
                        <div className="flex justify-between border-b border-stone-100 py-1">
                          <span className="text-stone-500">पंजीकरण संख्या (Ref ID):</span>
                          <span className="font-mono font-bold text-stone-900">{submittedApp.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-100 py-1">
                          <span className="text-stone-500">आवेदक का नाम:</span>
                          <span className="font-bold text-stone-900">{submittedApp.fullName}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-100 py-1">
                          <span className="text-stone-500">पिता का नाम:</span>
                          <span className="text-stone-900">{submittedApp.fatherName || '—'}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-100 py-1">
                          <span className="text-stone-500">कार्यक्षेत्र (जिला/प्रखंड):</span>
                          <span className="font-semibold text-stone-900">{submittedApp.district} / {submittedApp.block}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-100 py-1">
                          <span className="text-stone-500">बीट प्राथमिकता:</span>
                          <span className="text-stone-900">{submittedApp.beatPreference}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-100 py-1">
                          <span className="text-stone-500">आवेदन तिथि:</span>
                          <span className="text-stone-900">{submittedApp.appliedDate}</span>
                        </div>
                        <div className="flex justify-between py-1 items-center">
                          <span className="text-stone-500">वर्तमान स्थिति:</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            समीक्षाधीन (Verification Pending)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center p-3 bg-stone-50 rounded-lg border border-stone-200">
                        {submittedApp.photoUrl && (
                          <div className="w-24 h-28 rounded overflow-hidden border border-stone-300 mb-2">
                            <img
                              src={submittedApp.photoUrl}
                              alt={submittedApp.fullName}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/images/ddn_reporter_press.jpg';
                              }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="text-[10px] text-stone-400">आवेदक फोटो</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-500 leading-relaxed bg-stone-50/60 p-3 rounded">
                      <p className="font-semibold text-stone-700 mb-0.5">संपादकीय सत्यापन सूचना:</p>
                      यह केवल आवेदन पावती रसीद है। प्रेस काउंसिल ऑफ इंडिया एवं डीडीएन प्राइम न्यूज आचार संहिता के अनुसार, पहचान पत्र व पृष्ठभूमि सत्यापन के बाद मुख्य संपादक द्वारा अधिकृत प्रेस कार्ड जारी किया जाएगा। अनधिकृत प्रेस कार्ड मुद्रण कानूनन वर्जित है।
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={resetForm}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-stone-700 hover:text-stone-900 text-xs font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>नया आवेदन भरें</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>पावती रसीद प्रिंट करें</span>
                      </button>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition"
                      >
                        पोर्टल पर वापस जाएं
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. Official Press Card (Rendered ONLY if approved/card_generated by Admin) */
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3 text-emerald-900 text-xs sm:text-sm">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-950">
                        सत्यापित संवाददाता — आधिकारिक डिजिटल प्रेस मान्यता आईडी
                      </h4>
                      <p className="text-emerald-800 text-xs mt-0.5">
                        पंजीकरण संख्या: <strong className="font-mono">{submittedApp.id}</strong> (मुख्य संपादक द्वारा अधिकृत)
                      </p>
                    </div>
                  </div>

                  {/* Press ID Card (Printable) */}
                  <div className="flex justify-center">
                    <div 
                      id="printable-press-card"
                      className="w-full max-w-md bg-linear-to-b from-stone-900 via-stone-800 to-stone-900 text-white rounded-xl shadow-xl overflow-hidden border-2 border-amber-400 p-5 relative"
                    >
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-700/20 text-7xl font-serif font-black select-none pointer-events-none">
                        DDN
                      </div>

                      <div className="text-center pb-3 border-b border-stone-700">
                        <div className="inline-block bg-red-600 text-white text-[10px] font-black tracking-widest px-3 py-0.5 rounded uppercase mb-1">
                          PRESS / प्रेस रिपोर्टर
                        </div>
                        <h3 className="text-lg font-black tracking-tight font-serif text-white">
                          DDN PRIME NEWS
                        </h3>
                        <p className="text-[10px] text-amber-300 font-medium">
                          दरभंगा डिजिटल नेटवर्क (MSME Registered)
                        </p>
                      </div>

                      <div className="py-4 flex gap-4 items-center">
                        <div className="w-24 h-28 rounded-md overflow-hidden bg-stone-700 border-2 border-stone-500 shrink-0">
                          <img
                            src={submittedApp.photoUrl}
                            alt={submittedApp.fullName}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/ddn_reporter_press.jpg';
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="text-[10px] text-stone-400">नाम / Name:</span>
                            <p className="font-bold text-sm text-yellow-300 leading-tight">{submittedApp.fullName}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400">पद / Designation:</span>
                            <p className="font-semibold text-stone-200">डिजिटल फील्ड संवाददाता</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400">कार्यक्षेत्र / District:</span>
                            <p className="font-semibold text-stone-200">{submittedApp.district}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400">प्रखंड / Block:</span>
                            <p className="font-semibold text-stone-200">{submittedApp.block}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400">पंजीकरण आईडी:</span>
                            <p className="font-mono text-[11px] text-amber-400 font-bold">{submittedApp.id}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-700 flex items-end justify-between text-[10px] text-stone-300">
                        <div>
                          <p className="font-semibold text-stone-400">जारी दिनांक: {submittedApp.appliedDate}</p>
                          <p className="text-[9px] text-stone-500">वैधता: 2026-2027 वार्षिक</p>
                        </div>

                        <div className="text-center">
                          <div className="font-serif italic font-bold text-amber-200 text-xs">
                            Rajesh Kr. Sahu
                          </div>
                          <p className="text-[9px] text-stone-400 border-t border-stone-600 pt-0.5">
                            मुख्य संपादक (Chief Editor)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={resetForm}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-stone-700 hover:text-stone-900 text-xs font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>नया आवेदन भरें</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>प्रेस कार्ड प्रिंट करें</span>
                      </button>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition"
                      >
                        पोर्टल पर वापस जाएं
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
