import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/db";
import { requireStaff, handler, HttpError } from "@/lib/server/guard";

export const dynamic = "force-dynamic";
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg" };
const FOLDERS = ["talent", "clubs", "partners", "events", "staff"];

// Receives one image (already cropped/resized in the browser) and stores it in the aryo-media bucket.
export const POST = handler(async (req) => {
  await requireStaff();
  const form = await req.formData();
  const file = form.get("file");
  const folder = FOLDERS.includes(form.get("folder")) ? form.get("folder") : "misc";
  if (!file || typeof file === "string") throw new HttpError(400, "No image received.");
  const ext = TYPES[file.type];
  if (!ext) throw new HttpError(400, "Use a JPG, PNG, WEBP or SVG image.");
  if (file.size > 5 * 1024 * 1024) throw new HttpError(400, "Image is larger than 5 MB.");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const db = adminDb();
  const { error } = await db.storage.from("aryo-media").upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) throw new HttpError(400, error.message);
  const { data } = db.storage.from("aryo-media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
});
