import { supabaseAdmin } from "./supabase-server";

export interface BrandSettings {
  name: string;
  shortName: string;
  color: string;
  logoUrl: string | null;
}

const defaults: BrandSettings = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "Your Company",
  shortName: process.env.NEXT_PUBLIC_COMPANY_SHORT_NAME || "Company",
  color: process.env.NEXT_PUBLIC_BRAND_COLOR || "#2563eb",
  logoUrl: null,
};

export async function getBrand(): Promise<BrandSettings> {
  try {
    const { data } = await supabaseAdmin
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (!data) return defaults;
    return {
      name: data.company_name || defaults.name,
      shortName: data.company_short_name || defaults.shortName,
      color: data.brand_color || defaults.color,
      logoUrl: data.logo_url || null,
    };
  } catch {
    return defaults;
  }
}

// Static fallback for metadata and non-async contexts
export const brand = defaults;
