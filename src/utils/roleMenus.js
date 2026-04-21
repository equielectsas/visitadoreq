export const roleMenus = {
  adminPlataforma: [
    { name: "Dashboard", path: "/dashboard/programador" },
    { name: "Usuarios", path: "/dashboard/programador/usuarios" },
    { name: "Tablas", path: "/dashboard/programador/tables" },
    { name: "Formularios", path: "/dashboard/programador/forms" },
    { name: "Calendar", path: "/dashboard/programador/calendar" },
  ],

  adminComercial: [
    { name: "Dashboard", path: "/dashboard/admin" },
    { name: "Tablas", path: "/dashboard/admin/tables" },
    { name: "Calendar", path: "/dashboard/admin/calendar" },
  ],

  comercial: [
    { name: "Dashboard", path: "/dashboard/asesor" },
    { name: "Visitas", path: "/dashboard/asesor/visitas" },
    { name: "Clientes", path: "/dashboard/asesor/clientes" },
  ],
};