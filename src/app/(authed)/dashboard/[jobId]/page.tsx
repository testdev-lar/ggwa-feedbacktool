import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-server";
import Navbar from "@/components/navbar";
import CopyLinkButton from "./copy-link-button";

export const dynamic = "force-dynamic";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
      <span className="text-gray-500 text-sm ml-1">({rating}/5)</span>
    </span>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (!job) notFound();

  const { data: feedback } = await supabaseAdmin
    .from("feedback")
    .select("*")
    .eq("job_id", jobId)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {job.job_reference || "Job Details"}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Customer:</span>{" "}
              <span className="font-medium">{job.customer_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>{" "}
              <span className="font-medium">{job.customer_email}</span>
            </div>
            <div>
              <span className="text-gray-500">Sent:</span>{" "}
              <span className="font-medium">
                {new Date(job.email_sent_at).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>{" "}
              {job.feedback_status === "received" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Feedback Received
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Awaiting Feedback
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {job.photo_urls.map((url: string, i: number) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={url}
                  alt={`Job photo ${i + 1}`}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Feedback
          </h2>
          {feedback ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Overall Satisfaction</p>
                <Stars rating={feedback.overall_rating} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Quality of Work</p>
                <Stars rating={feedback.quality_rating} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Professionalism & Communication
                </p>
                <Stars rating={feedback.professionalism_rating} />
              </div>
              {feedback.comment && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Comment</p>
                  <p className="text-gray-800">&ldquo;{feedback.comment}&rdquo;</p>
                </div>
              )}
              <div className="text-sm text-gray-500 mt-2">
                Testimonial permission:{" "}
                <span className="font-medium">
                  {feedback.testimonial_permission ? "Yes" : "No"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3">No feedback received yet.</p>
              <CopyLinkButton jobId={jobId} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
