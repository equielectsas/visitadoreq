"use client";

import { useRouter } from "next/navigation";

const kpis = [
  { value: 5, label: "Visitas hoy", color: "text-blue-600" },
  { value: 2, label: "Pendientes", color: "text-amber-500" },
  { value: 3, label: "Completadas", color: "text-green-600" },
  { value: 1, label: "No completadas", color: "text-red-600" },
  { value: 40, label: "Este mes", color: "text-gray-800" },
];

const visitas = [
  { empresa: "ACT Global", hora: "10:00 AM", estado: "pendiente" },
  { empresa: "Bright Industries", hora: "03:30 PM", estado: "completada" },
  { empresa: "Gamma Corp", hora: "04:00 PM", estado: "cancelada" },
];

const estadoBadge = {
  pendiente: "bg-amber-100 text-amber-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
};

const estadoLabel = {
  pendiente: "Pendiente",
  completada: "Completada",
  cancelada: "No realizada",
};

export default function AsesorDashboard() {
  const router = useRouter();

  return (
    <div className="flex h-screen font-sans bg-[#f6f8fb] text-gray-900">

      {/* SIDEBAR */}
      <aside className="w-60 bg-[#0f172a] text-slate-300 flex flex-col justify-between p-5">
        <div>
          <h2 className="text-white text-lg font-semibold mb-8">EQUIELECT</h2>
          <ul className="space-y-1">
            {[
              { icon: "🏠", label: "Dashboard", active: true, onClick: null },
              { icon: "📅", label: "Visitas", active: false, onClick: () => router.push("/visitas") },
              { icon: "🏢", label: "Empresas", active: false, onClick: () => router.push("/empresas") },
              { icon: "📊", label: "Reportes", active: false, onClick: null },
            ].map((item) => (
              <li
                key={item.label}
                onClick={item.onClick}
                className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm cursor-pointer transition-colors ${
                  item.active
                    ? "bg-blue-600 text-white"
                    : "hover:bg-white/5"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-xs opacity-60">👤 Asesor: Juan Pérez</div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <span className="text-sm text-slate-500">Hoy: 15 Abril</span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="bg-white rounded-2xl p-5 shadow-sm hover:-translate-y-1 transition-transform"
            >
              <h3 className={`text-2xl font-bold mb-1 ${k.color}`}>{k.value}</h3>
              <span className="text-xs text-slate-500">{k.label}</span>
            </div>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-[2fr_1fr] gap-5 mt-5">

          {/* TABLA */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="font-semibold mb-4 text-sm">Próximas visitas</h4>
            <table className="w-full">
              <thead>
                <tr>
                  {["Empresa", "Hora", "Estado", ""].map((h) => (
                    <th key={h} className="text-left text-xs text-slate-400 pb-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visitas.map((v) => (
                  <tr key={v.empresa} className="border-t border-gray-100">
                    <td className="py-3 text-sm">{v.empresa}</td>
                    <td className="py-3 text-sm">{v.hora}</td>
                    <td className="py-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${estadoBadge[v.estado]}`}>
                        {estadoLabel[v.estado]}
                      </span>
                    </td>
                    <td className="py-3">
                      {v.estado === "pendiente" && (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                          Iniciar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DERECHA */}
          <div className="flex flex-col gap-4">

            {/* MAPA */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h4 className="font-semibold mb-3 text-sm">Mapa de visitas</h4>
              <div className="h-48 rounded-xl bg-gradient-to-br from-slate-200 to-indigo-100" />
            </div>

            {/* ALERTAS */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h4 className="font-semibold mb-3 text-sm">Alertas</h4>
              {[
                "Tienes una visita en 30 minutos",
                "GPS no detectado en última visita",
              ].map((msg) => (
                <div
                  key={msg}
                  className="bg-orange-50 border-l-4 border-orange-400 px-3 py-2.5 rounded-lg text-xs text-orange-700 mb-2"
                >
                  ⚠ {msg}
                </div>
              ))}
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}