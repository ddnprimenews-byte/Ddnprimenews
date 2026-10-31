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

/**
 * बिहार के सभी 38 जिलों के आधिकारिक प्रखंड (Blocks/Tehsils)
 */
export const BIHAR_DISTRICT_BLOCKS: Record<string, string[]> = {
  'darbhanga': [
    'बेनीपुर', 'बहादुरपुर', 'दरभंगा सदर', 'केवटी', 'जाले', 'मनीगाछी', 
    'अलीनगर', 'बिरौल', 'गौड़ाबौराम', 'कुशेश्वरस्थान', 'कुशेश्वरस्थान पूर्वी', 
    'घनश्यामपुर', 'हायाघाट', 'हनुमाननगर', 'सिंहवाड़ा', 'बहेड़ी', 'किरतपुर', 'तारडीह'
  ],
  'madhubani': [
    'रहिका (सदर)', 'बेनीपट्टी', 'जयनगर', 'झंझारपुर', 'बाबूबरही', 'खजौली', 
    'राजनगर', 'लदनियां', 'लौकहा', 'अंधराठाढ़ी', 'मधेपुर', 'पंडौल', 'बिस्फी', 
    'हरलाखी', 'घोघरडीहा', 'फुलपरास', 'लखनौर', 'कलुआही', 'बासोपट्टी', 'खुटौना', 'मदनपुर'
  ],
  'samastipur': [
    'समस्तीपुर सदर', 'कल्याणपुर', 'वारिसनगर', 'रोसड़ा', 'दलसिंहसराय', 'ताजपुर', 
    'पूसा', 'सरायरंजन', 'मोरवा', 'पटोरी', 'मोहनपुर', 'मोहिउद्दीननगर', 
    'विभूतिपुर', 'सिंघिया', 'हसनपुर', 'बिथान', 'उजियारपुर', 'खानपुर', 'शिवाजीनगर', 'विद्यापतिनगर'
  ],
  'muzaffarpur': [
    'मुशहरी (सदर)', 'कांटी', 'कुढ़नी', 'सकरा', 'बोचहां', 'गायघाट', 'बंदरा', 
    'औराई', 'कटरा', 'मीनापुर', 'मड़वन', 'सरैया', 'पारू', 'साहेबगंज', 'मोतीपुर'
  ],
  'sitamarhi': [
    'डुमरा (सदर)', 'सीतामढ़ी', 'बैरगनिया', 'सुरसंड', 'परिहार', 'रुन्नीसैदपुर', 
    'बेलसंड', 'नानपुर', 'बाजपट्टी', 'सोनबरसा', 'मेजरगंज', 'रीगा', 'बोखड़ा', 'चोरौत', 'परसौनी', 'सुप्पी'
  ],
  'patna': [
    'पटना सदर', 'दानापुर', 'फुलवारीशरीफ', 'फतुहा', 'बाढ़', 'मोकामा', 'बख्तियारपुर', 
    'बिहटा', 'मनेर', 'मसौढ़ी', 'पालीगंज', 'बिक्रम', 'नौबतपुर', 'संपतचक', 
    'खुसरूपुर', 'अथमलगोला', 'पंडारक', 'पुनपुन', 'धनरूआ', 'बेलछी', 'घोसवरी'
  ],
  'begusarai': [
    'बेगूसराय सदर', 'बरौनी', 'तेघड़ा', 'बखरी', 'बलिया', 'मटिहानी', 'साहेबपुर कमाल', 
    'शाम्हो', 'भगवानपुर', 'मंसूरचक', 'चेरिया बरियारपुर', 'छौड़ाही', 'डंडारी', 'गढ़पुरा', 'नावकोठी', 'वीरपुर', 'खोदावंदपुर'
  ],
  'saharsa': [
    'कहरा (सदर)', 'सिमरी बख्तियारपुर', 'सौरबाजार', 'सोनवर्षा', 'पतरघट', 
    'सलखुआ', 'महिषी', 'बनगांव', 'नवहट्टा', 'सत्तर कटैया'
  ],
  'supaul': [
    'सुपौल सदर', 'त्रिवेणीगंज', 'छातापुर', 'निर्मली', 'पिपरा', 'राघोपुर', 
    'किशनपुर', 'मरौना', 'सरायगढ़ भपटियाही', 'बसंतपुर', 'प्रतापगंज'
  ],
  'madhepura': [
    'मधेपुरा सदर', 'मुरलीगंज', 'सिंहेश्वर', 'कुमारखंड', 'ग्वालपाड़ा', 
    'चौसा', 'पुरैनी', 'आलमनगर', 'उदाकिशुनगंज', 'शंकरपुर', 'घैलाढ़'
  ],
  'purnia': [
    'पूर्णिया सदर', 'कसबा', 'बनमनखी', 'धमदाहा', 'अमौर', 'बायसी', 'डगरुआ', 
    'रुपौली', 'भवानीपुर', 'बीकोठी', 'श्रीनगर', 'के.नगर', 'जलालगढ़'
  ],
  'bhagalpur': [
    'जगदीशपुर (सदर)', 'कहलगांव', 'नवगछिया', 'पीरपैंती', 'सुल्तानगंज', 'सबौर', 
    'नाथनगर', 'बिहपुर', 'गोपालपुर', 'शाहकुंड', 'सन्हौला', 'गोराडीह', 'नारायणपुर'
  ],
  'gaya': [
    'नगर (सदर)', 'बोधगया', 'शेरघाटी', 'टिकारी', 'इमामगंज', 'फतेहपुर', 
    'वजीरगंज', 'मानपुर', 'डोभी', 'बाराचट्टी', 'अतरी', 'खिजरसराय', 'बेलागंज', 'गुरुआ'
  ],
};

