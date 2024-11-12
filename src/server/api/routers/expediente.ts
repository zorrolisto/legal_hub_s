import {
  and,
  between,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  like,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  clientes,
  customUser,
  distritosJudiciales,
  especialidades,
  especialistas,
  estados,
  expedientes,
  instancias,
  organosJurisdiccionales,
} from "~/server/db/schema";
import {
  buildCondition,
  buildLikeCondition,
  getRouterBasicFunctions,
} from "../trpc-helper";

const mantenedorSchema = expedientes;
const baseCondition = sql`${mantenedorSchema.enable} = ${1}`;
const baseObject = {
  instanciaId: z.union([z.number(), z.string()]),
  especialidadId: z.union([z.number(), z.string()]),
  distritoJudicialId: z.union([z.number(), z.string()]),
  organoJurisdiccionalId: z.union([z.number(), z.string()]),
  clienteId: z.union([z.number(), z.string()]),
  estadoDelProcesoId: z.number(),
  fecha: z.date(),
  especialistaId: z.union([z.number(), z.string()]),
  clienteTipoId: z.number(),

  expediente: z.string(),
  linkDrive: z.string(),
  materia: z.string(),
  juez: z.string(),
  demandado: z.union([z.number(), z.string()]),
  demandante: z.union([z.number(), z.string()]),
  extras: z.string(),
};
const paginationObject = {
  limit: z.number(),
  offset: z.number(),

  search: z.string(),
  clienteTipoId: z.number().optional(),
  estadoDelProcesoId: z.number().optional(),

  fechaStart: z.date().optional(),
  fechaEnd: z.date().optional(),
};

function buildConditions(input: any) {
  const searchFields = [
    mantenedorSchema.expediente.name,
    mantenedorSchema.materia.name,
    mantenedorSchema.juez.name,
    mantenedorSchema.demandado.name,
    mantenedorSchema.demandante.name,
    mantenedorSchema.extras.name,
  ];

  const searchCondition =
    input.search.trim() !== ""
      ? sql`(${sql.join(
          searchFields.map((field) => buildLikeCondition(field, input.search)),
          sql` OR `,
        )}) AND `
      : sql``;

  const conditions = [
    buildCondition(mantenedorSchema.fecha, input.fecha),
    buildCondition(mantenedorSchema.clienteTipoId, input.clienteTipoId, true),
    buildCondition(mantenedorSchema.instanciaId, input.instanciaId, true),
    buildCondition(mantenedorSchema.especialidadId, input.especialidadId, true),
    buildCondition(
      mantenedorSchema.distritoJudicialId,
      input.distritoJudicialId,
      true,
    ),
    buildCondition(
      mantenedorSchema.organoJurisdiccionalId,
      input.organoJurisdiccionalId,
      true,
    ),
    buildCondition(
      mantenedorSchema.estadoDelProcesoId,
      input.estadoDelProcesoId,
      true,
    ),
    buildCondition(mantenedorSchema.especialistaId, input.especialistaId, true),
  ];

  // Combine all conditions
  const where = sql`${searchCondition}${sql.join(conditions, sql``)}${baseCondition}`;
  return where;
}

const handleIdField = async (
  ctx: any,
  input: any,
  field: string,
  table: any,
  newInput: any,
) => {
  if (typeof input[field] === "string") {
    const values: any = {
      [field === "clienteId" ? "nombreComercial" : "nombre"]: input[field],
      createdById: Number(ctx.session.user.id),
      extras: "-",
    };
    if (field === "distritoJudicialId") {
      values.colorId = 1;
    }
    if (field === "clienteId") {
      values.documentNumber = "000000000";
      values.documentType = 1;
      values.tipoServicioId = 1;
    }
    const [record] = await ctx.db
      .insert(table)
      .values(values)
      .returning({ id: table.id });
    if (!record) {
      throw new Error(`Error al crear ${field}`);
    }
    newInput[field] = record.id;
  } else {
    newInput[field] = input[field];
  }
};

const processFields = async (ctx: any, input: any, newInput: any) => {
  const fields = [
    { field: "instanciaId", table: instancias },
    { field: "especialidadId", table: especialidades },
    { field: "distritoJudicialId", table: distritosJudiciales },
    { field: "organoJurisdiccionalId", table: organosJurisdiccionales },
    { field: "especialistaId", table: especialistas },
    { field: "clienteId", table: clientes },
    { field: "estadoDelProcesoId", table: estados },
  ];

  for (const { field, table } of fields) {
    await handleIdField(ctx, input, field, table, newInput);
  }
};

