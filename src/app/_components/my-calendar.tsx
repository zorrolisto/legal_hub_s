"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import esLocale from "@fullcalendar/core/locales/es";
import listPlugin from "@fullcalendar/list";
import { formatRegistrosDocumentosToEvents } from "~/helpers/time";

const getSD = (dateNull: Date | null) => {
  return dateNull instanceof Date ? dateNull : new Date();
};

export default function MyCalendar({
  startDate,
  registros,
  height,
  clickEvent,
}: {
  startDate: Date | null;
  registros: any;
  height: string;
  clickEvent: (ev: any) => void;
} & any) {
  const handleEventClick = (info: EventClickArg) => {
    clickEvent(info.event._def);
  };

  return (
    <FullCalendar
      plugins={[listPlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="listYear"
      viewClassNames="text-xs rounded"
      eventClassNames="cursor-pointer"
      initialDate={getSD(startDate)}
      slotLabelFormat={{
        hour: "numeric",
        minute: "2-digit",
        meridiem: "short",
        hour12: true,
      }}
      eventTimeFormat={{
        hour: "numeric",
        minute: "2-digit",
        meridiem: "short",
        hour12: true,
      }}
      locale={esLocale}
      headerToolbar={false}
      height={height}
      events={formatRegistrosDocumentosToEvents(registros)}
      eventClick={handleEventClick}
    />
  );
}
