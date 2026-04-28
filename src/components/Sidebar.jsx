"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleMenus } from "@/utils/roleMenus";
import { useSearchParams } from "next/navigation";

// ── Icons ─────────────────────────────────────────────────────────────────────
const ICONS = {
  dashboard: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  contact: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
  ),
  report: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  chart: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  ),
  default: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

// Colores de dots para sub-items de citas
const DOT_COLORS = {
  activa:    "bg-emerald-400",
  pendiente: "bg-yellow-400",
  realizada: "bg-blue-400",
};

function getDotColor(path) {
  const match = path.match(/estado=(\w+)/);
  return match ? (DOT_COLORS[match[1]] || "bg-gray-400") : "bg-gray-400";
}

// Mapeo de nombres de ítems a iconos
function getIcon(item) {
  const name = item.icon || item.name?.toLowerCase();
  if (!name) return ICONS.default;
  if (name.includes("dashboard") || name.includes("inicio") || name.includes("home")) return ICONS.dashboard;
  if (name.includes("cita") || name.includes("calendar")) return ICONS.calendar;
  if (name.includes("cliente") || name.includes("usuario")) return ICONS.users;
  if (name.includes("contacto")) return ICONS.contact;
  if (name.includes("reporte")) return ICONS.report;
  if (name.includes("chart") || name.includes("analisis")) return ICONS.chart;
  return ICONS[name] || ICONS.default;
}

// Rol → etiqueta legible
const ROL_LABELS = {
  adminPlataforma: "Admin Plataforma",
  adminComercial:  "Admin Comercial",
  comercial:       "Asesor Comercial",
};

// ── Componentes base ──────────────────────────────────────────────────────────
function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function SectionLabel({ label }) {
  return (
    <div className="px-6 pt-5 pb-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">
        {label}
      </span>
    </div>
  );
}

function NavItem({ href, icon, label, pathname }) {
const isActive = pathname === href;

  return (
    <Link href={href}>
      <span className={`
        group flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 text-sm font-medium
        transition-all duration-200 cursor-pointer
        ${isActive
          ? "bg-[#FFCD00] text-[#1C355E] shadow-[0_4px_14px_-2px_rgba(255,205,0,0.4)]"
          : "text-gray-300 hover:bg-white/8 hover:text-white"}
      `}>
        <span className={`transition-colors flex-shrink-0 ${isActive ? "text-[#1C355E]" : "text-gray-500 group-hover:text-[#FFCD00]"}`}>
          {icon}
        </span>
        <span className="flex-1">{label}</span>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1C355E]/40 flex-shrink-0" />}
      </span>
    </Link>
  );
}

