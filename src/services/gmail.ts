import { getAccessToken } from './auth';

// Encodes UTF-8 string to base64url format for Gmail API
function encodeBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export interface SendRentalEmailParams {
  toEmail: string;
  toName: string;
  fromName: string;
  fromEmail: string;
  fromPhone: string;
  listingTitle: string;
  proposedMoveInDate: string;
  familyMembers?: number;
  profession?: string;
  userMessage: string;
}

/**
 * Sends a formal house rental inquiry directly via user's authorized Gmail account
 */
export async function sendRentalInquiryViaGmail(params: SendRentalEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const token = getAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Gmail একাউন্ট সংযোগ করা নেই। অনুগ্রহ করে উপরে Google দিয়ে লগইন করুন।'
    };
  }

  const subject = `[বাসা ভাড়া আবেদন] ${params.listingTitle} এর ব্যাপারে অনুসন্ধান`;
  
  const rawEmailContent = [
    `To: ${params.toEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="background-color: #0284c7; color: white; padding: 14px 18px; border-radius: 6px 6px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">বাসা ভাড়া সম্পর্কিত আবেদন</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">বাসা বাড়ি ভাড়া পোর্টাল থেকে প্রেরিত</p>
      </div>
      <div style="padding: 16px 0;">
        <p>আসসালামু আলাইকুম <strong>${params.toName}</strong>,</p>
        <p>আপনার বিজ্ঞাপন <strong>"${params.listingTitle}"</strong> দেখে একজন আগ্রহী ভাড়াটিয়া আপনার সাথে যোগাযোগ করতে আবেদন করেছেন। বিস্তারিত নিচে দেওয়া হলো:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; width: 140px;">ভাড়াটিয়ার নাম:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${params.fromName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">মোবাইল নম্বর:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0284c7;">
              <a href="tel:${params.fromPhone}" style="color: #0284c7; text-decoration: none;">${params.fromPhone}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">ইমেইল:</td>
            <td style="padding: 8px 0;">${params.fromEmail}</td>
          </tr>
          ${params.profession ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">পেশা/কর্মস্থল:</td>
            <td style="padding: 8px 0;">${params.profession}</td>
          </tr>` : ''}
          ${params.familyMembers ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">পরিবারের সদস্য:</td>
            <td style="padding: 8px 0;">${params.familyMembers} জন</td>
          </tr>` : ''}
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">কবে থেকে উঠতে চান:</td>
            <td style="padding: 8px 0; font-weight: 500;">${params.proposedMoveInDate}</td>
          </tr>
        </table>

        <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px; margin: 18px 0; font-size: 14px; font-style: italic; color: #334155;">
          "${params.userMessage || 'আমি আপনার বাড়িটি সশরীরে দেখতে আগ্রহী এবং আলোচনা করতে চাই।'}"
        </div>

        <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
          বাড়িওয়ালা হিসেবে আপনি সরাসরি ওপরের ফোন নম্বরে কল করতে পারেন অথবা এই ইমেইলের রিপ্লাই দিতে পারেন।
        </p>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center;">
        বাসা বাড়ি ভাড়া ম্যানেজমেন্ট প্ল্যাটফর্ম • নিরাপদে বাড়ি ভাড়া নিন ও দিন
      </div>
    </div>`
  ].join('\r\n');

  try {
    const encodedMessage = encodeBase64Url(rawEmailContent);

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gmail API error: ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('Failed to send email via Gmail:', err);
    return { success: false, error: err.message || 'ইমেইল পাঠাতে সমস্যা হয়েছে।' };
  }
}
