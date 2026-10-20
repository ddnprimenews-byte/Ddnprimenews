import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/src/lib/validations';
import { ContactService } from '@/src/lib/dbService';

/**
 * POST /api/contact
 * Validates editorial inquiries and messages with Zod and persists to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Strict validation
    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'कृपया सभी विवरण सही प्रारूप में भरें।',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;
    const refId = await ContactService.submitMessage({
      name: validData.name,
      email: validData.email,
      phone: validData.phone,
      subject: validData.subject,
      message: validData.message,
    });

    return NextResponse.json(
      {
        success: true,
        referenceId: refId,
        message: 'आपका संदेश सफलतापूर्वक दर्ज कर लिया गया है। संपादकीय टीम आपसे शीघ्र संपर्क करेगी।',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'संदेश प्रेषित करने में त्रुटि: ' + (error?.message || 'अज्ञात समस्या') },
      { status: 500 }
    );
  }
}
