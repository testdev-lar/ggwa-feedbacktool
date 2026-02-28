import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const { data: job, error: jobError } = await supabaseAdmin
    .from("jobs")
    .select("customer_name, job_reference, feedback_status")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { data: feedback } = await supabaseAdmin
    .from("feedback")
    .select("id")
    .eq("job_id", jobId)
    .single();

  return NextResponse.json({
    job,
    hasExistingFeedback: !!feedback,
  });
}
