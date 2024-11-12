export const TIPO_CLIENTE = [
  { id: 1, nombre: "Demandante" },
  { id: 2, nombre: "Demandado" },
];
export const DOCUMENT_TYPES = [
  { id: 1, nombre: "L.E. / DNI" },
  { id: 2, nombre: "RUC" },
  { id: 3, nombre: "Pasaporte" },
];
export const TIPOS_DE_SERVICIO = [
  { id: 1, nombre: "Asesoría Legal" },
  { id: 2, nombre: "Consultoría Legal" },
  { id: 3, nombre: "Patrocinio Judicial" },
];
export const TIPOS_DE_CLIENTE = [
  { id: 1, nombre: "Demandante" },
  { id: 2, nombre: "Demandado" },
];

export const ADMINS = [
  "juliovictorcs00@gmail.com",
  "dpretellgallardo@gmail.com",
  "tonysatn@gmail.com",
  "jackelinearanda1@gmail.com",
  "sanchezvalderramasebastianluis@gmail.com",
];

export const TIPO_ACTO_RESOLUCION = [
  { id: 1, nombre: "Subsanación" },
  { id: 2, nombre: "Audiencia" },
  { id: 3, nombre: "Sentencia" },
  { id: 12, nombre: "Requerimiento" },
  { id: 5, nombre: "Otros" },
];
export const TIPO_ACTO_ESCRITO = [
  // { id: 5, nombre: "Subsanar" },
  { id: 6, nombre: "Apelación" },
  { id: 7, nombre: "Nulidad" },
  { id: 8, nombre: "Reprogramación" },
  { id: 9, nombre: "Cumplimiento de Mandato" },
  { id: 5, nombre: "Otros" },
];
export const TIPO_ACTO_NOTA = [
  { id: 10, nombre: "Agendar" },
  { id: 5, nombre: "Otros" },
];
export const TIPO_ACTO_CUADERNO_CAUTELAR = [
  { id: 11, nombre: "Acto Procesal" },
];
export const TIPO_REGISTRO = [
  { id: 1, nombre: "Resolución", tiposDeActos: TIPO_ACTO_RESOLUCION },
  { id: 2, nombre: "Escrito", tiposDeActos: TIPO_ACTO_ESCRITO },
  { id: 3, nombre: "Nota", tiposDeActos: TIPO_ACTO_NOTA },
  {
    id: 4,
    nombre: "Cuaderno Cautelar",
    tiposDeActos: TIPO_ACTO_CUADERNO_CAUTELAR,
  },
];

export const COLORES = [
  { id: 1, nombre: "Rojo", color: "red" },
  { id: 2, nombre: "Azul", color: "blue" },
  { id: 3, nombre: "Verde", color: "green" },
  { id: 4, nombre: "Amarillo", color: "yellow" },
  { id: 5, nombre: "Naranja", color: "orange" },
  { id: 6, nombre: "Morado", color: "purple" },
  { id: 7, nombre: "Gris", color: "gray" },
  { id: 8, nombre: "Blanco", color: "white" },
];

const todosLosTiposDeActosEx = [
  ...TIPO_ACTO_RESOLUCION,
  ...TIPO_ACTO_ESCRITO,
  ...TIPO_ACTO_NOTA,
  ...TIPO_ACTO_CUADERNO_CAUTELAR,
];
export const meses = [
  { id: 1, nombre: "Enero" },
  { id: 2, nombre: "Febrero" },
  { id: 3, nombre: "Marzo" },
  { id: 4, nombre: "Abril" },
  { id: 5, nombre: "Mayo" },
  { id: 6, nombre: "Junio" },
  { id: 7, nombre: "Julio" },
  { id: 8, nombre: "Agosto" },
  { id: 9, nombre: "Septiembre" },
  { id: 10, nombre: "Octubre" },
  { id: 11, nombre: "Noviembre" },
  { id: 12, nombre: "Diciembre" },
];

const generateYears = () => {
  const from = 2000;
  const to = new Date().getFullYear() + 5;
  return Array.from({ length: to - from + 1 }, (_, i) => ({
    id: from + i,
    nombre: from + i,
  }));
};

export const years = generateYears();

export const IDENTIFIERS = [
  { id: 1, nombre: "DNI" },
  { id: 2, nombre: "Gmail" },
];

export const todosLosTiposDeActos = Array.from(
  new Map(todosLosTiposDeActosEx.map((acto) => [acto.nombre, acto])).values(),
);

const mapIdToObj = (list: any[]) => {
  const map = new Map();
  list.forEach((item) => map.set(item.id, item));
  return map;
};
export const IDENTIFIERS_MAP = mapIdToObj(IDENTIFIERS);
export const COLORES_MAP = mapIdToObj(COLORES);
export const TIPO_CLIENTE_MAP = mapIdToObj(TIPO_CLIENTE);
export const DOCUMENT_TYPES_MAP = mapIdToObj(DOCUMENT_TYPES);
export const TIPOS_DE_SERVICIO_MAP = mapIdToObj(TIPOS_DE_SERVICIO);
export const TIPO_REGISTRO_MAP = mapIdToObj(TIPO_REGISTRO);
export const TIPO_ACTO_RESOLUCION_MAP = mapIdToObj(TIPO_ACTO_RESOLUCION);
export const TIPO_ACTO_ESCRITO_MAP = mapIdToObj(TIPO_ACTO_ESCRITO);
export const TIPO_ACTO_NOTA_MAP = mapIdToObj(TIPO_ACTO_NOTA);
export const TIPO_ACTO_CUADERNO_CAUTELAR_MAP = mapIdToObj(
  TIPO_ACTO_CUADERNO_CAUTELAR,
);
export const todosLosTiposDeActosMap = mapIdToObj(todosLosTiposDeActos);
export const MESES_MAP = mapIdToObj(meses);
export const YEARS_MAP = mapIdToObj(years);

export const autoClose = 3000;
