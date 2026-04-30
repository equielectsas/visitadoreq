"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

const PAGE_SIZE = 20;

export default function Clientes() {
  const [data, setData] = useState({ clientes: [], total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // { total, erp, manual, ultimaSync }
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const pollingRef = useRef(null);

  // Debounce del search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch clientes desde MongoDB local
  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        ...(source && { source }),
      });
      const res = await fetch(`/api/clientes?${params}`, { headers: { Authorization: token } });
      if (!res.ok) throw new Error("Error al obtener clientes");
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, source]);

  // Fetch status de sync
  const fetchSyncStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/clientes/sync/status", { headers: { Authorization: token } });
      if (res.ok) setSyncStatus(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);
  useEffect(() => { fetchSyncStatus(); }, [fetchSyncStatus]);

  // Polling mientras sincroniza — cada 3s revisa si el total creció
  const startPolling = useCallback(() => {
    pollingRef.current = setInterval(async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/clientes/sync/status", { headers: { Authorization: token } });
        if (!res.ok) {
          // Si el endpoint falla, no te quedes spameando para siempre
          clearInterval(pollingRef.current);
          setSyncing(false);
          return;
        }
        const st = await res.json();
        setSyncStatus(st);
        // Termina cuando el backend marque running=false
        if (st.running === false) {
          clearInterval(pollingRef.current);
          setSyncing(false);
          fetchClientes();
        }
      } catch {}
    }, 3000);
  }, [syncStatus, fetchClientes]);

  const handleSync = async () => {
    if (!confirm("¿Iniciar sincronización con el ERP?\n\nCorrerá en segundo plano. Puedes seguir usando la app.")) return;
    setSyncing(true);
    // Empezar a observar de inmediato (el backend responde 202 y corre async)
    startPolling();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/clientes/sync/erp", { method: "POST", headers: { Authorization: token } });
      // Si responde 409 (ya hay una en curso) seguimos polling igual
      if (!res.ok && res.status !== 409) throw new Error("No se pudo iniciar la sincronización");
    } catch (err) {
      setSyncing(false);
      alert("Error iniciando sync: " + err.message);
    }
  };

  useEffect(() => () => clearInterval(pollingRef.current), []);

  const badge = (source, isProspect) => {
    if (isProspect) return { text: "Prospecto", cls: "bg-amber-100 text-amber-700" };
    if (source === "ERP") return { text: "ERP", cls: "bg-blue-100 text-blue-700" };
    return { text: "Manual", cls: "bg-violet-100 text-violet-700" };
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : null;

  return (
    <LayoutDashboard>
      {/* HEADER */}
      <div className="flex justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-400">
            {syncStatus
              ? `${syncStatus.total.toLocaleString()} registros · ERP: ${syncStatus.erp.toLocaleString()} · Manuales: ${syncStatus.manual.toLocaleString()}${syncStatus.ultimaSync ? ` · Última sync: ${fmtDate(syncStatus.ultimaSync)}` : ""}`
              : "Cargando estadísticas..."}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
            + Nuevo cliente
          </button>
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {syncing ? (
              <><span className="animate-spin">↻</span> Sincronizando...</>
            ) : (
              <>↻ Sincronizar ERP</>
            )}
          </button>
        </div>
      </div>

      {/* BANNER SINCRONIZANDO */}
      {syncing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-center gap-2">
          <span className="animate-spin text-lg">⟳</span>
          <span>
            Sincronización en curso en segundo plano — puedes seguir usando la app.
            {syncStatus && <> Total actual: <b>{syncStatus.total.toLocaleString()}</b></>}
          </span>
        </div>
      )}

      {/* FILTROS */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input type="text" placeholder="Buscar por NIT, nombre, ciudad o dirección..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Todos los orígenes</option>
          <option value="ERP">Solo ERP</option>
          <option value="MANUAL">Solo manuales</option>
        </select>
      </div>

      {/* TABLA */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {error && <div className="p-4 text-red-600 bg-red-50 text-sm">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Identificación", "Razón Social / Sede", "Ciudad", "Dirección", "Teléfono", "Origen"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Cargando...</td></tr>
              ) : data.clientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    {debouncedSearch
                      ? `Sin resultados para "${debouncedSearch}"`
                      : "Sin clientes. Sincroniza el ERP o crea uno manualmente."}
                  </td>
                </tr>
              ) : (
                data.clientes.map((c) => {
                  const b = badge(c.source, c.isProspect);
                  return (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {c.identificacion || "—"}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="font-medium text-gray-800 truncate">
                          {c.razonSocial || `Cliente ${c.identificacion}`}
                        </div>
                        {c.nombrePunto && (
                          <div className="text-xs text-gray-400 truncate">{c.nombrePunto}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {c.ciudad || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px]">
                        <span className="truncate block" title={c.direccion}>
                          {c.direccion || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {c.telefono || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${b.cls}`}>
                          {b.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="flex justify-between items-center px-4 py-3 border-t text-xs text-gray-400">
          <span>
            {data.total > 0
              ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, data.total)} de ${data.total.toLocaleString()}`
              : "Sin resultados"}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="disabled:opacity-30 hover:text-gray-700">← Anterior</button>
            <span className="font-medium text-gray-600">{page} / {data.pages || 1}</span>
            <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages}
              className="disabled:opacity-30 hover:text-gray-700">Siguiente →</button>
          </div>
        </div>
      </div>

      {showModal && (
        <NuevoClienteModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchClientes(); fetchSyncStatus(); }}
        />
      )}
    </LayoutDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────
// MODAL NUEVO CLIENTE
// ──────────────────────────────────────────────────────────────────
function NuevoClienteModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ identificacion: "", tipoDocumento: "CC", razonSocial: "", nombrePunto: "", ciudad: "", direccion: "", telefono: "" });
  const [alerta, setAlerta] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setAlerta(null); };

  const verificar = async () => {
    if (!form.identificacion.trim()) return;
    setVerificando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/clientes/verificar/${form.identificacion.trim()}`, { headers: { Authorization: token } });
      const json = await res.json();
      if (json.existeEnERP) {
        setAlerta({ tipo: "warning", mensaje: "⚠️ Este cliente ya existe en el ERP con las siguientes sedes:", sedes: json.sedesERP });
      } else if (json.prospectos?.length > 0) {
        setAlerta({ tipo: "info", mensaje: "ℹ️ Ya hay un prospecto con esta identificación.", sedes: [] });
      }
    } catch {}
    setVerificando(false);
  };

  const guardar = async () => {
    if (!form.identificacion.trim()) { setAlerta({ tipo: "error", mensaje: "La identificación es obligatoria." }); return; }
    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.status === 409) {
        setAlerta({ tipo: "warning", mensaje: json.message, sedes: json.sedesExistentes || json.datos || [] });
        return;
      }
      if (!res.ok) throw new Error(json.message);
      onCreated();
    } catch (err) {
      setAlerta({ tipo: "error", mensaje: err.message });
    }
    setGuardando(false);
  };

  const alertCls = { error: "bg-red-50 text-red-700 border-red-200", warning: "bg-amber-50 text-amber-800 border-amber-200", info: "bg-blue-50 text-blue-700 border-blue-200" };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="font-semibold text-gray-800">Nuevo cliente manual</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-3">
          {alerta && (
            <div className={`p-3 rounded-lg text-sm border ${alertCls[alerta.tipo]}`}>
              <p className="font-medium">{alerta.mensaje}</p>
              {alerta.sedes?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {alerta.sedes.map((s) => (
                    <li key={s._id || s.uniqueKey} className="text-xs pl-2 border-l-2 border-current opacity-80">
                      {s.nombrePunto || s.razonSocial} — {s.ciudad} — {s.direccion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}
              className="border rounded-lg px-2 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="CC">CC</option>
              <option value="NIT">NIT</option>
              <option value="CE">CE</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
            <input name="identificacion" value={form.identificacion} onChange={handleChange} onBlur={verificar}
              placeholder="Identificación *" className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          {verificando && <p className="text-xs text-gray-400 animate-pulse">Verificando en base local y ERP...</p>}

          {[
            { name: "razonSocial", placeholder: "Razón social / Nombre completo" },
            { name: "nombrePunto", placeholder: "Nombre del punto o sede (ej: Sede Norte)" },
            { name: "ciudad", placeholder: "Ciudad" },
            { name: "direccion", placeholder: "Dirección" },
            { name: "telefono", placeholder: "Teléfono" },
          ].map((f) => (
            <input key={f.name} name={f.name} value={form[f.name]} onChange={handleChange}
              placeholder={f.placeholder}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          ))}
        </div>
        <div className="flex gap-2 p-5 border-t">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
          <button onClick={guardar} disabled={guardando}
            className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm hover:bg-gray-700 disabled:opacity-50">
            {guardando ? "Guardando..." : "Guardar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}