/**
 * देश (National) श्रेणी हेतु भारत के प्रमुख राज्यों के ज़िले एवं शहर
 */
export const STATE_DISTRICTS_MAP: Record<string, string[]> = {
  'bihar': [
    'दरभंगा', 'मधुबनी', 'समस्तीपुर', 'मुजफ्फरपुर', 'सीतामढ़ी', 'पटना', 
    'बेगूसराय', 'सहरसा', 'सुपौल', 'मधेपुरा', 'पूर्णिया', 'कटिहार', 
    'भागलपुर', 'गया', 'नालंदा', 'सारण (छपरा)', 'सीवान', 'गोपालगंज', 
    'वैशाली', 'पूर्वी चंपारण', 'पश्चिमी चंपारण', 'रोहतास', 'बक्सर'
  ],
  'uttar-pradesh': [
    'लखनऊ', 'वाराणसी', 'गोरखपुर', 'प्रयागराज', 'अयोध्या', 'कानपुर', 
    'नोएडा', 'गाजियाबाद', 'मेरठ', 'आगरा', 'मथुरा', 'झांसी', 'बरेली', 
    'अलीगढ़', 'मुरादाबाद', 'सहारनपुर', 'मिर्जापुर', 'बस्ती', 'देवरिया', 'आजमगढ़'
  ],
  'delhi': [
    'नई दिल्ली', 'उत्तर दिल्ली', 'दक्षिण दिल्ली', 'पूर्वी दिल्ली', 'पश्चिमी दिल्ली', 
    'मध्य दिल्ली', 'उत्तर-पूर्वी दिल्ली', 'दक्षिण-पश्चिमी दिल्ली', 'शाहदरा', 
    'रोहिणी', 'द्वारका', 'कनॉट प्लेस', 'चांदनी चौक'
  ],
  'maharashtra': [
    'मुंबई', 'पुणे', 'नागपुर', 'नासिक', 'ठाणे', 'छत्रपति संभाजीनगर (औरंगाबाद)', 
    'नवी मुंबई', 'कोल्हापुर', 'सोलापूर', 'अमरावती', 'नांदेड़', 'कल्याण-डोंबिवली'
  ],
  'west-bengal': [
    'कोलकाता', 'हावड़ा', 'सिलीगुड़ी', 'दुर्गापुर', 'आसनसोल', 'मालदा', 
    'उत्तर दिनाजपुर', 'दक्षिण दिनाजपुर', 'मुर्शिदाबाद', 'दार्जिलिंग', 'जलपाईगुड़ी', 'बर्धमान'
  ],
  'jharkhand': [
    'रांची', 'जमशेदपुर (टाटानगर)', 'धनबाद', 'बोकारो', 'देवघर', 'दुमका', 
    'हजारीबाग', 'गिरिडीह', 'रामगढ़', 'पलामू (मेदिनीनगर)', 'कोडरमा', 'साहिबगंज'
  ],
  'madhya-pradesh': [
    'भोपाल', 'इंदौर', 'जबलपुर', 'ग्वालियर', 'उज्जैन', 'सागर', 'रीवा', 
    'सतना', 'छिंदवाड़ा', 'रतलाम', 'मुरैना', 'विदिशा'
  ],
  'rajasthan': [
    'जयपुर', 'जोधपुर', 'कोटा', 'उदयपुर', 'बीकानेर', 'अजमेर', 
    'भीलवाड़ा', 'अलवर', 'सीकर', 'भरतपुर', 'श्रीगंगानगर'
  ],
  'gujarat': [
    'अहमदाबाद', 'सूरत', 'वडोदरा', 'राजकोट', 'भावनगर', 'जामनगर', 
    'गांधीनगर', 'जूनागढ़', 'कच्छ / भुज', 'आनंद'
  ],
  'punjab': [
    'अमृतसर', 'लुधियाना', 'जालंधर', 'पटियाला', 'बठिंडा', 'मोहाली (एसएएस नगर)', 
    'पठानकोट', 'होशियारपुर', 'फिरोजपुर'
  ],
  'haryana': [
    'गुरुग्राम', 'फरीदाबाद', 'करनाल', 'पानीपत', 'रोहतक', 'हिसार', 
    'अंबाला', 'पंचकुला', 'सोनीपत', 'कुरुक्षेत्र'
  ],
  'uttarakhand': [
    'देहरादून', 'हरिद्वार', 'नैनीताल', 'उधम सिंह नगर (रुद्रपुर)', 'ऋषिकेश', 
    'अल्मोड़ा', 'पौड़ी गढ़वाल', 'हल्द्वानी'
  ],
  'chhattisgarh': [
    'रायपुर', 'भिलाई-दुर्ग', 'बिलासपुर', 'कोरबा', 'राजनांदगांव', 'जगदलपुर', 'अंबिकापुर'
  ],
  'odisha': [
    'भुवनेश्वर', 'कटक', 'राउरकेला', 'पुरी', 'संबलपुर', 'बालासोर', 'बरहमपुर'
  ],
  'assam': [
    'गुवाहाटी', 'डिब्रूगढ़', 'सिलचर', 'जोरहाट', 'तेजपुर', 'नगांव', 'तिनसुकिया'
  ],
  'karnataka': [
    'बेंगलुरु', 'मैसूर', 'हुबली-धारवाड़', 'मंगलुरु', 'बेलगावी', 'दावणगेरे', 'गुलबर्गा'
  ],
  'tamil-nadu': [
    'चेन्नई', 'कोयंबटूर', 'मदुरै', 'तिरुचिरापल्ली', 'सलेम', 'तिरुनेलवेली', 'वेल्लोर'
  ],
  'telangana': [
    'हैदराबाद', 'वारंगल', 'निजामाबाद', 'करीमनगर', 'खम्मम', 'सिकंदराबाद'
  ],
  'andhra-pradesh': [
    'विशाखापत्तनम', 'विजयवाड़ा', 'गुंटूर', 'तिरुपति', 'नेल्लोर', 'कुरनूल'
  ],
  'kerala': [
    'तिरुवनंतपुरम', 'कोच्चि', 'कोझिकोड', 'त्रिशूर', 'कन्नूर', 'कोल्लम'
  ],
};

