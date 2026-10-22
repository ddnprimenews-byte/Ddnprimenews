import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * Server-Side Gemini API Client
 * Configured with official telemetry header and secure server-only API key
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * POST /api/gemini/summarize
 * AI-assisted news summarization & quick bullet points generator for DDN Prime News
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, subtitle, summary } = body;

    if (!title && !content) {
      return NextResponse.json(
        { error: 'शीर्षक अथवा समाचार सामग्री आवश्यक है।' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // Fallback if API key is not configured in local environment
    if (!ai) {
      const fallbackPoints = [
        title || 'प्रमुख समाचार बुलेटिन',
        subtitle || summary || 'महत्वपूर्ण तथ्यात्मक विकास पर प्रशासनिक व जनसरोकार समीक्षा।',
        'डीडीएन प्राइम न्यूज द्वारा सत्यापित एवं निष्पक्ष जनहित रिपोर्टिंग।',
      ];
      return NextResponse.json({
        summary: summary || subtitle || 'समाचार का त्वरित सारांश उपलब्ध है।',
        bulletPoints: fallbackPoints,
        keyTakeaway: 'सच्ची, निर्भीक और निष्पक्ष डिजिटल पत्रकारिता का संकल्प।',
        isAiGenerated: false,
      });
    }

    const fullArticleText = `शीर्षक: ${title}\nउपशीर्षक: ${subtitle || ''}\nविवरण: ${
      Array.isArray(content) ? content.join('\n') : content || summary || ''
    }`;

    const prompt = `आप "डीडीएन प्राइम न्यूज" (DDN Prime News) के वरिष्ठ संपादकीय विश्लेषक हैं। 
नीचे दिए गए समाचार लेख का विश्लेषण करें और पाठकों के लिए शुद्ध हिंदी में त्वरित व संक्षिप्त 30-सेकंड का स्मार्ट सारांश तैयार करें।

प्रारूप (JSON):
{
  "summary": "1-2 वाक्यों में मुख्य घटना या निर्णय का सार",
  "bulletPoints": [
    "मुख्य बिंदु 1 (अधिकतम 15 शब्द)",
    "मुख्य बिंदु 2 (अधिकतम 15 शब्द)",
    "मुख्य बिंदु 3 (अधिकतम 15 शब्द)"
  ],
  "keyTakeaway": "पाठकों या आम जनता के लिए सबसे बड़ा प्रभाव / निष्कर्ष"
}

समाचार लेख:
${fullArticleText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = response.text?.trim() || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      parsedData = {
        summary: responseText || summary || title,
        bulletPoints: [title, summary || 'विशेष रिपोर्ट', 'डीडीएन विशेष'],
        keyTakeaway: 'सत्यता एवं जनसरोकार पर आधारित विश्लेषण।',
      };
    }

    return NextResponse.json({
      summary: parsedData.summary,
      bulletPoints: parsedData.bulletPoints || [],
      keyTakeaway: parsedData.keyTakeaway || '',
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error('Gemini Summarize API Error:', error);
    return NextResponse.json(
      {
        error: 'AI सारांश जनरेट करने में अस्थाई समस्या: ' + (error?.message || 'अज्ञात'),
        isAiGenerated: false,
      },
      { status: 500 }
    );
  }
}
