import "server-only";
import bcrypt from "bcryptjs";

export const hash = (p) => bcrypt.hash(p, 10);
export const check = (p, h) => bcrypt.compare(p, h || "");
export function validatePassword(p) {
  if (!p || p.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return "Use both letters and numbers.";
  return null;
}
export function tempPassword() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  for (const b of bytes) s += a[b % a.length];
  return s + "7";
}
