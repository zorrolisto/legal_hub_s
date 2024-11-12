import { sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter } from "~/server/api/trpc";
import { organosJurisdiccionales } from "~/server/db/schema";
import { getRouterBasicFunctions } from "../trpc-helper";

const mantenedorSchema = organosJurisdiccionales;
const baseCondition = sql`${mantenedorSchema.enable} = ${1}`;
const baseObject = {
  nombre: z.string(),
  extras: z.string(),
};
const paginationObject = {
  limit: z.number(),
  search: z.string(),
  offset: z.number(),
};
const inputValues = (input: any) => ({
  nombre: input.nombre,
  extras: input.extras,
});

function buildConditions(input: any) {
  const searchCondition =
    input.search.trim() !== ""
      ? sql`(${mantenedorSchema.nombre} LIKE ${"%" + input.search + "%"} OR ${mantenedorSchema.extras} LIKE ${"%" + input.search + "%"}) AND `
      : sql``;

  const where = sql`${searchCondition}${baseCondition}`;
  return where;
}

export const organoJurisdiccionalRouter = createTRPCRouter({
  ...getRouterBasicFunctions({
    baseObject,
    mantenedorSchema,
    inputValues,
    paginationObject,
    buildConditions,
  }),
});
