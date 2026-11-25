import "server-only";
import { adminDb } from "./db";

export async function audit(staff, action, entity, detail) {
  try {
    await adminDb().from("aryo_audit_log").insert({
      actor_id: staff?.id || null, actor_name: staff?.name || "Website", action, entity, detail: detail ? String(detail).slice(0, 500) : null,
    });
  } catch (e) { console.error("audit failed", e.message); }
}
