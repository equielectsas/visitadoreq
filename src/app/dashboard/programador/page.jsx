"use client";

/**
 * /dashboard/programador/page.jsx  (también aplica para /dashboard/admin/page.jsx)
 * Dashboard GLOBAL para adminPlataforma y adminComercial.
 * Ve todas las citas de todos los asesores.
 * Citas finalizadas tienen ojo para ver detalles.
 * ✅ Totalmente responsive: mobile, tablet, desktop
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
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
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
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="relative bg-white rounded-2xl p-4 sm:p-5 overflow-hidden border border-gray-100
      shadow-[0_2px_16px_-4px_rgba(28,53,94,0.10)] hover:shadow-[0_6px_28px_-4px_rgba(28,53,94,0.16)] transition-shadow duration-300">
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${accent}`} />
      <div className="flex items-start justify-between mt-1">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[10px] sm:text-xs font-semibold text-[#98989A] uppercase tracking-widest mb-1 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-[#1C355E] leading-none">{value}</p>
          {sub && <p className="text-[10px] sm:text-xs text-[#98989A] mt-1.5 font-medium">{sub}</p>}
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1C355E]/6 flex items-center justify-center text-[#1C355E] flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    activa:    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    pendiente: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    realizada: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ── Visit Detail Modal ────────────────────────────────────────────────────────
function VisitDetailModal({ visit, onClose }) {
  if (!visit) return null;

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const fields = [
    { label: "Cliente",     value: visit.cliente },
    { label: "Asesor",      value: visit.asesorNombre || "—" },
    { label: "Fecha",       value: visit.fecha },
    { label: "Hora",        value: visit.hora },
    { label: "Dirección",   value: visit.direccion   || "—" },
    { label: "Teléfono",    value: visit.telefono    || "—" },
    { label: "Contacto",    value: visit.contacto    || "—" },
    { label: "Observación", value: visit.observacion || "—" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* En mobile: sheet desde abajo. En sm+: modal centrado */}
      <div className="relative z-10 bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-100 modal-in
        max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/60 rounded-t-2xl flex-shrink-0">
          {/* Drag handle en mobile */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full sm:hidden" />
          <div className="mt-2 sm:mt-0 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Detalle de visita</p>
            <p className="text-base font-black text-gray-700 truncate">{visit.cliente}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge status={visit.estado} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1">
          <div className="p-5 sm:p-6 grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            {fields.map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-300">{label}</p>
                <div className="px-3 py-2.5 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-sm font-medium text-gray-400 break-words">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <p className="text-[11px] text-gray-300 text-center">👁 Modo solo lectura — Visita finalizada</p>
        </div>
      </div>
    </div>
  );
}

