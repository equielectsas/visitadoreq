"use client";

/**
 * Reportes page — /dashboard/programador/reportes  /dashboard/admin/reportes  /dashboard/asesor/reportes
 * Admin/Programador: ve todos los datos de todos los asesores.
 * Asesor: ve solo sus propios datos.
 * Descarga Excel con SheetJS (xlsx).
 */

import { useState, useEffect } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);
const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const CalIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    activa:       "bg-emerald-50 text-emerald-700",
    pendiente:    "bg-yellow-50 text-yellow-700",
    realizada:    "bg-blue-50 text-blue-700",
    reprogramada: "bg-purple-50 text-purple-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon }) {
  return (
    <div className="relative bg-white rounded-2xl p-5 overflow-hidden border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)]">
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${accent}`} />
      <div className="flex items-start justify-between mt-1">
        <div>
          <p className="text-xs font-semibold text-[#98989A] uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-[#1C355E] leading-none">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#1C355E]/6 flex items-center justify-center text-[#1C355E]">{icon}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXCEL DOWNLOAD (client-side with SheetJS via CDN script)
// ─────────────────────────────────────────────────────────────────────────────
async function downloadExcel(rows, filename) {
  // Dynamically load SheetJS if not present
  if (!window.XLSX) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src   = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload  = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  const XLSX   = window.XLSX;
  const ws     = XLSX.utils.json_to_sheet(rows);
  const wb     = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function flattenCita(c) {
  return {
    "ID":             c.id,
    "Asesor":         c.asesorNombre || "—",
    "Cliente/Empresa":c.datosVisita?.nombreEmpresa || c.cliente || "—",
    "NIT":            c.datosVisita?.nit            || "—",
    "Encargado":      c.datosVisita?.nombreEncargado|| "—",
    "Cargo encargado":c.datosVisita?.cargoEncargado || "—",
    "Tipo visita":    c.datosVisita?.tipoVisita      || "—",
    "Municipio":      c.datosVisita?.municipio       || "—",
    "Vehículo":       c.datosVisita?.tipoVehiculo    || "—",
    "Fecha":          c.fecha || "—",
    "Hora":           c.hora  || "—",
    "Estado":         c.estado || "—",
    "Observaciones":  c.datosVisita?.observaciones   || "—",
    "Lat":            c.datosVisita?.geoCoords?.lat  || "—",
    "Lng":            c.datosVisita?.geoCoords?.lng  || "—",
    "Tareas":         (c.datosVisita?.tareasPendientes || []).map(t => `[${t.done ? "✓" : " "}] ${t.texto}`).join(" | "),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ReportesPage() {
  const [user, setUser]         = useState(null);
  const [allCitas, setAllCitas] = useState([]);
  const [loading, setLoading]   = useState(false);

  // Filters
  const [filtroAsesor, setFiltroAsesor] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroDesde,  setFiltroDesde]  = useState("");
  const [filtroHasta,  setFiltroHasta]  = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    const storedCitas = localStorage.getItem("equielect_citas");
    if (storedCitas) setAllCitas(JSON.parse(storedCitas));
  }, []);

  const isAsesor  = user?.rol === "comercial";
  const isAdmin   = user?.rol === "adminComercial" || user?.rol === "adminPlataforma";

  // Data visible
  const baseCitas = isAsesor
    ? allCitas.filter(c => c.asesorId === user?.id || c.asesorNombre === user?.nombre)
    : allCitas;

  // Unique advisors list
  const asesores = [...new Set(allCitas.map(c => c.asesorNombre).filter(Boolean))];

  // Apply filters
  const filtered = baseCitas.filter(c => {
    if (filtroAsesor !== "todos" && c.asesorNombre !== filtroAsesor) return false;
    if (filtroEstado !== "todos" && c.estado !== filtroEstado) return false;
    if (filtroDesde && c.fecha && c.fecha < filtroDesde) return false;
    if (filtroHasta && c.fecha && c.fecha > filtroHasta) return false;
    return true;
  });

  const stats = {
    total:        filtered.length,
    realizadas:   filtered.filter(c => c.estado === "realizada").length,
    pendientes:   filtered.filter(c => c.estado === "pendiente").length,
    reprogramadas:filtered.filter(c => c.estado === "reprogramada").length,
  };

  const handleDownloadAll = async () => {
    setLoading(true);
    try {
      const rows = filtered.map(flattenCita);
      await downloadExcel(rows, `Reporte_Visitas_${new Date().toISOString().split("T")[0]}`);
    } finally { setLoading(false); }
  };

  const handleDownloadAsesor = async (nombre) => {
    setLoading(true);
    try {
      const rows = filtered.filter(c => c.asesorNombre === nombre).map(flattenCita);
      const safe = nombre.replace(/\s+/g, "_");
      await downloadExcel(rows, `Reporte_${safe}_${new Date().toISOString().split("T")[0]}`);
    } finally { setLoading(false); }
  };

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fu   { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
        .fu-1 { animation-delay:.05s; } .fu-2 { animation-delay:.10s; }
        .fu-3 { animation-delay:.15s; } .fu-4 { animation-delay:.20s; }
      `}</style>

      <main className="flex-1 bg-[#F4F6FA] p-6 md:p-8 min-h-screen">

        {/* Title */}
        <div className="fu fu-1 mb-7 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest mb-0.5">
              {isAsesor ? "Mi Panel" : "Panel General"}
            </p>
            <h1 className="text-2xl font-black text-[#1C355E]">Reportes</h1>
          </div>
          <button
            onClick={handleDownloadAll}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm
              hover:bg-[#16294d] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.97] transition-all shadow-md"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : <DownloadIcon />}
            Descargar Excel ({filtered.length} registros)
          </button>
        </div>

        {/* Stats */}
        <div className="fu fu-1 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard label="Total visitas"   value={stats.total}        accent="bg-[#1C355E]"    icon={<FileIcon />} />
          <StatCard label="Realizadas"      value={stats.realizadas}   accent="bg-blue-400"     icon={<CalIcon />}  />
          <StatCard label="Pendientes"      value={stats.pendientes}   accent="bg-[#FFCD00]"   icon={<CalIcon />}  />
          <StatCard label="Reprogramadas"   value={stats.reprogramadas} accent="bg-purple-400" icon={<CalIcon />}  />
        </div>

        {/* Filters */}
        <div className="fu fu-2 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] p-5 mb-7">
          <div className="flex items-center gap-2 mb-4">
            <FilterIcon />
            <p className="text-sm font-bold text-gray-700">Filtros</p>
          </div>
          <div className={`grid gap-4 ${isAdmin ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"}`}>
            {/* Asesor filter — solo admin */}
            {isAdmin && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Asesor</label>
                <select value={filtroAsesor} onChange={e => setFiltroAsesor(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E]">
                  <option value="todos">Todos los asesores</option>
                  {asesores.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            )}
            {/* Estado */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estado</label>
              <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E]">
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="activa">Activa</option>
                <option value="realizada">Realizada</option>
                <option value="reprogramada">Reprogramada</option>
              </select>
            </div>
            {/* Desde */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Desde</label>
              <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E]" />
            </div>
            {/* Hasta */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hasta</label>
              <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E]" />
            </div>
          </div>

          {/* Reset */}
          {(filtroAsesor !== "todos" || filtroEstado !== "todos" || filtroDesde || filtroHasta) && (
            <button
              onClick={() => { setFiltroAsesor("todos"); setFiltroEstado("todos"); setFiltroDesde(""); setFiltroHasta(""); }}
              className="mt-3 text-xs font-semibold text-[#1C355E] hover:text-[#FFCD00] transition-colors"
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {/* Per-advisor download cards — solo admin */}
        {isAdmin && asesores.length > 0 && (
          <div className="fu fu-3 mb-7">
            <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest mb-3">Descargar por asesor</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {asesores.map(nombre => {
                const count = filtered.filter(c => c.asesorNombre === nombre).length;
                return (
                  <button key={nombre} onClick={() => handleDownloadAsesor(nombre)}
                    disabled={loading || count === 0}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 hover:border-[#1C355E]/30
                      hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all group text-left">
                    <div className="w-9 h-9 rounded-xl bg-[#1C355E]/8 flex items-center justify-center text-[#1C355E] flex-shrink-0 group-hover:bg-[#1C355E] group-hover:text-white transition-all">
                      <UserIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-700 truncate">{nombre}</p>
                      <p className="text-xs text-gray-400">{count} visitas</p>
                    </div>
                    <DownloadIcon />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="fu fu-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest">Vista previa</p>
              <p className="text-base font-black text-[#1C355E]">
                {filtered.length} registro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4F6FA]">
                  {[
                    isAdmin && "Asesor",
                    "Empresa", "Tipo", "Municipio", "Fecha", "Estado"
                  ].filter(Boolean).map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? filtered.slice(0, 50).map((c, i) => (
                  <tr key={c.id || i} className="hover:bg-[#F4F6FA]/60 transition-colors">
                    {isAdmin && <td className="px-5 py-3 text-xs font-semibold text-gray-600">{c.asesorNombre || "—"}</td>}
                    <td className="px-5 py-3 font-semibold text-[#1C355E] truncate max-w-[160px]">
                      {c.datosVisita?.nombreEmpresa || c.cliente || "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{c.datosVisita?.tipoVisita || "—"}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{c.datosVisita?.municipio || "—"}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{c.fecha}</td>
                    <td className="px-5 py-3"><Badge status={c.estado} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-[#98989A] text-sm">
                      No hay datos con los filtros actuales
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {filtered.length > 50 && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60">
                <p className="text-xs text-gray-400 text-center">
                  Mostrando 50 de {filtered.length} registros. Descarga el Excel para ver todos.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#98989A] font-medium">Equielect · Reportes · v2.4.1</p>
        </div>
      </main>
    </LayoutDashboard>
  );
}
