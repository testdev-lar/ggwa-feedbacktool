"use client";

import Image from "next/image";
import { useBrand } from "@/lib/brand-context";

export default function ThanksPage() {
  const brand = useBrand();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <Image
          src={brand.logoUrl || "/logo.png"}
          alt={brand.name}
          width={150}
          height={50}
          className="mx-auto mb-6"
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Thank you for your feedback!
        </h1>
        <p className="text-gray-600">
          Your feedback helps us improve our service. We really appreciate you
          taking the time.
        </p>
      </div>
    </div>
  );
}
