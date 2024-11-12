export default function Pagination({
  pagination,
  goToPreviousPage,
  goToNextPage,
  total,
}: any) {
  return (
    <nav
      aria-label="Pagination"
      className="flex w-full items-center justify-between border-t border-gray-200 bg-white px-0 pt-3"
    >
      <div className="hidden sm:block">
        <p className="text-xs text-gray-500">
          Del <span className="font-medium">{pagination.offset}</span> al{" "}
          <span className="font-medium">
            {pagination.page * pagination.limit > pagination.total
              ? pagination.total
              : pagination.page * pagination.limit}
          </span>{" "}
          (resultados <span className="font-medium">{pagination.total}</span>)
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <button
          className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-offset-0"
          onClick={() => goToPreviousPage()}
        >
          Ant
        </button>
        <button
          className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-offset-0"
          onClick={() => goToNextPage()}
        >
          Sig
        </button>
      </div>
    </nav>
  );
}
