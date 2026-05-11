/**
 * Campos alineados con backendPlataformaeq:
 * POST {CHEQUEO_API}/chequeoVehiculos/chequeoCarro | chequeoMoto | chequeoTransportePublico
 * (schemas/chequeoVehiculo.schema.js)
 */

export const OPCIONES_SI_NO = ["Si", "No"];
export const OPCIONES_C_R_D = ["Conforme", "Regular", "Deficiente"];
export const OPCIONES_C_D = ["Conforme", "Deficiente"];

/**
 * Definición por secciones.
 * key debe coincidir con Joi/backend: chequeoCarro / chequeoMoto.
 */
export const CARRO_SECCIONES = [
  {
    title: "Documentos — ¿Están vigentes y los tienes contigo?",
    kind: "si-no",
    items: [
      { key: "cedulaFisica", label: "Cédula de ciudadanía" },
      { key: "licenciaTransito", label: "Licencia de tránsito" },
      { key: "soat", label: "SOAT" },
      { key: "tecnicoMecanica", label: "Revisión técnico mecánica" },
      { key: "tarjetaPropiedad", label: "Tarjeta de propiedad" },
    ],
  },
  {
    title: "Direccionales",
    kind: "crd",
    items: [
      { key: "delanteras", label: "Delanteras" },
      { key: "traseras", label: "Traseras" },
    ],
  },
  {
    title: "Luces",
    kind: "crd",
    items: [
      { key: "altas", label: "Altas" },
      { key: "bajas", label: "Bajas" },
      { key: "stops", label: "Stops" },
      { key: "reversa", label: "Reversa" },
      { key: "parqueo", label: "Parqueo" },
      { key: "internas", label: "Internas" },
    ],
  },
  {
    title: "Limpia parabrisas",
    kind: "crd",
    items: [
      { key: "parabrisasDerecho", label: "Derecho" },
      { key: "parabrisasIzquierdo", label: "Izquierdo" },
      { key: "parabrisasTrasero", label: "Trasero" },
    ],
  },
  {
    title: "Frenos",
    kind: "cd",
    items: [
      { key: "frenoPrincipal", label: "Principal" },
      { key: "frenoEmergencia", label: "Emergencia" },
    ],
  },
  {
    title: "Llantas",
    kind: "crd",
    items: [
      { key: "llantasDelanteras", label: "Delanteras" },
      { key: "llantasTraseras", label: "Traseras" },
      { key: "llantaRepuesto", label: "Repuesto" },
    ],
  },
  {
    title: "Espejos",
    kind: "crd",
    items: [
      { key: "espejosLaterales", label: "Laterales" },
    ],
  },
  {
    title: "Pito",
    kind: "crd",
    items: [
      { key: "pitoPrincipal", label: "Principal" },
      { key: "pitoReversa", label: "Reversa" },
    ],
  },
  {
    title: "Kit de carretera",
    kind: "cd",
    items: [
      { key: "extintor", label: "Extintor" },
      { key: "gato", label: "Gato" },
      { key: "cruceta", label: "Cruceta" },
      { key: "señalesCarretera", label: "Señales de carretera" },
      { key: "botiquin", label: "Botiquín" },
      { key: "tacos", label: "Tacos" },
      { key: "linterna", label: "Linterna" },
      { key: "cajaHerramientas", label: "Caja de herramientas" },
    ],
  },
];

export const MOTO_SECCIONES = [
  {
    title: "Documentos — ¿Están vigentes y los tienes contigo?",
    kind: "si-no",
    items: [
      { key: "cedulaFisica", label: "Cédula de ciudadanía" },
      { key: "licenciaTransito", label: "Licencia de tránsito" },
      { key: "soat", label: "SOAT" },
      { key: "tecnicoMecanica", label: "Revisión técnico mecánica" },
      { key: "tarjetaPropiedad", label: "Tarjeta de propiedad" },
    ],
  },
  {
    title: "Niveles de líquidos",
    kind: "crd",
    items: [
      { key: "nivelAceite", label: "Nivel de aceite" },
      { key: "nivelCombustible", label: "Nivel de combustible" },
      { key: "nivelLiquidoFrenos", label: "Nivel líquido de frenos" },
      { key: "fugasCombustible", label: "Fugas de combustible" },
      { key: "fugasAgua", label: "Fugas de agua" },
      { key: "fugasAceiteMotor", label: "Fugas aceite de motor" },
      { key: "fugasLiquidoFrenos", label: "Fugas líquido de frenos" },
    ],
  },
  {
    title: "Estado mecánico",
    kind: "crd",
    items: [
      { key: "encendido", label: "Encendido" },
      { key: "estadoTensionCadena", label: "Estado y tensión de la cadena" },
      { key: "estadoPinonCoronaTrasera", label: "Estado piñón y corona trasera" },
      { key: "estadoGuayaEmbrague", label: "Estado guaya y sistema de embrague" },
      { key: "estadoTensionFrenoDelantero", label: "Estado y tensión freno delantero" },
      { key: "estadoTensionFrenoTrasero", label: "Estado y tensión freno trasero" },
      { key: "suspensionTraseraAmortiguadores", label: "Suspensión trasera amortiguadores" },
      { key: "funcionamientoDireccion", label: "Funcionamiento de la dirección" },
      { key: "sistemaElectricoGeneral", label: "Sistema eléctrico general" },
      { key: "funcionamientoCajaCambios", label: "Funcionamiento caja de cambios" },
      { key: "estadoExosto", label: "Estado del exosto" },
    ],
  },
  {
    title: "Estado luces",
    kind: "crd",
    items: [
      { key: "lucesMedias", label: "Luces medias" },
      { key: "lucesAltas", label: "Luces altas" },
      { key: "lucesBajas", label: "Luces bajas" },
      { key: "lucesDireccionalesTraseras", label: "Luces direccionales traseras" },
      { key: "lucesDireccionalesDelanteras", label: "Luces direccionales delanteras" },
      { key: "luzFreno", label: "Luz freno" },
      { key: "lucesTablero", label: "Luces del tablero" },
    ],
  },
  {
    title: "Estado de llantas",
    kind: "crd",
    items: [
      { key: "llantaDelantera", label: "Llanta delantera (desgaste y ajuste)" },
      { key: "llantaTrasera", label: "Llanta trasera (desgaste y ajuste)" },
      { key: "estadoPernos", label: "Estado de los pernos (ajuste)" },
      { key: "deformacionesLlanta", label: "Deformaciones de la llanta" },
    ],
  },
  {
    title: "Estado general",
    kind: "crd",
    items: [
      { key: "estadoAjusteSillaConductor", label: "Estado y ajuste de la silla del conductor" },
      { key: "espejosLaterales", label: "Espejos laterales" },
      { key: "estadoManilleras", label: "Estado manillares" },
      { key: "indicadorVelocidad", label: "Indicador de velocidad" },
      { key: "estadoBateria", label: "Estado batería" },
      { key: "estadoPito", label: "Estado pito" },
      { key: "estadoCalapies", label: "Estado calapiés" },
    ],
  },
  {
    title: "Equipo de seguridad",
    kind: "crd",
    items: [
      { key: "cascoSeguridad", label: "Casco de seguridad" },
      { key: "chaquetaProteccion", label: "Chaqueta antifricción / protección codos" },
      { key: "guantes", label: "Guantes" },
      { key: "botasSeguridad", label: "Botas de seguridad" },
      { key: "gafasProteccion", label: "Gafas de protección" },
    ],
  },
];
