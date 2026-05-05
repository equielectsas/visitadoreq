export const roleMenus = {
  adminPlataforma: [
    {
      section: "Principal",
      name: "Inicio",
      icon: "dashboard",
      path: "/dashboard/programador",
    },
    {
      section: "Gestión",
      name: "Clientes",
      icon: "users",
      path: "/dashboard/programador/clientes",
    },
    {
      section: "Gestión",
      name: "Tareas Pendientes",
      icon: "steps",
      path: "/dashboard/programador/tareas",
    },
    {
      section: "Gestión",
      name: "Usuarios",
      icon: "users",
      path: "/dashboard/programador/usuarios",
    },
    {
      section: "Gestión",
      name: "Contactos",
      icon: "contact",
      path: "/dashboard/programador/contactos",
    },
    {
      section: "Análisis",
      name: "Reportes",
      icon: "report",
      path: "/dashboard/programador/reportes",
    },
    {
      section: "Análisis",
      name: "Calendario",
      icon: "calendar",
      path: "/dashboard/programador/calendario",
    },
  ],

  comercial: [
    {
      section: "Principal",
      name: "Inicio",
      icon: "dashboard",
      path: "/dashboard/asesor/inicio",
    },
    {
      section: "Principal",
      name: "Crear visita",
      icon: "Visita",
      path: "/dashboard/asesor",
    },
    {
      section: "Gestión",
      name: "Clientes",
      icon: "users",
      path: "/dashboard/asesor/clientes",
    },
    {
      section: "Gestión",
      name: "Tareas Pendientes",
      icon: "steps",
      path: "/dashboard/asesor/tareas",
    },
    {
      section: "Análisis",
      name: "Reportes",
      icon: "report",
      path: "/dashboard/asesor/reportes",
    },
    {
      section: "Análisis",
      name: "Calendario",
      icon: "calendar",
      path: "/dashboard/asesor/calendario",
    },
  ],
};
// adminComercial usa exactamente el mismo menú que adminPlataforma
roleMenus.adminComercial = roleMenus.adminPlataforma;