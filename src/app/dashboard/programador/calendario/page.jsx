"use client";

/**
 * /dashboard/programador/calendario/page.jsx
 *
 * Calendario del ADMINISTRADOR.
 * Muestra TODAS las citas de TODOS los asesores.
 * Cada asesor tiene un color único + foto de perfil (cabecita) en los chips del calendario.
 *
 * FOTOS DE ASESORES:
 * Se buscan en este orden:
 *   1. localStorage "equielect_asesores_fotos"  → objeto { [asesorId | asesorNombre]: url }
 *   2. campo `photoUrl` dentro del objeto cita   (si el backend lo provee)
 *   3. Placeholder generado con ui-avatars.com   (iniciales con color del asesor)
 *
 * Cuando tengas las fotos reales, guarda en localStorage:
 *   localStorage.setItem("equielect_asesores_fotos", JSON.stringify({
 *     "Juan Pérez": "https://tu-bucket.com/juan.jpg",
 *     "María López": "https://tu-bucket.com/maria.jpg",
 *   }))
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

const ASESOR_PALETTE = [
  { bg: "bg-blue-100",    text: "text-blue-800",    dot: "bg-blue-500",    border: "border-blue-200",  solid: "#3b82f6", hex: "3b82f6" },
  { bg: "bg-rose-100",    text: "text-rose-800",    dot: "bg-rose-500",    border: "border-rose-200",  solid: "#f43f5e", hex: "f43f5e" },
  { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200",solid:"#10b981",  hex: "10b981" },
  { bg: "bg-amber-100",   text: "text-amber-800",   dot: "bg-amber-500",   border: "border-amber-200", solid: "#f59e0b", hex: "f59e0b" },
  { bg: "bg-violet-100",  text: "text-violet-800",  dot: "bg-violet-500",  border: "border-violet-200",solid: "#7c3aed", hex: "7c3aed" },
  { bg: "bg-cyan-100",    text: "text-cyan-800",    dot: "bg-cyan-500",    border: "border-cyan-200",  solid: "#06b6d4", hex: "06b6d4" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-800", dot: "bg-fuchsia-500", border: "border-fuchsia-200",solid:"#d946ef", hex: "d946ef" },
  { bg: "bg-lime-100",    text: "text-lime-800",    dot: "bg-lime-500",    border: "border-lime-200",  solid: "#84cc16", hex: "84cc16" },
  { bg: "bg-orange-100",  text: "text-orange-800",  dot: "bg-orange-500",  border: "border-orange-200",solid: "#f97316", hex: "f97316" },
  { bg: "bg-teal-100",    text: "text-teal-800",    dot: "bg-teal-500",    border: "border-teal-200",  solid: "#14b8a6", hex: "14b8a6" },
  { bg: "bg-indigo-100",  text: "text-indigo-800",  dot: "bg-indigo-500",  border: "border-indigo-200",solid: "#6366f1", hex: "6366f1" },
  { bg: "bg-pink-100",    text: "text-pink-800",    dot: "bg-pink-500",    border: "border-pink-200",  solid: "#ec4899", hex: "ec4899" },
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

function initials(nombre = "") {
  return nombre.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase() || "?";
}

/**
 * Devuelve la URL de foto del asesor.
 * Orden: fotosMap → cita.photoUrl → placeholder ui-avatars
 */
