import nodemailer from 'nodemailer';
import { ReporterApplication } from '../types/news';

// Chief Editor & Head Office Official Contact Information
export const DDN_EDITORIAL_OFFICE = {
  chiefEditor: 'श्री राजेश कुमार साहू (Rajesh Kumar Sahu)',
  editorRole: 'मुख्य संपादक एवं संस्थापक (Chief Editor & Founder)',
  organization: 'डीडीएन प्राइम न्यूज़ (दरभंगा डिजिटल नेटवर्क)',
  msmeRegistration: 'UDYAM-BR-09-0028491 (भारत सरकार MSME पंजीकृत)',
  headOfficeAddress: 'वार्ड नंबर 9, पैगंबरपुर, पोस्ट- दरमा, थाना- क्यूटी, जिला- दरभंगा, बिहार - 847121',
  helplinePhone: '+91 9341050287',
  officialEmail: 'ddnprimenews@gmail.com',
  officialWebsite: 'https://ddnprimenews.com',
};

/**
 * Configure Nodemailer Transporter
 * Supports standard SMTP (Gmail SMTP, Brevo, SendGrid, etc.)
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || 'ddnprimenews@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';

  if (pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  // Fallback to direct SMTP if specific password is not yet injected
  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    tls: { rejectUnauthorized: false },
  });
}

/**
 * Send 6-Digit Email Verification OTP
 */
