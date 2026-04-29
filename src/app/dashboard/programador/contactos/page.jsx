"use client";

import { useEffect, useState, useCallback } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

const PAGE_SIZE = 15;
const LIMIT = 200;

export default function Clientes() {
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 FETCH CLIENTES (PAGINADO DESDE BACKEND)
  const fetchClientes = useCallback(async (offset = 0, accum = []) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `/api/clientes?limit=${LIMIT}&offset=${offset}`,
        {
          headers: {
  Authorization: `Bearer ${token}`,
}
        }
      );

      if (!res.ok) throw new Error("Error al obtener clientes");

      const data = await res.json();

      const lista = Array.isArray(data)
        ? data
        : data.clientes ?? data.data ?? [];

      const total = [...accum, ...lista];

      setAllData(total);
      setFiltered(total);

      // 🔁 PAGINACIÓN AUTOMÁTICA
      if (lista.length === LIMIT) {
        fetchClientes(offset + LIMIT, total);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes(0, []);
  }, [fetchClientes]);

  // 🔍 FILTRO
  useEffect(() => {
    const term = search.toLowerCase();

    const result = term
      ? allData.filter(
          (c) =>
            (c.nit ?? "").toLowerCase().includes(term) ||
            (c.razonSocial ?? "").toLowerCase().includes(term)
        )
      : [...allData];

    setFiltered(result);
    setPage(1);
  }, [search, allData]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const slice = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const activos = allData.filter(
    (c) =>
      (c.estado ?? "").toString() === "1" ||
      (c.estado ?? "").toString().toLowerCase() === "activo"
  ).length;

  return (
    <LayoutDashboard>
      {/* HEADER */}
      <div className="flex justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-800">Contactos</h1>
          <p className="text-sm text-gray-500">
            Directorio de contactos
          </p>
        </div>

        <input
          type="text"
          placeholder="Buscar por NIT o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-72"
        />
      </div>

      {/* RESUMEN */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card label="Total contactos" value={allData.length} loading={loading} />
        <Card label="Activos" value={activos} loading={loading} />
        <Card label="Resultados" value={filtered.length} loading={loading} />
      </div>

      {/* TABLA */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {error && (
          <div className="p-4 text-red-600 bg-red-50">{error}</div>
        )}

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["NIT", "Nombre", "Ciudad", "Teléfono", "Estado"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-xs text-gray-400 border-b"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && slice.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  Cargando contactos...
                </td>
              </tr>
            ) : slice.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  No se encontraron contactos
                </td>
              </tr>
            ) : (
              slice.map((c, i) => {
                // 🔥 NORMALIZACIÓN DE DATOS (CLAVE)
                const nit = c.nit ?? "—";

                const nombre =
                  c.razonSocial ||
                  c.nombre ||
                  c.NOMBRE ||
                  `Cliente ${c.nit}`;

                const ciudad =
                  c.nombreCiudad ||
                  c.ciudad ||
                  c.CIUDAD ||
                  "Sin ciudad";

                const tel =
                  c.telefono ||
                  c.TELEFONO ||
                  c.Telefonos?.[0]?.numero ||
                  "—";

                const activo =
                  (c.estado ?? "").toString() === "1" ||
                  (c.estado ?? "").toString().toLowerCase() === "activo";

                return (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs">{nit}</td>
                    <td className="px-4 py-2">{nombre}</td>
                    <td className="px-4 py-2">{ciudad}</td>
                    <td className="px-4 py-2">{tel}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          activo
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        <div className="flex justify-between p-3 text-xs">
          <span>
            {filtered.length > 0
              ? `Mostrando ${(page - 1) * PAGE_SIZE + 1} - ${Math.min(
                  page * PAGE_SIZE,
                  filtered.length
                )} de ${filtered.length}`
              : "Sin resultados"}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ←
            </button>

            <span>
              {page} / {totalPages || 1}
            </span>

            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages || 1, p + 1))
              }
              disabled={page >= totalPages}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}

// 🔹 COMPONENTE CARD
function Card({ label, value, loading }) {
  return (
    <div className="bg-white p-4 border rounded-lg">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-medium">
        {loading ? "..." : value}
      </p>
    </div>
  );
}