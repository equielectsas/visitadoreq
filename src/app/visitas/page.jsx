"use client";

import { useState } from "react";

const estadoBadge = {
  pendiente: "bg-amber-100 text-amber-800",
  proceso: "bg-blue-100 text-blue-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
};

const estadoLabel = {
  pendiente: "Pendiente",
  proceso: "En proceso",
  completada: "Completada",
  cancelada: "No realizada",
};

const emptyForm = { cliente: "", fecha: "", hora: "", estado: "pendiente" };

export default function VisitasPage() {
  const [visitas, setVisitas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const abrirModal = (visita = null, index = null) => {
    setForm(visita ?? emptyForm);
    setEditIndex(index);
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);

  const guardarVisita = () => {
    if (!form.cliente || !form.fecha || !form.hora) { alert("Completa los campos"); return; }
    if (editIndex !== null) {
      const copia = [...visitas];
      copia[editIndex] = form;
      setVisitas(copia);
    } else {
      setVisitas([...visitas, form]);
    }
    cerrarModal();
  };

  const eliminarVisita = (index) =>
    setVisitas(visitas.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-6 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Visitas</h2>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            + Nueva visita
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <table className="w-full">
            <thead>
              <tr>
                {["Cliente", "Fecha", "Hora", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="text-left text-xs text-slate-400 font-medium pb-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visitas.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-sm text-slate-400 py-8">
                    No hay visitas registradas
                  </td>
                </tr>
              )}
              {visitas.map((v, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-sm">{v.cliente}</td>
                  <td className="py-3 text-sm">{v.fecha}</td>
                  <td className="py-3 text-sm">{v.hora}</td>
                  <td className="py-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${estadoBadge[v.estado]}`}>
                      {estadoLabel[v.estado]}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => abrirModal(v, i)}
                      className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarVisita(i)}
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
              {editIndex !== null ? "Editar visita" : "Nueva visita"}
            </h3>

            <input
              type="text"
              placeholder="Cliente"
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="time"
              value={form.hora}
              onChange={(e) => setForm({ ...form, hora: e.target.value })}
              className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="w-full mb-4 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="pendiente">Pendiente</option>
              <option value="proceso">En proceso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">No realizada</option>
            </select>

            <div className="flex justify-between gap-3">
              <button
                onClick={guardarVisita}
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