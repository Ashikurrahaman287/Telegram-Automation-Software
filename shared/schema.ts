import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User accounts for the application
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Telegram accounts used for automation
export const telegramAccounts = pgTable("telegram_accounts", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  apiId: text("api_id").notNull(),
  apiHash: text("api_hash").notNull(),
  sessionString: text("session_string"),
  botToken: text("bot_token"), // Optional bot token for Bot API
  isActive: boolean("is_active").default(true),
  status: text("status").default("available"),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").notNull(), // Reference to users table
});

export const insertTelegramAccountSchema = createInsertSchema(telegramAccounts).omit({
  id: true,
  sessionString: true,
  isActive: true,
  status: true,
  lastUsed: true,
  createdAt: true,
});

export type InsertTelegramAccount = z.infer<typeof insertTelegramAccountSchema>;
export type TelegramAccount = typeof telegramAccounts.$inferSelect;

// Proxies for telegram accounts
export const proxies = pgTable("proxies", {
  id: serial("id").primaryKey(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  username: text("username"),
  password: text("password"),
  type: text("type").notNull(), // socks5, http, etc.
  isActive: boolean("is_active").default(true),
  lastChecked: timestamp("last_checked"),
  status: text("status").default("unchecked"), // working, slow, dead
  userId: integer("user_id").notNull(), // Reference to users table
});

export const insertProxySchema = createInsertSchema(proxies).omit({
  id: true,
  isActive: true,
  lastChecked: true,
  status: true,
});

export type InsertProxy = z.infer<typeof insertProxySchema>;
export type Proxy = typeof proxies.$inferSelect;

// Configuration for automation tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // scrape_members, add_members, auto_message, etc.
  status: text("status").default("pending"), // pending, running, paused, completed, failed
  progress: integer("progress").default(0),
  config: json("config").notNull(), // Task specific config
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").notNull(), // Reference to users table
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  status: true,
  progress: true,
  startTime: true,
  endTime: true,
  createdAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Contacts scraped from Telegram groups
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id"),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  groupSource: text("group_source"),
  isBlacklisted: boolean("is_blacklisted").default(false),
  isWhitelisted: boolean("is_whitelisted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").notNull(), // Reference to users table
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  isBlacklisted: true,
  isWhitelisted: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Task activity logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id"), // Can be null for system activities
  activity: text("activity").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow(),
  userId: integer("user_id").notNull(), // Reference to users table
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
