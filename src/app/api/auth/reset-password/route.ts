import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const { password, access_token } = await request.json();

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  if (!access_token) {
    return NextResponse.json(
      { error: "Missing access token" },
      { status: 401 }
    );
  }

  // Verify the access token and get the user
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(access_token);

  if (userError || !user) {
    return NextResponse.json(
      { error: "Invalid or expired session. Please request a new reset link." },
      { status: 401 }
    );
  }

  // Update password using admin client (bypasses all session/key issues)
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