function getAsesorPhoto(nombre, color, fotosMap = {}, citaPhotoUrl = null) {
  if (fotosMap[nombre]) return fotosMap[nombre];
  if (citaPhotoUrl)     return citaPhotoUrl;
  // Placeholder con iniciales y color del asesor
  const ini = encodeURIComponent(initials(nombre));
  const bg  = color?.hex || "1C355E";
  return `https://ui-avatars.com/api/?name=${ini}&background=${bg}&color=fff&size=64&bold=true&rounded=true`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Avatar foto del asesor (círculo pequeño con imagen)
// ─────────────────────────────────────────────────────────────────────────────
function AsesorAvatar({ nombre, color, fotosMap, photoUrl, size = "sm" }) {
  const src = getAsesorPhoto(nombre, color, fotosMap, photoUrl);
  const [imgError, setImgError] = useState(false);

  const sizeClass = size === "xs"
    ? "w-4 h-4 text-[6px]"
    : size === "sm"
    ? "w-5 h-5 text-[7px]"
    : "w-7 h-7 text-[9px]";

  if (imgError) {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center text-white font-black flex-shrink-0 ${color?.dot || "bg-gray-400"}`}
      >
        {initials(nombre)[0]}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={nombre}
      onError={() => setImgError(true)}
      className={`${sizeClass} rounded-full object-cover flex-shrink-0 ring-1 ring-white`}
      style={{ boxShadow: `0 0 0 1.5px ${color?.solid || "#ccc"}` }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL — detalle del día
// ─────────────────────────────────────────────────────────────────────────────
function DayDetailModal({ show, onClose, day, month, year, visitas, colorMap, fotosMap }) {
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
            <p className="text-xs text-gray-400 mt-0.5">
              {visitas.length} visita{visitas.length !== 1 ? "s" : ""} programadas
            </p>
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
              <div key={i} className={`rounded-2xl border ${color.border} ${color.bg} p-4`}>

                {/* Empresa + estado */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">🏢</span>
                    <p className={`font-black text-sm truncate ${color.text}`}>
                      {v.datosVisita?.nombreEmpresa || v.cliente || "—"}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${estado.pill}`}>
                    {estado.label}
                  </span>
                </div>

                {/* Asesor con foto grande */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Foto del asesor — tamaño md en el modal */}
                    <AsesorAvatar
                      nombre={v.asesorNombre}
                      color={color}
                      fotosMap={fotosMap}
                      photoUrl={v.photoUrl}
                      size="md"
                    />
                    <div>
                      <p className={`text-xs font-black ${color.text}`}>{v.asesorNombre || "Asesor"}</p>
                      <p className="text-[9px] text-gray-400 font-medium">Asesor</p>
                    </div>
                  </div>
                  {v.hora && (
                    <span className="text-xs text-gray-500 font-semibold flex-shrink-0">
                      🕐 {v.hora}
                    </span>
                  )}
                </div>

                {v.motivoReprogramacion && (
                  <p className="text-[10px] text-gray-500 mt-2 pl-9">
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

  const [month, setMonth]             = useState(today.getMonth());
  const [year, setYear]               = useState(today.getFullYear());
  const [citas, setCitas]             = useState([]);
  const [fotosMap, setFotosMap]       = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [filtroAsesor, setFiltroAsesor] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    // Citas
    const storedCitas = localStorage.getItem("equielect_citas");
    if (storedCitas) setCitas(JSON.parse(storedCitas));

    // Fotos de asesores (opcional — cuando las tengas)
    // Formato: { "Nombre Asesor": "https://url-de-la-foto.jpg" }
    const storedFotos = localStorage.getItem("equielect_asesores_fotos");
    if (storedFotos) setFotosMap(JSON.parse(storedFotos));
  }, []);

  const colorMap = buildAsesorColorMap(citas);
  const asesores = Object.keys(colorMap);

  const citasFiltradas = citas.filter(c => {
    if (filtroAsesor !== "todos" && c.asesorNombre !== filtroAsesor) return false;
    if (filtroEstado !== "todos" && c.estado !== filtroEstado) return false;
    return true;
  });

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
                const color      = colorMap[nombre];
                const isSelected = filtroAsesor === nombre;
                // Buscar photoUrl de cualquier cita de este asesor
                const citaEjemplo = citas.find(c => c.asesorNombre === nombre);
                return (
                  <button
                    key={nombre}
                    onClick={() => setFiltroAsesor(isSelected ? "todos" : nombre)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all
                      ${isSelected
                        ? `${color.bg} ${color.text} ${color.border} shadow-md scale-105`
                        : `bg-gray-50 text-gray-500 border-gray-200 hover:${color.bg} hover:${color.text}`}`}
                  >
                    {/* Foto del asesor en la leyenda */}
                    <AsesorAvatar
                      nombre={nombre}
                      color={color}
                      fotosMap={fotosMap}
                      photoUrl={citaEjemplo?.photoUrl}
                      size="xs"
                    />
                    {nombre}
                    {isSelected && <span className="ml-1 text-[9px] opacity-60">✕</span>}
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
                  {/* Número del día */}
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

                  {/* Chips con FOTO del asesor */}
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {dayVisits.slice(0, 3).map((v, vi) => {
                      const color = colorMap[v.asesorNombre] || ASESOR_PALETTE[0];
                      return (
                        <div
                          key={vi}
                          className={`flex items-center gap-1 px-1 py-0.5 rounded-md ${color.bg}`}
                          title={`${v.asesorNombre} — ${v.datosVisita?.nombreEmpresa || v.cliente}`}
                        >
                          {/* ★ FOTO DEL ASESOR ★ */}
                          <AsesorAvatar
                            nombre={v.asesorNombre}
                            color={color}
                            fotosMap={fotosMap}
                            photoUrl={v.photoUrl}
                            size="xs"
                          />
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

        {/* ── AGENDA DEL MES ── */}
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
                        {/* ★ FOTO DEL ASESOR en agenda ★ */}
                        <div className="flex items-center gap-1.5">
                          <AsesorAvatar
                            nombre={v.asesorNombre}
                            color={color}
                            fotosMap={fotosMap}
                            photoUrl={v.photoUrl}
                            size="sm"
                          />
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
        fotosMap={fotosMap}
      />
    </LayoutDashboard>
  );
}
