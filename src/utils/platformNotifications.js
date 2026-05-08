/**
 * Notificaciones en cliente (localStorage) + alertas de tareas pendientes enviadas por admin.
 * Sincroniza el Topbar y el modal obligatorio del asesor vía eventos personalizados.
 */

const NOTIF_STORE_KEY = "equielect_platform_notifs_v1";
const TASK_ALERTS_KEY = "equielect_task_alerts_pending_v1";
const VISIT_REMINDER_PREFIX = "equielect_visit_reminder_sent_";

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function dispatchNotifsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("platform-notifs-updated"));
}

export function dispatchTaskAlertsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("task-alerts-updated"));
}

// ── Notificaciones (bandeja Topbar) ─────────────────────────────────────────

function getNotifItems() {
  const data = readJson(NOTIF_STORE_KEY, { items: [] });
  return Array.isArray(data.items) ? data.items : [];
}

function saveNotifItems(items) {
  writeJson(NOTIF_STORE_KEY, { items: items.slice(0, 120) });
}

/**
 * @param {object} opts
 * @param {string} opts.recipientKey - "admin:any" | "user:<cedula>"
 * @param {string} opts.type - cita | alerta | sistema | exito
 * @param {string} opts.title
 * @param {string} opts.body
 */
export function addPlatformNotification({ recipientKey, type = "sistema", title, body }) {
  if (typeof window === "undefined") return;
  const items = getNotifItems();
  items.unshift({
    id: genId(),
    recipientKey,
    type,
    title: String(title || ""),
    body: String(body || ""),
    createdAt: new Date().toISOString(),
    read: false,
  });
  saveNotifItems(items);
  dispatchNotifsUpdated();
}

export function getNotificationsForUser(user) {
  if (!user || typeof window === "undefined") return [];
  const cedula = String(user.cedula || "").trim();
  const isAdmin = user.rol === "adminPlataforma" || user.rol === "adminComercial";
  const items = getNotifItems();
  return items.filter((n) => {
    if (n.recipientKey === "admin:any" && isAdmin) return true;
    if (n.recipientKey === `user:${cedula}` && user.rol === "comercial") return true;
    return false;
  });
}

export function markPlatformNotificationRead(id) {
  const items = getNotifItems().map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifItems(items);
  dispatchNotifsUpdated();
}

export function markAllPlatformNotificationsReadForUser(user) {
  if (!user) return;
  const cedula = String(user.cedula || "").trim();
  const isAdmin = user.rol === "adminPlataforma" || user.rol === "adminComercial";
  const items = getNotifItems().map((n) => {
    const mine =
      (n.recipientKey === "admin:any" && isAdmin) ||
      (n.recipientKey === `user:${cedula}` && user.rol === "comercial");
    return mine ? { ...n, read: true } : n;
  });
  saveNotifItems(items);
  dispatchNotifsUpdated();
}

