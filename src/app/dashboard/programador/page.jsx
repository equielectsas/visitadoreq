"use client";

import { useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

// ── Mini bar chart (CSS only, no libs) ───────────────────────────────────────
const MONTHLY_DATA = [
  { mes: "Ene", visitas: 38, color: "bg-[#1C355E]/30" },
  { mes: "Feb", visitas: 52, color: "bg-[#1C355E]/40" },
  { mes: "Mar", visitas: 61, color: "bg-[#1C355E]/50" },
  { mes: "Abr", visitas: 45, color: "bg-[#1C355E]/40" },
  { mes: "May", visitas: 78, color: "bg-[#FFCD00]"    },
  { mes: "Jun", visitas: 55, color: "bg-[#1C355E]/50" },
  { mes: "Jul", visitas: 90, color: "bg-[#1C355E]/60" },
];

const RESOLVED_DATA = [
  { label: "Completadas", value: 64, color: "bg-[#1C355E]"    },
  { label: "Pendientes",  value: 22, color: "bg-[#FFCD00]"    },
  { label: "Canceladas",  value: 14, color: "bg-[#98989A]/60" },
];

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`
      relative bg-white rounded-2xl p-5 overflow-hidden
      border border-gray-100
      shadow-[0_2px_16px_-4px_rgba(28,53,94,0.10)]
      hover:shadow-[0_6px_28px_-4px_rgba(28,53,94,0.16)]
      transition-shadow duration-300
    `}>
      {/* Top accent stripe */}
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

