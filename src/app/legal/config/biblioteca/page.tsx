"use client";

import { RouterOutputs } from "~/trpc/react";
import { toast } from "react-toastify";
import { MantenedorSimpleWrapper } from "~/app/_components/wrapper-mantenedor-simple";

type TipoMantenedor = RouterOutputs["libro"]["getAllFiltered"][0];
const columns = [
  { name: "id", label: "ID", hiddenFromForm: true },
  { name: "numero", label: "Numero" },
  { name: "nombre", label: "Nombre" },
  { name: "editorial", label: "Editorial" },
  { name: "sumilla", label: "Sumilla" },
  { name: "autores", label: "Autores" },
  { name: "ubicacion", label: "Ubicacion" },
  { name: "extras", label: "Extras" },
];
const objDefault = {
  numero: "",
  nombre: "",
  editorial: "",
  sumilla: "",
  autores: "",
  ubicacion: "",
  extras: "-",
} as unknown as TipoMantenedor;
const title = "Biblioteca";
const textAdd = "Añadir Libro";
const nameMantenedor = "libro";
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
    numero: obj.numero || "",
    nombre: obj.nombre || "",
    sumilla: obj.sumilla || "",
    editorial: obj.editorial || "",
    autores: obj.autores || "",
    ubicacion: obj.ubicacion || "",
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
