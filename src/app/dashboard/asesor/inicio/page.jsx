"use client";

/**
 * /dashboard/asesor/page.jsx
 * Dashboard PERSONAL del asesor.
 * Solo ve sus propias visitas. Gráficas de velas y dona.
 * No hay estado "perdida" — las citas se reprograman.
 */

import { useMemo, useState, useEffect } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";
import VisualizarVisitaModal from "@/components/VisualizarVisitaModal";
import { getVisitaYmdCalendario, fechaHoraVisualDesdeVisita, normalizarVisitaAsesorNombre } from "@/utils/visitasHelpers";

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

function getToken() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}

async function fetchVisitas() {
  const token = getToken();
  const params = new URLSearchParams({ page: "1", limit: "500" });
  const res = await fetch(`/api/visitas?${params.toString()}`, {
    headers: { Authorization: token },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return Array.isArray(data?.visitas) ? data.visitas : Array.isArray(data?.data) ? data.data : [];
}

async function downloadExcel(rows, filename) {
  if (!window.XLSX) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  const XLSX = window.XLSX;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resumen");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function flattenCita(c) {
  const vis = fechaHoraVisualDesdeVisita(c);
  return {
    ID: c._id || c.id || "",
    Empresa: c.datosVisita?.nombreEmpresa || c.cliente || "—",
    NIT: c.datosVisita?.nit || "—",
    Encargado: c.datosVisita?.nombreEncargado || "—",
    Municipio: c.datosVisita?.municipio || "—",
    "Tipo visita": c.datosVisita?.tipoVisita || "—",
    Transporte: c.datosVisita?.tipoVehiculo || "—",
    Fecha: vis.fecha || c.fecha || "—",
    Hora: vis.hora || c.hora || "—",
    Estado: c.estado || "—",
    Observaciones: c.datosVisita?.observaciones || "—",
  };
}

function ymdToYearMonth(ymd) {
  if (!ymd || typeof ymd !== "string" || ymd.length < 7) return "";
  return ymd.slice(0, 7); // yyyy-mm
}

function ymLabel(ym) {
  const [y, m] = String(ym).split("-").map((x) => Number(x));
  if (!y || !m) return String(ym || "");
  const d = new Date(y, m - 1, 1);
  const label = d.toLocaleString("es-CO", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function ymShortLabel(ym) {
  const [y, m] = String(ym).split("-").map((x) => Number(x));
  if (!y || !m) return String(ym || "");
  const d = new Date(y, m - 1, 1);
  const s = d.toLocaleString("es-CO", { month: "short", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const CalIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent, trend }) {
  return (
    <div className="relative bg-white rounded-2xl p-5 overflow-hidden border border-gray-100 dark:border-slate-600
      shadow-[0_2px_16px_-4px_rgba(28,53,94,0.10)] hover:shadow-[0_6px_28px_-4px_rgba(28,53,94,0.16)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] transition-shadow duration-300">
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${accent}`} />
      <div className="flex items-start justify-between mt-1">
        <div>
          <p className="text-xs font-semibold text-[#98989A] dark:text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-[#1C355E] dark:text-white leading-none">{value}</p>
          {sub && <p className="text-xs text-[#98989A] dark:text-slate-400 mt-1.5 font-medium">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#1C355E]/6 dark:bg-[#FFCD00]/15 flex items-center justify-center text-[#1C355E] dark:text-[#FFCD00] flex-shrink-0">
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          <span>{trend >= 0 ? "↑" : "↓"}</span>
          <span>{Math.abs(trend)}% vs mes anterior</span>
        </div>
      )}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    activa:     "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    pendiente:  "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    realizada:  "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    reprogramada: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ── Visit Detail Modal: mismo componente que en Crear visita (/dashboard/asesor)

// ── Barras apiladas por mes (100% del alto = mes con más visitas) ────────────
function MonthlyStackedBars({ rows, highlightYm }) {
  const maxTotal = Math.max(1, ...rows.map((r) => r.total));
  const trackH = 280;
  return (
    <div className="overflow-x-auto pb-2 -mx-1">
      <div className="flex items-end gap-5 px-2 pt-2" style={{ minWidth: Math.max(rows.length * 72, 320) }}>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400 py-20 w-full text-center">No hay visitas con fecha para mostrar el histórico.</p>
        ) : (
          rows.map((row) => {
            const barH = Math.max(32, (row.total / maxTotal) * trackH);
            const segs = [
              { key: "realizadas", n: row.realizadas, color: "#60a5fa" },
              { key: "pendientes", n: row.pendientes, color: "#facc15" },
              { key: "activas", n: row.activas, color: "#34d399" },
              { key: "reprogramadas", n: row.reprogramadas, color: "#c4b5fd" },
            ].filter((s) => s.n > 0);
            const hi = highlightYm && row.ym === highlightYm;
            return (
              <div key={row.ym} className="flex flex-col items-center gap-2 flex-1 min-w-[64px] max-w-[96px]">
                <span className="text-xs font-black text-[#1C355E] tabular-nums leading-none">{row.total}</span>
                <div
                  className={`w-full flex flex-col justify-end rounded-2xl bg-gray-100/90 border border-gray-100 ${
                    hi ? "ring-2 ring-[#1C355E] ring-offset-2 shadow-md" : ""
                  }`}
                  style={{ height: trackH }}
                >
                  <div className="flex flex-col w-full overflow-hidden rounded-2xl" style={{ height: barH }}>
                    {segs.map((s) => (
                      <div
                        key={s.key}
                        className="w-full min-h-[4px] transition-[flex] duration-500 ease-out"
                        style={{ backgroundColor: s.color, flex: s.n }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-[#98989A] font-bold text-center leading-tight px-0.5">
                  {ymShortLabel(row.ym)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Donut chart (SVG) ─────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={size/2 - 8} fill="none" stroke="#f3f4f6" strokeWidth={16} />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="text-xs fill-gray-300 font-bold">0</text>
      </svg>
    );
  }

  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let accumulated = 0;
  const slices = segments.map(seg => {
    const frac   = seg.value / total;
    const offset = circumference * (1 - accumulated);
    const dash   = circumference * frac;
    accumulated += frac;
    return { ...seg, offset, dash };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={14} />
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={14}
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={-s.offset + circumference}
          strokeLinecap="butt"
          style={{ transition: `stroke-dasharray 0.7s ease ${i * 0.15}s` }}
        />
      ))}
      {/* Center text — rotate back */}
      <text x={cx} y={cy} textAnchor="middle" dy="0.35em"
        className="fill-[#1C355E] font-black text-lg"
        style={{ fontSize: "18px", fontWeight: 900, transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}>
        {total}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AsesorDashboard() {
  const [user, setUser]         = useState(null);
  const [allCitas, setAllCitas] = useState([]);
  /** Todas | Pendientes (pendiente+activa+reprogramada) | Realizadas — mismo criterio que Crear visita */
  const [activeTab, setActiveTab] = useState("todas");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const v = await fetchVisitas();
        if (!mounted) return;
        setAllCitas(v.map(normalizarVisitaAsesorNombre));
        const months = [...new Set(v.map((c) => ymdToYearMonth(getVisitaYmdCalendario(c))).filter(Boolean))].sort().reverse();
        setSelectedMonth((prev) => prev || months[0] || "");
      } catch (e) {
        if (mounted) setError(e?.message || "No se pudieron cargar las visitas.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const onUpd = () => load();
    window.addEventListener("visitas-updated", onUpd);
    return () => {
      mounted = false;
      window.removeEventListener("visitas-updated", onUpd);
    };
  }, []);

  const myCitas = allCitas;

  const historialTabs = [
    { key: "todas", label: "Todas" },
    { key: "pendiente", label: "Pendientes" },
    { key: "realizada", label: "Realizadas" },
  ];

  const months = useMemo(() => {
    return [...new Set(myCitas.map((c) => ymdToYearMonth(getVisitaYmdCalendario(c))).filter(Boolean))].sort().reverse();
  }, [myCitas]);

  const monthlyBarsData = useMemo(() => {
    const map = new Map();
    for (const c of myCitas) {
      const ym = ymdToYearMonth(getVisitaYmdCalendario(c));
      if (!ym) continue;
      if (!map.has(ym)) {
        map.set(ym, { ym, total: 0, realizadas: 0, pendientes: 0, activas: 0, reprogramadas: 0 });
      }
      const r = map.get(ym);
      r.total += 1;
      if (c.estado === "realizada") r.realizadas += 1;
      else if (c.estado === "pendiente") r.pendientes += 1;
      else if (c.estado === "activa") r.activas += 1;
      else if (c.estado === "reprogramada") r.reprogramadas += 1;
    }
    return [...map.values()].sort((a, b) => a.ym.localeCompare(b.ym));
  }, [myCitas]);

  const monthCitas = useMemo(() => {
    if (!selectedMonth) return [];
    return myCitas.filter((c) => ymdToYearMonth(getVisitaYmdCalendario(c)) === selectedMonth);
  }, [myCitas, selectedMonth]);

  /** Solo mes seleccionado + pestaña (como Crear visita: Pendientes agrupa pendiente/activa/reprogramada) */
  const filtered = useMemo(() => {
    if (activeTab === "todas") return monthCitas;
    if (activeTab === "pendiente") {
      return monthCitas.filter((c) => ["pendiente", "activa", "reprogramada"].includes(c.estado));
    }
    return monthCitas.filter((c) => c.estado === "realizada");
  }, [monthCitas, activeTab]);

  const prevMonth = useMemo(() => {
    if (!selectedMonth) return "";
    const [y, m] = selectedMonth.split("-").map((x) => Number(x));
    if (!y || !m) return "";
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [selectedMonth]);

  const prevMonthCitas = useMemo(() => {
    if (!prevMonth) return [];
    return myCitas.filter((c) => ymdToYearMonth(getVisitaYmdCalendario(c)) === prevMonth);
  }, [myCitas, prevMonth]);

  const monthStats = useMemo(() => {
    const base = monthCitas;
    return {
      total: base.length,
      realizadas: base.filter((c) => c.estado === "realizada").length,
      pendientes: base.filter((c) => c.estado === "pendiente").length,
      activas: base.filter((c) => c.estado === "activa").length,
      reprogramadas: base.filter((c) => c.estado === "reprogramada").length,
    };
  }, [monthCitas]);

  const monthlyGoal = 10;
  const cumplimientoPct = monthlyGoal > 0 ? (monthStats.realizadas / monthlyGoal) * 100 : 0;
  const cumplimientoPctLabel = Number.isFinite(cumplimientoPct) ? Math.round(cumplimientoPct) : 0;

  const prevMonthTotal = prevMonthCitas.length;
  const trendVsPrev = prevMonthTotal > 0 ? Math.round(((monthStats.total - prevMonthTotal) / prevMonthTotal) * 100) : undefined;

  // Donut segments
  const donutSegments = [
    { label: "Realizadas",    value: monthStats.realizadas,    color: "#3B82F6" },
    { label: "Activas",       value: monthStats.activas,       color: "#10B981" },
    { label: "Pendientes",    value: monthStats.pendientes,    color: "#FFCD00" },
    { label: "Reprogramadas", value: monthStats.reprogramadas, color: "#A78BFA" },
  ].filter(s => s.value > 0);

  const donutTotal = donutSegments.reduce((s, d) => s + d.value, 0);
  const donutLegend = donutSegments.map((s) => {
    const pct = donutTotal > 0 ? Math.round((s.value / donutTotal) * 100) : 0;
    return { ...s, pct };
  });

  const completionRate = monthStats.total > 0
    ? Math.round((monthStats.realizadas / monthStats.total) * 100)
    : 0;

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay:.05s; } .fade-up-2 { animation-delay:.10s; }
        .fade-up-3 { animation-delay:.15s; } .fade-up-4 { animation-delay:.20s; }
        .fade-up-5 { animation-delay:.25s; } .fade-up-6 { animation-delay:.30s; }
        @keyframes modalIn { from { opacity:0; transform:scale(.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .modal-in { animation: modalIn .25s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <VisualizarVisitaModal
        show={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
        cita={selectedVisit}
        asesorFallbackNombre={user?.nombre}
      />

      <main className="flex-1 bg-[#F4F6FA] dark:bg-transparent p-4 sm:p-6 md:p-8 min-h-screen">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-5 py-4 text-sm text-red-700 dark:text-red-200 font-semibold">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="fade-up fade-up-1 mb-7 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold text-[#98989A] dark:text-slate-400 uppercase tracking-widest mb-0.5">Mi Panel</p>
            <h1 className="text-2xl font-black text-[#1C355E] dark:text-white leading-tight">
              Hola, {user?.nombre?.split(" ")[0] || "Asesor"} 👋
            </h1>
          </div>
          <div className="text-xs text-[#98989A] dark:text-slate-300 font-medium bg-white dark:bg-eqDark-surface border border-gray-200 dark:border-slate-600 px-3 py-1.5 rounded-lg shadow-sm">
            {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        <div className="fade-up fade-up-1 mb-7 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#98989A] dark:text-slate-400 uppercase tracking-widest">Mes</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm font-bold text-[#1C355E] dark:text-white bg-white dark:bg-[#0f1c2e] border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 outline-none"
              disabled={loading}
            >
              {months.length === 0 ? <option value={selectedMonth}>{ymLabel(selectedMonth)}</option> : null}
              {months.map((m) => (
                <option key={m} value={m}>
                  {ymLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs text-[#98989A] dark:text-slate-300 font-medium bg-white dark:bg-eqDark-surface border border-gray-200 dark:border-slate-600 px-3 py-2 rounded-xl shadow-sm">
              Objetivo: <span className="font-black text-[#1C355E] dark:text-[#FFCD00]">{monthlyGoal}</span> visitas finalizadas · Cumplimiento{" "}
              <span className="font-black text-[#1C355E] dark:text-[#FFCD00]">{cumplimientoPctLabel}%</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                const safe = (user?.nombre || "asesor").replace(/\s+/g, "_");
                const ym = selectedMonth || "sin_mes";
                const rows = monthCitas.map(flattenCita);
                await downloadExcel(rows, `Resumen_${safe}_${ym}_${new Date().toISOString().split("T")[0]}`);
              }}
              disabled={loading || monthCitas.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C355E] text-white text-xs font-bold
                hover:bg-[#16294d] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98] transition-all shadow-md"
              title="Descargar el resumen del mes seleccionado"
            >
              <DownloadIcon />
              Descargar resumen ({monthCitas.length})
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="fade-up fade-up-1">
            <StatCard
              icon={<CheckIcon />}
              label="Cumplimiento (finalizadas)"
              value={`${cumplimientoPctLabel}%`}
              sub={`${monthStats.realizadas} / ${monthlyGoal} realizadas`}
              accent="bg-emerald-400"
              trend={trendVsPrev}
            />
          </div>
          <div className="fade-up fade-up-2">
            <StatCard icon={<CalIcon />}      label="Citas (mes)"      value={monthStats.total}
              sub="todas"    accent="bg-[#1C355E]" />
          </div>
          <div className="fade-up fade-up-3">
            <StatCard icon={<ClockIcon />}    label="Pendientes (mes)"     value={monthStats.pendientes}
              sub="por atender"  accent="bg-[#FFCD00]" />
          </div>
          <div className="fade-up fade-up-4">
            <StatCard icon={<ActivityIcon />} label="Activas (mes)"  value={monthStats.activas}
              sub="en curso"     accent="bg-emerald-400" />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-7">

          {/* Barras por mes */}
          <div className="fade-up fade-up-3 lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 dark:border-slate-600 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-[#98989A] dark:text-slate-400 uppercase tracking-widest">Mis visitas</p>
                <p className="text-lg font-black text-[#1C355E] dark:text-white mt-0.5">Histórico por mes</p>
                <p className="text-[11px] text-[#98989A] dark:text-slate-400 mt-1">
                  Cada barra es un mes con datos; el anillo indica el mes seleccionado arriba ({ymLabel(selectedMonth) || "—"}).
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#1C355E] dark:text-[#FFCD00] bg-[#1C355E]/6 dark:bg-[#FFCD00]/15 px-3 py-1 rounded-full shrink-0">
                {loading ? "Cargando…" : `${monthlyBarsData.length} mes(es)`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5">
              {[
                { color: "bg-blue-400", label: "Realizadas" },
                { color: "bg-[#FFCD00]", label: "Pendientes" },
                { color: "bg-emerald-400", label: "Activas" },
                { color: "bg-purple-300", label: "Reprogramadas" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                  <span className="text-[10px] text-gray-400 dark:text-slate-400 font-medium">{l.label}</span>
                </div>
              ))}
            </div>
            <MonthlyStackedBars rows={monthlyBarsData} highlightYm={selectedMonth} />
          </div>

          {/* Donut chart */}
          <div className="fade-up fade-up-4 lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 dark:border-slate-600 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-bold text-[#98989A] dark:text-slate-400 uppercase tracking-widest mb-1">Distribución</p>
            <p className="text-lg font-black text-[#1C355E] dark:text-white mb-4">Por estado</p>
            <div className="flex items-center justify-center mb-4">
              <DonutChart segments={donutSegments} size={130} />
            </div>
            <div className="space-y-2">
              {donutLegend.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium text-gray-500 dark:text-slate-300">{item.label}</span>
                  </div>
                  <span className="text-xs font-black text-[#1C355E] dark:text-[#FFCD00]">
                    {item.pct}% <span className="text-[#98989A] dark:text-slate-400 font-semibold">({item.value})</span>
                  </span>
                </div>
              ))}
            </div>
            {/* Rate */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <p className="text-2xl font-black text-[#1C355E]">{completionRate}%</p>
              <p className="text-[10px] text-[#98989A] font-medium uppercase tracking-wide">Tasa de realización</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="fade-up fade-up-5 bg-white rounded-2xl border border-gray-100 dark:border-slate-600 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#98989A] dark:text-slate-400 uppercase tracking-widest">Mis visitas</p>
              <p className="text-base font-black text-[#1C355E] dark:text-white">Historial personal</p>
              <p className="text-[11px] text-[#98989A] dark:text-slate-400 mt-0.5 font-medium">
                Mes: <span className="font-bold text-[#1C355E] dark:text-[#FFCD00]">{ymLabel(selectedMonth) || "—"}</span>
                {" "}· Cambia el mes en el selector superior
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[#F4F6FA] dark:bg-[#0f1c2e] rounded-xl p-1 flex-wrap">
              {historialTabs.map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setActiveTab(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                    ${activeTab === key ? "bg-[#1C355E] text-white shadow-sm" : "text-[#98989A] dark:text-slate-400 hover:text-[#1C355E] dark:hover:text-[#FFCD00]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4F6FA]">
                  {["Cliente", "Fecha", "Hora", "Municipio", "Estado", ""].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? filtered.map((v, i) => {
                  const vis = fechaHoraVisualDesdeVisita(v);
                  return (
                    <tr key={v._id || v.id || i} className="hover:bg-[#F4F6FA]/60 transition-colors group">
                      <td className="px-6 py-3.5 font-semibold text-[#1C355E]">{v.datosVisita?.nombreEmpresa || v.cliente}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{vis.fecha || "—"}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{vis.hora || "—"}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{v.datosVisita?.municipio || "—"}</td>
                      <td className="px-6 py-3.5"><Badge status={v.estado} /></td>
                      <td className="px-6 py-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVisit(v)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 hover:border-[#1C355E]/30 dark:hover:border-[#FFCD00]/30 hover:text-[#1C355E] dark:hover:text-[#FFCD00] transition-all"
                          title="Ver visita"
                        >
                          <EyeIcon /> Ver
                        </button>
                      </td>
                    </tr>
                  );
                  }) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[#98989A] dark:text-slate-400 text-sm font-medium">
                      {monthCitas.length === 0
                        ? "No hay visitas en este mes. Elige otro mes arriba."
                        : "No hay visitas en este filtro para el mes seleccionado"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-600">
            <p className="text-xs text-[#98989A] dark:text-slate-400 font-medium">
              Mostrando <span className="font-bold text-[#1C355E] dark:text-[#FFCD00]">{filtered.length}</span> de{" "}
              <span className="font-bold text-[#1C355E] dark:text-[#FFCD00]">{monthCitas.length}</span> en{" "}
              <span className="font-semibold text-[#1C355E] dark:text-slate-200">{ymLabel(selectedMonth) || "—"}</span>
            </p>
          </div>
        </div>

        <div className="fade-up fade-up-6 mt-6 text-center">
          <p className="text-xs text-[#98989A] dark:text-slate-500 font-medium">Equielect · Panel Asesor · v2.4.1</p>
        </div>
      </main>
    </LayoutDashboard>
  );
}
