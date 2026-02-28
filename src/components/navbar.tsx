"use client";

import Image from "next/image";
import Link from "next/link";
import { useBrand } from "@/lib/brand-context";

export default function Navbar() {
  const brand = useBrand();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard">
          <Image
            src={brand.logoUrl || "/logo.png"}
            alt={brand.shortName}
            width={120}
            height={40}
          />
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link
            href="/send"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Send Photos
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
