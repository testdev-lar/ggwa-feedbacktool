import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json({
      company_name: "Your Company",
      company_short_name: "Company",
      brand_color: "#2563eb",
      logo_url: null,
    });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const { company_name, company_short_name, brand_color } =
    await request.json();

  if (!company_name || !company_short_name || !brand_color) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({
      id: 1,
      company_name,
      company_short_name,
      brand_color,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json(
      { error: `Database error: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
