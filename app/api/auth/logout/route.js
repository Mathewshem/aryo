import { NextResponse } from "next/server";
import { clearSession } from "@/lib/server/session";
export const POST = async () => { clearSession(); return NextResponse.json({ ok: true }); };
