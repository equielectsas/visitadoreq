"use client";

import { useState } from "react";

const estadoBadge = {
  activa: "bg-green-100 text-green-800",
  inactiva: "bg-red-100 text-red-800",
};

const emptyForm = { nombre: "", nit: "", ciudad: "", telefono: "", estado: "activa" };

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const abrirModal = (empresa = null, index = null) => {
    setForm(empresa ?? emptyForm);
    setEditIndex(index);
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);

  const guardarEmpresa = () => {
    if (!form.nombre || !form.nit) { alert("Completa los campos"); return; }
    if (editIndex !== null) {
      const copia = [...empresas];
      copia[editIndex] = form;
      setEmpresas(copia);
    } else {
      setEmpresas([...empresas, form]);
    }
    cerrarModal();
  };

  const eliminarEmpresa = (index) =>
    setEmpresas(empresas.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-6 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Empresas</h2>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            + Nueva empresa
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <table className="w-full">
            <thead>
              <tr>
                {["Nombre", "NIT", "Ciudad", "Teléfono", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="text-left text-xs text-slate-400 font-medium pb-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empresas.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-slate-400 py-8">
                    No hay empresas registradas
                  </td>
                </tr>
              )}
              {empresas.map((e, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-sm">{e.nombre}</td>
                  <td className="py-3 text-sm">{e.nit}</td>
                  <td className="py-3 text-sm">{e.ciudad}</td>
                  <td className="py-3 text-sm">{e.telefono}</td>
                  <td className="py-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${estadoBadge[e.estado]}`}>
                      {e.estado}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => abrirModal(e, i)}
                      className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarEmpresa(i)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 animate-fadeIn">
            <h3 className="font-semibold text-gray-800 mb-4">
              {editIndex !== null ? "Editar empresa" : "Nueva empresa"}
            </h3>

            {[
              { placeholder: "Nombre empresa", field: "nombre", type: "text" },
              { placeholder: "NIT", field: "nit", type: "text" },
              { placeholder: "Ciudad", field: "ciudad", type: "text" },
              { placeholder: "Teléfono", field: "telefono", type: "text" },
            ].map(({ placeholder, field, type }) => (
              <input
                key={field}
                type={type}
                placeholder={placeholder}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            ))}

            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="w-full mb-4 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
            </select>

            <div className="flex justify-between gap-3">
              <button
                onClick={guardarEmpresa}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-xl transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={cerrarModal}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}