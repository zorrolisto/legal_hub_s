"use client";

import MantenedorSimple from "~/app/_components/mantenedor-simple";
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
import { autoClose } from "~/constants";

export function MantenedorSimpleWrapper<T extends { id?: number }>({
  columns,
  filterObjDefault,
  objDefault,
  title,
  textAdd,
  nameMantenedor,
  verifyObjToSave,
  getObjToSave,
  getExtraFilter,
  getRecordsFormatted,
}: any) {
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
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<T[]>([]);
  let [filterObj, setFilterObj] = useState(filterObjDefault);
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
  const guardarInDB = (obj: T) => {
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
    })) as { records: T[]; total: { count: number }[] };
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
    filterObj = filterObjDefault;
    setFilterObj(filterObj);
    setSearch("");
    getPaginatedInfoFromDB();
  };

  return (
    <MantenedorSimple
      data={records}
      title={title}
      textAdd={textAdd}
      columns={columns}
      deleteRecord={(id: number) => eliminar.mutate({ id })}
      defaultObj={objDefault}
      goToNextPage={() => goToNextPage(pagination, setPagination)}
      goToPreviousPage={() => goToPreviousPage(pagination, setPagination)}
      pagination={pagination}
      guardarInDB={guardarInDB}
      exportAllData={exportAllData}
      search={search}
      setSearch={setSearch}
      filterObj={filterObj}
      setFilterObj={setFilterObj}
      searchByFilter={() => void refreshData()}
      resetFilter={resetFilter}
      idSaving={idSaving}
      utils={utils}
    />
  );
}
