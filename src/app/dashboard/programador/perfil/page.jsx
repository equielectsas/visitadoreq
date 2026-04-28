"use client";
/**
 * perfil/page.jsx — Página de perfil UNIVERSAL
 * Funciona para: adminPlataforma, adminComercial, comercial
 * Coloca este archivo en:
 *   /dashboard/programador/perfil/page.jsx
 *   /dashboard/admin/perfil/page.jsx
 *   /dashboard/asesor/perfil/page.jsx
 *
 * La URL no cambia ni se redirige. Los datos se leen de localStorage["user"].
 */
import { useState, useEffect, useRef } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

// ── Icons ─────────────────────────────────────────────────────────────────────
const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ── Role display ──────────────────────────────────────────────────────────────
const ROL_INFO = {
  adminPlataforma: { label: "Admin Plataforma", badge: "bg-[#1C355E] text-white",     emoji: "💻", bannerFrom: "from-[#1C355E]", bannerTo: "to-[#0f2040]" },
  adminComercial:  { label: "Admin Comercial",  badge: "bg-[#FFCD00] text-[#1C355E]", emoji: "📊", bannerFrom: "from-[#1a3060]", bannerTo: "to-[#FFCD00]/60" },
  comercial:       { label: "Asesor Comercial", badge: "bg-emerald-500 text-white",    emoji: "🤝", bannerFrom: "from-[#1C355E]", bannerTo: "to-emerald-700" },
};
const GRADIENTS = [
  ["from-yellow-400", "to-orange-400"],
  ["from-sky-400",    "to-blue-500"],
  ["from-emerald-400","to-teal-500"],
  ["from-violet-400", "to-purple-500"],
  ["from-rose-400",   "to-pink-500"],
];
function getGradient(name = "") {
  const i = (name.charCodeAt(0) || 0) % GRADIENTS.length;
  return GRADIENTS[i].join(" ");
}

// ── Stat color per role ───────────────────────────────────────────────────────
const STAT_COLORS = {
  adminPlataforma: [
    { color: "bg-[#1C355E]/5  border-[#1C355E]/10", text: "text-[#1C355E]" },
    { color: "bg-blue-50     border-blue-100",       text: "text-blue-600"  },
    { color: "bg-yellow-50   border-yellow-100",     text: "text-yellow-600"},
    { color: "bg-emerald-50  border-emerald-100",    text: "text-emerald-600"},
  ],
  adminComercial: [
    { color: "bg-[#FFCD00]/10 border-[#FFCD00]/30", text: "text-yellow-700" },
    { color: "bg-blue-50      border-blue-100",      text: "text-blue-600"  },
    { color: "bg-yellow-50    border-yellow-100",    text: "text-yellow-600"},
  ],
  comercial: [
    { color: "bg-[#1C355E]/5  border-[#1C355E]/10", text: "text-[#1C355E]" },
    { color: "bg-blue-50      border-blue-100",      text: "text-blue-600"  },
    { color: "bg-yellow-50    border-yellow-100",    text: "text-yellow-600"},
  ],
};

