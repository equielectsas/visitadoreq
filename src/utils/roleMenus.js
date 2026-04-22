export const roleMenus = {
  adminPlataforma: [
    {
      section: "Principal",
      name: "Inicio",
      icon: "dashboard",
      path: "/dashboard/programador",
    },
    {
      section: "Principal",
      name: "Citas",
      icon: "calendar",
      children: [
        { name: "Activas",    path: "/dashboard/programador/citas?estado=activa" },
        { name: "Pendientes", path: "/dashboard/programador/citas?estado=pendiente" },
        { name: "Realizadas", path: "/dashboard/programador/citas?estado=realizada" },
        { name: "Perdidas",   path: "/dashboard/programador/citas?estado=perdida" },
      ],
    },
    {
      section: "Gestión",
      name: "Clientes",
      icon: "users",
      path: "/dashboard/programador/clientes",
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
      path: "/dashboard/programador/calendar",
    },
  ],

  adminComercial: [
    {
      section: "Principal",
      name: "Inicio",
      icon: "dashboard",
      path: "/dashboard/admin",
    },
    {
      section: "Principal",
      name: "Citas",
      icon: "calendar",
      children: [
        { name: "Activas",    path: "/dashboard/admin/citas?estado=activa" },
        { name: "Pendientes", path: "/dashboard/admin/citas?estado=pendiente" },
      ],
    },
    {
      section: "Gestión",
      name: "Clientes",
      icon: "users",
      path: "/dashboard/admin/clientes",
    },
    {
      section: "Análisis",
      name: "Reportes",
      icon: "report",
      path: "/dashboard/admin/reportes",
    },
  ],

  comercial: [
    {
      section: "Principal",
      name: "Inicio",
      icon: "dashboard",
      path: "/dashboard/asesor",
    },
    {
      section: "Principal",
      name: "Citas",
      icon: "calendar",
      children: [
        { name: "Pendientes", path: "/dashboard/asesor/citas?estado=pendiente" },
      ],
    },
    {
      section: "Gestión",
      name: "Clientes",
      icon: "users",
      path: "/dashboard/asesor/clientes",
    },
  ],
};
