/**
 * Estado diario del chequeo vehicular (local). Se renueva cada día (America/Bogotá).
 * Por tipo de transporte de la visita: "Carro" | "Motocicleta" deben enviarse al back ese mismo día.
 */

const STORAGE_PREFIX = "equielect_chequeo_vehiculo_v1";

export function colombiaDateYmd() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

/** Tras POST exitoso al backend */
export function markChequeoEnviado(user, tipoTransporte) {
  const hoy = colombiaDateYmd();
  let st = getChequeoVehiculoState(user);
  if (!st || st.fechaYmd !== hoy) {
    st = { fechaYmd: hoy, completados: {} };
  }
  st.completados = { ...st.completados, [tipoTransporte]: true };
  st.fechaYmd = hoy;
  localStorage.setItem(storageKeyChequeo(user), JSON.stringify(st));
  window.dispatchEvent(new Event("chequeo-vehiculo-updated"));
}

/** ¿Puede cerrar la visita con este tipo de transporte? */
export function chequeoCumpleParaCerrarVisita(user, tipoVehiculo) {
  if (!tipoVehiculo) return true;
  if (tipoVehiculo !== "Carro" && tipoVehiculo !== "Motocicleta" && tipoVehiculo !== "Transporte Público") return true;
  const st = getChequeoVehiculoState(user);
  if (!st || st.fechaYmd !== colombiaDateYmd()) return false;
  return Boolean(st.completados?.[tipoVehiculo]);
}

export function getAuthTokenFromStorage() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}
