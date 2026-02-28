"use client";

import { useState } from "react";
import PhotoUpload from "@/components/photo-upload";
import Navbar from "@/components/navbar";
import { useBrand } from "@/lib/brand-context";

export default function SendPage() {
  const brand = useBrand();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [jobReference, setJobReference] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (photos.length === 0) {
      setError("Please add at least one photo.");
      return;
    }

    setSending(true);

    try {
      // Step 1: Upload photos
      const formData = new FormData();
      photos.forEach((photo) => formData.append("photos", photo));

      const uploadRes = await fetch("/api/upload-photos", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || "Photo upload failed");
      }

      const { urls } = await uploadRes.json();

      // Step 2: Create job and send email
      const sendRes = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          jobReference,
          photoUrls: urls,
        }),
      });

      if (!sendRes.ok) {
        const data = await sendRes.json();
        throw new Error(data.error || "Failed to send email");
      }

      setSuccess(customerEmail);
      setCustomerName("");
      setCustomerEmail("");
      setJobReference("");
      setPhotos([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Send Job Photos
        </h1>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Email sent!
            </h2>
            <p className="text-green-700 mb-4">
              Photos and feedback request sent to {success}
            </p>
            <button
              onClick={() => setSuccess(null)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Email *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Reference
              </label>
              <input
                type="text"
                value={jobReference}
                onChange={(e) => setJobReference(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
                placeholder="e.g. Job #1234 — 123 Murray St"
              />
            </div>

            <PhotoUpload onPhotosReady={setPhotos} />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: brand.color }}
            >
              {sending ? "Uploading & Sending..." : "Send Photos & Request Feedback"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
