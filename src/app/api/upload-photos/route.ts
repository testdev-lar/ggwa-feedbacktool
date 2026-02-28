import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("photos") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No photos provided" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabaseAdmin.storage
        .from("job-photos")
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        return NextResponse.json(
          { error: `Failed to upload ${file.name}: ${error.message}` },
          { status: 500 }
        );
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("job-photos")
        .getPublicUrl(path);

      urls.push(urlData.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
