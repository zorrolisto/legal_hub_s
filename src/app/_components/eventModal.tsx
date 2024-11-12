"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  ResponsiveModal,
  ResponsiveModalBody,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "./responsive-modal";
import Link from "next/link";
import {
  ArrowBigDownDash,
  ArrowBigDownDashIcon,
  CloudIcon,
  FileCodeIcon,
  FileDownIcon,
  FileSpreadsheetIcon,
  FolderIcon,
  VideoIcon,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { littleIconTw } from "~/constants/tailwind-default";
import { exportToExcel } from "~/helpers/excel";

export default function EventModal({ open, setOpen, events }: any) {
  const descargarEnExcel = () => {
    if (events.length === 0) return;
    const formatToExcel = events.map((event: any) => ({
      Registro: event.numeroRegistro,
      "Fecha Ejecución":
        format(event.fecha, "dd/MM/yyyy") +
        " " +
        (event.hora
          ? format(new Date(`1970-01-01T${event.hora}`), "hh:mm a")
          : ""),
      Enlace: event.link,
      Drive: event.linkDrive,
      Demandado: event.demandado,
      Demandante: event.demandante,
      Carpeta: event.expedienteId,
      Expediente: event.expediente,
      Creador: event.createdBy,
      Descripción: event.description,
    }));
    exportToExcel(formatToExcel, "eventos_dia");
  };

  return (
    <>
      <ResponsiveModal open={open} onOpenChange={setOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <div className="flex items-center gap-2">
              <ResponsiveModalTitle>Evento(s)</ResponsiveModalTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <FileDownIcon className="h-6 w-6 cursor-pointer" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel className="text-xs">
                    Formato
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => descargarEnExcel()}
                    className="flex cursor-pointer gap-2 text-xs"
                  >
                    <FileSpreadsheetIcon className={littleIconTw} />
                    <span>Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <PDFDownloadLink
                      document={<MyDocument events={events} />}
                      fileName="eventos.pdf"
                      className="flex w-full cursor-pointer gap-2 text-xs"
                    >
                      <FileCodeIcon className={littleIconTw} />
                      <span>PDF</span>
                    </PDFDownloadLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ResponsiveModalHeader>
          <ResponsiveModalBody className="max-h-[30rem] overflow-auto">
            {events.map((eventSelected: any, idx: number) => (
              <div
                key={idx}
                className="mb-4 rounded-lg border-2 border-gray-200"
              >
                <div className="w-full rounded-t-md bg-gray-200 text-center text-xs font-bold text-black">
                  {idx + 1}
                </div>
                <div className="space-y-4 p-2 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Registro</p>
                      <div className="py-1.5 font-medium">
                        {eventSelected.numeroRegistro}
                      </div>
                    </div>
                    <div className="">
                      <p className="text-gray-500">Enlaces</p>
                      <TooltipProvider>
                        <div className="flex gap-1">
                          {eventSelected.link && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={eventSelected.link} target="_blank">
                                  <div className="rounded-lg p-1.5 hover:bg-gray-300">
                                    <VideoIcon className="h-4 w-4 text-blue-600" />
                                  </div>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{eventSelected.link}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {eventSelected.linkDrive && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={eventSelected.linkDrive}
                                  target="_blank"
                                >
                                  <div className="rounded-lg p-1.5 hover:bg-gray-300">
                                    <CloudIcon className="h-4 w-4 text-blue-600" />
                                  </div>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{eventSelected.linkDrive}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div>
                        <p className="text-gray-500">Carpeta</p>
                        <div className="font-medium">
                          {eventSelected.expedienteId}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Expediente</p>
                      <Link
                        href={`/legal/expedientes/${eventSelected.expedienteId}`}
                      >
                        <div className="font-medium text-blue-600 underline">
                          {eventSelected.expediente}
                        </div>
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Demandado</p>
                      <div className="font-medium">
                        {eventSelected.demandado || "No especificado"}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Demandante</p>
                      <div className="font-medium">
                        {eventSelected.demandante || "No especificado"}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Fecha</p>
                      <div className="font-medium">
                        {format(eventSelected.fecha, "dd/MM/yyyy") +
                          " " +
                          (eventSelected.hora
                            ? format(
                                new Date(`1970-01-01T${eventSelected.hora}`),
                                "hh:mm a",
                              )
                            : "")}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Creador</p>
                      <div className="font-medium">
                        {eventSelected.createdBy}
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <p className="text-gray-500">Descripción</p>
                    <div className="font-medium">
                      {eventSelected.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ResponsiveModalBody>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}

// Estilos para el PDF usando @react-pdf/renderer
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 10,
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 5,
    padding: 5,
    borderBottom: "1px solid #CCC",
  },
  eventContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  eventBlock: {
    width: "48%",
    border: "1px solid #E5E7EB",
    borderRadius: 5,
    padding: 5,
    marginBottom: 5,
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 10,
  },
  enumeration: {
    textAlign: "right",
    fontSize: 8,
    fontWeight: "bold",
  },
  label: {
    fontSize: 8,
    color: "gray",
  },
  value: {
    fontSize: 8,
    marginBottom: 5,
  },
  valueLink: {
    fontSize: 8,
    color: "blue",
    marginBottom: 5,
  },
});

export const MyDocument = ({ events }: any) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>
        Eventos{" "}
        {events[0] && events[0].fecha
          ? format(events[0].fecha, "dd/MM/yyyy")
          : ""}
      </Text>
      <View style={styles.eventContainer}>
        {events.map((event: any, idx: number) => (
          <View key={idx} style={styles.eventBlock}>
            <Text style={styles.enumeration}>{idx + 1}</Text>
            <Text style={styles.label}>Registro:</Text>
            <Text style={styles.value}>{event.numeroRegistro}</Text>

            <Text style={styles.label}>Enlace:</Text>
            <Text style={event.link ? styles.valueLink : styles.value}>
              {event.link || "-"}
            </Text>
            <Text style={styles.label}>Drive:</Text>
            <Text style={event.linkDrive ? styles.valueLink : styles.value}>
              {event.linkDrive || "-"}
            </Text>

            <Text style={styles.label}>Carpeta:</Text>
            <Text style={styles.value}>{event.expedienteId}</Text>

            <Text style={styles.label}>Expediente:</Text>
            <Text style={styles.value}>{event.expediente}</Text>

            <Text style={styles.label}>Demandado:</Text>
            <Text style={styles.value}>{event.demandado || "-"}</Text>

            <Text style={styles.label}>Demandante:</Text>
            <Text style={styles.value}>{event.demandante || "-"}</Text>

            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>
              {event.fecha
                ? format(event.fecha, "dd/MM/yyyy") +
                  (event.hora
                    ? ` ${format(new Date(`1970-01-01T${event.hora}`), "hh:mm a")}`
                    : "")
                : "-"}
            </Text>

            <Text style={styles.label}>Creador:</Text>
            <Text style={styles.value}>{event.createdBy}</Text>

            <Text style={styles.label}>Descripción:</Text>
            <Text style={styles.value}>{event.description}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
