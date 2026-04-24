"use client";

/**
 * /dashboard/asesor/page.jsx
 * Dashboard PERSONAL del asesor.
 * Solo ve sus propias visitas. Gráficas de velas y dona.
 * No hay estado "perdida" — las citas se reprograman.
 */

import { useState, useEffect } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

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
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent, trend }) {
  return (
    <div className="relative bg-white rounded-2xl p-5 overflow-hidden border border-gray-100
      shadow-[0_2px_16px_-4px_rgba(28,53,94,0.10)] hover:shadow-[0_6px_28px_-4px_rgba(28,53,94,0.16)] transition-shadow duration-300">
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${accent}`} />
      <div className="flex items-start justify-between mt-1">
        <div>
          <p className="text-xs font-semibold text-[#98989A] uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-[#1C355E] leading-none">{value}</p>
          {sub && <p className="text-xs text-[#98989A] mt-1.5 font-medium">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#1C355E]/6 flex items-center justify-center text-[#1C355E] flex-shrink-0">
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

// ── Visit Detail Modal (read-only) ────────────────────────────────────────────
function VisitDetailModal({ visit, onClose }) {
  if (!visit) return null;
  const [tasks, setTasks] = useState(visit.datosVisita?.tareasPendientes || []);

  const toggleTask = (idx) => {
    const updated = tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t);
    setTasks(updated);
    // Persist checkbox state
    const allCitas = JSON.parse(localStorage.getItem("equielect_citas") || "[]");
    const updatedCitas = allCitas.map(c =>
      c.id === visit.id
        ? { ...c, datosVisita: { ...c.datosVisita, tareasPendientes: updated } }
        : c
    );
    localStorage.setItem("equielect_citas", JSON.stringify(updatedCitas));
  };

  const fields = [
    { label: "Cliente/Empresa",  value: visit.datosVisita?.nombreEmpresa || visit.cliente },
    { label: "NIT",              value: visit.datosVisita?.nit            || "—" },
    { label: "Asesor",           value: visit.asesorNombre                || "—" },
    { label: "Fecha",            value: visit.fecha },
    { label: "Hora",             value: visit.hora },
    { label: "Municipio",        value: visit.datosVisita?.municipio      || "—" },
    { label: "Tipo de visita",   value: visit.datosVisita?.tipoVisita     || "—" },
    { label: "Vehículo",         value: visit.datosVisita?.tipoVehiculo   || "—" },
    { label: "Encargado",        value: visit.datosVisita?.nombreEncargado || "—" },
    { label: "Cargo",            value: visit.datosVisita?.cargoEncargado  || "—" },
    { label: "Observaciones",    value: visit.datosVisita?.observaciones   || "—" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-gray-100 modal-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Detalle de visita</p>
            <p className="text-base font-black text-gray-700">{visit.datosVisita?.nombreEmpresa || visit.cliente}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge status={visit.estado} />
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-300">{label}</p>
              <div className="px-3 py-2.5 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-sm font-medium text-gray-400">
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Tareas pendientes — checkboxes */}
        {tasks.length > 0 && (
          <div className="px-6 pb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">Tareas pendientes</p>
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <label key={i} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                  ${t.done ? "bg-emerald-50 border-emerald-100 opacity-70" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}>
                  <input
                    type="checkbox"
                    checked={!!t.done}
                    onChange={() => toggleTask(i)}
                    className="mt-0.5 accent-[#1C355E] w-4 h-4 flex-shrink-0"
                  />
                  <span className={`text-sm font-medium ${t.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {t.texto}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 pb-5">
          <p className="text-[11px] text-gray-300 text-center">👁 Modo solo lectura — Visita finalizada</p>
        </div>
      </div>
    </div>
  );
}

// ── Candlestick-style chart (CSS only) ───────────────────────────────────────
function CandlestickChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.total), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-32 px-1">
      {data.map((d, i) => {
        const heightPct  = (d.total / maxVal) * 100;
        const donePct    = d.total > 0 ? (d.realizadas / d.total) * 100 : 0;
        const pendPct    = d.total > 0 ? (d.pendientes  / d.total) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <span className="text-[9px] font-black text-[#1C355E] opacity-0 group-hover:opacity-100 transition-opacity">{d.total}</span>
            {/* Candle body */}
            <div className="w-full relative flex flex-col justify-end rounded-sm overflow-hidden"
              style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: "4px" }}>
              {/* Wick top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#1C355E]/30" style={{ height: "30%" }} />
              {/* Body: realizadas (blue) on top, pendientes (yellow) on bottom */}
              <div className="w-full rounded-sm overflow-hidden" style={{ height: "70%" }}>
                <div className="bg-blue-400 w-full candle-in" style={{ height: `${donePct}%`, transition: "height 0.7s ease" }} />
                <div className="bg-[#FFCD00] w-full" style={{ height: `${pendPct}%`, transition: "height 0.7s ease 0.1s" }} />
                <div className="bg-emerald-400 w-full flex-1" style={{ height: `${Math.max(100 - donePct - pendPct, 0)}%` }} />
              </div>
              {/* Wick bottom */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#1C355E]/20" style={{ height: "15%" }} />
            </div>
            <span className="text-[9px] text-[#98989A] font-medium">{d.mes}</span>
          </div>
        );
      })}
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
  const [activeTab, setActiveTab] = useState("todas");
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    const storedCitas = localStorage.getItem("equielect_citas");
    if (storedCitas) setAllCitas(JSON.parse(storedCitas));
  }, []);

  // Reload when visiting the page after changes
  useEffect(() => {
    const refresh = () => {
      const storedCitas = localStorage.getItem("equielect_citas");
      if (storedCitas) setAllCitas(JSON.parse(storedCitas));
    };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  // SOLO las citas de este asesor
  const myCitas = allCitas.filter(
    (c) => c.asesorId === user?.id || c.asesorNombre === user?.nombre
  );

  const tabs = ["todas", "activa", "pendiente", "realizada", "reprogramada"];
  const filtered = activeTab === "todas" ? myCitas : myCitas.filter(c => c.estado === activeTab);

  // Stats
  const stats = {
    total:        myCitas.length,
    realizadas:   myCitas.filter(c => c.estado === "realizada").length,
    pendientes:   myCitas.filter(c => c.estado === "pendiente").length,
    activas:      myCitas.filter(c => c.estado === "activa").length,
    reprogramadas:myCitas.filter(c => c.estado === "reprogramada").length,
  };

  // Build monthly candlestick data (last 6 months)
  const monthlyData = (() => {
    const now   = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyy  = d.getFullYear();
      const mm    = d.getMonth();
      const label = d.toLocaleString("es-CO", { month: "short" });
      const monthCitas = myCitas.filter(c => {
        if (!c.fecha) return false;
        const cd = new Date(c.fecha);
        return cd.getFullYear() === yyyy && cd.getMonth() === mm;
      });
      result.push({
        mes:         label.charAt(0).toUpperCase() + label.slice(1),
        total:       monthCitas.length,
        realizadas:  monthCitas.filter(c => c.estado === "realizada").length,
        pendientes:  monthCitas.filter(c => c.estado === "pendiente").length,
        activas:     monthCitas.filter(c => c.estado === "activa").length,
      });
    }
    return result;
  })();

  // Donut segments
  const donutSegments = [
    { label: "Realizadas",    value: stats.realizadas,    color: "#3B82F6" },
    { label: "Activas",       value: stats.activas,       color: "#10B981" },
    { label: "Pendientes",    value: stats.pendientes,    color: "#FFCD00" },
    { label: "Reprogramadas", value: stats.reprogramadas, color: "#A78BFA" },
  ].filter(s => s.value > 0);

  const completionRate = stats.total > 0
    ? Math.round((stats.realizadas / stats.total) * 100)
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

      {selectedVisit && <VisitDetailModal visit={selectedVisit} onClose={() => setSelectedVisit(null)} />}

      <main className="flex-1 bg-[#F4F6FA] p-6 md:p-8 min-h-screen">

        {/* Title */}
        <div className="fade-up fade-up-1 mb-7 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest mb-0.5">Mi Panel</p>
            <h1 className="text-2xl font-black text-[#1C355E] leading-tight">
              Hola, {user?.nombre?.split(" ")[0] || "Asesor"} 👋
            </h1>
          </div>
          <div className="text-xs text-[#98989A] font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
            {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="fade-up fade-up-1">
            <StatCard icon={<CalIcon />}      label="Mis Citas"      value={stats.total}
              sub="en total"    accent="bg-[#1C355E]" />
          </div>
          <div className="fade-up fade-up-2">
            <StatCard icon={<CheckIcon />}    label="Realizadas"     value={stats.realizadas}
              sub={`${completionRate}% completadas`} accent="bg-blue-400" />
          </div>
          <div className="fade-up fade-up-3">
            <StatCard icon={<ClockIcon />}    label="Pendientes"     value={stats.pendientes}
              sub="por atender"  accent="bg-[#FFCD00]" />
          </div>
          <div className="fade-up fade-up-4">
            <StatCard icon={<ActivityIcon />} label="Activas ahora"  value={stats.activas}
              sub="en curso"     accent="bg-emerald-400" />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-7">

          {/* Candlestick chart */}
          <div className="fade-up fade-up-3 lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest">Mis visitas</p>
                <p className="text-lg font-black text-[#1C355E] mt-0.5">Últimos 6 meses</p>
              </div>
              <span className="text-[11px] font-semibold text-[#1C355E] bg-[#1C355E]/6 px-3 py-1 rounded-full">Velas</span>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4">
              {[{ color:"bg-blue-400", label:"Realizadas" }, { color:"bg-[#FFCD00]", label:"Pendientes" }, { color:"bg-emerald-400", label:"Activas" }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                  <span className="text-[10px] text-gray-400 font-medium">{l.label}</span>
                </div>
              ))}
            </div>
            <CandlestickChart data={monthlyData} />
          </div>

          {/* Donut chart */}
          <div className="fade-up fade-up-4 lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)]">
            <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest mb-1">Distribución</p>
            <p className="text-lg font-black text-[#1C355E] mb-4">Por estado</p>
            <div className="flex items-center justify-center mb-4">
              <DonutChart segments={donutSegments} size={130} />
            </div>
            <div className="space-y-2">
              {[
                { label: "Realizadas",    value: stats.realizadas,    color: "bg-blue-400"    },
                { label: "Activas",       value: stats.activas,       color: "bg-emerald-400" },
                { label: "Pendientes",    value: stats.pendientes,    color: "bg-[#FFCD00]"  },
                { label: "Reprogramadas", value: stats.reprogramadas, color: "bg-purple-400"  },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-xs font-medium text-gray-500">{item.label}</span>
                  </div>
                  <span className="text-xs font-black text-[#1C355E]">{item.value}</span>
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
        <div className="fade-up fade-up-5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest">Mis visitas</p>
              <p className="text-base font-black text-[#1C355E]">Historial personal</p>
            </div>
            <div className="flex items-center gap-1 bg-[#F4F6FA] rounded-xl p-1 flex-wrap">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200
                    ${activeTab === tab ? "bg-[#1C355E] text-white shadow-sm" : "text-[#98989A] hover:text-[#1C355E]"}`}>
                  {tab === "todas" ? "Todas" : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                  const isFinished = v.estado === "realizada";
                  return (
                    <tr key={v.id || i} className="hover:bg-[#F4F6FA]/60 transition-colors group">
                      <td className="px-6 py-3.5 font-semibold text-[#1C355E]">{v.datosVisita?.nombreEmpresa || v.cliente}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{v.fecha}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{v.hora}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{v.datosVisita?.municipio || "—"}</td>
                      <td className="px-6 py-3.5"><Badge status={v.estado} /></td>
                      <td className="px-6 py-3.5">
                        {isFinished && (
                          <button onClick={() => setSelectedVisit(v)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#1C355E] text-gray-400 hover:text-white
                              flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            title="Ver detalles">
                            <EyeIcon />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[#98989A] text-sm font-medium">
                      No hay visitas en este estado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-gray-100">
            <p className="text-xs text-[#98989A] font-medium">
              Mostrando <span className="font-bold text-[#1C355E]">{filtered.length}</span> de{" "}
              <span className="font-bold text-[#1C355E]">{myCitas.length}</span> registros
            </p>
          </div>
        </div>

        <div className="fade-up fade-up-6 mt-6 text-center">
          <p className="text-xs text-[#98989A] font-medium">Equielect · Panel Asesor · v2.4.1</p>
        </div>
      </main>
    </LayoutDashboard>
  );
}
