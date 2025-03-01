"use client";

import { RouterOutputs } from "~/trpc/react";
import { toast } from "react-toastify";
import { MantenedorSimpleWrapper } from "~/app/_components/wrapper-mantenedor-simple";

type TipoMantenedor = RouterOutputs["estado"]["getAllFiltered"][0];
const columns = [
  { name: "id", label: "ID", hiddenFromForm: true },
  { name: "nombre", label: "Nombre" },
  { name: "color", label: "Color", type: "color" },
  { name: "extras", label: "Extras" },
];
const objDefault = {
  nombre: "",
  color: "#FFFFFF",
  extras: "-",
} as unknown as TipoMantenedor;
const title = "Estados";
const textAdd = "Añadir Estado";
const nameMantenedor = "estado";
const verifyObjToSave = (obj: TipoMantenedor) => {
  if ((obj?.nombre || "").trim() === "") {
    toast.error("El nombre no puede estar vacío");
    return false;
  }
  return true;
};
const getObjToSave = (obj: TipoMantenedor) => {
  return {
    id: obj.id || undefined,
    nombre: obj.nombre || "",
    color: obj.color || "",
    extras: obj.extras || "",
  };
};
const getExtraFilter = (_filterObj: any) => {
  return {};
};
const getRecordsFormatted = (records: any[]) => {
  return records.map((record) => {
    return {
      ...record,
      color: record.color || "",
    };
  });
};
export default function Page() {
  return (
    <MantenedorSimpleWrapper
      columns={columns}
      filterObjDefault={null}
      objDefault={objDefault}
      title={title}
      textAdd={textAdd}
      nameMantenedor={nameMantenedor}
      verifyObjToSave={verifyObjToSave}
      getObjToSave={getObjToSave}
      getExtraFilter={getExtraFilter}
      getRecordsFormatted={getRecordsFormatted}
    />
  );
}
