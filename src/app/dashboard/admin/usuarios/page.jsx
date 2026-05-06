"use client";

import { useCallback, useEffect, useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

function getToken() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/usuarios", { headers: { Authorization: token } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      const list = Array.isArray(data?.usuarios) ? data.usuarios : [];
      setUsuarios(list);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar los usuarios.");
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      String(u.cedula).includes(busqueda.trim()) ||
      String(u.nombre || "")
        .toLowerCase()
        .includes(q) ||
      String(u.rol || "")
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <LayoutDashboard>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registros en la colección <code className="text-xs bg-gray-100 px-1 rounded">usuario</code> (MongoDB).
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Buscar por cédula, nombre o rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
          />
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#1C355E] text-white text-sm font-bold disabled:opacity-50"
          >
            {loading ? "Cargando…" : "Actualizar"}
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs font-black text-gray-600 uppercase tracking-wide">
                  <th className="px-4 py-3">Cédula</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-gray-400">
                      Cargando…
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-gray-400">
                      No hay usuarios para mostrar.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.cedula}</td>
                      <td className="px-4 py-3 text-gray-700">{u.nombre || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 rounded-lg text-xs font-semibold bg-[#1C355E]/10 text-[#1C355E]">
                          {u.rol || "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
