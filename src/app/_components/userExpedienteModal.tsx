"use client";

import React, { useEffect, useState } from "react";
import { autoClose, TIPO_CLIENTE_MAP } from "~/constants";
import TableX from "./table";
import { EraserIcon, Link2Icon, Link2OffIcon, UserIcon } from "lucide-react";
import {
  buttonBlackTw,
  buttonWhiteTw,
  littleIconTw,
} from "~/constants/tailwind-default";
import {
  ResponsiveModal,
  ResponsiveModalBody,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "./responsive-modal";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { RouterOutputs } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import Pagination from "./pagination";
import {
  defaultPagination,
  goToNextPage,
  goToPreviousPage,
} from "~/helpers/pagination";
import { IPagination } from "~/types";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Id, toast } from "react-toastify";

type TipoMantenedor = RouterOutputs["expediente"]["getAllFiltered"][0];
const columns = [
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
          <Link href={`/legal/expedientes/${obj.id}`} target="_blank">
            <div className="rounded-lg p-1.5 text-blue-600 underline">
              {obj.expediente}
            </div>
          </Link>
        );
      },
    },
    order: 2,
  },

  {
    name: "instancia",
    label: "Etapa",
    hiddenFromForm: true,
    order: 3,
  },

  {
    name: "especialidad",
    label: "Materia",
    hiddenFromForm: true,
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
    name: "organoJurisdiccional",
    label: "Órgano J.",
    hiddenFromForm: true,
    order: 3,
  },
  { name: "materia", label: "Pretensiones", required: true, order: 5 },

  {
    name: "especialista",
    label: "Especialista",
    hiddenFromForm: true,
    order: 7,
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
];

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
    };
    return newD;
  });
};

export default function UserExpedienteModal({
  open,
  onOpenChange,
  utils,
  session,
  userForExpediente,
  añadirUserExpediente,
  eliminarUserExpediente,
}: any) {
  const [expedienteSelected, setExpedienteSelected] = useState<any>(null);
  let [expedientes, setExpedientes] = useState<any>(null);

  useEffect(() => {
    if (userForExpediente) {
      void getExpedienteById();
    }
  }, [userForExpediente]);

  const getExpedienteById = async () => {
    if (!userForExpediente.expedientes.length) return;
    const exp = await utils.expediente.getById.fetch({
      id: userForExpediente.expedientes[0].expedienteId,
    });
    setExpedienteSelected(exp);
  };
  const onOpenChangeHandler = (props: any) => {
    onOpenChange(props);
    setExpedientes(null);
    setExpedienteSelected(null);
  };

  //pagination
  let [pagination, setPagination] = useState<IPagination>(defaultPagination);
  let [isLoading, setIsLoading] = useState<boolean>(false);
  let [search, setSearch] = useState<string>("");

  useEffect(() => {
    getPaginatedInfoFromDB();
  }, [pagination.page]);

  const beginToLoad = (isRefreshing?: boolean) => {
    isLoading = true;
    setIsLoading(true);
    return toast.loading("Obteniendo Registros...");
  };
  const getPaginatedInfoFromDB = async (
    isRefreshing?: boolean,
  ): Promise<void> => {
    if (isLoading) return;
    const id = beginToLoad(isRefreshing);

    const response = (await utils.expediente.getPaginated.fetch({
      limit: pagination.limit,
      search,
      offset: pagination.offset,
    })) as { records: TipoMantenedor[]; total: { count: number }[] };

    setExpedientes(getRecordsFormatted(response.records));
    setPagination({ ...pagination, total: response.total[0]?.count || 0 });

    endLoad(id, isRefreshing);
  };
  const endLoad = (id: Id, isRefreshing?: boolean) => {
    toast.update(id, {
      isLoading: false,
      autoClose: autoClose,
      render: "Registros Obtenidos",
      type: "success",
    });
    setIsLoading(false);
    isLoading = false;
  };
  const clearFilter = () => {
    pagination = { ...defaultPagination };
    search = "";
    setSearch("");
    getPaginatedInfoFromDB(true);
  };
  const refreshData = () => {
    pagination = { ...defaultPagination };
    getPaginatedInfoFromDB(true);
  };
  const linkToExpediente = (each: any) => {
    setExpedienteSelected(each);
    añadirUserExpediente.mutate({
      userId: userForExpediente.id,
      expedienteId: each.id,
    });
  };
  const unlinkToExpediente = (each: any) => {
    setExpedienteSelected(null);
    eliminarUserExpediente.mutate({
      userId: userForExpediente.id,
    });
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChangeHandler}>
      <ResponsiveModalContent className="max-w-fit">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            <div className="flex gap-2">
              <h1 className="flex gap-2 text-lg font-semibold">
                <UserIcon className="h-6 w-6" />
                {userForExpediente?.name || ""}
              </h1>
            </div>
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <ResponsiveModalBody className="w-fit">
          <div className="flex items-center gap-2 rounded-sm bg-gray-100 p-5 text-xs">
            <p>
              Caso judicial seleccionado:{" "}
              <span className="font-semibold">
                {expedienteSelected
                  ? expedienteSelected?.expediente
                  : "No tiene"}
              </span>
            </p>
            {expedienteSelected && (
              <Button
                className={buttonBlackTw}
                onClick={() => unlinkToExpediente(expedienteSelected)}
              >
                <Link2OffIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              id="busqueda"
              name="busqueda"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="h-9 w-52 bg-white text-xs font-bold"
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  refreshData();
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                refreshData();
              }}
              className={buttonBlackTw}
            >
              <MagnifyingGlassIcon className={littleIconTw} />
            </button>
            <button
              type="button"
              onClick={() => {
                clearFilter();
              }}
              className={buttonWhiteTw}
            >
              <EraserIcon className={littleIconTw} />
            </button>
          </div>
          <div className="h-96 w-full overflow-auto">
            {expedientes && expedientes.length > 0 && (
              <div className="inline-block w-full min-w-full py-2 align-middle">
                <>
                  <TableX
                    columns={columns}
                    data={expedientes}
                    actions={(each: any) => (
                      <div className="flex h-28 flex-1 items-center">
                        <button
                          className="rounded px-2 py-1.5 text-black hover:bg-gray-100"
                          onClick={() => linkToExpediente(each)}
                        >
                          <Link2Icon className={littleIconTw} />
                        </button>
                      </div>
                    )}
                  />
                  <Pagination
                    pagination={pagination}
                    goToNextPage={() => goToNextPage(pagination, setPagination)}
                    goToPreviousPage={() =>
                      goToPreviousPage(pagination, setPagination)
                    }
                  />
                </>
              </div>
            )}
            {expedientes && expedientes.length === 0 && (
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-sm font-semibold">
                    No hay casos judiciales
                  </h1>
                </div>
              </div>
            )}
            {!expedientes && (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex-1 text-center">
                  <h1 className="text-xs font-semibold">
                    Comienza a buscar por expediente.
                  </h1>
                </div>
              </div>
            )}
          </div>
        </ResponsiveModalBody>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
