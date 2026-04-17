"use client";

import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();

  const cerrarSesion = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">

      {/* LOGO */}
      <h1 className="font-semibold text-gray-800">
        EQUIELECT Dashboard
      </h1>

      {/* USER */}
      <div className="flex items-center gap-4">

        <span className="text-sm text-gray-600">
          {user.nombre || "Usuario"}
        </span>

        <button
          onClick={cerrarSesion}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Cerrar sesión
        </button>

      </div>

    </div>
  );
}