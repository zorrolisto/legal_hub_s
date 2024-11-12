import {
  DocumentIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  buttonBlackTw,
  buttonWhiteTw,
  inputBigTw,
  littleIconTw,
} from "~/constants/tailwind-default";
import AdvancedFilter from "./advanceFilter";
import { FileSpreadsheetIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { ADMINS } from "~/constants";

export default function HeaderActions({
  search,
  setSearch,
  searchByFilter,
  filterObj,
  setFilterObj,
  resetFilter,
  exportAllData,
  createRecord,
  textAdd,
  columns,
}: any) {
  const session = useSession();

  return (
    <div className="flex flex-wrap-reverse justify-between gap-3">
      <div className="flex gap-2">
        <input
          id="busqueda"
          name="busqueda"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className={inputBigTw}
        />
        <button
          type="button"
          onClick={() => {
            searchByFilter();
          }}
          className={`${buttonBlackTw} ${filterObj && "sm:hidden"}`}
        >
          <MagnifyingGlassIcon className={littleIconTw} />
        </button>
        {filterObj && (
          <AdvancedFilter
            filterObj={filterObj}
            setFilterObj={setFilterObj}
            filterSchema={columns}
            searchByFilter={searchByFilter}
            resetFilter={resetFilter}
          />
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className={buttonWhiteTw}
          onClick={() => exportAllData()}
        >
          <FileSpreadsheetIcon
            aria-hidden="true"
            className={`-ml-0.5 ${littleIconTw}`}
          />
          <p className="ml-0.5 hidden sm:block">Exportar</p>
        </button>

        <button
          type="button"
          className={buttonBlackTw}
          onClick={() => createRecord()}
        >
          <PlusIcon aria-hidden="true" className={littleIconTw} />
          <p className="ml-0.5 hidden sm:block">{textAdd}</p>
        </button>
      </div>
    </div>
  );
}
