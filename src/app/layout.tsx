import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { getBrand, brand } from "@/lib/branding";
import { BrandProvider } from "@/lib/brand-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${brand.shortName} Feedback Tool`,
  description: `Job photo delivery and feedback collection for ${brand.name}`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandSettings = await getBrand();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased bg-gray-50 text-gray-900`}
        style={{ "--brand-color": brandSettings.color } as React.CSSProperties}
      >
        <BrandProvider value={brandSettings}>{children}</BrandProvider>
      </body>
    </html>
  );
}
