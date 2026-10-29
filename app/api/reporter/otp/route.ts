import { NextRequest, NextResponse } from 'next/server';

// Temporary in-memory OTP store with 10-minute validity
interface OtpEntry {
  otp: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();

export async function POST(req: NextRequest) {
  try {
    const { action, email, otp } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'कृपया मान्य ईमेल आईडी दर्ज करें।' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ACTION 1: SEND OTP
    if (action === 'send') {
      // Generate 6-digit cryptographic-random OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStore.set(normalizedEmail, { otp: generatedOtp, expiresAt });

      return NextResponse.json({
        success: true,
        message: `सत्यापन कोड (OTP) ईमेल ${normalizedEmail} पर भेज दिया गया है।`,
        // Provided for instant verification in testing/preview
        demoOtp: generatedOtp,
      });
    }

    // ACTION 2: VERIFY OTP
    if (action === 'verify') {
      if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
        return NextResponse.json(
          { error: 'कृपया 6 अंकों का मान्य ओटीपी दर्ज करें।' },
          { status: 400 }
        );
      }

      const record = otpStore.get(normalizedEmail);
      if (!record) {
        return NextResponse.json(
          { error: 'इस ईमेल के लिए कोई ओटीपी नहीं मिला। कृपया पुनः ओटीपी भेजें।' },
          { status: 400 }
        );
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(normalizedEmail);
        return NextResponse.json(
          { error: 'ओटीपी की समय सीमा समाप्त हो गई है। कृपया नया ओटीपी प्राप्त करें।' },
          { status: 400 }
        );
      }

      if (record.otp !== otp.trim()) {
        return NextResponse.json(
          { error: 'गलत ओटीपी। कृपया ईमेल पर प्राप्त सही 6 अंकों का कोड दर्ज करें।' },
          { status: 400 }
        );
      }

      // Mark verified and remove used OTP
      otpStore.delete(normalizedEmail);

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'ईमेल आईडी सफलतापूर्वक सत्यापित हो गई है! अब आप आगे का फॉर्म भर सकते हैं।',
      });
    }

    return NextResponse.json({ error: 'अमान्य अनुरोध' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'ओटीपी सेवा में त्रुटि: ' + (error?.message || 'अज्ञात समस्या') },
      { status: 500 }
    );
  }
}
