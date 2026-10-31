import { NextRequest, NextResponse } from 'next/server';
import { sendOtpEmail } from '@/src/lib/emailService';

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
        { error: 'कृपया मान्य ईमेल पता दर्ज करें।' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ACTION 1: SEND OTP TO RECIPIENT'S EMAIL
    if (action === 'send') {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStore.set(normalizedEmail, { otp: generatedOtp, expiresAt });

      // Dispatch real email via emailService
      const emailResult = await sendOtpEmail(normalizedEmail, generatedOtp);

      if (!emailResult.success) {
        return NextResponse.json(
          { error: emailResult.error || 'ओटीपी ईमेल भेजने में समस्या। कृपया पुनः प्रयास करें।' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        emailDelivered: true,
        senderEmail: emailResult.senderEmail,
        recipientEmail: normalizedEmail,
        message: `सत्यापन कोड (OTP) आवेदक की ईमेल आईडी (${normalizedEmail}) पर सफलतापूर्वक भेज दिया गया है। कृपया अपना इनबॉक्स या स्पैम (Spam) फोल्डर देखें।`,
      });
    }

    // ACTION 2: VERIFY OTP
    if (action === 'verify') {
      if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
        return NextResponse.json(
          { error: 'कृपया ईमेल पर प्राप्त 6 अंकों का कोड दर्ज करें।' },
          { status: 400 }
        );
      }

      const record = otpStore.get(normalizedEmail);
      if (!record) {
        return NextResponse.json(
          { error: 'इस ईमेल के लिए कोई सक्रिय ओटीपी नहीं मिला। कृपया पुनः ओटीपी भेजें।' },
          { status: 400 }
        );
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(normalizedEmail);
        return NextResponse.json(
          { error: 'ओटीपी की समय सीमा समाप्त हो चुकी है। कृपया नया ओटीपी भेजें।' },
          { status: 400 }
        );
      }

      if (record.otp !== otp.trim()) {
        return NextResponse.json(
          { error: 'गलत ओटीपी। कृपया अपनी ईमेल पर प्राप्त सही 6 अंकों का कोड दर्ज करें।' },
          { status: 400 }
        );
      }

      // Mark verified and remove used OTP
      otpStore.delete(normalizedEmail);

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'ईमेल आईडी सफलतापूर्वक सत्यापित हो गई है! अब आप अपना आवेदन पूरा कर सकते हैं।',
      });
    }

    return NextResponse.json({ error: 'अमान्य अनुरोध' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'ईमेल ओटीपी सेवा में त्रुटि: ' + (error?.message || 'अज्ञात समस्या') },
      { status: 500 }
    );
  }
}
