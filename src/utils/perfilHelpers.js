import { fechaHoraVisualDesdeVisita, nombreAsesorDesdeVisita } from "./visitasHelpers";

export function getAuthTokenForPerfil() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}

export async function fetchVisitasForPerfil({ page = 1, limit = 500 } = {}) {
  const token = getAuthTokenForPerfil();
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`/api/visitas?${params.toString()}`, {
    headers: { Authorization: token },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  if (Array.isArray(data?.visitas)) return data.visitas;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

/** Visita del API (asesor embebido) ¿pertenece al usuario comercial? */
export function visitaPerteneceAlUsuarioActual(cita, user) {
  if (!user || !cita) return false;
  if (user.rol !== "comercial") return true;
  const uCed = String(user.cedula ?? "").replace(/\D/g, "");
  if (cita.asesor?.cedula != null) {
    const aCed = String(cita.asesor.cedula).replace(/\D/g, "");
    if (uCed && aCed && uCed === aCed) return true;
  }
  const nom = nombreAsesorDesdeVisita(cita);
  if (nom && user.nombre && nom.trim().toLowerCase() === String(user.nombre).trim().toLowerCase()) return true;
  return false;
}

/** Filas para listado y modal de perfil (shape plano) */
export function mapVisitaToProfileRow(v) {
  const cv = fechaHoraVisualDesdeVisita(v);
  const dv = v?.datosVisita || {};
  const enc = [dv.nombreEncargado, dv.cargoEncargado].filter(Boolean).join(" · ");
  return {
    id: String(v?._id || v?.id || ""),
    cliente: dv.nombreEmpresa || "—",
    fecha: cv.fecha || v?.fecha || "",
    hora: cv.hora || v?.hora || "",
    direccion: dv.direccionEmpresa || dv.municipio || "",
    telefono: dv.telefono || "",
    contacto: enc || "—",
    observacion: dv.observaciones || "",
    asesorNombre: nombreAsesorDesdeVisita(v),
    estado: v?.estado || "",
  };
}

function visitaTimestampForSort(v) {
  if (!v) return 0;
  if (v.finishedAt) {
    const t = new Date(v.finishedAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  if (v.scheduledAt) {
    const t = new Date(v.scheduledAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  const cv = fechaHoraVisualDesdeVisita(v);
  if (cv.fecha && cv.hora) {
    const t = Date.parse(`${cv.fecha}T${cv.hora}`);
    if (!Number.isNaN(t)) return t;
  }
  if (typeof v.fecha === "string") {
    const t = Date.parse(`${v.fecha}T12:00:00`);
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

/** Últimas visitas (por fecha relevante), ya mapeadas al shape del listado/modal */
export function visitasRecientesParaPerfil(visitasScope, limit = 5) {
  const sorted = [...(visitasScope || [])].sort((a, b) => visitaTimestampForSort(b) - visitaTimestampForSort(a));
  return sorted.slice(0, limit).map(mapVisitaToProfileRow);
}

/** Conteo de asesores distintos según payload del API */
export function uniqueAsesoresActivosCount(visitas) {
  const keys = new Set();
  for (const c of visitas || []) {
    if (c?.asesor?.cedula != null && String(c.asesor.cedula).trim()) {
      keys.add(`ced:${String(c.asesor.cedula).replace(/\D/g, "")}`);
      continue;
    }
    const n = nombreAsesorDesdeVisita(c);
    if (n) keys.add(`nom:${n.trim().toLowerCase()}`);
  }
  return keys.size;
}
