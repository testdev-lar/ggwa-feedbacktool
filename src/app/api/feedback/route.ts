import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-server";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const {
      jobId,
      overallRating,
      qualityRating,
      professionalismRating,
      comment,
      testimonialPermission,
    } = await request.json();

    if (!jobId || !overallRating || !qualityRating || !professionalismRating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check job exists
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check for existing feedback
    const { data: existing } = await supabaseAdmin
      .from("feedback")
      .select("id")
      .eq("job_id", jobId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Feedback already submitted for this job" },
        { status: 409 }
      );
    }

    // Insert feedback
    const { error: insertError } = await supabaseAdmin
      .from("feedback")
      .insert({
        job_id: jobId,
        overall_rating: overallRating,
        quality_rating: qualityRating,
        professionalism_rating: professionalismRating,
        comment: comment || null,
        testimonial_permission: testimonialPermission || false,
      });

    if (insertError) {
      return NextResponse.json(
        { error: `Database error: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Update job status
    await supabaseAdmin
      .from("jobs")
      .update({ feedback_status: "received" })
      .eq("id", jobId);

    // Send notification email
    const notificationEmail = process.env.NOTIFICATION_EMAIL;
    if (notificationEmail) {
      const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        request.headers.get("origin") ||
        "http://localhost:3000";

      await getResend().emails.send({
        from: process.env.FROM_EMAIL!,
        to: notificationEmail,
        subject: `New feedback received — ${job.customer_name}`,
        html: `
          <h2>New Feedback Received</h2>
          <p><strong>Job:</strong> ${job.job_reference || "N/A"}</p>
          <p><strong>Customer:</strong> ${job.customer_name}</p>
          <br/>
          <p><strong>Overall:</strong> ${stars(overallRating)} (${overallRating}/5)</p>
          <p><strong>Quality:</strong> ${stars(qualityRating)} (${qualityRating}/5)</p>
          <p><strong>Professionalism:</strong> ${stars(professionalismRating)} (${professionalismRating}/5)</p>
          ${comment ? `<br/><p><strong>Comment:</strong> "${comment}"</p>` : ""}
          <p><strong>Testimonial permission:</strong> ${testimonialPermission ? "Yes" : "No"}</p>
          <br/>
          <p><a href="${baseUrl}/dashboard/${jobId}">View in dashboard</a></p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
