"use client";

import React, { useEffect, useState } from "react";
import { ADMINS, TIPO_CLIENTE_MAP } from "~/constants";
import TableX from "./table";
import {
  FileCodeIcon,
  FileDownIcon,
  FileSpreadsheetIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { littleIconTw } from "~/constants/tailwind-default";
import {
  ResponsiveModal,
  ResponsiveModalBody,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "./responsive-modal";
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
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MyDocument } from "./eventModal";

export default function DocumentosModal({
  open,
  onOpenChange,
  expediente,
  utils,
  session,
  columns,
  editRegistro,
  deleteRegistro,
}: any) {
  let [documentos, setDocumentos] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
  const onOpenChangeHandler = (props: any) => {
    onOpenChange(props);
    // setDocumentos(null);
    expediente = null;
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

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChangeHandler}>
      <ResponsiveModalContent className="max-w-fit">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            <div className="mr-10 flex items-center gap-2">
              <h1 className="text-lg font-semibold">{expediente.expediente}</h1>
              <span
                className="fit h-min rounded p-0.5 text-xs"
                style={{
                  backgroundColor: expediente.colorEstado,
                }}
              >
                {expediente.estadoDelProceso}
              </span>
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
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <ResponsiveModalBody className="w-fit">
          {!isLoading && documentos && documentos.length > 0 && (
            <TableX
              columns={columns}
              data={documentos}
              actions={(each: any) =>
                ADMINS.includes(session?.data?.user.email || "") && (
                  <>
                    <button
                      className="rounded px-2 py-1.5 text-black hover:bg-gray-100"
                      onClick={() => editRegistro(each)}
                    >
                      <PencilIcon className={littleIconTw} />
                    </button>
                    <button
                      className="rounded px-2 py-1.5 text-black hover:bg-gray-100"
                      onClick={() => deleteRegistro(each.id)}
                    >
                      <TrashIcon className={littleIconTw} />
                    </button>
                  </>
                )
              }
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
        </ResponsiveModalBody>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

export function MiniData({ title, data }: any) {
  return (
    <div>
      <p className="text-gray-500">{title}</p>
      <div className="font-medium">{data || "-"}</div>
    </div>
  );
}
