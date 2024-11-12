"use client";

import {
  ChatBubbleBottomCenterIcon,
  DocumentIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
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
import { useCallback, useEffect, useState } from "react";
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
  TIPO_REGISTRO,
  TIPO_REGISTRO_MAP,
  todosLosTiposDeActos,
  todosLosTiposDeActosMap,
} from "~/constants";
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
  HardDriveIcon,
  NotebookText,
  PlusIcon,
  VideoIcon,
} from "lucide-react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Input } from "~/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Modal2 } from "~/app/_components/modal2";
import { AdvancedFilter } from "~/app/_components/advanceFilter";
import { SearchSelect } from "~/app/_components/searchSelect";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { getColorMasParecidoByHex } from "~/helpers/colors";
import Link from "next/link";
import {
  Popover as PopoverSCN,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const switchGetTipoActo = (obj: TipoMantenedor) => {
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
};

type TipoMantenedor = RouterOutputs["registro"]["getAllFiltered"][0];
const columns = [
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
      getValue: (obj: TipoMantenedor) => {
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
      getLabel: (obj: TipoMantenedor) => {
        if (obj.tipoRegistroId === 4) return "N° Resolución";
        return `N° ${TIPO_REGISTRO_MAP.get(obj.tipoRegistroId).nombre}`;
      },
      hide: (obj: TipoMantenedor) => [3].includes(obj.tipoRegistroId || 0),
    },
    table: {
      getValue: (obj: TipoMantenedor) => {
        const nombre = TIPO_REGISTRO_MAP.get(obj.tipoRegistroId).nombre;
        const numero = obj.numeroRegistro ? obj.numeroRegistro : "S/N";
        const cuaderno = obj.numeroCuadernoCautelar;
        return `${nombre} ${numero}${cuaderno ? " - " + cuaderno : ""}`;
      },
    },
    isRequired: (obj: TipoMantenedor) =>
      [1, 2, 4].includes(obj.tipoRegistroId || 0),
    order: 2,
  },
  {
    name: "fechaRegistro",
    label: "F. Documento",
    modal: {
      getLabel: (obj: TipoMantenedor) => {
        if ([1, 4].includes(obj.tipoRegistroId || 0)) return "Fecha Resolución";
        if (obj.tipoRegistroId === 2) return "Fecha Escrito";
      },
      hide: (obj: TipoMantenedor) => [3].includes(obj.tipoRegistroId || 0),
    },
    type: "date",
    required: true,
    order: 3,
    isRequired: (obj: TipoMantenedor) =>
      [1, 2, 4].includes(obj.tipoRegistroId || 0),
  },
  {
    name: "fechaNotificacion",
    label: "Fecha Notificación",
    modal: {
      hide: (obj: TipoMantenedor) => [2].includes(obj.tipoRegistroId || 0),
    },
    type: "date",
    isRequired: (obj: TipoMantenedor) =>
      [1, 3, 4].includes(obj.tipoRegistroId || 0),
    order: 4,
  },
  {
    name: "numeroCuadernoCautelar",
    label: "N° Cuaderno Cautelar",
    modal: {
      hide: (obj: TipoMantenedor) => ![4].includes(obj.tipoRegistroId || 0),
    },
    hiddenFromTable: true,
    hiddenFromExcel: true,
    isRequired: (obj: TipoMantenedor) => [4].includes(obj.tipoRegistroId || 0),
  },
  {
    name: "tipoActoId",
    label: "T. Acto",
    options: todosLosTiposDeActos,
    optionsMap: todosLosTiposDeActosMap,
    getOptions: (obj: TipoMantenedor) => {
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
        return obj.tipoActo || "-";
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
      getValue: (obj: TipoMantenedor) => {
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
      getValue: (obj: TipoMantenedor) => {
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
      getValue: (obj: TipoMantenedor) => {
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
      hide: (obj: TipoMantenedor) => [2].includes(obj.tipoRegistroId || 0),
    },
    order: 7,
  },
  {
    name: "hora",
    label: "Hora",
    type: "time",
    modal: {
      hide: (obj: TipoMantenedor) => [2].includes(obj.tipoRegistroId || 0),
    },
    table: {
      getValue: (obj: TipoMantenedor) => {
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
      getValue: (obj: TipoMantenedor) => {
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
      getValue: (obj: TipoMantenedor) => {
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
];

const filterObjDefault = {
  expedienteId: 0,
  tipoRegistroId: 0,
  tipoActoId: 0,
};
const defaultObj = {
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
} as unknown as TipoMantenedor;
const title = "Documentos";
const textAdd = "Añadir Documento";

const verifyObjToSave = (obj: Record<string, any>) => {
  for (const column of columns) {
    if (
      column.required ||
      (column.isRequired && column.isRequired(obj as any))
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

const getObjToSave = (obj: TipoMantenedor, expediente: any) => {
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
    expedienteId:
      expediente?.id || obj.expedienteId || expediente.expedienteId || 0,

    description: obj.description || "",
    extras: obj.extras || "",
  };
};
const getExtraFilter = (filterObj: any) => ({
  tipoRegistroId:
    filterObj.tipoRegistroId === 0
      ? undefined
      : Number(filterObj.tipoRegistroId),
  tipoActoId:
    filterObj.tipoActoId === 0 ? undefined : Number(filterObj.tipoActoId),
  expedienteId:
    filterObj.expedienteId === 0 ? undefined : Number(filterObj.expedienteId),
});

const getRecordsFormatted = (records: any[]) => {
  return records.map((d: any) => {
    const optionsObj = switchGetTipoActo(d);
    const newD = {
      ...d,
      linkDrive: d.linkDrive || "",
      tipoActo: optionsObj?.optionsMap.get(d.tipoActoId)?.nombre,
    };
    return newD;
  });
};

export default function Page() {
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [objToSave, setObjToSave] = useState<TipoMantenedor | null>(null);
  const [editOrCreate, setEditOrCreate] = useState<"edit" | "create">("edit");
  const [idToDelete, setIdToDelete] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<TipoMantenedor[]>([]);
  let [filterObj, setFilterObj] = useState(filterObjDefault);
  let [pagination, setPagination] = useState<IPagination>(defaultPagination);
  let [isLoading, setIsLoading] = useState<boolean>(false);
  let [isLoadingExpediente, setIsLoadingExpediente] = useState<boolean>(false);
  let [expediente, setExpediente] = useState<any>(null);
  let [estaGuardandoInDB, setEstaGuardandoInDB] = useState<boolean>(false);
  let [idSaving, setIdSaving] = useState<
    { id: Id; action: string } | { error: boolean } | null
  >(null);
  const session = useSession();
  const searchParams = useSearchParams();

  const utils = api.useUtils();
  const utilsMantenedor = utils["registro"];
  const mantenedor = api["registro"];
  const pathname = usePathname();
  const router = useRouter();

  const afterSave = (response: any) => {
    console.log("after Save response", response);
  };

  const actions = {
    onSuccess: async () => {
      await utilsMantenedor.invalidate();
      refreshData();
      toast.success("¡Acción hecha! 👌");
    },
    onError: (error: any) => toast.error(error.message),
  };

  const actionsEditarCrear = {
    onSuccess: async () => {
      await utilsMantenedor.invalidate();
      refreshData();
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

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  useEffect(() => {
    const expedienteId = searchParams.get("expedienteId");
    if (expedienteId) {
      void getExpediente(Number(expedienteId));
      const mode = searchParams.get("mode");
      if (mode && mode === "create") {
        setTimeout(() => {
          createRecord();
        }, 500);
      }
    }
  }, []);

  useEffect(() => {
    if (idSaving === null) {
      setOpen(false);
    }
  }, [idSaving]);

  useEffect(() => {
    getPaginatedInfoFromDB();
  }, [pagination.page]);

  useEffect(() => {
    if (editar?.isPending || crear?.isPending) {
      const action = editar?.isPending ? "edit" : "create";
      const id = toast.loading("Guardando...");
      idSaving = { id, action };
      setIdSaving(idSaving);
    }
    if (!editar?.isPending) {
      handleUpdate("edit", editar.error?.message || "", editar?.isSuccess);
      afterSave(editar);
    }
    if (!crear?.isPending) {
      handleUpdate("create", crear?.error?.message || "", crear?.isSuccess);
      afterSave(crear);
    }
  }, [editar?.isPending, crear?.isPending]);

  const getExpediente = async (expedienteId: number) => {
    isLoadingExpediente = true;
    setIsLoadingExpediente(true);
    const expedienteRes = await utils.expediente.getById.fetch({
      id: expedienteId,
    });
    expediente = expedienteRes;
    setExpediente(expedienteRes);
    getPaginatedInfoFromDB();
    isLoadingExpediente = false;
    setIsLoadingExpediente(false);
  };
  const updateToast = (
    id: Id,
    type: "error" | "success" | "default",
    message: string,
  ) =>
    toast.update(id, {
      isLoading: false,
      type: type,
      render: message,
      autoClose,
    });

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

  const refreshData = () => {
    pagination = { ...defaultPagination };
    getPaginatedInfoFromDB(true);
  };
  const saveToGoogleCalendar = async (newRegistro: TipoMantenedor) => {
    let exp = expediente;
    if (!newRegistro.fecha) return;
    if (expediente?.expediente === undefined) {
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

  const guardarInDB = async (obj: TipoMantenedor) => {
    if (estaGuardandoInDB || !verifyObjToSave(obj)) return;
    estaGuardandoInDB = true;
    setEstaGuardandoInDB(true);
    const saveT = getObjToSave(obj, expediente);
    if (obj.id) {
      editar?.mutate(saveT as any);
    } else {
      crear?.mutate(saveT as any);
      await saveToGoogleCalendar(obj);
    }
  };

  const getPaginatedInfoFromDB = async (
    isRefreshing?: boolean,
  ): Promise<void> => {
    if (isLoading || isLoadingExpediente) return;
    const id = beginToLoad(isRefreshing);

    const extraFilter = getExtraFilter(filterObj);
    const response = (await utilsMantenedor.getPaginated.fetch({
      limit: pagination.limit,
      search,
      offset: pagination.offset,
      ...extraFilter,
      ...(expediente ? { expedienteId: expediente.id } : {}),
    })) as { records: TipoMantenedor[]; total: { count: number }[] };

    setRecords(getRecordsFormatted(response.records));
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

  const resetFilter = async () => {
    isLoadingExpediente = true;
    setIsLoadingExpediente(true);

    setFilterObj(filterObjDefault);
    filterObj = filterObjDefault;
    setSearch("");
    setExpediente("");
    // remove Param "expedienteId"
    router.push(pathname + "?");
    await getPaginatedInfoFromDB();

    isLoadingExpediente = false;
    setIsLoadingExpediente(false);
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

  const guardar = () => {
    if (objToSave) {
      guardarInDB(objToSave);
    }
  };

  const openDeleteModalById = (id: number) => {
    setOpenDeleteModal(true);
    setIdToDelete(id);
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap-reverse justify-between gap-3">
        <div className="flex gap-2">
          {/*!isLoadingExpediente && (
            <SearchSelect
              autofocus={false}
              customSelectOneText="Expediente..."
              field={{
                name: "expedienteId",
                label: "Expediente",
                options: {
                  endpoint: "expediente",
                  fieldNames: ["expediente"],
                  getNameOnly: true,
                  setIdIn: "expediente",
                },
              }}
              objToSave={{
                expedienteId: expediente?.id,
                expediente: expediente?.expediente,
              }}
              setObjToSave={(obj: {
                expedienteId: string;
                expediente: number;
              }) => {
                if (obj.expediente !== 0) {
                  setExpediente({
                    expediente: obj.expedienteId,
                    expedienteId: obj.expediente,
                  });
                  router.push(
                    pathname +
                      "?" +
                      createQueryString("expedienteId", String(obj.expediente)),
                  );
                }
              }}
              canCreate={false}
              utilsMantenedor={utils.expediente}
            />
          )*/}
          <Input
            id="busqueda"
            name="busqueda"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="bg-white text-xs"
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                refreshData();
              }
            }}
          />
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
                      needToClear={!!expediente}
                      hideActions
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
                  needToClear={!!expediente}
                  hideActions
                />
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              refreshData();
            }}
            className={`${buttonBlackTw}`}
          >
            <MagnifyingGlassIcon className={littleIconTw} />
          </button>
          {(getNumberOfFieldsFilled() > 0 || !!expediente) && (
            <button
              type="button"
              data-autofocus
              onClick={() => resetFilter()}
              className={buttonWhiteTw}
            >
              <XMarkIcon className={littleIconTw} />
            </button>
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
          {expediente && (
            <Button type="button" onClick={() => createRecord()}>
              <PlusIcon aria-hidden="true" className={littleIconTw} />
              <p className="ml-0.5 hidden sm:block">{textAdd}</p>
            </Button>
          )}
        </div>
      </div>
      <WrapperTable
        title={
          title +
          (expediente ? ` de ${expediente.expediente.toUpperCase()}` : "")
        }
      >
        <>
          <TableX
            columns={columns}
            data={records}
            actions={(each: any) =>
              ADMINS.includes(session?.data?.user.email || "") && (
                <>
                  <button
                    className="rounded px-2 py-1.5 text-black hover:bg-gray-100"
                    onClick={() => editRecord(each)}
                  >
                    <PencilIcon className={littleIconTw} />
                  </button>
                  <button
                    className="rounded px-2 py-1.5 text-black hover:bg-gray-100"
                    onClick={() => openDeleteModalById(each.id)}
                  >
                    <TrashIcon className={littleIconTw} />
                  </button>
                </>
              )
            }
          />
          <Pagination
            pagination={pagination}
            goToNextPage={() => goToNextPage(pagination, setPagination)}
            goToPreviousPage={() => goToPreviousPage(pagination, setPagination)}
          />
        </>
      </WrapperTable>
      {!isLoadingExpediente && (
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
      )}
      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        deleteRecord={() => eliminar?.mutate({ id: idToDelete })}
      />
    </div>
  );
}
