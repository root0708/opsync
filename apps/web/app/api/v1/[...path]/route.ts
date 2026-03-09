import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${API_URL.replace(/\/$/, "")}/api/v1/${pathStr}`;
  const auth = request.headers.get("authorization");

  const headers: Record<string, string> = {};
  if (auth) headers["Authorization"] = auth;

  try {
    const res = await fetch(url, { headers });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${API_URL.replace(/\/$/, "")}/api/v1/${pathStr}`;
  const auth = request.headers.get("authorization");
  const body = await request.text();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = auth;

  try {
    const res = await fetch(url, { method: "POST", headers, body: body || undefined });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}
