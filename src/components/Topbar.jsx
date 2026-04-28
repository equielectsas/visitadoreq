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
const CheckAllIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7M3 13l4 4" />
  </svg>
);
// Hamburger icon for mobile menu toggle
const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
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

// ── Notifications ─────────────────────────────────────────────────────────────
const NOTIF_ICONS = {
  cita:    { emoji: "📅", bg: "bg-blue-50",    text: "text-blue-600"   },
  alerta:  { emoji: "⚠️", bg: "bg-yellow-50",  text: "text-yellow-600" },
  sistema: { emoji: "⚙️", bg: "bg-gray-50",    text: "text-gray-600"   },
  exito:   { emoji: "✅", bg: "bg-emerald-50", text: "text-emerald-600" },
};
const INITIAL_NOTIFS = [
  { id: 1, type: "cita",    title: "Cita pendiente",           body: "Tienes una cita con Empresa ABC mañana a las 10:00 AM",    time: "hace 5 min",  read: false },
  { id: 2, type: "alerta",  title: "Visita sin finalizar",      body: "La visita a Ferretería López lleva más de 2 horas activa", time: "hace 30 min", read: false },
  { id: 3, type: "exito",   title: "Cita realizada",            body: "La visita a Constructora Norte fue marcada como realizada",time: "hace 1h",     read: false },
  { id: 4, type: "sistema", title: "Actualización del sistema", body: "La plataforma se actualizó a v2.4.1 con nuevas funciones", time: "hace 3h",     read: true  },
];

// ── Avatar ────────────────────────────────────────────────────────────────────
const GRADIENTS = [
  "from-yellow-400 to-orange-400", "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
];
function getGradient(name = "") { return GRADIENTS[(name.charCodeAt(0) || 0) % GRADIENTS.length]; }

function Avatar({ user, size = "md" }) {
  const sz       = size === "lg" ? "w-11 h-11 text-base" : "w-9 h-9 text-sm";
  const initials = (user?.nombre || "U").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  const gradient = getGradient(user?.nombre || "");
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.nombre} className={`${sz} rounded-full object-cover shadow-md ring-2 ring-white`} />;
  }
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white`}>
      {initials}
    </div>
  );
}

// ── Notifications Modal ───────────────────────────────────────────────────────
function NotificationsModal({ show, onClose, notifs, onMarkRead, onMarkAllRead, unreadCount }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    if (show) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [show, onClose]);
  if (!show) return null;

  return (
    // En mobile: full width alineado a la derecha con margen
    // En sm+: width fijo 96 (w-96)
    <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm z-50" ref={ref}>
      <div className="notif-modal bg-white rounded-2xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.20)] border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1C355E]/8 flex items-center justify-center">
              <BellIcon />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">Notificaciones</p>
              {unreadCount > 0 && <p className="text-[11px] text-gray-400">{unreadCount} sin leer</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button onClick={onMarkAllRead}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1C355E] hover:text-[#FFCD00] px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-[#1C355E]/5 transition-all">
                <CheckAllIcon />
                <span className="hidden sm:inline">Todas leídas</span>
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>
        {/* List */}
        <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto divide-y divide-gray-50">
          {notifs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-4xl mb-3">🔕</p>
              <p className="text-sm font-semibold text-gray-500">No tienes notificaciones</p>
              <p className="text-xs text-gray-400 mt-1">Aquí aparecerán tus alertas y novedades</p>
            </div>
          ) : (
            notifs.map((n) => {
              const nInfo = NOTIF_ICONS[n.type] || NOTIF_ICONS.sistema;
              return (
                <button key={n.id} onClick={() => onMarkRead(n.id)}
                  className={`w-full flex items-start gap-3 px-4 sm:px-5 py-4 text-left transition-all duration-150
                    ${n.read ? "opacity-60 hover:opacity-80 hover:bg-gray-50" : "hover:bg-blue-50/40 bg-blue-50/20"}`}>
                  <div className={`w-9 h-9 rounded-xl ${nInfo.bg} flex items-center justify-center text-base flex-shrink-0 mt-0.5`}>
                    {nInfo.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold leading-tight ${n.read ? "text-gray-500" : "text-gray-800"}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#FFCD00] flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">{n.time}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
        {notifs.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400 text-center font-medium">
              {notifs.filter((n) => n.read).length} de {notifs.length} leídas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Config Modal ──────────────────────────────────────────────────────────────
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
      <button onClick={toggle}
        className={`relative rounded-full transition-all duration-200 ${on ? "bg-[#1C355E]" : "bg-gray-200"}`}
        style={{ height: "22px", width: "40px" }}>
        <span className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200 ${on ? "translate-x-[18px]" : "translate-x-0"}`}
          style={{ width: "18px", height: "18px" }} />
      </button>
    </div>
  );
}

