import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  ChatBubbleBottomCenterIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/input";
import {
  buttonBlackTw,
  buttonWhiteTw,
  inputMediumTw,
  labelTw,
  littleIconTw,
  selectTw,
} from "~/constants/tailwind-default";

export const AdvancedFilter = ({
  filterObj,
  setFilterObj,
  filterSchema,
  searchByFilter,
  resetFilter,
  getNumberOfFieldsFilled,
  hideActions = false,
  needToClear = false,
}: any) => {
  return (
    <div className="m-3 sm:m-0 sm:flex">
      <p className="mr-16 text-sm font-semibold sm:hidden">Filtro Avanzado</p>
      {filterObj &&
        filterSchema
          .filter((f: any) => f.useInAdvancedFilter)
          .map((field: any, idx: number) => (
            <div key={"filterSchema_" + idx} className="mt-4 sm:mr-2 sm:mt-0">
              <label htmlFor={field.name} className={`${labelTw} sm:hidden`}>
                {field.label}
              </label>
              {field.options && Array.isArray(field.options) ? (
                <select
                  id="color"
                  name="color"
                  aria-placeholder="Seleccione una opción"
                  value={filterObj[field.name]}
                  onChange={(e) => {
                    setFilterObj({
                      ...filterObj,
                      [field.name]: e.target.value,
                    });
                  }}
                  className={`${selectTw} h-9 sm:w-32`}
                >
                  <option value="">{field.label}</option>
                  {field.options.map((option: any, idx: number) => (
                    <option key={idx} value={option.id}>
                      {option.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  value={filterObj[field.name]}
                  type="text"
                  onChange={(e) => {
                    setFilterObj({
                      ...filterObj,
                      [field.name]: e.target.value,
                    });
                  }}
                  className="text-xs"
                />
              )}
            </div>
          ))}
      {!hideActions && (
        <div className="mt-4 flex justify-end gap-2 sm:ml-0 sm:mt-0">
          <button
            type="button"
            onClick={() => {
              searchByFilter();
            }}
            className={buttonBlackTw}
          >
            <MagnifyingGlassIcon className={littleIconTw} />
          </button>
          {getNumberOfFieldsFilled() > 0 ||
            (needToClear && (
              <button
                type="button"
                data-autofocus
                onClick={() => resetFilter()}
                className={buttonWhiteTw}
              >
                <XMarkIcon className={littleIconTw} />
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default function AdvancedFilterWrapper({
  filterObj,
  setFilterObj,
  filterSchema,
  searchByFilter,
  resetFilter,
}: any) {
  const getNumberOfFieldsFilled = () => {
    let fieldsFilled = 0;
    filterObj &&
      Object.keys(filterObj).forEach((key) => {
        if (
          typeof filterObj[key] === "string" &&
          filterObj[key].trim() !== ""
        ) {
          fieldsFilled++;
        }
        if (typeof filterObj[key] === "number" && filterObj[key] !== 0) {
          fieldsFilled++;
        }
      });
    return fieldsFilled;
  };
  return (
    <>
      <div className="flex sm:hidden">
        <Popover>
          <PopoverButton className={buttonBlackTw}>
            <ChatBubbleBottomCenterIcon className={littleIconTw} />
            {getNumberOfFieldsFilled() > 0 && (
              <span className="absolute -right-1.5 -top-1.5 block h-4 w-4 rounded-full bg-black text-xs ring-1 ring-indigo-400">
                {getNumberOfFieldsFilled()}
              </span>
            )}
          </PopoverButton>
          <PopoverPanel
            transition
            anchor="bottom start"
            className="divide-y divide-black rounded-xl bg-white text-xs shadow transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0"
          >
            <AdvancedFilter
              filterObj={filterObj}
              setFilterObj={setFilterObj}
              filterSchema={filterSchema}
              searchByFilter={searchByFilter}
              resetFilter={resetFilter}
              getNumberOfFieldsFilled={getNumberOfFieldsFilled}
            />
          </PopoverPanel>
        </Popover>
      </div>
      <div className="hidden sm:flex">
        <AdvancedFilter
          filterObj={filterObj}
          setFilterObj={setFilterObj}
          filterSchema={filterSchema}
          searchByFilter={searchByFilter}
          resetFilter={resetFilter}
          getNumberOfFieldsFilled={getNumberOfFieldsFilled}
        />
      </div>
    </>
  );
}
