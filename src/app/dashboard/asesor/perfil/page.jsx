"use client";

import { useState, useEffect } from "react";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState({
    nombre: "Asesor Demo",
    cargo: "Asesor Comercial",
    imagen: null,
  });

  const [visitas, setVisitas] = useState([]);

  // 🔥 CARGAR DATA
  useEffect(() => {
    const user = localStorage.getItem("usuario");
    const visitasData = localStorage.getItem("visitas");

    if (user) setUsuario(JSON.parse(user));
    if (visitasData) setVisitas(JSON.parse(visitasData));
  }, []);

  // 🔥 GUARDAR USUARIO
  const guardarUsuario = (data) => {
    setUsuario(data);
    localStorage.setItem("usuario", JSON.stringify(data));
  };

  // 📸 SUBIR IMAGEN
  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      guardarUsuario({ ...usuario, imagen: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // 📊 KPIs
  const total = visitas.length;
  const completadas = visitas.filter(v => v.estado === "completada").length;
  const pendientes = visitas.filter(v => v.estado === "pendiente").length;
  const canceladas = visitas.filter(v => v.estado === "cancelada").length;

  const porcentaje = total ? Math.round((completadas / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-6">

      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-2xl font-semibold text-gray-800">
          Mi Perfil
        </h1>

        {/* PERFIL */}
        <div className="bg-white rounded-2xl shadow p-6 flex gap-6 items-center">

          {/* IMAGEN */}
          <div className="flex flex-col items-center">
            <img
              src={usuario.imagen || "/assets/img/default-user.png"}
              className="w-24 h-24 rounded-full object-cover border"
            />

            <label className="mt-3 text-xs text-blue-600 cursor-pointer">
              Cambiar foto
              <input
                type="file"
                accept="image/*"
                onChange={handleImagen}
                className="hidden"
              />
            </label>
          </div>

          {/* INFO */}
          <div className="flex-1 space-y-3">

            <div>
              <label className="text-xs text-gray-500">Nombre</label>
              <input
                value={usuario.nombre}
                onChange={(e) =>
                  guardarUsuario({ ...usuario, nombre: e.target.value })
                }
                className="w-full mt-1 border rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Cargo</label>
              <input
                value={usuario.cargo}
                onChange={(e) =>
                  guardarUsuario({ ...usuario, cargo: e.target.value })
                }
                className="w-full mt-1 border rounded-lg p-2 text-sm"
              />
            </div>

          </div>

        </div>

        {/* ESTADISTICAS */}
        <div className="grid grid-cols-4 gap-4">

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-semibold">{total}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-xs text-gray-400">Completadas</p>
            <p className="text-xl font-semibold text-green-600">{completadas}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-xs text-gray-400">Pendientes</p>
            <p className="text-xl font-semibold text-amber-600">{pendientes}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-xs text-gray-400">Canceladas</p>
            <p className="text-xl font-semibold text-red-600">{canceladas}</p>
          </div>

        </div>

        {/* PROGRESO */}
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500 mb-2">
            Nivel de cumplimiento
          </p>

          <div className="w-full bg-gray-200 h-3 rounded-full">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          <p className="text-xs mt-2 text-gray-500">
            {porcentaje}% de visitas completadas
          </p>
        </div>

      </div>
    </div>
  );
}