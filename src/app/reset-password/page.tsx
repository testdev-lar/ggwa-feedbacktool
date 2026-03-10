"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBrand } from "@/lib/brand-context";
import { createClient } from "@supabase/supabase-js";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const brand = useBrand();
  const router = useRouter();
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    async function init() {
      // Read OTP token and email from query params
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const email = params.get("email");

      if (!token || !email) {
        setError("Invalid or expired reset link. Please request a new one.");
        return;
      }

      // Create a throwaway client just for OTP verification
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            detectSessionInUrl: false,
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

      // Verify the OTP to establish a recovery session
      const { data, error: otpError } = await client.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });

      if (otpError || !data.session) {
        setError("Invalid or expired reset link. Please request a new one.");
        return;
      }

      // Store the access token directly — don't rely on client session state
      accessTokenRef.current = data.session.access_token;
      setReady(true);

      // Clean the token out of the URL
      window.history.replaceState(null, "", window.location.pathname);
    }

    init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Call Supabase Auth API directly with the stored access token
      // This avoids any client-side session management issues
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${accessTokenRef.current}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.msg || body?.message || "Failed to update password.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
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
          Set new password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your new password below.
        </p>

        {success ? (
          <div className="text-center">
            <p className="text-green-600 text-sm font-medium">
              Password updated! Redirecting to sign in...
            </p>
          </div>
        ) : !ready ? (
          <div className="text-center">
            {error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : (
              <p className="text-gray-500 text-sm">
                Verifying your reset link...
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
              autoFocus
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full py-3 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: brand.color }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
