import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  integer,
  primaryKey,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = sqliteTableCreator((name) => `legal_hub_${name}`);

export const users = createTable("user", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }),
  email: text("email", { length: 255 }).notNull(),
  emailVerified: int("email_verified", {
    mode: "timestamp",
  }).default(sql`(unixepoch())`),
  image: text("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: text("provider", { length: 255 }).notNull(),
    providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: text("token_type", { length: 255 }),
    scope: text("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: text("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: text("session_token", { length: 255 }).notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const customUser = createTable("custom_user", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  enable: integer("enable", { mode: "boolean" }).notNull().default(true),
  extras: text("extras"),
  createdById: int("created_by"),
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedById: int("updated_by"),
  updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
  name: text("name", { length: 255 }),
  mail: text("mail", { length: 255 }),
  nroDocumento: text("nro_documento", { length: 50 }),
});

const baseSchema = {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  enable: integer("enable", { mode: "boolean" }).notNull().default(true),
  extras: text("extras"),
  createdById: int("created_by")
    .notNull()
    .references(() => customUser.id),
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedById: int("updated_by").references(() => customUser.id),
  updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
};
const nombreSchema = { nombre: text("nombre", { length: 255 }), ...baseSchema };

// ----------------------------------------
// BEGIN Our custom schema
// ----------------------------------------

export const libros = createTable("libro", {
  numero: text("numero", { length: 255 }),
  nombre: text("nombre", { length: 255 }),
  editorial: text("editorial", { length: 255 }),
  sumilla: text("sumilla", { length: 255 }),
  autores: text("autores", { length: 255 }),
  ubicacion: text("ubicacion", { length: 255 }),
  ...baseSchema,
});

export const organosJurisdiccionales = createTable(
  "organo_jurisdiccional",
  nombreSchema,
);
export const instancias = createTable("instancia", nombreSchema);
export const especialidades = createTable("especialidad", nombreSchema);

// ---- NUEVO
export const estados = createTable("estado", {
  ...nombreSchema,
  color: text("color", { length: 100 }).default("#FFFFFF"),
});
// ---- FIN NUEVO

export const distritosJudiciales = createTable("distrito_judicial", {
  color: text("color", { length: 100 }).default("#FFFFFF"),
  ...nombreSchema,
});
export const especialistas = createTable("especialista", {
  numero: text("numero", { length: 255 }),
  correo: text("correo", { length: 255 }),
  ...nombreSchema,
});
export const clientes = createTable("cliente", {
  documentType: int("document_type"),
  documentNumber: text("document_number", { length: 255 }),
  razonSocial: text("razon_social", { length: 255 }),
  nombreComercial: text("nombre_comercial", { length: 255 }),
  representanteLegalDni: text("representante_legal_dni", { length: 255 }),
  representanteLegalNombre: text("representante_legal_nombre", { length: 255 }),
  direccion: text("direccion", { length: 255 }),
  numero: text("numero", { length: 255 }).default(""),
  correo: text("correo", { length: 255 }),
  tipoServicioId: int("tipo_servicio_id"),
  ...baseSchema,
});
export const expedientes = createTable("expediente", {
  expediente: text("expediente", { length: 255 }),
  instanciaId: int("instancia_id")
    .notNull()
    .references(() => instancias.id),
  especialidadId: int("especialidad_id")
    .notNull()
    .references(() => especialidades.id),
  distritoJudicialId: int("distrito_judicial_id")
    .notNull()
    .references(() => distritosJudiciales.id),
  organoJurisdiccionalId: int("organo_jurisdiccional_id")
    .notNull()
    .references(() => organosJurisdiccionales.id),
  materia: text("materia", { length: 255 }),
  juez: text("juez", { length: 255 }),
  especialistaId: int("especialista_id")
    .notNull()
    .references(() => especialistas.id),
  demandado: text("demandado", { length: 255 }),
  demandante: text("demandante", { length: 255 }),
  estadoDelProcesoId: int("estado_proceso_id"),
  clienteTipoId: int("cliente_tipo_id"),

  clienteId: int("cliente_id")
    .notNull()
    .references(() => clientes.id),

  fecha: int("fecha", { mode: "timestamp" }),

  linkDrive: text("link_drive", { length: 255 }).$defaultFn(() => ""),

  ...baseSchema,
});
export const registrosDeExpediente = createTable("registro_expediente", {
  tipoRegistroId: int("tipo_registro_id"),
  numeroRegistro: text("numero_registro", { length: 255 }),

  fechaRegistro: int("fecha_registro", { mode: "timestamp" }),
  fechaNotificacion: int("fecha_notificacion", { mode: "timestamp" }),
  tipoActoId: int("tipo_acto_id"),
  fecha: int("fecha", { mode: "timestamp" }),
  hora: text("hora", { length: 16 }),

  numeroCuadernoCautelar: text("numero_cuaderno_cautelar"),
  link: text("link"),
  linkDrive: text("link_drive"),

  description: text("description"),
  expedienteId: int("expediente_id")
    .notNull()
    .references(() => expedientes.id),

  ...baseSchema,
});

export const usersExpedientes = createTable("user_expediente", {
  userId: int("custom_user_id")
    .notNull()
    .references(() => customUser.id),
  expedienteId: int("expediente_id")
    .notNull()
    .references(() => expedientes.id),
});
