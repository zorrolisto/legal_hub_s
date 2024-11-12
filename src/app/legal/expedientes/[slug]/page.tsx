"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import ExpedienteInfo from "~/app/_components/expedienteInfo";
import { api } from "~/trpc/react";

export default function Page() {
  const { slug } = useParams();
  const utils = api.useUtils();
  const session = useSession();
  const [expediente] = api.expediente.getById.useSuspenseQuery({
    id: Number(slug || 0),
  });
  if (!expediente) {
    return <div>Loading...</div>;
  }
  return (
    <ExpedienteInfo expediente={expediente} utils={utils} session={session} />
  );
}
