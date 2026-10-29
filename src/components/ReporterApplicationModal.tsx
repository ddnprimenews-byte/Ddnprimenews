'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  X, UserCheck, Upload, CheckCircle2, Printer, 
  ShieldCheck, Award, FileText, ArrowLeft, Download, AlertCircle,
  Mail, Send, Check, RefreshCw, MapPin, Building, Flag, Lock, Copy
} from 'lucide-react';
import { ReporterApplication } from '../types/news';
import { reporterApplicationSchema, ReporterApplicationInput } from '../lib/validations';
import { compressImageToWebp } from '../lib/mediaOptimization';

interface ReporterApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// All Indian States & UTs
const INDIAN_STATES = [
  'बिहार (Bihar)',
  'उत्तर प्रदेश (Uttar Pradesh)',
  'झारखंड (Jharkhand)',
  'पश्चिम बंगाल (West Bengal)',
  'दिल्ली (Delhi - NCR)',
  'मध्य प्रदेश (Madhya Pradesh)',
  'राजस्थान (Rajasthan)',
  'महाराष्ट्र (Maharashtra)',
  'गुजरात (Gujarat)',
  'हरियाणा (Haryana)',
  'पंजाब (Punjab)',
  'उत्तराखंड (Uttarakhand)',
  'छत्तीसगढ़ (Chhattisgarh)',
  'ओडिशा (Odisha)',
  'असम (Assam)',
  'अन्य राज्य / केंद्र शासित प्रदेश (Other)'
];

// District catalogs by State
const DISTRICTS_MAP: Record<string, string[]> = {
  'बिहार (Bihar)': [
    'दरभंगा (Darbhanga)',
    'मधुबनी (Madhubani)',
    'समस्तीपुर (Samastipur)',
    'मुजफ्फरपुर (Muzaffarpur)',
    'सीतामढ़ी (Sitamarhi)',
    'पटना (Patna)',
    'बेगूसराय (Begusarai)',
    'सहरसा (Saharsa)',
    'सुपौल (Supaul)',
    'मधेपुरा (Madhepura)',
    'पूर्णिया (Purnea)',
    'कटिहार (Katihar)',
    'किशनगंज (Kishanganj)',
    'अररिया (Araria)',
    'भागलपुर (Bhagalpur)',
    'बांका (Banka)',
    'मुंगेर (Munger)',
    'खगड़िया (Khagaria)',
    'जमुई (Jamui)',
    'लखीसराय (Lakhisarai)',
    'शेखपुरा (Sheikhpura)',
    'नालंदा (Nalanda)',
    'गया (Gaya)',
    'नवादा (Nawada)',
    'औरंगाबाद (Aurangabad)',
    'जहानाबाद (Jehanabad)',
    'अरवल (Arwal)',
    'रोहतास (Rohtas)',
    'कैमूर (Kaimur)',
    'बक्सर (Buxar)',
    'भोजपुर (Bhojpur)',
    'सारण / छपरा (Saran)',
    'सीवान (Siwan)',
    'गोपालगंज (Gopalganj)',
    'वैशाली (Vaishali)',
    'पूर्वी चंपारण (East Champaran)',
    'पश्चिमी चंपारण (West Champaran)',
    'शिवहर (Sheohar)',
    'अन्य जिला (मैन्युअल टाइप करें)'
  ],
  'उत्तर प्रदेश (Uttar Pradesh)': [
    'वाराणसी', 'गोरखपुर', 'लखनऊ', 'प्रयागराज', 'अयोध्या', 'गाजियाबाद', 'नोएडा', 'कानपुर', 'अन्य जिला (मैन्युअल टाइप करें)'
  ],
  'झारखंड (Jharkhand)': [
    'रांची', 'धनबाद', 'जमशेदपुर', 'बोकारो', 'देवघर', 'दुमका', 'हजारीबाग', 'अन्य जिला (मैन्युअल टाइप करें)'
  ],
  'पश्चिम बंगाल (West Bengal)': [
    'कोलकाता', 'सिलीगुड़ी', 'हावड़ा', 'मालदा', 'उत्तर दिनाजपुर', 'अन्य जिला (मैन्युअल टाइप करें)'
  ],
  'दिल्ली (Delhi - NCR)': [
    'नई दिल्ली', 'उत्तर दिल्ली', 'दक्षिण दिल्ली', 'पूर्वी दिल्ली', 'पश्चिमी दिल्ली', 'अन्य जिला (मैन्युअल टाइप करें)'
  ],
};

