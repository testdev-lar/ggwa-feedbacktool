"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBrand } from "@/lib/brand-context";
import { supabase } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const [debug, setDebug] = useState("");
  const brand = useBrand();
  const router = useRouter();

  useEffect(() => {
    async function init() {
      // Read URL params directly from the browser
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const hash = window.location.hash;
      setDebug(`code=${code || "none"}, hash=${hash || "none"}`);

      // Approach 1: PKCE flow — code in query params
      if (code) {
        const { error: codeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (!codeError) {
          setReady(true);
          return;
        }
        setDebug((prev) => `${prev}, codeErr=${codeError.message}`);
      }

      // Approach 2: Implicit flow — tokens in URL hash
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          setReady(true);
        }
      });

      // Approach 3: Session already exists
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
      }

      return () => subscription.unsubscribe();
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
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        await supabase.auth.signOut();
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
          <div className="text-center space-y-2">
            <p className="text-gray-500 text-sm">
              Verifying your reset link...
            </p>
            {debug && (
              <p className="text-xs text-gray-400 break-all">
                Debug: {debug}
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
