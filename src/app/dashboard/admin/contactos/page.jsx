"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

const PAGE_SIZE = 12;

function getToken() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}

function formatFecha(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function ContactosPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openByClient, setOpenByClient] = useState({});
  const [editModal, setEditModal] = useState({ open: false, clienteId: null, empresaNombre: "", contacto: null });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [searchDebounced]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (searchDebounced) params.set("search", searchDebounced);

      const res = await fetch(`/api/clientes/admin/con-contactos?${params.toString()}`, {
        headers: { Authorization: token },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Error al cargar contactos");
      }

      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch (err) {
      setError(err.message);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, searchDebounced]);

  const updateContacto = useCallback(async ({ clienteId, contactoId, patch }) => {
    const token = getToken();
    const res = await fetch(`/api/clientes/${encodeURIComponent(clienteId)}/contactos/${encodeURIComponent(contactoId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(patch || {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
    return data;
  }, []);

  const handleDelete = useCallback(
    async ({ clienteId, contactoId, nombre }) => {
      const ok = window.confirm(`¿Eliminar (desactivar) el contacto "${nombre || "—"}"?`);
      if (!ok) return;
      try {
        await updateContacto({ clienteId, contactoId, patch: { isActive: false } });
        await load();
      } catch (e) {
        setError(e?.message || "No se pudo eliminar el contacto.");
      }
    },
    [load, updateContacto]
  );

  const openEdit = useCallback((empresa, ct) => {
    setEditModal({
      open: true,
      clienteId: empresa.clienteId,
      empresaNombre: empresa.empresaNombre || "",
      contacto: { ...ct },
    });
  }, []);

  const closeEdit = useCallback(() => {
    setEditModal({ open: false, clienteId: null, empresaNombre: "", contacto: null });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const totalContactosPagina = useMemo(
    () => items.reduce((acc, c) => acc + (Array.isArray(c.contactos) ? c.contactos.length : 0), 0),
    [items]
  );

  const totalEmpresasPagina = items.length;

  return (
    <LayoutDashboard>
      {editModal.open && editModal.contacto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={savingEdit ? undefined : closeEdit} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 font-semibold">Editar contacto</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">
                {editModal.contacto.nombre || "Contacto"}{" "}
                <span className="text-gray-400 font-semibold">·</span>{" "}
                <span className="text-gray-600 font-semibold">{editModal.empresaNombre || "Empresa"}</span>
              </p>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "nombre", label: "Nombre", type: "text", required: true },
                { key: "cargo", label: "Cargo", type: "text" },
                { key: "profesion", label: "Profesión", type: "text" },
                { key: "telefono", label: "Teléfono", type: "text" },
                { key: "email", label: "Correo", type: "email" },
              ].map((f) => (
                <div key={f.key} className={f.key === "nombre" ? "sm:col-span-2" : ""}>
                  <label className="text-[11px] font-semibold text-gray-500">{f.label}</label>
                  <input
                    type={f.type}
                    value={editModal.contacto?.[f.key] || ""}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        contacto: { ...prev.contacto, [f.key]: e.target.value },
                      }))
                    }
                    className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                    disabled={savingEdit}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-gray-500">Notas</label>
                <textarea
                  value={editModal.contacto?.notas || ""}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      contacto: { ...prev.contacto, notas: e.target.value },
                    }))
                  }
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm min-h-[90px]"
                  disabled={savingEdit}
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const nombre = String(editModal.contacto?.nombre || "").trim();
                  if (!nombre) {
                    setError("El nombre del contacto es obligatorio.");
                    return;
                  }
                  setSavingEdit(true);
                  try {
                    await updateContacto({
                      clienteId: editModal.clienteId,
                      contactoId: editModal.contacto.id,
                      patch: {
                        nombre,
                        cargo: editModal.contacto.cargo,
                        profesion: editModal.contacto.profesion,
                        telefono: editModal.contacto.telefono,
                        email: editModal.contacto.email,
                        notas: editModal.contacto.notas,
                      },
                    });
                    closeEdit();
                    await load();
                  } catch (e) {
                    setError(e?.message || "No se pudo guardar el contacto.");
                  } finally {
                    setSavingEdit(false);
                  }
                }}
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl bg-[#1C355E] hover:bg-[#16294d] text-white text-sm font-bold disabled:opacity-60"
              >
                {savingEdit ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-800">Contactos · Empresas con encargados</h1>
          <p className="text-sm text-gray-500">
            Empresas que tienen contactos guardados por los asesores. Dentro de cada empresa verás sus encargados (cargo y datos).
          </p>
        </div>

        <input
          type="text"
          placeholder="Buscar por empresa, NIT o por el nombre/cargo del contacto…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-full max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Card label="Empresas con contactos" value={total} loading={loading} />
        <Card
          label="Empresas (esta página)"
          value={loading ? "…" : totalEmpresasPagina}
          loading={loading}
        />
        <Card label="Contactos (esta página)" value={loading ? "…" : totalContactosPagina} loading={loading} />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        {error && <div className="p-4 text-red-600 bg-red-50 text-sm font-medium">{error}</div>}

        {loading && items.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">Cargando empresas con contactos…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            {searchDebounced
              ? "No hay coincidencias con la búsqueda."
              : "Aún no hay contactos registrados por los asesores en ninguna empresa."}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.filter((c) => (c?.contactos?.length || 0) > 0).map((c) => {
              const isOpen = Boolean(openByClient[c.clienteId]);
              const contactos = Array.isArray(c.contactos) ? c.contactos : [];
              return (
                <div key={c.clienteId} className="p-4">
                  <button
                    type="button"
                    className="w-full flex items-start justify-between gap-3 text-left"
                    onClick={() =>
                      setOpenByClient((prev) => ({ ...prev, [c.clienteId]: !Boolean(prev[c.clienteId]) }))
                    }
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{c.empresaNombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="font-mono">{c.empresaNit || "—"}</span>
                        {c.empresaCiudad ? ` · ${c.empresaCiudad}` : ""}
                        {c.empresaDireccion ? ` · ${c.empresaDireccion}` : ""}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {contactos.length} contacto{contactos.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-600 flex-shrink-0">
                      {isOpen ? "Ocultar" : "Ver"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm min-w-[700px] border border-gray-100 rounded-xl overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            {["Nombre", "Cargo", "Teléfono", "Correo", "Registro", "Acciones"].map((h) => (
                              <th key={h} className="px-3 py-2 text-left text-xs text-gray-400 border-b font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {contactos.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-3 py-6 text-center text-gray-500 text-sm">
                                No hay contactos activos en esta empresa.
                              </td>
                            </tr>
                          ) : (
                            contactos.map((ct) => {
                              const cargoParts = [ct.cargo, ct.profesion].filter(Boolean).join(" · ");
                              return (
                                <tr key={ct.id} className="border-b border-gray-100 last:border-b-0">
                                  <td className="px-3 py-2 font-semibold text-gray-900">{ct.nombre || "—"}</td>
                                  <td className="px-3 py-2 text-gray-700 max-w-[240px]">
                                    {cargoParts || "—"}
                                    {ct.notas ? (
                                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-2" title={ct.notas}>
                                        {ct.notas}
                                      </p>
                                    ) : null}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-xs text-gray-800 whitespace-nowrap">
                                    {(ct.telefono || "").trim() || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-600 break-all max-w-[200px]">
                                    {(ct.email || "").trim() || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                                    {formatFecha(ct.createdAt)}
                                  </td>
                                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        className="px-2 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                                        onClick={() => openEdit(c, ct)}
                                        disabled={loading || savingEdit}
                                      >
                                        Editar
                                      </button>
                                      <button
                                        type="button"
                                        className="px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                                        onClick={() =>
                                          handleDelete({
                                            clienteId: c.clienteId,
                                            contactoId: ct.id,
                                            nombre: ct.nombre,
                                          })
                                        }
                                        disabled={loading || savingEdit}
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center gap-2 p-3 text-xs text-gray-600 border-t border-gray-100">
          <span>
            {total > 0
              ? `Mostrando ${(page - 1) * PAGE_SIZE + 1} – ${Math.min(page * PAGE_SIZE, total)} de ${total}`
              : "Sin resultados"}
          </span>

          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              ←
            </button>
            <span className="tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}

function Card({ label, value, loading }) {
  return (
    <div className="bg-white p-4 border rounded-lg">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-medium tabular-nums">{loading && value !== "…" ? "…" : value}</p>
    </div>
  );
}
