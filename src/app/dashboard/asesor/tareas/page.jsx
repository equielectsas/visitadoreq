"use client";

import { useState, useEffect, useCallback } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

// ── Datos fake ────────────────────────────────────────────────────────────────
const TODAS_LAS_TAREAS = {
  1: [
    {
      id: 101,
      empresa: "Distribuidora Nacional S.A.S",
      nit: "900.123.456-7",
      ciudad: "Bogotá",
      telefono: "601 234 5678",
      contacto: "Luis Martínez",
      fechaVisita: "2025-04-20",
      completada: false,
      checkboxes: { presentacionProductos: true, demostracion: false, cotizacion: false, seguimientoPago: false, firmaContrato: false },
      notas: "Cliente interesado pero pendiente demo.",
    },
    {
      id: 102,
      empresa: "Grupo Logístico del Norte",
      nit: "700.456.789-1",
      ciudad: "Barranquilla",
      telefono: "605 456 7890",
      contacto: "Pedro Camacho",
      fechaVisita: "2025-04-22",
      completada: false,
      checkboxes: { presentacionProductos: false, demostracion: false, cotizacion: false, seguimientoPago: false, firmaContrato: false },
      notas: "",
    },
  ],
  2: [
    {
      id: 201,
      empresa: "Comercial Andina Ltda.",
      nit: "800.987.654-3",
      ciudad: "Medellín",
      telefono: "604 345 6789",
      contacto: "Sandra Ríos",
      fechaVisita: "2025-04-18",
      completada: true,
      checkboxes: { presentacionProductos: true, demostracion: true, cotizacion: true, seguimientoPago: true, firmaContrato: true },
      notas: "Completada exitosamente.",
    },
    {
      id: 202,
      empresa: "Inversiones del Pacífico",
      nit: "890.321.654-2",
      ciudad: "Cali",
      telefono: "602 111 2233",
      contacto: "Jorge Ospina",
      fechaVisita: "2025-04-25",
      completada: false,
      checkboxes: { presentacionProductos: true, demostracion: false, cotizacion: false, seguimientoPago: false, firmaContrato: false },
      notas: "",
    },
  ],
  3: [
    {
      id: 301,
      empresa: "Soluciones Tech Caribe",
      nit: "901.234.567-8",
      ciudad: "Cartagena",
      telefono: "605 567 8901",
      contacto: "Marcela Herrera",
      fechaVisita: "2025-04-15",
      completada: false,
      checkboxes: { presentacionProductos: true, demostracion: true, cotizacion: false, seguimientoPago: false, firmaContrato: false },
      notas: "Esperando aprobación de presupuesto.",
    },
  ],
};

