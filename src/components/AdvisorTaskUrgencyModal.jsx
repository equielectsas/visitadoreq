"use client";

import { useEffect, useState, useCallback } from "react";
import { getActiveTaskAlertForUser, acknowledgeTaskAlert } from "@/utils/platformNotifications";

function readUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getAuthToken() {
  if (typeof window === "undefined") return null;
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}

/** Evita re-mostrar el mismo aviso en la misma sesión de navegador; se limpia al iniciar sesión de nuevo. */
function sessionDismissKey(alert) {
  if (!alert?.visitaId) return null;
  const idPart = alert.id ? String(alert.id) : "na";
  const kind = alert.kind || "legacy";
  return `equielect_task_modal_dismiss_${kind}_${alert.visitaId}_${idPart}`;
}

async function fetchActivaFromApi() {
  const token = getAuthToken();
  if (!token) return null;
  const res = await fetch("/api/alertas-tareas/activa", { headers: { Authorization: token } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.activa) return null;
  return data.activa;
}

/**
 * Modal bloqueante (solo cierra con "Lo haré!") si hay tareas pendientes en servidor
 * o alerta explícita del administrador.
 */
export default function AdvisorTaskUrgencyModal() {
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const sync = useCallback(async () => {
    const u = readUser();
    setUser(u);
    if (!u || u.rol !== "comercial") {
      setAlert(null);
      return;
    }
    try {
      const fromApi = await fetchActivaFromApi();
      if (fromApi) {
        const sk = sessionDismissKey(fromApi);
        if (sk && sessionStorage.getItem(sk)) setAlert(null);
        else setAlert(fromApi);
        return;
      }
    } catch {
      /* usar fallback local */
    }
    const localA = getActiveTaskAlertForUser(u);
    if (localA) {
      const sk = sessionDismissKey(localA);
      if (sk && sessionStorage.getItem(sk)) setAlert(null);
      else setAlert(localA);
    } else setAlert(null);
  }, []);

  useEffect(() => {
    // Solo consultar al iniciar sesión (no en cada refresh/focus).
    const key = "equielect_just_logged_in_v1";
    const shouldRun = (() => {
      try {
        return sessionStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    })();

    if (shouldRun) {
      try {
        sessionStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      void sync();
    }

    const onLogin = () => void sync();
    window.addEventListener("equielect-user-logged-in", onLogin);
    return () => {
      window.removeEventListener("equielect-user-logged-in", onLogin);
    };
  }, [sync]);

  if (!alert || !user) return null;

  const empresa = alert.empresa || "esta visita";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="task-urgency-title"
        className="relative z-10 w-full max-w-md rounded-2xl border-2 border-red-600 bg-red-600 shadow-2xl shadow-red-900/40 overflow-hidden"
      >
        <div className="bg-red-700/90 px-5 py-4 text-center border-b border-red-500/80">
          <p id="task-urgency-title" className="text-lg font-black text-white tracking-tight">
            ¡Atención!
          </p>
        </div>
        <div className="px-5 py-6 bg-white">
          <p className="text-sm font-semibold text-red-900 leading-relaxed text-center">
            Tienes tareas pendientes por completar en <span className="font-black">{empresa}</span>.
            Complétalas antes de que se acabe el tiempo.
          </p>
          <p className="text-xs text-red-800/80 text-center mt-3 font-medium">
            Debes confirmar con el botón inferior para continuar usando la plataforma.
          </p>
        </div>
        <div className="px-5 pb-5 pt-0 bg-white">
          <button
            type="button"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-sm shadow-lg shadow-red-600/30 active:scale-[0.99] transition-all"
            onClick={async () => {
              if (submitting) return;
              setSubmitting(true);
              const token = getAuthToken();
              let serverOk = false;
              if (token) {
                try {
                  const res = await fetch("/api/alertas-tareas/ack", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: token },
                    body: JSON.stringify({
                      kind: alert.kind,
                      alertId: alert.id || undefined,
                      visitaId: alert.visitaId,
                    }),
                  });
                  serverOk = res.ok;
                } catch {
                  serverOk = false;
                }
              }
              if (!serverOk && alert.id) {
                acknowledgeTaskAlert(alert, user);
              }
              const sk = sessionDismissKey(alert);
              if (sk) sessionStorage.setItem(sk, "1");
              setAlert(null);
              setSubmitting(false);
              window.dispatchEvent(new Event("platform-notifs-updated"));
            }}
          >
            {submitting ? "Guardando…" : "Lo haré!"}
          </button>
        </div>
      </div>
    </div>
  );
}
