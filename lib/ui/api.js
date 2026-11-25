"use client";
export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : undefined,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    cache: "no-store",
  });
  let data = {};
  try { data = await res.json(); } catch {}
  if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/api/auth")) window.location.href = "/admin/login";
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
