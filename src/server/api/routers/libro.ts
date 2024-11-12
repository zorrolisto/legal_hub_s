import { sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter } from "~/server/api/trpc";
import { libros } from "~/server/db/schema";
import { getRouterBasicFunctions } from "../trpc-helper";

const mantenedorSchema = libros;
const baseCondition = sql`${mantenedorSchema.enable} = ${1}`;
const baseObject = {
  nombre: z.string(),
  numero: z.string(),
  editorial: z.string(),
  sumilla: z.string(),
  autores: z.string(),
  ubicacion: z.string(),
  extras: z.string(),
};
const paginationObject = {
  limit: z.number(),
  search: z.string(),
  offset: z.number(),
};
function buildConditions(input: any) {
  const searchCondition =
    input.search.trim() !== ""
      ? sql`(${mantenedorSchema.numero} LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.editorial
        } LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.sumilla
        } LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.autores
        } LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.ubicacion
        } LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.nombre
        } LIKE ${"%" + input.search + "%"} OR ${
          mantenedorSchema.extras
        } LIKE ${"%" + input.search + "%"}) AND `
      : sql``;

  const where = sql`${searchCondition}${baseCondition}`;
  return where;
}

export const libroRouter = createTRPCRouter({
  ...getRouterBasicFunctions({
    baseObject,
    mantenedorSchema,
    paginationObject,
    buildConditions,
  }),
});
