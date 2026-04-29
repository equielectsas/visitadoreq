"use client";
import VisitaDetalle from "@/modules/visitas/components/VisitaDetalle";
import { useEffect, useState } from "react";
import LayoutDashboard from "../../../../components/LayoutDashboard";
import {
  getVisitas,
  createVisita,
} from "@/modules/visitas/services/visitas.service";

export default function VisitasPage() {

  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [empresa, setEmpresa] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fecha, setFecha] = useState("");

  const [selected, setSelected] = useState(null);

useEffect(() => {
  loadVisita();
}, [loadVisita]);

  const loadVisitas = async () => {
    const data = await getVisitas();
    setVisitas(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!empresa || !direccion || !fecha) return;

    await createVisita({
      empresa,
      direccion,
      fecha_programada: fecha,
    });

    setEmpresa("");
    setDireccion("");
    setFecha("");
    setShowForm(false);

    loadVisitas();
  };

  return (
    <LayoutDashboard>

      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Gestión de Visitas</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-[#FFCD00] px-4 py-2 rounded text-sm font-semibold"
        >
          + Nueva Visita
        </button>
      </div>

      {/* FORM CREAR */}
      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">

          <h2 className="text-sm font-semibold mb-3">
            Crear nueva visita
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="text"
              placeholder="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="datetime-local"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="border p-2 rounded"
            />

          </div>

          <button
            onClick={handleCreate}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            Guardar visita
          </button>

        </div>
      )}

      {/* CONTENIDO */}
      <div className="grid grid-cols-2 gap-6">

        {/* LISTADO */}
        <div className="bg-white rounded-xl shadow">

          {loading && <p className="p-4">Cargando...</p>}

          {!loading && visitas.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelected(v)}
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
            >
              <p className="font-medium">{v.empresa}</p>
              <p className="text-xs text-gray-400">
                {new Date(v.fecha_programada).toLocaleString()}
              </p>
              <span className="text-xs bg-yellow-100 px-2 py-1 rounded">
                {v.estado}
              </span>
            </div>
          ))}

        </div>

        {/* DETALLE */}
        <div className="bg-white rounded-xl shadow p-4">

          {!selected && (
            <p className="text-sm text-gray-400">
              Selecciona una visita
            </p>
          )}

          {selected && (
            <VisitaDetalle visita={selected} refresh={loadVisitas} />
          )}

        </div>

      </div>

    </LayoutDashboard>
  );
}