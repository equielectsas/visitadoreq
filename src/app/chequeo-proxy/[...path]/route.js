import { NextResponse } from "next/server";
import { getChequeoApiBase } from "@/lib/chequeoUpstreamBase";

/**
 * Proxy servidor → API plataforma (chequeo vehículo).
 * Debe vivir fuera de /api/* para no ser capturado por next.config rewrites → visitadorback.
 */

function upstreamUrl(pathSegments, search) {
  const apiBase = getChequeoApiBase();
  if (!apiBase) return null;
  const path = Array.isArray(pathSegments) ? pathSegments.join("/") : "";
  const q = search && String(search).startsWith("?") ? search : search ? `?${search}` : "";
  return `${apiBase}/${path}${q}`;
}

function forwardAuthHeaders(req) {
  const h = {};
  const auth = req.headers.get("authorization");
  const xAccess = req.headers.get("x-access-token");
  const xAuth = req.headers.get("x-authorization");
  if (auth) h.Authorization = auth;
  if (xAccess) h["X-Access-Token"] = xAccess;
  if (xAuth) h["X-Authorization"] = xAuth;
  return h;
}

export async function GET(request, context) {
  const params = await context.params;
  const url = upstreamUrl(params.path, request.nextUrl.search);
  if (!url) {
    return NextResponse.json(
      { message: "CHEQUEO_API_REWRITE_TARGET no configurado en el servidor." },
      { status: 500 }
    );
  }
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...forwardAuthHeaders(request),
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const text = await res.text();
    const ct = res.headers.get("content-type") || "application/json";
    return new NextResponse(text, { status: res.status, headers: { "Content-Type": ct } });
  } catch (e) {
    return NextResponse.json(
      { message: e?.message || "Error al contactar el API de chequeo." },
      { status: 502 }
    );
  }
}

export async function POST(request, context) {
  const params = await context.params;
  const url = upstreamUrl(params.path, "");
  if (!url) {
    return NextResponse.json(
      { message: "CHEQUEO_API_REWRITE_TARGET no configurado en el servidor." },
      { status: 500 }
    );
  }
  try {
    const body = await request.text();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...forwardAuthHeaders(request),
      },
      body,
      cache: "no-store",
    });
    const text = await res.text();
    const ct = res.headers.get("content-type") || "application/json";
    return new NextResponse(text, { status: res.status, headers: { "Content-Type": ct } });
  } catch (e) {
    return NextResponse.json(
      { message: e?.message || "Error al contactar el API de chequeo." },
      { status: 502 }
    );
  }
}
