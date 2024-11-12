"use client";

import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPES_MAP,
  TIPOS_DE_SERVICIO,
  TIPOS_DE_SERVICIO_MAP,
} from "~/constants";
import { RouterOutputs } from "~/trpc/react";
import { toast } from "react-toastify";
import { MantenedorSimpleWrapper } from "~/app/_components/wrapper-mantenedor-simple";

type TipoMantenedor = RouterOutputs["distritoJudicial"]["getAllFiltered"][0];
const columns = [
  { name: "id", label: "ID", hiddenFromForm: true },
  {
    name: "documentType",
    label: "Documento",
    options: DOCUMENT_TYPES,
    optionsMap: DOCUMENT_TYPES_MAP,
    hiddenFromTable: true,
    hiddenFromExcel: true,
    useInAdvancedFilter: true,
  },
  { name: "tipoDocumento", label: "Documento", hiddenFromForm: true },
  { name: "documentNumber", label: "Documento Nro" },
  {
    name: "razonSocial",
    label: "Razón Social",
    hiddenFromTable: true,
    modal: {
      hide: (obj: TipoMantenedor) => {
        return [1, 3].includes(obj.documentType || 0);
      },
    },
  },
  {
    name: "nombreComercial",
    hiddenFromForm: true,
    hiddenFromExcel: true,
    label: "Nombre Comercial",
    modal: {
      hide: (obj: TipoMantenedor) => [2].includes(obj.documentType || 0),
    },
    table: {
      getValue: (obj: TipoMantenedor) => {
        return obj.documentType === 1 ? obj.nombreComercial : obj.razonSocial;
      },
    },
  },
  {
    name: "numero",
    label: "Telefono",
  },
  {
    name: "nombreComercial",
    label: "Nombre",
    hiddenFromTable: true,
    modal: {
      hide: (obj: TipoMantenedor) => [2].includes(obj.documentType || 0),
    },
  },
  {
    name: "representanteLegalDni",
    label: "Representante Legal DNI",
    modal: {
      hide: (obj: TipoMantenedor) => [1, 3].includes(obj.documentType || 0),
    },
  },
  {
    name: "representanteLegalNombre",
    label: "Representante Legal Nombre",
    modal: {
      hide: (obj: TipoMantenedor) => [1, 3].includes(obj.documentType || 0),
    },
  },
  { name: "direccion", label: "Direccion" },
  { name: "correo", label: "Correo" },
  {
    name: "tipoServicioId",
    label: "Servicio",
    options: TIPOS_DE_SERVICIO,
    optionsMap: TIPOS_DE_SERVICIO_MAP,
    hiddenFromTable: true,
    hiddenFromExcel: true,
    useInAdvancedFilter: true,
  },
  { name: "tipoServicio", label: "Servicio", hiddenFromForm: true },
  { name: "extras", label: "Extras" },
];
const filterObjDefault = { tipoServicioId: 0, documentType: 0 };
const objDefault = {
  tipoServicioId: 1,
  documentType: 1,
  documentNumber: "00000000",
  razonSocial: "",
  nombreComercial: "",
  numero: "",
  representanteLegalDni: "",
  representanteLegalNombre: "",
  direccion: "",
  correo: "",
  extras: "-",
} as unknown as TipoMantenedor;
const title = "Clientes";
const textAdd = "Añadir Cliente";
const nameMantenedor = "cliente";
const verifyObjToSave = (obj: TipoMantenedor) => {
  if ((obj?.documentNumber || "").trim() === "") {
    toast.error("El Nro de Documento no puede estar vacío");
    return false;
  }
  if ((obj?.documentType || 0) === 2) {
    if ((obj?.razonSocial || "").trim() === "") {
      toast.error("La Razón Social no puede estar vacía");
      return false;
    }
  }
  if ((obj?.documentType || 0) === 1) {
    if ((obj?.nombreComercial || "").trim() === "") {
      toast.error("El Nombre Comercial no puede estar vacío");
      return false;
    }
  }
  return true;
};
const getObjToSave = (obj: TipoMantenedor) => {
  return {
    id: obj.id || undefined,
    nombre: obj.nombre || "",
    tipoServicioId: Number(obj.tipoServicioId) || 0,
    documentType: Number(obj.documentType) || 0,
    documentNumber: obj.documentNumber || "",
    razonSocial: obj.razonSocial || "",
    nombreComercial: obj.nombreComercial || "",
    representanteLegalDni: obj.representanteLegalDni || "",
    representanteLegalNombre: obj.representanteLegalNombre || "",
    numero: obj.numero || "",
    direccion: obj.direccion || "",
    correo: obj.correo || "",
    extras: obj.extras || "",
  };
};
const getExtraFilter = (filterObj: any) => {
  return {
    tipoServicioId:
      filterObj.tipoServicioId === 0
        ? undefined
        : Number(filterObj.tipoServicioId),
    documentType:
      filterObj.documentType === 0 ? undefined : Number(filterObj.documentType),
  };
};
const getRecordsFormatted = (records: any[]) => {
  return records.map((d: any) => ({
    ...d,
    tipoDocumento: DOCUMENT_TYPES_MAP.get(d.documentType)?.nombre,
    tipoServicio: TIPOS_DE_SERVICIO_MAP.get(d.tipoServicioId)?.nombre,
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
