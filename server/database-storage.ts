import { 
  User, InsertUser, 
  TelegramAccount, InsertTelegramAccount, 
  Proxy, InsertProxy, 
  Task, InsertTask, 
  Contact, InsertContact, 
  ActivityLog, InsertActivityLog,
  users, telegramAccounts, proxies, tasks, contacts, activityLogs
} from "@shared/schema";
import { db } from "./db";
import { IStorage } from "./storage";
import { eq, and, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Telegram account operations
  async getTelegramAccounts(userId: number): Promise<TelegramAccount[]> {
    return db.select()
      .from(telegramAccounts)
      .where(eq(telegramAccounts.userId, userId));
  }

  async getTelegramAccount(id: number): Promise<TelegramAccount | undefined> {
    const [account] = await db.select()
      .from(telegramAccounts)
      .where(eq(telegramAccounts.id, id));
    return account || undefined;
  }

  async createTelegramAccount(insertAccount: InsertTelegramAccount): Promise<TelegramAccount> {
    // Set default values
    const data = {
      ...insertAccount,
      sessionString: "",
      isActive: true,
      status: "available",
      botToken: null,
      lastUsed: new Date(),
      createdAt: new Date()
    };

    const [account] = await db
      .insert(telegramAccounts)
      .values(data)
      .returning();
    return account;
  }

  async updateTelegramAccount(id: number, update: Partial<TelegramAccount>): Promise<TelegramAccount | undefined> {
    const [updated] = await db
      .update(telegramAccounts)
      .set(update)
      .where(eq(telegramAccounts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTelegramAccount(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(telegramAccounts)
      .where(eq(telegramAccounts.id, id))
      .returning();
    return !!deleted;
  }

  // Proxy operations
  async getProxies(userId: number): Promise<Proxy[]> {
    return db.select()
      .from(proxies)
      .where(eq(proxies.userId, userId));
  }

  async getProxy(id: number): Promise<Proxy | undefined> {
    const [proxy] = await db.select()
      .from(proxies)
      .where(eq(proxies.id, id));
    return proxy || undefined;
  }

  async createProxy(insertProxy: InsertProxy): Promise<Proxy> {
    // Set default values
    const data = {
      ...insertProxy,
      isActive: true,
      status: "unchecked",
      lastChecked: new Date()
    };

    const [proxy] = await db
      .insert(proxies)
      .values(data)
      .returning();
    return proxy;
  }

  async updateProxy(id: number, update: Partial<Proxy>): Promise<Proxy | undefined> {
    const [updated] = await db
      .update(proxies)
      .set(update)
      .where(eq(proxies.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProxy(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(proxies)
      .where(eq(proxies.id, id))
      .returning();
    return !!deleted;
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return db.select()
      .from(tasks)
      .where(eq(tasks.userId, userId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select()
      .from(tasks)
      .where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    // Set default values
    const data = {
      ...insertTask,
      status: "pending",
      progress: 0,
      startTime: null,
      endTime: null,
      createdAt: new Date()
    };

    const [task] = await db
      .insert(tasks)
      .values(data)
      .returning();
    return task;
  }

  async updateTask(id: number, update: Partial<Task>): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set(update)
      .where(eq(tasks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    return !!deleted;
  }

  // Contact operations
  async getContacts(userId: number, filter?: { isBlacklisted?: boolean, isWhitelisted?: boolean }): Promise<Contact[]> {
    let conditions = [eq(contacts.userId, userId)];
    
    // Apply filters if provided
    if (filter) {
      if (filter.isBlacklisted !== undefined) {
        conditions.push(eq(contacts.isBlacklisted, filter.isBlacklisted));
      }
      if (filter.isWhitelisted !== undefined) {
        conditions.push(eq(contacts.isWhitelisted, filter.isWhitelisted));
      }
    }
    
    return db.select().from(contacts).where(and(...conditions));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select()
      .from(contacts)
      .where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    // Set default values
    const data = {
      ...insertContact,
      isBlacklisted: false,
      isWhitelisted: false,
      createdAt: new Date()
    };

    const [contact] = await db
      .insert(contacts)
      .values(data)
      .returning();
    return contact;
  }

  async updateContact(id: number, update: Partial<Contact>): Promise<Contact | undefined> {
    const [updated] = await db
      .update(contacts)
      .set(update)
      .where(eq(contacts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteContact(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning();
    return !!deleted;
  }

  // Activity log operations
  async getActivityLogs(userId: number, limit?: number): Promise<ActivityLog[]> {
    const baseQuery = db.select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.timestamp));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    // Set default values
    const data = {
      ...insertLog,
      timestamp: new Date()
    };

    const [log] = await db
      .insert(activityLogs)
      .values(data)
      .returning();
    return log;
  }
}