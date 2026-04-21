"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleMenus } from "@/utils/roleMenus";

export default function Sidebar({ rol }) {
  const pathname = usePathname();
  const menu = roleMenus[rol] || [];

  return (
    <aside className="bg-[var(--color-secondary)] text-white w-64 hidden sm:block min-h-screen">
      
      <div className="p-6">
        <h1 className="text-3xl font-bold uppercase">Admin</h1>

        <button className="w-full bg-white text-[var(--color-secondary)] font-semibold py-2 mt-5 rounded-lg shadow hover:bg-gray-200">
          + Nuevo Reporte
        </button>
      </div>

      <nav className="mt-6">
        {menu.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link key={item.path} href={item.path}>
              <span
                className={`block py-3 px-6 cursor-pointer transition
                ${
                  isActive
                    ? "bg-[var(--color-primary)] text-black"
                    : "opacity-75 hover:bg-[var(--color-primary)] hover:text-black"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}