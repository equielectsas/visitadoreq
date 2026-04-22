"use client";

import { useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

export default function CitasAsesorPage() {

  // 📌 Estado principal
  const [citas, setCitas] = useState([]);

  const [form, setForm] = useState({
    cliente: "",
    telefono: "",
    fecha: "",
    estado: "pendiente",
  });

  const [filtro, setFiltro] = useState("todos");

  // ➕ CREAR CITA
  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevaCita = {
      id: Date.now(),
      ...form,
      estado: "pendiente", // 🔥 SIEMPRE inicia pendiente
    };

    setCitas([...citas, nuevaCita]);

    setForm({
      cliente: "",
      telefono: "",
      fecha: "",
      estado: "pendiente",
    });
  };

  // 🔄 CAMBIAR ESTADO
  const cambiarEstado = (id, nuevoEstado) => {
    setCitas(
      citas.map((c) =>
        c.id === id ? { ...c, estado: nuevoEstado } : c
      )
    );
  };

  // ❌ ELIMINAR
  const eliminar = (id) => {
    setCitas(citas.filter((c) => c.id !== id));
  };

  // 🔍 FILTRO
  const citasFiltradas =
    filtro === "todos"
      ? citas
      : citas.filter((c) => c.estado === filtro);

  return (
    <LayoutDashboard>

      <h1 className="text-2xl font-bold mb-6">Mis Citas</h1>

      {/* 🔘 FILTROS */}
      <div className="flex gap-2 mb-6">
        {["todos", "pendiente", "realizada", "perdida"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1 rounded ${
              filtro === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 🧾 FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        <input
          placeholder="Cliente"
          value={form.cliente}
          onChange={(e) =>
            setForm({ ...form, cliente: e.target.value })
          }
          className="border p-2 rounded"
          required
        />

        <input
          placeholder="Teléfono"
          value={form.telefono}
          onChange={(e) =>
            setForm({ ...form, telefono: e.target.value })
          }
          className="border p-2 rounded"
          required
        />

        <input
          type="date"
          value={form.fecha}g
          onChange={(e) =>
            setForm({ ...form, fecha: e.target.value })
          }
          className="border p-2 rounded"
          required
        />

        <button className="bg-yellow-400 font-bold rounded">
          Crear Cita
        </button>
      </form>

      {/* 📊 TABLA */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {citasFiltradas.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-3">{c.cliente}</td>
                <td className="p-3">{c.telefono}</td>
                <td className="p-3">{c.fecha}</td>

                <td className="p-3 capitalize">
                  {c.estado}
                </td>

                <td className="p-3 flex gap-2 flex-wrap">

                  {c.estado === "pendiente" && (
                    <>
                      <button
                        onClick={() =>
                          cambiarEstado(c.id, "realizada")
                        }
                        className="bg-green-500 text-white px-2 rounded"
                      >
                        ✔
                      </button>

                      <button
                        onClick={() =>
                          cambiarEstado(c.id, "perdida")
                        }
                        className="bg-red-500 text-white px-2 rounded"
                      >
                        ✖
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => eliminar(c.id)}
                    className="bg-gray-400 text-white px-2 rounded"
                  >
                    🗑
                  </button>

                </td>
              </tr>
            ))}

            {citasFiltradas.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No hay citas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </LayoutDashboard>
  );
}