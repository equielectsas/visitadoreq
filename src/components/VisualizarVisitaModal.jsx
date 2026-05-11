"use client";

import VisitaUbicacionMapa from "@/components/VisitaUbicacionMapa";
import { geoCoordsValidas, nombreAsesorDesdeVisita, fechaHoraVisualDesdeVisita } from "@/utils/visitasHelpers";

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-700 dark:bg-amber-900/45 dark:text-amber-100" },
  activa: { label: "Activa", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200" },
  realizada: { label: "Realizada", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200" },
  reprogramada: { label: "Reprogramada", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200" },
};

const CalIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function Modal({ show, onClose, children, wide = false }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 bg-white dark:bg-eqDark-surface rounded-3xl shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,205,0,0.06)] w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[92vh] overflow-y-auto border border-transparent dark:border-[#FFCD00]/10`}
      >
        {children}
      </div>
    </div>
  );
}

function ReadonlyField({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="w-full px-4 py-3 rounded-xl border border-dashed border-gray-200 dark:border-slate-600 bg-gray-50/80 dark:bg-[#0f1c2e] text-sm font-medium text-gray-800 dark:text-slate-100 select-none">
        {value || "—"}
      </div>
    </div>
  );
}

export function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function VisualizarVisitaModal({
  show,
  onClose,
  cita,
  asesorFallbackNombre,
  footerActions,
  expandDetails,
  /** Si true, las tareas se muestran con checkbox y `onTareaToggle(idx)`. */
  tareasEditable = false,
  onTareaToggle,
}) {
  if (!show || !cita) return null;

  const dv = cita?.datosVisita || {};
  const tareas = Array.isArray(dv?.tareasPendientes) ? dv.tareasPendientes : [];
  const coords = dv?.geoCoords || null;
  const geoParsed = geoCoordsValidas(coords);
  const esRealizada = cita?.estado === "realizada";
  const esActiva = cita?.estado === "activa";
  /** Pendiente / reprogramada / activa: solo datos básicos de la cita (como en Crear visita). */
  const esVistaBasica =
    !expandDetails && ["activa", "pendiente", "reprogramada"].includes(cita?.estado);
  const empresa = dv?.nombreEmpresa || cita?.cliente || "—";
  const nombreAsesor = nombreAsesorDesdeVisita(cita) || String(asesorFallbackNombre || "").trim();
  const visualFh = fechaHoraVisualDesdeVisita(cita);

  return (
    <Modal show={show} onClose={onClose} wide={!esVistaBasica}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#98989A] uppercase tracking-widest">Visita</p>
            <h2 className="text-xl font-black text-[#1C355E] dark:text-slate-50 truncate">{esActiva ? "Visita en curso" : empresa}</h2>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <EstadoBadge estado={cita?.estado} />
              {!esVistaBasica && visualFh.fecha && (
                <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                  <CalIcon /> {visualFh.fecha}
                  {visualFh.hora ? ` · ${visualFh.hora}` : ""}
                </span>
              )}
              {cita?.estado === "reprogramada" && cita?.motivoReprogramacion && (
                <span className="text-xs text-purple-600 font-semibold">· {cita.motivoReprogramacion}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center flex-shrink-0"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        {esVistaBasica ? (
          <div className="mt-6 space-y-4 max-w-lg">
            <p className="text-xs text-gray-500">
              {esActiva
                ? "Mientras la visita está activa solo aplica la información básica de la cita. El resto se completa al finalizar."
                : cita?.estado === "reprogramada"
                  ? "Visita reprogramada: solo la información básica de la cita. El detalle se completa al iniciar y finalizar."
                  : "Visita pendiente: solo la información básica de la cita. El detalle se completa al iniciar y finalizar."}
            </p>
            <ReadonlyField label="Asesor" value={nombreAsesor} />
            <ReadonlyField label="Empresa" value={empresa !== "—" ? empresa : ""} />
            <ReadonlyField label="Fecha" value={visualFh.fecha} />
            <ReadonlyField label="Hora" value={visualFh.hora} />
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadonlyField label="Asesor" value={nombreAsesor} />
              <ReadonlyField label="NIT" value={dv?.nit} />
              <ReadonlyField label="Encargado" value={dv?.nombreEncargado} />
              <ReadonlyField label="Cargo encargado" value={dv?.cargoEncargado} />
              <ReadonlyField label="Tipo de visita" value={dv?.tipoVisita} />
              <ReadonlyField label="Municipio" value={dv?.municipio} />
              <ReadonlyField label="Dirección" value={dv?.direccionEmpresa} />
              <ReadonlyField label="Vehículo" value={dv?.tipoVehiculo} />
            </div>

            <div className="mt-4">
              <ReadonlyField label="Observaciones" value={dv?.observaciones} />
            </div>

            {esRealizada && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#98989A]">Ubicación</p>
                {geoParsed ? (
                  <>
                    <VisitaUbicacionMapa
                      lat={geoParsed.lat}
                      lng={geoParsed.lng}
                      title={empresa !== "—" ? empresa : "Visita"}
                    />
                    <a
                      href={`https://www.google.com/maps?q=${geoParsed.lat},${geoParsed.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs font-semibold text-[#1C355E] dark:text-[#FFCD00] hover:underline"
                    >
                      Abrir en Google Maps
                    </a>
                  </>
                ) : (
                  <p className="rounded-xl border border-dashed border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-[#0f1c2e] px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                    No se registró ubicación para esta visita.
                  </p>
                )}
              </div>
            )}

            <div className="mt-6">
              <p className="text-xs font-bold text-[#98989A] dark:text-slate-400 uppercase tracking-widest mb-2">
                {tareasEditable ? "Tareas (marca las completadas)" : "Tareas pendientes"}
              </p>
              {tareas.length > 0 ? (
                <div className="space-y-2">
                  {tareas.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-slate-600 bg-gray-50 dark:bg-[#0f1c2e]"
                    >
                      {tareasEditable ? (
                        <label className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-90">
                          <input
                            type="checkbox"
                            checked={!!t?.done}
                            onChange={() => onTareaToggle?.(idx)}
                            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-slate-500 text-[#1C355E] focus:ring-[#1C355E]"
                          />
                          <span
                            className={`text-sm font-semibold break-words flex-1 ${
                              t?.done ? "text-gray-500 dark:text-slate-400 line-through" : "text-gray-700 dark:text-slate-200"
                            }`}
                          >
                            {t?.texto || "—"}
                          </span>
                        </label>
                      ) : (
                        <>
                          <span
                            className={`mt-0.5 text-xs font-black ${t?.done ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-slate-500"}`}
                          >
                            {t?.done ? "✓" : "•"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-semibold break-words ${
                                t?.done ? "text-gray-500 dark:text-slate-400 line-through" : "text-gray-700 dark:text-slate-200"
                              }`}
                            >
                              {t?.texto || "—"}
                            </p>
                            {t?.marcadaPorAsesorAt && (
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                                Asesor marcó:{" "}
                                {(() => {
                                  try {
                                    const d = new Date(t.marcadaPorAsesorAt);
                                    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
                                  } catch {
                                    return "—";
                                  }
                                })()}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-slate-500">—</p>
              )}
            </div>
          </>
        )}

        {footerActions ? (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-600">{footerActions}</div>
        ) : null}
      </div>
    </Modal>
  );
}
