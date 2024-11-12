import {
  and,
  between,
  ConsoleLogWriter,
  count,
  desc,
  eq,
  getTableColumns,
  like,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  registrosDeExpediente,
  expedientes,
  users,
  customUser,
  distritosJudiciales,
} from "~/server/db/schema";
import { getRouterBasicFunctions } from "../trpc-helper";
import { alias } from "drizzle-orm/sqlite-core";

const mantenedorSchema = registrosDeExpediente;
const baseCondition = sql`${mantenedorSchema.enable} = ${1}`;
const baseObject = {
  tipoRegistroId: z.number(),
  tipoActoId: z.number(),
  numeroRegistro: z.string(),
  fechaRegistro: z.date(),
  fechaNotificacion: z.date().optional(),
  fecha: z.date().optional(),
  hora: z.string().optional(),
  numeroCuadernoCautelar: z.string().optional(),
  link: z.string().optional(),
  linkDrive: z.string().optional(),
  description: z.string(),
  expedienteId: z.number(),
  extras: z.string(),

  estadoDelProcesoId: z.number().optional(),
};
const paginationObject = {
  limit: z.number(),
  offset: z.number(),

  search: z.string(),
  expedienteId: z.number().optional(),
  tipoRegistroId: z.number().optional(),
  tipoActoId: z.number().optional(),

  fechaStart: z.date().optional(),
  fechaEnd: z.date().optional(),
};

function buildConditions(input: any) {
  return baseCondition;
}

