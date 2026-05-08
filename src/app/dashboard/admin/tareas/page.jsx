"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";
import VisualizarVisitaModal from "@/components/VisualizarVisitaModal";
import { fechaHoraVisualDesdeVisita, nombreAsesorDesdeVisita, normalizarVisitaAsesorNombre } from "@/utils/visitasHelpers";

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

function asesorFilterKey(v) {
  const ced = v?.asesor?.cedula != null ? String(v.asesor.cedula).trim() : "";
  if (ced) return ced;
  const id = v?.asesor?._id || v?.asesorId;
  return id ? `id:${id}` : "sin_asesor";
}

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
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const BellIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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

function AvatarCircle({ initials, size = "sm" }) {
  const sz = size === "lg" ? "w-11 h-11 text-sm" : "w-8 h-8 text-xs";
  const gradient = getGradient(initials);
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function AdminTareasPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [visitas, setVisitas] = useState([]);
  const [draftByVisita, setDraftByVisita] = useState({});
  const [filterAsesor, setFilterAsesor] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todas");
  const [selectedVisita, setSelectedVisita] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const v = await fetchVisitas();
      const normalized = v.map(normalizarVisitaAsesorNombre);
      setVisitas(normalized);
      const init = {};
      for (const it of normalized) init[it._id] = it?.datosVisita?.tareasPendientes || [];
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
      const key = asesorFilterKey(v);
      const nombre = nombreAsesorDesdeVisita(v) || v?.asesor?.nombre || "—";
      if (!m.has(key)) m.set(key, { key, nombre });
    }
    return [...m.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [visitas]);

  const visitasConTareas = useMemo(() => {
    return visitas.filter((v) => {
      const t = draftByVisita[v._id] || v?.datosVisita?.tareasPendientes || [];
      return t.length > 0;
    });
  }, [visitas, draftByVisita]);

  const filteredVisitas = useMemo(() => {
    return visitasConTareas.filter((v) => {
      if (filterAsesor !== "todos" && asesorFilterKey(v) !== filterAsesor) return false;
      const tareas = draftByVisita[v._id] || v?.datosVisita?.tareasPendientes || [];
      const hasPending = tareas.some((t) => !t?.done);
      const allDone = tareas.length > 0 && tareas.every((t) => t?.done);
      if (filterEstado === "pendientes") return hasPending;
      if (filterEstado === "completadas") return allDone;
      return true;
    });
  }, [visitasConTareas, draftByVisita, filterAsesor, filterEstado]);

  const flatTasks = useMemo(() => {
    const rows = [];
    for (const v of visitas) {
      const tareas = draftByVisita[v._id] || v?.datosVisita?.tareasPendientes || [];
      for (let i = 0; i < tareas.length; i++) {
        rows.push({ done: !!tareas[i]?.done });
      }
    }
    return rows;
  }, [visitas, draftByVisita]);

  const pendientes = flatTasks.filter((t) => !t.done).length;
  const completadas = flatTasks.filter((t) => t.done).length;
  const asesoresConPend = useMemo(() => {
    const s = new Set();
    for (const v of visitasConTareas) {
      const tareas = draftByVisita[v._id] || v?.datosVisita?.tareasPendientes || [];
      if (tareas.some((t) => !t?.done)) s.add(asesorFilterKey(v));
    }
    return s.size;
  }, [visitasConTareas, draftByVisita]);

  const toggleTask = async (visitaId, idx) => {
    const curr = Array.isArray(draftByVisita[visitaId]) ? draftByVisita[visitaId] : [];
    const next = curr.map((t, i) => (i === idx ? { ...t, done: !t.done } : t));
    setDraftByVisita((prev) => ({ ...prev, [visitaId]: next }));
    setSavingId(visitaId);
    try {
      await patchTareas(visitaId, next);
      await load();
      notifyVisitasUpdated();
    } catch (e) {
      setError(e?.message || "No se pudo guardar el estado de la tarea.");
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const tabs = [
    { key: "todas", label: "Todas" },
    { key: "pendientes", label: "Pendientes" },
    { key: "completadas", label: "Completadas" },
  ];

  const enviarAlertaAsesor = async (v) => {
    setAlertMsg("");
    const ced = v?.asesor?.cedula != null ? String(v.asesor.cedula).trim() : "";
    if (!ced) {
      setAlertMsg("No hay cédula del asesor en esta visita; no se puede enviar la alerta.");
      return;
    }
    const token = getToken();
    if (!token) {
      setAlertMsg("No hay sesión. Vuelve a iniciar sesión.");
      return;
    }
    try {
      const res = await fetch("/api/alertas-tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ visitaId: v._id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      setAlertMsg("Alerta enviada al asesor. Verá un aviso obligatorio al entrar.");
      setTimeout(() => setAlertMsg(""), 4000);
    } catch (e) {
      setAlertMsg(e?.message || "No se pudo enviar la alerta.");
      setTimeout(() => setAlertMsg(""), 5000);
    }
  };

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay:.05s; } .fade-up-2 { animation-delay:.10s; }
        .fade-up-3 { animation-delay:.15s; } .fade-up-4 { animation-delay:.20s; } .fade-up-5 { animation-delay:.25s; }
      `}</style>

      <VisualizarVisitaModal
        show={!!selectedVisita}
        onClose={() => {
          setAlertMsg("");
          setSelectedVisita(null);
        }}
        cita={selectedVisita}
        expandDetails
        footerActions={
          selectedVisita ? (
            <div className="space-y-2">
              {alertMsg && (
                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{alertMsg}</p>
              )}
              <button
                type="button"
                onClick={() => enviarAlertaAsesor(selectedVisita)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all"
              >
                <BellIcon />
                Enviar alerta al asesor (tareas pendientes)
              </button>
              <p className="text-[11px] text-gray-400 text-center">
                El asesor deberá confirmar con &quot;Lo haré!&quot; y recibirás una notificación en la campana.
              </p>
            </div>
          ) : null
        }
      />

      <main className="flex-1 bg-[#F4F6FA] p-4 sm:p-6 md:p-8 min-h-screen">
        <div className="fade-up fade-up-1 mb-5 sm:mb-7 flex items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#98989A] uppercase tracking-widest mb-0.5">Administración</p>
            <h1 className="text-xl sm:text-2xl font-black text-[#1C355E] leading-tight">Tareas pendientes</h1>
            <p className="text-xs text-[#98989A] mt-1 hidden sm:block">Visitas con checklist del asesor · todos los asesores</p>
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
            { icon: <ListIcon />, label: "Visitas con tareas", value: visitasConTareas.length, sub: "registradas", accent: "bg-[#1C355E]", i: 1 },
            { icon: <ClockIcon />, label: "Tareas pendientes", value: pendientes, sub: "por completar", accent: "bg-[#FFCD00]", i: 2 },
            { icon: <CheckIcon />, label: "Tareas hechas", value: completadas, sub: "marcadas", accent: "bg-emerald-400", i: 3 },
            { icon: <UsersIcon />, label: "Asesores con pendientes", value: asesoresConPend, sub: "activos", accent: "bg-red-400", i: 4 },
          ].map((c) => (
            <div key={c.label} className={`fade-up fade-up-${c.i}`}>
              <StatCard icon={c.icon} label={c.label} value={c.value} sub={c.sub} accent={c.accent} />
            </div>
          ))}
        </div>

        <div className="fade-up fade-up-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#98989A] uppercase">Asesor</span>
              <select
                value={filterAsesor}
                onChange={(e) => setFilterAsesor(e.target.value)}
                className="text-xs font-semibold text-[#1C355E] bg-[#F4F6FA] border border-gray-200 rounded-xl px-3 py-2 outline-none"
              >
                <option value="todos">Todos</option>
                {asesores.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 bg-[#F4F6FA] rounded-xl p-1 flex-wrap">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setFilterEstado(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterEstado === t.key ? "bg-[#1C355E] text-white shadow-sm" : "text-[#98989A] hover:text-[#1C355E]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center text-sm text-gray-400">Cargando…</div>
          ) : filteredVisitas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
              <p className="text-sm font-semibold text-[#98989A]">No hay visitas con tareas en este filtro</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredVisitas.map((v) => {
                const tareas = draftByVisita[v._id] || v?.datosVisita?.tareasPendientes || [];
                const dv = v?.datosVisita || {};
                const nombreAsesor = nombreAsesorDesdeVisita(v) || v?.asesor?.nombre || "—";
                const fh = fechaHoraVisualDesdeVisita(v);
                const pendingCount = tareas.filter((t) => !t?.done).length;
                return (
                  <div
                    key={v._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] p-4 sm:p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarCircle initials={getInitials(nombreAsesor)} />
                        <div className="min-w-0">
                          <p className="text-sm font-black text-[#1C355E] truncate">{dv.nombreEmpresa || v.cliente || "—"}</p>
                          <p className="text-xs text-[#98989A] truncate">{nombreAsesor}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                          pendingCount > 0 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {pendingCount > 0 ? `${pendingCount} pend.` : "Listo"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-[#F4F6FA] rounded-lg px-2.5 py-2">
                        <p className="text-[9px] font-bold text-[#98989A] uppercase">Estado visita</p>
                        <p className="font-semibold text-[#1C355E] capitalize">{v.estado || "—"}</p>
                      </div>
                      <div className="bg-[#F4F6FA] rounded-lg px-2.5 py-2">
                        <p className="text-[9px] font-bold text-[#98989A] uppercase">Fecha / hora</p>
                        <p className="font-semibold text-[#1C355E]">
                          {fh.fecha || v.fecha || "—"} {fh.hora ? `· ${fh.hora}` : ""}
                        </p>
                      </div>
                      <div className="bg-[#F4F6FA] rounded-lg px-2.5 py-2 col-span-2">
                        <p className="text-[9px] font-bold text-[#98989A] uppercase">Municipio · Dirección</p>
                        <p className="font-semibold text-gray-700 line-clamp-2">
                          {dv.municipio || "—"}
                          {dv.direccionEmpresa ? ` — ${dv.direccionEmpresa}` : ""}
                        </p>
                      </div>
                      <div className="bg-[#F4F6FA] rounded-lg px-2.5 py-2 col-span-2">
                        <p className="text-[9px] font-bold text-[#98989A] uppercase">Tipo visita · Vehículo · NIT</p>
                        <p className="font-semibold text-gray-700 line-clamp-2">
                          {[dv.tipoVisita, dv.tipoVehiculo, dv.nit].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </div>
                      {dv.observaciones ? (
                        <div className="bg-[#F4F6FA] rounded-lg px-2.5 py-2 col-span-2">
                          <p className="text-[9px] font-bold text-[#98989A] uppercase">Observaciones</p>
                          <p className="text-gray-700 line-clamp-3">{dv.observaciones}</p>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-[#98989A] uppercase tracking-wide mb-2">Tareas (checklist del asesor)</p>
                      <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {tareas.map((t, idx) => (
                          <li key={idx} className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2">
                            <input
                              type="checkbox"
                              checked={!!t?.done}
                              disabled
                              className="mt-1 rounded border-gray-300 text-[#1C355E] focus:ring-[#1C355E]"
                              title="Solo el asesor puede marcar esta tarea"
                            />
                            <span className={`text-sm flex-1 ${t?.done ? "text-gray-400 line-through" : "text-gray-800"}`}>
                              {t?.texto || "—"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 pt-1 mt-auto border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          setAlertMsg("");
                          setSelectedVisita(v);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white text-[#1C355E] text-xs font-bold hover:bg-gray-50"
                      >
                        <EyeIcon />
                        Ver visita completa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-[#98989A] text-center pb-4">
            Mostrando {filteredVisitas.length} visita{filteredVisitas.length !== 1 ? "s" : ""} con tareas · {visitasConTareas.length}{" "}
            en total
          </p>
        </div>
      </main>
    </LayoutDashboard>
  );
}
