"use client";

import { useEffect, useState } from "react";
import LayoutDashboard from "@/app/components/LayoutDashboard";
import { getVisitas } from "@/modules/visitas/services/visitas.service";

export default function DashboardAsesor() {

  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisitas();
  }, []);

  const loadVisitas = async () => {
    try {
      const data = await getVisitas();
      setVisitas(data);
    } catch (error) {
      console.error("Error cargando visitas", error);
    } finally {
      setLoading(false);
    }
  };

  // 📊 MÉTRICAS REALES
  const hoy = new Date().toDateString();

  const visitasHoy = visitas.filter(
    (v) => new Date(v.fecha_programada).toDateString() === hoy
  );

  const completadas = visitas.filter((v) => v.estado === "COMPLETADA");
  const pendientes = visitas.filter((v) => v.estado === "PROGRAMADA");

  return (
    <LayoutDashboard>

      <h1 className="text-xl font-semibold mb-6">
        Dashboard Asesor
      </h1>

      {loading && (
        <p className="text-sm text-gray-500">Cargando información...</p>
      )}

      {!loading && (
        <div className="space-y-6">

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-xs text-gray-400">Visitas hoy</p>
              <h2 className="text-xl font-semibold">
                {visitasHoy.length}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-xs text-gray-400">Completadas</p>
              <h2 className="text-xl font-semibold text-green-600">
                {completadas.length}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-xs text-gray-400">Pendientes</p>
              <h2 className="text-xl font-semibold text-yellow-600">
                {pendientes.length}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-xs text-gray-400">Total</p>
              <h2 className="text-xl font-semibold">
                {visitas.length}
              </h2>
            </div>

          </div>

          {/* AGENDA DEL DÍA */}
          <div className="bg-white rounded-xl shadow">

            <div className="p-4 border-b">
              <h2 className="text-sm font-semibold text-gray-700">
                Agenda de hoy
              </h2>
            </div>

            <div className="divide-y">

              {visitasHoy.length === 0 && (
                <div className="p-4 text-sm text-gray-500">
                  No tienes visitas hoy
                </div>
              )}

              {visitasHoy.map((v) => (
                <div
                  key={v.id}
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {v.empresa}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(v.fecha_programada).toLocaleTimeString()}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                    {v.estado}
                  </span>
                </div>
              ))}

            </div>

          </div>

          {/* ALERTAS */}
          <div className="bg-white rounded-xl shadow p-4">

            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Alertas
            </h2>

            {pendientes.length > 0 ? (
              <div className="text-sm text-yellow-600">
                Tienes {pendientes.length} visitas pendientes por completar
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                No hay alertas activas
              </div>
            )}

          </div>

        </div>
      )}

    </LayoutDashboard>
  );
}