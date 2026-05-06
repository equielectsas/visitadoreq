"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

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
  if (Array.isArray(data?.visitas)) return data.visitas;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

function notifyVisitasUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("visitas-updated"));
}

async function patchTareas(visitaId, tareasPendientes) {
  const token = getToken();
  const res = await fetch(`/api/visitas/${visitaId}/tareas`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify({ tareasPendientes }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return data;
}

const GRADIENTS = [
  "from-yellow-400 to-orange-400",
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
];

function getGradient(str = "") {
  return GRADIENTS[(str.charCodeAt(0) || 0) % GRADIENTS.length];
}

function getInitials(nombre) {
  if (!nombre) return "?";
  const p = String(nombre).trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return p[0].slice(0, 2).toUpperCase();
}

const EyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
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
const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="relative bg-white rounded-2xl p-4 sm:p-5 overflow-hidden border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.10)] hover:shadow-[0_6px_28px_-4px_rgba(28,53,94,0.16)] transition-shadow duration-300">
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

function Badge({ done }) {
  return done ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
      Completada
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200">
      Pendiente
    </span>
  );
}

function AvatarCircle({ initials, size = "sm" }) {
  const sz = size === "lg" ? "w-11 h-11 text-sm" : "w-8 h-8 text-xs";
  const gradient = getGradient(initials);
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0`}>
      {initials}
    </div>
  );
}

function TaskDetailModal({ row, onClose }) {
  if (!row) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 max-h-[92dvh] flex flex-col modal-slide">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full sm:hidden" />
        <div className="flex items-start justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex-shrink-0 mt-2 sm:mt-0">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarCircle initials={getInitials(row.asesorNombre)} size="lg" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#98989A]">Detalle de tarea</p>
              <p className="text-base font-black text-[#1C355E] leading-tight truncate">{row.empresa}</p>
              <p className="text-xs text-[#98989A] mt-0.5 truncate">
                {row.asesorNombre} · NIT {row.nit}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge done={row.done} />
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Municipio", value: row.municipio || "—" },
              { label: "Fecha visita", value: row.fecha || "—" },
              { label: "Estado visita", value: row.estadoVisita || "—" },
              { label: "Asesor", value: row.asesorNombre || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F4F6FA] rounded-xl px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#98989A] mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[#1C355E] break-words">{value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#98989A] mb-2">Descripción de la tarea</p>
            <div className="bg-[#F4F6FA] rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed min-h-[52px] border border-dashed border-gray-200">
              {row.texto || <span className="text-gray-300">Sin texto</span>}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <p className="text-[11px] text-[#98989A] text-center">Solo lectura · Marca el estado en la tabla y usa &quot;Guardar visita&quot;</p>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center transition-all duration-150 active:scale-95 opacity-70 hover:opacity-100 text-[#1C355E] hover:bg-[#1C355E]/8 hover:border-[#1C355E]/20"
    >
      {icon}
    </button>
  );
}

export default function AdminTareasPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [visitas, setVisitas] = useState([]);
  const [draftByVisita, setDraftByVisita] = useState({});
  const [filterAsesor, setFilterAsesor] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todas");
  const [detailRow, setDetailRow] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const v = await fetchVisitas();
      setVisitas(v);
      const init = {};
      for (const it of v) init[it._id] = it?.datosVisita?.tareasPendientes || [];
      setDraftByVisita(init);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las tareas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onUpd = () => load();
    window.addEventListener("visitas-updated", onUpd);
    return () => window.removeEventListener("visitas-updated", onUpd);
  }, [load]);

  const asesores = useMemo(() => {
    const m = new Map();
    for (const v of visitas) {
      const cedula = v?.asesor?.cedula;
      const nombre = v?.asesor?.nombre;
      if (!cedula) continue;
      if (!m.has(String(cedula))) m.set(String(cedula), { cedula: String(cedula), nombre: nombre || String(cedula) });
    }
    return [...m.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [visitas]);

  const flatTasks = useMemo(() => {
    const rows = [];
    for (const v of visitas) {
      const tareas = draftByVisita[v._id] || v?.datosVisita?.tareasPendientes || [];
      const asesorCedula = v?.asesor?.cedula ? String(v.asesor.cedula) : "";
      const asesorNombre = v?.asesor?.nombre || "—";

      for (let i = 0; i < tareas.length; i++) {
        const t = tareas[i];
        rows.push({
          key: `${v._id}-${i}`,
          visitaId: v._id,
          idx: i,
          texto: t?.texto || "",
          done: !!t?.done,
          empresa: v?.datosVisita?.nombreEmpresa || v?.cliente || "—",
          nit: v?.datosVisita?.nit || "—",
          municipio: v?.datosVisita?.municipio || "—",
          fecha: v?.fecha || "—",
          estadoVisita: v?.estado || "—",
          asesorCedula,
          asesorNombre,
        });
      }
    }
    return rows;
  }, [visitas, draftByVisita]);

  const filtered = useMemo(() => {
    return flatTasks.filter((t) => {
      if (filterAsesor !== "todos" && t.asesorCedula !== filterAsesor) return false;
      if (filterEstado === "todas") return true;
      if (filterEstado === "completadas") return t.done;
      return !t.done;
    });
  }, [flatTasks, filterAsesor, filterEstado]);

  const pendientes = flatTasks.filter((t) => !t.done).length;
  const completadas = flatTasks.filter((t) => t.done).length;
  const asesoresConPend = new Set(flatTasks.filter((t) => !t.done).map((t) => t.asesorCedula)).size;

  const toggleTask = (visitaId, idx) => {
    setDraftByVisita((prev) => {
      const curr = Array.isArray(prev[visitaId]) ? prev[visitaId] : [];
      const next = curr.map((t, i) => (i === idx ? { ...t, done: !t.done } : t));
      return { ...prev, [visitaId]: next };
    });
  };

  const guardarVisita = async (visitaId) => {
    const tareas = draftByVisita[visitaId] || [];
    setSaving(true);
    try {
      await patchTareas(visitaId, tareas);
      await load();
      notifyVisitasUpdated();
    } catch (e) {
      setError(e?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "todas", label: "Todas" },
    { key: "pendientes", label: "Pendientes" },
    { key: "completadas", label: "Completadas" },
  ];

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay:.05s; } .fade-up-2 { animation-delay:.10s; }
        .fade-up-3 { animation-delay:.15s; } .fade-up-4 { animation-delay:.20s; } .fade-up-5 { animation-delay:.25s; }
        @keyframes modalSlide { from { opacity:0; transform:scale(.96) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @media (max-width:639px) {
          @keyframes modalSlide { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
        }
        .modal-slide { animation: modalSlide .25s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <main className="flex-1 bg-[#F4F6FA] p-4 sm:p-6 md:p-8 min-h-screen">
        <div className="fade-up fade-up-1 mb-5 sm:mb-7 flex items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#98989A] uppercase tracking-widest mb-0.5">Administración</p>
            <h1 className="text-xl sm:text-2xl font-black text-[#1C355E] leading-tight">Tareas pendientes</h1>
            <p className="text-xs text-[#98989A] mt-1 hidden sm:block">Datos desde MongoDB · todos los asesores</p>
          </div>
          <div className="text-[10px] sm:text-xs text-[#98989A] font-medium bg-white border border-gray-200 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap flex-shrink-0">
            {new Date().toLocaleDateString("es-CO", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
          {[
            { icon: <ListIcon />, label: "Total tareas", value: flatTasks.length, sub: "registradas", accent: "bg-[#1C355E]", i: 1 },
            { icon: <ClockIcon />, label: "Pendientes", value: pendientes, sub: "por completar", accent: "bg-[#FFCD00]", i: 2 },
            { icon: <CheckIcon />, label: "Completadas", value: completadas, sub: "finalizadas", accent: "bg-emerald-400", i: 3 },
            { icon: <UsersIcon />, label: "Asesores con pendientes", value: asesoresConPend, sub: "activos", accent: "bg-red-400", i: 4 },
          ].map((c) => (
            <div key={c.label} className={`fade-up fade-up-${c.i}`}>
              <StatCard icon={c.icon} label={c.label} value={c.value} sub={c.sub} accent={c.accent} />
            </div>
          ))}
        </div>

        <div className="fade-up fade-up-5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-[#98989A] uppercase tracking-widest">Registro global</p>
              <p className="text-base font-black text-[#1C355E]">Todas las tareas</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterAsesor}
                onChange={(e) => setFilterAsesor(e.target.value)}
                className="text-xs font-semibold text-[#1C355E] bg-[#F4F6FA] border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#1C355E] cursor-pointer transition-colors"
              >
                <option value="todos">Todos los asesores</option>
                {asesores.map((a) => (
                  <option key={a.cedula} value={a.cedula}>
                    {a.nombre}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1 bg-[#F4F6FA] rounded-xl p-1 overflow-x-auto">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setFilterEstado(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                      filterEstado === t.key ? "bg-[#1C355E] text-white shadow-sm" : "text-[#98989A] hover:text-[#1C355E]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-14 text-center text-sm text-gray-400">Cargando…</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-semibold text-[#98989A]">No hay tareas con estos filtros</p>
            </div>
          ) : (
            <>
              <div className="md:hidden p-4 space-y-3">
                {filtered.map((t) => (
                  <div
                    key={t.key}
                    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_12px_-4px_rgba(28,53,94,0.08)] hover:shadow-[0_4px_20px_-4px_rgba(28,53,94,0.14)] transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarCircle initials={getInitials(t.asesorNombre)} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#1C355E] truncate">{t.empresa}</p>
                          <p className="text-xs text-[#98989A] truncate">{t.asesorNombre}</p>
                        </div>
                      </div>
                      <Badge done={t.done} />
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">{t.texto || "—"}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#98989A]">
                        {t.fecha} · {t.estadoVisita}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <ActionBtn icon={<EyeIcon />} label="Ver detalle" onClick={() => setDetailRow(t)} />
                        <button
                          type="button"
                          onClick={() => toggleTask(t.visitaId, t.idx)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            t.done ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
                          }`}
                        >
                          {t.done ? "Hecha" : "Pendiente"}
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => guardarVisita(t.visitaId)}
                          className="px-2.5 py-1 rounded-lg bg-[#1C355E] text-white text-[11px] font-bold disabled:opacity-50"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm min-w-[980px]">
                  <thead>
                    <tr className="bg-[#F4F6FA]">
                      {["Asesor", "Estado tarea", "Tarea", "Empresa", "Fecha", "Visita", "", ""].map((h, i) => (
                        <th
                          key={i}
                          className={`text-left px-5 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest ${
                            h === "" ? "w-24" : ""
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.key} className="border-b border-gray-50 hover:bg-[#F4F6FA]/50 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <AvatarCircle initials={getInitials(t.asesorNombre)} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1C355E] truncate max-w-[160px]">{t.asesorNombre}</p>
                              <p className="text-[11px] text-[#98989A]">{t.asesorCedula}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => toggleTask(t.visitaId, t.idx)}
                            className={`px-2.5 py-1 rounded-full text-xs font-black ${
                              t.done ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {t.done ? "Hecha" : "Pendiente"}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800 max-w-[220px]">
                          <span className="line-clamp-2">{t.texto || "—"}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-700">
                          <div className="font-semibold truncate max-w-[180px]">{t.empresa}</div>
                          <div className="text-xs text-gray-400">NIT {t.nit}</div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{t.fecha}</td>
                        <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{t.estadoVisita}</td>
                        <td className="px-5 py-3.5">
                          <ActionBtn icon={<EyeIcon />} label="Ver detalle" onClick={() => setDetailRow(t)} />
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => guardarVisita(t.visitaId)}
                            className="px-3 py-2 rounded-xl bg-[#1C355E] text-white text-xs font-bold disabled:opacity-50 whitespace-nowrap"
                          >
                            Guardar visita
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-[#98989A] font-medium">
              Mostrando <span className="font-bold text-[#1C355E]">{filtered.length}</span> de{" "}
              <span className="font-bold text-[#1C355E]">{flatTasks.length}</span> tareas
            </p>
          </div>
        </div>
      </main>

      <TaskDetailModal row={detailRow} onClose={() => setDetailRow(null)} />
    </LayoutDashboard>
  );
}