// ── Status badge ──────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    Activa:     "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    Pendiente:  "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    Realizada:  "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    Cancelada:  "bg-red-50 text-red-600 ring-1 ring-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ── Sample table data ─────────────────────────────────────────────────────────
const VISITAS = [
  { nombre: "Juan",    apellido: "Pérez",    telefono: "300 123 4567", email: "juan@mail.com",    estado: "Activa"    },
  { nombre: "Ana",     apellido: "Gómez",    telefono: "301 987 6543", email: "ana@mail.com",     estado: "Realizada" },
  { nombre: "Carlos",  apellido: "Ramírez",  telefono: "310 456 7890", email: "carlos@mail.com",  estado: "Pendiente" },
  { nombre: "Lucía",   apellido: "Torres",   telefono: "315 321 0987", email: "lucia@mail.com",   estado: "Activa"    },
  { nombre: "Miguel",  apellido: "Vargas",   telefono: "320 654 3210", email: "miguel@mail.com",  estado: "Cancelada" },
];

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DesarrolladorDashboard() {
  const [activeTab, setActiveTab] = useState("todos");

  const filtered = activeTab === "todos"
    ? VISITAS
    : VISITAS.filter(v => v.estado.toLowerCase() === activeTab);

  const maxVisitas = Math.max(...MONTHLY_DATA.map(d => d.visitas));

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay: .05s; }
        .fade-up-2 { animation-delay: .10s; }
        .fade-up-3 { animation-delay: .15s; }
        .fade-up-4 { animation-delay: .20s; }
        .fade-up-5 { animation-delay: .25s; }
        .fade-up-6 { animation-delay: .30s; }
        .bar-grow {
          animation: barGrow .6s cubic-bezier(.22,1,.36,1) both;
          transform-origin: bottom;
        }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
      `}</style>

      <main className="flex-1 bg-[#F4F6FA] p-6 md:p-8 min-h-screen">

        {/* ── Page title ──────────────────────────────────────────────── */}
        <div className="fade-up fade-up-1 mb-7 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest mb-0.5">Panel General</p>
            <h1 className="text-2xl font-black text-[#1C355E] leading-tight">Dashboard</h1>
          </div>
          <div className="text-xs text-[#98989A] font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
            {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="fade-up fade-up-1">
            <StatCard icon={<CalIcon />}   label="Citas Totales"   value="243"  sub="+12 este mes"   accent="bg-[#1C355E]" />
          </div>
          <div className="fade-up fade-up-2">
            <StatCard icon={<CheckIcon />} label="Realizadas"      value="164"  sub="67% del total"  accent="bg-emerald-400" />
          </div>
          <div className="fade-up fade-up-3">
            <StatCard icon={<ClockIcon />} label="Pendientes"      value="54"   sub="22% del total"  accent="bg-[#FFCD00]" />
          </div>
          <div className="fade-up fade-up-4">
            <StatCard icon={<UsersIcon />} label="Clientes"        value="89"   sub="3 nuevos hoy"   accent="bg-[#98989A]/60" />
          </div>
        </div>

        {/* ── Charts row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-7">

          {/* Bar chart — Monthly */}
          <div className="fade-up fade-up-3 lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest">Visitas mensuales</p>
                <p className="text-lg font-black text-[#1C355E] mt-0.5">2025</p>
              </div>
              <span className="text-[11px] font-semibold text-[#1C355E] bg-[#1C355E]/6 px-3 py-1 rounded-full">Año actual</span>
            </div>
            {/* Bars */}
            <div className="flex items-end gap-2 h-36">
              {MONTHLY_DATA.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#1C355E]">{d.visitas}</span>
                  <div
                    className={`w-full rounded-t-lg ${d.color} bar-grow`}
                    style={{
                      height: `${(d.visitas / maxVisitas) * 100}%`,
                      animationDelay: `${i * 0.07}s`,
                    }}
                  />
                  <span className="text-[10px] text-[#98989A] font-medium">{d.mes}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut-style breakdown */}
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
                    <div
                      className={`h-full rounded-full ${d.color}`}
                      style={{
                        width: `${d.value}%`,
                        animation: `barGrow .7s cubic-bezier(.22,1,.36,1) ${i * 0.12}s both`,
                        transformOrigin: "left",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick totals */}
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-base font-black text-emerald-600">64</p>
                <p className="text-[10px] text-[#98989A] font-medium">Hechas</p>
              </div>
              <div>
                <p className="text-base font-black text-yellow-500">22</p>
                <p className="text-[10px] text-[#98989A] font-medium">Pendientes</p>
              </div>
              <div>
                <p className="text-base font-black text-[#98989A]">14</p>
                <p className="text-[10px] text-[#98989A] font-medium">Canceladas</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────── */}
        <div className="fade-up fade-up-5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] overflow-hidden">

          {/* Table header */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest">Registro</p>
              <p className="text-base font-black text-[#1C355E]">Visitas recientes</p>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-[#F4F6FA] rounded-xl p-1">
              {["todos", "activa", "pendiente", "realizada"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200
                    ${activeTab === tab
                      ? "bg-[#1C355E] text-white shadow-sm"
                      : "text-[#98989A] hover:text-[#1C355E]"}
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4F6FA]">
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest">Nombre</th>
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest">Apellido</th>
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest">Teléfono</th>
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest">Email</th>
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? filtered.map((v, i) => (
                  <tr key={i} className="hover:bg-[#F4F6FA]/60 transition-colors duration-100 group">
                    <td className="px-6 py-3.5 font-semibold text-[#1C355E]">{v.nombre}</td>
                    <td className="px-6 py-3.5 text-gray-600">{v.apellido}</td>
                    <td className="px-6 py-3.5 text-gray-500 font-mono text-xs">{v.telefono}</td>
                    <td className="px-6 py-3.5 text-gray-500">{v.email}</td>
                    <td className="px-6 py-3.5"><Badge status={v.estado} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#98989A] text-sm font-medium">
                      No hay visitas en este estado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-[#98989A] font-medium">
              Mostrando <span className="font-bold text-[#1C355E]">{filtered.length}</span> de <span className="font-bold text-[#1C355E]">{VISITAS.length}</span> registros
            </p>
            <button className="text-xs font-bold text-[#1C355E] hover:text-[#FFCD00] transition-colors duration-150">
              Ver todos →
            </button>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="fade-up fade-up-6 mt-6 text-center">
          <p className="text-xs text-[#98989A] font-medium">Equielect &bull; Dashboard interno &bull; v2.4.1</p>
        </div>

      </main>
    </LayoutDashboard>
  );
}
