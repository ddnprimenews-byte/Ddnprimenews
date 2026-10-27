/**
 * DDN Prime News - Official Location Master Data
 * Comprehensive lists of all 38 Districts of Bihar & All States / UTs of India
 */

export interface LocationItem {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  division?: string;
}

export const BIHAR_DISTRICTS: LocationItem[] = [
  // मिथिलांचल एवं दरभंगा प्रमंडल
  { id: 'darbhanga', nameHindi: 'दरभंगा', nameEnglish: 'Darbhanga', division: 'दरभंगा' },
  { id: 'madhubani', nameHindi: 'मधुबनी', nameEnglish: 'Madhubani', division: 'दरभंगा' },
  { id: 'samastipur', nameHindi: 'समस्तीपुर', nameEnglish: 'Samastipur', division: 'दरभंगा' },

  // तिरहुत प्रमंडल
  { id: 'muzaffarpur', nameHindi: 'मुजफ्फरपुर', nameEnglish: 'Muzaffarpur', division: 'तिरहुत' },
  { id: 'sitamarhi', nameHindi: 'सीतामढ़ी', nameEnglish: 'Sitamarhi', division: 'तिरहुत' },
  { id: 'sheohar', nameHindi: 'शिवहर', nameEnglish: 'Sheohar', division: 'तिरहुत' },
  { id: 'vaishali', nameHindi: 'वैशाली (हाजीपुर)', nameEnglish: 'Vaishali', division: 'तिरहुत' },
  { id: 'east-champaran', nameHindi: 'पूर्वी चंपारण (मोतिहारी)', nameEnglish: 'East Champaran', division: 'तिरहुत' },
  { id: 'west-champaran', nameHindi: 'पश्चिमी चंपारण (बेतिया)', nameEnglish: 'West Champaran', division: 'तिरहुत' },

  // पटना प्रमंडल
  { id: 'patna', nameHindi: 'पटना', nameEnglish: 'Patna', division: 'पटना' },
  { id: 'nalanda', nameHindi: 'नालंदा (बिहारशरीफ)', nameEnglish: 'Nalanda', division: 'पटना' },
  { id: 'bhojpur', nameHindi: 'भोजपुर (आरा)', nameEnglish: 'Bhojpur', division: 'पटना' },
  { id: 'buxar', nameHindi: 'बक्सर', nameEnglish: 'Buxar', division: 'पटना' },
  { id: 'rohtas', nameHindi: 'रोहतास (सासाराम)', nameEnglish: 'Rohtas', division: 'पटना' },
  { id: 'kaimur', nameHindi: 'कैमूर (भभुआ)', nameEnglish: 'Kaimur', division: 'पटना' },

  // मगध प्रमंडल
  { id: 'gaya', nameHindi: 'गया', nameEnglish: 'Gaya', division: 'मगध' },
  { id: 'nawada', nameHindi: 'नवादा', nameEnglish: 'Nawada', division: 'मगध' },
  { id: 'aurangabad', nameHindi: 'औरंगाबाद', nameEnglish: 'Aurangabad', division: 'मगध' },
  { id: 'jehanabad', nameHindi: 'जहानाबाद', nameEnglish: 'Jehanabad', division: 'मगध' },
  { id: 'arwal', nameHindi: 'अरवल', nameEnglish: 'Arwal', division: 'मगध' },

  // कोसी प्रमंडल
  { id: 'saharsa', nameHindi: 'सहरसा', nameEnglish: 'Saharsa', division: 'कोसी' },
  { id: 'supaul', nameHindi: 'सुपौल', nameEnglish: 'Supaul', division: 'कोसी' },
  { id: 'madhepura', nameHindi: 'मधेपुरा', nameEnglish: 'Madhepura', division: 'कोसी' },

  // पूर्णिया प्रमंडल
  { id: 'purnia', nameHindi: 'पूर्णिया', nameEnglish: 'Purnia', division: 'पूर्णिया' },
  { id: 'katihar', nameHindi: 'कटिहार', nameEnglish: 'Katihar', division: 'पूर्णिया' },
  { id: 'araria', nameHindi: 'अररिया', nameEnglish: 'Araria', division: 'पूर्णिया' },
  { id: 'kishanganj', nameHindi: 'किशनगंज', nameEnglish: 'Kishanganj', division: 'पूर्णिया' },

  // भागलपुर प्रमंडल
  { id: 'bhagalpur', nameHindi: 'भागलपुर', nameEnglish: 'Bhagalpur', division: 'भागलपुर' },
  { id: 'banka', nameHindi: 'बांका', nameEnglish: 'Banka', division: 'भागलपुर' },

  // मुंगेर प्रमंडल
  { id: 'munger', nameHindi: 'मुंगेर', nameEnglish: 'Munger', division: 'मुंगेर' },
  { id: 'begusarai', nameHindi: 'बेगूसराय', nameEnglish: 'Begusarai', division: 'मुंगेर' },
  { id: 'khagaria', nameHindi: 'खगड़िया', nameEnglish: 'Khagaria', division: 'मुंगेर' },
  { id: 'lakhisarai', nameHindi: 'लखीसराय', nameEnglish: 'Lakhisarai', division: 'मुंगेर' },
  { id: 'sheikhpura', nameHindi: 'शेखपुरा', nameEnglish: 'Sheikhpura', division: 'मुंगेर' },
  { id: 'jamui', nameHindi: 'जमुई', nameEnglish: 'Jamui', division: 'मुंगेर' },

  // सारण प्रमंडल
  { id: 'saran', nameHindi: 'सारण (छपरा)', nameEnglish: 'Saran', division: 'सारण' },
  { id: 'siwan', nameHindi: 'सीवान', nameEnglish: 'Siwan', division: 'सारण' },
  { id: 'gopalganj', nameHindi: 'गोपालगंज', nameEnglish: 'Gopalganj', division: 'सारण' },
];

