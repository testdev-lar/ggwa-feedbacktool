"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import StarRating from "@/components/star-rating";
import { useBrand } from "@/lib/brand-context";

interface JobData {
  customer_name: string;
  job_reference: string;
  feedback_status: string;
}

export default function FeedbackPage() {
  const brand = useBrand();
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [overallRating, setOverallRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [comment, setComment] = useState("");
  const [testimonialPermission, setTestimonialPermission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`/api/feedback/check?jobId=${jobId}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setJob(data.job);
        if (data.hasExistingFeedback) {
          setAlreadySubmitted(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [jobId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!overallRating || !qualityRating || !professionalismRating) {
      setError("Please provide all three ratings.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          overallRating,
          qualityRating,
          professionalismRating,
          comment: comment.trim() || null,
          testimonialPermission,
        }),
      });

      if (res.ok) {
        router.push(`/feedback/${jobId}/thanks`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit feedback");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-600">This feedback link is not valid.</p>
        </div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Image
            src={brand.logoUrl || "/logo.png"}
            alt={brand.shortName}
            width={150}
            height={50}
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Feedback Already Submitted
          </h1>
          <p className="text-gray-600">
            You&apos;ve already provided feedback for this job. Thank you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Image
            src={brand.logoUrl || "/logo.png"}
            alt={brand.name}
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          {job && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                How did we do?
              </h1>
              <p className="text-gray-600">
                Hi {job.customer_name}, we&apos;d love your feedback
                {job.job_reference ? ` on ${job.job_reference}` : ""}.
              </p>
            </>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6"
        >
          <StarRating
            label="How satisfied were you with the overall service?"
            value={overallRating}
            onChange={setOverallRating}
          />

          <StarRating
            label="How would you rate the quality of work?"
            value={qualityRating}
            onChange={setQualityRating}
          />

          <StarRating
            label="How would you rate our professionalism and communication?"
            value={professionalismRating}
            onChange={setProfessionalismRating}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us more about your experience (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent resize-none"
              placeholder="Tell us more about your experience..."
            />
            <p className="text-xs text-gray-400 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={testimonialPermission}
              onChange={(e) => setTestimonialPermission(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">
              I&apos;m happy for {brand.name} to use my feedback as a testimonial
            </span>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: brand.color }}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
