"use client";

import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  return (
    <div className="w-64 bg-[#0f172a] text-white p-5 flex flex-col justify-between">

      <div>
        <h2 className="text-lg font-semibold mb-6">EQUIELECT</h2>

        <ul className="space-y-2 text-sm">

          <li onClick={() => router.push("/dashboard/asesor/perfil")} className="cursor-pointer hover:bg-white/10 p-2 rounded">
            👤 Perfil
          </li>

          <li onClick={() => router.push("/dashboard/asesor")} className="cursor-pointer hover:bg-white/10 p-2 rounded">
            📊 Dashboard
          </li>

          <li onClick={() => router.push("/dashboard/asesor/visitas")} className="cursor-pointer hover:bg-white/10 p-2 rounded">
            📅 Visitas
          </li>

          <li onClick={() => router.push("/dashboard/asesor/clientes")} className="cursor-pointer hover:bg-white/10 p-2 rounded">
            🏢 Clientes
          </li>

          <li onClick={() => router.push("/dashboard/asesor/contactos")} className="cursor-pointer hover:bg-white/10 p-2 rounded">
            👥 Contactos
          </li>

        </ul>
      </div>

    </div>
  );
}