export function formatNotifTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (sec < 45) return "Hace un momento";
  if (sec < 3600) return `Hace ${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `Hace ${Math.floor(sec / 3600)} h`;
  return d.toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ── Alertas de tareas (modal obligatorio asesor) ─────────────────────────────

export function getPendingTaskAlerts() {
  const list = readJson(TASK_ALERTS_KEY, []);
  return Array.isArray(list) ? list : [];
}

function saveTaskAlerts(list) {
  writeJson(TASK_ALERTS_KEY, list);
}

/**
 * Admin envía alerta: el asesor debe ver el modal hasta aceptar.
 */
export function pushTaskPendingAlert({ visitaId, asesorCedula, empresa }) {
  if (typeof window === "undefined") return null;
  const ced = String(asesorCedula || "").trim();
  if (!visitaId || !ced) return null;
  const list = getPendingTaskAlerts();
  const open = list.filter((a) => !a.acknowledged && String(a.asesorCedula) === ced && a.visitaId === visitaId);
  if (open.length > 0) return open[0];

  const alert = {
    id: genId(),
    visitaId: String(visitaId),
    asesorCedula: ced,
    empresa: String(empresa || "la visita").trim() || "la visita",
    createdAt: new Date().toISOString(),
    acknowledged: false,
  };
  list.push(alert);
  saveTaskAlerts(list);

  addPlatformNotification({
    recipientKey: `user:${ced}`,
    type: "alerta",
    title: "Tareas pendientes",
    body: `Tienes tareas pendientes por completar en ${alert.empresa}. Revisa el aviso al iniciar sesión.`,
  });

  dispatchTaskAlertsUpdated();
  return alert;
}

export function getActiveTaskAlertForUser(user) {
  if (!user || user.rol !== "comercial") return null;
  const ced = String(user.cedula || "").trim();
  if (!ced) return null;
  return (
    getPendingTaskAlerts().find((a) => !a.acknowledged && String(a.asesorCedula) === ced) || null
  );
}

/**
 * Asesor pulsa "Lo haré!" → cierra modal y notifica a administradores.
 */
export function acknowledgeTaskAlert(alert, user) {
  if (!alert?.id || typeof window === "undefined") return;
  const list = getPendingTaskAlerts().map((a) =>
    a.id === alert.id ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() } : a
  );
  saveTaskAlerts(list);

  const nombreAsesor = user?.nombre || String(user?.cedula || "Asesor");
  addPlatformNotification({
    recipientKey: "admin:any",
    type: "exito",
    title: "Asesor confirmó tareas pendientes",
    body: `${nombreAsesor} aceptó completar las tareas pendientes en ${alert.empresa} antes de que se acabe el tiempo.`,
  });

  dispatchTaskAlertsUpdated();
}

// ── Recordatorios de visita (~24 h antes) ───────────────────────────────────

function parseVisitDateTimeLocal(v) {
  if (!v?.fecha || typeof v.fecha !== "string") return null;
  const ymd = v.fecha.slice(0, 10);
  const hm = typeof v.hora === "string" && v.hora ? v.hora.slice(0, 5) : "09:00";
  const d = new Date(`${ymd}T${hm}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function notifCitasEnabled() {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem("cfg_notif_citas");
  return v !== "false";
}

/**
 * Crea a lo sumo una notificación por visita (persistente en API; fallback localStorage sin API).
 */
export async function refreshVisitRemindersFromVisitas(visitas, user) {
  if (typeof window === "undefined" || !user || user.rol !== "comercial") return;
  if (!notifCitasEnabled()) return;
  const cedula = String(user.cedula || "").trim();
  if (!cedula || !Array.isArray(visitas)) return;

  let token = localStorage.getItem("token");
  if (!token) {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      token = u?.token || null;
    } catch {
      token = null;
    }
  }
  const now = Date.now();
  const horizon = now + 24 * 60 * 60 * 1000;

  for (const v of visitas) {
    const id = v._id || v.id;
    if (!id) continue;
    if (v.estado === "realizada") continue;

    const dt = parseVisitDateTimeLocal(v);
    if (!dt) continue;
    const t = dt.getTime();
    if (t < now || t > horizon) continue;

    const dedupKey = `${VISIT_REMINDER_PREFIX}${id}`;
    const empresa = v.datosVisita?.nombreEmpresa || v.cliente || "tu visita programada";
    const body = `En las próximas 24 horas tienes una visita en ${empresa} (${v.fecha}${v.hora ? ` · ${v.hora}` : ""}).`;

    if (token) {
      try {
        const res = await fetch("/api/notificaciones/dedupe", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({
            dedupeKey,
            type: "cita",
            title: "Recordatorio de visita",
            body,
          }),
        });
        if (res.ok) continue;
      } catch {
        /* fallback local */
      }
    }

    if (localStorage.getItem(dedupKey)) continue;
    addPlatformNotification({
      recipientKey: `user:${cedula}`,
      type: "cita",
      title: "Recordatorio de visita",
      body,
    });
    localStorage.setItem(dedupKey, "1");
  }
  dispatchNotifsUpdated();
}
