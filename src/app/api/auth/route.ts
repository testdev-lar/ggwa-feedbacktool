import { NextRequest, NextResponse } from "next/server";
import { verifyPin, getSessionCookieConfig } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { pin } = await request.json();

  if (!verifyPin(pin)) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  const cookie = getSessionCookieConfig();
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    maxAge: cookie.maxAge,
    path: cookie.path,
  });

  return response;
}
