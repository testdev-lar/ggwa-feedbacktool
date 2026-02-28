import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "png";
    const path = `logo.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Delete old logo if exists
    await supabaseAdmin.storage.from("job-photos").remove([`logo.png`, `logo.jpg`, `logo.jpeg`, `logo.svg`, `logo.webp`]);

    // Upload new logo
    const { error: uploadError } = await supabaseAdmin.storage
      .from("job-photos")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("job-photos")
      .getPublicUrl(path);

    // Update settings with new logo URL
    const { error: dbError } = await supabaseAdmin
      .from("settings")
      .upsert({
        id: 1,
        logo_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ logoUrl: urlData.publicUrl });
  } catch {
    return NextResponse.json(
      { error: "Logo upload failed" },
      { status: 500 }
    );
  }
}
