import { Label } from "~/components/ui/label";
import {
  ResponsiveModal,
  ResponsiveModalBody,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "./responsive-modal";
import { SearchSelect } from "./searchSelect";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { DatePickerDemo } from "./datePicker";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export function Modal2({
  open,
  setOpen,
  editOrCreate,
  objToSave,
  setObjToSave,
  schema,
  guardar,
  utils,
}: any) {
  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            {editOrCreate === "edit" ? "Editar" : "Crear"}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>
          <div className="grid grid-cols-2 gap-1">
            {objToSave &&
              schema
                .filter(
                  (f: any) =>
                    !f.hiddenFromForm &&
                    !(f && f.modal && f.modal.hide && f.modal.hide(objToSave)),
                )
                .map((field: any, idx: number) => (
                  <div
                    key={"schema_" + idx}
                    className={`col-span-1 mt-1 ${field?.extraClasses || ""}`}
                  >
                    <Label className="text-xs font-bold" htmlFor={field.name}>
                      {field?.modal?.getLabel
                        ? field.modal.getLabel(objToSave)
                        : field.label}
                    </Label>
                    {((field.isSearchSelect === undefined &&
                      field.options &&
                      !Array.isArray(field.options)) ||
                      (field.isSearchSelect &&
                        field.isSearchSelect(objToSave))) && (
                      <SearchSelect
                        field={field}
                        objToSave={objToSave}
                        setObjToSave={setObjToSave}
                        utilsMantenedor={utils[field.options.endpoint]}
                      />
                    )}
                    {(field.options || field.getOptions) &&
                      Array.isArray(
                        field.options || field.getOptions(objToSave).options,
                      ) && (
                        <Select
                          value={objToSave[field.name]}
                          onValueChange={(e) => {
                            objToSave[field.name] = e;
                            setObjToSave({ ...objToSave, [field.name]: e });
                          }}
                        >
                          <SelectTrigger className="w-full text-xs font-medium">
                            <SelectValue placeholder="Selecciona una opción">
                              {(
                                (field?.getOptions &&
                                  field?.getOptions(objToSave).optionsMap) ||
                                field.optionsMap
                              ).get(objToSave[field.name])
                                ? (
                                    (field?.getOptions &&
                                      field?.getOptions(objToSave)
                                        .optionsMap) ||
                                    field.optionsMap
                                  ).get(objToSave[field.name]).nombre
                                : ""}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {(
                                (field?.getOptions &&
                                  field?.getOptions(objToSave).options) ||
                                field.options
                              ).map((option: any, key: number) => (
                                <SelectItem
                                  key={option.id}
                                  value={option.id}
                                  className="text-xs"
                                >
                                  {option.nombre}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    {((field.isInputText === undefined &&
                      !field.options &&
                      !["textarea", "date"].includes(field.type)) ||
                      (field.isInputText && field.isInputText(objToSave))) && (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={objToSave[field.name]}
                        type={field.type || "text"}
                        className="text-xs"
                        autoComplete="off"
                        onChange={(e) => {
                          setObjToSave({
                            ...objToSave,
                            [field.name]: e.target.value,
                          });
                        }}
                      />
                    )}
                    {field.type === "date" && (
                      <DatePickerDemo
                        date={objToSave[field.name]}
                        setDate={(date: Date) => {
                          setObjToSave({
                            ...objToSave,
                            [field.name]: date,
                          });
                        }}
                      />
                    )}
                    {field.type === "textarea" && (
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={objToSave[field.name]}
                        className="text-xs"
                        onChange={(e) => {
                          setObjToSave({
                            ...objToSave,
                            [field.name]: e.target.value,
                          });
                        }}
                      />
                    )}
                  </div>
                ))}
          </div>
        </ResponsiveModalBody>
        <ResponsiveModalFooter>
          <ResponsiveModalClose asChild>
            <div className="mt-5 gap-2 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  guardar();
                }}
              >
                Guardar
              </Button>
              <Button
                type="button"
                data-autofocus
                className="bg-white text-black hover:bg-gray-200"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </ResponsiveModalClose>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
