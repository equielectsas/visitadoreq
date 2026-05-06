"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function TareasAsesor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [visitas, setVisitas] = useState([]);
  const [draftByVisita, setDraftByVisita] = useState({});
  const [filterEstado, setFilterEstado] = useState("todas");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const v = await fetchVisitas();
        if (!mounted) return;
        setVisitas(v);
        const init = {};
        for (const it of v) init[it._id] = it?.datosVisita?.tareasPendientes || [];
        setDraftByVisita(init);
      } catch (e) {
        if (mounted) setError(e?.message || "No se pudieron cargar las tareas.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
    } catch (e) {
      setError(e?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutDashboard>
      <main className="flex-1 bg-[#F4F6FA] p-4 sm:p-6 md:p-8 min-h-screen">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest mb-0.5">Mi Panel</p>
            <h1 className="text-2xl font-black text-[#1C355E] leading-tight">Tareas</h1>
            <p className="text-xs text-[#98989A] mt-1">Se cargan desde Mongo (visitas.datosVisita.tareasPendientes)</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
            {[
              { key: "todas", label: "Todas" },
              { key: "pendientes", label: "Pendientes" },
              { key: "completadas", label: "Completadas" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterEstado(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterEstado === t.key ? "bg-[#1C355E] text-white" : "text-[#98989A] hover:text-[#1C355E]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-[#98989A] uppercase tracking-widest">Total tareas</p>
            <p className="text-3xl font-black text-[#1C355E]">{flatTasks.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-[#98989A] uppercase tracking-widest">Pendientes</p>
            <p className="text-3xl font-black text-[#1C355E]">{pendientes}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-[#98989A] uppercase tracking-widest">Completadas</p>
            <p className="text-3xl font-black text-[#1C355E]">{completadas}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-[#98989A] uppercase tracking-widest">Visitas</p>
            <p className="text-3xl font-black text-[#1C355E]">{visitas.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-400">Cargando…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">No hay tareas con este filtro.</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-xs font-black text-gray-600 uppercase tracking-wide">
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Tarea</th>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Visita</th>
                    <th className="px-4 py-3">Guardar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((t) => (
                    <tr key={t.key} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 font-semibold text-gray-800">{t.texto || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="font-semibold">{t.empresa}</div>
                        <div className="text-xs text-gray-400">NIT {t.nit}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{t.fecha}</td>
                      <td className="px-4 py-3 text-gray-700">{t.estadoVisita}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => guardarVisita(t.visitaId)}
                          className="px-3 py-2 rounded-xl bg-[#1C355E] text-white text-xs font-bold disabled:opacity-50"
                        >
                          Guardar visita
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
    </LayoutDashboard>
  );
}

