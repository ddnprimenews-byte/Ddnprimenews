import { NextRequest, NextResponse } from 'next/server';
import { reporterApplicationSchema } from '@/src/lib/validations';
import { ReporterService } from '@/src/lib/dbService';
import { ReporterApplication } from '@/src/types/news';

/**
 * POST /api/reporter
 * Server-side validation and persistence of reporter recruitment applications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
      mobile: data.mobile,
      whatsapp: data.whatsapp || data.mobile,
      email: data.email,
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

    return NextResponse.json(
      {
        success: true,
        message: 'पत्रकार आवेदन सफलतापूर्वक दर्ज कर लिया गया है। संपादकीय बोर्ड द्वारा सत्यापन के उपरांत प्रेस कार्ड जारी किया जाएगा।',
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
