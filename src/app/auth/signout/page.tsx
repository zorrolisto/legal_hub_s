import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function Signin({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const csrfToken =
    cookies().get("__Host-next-auth.csrf-token")?.value.split("|")[0] ||
    cookies().get("next-auth.csrf-token")?.value.split("|")[0];
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/auth/signin");
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            ¿Quieres cerrar sesión?
          </h2>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="/api/auth/signout" method="POST" className="space-y-6">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <div className="flex justify-center">
              <button
                type="submit"
                className="flex w-fit justify-center rounded-md bg-black px-3 py-1.5 text-xs font-semibold leading-6 text-white shadow-sm hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Cerrar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
