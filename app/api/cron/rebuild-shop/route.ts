import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const deployHook = process.env.VERCEL_DEPLOY_HOOK?.trim();
  if (!cronSecret || !deployHook) {
    return NextResponse.json({ error: "config" }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const response = await fetch(deployHook, { method: "POST" });
  if (!response.ok) {
    return NextResponse.json({ error: "deploy" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
