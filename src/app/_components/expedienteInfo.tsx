"use client";

import React, { useEffect, useState } from "react";
import { ADMINS, TIPO_CLIENTE_MAP } from "~/constants";
import TableX from "./table";
import {
  CloudIcon,
  ExternalLink,
  FileCodeIcon,
  FileDownIcon,
  FileSpreadsheetIcon,
  FolderIcon,
  NotebookText,
  VideoIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  TIPO_ACTO_CUADERNO_CAUTELAR,
  TIPO_ACTO_CUADERNO_CAUTELAR_MAP,
  TIPO_ACTO_ESCRITO,
  TIPO_ACTO_ESCRITO_MAP,
  TIPO_ACTO_NOTA,
  TIPO_ACTO_NOTA_MAP,
  TIPO_ACTO_RESOLUCION,
  TIPO_ACTO_RESOLUCION_MAP,
  TIPO_REGISTRO,
  TIPO_REGISTRO_MAP,
  todosLosTiposDeActos,
  todosLosTiposDeActosMap,
} from "../../constants/index";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import { exportToExcel } from "~/helpers/excel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { littleIconTw } from "~/constants/tailwind-default";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MyDocument } from "./eventModal";

const columns = [
  {
    name: "tipoRegistroId",
    label: "T. Registro",
    extraClasses: "col-span-2",
    options: TIPO_REGISTRO,
    optionsMap: TIPO_REGISTRO_MAP,
    hiddenFromTable: true,
    hiddenFromExcel: true,
    useInAdvancedFilter: true,
  },
  {
    name: "numeroRegistro",
    label: "Documento",
    modal: {
      getLabel: (obj: any) => {
        if (obj.tipoRegistroId === 4) return "N° Resolución";
        return `N° ${TIPO_REGISTRO_MAP.get(obj.tipoRegistroId).nombre}`;
      },
      hide: (obj: any) => [3].includes(obj.tipoRegistroId || 0),
    },
    table: {
      getValue: (obj: any) => {
        const nombre = TIPO_REGISTRO_MAP.get(obj.tipoRegistroId).nombre;
        const numero = obj.numeroRegistro ? obj.numeroRegistro : "S/N";
        const cuaderno = obj.numeroCuadernoCautelar;
        return `${nombre} ${numero}${cuaderno ? " - " + cuaderno : ""}`;
      },
    },
    isRequired: (obj: any) => [1, 2, 4].includes(obj.tipoRegistroId || 0),
    order: 2,
  },
  {
    name: "fechaRegistro",
    label: "F. Documento",
    modal: {
      getLabel: (obj: any) => {
        if ([1, 4].includes(obj.tipoRegistroId || 0)) return "Fecha Resolución";
        if (obj.tipoRegistroId === 2) return "Fecha Escrito";
      },
      hide: (obj: any) => [3].includes(obj.tipoRegistroId || 0),
    },
    type: "date",
    required: true,
    order: 3,
    isRequired: (obj: any) => [1, 2, 4].includes(obj.tipoRegistroId || 0),
  },
  {
    name: "fechaNotificacion",
    label: "Fecha Notificación",
    modal: {
      hide: (obj: any) => [2].includes(obj.tipoRegistroId || 0),
    },
    type: "date",
    isRequired: (obj: any) => [1, 3, 4].includes(obj.tipoRegistroId || 0),
    order: 4,
  },
  {
    name: "numeroCuadernoCautelar",
    label: "N° Cuaderno Cautelar",
    modal: {
      hide: (obj: any) => ![4].includes(obj.tipoRegistroId || 0),
    },
    hiddenFromTable: true,
    hiddenFromExcel: true,
    isRequired: (obj: any) => [4].includes(obj.tipoRegistroId || 0),
  },
  {
    name: "tipoActoId",
    label: "T. Acto",
    options: todosLosTiposDeActos,
    optionsMap: todosLosTiposDeActosMap,
    getOptions: (obj: any) => {
      switch (obj.tipoRegistroId) {
        case 1:
          return {
            options: TIPO_ACTO_RESOLUCION,
            optionsMap: TIPO_ACTO_RESOLUCION_MAP,
          };
        case 2:
          return {
            options: TIPO_ACTO_ESCRITO,
            optionsMap: TIPO_ACTO_ESCRITO_MAP,
          };
        case 3:
          return { options: TIPO_ACTO_NOTA, optionsMap: TIPO_ACTO_NOTA_MAP };
        case 4:
          return {
            options: TIPO_ACTO_CUADERNO_CAUTELAR,
            optionsMap: TIPO_ACTO_CUADERNO_CAUTELAR_MAP,
          };
      }
    },
    type: "number",
    hiddenFromTable: true,
    hiddenFromExcel: true,
    useInAdvancedFilter: true,
    required: true,
  },
  {
    name: "tipoActo",
    label: "T. Acto",
    hiddenFromForm: true,
    table: {
      getValue: (obj: any) => {
        return todosLosTiposDeActosMap.get(obj.tipoActoId)?.nombre || "-";
      },
    },
    order: 5,
  },
  {
    name: "link",
    label: "Reunión",
    hiddenFromForm: true,
    hiddenFromExcel: true,
    order: 5,
    table: {
      getValue: (obj: any) => {
        return obj.link ? (
          <Link href={obj.link} className="text-blue-600 underline">
            <VideoIcon className="mr-2 h-4 w-4" />
          </Link>
        ) : (
          "-"
        );
      },
    },
  },
  {
    name: "link",
    label: "Drive",
    hiddenFromForm: true,
    hiddenFromExcel: true,
    order: 5,
    table: {
      getValue: (obj: any) => {
        return obj.linkDrive ? (
          <Link
            href={obj.linkDrive}
            target="_blank"
            className="text-blue-600 underline"
          >
            <CloudIcon className="mr-2 h-4 w-4" />
          </Link>
        ) : (
          "-"
        );
      },
    },
  },
  {
    name: "description",
    extraClasses: "col-span-2",
    label: "Descripción",
    type: "textarea",
    order: 6,
    required: true,
    table: {
      getValue: (obj: any) => {
        return (
          <Popover>
            <PopoverTrigger>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-lg p-1.5 hover:bg-gray-300">
                      <NotebookText className="h-4 w-4 text-blue-600" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver Descripción</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </PopoverTrigger>
            <PopoverContent className="text-xs">
              {obj.description || "-"}
            </PopoverContent>
          </Popover>
        );
      },
    },
  },
  {
    name: "fecha",
    label: "Fecha Audiencia/Acto",
    type: "date",
    modal: {
      hide: (obj: any) => [2].includes(obj.tipoRegistroId || 0),
    },
    order: 7,
  },
  {
    name: "hora",
    label: "Hora",
    type: "time",
    modal: {
      hide: (obj: any) => [2].includes(obj.tipoRegistroId || 0),
    },
    table: {
      getValue: (obj: any) => {
        return obj.hora || "-";
      },
    },
    order: 8,
  },
  {
    name: "createdBy",
    label: "Creó",
    hiddenFromForm: true,
    table: {
      getValue: (obj: any) => {
        const createdBy = obj.createdBy || "-";
        if (createdBy === "-") {
          return createdBy;
        }

        const names = createdBy.split(" ");
        const firstName = names[0];
        const secondNameInitial = names[1] ? names[1][0] : "";

        return (
          <span className="whitespace-nowrap">{`${firstName} ${secondNameInitial}.`}</span>
        );
      },
    },
    order: 9,
  },
  {
    name: "updatedBy",
    label: "Editó",
    hiddenFromForm: true,
    table: {
      getValue: (obj: any) => {
        const updatedBy = obj.updatedBy || "-";
        if (updatedBy === "-") {
          return updatedBy;
        }

        const names = updatedBy.split(" ");
        const firstName = names[0];
        const secondNameInitial = names[1] ? names[1][0] : "";

        return (
          <span className="whitespace-nowrap">{`${firstName} ${secondNameInitial}.`}</span>
        );
      },
    },
    order: 10,
  },
];

