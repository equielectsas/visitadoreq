"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AdvisorTaskUrgencyModal from "./AdvisorTaskUrgencyModal";
import { roleRoutes } from "@/utils/roleRoutes";

export default function LayoutDashboard({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!pathname) return;
    const isAdminPath =
      pathname.startsWith("/dashboard/admin") ||
      pathname.startsWith("/dashboard/programador");

    if (!isAdminPath) return;

    let rol = null;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      rol = u?.rol || null;
    } catch {}

    const isAdminRol = rol === "adminPlataforma" || rol === "adminComercial";
    if (!isAdminRol) {
      const fallback = roleRoutes[rol] || "/auth/login";
      if (fallback !== pathname) router.replace(fallback);
      return;
    }

    // Renombre: programador -> admin (redirige sin romper URLs antiguas)
    if (pathname.startsWith("/dashboard/programador")) {
      router.replace(pathname.replace("/dashboard/programador", "/dashboard/admin"));
    }
  }, [pathname, router]);

  return (
    <div className="eq-dashboard flex flex-col h-screen bg-[#f6f8fb] dark:bg-[var(--eq-page-bg)] transition-colors duration-200">
      <AdvisorTaskUrgencyModal />
      <Topbar
        onMenuToggle={() => setMobileOpen(true)}
        mobileDrawerOpen={mobileOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={closeMobileMenu}
        />
        <main className="eq-main flex-1 overflow-auto px-3 py-4 sm:px-5 sm:py-5 md:p-6 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}