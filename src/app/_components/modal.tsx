"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  buttonBlackTw,
  buttonWhiteTw,
  labelTw,
  selectTw,
} from "~/constants/tailwind-default";

export default function Modal({
  open,
  setOpen,
  editOrCreate,
  objToSave,
  setObjToSave,
  schema,
  guardar,
}: any) {
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full sm:mt-0">
                <DialogTitle
                  as="h3"
                  className="text-center text-base font-semibold leading-6 text-gray-900"
                >
                  {editOrCreate === "edit" ? "Editar" : "Crear"}
                </DialogTitle>
                <div className="mt-2">
                  {objToSave &&
                    schema
                      .filter((f: any) => !f.hiddenFromForm)
                      .map((field: any, idx: number) => (
                        <div key={"schema_" + idx} className="mt-2">
                          <label htmlFor={field.name} className={labelTw}>
                            {field.label}
                          </label>
                          {field.options ? (
                            <select
                              id="color"
                              name="color"
                              value={objToSave[field.name]}
                              onChange={(e) => {
                                setObjToSave({
                                  ...objToSave,
                                  [field.name]: e.target.value,
                                });
                              }}
                              className={selectTw}
                            >
                              {field.options.map((option: any) => (
                                <option key={option.id} value={option.id}>
                                  {option.nombre}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              id={field.name}
                              name={field.name}
                              value={objToSave[field.name]}
                              type="text"
                              onChange={(e) => {
                                setObjToSave({
                                  ...objToSave,
                                  [field.name]: e.target.value,
                                });
                              }}
                              className="block w-full rounded-md border-0 px-3 py-1.5 text-xs text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:leading-6"
                            />
                          )}
                        </div>
                      ))}
                </div>
              </div>
            </div>
            <div className="mt-5 gap-2 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => {
                  guardar();
                }}
                className={buttonBlackTw}
              >
                Guardar
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className={buttonWhiteTw}
              >
                Cancelar
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
