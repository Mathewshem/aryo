import "server-only";
import { createClient } from "@supabase/supabase-js";

// The URL and anon key are public (they ship to every browser), so they have
// safe defaults; the build never fails just because they weren't set in Vercel.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pvvmakrlfohctwplldad.supabase.co";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dm1ha3JsZm9oY3R3cGxsZGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Nzc0MDQsImV4cCI6MjEwMTQ1MzQwNH0.2EKncDZNrVTJPEzmB6GYjVvJhqCL1hdbaeNINih7uSA";

// Service-role client: bypasses RLS, so it only ever runs on the server.
let admin = null;
export function adminDb() {
  if (admin) return admin;
  const url = URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set on the server.");
  admin = createClient(url, key, { auth: { persistSession: false } });
  return admin;
}

// Anon client for public website reads (RLS limits it to published content).
let pub = null;
export function publicDb() {
  if (pub) return pub;
  pub = createClient(URL, ANON, {
    auth: { persistSession: false },
  });
  return pub;
}
