import "server-only";
import nodemailer from "nodemailer";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://aryo.vercel.app";
let transporter = null;

export async function sendEmail({ to, subject, html }) {
  const list = (Array.isArray(to) ? to : String(to || "").split(","))
    .map((s) => s.trim()).filter(Boolean);
  if (!list.length) return { skipped: "no_recipients" };
  if (!process.env.GMAIL_SENDER_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.warn(`email skipped (no Gmail credentials): ${subject}`);
    return { skipped: "no_credentials" };
  }
  transporter ||= nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_SENDER_EMAIL, pass: process.env.GMAIL_APP_PASSWORD },
  });
  try {
    const info = await transporter.sendMail({ from: `"ARYO Nairobi" <${process.env.GMAIL_SENDER_EMAIL}>`, to: list.join(","), subject, html });
    return { ok: true, id: info.messageId };
  } catch (e) {
    console.error("email failed", e.message);
    return { ok: false, error: e.message };
  }
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Black-and-gold shell shared by every email.
export function emailShell({ eyebrow, title, intro, rows = [], cta, note }) {
  const rowHtml = rows.map(([k, v]) => `
    <tr><td style="padding:9px 0;font-size:13px;color:#8b8578;border-bottom:1px solid #26231d;">${esc(k)}</td>
    <td style="padding:9px 0;font-size:13px;color:#f3eee3;text-align:right;border-bottom:1px solid #26231d;font-weight:600;">${esc(v)}</td></tr>`).join("");
  return `<!DOCTYPE html><html><body style="margin:0;background:#07060a;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:28px 16px;">
   <div style="background:#121015;border:1px solid #2a2620;border-radius:10px;padding:30px 26px;">
    <div style="text-align:center;">
      <img src="${SITE}/aryo-logo.jpg" width="72" height="72" alt="ARYO" style="border-radius:50%;border:1px solid #c29a4a;" />
      <div style="margin-top:12px;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#c29a4a;font-weight:700;">${esc(eyebrow || "ARYO Nairobi")}</div>
      <h1 style="margin:8px 0 4px;font-size:20px;color:#f3eee3;">${esc(title)}</h1>
      ${intro ? `<p style="margin:0 0 18px;font-size:13px;color:#a7a092;">${esc(intro)}</p>` : ""}
    </div>
    ${rows.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rowHtml}</table>` : ""}
    ${cta ? `<div style="text-align:center;margin-top:22px;"><a href="${cta.href}" style="display:inline-block;background:#c29a4a;color:#07060a;text-decoration:none;font-weight:700;font-size:13px;padding:11px 22px;border-radius:6px;">${esc(cta.label)}</a></div>` : ""}
    ${note ? `<p style="margin:20px 0 0;font-size:11px;color:#6f695e;text-align:center;">${esc(note)}</p>` : ""}
   </div>
   <p style="text-align:center;font-size:11px;color:#5d584f;margin-top:14px;">ARYO Nairobi · Where dining meets nightlife · Astrol Square, Red Hill Rd</p>
  </div></body></html>`;
}
export { SITE };
