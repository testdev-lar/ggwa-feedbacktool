import { cookies } from "next/headers";

const COOKIE_NAME = "feedback_tool_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function verifyPin(pin: string): boolean {
  return pin === process.env.APP_PIN;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "authenticated";
}

export function getSessionCookieConfig() {
  return {
    name: COOKIE_NAME,
    value: "authenticated",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}