const CHECKBOX_LABELS = {
  presentacionProductos: "Presentación de productos",
  demostracion:          "Demostración del sistema",
  cotizacion:            "Envío de cotización",
  seguimientoPago:       "Seguimiento de pago",
  firmaContrato:         "Firma de contrato",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const GRADIENTS = [
  "from-yellow-400 to-orange-400",
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
];
const getGradient = (str = "") => GRADIENTS[(str.charCodeAt(0) || 0) % GRADIENTS.length];
const countDone   = (chk) => Object.values(chk).filter(Boolean).length;
const isAllDone   = (chk) => Object.values(chk).every(Boolean);
const hasDiff     = (a, b) => Object.keys(a).some((k) => a[k] !== b[k]);
const diffCount   = (a, b) => Object.keys(a).filter((k) => a[k] !== b[k]).length;

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconCheck() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5" />
    </svg>
  );
}
function IconChevron({ open }) {
  return (
    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
    </svg>
  );
}
function IconSave() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4l-9 9-4-4" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path strokeLinecap="round" d="M5 7V5a3 3 0 016 0v2" />
    </svg>
  );
}
function IconList() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconCheckCircle() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="relative bg-white rounded-2xl p-4 sm:p-5 overflow-hidden border border-gray-100
      shadow-[0_2px_16px_-4px_rgba(28,53,94,0.10)] hover:shadow-[0_6px_28px_-4px_rgba(28,53,94,0.16)] transition-shadow duration-300">
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${accent}`} />
      <div className="flex items-start justify-between mt-1">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[10px] sm:text-xs font-semibold text-[#98989A] uppercase tracking-widest mb-1 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-[#1C355E] leading-none">{value}</p>
          {sub && <p className="text-[10px] sm:text-xs text-[#98989A] mt-1.5 font-medium">{sub}</p>}
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1C355E]/[0.06] flex items-center justify-center text-[#1C355E] flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function AvatarCircle({ name, size = "lg" }) {
  const initials = (name || "U").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  const sz = size === "lg" ? "w-14 h-14 text-lg" : size === "md" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${getGradient(name)} flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Fila expandible ───────────────────────────────────────────────────────────
function TareaRow({ tarea, rowState, onToggleOpen, onToggleCheck, onSave }) {
  const { saved, draft, open, savedAt } = rowState;
  const doneCount  = countDone(draft);
  const totalCount = Object.keys(draft).length;
  const pct        = Math.round((doneCount / totalCount) * 100);
  const readOnly   = isAllDone(saved);
  const hasChanges = hasDiff(draft, saved);
  const nChanges   = diffCount(draft, saved);
  const justSaved  = savedAt && Date.now() - savedAt < 2500;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all duration-200
      ${hasChanges ? "border-emerald-300 shadow-[0_0_0_1px_#6ee7b7]" : "border-gray-100"}
      ${open ? "shadow-[0_4px_20px_-4px_rgba(28,53,94,0.12)]" : "shadow-[0_1px_4px_-1px_rgba(28,53,94,0.08)]"}`}>

      {/* Fila principal */}
      <button
        onClick={onToggleOpen}
        className="w-full grid items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/70 transition-colors duration-150"
        style={{ gridTemplateColumns: "2.4fr 1.4fr 0.9fr 1fr 140px 20px" }}
      >
        {/* Empresa */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#98989A] uppercase tracking-widest mb-0.5 truncate">
            NIT {tarea.nit}
          </p>
          <p className="text-sm font-bold text-[#1C355E] leading-snug truncate">{tarea.empresa}</p>
        </div>

        {/* Asesor + Ciudad */}
        <div className="min-w-0">
          <p className="text-[13px] text-gray-700 font-medium truncate">{tarea.contacto}</p>
          <p className="text-[11px] text-[#98989A] truncate">{tarea.ciudad}</p>
        </div>

        {/* Fecha */}
        <p className="text-[12px] text-[#98989A] tabular-nums">{tarea.fechaVisita}</p>

        {/* Estado */}
        <div>
          {readOnly ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              ✓ Completada
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200">
              Pendiente
            </span>
          )}
        </div>

        {/* Progreso */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${readOnly ? "bg-emerald-400" : "bg-[#1C355E]"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-[#98989A] tabular-nums min-w-[28px] text-right">
            {pct}%
          </span>
        </div>

        <IconChevron open={open} />
      </button>

      {/* Cuerpo expandido */}
      {open && (
        <div className="border-t border-gray-100 px-5 pb-5">

          {/* Info extra */}
          <div className="grid grid-cols-4 gap-3 mt-4 mb-5">
            {[
              { label: "Teléfono",     value: tarea.telefono },
              { label: "Contacto",     value: tarea.contacto },
              { label: "Ciudad",       value: tarea.ciudad },
              { label: "Fecha visita", value: tarea.fechaVisita },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F4F6FA] rounded-xl px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#98989A] mb-0.5">{label}</p>
                <p className="text-[13px] font-semibold text-[#1C355E]">{value}</p>
              </div>
            ))}
          </div>

          {/* Actividades */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#98989A] mb-3">
            Actividades — {doneCount} de {totalCount} completadas
          </p>

          <div className="space-y-2">
            {Object.entries(CHECKBOX_LABELS).map(([key, label]) => {
              const checked    = draft[key];
              const wasChecked = saved[key];
              const changed    = checked !== wasChecked;

              return (
                <div
                  key={key}
                  onClick={() => !readOnly && onToggleCheck(key)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all duration-150
                    ${readOnly ? "cursor-default" : "cursor-pointer"}
                    ${changed
                      ? "bg-emerald-50/60 border-emerald-200"
                      : checked
                        ? "bg-gray-50 border-gray-100"
                        : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                    }`}
                >
                  {/* Checkbox visual */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150
                    ${checked ? "bg-emerald-400 text-white" : "bg-white border-2 border-gray-300 text-transparent"}`}>
                    <IconCheck />
                  </div>

                  <span className={`text-sm font-medium flex-1 transition-colors duration-150
                    ${checked ? "text-emerald-700 line-through decoration-emerald-300/60" : "text-gray-600"}`}>
                    {label}
                  </span>

                  {changed && !readOnly && (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                      {checked ? "+ marcada" : "− desmarcada"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Notas */}
          {tarea.notas && (
            <div className="mt-4 px-4 py-3 bg-[#F4F6FA] rounded-xl border-l-2 border-[#1C355E]/30">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#98989A] mb-1">Nota</p>
              <p className="text-sm text-gray-600 leading-relaxed">{tarea.notas}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            {readOnly ? (
              <div className="flex items-center gap-2 text-[12px] text-[#98989A]">
                <IconLock />
                <span>Todas las actividades completadas — solo lectura</span>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-gray-400">
                  {hasChanges ? (
                    <span>
                      <span className="font-semibold text-emerald-600">{nChanges} cambio{nChanges > 1 ? "s" : ""}</span>{" "}
                      sin guardar
                    </span>
                  ) : "Sin cambios pendientes"}
                </p>

                <div className="flex items-center gap-3">
                  {justSaved && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full ring-1 ring-emerald-200">
                      <IconSave /> Guardado
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onSave(); }}
                    disabled={!hasChanges}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-150
                      ${hasChanges
                        ? "bg-[#1C355E] text-white hover:bg-[#16294d] active:scale-[.98] shadow-sm hover:shadow-[0_4px_12px_-2px_rgba(28,53,94,0.4)]"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                      }`}
                  >
                    <IconSave />
                    Guardar cambios
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TareasAsesor() {
  const [user, setUser]         = useState(null);
  const [tareas, setTareas]     = useState([]);
  const [filterEstado, setFilt] = useState("todas");
  const [rowStates, setRowStates] = useState({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      setUser(u);
      const misTareas = TODAS_LAS_TAREAS[u?.id] ?? TODAS_LAS_TAREAS[1];
      setTareas(misTareas);
      const initial = {};
      misTareas.forEach((t) => {
        initial[t.id] = {
          saved: { ...t.checkboxes },
          draft: { ...t.checkboxes },
          open: false,
          savedAt: null,
        };
      });
      setRowStates(initial);
    } catch {
      const fallback = TODAS_LAS_TAREAS[1];
      setTareas(fallback);
      const initial = {};
      fallback.forEach((t) => {
        initial[t.id] = { saved: { ...t.checkboxes }, draft: { ...t.checkboxes }, open: false, savedAt: null };
      });
      setRowStates(initial);
    }
  }, []);

  const toggleOpen = useCallback((id) => {
    setRowStates((prev) => ({ ...prev, [id]: { ...prev[id], open: !prev[id].open } }));
  }, []);

  const toggleCheck = useCallback((id, key) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        draft: { ...prev[id].draft, [key]: !prev[id].draft[key] },
      },
    }));
  }, []);

  const saveRow = useCallback((id) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        saved: { ...prev[id].draft },
        savedAt: Date.now(),
      },
    }));
    // TODO: await api.patch(`/tareas/${id}`, { checkboxes: rowStates[id].draft })
  }, []);

  const tabs = [
    { key: "todas",       label: "Todas" },
    { key: "pendientes",  label: "Pendientes" },
    { key: "completadas", label: "Completadas" },
  ];

  const filtered = tareas.filter((t) => {
    if (filterEstado === "todas") return true;
    const done = rowStates[t.id] ? isAllDone(rowStates[t.id].saved) : t.completada;
    return filterEstado === "completadas" ? done : !done;
  });

  const totalPendientes  = tareas.filter((t) => rowStates[t.id] ? !isAllDone(rowStates[t.id].saved) : !t.completada).length;
  const totalCompletadas = tareas.filter((t) => rowStates[t.id] ?  isAllDone(rowStates[t.id].saved) : t.completada).length;
  const totalActDone     = tareas.reduce((acc, t) => acc + countDone(rowStates[t.id]?.saved ?? t.checkboxes), 0);
  const totalActMax      = tareas.reduce((acc, t) => acc + Object.keys(t.checkboxes).length, 0);
  const pctGlobal        = totalActMax > 0 ? Math.round((totalActDone / totalActMax) * 100) : 0;
  const nombre           = user?.nombre ?? "Asesor";

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay:.04s } .fade-up-2 { animation-delay:.08s }
        .fade-up-3 { animation-delay:.12s } .fade-up-4 { animation-delay:.16s }
        .fade-up-5 { animation-delay:.20s } .fade-up-6 { animation-delay:.24s }
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <main className="flex-1 bg-[#F4F6FA] p-4 sm:p-6 md:p-8 min-h-screen">

        {/* Hero header */}
        <div className="fade-up fade-up-1 mb-5 sm:mb-7">
          <div className="bg-white rounded-2xl border border-gray-100
            shadow-[0_2px_16px_-4px_rgba(28,53,94,0.10)] p-5 sm:p-6
            flex flex-col sm:flex-row sm:items-center gap-4">
            <AvatarCircle name={nombre} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#98989A] mb-0.5">
                Mis tareas asignadas
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-[#1C355E] leading-tight truncate">
                Hola, {nombre.split(" ")[0]} 👋
              </h1>
              <p className="text-xs text-[#98989A] mt-1">
                Tienes{" "}
                <span className="font-bold text-[#1C355E]">{totalPendientes}</span>{" "}
                tarea{totalPendientes !== 1 ? "s" : ""} pendiente{totalPendientes !== 1 ? "s" : ""}
                {totalPendientes > 0 ? " por completar" : " — ¡todo al día!"}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-3 bg-[#F4F6FA] rounded-xl px-4 py-3 border border-gray-100">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#98989A]">Progreso global</p>
                <p className="text-2xl font-black text-[#1C355E]">{pctGlobal}%</p>
              </div>
              <div className="w-10 h-10 relative flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3.2" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1C355E" strokeWidth="3.2"
                    strokeDasharray={`${pctGlobal} ${100 - pctGlobal}`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-[#1C355E]">
                  {pctGlobal}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
          {[
            { icon: <IconList />,        label: "Mis visitas",  value: tareas.length,                    sub: "en total",      accent: "bg-[#1C355E]" },
            { icon: <IconClock />,       label: "Pendientes",   value: totalPendientes,                  sub: "por completar", accent: "bg-[#FFCD00]" },
            { icon: <IconCheckCircle />, label: "Completadas",  value: totalCompletadas,                 sub: "finalizadas",   accent: "bg-emerald-400" },
            { icon: <IconStar />,        label: "Actividades",  value: `${totalActDone}/${totalActMax}`, sub: "realizadas",    accent: "bg-[#98989A]/60" },
          ].map((c, i) => (
            <div key={c.label} className={`fade-up fade-up-${i + 1}`}>
              <StatCard {...c} />
            </div>
          ))}
        </div>

        {/* Lista */}
        <div className="fade-up fade-up-5">
          {/* Barra de filtros */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#98989A]">Mis tareas</p>
              <p className="text-base font-black text-[#1C355E]">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilt(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap
                    ${filterEstado === t.key
                      ? "bg-[#1C355E] text-white shadow-sm"
                      : "text-[#98989A] hover:text-[#1C355E]"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Encabezados de columna */}
          <div
            className="hidden sm:grid items-center gap-3 px-5 pb-2 border-b border-gray-100 mb-2"
            style={{ gridTemplateColumns: "2.4fr 1.4fr 0.9fr 1fr 140px 20px" }}
          >
            {["Cliente", "Asesor / Ciudad", "Fecha", "Estado", "Actividades", ""].map((h) => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#98989A]">{h}</span>
            ))}
          </div>

          {/* Filas */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-14 text-center
              shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)]">
              <p className="text-3xl mb-3">🎉</p>
              <p className="text-sm font-bold text-[#1C355E]">
                {filterEstado === "pendientes" ? "¡Sin pendientes! Todo al día." : "No hay tareas aquí."}
              </p>
              <p className="text-xs text-[#98989A] mt-1">Cambia el filtro para ver otras tareas</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((tarea, i) => (
                rowStates[tarea.id] && (
                  <div key={tarea.id} className="fade-up" style={{ animationDelay: `${0.04 + i * 0.06}s` }}>
                    <TareaRow
                      tarea={tarea}
                      rowState={rowStates[tarea.id]}
                      onToggleOpen={() => toggleOpen(tarea.id)}
                      onToggleCheck={(key) => toggleCheck(tarea.id, key)}
                      onSave={() => saveRow(tarea.id)}
                    />
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        <div className="fade-up fade-up-6 mt-8 text-center">
          <p className="text-[10px] sm:text-xs text-[#98989A] font-medium">Equielect · Mis Tareas · v3.0.0</p>
        </div>
      </main>
    </LayoutDashboard>
  );
}
