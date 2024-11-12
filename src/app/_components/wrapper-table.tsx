import React from "react";

export default function WrapperTable({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-hidden rounded-lg bg-white shadow">
      <div className="p-4 py-2 sm:p-6 sm:py-4">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-5 text-gray-900">
              {title}
            </h1>
          </div>
        </div>
        <div className="mt-4 flow-root">
          <div className="inline-block w-full min-w-full py-2 align-middle">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
