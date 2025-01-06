import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const sharedPrompts = pgTable("shared_prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  model: text("model").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  userId: integer("user_id").references(() => users.id).notNull(),
  promptId: integer("prompt_id").references(() => sharedPrompts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const userRelations = relations(users, ({ many }) => ({
  sharedPrompts: many(sharedPrompts),
  votes: many(votes),
}));

export const sharedPromptsRelations = relations(sharedPrompts, ({ one, many }) => ({
  user: one(users, {
    fields: [sharedPrompts.userId],
    references: [users.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  prompt: one(sharedPrompts, {
    fields: [votes.promptId],
    references: [sharedPrompts.id],
  }),
}));

// Create Zod schemas for type validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertSharedPromptSchema = createInsertSchema(sharedPrompts);
export const selectSharedPromptSchema = createSelectSchema(sharedPrompts);

export const insertVoteSchema = createInsertSchema(votes);
export const selectVoteSchema = createSelectSchema(votes);

// Export types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertSharedPrompt = typeof sharedPrompts.$inferInsert;
export type SelectSharedPrompt = typeof sharedPrompts.$inferSelect;

export type InsertVote = typeof votes.$inferInsert;
export type SelectVote = typeof votes.$inferSelect;