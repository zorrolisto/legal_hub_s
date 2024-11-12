import { count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { especialidades } from "~/server/db/schema";

export const especialidadRouter = createTRPCRouter({
  /*create: protectedProcedure
    .input(z.object({ nombre: z.string(), extras: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(especialidades).values({
        nombre: input.nombre,
        extras: input.extras,
        createdById: ctx.session.user.id,
      });
    }),*/
  edit: protectedProcedure
    .input(z.object({ id: z.number(), nombre: z.string(), extras: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(especialidades)
        .set({
          nombre: input.nombre,
          extras: input.extras,
        })
        .where(eq(especialidades.id, input.id));
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(especialidades)
        .set({
          enable: false,
        })
        .where(eq(especialidades.id, input.id));
    }),

  getAllFiltered: protectedProcedure
    .input(
      z.object({ limit: z.number(), search: z.string(), offset: z.number() }),
    )
    .query(async ({ ctx, input }) => {
      if (input.search === "") {
        const records = await ctx.db
          .select()
          .from(especialidades)
          .where(sql`${especialidades.enable} = ${1}`);
        return records || [];
      }
      const records = await ctx.db
        .select()
        .from(especialidades)
        .where(
          sql`${especialidades.nombre} LIKE ${"%" + input.search + "%"} or ${especialidades.extras} LIKE ${"%" + input.search + "%"} and ${especialidades.enable} = ${1}`,
        );
      return records || [];
    }),

  getPaginated: protectedProcedure
    .input(
      z.object({ limit: z.number(), search: z.string(), offset: z.number() }),
    )
    .query(async ({ ctx, input }) => {
      if (input.search === "") {
        const records = await ctx.db
          .select()
          .from(especialidades)
          .where(sql`${especialidades.enable} = ${1}`)
          .orderBy(desc(especialidades.id))
          .limit(input.limit)
          .offset(input.offset);
        const total = await ctx.db
          .select({ count: count() })
          .from(especialidades)
          .where(sql`${especialidades.enable} = ${1}`);
        return { records, total };
      }
      const records = await ctx.db
        .select()
        .from(especialidades)
        .where(
          sql`${especialidades.nombre} LIKE ${"%" + input.search + "%"} or ${especialidades.extras} LIKE ${"%" + input.search + "%"} and ${especialidades.enable} = ${1}`,
        )
        .orderBy(desc(especialidades.id))
        .limit(input.limit)
        .offset(input.offset);
      const total = await ctx.db
        .select({ count: count() })
        .from(especialidades)
        .where(
          sql`${especialidades.nombre} LIKE ${"%" + input.search + "%"} or ${especialidades.extras} LIKE ${"%" + input.search + "%"} and ${especialidades.enable} = ${1}`,
        );

      return { records, total };
    }),
});
