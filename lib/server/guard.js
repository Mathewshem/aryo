import "server-only";
import { NextResponse } from "next/server";
import { getStaff } from "./session";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export async function requireStaff({ admin = false } = {}) {
  const staff = await getStaff();
  if (!staff) throw new HttpError(401, "Please sign in again.");
  if (admin && staff.role !== "admin") throw new HttpError(403, "Only an admin can do that.");
  return staff;
}

// Wraps a route handler so thrown errors become clean JSON responses.
export function handler(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      const status = e.status || 500;
      if (status === 500) console.error(e);
      return NextResponse.json({ error: e.message || "Something went wrong." }, { status });
    }
  };
}
