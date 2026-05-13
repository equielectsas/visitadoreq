import { fechaRegistroChequeoYmd, normCedulaChequeo } from "@/utils/chequeoVehiculoStorage";

/** Cédula en filas de reporte (nombres variables según backend EQ / otros clientes). */
export function cedulaDesdeRegistroChequeo(r) {
  if (!r || typeof r !== "object") return "";
  const u = r.usuario && typeof r.usuario === "object" ? r.usuario : null;
  const c = r.conductor && typeof r.conductor === "object" ? r.conductor : null;
  const v =
    r.cedula ??
    r.Cedula ??
    r.cedulaUsuario ??
    r.numeroDocumento ??
    r.numeroIdentificacion ??
    r.numIdentificacion ??
    r.documento ??
    r.dni ??
    r.nroDocumento ??
    r.identificacion ??
    u?.cedula ??
    u?.documento ??
    u?.numeroDocumento ??
    c?.cedula ??
    c?.documento;
  return normCedulaChequeo(v);
}

/** Fecha en ISO / string / objeto Mongo {$date}. */
function rawFechaRegistro(r) {
  if (!r || typeof r !== "object") return null;
  const nested =
    (r.chequeo && typeof r.chequeo === "object" && (r.chequeo.fecha ?? r.chequeo.createdAt ?? r.chequeo.fechaRegistro)) ||
    (r.data && typeof r.data === "object" && !Array.isArray(r.data) && (r.data.fecha ?? r.data.createdAt)) ||
    null;
  const raw =
    r.fecha ??
    r.fechaChequeo ??
    r.fecha_chequeo ??
    r.fechaRegistro ??
    r.fecha_registro ??
    r.fechaCreacion ??
    r.fecha_creacion ??
    r.fechaHora ??
    r.fecha_envio ??
    r.fechaEnvio ??
    r.fechaGuardado ??
    r.timestamp ??
    r.createdAt ??
    r.created_at ??
    r.updatedAt ??
    r.date ??
    nested;
  if (raw == null) return null;
  if (typeof raw === "object" && raw.$date != null) {
    return raw.$date;
  }
  return raw;
}

/**
 * Lista de filas desde distintas formas de respuesta de la plataforma.
 */
export function extraerFilasReporteChequeo(body) {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.rows)) return body.rows;
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(body.result)) return body.result;
  if (Array.isArray(body.records)) return body.records;
  if (Array.isArray(body.list)) return body.list;
  if (Array.isArray(body.chequeos)) return body.chequeos;
  if (body.data && typeof body.data === "object") {
    const d = body.data;
    if (Array.isArray(d.rows)) return d.rows;
    if (Array.isArray(d.items)) return d.items;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.list)) return d.list;
    if (Array.isArray(d.chequeos)) return d.chequeos;
  }
  return [];
}

/**
 * ¿La fila corresponde al usuario y al día `hoy` (YYYY-MM-DD Bogotá)?
 * Si el reporte ya viene filtrado por rango del día y la fila no trae fecha parseable, se acepta por cédula.
 */
export function filaChequeoCuentaParaHoy(r, hoy, cedulaNorm) {
  if (!hoy || !cedulaNorm) return false;
  if (cedulaDesdeRegistroChequeo(r) !== cedulaNorm) return false;
  const raw = rawFechaRegistro(r);
  if (raw == null || raw === "") {
    return true;
  }
  const ymd = fechaRegistroChequeoYmd(raw);
  if (!ymd) {
    return true;
  }
  return ymd === hoy;
}

/**
 * A partir de los JSON de reporte, indica si hoy ya hay chequeo por tipo (misma lógica en cliente y en /chequeo-db/estado-hoy).
 * Solo cuenta filas que cumplen cédula + reglas de fecha en Bogotá (sin caché de navegador).
 */
export function completadosChequeoDesdeReportesJson(hoy, cedulaNorm, carroJson, motoJson, publicoJson) {
  const completados = {
    Carro: false,
    Motocicleta: false,
    "Transporte Público": false,
  };
  const scan = (body, tipoKey) => {
    const arr = extraerFilasReporteChequeo(body);
    for (const r of arr) {
      if (filaChequeoCuentaParaHoy(r, hoy, cedulaNorm)) {
        completados[tipoKey] = true;
        return;
      }
    }
  };
  scan(carroJson, "Carro");
  scan(motoJson, "Motocicleta");
  scan(publicoJson, "Transporte Público");
  return completados;
}

/** Unión OR de flags (p. ej. servidor + confirmación local tras POST). */
export function mergeCompletadosChequeoPreferTrue(a, b) {
  const keys = ["Carro", "Motocicleta", "Transporte Público"];
  const out = {};
  for (const k of keys) {
    out[k] = Boolean(a?.[k] || b?.[k]);
  }
  return out;
}
