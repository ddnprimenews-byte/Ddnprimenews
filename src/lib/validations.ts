import { z } from 'zod';

/**
 * Strict Indian Mobile Number Regex: 10 digits starting with 6, 7, 8, or 9
 */
const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Reporter Application Form Validation Schema
 * Prevents invalid data injection and enforces press identity standards
 */
export const reporterApplicationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, { message: 'पूरा नाम कम से कम 3 अक्षरों का होना चाहिए।' })
    .max(60, { message: 'नाम 60 अक्षरों से अधिक नहीं हो सकता।' }),
  fatherName: z
    .string()
    .trim()
    .min(3, { message: 'पिता/अभिभावक का नाम आवश्यक है।' })
    .max(60, { message: 'नाम 60 अक्षरों से अधिक नहीं हो सकता।' }),
  mobile: z
    .string()
    .trim()
    .regex(INDIAN_PHONE_REGEX, { message: 'मान्य 10 अंकों का मोबाइल नंबर दर्ज करें (6-9 से शुरू)।' }),
  whatsapp: z
    .string()
    .trim()
    .regex(INDIAN_PHONE_REGEX, { message: 'मान्य 10 अंकों का व्हाट्सएप नंबर दर्ज करें।' }),
  email: z
    .string()
    .trim()
    .email({ message: 'कृपया मान्य ईमेल पता दर्ज करें।' })
    .toLowerCase(),
  district: z
    .string()
    .min(1, { message: 'कृपया जिला चुनें।' }),
  block: z
    .string()
    .trim()
    .min(2, { message: 'प्रखंड (Block) का नाम दर्ज करें।' })
    .max(50, { message: 'प्रखंड का नाम 50 अक्षरों से कम होना चाहिए।' }),
  panchayat: z
    .string()
    .trim()
    .min(2, { message: 'पंचायत अथवा वार्ड संख्या दर्ज करें।' })
    .max(50, { message: 'पंचायत का नाम 50 अक्षरों से कम होना चाहिए।' }),
  qualification: z
    .string()
    .min(1, { message: 'शैक्षणिक योग्यता चुनें।' }),
  experience: z
    .string()
    .min(1, { message: 'पत्रकारिता अनुभव चुनें।' }),
  beatPreference: z
    .string()
    .min(1, { message: 'प्राथमिक बीट / रिपोर्टिंग क्षेत्र चुनें।' }),
  agreement: z
    .boolean()
    .refine((val) => val === true, {
      message: 'आगे बढ़ने के लिए नियम, निष्पक्षता एवं आचार संहिता की स्वीकृति अनिवार्य है।',
    }),
});

export type ReporterApplicationInput = z.infer<typeof reporterApplicationSchema>;

/**
 * Editorial Contact Form Validation Schema
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'कृपया अपना नाम दर्ज करें।' })
    .max(60, { message: 'नाम 60 अक्षरों से कम होना चाहिए।' }),
  email: z
    .string()
    .trim()
    .email({ message: 'मान्य ईमेल पता दर्ज करें।' })
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(INDIAN_PHONE_REGEX, { message: 'मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।' })
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .trim()
    .min(3, { message: 'विषय (Subject) कम से कम 3 अक्षरों का होना चाहिए।' })
    .max(120, { message: 'विषय 120 अक्षरों से कम होना चाहिए।' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'संदेश कम से कम 10 अक्षरों का होना चाहिए।' })
    .max(2000, { message: 'संदेश 2000 अक्षरों से अधिक नहीं हो सकता।' }),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

/**
 * Newsletter Subscription Validation Schema
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'कृपया एक वैध ईमेल पता दर्ज करें।' })
    .toLowerCase(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

/**
 * News Article Publishing Schema (Admin Desk)
 */
export const articlePublishSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'शीर्षक कम से कम 5 अक्षरों का होना चाहिए।' })
    .max(250, { message: 'शीर्षक 250 अक्षरों से कम होना चाहिए।' }),
  subtitle: z.string().trim().max(300).optional(),
  summary: z
    .string()
    .trim()
    .min(10, { message: 'सारांश कम से कम 10 अक्षरों का होना चाहिए।' })
    .max(500, { message: 'सारांश 500 अक्षरों से कम होना चाहिए।' }),
  content: z
    .string()
    .trim()
    .min(20, { message: 'समाचार का विस्तृत विवरण कम से कम 20 अक्षरों का होना चाहिए।' }),
  category: z.enum(['bihar', 'national', 'politics', 'crime', 'sports', 'education-health']),
  location: z.string().trim().min(2, { message: 'स्थान (जिला/शहर) आवश्यक है।' }),
  author: z.string().trim().min(2, { message: 'लेखक का नाम आवश्यक है।' }),
  authorRole: z.string().trim().default('विशेष संवाददाता'),
  status: z.enum(['draft', 'published']).default('published'),
});

export type ArticlePublishInput = z.infer<typeof articlePublishSchema>;
