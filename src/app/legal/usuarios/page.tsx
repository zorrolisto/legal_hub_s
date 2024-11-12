"use client";

import { api, RouterOutputs } from "~/trpc/react";
import { Id, toast } from "react-toastify";
import { MantenedorSimpleWrapper } from "~/app/_components/wrapper-mantenedor-simple";
import { ADMINS, autoClose, IDENTIFIERS, IDENTIFIERS_MAP } from "~/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Link from "next/link";
import {
  FolderIcon,
  Link2Icon,
  Link2OffIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { Link1Icon } from "@radix-ui/react-icons";
import { littleIconTw } from "~/constants/tailwind-default";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  defaultPagination,
  goToNextPage,
  goToPreviousPage,
} from "~/helpers/pagination";
import { IPagination } from "~/types";
import { exportToExcel, formatArrayToExport } from "~/helpers/excel";
import HeaderActions from "~/app/_components/headerActions";
import WrapperTable from "~/app/_components/wrapper-table";
import TableX from "~/app/_components/table";
import Pagination from "~/app/_components/pagination";
import { Modal2 } from "~/app/_components/modal2";
import DeleteModal from "~/app/_components/deleteModal";
import UserExpedienteModal from "~/app/_components/userExpedienteModal";

type TipoMantenedor = RouterOutputs["customUser"]["getAllFiltered"][0];
const columns = [
  { name: "id", label: "ID", hiddenFromForm: true, hiddenFromTable: true },
  {
    name: "name",
    label: "Nombre",
  },
  {
    name: "identifierId",
    label: "Identificador",
    options: IDENTIFIERS,
    optionsMap: IDENTIFIERS_MAP,
    hiddenFromTable: true,
    table: {
      getValue: (obj: any) => {
        return IDENTIFIERS.find((i) => i.id === obj.identifierId)?.nombre;
      },
    },
  },
  {
    name: "identifierId",
    label: "Identificador",
    hiddenFromExcel: true,
    hiddenFromForm: true,
    table: {
      getValue: (obj: any) => {
        return obj.identifierId === 1 ? obj.nroDocumento : obj.mail;
      },
    },
  },
  {
    name: "nroDocumento",
    label: "Documento",
    hiddenFromTable: true,
    modal: {
      hide: (obj: any) => obj.identifierId === 2,
    },
  },
  {
    name: "mail",
    label: "Correo",
    hiddenFromTable: true,
    modal: {
      hide: (obj: any) => obj.identifierId === 1,
    },
  },
  { name: "extras", label: "Extras" },
  { name: "createdAt", type: "date", label: "Creación", hiddenFromForm: true },
  {
    name: "expediente",
    label: "Expediente",
    hiddenFromExcel: true,
    hiddenFromForm: true,
    table: {
      getValue: (obj: any) => {
        if (obj.expedientes.length === 0) {
          return "No tiene";
        }
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/legal/expedientes/${obj.expedientes[0].expedienteId}`}
                >
                  <div className="rounded-lg p-1.5 hover:bg-gray-300">
                    <FolderIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{obj.expedientes[0].expediente}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  },
];
const objDefault = {
  name: "",
  mail: "",
  nroDocumento: "",
  extras: "-",
  identifierId: 1,
} as unknown as TipoMantenedor;
const title = "Usuarios";
const textAdd = "Añadir Usuario";
const nameMantenedor = "customUser";
const verifyObjToSave = (obj: TipoMantenedor) => {
  if (!obj?.name || obj.name.trim() === "") {
    toast.error("El nombre no puede estar vacío");
    return false;
  }

  if ((obj as any).identifierId === 1) {
    if (!obj?.nroDocumento || obj.nroDocumento.trim() === "") {
      toast.error("El documento no puede estar vacío");
      return false;
    }

    if (obj.nroDocumento.length < 4) {
      toast.error("El documento tiene que tener al menos 4 caracteres");
      return false;
    }
  }
  if ((obj as any).identifierId === 2) {
    if (!obj?.mail || obj.mail.trim() === "") {
      toast.error("El correo no puede estar vacío");
      return false;
    }
    if (
      !obj.mail
        .toLowerCase()
        .match(/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/)
    ) {
      toast.error("El correo tiene que ser un gmail");
      return false;
    }
  }
  return true;
};
const getObjToSave = (obj: TipoMantenedor) => {
  return {
    id: obj.id || undefined,
    name: obj.name || "",
    mail: obj.mail || "",
    nroDocumento: obj.nroDocumento || "",
    extras: obj.extras || "",
    identifierId: !!(obj && (obj as any).mail.trim() === "") ? 1 : 2,
  };
};
const getExtraFilter = (_filterObj: any) => {
  return {};
};
const getRecordsFormatted = (records: any[]) => {
  return records.map((r) => {
    return {
      ...r,
      identifierId: r.mail.trim() === "" ? 1 : 2,
    };
  });
};

export default function Page() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [objToSave, setObjToSave] = useState<any | null>(null);
  const [editOrCreate, setEditOrCreate] = useState<"edit" | "create">("edit");
  const [idToDelete, setIdToDelete] = useState<string | number>(0);
  const [userForExpediente, setUserForExpediente] = useState<any>(null);
  const [openUserExpedienteModal, setOpenUserExpedienteModal] = useState(false);

  const utils = api.useUtils();
  const utilsMantenedor = utils[nameMantenedor as keyof typeof utils] as any;
  const mantenedor = api[nameMantenedor as keyof typeof api] as {
    create?: { useMutation: (actions: any) => any };
    edit?: { useMutation: (actions: any) => any };
    delete?: { useMutation: (actions: any) => any };
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
  const crear = mantenedor?.create?.useMutation
    ? mantenedor.create.useMutation(actionsEditarCrear)
    : null;
  const editar = mantenedor?.edit?.useMutation
    ? mantenedor.edit.useMutation(actionsEditarCrear)
    : null;
  const eliminar = mantenedor?.delete?.useMutation
    ? mantenedor.delete.useMutation(actions)
    : null;
  const añadirUserExpediente =
    api.customUser.addUserExpediente.useMutation(actions);
  const eliminarUserExpediente =
    api.customUser.deleteUserExpediente.useMutation(actions);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  let [filterObj, setFilterObj] = useState({});
  let [pagination, setPagination] = useState<IPagination>(defaultPagination);
  let [isLoading, setIsLoading] = useState<boolean>(false);
  let [estaGuardandoInDB, setEstaGuardandoInDB] = useState<boolean>(false);
  let [idSaving, setIdSaving] = useState<
    { id: Id; action: string } | { error: boolean } | null
  >(null);

  /*useEffect(() => {
    const timeoutId = setTimeout(() => refreshData(), 500);
    return () => clearTimeout(timeoutId);
  }, [search, 500]);*/
  useEffect(() => {
    getPaginatedInfoFromDB();
  }, [pagination.page]);
  useEffect(() => {
    if (editar.isPending || crear.isPending) {
      const action = editar.isPending ? "edit" : "create";
      const id = toast.loading("Guardando...");
      idSaving = { id, action, error: false };
      setIdSaving(idSaving);
    }
    if (!editar.isPending) {
      handleUpdate("edit", editar.error, editar.isSuccess);
    }
    if (!crear.isPending) {
      handleUpdate("create", crear.error, crear.isSuccess);
    }
  }, [editar.isPending, crear.isPending]);
  useEffect(() => {
    if (idSaving === null) {
      setOpen(false);
    }
  }, [idSaving]);

  const createRecord = () => {
    setOpen(true);
    setObjToSave(objDefault);
    setEditOrCreate("create");
  };
  const editRecord = (obj: any) => {
    setOpen(true);
    setObjToSave({ ...obj });
    setEditOrCreate("edit");
  };
  const guardar = () => {
    guardarInDB(objToSave);
  };
  const openDeleteModalById = (id: number | string) => {
    setOpenDeleteModal(true);
    setIdToDelete(id);
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
      autoClose: autoClose,
    });

  const handleUpdate = (action: string, error: string, success: boolean) => {
    if (idSaving && "action" in idSaving && idSaving.action === action) {
      if (error) {
        updateToast(idSaving.id, "error", "Algo salió mal! 😢");
      } else if (success) {
        updateToast(idSaving.id, "success", "Operación exitosa! 👌");
        idSaving = null;
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
  const guardarInDB = (obj: any) => {
    if (estaGuardandoInDB || !verifyObjToSave(obj)) return;
    estaGuardandoInDB = true;
    setEstaGuardandoInDB(true);
    const saveT = getObjToSave(obj);
    if (obj.id) {
      editar.mutate(saveT as any);
    } else {
      crear.mutate(saveT);
    }
  };
  const getPaginatedInfoFromDB = async (isRefreshing?: boolean) => {
    if (isLoading) return;
    const id = beginToLoad(isRefreshing);

    const extraFilter = getExtraFilter(filterObj);
    const response = (await utilsMantenedor.getPaginated.fetch({
      limit: pagination.limit,
      search,
      offset: pagination.offset,
      ...extraFilter,
    })) as { records: any[]; total: { count: number }[] };
    const recordsFormatted = getRecordsFormatted(response.records);
    setRecords(recordsFormatted);
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
    const render = isRefreshing
      ? "Registros Actualizados"
      : "Registros Obtenidos";
    toast.update(id, {
      isLoading: false,
      autoClose,
      render,
      type: "success",
    });
    isLoading = false;
    setIsLoading(false);
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
    filterObj = filterObj;
    setFilterObj(filterObj);
    setSearch("");
    getPaginatedInfoFromDB();
  };
  const openChooseExpedienteModal = (user: any) => {
    setUserForExpediente(user);
    setOpenUserExpedienteModal(true);
  };
  return (
    <div className="flex flex-col gap-2">
      <HeaderActions
        search={search}
        setSearch={setSearch}
        searchByFilter={() => refreshData()}
        filterObj={filterObj}
        setFilterObj={setFilterObj}
        resetFilter={resetFilter}
        exportAllData={exportAllData}
        createRecord={createRecord}
        textAdd={textAdd}
        columns={columns}
      />
      <WrapperTable title={title}>
        <>
          <TableX
            columns={columns}
            data={records}
            actions={(each: any) =>
              ADMINS.includes(session?.data?.user.email || "") && (
                <>
                  {each.nroDocumento && (
                    <button
                      className="rounded px-2 py-1.5 text-black hover:bg-gray-100"
                      onClick={() => openChooseExpedienteModal(each)}
                    >
                      <Link2Icon className={littleIconTw} />
                    </button>
                  )}
                  <button
                    className="rounded px-2 py-1.5 text-black hover:bg-gray-100"
                    onClick={() => editRecord(each.id)}
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
      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        deleteRecord={() => eliminar?.mutate({ id: idToDelete })}
      />
      {userForExpediente && (
        <UserExpedienteModal
          open={openUserExpedienteModal}
          onOpenChange={setOpenUserExpedienteModal}
          userForExpediente={userForExpediente}
          utils={utils}
          añadirUserExpediente={añadirUserExpediente}
          eliminarUserExpediente={eliminarUserExpediente}
        />
      )}
    </div>
  );
}
