"use client";
/**
 * /dashboard/asesor/calendario/page.jsx
 *
 * Calendario del ASESOR.
 * Solo muestra las visitas del asesor autenticado.
 * En cada día con visita aparece la foto/cabecita del asesor + nombre de empresa.
 *
 * FOTO DEL ASESOR:
 * Se busca en este orden:
 *   1. user.photoUrl  (campo en el objeto user de localStorage)
 *   2. localStorage "equielect_asesores_fotos" → { [nombre]: url }
 *   3. Placeholder ui-avatars.com con sus iniciales
 *
 * Cuando tengas las fotos reales, guarda en el objeto user:
 *   const user = { id: "...", nombre: "Juan Pérez", photoUrl: "https://tu-bucket.com/juan.jpg" }
 *   localStorage.setItem("user", JSON.stringify(user))
 */
import { useState, useEffect } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_HEADER = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const ESTADO_DOT = {
  pendiente:    { dot: "bg-yellow-400",  label: "Pendiente",    text: "text-yellow-700",  bg: "bg-yellow-50",  hex: "facc15" },
  activa:       { dot: "bg-emerald-400", label: "Activa",       text: "text-emerald-700", bg: "bg-emerald-50", hex: "34d399" },
  realizada:    { dot: "bg-blue-400",    label: "Realizada",    text: "text-blue-700",    bg: "bg-blue-50",    hex: "60a5fa" },
  reprogramada: { dot: "bg-purple-400",  label: "Reprogramada", text: "text-purple-700",  bg: "bg-purple-50",  hex: "a78bfa" },
};

