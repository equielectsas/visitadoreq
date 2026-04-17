"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LayoutDashboard from "@/app/components/LayoutDashboard";
import { getVisitaById } from "@/modules/visitas/services/visitas.service";

export default function VisitaDetallePage() {

  const { id } = useParams();

  const [visita, setVisita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) loadVisita();
  }, [id]);

  const loadVisita = async () => {
    try {
      setLoading(true);
      const data = await getVisitaById(id);
      setVisita(data);
    } catch (err) {
      setError("No se pudo cargar la visita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutDashboard>

      <h1 className="text-xl font-semibold mb-6">
        Detalle de Visita
      </h1>

      {/* LOADING */}
      {loading && (
        <p className="text-sm text-gray-500">Cargando visita...</p>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* CONTENIDO */}
      {!loading && visita && (
        <div className="grid grid-cols-2 gap-6">

          {/* INFO */}
          <div className="bg-white rounded-xl shadow p-5 space-y-4">

            <h2 className="font-semibold text-gray-700">
              {visita.empresa}
            </h2>

            <div className="text-sm text-gray-500">
              📍 {visita.direccion}
            </div>

            <div className="text-sm text-gray-500">
              🕒 {new Date(visita.fecha_programada).toLocaleString()}
            </div>

            <div>
              <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                {visita.estado}
              </span>
            </div>

          </div>

          {/* ACCIONES */}
          <div className="bg-white rounded-xl shadow p-5 space-y-4">

            <h3 className="font-semibold text-gray-700">
              Acciones de Visita
            </h3>

            <button className="w-full bg-gray-200 py-2 rounded text-sm">
              Obtener ubicación GPS
            </button>

            <button className="w-full bg-gray-200 py-2 rounded text-sm">
              Subir foto de evidencia
            </button>

            <button className="w-full bg-blue-600 text-white py-2 rounded text-sm">
              Completar visita
            </button>

          </div>

        </div>
      )}

    </LayoutDashboard>
  );
}