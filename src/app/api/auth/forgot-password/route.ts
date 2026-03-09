import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getBrand } from "@/lib/branding";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const brand = await getBrand();

    // Generate a password reset link via Supabase admin API
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${origin}/reset-password`,
      },
    });

    if (error || !data?.properties?.action_link) {
      // Don't leak whether the email exists — show success either way
      return NextResponse.json({ success: true });
    }

    // Send the reset email via Resend (same way job photo emails work)
    const resetLink = data.properties.action_link;
    const logoUrl = brand.logoUrl || `${origin}/logo.png`;

    await getResend().emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: `Reset your ${brand.shortName} password`,
      html: buildResetEmail({
        resetLink,
        logoUrl,
        companyName: brand.name,
        brandColor: brand.color,
      }),
    });

    return NextResponse.json({ success: true });
  } catch {
    // Don't leak errors — always show success
    return NextResponse.json({ success: true });
  }
}

function buildResetEmail({
  resetLink,
  logoUrl,
  companyName,
  brandColor,
}: {
  resetLink: string;
  logoUrl: string;
  companyName: string;
  brandColor: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr><td style="padding:32px 32px 24px;text-align:center;">
              <img src="${logoUrl}" alt="${companyName}" width="160" style="max-width:160px;height:auto;" />
            </td></tr>
            <tr><td style="padding:0 32px;">
              <h1 style="margin:0 0 12px;font-size:20px;color:#1f2937;text-align:center;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;line-height:1.5;">
                Click the button below to set a new password. This link expires in 1 hour.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding-bottom:24px;">
                  <a href="${resetLink}" style="display:inline-block;padding:12px 32px;background:${brandColor};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                    Reset Password
                  </a>
                </td></tr>
              </table>
              <p style="margin:0 0 24px;font-size:12px;color:#9ca3af;text-align:center;line-height:1.5;">
                If you didn&rsquo;t request this, you can safely ignore this email.
              </p>
            </td></tr>
            <tr><td style="padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${companyName}</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}
