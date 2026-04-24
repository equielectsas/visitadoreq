"use client";

/**
 * /dashboard/asesor/citas/page.jsx  (también renderizado desde /dashboard/asesor/page principal
 *  cuando el asesor gestiona sus visitas)
 *
 * Lógica completa:
 * - No hay "perdidas": las citas se REPROGRAMAN
 * - Botón INICIAR → modal de detalles con búsqueda de empresa
 * - Botón REPROGRAMAR → cambia fecha/hora
 * - Modal detalles: búsqueda empresa (por NIT o nombre), autocompletado datos,
 *   cargo del encargado (no cédula), Tareas Pendientes con checkboxes
 * - Solo puede editar el DESARROLLADOR los datos ingresados
 */

import { useState, useEffect, useRef } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";
import { MUNICIPIOS_COLOMBIA } from "@/utils/municipiosColombia";

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const PlayIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ReprogramarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v4l2 2" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const BikeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" />
    <path strokeLinecap="round" d="M15 6h-3l-3 8m0 0l2.5-5H15m-6 5h9" />
  </svg>
);
const CarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 6H5l-2 6h18l-2-6h-6zm-4 6v5m8-5v5" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const CalIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const HistoryIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const TaskIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TIPO_VISITA = [
  "Prueba de visita",
  "Visita técnica-comercial",
  "Levantamiento de Base instalada",
  "Especificación de producto",
];