export const INDIA_STATES: LocationItem[] = [
  // 28 राज्य
  { id: 'bihar', nameHindi: 'बिहार', nameEnglish: 'Bihar' },
  { id: 'uttar-pradesh', nameHindi: 'उत्तर प्रदेश', nameEnglish: 'Uttar Pradesh' },
  { id: 'delhi', nameHindi: 'दिल्ली (NCR)', nameEnglish: 'Delhi NCR' },
  { id: 'maharashtra', nameHindi: 'महाराष्ट्र', nameEnglish: 'Maharashtra' },
  { id: 'west-bengal', nameHindi: 'पश्चिम बंगाल', nameEnglish: 'West Bengal' },
  { id: 'madhya-pradesh', nameHindi: 'मध्य प्रदेश', nameEnglish: 'Madhya Pradesh' },
  { id: 'rajasthan', nameHindi: 'राजस्थान', nameEnglish: 'Rajasthan' },
  { id: 'gujarat', nameHindi: 'गुजरात', nameEnglish: 'Gujarat' },
  { id: 'jharkhand', nameHindi: 'झारखंड', nameEnglish: 'Jharkhand' },
  { id: 'punjab', nameHindi: 'पंजाब', nameEnglish: 'Punjab' },
  { id: 'haryana', nameHindi: 'हरियाणा', nameEnglish: 'Haryana' },
  { id: 'odisha', nameHindi: 'ओडिशा', nameEnglish: 'Odisha' },
  { id: 'chhattisgarh', nameHindi: 'छत्तीसगढ़', nameEnglish: 'Chhattisgarh' },
  { id: 'uttarakhand', nameHindi: 'उत्तराखंड', nameEnglish: 'Uttarakhand' },
  { id: 'himachal-pradesh', nameHindi: 'हिमाचल प्रदेश', nameEnglish: 'Himachal Pradesh' },
  { id: 'assam', nameHindi: 'असम', nameEnglish: 'Assam' },
  { id: 'karnataka', nameHindi: 'कर्नाटक', nameEnglish: 'Karnataka' },
  { id: 'tamil-nadu', nameHindi: 'तमिलनाडु', nameEnglish: 'Tamil Nadu' },
  { id: 'telangana', nameHindi: 'तेलंगाना', nameEnglish: 'Telangana' },
  { id: 'andhra-pradesh', nameHindi: 'आंध्र प्रदेश', nameEnglish: 'Andhra Pradesh' },
  { id: 'kerala', nameHindi: 'केरल', nameEnglish: 'Kerala' },
  { id: 'goa', nameHindi: 'गोवा', nameEnglish: 'Goa' },
  { id: 'tripura', nameHindi: 'त्रिपुरा', nameEnglish: 'Tripura' },
  { id: 'manipur', nameHindi: 'मणिपुर', nameEnglish: 'Manipur' },
  { id: 'meghalaya', nameHindi: 'मेघालय', nameEnglish: 'Meghalaya' },
  { id: 'nagaland', nameHindi: 'नगालैंड', nameEnglish: 'Nagaland' },
  { id: 'mizoram', nameHindi: 'मिजोरम', nameEnglish: 'Mizoram' },
  { id: 'arunachal-pradesh', nameHindi: 'अरुणाचल प्रदेश', nameEnglish: 'Arunachal Pradesh' },
  { id: 'sikkim', nameHindi: 'सिक्किम', nameEnglish: 'Sikkim' },

  // केंद्र शासित प्रदेश (UTs)
  { id: 'jammu-kashmir', nameHindi: 'जम्मू-कश्मीर', nameEnglish: 'Jammu & Kashmir' },
  { id: 'ladakh', nameHindi: 'लद्दाख', nameEnglish: 'Ladakh' },
  { id: 'chandigarh', nameHindi: 'चंडीगढ़', nameEnglish: 'Chandigarh' },
  { id: 'puducherry', nameHindi: 'पुडुचेरी', nameEnglish: 'Puducherry' },
  { id: 'andaman-nicobar', nameHindi: 'अंडमान व निकोबार', nameEnglish: 'Andaman & Nicobar' },
  { id: 'dadra-nagar-haveli', nameHindi: 'दादरा व नगर हवेली / दमन-दीव', nameEnglish: 'DNH & DD' },
  { id: 'lakshadweep', nameHindi: 'लक्षद्वीप', nameEnglish: 'Lakshadweep' },
];
