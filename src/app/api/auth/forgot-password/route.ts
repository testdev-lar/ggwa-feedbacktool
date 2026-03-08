import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-auth";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const origin = request.headers.get("origin") || request.nextUrl.origin;
  const supabase = await createSupabaseServerClient();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
  });

  // Always return success to avoid leaking whether the email exists
  return NextResponse.json({ success: true });
}
