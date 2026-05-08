import { nombreAsesorDesdeVisita } from "@/utils/visitasHelpers";

/**
 * Formato de exportación tipo plantilla industrial (columnas fijas, sin ID).
 * Cambia a false si en algún momento necesitas conservar mayúsculas/minúsculas originales.
 */
export const REPORTE_EXCEL_VALUES_UPPERCASE = true;

/** Nombres de columna iguales a la plantilla Excel compartida */
export const REPORTE_INDUSTRIAL_COLUMNS = [
  "# Visitas",
  "ASESOR",
  "FECHA",
  "CLIENTE",
  "OBJETIVO DE LA VISITA",
  "MUNICIPIO - DIRECCIÓN",
  "VEHICULO",
];

function getAsesorNombre(c) {
  return String(c?.asesorNombre || nombreAsesorDesdeVisita(c) || c?.asesorId || "").trim() || "—";
}

/**
 * Fecha estilo plantilla: YYYY-MM-DD HH:mm:ss.mmm000
 */
export function fechaParaReporteIndustrial(c) {
  let date = null;
  if (c?.estado === "realizada" && c?.finishedAt) {
    const d = new Date(c.finishedAt);
    if (!Number.isNaN(d.getTime())) date = d;
  }
  if (!date && typeof c?.fecha === "string" && c.fecha.length >= 10) {
    const hm = typeof c?.hora === "string" && c.hora ? c.hora.slice(0, 5) : "00:00";
    const d = new Date(`${c.fecha.slice(0, 10)}T${hm}:00`);
    if (!Number.isNaN(d.getTime())) date = d;
  }
  if (!date) return "—";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}.${ms}000`;
}

/**
 * Filas listas para SheetJS: agrupadas por asesor; primera fila del grupo lleva el conteo en "# Visitas".
 */
export function buildFilasReporteIndustrial(visitas) {
  const list = Array.isArray(visitas) ? visitas : [];
  const groups = new Map();
  for (const c of list) {
    const a = getAsesorNombre(c);
    if (!groups.has(a)) groups.set(a, []);
    groups.get(a).push(c);
  }
  const keys = [...groups.keys()].sort((a, b) => a.localeCompare(b, "es"));
  const rows = [];
  for (const asesor of keys) {
    const g = groups.get(asesor).slice();
    g.sort((a, b) =>
      String(fechaParaReporteIndustrial(a)).localeCompare(String(fechaParaReporteIndustrial(b)), "es")
    );
    const n = g.length;
    g.forEach((c, idx) => {
      const cliente = c.datosVisita?.nombreEmpresa || c.cliente || "—";
      const objetivo = c.datosVisita?.tipoVisita || "—";
      const muni = c.datosVisita?.municipio || "—";
      const dir = c.datosVisita?.direccionEmpresa || "";
      const muniDir = dir ? `${muni} - ${dir}` : muni;
      const veh = c.datosVisita?.tipoVehiculo || "—";
      rows.push({
        "# Visitas": idx === 0 ? n : "",
        ASESOR: asesor,
        FECHA: fechaParaReporteIndustrial(c),
        CLIENTE: cliente,
        "OBJETIVO DE LA VISITA": objetivo,
        "MUNICIPIO - DIRECCIÓN": muniDir,
        VEHICULO: veh,
      });
    });
  }
  return rows;
}

/**
 * Aplica mayúsculas a todos los valores string de cada fila (y convierte números del conteo a string en mayúsculas no aplica; se dejan como están o como string vacío).
 */
export function applyReporteExcelUppercase(rows) {
  if (!REPORTE_EXCEL_VALUES_UPPERCASE) return rows;
  return rows.map((row) => {
    const out = {};
    for (const key of Object.keys(row)) {
      const v = row[key];
      if (key === "# Visitas") {
        out[key] = v === "" || v == null ? "" : v;
        continue;
      }
      if (v == null || v === "") {
        out[key] = v;
        continue;
      }
      if (typeof v === "string") {
        out[key] = v.toLocaleUpperCase("es-CO");
        continue;
      }
      if (typeof v === "number") {
        out[key] = v;
        continue;
      }
      out[key] = String(v).toLocaleUpperCase("es-CO");
    }
    return out;
  });
}
