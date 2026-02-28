import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-server";
import Navbar from "@/components/navbar";
import StatsCard from "@/components/stats-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: jobs } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: feedback } = await supabaseAdmin
    .from("feedback")
    .select("overall_rating, quality_rating, professionalism_rating");

  const totalJobs = jobs?.length || 0;
  const totalFeedback = feedback?.length || 0;
  const avgRating =
    totalFeedback > 0
      ? (
          feedback!.reduce((sum, f) => sum + f.overall_rating, 0) /
          totalFeedback
        ).toFixed(1)
      : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard label="Jobs Sent" value={totalJobs} />
          <StatsCard label="Feedback Received" value={totalFeedback} />
          <StatsCard label="Avg Overall Rating" value={avgRating} />
        </div>

        {jobs && jobs.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="hidden sm:grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <span>Date</span>
              <span>Customer</span>
              <span>Job Reference</span>
              <span>Feedback</span>
            </div>
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/${job.id}`}
                className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-600">
                  {new Date(job.created_at).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {job.customer_name}
                </span>
                <span className="text-sm text-gray-600">
                  {job.job_reference || "—"}
                </span>
                <span>
                  {job.feedback_status === "received" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Received
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No jobs sent yet.{" "}
            <Link href="/send" className="text-blue-600 hover:underline">
              Send your first one
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
