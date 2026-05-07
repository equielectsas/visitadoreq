/** yyyy-mm-dd en zona America/Bogotá */
export function bogotaYmdFromDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** HH:mm (24h) en zona America/Bogotá */
export function bogotaHmFromDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const hh = parts.find((p) => p.type === "hour")?.value;
  const mm = parts.find((p) => p.type === "minute")?.value;
  if (hh == null || mm == null) return "";
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Fecha/hora que ve el usuario en listados y modal.
 * Visitas realizadas: día y hora en que se cerraron (`finishedAt`, Bogotá), no la cita programada.
 */
export function fechaHoraVisualDesdeVisita(cita) {
  if (!cita) return { fecha: "", hora: "" };
  if (cita.estado === "realizada" && cita.finishedAt) {
    const d = new Date(cita.finishedAt);
    if (!Number.isNaN(d.getTime())) {
      const fecha = bogotaYmdFromDate(d);
      const hora = bogotaHmFromDate(d);
      if (fecha) return { fecha, hora: hora || "" };
    }
  }
  return {
    fecha: typeof cita.fecha === "string" ? cita.fecha : "",
    hora: typeof cita.hora === "string" ? cita.hora : "",
  };
}

/**
 * Para agrupar por mes / filtros: realizadas por día de cierre; resto por fecha programada.
 */
export function getVisitaYmdCalendario(c) {
  if (c?.estado === "realizada" && c?.finishedAt) {
    const ymd = bogotaYmdFromDate(c.finishedAt);
    if (typeof ymd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  }
  const ymd = c?.fecha;
  if (typeof ymd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const fallback = bogotaYmdFromDate(c?.scheduledAt);
  if (typeof fallback === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fallback)) return fallback;
  return "";
}

/** Fecha y hora locales (YYYY-MM-DD, HH:mm) en el instante indicado — p.ej. al cerrar una visita como realizada. */
export function fechaHoraCierreLocal(now = new Date()) {
  const d = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(d.getTime())) return { fecha: "", hora: "" };
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { fecha: `${y}-${m}-${day}`, hora: `${hh}:${mm}` };
}

/** Coordenadas guardadas en datosVisita.geoCoords */
export function geoCoordsValidas(coords) {
  if (!coords || coords.lat == null || coords.lng == null) return null;
  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** El API suele traer asesor poblado como objeto (`asesor.nombre`), no siempre `asesorNombre` plano. */
export function nombreAsesorDesdeVisita(cita) {
  if (!cita) return "";
  const flat = String(cita.asesorNombre || "").trim();
  if (flat) return flat;
  const a = cita.asesor;
  if (!a || typeof a !== "object") return "";
  for (const k of ["nombreCompleto", "name", "fullName"]) {
    const v = a[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const nom = [a.nombre, a.apellido].filter(Boolean).join(" ").trim();
  return nom || "";
}

export function normalizarVisitaAsesorNombre(cita) {
  if (!cita) return cita;
  const n = nombreAsesorDesdeVisita(cita);
  if (!n) return cita;
  return { ...cita, asesorNombre: n };
}