export const registroRouter = createTRPCRouter({
  ...getRouterBasicFunctions({
    baseObject,
    mantenedorSchema,
    paginationObject,
    buildConditions,
  }),
  getAllByExpediente: protectedProcedure
    .input(z.object({ expedienteId: z.number() }))
    .query(async ({ ctx, input }) => {
      const createdUserTable = alias(customUser, "createdUserTable");
      const updatedUserTable = alias(customUser, "updatedUserTable");
      const records = await ctx.db
        .select({
          ...getTableColumns(registrosDeExpediente),
          demandado: expedientes.demandado,
          demandante: expedientes.demandante,
          createdBy: createdUserTable.name,
          updatedBy: updatedUserTable.name,
          expediente: expedientes.expediente,
        })
        .from(registrosDeExpediente)
        .leftJoin(
          expedientes,
          eq(registrosDeExpediente.expedienteId, expedientes.id),
        )
        .leftJoin(
          createdUserTable,
          eq(registrosDeExpediente.createdById, createdUserTable.id),
        )
        .leftJoin(
          updatedUserTable,
          eq(registrosDeExpediente.updatedById, updatedUserTable.id),
        )
        .where(
          and(
            eq(registrosDeExpediente.enable, true),
            eq(registrosDeExpediente.expedienteId, input.expedienteId),
          ),
        )
        .orderBy(desc(registrosDeExpediente.id));
      return records || [];
    }),
  getAllFiltered: protectedProcedure
    .input(z.object(paginationObject))
    .query(async ({ ctx, input }) => {
      const searchTerm = `%${input.search.toLowerCase()}%`;

      const createdUserTable = alias(customUser, "createdUserTable");
      const updatedUserTable = alias(customUser, "updatedUserTable");
      const records = await ctx.db
        .select({
          ...getTableColumns(registrosDeExpediente),
          createdBy: createdUserTable.name,
          updatedBy: updatedUserTable.name,
          expediente: expedientes.expediente,
        })
        .from(registrosDeExpediente)
        .leftJoin(
          expedientes,
          eq(registrosDeExpediente.expedienteId, expedientes.id),
        )
        .leftJoin(
          createdUserTable,
          eq(registrosDeExpediente.createdById, createdUserTable.id),
        )
        .leftJoin(
          updatedUserTable,
          eq(registrosDeExpediente.updatedById, updatedUserTable.id),
        )
        .where(
          and(
            eq(registrosDeExpediente.enable, true),
            or(
              like(registrosDeExpediente.numeroRegistro, searchTerm),
              like(registrosDeExpediente.numeroCuadernoCautelar, searchTerm),
              like(registrosDeExpediente.description, searchTerm),

              like(createdUserTable.name, searchTerm),
              like(updatedUserTable.name, searchTerm),
              like(expedientes.expediente, searchTerm),
            ),
            input.tipoRegistroId
              ? eq(registrosDeExpediente.tipoRegistroId, input.tipoRegistroId)
              : sql`1 = 1`,

            input.tipoActoId
              ? eq(registrosDeExpediente.tipoActoId, input.tipoActoId)
              : sql`1 = 1`,
            /*input.fechaStart && input.fechaEnd
              ? between(
                  registrosDeExpediente.fecha,
                  input.fechaStart,
                  input.fechaEnd,
                )
              : sql`1 = 1`,*/
          ),
        )
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(registrosDeExpediente.id));
      return records || [];
    }),

  // for table
  getPaginated: protectedProcedure
    .input(z.object(paginationObject))
    .query(async ({ ctx, input }) => {
      const searchTerm = `%${input.search.toLowerCase()}%`;

      const createdUserTable = alias(customUser, "createdUserTable");
      const updatedUserTable = alias(customUser, "updatedUserTable");
      const records = await ctx.db
        .select({
          ...getTableColumns(registrosDeExpediente),
          createdBy: createdUserTable.name,
          updatedBy: updatedUserTable.name,
          expediente: expedientes.expediente,
        })
        .from(registrosDeExpediente)
        .leftJoin(
          expedientes,
          eq(registrosDeExpediente.expedienteId, expedientes.id),
        )
        .leftJoin(
          createdUserTable,
          eq(registrosDeExpediente.createdById, createdUserTable.id),
        )
        .leftJoin(
          updatedUserTable,
          eq(registrosDeExpediente.updatedById, updatedUserTable.id),
        )
        .where(
          and(
            eq(registrosDeExpediente.enable, true),
            or(
              like(registrosDeExpediente.numeroRegistro, searchTerm),
              like(registrosDeExpediente.numeroCuadernoCautelar, searchTerm),
              like(registrosDeExpediente.description, searchTerm),

              like(createdUserTable.name, searchTerm),
              like(updatedUserTable.name, searchTerm),
              like(expedientes.expediente, searchTerm),
            ),
            /*input.fechaStart && input.fechaEnd
              ? between(
                  registrosDeExpediente.fecha,
                  input.fechaStart,
                  input.fechaEnd,
                )
              : sql`1 = 1`,*/

            input.tipoRegistroId
              ? eq(registrosDeExpediente.tipoRegistroId, input.tipoRegistroId)
              : sql`1 = 1`,

            input.tipoActoId
              ? eq(registrosDeExpediente.tipoActoId, input.tipoActoId)
              : sql`1 = 1`,
          ),
        )
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(registrosDeExpediente.id));

      const total = await ctx.db
        .select({ count: count() })
        .from(registrosDeExpediente)
        .leftJoin(
          expedientes,
          eq(registrosDeExpediente.expedienteId, expedientes.id),
        )
        .leftJoin(
          createdUserTable,
          eq(registrosDeExpediente.createdById, createdUserTable.id),
        )
        .leftJoin(
          updatedUserTable,
          eq(registrosDeExpediente.updatedById, updatedUserTable.id),
        )
        .where(
          and(
            eq(registrosDeExpediente.enable, true),
            or(
              like(registrosDeExpediente.numeroRegistro, searchTerm),
              like(registrosDeExpediente.numeroCuadernoCautelar, searchTerm),
              like(registrosDeExpediente.description, searchTerm),

              like(createdUserTable.name, searchTerm),
              like(updatedUserTable.name, searchTerm),
            ),
            input.fechaStart && input.fechaEnd
              ? between(
                  registrosDeExpediente.fecha,
                  input.fechaStart,
                  input.fechaEnd,
                )
              : sql`1 = 1`,
            input.expedienteId
              ? eq(registrosDeExpediente.expedienteId, input.expedienteId)
              : sql`1 = 1`,
          ),
        );

      return { records, total };
    }),

  create: protectedProcedure
    .input(z.object(baseObject))
    .mutation(async ({ ctx, input }) => {
      if (input.estadoDelProcesoId) {
        const newInputR: any = {
          updatedAt: new Date(),
          updatedById: Number(ctx.session.user.id),
          estadoDelProcesoId: input.estadoDelProcesoId,
        };
        await ctx.db
          .update(expedientes)
          .set(newInputR)
          .where(eq(expedientes.id, input.expedienteId));
      }

      const newInput: any = {
        ...input,
        createdAt: new Date(),
        createdById: Number(ctx.session.user.id),
        estadoDelProcesoId: undefined,
      };

      return await ctx.db.insert(mantenedorSchema).values(newInput).returning();
    }),

  edit: protectedProcedure
    .input(z.object({ id: z.number(), ...baseObject }))
    .mutation(async ({ ctx, input }) => {
      if (input.estadoDelProcesoId) {
        const newInputR: any = {
          updatedAt: new Date(),
          updatedById: Number(ctx.session.user.id),
          estadoDelProcesoId: input.estadoDelProcesoId,
        };
        await ctx.db
          .update(expedientes)
          .set(newInputR)
          .where(eq(expedientes.id, input.expedienteId));
      }

      const newInput: any = {
        ...input,
        updatedAt: new Date(),
        updatedById: Number(ctx.session.user.id),
        estadoDelProcesoId: undefined,
      };

      await ctx.db
        .update(mantenedorSchema)
        .set({ ...newInput })
        .where(eq(mantenedorSchema.id, input.id));
    }),
});
