/**
 * Chequeo vehicular: validación contra la plataforma (reportes del día = misma fuente que la BD expuesta por EQ).
 * localStorage refleja la última respuesta exitosa de la plataforma (se reemplaza por completo, no solo “true”).
 * Calendario: America/Bogotá.
 */

const STORAGE_PREFIX = "equielect_chequeo_vehiculo_v1";

/** Claves de tipo que devuelve la plataforma / estado-hoy. */
export const CHEQUEO_PLATAFORMA_KEYS = ["Carro", "Motocicleta", "Transporte Público"];

export function normalizeCompletadosChequeoPlataforma(completados) {
  const out = {};
  for (const k of CHEQUEO_PLATAFORMA_KEYS) {
    out[k] = Boolean(completados?.[k]);
  }
  return out;
}

export function colombiaDateYmd(dateInput = new Date()) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** YYYY-MM-DD tal como calendario en Bogotá (evita cortar en UTC en reportes). */
export function fechaRegistroChequeoYmd(fecha) {
  if (fecha == null || fecha === "") return "";
  if (typeof fecha === "object" && fecha !== null && fecha.$date != null) {
    return fechaRegistroChequeoYmd(fecha.$date);
  }
  if (typeof fecha === "number" && Number.isFinite(fecha)) {
    const ms = fecha < 1e12 ? fecha * 1000 : fecha;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return "";
    return colombiaDateYmd(d);
  }
  const s = String(fecha).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return colombiaDateYmd(d);
}

/** Fecha calendario Colombia en `dd/mm/aaaa` (mejor para CSV en Excel que `yyyy-mm-dd`). */
export function fechaChequeoDdMmYyyyColombia(fecha) {
  const ymd = fechaRegistroChequeoYmd(fecha);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd || "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

/** Convierte `yyyy-mm-dd` (fecha visita) a `dd/mm/aaaa` para exportes. */
export function ymdVisitaDdMmYyyy(ymd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ymd || "").trim())) return String(ymd ?? "");
  const [y, m, d] = String(ymd).trim().split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Fecha/hora enviada al POST de chequeo: mediodía en Bogotá del día calendario actual.
 * Así, si la plataforma deriva la fecha en UTC, no salta al día siguiente (caso típico con horas nocturnas).
 */
export function fechaIsoReferenciaChequeoBogota() {
  const ymd = colombiaDateYmd();
  if (!ymd) return new Date().toISOString();
  return `${ymd}T12:00:00-05:00`;
}

export function normCedulaChequeo(c) {
  return String(c ?? "")
    .trim()
    .replace(/\D/g, "");
}

/** Limpia caché antigua de sessionStorage (ya no se usa); evita “Enviado” fantasma tras borrar en BD. */
export function limpiarSesionChequeoObsoleta(user) {
  if (typeof window === "undefined" || !user?.cedula) return;
  try {
    sessionStorage.removeItem(`equielect_chequeo_envio_ok_dia_v1_${normCedulaChequeo(user.cedula)}`);
  } catch {
    /* ignore */
  }
}

