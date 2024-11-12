"use client";

import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // a plugin!
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { endOfWeek, format, set, startOfWeek } from "date-fns";
import esLocale from "@fullcalendar/core/locales/es"; // Importa el idioma español
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "~/components/ui/button";
import { littleIconTw } from "~/constants/tailwind-default";
import { updateToast } from "~/helpers/toast";
import { api } from "~/trpc/react";
import FullCalendar from "@fullcalendar/react";
import {
  meses,
  MESES_MAP,
  todosLosTiposDeActos,
  todosLosTiposDeActosMap,
  years,
  YEARS_MAP,
} from "~/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { formatRegistrosDocumentosToEvents } from "~/helpers/time";
import EventModal from "~/app/_components/eventModal";
import { es } from "date-fns/locale";

const getSD = (dateNull: Date | null) => {
  return dateNull || new Date();
};

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [eventSelected, setEventSelected] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [actos, setActos] = useState<any>([]);

  const [filter, setFilter] = useState<any>({
    acto: 2,
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
  });

  const calendarRef = useRef<FullCalendar | null>(null);
  const utils = api.useUtils();

  useEffect(() => {
    void getActos();
  }, []);

  const getActos = async () => {
    const startDate = new Date(filter.anio, filter.mes - 1, 1);
    const endDate = new Date(filter.anio, filter.mes, 0);
    setCurrentDate(startDate);
    handleMonthChange(startDate);
    await getActosInRange(startDate, endDate);
  };

  const getActosInRange = async (startDate: Date, endDate: Date) => {
    const loadingToastId = toast.loading("Cargando...");

    try {
      const actos = await utils.agenda.getActosByIDAndByRange.fetch({
        actoId: filter.acto,
        startDate,
        endDate,
      });
      setActos(actos);
      updateToast(loadingToastId, "success", "Operación exitosa! 👌");
    } catch (error) {
      updateToast(loadingToastId, "error", "Algo salió mal! 😢");
    }
  };

  const handleEventClick = (info: any) => {
    const event = info.event._def;
    const eventFound = actos.find((a: any) => a.id === Number(event.publicId));
    setEventSelected([eventFound]);
    setOpen(true);
  };

  // Function to change month programmatically
  const handleMonthChange = (date: Date) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(date);
    }
  };
  const handleDateClick = (info: any) => {
    if (!info.jsEvent.target.classList.contains("fc-daygrid-day-top")) return;

    const calendarApi = calendarRef.current?.getApi();

    if (!calendarApi) return;

    const eventsForDate = calendarApi.getEvents().filter((event) => {
      const eventDateStr = event.startStr.slice(0, 10); // Fecha en 'YYYY-MM-DD'
      const clickedDateStr = info.dateStr.slice(0, 10); // También en 'YYYY-MM-DD'

      return eventDateStr === clickedDateStr;
    });

    // Mostrar en consola los títulos de los eventos encontrados
    if (eventsForDate.length > 0) {
      setEventSelected(
        eventsForDate.map((event) => {
          return actos.find(
            (a: any) => a.id === Number((event as any)._def.publicId),
          );
        }),
      );
      setOpen(true);
    } else {
      toast.info("No hay eventos para este día");
    }
  };

  const formattedMonth = format(currentDate, "MMMM yyyy", { locale: es });

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold leading-tight">
          Agenda -{" "}
          {formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1)}
        </h2>
        <div className="flex items-center space-x-2">
          <Select
            value={filter.acto}
            onValueChange={(e) => {
              setFilter({ ...filter, acto: e });
            }}
          >
            <SelectTrigger className="w-full text-xs font-medium">
              <SelectValue placeholder="Selecciona una opción">
                {todosLosTiposDeActosMap.get(filter.acto)?.nombre || ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {todosLosTiposDeActos.map((option: any, key: number) => (
                  <SelectItem key={key} value={option.id} className="text-xs">
                    {option.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={filter.mes}
            onValueChange={(e) => {
              setFilter({ ...filter, mes: e });
            }}
          >
            <SelectTrigger className="w-full text-xs font-medium">
              <SelectValue placeholder="Selecciona una opción">
                {MESES_MAP.get(filter.mes)?.nombre || ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {meses.map((option: any, key: number) => (
                  <SelectItem key={key} value={option.id} className="text-xs">
                    {option.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={filter.anio}
            onValueChange={(e) => {
              setFilter({ ...filter, anio: e });
            }}
          >
            <SelectTrigger className="w-full text-xs font-medium">
              <SelectValue placeholder="Selecciona una opción">
                {YEARS_MAP.get(filter.anio)?.nombre || ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {years.map((option: any, key: number) => (
                  <SelectItem key={key} value={option.id} className="text-xs">
                    {option.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={getActos}>
            <MagnifyingGlassIcon className={littleIconTw} />
          </Button>
        </div>
      </div>
      {eventSelected && (
        <EventModal open={open} setOpen={setOpen} events={eventSelected} />
      )}
      <div>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          viewClassNames="text-xs rounded"
          eventClassNames="cursor-pointer"
          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
            hour12: true,
          }}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short", // Formato de 12 horas con AM/PM
            hour12: true,
          }}
          locale={esLocale}
          headerToolbar={false} // height={height}
          events={formatRegistrosDocumentosToEvents(actos)}
          eventClick={handleEventClick} // click en el evento
          dateClick={handleDateClick}
        />
      </div>
    </div>
  );
}
