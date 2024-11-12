"use client";

import { RouterOutputs } from "~/trpc/react";
import { toast } from "react-toastify";
import { MantenedorSimpleWrapper } from "~/app/_components/wrapper-mantenedor-simple";

type TipoMantenedor = RouterOutputs["especialista"]["getAllFiltered"][0];
const columns = [
  { name: "id", label: "ID", hiddenFromForm: true },
  { name: "nombre", label: "Nombre" },
  { name: "numero", label: "Número" },
  { name: "correo", label: "Correo" },
  { name: "extras", label: "Extras" },
];
const objDefault = { nombre: "", extras: "-" } as unknown as TipoMantenedor;
const title = "Especialistas";
const textAdd = "Añadir Especialista";
const nameMantenedor = "especialista";
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
    correo: obj.correo || "",
    numero: obj.numero || "",
    extras: obj.extras || "",
  };
};
const getExtraFilter = (_filterObj: any) => {
  return {};
};
const getRecordsFormatted = (records: any[]) => {
  return records;
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
