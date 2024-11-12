import { addHours, addMinutes, parse } from "date-fns";

export function sumarFechaYHora(fecha: Date, hora: string) {
  // Crear una copia de la fecha para no alterar el objeto original
  const nuevaFecha = new Date(fecha);

  // Separar la hora y minutos de la cadena 'hora' (por ejemplo, "10:30")
  let partesHora = hora.match(/(\d+):(\d+)/) || [];
  if (partesHora.length === 0) {
    return nuevaFecha;
  }

  // Convertir las partes a enteros
  const horas = partesHora[1] ? parseInt(partesHora[1], 10) : 0;
  const minutos = partesHora[2] ? parseInt(partesHora[2], 10) : 0;

  // Usar date-fns para ajustar la hora y los minutos en la nueva fecha
  const fechaConHoras = addHours(nuevaFecha, horas);
  const fechaConHorasYMinutos = addMinutes(fechaConHoras, minutos);

  return fechaConHorasYMinutos;
}

export const formatRegistrosDocumentosToEvents = (registros: any) => {
  if (!registros) return [];

  const r = registros.map((r: any) => {
    const fechaInicio = r.fecha instanceof Date ? r.fecha : new Date(r.fecha);
    const startTime = r.hora
      ? sumarFechaYHora(fechaInicio, r.hora)
      : fechaInicio;

    return {
      id: r.id,
      title: r.description,
      start: startTime,
      allDay: !r.hora, // Si no hay hora, es un evento de todo el día
      backgroundColor: r.colorDistrito,
    };
  });
  return r;
};