function SubItem({ href, label, dotColor, pathname, searchParams }) {
  const currentEstado = searchParams.get("estado");

  const basePath = href.split("?")[0];
  const hrefEstado = href.includes("estado=")
    ? href.split("estado=")[1]
    : null;

  const isActive =
    pathname === basePath &&
    currentEstado === hrefEstado;

  return (
    <Link href={href}>
      <span className={`
        flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium
        transition-all duration-150 cursor-pointer
        ${isActive ? "text-[#FFCD00] bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}
      `}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "bg-[#FFCD00]" : dotColor}`} />
        {label}
      </span>
    </Link>
  );
}

function NavGroup({ icon, label, isOpen, onToggle, children, pathname, basePath }) {
  const isChildActive = pathname?.startsWith(basePath);
  return (
    <div>
      <button
        onClick={onToggle}
        style={{ width: "calc(100% - 16px)" }}
        className={`
          group flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 text-sm font-medium
          transition-all duration-200
          ${isChildActive && !isOpen ? "bg-white/8 text-white" : "text-gray-300 hover:bg-white/8 hover:text-white"}
        `}
      >
        <span className={`flex-shrink-0 transition-colors ${isChildActive ? "text-[#FFCD00]" : "text-gray-500 group-hover:text-[#FFCD00]"}`}>
          {icon}
        </span>
        <span className="flex-1 text-left">{label}</span>
        {isChildActive && !isOpen && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFCD00] mr-1 flex-shrink-0" />
        )}
        <span className={`transition-colors flex-shrink-0 ${isChildActive ? "text-[#FFCD00]" : "text-gray-500 group-hover:text-gray-300"}`}>
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="ml-5 mr-2 mt-1 mb-1 pl-3 border-l border-white/10 space-y-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar dinámico ──────────────────────────────────────────────────────────
export default function Sidebar() {
  const [openMenu, setOpenMenu]   = useState(null);
  const [mounted, setMounted]     = useState(false);
  const [rol, setRol]             = useState(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.rol) setRol(user.rol);
  }, []);

  // Abrir automáticamente el grupo si una ruta hija está activa
  useEffect(() => {
    if (!rol || !pathname) return;
    const menu = roleMenus[rol] || [];
    for (const item of menu) {
      if (item.children) {
        const anyActive = item.children.some((sub) =>
          pathname.startsWith(sub.path.split("?")[0])
        );
        if (anyActive) {
          setOpenMenu(item.name);
          break;
        }
      }
    }
  }, [pathname, rol]);

  const toggleMenu = (name) => setOpenMenu(openMenu === name ? null : name);

  const menu = roleMenus[rol] || [];

  // Agrupar ítems por sección (Principal → primero, Gestión → intermedios, Análisis → últimos)
  // Simplificamos: renderizamos todo bajo "Principal" si no hay sección definida
  // Podés agregar un campo `section` en roleMenus si querés separar visualmente
  const sectionMap = {};
  for (const item of menu) {
    const section = item.section || "Principal";
    if (!sectionMap[section]) sectionMap[section] = [];
    sectionMap[section].push(item);
  }

  return (
    <>
      <style>{`
        @keyframes sidebarIn {
          from { opacity:0; transform: translateX(-16px); }
          to   { opacity:1; transform: translateX(0); }
        }
        .sidebar-in { animation: sidebarIn .38s cubic-bezier(.22,1,.36,1) forwards; }
      `}</style>

      <aside className={`
        relative flex flex-col w-64 min-h-screen flex-shrink-0
        bg-[#1C355E]
        border-r border-white/5
        shadow-[4px_0_28px_-4px_rgba(0,0,0,0.35)]
        ${mounted ? "sidebar-in" : "opacity-0"}
      `}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/8">
          <div className="flex items-center justify-center">
            <img src="/assets/img/login/logo.png" alt="Equielect" className="h-9 w-auto" />
          </div>
        </div>

        {/* Role pill */}
        <div className="px-4 pt-4 pb-1">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/6 border border-white/8">
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-[10px] text-[#98989A] font-semibold uppercase tracking-widest leading-none">Panel</p>
              <p className="text-white text-xs font-bold leading-tight mt-0.5 truncate">
                {ROL_LABELS[rol] || rol || "Cargando..."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-emerald-400 font-semibold">Activo</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            </div>
          </div>
        </div>

        {/* Navigation dinámica */}
        <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto">
          {Object.entries(sectionMap).map(([section, items]) => (
            <div key={section}>
              <SectionLabel label={section} />

              {items.map((item) => {
                // Grupo con hijos
                if (item.children?.length) {
                  // Sacar el basePath del primer hijo
                  const basePath = item.children[0].path.split("?")[0].replace(/\/[^/]+$/, "");

                  return (
                    <NavGroup
                      key={item.name}
                      icon={getIcon(item)}
                      label={item.name}
                      isOpen={openMenu === item.name}
                      onToggle={() => toggleMenu(item.name)}
                      pathname={pathname}
                      basePath={basePath}
                    >
                      {item.children.map((sub) => (
                        <SubItem
                          key={sub.path}
                          href={sub.path}
                          label={sub.name}
                          dotColor={getDotColor(sub.path)}
                          pathname={pathname}
                          searchParams={searchParams}
                        />
                      ))}
                    </NavGroup>
                  );
                }

                // Ítem simple
                return (
                  <NavItem
                    key={item.path}
                    href={item.path}
                    icon={getIcon(item)}
                    label={item.name}
                    pathname={pathname}
                  />
                );
              })}
            </div>
          ))}

          {/* Si no hay rol cargado aún */}
          {!rol && mounted && (
            <div className="px-6 py-4">
              <p className="text-xs text-gray-500">Cargando menú...</p>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-5 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4">
            <div className="w-6 h-6 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-[#98989A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-[#98989A] font-medium leading-none">Version</p>
              <p className="text-gray-400 text-xs font-semibold leading-tight mt-0.5">v2.4.1 &bull; Estable</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
