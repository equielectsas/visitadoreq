"use client";

import { useSearchParams } from "next/navigation";
import LayoutDashboard from "@/components/LayoutDashboard";
import { useState } from "react";

export default function CitasPage() {
  const searchParams = useSearchParams();
  const estado = searchParams.get("estado") || "todas";

  // 🔥 Estado real (luego aquí irá backend)
  const [citas, setCitas] = useState([]);

  // 🔍 Filtrar por estado
  const citasFiltradas =
    estado === "todas"
      ? citas
      : citas.filter((c) => c.estado === estado);

  return (
    <LayoutDashboard>
      <h1 className="text-3xl font-bold mb-6 capitalize">
        Citas {estado}
      </h1>

      {/* 🔥 RESUMEN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <Card title="Activas" value={citas.filter(c => c.estado === "activa").length} />
        <Card title="Pendientes" value={citas.filter(c => c.estado === "pendiente").length} />
        <Card title="Realizadas" value={citas.filter(c => c.estado === "realizada").length} />
        <Card title="Perdidas" value={citas.filter(c => c.estado === "perdida").length} />

      </div>

      {/* 📊 TABLA */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--color-secondary)] text-white">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>

          <tbody>
            {citasFiltradas.length > 0 ? (
              citasFiltradas.map((cita, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3">{cita.cliente}</td>
                  <td className="p-3">{cita.fecha}</td>
                  <td className="p-3 capitalize">{cita.estado}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-500">
                  No hay citas aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </LayoutDashboard>
  );
}

// 🧩 Card reutilizable
function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-[var(--color-secondary)]">
        {value}
      </p>
    </div>
  );
}