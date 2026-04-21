"use client";

import { useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

export default function DesarrolladorDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <LayoutDashboard>

      {/* HEADER */}
      <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard</h2>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full bg-gray-300"
          />

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow rounded">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Cuenta
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Soporte
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className="p-6 flex-1">

        <h1 className="text-2xl font-bold mb-6">
          Panel del Desarrollador
        </h1>

        {/* CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white p-6 rounded shadow">
            <p className="font-semibold mb-4">Reportes Mensuales</p>
            <div className="h-40 flex items-center justify-center text-gray-400">
              Gráfica aquí
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <p className="font-semibold mb-4">Reportes Resueltos</p>
            <div className="h-40 flex items-center justify-center text-gray-400">
              Gráfica aquí
            </div>
          </div>

        </div>

        {/* TABLA */}
        <div className="mt-10 bg-white shadow rounded overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-secondary)] text-white">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Apellido</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3">Email</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                <td className="p-3">Juan</td>
                <td className="p-3">Pérez</td>
                <td className="p-3">3001234567</td>
                <td className="p-3">juan@mail.com</td>
              </tr>

              <tr className="bg-gray-100 border-b">
                <td className="p-3">Ana</td>
                <td className="p-3">Gómez</td>
                <td className="p-3">3019876543</td>
                <td className="p-3">ana@mail.com</td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white text-right p-4 text-sm text-gray-500">
        Dashboard interno
      </footer>

    </LayoutDashboard>
  );
}