export const expedienteRouter = createTRPCRouter({
  ...getRouterBasicFunctions({
    baseObject,
    mantenedorSchema,
    paginationObject,
    buildConditions,
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const records = await ctx.db
        .select({
          ...getTableColumns(expedientes),
          organoJurisdiccional: organosJurisdiccionales.nombre,
          especialidad: especialidades.nombre,
          distritoJudicial: distritosJudiciales.nombre,
          especialista: especialistas.nombre,
          instancia: instancias.nombre,
          estadoDelProceso: estados.nombre,
          colorEstado: estados.color,
          colorDistrito: distritosJudiciales.color,
          createdBy: customUser.name,
        })
        .from(expedientes)
        .leftJoin(
          organosJurisdiccionales,
          eq(expedientes.organoJurisdiccionalId, organosJurisdiccionales.id),
        )
        .leftJoin(
          especialidades,
          eq(expedientes.especialidadId, especialidades.id),
        )
        .leftJoin(
          distritosJudiciales,
          eq(expedientes.distritoJudicialId, distritosJudiciales.id),
        )
        .leftJoin(
          especialistas,
          eq(expedientes.especialistaId, especialistas.id),
        )
        .leftJoin(customUser, eq(expedientes.createdById, customUser.id))
        .leftJoin(clientes, eq(expedientes.clienteId, clientes.id))
        .leftJoin(instancias, eq(expedientes.instanciaId, instancias.id))
        .leftJoin(estados, eq(expedientes.estadoDelProcesoId, estados.id))
        .where(eq(expedientes.id, input.id));
      return (records || [null])[0];
    }),
  getAllFiltered: protectedProcedure
    .input(z.object(paginationObject))
    .query(async ({ ctx, input }) => {
      const searchTerm = `%${input.search.toLowerCase()}%`;

      const records = await ctx.db
        .select({
          ...getTableColumns(expedientes),
          organoJurisdiccional: organosJurisdiccionales.nombre,
          especialidad: especialidades.nombre,
          distritoJudicial: distritosJudiciales.nombre,
          especialista: especialistas.nombre,
          instancia: instancias.nombre,
          estadoDelProceso: estados.nombre,
          colorEstado: estados.color,
          colorDistrito: distritosJudiciales.color,
        })
        .from(expedientes)
        .leftJoin(
          organosJurisdiccionales,
          eq(expedientes.organoJurisdiccionalId, organosJurisdiccionales.id),
        )
        .leftJoin(
          especialidades,
          eq(expedientes.especialidadId, especialidades.id),
        )
        .leftJoin(
          distritosJudiciales,
          eq(expedientes.distritoJudicialId, distritosJudiciales.id),
        )
        .leftJoin(
          especialistas,
          eq(expedientes.especialistaId, especialistas.id),
        )
        .leftJoin(clientes, eq(expedientes.clienteId, clientes.id))
        .leftJoin(instancias, eq(expedientes.instanciaId, instancias.id))
        .leftJoin(estados, eq(expedientes.estadoDelProcesoId, estados.id))
        .where(
          and(
            eq(expedientes.enable, true),
            or(
              like(expedientes.expediente, searchTerm),
              like(expedientes.materia, searchTerm),
              like(expedientes.juez, searchTerm),
              like(expedientes.demandado, searchTerm),
              like(expedientes.demandante, searchTerm),

              like(organosJurisdiccionales.nombre, searchTerm),
              like(distritosJudiciales.nombre, searchTerm),
              like(especialistas.nombre, searchTerm),
              like(instancias.nombre, searchTerm),
              like(estados.nombre, searchTerm),
            ),
            input.fechaStart && input.fechaEnd
              ? between(expedientes.fecha, input.fechaStart, input.fechaEnd)
              : sql`1 = 1`,
            input.clienteTipoId
              ? eq(expedientes.clienteTipoId, input.clienteTipoId)
              : sql`1 = 1`,
          ),
        );
      return records || [];
    }),

  // for table
  getPaginated: protectedProcedure
    .input(z.object(paginationObject))
    .query(async ({ ctx, input }) => {
      const searchTerm = `%${input.search.toLowerCase()}%`;

      const records = await ctx.db
        .select({
          ...getTableColumns(expedientes),
          organoJurisdiccional: organosJurisdiccionales.nombre,
          especialidad: especialidades.nombre,
          distritoJudicial: distritosJudiciales.nombre,
          especialista: especialistas.nombre,
          instancia: instancias.nombre,
          estadoDelProceso: estados.nombre,
          colorEstado: estados.color,
          colorDistrito: distritosJudiciales.color,
        })
        .from(expedientes)
        .leftJoin(
          organosJurisdiccionales,
          eq(expedientes.organoJurisdiccionalId, organosJurisdiccionales.id),
        )
        .leftJoin(
          especialidades,
          eq(expedientes.especialidadId, especialidades.id),
        )
        .leftJoin(
          distritosJudiciales,
          eq(expedientes.distritoJudicialId, distritosJudiciales.id),
        )
        .leftJoin(
          especialistas,
          eq(expedientes.especialistaId, especialistas.id),
        )
        .leftJoin(clientes, eq(expedientes.clienteId, clientes.id))
        .leftJoin(instancias, eq(expedientes.instanciaId, instancias.id))
        .leftJoin(estados, eq(expedientes.estadoDelProcesoId, estados.id))
        .where(
          and(
            eq(expedientes.enable, true),
            or(
              like(expedientes.expediente, searchTerm),
              like(expedientes.materia, searchTerm),
              like(expedientes.juez, searchTerm),
              like(expedientes.demandado, searchTerm),
              like(expedientes.demandante, searchTerm),

              like(organosJurisdiccionales.nombre, searchTerm),
              like(distritosJudiciales.nombre, searchTerm),
              like(especialistas.nombre, searchTerm),
              like(instancias.nombre, searchTerm),
              like(estados.nombre, searchTerm),
            ),
            input.fechaStart && input.fechaEnd
              ? between(expedientes.fecha, input.fechaStart, input.fechaEnd)
              : sql`1 = 1`,
            input.clienteTipoId
              ? eq(expedientes.clienteTipoId, input.clienteTipoId)
              : sql`1 = 1`,
          ),
        )
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(expedientes.id));

      const total = await ctx.db
        .select({ count: count() })
        .from(expedientes)
        .leftJoin(
          organosJurisdiccionales,
          eq(expedientes.organoJurisdiccionalId, organosJurisdiccionales.id),
        )
        .leftJoin(
          especialidades,
          eq(expedientes.especialidadId, especialidades.id),
        )
        .leftJoin(
          distritosJudiciales,
          eq(expedientes.distritoJudicialId, distritosJudiciales.id),
        )
        .leftJoin(
          especialistas,
          eq(expedientes.especialistaId, especialistas.id),
        )
        .leftJoin(clientes, eq(expedientes.clienteId, clientes.id))
        .leftJoin(instancias, eq(expedientes.instanciaId, instancias.id))
        .leftJoin(estados, eq(expedientes.estadoDelProcesoId, estados.id))
        .where(
          and(
            eq(expedientes.enable, true),
            or(
              like(expedientes.expediente, searchTerm),
              like(expedientes.materia, searchTerm),
              like(expedientes.juez, searchTerm),
              like(expedientes.demandado, searchTerm),
              like(expedientes.demandante, searchTerm),

              like(organosJurisdiccionales.nombre, searchTerm),
              like(distritosJudiciales.nombre, searchTerm),
              like(especialistas.nombre, searchTerm),
              like(instancias.nombre, searchTerm),
              like(estados.nombre, searchTerm),
            ),
            input.fechaStart && input.fechaEnd
              ? between(expedientes.fecha, input.fechaStart, input.fechaEnd)
              : sql`1 = 1`,
            input.clienteTipoId
              ? eq(expedientes.clienteTipoId, input.clienteTipoId)
              : sql`1 = 1`,
          ),
        );

      return { records, total };
    }),

  create: protectedProcedure
    .input(z.object(baseObject))
    .mutation(async ({ ctx, input }) => {
      const newInput: any = {
        createdAt: new Date(),
        createdById: Number(ctx.session.user.id),
      };

      await processFields(ctx, input, newInput);

      newInput.expediente = input.expediente;
      newInput.materia = input.materia;
      newInput.juez = input.juez;
      newInput.demandado = input.demandado;
      newInput.demandante = input.demandante;
      newInput.extras = input.extras;
      newInput.clienteTipoId = input.clienteTipoId;
      newInput.fecha = input.fecha;
      newInput.linkDrive = input.linkDrive;

      return await ctx.db.insert(mantenedorSchema).values(newInput).returning();
    }),

  edit: protectedProcedure
    .input(z.object({ id: z.number(), ...baseObject }))
    .mutation(async ({ ctx, input }) => {
      const newInput: any = {
        updatedAt: new Date(),
        updatedById: Number(ctx.session.user.id),
      };

      await processFields(ctx, input, newInput);

      newInput.expediente = input.expediente;
      newInput.materia = input.materia;
      newInput.juez = input.juez;
      newInput.demandado = input.demandado;
      newInput.demandante = input.demandante;
      newInput.extras = input.extras;
      newInput.clienteTipoId = input.clienteTipoId;
      newInput.fecha = input.fecha;
      newInput.linkDrive = input.linkDrive;

      await ctx.db
        .update(mantenedorSchema)
        .set(newInput)
        .where(eq(mantenedorSchema.id, input.id));
    }),
});
