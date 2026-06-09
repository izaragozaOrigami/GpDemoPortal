import { NextResponse } from "next/server";
import { NAME_COOKIE, SESSION_COOKIE, UID_COOKIE } from "@/lib/buzon/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(UID_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(NAME_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
