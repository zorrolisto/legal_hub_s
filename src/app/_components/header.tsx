export default function Header({title, actions}: any) {
    return (
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold leading-7 text-gray-900 sm:truncate sm:text-2xl sm:tracking-tight">
            {title}
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
            {actions}
        </div>
      </div>
    )
  }
  