export const adminSidebarItems = [
  "Dashboard",
  "Usuarios",
  "Barberos",
  "Barberos pendientes",
  "Servicios",
  "Categorías",
  "Zonas",
  "Moderación",
  "Estadísticas"
];

export const adminSidebarRoutes: Record<string, string> = {
  Dashboard: "/administrador",
  Usuarios: "/administrador/usuarios",
  Barberos: "/administrador/barberos",
  "Barberos pendientes": "/administrador/barberos/pendientes",
  Servicios: "/administrador/servicios",
  "Categorías": "/administrador/categorias",
  Zonas: "/administrador/zonas",
  "Moderación": "/administrador/moderacion",
  "Estadísticas": "/administrador/estadisticas"
};
