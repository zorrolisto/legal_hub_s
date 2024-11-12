"use client";

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Modal from "./modal";
import Pagination from "./pagination";
import DeleteModal from "./deleteModal";
import { littleIconTw } from "~/constants/tailwind-default";
import TableX from "./table";
import HeaderActions from "./headerActions";
import WrapperTable from "./wrapper-table";
import { Button } from "~/components/ui/button";
import { Modal2 } from "./modal2";
import { ADMINS } from "~/constants";
import { useSession } from "next-auth/react";

interface HasId {
  id: string | number;
}

export default function MantenedorSimple<T extends HasId>({
  data,
  title,
  textAdd,
  columns,
  deleteRecord,
  defaultObj,
  goToNextPage,
  goToPreviousPage,
  pagination,
  guardarInDB,
  exportAllData,
  search,
  setSearch,
  filterObj,
  setFilterObj,
  resetFilter,
  searchByFilter,
  idSaving,
  utils,
}: any) {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [objToSave, setObjToSave] = useState<T | null>(null);
  const [editOrCreate, setEditOrCreate] = useState<"edit" | "create">("edit");
  const [idToDelete, setIdToDelete] = useState<string | number>(0);

  useEffect(() => {
    if (idSaving === null) {
      setOpen(false);
    }
  }, [idSaving]);

  const createRecord = () => {
    setOpen(true);
    setObjToSave(defaultObj);
    setEditOrCreate("create");
  };
  const editRecord = (obj: T) => {
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
  return (
    <div className="flex flex-col gap-2">
      <HeaderActions
        search={search}
        setSearch={setSearch}
        searchByFilter={searchByFilter}
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
            data={data}
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
            goToNextPage={goToNextPage}
            goToPreviousPage={goToPreviousPage}
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
        deleteRecord={() => deleteRecord(idToDelete)}
      />
    </div>
  );
}