const ESTADO_CONFIG = {
  pendiente:    { label: "Pendiente",    cls: "bg-yellow-100 text-yellow-700"  },
  activa:       { label: "Activa",       cls: "bg-emerald-100 text-emerald-700" },
  realizada:    { label: "Realizada",    cls: "bg-blue-100 text-blue-700"      },
  reprogramada: { label: "Reprogramada", cls: "bg-purple-100 text-purple-700"  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS / SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Modal({ show, onClose, children, wide = false }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 bg-white rounded-3xl shadow-2xl w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[92vh] overflow-y-auto`}>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, required, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
          focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, options, required, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
          focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
        {...props}
      >
        <option value="">Seleccionar...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ReadonlyField({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
      <div className="w-full px-4 py-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 text-sm font-medium text-gray-400 select-none">
        {value || "—"}
      </div>
    </div>
  );
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-lg bg-[#1C355E] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">{number}</span>
      </div>
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY SEARCH
// ─────────────────────────────────────────────────────────────────────────────
function EmpresaSearch({ onSelect, clientes }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen]       = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (val) => {
    setQuery(val);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    const q = val.toLowerCase();
    const found = clientes.filter(
      c => c.nombre?.toLowerCase().includes(q) || c.nit?.toLowerCase().includes(q)
    ).slice(0, 8);
    setResults(found);
    setOpen(found.length > 0);
  };

  const handleSelect = (empresa) => {
    setQuery(empresa.nombre);
    setOpen(false);
    onSelect(empresa);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Buscar empresa <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => query && setOpen(results.length > 0)}
            placeholder="Buscar por nombre o NIT..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
              focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
        </div>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {results.map((empresa, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(empresa)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#1C355E]/5 transition-colors text-left border-b border-gray-50 last:border-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1C355E]/10 flex items-center justify-center flex-shrink-0 text-[#1C355E] text-xs font-black">
                {empresa.nombre?.charAt(0) || "E"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{empresa.nombre}</p>
                <p className="text-xs text-gray-400">NIT: {empresa.nit || "—"} · {empresa.ciudad || empresa.municipio || "—"}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {open && results.length === 0 && query.trim() && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3">
          <p className="text-xs text-gray-400 text-center">No se encontraron empresas con "{query}"</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOLOCATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function GeoModal({ show, onClose, onSuccess }) {
  const [step, setStep]     = useState("ask");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!show) { setStep("ask"); setCoords(null); }
  }, [show]);

  const requestGeo = () => {
    setStep("finding");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) });
        setStep("found");
      },
      () => setStep("denied"),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-7">
        {step === "ask" && (
          <div className="text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-[#1C355E]/8 flex items-center justify-center mx-auto">
              <LocationIcon />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Compartir ubicación</h3>
              <p className="text-sm text-gray-500 mt-1">Necesitamos tu ubicación para registrar la visita correctamente.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">Cancelar</button>
              <button onClick={requestGeo} className="flex-1 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d]">Aceptar</button>
            </div>
          </div>
        )}
        {step === "finding" && (
          <div className="text-center space-y-6 py-4">
            <div className="relative w-28 h-28 mx-auto">
              <div className="w-28 h-28 rounded-full border-4 border-[#1C355E]/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-blue-400 rounded-full" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCD00] animate-spin" />
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#FFCD00] flex items-center justify-center shadow-lg animate-bounce">
                <LocationIcon />
              </div>
            </div>
            <p className="font-bold text-gray-800">Encontrando tu ubicación...</p>
          </div>
        )}
        {step === "found" && coords && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckIcon />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">¡Ubicación encontrada!</p>
                <p className="text-xs text-gray-400">Precisión: ±{coords.accuracy}m</p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-44">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005},${coords.lat - 0.005},${coords.lng + 0.005},${coords.lat + 0.005}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
                className="w-full h-full border-0" title="Tu ubicación"
              />
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-2 text-xs font-mono text-gray-500">
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </div>
            <button onClick={() => { onSuccess(coords); onClose(); }}
              className="w-full py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d]">
              Confirmar ubicación
            </button>
          </div>
        )}
        {step === "denied" && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <p className="font-bold text-gray-800">Acceso denegado</p>
              <p className="text-xs text-gray-500 mt-1">Activa la ubicación en tu navegador e intenta de nuevo.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500">Cerrar</button>
              <button onClick={requestGeo} className="flex-1 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm">Reintentar</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAREAS PENDIENTES (CREATE TP)
// ─────────────────────────────────────────────────────────────────────────────
function TareasPendientes({ tareas, onSave }) {
  const [open, setOpen]       = useState(false);
  const [inputs, setInputs]   = useState([""]);
  const [locked, setLocked]   = useState(tareas && tareas.length > 0);

  useEffect(() => {
    if (tareas && tareas.length > 0) {
      setInputs(tareas.map(t => t.texto));
      setLocked(true);
    }
  }, []);

  const handleChange = (i, val) => {
    const updated = [...inputs];
    updated[i] = val;
    setInputs(updated);
  };

  const handleAdd = () => setInputs(prev => [...prev, ""]);

  const handleSave = () => {
    const valid = inputs.filter(t => t.trim());
    if (valid.length === 0) return;
    const tasks = valid.map(texto => ({ texto, done: false }));
    onSave(tasks);
    setLocked(true);
    setOpen(false);
  };

  if (locked && tareas && tareas.length > 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 flex items-center gap-1.5">
            <TaskIcon /> Tareas pendientes ({tareas.filter(t => t.done).length}/{tareas.length} completadas)
          </p>
        </div>
        <div className="space-y-2">
          {tareas.map((t, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${t.done ? "bg-emerald-50 border-emerald-100 opacity-70" : "bg-gray-50 border-gray-100"}`}>
              <input type="checkbox" checked={!!t.done} readOnly className="w-4 h-4 accent-[#1C355E]" />
              <span className={`text-sm font-medium ${t.done ? "line-through text-gray-400" : "text-gray-700"}`}>{t.texto}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#1C355E]/30 text-[#1C355E]
            text-sm font-bold hover:bg-[#1C355E]/5 hover:border-[#1C355E]/50 transition-all w-full justify-center">
          <TaskIcon /> CREAR TP (Tareas Pendientes)
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#1C355E] flex items-center justify-center">
              <TaskIcon />
            </div>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Tareas Pendientes</p>
          </div>
          {inputs.map((inp, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex items-center justify-center w-6 h-10 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFCD00]" />
              </div>
              <input
                type="text"
                value={inp}
                onChange={e => handleChange(i, e.target.value)}
                placeholder={`Tarea ${i + 1} — ej: Llamar el 15 a contacto...`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
              />
            </div>
          ))}
          {/* Add another */}
          <button type="button" onClick={handleAdd}
            className="flex items-center gap-2 text-xs font-semibold text-[#1C355E] hover:text-[#FFCD00] transition-colors pl-8">
            <PlusIcon /> Crear otro
          </button>
          {/* Done */}
          <button type="button" onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] transition-all flex items-center justify-center gap-2">
            <CheckIcon /> Listo — Guardar tareas
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VISITAS PASADAS MODAL
// ─────────────────────────────────────────────────────────────────────────────
function VisitasPasadasModal({ show, onClose, empresa, visitasFinalizadas }) {
  const pasadas = visitasFinalizadas.filter(
    v => (v.datosVisita?.nombreEmpresa || v.cliente)?.toLowerCase() === empresa?.toLowerCase()
  );
  return (
    <Modal show={show} onClose={onClose} wide>
      <div className="p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Visitas pasadas</h3>
            <p className="text-xs text-gray-400 mt-0.5">{empresa}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <CloseIcon />
          </button>
        </div>
        {pasadas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-sm">No hay visitas previas para esta empresa</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pasadas.map(v => (
              <div key={v.id} className="border border-gray-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">{v.datosVisita?.tipoVisita || "Visita"}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Realizada</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <span>📅 {v.fecha} {v.hora}</span>
                  <span>📍 {v.datosVisita?.municipio || "—"}</span>
                  <span>🚗 {v.datosVisita?.tipoVehiculo || "—"}</span>
                  <span>🧑‍💼 {v.asesorNombre}</span>
                </div>
                {v.datosVisita?.observaciones && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-[#FFCD00]">
                    {v.datosVisita.observaciones}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETALLES VISITA MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DetallesVisitaModal({ show, onClose, cita, user, onFinalizar, visitasFinalizadas, clientes }) {
  const emptyForm = {
    nit: "", nombreEmpresa: "", nombreEncargado: "", cargoEncargado: "",
    tipoVisita: "", observaciones: "", municipio: "", tipoVehiculo: "",
    direccionEmpresa: "",
  };
  const [form, setForm]           = useState(emptyForm);
  const [tareas, setTareas]       = useState([]);
  const [geoCoords, setGeoCoords] = useState(null);
  const [showGeo, setShowGeo]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasadas, setShowPasadas] = useState(false);
  const [errors, setErrors]       = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  useEffect(() => {
    if (show) {
      setForm({ ...emptyForm, nombreEmpresa: cita?.cliente || "" });
      setTareas([]); setErrors([]); setGeoCoords(null); setEmpresaSeleccionada(null);
    }
  }, [show, cita]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleEmpresaSelect = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setForm(f => ({
      ...f,
      nit:             empresa.nit      || "",
      nombreEmpresa:   empresa.nombre   || "",
      direccionEmpresa:empresa.direccion || empresa.ciudad || "",
    }));
  };

  const validate = () => {
    const required = ["nombreEmpresa", "nombreEncargado", "cargoEncargado", "tipoVisita", "municipio", "tipoVehiculo"];
    const missing  = required.filter(k => !form[k]?.trim());
    if (!geoCoords) missing.push("geolocalización");
    return missing;
  };

  const handleFinalizar = () => {
    const missing = validate();
    if (missing.length) { setErrors(missing); return; }
    setErrors([]);
    setShowConfirm(true);
  };

  const confirmarFinalizar = () => {
    setShowConfirm(false);
    onFinalizar({ ...form, geoCoords, tareasPendientes: tareas });
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-7 py-5 rounded-t-3xl flex items-center justify-between z-10">
            <div>
              <h2 className="text-lg font-bold text-[#1C355E]">Detalle de Visita</h2>
              <p className="text-xs text-gray-400 mt-0.5">{cita?.cliente} · {cita?.fecha} {cita?.hora}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center">
              <CloseIcon />
            </button>
          </div>

          <div className="px-7 py-6 space-y-7">

            {/* 1. DATOS ASESOR */}
            <section>
              <SectionHeader number="1" title="Datos del Asesor" />
              <div className="grid grid-cols-2 gap-3">
                <ReadonlyField label="Nombres"   value={user?.nombres || user?.nombre?.split(" ").slice(0,2).join(" ")} />
                <ReadonlyField label="Apellidos" value={user?.apellidos || user?.nombre?.split(" ").slice(2).join(" ")} />
                <ReadonlyField label="Cédula"    value={user?.cedula} />
              </div>
            </section>

            {/* 2. EMPRESA — búsqueda inteligente */}
            <section>
              <SectionHeader number="2" title="Datos de la Empresa" />
              <div className="space-y-3">
                <EmpresaSearch onSelect={handleEmpresaSelect} clientes={clientes} />

                {/* Autocompletados (read-only si hay empresa seleccionada) */}
                <div className="grid grid-cols-2 gap-3">
                  <ReadonlyField label="NIT"       value={form.nit} />
                  <ReadonlyField label="Dirección" value={form.direccionEmpresa} />
                </div>

                {/* Encargado */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Nombre del encargado" required placeholder="Nombre completo"
                    value={form.nombreEncargado} onChange={e => set("nombreEncargado", e.target.value)} />
                  <InputField label="Cargo del encargado" required placeholder="Ej: Gerente, Jefe de compras..."
                    value={form.cargoEncargado} onChange={e => set("cargoEncargado", e.target.value)} />
                </div>
              </div>
            </section>

            {/* 3. DETALLES VISITA */}
            <section>
              <SectionHeader number="3" title="Detalles de Visita" />
              <div className="space-y-3">
                <SelectField label="Tipo de visita" required options={TIPO_VISITA}
                  value={form.tipoVisita} onChange={e => set("tipoVisita", e.target.value)} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Observaciones</label>
                  <textarea rows={3} value={form.observaciones} onChange={e => set("observaciones", e.target.value)}
                    placeholder="Describe los puntos clave de la visita..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all resize-none" />
                </div>
                <SelectField label="Municipio" required options={MUNICIPIOS_COLOMBIA}
                  value={form.municipio} onChange={e => set("municipio", e.target.value)} />
                {/* Vehículo */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de vehículo <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ value: "Motocicleta", icon: <BikeIcon /> }, { value: "Carro", icon: <CarIcon /> }].map(({ value, icon }) => (
                      <button key={value} type="button" onClick={() => set("tipoVehiculo", value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                          ${form.tipoVehiculo === value ? "border-[#1C355E] bg-[#1C355E]/5 text-[#1C355E]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                        {icon} {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 4. TAREAS PENDIENTES */}
            <section>
              <SectionHeader number="4" title="Tareas Pendientes" />
              <TareasPendientes tareas={tareas} onSave={setTareas} />
            </section>

            {/* 5. GEOLOCALIZACIÓN */}
            <section>
              <SectionHeader number="5" title="Geolocalización" />
              {!geoCoords ? (
                <button type="button" onClick={() => setShowGeo(true)}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-3
                    text-sm font-semibold text-gray-400 hover:border-[#1C355E] hover:text-[#1C355E] hover:bg-[#1C355E]/3 transition-all">
                  <LocationIcon /> Capturar mi ubicación actual
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl">
                    <CheckIcon /> Ubicación capturada
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-40">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${geoCoords.lng - 0.004},${geoCoords.lat - 0.004},${geoCoords.lng + 0.004},${geoCoords.lat + 0.004}&layer=mapnik&marker=${geoCoords.lat},${geoCoords.lng}`}
                      className="w-full h-full border-0" title="Ubicación"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-gray-400">{geoCoords.lat.toFixed(6)}, {geoCoords.lng.toFixed(6)}</p>
                    <button type="button" onClick={() => setShowGeo(true)} className="text-xs text-[#1C355E] font-semibold hover:underline">Actualizar</button>
                  </div>
                  {form.nombreEmpresa && (
                    <button type="button" onClick={() => setShowPasadas(true)}
                      className="text-xs font-semibold text-[#1C355E] underline underline-offset-2 flex items-center gap-1.5 hover:text-[#16294d] transition-colors">
                      <HistoryIcon /> Ver visitas pasadas de {form.nombreEmpresa}
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* ERRORS */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-red-600 mb-1">Campos incompletos:</p>
                <p className="text-xs text-red-500">{errors.join(", ")}</p>
              </div>
            )}

            {/* FINALIZAR */}
            <button type="button" onClick={handleFinalizar}
              className="w-full py-4 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] active:scale-[.98] transition-all shadow-lg shadow-[#1C355E]/25">
              Finalizar Visita
            </button>
          </div>
        </div>
      </div>

      <GeoModal show={showGeo} onClose={() => setShowGeo(false)} onSuccess={setGeoCoords} />
      <VisitasPasadasModal show={showPasadas} onClose={() => setShowPasadas(false)}
        empresa={form.nombreEmpresa} visitasFinalizadas={visitasFinalizadas} />

      {/* Confirm */}
      <Modal show={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">¿Seguro que quieres finalizar?</h3>
            <p className="text-sm text-gray-500 mt-1">Una vez confirmado no podrás editar los datos (solo el desarrollador).</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">No</button>
            <button onClick={confirmarFinalizar} className="flex-1 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d]">Sí, finalizar</button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPROGRAMAR MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ReprogramarModal({ show, onClose, cita, onSave }) {
  const [fecha, setFecha] = useState("");
  const [hora,  setHora]  = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (show) { setFecha(cita?.fecha || ""); setHora(cita?.hora || ""); setMotivo(""); }
  }, [show, cita]);

  const handleSave = () => {
    if (!fecha || !hora) return;
    onSave({ fecha, hora, motivo });
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#1C355E]">Reprogramar Visita</h3>
            <p className="text-xs text-gray-400 mt-0.5">{cita?.cliente}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <CloseIcon />
          </button>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
          <p className="text-xs text-purple-600 font-semibold">
            📅 Fecha actual: {cita?.fecha} a las {cita?.hora}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Nueva fecha" required type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          <InputField label="Nueva hora"  required type="time" value={hora}  onChange={e => setHora(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Motivo (opcional)</label>
          <textarea rows={2} value={motivo} onChange={e => setMotivo(e.target.value)}
            placeholder="¿Por qué se reprograma?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all" />
        </div>

        <button onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] transition-all">
          Guardar nueva fecha
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR CITA MODAL
// ─────────────────────────────────────────────────────────────────────────────
function CrearCitaModal({ show, onClose, user, onCreate, clientes }) {
  const empty = { cliente: "", telefono: "", fecha: "", hora: "" };
  const [form, setForm]   = useState(empty);
  const [created, setCreated] = useState(null);

  useEffect(() => { if (show) { setForm(empty); setCreated(null); } }, [show]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = (e) => {
    e.preventDefault();
    const nueva = { id: Date.now(), ...form, estado: "pendiente", asesorNombre: user?.nombre || "Asesor", asesorId: user?.id };
    onCreate(nueva);
    setCreated(nueva);
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-7">
        {!created ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#1C355E]">Nueva Visita</h3>
                <p className="text-xs text-gray-400 mt-0.5">Programa una visita empresarial</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <ReadonlyField label="Asesor" value={user?.nombre} />
              <InputField label="Empresa / Cliente" required placeholder="Empresa S.A.S." value={form.cliente} onChange={e => set("cliente", e.target.value)} />
              <InputField label="Celular de contacto" required placeholder="+57 300 000 0000" value={form.telefono} onChange={e => set("telefono", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Fecha" required type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} />
                <InputField label="Hora"  required type="time" value={form.hora}  onChange={e => set("hora", e.target.value)} />
              </div>
              <button type="submit"
                className="w-full py-4 rounded-xl bg-[#FFCD00] text-[#1C355E] font-bold text-sm hover:bg-yellow-400 active:scale-[.98] transition-all mt-2">
                Crear Visita
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-5 py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircleIcon />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">¡Visita creada!</h3>
              <p className="text-sm text-gray-500 mt-1">La visita ha sido confirmada y está disponible.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 border border-gray-100">
              {[["🏢", "Empresa", created.cliente], ["📱", "Celular", created.telefono], ["📅", "Fecha", created.fecha], ["⏰", "Hora", created.hora]].map(([icon, label, value]) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span>{icon}</span>
                  <span className="text-gray-400 min-w-[60px]">{label}</span>
                  <span className="font-semibold text-gray-700">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d]">Listo</button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INICIAR VISITA CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────
function IniciarVisitaModal({ show, onClose, cita, onConfirm }) {
  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-8 space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFCD00]/20 flex items-center justify-center mx-auto mb-4">
            <PlayIcon />
          </div>
          <h3 className="text-xl font-bold text-gray-800">¿Iniciar esta visita?</h3>
          <p className="text-sm text-gray-500 mt-1">Se abrirá el formulario de detalles para registrar la información.</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
          {[["🏢", "Empresa", cita?.cliente], ["📅", "Fecha", cita?.fecha], ["⏰", "Hora", cita?.hora]].map(([icon, label, value]) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span>{icon}</span>
              <span className="text-gray-400 min-w-[60px]">{label}</span>
              <span className="font-semibold text-gray-700">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">No</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-[#FFCD00] text-[#1C355E] font-bold text-sm hover:bg-yellow-400">Sí, iniciar</button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AsesorCitasPage() {
  const [user, setUser]     = useState(null);
  const [citas, setCitas]   = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("pendiente");

  // Modal states
  const [showCrear, setShowCrear]         = useState(false);
  const [showIniciar, setShowIniciar]     = useState(false);
  const [showDetalles, setShowDetalles]   = useState(false);
  const [showReprogramar, setShowReprogramar] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const visitasFinalizadas = citas.filter(c => c.estado === "realizada");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    const storedCitas = localStorage.getItem("equielect_citas");
    if (storedCitas) setCitas(JSON.parse(storedCitas));
    const storedClientes = localStorage.getItem("equielect_clientes");
    if (storedClientes) setClientes(JSON.parse(storedClientes));
  }, []);

  const saveCitas = (updated) => {
    setCitas(updated);
    localStorage.setItem("equielect_citas", JSON.stringify(updated));
  };

  const handleCrearCita = (nueva) => saveCitas([...citas, nueva]);

  const handleIniciarCita = (cita) => {
    setCitaSeleccionada(cita);
    setShowIniciar(true);
  };

  const confirmarIniciarCita = () => {
    setShowIniciar(false);
    const updated = citas.map(c => c.id === citaSeleccionada.id ? { ...c, estado: "activa" } : c);
    saveCitas(updated);
    setShowDetalles(true);
  };

  const handleFinalizarVisita = (datosVisita) => {
    const updated = citas.map(c =>
      c.id === citaSeleccionada.id ? { ...c, estado: "realizada", datosVisita } : c
    );
    saveCitas(updated);
    setCitaSeleccionada(null);
  };

  const handleReprogramar = ({ fecha, hora, motivo }) => {
    const updated = citas.map(c =>
      c.id === citaSeleccionada.id
        ? { ...c, fecha, hora, estado: "reprogramada", motivoReprogramacion: motivo }
        : c
    );
    saveCitas(updated);
    setCitaSeleccionada(null);
  };

  // Solo citas de este asesor
  const myCitas = citas.filter(c => c.asesorId === user?.id || c.asesorNombre === user?.nombre);
  const filtered = filtro === "todos" ? myCitas : myCitas.filter(c => c.estado === filtro);

  const stats = {
    pendientes:    myCitas.filter(c => c.estado === "pendiente").length,
    activas:       myCitas.filter(c => c.estado === "activa").length,
    realizadas:    myCitas.filter(c => c.estado === "realizada").length,
    reprogramadas: myCitas.filter(c => c.estado === "reprogramada").length,
  };

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay:.05s; } .fade-up-2 { animation-delay:.12s; }
        .fade-up-3 { animation-delay:.18s; } .fade-up-4 { animation-delay:.24s; }
      `}</style>

      <div className="space-y-7 pb-10">

        {/* HEADER */}
        <div className="fade-up flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Mis Visitas</p>
            <h1 className="text-2xl font-black text-gray-800 mt-0.5">Gestión de citas</h1>
          </div>
          <button onClick={() => setShowCrear(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFCD00] text-[#1C355E] font-bold text-sm
              hover:bg-yellow-400 active:scale-[.98] transition-all shadow-lg shadow-yellow-200">
            <PlusIcon /> Nueva Visita
          </button>
        </div>

        {/* STATS */}
        <div className="fade-up fade-up-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Pendientes",    value: stats.pendientes,    icon: "🕐", color: "border-yellow-100 bg-yellow-50" },
            { label: "Activas",       value: stats.activas,       icon: "🚀", color: "border-emerald-100 bg-emerald-50" },
            { label: "Realizadas",    value: stats.realizadas,    icon: "✅", color: "border-blue-100 bg-blue-50" },
            { label: "Reprogramadas", value: stats.reprogramadas, icon: "🔄", color: "border-purple-100 bg-purple-50" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className={`rounded-2xl p-5 border ${color} flex items-center gap-4`}>
              <div className="text-2xl">{icon}</div>
              <div>
                <p className="text-2xl font-black text-gray-800 leading-none">{value}</p>
                <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div className="fade-up fade-up-2 flex items-center gap-2 flex-wrap">
          {["todos", "pendiente", "activa", "realizada", "reprogramada"].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all
                ${filtro === f
                  ? "bg-[#1C355E] text-white shadow-lg shadow-[#1C355E]/25"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
              {f === "todos" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* LISTA */}
        <div className="fade-up fade-up-3 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-400 font-medium">No hay visitas {filtro !== "todos" ? `"${filtro}"` : ""}</p>
              <button onClick={() => setShowCrear(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#FFCD00] text-[#1C355E] text-sm font-bold hover:bg-yellow-400">
                Crear primera visita
              </button>
            </div>
          )}

          {filtered.map((cita, i) => (
            <div key={cita.id || i}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4 hover:border-gray-200 hover:shadow-sm transition-all"
              style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#1C355E]/8 flex items-center justify-center flex-shrink-0 text-lg">🏢</div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 truncate">{cita.cliente}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-400">
                    <span className="flex items-center gap-1"><CalIcon /> {cita.fecha}</span>
                    {cita.hora && <span>· {cita.hora}</span>}
                    {cita.estado === "reprogramada" && cita.motivoReprogramacion && (
                      <span className="text-purple-500 font-medium">· {cita.motivoReprogramacion}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <EstadoBadge estado={cita.estado} />

                {/* INICIAR — pendiente o reprogramada */}
                {(cita.estado === "pendiente" || cita.estado === "reprogramada") && (
                  <button onClick={() => handleIniciarCita(cita)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFCD00] text-[#1C355E] text-xs font-bold
                      hover:bg-yellow-400 active:scale-[.97] transition-all">
                    <PlayIcon /> Iniciar
                  </button>
                )}

                {/* REPROGRAMAR — pendiente o reprogramada */}
                {(cita.estado === "pendiente" || cita.estado === "reprogramada") && (
                  <button onClick={() => { setCitaSeleccionada(cita); setShowReprogramar(true); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold
                      hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 active:scale-[.97] transition-all">
                    <ReprogramarIcon /> Reprogramar
                  </button>
                )}

                {/* CONTINUAR — activa */}
                {cita.estado === "activa" && (
                  <button onClick={() => { setCitaSeleccionada(cita); setShowDetalles(true); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold
                      hover:bg-emerald-600 active:scale-[.97] transition-all">
                    Continuar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALES */}
      <CrearCitaModal show={showCrear} onClose={() => setShowCrear(false)} user={user} onCreate={handleCrearCita} clientes={clientes} />
      <IniciarVisitaModal show={showIniciar} onClose={() => setShowIniciar(false)} cita={citaSeleccionada} onConfirm={confirmarIniciarCita} />
      <DetallesVisitaModal
        show={showDetalles} onClose={() => setShowDetalles(false)}
        cita={citaSeleccionada} user={user}
        onFinalizar={handleFinalizarVisita}
        visitasFinalizadas={visitasFinalizadas}
        clientes={clientes}
      />
      <ReprogramarModal show={showReprogramar} onClose={() => setShowReprogramar(false)}
        cita={citaSeleccionada} onSave={handleReprogramar} />
    </LayoutDashboard>
  );
}
