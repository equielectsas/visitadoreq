/**
 * Base URL del API de chequeo (plataforma), misma env que rewrites en next.config.mjs.
 * Ej. https://tu-app.herokuapp.com o …/api
 */
export function getChequeoApiBase() {
  const raw = process.env.CHEQUEO_API_REWRITE_TARGET || "http://localhost:3001";
  let base = String(raw || "").trim().replace(/\/+$/, "");
  if (!base) return "";
  if (!/\/api$/i.test(base)) {
    base = `${base}/api`;
  }
  return base;
}