const columnasAdministradores = [
  {
    name: "createdAt",
    label: "Creado",
    table: {
      getValue: (obj: any) => {
        return format(obj.createdAt, "dd/MM/yyyy hh:mm a");
      },
    },
  },
  {
    name: "updatedAt",
    label: "Actualizado",
    table: {
      getValue: (obj: any) => {
        return obj.updatedAt.getTime() === obj.createdAt.getTime()
          ? "-"
          : format(obj.updatedAt, "dd/MM/yyyy hh:mm a");
      },
    },
  },
];

export default function ExpedienteInfo({ expediente, utils, session }: any) {
  const [isLoading, setIsLoading] = useState(false);
  let [documentos, setDocumentos] = useState([]);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  useEffect(() => {
    if (expediente) {
      setIsLoading(true);
      void getAllDocumentsFromExpediente();
    }
  }, [expediente]);

  const getAllDocumentsFromExpediente = async () => {
    const exp = await utils.registro.getAllByExpediente.fetch({
      expedienteId: expediente.id,
    });
    setDocumentos(exp);
    setIsLoading(false);
  };
  const descargarEnExcel = () => {
    if (documentos.length === 0) return;
    const formatToExcel = documentos.map((doc: any) => ({
      Registro: doc.numeroRegistro,
      "Fecha Ejecución": doc.fecha
        ? format(doc.fecha, "dd/MM/yyyy") +
          " " +
          (doc.hora
            ? format(new Date(`1970-01-01T${doc.hora}`), "hh:mm a")
            : "")
        : "-",
      Enlace: doc.link || "-",
      Drive: doc.linkDrive || "-",
      Demandado: doc.demandado,
      Demandante: doc.demandante,
      Carpeta: doc.expedienteId,
      Expediente: doc.expediente,
      Creador: doc.createdBy,
      Descripción: doc.description,
    }));
    exportToExcel(
      formatToExcel,
      "documentos_de_expediente_" + expediente.expediente,
    );
  };

  const isAdmin = ADMINS.includes(session?.data?.user.email || "");

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <h1 className="mb-4 text-lg font-semibold">
          Caso Judicial: {expediente.expediente}
        </h1>
        <span
          className="fit mt-1 h-min rounded p-0.5 text-xs"
          style={{
            backgroundColor: expediente.colorEstado,
          }}
        >
          {expediente.estadoDelProceso}
        </span>
        {expediente.linkDrive && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={expediente.linkDrive} target="_blank">
                  <div className="rounded-lg p-1.5 hover:bg-gray-300">
                    <CloudIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{expediente.linkDrive}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <MiniData title="Carpeta" data={expediente.id} />
        <MiniData title="Creación" data={formatDate(expediente.createdAt)} />
        <MiniData title="Creador" data={expediente.createdBy} />
        <MiniData
          title="Cliente Tipo"
          data={TIPO_CLIENTE_MAP.get(expediente.clienteTipoId).nombre}
        />
        <MiniData title="Demandado" data={expediente.demandado} />
        <MiniData title="Demandante" data={expediente.demandante} />
        <MiniData
          title="Distrito Judicial"
          data={expediente.distritoJudicial}
        />
        <MiniData title="Especialidad" data={expediente.especialidad} />
        <MiniData title="Especialista" data={expediente.especialista} />
        <MiniData
          title="Estado del Proceso"
          data={expediente.estadoDelProceso}
        />
        <MiniData title="Fecha" data={formatDate(expediente.fecha)} />
        <MiniData title="Instancia" data={expediente.instancia} />
        <MiniData title="Juez" data={expediente.juez} />
        <MiniData title="Materia" data={expediente.materia} />
        <MiniData
          title="Órgano Jurisdiccional"
          data={expediente.organoJurisdiccional}
        />
        <MiniData
          title="Última actualización el"
          data={formatDate(expediente.updatedAt)}
        />
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
          <MiniData title="Extras" data={expediente.extras} />
        </div>
      </div>
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">
            Documentos ({documentos.length})
          </h1>
          {!isLoading && documentos && documentos.length > 0 && (
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
                    document={<MyDocument events={documentos} />}
                    fileName={`documentos_de_expediente_${expediente.expediente}.pdf`}
                    className="flex w-full cursor-pointer gap-2 text-xs"
                  >
                    <FileCodeIcon className={littleIconTw} />
                    <span>PDF</span>
                  </PDFDownloadLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div>
          {!isLoading && documentos && documentos.length > 0 && (
            <TableX
              columns={columns}
              data={documentos}
              actions={(each: any) => <></>}
            />
          )}
          {!isLoading && documentos && documentos.length === 0 && (
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-sm font-semibold">No hay documentos</h1>
              </div>
            </div>
          )}
          {isLoading && (
            <div className="flex w-full items-center justify-center">
              <div className="text-center">
                <h1 className="text-sm font-semibold">Cargando...</h1>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MiniData({ title, data, link }: any) {
  return (
    <div>
      <p className="text-gray-500">{title}</p>
      <div className="font-medium">
        {link ? (
          <Link href={link} target="_blank" className="text-blue-600 underline">
            {data || "-"}
          </Link>
        ) : (
          data || "-"
        )}
      </div>
    </div>
  );
}
