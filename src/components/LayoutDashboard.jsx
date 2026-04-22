"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function LayoutDashboard({ children }) {
  return (
    <div className="flex flex-col h-screen bg-[#f6f8fb]">

      {/* 🔝 TOPBAR FULL WIDTH */}
      <Topbar />

      {/* 🔽 CONTENIDO CON SIDEBAR */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENIDO */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

      </div>

    </div>
  );
}