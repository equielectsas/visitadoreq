"use client";

import { useEffect, useMemo, useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

function getToken() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}

function bogotaYmd(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function fmtBogotaYmdFromDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return bogotaYmd(d);
}

function normCedula(c) {
  return String(c ?? "")
    .trim()
    .replace(/\D/g, "");
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export default function AdminChequeoVehiculoPage() {
  const [user, setUser] = useState(null);
  const [desde, setDesde] = useState(bogotaYmd());
  const [hasta, setHasta] = useState(bogotaYmd());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [visitas, setVisitas] = useState([]);
  const [carroRegs, setCarroRegs] = useState([]);
  const [motoRegs, setMotoRegs] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const fetchJSON = async (url) => {
    const token = getToken();
    const res = await fetch(url, { headers: { Authorization: token } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
    return data;
  };

  const consultar = async () => {
    setError("");
    if (!desde || !hasta) {
      setError("Selecciona fecha inicio y fin.");
      return;
    }

    setLoading(true);
    try {
      const paramsVisitas = new URLSearchParams({
        desde,
        hasta,
        page: "1",
        limit: "500",
      });
      const visitasRes = await fetchJSON(`/api/visitas?${paramsVisitas.toString()}`);
      const vList = Array.isArray(visitasRes?.visitas)
        ? visitasRes.visitas
        : Array.isArray(visitasRes?.data)
          ? visitasRes.data
          : [];
      setVisitas(vList);

      const paramsRep = new URLSearchParams({ fechaInicio: desde, fechaFin: hasta });
      const [carroRes, motoRes] = await Promise.all([
        fetchJSON(`/api-chequeo/chequeoVehiculos/reporteCarro?${paramsRep.toString()}`),
        fetchJSON(`/api-chequeo/chequeoVehiculos/reporteMoto?${paramsRep.toString()}`),
      ]);
      setCarroRegs(Array.isArray(carroRes?.data) ? carroRes.data : []);
      setMotoRegs(Array.isArray(motoRes?.data) ? motoRes.data : []);
    } catch (e) {
      setError(e?.message || "No se pudo consultar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) consultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const esperadoPorAsesor = useMemo(() => {
    const map = new Map();
    for (const v of visitas) {
      const cedula = v?.asesor?.cedula;
      if (!cedula) continue;
      const nombre = v?.asesor?.nombre || "";
      const ymd = v?.fecha || fmtBogotaYmdFromDate(v?.scheduledAt) || "";
      if (!ymd) continue;

      const key = `${cedula}|${ymd}`;
      if (!map.has(key)) map.set(key, { cedula, nombre, ymd, carro: false, moto: false });

      const t = v?.datosVisita?.tipoVehiculo || "";
      if (t === "Carro" || t === "Transporte Público") map.get(key).carro = true;
      if (t === "Motocicleta") map.get(key).moto = true;
    }
    return [...map.values()].sort(
      (a, b) => (a.ymd < b.ymd ? 1 : -1) || String(a.cedula).localeCompare(String(b.cedula))
    );
  }, [visitas]);

  const enviadosIndex = useMemo(() => {
    const idx = new Map();
    const put = (cedula, ymd, tipo) => {
      const c = normCedula(cedula);
      if (!c || !ymd) return;
      const key = `${c}|${ymd}`;
      if (!idx.has(key)) idx.set(key, { carro: false, moto: false });
      idx.get(key)[tipo] = true;
    };

    for (const r of carroRegs) put(r?.cedula, fmtBogotaYmdFromDate(r?.fecha), "carro");
    for (const r of motoRegs) put(r?.cedula, fmtBogotaYmdFromDate(r?.fecha), "moto");
    return idx;
  }, [carroRegs, motoRegs]);

  const resumen = useMemo(() => {
    return esperadoPorAsesor.map((e) => {
      const st = enviadosIndex.get(`${normCedula(e.cedula)}|${e.ymd}`) || { carro: false, moto: false };
      return {
        ...e,
        carroEnviado: !!st.carro,
        motoEnviado: !!st.moto,
        carroFalta: e.carro && !st.carro,
        motoFalta: e.moto && !st.moto,
      };
    });
  }, [esperadoPorAsesor, enviadosIndex]);

  const descargarCSV = () => {
    const header = ["Fecha", "Cédula", "Nombre", "Requiere carro", "Enviado carro", "Requiere moto", "Enviado moto"];
    const rows = resumen.map((r) => [
      r.ymd,
      r.cedula,
      r.nombre,
      r.carro ? "SI" : "NO",
      r.carroEnviado ? "SI" : "NO",
      r.moto ? "SI" : "NO",
      r.motoEnviado ? "SI" : "NO",
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    downloadText(`resumen_chequeo_${desde}_a_${hasta}.csv`, csv);
  };

  return (
    <LayoutDashboard>
      <div className="max-w-6xl mx-auto space-y-5">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Administración</p>
          <h1 className="text-2xl font-black text-gray-800 mt-0.5">Informe chequeo vehículo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visitas vía <strong>/api</strong> (visitadorback). Reportes de chequeo vía <strong>/api-chequeo</strong> (proxy en{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">next.config.mjs</code>
            , por defecto puerto 3001). La fecha se calcula en <strong>America/Bogotá</strong>.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
              />
            </div>

            <button
              type="button"
              onClick={consultar}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-[#1C355E] text-white text-sm font-bold disabled:opacity-50"
            >
              {loading ? "Consultando…" : "Consultar"}
            </button>

            <button
              type="button"
              onClick={descargarCSV}
              disabled={loading || resumen.length === 0}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 disabled:opacity-50"
            >
              Descargar CSV
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="text-xs text-gray-500 flex flex-wrap gap-4">
            <span><strong>Visitas</strong>: {visitas.length}</span>
            <span><strong>Chequeos carro</strong>: {carroRegs.length}</span>
            <span><strong>Chequeos moto</strong>: {motoRegs.length}</span>
            <span><strong>Filas resumen</strong>: {resumen.length}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs font-black text-gray-600 uppercase tracking-wide">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Cédula</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Carro</th>
                  <th className="px-4 py-3">Moto</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resumen.map((r) => {
                  const ok = !(r.carroFalta || r.motoFalta);
                  return (
                    <tr key={`${r.cedula}|${r.ymd}`} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-semibold text-gray-700">{r.ymd}</td>
                      <td className="px-4 py-3 text-gray-700">{r.cedula}</td>
                      <td className="px-4 py-3 text-gray-800 font-semibold">{r.nombre || "—"}</td>
                      <td className="px-4 py-3">
                        {r.carro ? (
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                              r.carroEnviado ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {r.carroEnviado ? "Enviado" : "Falta"}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.moto ? (
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                              r.motoEnviado ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {r.motoEnviado ? "Enviado" : "Falta"}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black ${
                            ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {ok ? "OK" : "Incompleto"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {resumen.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-gray-400" colSpan={6}>
                      No hay datos para el rango seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}

