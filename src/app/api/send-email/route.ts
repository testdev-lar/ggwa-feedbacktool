import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-server";
import { buildJobPhotosEmail } from "@/emails/job-photos-email";
import { getBrand } from "@/lib/branding";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const { customerName, customerEmail, jobReference, photoUrls } =
      await request.json();

    if (!customerName || !customerEmail || !photoUrls?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert job into database
    const { data: job, error: dbError } = await supabaseAdmin
      .from("jobs")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        job_reference: jobReference || "",
        photo_urls: photoUrls,
        email_sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Fetch brand settings from DB
    const brand = await getBrand();

    // Build feedback URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";
    const feedbackUrl = `${baseUrl}/feedback/${job.id}`;
    const logoUrl = brand.logoUrl || `${baseUrl}/logo.png`;

    // Build and send email
    const html = buildJobPhotosEmail({
      customerName,
      jobReference: jobReference || "",
      photoUrls,
      feedbackUrl,
      logoUrl,
      companyName: brand.name,
      brandColor: brand.color,
    });

    const { error: emailError } = await getResend().emails.send({
      from: process.env.FROM_EMAIL!,
      to: customerEmail,
      subject: jobReference
        ? `Your job photos from ${brand.shortName} — ${jobReference}`
        : `Your job photos from ${brand.name}`,
      html,
    });

    if (emailError) {
      return NextResponse.json(
        { error: `Email error: ${emailError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobId: job.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