export function buildChequeoUpstreamAuthHeaders(tokenTrim) {
  const t = String(tokenTrim || "").trim();
  const bearer = t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}`;
  return {
    Authorization: t,
    "X-Access-Token": t,
    "X-Authorization": bearer,
  };
}

export function storageKeyChequeo(user) {
  const id = user?.cedula ?? user?.id ?? "anon";
  return `${STORAGE_PREFIX}_${id}`;
}

export function getChequeoVehiculoState(user) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKeyChequeo(user));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Fusiona flags enviados hoy (p. ej. tras leer reportes del servidor). */
export function mergeChequeoCompletadosHoy(user, flags) {
  if (typeof window === "undefined" || !user) return false;
  const hoy = colombiaDateYmd();
  let st = getChequeoVehiculoState(user);
  if (!st || st.fechaYmd !== hoy) {
    st = { fechaYmd: hoy, completados: normalizeCompletadosChequeoPlataforma({}) };
  }
  const prev = JSON.stringify(st.completados || {});
  const next = { ...normalizeCompletadosChequeoPlataforma(st.completados) };
  for (const [k, v] of Object.entries(flags || {})) {
    if (v) next[k] = true;
  }
  if (JSON.stringify(next) === prev) return false;
  st.completados = next;
  st.fechaYmd = hoy;
  localStorage.setItem(storageKeyChequeo(user), JSON.stringify(st));
  window.dispatchEvent(new Event("chequeo-vehiculo-updated"));
  return true;
}

/**
 * Sustituye el caché del día con lo que devolvió la plataforma (reportes = BD expuesta).
 * Así, si en la BD ya no hay filas, los flags pasan a false (no quedan “pegados” en true).
 */
export function replaceChequeoCompletadosHoyDesdePlataforma(user, completados) {
  if (typeof window === "undefined" || !user) return false;
  const hoy = colombiaDateYmd();
  const next = normalizeCompletadosChequeoPlataforma(completados);
  const st = { fechaYmd: hoy, completados: next };
  const prevRaw = localStorage.getItem(storageKeyChequeo(user));
  let prev = null;
  try {
    prev = prevRaw ? JSON.parse(prevRaw) : null;
  } catch {
    prev = null;
  }
  if (JSON.stringify(prev) === JSON.stringify(st)) return false;
  localStorage.setItem(storageKeyChequeo(user), JSON.stringify(st));
  window.dispatchEvent(new Event("chequeo-vehiculo-updated"));
  return true;
}

/**
 * Consulta en servidor (ruta Next → API plataforma / reportes del día) y opcionalmente refleja en localStorage.
 */
export async function refreshChequeoDesdeServidor(user) {
  if (typeof window === "undefined" || !user) return { ok: false, reason: "no_user" };
  const token = getAuthTokenFromStorage();
  const r = await fetchChequeoEstadoHoyDesdeApi({ token, cedula: user.cedula });
  if (r.ok) {
    replaceChequeoCompletadosHoyDesdePlataforma(user, r.completados ?? {});
    return { ok: true, flags: normalizeCompletadosChequeoPlataforma(r.completados ?? {}) };
  }
  return { ok: false, reason: r.error || "fetch_error", completados: r.completados };
}

/** Consulta el estado real del día en la plataforma (misma fuente que la base / reportes). */
export async function fetchChequeoEstadoHoyDesdeApi({ token, cedula }) {
  const tokenTrim = String(token || "").trim();
  const myCed = normCedulaChequeo(cedula);
  if (!tokenTrim || !myCed) {
    return {
      ok: false,
      error: "Falta sesión o cédula.",
      fechaYmd: colombiaDateYmd(),
      completados: null,
    };
  }
  try {
    const params = new URLSearchParams({ cedula: myCed });
    const res = await fetch(`/chequeo-db/estado-hoy?${params}`, {
      method: "GET",
      headers: { ...buildChequeoUpstreamAuthHeaders(tokenTrim) },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error: data?.message || `Error ${res.status}`,
        fechaYmd: data?.fechaYmd || colombiaDateYmd(),
        completados: data?.completados ?? null,
      };
    }
    const completados = {
      Carro: Boolean(data?.completados?.Carro),
      Motocicleta: Boolean(data?.completados?.Motocicleta),
      "Transporte Público": Boolean(data?.completados?.["Transporte Público"]),
    };
    return {
      ok: true,
      error: null,
      fechaYmd: data.fechaYmd || colombiaDateYmd(),
      completados,
    };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "No se pudo consultar el estado del chequeo en la plataforma.",
      fechaYmd: colombiaDateYmd(),
      completados: null,
    };
  }
}

/** Tras POST exitoso al backend */
export function markChequeoEnviado(user, tipoTransporte) {
  mergeChequeoCompletadosHoy(user, { [tipoTransporte]: true });
}

/** Clave en `completados` según el tipo elegido en el formulario de chequeo */
export function transporteChequeoFromTipoForm(tipoForm) {
  if (tipoForm === "moto") return "Motocicleta";
  if (tipoForm === "publico") return "Transporte Público";
  if (tipoForm === "carro") return "Carro";
  return null;
}

/** Ya consta en plataforma el chequeo de hoy para ese tipo (datos devueltos por /chequeo-db/estado-hoy). */
export function isChequeoEnviadoHoyParaTipo(tipoForm, completadosServidor) {
  const transporte = transporteChequeoFromTipoForm(tipoForm);
  if (!transporte) return false;
  return Boolean(completadosServidor?.[transporte]);
}

/**
 * ¿Puede cerrar la visita con este tipo de transporte? Depende del estado consultado a la plataforma (BD vía API).
 * @param {string} tipoVehiculo
 * @param {{ loading?: boolean, error?: string|null, completados?: Record<string, boolean> }} servidor
 */
export function chequeoCumpleParaCerrarVisita(tipoVehiculo, servidor) {
  if (!tipoVehiculo) return true;
  if (tipoVehiculo !== "Carro" && tipoVehiculo !== "Motocicleta" && tipoVehiculo !== "Transporte Público") return true;
  if (!servidor || servidor.loading) return false;
  const c = servidor.completados || {};
  const tiene = Boolean(c[tipoVehiculo]);
  if (servidor.error) return tiene;
  return tiene;
}

export function getAuthTokenFromStorage() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}
