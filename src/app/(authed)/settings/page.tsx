"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useBrand } from "@/lib/brand-context";
import Navbar from "@/components/navbar";

export default function SettingsPage() {
  const brand = useBrand();

  const [companyName, setCompanyName] = useState("");
  const [shortName, setShortName] = useState("");
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setCompanyName(data.company_name || "");
        setShortName(data.company_short_name || "");
        setBrandColor(data.brand_color || "#2563eb");
        setLogoUrl(data.logo_url || null);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setMessage("");
    setSaving(true);

    try {
      // Upload logo if a new one was selected
      if (logoFile) {
        setUploadingLogo(true);
        const formData = new FormData();
        formData.append("logo", logoFile);

        const logoRes = await fetch("/api/settings/upload-logo", {
          method: "POST",
          body: formData,
        });

        if (!logoRes.ok) {
          const data = await logoRes.json();
          throw new Error(data.error || "Logo upload failed");
        }

        const { logoUrl: newUrl } = await logoRes.json();
        setLogoUrl(newUrl);
        setLogoFile(null);
        setUploadingLogo(false);
      }

      // Save text settings
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          company_short_name: shortName,
          brand_color: brandColor,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setMessage("Settings saved! Refresh the page to see changes across the app.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
      setUploadingLogo(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  const displayLogo = logoPreview || logoUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Business Settings
        </h1>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {displayLogo ? (
                <Image
                  src={displayLogo}
                  alt="Company logo"
                  width={150}
                  height={50}
                  className="h-12 w-auto object-contain border border-gray-200 rounded-lg p-1"
                />
              ) : (
                <div className="h-12 w-36 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                  No logo
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {displayLogo ? "Change Logo" : "Upload Logo"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Recommended: PNG with transparent background, max 200px wide
            </p>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
              placeholder="e.g. Graffiti Gone WA"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used in emails and the feedback form
            </p>
          </div>

          {/* Short Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Name
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
              placeholder="e.g. GGWA"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used in the page title and email subjects
            </p>
          </div>

          {/* Brand Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="#2563eb"
              />
              <div
                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: brandColor }}
              >
                Preview
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Used for buttons and accents throughout the app and emails
            </p>
          </div>

          {/* Save */}
          {message && (
            <p
              className={`text-sm ${
                message.includes("saved") ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !companyName || !shortName}
            className="w-full py-3 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: brand.color }}
          >
            {uploadingLogo
              ? "Uploading logo..."
              : saving
              ? "Saving..."
              : "Save Settings"}
          </button>
        </div>
      </main>
    </div>
  );
}