function ConfigModal({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-4 pt-16 sm:pt-16">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:w-80 border border-gray-100">
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
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Notificaciones</p>
            <div className="space-y-3">
              {[
                { label: "Notificaciones push",  key: "notif_push",          defaultVal: true  },
                { label: "Alertas de citas",      key: "notif_citas",         defaultVal: true  },
                { label: "Recordatorios",         key: "notif_recordatorios", defaultVal: false },
              ].map(({ label, key, defaultVal }) => (
                <Toggle key={key} label={label} storageKey={key} defaultVal={defaultVal} />
              ))}
            </div>
          </div>
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

function readUserFromStorage() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

// ── DropItem ──────────────────────────────────────────────────────────────────
function DropItem({ icon, label, sublabel, onClick, color = "gray" }) {
  const colorMap = {
    gray: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    red:  "text-red-500 hover:text-red-600 hover:bg-red-50",
  };
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[.98] ${colorMap[color]}`}>
      <span className="opacity-70 flex-shrink-0">{icon}</span>
      <div className="text-left min-w-0">
        <p className="font-semibold leading-tight">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// Acepta `onMenuToggle` para abrir el sidebar drawer en mobile
// ─────────────────────────────────────────────────────────────────────────────
export default function Topbar({ onMenuToggle }) {
  const [open, setOpen]             = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [user, setUser]             = useState(null);
  const [visible, setVisible]       = useState(false);
  const [notifs, setNotifs]         = useState(INITIAL_NOTIFS);
  const router   = useRouter();
  const dropRef  = useRef(null);

  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    setUser(readUserFromStorage());
    setTimeout(() => setVisible(true), 50);
  }, []);

  useEffect(() => {
    const onFocus = () => setUser(readUserFromStorage());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    const onAvatarUpdated = () => setUser(readUserFromStorage());
    window.addEventListener("avatar-updated", onAvatarUpdated);
    return () => window.removeEventListener("avatar-updated", onAvatarUpdated);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleMarkRead    = (id) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const handleMarkAllRead = ()   => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const roleBadge = ROLE_STYLES[user?.rol] || ROLE_STYLES.default;
  const rolLabel  = ROL_DISPLAY[user?.rol] || user?.rol?.toUpperCase() || "USUARIO";
  const fullName  = user?.nombre || "Cargando...";

  const perfilPath =
    user?.rol === "comercial"        ? "/dashboard/asesor/perfil"
    : user?.rol === "adminComercial" ? "/dashboard/admin/perfil"
    : "/dashboard/programador/perfil";

  return (
    <>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes topbarIn  { from { opacity:0; transform:translateY(-100%); } to { opacity:1; transform:translateY(0); } }
        .topbar-in   { animation: topbarIn .35s cubic-bezier(.22,1,.36,1) forwards; }
        .dropdown-in { animation: slideDown .2s cubic-bezier(.34,1.56,.64,1) forwards; }
        .notif-modal { animation: slideDown .2s cubic-bezier(.34,1.56,.64,1) forwards; }
        .notif-pulse { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <header className={`sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100
        shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] ${visible ? "topbar-in" : "opacity-0"}`}>
        <div className="px-3 sm:px-5 md:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">

          {/* LEFT: hamburger (mobile/tablet) + título */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger — solo visible en lg- */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-600
                hover:bg-gray-100 active:scale-95 transition-all duration-150 flex-shrink-0"
              aria-label="Abrir menú"
            >
              <MenuIcon />
            </button>

            <div className="hidden sm:block w-1 h-7 rounded-full bg-gradient-to-b from-[#F5C800] to-[#e0a800] flex-shrink-0" />

            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                Bienvenido de vuelta
              </p>
              <p className="text-sm sm:text-[15px] font-bold text-gray-800 truncate leading-tight">
                {rolLabel}
              </p>
            </div>
          </div>

          {/* RIGHT: bell + avatar */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifs((v) => !v); setOpen(false); }}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500
                  hover:text-gray-800 hover:bg-gray-100 active:scale-95 transition-all duration-150"
                aria-label="Notificaciones"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full
                    bg-[#F5C800] ring-2 ring-white flex items-center justify-center notif-pulse">
                    <span className="text-[8px] font-black text-[#1C355E] leading-none">{unreadCount}</span>
                  </span>
                )}
              </button>
              <NotificationsModal
                show={showNotifs}
                onClose={() => setShowNotifs(false)}
                notifs={notifs}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
                unreadCount={unreadCount}
              />
            </div>

            <div className="w-px h-6 bg-gray-200 mx-0.5 sm:mx-1" />

            {/* Avatar dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => { setOpen(!open); setShowNotifs(false); }}
                className="flex items-center gap-1.5 sm:gap-2.5 pl-1 pr-2 sm:pr-3 py-1 rounded-xl
                  hover:bg-gray-100 active:scale-95 transition-all duration-150 group"
                aria-label="Menú de usuario"
              >
                <Avatar user={user} />
                {/* Nombre solo en md+ */}
                <span className="hidden md:block text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                  {fullName}
                </span>
                <span className="text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block">
                  <ChevronIcon open={open} />
                </span>
              </button>

              {open && (
                <div className="dropdown-in absolute right-0 mt-2 w-64 bg-white rounded-2xl
                  shadow-[0_8px_40px_-8px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden z-50">
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
                    <DropItem icon={<UserIcon />} label="Mi perfil" sublabel="Ver y editar información"
                      onClick={() => { setOpen(false); router.push(perfilPath); }} color="gray" />
                    <DropItem icon={<SettingsIcon />} label="Configuración" sublabel="Notificaciones y preferencias"
                      onClick={() => { setOpen(false); setShowConfig(true); }} color="gray" />
                  </div>
                  <div className="p-1.5 border-t border-gray-100">
                    <DropItem icon={<LogoutIcon />} label="Cerrar sesión" onClick={handleLogout} color="red" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ConfigModal show={showConfig} onClose={() => setShowConfig(false)} />
    </>
  );
}
