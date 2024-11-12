import { MiniData } from "~/app/_components/expedienteInfo";

export default function Page() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold">Soporte</h1>
      <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <MiniData title="Nombre" data={"Julio Cabanillas"} />
        <MiniData
          title="Whatsapp"
          data={"Hablar con Soporte"}
          link="https://api.whatsapp.com/send?phone=51904552881"
        />
      </div>
    </div>
  );
}
