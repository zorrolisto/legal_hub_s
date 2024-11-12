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

export const dashboardRouter = createTRPCRouter({
  getDashboardInfo: protectedProcedure
    .input(
      z.object({
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;
      const expedientesBetweenCount = await ctx.db
        .select({ count: count() })
        .from(expedientes)
        .where(
          and(
            startDate && !endDate
              ? eq(expedientes.createdAt, startDate)
              : sql`1=1`,
            startDate && endDate
              ? gte(expedientes.createdAt, startDate)
              : sql`1=1`,
            endDate ? lte(expedientes.createdAt, endDate) : sql`1=1`,
            eq(expedientes.enable, true),
          ),
        );
      const expedientesConcluidosBetweenCount = await ctx.db
        .select({ count: count() })
        .from(expedientes)
        .where(
          and(
            startDate && !endDate
              ? eq(expedientes.updatedAt, startDate)
              : sql`1=1`,
            startDate && endDate
              ? gte(expedientes.updatedAt, startDate)
              : sql`1=1`,
            endDate ? lte(expedientes.updatedAt, endDate) : sql`1=1`,
            eq(expedientes.enable, true),
            eq(expedientes.estadoDelProcesoId, 4),
          ),
        );
      const registrosBetweenCount = await ctx.db
        .select({ count: count() })
        .from(registrosDeExpediente)
        .where(
          and(
            startDate && !endDate
              ? eq(registrosDeExpediente.createdAt, startDate)
              : sql`1=1`,
            startDate && endDate
              ? gte(registrosDeExpediente.createdAt, startDate)
              : sql`1=1`,
            endDate ? lte(registrosDeExpediente.createdAt, endDate) : sql`1=1`,
            eq(registrosDeExpediente.enable, true),
          ),
        );
      const audienciasProgramadas = await ctx.db
        .select({
          ...getTableColumns(registrosDeExpediente),
          createdBy: customUser.name,
          expediente: expedientes.expediente,
          demandado: expedientes.demandado,
          demandante: expedientes.demandante,
          colorDistrito: distritosJudiciales.color,
          distritoNombre: distritosJudiciales.nombre,
        })
        .from(registrosDeExpediente)
        .where(
          and(
            startDate && !endDate
              ? eq(registrosDeExpediente.fecha, startDate)
              : sql`1=1`,
            startDate && endDate
              ? gte(registrosDeExpediente.fecha, startDate)
              : sql`1=1`,
            endDate ? lte(registrosDeExpediente.fecha, endDate) : sql`1=1`,
            isNotNull(registrosDeExpediente.fecha),
            eq(registrosDeExpediente.enable, true),
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
      const audienciasPasadas = audienciasProgramadas.filter(
        (audiencia) => audiencia.fecha && audiencia.fecha < new Date(),
      );

      return {
        expedientesConcluidosBetweenCount:
          expedientesConcluidosBetweenCount[0]?.count ?? 0,
        expedientesBetweenCount: expedientesBetweenCount[0]?.count ?? 0,
        registrosBetweenCount: registrosBetweenCount[0]?.count ?? 0,
        audienciasProgramadas,
        audienciasPasadas,
      };
    }),

  getAudienciasAlertas: protectedProcedure
    .input(
      z.object({
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;

      const audienciasProgramadas = await ctx.db
        .select({
          ...getTableColumns(registrosDeExpediente),
          createdBy: customUser.name,
          expediente: expedientes.expediente,
          demandado: expedientes.demandado,
          demandante: expedientes.demandante,
        })
        .from(registrosDeExpediente)
        .where(
          and(
            startDate && !endDate
              ? eq(registrosDeExpediente.fecha, startDate)
              : sql`1=1`,
            startDate && endDate
              ? gte(registrosDeExpediente.fecha, startDate)
              : sql`1=1`,
            endDate ? lte(registrosDeExpediente.fecha, endDate) : sql`1=1`,
            isNotNull(registrosDeExpediente.fecha),
            eq(registrosDeExpediente.enable, true),
          ),
        )
        .leftJoin(
          customUser,
          eq(registrosDeExpediente.createdById, customUser.id),
        )
        .leftJoin(
          expedientes,
          eq(registrosDeExpediente.expedienteId, expedientes.id),
        );
      const audienciasPasadas = audienciasProgramadas.filter(
        (audiencia) => audiencia.fecha && audiencia.fecha < new Date(),
      );

      return {
        audienciasProgramadas,
        audienciasPasadas,
      };
    }),
});
