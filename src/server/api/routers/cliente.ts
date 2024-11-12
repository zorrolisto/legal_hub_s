import { sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clientes } from "~/server/db/schema";
import { getRouterBasicFunctions } from "../trpc-helper";

const mantenedorSchema = clientes;
const baseCondition = sql`${mantenedorSchema.enable} = ${1}`;
const baseObject = {
  documentType: z.number(),
  documentNumber: z.string(),
  razonSocial: z.string(),
  nombreComercial: z.string(),
  representanteLegalDni: z.string(),
  representanteLegalNombre: z.string(),
  direccion: z.string(),
  correo: z.string(),
  numero: z.string(),
  tipoServicioId: z.number(),
  extras: z.string(),
};
const paginationObject = {
  limit: z.number(),
  search: z.string(),
  documentType: z.number().optional(),
  tipoServicioId: z.number().optional(),
  offset: z.number(),
};
function buildConditions(input: any) {
  const searchCondition =
    input.search.trim() !== ""
      ? sql`(${mantenedorSchema.razonSocial} LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.nombreComercial
        } LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.representanteLegalDni
        } LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.representanteLegalNombre
        } LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.correo
        } LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.direccion
        } LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.extras
        } LIKE ${"%" + input.search + "%"}) AND `
      : sql``;

  const documentTypeCondition = input.documentType
    ? sql`${mantenedorSchema.documentType} = ${input.documentType} AND `
    : sql``;

  const tipoServicioCondition = input.tipoServicioId
    ? sql`${mantenedorSchema.tipoServicioId} = ${input.tipoServicioId} AND `
    : sql``;

  const where = sql`${searchCondition}${documentTypeCondition}${tipoServicioCondition}${baseCondition}`;
  return where;
}

export const clienteRouter = createTRPCRouter({
  ...getRouterBasicFunctions({
    baseObject,
    mantenedorSchema,
    paginationObject,
    buildConditions,
  }),
  getTenBySearch: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async ({ ctx, input }) => {
      const records = await ctx.db
        .select()
        .from(mantenedorSchema)
        .where(
          sql`
              (nombre_comercial LIKE ${"%" + input.search + "%"} 
              OR representante_legal_nombre LIKE ${"%" + input.search + "%"})
              AND ${mantenedorSchema.enable} = ${1}
            `,
        )
        .limit(10);
      return records || [];
    }),
});
