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
    <div className="flex flex-col h-screen bg-[#f6f8fb]">
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
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}