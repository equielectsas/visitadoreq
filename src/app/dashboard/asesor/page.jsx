"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import LayoutDashboard from "@/components/LayoutDashboard";
import VisualizarVisitaModal, { EstadoBadge } from "@/components/VisualizarVisitaModal";
import { fechaHoraCierreLocal, fechaHoraVisualDesdeVisita, normalizarVisitaAsesorNombre } from "@/utils/visitasHelpers";
import { MUNICIPIOS_COLOMBIA } from "@/utils/municipiosColombia";
import { chequeoCumpleParaCerrarVisita } from "@/utils/chequeoVehiculoStorage";

function notifyVisitasUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("visitas-updated"));
}

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
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
const BusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20M7 19v2M17 19v2" />
    <circle cx="7" cy="15" r="1" fill="currentColor" />
    <circle cx="17" cy="15" r="1" fill="currentColor" />
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
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);
const UserCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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

function normalizarNombreEmpresa(s) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Solo dígitos, para comparar NIT entre sucursales/puntos del mismo cliente. */
function normalizarNitCompare(s) {
  return String(s ?? "").replace(/\D/g, "");
}

/** Clave localStorage del borrador de “Continuar visita” (una visita activa por id). */
function getVisitaDraftStorageKey(user, visitaId) {
  const id = visitaId != null && visitaId !== "" ? String(visitaId) : "";
  if (!id) return "";
  return `equielect_visita_draft_v1_${user?.cedula || "anon"}_${id}`;
}

