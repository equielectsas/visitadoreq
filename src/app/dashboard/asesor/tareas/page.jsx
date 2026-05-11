"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";
import VisualizarVisitaModal from "@/components/VisualizarVisitaModal";

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
  return Array.isArray(data?.visitas) ? data.visitas : [];
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

function cloneTareas(arr) {
  return Array.isArray(arr) ? arr.map((t) => ({ ...t })) : [];
}

function tareasDirty(server, draft) {
  return JSON.stringify(server || []) !== JSON.stringify(draft || []);
}

export default function TareasAsesor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [visitas, setVisitas] = useState([]);
  const [draftByVisita, setDraftByVisita] = useState({});
  const [serverByVisita, setServerByVisita] = useState({});
  const [filterEstado, setFilterEstado] = useState("todas");
  const [modalVisitaId, setModalVisitaId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const v = await fetchVisitas();
      setVisitas(v);
      const init = {};
      const server = {};
      for (const it of v) {
        const t = cloneTareas(it?.datosVisita?.tareasPendientes);
        init[it._id] = t;
        server[it._id] = cloneTareas(t);
      }
      setDraftByVisita(init);
      setServerByVisita(server);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las tareas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const flatTasks = useMemo(() => {
    const rows = [];
    for (const v of visitas) {
      const tareas = draftByVisita[v._id] || v?.datosVisita?.tareasPendientes || [];
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
          fecha: v?.fecha || "—",
          estadoVisita: v?.estado || "—",
        });
      }
    }
    return rows;
  }, [visitas, draftByVisita]);

  const filtered = useMemo(() => {
    if (filterEstado === "todas") return flatTasks;
    if (filterEstado === "completadas") return flatTasks.filter((t) => t.done);
    return flatTasks.filter((t) => !t.done);
  }, [flatTasks, filterEstado]);

  const pendientes = flatTasks.filter((t) => !t.done).length;
  const completadas = flatTasks.filter((t) => t.done).length;

  const modalVisita = useMemo(() => {
    if (!modalVisitaId) return null;
    const v = visitas.find((x) => String(x._id) === String(modalVisitaId));
    if (!v) return null;
    const tareas = draftByVisita[v._id] || [];
    return {
      ...v,
      datosVisita: {
        ...(v.datosVisita || {}),
        tareasPendientes: tareas,
      },
    };
  }, [modalVisitaId, visitas, draftByVisita]);

  const modalDirty = modalVisitaId
    ? tareasDirty(serverByVisita[modalVisitaId], draftByVisita[modalVisitaId])
    : false;

  const toggleTaskInModal = (idx) => {
    if (!modalVisitaId) return;
    setDraftByVisita((prev) => {
      const curr = Array.isArray(prev[modalVisitaId]) ? prev[modalVisitaId] : [];
      const next = curr.map((t, i) => (i === idx ? { ...t, done: !t.done } : t));
      return { ...prev, [modalVisitaId]: next };
    });
  };

  const guardarCambiosModal = async () => {
    if (!modalVisitaId) return;
    const tareas = draftByVisita[modalVisitaId] || [];
    setSaving(true);
    setError("");
    setOkMsg("");
    try {
      const updated = await patchTareas(modalVisitaId, tareas);
      setVisitas((prev) => prev.map((x) => (String(x._id) === String(modalVisitaId) ? { ...updated } : x)));
      const t = cloneTareas(updated?.datosVisita?.tareasPendientes || tareas);
      setDraftByVisita((prev) => ({ ...prev, [modalVisitaId]: t }));
      setServerByVisita((prev) => ({ ...prev, [modalVisitaId]: cloneTareas(t) }));
      setOkMsg("Cambios guardados.");
      setTimeout(() => setOkMsg(""), 3500);
      try {
        window.dispatchEvent(new Event("visitas-updated"));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(e?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const cerrarModal = () => {
    setModalVisitaId(null);
    setOkMsg("");
  };

  return (
    <LayoutDashboard>
      <main className="flex-1 bg-[#F4F6FA] dark:bg-transparent p-4 sm:p-6 md:p-8 min-h-screen">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold text-[#98989A] dark:text-slate-400 uppercase tracking-widest mb-0.5">Mi Panel</p>
            <h1 className="text-2xl font-black text-[#1C355E] dark:text-white leading-tight">Tareas</h1>
            <p className="text-xs text-[#98989A] dark:text-slate-400 mt-1">
              Revisa el detalle de cada visita, marca las tareas completadas y guarda los cambios.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-eqDark-surface border border-gray-200 dark:border-slate-600 rounded-xl p-1">
            {[
              { key: "todas", label: "Todas" },
              { key: "pendientes", label: "Pendientes" },
              { key: "completadas", label: "Completadas" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilterEstado(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterEstado === t.key ? "bg-[#1C355E] text-white" : "text-[#98989A] dark:text-slate-400 hover:text-[#1C355E] dark:hover:text-[#FFCD00]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-5 py-4 text-sm text-red-700 dark:text-red-200 font-semibold">
            {error}
          </div>
        )}
        {okMsg && !modalVisitaId && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 font-semibold">
            {okMsg}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-eqDark-surface rounded-2xl border border-gray-100 dark:border-slate-600 p-5">
            <p className="text-xs font-semibold text-[#98989A] dark:text-slate-400 uppercase tracking-widest">Total tareas</p>
            <p className="text-3xl font-black text-[#1C355E] dark:text-white">{flatTasks.length}</p>
          </div>
          <div className="bg-white dark:bg-eqDark-surface rounded-2xl border border-gray-100 dark:border-slate-600 p-5">
            <p className="text-xs font-semibold text-[#98989A] dark:text-slate-400 uppercase tracking-widest">Pendientes</p>
            <p className="text-3xl font-black text-[#1C355E] dark:text-white">{pendientes}</p>
          </div>
          <div className="bg-white dark:bg-eqDark-surface rounded-2xl border border-gray-100 dark:border-slate-600 p-5">
            <p className="text-xs font-semibold text-[#98989A] dark:text-slate-400 uppercase tracking-widest">Completadas</p>
            <p className="text-3xl font-black text-[#1C355E] dark:text-white">{completadas}</p>
          </div>
          <div className="bg-white dark:bg-eqDark-surface rounded-2xl border border-gray-100 dark:border-slate-600 p-5">
            <p className="text-xs font-semibold text-[#98989A] dark:text-slate-400 uppercase tracking-widest">Visitas</p>
            <p className="text-3xl font-black text-[#1C355E] dark:text-white">{visitas.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-eqDark-surface rounded-2xl border border-gray-100 dark:border-slate-600 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-400 dark:text-slate-500">Cargando…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400 dark:text-slate-500">No hay tareas con este filtro.</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#0f1c2e] border-b border-gray-100 dark:border-slate-600">
                  <tr className="text-left text-xs font-black text-gray-600 dark:text-slate-300 uppercase tracking-wide">
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Tarea</th>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Visita</th>
                    <th className="px-4 py-3">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filtered.map((t) => (
                    <tr key={t.key} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                            t.done ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-amber-100 text-amber-900 dark:bg-amber-900/35 dark:text-amber-100"
                          }`}
                        >
                          {t.done ? "Hecha" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-slate-200">{t.texto || "—"}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                        <div className="font-semibold">{t.empresa}</div>
                        <div className="text-xs text-gray-400 dark:text-slate-500">NIT {t.nit}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{t.fecha}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300 capitalize">{t.estadoVisita}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => {
                            setError("");
                            setOkMsg("");
                            setModalVisitaId(t.visitaId);
                          }}
                          className="px-3 py-2 rounded-xl bg-[#1C355E] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#16294d] transition-colors"
                        >
                          Revisar cambios
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <VisualizarVisitaModal
        show={!!modalVisita && !!modalVisitaId}
        onClose={cerrarModal}
        cita={modalVisita}
        expandDetails
        tareasEditable
        onTareaToggle={toggleTaskInModal}
        footerActions={
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end sm:items-center">
            {okMsg ? (
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 sm:mr-auto">{okMsg}</p>
            ) : null}
            <button
              type="button"
              onClick={cerrarModal}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={saving || !modalDirty}
              onClick={() => void guardarCambiosModal()}
              className="px-4 py-2.5 rounded-xl bg-[#1C355E] text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#16294d]"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        }
      />
    </LayoutDashboard>
  );
}
