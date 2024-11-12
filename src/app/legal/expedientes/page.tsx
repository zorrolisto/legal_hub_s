"use client";

import {
  ChatBubbleBottomCenterIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  buttonBlackTw,
  buttonWhiteTw,
  littleIconTw,
} from "~/constants/tailwind-default";
import { RouterOutputs } from "~/trpc/react";
import { exportToExcel, formatArrayToExport } from "~/helpers/excel";
import { api } from "~/trpc/react";
import { IPagination } from "~/types";
import { useEffect, useState } from "react";
import {
  defaultPagination,
  goToNextPage,
  goToPreviousPage,
} from "~/helpers/pagination";
import { Id, toast } from "react-toastify";
import {
  ADMINS,
  autoClose,
  TIPO_ACTO_CUADERNO_CAUTELAR,
  TIPO_ACTO_CUADERNO_CAUTELAR_MAP,
  TIPO_ACTO_ESCRITO,
  TIPO_ACTO_ESCRITO_MAP,
  TIPO_ACTO_NOTA,
  TIPO_ACTO_NOTA_MAP,
  TIPO_ACTO_RESOLUCION,
  TIPO_ACTO_RESOLUCION_MAP,
  TIPO_CLIENTE_MAP,
  TIPO_REGISTRO,
  TIPO_REGISTRO_MAP,
  TIPOS_DE_CLIENTE,
  todosLosTiposDeActos,
  todosLosTiposDeActosMap,
} from "~/constants";
import {
  Popover as PopoverSCN,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import WrapperTable from "~/app/_components/wrapper-table";
import TableX from "~/app/_components/table";
import Pagination from "~/app/_components/pagination";
import DeleteModal from "~/app/_components/deleteModal";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  CloudIcon,
  ExternalLink,
  FileSpreadsheetIcon,
  FolderIcon,
  NotebookText,
  PlusIcon,
  VideoIcon,
} from "lucide-react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Input } from "~/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal2 } from "~/app/_components/modal2";
import { AdvancedFilter } from "~/app/_components/advanceFilter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { updateToast } from "~/helpers/toast";
import Link from "next/link";
import DocumentosModal from "~/app/_components/documentosModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { getColorMasParecidoByHex } from "~/helpers/colors";

