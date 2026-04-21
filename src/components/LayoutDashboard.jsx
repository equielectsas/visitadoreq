"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function LayoutDashboard({ children }) {

  // 🔥 luego esto vendrá del backend o contexto
  const rol = "adminPlataforma";

  return (
    <div className="flex h-screen bg-[#f6f8fb]">

      {/* SIDEBAR DINÁMICO */}
      <Sidebar rol={rol} />

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col">

        <Topbar />

        <div className="p-6 overflow-auto">
          {children}
        </div>

      </div>

    </div>
  );
}