/** Contacto guardado con empresaId / empresaNombre o solo empresa (legado). */
function contactoPerteneceAEmpresa(c, empresaId, nombreEmpresa) {
  const ne = normalizarNombreEmpresa(nombreEmpresa);
  if (empresaId && c?.empresaId != null && String(c.empresaId) === String(empresaId)) return true;
  if (ne) {
    if (normalizarNombreEmpresa(c.empresaNombre) === ne) return true;
    if (normalizarNombreEmpresa(c.empresa) === ne) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// PEQUEÑOS HELPERS UI
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

function InputField({ label, required, fieldValid, className = "", ...props }) {
  const border =
    fieldValid === true
      ? "border-emerald-400 bg-emerald-50/70"
      : fieldValid === false
        ? "border-red-400 bg-red-50/50"
        : "border-gray-200 bg-gray-50";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800
          focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all ${border} ${className}`}
        {...props}
      />
    </div>
  );
}

function SelectField({ label, options, required, fieldValid, className = "", ...props }) {
  const border =
    fieldValid === true
      ? "border-emerald-400 bg-emerald-50/70"
      : fieldValid === false
        ? "border-red-400 bg-red-50/50"
        : "border-gray-200 bg-gray-50";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800
          focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all ${border} ${className}`}
        {...props}
      >
        <option value="">Seleccionar...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function normalizeMunicipioBusqueda(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Un solo campo: escribes y aparecen municipios; eliges uno de la lista (combobox). */
function MunicipioSearchField({ label, required, fieldValid, value, onValueChange, options }) {
  const border =
    fieldValid === true
      ? "border-emerald-400 bg-emerald-50/70"
      : fieldValid === false
        ? "border-red-400 bg-red-50/50"
        : "border-gray-200 bg-gray-50";
  const [inputText, setInputText] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setInputText(value || "");
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    const n = normalizeMunicipioBusqueda(inputText);
    if (n.length < 1) return [];
    return options.filter((o) => normalizeMunicipioBusqueda(o).includes(n)).slice(0, 100);
  }, [inputText, options]);

  const handleChange = (e) => {
    const v = e.target.value;
    setInputText(v);
    setOpen(true);
    if (!v.trim()) {
      onValueChange("");
      return;
    }
    if (value && v !== value) onValueChange("");
  };

  const pick = (m) => {
    onValueChange(m);
    setInputText(m);
    setOpen(false);
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      const t = inputText.trim();
      if (!t) {
        onValueChange("");
        return;
      }
      const exact = options.find((o) => normalizeMunicipioBusqueda(o) === normalizeMunicipioBusqueda(t));
      if (exact) onValueChange(exact);
      else if (value) setInputText(value);
      else {
        setInputText("");
        onValueChange("");
      }
    }, 120);
  };

  const nNorm = normalizeMunicipioBusqueda(inputText);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          autoComplete="off"
          placeholder="Buscar municipio…"
          value={inputText}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all ${border}`}
        />
        {open && (
          <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg max-h-56 overflow-y-auto">
            {nNorm.length < 1 ? (
              <p className="px-3 py-2.5 text-xs text-gray-500">Escribe letras del nombre para ver opciones.</p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-xs text-gray-500">No hay coincidencias. Sigue escribiendo o revisa el nombre.</p>
            ) : (
              <ul className="py-1">
                {filtered.map((m) => (
                  <li key={m}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(m);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-[#1C355E]/5 font-medium"
                    >
                      {m}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
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
// MODAL CREAR CONTACTO (vinculado a empresa + datos extendidos)
// ─────────────────────────────────────────────────────────────────────────────
function CrearContactoModal({ show, onClose, onCreated, empresaVinculo, nombreInicial = "" }) {
  const empNombre = (empresaVinculo?.nombre || "").trim();
  const empId = empresaVinculo?._id || "";
  const [form, setForm] = useState({
    nombre: "",
    cargo: "",
    telefono: "",
    correo: "",
    profesion: "",
    fechaCreacion: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (show) {
      const hoyStr = new Date().toISOString().split("T")[0];
      setForm({
        nombre: (nombreInicial || "").trim(),
        cargo: "",
        telefono: "",
        correo: "",
        profesion: "",
        fechaCreacion: hoyStr,
      });
      setDone(false);
      setFormError("");
    }
  }, [show, nombreInicial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!empNombre) {
      setFormError("Primero elige la empresa de la visita.");
      return;
    }
    if (!form.nombre.trim() || !form.cargo.trim() || !form.telefono.trim() || !form.correo.trim()) {
      setFormError("Completa todos los campos obligatorios.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      setFormError("Ingresa un correo electrónico válido.");
      return;
    }
    setFormError("");
    setSaving(true);
    const hoyStr = form.fechaCreacion || new Date().toISOString().split("T")[0];
    const prof = (form.profesion || "").trim();
    const nuevo = {
      id: Date.now(),
      nombre: form.nombre.trim(),
      cargo: form.cargo.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      profesion: prof,
      empresa: empNombre,
      empresaNombre: empNombre,
      empresaId: empId || null,
      fechaCreacion: hoyStr,
    };
    (async () => {
      try {
        const token = (() => {
          try {
            const u = JSON.parse(localStorage.getItem("user") || "null");
            return u?.token || localStorage.getItem("token");
          } catch {
            return localStorage.getItem("token");
          }
        })();
        const base = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${base.replace(/\/$/, "")}/clientes/${empId}/contactos`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({
            nombre: nuevo.nombre,
            cargo: nuevo.cargo,
            telefono: nuevo.telefono,
            email: nuevo.correo,
            ...(prof ? { notas: prof, profesion: prof } : { profesion: "" }),
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "No se pudo guardar el contacto");
        const createdList = Array.isArray(json?.contactos) ? json.contactos : [];
        const match = [...createdList].reverse().find(
          (c) =>
            String(c?.nombre || "").trim() === nuevo.nombre &&
            String(c?.telefono || "").trim() === nuevo.telefono
        );
        const last = match || createdList[createdList.length - 1];
        setSaving(false);
        setDone(true);
        setTimeout(() => {
          onCreated({ ...nuevo, _id: last?._id || null, id: last?._id || null });
          onClose();
        }, 900);
      } catch (e) {
        setSaving(false);
        setFormError(e.message || "No se pudo guardar el contacto");
      }
    })();
  };

  const canSave =
    empNombre &&
    form.nombre.trim() &&
    form.cargo.trim() &&
    form.telefono.trim() &&
    form.correo.trim();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        <div className="bg-gradient-to-br from-[#1C355E] to-[#16294d] px-6 py-5 flex items-center justify-between sticky top-0 z-[1]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <UserCircleIcon />
            </div>
            <div>
              <p className="text-white font-black text-base leading-tight">Nuevo contacto</p>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Vinculado a la empresa de la visita</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <CloseIcon />
          </button>
        </div>

        {!done ? (
          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Empresa vinculada</label>
              <div className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/80 text-sm font-semibold text-emerald-800">
                {empNombre || "— (elige empresa arriba en el detalle de visita)"}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Nombre completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Carlos Ramírez Pérez"
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Cargo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Jefe de compras"
                  value={form.cargo}
                  onChange={(e) => set("cargo", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Profesión <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ingeniero industrial"
                  value={form.profesion}
                  onChange={(e) => set("profesion", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Teléfono <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ej: 3001234567"
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Correo <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="correo@empresa.com"
                  value={form.correo}
                  onChange={(e) => set("correo", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fecha de registro</label>
              <div className="w-full px-4 py-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 text-sm font-medium text-gray-400 flex items-center gap-2">
                <CalIcon />
                {new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-semibold text-red-600">{formError}</div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave || saving}
                className="flex-1 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm
                  hover:bg-[#16294d] disabled:opacity-40 disabled:cursor-not-allowed
                  active:scale-[.98] transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <CheckIcon /> Guardar contacto
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircleIcon />
            </div>
            <div>
              <p className="font-black text-gray-800 text-lg">¡Contacto creado!</p>
              <p className="text-sm text-gray-400 mt-1">{form.nombre} quedó vinculado a {empNombre}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL EDITAR CONTACTO
// ─────────────────────────────────────────────────────────────────────────────
function EditarContactoModal({ show, onClose, contacto, empresaVinculo, onSaved }) {
  const empNombre = (empresaVinculo?.nombre || "").trim();
  const empId = empresaVinculo?._id || "";
  const [form, setForm] = useState({
    nombre: "",
    cargo: "",
    telefono: "",
    correo: "",
    profesion: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (show && contacto) {
      setForm({
        nombre: contacto.nombre || "",
        cargo: contacto.cargo || "",
        telefono: contacto.telefono || "",
        correo: contacto.correo || contacto.email || "",
        profesion: contacto.profesion || "",
      });
      setFormError("");
    }
  }, [show, contacto]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!contacto?._id) return;
    if (!form.nombre.trim() || !form.cargo.trim() || !form.telefono.trim() || !form.correo.trim()) {
      setFormError("Completa todos los campos obligatorios.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      setFormError("Ingresa un correo electrónico válido.");
      return;
    }
    if (!empNombre) {
      setFormError("La empresa de la visita es obligatoria para mantener el vínculo.");
      return;
    }
    setFormError("");
    setSaving(true);
    const token = (() => {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        return u?.token || localStorage.getItem("token");
      } catch {
        return localStorage.getItem("token");
      }
    })();
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || "";
        const prof = (form.profesion || "").trim();
        const res = await fetch(`${base.replace(/\/$/, "")}/clientes/${empId}/contactos/${contacto._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({
            nombre: form.nombre.trim(),
            cargo: form.cargo.trim(),
            telefono: form.telefono.trim(),
            email: form.correo.trim(),
            ...(prof ? { notas: prof, profesion: prof } : { profesion: "" }),
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "No se pudo actualizar");
        setSaving(false);
        // backend devuelve lista completa
        const list = Array.isArray(json?.contactos) ? json.contactos : [];
        const updated = list.find((c) => String(c._id) === String(contacto._id)) || null;
        onSaved({ ...contacto, ...updated, profesion: (form.profesion || "").trim(), correo: form.correo.trim() });
        onClose();
      } catch (e) {
        setSaving(false);
        setFormError(e.message || "No se pudo actualizar");
      }
    })();
  };

  const canSave =
    empNombre &&
    form.nombre.trim() &&
    form.cargo.trim() &&
    form.telefono.trim() &&
    form.correo.trim();

  if (!show || !contacto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-[#1C355E] to-[#16294d] px-6 py-5 flex items-center justify-between sticky top-0 z-[1]">
          <div>
            <p className="text-white font-black text-base leading-tight">Editar contacto</p>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mt-0.5">{empNombre}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Nombre completo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Cargo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.cargo}
                onChange={(e) => set("cargo", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Profesión <span className="text-gray-400 font-normal normal-case">(opcional)</span>
              </label>
              <input
                type="text"
                value={form.profesion}
                onChange={(e) => set("profesion", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Teléfono <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => set("telefono", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Correo <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.correo}
                onChange={(e) => set("correo", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
              />
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-semibold text-red-600">{formError}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              className="flex-1 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><SaveIcon /> Guardar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUSCADOR DE CONTACTO — prioriza contactos vinculados a la empresa de la visita
// ─────────────────────────────────────────────────────────────────────────────
function ContactoSearch({
  onSelect,
  empresaId,
  empresaNombre,
  empresaContextKey,
  onOpenCrear,
  onOpenEditar,
  defaultQuery = "",
  selectedContactoId = "",
  /** Si el contacto no está en la lista de esta sucursal, mostrar igual el chip (mismo NIT, otra sede). */
  selectedContactoFallback = null,
  fieldValid,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [contactos, setContactos] = useState([]);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);
  const prevEmpresaKey = useRef(null);

  const normalizeContacto = (c) =>
    c && typeof c === "object"
      ? { ...c, correo: c.correo ?? c.email ?? "" }
      : c;

  // Sincronizar el texto con el valor actual del formulario (incluye limpiar al borrar)
  useEffect(() => {
    setQuery(defaultQuery ?? "");
  }, [defaultQuery]);

  const loadContactos = async (qOverride = null) => {
    try {
      const token = (() => {
        try {
          const u = JSON.parse(localStorage.getItem("user") || "null");
          return u?.token || localStorage.getItem("token");
        } catch {
          return localStorage.getItem("token");
        }
      })();
      if (!empresaId) { setContactos([]); return; }
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${base.replace(/\/$/, "")}/clientes/${empresaId}/contactos`, {
        headers: { Authorization: token },
      });
      const json = await res.json().catch(() => ({}));
      const raw = Array.isArray(json?.contactos) ? json.contactos : [];
      const list = raw.map(normalizeContacto);
      const qVal = (qOverride != null ? qOverride : query || "").trim().toLowerCase();
      const filtered = !qVal
        ? list
        : list.filter((c) =>
            (c.nombre || "").toLowerCase().includes(qVal) ||
            (c.cargo || "").toLowerCase().includes(qVal) ||
            (c.telefono || "").toLowerCase().includes(qVal) ||
            (c.email || "").toLowerCase().includes(qVal) ||
            (c.correo || "").toLowerCase().includes(qVal) ||
            (c.notas || "").toLowerCase().includes(qVal)
          );
      const sliced = filtered.slice(0, 12);
      setContactos(sliced);

      // Si ya hay un contacto seleccionado en el formulario, reflejarlo en el chip
      if (selectedContactoId) {
        const match = list.find((c) => String(c._id) === String(selectedContactoId));
        if (match) setSelected(normalizeContacto(match));
        else if (
          selectedContactoFallback &&
          String(selectedContactoFallback._id) === String(selectedContactoId)
        ) {
          setSelected(normalizeContacto(selectedContactoFallback));
        } else {
          setSelected(null);
        }
      } else {
        setSelected(null);
      }
    } catch {
      setContactos([]);
    }
  };

  useEffect(() => {
    loadContactos("");
    // recargar al crear/editar contacto (evento local del componente)
    const onUpd = () => loadContactos("");
    window.addEventListener("contactos-updated", onUpd);
    return () => window.removeEventListener("contactos-updated", onUpd);
  }, [empresaId, empresaNombre, selectedContactoId, selectedContactoFallback]);

  useEffect(() => {
    if (prevEmpresaKey.current === null) {
      prevEmpresaKey.current = empresaContextKey;
      return;
    }
    if (prevEmpresaKey.current !== empresaContextKey) {
      prevEmpresaKey.current = empresaContextKey;
      setSelected(null);
      setQuery("");
      setOpen(false);
      onSelect({ nombre: "", cargo: "", contactoId: null });
    }
  }, [empresaContextKey, onSelect]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tieneEmpresaVinculo = Boolean((empresaNombre || "").trim() || empresaId);

  const poolEmpresa = () => {
    return contactos;
  };

  const filtrarPool = (pool, val) => {
    if (!val.trim()) return pool.slice(0, 12);
    const q = val.toLowerCase();
    return pool
      .filter(
        (c) =>
          c.nombre?.toLowerCase().includes(q) ||
          c.cargo?.toLowerCase().includes(q) ||
          c.profesion?.toLowerCase().includes(q) ||
          c.correo?.toLowerCase().includes(q) ||
          c.telefono?.toLowerCase().includes(q)
      )
      .slice(0, 12);
  };

  const handleSearch = (val) => {
    setQuery(val);
    setSelected(null);
    loadContactos(val);
    setOpen(true);
  };

  const handleFocusInput = () => {
    loadContactos(query);
    setOpen(true);
  };

  const handleSelect = (contacto) => {
    setQuery(contacto.nombre);
    setSelected(contacto);
    setOpen(false);
    onSelect({ nombre: contacto.nombre, cargo: contacto.cargo || "", contactoId: contacto._id });
  };

  const handleCrearClick = () => {
    setOpen(false);
    onOpenCrear(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    setSelected(null);
    onSelect({ nombre: "", cargo: "", contactoId: null });
  };

  const hintSinEmpresa = !tieneEmpresaVinculo && open && !query.trim();

  return (
    <div className="relative" ref={ref}>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Nombre del encargado <span className="text-red-400">*</span>
        </label>
        <p className="text-[10px] text-gray-400 -mt-0.5">
          {tieneEmpresaVinculo
            ? "Contactos de esta sede en el sistema. Si cambias a otra sucursal del mismo NIT, puedes conservar el encargado ya elegido."
            : "Elige la empresa arriba para ver sus contactos, o escribe para buscar en todos."}
        </p>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleFocusInput}
            placeholder="Buscar por nombre, cargo, teléfono o correo..."
            className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm font-medium text-gray-800
              focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all
              ${
                selected
                  ? "border-emerald-300 bg-emerald-50"
                  : fieldValid === true
                    ? "border-emerald-400 bg-emerald-50/70"
                    : fieldValid === false
                      ? "border-red-400 bg-red-50/50"
                      : "border-gray-200 bg-gray-50"
              }`}
          />
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${selected ? "text-emerald-500" : "text-gray-400"}`}>
            {selected ? <CheckIcon /> : <SearchIcon />}
          </span>
          {query && (
            <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {selected && (
        <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            {selected.nombre?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-800 truncate">{selected.nombre}</p>
            <p className="text-xs text-emerald-600 font-semibold truncate">
              {selected.cargo}
              {selected.telefono ? ` · ${selected.telefono}` : ""}
              {selected.correo ? ` · ${selected.correo}` : ""}
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">Seleccionado</span>
        </div>
      )}

      {open && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
          {hintSinEmpresa && (
            <div className="px-4 py-3 text-xs text-gray-500 border-b border-gray-100">
              Selecciona la empresa en <span className="font-semibold text-gray-700">Datos de la Empresa</span> para filtrar contactos vinculados, o escribe un nombre para buscar en toda la base.
            </div>
          )}

          {contactos.length > 0 &&
            contactos.map((c, idx) => (
              <div key={c._id != null ? String(c._id) : `c-${idx}-${c.nombre}`} className="flex items-stretch border-b border-gray-50 last:border-0">
                <button
                  type="button"
                  onClick={() => handleSelect(c)}
                  className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-[#1C355E]/5 transition-colors text-left min-w-0"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1C355E]/10 flex items-center justify-center flex-shrink-0 text-[#1C355E] text-sm font-black">
                    {c.nombre?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 truncate">{c.nombre}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {c.cargo || "—"}
                      {c.profesion ? ` · ${c.profesion}` : ""}
                      {c.telefono ? ` · ${c.telefono}` : ""}
                    </p>
                  </div>
                </button>
                {c._id != null && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpen(false);
                      onOpenEditar(c);
                    }}
                    className="px-3 flex items-center text-[10px] font-black uppercase tracking-wide text-[#1C355E] hover:bg-[#1C355E]/10 border-l border-gray-100 flex-shrink-0"
                  >
                    Editar
                  </button>
                )}
              </div>
            ))}

          {contactos.length === 0 && query.trim() && (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400 mb-2.5">
                No hay coincidencias{tieneEmpresaVinculo ? " para esta empresa" : ""} con{" "}
                <span className="font-semibold text-gray-600">&quot;{query}&quot;</span>
              </p>
              {tieneEmpresaVinculo && (
                <button
                  type="button"
                  onClick={handleCrearClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1C355E] text-white text-sm font-bold hover:bg-[#16294d] active:scale-[.98] transition-all"
                >
                  <PlusIcon /> CREAR CONTACTO +
                </button>
              )}
            </div>
          )}

          {contactos.length > 0 && tieneEmpresaVinculo && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/80">
              <p className="text-[10px] text-gray-500 mb-2 text-center">¿No es ninguno de estos? (ej. otro homónimo)</p>
              <button
                type="button"
                onClick={handleCrearClick}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[#1C355E] text-xs font-bold border border-[#1C355E]/25 hover:bg-[#1C355E]/8"
              >
                <PlusIcon /> CREAR OTRO CONTACTO +
              </button>
            </div>
          )}

          {contactos.length === 0 && !query.trim() && tieneEmpresaVinculo && (
            <div className="px-4 py-4 text-center space-y-2">
              <p className="text-xs text-gray-400">No hay contactos vinculados a esta empresa aún.</p>
              <button
                type="button"
                onClick={handleCrearClick}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl mx-auto bg-[#1C355E] text-white text-sm font-bold hover:bg-[#16294d]"
              >
                <PlusIcon /> CREAR CONTACTO +
              </button>
            </div>
          )}

          {!tieneEmpresaVinculo && !query.trim() && contactos.length === 0 && (
            <div className="px-4 py-4 text-center">
              <p className="text-xs text-gray-400 mb-3">Aún no hay contactos registrados</p>
              <p className="text-[10px] text-gray-400 mb-2">Primero elige empresa en la visita para crear un contacto vinculado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY SEARCH
// ─────────────────────────────────────────────────────────────────────────────
function EmpresaSearch({ onSelect, clientes, defaultQuery = "", fieldValid }) {
  const [query, setQuery]     = useState(defaultQuery);
  const [results, setResults] = useState([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const tRef = useRef(null);

  useEffect(() => {
    setQuery(defaultQuery ?? "");
  }, [defaultQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getToken = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?.token || localStorage.getItem("token");
    } catch {
      return localStorage.getItem("token");
    }
  };

  const mapClienteToEmpresa = (c) => ({
    _id: c._id,
    nombre: c.razonSocial || c.nombrePunto || `Cliente ${c.identificacion || ""}`.trim(),
    nit: c.identificacion,
    ciudad: c.ciudad,
    direccion: c.direccion,
  });

  const handleSearch = (val) => {
    setQuery(val);
    if (!val.trim()) { setResults([]); setOpen(false); setLoading(false); return; }

    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(async () => {
      const q = val.trim();
      setLoading(true);
      try {
        const token = getToken();
        const params = new URLSearchParams({ page: "1", limit: "8", search: q });
        const base = process.env.NEXT_PUBLIC_API_URL || "";
        const url = base
          ? `${base.replace(/\/$/, "")}/clientes?${params.toString()}`
          : `/api/clientes?${params.toString()}`;

        const res = await fetch(url, { headers: { Authorization: token } });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json?.clientes)
            ? json.clientes
            : Array.isArray(json?.data)
              ? json.data
              : Array.isArray(json)
                ? json
                : [];
          const mapped = list.map(mapClienteToEmpresa);
          setResults(mapped);
          setOpen(true);
          return;
        }

        // Fallback a clientes locales (si existieran)
        const low = q.toLowerCase();
        const found = (clientes || [])
          .filter((c) =>
            c?.nombre?.toLowerCase().includes(low) || c?.nit?.toLowerCase().includes(low)
          )
          .slice(0, 8);
        setResults(found);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);
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
            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium text-gray-800
              focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all
              ${
                fieldValid === true
                  ? "border-emerald-400 bg-emerald-50/70"
                  : fieldValid === false
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-200 bg-gray-50"
              }`}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin inline-block" />
            </span>
          )}
        </div>
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {results.map((empresa, i) => (
            <button key={i} type="button" onClick={() => handleSelect(empresa)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#1C355E]/5 transition-colors text-left border-b border-gray-50 last:border-0">
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
      {open && results.length === 0 && query.trim() && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3">
          <p className="text-xs text-gray-400 text-center">No se encontraron empresas con "{query}"</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GEO MODAL
// ─────────────────────────────────────────────────────────────────────────────
function GeoModal({ show, onClose, onSuccess }) {
  const [step, setStep]     = useState("ask");
  const [coords, setCoords] = useState(null);

  useEffect(() => { if (!show) { setStep("ask"); setCoords(null); } }, [show]);

  const requestGeo = () => {
    setStep("finding");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) }); setStep("found"); },
      () => setStep("denied"),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-7">
        {step === "ask" && (
          <div className="text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-[#1C355E]/8 flex items-center justify-center mx-auto"><LocationIcon /></div>
            <div><h3 className="text-xl font-bold text-gray-800">Compartir ubicación</h3><p className="text-sm text-gray-500 mt-1">Necesitamos tu ubicación para registrar la visita correctamente.</p></div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">Cancelar</button>
              <button onClick={requestGeo} className="flex-1 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d]">Aceptar</button>
            </div>
          </div>
        )}
        {step === "finding" && (
          <div className="text-center space-y-6 py-4">
            <div className="relative w-28 h-28 mx-auto">
              <div className="w-28 h-28 rounded-full border-4 border-[#1C355E]/20 overflow-hidden"><div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-blue-400 rounded-full" /></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCD00] animate-spin" />
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#FFCD00] flex items-center justify-center shadow-lg animate-bounce"><LocationIcon /></div>
            </div>
            <p className="font-bold text-gray-800">Encontrando tu ubicación...</p>
          </div>
        )}
        {step === "found" && coords && (
          <div className="space-y-5">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><CheckIcon /></div><div><p className="font-bold text-gray-800 text-sm">¡Ubicación encontrada!</p><p className="text-xs text-gray-400">Precisión: ±{coords.accuracy}m</p></div></div>
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-44"><iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005},${coords.lat - 0.005},${coords.lng + 0.005},${coords.lat + 0.005}&layer=mapnik&marker=${coords.lat},${coords.lng}`} className="w-full h-full border-0" title="Tu ubicación" /></div>
            <div className="bg-gray-50 rounded-xl px-4 py-2 text-xs font-mono text-gray-500">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</div>
            <button onClick={() => { onSuccess(coords); onClose(); }} className="w-full py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d]">Confirmar ubicación</button>
          </div>
        )}
        {step === "denied" && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto"><span className="text-2xl">⚠️</span></div>
            <div><p className="font-bold text-gray-800">Acceso denegado</p><p className="text-xs text-gray-500 mt-1">Activa la ubicación en tu navegador e intenta de nuevo.</p></div>
            <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500">Cerrar</button><button onClick={requestGeo} className="flex-1 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm">Reintentar</button></div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAREAS PENDIENTES con botón GUARDAR al marcar/desmarcar
// ─────────────────────────────────────────────────────────────────────────────
function TareasPendientes({ tareas, onSave }) {
  const [open, setOpen]           = useState(false);
  const [inputs, setInputs]       = useState([""]);
  const [locked, setLocked]       = useState(tareas && tareas.length > 0);
  const [localTareas, setLocalTareas] = useState(tareas || []);
  const [hasChanges, setHasChanges]   = useState(false);

  useEffect(() => {
    if (tareas && tareas.length > 0) {
      setInputs(tareas.map(t => t.texto));
      setLocalTareas(tareas);
      setLocked(true);
      setHasChanges(false);
    }
  }, []);

  const handleSave = () => {
    const valid = inputs.filter(t => t.trim());
    if (!valid.length) return;
    const tasks = valid.map(texto => ({ texto, done: false }));
    setLocalTareas(tasks);
    onSave(tasks);
    setLocked(true);
    setOpen(false);
    setHasChanges(false);
  };

  const handleToggle = (i) => {
    const updated = localTareas.map((t, idx) => idx === i ? { ...t, done: !t.done } : t);
    setLocalTareas(updated);
    setHasChanges(true);
  };

  const handleSaveChanges = () => { onSave(localTareas); setHasChanges(false); };

  if (locked && localTareas.length > 0) {
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 flex items-center gap-1.5">
          <TaskIcon /> Tareas pendientes ({localTareas.filter(t => t.done).length}/{localTareas.length} completadas)
        </p>
        <div className="space-y-2">
          {localTareas.map((t, i) => (
            <div key={i} onClick={() => handleToggle(i)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                ${t.done ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100 hover:border-[#1C355E]/30"}`}>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${t.done ? "bg-[#1C355E] border-[#1C355E]" : "border-gray-300 bg-white"}`}>
                {t.done && <CheckIcon />}
              </div>
              <span className={`text-sm font-medium flex-1 ${t.done ? "line-through text-gray-400" : "text-gray-700"}`}>{t.texto}</span>
            </div>
          ))}
        </div>
        {hasChanges && (
          <button type="button" onClick={handleSaveChanges}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm
              hover:bg-emerald-700 active:scale-[.98] transition-all shadow-lg shadow-emerald-200">
            <SaveIcon /> GUARDAR CAMBIOS
          </button>
        )}
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
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-[#1C355E] flex items-center justify-center"><TaskIcon /></div><p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Tareas Pendientes</p></div>
          {inputs.map((inp, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex items-center justify-center w-6 h-10 flex-shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#FFCD00]" /></div>
              <input type="text" value={inp} onChange={e => { const u = [...inputs]; u[i] = e.target.value; setInputs(u); }}
                placeholder={`Tarea ${i + 1} — ej: Llamar el 15 a contacto...`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all" />
            </div>
          ))}
          <button type="button" onClick={() => setInputs(p => [...p, ""])}
            className="flex items-center gap-2 text-xs font-semibold text-[#1C355E] hover:text-[#FFCD00] transition-colors pl-8">
            <PlusIcon /> Crear otro
          </button>
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
    v => (v.datosVisita?.nombreEmpresa || "")?.toLowerCase() === (empresa || "")?.toLowerCase()
  );
  return (
    <Modal show={show} onClose={onClose} wide>
      <div className="p-7">
        <div className="flex items-center justify-between mb-6">
          <div><h3 className="text-lg font-bold text-gray-800">Visitas pasadas</h3><p className="text-xs text-gray-400 mt-0.5">{empresa}</p></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><CloseIcon /></button>
        </div>
        {pasadas.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><p className="text-3xl mb-3">📋</p><p className="text-sm">No hay visitas previas para esta empresa</p></div>
        ) : (
          <div className="space-y-3">
            {pasadas.map((v) => {
              const pv = fechaHoraVisualDesdeVisita(v);
              return (
              <div key={v.id || v._id} className="border border-gray-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between"><span className="text-sm font-bold text-gray-800">{v.datosVisita?.tipoVisita || "Visita"}</span><span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Realizada</span></div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <span>📅 {pv.fecha} {pv.hora}</span><span>📍 {v.datosVisita?.municipio || "—"}</span>
                  <span>🚗 {v.datosVisita?.tipoVehiculo || "—"}</span><span>🧑‍💼 {v.asesorNombre}</span>
                </div>
                {v.datosVisita?.observaciones && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-[#FFCD00]">{v.datosVisita.observaciones}</p>}
              </div>
            );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETALLES VISITA MODAL — con ContactoSearch + CrearContactoModal
// ─────────────────────────────────────────────────────────────────────────────
function DetallesVisitaModal({ show, onClose, cita, user, onFinalizar, visitasFinalizadas, clientes }) {
  const visitaId = cita?._id != null ? String(cita._id) : cita?.id != null ? String(cita.id) : "";

  const emptyForm = {
    nit: "", nombreEmpresa: "", empresaId: "", nombreEncargado: "", cargoEncargado: "", encargadoContactoId: "",
    tipoVisita: "", observaciones: "", municipio: "", tipoVehiculo: "", direccionEmpresa: "",
  };
  const [form, setForm]               = useState(emptyForm);
  const [tareas, setTareas]           = useState([]);
  const [geoCoords, setGeoCoords]     = useState(null);
  const [showGeo, setShowGeo]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasadas, setShowPasadas] = useState(false);
  const [showCrearContacto, setShowCrearContacto] = useState(false);
  const [showEditarContacto, setShowEditarContacto] = useState(false);
  const [contactoAEditar, setContactoAEditar] = useState(null);
  const [nombreInicialCrearContacto, setNombreInicialCrearContacto] = useState("");
  const [errors, setErrors]           = useState([]);

  useEffect(() => {
    if (!show) return;
    const baseForm = {
      ...emptyForm,
      nombreEmpresa: cita?.datosVisita?.nombreEmpresa || "",
      empresaId: cita?.clienteId ? String(cita.clienteId) : "",
      nit: cita?.datosVisita?.nit || "",
      direccionEmpresa: cita?.datosVisita?.direccionEmpresa || "",
    };

    let merged = baseForm;
    try {
      const key = getVisitaDraftStorageKey(user, visitaId);
      const raw = key ? localStorage.getItem(key) : null;
      if (raw) {
        const saved = JSON.parse(raw);
        merged = { ...baseForm, ...(saved?.form || {}) };
        setTareas(Array.isArray(saved?.tareas) ? saved.tareas : []);
        setGeoCoords(saved?.geoCoords || null);
      } else {
        setTareas([]);
        setGeoCoords(null);
      }
    } catch {
      setTareas([]);
      setGeoCoords(null);
    }
    setForm(merged);
    setErrors([]);
  }, [show, visitaId, user?.cedula]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleEmpresaSelect = (empresa) => {
    setForm((f) => {
      const nitNuevo = normalizarNitCompare(empresa?.nit);
      const nitAnterior = normalizarNitCompare(f.nit);
      const mismoCliente = nitNuevo && nitAnterior && nitNuevo === nitAnterior;
      const conservarEncargado =
        mismoCliente && (Boolean(f.nombreEncargado?.trim()) || Boolean(f.encargadoContactoId));
      return {
        ...f,
        nit: empresa.nit || "",
        nombreEmpresa: empresa.nombre || "",
        direccionEmpresa: empresa.direccion || empresa.ciudad || "",
        empresaId: empresa._id != null ? String(empresa._id) : "",
        ...(conservarEncargado
          ? {}
          : { nombreEncargado: "", cargoEncargado: "", encargadoContactoId: "" }),
      };
    });
  };

  const handleContactoSelect = useCallback(({ nombre, cargo, contactoId }) => {
    setForm((f) => ({
      ...f,
      nombreEncargado: nombre || "",
      cargoEncargado: cargo || "",
      encargadoContactoId: contactoId != null ? String(contactoId) : "",
    }));
  }, []);

  const handleContactoCreado = (nuevo) => {
    setForm((f) => ({
      ...f,
      nombreEncargado: nuevo.nombre,
      cargoEncargado: nuevo.cargo,
      encargadoContactoId: nuevo._id != null ? String(nuevo._id) : "",
    }));
    window.dispatchEvent(new Event("contactos-updated"));
  };

  const handleContactoEditado = (updated) => {
    window.dispatchEvent(new Event("contactos-updated"));
    setForm((f) => {
      if (f.encargadoContactoId && String(updated._id) === String(f.encargadoContactoId)) {
        return { ...f, nombreEncargado: updated.nombre, cargoEncargado: updated.cargo };
      }
      return f;
    });
  };

  const empresaVinculoContacto = form.nombreEmpresa?.trim()
    ? { _id: form.empresaId || undefined, nombre: form.nombreEmpresa }
    : null;

  /** Misma empresa (NIT) aunque cambie sucursal / `empresaId`: no resetea el encargado ni el buscador. */
  const empresaContextKeyContacto =
    normalizarNitCompare(form.nit) ||
    `e:${form.empresaId}|${normalizarNombreEmpresa(form.nombreEmpresa)}`;

  const contactoSearchFallback = useMemo(() => {
    if (!form.encargadoContactoId || !form.nombreEncargado?.trim()) return null;
    return {
      _id: form.encargadoContactoId,
      nombre: form.nombreEncargado.trim(),
      cargo: form.cargoEncargado || "",
    };
  }, [form.encargadoContactoId, form.nombreEncargado, form.cargoEncargado]);

  const empresaFieldOk = Boolean(form.nombreEmpresa?.trim() && form.empresaId);
  const contactoFieldOk = Boolean(form.nombreEncargado?.trim() && form.cargoEncargado?.trim());

  const validate = () => {
    const required = ["nombreEmpresa", "nombreEncargado", "cargoEncargado", "tipoVisita", "municipio", "tipoVehiculo"];
    const missing  = required.filter(k => !form[k]?.trim());
    if (!geoCoords) missing.push("geolocalización");
    if (
      (form.tipoVehiculo === "Carro" || form.tipoVehiculo === "Motocicleta") &&
      !chequeoCumpleParaCerrarVisita(user, form.tipoVehiculo)
    ) {
      missing.push("chequeo vehículo del día (menú Chequeo vehículo)");
    }
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
    // limpiar borrador al finalizar
    try {
      const key = getVisitaDraftStorageKey(user, visitaId);
      if (key) localStorage.removeItem(key);
    } catch {}
    onClose();
  };

  const flushDraftToStorage = useCallback(() => {
    const key = getVisitaDraftStorageKey(user, visitaId);
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({ form, tareas, geoCoords, updatedAt: Date.now() }));
    } catch {}
  }, [user?.cedula, visitaId, form, tareas, geoCoords]);

  const handleCloseDetalle = () => {
    flushDraftToStorage();
    onClose();
  };

  // Autosave del progreso mientras el modal esté abierto
  useEffect(() => {
    if (!show || !visitaId) return;
    const t = setTimeout(() => {
      flushDraftToStorage();
    }, 300);
    return () => clearTimeout(t);
  }, [show, visitaId, flushDraftToStorage]);

  useEffect(() => {
    if (!show || !visitaId) return;
    const onVis = () => {
      if (document.visibilityState === "hidden") flushDraftToStorage();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [show, visitaId, flushDraftToStorage]);

  const visitasPasadasCount = visitasFinalizadas.filter(
    v => (v.datosVisita?.nombreEmpresa || "")?.toLowerCase() === (form.nombreEmpresa || "")?.toLowerCase()
  ).length;

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Cerrar y guardar progreso"
          className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default border-0 p-0"
          onClick={handleCloseDetalle}
        />
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

          {/* Header sticky */}
          <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-7 py-5 rounded-t-3xl flex items-center justify-between z-10">
            <div>
              <h2 className="text-lg font-bold text-[#1C355E]">Detalle de Visita</h2>
              <p className="text-xs text-gray-400 mt-0.5">{cita?.datosVisita?.nombreEmpresa || "—"} · {cita?.fecha} {cita?.hora}</p>
            </div>
            <button type="button" onClick={handleCloseDetalle} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"><CloseIcon /></button>
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

            {/* 2. EMPRESA + CONTACTO */}
            <section>
              <SectionHeader number="2" title="Datos de la Empresa" />
              <div className="space-y-3">

                {/* Búsqueda empresa */}
                <EmpresaSearch
                  key={cita?.id ? `emp-${cita.id}` : "emp-detalle"}
                  defaultQuery={form.nombreEmpresa}
                  onSelect={handleEmpresaSelect}
                  clientes={clientes}
                  fieldValid={empresaFieldOk}
                />
                <div className="grid grid-cols-2 gap-3">
                  <ReadonlyField label="NIT"       value={form.nit} />
                  <ReadonlyField label="Dirección" value={form.direccionEmpresa} />
                </div>

                {/* ── CONTACTO SEARCH ── */}
                <ContactoSearch
                  onSelect={handleContactoSelect}
                  empresaId={form.empresaId}
                  empresaNombre={form.nombreEmpresa}
                  empresaContextKey={empresaContextKeyContacto}
                  defaultQuery={form.nombreEncargado}
                  selectedContactoId={form.encargadoContactoId}
                  selectedContactoFallback={contactoSearchFallback}
                  fieldValid={contactoFieldOk}
                  onOpenCrear={(nombreSugerido) => {
                    setNombreInicialCrearContacto(nombreSugerido || "");
                    setShowCrearContacto(true);
                  }}
                  onOpenEditar={(c) => {
                    setContactoAEditar(c);
                    setShowEditarContacto(true);
                  }}
                />

                <InputField
                  label="Cargo del encargado"
                  required
                  fieldValid={!!form.cargoEncargado?.trim()}
                  placeholder="Se completa al elegir un contacto (campo cargo) o escríbelo"
                  value={form.cargoEncargado}
                  onChange={(e) => set("cargoEncargado", e.target.value)}
                />
              </div>
            </section>

            {/* 3. DETALLES VISITA */}
            <section>
              <SectionHeader number="3" title="Detalles de Visita" />
              <div className="space-y-3">
                <SelectField label="Tipo de visita" required options={TIPO_VISITA}
                  fieldValid={!!form.tipoVisita?.trim()}
                  value={form.tipoVisita} onChange={e => set("tipoVisita", e.target.value)} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Observaciones</label>
                  <textarea rows={3} value={form.observaciones} onChange={e => set("observaciones", e.target.value)}
                    placeholder="Describe los puntos clave de la visita..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all resize-none
                      ${
                        form.observaciones?.trim()
                          ? "border-emerald-400 bg-emerald-50/60"
                          : "border-gray-200 bg-gray-50"
                      }`} />
                </div>
                <MunicipioSearchField
                  label="Municipio"
                  required
                  options={MUNICIPIOS_COLOMBIA}
                  fieldValid={!!form.municipio?.trim()}
                  value={form.municipio}
                  onValueChange={(v) => set("municipio", v)}
                />

                {/* TRANSPORTE */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tipo de transporte <span className="text-red-400">*</span>
                  </label>
                  <div
                    className={`grid grid-cols-3 gap-2 rounded-xl p-1 transition-all
                      ${form.tipoVehiculo?.trim() ? "ring-2 ring-emerald-300/80" : "ring-2 ring-red-300/80"}`}
                  >
                    {[
                      { value: "Motocicleta",        icon: <BikeIcon /> },
                      { value: "Carro",              icon: <CarIcon /> },
                      { value: "Transporte Público", icon: <BusIcon /> },
                    ].map(({ value, icon }) => (
                      <button key={value} type="button" onClick={() => set("tipoVehiculo", value)}
                        className={`flex flex-col items-center gap-2 px-2 py-3 rounded-xl border-2 text-xs font-semibold transition-all
                          ${form.tipoVehiculo === value
                            ? "border-[#1C355E] bg-[#1C355E]/5 text-[#1C355E]"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                        {icon}
                        <span className="text-center leading-tight">{value}</span>
                      </button>
                    ))}
                  </div>
                  {(form.tipoVehiculo === "Carro" || form.tipoVehiculo === "Motocicleta" || form.tipoVehiculo === "Transporte Público") && (
                    <div
                      className={`mt-3 rounded-xl border px-4 py-3 text-xs ${
                        chequeoCumpleParaCerrarVisita(user, form.tipoVehiculo)
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-red-300 bg-red-50 text-red-950"
                      }`}
                    >
                      <p className="font-bold text-sm mb-1">Chequeo vehicular del día</p>
                      {chequeoCumpleParaCerrarVisita(user, form.tipoVehiculo) ? (
                        <p>
                          Listo: ya enviaste el chequeo de <strong>{form.tipoVehiculo}</strong> hoy. Puedes finalizar esta visita.
                        </p>
                      ) : (
                        <>
                          <p className="mb-2">
                            Para cerrar la visita en <strong>{form.tipoVehiculo}</strong> debes enviar primero el formulario en{" "}
                            <strong>Chequeo vehículo</strong> (una vez por día por tipo de transporte).
                          </p>
                          <Link
                            href="/dashboard/asesor/chequeo-vehiculo"
                            className="inline-flex font-bold text-[#1C355E] underline"
                          >
                            Ir a Chequeo vehículo
                          </Link>
                        </>
                      )}
                    </div>
                  )}
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
                  className="w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3
                    text-sm font-semibold transition-all border-red-300 bg-red-50/50 text-red-700
                    hover:border-[#1C355E] hover:text-[#1C355E] hover:bg-[#1C355E]/3">
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
                  {/* VER VISITAS PASADAS — grande y visible */}
                  {form.nombreEmpresa && (
                    <button type="button" onClick={() => setShowPasadas(true)}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-xl
                        bg-[#1C355E]/8 border-2 border-[#1C355E]/20
                        hover:bg-[#1C355E]/12 hover:border-[#1C355E]/40 transition-all group">
                      <span className="text-[#1C355E] group-hover:scale-110 transition-transform"><HistoryIcon /></span>
                      <div className="text-left">
                        <p className="text-base font-black text-[#1C355E] uppercase tracking-wide leading-tight">VER VISITAS PASADAS</p>
                        <p className="text-xs font-semibold text-[#1C355E]/60 mt-0.5">({visitasPasadasCount}) registradas para {form.nombreEmpresa}</p>
                      </div>
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

            <button type="button" onClick={handleFinalizar}
              className="w-full py-4 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] active:scale-[.98] transition-all shadow-lg shadow-[#1C355E]/25">
              Finalizar Visita
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modales */}
      <GeoModal show={showGeo} onClose={() => setShowGeo(false)} onSuccess={setGeoCoords} />
      <VisitasPasadasModal show={showPasadas} onClose={() => setShowPasadas(false)} empresa={form.nombreEmpresa} visitasFinalizadas={visitasFinalizadas} />

      {/* Modal CREAR CONTACTO — z-[60] para estar sobre el modal principal */}
      <CrearContactoModal
        show={showCrearContacto}
        onClose={() => {
          setShowCrearContacto(false);
          setNombreInicialCrearContacto("");
        }}
        onCreated={handleContactoCreado}
        empresaVinculo={empresaVinculoContacto}
        nombreInicial={nombreInicialCrearContacto}
      />
      <EditarContactoModal
        show={showEditarContacto}
        contacto={contactoAEditar}
        empresaVinculo={empresaVinculoContacto}
        onClose={() => {
          setShowEditarContacto(false);
          setContactoAEditar(null);
        }}
        onSaved={handleContactoEditado}
      />

      {/* Confirm finalizar */}
      <Modal show={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto"><span className="text-2xl">⚠️</span></div>
          <div><h3 className="text-xl font-bold text-gray-800">¿Seguro que quieres finalizar?</h3><p className="text-sm text-gray-500 mt-1">Una vez confirmado no podrás editar los datos (solo el desarrollador).</p></div>
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
  const [fecha, setFecha]   = useState("");
  const [hora, setHora]     = useState("");
  const [motivo, setMotivo] = useState("");
  useEffect(() => { if (show) { setFecha(cita?.fecha || ""); setHora(cita?.hora || ""); setMotivo(""); } }, [show, cita]);
  const handleSave = () => { if (!fecha || !hora) return; onSave({ fecha, hora, motivo }); onClose(); };
  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div><h3 className="text-xl font-bold text-[#1C355E]">Reprogramar Visita</h3><p className="text-xs text-gray-400 mt-0.5">{cita?.cliente}</p></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><CloseIcon /></button>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3"><p className="text-xs text-purple-600 font-semibold">📅 Fecha actual: {cita?.fecha} a las {cita?.hora}</p></div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Nueva fecha" required type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          <InputField label="Nueva hora"  required type="time" value={hora}  onChange={e => setHora(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Motivo (opcional)</label>
          <textarea rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="¿Por qué se reprograma?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all" />
        </div>
        <button onClick={handleSave} className="w-full py-3.5 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] transition-all">Guardar nueva fecha</button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR CITA MODAL — sin campo celular
// ─────────────────────────────────────────────────────────────────────────────
function CrearCitaModal({ show, onClose, user, onCreate, clientes }) {
  const empty = { cliente: "", fecha: "", hora: "", empresa: null };
  const [form, setForm]     = useState(empty);
  const [created, setCreated] = useState(null);
  const [formError, setFormError] = useState("");
  useEffect(() => { if (show) { setForm(empty); setCreated(null); setFormError(""); } }, [show]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleEmpresaSelect = (empresa) => {
    setFormError("");
    setForm((f) => ({
      ...f,
      cliente: empresa?.nombre || "",
      empresa: empresa || null,
    }));
  };
  const handleCreate = (e) => {
    e.preventDefault();
    if (!user?.nombre?.trim()) {
      setFormError("No hay sesión de asesor. Vuelve a iniciar sesión.");
      return;
    }
    if (!form.empresa?._id) {
      setFormError("Busca y selecciona una empresa de la lista (obligatorio).");
      return;
    }
    if (!form.fecha?.trim()) {
      setFormError("Indica la fecha de la visita.");
      return;
    }
    if (!form.hora?.trim()) {
      setFormError("Indica la hora de la visita.");
      return;
    }
    setFormError("");
    const nueva = {
      ...form,
      cliente: form.empresa?.nombre || form.cliente,
      asesorNombre: user?.nombre || "Asesor",
    };
    onCreate(nueva);
    setCreated(nueva);
  };
  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-7">
        {!created ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-xl font-bold text-[#1C355E]">Nueva Visita</h3><p className="text-xs text-gray-400 mt-0.5">Programa una visita empresarial</p></div>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><CloseIcon /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <ReadonlyField label="Asesor" value={user?.nombre} />
              <EmpresaSearch
                defaultQuery={form.cliente}
                onSelect={handleEmpresaSelect}
                clientes={clientes}
              />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Fecha" required type="date" value={form.fecha} onChange={e => { setFormError(""); set("fecha", e.target.value); }} />
                <InputField label="Hora"  required type="time" value={form.hora}  onChange={e => { setFormError(""); set("hora", e.target.value); }} />
              </div>
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-semibold text-red-600">
                  {formError}
                </div>
              )}
              <button type="submit" className="w-full py-4 rounded-xl bg-[#FFCD00] text-[#1C355E] font-bold text-sm hover:bg-yellow-400 active:scale-[.98] transition-all mt-2">Crear Visita</button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-5 py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600"><CheckCircleIcon /></div>
            <div><h3 className="text-xl font-bold text-gray-800">¡Visita creada!</h3><p className="text-sm text-gray-500 mt-1">La visita ha sido confirmada y está disponible.</p></div>
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 border border-gray-100">
              {[["🏢","Empresa",created.cliente],["📅","Fecha",created.fecha],["⏰","Hora",created.hora]].map(([icon,label,value]) => (
                <div key={label} className="flex items-center gap-3 text-sm"><span>{icon}</span><span className="text-gray-400 min-w-[60px]">{label}</span><span className="font-semibold text-gray-700">{value}</span></div>
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
// EDITAR VISITA (solo si aún no ha iniciado: pendiente / reprogramada)
// ─────────────────────────────────────────────────────────────────────────────
function EditarVisitaModal({ show, onClose, cita, clientes, onSave }) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [empresaSel, setEmpresaSel] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (show && cita) {
      setFecha(cita.fecha || "");
      setHora(cita.hora || "");
      if (cita.empresa) setEmpresaSel(cita.empresa);
      else if (cita.cliente) setEmpresaSel({ nombre: cita.cliente, nit: "", direccion: "", ciudad: "" });
      else setEmpresaSel(null);
      setFormError("");
    }
  }, [show, cita]);

  const handleEmpresaSelect = (empresa) => {
    setFormError("");
    setEmpresaSel(empresa);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!empresaSel?.nombre?.trim()) {
      setFormError("Busca y selecciona una empresa de la lista.");
      return;
    }
    if (!fecha?.trim()) {
      setFormError("Indica la fecha de la visita.");
      return;
    }
    if (!hora?.trim()) {
      setFormError("Indica la hora de la visita.");
      return;
    }
    setFormError("");
    onSave({
      cliente: empresaSel.nombre.trim(),
      empresa: empresaSel,
      fecha,
      hora,
    });
    onClose();
  };

  if (!show || !cita) return null;

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#1C355E]">Editar visita</h3>
            <p className="text-xs text-gray-400 mt-0.5">Solo antes de iniciar la visita</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <EmpresaSearch
            key={cita.id ? `edit-emp-${cita.id}` : "edit-emp"}
            defaultQuery={empresaSel?.nombre || ""}
            onSelect={handleEmpresaSelect}
            clientes={clientes}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Fecha" required type="date" value={fecha} onChange={e => { setFormError(""); setFecha(e.target.value); }} />
            <InputField label="Hora" required type="time" value={hora} onChange={e => { setFormError(""); setHora(e.target.value); }} />
          </div>
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-semibold text-red-600">
              {formError}
            </div>
          )}
          <button type="submit" className="w-full py-4 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] active:scale-[.98] transition-all">
            Guardar cambios
          </button>
        </form>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INICIAR VISITA MODAL
// ─────────────────────────────────────────────────────────────────────────────
function IniciarVisitaModal({ show, onClose, cita, onConfirm }) {
  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-8 space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFCD00]/20 flex items-center justify-center mx-auto mb-4"><PlayIcon /></div>
          <h3 className="text-xl font-bold text-gray-800">¿Iniciar esta visita?</h3>
          <p className="text-sm text-gray-500 mt-1">Se abrirá el formulario de detalles para registrar la información.</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
          {[["🏢","Empresa",cita?.datosVisita?.nombreEmpresa],["📅","Fecha",cita?.fecha],["⏰","Hora",cita?.hora]].map(([icon,label,value]) => (
            <div key={label} className="flex items-center gap-3 text-sm"><span>{icon}</span><span className="text-gray-400 min-w-[60px]">{label}</span><span className="font-semibold text-gray-700">{value}</span></div>
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
  const [user, setUser]         = useState(null);
  const [citas, setCitas]       = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro]     = useState("pendiente");
  const [loadingCitas, setLoadingCitas] = useState(true);

  const [showCrear, setShowCrear]             = useState(false);
  const [showIniciar, setShowIniciar]         = useState(false);
  const [showDetalles, setShowDetalles]       = useState(false);
  const [showReprogramar, setShowReprogramar] = useState(false);
  const [showEditar, setShowEditar]           = useState(false);
  const [showVer, setShowVer]                 = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const visitasFinalizadas = citas.filter(c => c.estado === "realizada");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const getToken = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?.token || localStorage.getItem("token");
    } catch {
      return localStorage.getItem("token");
    }
  };

  const fetchCitas = async () => {
    setLoadingCitas(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({ page: "1", limit: "500" });
      const res = await fetch(`/api/visitas?${params.toString()}`, {
        headers: { Authorization: token },
      });
      const json = await res.json().catch(() => ({}));
      // backend puede responder { data, total, ... } o { visitas }
      const list = Array.isArray(json?.visitas) ? json.visitas : Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      if (res.ok) {
        const normalized = list.map(normalizarVisitaAsesorNombre);
        const toTime = (c) => {
          // Realizadas: ordenar por cierre; resto por fecha/hora programada.
          const fallbackYmd = typeof c?.fecha === "string" ? c.fecha : "";
          const fallbackHm = typeof c?.hora === "string" ? c.hora : "";
          const ymdHm = `${fallbackYmd}T${fallbackHm || "00:00"}:00`;
          const fallbackMs = Date.parse(ymdHm);
          const ms = c?.estado === "realizada" && c?.finishedAt ? Date.parse(c.finishedAt) : fallbackMs;
          return Number.isFinite(ms) ? ms : 0;
        };
        normalized.sort((a, b) => toTime(b) - toTime(a)); // más nueva → más vieja
        setCitas(normalized);
      }
      else setCitas([]);
      notifyVisitasUpdated();
    } catch {
      setCitas([]);
      notifyVisitasUpdated();
    } finally {
      setLoadingCitas(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchCitas();
  }, [user]);

  const handleCrearCita = async (payload) => {
    const token = getToken();
    const res = await fetch(`/api/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({
        clienteId: payload?.empresa?._id || payload?.empresaId || null,
        clienteCrear: payload?.empresa?._id ? null : { nombre: payload?.cliente },
        fecha: payload?.fecha,
        hora: payload?.hora,
        estado: payload?.estado,
      }),
    });
    if (res.ok) await fetchCitas();
  };

  const handleIniciarCita = (cita) => { setCitaSeleccionada(cita); setShowIniciar(true); };
  const confirmarIniciarCita = () => {
    setShowIniciar(false);
    (async () => {
      const token = getToken();
      await fetch(`/api/visitas/${citaSeleccionada._id}/iniciar`, {
        method: "PATCH",
        headers: { Authorization: token },
      }).catch(() => {});
      await fetchCitas();
      setShowDetalles(true);
    })();
  };
  const handleFinalizarVisita = (datosVisita) => {
    (async () => {
      const token = getToken();
      const { fecha, hora } = fechaHoraCierreLocal();
      await fetch(`/api/visitas/${citaSeleccionada._id}/finalizar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          datosVisita,
          estadoFinal: "realizada",
          fecha,
          hora,
        }),
      }).catch(() => {});
      await fetchCitas();
      setCitaSeleccionada(null);
    })();
  };
  const handleReprogramar = ({ fecha, hora, motivo }) => {
    (async () => {
      const token = getToken();
      await fetch(`/api/visitas/${citaSeleccionada._id}/reprogramar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ fecha, hora, motivo }),
      }).catch(() => {});
      await fetchCitas();
      setCitaSeleccionada(null);
    })();
  };
  const handleGuardarEdicion = (payload) => {
    (async () => {
      const token = getToken();
      // editar solo fecha/hora/cliente antes de iniciar -> backend no trae endpoint dedicado,
      // reusamos reprogramar si cambia fecha/hora, y si cambia empresa se recrea (por ahora).
      if (payload?.fecha || payload?.hora) {
        await fetch(`/api/visitas/${citaSeleccionada._id}/reprogramar`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ fecha: payload.fecha, hora: payload.hora, motivo: "Edición" }),
        }).catch(() => {});
      }
      await fetchCitas();
      setShowEditar(false);
    })();
  };

  const myCitas  = citas; // ya viene filtrado por asesor desde la BD
  const visitasAbiertasCount = myCitas.filter((c) =>
    ["pendiente", "activa", "reprogramada"].includes(c.estado)
  ).length;
  const filtered =
    filtro === "todos"
      ? myCitas
      : filtro === "pendiente"
        ? myCitas.filter((c) => ["pendiente", "activa", "reprogramada"].includes(c.estado))
        : myCitas.filter((c) => c.estado === filtro);
  const stats    = {
    pendientes: myCitas.filter(c => c.estado === "pendiente").length,
    activas:    myCitas.filter(c => c.estado === "activa").length,
    realizadas: myCitas.filter(c => c.estado === "realizada").length,
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
        {visitasAbiertasCount > 0 && (
          <div className="fade-up rounded-2xl border border-[#1C355E]/20 bg-[#1C355E]/5 px-5 py-4 text-sm text-gray-800">
            <p className="font-black text-[#1C355E] uppercase tracking-wide text-xs">Chequeo vehículo</p>
            <p className="mt-1 text-gray-600">
              Tienes visitas activas o pendientes. Si vas a cerrar alguna en <strong>Carro</strong> o <strong>Motocicleta</strong>, envía el chequeo{" "}
              <strong>una vez al día</strong> por cada tipo que uses (se renueva cada día).{" "}
              <Link href="/dashboard/asesor/chequeo-vehiculo" className="font-bold text-[#1C355E] underline">
                Abrir formulario
              </Link>
            </p>
          </div>
        )}
        <div className="fade-up flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Mis Visitas</p>
            <h1 className="text-xl sm:text-2xl font-black text-gray-800 mt-0.5">Gestión de citas</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowCrear(true)}
            className="flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 px-4 py-3 sm:px-5 rounded-xl bg-[#FFCD00] text-[#1C355E] font-bold text-sm hover:bg-yellow-400 active:scale-[.98] transition-all shadow-lg shadow-yellow-200 touch-manipulation"
          >
            <PlusIcon /> Nueva Visita
          </button>
        </div>

        <div className="fade-up fade-up-1 grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label:"Pendientes",    value:stats.pendientes,    icon:"🕐", color:"border-yellow-100 bg-yellow-50"   },
            { label:"Activas",       value:stats.activas,       icon:"🚀", color:"border-emerald-100 bg-emerald-50" },
            { label:"Realizadas",    value:stats.realizadas,    icon:"✅", color:"border-blue-100 bg-blue-50"       },
            { label:"Reprogramadas", value:stats.reprogramadas, icon:"🔄", color:"border-purple-100 bg-purple-50"   },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className={`rounded-2xl p-4 sm:p-5 border ${color} flex items-center gap-3 sm:gap-4 min-w-0`}>
              <div className="text-xl sm:text-2xl shrink-0">{icon}</div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-black text-gray-800 leading-none">{value}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-wide truncate">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="fade-up fade-up-2 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {[
            { v: "todos", label: "Todas" },
            { v: "pendiente", label: "Pendientes" },
            { v: "realizada", label: "Realizadas" },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setFiltro(opt.v)}
              className={`py-2.5 px-2 sm:px-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all touch-manipulation min-h-[44px] sm:min-h-0
                ${filtro === opt.v ? "bg-[#1C355E] text-white shadow-lg shadow-[#1C355E]/25" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
            >
              <span className="leading-tight block">{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="fade-up fade-up-3 space-y-3">
          {loadingCitas && (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 font-medium">Cargando visitas...</p>
            </div>
          )}
          {!loadingCitas && filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-400 font-medium">No hay visitas {filtro !== "todos" ? `"${filtro}"` : ""}</p>
              <button onClick={() => setShowCrear(true)} className="mt-4 px-5 py-2.5 rounded-xl bg-[#FFCD00] text-[#1C355E] text-sm font-bold hover:bg-yellow-400">Crear visita</button>
            </div>
          )}
          {filtered.map((cita, i) => {
            const cv = fechaHoraVisualDesdeVisita(cita);
            return (
            <div
              key={cita._id || i}
              className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-4 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3 min-w-0 w-full md:flex-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#1C355E]/8 flex items-center justify-center flex-shrink-0 text-base sm:text-lg">🏢</div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-800 text-sm sm:text-base break-words">{cita.datosVisita?.nombreEmpresa || "—"}</p>
                  <div className="flex items-center gap-x-2 gap-y-1 mt-1 flex-wrap text-[11px] sm:text-xs text-gray-400">
                    <span className="flex items-center gap-1"><CalIcon /> {cv.fecha}</span>
                    {cv.hora && <span>· {cv.hora}</span>}
                    {cita.estado === "reprogramada" && cita.motivoReprogramacion && (
                      <span className="text-purple-500 font-medium">· {cita.motivoReprogramacion}</span>
                    )}
                  </div>
                  <div className="mt-2 md:hidden">
                    <EstadoBadge estado={cita.estado} />
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto md:max-w-[55%] lg:max-w-none flex flex-col gap-2 sm:flex-row sm:flex-wrap md:justify-end md:items-center md:gap-2">
                <div className="hidden md:block flex-shrink-0">
                  <EstadoBadge estado={cita.estado} />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto md:justify-end">
                <button
                  type="button"
                  onClick={() => { setCitaSeleccionada(cita); setShowVer(true); }}
                  className="inline-flex flex-[1_1_calc(50%-0.25rem)] md:flex-initial items-center justify-center gap-1.5 px-2 sm:px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[11px] sm:text-xs font-bold hover:bg-gray-50 hover:border-[#1C355E]/30 hover:text-[#1C355E] active:scale-[.97] transition-all touch-manipulation min-h-[44px] md:min-h-0"
                  title="Ver visita"
                >
                  <EyeIcon /> Ver
                </button>
                {(cita.estado === "pendiente" || cita.estado === "reprogramada") && (
                  <button
                    type="button"
                    onClick={() => { setCitaSeleccionada(cita); setShowEditar(true); }}
                    className="inline-flex flex-[1_1_calc(50%-0.25rem)] md:flex-initial items-center justify-center gap-1.5 px-2 sm:px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[11px] sm:text-xs font-bold hover:bg-gray-50 hover:border-[#1C355E]/30 hover:text-[#1C355E] active:scale-[.97] transition-all touch-manipulation min-h-[44px] md:min-h-0"
                  >
                    <PencilIcon /> Editar
                  </button>
                )}
                {(cita.estado === "pendiente" || cita.estado === "reprogramada") && (
                  <button
                    type="button"
                    onClick={() => handleIniciarCita(cita)}
                    className="inline-flex flex-[1_1_calc(50%-0.25rem)] md:flex-initial items-center justify-center gap-1.5 px-2 sm:px-3.5 py-2.5 rounded-xl bg-[#FFCD00] text-[#1C355E] text-[11px] sm:text-xs font-bold hover:bg-yellow-400 active:scale-[.97] transition-all touch-manipulation min-h-[44px] md:min-h-0"
                  >
                    <PlayIcon /> Iniciar
                  </button>
                )}
                {(cita.estado === "pendiente" || cita.estado === "reprogramada") && (
                  <button
                    type="button"
                    onClick={() => { setCitaSeleccionada(cita); setShowReprogramar(true); }}
                    className="inline-flex flex-[1_1_calc(50%-0.25rem)] md:flex-initial items-center justify-center gap-1.5 px-2 sm:px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[11px] sm:text-xs font-bold hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 active:scale-[.97] transition-all touch-manipulation min-h-[44px] md:min-h-0"
                  >
                    <ReprogramarIcon /> Reprogramar
                  </button>
                )}
                {cita.estado === "activa" && (
                  <button
                    type="button"
                    onClick={() => { setCitaSeleccionada(cita); setShowDetalles(true); }}
                    className="inline-flex flex-[1_1_calc(50%-0.25rem)] md:flex-initial items-center justify-center gap-1.5 px-2 sm:px-3.5 py-2.5 rounded-xl bg-emerald-500 text-white text-[11px] sm:text-xs font-bold hover:bg-emerald-600 active:scale-[.97] transition-all touch-manipulation min-h-[44px] md:min-h-0"
                  >
                    Continuar
                  </button>
                )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <CrearCitaModal
        show={showCrear}
        onClose={() => setShowCrear(false)}
        user={user}
        onCreate={handleCrearCita}
        clientes={clientes}
      />
      <IniciarVisitaModal show={showIniciar} onClose={() => setShowIniciar(false)} cita={citaSeleccionada} onConfirm={confirmarIniciarCita} />
      <DetallesVisitaModal
        show={showDetalles} onClose={() => setShowDetalles(false)}
        cita={citaSeleccionada} user={user}
        onFinalizar={handleFinalizarVisita}
        visitasFinalizadas={visitasFinalizadas}
        clientes={clientes}
      />
      <ReprogramarModal show={showReprogramar} onClose={() => setShowReprogramar(false)} cita={citaSeleccionada} onSave={handleReprogramar} />
      <EditarVisitaModal
        show={showEditar}
        onClose={() => setShowEditar(false)}
        cita={citaSeleccionada}
        clientes={clientes}
        onSave={handleGuardarEdicion}
      />
      <VisualizarVisitaModal
        show={showVer}
        onClose={() => setShowVer(false)}
        cita={citaSeleccionada}
        asesorFallbackNombre={user?.nombre}
      />
    </LayoutDashboard>
  );
}
