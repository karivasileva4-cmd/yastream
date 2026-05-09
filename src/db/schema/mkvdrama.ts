import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ouo } from "./ouo.js";
import { providerContent } from "./provider_content.js";
export const mkvdrama = sqliteTable("mkvdrama", {
  id: text("id").primaryKey(),
  providerContentId: text("provider_content_id")
    .notNull()
    .references(() => providerContent.id),
  ouoId: text("ouo_id")
    .unique()
    .references(() => ouo.id),
  resolution: text("resolution").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at"),
  ttl: integer("ttl"),
});

export const mkvdramaRelations = relations(mkvdrama, ({ one }) => ({
  providerContent: one(providerContent),
  ouo: one(ouo),
}));

export type EMkvdrama = typeof mkvdrama.$inferSelect;
export type EMkvdramaInsert = typeof mkvdrama.$inferInsert;
