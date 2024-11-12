import { count, desc, eq, getTableName, sql } from "drizzle-orm";
import { protectedProcedure } from "./trpc";
import { z } from "zod";
import { baseCondition } from "./routers/instancia";

export const getRouterBasicFunctions = ({
  baseObject,
  mantenedorSchema,
  paginationObject,
  buildConditions,
}: any) => {
  return {
    create: protectedProcedure
      .input(z.object(baseObject))
      .mutation(async ({ ctx, input }) => {
        await ctx.db.insert(mantenedorSchema).values({
          ...input,
          createdAt: new Date(),
          createdById: Number(ctx.session.user.id),
        });
      }),
    edit: protectedProcedure
      .input(z.object({ id: z.number(), ...baseObject }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .update(mantenedorSchema)
          .set({
            ...input,
            updatedAt: new Date(),
            updatedById: Number(ctx.session.user.id),
          })
          .where(eq(mantenedorSchema.id, input.id));
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .update(mantenedorSchema)
          .set({ enable: false })
          .where(eq(mantenedorSchema.id, input.id));
      }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      return await ctx.db.select().from(mantenedorSchema);
    }),
    // get 10 by search
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const records = await ctx.db
          .select()
          .from(mantenedorSchema)
          .where(eq(mantenedorSchema.id, input.id));
        return (records || [null])[0];
      }),

    // get 10 by search
    getTenBySearch: protectedProcedure
      .input(z.object({ search: z.string() }))
      .query(async ({ ctx, input }) => {
        const tableName = getTableName(mantenedorSchema);
        const records =
          tableName === "legal_hub_expediente"
            ? await ctx.db
                .select()
                .from(mantenedorSchema)
                .where(
                  sql`expediente LIKE ${"%" + input.search + "%"} AND ${mantenedorSchema.enable} = ${1}`,
                )
                .limit(10)
            : await ctx.db
                .select()
                .from(mantenedorSchema)
                .where(
                  sql`nombre LIKE ${"%" + input.search + "%"} AND ${mantenedorSchema.enable} = ${1}`,
                )
                .limit(10);
        return records || [];
      }),

    // for excel export
    getAllFiltered: protectedProcedure
      .input(z.object(paginationObject))
      .query(async ({ ctx, input }) => {
        const where = buildConditions(input);

        const records = await ctx.db
          .select()
          .from(mantenedorSchema)
          .where(where);
        return records || [];
      }),

    // for table
    getPaginated: protectedProcedure
      .input(z.object(paginationObject))
      .query(async ({ ctx, input }) => {
        const where = buildConditions(input);

        const records = await ctx.db
          .select()
          .from(mantenedorSchema)
          .where(where)
          .orderBy(desc(mantenedorSchema.id))
          .limit(input.limit)
          .offset(input.offset);

        const total = await ctx.db
          .select({ count: count() })
          .from(mantenedorSchema)
          .where(where);

        return { records, total };
      }),
  };
};

export const buildLikeCondition = (field: string, search: string) => {
  return sql`${field} LIKE ${"%" + search + "%"}`;
};

export const buildCondition = (
  field: any,
  value: any,
  isNumber: boolean = false,
) => {
  if (value) {
    return isNumber
      ? sql`${field} = ${Number(value)} AND `
      : sql`${field} = ${value} AND `;
  }
  return sql``;
};
