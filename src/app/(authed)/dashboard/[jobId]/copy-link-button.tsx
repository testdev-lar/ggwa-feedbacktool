"use client";

import { useState } from "react";

export default function CopyLinkButton({ jobId }: { jobId: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/feedback/${jobId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
    >
      {copied ? "Copied!" : "Copy Feedback Link"}
    </button>
  );
}
