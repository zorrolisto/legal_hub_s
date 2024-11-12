"use client";

import {
  MagnifyingGlassIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { endOfWeek, format, startOfWeek } from "date-fns";
import {
  ExternalLink,
  EyeIcon,
  FolderCheckIcon,
  FolderIcon,
  LibraryIcon,
  NotebookText,
  VideoIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import EventModal from "~/app/_components/eventModal";
import MyCalendar from "~/app/_components/my-calendar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CalendarDateRangePicker } from "~/components/ui/date-range-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { littleIconTw } from "~/constants/tailwind-default";
import { updateToast } from "~/helpers/toast";
import { api } from "~/trpc/react";

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [dashboardInfo, setDashboardInfo] = useState<any>(null);
  const [audienciasAlerta, setAudienciasAlerta] = useState<any>(null);
  const [eventSelected, setEventSelected] = useState<any>(null);
  const utils = api.useUtils();
  const utilsMantenedor = utils.dashboard;
  const session = useSession();
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(
    startOfWeek(new Date(), {
      weekStartsOn: 1,
    }),
  );
  const [endDate, setEndDate] = useState<Date | null>(
    endOfWeek(new Date(), {
      weekStartsOn: 1,
    }),
  );

  useEffect(() => {
    if (!session.data?.user?.email) {
      void getExpedienteFromUser();
    } else {
      void executeWithLoadingToast();
    }
  }, []);

  const getExpedienteFromUser = async () => {
    const userExpediente = await utils.customUser.getExpedienteByUserId.fetch({
      userId: Number(session.data?.user?.id),
    });
    if (userExpediente) {
      router.push(`/legal/expedientes/${userExpediente.expedienteId}`);
    }
  };
  const executeWithLoadingToast = async () => {
    const loadingToastId = toast.loading("Cargando...");
    try {
      await getDashboardInfo(true);
      await getAudienciasAlertas();
      updateToast(loadingToastId, "success", "Operación exitosa! 👌");
    } catch (error) {
      updateToast(loadingToastId, "error", "Algo salió mal! 😢");
    }
  };

  const getAudienciasAlertas = async () => {
    const al = await utilsMantenedor.getAudienciasAlertas.fetch({
      startDate: startDate,
      endDate: endDate,
    });
    setAudienciasAlerta(al);
  };

  const getDashboardInfo = async (notUseLoading?: boolean) => {
    const loadingToastId = notUseLoading ? 0 : toast.loading("Cargando...");

    try {
      const info = await utilsMantenedor.getDashboardInfo.fetch({
        startDate: startDate,
        endDate: endDate,
      });
      setDashboardInfo(info);
      updateToast(loadingToastId, "success", "Operación exitosa! 👌");
    } catch (error) {
      updateToast(loadingToastId, "error", "Algo salió mal! 😢");
    }
  };
  const getDateMessage = (audiencia: any) => {
    const audienciaDate = new Date(audiencia.fecha);

    const today = new Date();
    const diffTime = audienciaDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dateMessage;
    if (diffDays < 0) {
      dateMessage = "Ya Pasó";
    } else if (diffDays === 0) {
      dateMessage = "Hoy";
    } else if (diffDays === 1) {
      dateMessage = "Mañana";
    } else {
      dateMessage = `Faltan ${diffDays} días`;
    }
    return dateMessage;
  };
  const handleEventClick = (event: any) => {
    const eventFound = dashboardInfo?.audienciasProgramadas.find(
      (a: any) => a.id === Number(event.publicId),
    );
    setEventSelected([eventFound]);
    setOpen(true);
  };
  const getStyle = (audiencia: any) => {
    const audienciaDate = new Date(audiencia.fecha);

    const today = new Date();
    const diffTime = audienciaDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let rowColor;
    if (diffDays < 0) {
      rowColor = "";
    } else if (diffDays === 0) {
      rowColor = "bg-red-300";
    } else if (diffDays === 1) {
      rowColor = "bg-yellow-300";
    } else {
      rowColor = "bg-green-300";
    }
    return rowColor;
  };

  if (!session.data?.user?.email) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
          <Button
            onClick={() => {
              getDashboardInfo();
            }}
          >
            <MagnifyingGlassIcon className={littleIconTw} />
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agenda">
            <Link href="/legal/agenda">Ir a Agenda</Link>
          </TabsTrigger>
          <TabsTrigger value="x">
            <Link href="/legal/expedientes">Ir a Casos Judiciales</Link>
          </TabsTrigger>
          <TabsTrigger value="y">
            <Link href="/legal/registros">Ir a Documentos</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="y" className="ml-4 space-y-4 text-sm">
          Redireccionando a Documentos...
        </TabsContent>
        <TabsContent value="x" className="ml-4 space-y-4 text-sm">
          Redireccionando a Casos Judiciales...
        </TabsContent>
        <TabsContent value="agenda" className="ml-4 space-y-4 text-sm">
          Redireccionando a Agenda...
        </TabsContent>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Documentos Creados
                </CardTitle>
                <LibraryIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardInfo?.registrosBetweenCount || 0}
                </div>
                {/*<p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>*/}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expedientes Creados
                </CardTitle>
                <FolderIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardInfo?.expedientesBetweenCount || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expedientes Cerrados
                </CardTitle>
                <FolderCheckIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardInfo?.expedientesConcluidosBetweenCount || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Eventos pasados
                </CardTitle>
                <VideoCameraIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardInfo?.audienciasPasadas?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Esta semana</CardTitle>
                <CardDescription className="text-xs">
                  Tienes {audienciasAlerta?.audienciasProgramadas?.length || 0}{" "}
                  eventos programados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">
                        <div className="flex items-center gap-1">
                          <span>Exp</span>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-xs">Estimación</TableHead>
                      <TableHead className="text-xs">Fecha</TableHead>
                      <TableHead className="text-xs">Descripción</TableHead>
                      <TableHead className="text-xs">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audienciasAlerta?.audienciasProgramadas
                      .sort((a: any, b: any) => {
                        const dateA = new Date(a.fecha);
                        const dateB = new Date(b.fecha);
                        return dateB.getTime() - dateA.getTime(); // Descending order
                      })
                      .map((audiencia: any) => (
                        <TableRow
                          key={audiencia.id}
                          className={getStyle(audiencia)}
                        >
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link
                                    href={`/legal/expedientes/${audiencia.expedienteId}`}
                                  >
                                    <div className="w-fit rounded-lg p-1.5 hover:bg-gray-300">
                                      <FolderIcon className="h-4 w-4 text-blue-600" />
                                    </div>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{audiencia.expediente}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-xs">
                            {getDateMessage(audiencia)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {format(audiencia.fecha, "dd/MM/yyyy") +
                              " " +
                              (audiencia.hora
                                ? format(
                                    new Date(`1970-01-01T${audiencia.hora}`),
                                    "hh:mm a",
                                  )
                                : "")}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Popover>
                              <PopoverTrigger>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="rounded-lg p-1.5 hover:bg-gray-300">
                                        <NotebookText className="h-4 w-4 text-blue-600" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Ver Descripción</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </PopoverTrigger>
                              <PopoverContent className="text-xs">
                                {audiencia.description || "-"}
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-around gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className="rounded-lg p-1.5 hover:bg-gray-300"
                                      onClick={() => {
                                        setOpen(true);
                                        setEventSelected([audiencia]);
                                      }}
                                    >
                                      <EyeIcon className="h-4 w-4 text-blue-600" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Ver más</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className="rounded-lg p-1.5 hover:bg-gray-300"
                                      onClick={() => {
                                        window.open(audiencia.link, "_blank");
                                      }}
                                    >
                                      <VideoIcon className="h-4 w-4 text-blue-600" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{audiencia.link}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Agenda</CardTitle>
              </CardHeader>
              <CardContent>
                <MyCalendar
                  height="53vh"
                  startDate={startDate}
                  registros={dashboardInfo?.audienciasProgramadas || []}
                  clickEvent={handleEventClick}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {eventSelected && (
        <EventModal open={open} setOpen={setOpen} events={eventSelected} />
      )}
    </div>
  );
}