export async function sendOtpEmail(recipientEmail: string, otpCode: string): Promise<boolean> {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM || `DDN Prime News <${DDN_EDITORIAL_OFFICE.officialEmail}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #800000; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; color: #fde68a; }
        .body { padding: 30px 24px; }
        .badge { display: inline-block; background: #fee2e2; color: #991b1b; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 16px; }
        .otp-box { background: #fef2f2; border: 2px dashed #dc2626; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #991b1b; margin: 0; }
        .notice { font-size: 13px; color: #64748b; line-height: 1.6; }
        .footer { background: #f1f5f9; padding: 20px 24px; font-size: 12px; color: #475569; border-top: 1px solid #e2e8f0; line-height: 1.6; }
        .footer strong { color: #0f172a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>डीडीएन प्राइम न्यूज़ (दरभंगा डिजिटल नेटवर्क)</h1>
          <p>सच्ची, निष्पक्ष और निर्भीक पत्रकारिता · भर्ती एवं प्रमाणीकरण पोर्टल</p>
        </div>
        <div class="body">
          <span class="badge">सुरक्षा सत्यापन कोड / EMAIL OTP</span>
          <h2 style="font-size: 18px; margin: 0 0 10px; color: #0f172a;">नमस्कार,</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            डीडीएन प्राइम न्यूज़ के पत्रकार/रिपोर्टर पंजीकरण पोर्टल पर आपकी ईमेल आईडी के सत्यापन हेतु 6 अंकों का सुरक्षा कोड (OTP) नीचे दिया गया है:
          </p>
          
          <div class="otp-box">
            <p style="margin: 0 0 6px; font-size: 12px; color: #7f1d1d; font-weight: 600;">आपका सत्यापन कोड (OTP):</p>
            <div class="otp-code">${otpCode}</div>
            <p style="margin: 8px 0 0; font-size: 11px; color: #991b1b;">(यह कोड अगले 10 मिनट के लिए मान्य है)</p>
          </div>

          <p class="notice">
            🔒 <strong>सुरक्षा सूचना:</strong> कृपया यह सुरक्षा कोड किसी अन्य व्यक्ति के साथ साझा न करें। यदि आपने इस सत्यापन का अनुरोध नहीं किया है, तो इस ईमेल को अनदेखा करें।
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 6px;">
            <strong>मुख्य संपादक:</strong> ${DDN_EDITORIAL_OFFICE.chiefEditor}<br>
            <strong>कार्यालय:</strong> ${DDN_EDITORIAL_OFFICE.headOfficeAddress}<br>
            <strong>हेल्पलाइन:</strong> ${DDN_EDITORIAL_OFFICE.helplinePhone} | <strong>ईमेल:</strong> ${DDN_EDITORIAL_OFFICE.officialEmail}
          </p>
          <p style="margin: 6px 0 0; font-size: 11px; color: #94a3b8;">
            ${DDN_EDITORIAL_OFFICE.msmeRegistration} · www.ddnprimenews.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: recipientEmail,
      subject: `🔒 ${otpCode} — डीडीएन प्राइम न्यूज़ रिपोर्टर सत्यापन कोड (Email OTP)`,
      html: htmlContent,
      text: `डीडीएन प्राइम न्यूज़ पत्रकार सत्यापन कोड (OTP): ${otpCode}। यह कोड 10 मिनट के लिए मान्य है।`,
    });
    console.log(`[EmailService] OTP email successfully sent to ${recipientEmail}`);
    return true;
  } catch (err: any) {
    console.warn(`[EmailService] Email dispatch note (${recipientEmail}):`, err.message);
    return false;
  }
}

/**
 * Send Welcome & Application Acknowledgement Letter Email to Applicant
 */
export async function sendWelcomeApplicationEmail(app: ReporterApplication): Promise<boolean> {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM || `DDN Prime News <${DDN_EDITORIAL_OFFICE.officialEmail}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
        .header { background: #800000; color: #ffffff; padding: 26px 24px; text-align: center; border-bottom: 3px solid #f59e0b; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .header p { margin: 6px 0 0; font-size: 13px; color: #fef08a; }
        .body { padding: 30px 24px; }
        .welcome-title { font-size: 20px; font-weight: 800; color: #15803d; margin: 0 0 8px; }
        .ref-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 16px 20px; margin: 20px 0; text-align: center; }
        .ref-label { font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; margin: 0 0 4px; }
        .ref-id { font-family: monospace; font-size: 24px; font-weight: 900; color: #14532d; letter-spacing: 1px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
        .details-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        .details-table td.label { width: 38%; color: #64748b; font-weight: 600; background: #f8fafc; }
        .details-table td.value { color: #0f172a; font-weight: 600; }
        .office-card { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 18px 20px; margin: 24px 0; font-size: 13px; line-height: 1.7; color: #78350f; }
        .office-card h3 { margin: 0 0 8px; font-size: 15px; font-weight: 800; color: #92400e; border-bottom: 1px solid #fde68a; padding-bottom: 6px; }
        .footer { background: #0f172a; color: #94a3b8; padding: 22px 24px; font-size: 12px; text-align: center; line-height: 1.6; }
        .footer strong { color: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>डीडीएन प्राइम न्यूज़ (DDN Prime News)</h1>
          <p>दरभंगा डिजिटल नेटवर्क · राष्ट्रीय एवं राज्य स्तरीय संवाददाता भर्ती</p>
        </div>
        
        <div class="body">
          <h2 class="welcome-title">🎉 आवेदन सफलतापूर्वक प्राप्त हुआ!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
            प्रिय <strong>${app.fullName}</strong> जी,<br>
            डीडीएन प्राइम न्यूज़ परिवार में आपका हार्दिक स्वागत है। आपके द्वारा संवाददाता/पत्रकार पद हेतु प्रस्तुत आवेदन मुख्य संपादकीय बोर्ड को सफलतापूर्वक प्राप्त हो चुका है।
          </p>

          <div class="ref-box">
            <div class="ref-label">आपका अधिकृत पंजीकरण व संदर्भ संख्या (Registration Reference No):</div>
            <div class="ref-id">${app.id}</div>
          </div>

          <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 20px 0 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
            📋 आपके द्वारा दर्ज किया गया आवेदन विवरण:
          </h3>

          <table class="details-table">
            <tr>
              <td class="label">आवेदक का नाम:</td>
              <td class="value">${app.fullName}</td>
            </tr>
            <tr>
              <td class="label">पिता/संरक्षक का नाम:</td>
              <td class="value">${app.fatherName}</td>
            </tr>
            <tr>
              <td class="label">माता का नाम:</td>
              <td class="value">${app.motherName || '—'}</td>
            </tr>
            <tr>
              <td class="label">राष्ट्रीयता:</td>
              <td class="value">भारतीय / Indian</td>
            </tr>
            <tr>
              <td class="label">राज्य एवं जिला:</td>
              <td class="value">${app.state || 'बिहार'} / ${app.district}</td>
            </tr>
            <tr>
              <td class="label">प्रखंड व कार्यक्षेत्र:</td>
              <td class="value">${app.block} / ${app.panchayat || app.workArea || '—'}</td>
            </tr>
            <tr>
              <td class="label">मोबाइल नंबर:</td>
              <td class="value">${app.mobile}</td>
            </tr>
            <tr>
              <td class="label">व्हाट्सएप नंबर:</td>
              <td class="value">${app.whatsapp}</td>
            </tr>
            <tr>
              <td class="label">ईमेल आईडी:</td>
              <td class="value">${app.email} (सत्यापित ✓)</td>
            </tr>
            <tr>
              <td class="label">शैक्षणिक योग्यता:</td>
              <td class="value">${app.qualification}</td>
            </tr>
            <tr>
              <td class="label">पत्रकारिता अनुभव:</td>
              <td class="value">${app.experience}</td>
            </tr>
            <tr>
              <td class="label">रुचि का क्षेत्र (Beat):</td>
              <td class="value">${app.beatPreference}</td>
            </tr>
            <tr>
              <td class="label">आवेदन तिथि:</td>
              <td class="value">${app.appliedDate}</td>
            </tr>
          </table>

          <div class="office-card">
            <h3>🏢 मुख्य संपादकीय मंडल एवं प्रधान कार्यालय विवरण:</h3>
            <p style="margin: 0;">
              <strong>प्रधान संपादक:</strong> ${DDN_EDITORIAL_OFFICE.chiefEditor}<br>
              <strong>पदनाम:</strong> ${DDN_EDITORIAL_OFFICE.editorRole}<br>
              <strong>प्रधान कार्यालय पता:</strong> ${DDN_EDITORIAL_OFFICE.headOfficeAddress}<br>
              <strong>हेल्पलाइन नंबर:</strong> ${DDN_EDITORIAL_OFFICE.helplinePhone}<br>
              <strong>आधिकारिक ईमेल:</strong> ${DDN_EDITORIAL_OFFICE.officialEmail}<br>
              <strong>वेबसाइट:</strong> <a href="${DDN_EDITORIAL_OFFICE.officialWebsite}" style="color: #92400e; font-weight: 700;">${DDN_EDITORIAL_OFFICE.officialWebsite}</a><br>
              <strong>उद्योग पंजीकरण:</strong> ${DDN_EDITORIAL_OFFICE.msmeRegistration}
            </p>
          </div>

          <p style="font-size: 13px; line-height: 1.6; color: #475569;">
            📌 <strong>आगामी प्रक्रिया:</strong> आपके द्वारा अपलोड किए गए पहचान पत्र और विवरण का संपादकीय बोर्ड द्वारा प्राथमिक सत्यापन किया जाएगा। सत्यापन के उपरांत आपको अधिकृत डिजिटल प्रेस मान्यता कार्ड (Digital Press ID Card) जारी किया जाएगा।
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0 0 6px;">
            <strong>डीडीएन प्राइम न्यूज़ (दरभंगा डिजिटल नेटवर्क)</strong><br>
            सच्ची, निष्पक्ष और निर्भीक पत्रकारिता। उत्तर बिहार, मिथिलांचल एवं संपूर्ण राष्ट्र की सशक्त आवाज़।
          </p>
          <p style="margin: 0; font-size: 11px;">
            © 2026 DDN Prime News. All Rights Reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: app.email,
      subject: `🎉 आवेदन स्वीकृति पावती पत्र (Ref: ${app.id}) — डीडीएन प्राइम न्यूज़`,
      html: htmlContent,
      text: `प्रिय ${app.fullName}, डीडीएन प्राइम न्यूज़ में आपका आवेदन (Ref: ${app.id}) प्राप्त हो चुका है। प्रधान कार्यालय: ${DDN_EDITORIAL_OFFICE.headOfficeAddress}। संपर्क: ${DDN_EDITORIAL_OFFICE.helplinePhone}`,
    });
    console.log(`[EmailService] Welcome email successfully sent to ${app.email}`);
    return true;
  } catch (err: any) {
    console.warn(`[EmailService] Welcome email dispatch note (${app.email}):`, err.message);
    return false;
  }
}
