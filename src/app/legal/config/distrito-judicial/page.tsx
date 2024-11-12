"use client";

import { COLORES, COLORES_MAP } from "~/constants";
import { RouterOutputs } from "~/trpc/react";
import { toast } from "react-toastify";
import { MantenedorSimpleWrapper } from "~/app/_components/wrapper-mantenedor-simple";

type TipoMantenedor = RouterOutputs["distritoJudicial"]["getAllFiltered"][0];
const columns = [
  { name: "id", label: "ID", hiddenFromForm: true },
  { name: "nombre", label: "Nombre" },
  { name: "color", label: "Color", type: "color" },
  { name: "extras", label: "Extras" },
];
const filterObjDefault = { colorId: 0 };
const objDefault = {
  nombre: "",
  color: "#FFFFFF",
  extras: "-",
} as unknown as TipoMantenedor;
const title = "Distritos Judiciales";
const textAdd = "Añadir Distrito Judicial";
const nameMantenedor = "distritoJudicial";
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
const getExtraFilter = (filterObj: any) => {
  return {};
};
const getRecordsFormatted = (records: any[]) => {
  return records.map((d: any) => ({
    ...d,
    color: d.color || "",
  }));
};
export default function Page() {
  return (
    <MantenedorSimpleWrapper
      columns={columns}
      filterObjDefault={filterObjDefault}
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
