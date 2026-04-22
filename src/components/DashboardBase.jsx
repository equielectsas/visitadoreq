"use client";

export default function DashboardBase({ rol }) {

  const esProgramador = rol === "adminPlataforma";
  const esAdmin = rol === "adminComercial";

  return (
    <main className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Dashboard {rol}
      </h1>

      {/* 🔹 CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <Card title="Citas Totales" value={0} />

        <Card title="Pendientes" value={0} />

        {/* SOLO PROGRAMADOR */}
        {esProgramador && (
          <Card title="Errores Sistema" value={0} />
        )}

        {/* SOLO ADMIN */}
        {esAdmin && (
          <Card title="Ventas" value={0} />
        )}

      </div>

      {/* 🔹 TABLA */}
      <div className="bg-white rounded shadow p-4">
        <p className="text-gray-500">
          Aquí irá la información dinámica
        </p>
      </div>

    </main>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-[var(--color-secondary)]">
        {value}
      </p>
    </div>
  );
}