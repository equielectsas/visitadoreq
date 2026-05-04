"use client";

import { useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

// ─── DATOS FAKE ───────────────────────────────────────────────────────────────
const MOCK_ASESORES = [
  {
    id: 1,
    nombre: "Carlos Mendoza",
    email: "c.mendoza@safix.co",
    avatar: "CM",
    alertaPendiente: false,
    tareas: [
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
  },
  {
    id: 2,
    nombre: "Valentina Torres",
    email: "v.torres@safix.co",
    avatar: "VT",
    alertaPendiente: true,
    tareas: [
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
  },
  {
    id: 3,
    nombre: "Diego Ramírez",
    email: "d.ramirez@safix.co",
    avatar: "DR",
    alertaPendiente: false,
    tareas: [
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
  },
];

const CHECKBOX_LABELS = {
  presentacionProductos: "Presentación de productos",
  demostracion:          "Demostración del sistema",
  cotizacion:            "Envío de cotización",
  seguimientoPago:       "Seguimiento de pago",
  firmaContrato:         "Firma de contrato",
};

// ── Avatar gradients (igual que Topbar) ───────────────────────────────────────
const GRADIENTS = [
  "from-yellow-400 to-orange-400", "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
];
function getGradient(str = "") {
  return GRADIENTS[(str.charCodeAt(0) || 0) % GRADIENTS.length];
}

// ── Mini icons ────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const BellIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const MailIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

// ── Stat Card (mismo estilo que AdminDashboard) ───────────────────────────────
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
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1C355E]/6 flex items-center justify-center text-[#1C355E] flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ done }) {
  return done
    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">✓ Completada</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200">Pendiente</span>;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function AvatarCircle({ initials, size = "sm" }) {
  const sz = size === "lg" ? "w-11 h-11 text-sm" : "w-8 h-8 text-xs";
  const gradient = getGradient(initials);
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Progress bar inline ───────────────────────────────────────────────────────
function ProgressBar({ done, total, completed }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-16 sm:w-20 flex-shrink-0">
        <div
          className={`h-full rounded-full transition-all duration-500 ${completed ? "bg-emerald-400" : "bg-[#1C355E]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold text-[#98989A] whitespace-nowrap">{done}/{total}</span>
    </div>
  );
}

// ── Alerta chip ───────────────────────────────────────────────────────────────
function AlertaChip({ activa }) {
  if (activa) return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Enviada</span>;
  return <span className="text-[11px] text-[#98989A]">Sin alerta</span>;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  return (
    <div className="fixed bottom-5 right-5 z-[2000] bg-[#1C355E] text-white px-5 py-3.5 rounded-2xl
      text-sm font-semibold shadow-[0_8px_30px_rgba(28,53,94,0.35)]
      animate-[toastIn_0.2s_ease_both]">
      {msg}
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ asesor, tarea, onClose }) {
  if (!tarea || !asesor) return null;
  const total = Object.keys(tarea.checkboxes).length;
  const done  = Object.values(tarea.checkboxes).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl
        shadow-2xl border border-gray-100 modal-slide max-h-[92dvh] flex flex-col">

        {/* Drag handle (mobile) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex-shrink-0 mt-2 sm:mt-0">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarCircle initials={asesor.avatar} size="lg" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#98989A]">Detalle de tarea</p>
              <p className="text-base font-black text-[#1C355E] leading-tight truncate">{tarea.empresa}</p>
              <p className="text-xs text-[#98989A] mt-0.5">{asesor.nombre} · NIT {tarea.nit}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge done={tarea.completada} />
            <button onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Ciudad",       value: tarea.ciudad },
              { label: "Contacto",     value: tarea.contacto },
              { label: "Teléfono",     value: tarea.telefono },
              { label: "Fecha visita", value: tarea.fechaVisita },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F4F6FA] rounded-xl px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#98989A] mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[#1C355E]">{value}</p>
              </div>
            ))}
          </div>

          {/* Progreso */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#98989A]">Actividades</p>
              <span className="text-xs font-black text-[#1C355E]">{done}/{total} completadas</span>
            </div>
            <div className="space-y-2">
              {Object.entries(CHECKBOX_LABELS).map(([key, label]) => {
                const checked = tarea.checkboxes[key];
                return (
                  <div key={key} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border
                    ${checked ? "bg-emerald-50 border-emerald-100" : "bg-[#F4F6FA] border-gray-100"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                      ${checked ? "bg-emerald-400" : "bg-gray-200"}`}>
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${checked ? "text-emerald-700" : "text-gray-500"}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notas */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#98989A] mb-2">Notas</p>
            <div className="bg-[#F4F6FA] rounded-xl px-4 py-3 text-sm text-gray-600 leading-relaxed min-h-[52px] border border-dashed border-gray-200">
              {tarea.notas || <span className="text-gray-300">Sin notas registradas</span>}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <p className="text-[11px] text-[#98989A] text-center">👁 Modo solo lectura</p>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Alert Modal ───────────────────────────────────────────────────────
function ConfirmAlertModal({ asesor, onConfirm, onClose }) {
  if (!asesor) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-7 modal-slide border border-gray-100">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <BellIcon />
          </div>
          <p className="text-lg font-black text-[#1C355E] mb-2">Enviar alerta al asesor</p>
          <p className="text-sm text-[#98989A] leading-relaxed">
            Se activará una notificación visible para <span className="font-semibold text-[#1C355E]">{asesor.nombre}</span> la próxima vez que ingrese al dashboard.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors shadow-sm">
            Enviar alerta
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Row (tabla responsive: card en mobile, fila en md+) ───────────────────────
function TaskRow({ asesor, tarea, onView, onAlert, onEmail }) {
  const total = Object.keys(tarea.checkboxes).length;
  const done  = Object.values(tarea.checkboxes).filter(Boolean).length;

  return (
    <>
      {/* ── Mobile card view (< md) ── */}
      <div className="md:hidden bg-white rounded-2xl border border-gray-100 p-4
        shadow-[0_2px_12px_-4px_rgba(28,53,94,0.08)] hover:shadow-[0_4px_20px_-4px_rgba(28,53,94,0.14)] transition-shadow">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarCircle initials={asesor.avatar} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1C355E] truncate">{tarea.empresa}</p>
              <p className="text-xs text-[#98989A] truncate">{asesor.nombre}</p>
            </div>
          </div>
          <Badge done={tarea.completada} />
        </div>

        {/* Details row */}
        <div className="flex items-center gap-4 mb-3 text-xs text-[#98989A]">
          <span>{tarea.ciudad}</span>
          <span>·</span>
          <span>{tarea.fechaVisita}</span>
          <span>·</span>
          {tarea.completada ? (
            <span className="text-gray-300">—</span>
          ) : (
            <AlertaChip activa={asesor.alertaPendiente} />
          )}
        </div>

        {/* Progress + actions */}
        <div className="flex items-center justify-between gap-2">
          <ProgressBar done={done} total={total} completed={tarea.completada} />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ActionBtn icon={<EyeIcon />} label="Ver" color="gray" onClick={() => onView(asesor, tarea)} />
            {!tarea.completada && (
              <>
                <ActionBtn icon={<BellIcon />} label="Alerta" color="red"   onClick={() => onAlert(asesor)} />
                <ActionBtn icon={<MailIcon />} label="Email"  color="blue"  onClick={() => onEmail(asesor)} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop table row (md+) ── */}
      <tr className="hidden md:table-row border-b border-gray-50 hover:bg-[#F4F6FA]/50 transition-colors group">
        {/* Asesor */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <AvatarCircle initials={asesor.avatar} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1C355E] truncate max-w-[130px]">{asesor.nombre}</p>
              <p className="text-[11px] text-[#98989A] truncate max-w-[130px]">{asesor.email}</p>
            </div>
          </div>
        </td>
        {/* Empresa */}
        <td className="px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C355E] truncate max-w-[180px]">{tarea.empresa}</p>
          <p className="text-[11px] text-[#98989A] font-mono">{tarea.nit}</p>
        </td>
        {/* Ciudad */}
        <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap hidden lg:table-cell">{tarea.ciudad}</td>
        {/* Fecha */}
        <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap hidden xl:table-cell">{tarea.fechaVisita}</td>
        {/* Progreso */}
        <td className="px-5 py-3.5">
          <ProgressBar done={done} total={total} completed={tarea.completada} />
        </td>
        {/* Estado */}
        <td className="px-5 py-3.5"><Badge done={tarea.completada} /></td>
        {/* Alerta */}
        <td className="px-5 py-3.5 hidden lg:table-cell">
          {tarea.completada
            ? <span className="text-gray-300 text-xs">—</span>
            : <AlertaChip activa={asesor.alertaPendiente} />
          }
        </td>
        {/* Acciones */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <ActionBtn icon={<EyeIcon />} label="Ver detalle"    color="gray" onClick={() => onView(asesor, tarea)} />
            {!tarea.completada && (
              <>
                <ActionBtn icon={<BellIcon />} label="Enviar alerta" color="red"  onClick={() => onAlert(asesor)} />
                <ActionBtn icon={<MailIcon />} label="Enviar correo" color="blue" onClick={() => onEmail(asesor)} />
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

function ActionBtn({ icon, label, color, onClick }) {
  const colorMap = {
    gray: "text-[#1C355E] hover:bg-[#1C355E]/8 hover:border-[#1C355E]/20",
    red:  "text-red-500 hover:bg-red-50 hover:border-red-200",
    blue: "text-blue-500 hover:bg-blue-50 hover:border-blue-200",
  };
  return (
    <button onClick={onClick} title={label}
      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gray-200 bg-white
        flex items-center justify-center transition-all duration-150 active:scale-95
        opacity-70 hover:opacity-100 ${colorMap[color]}`}>
      {icon}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TareasPendientesAdmin() {
  const [asesores, setAsesores]       = useState(MOCK_ASESORES);
  const [selectedTarea, setSelectedTarea]   = useState(null);
  const [selectedAsesor, setSelectedAsesor] = useState(null);
  const [toast, setToast]             = useState(null);
  const [confirmAlert, setConfirmAlert] = useState(null);
  const [filterAsesor, setFilterAsesor] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todas");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleEnviarCorreo = (asesor) => showToast(`📧 Correo enviado a ${asesor.nombre}`);

  const confirmarAlerta = () => {
    if (!confirmAlert) return;
    setAsesores((prev) => prev.map((a) => a.id === confirmAlert.id ? { ...a, alertaPendiente: true } : a));
    showToast(`🔔 Alerta activada para ${confirmAlert.nombre}`);
    setConfirmAlert(null);
  };

  const asList = asesores
    .filter((a) => filterAsesor === "todos" || a.id.toString() === filterAsesor)
    .flatMap((a) =>
      a.tareas
        .filter((t) => filterEstado === "todas" ? true : filterEstado === "pendientes" ? !t.completada : t.completada)
        .map((t) => ({ asesor: a, tarea: t }))
    );

  const todasTareas        = asesores.flatMap((a) => a.tareas);
  const totalPendientes    = todasTareas.filter((t) => !t.completada).length;
  const totalCompletadas   = todasTareas.filter((t) => t.completada).length;
  const asesoresConPend    = asesores.filter((a) => a.tareas.some((t) => !t.completada)).length;

  const tabs = [
    { key: "todas",      label: "Todas" },
    { key: "pendientes", label: "Pendientes" },
    { key: "completadas",label: "Completadas" },
  ];

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-1 { animation-delay:.05s; } .fade-up-2 { animation-delay:.10s; }
        .fade-up-3 { animation-delay:.15s; } .fade-up-4 { animation-delay:.20s; }
        .fade-up-5 { animation-delay:.25s; }
        @keyframes modalSlide { from { opacity:0; transform:scale(.96) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @media (max-width:639px) {
          @keyframes modalSlide { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
        }
        .modal-slide { animation: modalSlide .25s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes toastIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <main className="flex-1 bg-[#F4F6FA] p-4 sm:p-6 md:p-8 min-h-screen">

        {/* Title */}
        <div className="fade-up fade-up-1 mb-5 sm:mb-7 flex items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#98989A] uppercase tracking-widest mb-0.5">Panel General</p>
            <h1 className="text-xl sm:text-2xl font-black text-[#1C355E] leading-tight">Tareas Pendientes</h1>
            <p className="text-xs text-[#98989A] mt-1 hidden sm:block">Gestión global de visitas y actividades de todos los asesores</p>
          </div>
          <div className="text-[10px] sm:text-xs text-[#98989A] font-medium bg-white border border-gray-200
            px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap flex-shrink-0">
            {new Date().toLocaleDateString("es-CO", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
          {[
            { icon: <ListIcon />,  label: "Total tareas",           value: todasTareas.length,  sub: "registradas",       accent: "bg-[#1C355E]" },
            { icon: <ClockIcon />, label: "Pendientes",             value: totalPendientes,      sub: "por completar",     accent: "bg-[#FFCD00]" },
            { icon: <CheckIcon />, label: "Completadas",            value: totalCompletadas,     sub: "finalizadas",       accent: "bg-emerald-400" },
            { icon: <UsersIcon />, label: "Asesores con pendientes",value: asesoresConPend,      sub: "requieren atención",accent: "bg-red-400" },
          ].map((c, i) => (
            <div key={c.label} className={`fade-up fade-up-${i + 1}`}>
              <StatCard {...c} />
            </div>
          ))}
        </div>

        {/* Filters + Table */}
        <div className="fade-up fade-up-5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-4px_rgba(28,53,94,0.08)] overflow-hidden">

          {/* Table header / filters */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-[#98989A] uppercase tracking-widest">Registro global</p>
              <p className="text-base font-black text-[#1C355E]">Todas las tareas</p>
            </div>
            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Asesor select */}
              <select
                value={filterAsesor}
                onChange={(e) => setFilterAsesor(e.target.value)}
                className="text-xs font-semibold text-[#1C355E] bg-[#F4F6FA] border border-gray-200
                  rounded-xl px-3 py-2 outline-none focus:border-[#1C355E] cursor-pointer transition-colors"
              >
                <option value="todos">Todos los asesores</option>
                {asesores.map((a) => (
                  <option key={a.id} value={a.id.toString()}>{a.nombre}</option>
                ))}
              </select>
              {/* Status tabs */}
              <div className="flex items-center gap-1 bg-[#F4F6FA] rounded-xl p-1 overflow-x-auto scrollbar-none">
                {tabs.map((t) => (
                  <button key={t.key} onClick={() => setFilterEstado(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap
                      ${filterEstado === t.key ? "bg-[#1C355E] text-white shadow-sm" : "text-[#98989A] hover:text-[#1C355E]"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {asList.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-sm font-semibold text-[#98989A]">No hay tareas con estos filtros</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden p-4 space-y-3">
                {asList.map(({ asesor, tarea }) => (
                  <TaskRow key={tarea.id} asesor={asesor} tarea={tarea}
                    onView={(a, t) => { setSelectedAsesor(a); setSelectedTarea(t); }}
                    onAlert={setConfirmAlert}
                    onEmail={handleEnviarCorreo}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="bg-[#F4F6FA]">
                      {["Asesor", "Empresa", "Ciudad", "Fecha", "Progreso", "Estado", "Alerta", ""].map((h, i) => (
                        <th key={i} className={`text-left px-5 py-3 text-[11px] font-bold text-[#98989A] uppercase tracking-widest
                          ${h === "Ciudad"  ? "hidden lg:table-cell" : ""}
                          ${h === "Fecha"   ? "hidden xl:table-cell" : ""}
                          ${h === "Alerta"  ? "hidden lg:table-cell" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {asList.map(({ asesor, tarea }) => (
                      <TaskRow key={tarea.id} asesor={asesor} tarea={tarea}
                        onView={(a, t) => { setSelectedAsesor(a); setSelectedTarea(t); }}
                        onAlert={setConfirmAlert}
                        onEmail={handleEnviarCorreo}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-[#98989A] font-medium">
              Mostrando <span className="font-bold text-[#1C355E]">{asList.length}</span> de{" "}
              <span className="font-bold text-[#1C355E]">{todasTareas.length}</span> tareas
            </p>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-[10px] sm:text-xs text-[#98989A] font-medium">Equielect · Tareas Admin · v2.4.1</p>
        </div>
      </main>

      {/* Modals */}
      <DetailModal
        asesor={selectedAsesor}
        tarea={selectedTarea}
        onClose={() => { setSelectedTarea(null); setSelectedAsesor(null); }}
      />
      <ConfirmAlertModal
        asesor={confirmAlert}
        onConfirm={confirmarAlerta}
        onClose={() => setConfirmAlert(null)}
      />

      {/* Toast */}
      {toast && <Toast msg={toast} />}
    </LayoutDashboard>
  );
}
