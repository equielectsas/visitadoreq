import { NextResponse } from "next/server";
import { getChequeoApiBase } from "@/lib/chequeoUpstreamBase";
import { colombiaDateYmd, normCedulaChequeo } from "@/utils/chequeoVehiculoStorage";
import { completadosChequeoDesdeReportesJson } from "@/lib/chequeoEstadoFromReports";

/** `completados` sale de reportes día = datos que la plataforma expone desde BD (cualquier app que haya guardado hoy). */
export const dynamic = "force-dynamic";

function forwardAuthFromRequest(req) {
  const h = { Accept: "application/json" };
  const auth = req.headers.get("authorization");
  const xAccess = req.headers.get("x-access-token");
  const xAuth = req.headers.get("x-authorization");
  if (auth) h.Authorization = auth;
  if (xAccess) h["X-Access-Token"] = xAccess;
  if (xAuth) h["X-Authorization"] = xAuth;
  return h;
}

async function getJson(res) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export async function GET(request) {
  const apiBase = getChequeoApiBase();
  if (!apiBase) {
    return NextResponse.json({ message: "CHEQUEO_API_REWRITE_TARGET no configurado en el servidor." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const myCed = normCedulaChequeo(searchParams.get("cedula"));
  if (!myCed) {
    return NextResponse.json({ message: "Parámetro cedula requerido." }, { status: 400 });
  }

  const authHeaders = forwardAuthFromRequest(request);
  if (!authHeaders.Authorization && !authHeaders["X-Access-Token"]) {
    return NextResponse.json({ message: "Token de autorización requerido." }, { status: 401 });
  }

  const hoy = colombiaDateYmd();
  if (!hoy) {
    return NextResponse.json({ message: "No se pudo calcular la fecha calendario." }, { status: 500 });
  }

  const qs = new URLSearchParams({ fechaInicio: hoy, fechaFin: hoy }).toString();
  const base = String(apiBase).replace(/\/+$/, "");

  const urlCarro = `${base}/chequeoVehiculos/reporteCarro?${qs}`;
  const urlMoto = `${base}/chequeoVehiculos/reporteMoto?${qs}`;
  const urlPub = `${base}/chequeoVehiculos/reporteTransportePublico?${qs}`;

  try {
    const [carroRes, motoRes, pubRes] = await Promise.all([
      fetch(urlCarro, { method: "GET", headers: authHeaders, cache: "no-store" }),
      fetch(urlMoto, { method: "GET", headers: authHeaders, cache: "no-store" }),
      fetch(urlPub, { method: "GET", headers: authHeaders, cache: "no-store" }).catch(() => null),
    ]);

    const carroJson = await getJson(carroRes);
    const motoJson = await getJson(motoRes);
    const publicoJson = pubRes && pubRes.ok ? await getJson(pubRes) : { data: [] };

    if (!carroRes.ok || !motoRes.ok) {
      return NextResponse.json(
        {
          message: "La plataforma de chequeo no devolvió los reportes esperados.",
          fechaYmd: hoy,
          completados: { Carro: false, Motocicleta: false, "Transporte Público": false },
          upstream: { carro: carroRes.status, moto: motoRes.status, publico: pubRes?.status ?? 0 },
        },
        { status: 502 }
      );
    }

    const completados = completadosChequeoDesdeReportesJson(hoy, myCed, carroJson, motoJson, publicoJson);
    return NextResponse.json({ fechaYmd: hoy, completados });
  } catch (e) {
    return NextResponse.json(
      { message: e?.message || "Error al contactar la plataforma de chequeo." },
      { status: 502 }
    );
  }
}
