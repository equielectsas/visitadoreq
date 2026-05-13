"use client";

import { useEffect, useMemo, useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";
import { fechaRegistroChequeoYmd, fechaChequeoDdMmYyyyColombia, ymdVisitaDdMmYyyy } from "@/utils/chequeoVehiculoStorage";
import { extraerFilasReporteChequeo, cedulaDesdeRegistroChequeo } from "@/lib/chequeoEstadoFromReports";

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
  const [publicoRegs, setPublicoRegs] = useState([]);

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
        fetchJSON(`/chequeo-proxy/chequeoVehiculos/reporteCarro?${paramsRep.toString()}`),
        fetchJSON(`/chequeo-proxy/chequeoVehiculos/reporteMoto?${paramsRep.toString()}`),
      ]);
      setCarroRegs(extraerFilasReporteChequeo(carroRes));
      setMotoRegs(extraerFilasReporteChequeo(motoRes));
      let publicoRes = {};
      try {
        publicoRes = await fetchJSON(`/chequeo-proxy/chequeoVehiculos/reporteTransportePublico?${paramsRep.toString()}`);
      } catch {
        publicoRes = {};
      }
      setPublicoRegs(extraerFilasReporteChequeo(publicoRes));
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
      const ymd = v?.fecha || fechaRegistroChequeoYmd(v?.scheduledAt) || "";
      if (!ymd) continue;

      const key = `${normCedula(cedula)}|${ymd}`;
      if (!map.has(key)) map.set(key, { cedula, nombre, ymd, carro: false, publico: false, moto: false });

      const t = v?.datosVisita?.tipoVehiculo || "";
      if (t === "Carro") map.get(key).carro = true;
      if (t === "Transporte Público") map.get(key).publico = true;
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
      if (!idx.has(key)) idx.set(key, { carro: false, publico: false, moto: false });
      idx.get(key)[tipo] = true;
    };

    for (const r of carroRegs) put(cedulaDesdeRegistroChequeo(r), fechaRegistroChequeoYmd(r?.fecha), "carro");
    for (const r of motoRegs) put(cedulaDesdeRegistroChequeo(r), fechaRegistroChequeoYmd(r?.fecha), "moto");
    for (const r of publicoRegs) put(cedulaDesdeRegistroChequeo(r), fechaRegistroChequeoYmd(r?.fecha), "publico");
    return idx;
  }, [carroRegs, motoRegs, publicoRegs]);

  const hayRegistrosChequeoEq =
    carroRegs.length > 0 || motoRegs.length > 0 || publicoRegs.length > 0;

  const resumen = useMemo(() => {
    return esperadoPorAsesor.map((e) => {
      const st = enviadosIndex.get(`${normCedula(e.cedula)}|${e.ymd}`) || { carro: false, publico: false, moto: false };
      const carroEnviado = !!st.carro;
      const publicoEnviado = !!st.publico;
      const motoEnviado = !!st.moto;
      const carroFalta = hayRegistrosChequeoEq && e.carro && !carroEnviado;
      const publicoFalta = hayRegistrosChequeoEq && e.publico && !publicoEnviado;
      const motoFalta = hayRegistrosChequeoEq && e.moto && !motoEnviado;
      return {
        ...e,
        carroEnviado,
        publicoEnviado,
        motoEnviado,
        carroFalta,
        publicoFalta,
        motoFalta,
      };
    });
  }, [esperadoPorAsesor, enviadosIndex, hayRegistrosChequeoEq]);

  const descargarCSV = () => {
    const header = [
      "Fecha (dd/mm/aaaa Colombia)",
      "Cédula",
      "Nombre",
      "Requiere carro",
      "Enviado carro",
      "Requiere transporte público",
      "Enviado transporte público",
      "Requiere moto",
      "Enviado moto",
    ];
    const rows = resumen.map((r) => [
      ymdVisitaDdMmYyyy(r.ymd),
      r.cedula,
      r.nombre,
      r.carro ? "SI" : "NO",
      r.carroEnviado ? "SI" : "NO",
      r.publico ? "SI" : "NO",
      r.publicoEnviado ? "SI" : "NO",
      r.moto ? "SI" : "NO",
      r.motoEnviado ? "SI" : "NO",
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    downloadText(`resumen_chequeo_${desde}_a_${hasta}.csv`, csv);
  };

  const descargarCSVDetalleChequeos = () => {
    const header = [
      "Tipo",
      "Cédula",
      "Nombre",
      "Placa",
      "Fecha_calendario_Colombia_ddmmyyyy",
      "Fecha_ymd_colombia",
      "Fecha_raw_bd",
    ];
    const pushTipo = (rows, list, tipoLabel) => {
      for (const r of list) {
        const ymd = fechaRegistroChequeoYmd(r?.fecha);
        const raw =
          r?.fecha != null
            ? typeof r.fecha === "object"
              ? JSON.stringify(r.fecha)
              : String(r.fecha)
            : "";
        rows.push([
          tipoLabel,
          cedulaDesdeRegistroChequeo(r) || String(r?.cedula ?? ""),
          r?.nombre ?? "",
          r?.placa ?? "",
          fechaChequeoDdMmYyyyColombia(r?.fecha),
          ymd,
          raw,
        ]);
      }
    };
    const rows = [header];
    pushTipo(rows, carroRegs, "Carro");
    pushTipo(rows, motoRegs, "Motocicleta");
    pushTipo(rows, publicoRegs, "Transporte público");
    const csv = "\uFEFF" + rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    downloadText(`detalle_chequeos_eq_${desde}_a_${hasta}.csv`, csv);
  };

  return (
    <LayoutDashboard>
      <div className="max-w-6xl mx-auto space-y-5">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Administración</p>
          <h1 className="text-2xl font-black text-gray-800 mt-0.5">Informe chequeo vehículo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visitas vía <strong>/api</strong> (visitadorback). Reportes de chequeo vía <strong>/chequeo-proxy</strong> (proxy en{" "}
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
              Descargar CSV resumen
            </button>

            <button
              type="button"
              onClick={descargarCSVDetalleChequeos}
              disabled={
                loading ||
                (carroRegs.length === 0 && motoRegs.length === 0 && publicoRegs.length === 0)
              }
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 disabled:opacity-50"
            >
              Descargar CSV chequeos (EQ)
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {!loading && !error && visitas.length > 0 && !hayRegistrosChequeoEq && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
              <strong>No hay filas de chequeo devueltas por la plataforma EQ</strong> en este rango: no se marca
              &quot;Falta&quot; frente a la BD (no hay datos que contrastar). Revisa fechas o conexión con el API de
              chequeo.
            </div>
          )}

          <div className="text-xs text-gray-500 flex flex-wrap gap-4">
            <span><strong>Visitas</strong>: {visitas.length}</span>
            <span><strong>Chequeos carro</strong>: {carroRegs.length}</span>
            <span><strong>Chequeos transporte público</strong>: {publicoRegs.length}</span>
            <span><strong>Chequeos moto</strong>: {motoRegs.length}</span>
            <span><strong>Filas resumen</strong>: {resumen.length}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs font-black text-gray-600 uppercase tracking-wide">
                  <th className="px-4 py-3">Fecha (Colombia)</th>
                  <th className="px-4 py-3">Cédula</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Carro</th>
                  <th className="px-4 py-3">T. público</th>
                  <th className="px-4 py-3">Moto</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resumen.map((r) => {
                  const sinDatosEq = !hayRegistrosChequeoEq;
                  const requiereAlguno = r.carro || r.publico || r.moto;
                  const ok = hayRegistrosChequeoEq && !(r.carroFalta || r.publicoFalta || r.motoFalta);
                  const badge = (requiere, enviado) => {
                    if (!requiere) return <span className="text-gray-300">—</span>;
                    if (sinDatosEq) {
                      return (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          Sin datos EQ
                        </span>
                      );
                    }
                    if (enviado) {
                      return (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          Enviado
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        Falta
                      </span>
                    );
                  };
                  let estadoLabel = "Incompleto";
                  let estadoClass = "bg-amber-100 text-amber-900";
                  if (!hayRegistrosChequeoEq && requiereAlguno) {
                    estadoLabel = "Sin datos EQ";
                    estadoClass = "bg-slate-100 text-slate-700";
                  } else if (ok) {
                    estadoLabel = "OK";
                    estadoClass = "bg-emerald-100 text-emerald-800";
                  }
                  return (
                    <tr key={`${r.cedula}|${r.ymd}`} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-semibold text-gray-700" title={String(r.ymd)}>
                        {ymdVisitaDdMmYyyy(r.ymd)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{r.cedula}</td>
                      <td className="px-4 py-3 text-gray-800 font-semibold">{r.nombre || "—"}</td>
                      <td className="px-4 py-3">{badge(r.carro, r.carroEnviado)}</td>
                      <td className="px-4 py-3">{badge(r.publico, r.publicoEnviado)}</td>
                      <td className="px-4 py-3">{badge(r.moto, r.motoEnviado)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black ${estadoClass}`}>
                          {estadoLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {resumen.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-gray-400" colSpan={7}>
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

