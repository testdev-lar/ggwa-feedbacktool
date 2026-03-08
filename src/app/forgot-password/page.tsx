"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBrand } from "@/lib/brand-context";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const brand = useBrand();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <Image
            src={brand.logoUrl || "/logo.png"}
            alt={brand.name}
            width={180}
            height={60}
            priority
          />
        </div>
        <h1 className="text-xl font-semibold text-center mb-2 text-gray-800">
          Reset your password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 text-sm font-medium">
              Check your email for a password reset link.
            </p>
            <Link
              href="/"
              className="text-sm font-medium hover:underline"
              style={{ color: brand.color }}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: brand.color }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