// Color principal del asesor en su propio calendario
const ASESOR_COLOR = {
  dot:    "bg-[#1C355E]",
  solid:  "#1C355E",
  hex:    "1C355E",
  bg:     "bg-blue-50",
  text:   "text-[#1C355E]",
  border: "border-blue-100",
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

function initials(nombre = "") {
  return nombre.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase() || "?";
}

function getAsesorPhoto(user, fotosMap = {}) {
  if (user?.photoUrl) return user.photoUrl;
  if (user?.nombre && fotosMap[user.nombre]) return fotosMap[user.nombre];
  const ini = encodeURIComponent(initials(user?.nombre || "?"));
  return `https://ui-avatars.com/api/?name=${ini}&background=1C355E&color=fff&size=64&bold=true&rounded=true`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Avatar del asesor (propio)
// ─────────────────────────────────────────────────────────────────────────────
function MyAvatar({ user, fotosMap, size = "sm" }) {
  const src = getAsesorPhoto(user, fotosMap);
  const [imgError, setImgError] = useState(false);

  const sizeClass =
    size === "xs" ? "w-4 h-4 text-[6px]" :
    size === "sm" ? "w-5 h-5 text-[7px]" :
    size === "md" ? "w-7 h-7 text-[9px]" :
    "w-10 h-10 text-xs";

  if (imgError || !src) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-[#1C355E] flex items-center justify-center text-white font-black flex-shrink-0`}
      >
        {initials(user?.nombre)[0] || "?"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={user?.nombre || "Asesor"}
      onError={() => setImgError(true)}
      className={`${sizeClass} rounded-full object-cover flex-shrink-0 ring-1 ring-white`}
      style={{ boxShadow: "0 0 0 1.5px #1C355E" }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL — detalle de visitas del día
// ─────────────────────────────────────────────────────────────────────────────
function DayDetailModal({ show, onClose, day, month, year, visitas, user, fotosMap }) {
  if (!show) return null;
  const dateLabel = `${day} de ${MONTH_NAMES[month]} ${year}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Foto del asesor en el header del modal */}
            <MyAvatar user={user} fotosMap={fotosMap} size="lg" />
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Visitas del día</p>
              <h3 className="text-base font-black text-[#1C355E] mt-0.5">{dateLabel}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {visitas.length} visita{visitas.length !== 1 ? "s" : ""} programadas
              </p>
            </div>
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

        {/* Lista */}
        <div className="p-5 space-y-3">
          {visitas.map((v, i) => {
            const cfg = ESTADO_DOT[v.estado] || ESTADO_DOT.pendiente;
            return (
              <div key={i} className={`rounded-2xl border border-gray-100 p-4 ${cfg.bg}`}>
                <div className="flex items-start gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-800 text-sm truncate">{v.cliente}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {v.hora && <span className="text-xs text-gray-500 font-medium">🕐 {v.hora}</span>}
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {v.motivoReprogramacion && (
                      <p className="text-xs text-gray-400 mt-1">📌 {v.motivoReprogramacion}</p>
                    )}
                  </div>
                </div>
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
export default function CalendarPage() {
  const today = new Date();

  const [month, setMonth]     = useState(today.getMonth());
  const [year, setYear]       = useState(today.getFullYear());
  const [user, setUser]       = useState(null);
  const [citas, setCitas]     = useState([]);
  const [fotosMap, setFotosMap] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal]     = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const storedCitas = localStorage.getItem("equielect_citas");
    if (storedCitas) setCitas(JSON.parse(storedCitas));

    // Fotos de asesores (opcional)
    const storedFotos = localStorage.getItem("equielect_asesores_fotos");
    if (storedFotos) setFotosMap(JSON.parse(storedFotos));
  }, []);

  // Solo visitas del asesor autenticado
  const myCitas = citas.filter(c =>
    c.asesorId === user?.id || c.asesorNombre === user?.nombre
  );

  const visitasByDay = {};
  for (const cita of myCitas) {
    const fecha = parseDate(cita.fecha);
    if (!fecha) continue;
    if (fecha.getMonth() !== month || fecha.getFullYear() !== year) continue;
    const day = fecha.getDate();
    if (!visitasByDay[day]) visitasByDay[day] = [];
    visitasByDay[day].push(cita);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay    = new Date(year, month, 1).getDay();
  const blanks = Array.from({ length: startDay }, (_, i) => i);
  const days   = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleDayClick = (day) => {
    if (visitasByDay[day]?.length > 0) {
      setSelectedDay(day);
      setShowModal(true);
    }
  };

  const totalMes      = Object.values(visitasByDay).reduce((acc, arr) => acc + arr.length, 0);
  const diasConVisita = Object.keys(visitasByDay).length;

  const agendaMes = myCitas
    .filter(c => {
      const f = parseDate(c.fecha);
      return f && f.getMonth() === month && f.getFullYear() === year;
    })
    .sort((a, b) => {
      const fa = parseDate(a.fecha), fb = parseDate(b.fecha);
      if (!fa || !fb) return 0;
      return fa - fb;
    });

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
        .fu-1 { animation-delay: .05s; }
        .fu-2 { animation-delay: .12s; }
        .day-has-visit { cursor: pointer; }
        .day-has-visit:hover { background: #f0f4ff; }
      `}</style>

      <div className="space-y-6 pb-10">

        {/* ── HEADER ── */}
        <div className="fu flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* ★ FOTO DEL ASESOR en el header ★ */}
            {user && (
              <MyAvatar user={user} fotosMap={fotosMap} size="lg" />
            )}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Mi Agenda</p>
              <h1 className="text-2xl font-black text-gray-800 mt-0.5">Calendario de Visitas</h1>
              {user?.nombre && (
                <p className="text-sm text-[#1C355E] font-bold mt-0.5">{user.nombre}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">Este mes</p>
              <p className="text-sm font-black text-[#1C355E]">
                {totalMes} visita{totalMes !== 1 ? "s" : ""} · {diasConVisita} día{diasConVisita !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* ── LEYENDA DE ESTADOS ── */}
        <div className="fu fu-1 flex items-center gap-3 flex-wrap">
          {Object.entries(ESTADO_DOT).map(([estado, cfg]) => (
            <div key={estado} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-xs font-semibold text-gray-500">{cfg.label}</span>
            </div>
          ))}
          <span className="text-xs text-gray-300">· Haz clic en un día para ver detalles</span>
        </div>

        {/* ── CALENDARIO ── */}
        <div className="fu fu-2 bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(28,53,94,0.10)] border border-gray-100 overflow-hidden">

          {/* Nav del mes */}
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

          {/* Encabezado días */}
          <div className="grid grid-cols-7 border-b border-gray-50">
            {DAYS_HEADER.map((d, i) => (
              <div key={i} className={`py-3 text-center text-xs font-bold uppercase tracking-wide
                ${i === 0 || i === 6 ? "text-gray-300" : "text-gray-400"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="h-28 border-b border-r border-gray-50/80 bg-gray-50/20" />
            ))}

            {days.map((d) => {
              const dayVisits = visitasByDay[d] || [];
              const hasVisits = dayVisits.length > 0;
              const todayFlag = isToday(d);

              return (
                <div
                  key={d}
                  onClick={() => hasVisits && handleDayClick(d)}
                  className={`h-28 border-b border-r border-gray-50/80 p-1.5 flex flex-col transition-all duration-150
                    ${hasVisits ? "day-has-visit" : ""}
                    ${todayFlag ? "bg-[#FFCD00]/8" : ""}`}
                >
                  {/* Número del día */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-black transition-all
                      ${todayFlag
                        ? "bg-[#1C355E] text-white shadow-md"
                        : hasVisits
                        ? "text-[#1C355E] font-black"
                        : "text-gray-500 hover:bg-gray-100"}`}>
                      {d}
                    </span>
                    {hasVisits && (
                      <span className="text-[9px] font-black text-[#1C355E]/50 bg-[#1C355E]/8 px-1.5 py-0.5 rounded-full">
                        {dayVisits.length}
                      </span>
                    )}
                  </div>

                  {/* ★ Chips con foto del asesor ★ */}
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {dayVisits.slice(0, 2).map((v, vi) => {
                      const cfg = ESTADO_DOT[v.estado] || ESTADO_DOT.pendiente;
                      return (
                        <div key={vi} className={`flex items-center gap-1 px-1 py-0.5 rounded-md ${cfg.bg}`}>
                          {/* FOTO del asesor (el mismo) */}
                          <MyAvatar user={user} fotosMap={fotosMap} size="xs" />
                          <span className={`text-[8px] font-bold truncate leading-tight ${cfg.text}`}>
                            {v.cliente}
                          </span>
                        </div>
                      );
                    })}
                    {dayVisits.length > 2 && (
                      <div className="px-1.5 py-0.5 rounded-md bg-gray-100">
                        <span className="text-[9px] font-bold text-gray-400">
                          +{dayVisits.length - 2} más
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
          <div className="fu fu-2 bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(28,53,94,0.08)] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Agenda del mes</p>
              <p className="text-base font-black text-[#1C355E] mt-0.5">{MONTH_NAMES[month]} {year}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {agendaMes.map((v, i) => {
                const cfg    = ESTADO_DOT[v.estado] || ESTADO_DOT.pendiente;
                const fecha  = parseDate(v.fecha);
                const dayNum = fecha?.getDate();
                return (
                  <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                    {/* Día */}
                    <div className="w-10 h-10 rounded-xl bg-[#1C355E]/6 flex flex-col items-center justify-center flex-shrink-0">
                      <p className="text-xs font-black text-[#1C355E] leading-none">{dayNum}</p>
                      <p className="text-[9px] text-gray-400 font-semibold leading-none mt-0.5">
                        {MONTH_NAMES[month].slice(0, 3).toUpperCase()}
                      </p>
                    </div>

                    {/* ★ Foto del asesor en la agenda ★ */}
                    <MyAvatar user={user} fotosMap={fotosMap} size="sm" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{v.cliente}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {v.hora && <span className="text-xs text-gray-400">🕐 {v.hora}</span>}
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Dot estado */}
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {totalMes === 0 && (
          <div className="fu fu-2 text-center py-12 bg-white rounded-3xl border border-gray-100">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-400 font-bold">Sin visitas en {MONTH_NAMES[month]}</p>
            <p className="text-gray-300 text-sm mt-1">Las visitas programadas aparecerán en el calendario</p>
          </div>
        )}
      </div>

      {/* Modal de detalle del día */}
      <DayDetailModal
        show={showModal}
        onClose={() => setShowModal(false)}
        day={selectedDay}
        month={month}
        year={year}
        visitas={selectedDay ? (visitasByDay[selectedDay] || []) : []}
        user={user}
        fotosMap={fotosMap}
      />
    </LayoutDashboard>
  );
}
