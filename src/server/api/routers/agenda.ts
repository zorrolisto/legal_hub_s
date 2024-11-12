import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  isNotNull,
  like,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  customUser,
  distritosJudiciales,
  especialidades,
  estados,
  expedientes,
  registrosDeExpediente,
} from "~/server/db/schema";

export const agendaRouter = createTRPCRouter({
  getActosByIDAndByRange: protectedProcedure
    .input(
      z.object({
        actoId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const audienciasProgramadas = await ctx.db
        .select({
          ...getTableColumns(registrosDeExpediente),
          createdBy: customUser.name,
          expediente: expedientes.expediente,
          demandado: expedientes.demandado,
          demandante: expedientes.demandante,
          colorDistrito: distritosJudiciales.color,
        })
        .from(registrosDeExpediente)
        .where(
          and(
            gte(registrosDeExpediente.fecha, input.startDate),
            lte(registrosDeExpediente.fecha, input.endDate),
            isNotNull(registrosDeExpediente.fecha),
            eq(registrosDeExpediente.enable, true),
            eq(registrosDeExpediente.tipoActoId, input.actoId),
          ),
        )
        .leftJoin(
          customUser,
          eq(registrosDeExpediente.createdById, customUser.id),
        )
        .leftJoin(
          expedientes,
          eq(registrosDeExpediente.expedienteId, expedientes.id),
        )
        .leftJoin(
          distritosJudiciales,
          eq(expedientes.distritoJudicialId, distritosJudiciales.id),
        );

      return audienciasProgramadas || [];
    }),
});
