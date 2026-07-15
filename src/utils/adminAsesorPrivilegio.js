/** Admin autorizado a crear/gestionar visitas como asesor, sin perder privilegios de admin. */
export const ADMIN_ASESOR_CEDULA = "1039420814";
export const ADMIN_ASESOR_NOMBRE = "Alvaro Javier Restrepo";

export function normCedulaPrivilegio(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function esAdminRol(userOrRol) {
  const rol = typeof userOrRol === "string" ? userOrRol : userOrRol?.rol;
  return rol === "adminPlataforma" || rol === "adminComercial";
}

/** Solo este admin puede usar el flujo de visitas como asesor. */
export function esAdminQuePuedeCrearVisitas(user) {
  if (!user || !esAdminRol(user)) return false;
  return normCedulaPrivilegio(user.cedula) === ADMIN_ASESOR_CEDULA;
}

/** Ítems extra del menú lateral para ese admin. */
export const MENU_EXTRA_ADMIN_ASESOR = [
  {
    section: "Visitas",
    name: "Crear visita",
    icon: "Visita",
    path: "/dashboard/asesor",
  },
  {
    section: "Visitas",
    name: "Mi chequeo vehículo",
    icon: "vehiculo",
    path: "/dashboard/asesor/chequeo-vehiculo",
  },
];
