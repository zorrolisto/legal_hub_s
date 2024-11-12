import { CaretSortIcon } from "@radix-ui/react-icons";
import { CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export function SearchSelect({
  field,
  objToSave,
  setObjToSave,
  utilsMantenedor,
  canCreate = true,
  customSelectOneText,
}: any) {
  const [open, setOpen] = useState(false);
  let [search, setSearch] = useState("");
  let [objValue, setObjValue] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  let [foundValues, setFoundValues] = useState<
    { id: number; nombre: string }[]
  >([]);

  useEffect(() => {
    const id = objToSave[field.name];
    const nombre = objToSave[field.name.replace("Id", "")];
    if (id && nombre) {
      setObjValue({ id, nombre });
    }
    void fetchTenFieldPossibleValues();
  }, []);
  /*useEffect(() => {
    if (!open) return;
    const input = document.getElementById(field.name);
    if (input) setTimeout(() => input.focus(), 1);
  }, [open]);*/
  useEffect(() => {
    setOpen(true);
    const timeoutId = setTimeout(() => void fetchTenFieldPossibleValues(), 200);
    return () => clearTimeout(timeoutId);
  }, [search, 200]);

  const selectToCreate = () => {
    if (!canCreate) return;
    const foundValuesWithId = foundValues.filter((fv) => fv.id > 0);
    if (foundValuesWithId.length > 0) {
      selectValue(search);
      return;
    }
    const newValue = { id: 0, nombre: search };
    setFoundValues([newValue, ...foundValues]);
    setObjValue(newValue);
    objValue = newValue;
    setObjToSave({
      ...objToSave,
      [field.name]: search,
      [field.options.setIdIn]: search,
    });
    setOpen(false);
  };
  const fetchTenFieldPossibleValues = async () => {
    const response = await utilsMantenedor.getTenBySearch.fetch({ search });
    const responseMapped = response.map((item: any) => {
      const fieldNames = field.options.fieldNames || ["nombre"];
      const foundField = fieldNames.find(
        (fieldName: string) => item[fieldName],
      );
      return {
        id: item.id,
        nombre: foundField ? item[foundField] : item.nombre,
      };
    });
    setFoundValues(responseMapped);
  };
  const selectValue = (value: string) => {
    const findObj = foundValues.find((fv: any) =>
      fv.nombre.toUpperCase().includes(value.toUpperCase()),
    );
    if (findObj) {
      setObjValue(findObj);
      objValue = findObj;
      setObjToSave({
        ...objToSave,
        [field.name]: field.options.getNameOnly ? findObj.nombre : findObj.id,
        [field.options.setIdIn]: findObj.id,
      });
    }
    setOpen(false);
  };

  return (
    <Command shouldFilter={false}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild autoFocus={false}>
          {/*<Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-xs"
        >
          {objValue ? objValue.nombre : customSelectOneText || "Escoge uno..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>*/}
          <Input
            id={field.name}
            name={field.name}
            value={objValue ? objValue.nombre : field.options.defaultText || ""}
            type={field.type || "text"}
            className="text-xs"
            autoComplete="off"
            onChange={(e) => {
              setObjValue({ id: 0, nombre: e.target.value });
              setSearch(e.target.value);
              setObjToSave({
                ...objToSave,
                [field.name]: e.target.value,
                [field.options.setIdIn]: e.target.value,
              });
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                selectToCreate();
              }
            }}
          />
          {/*<CommandInput
          className="h-9"
          onFocus={() => setOpen(true)}
          onChangeCapture={(e) => {
            setSearch((e.target as HTMLInputElement).value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              selectToCreate();
            }
          }}
        />*/}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <CommandList>
            <CommandEmpty className="px-2 py-4 text-center text-xs">
              Intente buscar o escriba y presione Enter para "Crear"
            </CommandEmpty>
            <CommandGroup>
              {foundValues.map((fv: any, key: number) => (
                <CommandItem
                  key={fv.id}
                  value={fv.id}
                  onSelect={selectValue}
                  className="text-xs"
                >
                  {fv.nombre}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      objValue && objValue.id === fv.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  );
}