/**
 * Helper to get blocks for any Bihar district
 */
export function getBiharBlocks(districtIdOrName: string): string[] {
  const norm = districtIdOrName.toLowerCase().trim();
  for (const [key, blocks] of Object.entries(BIHAR_DISTRICT_BLOCKS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return blocks;
    }
  }
  // Check against Hindi district names
  const distObj = BIHAR_DISTRICTS.find(d => 
    d.nameHindi.includes(districtIdOrName) || 
    districtIdOrName.includes(d.nameHindi) || 
    d.id === norm
  );
  if (distObj && BIHAR_DISTRICT_BLOCKS[distObj.id]) {
    return BIHAR_DISTRICT_BLOCKS[distObj.id];
  }
  // Default common blocks
  return ['सदर / नगर', 'प्रखंड 1', 'प्रखंड 2', 'अन्य प्रखंड (मैन्युअल लिखें)'];
}

/**
 * Helper to get districts for any Indian state
 */
export function getStateDistricts(stateIdOrName: string): string[] {
  const norm = stateIdOrName.toLowerCase().trim();
  for (const [key, districts] of Object.entries(STATE_DISTRICTS_MAP)) {
    if (norm.includes(key) || key.includes(norm)) {
      return districts;
    }
  }
  // Check against Hindi state names
  const stateObj = INDIA_STATES.find(s => 
    s.nameHindi.includes(stateIdOrName) || 
    stateIdOrName.includes(s.nameHindi) || 
    s.id === norm
  );
  if (stateObj && STATE_DISTRICTS_MAP[stateObj.id]) {
    return STATE_DISTRICTS_MAP[stateObj.id];
  }
  // Default list
  return ['राजधानी / प्रमुख शहर', 'अन्य जिला (मैन्युअल लिखें)'];
}
