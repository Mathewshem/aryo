import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { adminDb } from "./db";

export const COOKIE = "aryo_session";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.ARYO_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("ARYO_SESSION_SECRET is missing or too short.");
  return new TextEncoder().encode(s);
}

export async function createSession(staff) {
  const token = await new SignJWT({ sub: staff.id, role: staff.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  cookies().set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE,
  });
}

export function clearSession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

// Returns the signed-in, still-active staff member (fresh from the DB) or null.
export async function getStaff() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const { data } = await adminDb()
      .from("aryo_staff")
      .select("id,name,email,phone,role,title,avatar_url,must_change_password,active,last_login,created_at")
      .eq("id", payload.sub)
      .maybeSingle();
    if (!data || !data.active) return null;
    return data;
  } catch {
    return null;
  }
}
