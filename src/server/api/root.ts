import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { distritoJudicialRouter } from "./routers/distrito-judicial";
import { especialidadRouter } from "./routers/especialidad";
import { instanciaRouter } from "./routers/instancia";
import { especialistaRouter } from "./routers/especialista";
import { organoJurisdiccionalRouter } from "./routers/organo-jurisdiccional";
import { libroRouter } from "./routers/libro";
import { clienteRouter } from "./routers/cliente";
import { expedienteRouter } from "./routers/expediente";
import { registroRouter } from "./routers/registro";
import { dashboardRouter } from "./routers/dashboard";
import { estadoRouter } from "./routers/estado";
import { customUserRouter } from "./routers/users";
import { googleRouter } from "./routers/googleCalendar";
import { agendaRouter } from "./routers/agenda";

export const appRouter = createTRPCRouter({
  distritoJudicial: distritoJudicialRouter,
  especialidad: especialidadRouter,
  instancia: instanciaRouter,
  especialista: especialistaRouter,
  organoJurisdiccional: organoJurisdiccionalRouter,
  libro: libroRouter,
  cliente: clienteRouter,
  expediente: expedienteRouter,
  registro: registroRouter,
  dashboard: dashboardRouter,
  estado: estadoRouter,
  customUser: customUserRouter,
  google: googleRouter,
  agenda: agendaRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
