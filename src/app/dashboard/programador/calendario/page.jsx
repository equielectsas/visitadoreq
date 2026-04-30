"use client";

/**
 * /dashboard/programador/calendario/page.jsx
 *
 * Calendario del ADMINISTRADOR.
 * Muestra TODAS las citas de TODOS los asesores (pendientes, activas, realizadas, reprogramadas).
 * Cada asesor tiene un color único para distinguirlos visualmente.
 * Al hacer clic en un día, se abre un modal con detalle de todas las visitas del día.
 */

import { useState, useEffect } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAYS_HEADER = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

// Paleta de colores para asesores — hasta 12 asesores distintos
const ASESOR_PALETTE = [
  { bg: "bg-blue-100",    text: "text-blue-800",    dot: "bg-blue-500",    border: "border-blue-200",  solid: "#3b82f6" },
  { bg: "bg-rose-100",    text: "text-rose-800",    dot: "bg-rose-500",    border: "border-rose-200",  solid: "#f43f5e" },
  { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200",solid: "#10b981"},
  { bg: "bg-amber-100",   text: "text-amber-800",   dot: "bg-amber-500",   border: "border-amber-200", solid: "#f59e0b" },
  { bg: "bg-violet-100",  text: "text-violet-800",  dot: "bg-violet-500",  border: "border-violet-200",solid: "#7c3aed" },
  { bg: "bg-cyan-100",    text: "text-cyan-800",    dot: "bg-cyan-500",    border: "border-cyan-200",  solid: "#06b6d4" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-800", dot: "bg-fuchsia-500", border: "border-fuchsia-200",solid:"#d946ef" },
  { bg: "bg-lime-100",    text: "text-lime-800",    dot: "bg-lime-500",    border: "border-lime-200",  solid: "#84cc16" },
  { bg: "bg-orange-100",  text: "text-orange-800",  dot: "bg-orange-500",  border: "border-orange-200",solid: "#f97316" },
  { bg: "bg-teal-100",    text: "text-teal-800",    dot: "bg-teal-500",    border: "border-teal-200",  solid: "#14b8a6" },
  { bg: "bg-indigo-100",  text: "text-indigo-800",  dot: "bg-indigo-500",  border: "border-indigo-200",solid: "#6366f1" },
  { bg: "bg-pink-100",    text: "text-pink-800",    dot: "bg-pink-500",    border: "border-pink-200",  solid: "#ec4899" },
];

const ESTADO_CONFIG = {
  pendiente:    { label: "Pendiente",    pill: "bg-yellow-100 text-yellow-700"   },
  activa:       { label: "Activa",       pill: "bg-emerald-100 text-emerald-700" },
  realizada:    { label: "Realizada",    pill: "bg-blue-100 text-blue-700"       },
  reprogramada: { label: "Reprogramada", pill: "bg-purple-100 text-purple-700"   },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function parseDate(fechaStr) {
  if (!fechaStr) return null;
  const parts = fechaStr.split("-");
  if (parts.length !== 3) return null;
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function buildAsesorColorMap(citas) {
  const nombres = [...new Set(citas.map(c => c.asesorNombre).filter(Boolean))].sort();
  const map = {};
  nombres.forEach((nombre, i) => {
    map[nombre] = ASESOR_PALETTE[i % ASESOR_PALETTE.length];
  });
  return map;
}

// Iniciales del nombre
function initials(nombre = "") {
  return nombre.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase() || "?";
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL — detalle del día
// ─────────────────────────────────────────────────────────────────────────────
function DayDetailModal({ show, onClose, day, month, year, visitas, colorMap }) {
  if (!show || !day) return null;

  const dateLabel = `${day} de ${MONTH_NAMES[month]} ${year}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-5 border-b border-gray-100 rounded-t-3xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visitas del día</p>
            <h3 className="text-lg font-black text-[#1C355E] mt-0.5">{dateLabel}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{visitas.length} visita{visitas.length !== 1 ? "s" : ""} programadas</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lista de visitas */}
        <div className="p-5 space-y-3">
          {visitas.map((v, i) => {
            const color  = colorMap[v.asesorNombre] || ASESOR_PALETTE[0];
            const estado = ESTADO_CONFIG[v.estado]  || ESTADO_CONFIG.pendiente;
            return (
              <div
                key={i}
                className={`rounded-2xl border ${color.border} ${color.bg} p-4`}
              >
                {/* Empresa */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base flex-shrink-0">🏢</span>
                    <p className={`font-black text-sm truncate ${color.text}`}>
                      {v.datosVisita?.nombreEmpresa || v.cliente || "—"}
                    </p>
                  </div>
                  {/* Estado pill */}
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${estado.pill}`}>
                    {estado.label}
                  </span>
                </div>

                {/* Asesor + hora */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Avatar asesor */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[9px] font-black ${color.dot}`}>
                      {initials(v.asesorNombre)}
                    </div>
                    <span className={`text-xs font-bold ${color.text} truncate max-w-[130px]`}>
                      {v.asesorNombre || "Asesor"}
                    </span>
                  </div>
                  {v.hora && (
                    <span className="text-xs text-gray-500 font-semibold flex-shrink-0">
                      🕐 {v.hora}
                    </span>
                  )}
                </div>

                {/* Motivo reprogramación */}
                {v.motivoReprogramacion && (
                  <p className="text-[10px] text-gray-500 mt-2 pl-8">
                    📌 {v.motivoReprogramacion}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminCalendarPage() {
  const today = new Date();

  const [month, setMonth]         = useState(today.getMonth());
  const [year, setYear]           = useState(today.getFullYear());
  const [citas, setCitas]         = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [filtroAsesor, setFiltroAsesor] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    const storedCitas = localStorage.getItem("equielect_citas");
    if (storedCitas) setCitas(JSON.parse(storedCitas));
  }, []);

  // Mapa de colores por asesor (estable)
  const colorMap = buildAsesorColorMap(citas);

  // Lista de asesores únicos
  const asesores = Object.keys(colorMap);

  // Citas filtradas por asesor y estado (si admin quiere filtrar la vista)
  const citasFiltradas = citas.filter(c => {
    if (filtroAsesor !== "todos" && c.asesorNombre !== filtroAsesor) return false;
    if (filtroEstado !== "todos" && c.estado !== filtroEstado) return false;
    return true;
  });

  // Agrupar por día del mes/año actual
  const visitasByDay = {};
  for (const cita of citasFiltradas) {
    const fecha = parseDate(cita.fecha);
    if (!fecha) continue;
    if (fecha.getMonth() !== month || fecha.getFullYear() !== year) continue;
    const day = fecha.getDate();
    if (!visitasByDay[day]) visitasByDay[day] = [];
    visitasByDay[day].push(cita);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay    = new Date(year, month, 1).getDay();
  const blanks      = Array.from({ length: startDay });
  const days        = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleDayClick = (d) => {
    if (visitasByDay[d]?.length > 0) {
      setSelectedDay(d);
      setShowModal(true);
    }
  };

  const totalMes      = Object.values(visitasByDay).reduce((s, a) => s + a.length, 0);
  const diasConVisita = Object.keys(visitasByDay).length;

  // Agenda del mes — ordenada por fecha y hora
  const agendaMes = citasFiltradas
    .filter(c => {
      const f = parseDate(c.fecha);
      return f && f.getMonth() === month && f.getFullYear() === year;
    })
    .sort((a, b) => {
      const da = parseDate(a.fecha), db = parseDate(b.fecha);
      if (!da || !db) return 0;
      if (da - db !== 0) return da - db;
      return (a.hora || "").localeCompare(b.hora || "");
    });

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fu  { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
        .fu1 { animation-delay:.05s; }
        .fu2 { animation-delay:.12s; }
        .fu3 { animation-delay:.18s; }
        .day-click { cursor: pointer; }
        .day-click:hover { background: #f0f4ff !important; }
      `}</style>

      <div className="space-y-6 pb-10">

        {/* ── HEADER ── */}
        <div className="fu flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Panel General</p>
            <h1 className="text-2xl font-black text-gray-800 mt-0.5">Calendario de Visitas</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {totalMes} visita{totalMes !== 1 ? "s" : ""} en {MONTH_NAMES[month]} · {diasConVisita} día{diasConVisita !== 1 ? "s" : ""} con actividad
            </p>
          </div>
        </div>

        {/* ── LEYENDA ASESORES ── */}
        {asesores.length > 0 && (
          <div className="fu fu1 bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_12px_-4px_rgba(28,53,94,0.08)]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Asesores</p>
            <div className="flex flex-wrap gap-2">
              {asesores.map(nombre => {
                const color = colorMap[nombre];
                const isSelected = filtroAsesor === nombre;
                return (
                  <button
                    key={nombre}
                    onClick={() => setFiltroAsesor(isSelected ? "todos" : nombre)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all
                      ${isSelected
                        ? `${color.bg} ${color.text} ${color.border} shadow-md scale-105`
                        : `bg-gray-50 text-gray-500 border-gray-200 hover:${color.bg} hover:${color.text}`}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${color.dot} flex-shrink-0`} />
                    {nombre}
                    {isSelected && (
                      <span className="ml-1 text-[9px] opacity-60">✕</span>
                    )}
                  </button>
                );
              })}
              {/* Filtro estado */}
              <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                {["todos","pendiente","activa","realizada","reprogramada"].map(e => (
                  <button
                    key={e}
                    onClick={() => setFiltroEstado(e)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all
                      ${filtroEstado === e
                        ? "bg-[#1C355E] text-white"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                  >
                    {e === "todos" ? "Todos" : e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CALENDARIO ── */}
        <div className="fu fu2 bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(28,53,94,0.10)] border border-gray-100 overflow-hidden">

          {/* Nav mes */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <button onClick={prevMonth}
              className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-[#1C355E] hover:text-white text-gray-600 flex items-center justify-center transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <p className="text-xl font-black text-[#1C355E]">{MONTH_NAMES[month]}</p>
              <p className="text-sm text-gray-400 font-semibold">{year}</p>
            </div>
            <button onClick={nextMonth}
              className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-[#1C355E] hover:text-white text-gray-600 flex items-center justify-center transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Header días */}
          <div className="grid grid-cols-7 border-b border-gray-50">
            {DAYS_HEADER.map((d, i) => (
              <div key={i} className={`py-3 text-center text-xs font-bold uppercase tracking-wide
                ${i === 0 || i === 6 ? "text-gray-300" : "text-gray-400"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid días */}
          <div className="grid grid-cols-7">

            {blanks.map((_, i) => (
              <div key={`b${i}`} className="h-32 border-b border-r border-gray-50/80 bg-gray-50/20" />
            ))}

            {days.map(d => {
              const dayVisits = visitasByDay[d] || [];
              const hasVisits = dayVisits.length > 0;
              const todayFlag = isToday(d);

              return (
                <div
                  key={d}
                  onClick={() => handleDayClick(d)}
                  className={`h-32 border-b border-r border-gray-50/80 p-1.5 flex flex-col transition-colors duration-150
                    ${hasVisits ? "day-click" : ""}
                    ${todayFlag ? "bg-[#FFCD00]/8" : "bg-white"}`}
                >
                  {/* Número */}
                  <div className="flex items-center justify-between mb-1 px-0.5">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black transition-all flex-shrink-0
                      ${todayFlag
                        ? "bg-[#1C355E] text-white shadow"
                        : hasVisits
                        ? "text-[#1C355E]"
                        : "text-gray-400"}`}>
                      {d}
                    </span>
                    {hasVisits && (
                      <span className="text-[8px] font-black text-white bg-[#1C355E] px-1 py-0.5 rounded-full leading-none">
                        {dayVisits.length}
                      </span>
                    )}
                  </div>

                  {/* Chips de visitas — cada uno con color de asesor */}
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {dayVisits.slice(0, 3).map((v, vi) => {
                      const color = colorMap[v.asesorNombre] || ASESOR_PALETTE[0];
                      return (
                        <div
                          key={vi}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${color.bg}`}
                          title={`${v.asesorNombre} — ${v.datosVisita?.nombreEmpresa || v.cliente}`}
                        >
                          {/* Avatar asesor */}
                          <span className={`w-3 h-3 rounded-full flex items-center justify-center ${color.dot} text-white flex-shrink-0`}
                            style={{ fontSize: "6px", fontWeight: 900 }}>
                            {initials(v.asesorNombre)[0]}
                          </span>
                          <span className={`text-[8px] font-bold truncate leading-tight ${color.text}`}>
                            {v.datosVisita?.nombreEmpresa || v.cliente || "—"}
                          </span>
                        </div>
                      );
                    })}
                    {dayVisits.length > 3 && (
                      <div className="px-1.5 py-0.5 rounded-md bg-gray-100">
                        <span className="text-[8px] font-bold text-gray-500">
                          +{dayVisits.length - 3} más
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AGENDA DEL MES — lista completa ── */}
        {agendaMes.length > 0 && (
          <div className="fu fu3 bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(28,53,94,0.08)] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Agenda general</p>
                <p className="text-base font-black text-[#1C355E] mt-0.5">{MONTH_NAMES[month]} {year}</p>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                {agendaMes.length} visitas
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {agendaMes.map((v, i) => {
                const color  = colorMap[v.asesorNombre] || ASESOR_PALETTE[0];
                const estado = ESTADO_CONFIG[v.estado]  || ESTADO_CONFIG.pendiente;
                const fecha  = parseDate(v.fecha);
                const dayNum = fecha?.getDate();

                return (
                  <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">

                    {/* Día */}
                    <div className="w-10 h-10 rounded-xl bg-[#1C355E]/6 flex flex-col items-center justify-center flex-shrink-0">
                      <p className="text-xs font-black text-[#1C355E] leading-none">{dayNum}</p>
                      <p className="text-[9px] text-gray-400 font-semibold leading-none mt-0.5">
                        {MONTH_NAMES[month].slice(0,3).toUpperCase()}
                      </p>
                    </div>

                    {/* Línea de color asesor */}
                    <div className={`w-1 h-10 rounded-full flex-shrink-0 ${color.dot}`} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">
                        {v.datosVisita?.nombreEmpresa || v.cliente || "—"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {/* Avatar + nombre asesor */}
                        <div className="flex items-center gap-1">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0 ${color.dot}`}
                            style={{ fontSize: "7px", fontWeight: 900 }}>
                            {initials(v.asesorNombre)}
                          </span>
                          <span className={`text-xs font-bold ${color.text}`}>{v.asesorNombre}</span>
                        </div>
                        {v.hora && <span className="text-xs text-gray-400">· 🕐 {v.hora}</span>}
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${estado.pill}`}>
                          {estado.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {totalMes === 0 && (
          <div className="fu fu3 text-center py-16 bg-white rounded-3xl border border-gray-100">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-400 font-bold">Sin visitas en {MONTH_NAMES[month]}</p>
            <p className="text-gray-300 text-sm mt-1">
              {filtroAsesor !== "todos" || filtroEstado !== "todos"
                ? "Prueba quitando los filtros"
                : "Las visitas de los asesores aparecerán aquí"}
            </p>
          </div>
        )}
      </div>

      {/* Modal detalle del día */}
      <DayDetailModal
        show={showModal}
        onClose={() => setShowModal(false)}
        day={selectedDay}
        month={month}
        year={year}
        visitas={selectedDay ? (visitasByDay[selectedDay] || []) : []}
        colorMap={colorMap}
      />
    </LayoutDashboard>
  );
}