// ── Visit Row (tabla) ─────────────────────────────────────────────────────────
function VisitRow({ cita, onView }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-[#F4F6FA]/60 transition-colors group">
      <td className="px-4 sm:px-6 py-3 sm:py-3.5">
        <span className="font-semibold text-[#1C355E] text-sm truncate block max-w-[120px] sm:max-w-none">
          {cita.cliente}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-3.5 hidden md:table-cell">
        <span className="text-sm text-gray-600 truncate block max-w-[140px]">
          {cita.asesorNombre || "—"}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-3.5 hidden sm:table-cell">
        <span className="text-sm text-gray-600 whitespace-nowrap">{cita.fecha}</span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-3.5 hidden lg:table-cell">
        <span className="text-sm text-gray-600 whitespace-nowrap">{cita.hora}</span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-3.5">
        <Badge status={cita.estado} />
        {/* En mobile mostramos fecha debajo del badge */}
        <p className="text-[10px] text-gray-400 mt-0.5 sm:hidden">{cita.fecha}</p>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-right">
        {cita.estado === "realizada" && (
          <button
            onClick={() => onView(cita)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1C355E]
              hover:bg-[#1C355E]/8 px-2.5 py-1.5 rounded-lg transition-all duration-150
              opacity-70 group-hover:opacity-100"
            aria-label={`Ver detalle de ${cita.cliente}`}
          >
            <EyeIcon />
            <span className="hidden sm:inline">Ver</span>
          </button>
        )}
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY DATA (placeholder — replace with real data from API/localStorage)
const MONTHLY_DATA = [
  { mes: "Ene", visitas: 38 }, { mes: "Feb", visitas: 52 },
  { mes: "Mar", visitas: 61 }, { mes: "Abr", visitas: 45 },
  { mes: "May", visitas: 78 }, { mes: "Jun", visitas: 55 },
  { mes: "Jul", visitas: 90 },
];

export default function AdminDashboard() {
  const [allCitas, setAllCitas]     = useState([]);
  const [activeTab, setActiveTab]   = useState("todos");
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("equielect_citas");
    if (stored) setAllCitas(JSON.parse(stored));
  }, []);

  const tabs = ["todos", "activa", "pendiente", "realizada"];
  const filtered = activeTab === "todos"
    ? allCitas
    : allCitas.filter((c) => c.estado === activeTab);

  const uniqueAsesores = [...new Set(allCitas.map((c) => c.asesorNombre).filter(Boolean))].length;

  const maxBar = Math.max(...MONTHLY_DATA.map((d) => d.visitas));

  const RESOLVED_DATA = [
    {
      label: "Realizadas",
      value: allCitas.length > 0
        ? Math.round((allCitas.filter(c => c.estado === "realizada").length / allCitas.length) * 100)
        : 64,
      color: "bg-[#1C355E]",
    },
    {
      label: "Pendientes",
      value: allCitas.length > 0
        ? Math.round((allCitas.filter(c => c.estado === "pendiente").length / allCitas.length) * 100)
        : 22,
      color: "bg-[#FFCD00]",
    },
  ];

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay: .05s; }
        .fade-up-2 { animation-delay: .10s; }
        .fade-up-3 { animation-delay: .15s; }
        .fade-up-4 { animation-delay: .20s; }
        .fade-up-5 { animation-delay: .25s; }
        .fade-up-6 { animation-delay: .30s; }

        @keyframes barGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        .bar-grow { animation: barGrow .6s cubic-bezier(.22,1,.36,1) both; transform-origin: bottom; }

        @keyframes barGrowH {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-in { animation: modalIn .25s cubic-bezier(.34,1.56,.64,1) both; }

        /* En mobile el sheet sube desde abajo */
        @media (max-width: 639px) {
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(100%); }
            to   { opacity: 1; transform: translateY(0); }
          }
        }

        /* Scroll suave en tabla */
        .table-scroll { -webkit-overflow-scrolling: touch; }

        /* Tap highlight nulo en botones mobile */
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {selectedVisit && (
        <VisitDetailModal visit={selectedVisit} onClose={() => setSelectedVisit(null)} />
      )}

      <main className="flex-1 bg-[#F4F6FA] p-4 sm:p-6 md:p-8 min-h-screen">

        {/* ── Title ── */}
        <div className="fade-up fade-up-1 mb-5 sm:mb-7 flex items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#98989A] uppercase tracking-widest mb-0.5">
              Panel General
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-[#1C355E] leading-tight">Dashboard</h1>
          </div>
          <div className="text-[10px] sm:text-xs text-[#98989A] font-medium bg-white border border-gray-200
            px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap flex-shrink-0">
            {new Date().toLocaleDateString("es-CO", {
              weekday: "short",
              year:    "numeric",
              month:   "short",
              day:     "numeric",
            })}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
          {[
            { icon: <CalIcon />,   label: "Citas Totales", value: allCitas.length || 243, sub: "+12 este mes",  accent: "bg-[#1C355E]" },
            { icon: <CheckIcon />, label: "Realizadas",    value: allCitas.filter(c => c.estado === "realizada").length || 164, sub: "completadas",  accent: "bg-emerald-400" },
            { icon: <ClockIcon />, label: "Pendientes",    value: allCitas.filter(c => c.estado === "pendiente").length || 54,  sub: "por atender",  accent: "bg-[#FFCD00]" },
            { icon: <UsersIcon />, label: "Asesores",      value: uniqueAsesores || 8,     sub: "activos",       accent: "bg-[#98989A]/60" },
          ].map((card, i) => (
            <div key={card.label} className={`fade-up fade-up-${i + 1}`}>
              <StatCard {...card} />
            </div>
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 mb-5 sm:mb-7">

          {/* Bar chart */}
          <div className="fade-up fade-up-3 lg:col-span-3 bg-white rounded-2xl p-4 sm:p-6
            border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)]">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-[#98989A] uppercase tracking-widest">
                  Visitas mensuales
                </p>
                <p className="text-base sm:text-lg font-black text-[#1C355E] mt-0.5">2025</p>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#1C355E]
                bg-[#1C355E]/6 px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap">
                Año actual
              </span>
            </div>
            <div className="flex items-end gap-1.5 sm:gap-2 h-28 sm:h-36">
              {MONTHLY_DATA.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-1.5 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#1C355E] hidden xs:block">
                    {d.visitas}
                  </span>
                  <div
                    className={`w-full rounded-t-lg bar-grow ${i === 4 ? "bg-[#FFCD00]" : "bg-[#1C355E]/40"}`}
                    style={{
                      height:           `${(d.visitas / maxBar) * 100}%`,
                      animationDelay:   `${i * 0.07}s`,
                    }}
                  />
                  <span className="text-[9px] sm:text-[10px] text-[#98989A] font-medium truncate w-full text-center">
                    {d.mes}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bars */}
          <div className="fade-up fade-up-4 lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6
            border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)]">
            <p className="text-[10px] sm:text-xs font-bold text-[#98989A] uppercase tracking-widest mb-0.5">
              Estado de citas
            </p>
            <p className="text-base sm:text-lg font-black text-[#1C355E] mb-4 sm:mb-5">Resumen</p>
            <div className="space-y-3 sm:space-y-4">
              {RESOLVED_DATA.map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-gray-600">{d.label}</span>
                    <span className="text-xs font-black text-[#1C355E]">{d.value}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${d.color}`}
                      style={{
                        width:           `${d.value}%`,
                        animation:       `barGrowH .7s cubic-bezier(.22,1,.36,1) ${i * 0.12}s both`,
                        transformOrigin: "left",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-base font-black text-emerald-600">
                  {allCitas.filter(c => c.estado === "realizada").length || 64}
                </p>
                <p className="text-[10px] text-[#98989A] font-medium">Hechas</p>
              </div>
              <div>
                <p className="text-base font-black text-yellow-500">
                  {allCitas.filter(c => c.estado === "pendiente").length || 22}
                </p>
                <p className="text-[10px] text-[#98989A] font-medium">Pendientes</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table — ALL visits from ALL asesores ── */}
        <div className="fade-up fade-up-5 bg-white rounded-2xl border border-gray-100
          shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] overflow-hidden">

          {/* Table header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100
            flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-[#98989A] uppercase tracking-widest">
                Registro global
              </p>
              <p className="text-base font-black text-[#1C355E]">Todas las visitas</p>
            </div>

            {/* Tabs — scroll horizontal en pantallas muy pequeñas */}
            <div className="flex items-center gap-1 bg-[#F4F6FA] rounded-xl p-1 overflow-x-auto
              scrollbar-none flex-nowrap sm:flex-wrap w-full sm:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200 whitespace-nowrap flex-shrink-0
                    ${activeTab === tab
                      ? "bg-[#1C355E] text-white shadow-sm"
                      : "text-[#98989A] hover:text-[#1C355E]"
                    }`}
                >
                  {tab === "todos" ? "Todos" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table — scroll horizontal en mobile */}
          <div className="overflow-x-auto table-scroll">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="bg-[#F4F6FA]">
                  <th className="text-left px-4 sm:px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest">
                    Cliente
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest hidden md:table-cell">
                    Asesor
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest hidden sm:table-cell">
                    Fecha
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest hidden lg:table-cell">
                    Hora
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-4 sm:px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((cita, i) => (
                    <VisitRow key={cita.id || i} cita={cita} onView={setSelectedVisit} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#98989A]">
                      No hay citas para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-[#98989A] font-medium">
              Mostrando{" "}
              <span className="font-bold text-[#1C355E]">{filtered.length}</span>{" "}
              de{" "}
              <span className="font-bold text-[#1C355E]">{allCitas.length}</span>{" "}
              registros
            </p>
          </div>
        </div>

        <div className="fade-up fade-up-6 mt-5 sm:mt-6 text-center">
          <p className="text-[10px] sm:text-xs text-[#98989A] font-medium">
            Equielect · Dashboard Global · v2.4.1
          </p>
        </div>
      </main>
    </LayoutDashboard>
  );
}
