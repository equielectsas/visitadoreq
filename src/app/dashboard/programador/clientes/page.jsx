"use client";

import { useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      cedula: "123456",
      nombre: "Juan Pérez",
      email: "juan@mail.com",
      activo: true,
    },
    {
      id: 2,
      cedula: "789101",
      nombre: "Ana Gómez",
      email: "ana@mail.com",
      activo: false,
    },
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    id: null,
    cedula: "",
    nombre: "",
    email: "",
    activo: true,
  });

  const [editando, setEditando] = useState(false);

  // 🔍 FILTRO
  const usuariosFiltrados = usuarios.filter((u) =>
    u.cedula.includes(busqueda) ||
    u.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ➕ CREAR / EDITAR
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editando) {
      setUsuarios(
        usuarios.map((u) => (u.id === form.id ? form : u))
      );
      setEditando(false);
    } else {
      setUsuarios([
        ...usuarios,
        { ...form, id: Date.now() },
      ]);
    }

    resetForm();
  };

  // ✏️ EDITAR
  const handleEdit = (usuario) => {
    setForm(usuario);
    setEditando(true);
  };

  // ❌ ELIMINAR
  const handleDelete = (id) => {
    if (!confirm("¿Eliminar usuario?")) return;
    setUsuarios(usuarios.filter((u) => u.id !== id));
  };

  const resetForm = () => {
    setForm({
      id: null,
      cedula: "",
      nombre: "",
      email: "",
      activo: true,
    });
  };

  return (
    <LayoutDashboard>

      <h1 className="text-3xl pb-6">Clientes</h1>

      {/* 🔍 BUSCADOR */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por NIT o nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded"
        />
      </div>

      {/* 🧾 FORMULARIO */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <input
          placeholder="Cédula"
          value={form.cedula}
          onChange={(e) =>
            setForm({ ...form, cedula: e.target.value })
          }
          className="px-3 py-2 border rounded"
          required
        />

        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) =>
            setForm({ ...form, nombre: e.target.value })
          }
          className="px-3 py-2 border rounded"
          required
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="px-3 py-2 border rounded"
          required
        />

        <select
          value={form.activo}
          onChange={(e) =>
            setForm({
              ...form,
              activo: e.target.value === "true",
            })
          }
          className="px-3 py-2 border rounded"
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>

        <button
          type="submit"
          className="col-span-1 md:col-span-4 bg-[var(--color-primary)] text-black py-2 rounded font-semibold"
        >
          {editando ? "Actualizar Cliente" : "Crear Cliente"}
        </button>
      </form>

      {/* 📊 TABLA */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--color-secondary)] text-white">
            <tr>
              <th className="p-3">Cédula</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-3">{u.cedula}</td>
                <td className="p-3">{u.nombre}</td>
                <td className="p-3">{u.email}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      u.activo
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(u.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No hay clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </LayoutDashboard>
  );
}