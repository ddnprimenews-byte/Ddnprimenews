import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema } from '@/src/lib/validations';
import { NewsletterService } from '@/src/lib/dbService';

/**
 * POST /api/newsletter
 * Validates subscriber email using Zod and adds to digital bulletin distribution
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Strict Zod Validation
    const validationResult = newsletterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'अमान्य ईमेल पता। कृपया एक वैध ईमेल दर्ज करें।',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;
    const result = await NewsletterService.subscribe(email);

    return NextResponse.json(
      {
        success: true,
        message: 'डीडीएन प्राइम न्यूज ई-पेपर एवं दैनिक बुलेटिन की सदस्यता सफलतापूर्वक सक्रिय कर दी गई है।',
        subscriptionId: result.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'सदस्यता दर्ज करने में त्रुटि: ' + (error?.message || 'अज्ञात समस्या') },
      { status: 500 }
    );
  }
}
