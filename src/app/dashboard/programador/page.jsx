"use client";

/**
 * /dashboard/programador/page.jsx  (también aplica para /dashboard/admin/page.jsx)
 * Dashboard GLOBAL para adminPlataforma y adminComercial.
 * Ve todas las citas de todos los asesores.
 * Citas finalizadas tienen ojo para ver detalles.
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
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    activa:    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    pendiente: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    realizada: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    perdida:   "bg-red-50 text-red-600 ring-1 ring-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ── Visit Detail Modal ────────────────────────────────────────────────────────
function VisitDetailModal({ visit, onClose }) {
  if (!visit) return null;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Detalle de visita</p>
            <p className="text-base font-black text-gray-700">{visit.cliente}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge status={visit.estado} />
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-300">{label}</p>
              <div className="px-3 py-2.5 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-sm font-medium text-gray-400">
                {value}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5">
          <p className="text-[11px] text-gray-300 text-center">👁 Modo solo lectura — Visita finalizada</p>
        </div>
      </div>
    </div>
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
  const [allCitas, setAllCitas]   = useState([]);
  const [activeTab, setActiveTab] = useState("todos");
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("equielect_citas");
    if (stored) setAllCitas(JSON.parse(stored));
  }, []);

  const tabs = ["todos", "activa", "pendiente", "realizada", "perdida"];
  const filtered = activeTab === "todos"
    ? allCitas
    : allCitas.filter((c) => c.estado === activeTab);

  // Unique advisors who have citas
  const uniqueAsesores = [...new Set(allCitas.map((c) => c.asesorNombre).filter(Boolean))].length;

  const maxBar = Math.max(...MONTHLY_DATA.map((d) => d.visitas));

  const RESOLVED_DATA = [
    { label: "Realizadas", value: allCitas.length > 0 ? Math.round((allCitas.filter(c => c.estado === "realizada").length / allCitas.length) * 100) : 64, color: "bg-[#1C355E]" },
    { label: "Pendientes", value: allCitas.length > 0 ? Math.round((allCitas.filter(c => c.estado === "pendiente").length / allCitas.length) * 100) : 22, color: "bg-[#FFCD00]" },
    { label: "Perdidas",   value: allCitas.length > 0 ? Math.round((allCitas.filter(c => c.estado === "perdida").length  / allCitas.length) * 100) : 14, color: "bg-[#98989A]/60" },
  ];

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay:.05s; } .fade-up-2 { animation-delay:.10s; }
        .fade-up-3 { animation-delay:.15s; } .fade-up-4 { animation-delay:.20s; }
        .fade-up-5 { animation-delay:.25s; } .fade-up-6 { animation-delay:.30s; }
        @keyframes barGrow { from { transform:scaleY(0); } to { transform:scaleY(1); } }
        .bar-grow { animation: barGrow .6s cubic-bezier(.22,1,.36,1) both; transform-origin: bottom; }
        @keyframes modalIn { from { opacity:0; transform:scale(.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .modal-in { animation: modalIn .25s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      {selectedVisit && <VisitDetailModal visit={selectedVisit} onClose={() => setSelectedVisit(null)} />}

      <main className="flex-1 bg-[#F4F6FA] p-6 md:p-8 min-h-screen">

        {/* Title */}
        <div className="fade-up fade-up-1 mb-7 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest mb-0.5">Panel General</p>
            <h1 className="text-2xl font-black text-[#1C355E] leading-tight">Dashboard</h1>
          </div>
          <div className="text-xs text-[#98989A] font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
            {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="fade-up fade-up-1">
            <StatCard icon={<CalIcon />}   label="Citas Totales"  value={allCitas.length || 243}
              sub="+12 este mes" accent="bg-[#1C355E]" />
          </div>
          <div className="fade-up fade-up-2">
            <StatCard icon={<CheckIcon />} label="Realizadas"     value={allCitas.filter(c => c.estado === "realizada").length || 164}
              sub="completadas"  accent="bg-emerald-400" />
          </div>
          <div className="fade-up fade-up-3">
            <StatCard icon={<ClockIcon />} label="Pendientes"     value={allCitas.filter(c => c.estado === "pendiente").length || 54}
              sub="por atender"  accent="bg-[#FFCD00]" />
          </div>
          <div className="fade-up fade-up-4">
            <StatCard icon={<UsersIcon />} label="Asesores"       value={uniqueAsesores || 8}
              sub="activos"      accent="bg-[#98989A]/60" />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-7">
          <div className="fade-up fade-up-3 lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest">Visitas mensuales</p>
                <p className="text-lg font-black text-[#1C355E] mt-0.5">2025</p>
              </div>
              <span className="text-[11px] font-semibold text-[#1C355E] bg-[#1C355E]/6 px-3 py-1 rounded-full">Año actual</span>
            </div>
            <div className="flex items-end gap-2 h-36">
              {MONTHLY_DATA.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#1C355E]">{d.visitas}</span>
                  <div className={`w-full rounded-t-lg bar-grow ${i === 4 ? "bg-[#FFCD00]" : "bg-[#1C355E]/40"}`}
                    style={{ height: `${(d.visitas / maxBar) * 100}%`, animationDelay: `${i * 0.07}s` }} />
                  <span className="text-[10px] text-[#98989A] font-medium">{d.mes}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up fade-up-4 lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)]">
            <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest mb-1">Estado de citas</p>
            <p className="text-lg font-black text-[#1C355E] mb-5">Resumen</p>
            <div className="space-y-3">
              {RESOLVED_DATA.map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-600">{d.label}</span>
                    <span className="text-xs font-black text-[#1C355E]">{d.value}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.color}`}
                      style={{ width: `${d.value}%`, animation: `barGrow .7s cubic-bezier(.22,1,.36,1) ${i * 0.12}s both`, transformOrigin: "left" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-base font-black text-emerald-600">{allCitas.filter(c => c.estado === "realizada").length || 64}</p>
                <p className="text-[10px] text-[#98989A] font-medium">Hechas</p>
              </div>
              <div>
                <p className="text-base font-black text-yellow-500">{allCitas.filter(c => c.estado === "pendiente").length || 22}</p>
                <p className="text-[10px] text-[#98989A] font-medium">Pendientes</p>
              </div>
              <div>
                <p className="text-base font-black text-[#98989A]">{allCitas.filter(c => c.estado === "perdida").length || 14}</p>
                <p className="text-[10px] text-[#98989A] font-medium">Perdidas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table — ALL visits from ALL asesores */}
        <div className="fade-up fade-up-5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest">Registro global</p>
              <p className="text-base font-black text-[#1C355E]">Todas las visitas</p>
            </div>
            <div className="flex items-center gap-1 bg-[#F4F6FA] rounded-xl p-1 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200
                    ${activeTab === tab ? "bg-[#1C355E] text-white shadow-sm" : "text-[#98989A] hover:text-[#1C355E]"}`}
                >
                  {tab === "todos" ? "Todos" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4F6FA]">
                  {["Cliente", "Asesor", "Fecha", "Hora", "Estado", ""].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? filtered.map((v, i) => {
                  const isFinished = v.estado === "realizada" || v.estado === "perdida";
                  return (
                    <tr key={v.id || i} className="hover:bg-[#F4F6FA]/60 transition-colors group">
                      <td className="px-6 py-3.5 font-semibold text-[#1C355E]">{v.cliente || v.nombre}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs font-medium">{v.asesorNombre || "—"}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{v.fecha}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{v.hora}</td>
                      <td className="px-6 py-3.5"><Badge status={v.estado} /></td>
                      <td className="px-6 py-3.5">
                        {isFinished && (
                          <button
                            onClick={() => setSelectedVisit(v)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#1C355E] text-gray-400 hover:text-white
                              flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100"
                            title="Ver detalles"
                          >
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
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-[#98989A] font-medium">
              Mostrando <span className="font-bold text-[#1C355E]">{filtered.length}</span> de{" "}
              <span className="font-bold text-[#1C355E]">{allCitas.length}</span> registros
            </p>
          </div>
        </div>

        <div className="fade-up fade-up-6 mt-6 text-center">
          <p className="text-xs text-[#98989A] font-medium">Equielect · Dashboard Global · v2.4.1</p>
        </div>
      </main>
    </LayoutDashboard>
  );
}
