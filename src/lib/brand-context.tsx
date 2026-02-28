"use client";

import { createContext, useContext } from "react";
import type { BrandSettings } from "./branding";

const defaultBrand: BrandSettings = {
  name: "Your Company",
  shortName: "Company",
  color: "#2563eb",
  logoUrl: null,
};

const BrandContext = createContext<BrandSettings>(defaultBrand);

export function BrandProvider({
  value,
  children,
}: {
  value: BrandSettings;
  children: React.ReactNode;
}) {
  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