export const ReporterApplicationModal: React.FC<ReporterApplicationModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Selected state & district mode
  const [selectedState, setSelectedState] = useState<string>('बिहार (Bihar)');
  const [isCustomDistrict, setIsCustomDistrict] = useState<boolean>(false);
  const [customDistrictText, setCustomDistrictText] = useState<string>('');

  // Email Security Verification (OTP) State
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>('');
  const [otpSuccess, setOtpSuccess] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset: resetHookForm,
  } = useForm<ReporterApplicationInput>({
    resolver: zodResolver(reporterApplicationSchema),
    defaultValues: {
      fullName: '',
      fatherName: '',
      motherName: '',
      mobile: '',
      whatsapp: '',
      email: '',
      state: 'बिहार (Bihar)',
      district: 'दरभंगा (Darbhanga)',
      block: '',
      panchayat: '',
      qualification: 'स्नातक (Graduate)',
      experience: 'फ्रेशर (नया पत्रकार)',
      beatPreference: 'ग्रामीण विकास एवं जनसमस्याएं',
      agreement: false,
    },
  });

  const currentEmail = watch('email');

  // Reset verification if user changes their email
  useEffect(() => {
    if (isEmailVerified) {
      setIsEmailVerified(false);
      setOtpSent(false);
      setOtpSuccess('');
    }
  }, [currentEmail]);

  // OTP Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofName, setIdProofName] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<ReporterApplication | null>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle State Change
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setValue('state', newState);

    const available = DISTRICTS_MAP[newState] || ['अन्य जिला (मैन्युअल टाइप करें)'];
    if (available.length > 0 && available[0] !== 'अन्य जिला (मैन्युअल टाइप करें)') {
      setIsCustomDistrict(false);
      setValue('district', available[0]);
    } else {
      setIsCustomDistrict(true);
      setValue('district', '');
    }
  };

  // Handle District Change
  const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'अन्य जिला (मैन्युअल टाइप करें)') {
      setIsCustomDistrict(true);
      setValue('district', customDistrictText);
    } else {
      setIsCustomDistrict(false);
      setValue('district', val);
    }
  };

  // Handle Custom District Text Typing
  const handleCustomDistrictInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomDistrictText(text);
    setValue('district', text);
  };

  // Handle Send Email OTP
  const handleSendOtp = async () => {
    setOtpError('');
    setOtpSuccess('');

    const emailToVerify = currentEmail?.trim();
    if (!emailToVerify || !emailToVerify.includes('@')) {
      setOtpError('कृपया पहले एक मान्य ईमेल पता दर्ज करें।');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/reporter/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: emailToVerify }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || 'ओटीपी भेजने में विफलता। कृपया पुनः प्रयास करें।');
        return;
      }

      setOtpSent(true);
      setCountdown(60);
      setOtpSuccess(
        data.message || `सत्यापन कोड (OTP) आपकी ईमेल आईडी (${emailToVerify}) पर सफलतापूर्वक भेज दिया गया है। कृपया अपना इनबॉक्स या स्पैम (Spam) फोल्डर देखें।`
      );
    } catch (err: any) {
      setOtpError('ओटीपी सेवा से संपर्क नहीं हो सका: ' + err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Verify Email OTP
  const handleVerifyOtp = async () => {
    setOtpError('');
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setOtpError('कृपया सही 6 अंकों का ओटीपी दर्ज करें।');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/reporter/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: currentEmail?.trim(),
          otp: enteredOtp.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || 'ओटीपी सत्यापन विफल हुआ। कृपया सही कोड दर्ज करें।');
        return;
      }

      setIsEmailVerified(true);
      setOtpSuccess('ईमेल आईडी सफलतापूर्वक सत्यापित हो गई! ✓ अब आप आवेदन जमा कर सकते हैं।');
    } catch (err: any) {
      setOtpError('सत्यापन में त्रुटि: ' + err.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('कृपया केवल वैध फोटो (JPG, PNG, WEBP) ही अपलोड करें।');
        return;
      }
      try {
        const compressed = await compressImageToWebp(file, {
          maxWidth: 600,
          maxHeight: 800,
          maxSizeKb: 80,
          targetFormat: 'image/webp',
          initialQuality: 0.85,
        });
        setPhotoFile(compressed.file);
        setPhotoPreview(compressed.dataUrl);
      } catch (err) {
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
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
    // 1. Mandatory Email OTP Verification Check
    if (!isEmailVerified) {
      setFirebaseError('कृपया पहले "ओटीपी भेजें" पर क्लिक करके अपनी ईमेल आईडी का सत्यापन करें।');
      return;
    }

    setFirebaseError(null);
    const regId = `DDN-REP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    let finalPhotoUrl = photoPreview || '/images/ddn_reporter_press.jpg';
    let idDocUrl = '';

    try {
      const { uploadReporterPhoto, uploadReporterIdDocument, submitReporterApplicationToFirestore } = await import('../lib/firebase');

      // Upload photo
      if (photoFile) {
        try {
          finalPhotoUrl = await uploadReporterPhoto(photoFile, regId);
        } catch (storageErr: any) {
          console.warn('Storage photo note:', storageErr.message);
        }
      }

      // Upload ID document
      if (idProofFile) {
        try {
          idDocUrl = await uploadReporterIdDocument(idProofFile, regId);
        } catch (idErr: any) {
          console.warn('Storage ID document note:', idErr.message);
        }
      }

      const newApp: ReporterApplication = {
        id: regId,
        fullName: validData.fullName,
        fatherName: validData.fatherName,
        motherName: validData.motherName,
        mobile: validData.mobile,
        whatsapp: validData.whatsapp,
        email: validData.email,
        isEmailVerified: true,
        nationality: 'भारतीय / Indian',
        state: validData.state || selectedState,
        district: validData.district,
        block: validData.block,
        panchayat: validData.panchayat,
        workArea: `${validData.block}, ${validData.panchayat}`,
        qualification: validData.qualification,
        experience: validData.experience,
        beatPreference: validData.beatPreference,
        photoUrl: finalPhotoUrl,
        idDocumentUrl: idDocUrl,
        appliedDate: new Date().toLocaleDateString('hi-IN'),
        status: 'pending',
      };

      // Persist to genuine Firestore
      await submitReporterApplicationToFirestore(newApp);

      // Modular API sync
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
      setFirebaseError(err?.message || 'डेटाबेस में आवेदन सुरक्षित करने में समस्या। कृपया पुनः प्रयास करें।');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setSubmittedApp(null);
    setPhotoPreview(null);
    setIdProofName(null);
    setIsEmailVerified(false);
    setOtpSent(false);
    setEnteredOtp('');
    setCopiedRef(false);
    resetHookForm();
  };

  const districtsList = DISTRICTS_MAP[selectedState] || ['अन्य जिला (मैन्युअल टाइप करें)'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-auto overflow-hidden border border-stone-200 animate-in fade-in duration-200 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="bg-[#800000] text-white px-5 py-4 flex items-center justify-between shrink-0 border-b-2 border-red-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400 text-[#800000] flex items-center justify-center font-black shadow-inner">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif">
                डीडीएन प्राइम न्यूज - पत्रकार / रिपोर्टर पंजीकरण पोर्टल
              </h2>
              <p className="text-[11px] text-amber-200">
                दरभंगा डिजिटल नेटवर्क (MSME Registered) · राष्ट्रीय एवं राज्य स्तरीय भर्ती 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-200 hover:text-white hover:bg-red-900 transition cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-7 flex-grow font-sans">
          {!submittedApp ? (
            /* Application Form */
            <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-5">
              
              {/* Highlight Banner */}
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
                <Award className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">सच्ची, निष्पक्ष और निर्भीक पत्रकारिता का हिस्सा बनें:</strong> डीडीएन प्राइम न्यूज बिहार और देश भर के सभी राज्यों, जिलों व प्रखंडों में जागरूक पत्रकारों व संवाददाताओं को प्रेस मान्यता अवसर प्रदान कर रहा है। सभी विवरण दर्ज कर डिजिटल सत्यापन पूर्ण करें।
                </div>
              </div>

              {firebaseError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{firebaseError}</span>
                </div>
              )}

              {/* SECTION 1: PERSONAL DETAILS (Full Name, Father, Mother, Nationality) */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3.5">
                <div className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                  <UserCheck className="w-4 h-4 text-red-700" />
                  <span>1. आवेदक का व्यक्तिगत विवरण (Personal Details)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      आवेदक का पूरा नाम (Full Name) *
                    </label>
                    <input
                      type="text"
                      {...register('fullName')}
                      placeholder="उदा. राहुल कुमार शर्मा"
                      className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none bg-white ${
                        errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Father's Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      पिता/संरक्षक का नाम (Father's Name) *
                    </label>
                    <input
                      type="text"
                      {...register('fatherName')}
                      placeholder="उदा. श्री रामचंद्र शर्मा"
                      className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none bg-white ${
                        errors.fatherName ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                      }`}
                    />
                    {errors.fatherName && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.fatherName.message}</p>
                    )}
                  </div>

                  {/* Mother's Name (Requested Field) */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      माता का नाम (Mother's Name) *
                    </label>
                    <input
                      type="text"
                      {...register('motherName')}
                      placeholder="उदा. श्रीमती कौशल्या देवी"
                      className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none bg-white ${
                        errors.motherName ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                      }`}
                    />
                    {errors.motherName && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.motherName.message}</p>
                    )}
                  </div>

                  {/* Nationality (Fixed to Indian) */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                      <span>राष्ट्रीयता (Nationality) *</span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        निर्धारित (Fixed)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value="भारतीय / Indian"
                        readOnly
                        disabled
                        className="w-full p-2.5 text-sm border border-stone-200 bg-stone-100 rounded-lg text-stone-700 font-semibold cursor-not-allowed select-none pl-8"
                      />
                      <Flag className="w-4 h-4 text-emerald-600 absolute left-2.5 top-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT & MANDATORY EMAIL OTP VERIFICATION */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3.5">
                <div className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-red-700" />
                    <span>2. संपर्क एवं ईमेल सुरक्षा सत्यापन (Contact & Security Verification)</span>
                  </div>
                  {isEmailVerified && (
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> सत्यापित (Verified)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      मोबाइल नंबर (Contact Number) *
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      {...register('mobile')}
                      placeholder="उदा. 9876543210"
                      className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none font-mono bg-white ${
                        errors.mobile ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                      }`}
                    />
                    {errors.mobile && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.mobile.message}</p>
                    )}
                  </div>

                  {/* WhatsApp Number (Now Strictly Mandatory) */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      व्हाट्सएप नंबर (WhatsApp Number) * <span className="text-red-600 text-[10px] font-normal">(अनिवार्य)</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      {...register('whatsapp')}
                      placeholder="उदा. 9876543210"
                      className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none font-mono bg-white ${
                        errors.whatsapp ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                      }`}
                    />
                    {errors.whatsapp && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.whatsapp.message}</p>
                    )}
                  </div>
                </div>

                {/* Email Input + Interactive Security OTP System */}
                <div className="space-y-2 pt-1 border-t border-stone-200">
                  <label className="block text-xs font-bold text-stone-700">
                    ईमेल आईडी एवं सुरक्षा सत्यापन (Email & OTP Verification) *
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                      <input
                        type="email"
                        {...register('email')}
                        disabled={isEmailVerified}
                        placeholder="yourname@gmail.com"
                        className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none bg-white pr-24 ${
                          errors.email ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                        } ${isEmailVerified ? 'bg-emerald-50/60 border-emerald-400 text-emerald-950 font-medium cursor-not-allowed' : ''}`}
                      />
                      {isEmailVerified && (
                        <span className="absolute right-3 top-2.5 text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-4 h-4" /> सत्यापित
                        </span>
                      )}
                    </div>

                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || countdown > 0}
                        className="px-4 py-2.5 bg-red-700 hover:bg-red-800 disabled:bg-stone-300 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                      >
                        {isSendingOtp ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>भेजा जा रहा है...</span>
                          </>
                        ) : countdown > 0 ? (
                          <span>पुनः भेजें ({countdown}s)</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{otpSent ? 'ओटीपी पुनः भेजें' : 'ओटीपी भेजें (Send OTP)'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.email.message}</p>
                  )}

                  {/* OTP INPUT BOX (Displayed when OTP is sent and not yet verified) */}
                  {otpSent && !isEmailVerified && (
                    <div className="p-3 bg-white border-2 border-dashed border-red-300 rounded-xl space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-red-600" />
                          <span>ईमेल पर भेजा गया 6 अंकों का ओटीपी दर्ज करें:</span>
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>ईमेल पर भेजा गया</span>
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-अंकों का OTP (उदा. 482910)"
                          className="flex-grow p-2 text-sm font-mono tracking-widest text-center border-2 border-stone-300 rounded-lg focus:border-red-600 focus:outline-none font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={isVerifyingOtp || enteredOtp.length !== 6}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          {isVerifyingOtp ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>सत्यापित करें</span>
                        </button>
                      </div>

                      {otpError && (
                        <p className="text-[11px] text-red-600 font-semibold">{otpError}</p>
                      )}
                      {otpSuccess && (
                        <p className="text-[11px] text-emerald-700 font-semibold">{otpSuccess}</p>
                      )}
                    </div>
                  )}

                  {!isEmailVerified && (
                    <p className="text-[11px] text-stone-500 italic">
                      🔒 सुरक्षा नियम: आवेदन करने से पहले ईमेल ओटीपी सत्यापन अनिवार्य है।
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION 3: LOCATION & COVERAGE AREA (State -> District Selection or Typing -> Block -> Work Area) */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3.5">
                <div className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                  <MapPin className="w-4 h-4 text-red-700" />
                  <span>3. कार्यक्षेत्र एवं भौगोलिक विवरण (State, District & Work Area)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* State Selection */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      राज्य (State) *
                    </label>
                    <select
                      value={selectedState}
                      onChange={handleStateChange}
                      className="w-full p-2.5 text-sm border border-stone-300 rounded-lg focus:border-red-600 focus:outline-none bg-white cursor-pointer font-medium"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* District Selection & Manual Typing Mode */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">
                        जिला (District) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomDistrict(!isCustomDistrict);
                          if (!isCustomDistrict) {
                            setValue('district', customDistrictText);
                          } else {
                            setValue('district', districtsList[0]);
                          }
                        }}
                        className="text-[11px] text-red-700 font-semibold hover:underline cursor-pointer"
                      >
                        {isCustomDistrict ? '📋 सूची से चुनें' : '✏️ जिला टाइप करें'}
                      </button>
                    </div>

                    {!isCustomDistrict ? (
                      <select
                        onChange={handleDistrictSelect}
                        value={watch('district')}
                        className="w-full p-2.5 text-sm border border-stone-300 rounded-lg focus:border-red-600 focus:outline-none bg-white cursor-pointer"
                      >
                        {districtsList.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={customDistrictText}
                        onChange={handleCustomDistrictInput}
                        placeholder="जिले का नाम लिखें (उदा. दरभंगा, पटना, वाराणसी...)"
                        className="w-full p-2.5 text-sm border border-red-400 rounded-lg focus:border-red-700 focus:outline-none bg-white font-medium"
                      />
                    )}
                    {errors.district && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.district.message}</p>
                    )}
                  </div>

                  {/* Block / Tehsil */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      प्रखंड / तहसील (Block / Tehsil) *
                    </label>
                    <input
                      type="text"
                      {...register('block')}
                      placeholder="उदा. क्यूटी, बहादुरपुर, सदर, बेनीपुर"
                      className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none bg-white ${
                        errors.block ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                      }`}
                    />
                    {errors.block && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.block.message}</p>
                    )}
                  </div>

                  {/* Work Area / Beat / Panchayat */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      कार्यक्षेत्र / पंचायत / वार्ड (Work Area / Beat) *
                    </label>
                    <input
                      type="text"
                      {...register('panchayat')}
                      placeholder="उदा. पैगंबरपुर पंचायत / वार्ड संख्या 9 / प्रखंड मुख्यालय"
                      className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none bg-white ${
                        errors.panchayat ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                      }`}
                    />
                    {errors.panchayat && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.panchayat.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: QUALIFICATIONS & JOURNALISTIC BEAT */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    शैक्षणिक योग्यता
                  </label>
                  <select
                    {...register('qualification')}
                    className="w-full p-2.5 text-sm border border-stone-300 rounded-lg focus:border-red-600 focus:outline-none bg-white cursor-pointer"
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
                    className="w-full p-2.5 text-sm border border-stone-300 rounded-lg focus:border-red-600 focus:outline-none bg-white cursor-pointer"
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
                    className="w-full p-2.5 text-sm border border-stone-300 rounded-lg focus:border-red-600 focus:outline-none bg-white cursor-pointer"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पासपोर्ट साइज फोटो अपलोड करें
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 transition">
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
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-300 shadow-xs">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    आधार / पहचान पत्र (ID Proof)
                  </label>
                  <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 transition">
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

              {/* SECTION 5: COMPREHENSIVE TERMS, CONDITIONS & CODE OF ETHICS PORTFOLIO */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-700" />
                  <span>पत्रकार आचार संहिता एवं रिपोर्टिंग नियमावली पोर्टफोलियो (Code of Ethics & Guidelines) *</span>
                </label>

                {/* Detailed Scrollable Portfolio Box */}
                <div className="max-h-48 overflow-y-auto p-4 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-700 space-y-3 leading-relaxed shadow-inner">
                  <div className="font-bold text-stone-900 border-b border-stone-200 pb-1 text-center font-serif text-sm">
                    डीडीएन प्राइम न्यूज़ (दरभंगा डिजिटल नेटवर्क) — अधिकृत संवाददाता आचार संहिता 2026
                  </div>

                  <div className="space-y-2 text-[11.5px]">
                    <p>
                      <strong>1. सत्यता एवं प्रमाणिकता (Accuracy & Fact-Checking):</strong> प्रत्येक संवाददाता किसी भी समाचार या वीडियो बुलेटिन को भेजने से पूर्व उसके तथ्यों, स्थानीय साक्ष्यों, स्थल निरीक्षण एवं निष्पक्ष पुष्टि की शत-प्रतिशत गारंटी लेगा। बिना प्रमाण के किसी पर आरोप लगाना सख्त वर्जित है।
                    </p>
                    <p>
                      <strong>2. ब्लैकमेलिंग व अनुचित लाभ पर पूर्ण निषेध (Zero Tolerance for Extortion):</strong> डीडीएन प्राइम न्यूज़ का प्रेस कार्ड केवल निष्पक्ष पत्रकारिता कार्य हेतु दिया जाता है। इसका उपयोग किसी अधिकारी, व्यापारी अथवा आम नागरिक को भयभीत करने, अवैध वसूली, ब्लैकमेलिंग अथवा व्यक्तिगत लाभ हेतु करना अत्यंत गंभीर आपराधिक अपराध है। ऐसा पाए जाने पर सदस्यता तुरंत निरस्त कर पुलिस कार्रवाई की जाएगी।
                    </p>
                    <p>
                      <strong>3. महिला व बाल सुरक्षा नियम (POCSO & Victim Privacy):</strong> पॉक्सो एक्ट, बलात्कार पीड़िता, पारिवारिक विवाद अथवा नाबालिग बच्चों की पहचान को गुप्त रखना अनिवार्य है। किसी भी स्थिति में पीड़िता की तस्वीर या पहचान उजागर नहीं की जाएगी।
                    </p>
                    <p>
                      <strong>4. सामाजिक सौहार्द एवं निष्पक्षता (Communal Harmony):</strong> किसी भी जाति, धर्म, संप्रदाय अथवा वर्ग के विरुद्ध वैमनस्य फैलाने वाली या शांति भंग करने वाली खबरें पूर्णतः प्रतिबंधित हैं।
                    </p>
                    <p>
                      <strong>5. संपादकीय अधिकार एवं नियंत्रण (Editorial Prerogative):</strong> मुख्य संपादक एवं संपादकीय मंडल को समाचार के संपादन, शीर्षक निर्धारण, प्रकाशन अथवा अस्वीकृति का अंतिम और अनन्य अधिकार होगा।
                    </p>
                    <p>
                      <strong>6. गैर-आपराधिक स्व-घोषणा (Clean Criminal Record Declaration):</strong> आवेदक घोषणा करता/करती है कि उसके ऊपर किसी भी न्यायालय या थाने में कोई धोखाधड़ी, वसूली अथवा गंभीर आपराधिक मामला दर्ज नहीं है।
                    </p>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <label className="flex items-start space-x-2.5 text-xs text-stone-800 cursor-pointer pt-1 font-medium">
                  <input
                    type="checkbox"
                    {...register('agreement')}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500 cursor-pointer w-4 h-4"
                  />
                  <span>
                    मैंने डीडीएन प्राइम न्यूज़ की उक्त सभी रिपोर्टिंग नियमावली एवं आचार संहिता (Terms & Code of Ethics) को ध्यानपूर्वक पढ़ लिया है और मैं इसका अक्षरशः पालन करने की शपथ लेता/लेती हूँ।
                  </span>
                </label>
                {errors.agreement && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.agreement.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isEmailVerified}
                  className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer ${
                    isEmailVerified
                      ? 'bg-red-700 hover:bg-red-800 active:scale-98'
                      : 'bg-stone-400 cursor-not-allowed opacity-80'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'डेटा सत्यापित एवं पंजीकृत किया जा रहा है...'
                      : !isEmailVerified
                      ? 'पहले ईमेल ओटीपी सत्यापित करें (Verify Email to Apply)'
                      : 'आवेदन जमा करें एवं पावती प्राप्त करें'}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* Application Submitted View: Printable Acknowledgement Receipt */
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-4">
                {/* Prominent Reference Number Card */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 shadow-sm text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>आवेदन सफलतापूर्वक प्राप्त हुआ (Application Submitted)</span>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-stone-600 mb-1">
                      पंजीकरण संदर्भ संख्या (Registration Reference No):
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-950 bg-white px-5 py-2 rounded-xl border-2 border-emerald-300 shadow-inner tracking-wider select-all">
                        {submittedApp.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(submittedApp.id);
                          setCopiedRef(true);
                          setTimeout(() => setCopiedRef(false), 2500);
                        }}
                        className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Copy className="w-4 h-4" />
                        <span>{copiedRef ? 'कॉपी हो गया! ✓' : 'कॉपी करें'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/80 text-xs text-emerald-900 font-medium flex items-center justify-center gap-2 flex-wrap">
                    <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      मुख्य संपादक के पते व हेल्पलाइन सहित आधिकारिक स्वागत पत्र आपकी ईमेल (<strong>{submittedApp.email}</strong>) पर भेज दिया गया है।
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl flex items-start gap-3 text-amber-950 text-xs sm:text-sm shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-amber-950 font-serif">
                      सत्यापन प्रक्रियाधीन (Under Editorial Verification)
                    </h4>
                    <p className="text-amber-900 text-xs mt-1 leading-relaxed">
                      आपका आवेदन DDN Prime News मुख्य संपादकीय डेस्क के पास समीक्षा हेतु पहुंच गया है। पहचान पत्र एवं दस्तावेजों की पुष्टि के उपरांत डिजिटल प्रेस मान्यता कार्ड जारी किया जाएगा।
                    </p>
                  </div>
                </div>

                {/* Printable Acknowledgement Receipt */}
                <div id="printable-press-card" className="border-2 border-stone-300 rounded-xl bg-white p-6 shadow-sm font-sans space-y-4">
                  <div className="border-b border-stone-200 pb-4 text-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded">
                      संवाददाता भर्ती पावती रसीद / APPLICATION RECEIPT
                    </span>
                    <h3 className="text-xl font-bold font-headline text-stone-900 mt-2">
                      DDN PRIME NEWS (डीडीएन प्राइम न्यूज)
                    </h3>
                    <p className="text-xs text-stone-500">दरभंगा डिजिटल नेटवर्क — MSME Registered (UDYAM-BR-09-0028491)</p>
                  </div>

                  <div className="py-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
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
                        <span className="text-stone-500">माता का नाम:</span>
                        <span className="text-stone-900">{submittedApp.motherName || '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-100 py-1">
                        <span className="text-stone-500">राष्ट्रीयता:</span>
                        <span className="font-semibold text-emerald-800">भारतीय / Indian</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-100 py-1">
                        <span className="text-stone-500">राज्य एवं जिला:</span>
                        <span className="font-semibold text-stone-900">{submittedApp.state} / {submittedApp.district}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-100 py-1">
                        <span className="text-stone-500">प्रखंड एवं कार्यक्षेत्र:</span>
                        <span className="text-stone-900">{submittedApp.block} / {submittedApp.panchayat}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-100 py-1">
                        <span className="text-stone-500">मोबाइल व व्हाट्सएप:</span>
                        <span className="font-mono text-stone-900">{submittedApp.mobile} / {submittedApp.whatsapp}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-100 py-1">
                        <span className="text-stone-500">ईमेल आईडी:</span>
                        <span className="text-emerald-700 font-semibold">{submittedApp.email} (सत्यापित ✓)</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-100 py-1">
                        <span className="text-stone-500">आवेदन तिथि:</span>
                        <span className="text-stone-900">{submittedApp.appliedDate}</span>
                      </div>
                      <div className="flex justify-between py-1 items-center">
                        <span className="text-stone-500">सत्यापन स्थिति:</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          संपादकीय समीक्षाधीन (Under Review)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 bg-stone-50 rounded-lg border border-stone-200">
                      {submittedApp.photoUrl && (
                        <div className="w-24 h-28 rounded-lg overflow-hidden border border-stone-300 mb-2 shadow-xs">
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

                  {/* Official Head Office & Chief Editor Details */}
                  <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1">
                    <div className="font-bold text-amber-900 flex items-center justify-between">
                      <span>प्रधान कार्यालय एवं मुख्य संपादकीय मंडल:</span>
                      <span className="font-mono text-[10px] bg-amber-200/80 px-2 py-0.5 rounded">UDYAM-BR-09-0028491</span>
                    </div>
                    <p className="text-[11px] text-stone-700 leading-relaxed">
                      <strong>प्रधान संपादक:</strong> श्री राजेश कुमार साहू (Rajesh Kumar Sahu)<br />
                      <strong>कार्यालय पता:</strong> वार्ड नंबर 9, पैगंबरपुर, पोस्ट- दरमा, थाना- क्यूटी, जिला- दरभंगा, बिहार - 847121<br />
                      <strong>हेल्पलाइन / संपर्क:</strong> +91 9341050287 | <strong>ईमेल:</strong> ddnprimenews@gmail.com
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 leading-relaxed bg-stone-50/60 p-2.5 rounded-lg">
                    <p className="font-semibold text-stone-700 mb-0.5">संपादकीय सत्यापन सूचना:</p>
                    यह केवल आवेदन पावती रसीद है। प्रेस काउंसिल ऑफ इंडिया एवं डीडीएन प्राइम न्यूज आचार संहिता के अनुसार, पहचान पत्र व पृष्ठभूमि सत्यापन के बाद मुख्य संपादक द्वारा अधिकृत प्रेस कार्ड जारी किया जाएगा।
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-stone-700 hover:text-stone-900 text-xs font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>नया आवेदन भरें</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>पावती रसीद प्रिंट करें</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
