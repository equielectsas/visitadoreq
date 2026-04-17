let visitasMock = [
  {
    id: "1",
    empresa: "Constructora ABC",
    direccion: "Medellín",
    fecha_programada: new Date().toISOString(),
    estado: "PROGRAMADA",
  },
];

export async function getVisitas() {
  await new Promise((res) => setTimeout(res, 300));
  return visitasMock;
}

export async function createVisita(data) {
  await new Promise((res) => setTimeout(res, 300));

  const nueva = {
    id: Date.now().toString(),
    ...data,
    estado: "PROGRAMADA",
  };

  visitasMock.push(nueva);

  return nueva;
}

export async function completarVisita(id, data) {
  await new Promise((res) => setTimeout(res, 300));

  const index = visitasMock.findIndex((v) => v.id === id);

  if (index === -1) throw new Error("Visita no encontrada");

  // 🔐 Validaciones tipo backend
  if (!data.gps) throw new Error("GPS requerido");
  if (!data.foto) throw new Error("Foto requerida");
  if (!data.contacto) throw new Error("Contacto requerido");

  visitasMock[index] = {
    ...visitasMock[index],
    estado: "COMPLETADA",
    fecha_realizada: new Date().toISOString(),
    ...data,
  };

  return visitasMock[index];
}