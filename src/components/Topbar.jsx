"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Icons ─────────────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ── Role config ───────────────────────────────────────────────────────────────
const ROL_DISPLAY = {
  adminPlataforma: "PROGRAMADOR",
  adminComercial:  "ADMINISTRADOR",
  comercial:       "ASESOR",
};
const ROLE_STYLES = {
  adminPlataforma: { bg: "bg-[#1C355E]/10", text: "text-[#1C355E]",   label: "Programador"   },
  adminComercial:  { bg: "bg-[#FFCD00]/20", text: "text-yellow-700",  label: "Administrador" },
  comercial:       { bg: "bg-emerald-100",   text: "text-emerald-700", label: "Asesor"        },
  default:         { bg: "bg-gray-100",      text: "text-gray-600",    label: "Usuario"       },
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const GRADIENTS = [
  "from-yellow-400 to-orange-400", "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
];
function getGradient(name = "") { return GRADIENTS[(name.charCodeAt(0) || 0) % GRADIENTS.length]; }

function Avatar({ user, size = "md" }) {
  const sz    = size === "lg" ? "w-11 h-11 text-base" : "w-9 h-9 text-sm";
  const ring  = size === "lg" ? "ring-2" : "ring-2";
  const initials = (user?.nombre || "U").split(" ").slice(0,2).map((n) => n[0]).join("").toUpperCase();
  const gradient = getGradient(user?.nombre || "");

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.nombre}
        className={`${sz} rounded-full object-cover shadow-md ${ring} ring-white`}
      />
    );
  }
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-md ${ring} ring-white`}>
      {initials}
    </div>
  );
}

// ── Configuración Modal ───────────────────────────────────────────────────────
function ConfigModal({ show, onClose, user }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-80 border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SettingsIcon />
            <span className="text-sm font-bold text-gray-800">Configuración</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <CloseIcon />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Notificaciones */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Notificaciones</p>
            <div className="space-y-3">
              {[
                { label: "Notificaciones push",   key: "notif_push",  default: true },
                { label: "Alertas de citas",       key: "notif_citas", default: true },
                { label: "Recordatorios",          key: "notif_recordatorios", default: false },
              ].map(({ label, key, default: def }) => (
                <Toggle key={key} label={label} storageKey={key} defaultVal={def} />
              ))}
            </div>
          </div>
          {/* Apariencia */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Apariencia</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Modo oscuro</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Próximamente</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">v2.4.1 · Equielect Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, storageKey, defaultVal }) {
  const [on, setOn] = useState(() => {
    if (typeof window === "undefined") return defaultVal;
    const stored = localStorage.getItem(`cfg_${storageKey}`);
    return stored !== null ? stored === "true" : defaultVal;
  });
  const toggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem(`cfg_${storageKey}`, String(next));
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <button
        onClick={toggle}
        className={`relative w-10 h-5.5 rounded-full transition-all duration-200 ${on ? "bg-[#1C355E]" : "bg-gray-200"}`}
        style={{ height: "22px", width: "40px" }}
      >
        <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200
          ${on ? "translate-x-[18px]" : "translate-x-0"}`}
          style={{ width: "18px", height: "18px" }}
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────────────────────
export default function Topbar() {
  const [open, setOpen]         = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [user, setUser]         = useState(null);
  const [visible, setVisible]   = useState(false);
  const [notifDot, setNotifDot] = useState(true);
  const router  = useRouter();
  const dropRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    setTimeout(() => setVisible(true), 50);
  }, []);

  // Refrescar avatar al volver al foco (por si se editó en perfil)
  useEffect(() => {
    const onFocus = () => {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const roleBadge = ROLE_STYLES[user?.rol] || ROLE_STYLES.default;
  const rolLabel  = ROL_DISPLAY[user?.rol] || user?.rol?.toUpperCase() || "USUARIO";
  const fullName  = user?.nombre || "Cargando...";

  // Ruta de perfil según rol
  const perfilPath = user?.rol === "comercial"
    ? "/dashboard/asesor/perfil"
    : user?.rol === "adminComercial"
    ? "/dashboard/admin/perfil"
    : "/dashboard/programador/perfil";

  return (
    <>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes topbarIn  { from { opacity:0; transform:translateY(-100%); } to { opacity:1; transform:translateY(0); } }
        .topbar-in   { animation: topbarIn .35s cubic-bezier(.22,1,.36,1) forwards; }
        .dropdown-in { animation: slideDown .2s cubic-bezier(.34,1.56,.64,1) forwards; }
        .notif-pulse { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
      `}</style>

      <header className={`sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100
        shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] ${visible ? "topbar-in" : "opacity-0"}`}>
        <div className="px-5 md:px-8 h-16 flex items-center justify-between gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:block w-1 h-7 rounded-full bg-gradient-to-b from-[#F5C800] to-[#e0a800] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest leading-none mb-0.5">Bienvenido de vuelta</p>
              <p className="text-[15px] font-bold text-gray-800 truncate leading-tight">
                {rolLabel}
                <span className="ml-2 inline-flex items-center">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                    {roleBadge.label}
                  </span>
                </span>
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            {/* Bell */}
            <button
              onClick={() => setNotifDot(false)}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:scale-95 transition-all duration-150"
            >
              <BellIcon />
              {notifDot && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F5C800] notif-pulse ring-2 ring-white" />}
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Avatar dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 active:scale-95 transition-all duration-150 group"
              >
                <Avatar user={user} />
                <span className="hidden md:block text-sm font-semibold text-gray-700 max-w-[120px] truncate">{fullName}</span>
                <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  <ChevronIcon open={open} />
                </span>
              </button>

              {open && (
                <div className="dropdown-in absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden z-50">

                  {/* User card */}
                  <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} size="lg" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{fullName}</p>
                        <p className="text-xs text-gray-400 truncate">C.C. {user?.cedula || "—"}</p>
                        <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                          {roleBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <DropItem
                      icon={<UserIcon />}
                      label="Mi perfil"
                      sublabel="Ver y editar información"
                      onClick={() => { setOpen(false); router.push(perfilPath); }}
                      color="gray"
                    />
                    <DropItem
                      icon={<SettingsIcon />}
                      label="Configuración"
                      sublabel="Notificaciones y preferencias"
                      onClick={() => { setOpen(false); setShowConfig(true); }}
                      color="gray"
                    />
                  </div>

                  <div className="p-1.5 border-t border-gray-100">
                    <DropItem
                      icon={<LogoutIcon />}
                      label="Cerrar sesión"
                      onClick={handleLogout}
                      color="red"
                    />
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      <ConfigModal show={showConfig} onClose={() => setShowConfig(false)} user={user} />
    </>
  );
}

function DropItem({ icon, label, sublabel, onClick, color = "gray" }) {
  const colorMap = {
    gray: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    red:  "text-red-500 hover:text-red-600 hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[.98] ${colorMap[color]}`}
    >
      <span className="opacity-70 flex-shrink-0">{icon}</span>
      <div className="text-left min-w-0">
        <p className="font-semibold leading-tight">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );
}