type TipoMantenedor = RouterOutputs["expediente"]["getAllFiltered"][0];
const columns = [
  {
    name: "id",
    label: "Carpeta",
    hiddenFromForm: true,
    order: 1,
  },
  {
    name: "expediente",
    label: "Exp",
    getLabel: () => {
      return (
        <div className="flex items-center gap-1">
          <span>Exp</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      );
    },
    extraClasses: "w-56",
    required: true,
    table: {
      getValue: (obj: any) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/legal/expedientes/${obj.id}`}>
                  <div className="rounded-lg p-1.5 hover:bg-gray-300">
                    <FolderIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{obj.expediente}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    order: 2,
  },
  {
    name: "instanciaId",
    label: "Etapa",
    options: { endpoint: "instancia" },
    hiddenFromTable: true,
    hiddenFromExcel: true,
    required: true,
  },
  {
    name: "instancia",
    label: "Etapa",
    hiddenFromForm: true,
    order: 3,
  },
  {
    name: "especialidadId",
    label: "Materia",
    options: { endpoint: "especialidad" },
    hiddenFromTable: true,
    hiddenFromExcel: true,
    required: true,
  },
  {
    name: "especialidad",
    label: "Materia",
    hiddenFromForm: true,
  },
  {
    name: "distritoJudicialId",
    label: "Distrito J.",
    options: { endpoint: "distritoJudicial" },
    hiddenFromTable: true,
    hiddenFromExcel: true,
    required: true,
  },
  {
    name: "distritoJudicial",
    label: "Distrito J.",
    hiddenFromForm: true,
    order: 4,
    table: {
      getValue: (obj: any) => {
        return (
          <div
            className="flex rounded p-1"
            style={{ background: obj.colorDistrito || "#FFFFFF" }}
          >
            {obj.distritoJudicial}
          </div>
        );
      },
    },
  },
  {
    name: "organoJurisdiccionalId",
    label: "Órgano J.",
    options: { endpoint: "organoJurisdiccional" },
    hiddenFromTable: true,
    hiddenFromExcel: true,
    required: true,
  },
  {
    name: "organoJurisdiccional",
    label: "Órgano J.",
    hiddenFromForm: true,
    order: 3,
  },
  { name: "materia", label: "Pretensiones", required: true, order: 5 },
  {
    name: "juez",
    label: "Juez",
    required: true,
    order: 6,
    hiddenFromTable: true,
  },
  {
    name: "especialistaId",
    label: "Especialista",
    options: { endpoint: "especialista" },
    hiddenFromTable: true,
    hiddenFromExcel: true,
    required: true,
  },
  {
    name: "especialista",
    label: "Especialista",
    hiddenFromForm: true,
    order: 7,
  },
  {
    name: "clienteTipoId",
    label: "Tipo Cliente",
    options: TIPOS_DE_CLIENTE,
    optionsMap: TIPO_CLIENTE_MAP,
    hiddenFromTable: true,
    hiddenFromExcel: true,
    useInAdvancedFilter: true,
    required: true,
  },
  {
    name: "clienteTipo",
    label: "Cliente",
    hiddenFromForm: true,
    hiddenFromTable: true,
  },
  {
    name: "demandado",
    label: "Demandado",
    order: 8,
    isInputText: (obj: any) => obj.clienteTipoId === 1,
    isSearchSelect: (obj: any) => obj.clienteTipoId === 2,
    options: {
      getNameOnly: true,
      setIdIn: "clienteId",
      endpoint: "cliente",
      fieldNames: ["nombreComercial", "razonSocial"],
      fieldName: (obj: any) =>
        obj.clienteTipoId === 2 ? "nombreComercial" : "razonSocial",
    },
    table: {
      preRender: (obj: any) => {
        if (obj.clienteTipoId === 2) {
          return <UserIcon className="my-2 h-5 w-5 text-black" />;
        }
        return null;
      },
    },
    required: true,
  },
  {
    name: "demandante",
    label: "Demandante",
    order: 9,
    isInputText: (obj: any) => obj.clienteTipoId === 2,
    isSearchSelect: (obj: any) => obj.clienteTipoId === 1,
    options: {
      getNameOnly: true,
      setIdIn: "clienteId",
      endpoint: "cliente",
      fieldNames: ["nombreComercial", "razonSocial"],
      fieldName: (obj: any) =>
        obj.clienteTipoId === 1 ? "nombreComercial" : "razonSocial",
    },
    table: {
      preRender: (obj: any) => {
        if (obj.clienteTipoId === 1) {
          return <UserIcon className="my-2 h-5 w-5 text-black" />;
        }
        return null;
      },
    },
    required: true,
  },
  {
    name: "estadoDelProcesoId",
    label: "Estado",
    options: { endpoint: "estado" },
    hiddenFromTable: true,
    hiddenFromExcel: true,
    required: true,
  },
  {
    name: "estadoDelProceso",
    label: "Estado",
    hiddenFromForm: true,
    order: 11,
    table: {
      getValue: (obj: any) => {
        return (
          <div
            className="flex rounded p-1"
            style={{ background: obj.colorEstado }}
          >
            {obj.estadoDelProceso}
          </div>
        );
      },
    },
  },
  {
    name: "fecha",
    label: "Fecha",
    type: "date",
    required: true,
    order: 10,
  },
  {
    name: "linkDrive",
    label: "Drive",
    getLabel: () => {
      return (
        <div className="flex items-center gap-1">
          <span>Drive</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      );
    },
    extraClasses: "w-56",
    table: {
      getValue: (obj: any) => {
        if (!obj.linkDrive) return "-";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={obj.linkDrive} target="_blank">
                  <div className="rounded-lg p-1.5 hover:bg-gray-300">
                    <CloudIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{obj.linkDrive}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    order: 2,
  },
  {
    name: "extras",
    label: "Extras",
    hiddenFromTable: true,
  },
];

const filterObjDefault = {
  estadoDelProcesoId: 0,
  clienteTipoId: 0,
};
const defaultObj = {
  expediente: "",
  instanciaId: 0,
  especialidadId: 0,
  distritoJudicialId: 0,
  organoJurisdiccionalId: 0,
  especialistaId: 0,
  estadoDelProcesoId: 1,
  clienteTipoId: 1,
  materia: "",
  juez: "",
  demandado: "",
  demandante: "",
  linkDrive: "",
  fecha: new Date(),
  extras: "-",
} as unknown as TipoMantenedor;

type TipoMantenedorRegistro = RouterOutputs["registro"]["getAllFiltered"][0];
const columnsRegistro = [
  {
    name: "id",
    label: "",
    hiddenFromForm: true,
    hiddenFromTable: true,
    hiddenFromExcel: true,
  },
  {
    name: "expediente",
    label: "Exp",
    getLabel: () => {
      return (
        <div className="flex items-center gap-1">
          <span>Exp</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      );
    },
    hiddenFromForm: true,
    table: {
      getValue: (obj: TipoMantenedorRegistro) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/legal/expedientes/${obj.expedienteId}`}>
                  <div className="rounded-lg p-1.5 hover:bg-gray-300">
                    <FolderIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{obj.expediente}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    order: 1,
  },
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
      getLabel: (obj: TipoMantenedorRegistro) => {
        if (obj.tipoRegistroId === 4) return "N° Resolución";
        return `N° ${TIPO_REGISTRO_MAP.get(obj.tipoRegistroId).nombre}`;
      },
      hide: (obj: TipoMantenedorRegistro) =>
        [3].includes(obj.tipoRegistroId || 0),
    },
    table: {
      getValue: (obj: TipoMantenedorRegistro) => {
        const nombre = TIPO_REGISTRO_MAP.get(obj.tipoRegistroId).nombre;
        const numero = obj.numeroRegistro ? obj.numeroRegistro : "S/N";
        const cuaderno = obj.numeroCuadernoCautelar;
        return `${nombre} ${numero}${cuaderno ? " - " + cuaderno : ""}`;
      },
    },
    isRequired: (obj: TipoMantenedorRegistro) =>
      [1, 2, 4].includes(obj.tipoRegistroId || 0),
    order: 2,
  },
  {
    name: "fechaRegistro",
    label: "F. Documento",
    modal: {
      getLabel: (obj: TipoMantenedorRegistro) => {
        if ([1, 4].includes(obj.tipoRegistroId || 0)) return "Fecha Resolución";
        if (obj.tipoRegistroId === 2) return "Fecha Escrito";
      },
      hide: (obj: TipoMantenedorRegistro) =>
        [3].includes(obj.tipoRegistroId || 0),
    },
    type: "date",
    required: true,
    order: 3,
    isRequired: (obj: TipoMantenedorRegistro) =>
      [1, 2, 4].includes(obj.tipoRegistroId || 0),
  },
  {
    name: "fechaNotificacion",
    label: "Fecha Notificación",
    modal: {
      hide: (obj: TipoMantenedorRegistro) =>
        [2].includes(obj.tipoRegistroId || 0),
    },
    type: "date",
    isRequired: (obj: TipoMantenedorRegistro) =>
      [1, 3, 4].includes(obj.tipoRegistroId || 0),
    order: 4,
  },
  {
    name: "numeroCuadernoCautelar",
    label: "N° Cuaderno Cautelar",
    modal: {
      hide: (obj: TipoMantenedorRegistro) =>
        ![4].includes(obj.tipoRegistroId || 0),
    },
    hiddenFromTable: true,
    hiddenFromExcel: true,
    isRequired: (obj: TipoMantenedorRegistro) =>
      [4].includes(obj.tipoRegistroId || 0),
  },
  {
    name: "tipoActoId",
    label: "T. Acto",
    options: todosLosTiposDeActos,
    optionsMap: todosLosTiposDeActosMap,
    getOptions: (obj: TipoMantenedorRegistro) => {
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
    type: "number",
    hiddenFromForm: true,
    table: {
      getValue: (obj: TipoMantenedorRegistro) => {
        return todosLosTiposDeActosMap.get(obj.tipoActoId).nombre;
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
      getValue: (obj: TipoMantenedorRegistro) => {
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
      getValue: (obj: TipoMantenedorRegistro) => {
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
      getValue: (obj: TipoMantenedorRegistro) => {
        return (
          <PopoverSCN>
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
          </PopoverSCN>
        );
      },
    },
  },
  {
    name: "fecha",
    label: "Fecha Audiencia/Acto",
    type: "date",
    modal: {
      hide: (obj: TipoMantenedorRegistro) =>
        [2].includes(obj.tipoRegistroId || 0),
    },
    order: 7,
  },
  {
    name: "hora",
    label: "Hora",
    type: "time",
    modal: {
      hide: (obj: TipoMantenedorRegistro) =>
        [2].includes(obj.tipoRegistroId || 0),
    },
    table: {
      getValue: (obj: TipoMantenedorRegistro) => {
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
      getValue: (obj: TipoMantenedorRegistro) => {
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
      getValue: (obj: TipoMantenedorRegistro) => {
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
  {
    name: "link",
    label: "Link Meeting",
    extraClasses: "col-span-2",
    hiddenFromTable: true,
  },
  {
    name: "linkDrive",
    label: "Link Drive",
    extraClasses: "col-span-2",
    hiddenFromTable: true,
  },
  {
    name: "estadoDelProcesoId",
    label: "Mover estado de expediente a",
    options: { endpoint: "estado", defaultText: "NO MOVER" },
    hiddenFromTable: true,
    hiddenFromExcel: true,
    modal: {
      hide: (obj: TipoMantenedorRegistro) => obj.id,
    },
    extraClasses: "col-span-2",
  },
];
const defaultObjRegistro = {
  tipoRegistroId: 1,
  numeroRegistro: "",
  fechaRegistro: new Date(),
  fechaNotificación: null,
  tipoActoId: 1,
  fecha: null,
  hora: "",
  numeroCuadernoCautelar: "",
  link: "",
  linkDrive: "",
  description: "",
  expedienteId: 0,
  extras: "-",

  estadoDelProcesoId: null,
} as unknown as TipoMantenedorRegistro;
const title = "Casos Judiciales";
const textAdd = "Añadir Caso";

const verifyObjToSave = (obj: Record<string, any>) => {
  for (const column of columns) {
    if (column.required) {
      const value = obj[column.name as keyof typeof obj];
      if (column.type === "number") {
        if (typeof value !== "number" || isNaN(value)) {
          toast.error(`${column.label} debe ser un número válido`);
          return false;
        }
      } else if (column.type === "date") {
        if (!(value instanceof Date) || isNaN(value.getTime())) {
          toast.error(`${column.label} debe ser una fecha válida`);
          return false;
        }
      } else {
        const isNumber = typeof value === "number";
        if (isNumber) {
          return true;
        } else {
          if (typeof value !== "string" || value.trim() === "") {
            toast.error(`${column.label} no puede estar vacío`);
            return false;
          }
        }
      }
    }
  }
  return true;
};
const verifyObjToSaveRegistro = (obj: Record<string, any>) => {
  for (const column of columnsRegistro) {
    if (
      column.required ||
      ((column as any).isRequired && (column as any).isRequired(obj as any))
    ) {
      const value = obj[column.name as keyof typeof obj];
      if (column.type === "number") {
        if (typeof value !== "number" || isNaN(value)) {
          toast.error(`${column.label} debe ser un número válido`);
          return false;
        }
      } else if (column.type === "date") {
        if (!(value instanceof Date) || isNaN(value.getTime())) {
          toast.error(`${column.label} debe ser una fecha válida`);
          return false;
        }
      } else {
        const isNumber = typeof value === "number";
        if (isNumber) {
          return true;
        } else {
          if (typeof value !== "string" || value.trim() === "") {
            toast.error(`${column.label} no puede estar vacío`);
            return false;
          }
        }
      }
    }
  }
  return true;
};

const getObjToSave = (obj: TipoMantenedor) => {
  return {
    id: obj.id || undefined,
    expediente: obj.expediente || "",
    clienteId: obj.clienteId || 0,
    instanciaId: obj.instanciaId || 0,
    especialidadId: obj.especialidadId || 0,
    organoJurisdiccionalId: obj.organoJurisdiccionalId || 0,
    distritoJudicialId: obj.distritoJudicialId || 0,
    materia: obj.materia || "",
    juez: obj.juez || "",
    especialistaId: obj.especialistaId || 0,
    clienteTipoId: Number(obj.clienteTipoId) || 0,
    demandado: obj.demandado || "",
    demandante: obj.demandante || "",
    estadoDelProcesoId: Number(obj.estadoDelProcesoId) || 0,
    fecha: obj.fecha || new Date(),
    extras: obj.extras || "",
    linkDrive: obj.linkDrive || "",
  };
};
const getObjToSaveRegistro = (obj: TipoMantenedorRegistro, expediente: any) => {
  return {
    id: obj.id || undefined,
    tipoRegistroId: Number(obj.tipoRegistroId),
    numeroRegistro: obj.numeroRegistro || "",

    fechaRegistro: obj.fechaRegistro || null,
    fechaNotificacion: obj.fechaNotificacion || undefined,
    tipoActoId: Number(obj.tipoActoId) || 0,
    fecha: obj.fecha || undefined,
    hora: obj.hora || "",

    numeroCuadernoCautelar: obj.numeroCuadernoCautelar || "",
    link: obj.link || "",
    linkDrive: obj.linkDrive || "",
    expedienteId: expediente?.id || obj.expedienteId || 0,

    description: obj.description || "",
    extras: obj.extras || "",

    estadoDelProcesoId: Number((obj as any).estadoDelProcesoId) || undefined,
  };
};
const getExtraFilter = (filterObj: any) => ({
  clienteTipoId:
    filterObj.clienteTipoId === 0 ? undefined : Number(filterObj.clienteTipoId),
});

const getRecordsFormatted = (records: any[]) => {
  return records.map((d: any) => {
    const newD = {
      ...d,
      colorEstado: d.colorEstado || "",
      instancia: d.instancia || "",
      cliente: d.cliente || "",
      distritoJudicial: d.distritoJudicial || "",
      especialidad: d.especialidad || "",
      especialista: d.especialista || "",
      organoJurisdiccional: d.organoJurisdiccional || "",
      clienteTipo: TIPO_CLIENTE_MAP.get(d.clienteTipoId).nombre,
      estadoDelProceso: d.estadoDelProceso || "",
      linkDrive: d.linkDrive || "",
    };
    return newD;
  });
};

const Page = () => {
  const [open, setOpen] = useState(false);
  const [openRegistro, setOpenRegistro] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeleteModalRegistro, setOpenDeleteModalRegistro] = useState(false);
  const [objToSave, setObjToSave] = useState<TipoMantenedor | null>(null);
  const [objToSaveRegistro, setObjToSaveRegistro] =
    useState<TipoMantenedorRegistro | null>(null);
  const [editOrCreateRegistro, setEditOrCreateRegistro] = useState<
    "edit" | "create"
  >("edit");
  const [editOrCreate, setEditOrCreate] = useState<"edit" | "create">("edit");
  const [idToDelete, setIdToDelete] = useState<number>(0);
  const [idToDeleteRegistro, setIdToDeleteRegistro] = useState<number>(0);
  let [search, setSearch] = useState("");
  let [expedienteSeleccionado, setExpedienteSeleccionado] = useState<any>(null);
  let [records, setRecords] = useState<TipoMantenedor[]>([]);
  let [filterObj, setFilterObj] = useState(filterObjDefault);
  let [pagination, setPagination] = useState<IPagination>(defaultPagination);
  let [isLoading, setIsLoading] = useState<boolean>(false);
  let [estaGuardandoInDB, setEstaGuardandoInDB] = useState<boolean>(false);
  let [idSavingRegistro, setIdSavingRegistro] = useState<
    { id: Id; action: string } | { error: boolean } | null
  >(null);
  let [idSaving, setIdSaving] = useState<
    { id: Id; action: string } | { error: boolean } | null
  >(null);

  let [openDocumentosModal, setOpenDocumentosModal] = useState<boolean>(false);
  let [expedienteSelected, setExpedienteSelected] = useState<any>(null);

  const session = useSession();
  const router = useRouter();

  const utils = api.useUtils();
  const utilsMantenedor = utils["expediente"];
  const mantenedor = api["expediente"];
  const searchParams = useSearchParams();

  const actions = {
    onSuccess: async () => {
      await utilsMantenedor.invalidate();
      refreshData();
      toast.success("¡Acción hecha! 👌");
    },
    onError: (error: any) => toast.error(error.message),
  };
  const actionsRegistros = {
    onSuccess: async () => {
      await utils.registro.invalidate();
      toast.success("¡Acción hecha! 👌");
      const expedienteAux = { ...expedienteSeleccionado };
      expedienteSelected = null;
      setExpedienteSelected(null);
      setExpedienteSelected({ ...expedienteAux });
      expedienteSelected = expedienteAux;
    },
    onError: (error: any) => toast.error(error.message),
  };

  const actionsEditarCrear = {
    onSuccess: async () => {
      await utilsMantenedor.invalidate();
      refreshData();
    },
  };
  const actionsEditarCrearRegistros = {
    onSuccess: async () => {
      await utilsMantenedor.invalidate();
      await refreshData();
      await utils.registro.invalidate();
      const expedienteAux = records.find(
        (r) => r.id === expedienteSeleccionado.id,
      );
      expedienteSelected = null;
      setExpedienteSelected(null);
      setExpedienteSelected({ ...expedienteAux });
      expedienteSelected = expedienteAux;
    },
  };

  const crear = mantenedor.create.useMutation(actionsEditarCrear);
  const editar = mantenedor.edit.useMutation(actionsEditarCrear);
  const eliminar = mantenedor.delete.useMutation(actions);
  const crearGoogleEvent =
    api.google.createGoogleEventInUserCalendar.useMutation({
      onSuccess: async () => {
        toast.success("¡Añadido al calendario de Google! 👌");
      },
      onError: (error: any) =>
        toast.error("No se pudo añadir al calendario de Google 😢"),
    });

  const crearRegistro = api.registro.create.useMutation(
    actionsEditarCrearRegistros,
  );
  const editarRegistro = api.registro.edit.useMutation(
    actionsEditarCrearRegistros,
  );
  const eliminarRegistro = api.registro.delete.useMutation(actionsRegistros);

  useEffect(() => {
    if (!openRegistro) {
      setExpedienteSelected(null);
    }
  }, [openRegistro]);
  useEffect(() => {
    getSearchFromSearchParams();
  }, []);
  useEffect(() => {
    getSearchFromSearchParams();
  }, [searchParams]);

  useEffect(() => {
    if (idSavingRegistro === null) {
      setOpenRegistro(false);
    }
  }, [idSavingRegistro]);
  useEffect(() => {
    if (idSaving === null) {
      setOpen(false);
    }
  }, [idSaving]);

  useEffect(() => {
    getPaginatedInfoFromDB();
  }, [pagination.page]);

  useEffect(() => {
    if (editarRegistro?.isPending || crearRegistro?.isPending) {
      const action = editarRegistro?.isPending ? "edit" : "create";
      const id = toast.loading("Guardando...");
      idSavingRegistro = { id, action };
      setIdSavingRegistro(idSavingRegistro);
    }
    if (!editarRegistro?.isPending) {
      handleUpdateRegistro(
        "edit",
        editarRegistro.error?.message || "",
        editarRegistro?.isSuccess,
      );
    }
    if (!crearRegistro?.isPending) {
      handleUpdateRegistro(
        "create",
        crearRegistro?.error?.message || "",
        crearRegistro?.isSuccess,
      );
    }
  }, [editarRegistro?.isPending, crearRegistro?.isPending]);

  useEffect(() => {
    if (editar?.isPending || crear?.isPending) {
      const action = editar?.isPending ? "edit" : "create";
      const id = toast.loading("Guardando...");
      idSaving = { id, action };
      setIdSaving(idSaving);
    }
    if (!editar?.isPending) {
      handleUpdate("edit", editar.error?.message || "", editar?.isSuccess);
    }
    if (!crear?.isPending) {
      handleUpdate("create", crear?.error?.message || "", crear?.isSuccess);
    }
  }, [editar?.isPending, crear?.isPending]);

  const handleUpdateRegistro = (
    action: string,
    error: string,
    success: boolean,
  ) => {
    if (
      idSavingRegistro &&
      "action" in idSavingRegistro &&
      idSavingRegistro.action === action
    ) {
      if (error) {
        updateToast(idSavingRegistro.id, "error", "Algo salió mal! 😢");
      } else if (success) {
        updateToast(idSavingRegistro.id, "success", "Operación exitosa! 👌");
        setIdSavingRegistro(null);
        setTimeout(() => {
          selectExpedienteToShowDocumentos(expedienteSelected);
        }, 1);
      } else {
        toast.update(idSavingRegistro.id, { isLoading: false, autoClose: 1 });
      }
      estaGuardandoInDB = false;
      setEstaGuardandoInDB(false);
    }
  };
  const handleUpdate = (action: string, error: string, success: boolean) => {
    if (idSaving && "action" in idSaving && idSaving.action === action) {
      if (error) {
        updateToast(idSaving.id, "error", "Algo salió mal! 😢");
      } else if (success) {
        updateToast(idSaving.id, "success", "Operación exitosa! 👌");
        setIdSaving(null);
      } else {
        toast.update(idSaving.id, { isLoading: false, autoClose: 1 });
      }
      estaGuardandoInDB = false;
      setEstaGuardandoInDB(false);
    }
  };
  const getSearchFromSearchParams = () => {
    if (isLoading) return;
    setIsLoading(true);
    isLoading = true;

    const searchParam = searchParams.get("search");
    if (searchParam) {
      search = searchParam;
      setSearch(searchParam);
    }

    const offset = searchParams.get("offset");
    const page = searchParams.get("page");
    pagination = {
      ...pagination,
      offset: offset ? Number(offset) : pagination.offset,
      page: page ? Number(page) : pagination.page,
    };
    setPagination(pagination);

    setIsLoading(false);
    isLoading = false;
    setTimeout(() => {
      getPaginatedInfoFromDB();
    }, 500);
  };
  const refreshData = async () => {
    pagination = { ...defaultPagination };
    await getPaginatedInfoFromDB(true);
  };
  const saveToGoogleCalendar = async (newRegistro: TipoMantenedorRegistro) => {
    let exp = expedienteSeleccionado;
    if (!newRegistro.fecha) return;
    if (expedienteSeleccionado?.expediente === undefined) {
      exp = await utils.expediente.getById.fetch({
        id: newRegistro.expedienteId,
      });
    }

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    // Si `hora` está presente, es un evento con hora específica, sino es todo el día
    const startDate = !newRegistro.hora
      ? formatDate(newRegistro.fecha)
      : undefined;
    const startDatetime = newRegistro.hora
      ? new Date(
          `${formatDate(newRegistro.fecha)}T${newRegistro.hora}:00`,
        ).toISOString()
      : undefined;

    // Calcular `endDate` para eventos de todo el día y `endDatetime` para eventos con hora
    const endDate = !newRegistro.hora
      ? formatDate(new Date(newRegistro.fecha.getTime() + 24 * 60 * 60 * 1000)) // Un día después
      : undefined;
    const endDatetime = newRegistro.hora
      ? new Date(
          new Date(
            `${formatDate(newRegistro.fecha)}T${newRegistro.hora}:00`,
          ).getTime() +
            60 * 60 * 1000, // Una hora después
        ).toISOString()
      : undefined;
    crearGoogleEvent.mutate({
      eventDetails: {
        colorId: getColorMasParecidoByHex(exp.colorDistrito).id,
        summary: exp.expediente,
        description:
          "Nro: " +
          (newRegistro.numeroRegistro || "") +
          " Descripción: " +
          (newRegistro.description || "") +
          (newRegistro.link ? ` Enlace: ${newRegistro.link}` : "") +
          (newRegistro.linkDrive ? ` Drive: ${newRegistro.linkDrive}` : ""),
        start: {
          date: startDate,
          dateTime: startDatetime,
        },
        end: {
          date: endDate,
          dateTime: endDatetime,
        },
      },
    });
  };
  const guardarInDBRegistro = async (obj: TipoMantenedorRegistro) => {
    if (estaGuardandoInDB || !verifyObjToSaveRegistro(obj)) return;
    estaGuardandoInDB = true;
    setEstaGuardandoInDB(true);
    const saveT = getObjToSaveRegistro(obj, expedienteSeleccionado);
    if (obj.id) {
      editarRegistro?.mutate(saveT as any);
    } else {
      crearRegistro?.mutate(saveT as any);
      await saveToGoogleCalendar(obj);
    }
  };
  const guardarInDB = (obj: TipoMantenedor) => {
    if (estaGuardandoInDB || !verifyObjToSave(obj)) return;
    estaGuardandoInDB = true;
    setEstaGuardandoInDB(true);
    const saveT = getObjToSave(obj);
    if (obj.id) {
      editar?.mutate(saveT as any);
    } else {
      crear?.mutate(saveT as any);
    }
  };

  const getPaginatedInfoFromDB = async (
    isRefreshing?: boolean,
  ): Promise<void> => {
    if (isLoading) return;
    const id = beginToLoad(isRefreshing);

    const query = new URLSearchParams({
      search,
      page: String(pagination.page),
      offset: String(pagination.offset),
    }).toString();
    router.push(`/legal/expedientes?${query}`);

    const extraFilter = getExtraFilter(filterObj);
    const response = (await utilsMantenedor.getPaginated.fetch({
      limit: pagination.limit,
      search,
      offset: pagination.offset,
      ...extraFilter,
    })) as { records: TipoMantenedor[]; total: { count: number }[] };

    records = getRecordsFormatted(response.records);
    setRecords(records);
    setPagination({ ...pagination, total: response.total[0]?.count || 0 });

    endLoad(id, isRefreshing);
  };

  const beginToLoad = (isRefreshing?: boolean) => {
    isLoading = true;
    setIsLoading(true);
    return toast.loading(
      isRefreshing ? "Actualizando Registros..." : "Obteniendo Registros...",
    );
  };

  const endLoad = (id: Id, isRefreshing?: boolean) => {
    toast.update(id, {
      isLoading: false,
      autoClose,
      render: isRefreshing ? "Registros Actualizados" : "Registros Obtenidos",
      type: "success",
    });
    setIsLoading(false);
    isLoading = false;
  };

  const exportAllData = async () => {
    if (isLoading) return;
    const id = beginToLoad();

    const response = await utilsMantenedor.getAllFiltered.fetch({
      limit: pagination.limit,
      search,
      offset: pagination.offset,
    });

    const recordsToExport = formatArrayToExport(
      getRecordsFormatted(response as unknown[]),
      columns,
    );
    exportToExcel(recordsToExport, title);

    endLoad(id);
  };

  const resetFilter = () => {
    setFilterObj(filterObjDefault);
    filterObj = filterObjDefault;
    setSearch("");
    getPaginatedInfoFromDB();
  };

  const createRecord = () => {
    setOpen(true);
    setObjToSave(defaultObj);
    setEditOrCreate("create");
  };
  const editRecord = (obj: TipoMantenedor) => {
    setOpen(true);
    setObjToSave({ ...obj });
    setEditOrCreate("edit");
  };

  const guardarRegistro = () => {
    if (objToSaveRegistro) {
      guardarInDBRegistro(objToSaveRegistro);
    }
  };
  const guardar = () => {
    if (objToSave) {
      guardarInDB(objToSave);
    }
  };

  const openDeleteModalById = (id: number) => {
    setOpenDeleteModal(true);
    setIdToDelete(id);
  };
  const deleteRegistro = (id: number) => {
    setOpenDeleteModalRegistro(true);
    setIdToDeleteRegistro(id);
  };
  const getNumberOfFieldsFilled = () => {
    let fieldsFilled = 0;
    filterObj &&
      Object.keys(filterObj).forEach((key) => {
        const value = filterObj[key as keyof typeof filterObj];
        if (typeof value === "string" && value && String(value).trim() !== "") {
          fieldsFilled++;
        }
        if (typeof value === "number" && value !== 0) {
          fieldsFilled++;
        }
      });
    return fieldsFilled;
  };

  const addRegistro = (obj: TipoMantenedor) => {
    setExpedienteSeleccionado(obj);
    setObjToSaveRegistro(defaultObjRegistro);
    setOpenRegistro(true);
    setEditOrCreateRegistro("create");
  };
  const editRegistro = (registro: TipoMantenedorRegistro) => {
    setOpenDocumentosModal(false);
    setObjToSaveRegistro({ ...registro });
    setOpenRegistro(true);
    setEditOrCreateRegistro("edit");
  };
  const selectExpedienteToShowDocumentos = (exp: any) => {
    setExpedienteSeleccionado(exp);
    setOpenDocumentosModal(true);
    setExpedienteSelected(exp);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap-reverse justify-between gap-3">
        <div className="flex gap-2">
          <Input
            id="busqueda"
            name="busqueda"
            type="text"
            value={search}
            onChange={(e) => {
              /*const query = new URLSearchParams({
                search: e.target.value,
                page: String(pagination.page),
                offset: String(pagination.offset),
              }).toString();
              router.push(`/legal/expedientes?${query}`);*/
              setSearch(e.target.value);
            }}
            placeholder="Buscar..."
            className="h-9 bg-white text-xs font-bold"
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                const query = new URLSearchParams({
                  search,
                  page: String(pagination.page),
                  offset: String(pagination.offset),
                }).toString();
                router.push(`/legal/expedientes?${query}`);
                refreshData();
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const query = new URLSearchParams({
                search,
                page: String(pagination.page),
                offset: String(pagination.offset),
              }).toString();
              router.push(`/legal/expedientes?${query}`);
              refreshData();
            }}
            className={`${buttonBlackTw} ${filterObj && "sm:hidden"}`}
          >
            <MagnifyingGlassIcon className={littleIconTw} />
          </button>
          {filterObj && (
            <>
              <div className="flex sm:hidden">
                <Popover>
                  <PopoverButton className={buttonBlackTw}>
                    <ChatBubbleBottomCenterIcon className={littleIconTw} />
                    {getNumberOfFieldsFilled() > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 block h-4 w-4 rounded-full bg-black text-xs ring-1 ring-indigo-400">
                        {getNumberOfFieldsFilled()}
                      </span>
                    )}
                  </PopoverButton>
                  <PopoverPanel
                    transition
                    anchor="bottom start"
                    className="divide-y divide-black rounded-xl bg-white text-xs shadow transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0"
                  >
                    <AdvancedFilter
                      filterObj={filterObj}
                      setFilterObj={setFilterObj}
                      filterSchema={columns}
                      searchByFilter={() => refreshData()}
                      resetFilter={resetFilter}
                      getNumberOfFieldsFilled={getNumberOfFieldsFilled}
                    />
                  </PopoverPanel>
                </Popover>
              </div>
              <div className="hidden sm:flex">
                <AdvancedFilter
                  filterObj={filterObj}
                  setFilterObj={setFilterObj}
                  filterSchema={columns}
                  searchByFilter={() => refreshData()}
                  resetFilter={resetFilter}
                  getNumberOfFieldsFilled={getNumberOfFieldsFilled}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className={buttonWhiteTw}
            onClick={() => exportAllData()}
          >
            <FileSpreadsheetIcon
              aria-hidden="true"
              className={`-ml-0.5 ${littleIconTw}`}
            />
            <p className="ml-0.5 hidden sm:block">Exportar</p>
          </button>
          <button
            type="button"
            className={buttonBlackTw}
            onClick={() => createRecord()}
          >
            <PlusIcon aria-hidden="true" className={littleIconTw} />
            <p className="ml-0.5 hidden sm:block">{textAdd}</p>
          </button>
        </div>
      </div>
      <WrapperTable title={title}>
        <>
          <TableX
            columns={columns}
            data={records}
            actions={(each: any) => (
              <div className="flex items-center">
                <PlusIcon
                  onClick={() => addRegistro(each)}
                  className={littleIconTw + " cursor-pointer"}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <EllipsisHorizontalIcon className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs">
                      Acciones
                    </DropdownMenuLabel>

                    {ADMINS.includes(session?.data?.user.email || "") && (
                      <>
                        <DropdownMenuItem
                          onClick={() => editRecord(each)}
                          className="flex cursor-pointer gap-2 text-xs"
                        >
                          <PencilIcon className={littleIconTw} />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteModalById(each.id)}
                          className="flex cursor-pointer gap-2 text-xs"
                        >
                          <TrashIcon className={littleIconTw} />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => selectExpedienteToShowDocumentos(each)}
                      className="flex cursor-pointer gap-2 text-xs"
                    >
                      <EyeIcon className={littleIconTw} />
                      <span>Ver registros</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          />
          <Pagination
            pagination={pagination}
            goToNextPage={() => goToNextPage(pagination, setPagination)}
            goToPreviousPage={() => goToPreviousPage(pagination, setPagination)}
          />
        </>
      </WrapperTable>
      <Modal2
        open={open}
        setOpen={setOpen}
        editOrCreate={editOrCreate}
        objToSave={objToSave}
        setObjToSave={setObjToSave}
        schema={columns}
        guardar={guardar}
        utils={utils}
      />
      <Modal2
        open={openRegistro}
        setOpen={setOpenRegistro}
        editOrCreate={editOrCreateRegistro}
        objToSave={objToSaveRegistro}
        setObjToSave={setObjToSaveRegistro}
        schema={columnsRegistro}
        guardar={guardarRegistro}
        utils={utils}
      />
      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        deleteRecord={() => eliminar?.mutate({ id: idToDelete })}
      />
      <DeleteModal
        open={openDeleteModalRegistro}
        setOpen={setOpenDeleteModalRegistro}
        deleteRecord={() =>
          eliminarRegistro?.mutate({ id: idToDeleteRegistro })
        }
      />

      {expedienteSelected && (
        <DocumentosModal
          open={openDocumentosModal}
          onOpenChange={setOpenDocumentosModal}
          expediente={expedienteSelected}
          utils={utils}
          columns={columnsRegistro}
          editRegistro={editRegistro}
          deleteRegistro={deleteRegistro}
          session={session}
        />
      )}
    </div>
  );
};

export default Page;
