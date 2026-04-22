"use client";

import { useState, useEffect, useRef } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

// ─────────────────────────────────────────────────────────────────────────────
// MUNICIPIOS (subset representativo – importa el archivo completo en producción)
// ─────────────────────────────────────────────────────────────────────────────
import { MUNICIPIOS_COLOMBIA } from "@/utils/municipiosColombia";

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const CalIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const PlayIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const HistoryIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const BikeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
    <path strokeLinecap="round" d="M15 6h-3l-3 8m0 0l2.5-5H15m-6 5h9"/>
  </svg>
);
const CarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 6H5l-2 6h18l-2-6h-6zm-4 6v5m8-5v5"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function Modal({ show, onClose, children, wide = false }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 bg-white rounded-3xl shadow-2xl w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
          focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <select
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
          focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
        {...props}
      >
        <option value="">Seleccionar...</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
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

const TIPO_VISITA = [
  "Prueba de visita",
  "Visita técnica-comercial",
  "Levantamiento de Base instalada",
  "Especificación de producto",
];

// ─────────────────────────────────────────────────────────────────────────────
// GEOLOCATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function GeoModal({ show, onClose, onSuccess }) {
  const [step, setStep] = useState("ask"); // ask | finding | found | denied
  const [coords, setCoords] = useState(null);
  const mapRef = useRef(null);

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

  const handleAccept = () => {
    onSuccess(coords);
    onClose();
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
              <p className="text-sm text-gray-500 mt-1">Necesitamos tu ubicación exacta para registrar la visita y evitar inconsistencias.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={requestGeo} className="flex-1 py-3 rounded-xl bg-[#1C355E] text-sm font-bold text-white hover:bg-[#16294d] transition-all">Aceptar</button>
            </div>
          </div>
        )}

        {step === "finding" && (
          <div className="text-center space-y-6 py-4">
            <div className="relative w-28 h-28 mx-auto">
              {/* Globe animation */}
              <div className="w-28 h-28 rounded-full border-4 border-[#1C355E]/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-blue-400 rounded-full" />
                <div className="absolute inset-0 rounded-full" style={{
                  background: "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(255,255,255,0.15) 18px, rgba(255,255,255,0.15) 20px)"
                }} />
                <div className="absolute inset-0 rounded-full" style={{
                  background: "repeating-linear-gradient(90deg, transparent, transparent 22px, rgba(255,255,255,0.1) 22px, rgba(255,255,255,0.1) 24px)"
                }} />
                {/* Continents hint */}
                <div className="absolute top-4 left-5 w-8 h-5 bg-emerald-400/60 rounded-full rotate-12" />
                <div className="absolute top-8 left-12 w-5 h-8 bg-emerald-400/50 rounded-full -rotate-6" />
                <div className="absolute bottom-5 left-8 w-9 h-4 bg-emerald-400/50 rounded-full rotate-3" />
              </div>
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFCD00] animate-spin" />
              {/* GPS icon */}
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#FFCD00] flex items-center justify-center shadow-lg animate-bounce">
                <LocationIcon />
              </div>
            </div>
            <div>
              <p className="font-bold text-gray-800">Encontrando tu ubicación...</p>
              <p className="text-xs text-gray-400 mt-1">Usando GPS de alta precisión</p>
            </div>
          </div>
        )}

        {step === "found" && coords && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">¡Ubicación encontrada!</p>
                <p className="text-xs text-gray-400">Precisión: ±{coords.accuracy}m</p>
              </div>
            </div>

            {/* Mini mapa con iframe de OpenStreetMap */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-100">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005},${coords.lat - 0.005},${coords.lng + 0.005},${coords.lat + 0.005}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
                className="w-full h-full border-0"
                title="Tu ubicación"
              />
              {/* Person icon overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1C355E] border-3 border-white shadow-xl flex items-center justify-center text-white text-lg">
                    🧑
                  </div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-[#1C355E]" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3 flex gap-4 text-xs">
              <div><span className="text-gray-400">Lat </span><span className="font-mono font-bold text-gray-700">{coords.lat.toFixed(6)}</span></div>
              <div><span className="text-gray-400">Lng </span><span className="font-mono font-bold text-gray-700">{coords.lng.toFixed(6)}</span></div>
            </div>

            <button onClick={handleAccept} className="w-full py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] transition-all">
              Confirmar ubicación
            </button>
          </div>
        )}

        {step === "denied" && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-800">Acceso denegado</p>
              <p className="text-xs text-gray-500 mt-1">Activa la ubicación en la configuración de tu navegador e intenta de nuevo.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">Cerrar</button>
              <button onClick={requestGeo} className="flex-1 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d]">Reintentar</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VISITAS PASADAS MODAL
// ─────────────────────────────────────────────────────────────────────────────
function VisitasPasadasModal({ show, onClose, empresa, visitasFinalizadas }) {
  const pasadas = visitasFinalizadas.filter(
    (v) => v.datosVisita?.nombreEmpresa?.toLowerCase() === empresa?.toLowerCase()
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
            <HistoryIcon />
            <p className="mt-3 text-sm">No hay visitas previas para esta empresa</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pasadas.map((v) => (
              <div key={v.id} className="border border-gray-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">{v.datosVisita?.tipoVisita}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Realizada</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <span>📅 {v.fecha} {v.hora}</span>
                  <span>📍 {v.datosVisita?.municipio}</span>
                  <span>🚗 {v.datosVisita?.tipoVehiculo}</span>
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
// DETALLES VISITA MODAL (el formulario completo al iniciar visita)
// ─────────────────────────────────────────────────────────────────────────────
function DetallesVisitaModal({ show, onClose, cita, user, onFinalizar, visitasFinalizadas }) {
  const emptyForm = {
    nit: "", nombreEmpresa: cita?.cliente || "", nombreEncargado: "", cedulaEncargado: "",
    tipoVisita: "", observaciones: "", municipio: "", tipoVehiculo: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [geoCoords, setGeoCoords] = useState(null);
  const [showGeo, setShowGeo] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasadas, setShowPasadas] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (show) {
      setForm({ ...emptyForm, nombreEmpresa: cita?.cliente || "" });
      setGeoCoords(null); setErrors([]);
    }
  }, [show, cita]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const required = ["nit","nombreEmpresa","nombreEncargado","cedulaEncargado","tipoVisita","municipio","tipoVehiculo"];
    const missing = required.filter((k) => !form[k]?.trim());
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
    onFinalizar({ ...form, geoCoords });
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
            <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
              <CloseIcon />
            </button>
          </div>

          <div className="px-7 py-6 space-y-7">
            {/* DATOS ASESOR */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-[#1C355E] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Datos del Asesor</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ReadonlyField label="Nombres" value={user?.nombres || user?.nombre?.split(" ").slice(0,2).join(" ")} />
                <ReadonlyField label="Apellidos" value={user?.apellidos || user?.nombre?.split(" ").slice(2).join(" ")} />
                <ReadonlyField label="Cédula" value={user?.cedula} />
              </div>
            </section>

            {/* DATOS EMPRESA */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-[#1C355E] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Datos de la Empresa</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="NIT" placeholder="Ej: 900123456-1" value={form.nit} onChange={(e) => set("nit", e.target.value)} />
                <InputField label="Nombre Empresa" placeholder="Empresa S.A.S." value={form.nombreEmpresa} onChange={(e) => set("nombreEmpresa", e.target.value)} />
                <InputField label="Nombre Encargado" placeholder="Nombre completo" value={form.nombreEncargado} onChange={(e) => set("nombreEncargado", e.target.value)} />
                <InputField label="Cédula Encargado" placeholder="1234567890" value={form.cedulaEncargado} onChange={(e) => set("cedulaEncargado", e.target.value)} />
              </div>
            </section>

            {/* DETALLES VISITA */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-[#1C355E] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Detalles de Visita</h3>
              </div>
              <div className="space-y-3">
                <SelectField label="Tipo de Visita" options={TIPO_VISITA} value={form.tipoVisita} onChange={(e) => set("tipoVisita", e.target.value)} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Observaciones</label>
                  <textarea
                    rows={3}
                    placeholder="Describe detalladamente los puntos clave de la visita..."
                    value={form.observaciones}
                    onChange={(e) => set("observaciones", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all resize-none"
                  />
                </div>
                <SelectField
                  label="Municipio con Ciudad"
                  options={MUNICIPIOS_COLOMBIA}
                  value={form.municipio}
                  onChange={(e) => set("municipio", e.target.value)}
                />
                {/* Tipo vehículo */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de Vehículo</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ value: "Motocicleta", icon: <BikeIcon /> }, { value: "Carro", icon: <CarIcon /> }].map(({ value, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set("tipoVehiculo", value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                          ${form.tipoVehiculo === value
                            ? "border-[#1C355E] bg-[#1C355E]/5 text-[#1C355E]"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      >
                        {icon} {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* GEOLOCALIZACIÓN */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-[#1C355E] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Geolocalización</h3>
              </div>

              {!geoCoords ? (
                <button
                  type="button"
                  onClick={() => setShowGeo(true)}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-3
                    text-sm font-semibold text-gray-400 hover:border-[#1C355E] hover:text-[#1C355E] hover:bg-[#1C355E]/3 transition-all"
                >
                  <LocationIcon /> Capturar mi ubicación actual
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Ubicación capturada exitosamente
                  </div>
                  {/* Mapa minimizado en modal */}
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-44">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${geoCoords.lng - 0.004},${geoCoords.lat - 0.004},${geoCoords.lng + 0.004},${geoCoords.lat + 0.004}&layer=mapnik&marker=${geoCoords.lat},${geoCoords.lng}`}
                      className="w-full h-full border-0"
                      title="Tu ubicación actual"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-[#1C355E] border-2 border-white shadow-xl flex items-center justify-center text-base">🧑</div>
                        <div className="w-0 h-0 border-l-3 border-r-3 border-t-6 border-l-transparent border-r-transparent border-t-[#1C355E]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400 font-mono">
                      {geoCoords.lat.toFixed(6)}, {geoCoords.lng.toFixed(6)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGeo(true)}
                      className="text-xs text-[#1C355E] font-semibold hover:underline"
                    >
                      Actualizar
                    </button>
                  </div>
                  {/* Ver visitas pasadas */}
                  <button
                    type="button"
                    onClick={() => setShowPasadas(true)}
                    className="text-xs font-semibold text-[#1C355E] underline underline-offset-2 hover:text-[#16294d] flex items-center gap-1.5 transition-colors"
                  >
                    <HistoryIcon /> Ver visitas pasadas de {form.nombreEmpresa || "esta empresa"}
                  </button>
                </div>
              )}
            </section>

            {/* ERRORES */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-red-600 mb-1">Campos incompletos:</p>
                <p className="text-xs text-red-500">{errors.join(", ")}</p>
              </div>
            )}

            {/* BOTON FINALIZAR */}
            <button
              type="button"
              onClick={handleFinalizar}
              className="w-full py-4 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] active:scale-[.98] transition-all shadow-lg shadow-[#1C355E]/25"
            >
              Finalizar Visita
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <GeoModal show={showGeo} onClose={() => setShowGeo(false)} onSuccess={setGeoCoords} />
      <VisitasPasadasModal
        show={showPasadas}
        onClose={() => setShowPasadas(false)}
        empresa={form.nombreEmpresa}
        visitasFinalizadas={visitasFinalizadas}
      />

      {/* Confirmar finalizar */}
      <Modal show={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">¿Seguro que quieres finalizar?</h3>
            <p className="text-sm text-gray-500 mt-1">Una vez confirmado, la visita quedará registrada y no podrá editarse.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
            >
              No
            </button>
            <button
              onClick={confirmarFinalizar}
              className="flex-1 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] transition-all"
            >
              Sí, finalizar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR CITA MODAL
// ─────────────────────────────────────────────────────────────────────────────
function CrearCitaModal({ show, onClose, user, onCreate }) {
  const empty = { cliente: "", telefono: "", fecha: "", hora: "" };
  const [form, setForm] = useState(empty);
  const [created, setCreated] = useState(null);

  useEffect(() => { if (show) { setForm(empty); setCreated(null); } }, [show]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = (e) => {
    e.preventDefault();
    const nueva = {
      id: Date.now(),
      ...form,
      estado: "pendiente",
      asesorNombre: user?.nombre || "Asesor",
      asesorId: user?.id,
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
              <InputField label="Nombre empresa / cliente" placeholder="Empresa S.A.S." value={form.cliente} onChange={(e) => set("cliente", e.target.value)} required />
              <InputField label="Celular de contacto" placeholder="+57 300 000 0000" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Fecha" type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} required />
                <InputField label="Hora" type="time" value={form.hora} onChange={(e) => set("hora", e.target.value)} required />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#FFCD00] text-[#1C355E] font-bold text-sm hover:bg-yellow-400 active:scale-[.98] transition-all mt-2"
              >
                Crear Visita
              </button>
            </form>
          </>
        ) : (
          /* Confirmación */
          <div className="text-center space-y-5 py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircleIcon />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">¡Visita creada!</h3>
              <p className="text-sm text-gray-500 mt-1">La visita ha sido confirmada y ya está disponible.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2.5 border border-gray-100">
              <DetailRow icon="🏢" label="Empresa" value={created.cliente} />
              <DetailRow icon="📱" label="Celular" value={created.telefono} />
              <DetailRow icon="📅" label="Fecha" value={created.fecha} />
              <DetailRow icon="⏰" label="Hora" value={created.hora} />
              <DetailRow icon="🧑‍💼" label="Asesor" value={created.asesorNombre} />
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] transition-all"
            >
              Listo
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-base">{icon}</span>
      <span className="text-gray-400 min-w-[60px]">{label}</span>
      <span className="font-semibold text-gray-700 truncate">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INICIAR VISITA MODAL (¿Quieres iniciar esta visita?)
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
          <p className="text-sm text-gray-500 mt-1">Se abrirá el formulario de detalles para registrar la información completa.</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
          <DetailRow icon="🏢" label="Empresa" value={cita?.cliente} />
          <DetailRow icon="📅" label="Fecha" value={cita?.fecha} />
          <DetailRow icon="⏰" label="Hora" value={cita?.hora} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-[#FFCD00] text-[#1C355E] font-bold text-sm hover:bg-yellow-400 transition-all"
          >
            Sí, iniciar
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGE DE ESTADO
// ─────────────────────────────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-700" },
  activa:    { label: "Activa",    cls: "bg-emerald-100 text-emerald-700" },
  realizada: { label: "Realizada", cls: "bg-blue-100 text-blue-700" },
  perdida:   { label: "Perdida",   cls: "bg-red-100 text-red-600" },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div className={`rounded-2xl p-5 border ${color} flex items-center gap-4`}>
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-2xl font-black text-gray-800 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function AsesorDashboard() {
  const [user, setUser] = useState(null);
  const [citas, setCitas] = useState([]);
  const [filtro, setFiltro] = useState("pendiente");

  // Modales
  const [showCrear, setShowCrear]         = useState(false);
  const [showIniciar, setShowIniciar]     = useState(false);
  const [showDetalles, setShowDetalles]   = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Visitas finalizadas para historial
  const visitasFinalizadas = citas.filter((c) => c.estado === "realizada");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    // Cargar citas del storage compartido (simulado)
    const storedCitas = localStorage.getItem("equielect_citas");
    if (storedCitas) setCitas(JSON.parse(storedCitas));
  }, []);

  const saveCitas = (updated) => {
    setCitas(updated);
    localStorage.setItem("equielect_citas", JSON.stringify(updated));
  };

  const handleCrearCita = (nueva) => {
    saveCitas([...citas, nueva]);
  };

  const handleIniciarCita = (cita) => {
    setCitaSeleccionada(cita);
    setShowIniciar(true);
  };

  const confirmarIniciarCita = () => {
    setShowIniciar(false);
    // Marcar como activa
    const updated = citas.map((c) =>
      c.id === citaSeleccionada.id ? { ...c, estado: "activa" } : c
    );
    saveCitas(updated);
    setShowDetalles(true);
  };

  const handleFinalizarVisita = (datosVisita) => {
    const updated = citas.map((c) =>
      c.id === citaSeleccionada.id
        ? { ...c, estado: "realizada", datosVisita }
        : c
    );
    saveCitas(updated);
    setCitaSeleccionada(null);
  };

  const citasFiltradas = filtro === "todos" ? citas : citas.filter((c) => c.estado === filtro);
  const stats = {
    pendientes: citas.filter((c) => c.estado === "pendiente").length,
    activas:    citas.filter((c) => c.estado === "activa").length,
    realizadas: citas.filter((c) => c.estado === "realizada").length,
    perdidas:   citas.filter((c) => c.estado === "perdida").length,
  };

  const firstName = user?.nombre?.split(" ")[0] || "Asesor";

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay: .05s; }
        .fade-up-2 { animation-delay: .12s; }
        .fade-up-3 { animation-delay: .18s; }
        .fade-up-4 { animation-delay: .24s; }
      `}</style>

      <div className="space-y-7 pb-10">
        {/* HEADER */}
        <div className="fade-up flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Panel Asesor</p>
            <h1 className="text-3xl font-black text-gray-800 mt-0.5">
              Hola, <span className="text-[#1C355E]">{firstName}</span> 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1">Gestiona tus visitas empresariales</p>
          </div>
          <button
            onClick={() => setShowCrear(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFCD00] text-[#1C355E] font-bold text-sm
              hover:bg-yellow-400 active:scale-[.98] transition-all shadow-lg shadow-yellow-200"
          >
            <PlusIcon /> Nueva Visita
          </button>
        </div>

        {/* STATS */}
        <div className="fade-up fade-up-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Pendientes" value={stats.pendientes} icon="🕐" color="border-yellow-100 bg-yellow-50" />
          <StatCard label="Activas"    value={stats.activas}    icon="🚀" color="border-emerald-100 bg-emerald-50" />
          <StatCard label="Realizadas" value={stats.realizadas} icon="✅" color="border-blue-100 bg-blue-50" />
          <StatCard label="Perdidas"   value={stats.perdidas}   icon="❌" color="border-red-100 bg-red-50" />
        </div>

        {/* FILTROS */}
        <div className="fade-up fade-up-2 flex items-center gap-2 flex-wrap">
          {["todos", "pendiente", "activa", "realizada", "perdida"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all
                ${filtro === f
                  ? "bg-[#1C355E] text-white shadow-lg shadow-[#1C355E]/25"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* LISTA DE CITAS */}
        <div className="fade-up fade-up-3 space-y-3">
          {citasFiltradas.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-400 font-medium">No hay visitas {filtro !== "todos" ? `"${filtro}"` : ""}</p>
              <button
                onClick={() => setShowCrear(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#FFCD00] text-[#1C355E] text-sm font-bold hover:bg-yellow-400 transition-all"
              >
                Crear primera visita
              </button>
            </div>
          )}

          {citasFiltradas.map((cita, i) => (
            <div
              key={cita.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4 hover:border-gray-200 hover:shadow-sm transition-all"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#1C355E]/8 flex items-center justify-center flex-shrink-0 text-lg">
                  🏢
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 truncate">{cita.cliente}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <CalIcon /> {cita.fecha}
                    </span>
                    {cita.hora && <span className="text-xs text-gray-400">· {cita.hora}</span>}
                    {cita.telefono && <span className="text-xs text-gray-400">· 📱 {cita.telefono}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <EstadoBadge estado={cita.estado} />

                {cita.estado === "pendiente" && (
                  <button
                    onClick={() => handleIniciarCita(cita)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFCD00] text-[#1C355E] text-xs font-bold
                      hover:bg-yellow-400 active:scale-[.97] transition-all"
                  >
                    <PlayIcon /> Iniciar
                  </button>
                )}

                {cita.estado === "activa" && (
                  <button
                    onClick={() => { setCitaSeleccionada(cita); setShowDetalles(true); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold
                      hover:bg-emerald-600 active:scale-[.97] transition-all"
                  >
                    Continuar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALES */}
      <CrearCitaModal
        show={showCrear}
        onClose={() => setShowCrear(false)}
        user={user}
        onCreate={handleCrearCita}
      />
      <IniciarVisitaModal
        show={showIniciar}
        onClose={() => setShowIniciar(false)}
        cita={citaSeleccionada}
        onConfirm={confirmarIniciarCita}
      />
      <DetallesVisitaModal
        show={showDetalles}
        onClose={() => setShowDetalles(false)}
        cita={citaSeleccionada}
        user={user}
        onFinalizar={handleFinalizarVisita}
        visitasFinalizadas={visitasFinalizadas}
      />
    </LayoutDashboard>
  );
}
