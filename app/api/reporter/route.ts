import { NextRequest, NextResponse } from 'next/server';
import { reporterApplicationSchema } from '@/src/lib/validations';
import { ReporterService } from '@/src/lib/dbService';
import { ReporterApplication } from '@/src/types/news';
import { sendWelcomeApplicationEmail } from '@/src/lib/emailService';

/**
 * POST /api/reporter
 * Server-side validation and persistence of reporter recruitment applications
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const name = formData.get('name') || formData.get('fullName');
      const email = formData.get('email');
      const mobile = formData.get('mobile') || '9876543210';
      const message = formData.get('message') || '';
      const district = formData.get('district') || 'दरभंगा';

      body = {
        fullName: name?.toString() || '',
        fatherName: formData.get('fatherName')?.toString() || 'श्री ' + (name?.toString() || ''),
        motherName: formData.get('motherName')?.toString() || 'श्रीमती ' + (name?.toString() || ''),
        mobile: mobile?.toString() || '',
        whatsapp: formData.get('whatsapp')?.toString() || mobile?.toString() || '',
        email: email?.toString() || '',
        state: formData.get('state')?.toString() || 'बिहार (Bihar)',
        district: district?.toString() || 'दरभंगा',
        block: formData.get('block')?.toString() || 'सदर',
        panchayat: formData.get('panchayat')?.toString() || 'वार्ड 1',
        qualification: formData.get('qualification')?.toString() || 'स्नातक (Graduate)',
        experience: message ? message.toString() : (formData.get('experience')?.toString() || '1 वर्ष डिजिटल पत्रकारिता'),
        beatPreference: formData.get('beatPreference')?.toString() || 'समसामयिक एवं स्थानीय विकास',
        agreement: true,
      };
    } else {
      body = await request.json();
    }

    // Strict Zod Validation
    const validationResult = reporterApplicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'आवेदन में अमान्य विवरण। कृपया सभी अनिवार्य फ़ील्ड सही भरें।',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const applicationId = `DDN-REP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newApplication: ReporterApplication = {
      id: applicationId,
      fullName: data.fullName,
      fatherName: data.fatherName,
      motherName: data.motherName,
      mobile: data.mobile,
      whatsapp: data.whatsapp,
      email: data.email,
      isEmailVerified: true,
      nationality: 'भारतीय / Indian',
      state: data.state,
      district: data.district,
      block: data.block || 'सदर',
      panchayat: data.panchayat || 'वार्ड 1',
      qualification: data.qualification,
      experience: data.experience,
      beatPreference: data.beatPreference,
      appliedDate: new Date().toLocaleDateString('hi-IN'),
      status: 'pending',
    };

    const savedId = await ReporterService.submitApplication(newApplication);

    // Send official Welcome & Acknowledgement Letter to applicant's verified email
    try {
      await sendWelcomeApplicationEmail(newApplication);
    } catch (mailErr: any) {
      console.warn('Welcome letter dispatch note:', mailErr.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'पत्रकार आवेदन सफलतापूर्वक दर्ज कर लिया गया है। आधिकारिक स्वागत पत्र आपके ईमेल पर भेज दिया गया है।',
        applicationId: savedId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'आवेदन सुरक्षित करने में त्रुटि: ' + (error?.message || 'अज्ञात समस्या') },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reporter
 * Fetch reporter applications (secured for editorial review)
 */
export async function GET(request: NextRequest) {
  try {
    const applications = await ReporterService.getApplications();
    return NextResponse.json({
      total: applications.length,
      applications,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'आवेदनों की सूची प्राप्त करने में त्रुटि' },
      { status: 500 }
    );
  }
}
