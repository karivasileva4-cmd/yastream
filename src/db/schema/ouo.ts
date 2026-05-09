import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { providerContent } from "./provider_content.js";
export const ouo = sqliteTable("ouo", {
  id: text("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  redirectedUrl: text("redirected_url"),
  createdAt: integer("created_at").notNull(),
});

export const ouoRelations = relations(ouo, ({ one }) => ({
  providerContent: one(providerContent),
}));

export type EOuo = typeof ouo.$inferSelect;
export type EOuoInsert = typeof ouo.$inferInsert;