// ── Field ─────────────────────────────────────────────────────────────────────
function ProfileField({ label, value, editing, onChange, type = "text", readOnly = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{label}</label>
      {editing && !readOnly ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800
            focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20 focus:border-[#1C355E] transition-all"
        />
      ) : (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold
          ${readOnly ? "border border-dashed border-gray-200 text-gray-400 bg-gray-50/60" : "bg-gray-50 text-gray-800"}`}>
          {value || <span className="text-gray-300 font-normal">—</span>}
        </div>
      )}
    </div>
  );
}

function SectionCard({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <div className="w-8 h-8 rounded-lg bg-[#1C355E]/8 flex items-center justify-center text-[#1C355E]">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Visit detail modal (read-only, greyed out) ────────────────────────────────
function VisitDetailModal({ visit, onClose }) {
  if (!visit) return null;
  const statusColors = {
    realizada: "bg-blue-100 text-blue-700",
    pendiente: "bg-yellow-100 text-yellow-700",
    activa:    "bg-emerald-100 text-emerald-700",
  };
  const fields = [
    { label: "Cliente",      value: visit.cliente },
    { label: "Fecha",        value: visit.fecha },
    { label: "Hora",         value: visit.hora },
    { label: "Dirección",    value: visit.direccion  || "—" },
    { label: "Teléfono",     value: visit.telefono   || "—" },
    { label: "Contacto",     value: visit.contacto   || "—" },
    { label: "Observación",  value: visit.observacion || "—" },
    { label: "Asesor",       value: visit.asesorNombre || "—" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Detalle de visita</p>
            <p className="text-base font-black text-gray-700 leading-tight">{visit.cliente}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${statusColors[visit.estado] || "bg-gray-100 text-gray-500"}`}>
              {visit.estado}
            </span>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>
        {/* Body — all fields greyed-out (read-only) */}
        <div className="p-6 grid grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-300">{label}</p>
              <div className="px-3 py-2.5 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-sm font-medium text-gray-400 select-none">
                {value}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5">
          <p className="text-[11px] text-gray-300 text-center">
            👁 Modo solo lectura — Visita finalizada
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Avatar preview with live update ──────────────────────────────────────────
function AvatarDisplay({ avatar, initials, gradient, onClick, fileRef, onFileChange }) {
  return (
    <div className="relative">
      {avatar ? (
        <img
          src={avatar}
          alt="Avatar"
          className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl ring-2 ring-gray-100"
        />
      ) : (
        <div
          className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center
            border-4 border-white shadow-xl ring-2 ring-gray-100 text-3xl font-black text-white`}
        >
          {initials}
        </div>
      )}
      <button
        onClick={onClick}
        title="Cambiar foto de perfil"
        className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[#FFCD00] text-[#1C355E]
          flex items-center justify-center shadow-lg hover:bg-yellow-400 active:scale-95 transition-all"
      >
        <CameraIcon />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function PerfilPage() {
  const [user, setUser]         = useState(null);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [avatar, setAvatar]     = useState(null);
  const [saved, setSaved]       = useState(false);
  const [allCitas, setAllCitas] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setForm(u);
      if (u.avatar) setAvatar(u.avatar);
    }
    const storedCitas = localStorage.getItem("equielect_citas");
    if (storedCitas) setAllCitas(JSON.parse(storedCitas));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    const updated = { ...form, avatar };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // ✅ Notifica al Topbar que el avatar cambió para que se refresque
    window.dispatchEvent(new Event("avatar-updated"));
  };

  const handleCancel = () => {
    setForm(user);
    setAvatar(user?.avatar || null);
    setEditing(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatar(dataUrl);
      // Preview instantáneo: guarda el avatar en localStorage para que el topbar lo muestre de inmediato
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        const updated = { ...u, avatar: dataUrl };
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new Event("avatar-updated"));
      }
    };
    reader.readAsDataURL(file);
  };

  if (!user) return (
    <LayoutDashboard>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[#1C355E] border-t-transparent animate-spin" />
      </div>
    </LayoutDashboard>
  );

  const rolInfo  = ROL_INFO[user.rol] || { label: user.rol, badge: "bg-gray-100 text-gray-600", emoji: "👤", bannerFrom: "from-gray-700", bannerTo: "to-gray-900" };
  const initials = (user.nombre || "U").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  const gradient = getGradient(user.nombre || "");

  // ── Build stats based on role ─────────────────────────────────────────────
  const isAsesor = user.rol === "comercial";

  const myVisits = isAsesor
    ? allCitas.filter((c) => c.asesorId === user.id || c.asesorNombre === user.nombre)
    : allCitas;

  const statsConfig = (isAsesor || user.rol === "adminComercial") ? [
    { label: "Total visitas",   value: myVisits.length },
    { label: "Realizadas",      value: myVisits.filter((c) => c.estado === "realizada").length },
    { label: "Pendientes",      value: myVisits.filter((c) => c.estado === "pendiente").length },
  ] : [
    { label: "Total citas",       value: allCitas.length },
    { label: "Realizadas",        value: allCitas.filter((c) => c.estado === "realizada").length },
    { label: "Pendientes",        value: allCitas.filter((c) => c.estado === "pendiente").length },
    { label: "Asesores activos",  value: [...new Set(allCitas.map((c) => c.asesorId || c.asesorNombre))].length },
  ];

  const colors = STAT_COLORS[user.rol] || STAT_COLORS.comercial;

  const recentVisits = isAsesor
    ? myVisits.slice(-5).reverse()
    : allCitas.slice(-5).reverse();

  return (
    <LayoutDashboard>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
        .fu-1 { animation-delay:.06s; } .fu-2 { animation-delay:.12s; }
        .fu-3 { animation-delay:.18s; } .fu-4 { animation-delay:.24s; }
        @keyframes toastIn { from { opacity:0; transform:translateY(12px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        .toast { animation: toastIn .3s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes modalIn { from { opacity:0; transform:scale(.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .modal-in { animation: modalIn .25s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      {/* Toast */}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 toast">
          <div className="flex items-center gap-3 bg-[#1C355E] text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold">
            <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
              <SaveIcon />
            </div>
            Perfil actualizado correctamente
          </div>
        </div>
      )}

      {/* Visit detail modal */}
      {selectedVisit && (
        <VisitDetailModal visit={selectedVisit} onClose={() => setSelectedVisit(null)} />
      )}

      <div className="max-w-4xl mx-auto space-y-6 pb-10">

        {/* ── HEADER CARD ──────────────────────────────────────────────── */}
        <div className="fu bg-white rounded-3xl border border-gray-100 overflow-hidden">
          {/* Banner */}
          <div className={`h-28 bg-gradient-to-r ${rolInfo.bannerFrom} via-[#264a82] ${rolInfo.bannerTo} relative`}>
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,205,0,0.3) 20px, rgba(255,205,0,0.3) 22px)" }}
            />
          </div>

          <div className="px-7 pb-6 -mt-14 flex items-end justify-between flex-wrap gap-4">
            {/* Avatar con botón de cámara siempre visible */}
            <AvatarDisplay
              avatar={avatar}
              initials={initials}
              gradient={gradient}
              onClick={() => fileRef.current?.click()}
              fileRef={fileRef}
              onFileChange={handlePhotoChange}
            />

            {/* Info + buttons */}
            <div className="flex-1 min-w-0 pt-6">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-black text-gray-800 leading-tight">{user.nombre || "Cargando..."}</h1>
                  <p className="text-sm text-gray-400 mt-0.5">C.C. {user.cedula || "—"}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${rolInfo.badge}`}>
                      {rolInfo.emoji} {rolInfo.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </span>
                  </div>
                </div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600
                      hover:bg-gray-50 hover:border-gray-300 active:scale-[.97] transition-all"
                  >
                    <EditIcon /> Editar perfil
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C355E] text-white text-sm font-bold hover:bg-[#16294d] active:scale-[.97] transition-all"
                    >
                      <SaveIcon /> Guardar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS ────────────────────────────────────────────────────── */}
        <div
          className="fu fu-1 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${statsConfig.length}, minmax(0, 1fr))` }}
        >
          {statsConfig.map(({ label, value }, i) => (
            <div key={label} className={`rounded-2xl border p-5 ${(colors[i] || colors[0]).color}`}>
              <p className={`text-3xl font-black ${(colors[i] || colors[0]).text}`}>{value}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── DATOS PERSONALES ─────────────────────────────────────────── */}
        <div className="fu fu-2">
          <SectionCard icon={<UserIcon />} title="Información Personal">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField
                label="Nombres"
                value={form.nombres || form.nombre?.split(" ").slice(0, 2).join(" ")}
                editing={editing}
                onChange={(v) => set("nombres", v)}
              />
              <ProfileField
                label="Apellidos"
                value={form.apellidos || form.nombre?.split(" ").slice(2).join(" ")}
                editing={editing}
                onChange={(v) => set("apellidos", v)}
              />
              <ProfileField
                label="Nombre completo"
                value={form.nombre}
                editing={editing}
                onChange={(v) => set("nombre", v)}
              />
              <ProfileField label="Cédula" value={form.cedula} editing={false} readOnly />
              <ProfileField
                label="Correo electrónico"
                value={form.email}
                type="email"
                editing={editing}
                onChange={(v) => set("email", v)}
              />
              <ProfileField
                label="Teléfono"
                value={form.telefono}
                type="tel"
                editing={editing}
                onChange={(v) => set("telefono", v)}
              />
              <ProfileField
                label="Dirección"
                value={form.direccion}
                editing={editing}
                onChange={(v) => set("direccion", v)}
              />
              <ProfileField
                label="Ciudad"
                value={form.ciudad}
                editing={editing}
                onChange={(v) => set("ciudad", v)}
              />
            </div>
          </SectionCard>
        </div>

        {/* ── DATOS DE CUENTA ──────────────────────────────────────────── */}
        <div className="fu fu-3">
          <SectionCard icon={<ShieldIcon />} title="Datos de Cuenta">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField label="Rol" value={rolInfo.label} editing={false} readOnly />
              <ProfileField label="ID de usuario" value={String(user.id || "—")} editing={false} readOnly />
              <ProfileField
                label="Usuario / Login"
                value={form.usuario || form.email}
                editing={editing}
                onChange={(v) => set("usuario", v)}
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Contraseña</label>
                <div className="px-4 py-3 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-sm text-gray-300 font-medium">
                  ••••••••••
                </div>
              </div>
            </div>
            {editing && (
              <p className="mt-4 text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                💡 Para cambiar la contraseña, contacta al administrador de la plataforma.
              </p>
            )}
          </SectionCard>
        </div>

        {/* ── ACTIVIDAD RECIENTE ───────────────────────────────────────── */}
        <div className="fu fu-4">
          <SectionCard
            icon={<ActivityIcon />}
            title={isAsesor ? "Mi Actividad Reciente" : "Actividad Reciente (Global)"}
          >
            {recentVisits.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin actividad registrada aún</p>
            ) : (
              <div className="space-y-0 divide-y divide-gray-50">
                {recentVisits.map((v) => {
                  // ✅ FIX: isFinished evaluado correctamente por cada visita
                  const isFinished = v.estado === "realizada";

                  return (
                    <div key={v.id} className="flex items-center justify-between py-3 group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                          🏢
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">{v.cliente}</p>
                          <p className="text-xs text-gray-400">
                            {v.fecha} · {v.hora}
                            {!isAsesor && v.asesorNombre && (
                              <span className="ml-1.5 text-[#1C355E] font-semibold">· {v.asesorNombre}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full
                            ${v.estado === "realizada" ? "bg-blue-100 text-blue-700"
                              : v.estado === "pendiente" ? "bg-yellow-100 text-yellow-700"
                              : v.estado === "activa"    ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-600"}`}
                        >
                          {v.estado}
                        </span>

                        {/* ✅ FIX: isFinished ahora es una const local dentro del .map */}
                        {isFinished && (
                          <button
                            onClick={() => setSelectedVisit(v)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#1C355E] text-gray-400 hover:text-white
                              flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100"
                            title="Ver detalles"
                          >
                            <EyeIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

      </div>
    </LayoutDashboard>
  );
}
