import { sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter } from "~/server/api/trpc";
import { especialistas } from "~/server/db/schema";
import { getRouterBasicFunctions } from "../trpc-helper";

const mantenedorSchema = especialistas;
const baseCondition = sql`${mantenedorSchema.enable} = ${1}`;
const baseObject = {
  nombre: z.string(),
  numero: z.string(),
  correo: z.string(),
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
      ? sql`(${mantenedorSchema.numero} LIKE ${"%" + input.search + "%"} OR ${mantenedorSchema.correo} LIKE ${"%" + input.search + "%"} OR ${mantenedorSchema.nombre} LIKE ${"%" + input.search + "%"} OR ${mantenedorSchema.extras} LIKE ${"%" + input.search + "%"}) AND `
      : sql``;

  const where = sql`${searchCondition}${baseCondition}`;
  return where;
}

export const especialistaRouter = createTRPCRouter({
  ...getRouterBasicFunctions({
    baseObject,
    mantenedorSchema,
    paginationObject,
    buildConditions,
  }),
});
