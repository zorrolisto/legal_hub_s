import exp from "constants";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { custom, z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { expedientes, customUser, usersExpedientes } from "~/server/db/schema";

export const baseCondition = sql`${customUser.enable} = ${1}`;

function buildConditions(input: any) {
  const searchCondition =
    input.search.trim() !== ""
      ? sql`(${customUser.nroDocumento} LIKE ${"%" + input.search + "%"} OR ${
          customUser.mail
        } LIKE ${"%" + input.search + "%"} OR ${
          customUser.name
        } LIKE ${"%" + input.search + "%"} OR ${
          customUser.extras
        } LIKE ${"%" + input.search + "%"}) AND `
      : sql``;

  const where = sql`${searchCondition}${baseCondition}`;
  return where;
}

export const customUserRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        nroDocumento: z.string(),
        mail: z.string(),
        extras: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(customUser).values({
        name: input.name,
        nroDocumento: input.nroDocumento,
        mail: input.mail,
        extras: input.extras,
        createdById: Number(ctx.session.user.id),
      });
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        nroDocumento: z.string(),
        mail: z.string(),
        extras: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(customUser)
        .set({
          name: input.name,
          nroDocumento: input.nroDocumento,
          mail: input.mail,
          extras: input.extras,
        })
        .where(eq(customUser.id, input.id));
    }),
  addUserExpediente: protectedProcedure
    .input(z.object({ expedienteId: z.number(), userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(usersExpedientes).values({
        expedienteId: input.expedienteId,
        userId: input.userId,
      });
    }),
  deleteUserExpediente: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(usersExpedientes)
        .where(eq(usersExpedientes.userId, input.userId));
    }),
  getExpedienteByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const expedientesFromUsers = await ctx.db
        .select()
        .from(usersExpedientes)
        .where(eq(usersExpedientes.userId, input.userId));

      return (expedientesFromUsers || [null])[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(customUser)
        .set({
          enable: false,
        })
        .where(eq(customUser.id, input.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.select().from(customUser);
    return users || [];
  }),

  // for excel export
  getAllFiltered: protectedProcedure
    .input(
      z.object({
        search: z.string(),
        limit: z.number(),
        offset: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = buildConditions(input);

      const users = await ctx.db.select().from(customUser).where(where);

      const expedientesFromUsers = await ctx.db
        .select({
          expedienteId: usersExpedientes.expedienteId,
          userId: usersExpedientes.userId,
          expediente: expedientes.expediente,
        })
        .from(usersExpedientes)
        .where(
          inArray(
            usersExpedientes.userId,
            users.map((u) => u.id),
          ),
        )
        .leftJoin(
          expedientes,
          eq(usersExpedientes.expedienteId, expedientes.id),
        );

      const records = users.map((user) => {
        const expedientes = expedientesFromUsers.filter(
          (expediente) => expediente.userId === user.id,
        );
        return { ...user, expedientes };
      });
      return records || [];
    }),

  // for table
  getPaginated: protectedProcedure
    .input(
      z.object({
        search: z.string(),
        limit: z.number(),
        offset: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = buildConditions(input);

      const users = await ctx.db
        .select()
        .from(customUser)
        .where(where)
        .orderBy(desc(customUser.id))
        .limit(input.limit)
        .offset(input.offset);

      const expedientesFromUsers = await ctx.db
        .select({
          expedienteId: usersExpedientes.expedienteId,
          userId: usersExpedientes.userId,
          expediente: expedientes.expediente,
        })
        .from(usersExpedientes)
        .where(
          inArray(
            usersExpedientes.userId,
            users.map((u) => u.id),
          ),
        )
        .leftJoin(
          expedientes,
          eq(usersExpedientes.expedienteId, expedientes.id),
        );

      const total = await ctx.db
        .select({ count: count() })
        .from(customUser)
        .where(where);

      const records = users.map((user) => {
        const expedientes = expedientesFromUsers.filter(
          (expediente) => expediente.userId === user.id,
        );
        return { ...user, expedientes };
      });

      return { records, total };
    }),
});
