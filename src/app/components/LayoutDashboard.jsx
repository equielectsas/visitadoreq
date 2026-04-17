"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function LayoutDashboard({ children }) {
  return (
    <div className="flex h-screen bg-[#f6f8fb]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <Topbar />

        {/* CONTENIDO DINÁMICO */}
        <div className="p-6 overflow-auto">
          {children}
        </div>

      </div>

    </div>
  );
}