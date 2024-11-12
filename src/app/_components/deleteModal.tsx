"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  ResponsiveModal,
  ResponsiveModalBody,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "./responsive-modal";

export default function DeleteModal({ open, setOpen, deleteRecord }: any) {
  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalContent className="max-w-fit">
        <ResponsiveModalHeader>
          <div className="mr-4 flex items-center gap-2">
            <ExclamationTriangleIcon
              aria-hidden="true"
              className="h-6 w-6 text-yellow-800"
            />
            <ResponsiveModalTitle>
              ¿Deseas eliminar este registro?
            </ResponsiveModalTitle>
          </div>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                deleteRecord();
              }}
              className="inline-flex w-full justify-center rounded-md bg-black px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black/70 sm:ml-3 sm:w-auto"
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              data-autofocus
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cancelar
            </button>
          </div>
        </ResponsiveModalBody>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
