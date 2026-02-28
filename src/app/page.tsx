"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBrand } from "@/lib/brand-context";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const brand = useBrand();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        router.push("/send");
      } else {
        setError("Incorrect PIN");
        setPin("");
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
        <h1 className="text-xl font-semibold text-center mb-6 text-gray-800">
          Enter PIN to continue
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full py-3 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: brand.color }}
          >
            {loading ? "Checking..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
