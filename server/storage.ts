import { 
  users, type User, type InsertUser,
  telegramAccounts, type TelegramAccount, type InsertTelegramAccount,
  proxies, type Proxy, type InsertProxy,
  tasks, type Task, type InsertTask,
  contacts, type Contact, type InsertContact,
  activityLogs, type ActivityLog, type InsertActivityLog
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Telegram account operations
  getTelegramAccounts(userId: number): Promise<TelegramAccount[]>;
  getTelegramAccount(id: number): Promise<TelegramAccount | undefined>;
  createTelegramAccount(account: InsertTelegramAccount): Promise<TelegramAccount>;
  updateTelegramAccount(id: number, update: Partial<TelegramAccount>): Promise<TelegramAccount | undefined>;
  deleteTelegramAccount(id: number): Promise<boolean>;

  // Proxy operations
  getProxies(userId: number): Promise<Proxy[]>;
  getProxy(id: number): Promise<Proxy | undefined>;
  createProxy(proxy: InsertProxy): Promise<Proxy>;
  updateProxy(id: number, update: Partial<Proxy>): Promise<Proxy | undefined>;
  deleteProxy(id: number): Promise<boolean>;

  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, update: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Contact operations
  getContacts(userId: number, filter?: { isBlacklisted?: boolean, isWhitelisted?: boolean }): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, update: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;

  // Activity log operations
  getActivityLogs(userId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private telegramAccounts: Map<number, TelegramAccount>;
  private proxies: Map<number, Proxy>;
  private tasks: Map<number, Task>;
  private contacts: Map<number, Contact>;
  private activityLogs: Map<number, ActivityLog>;
  
  // Current auto-increment IDs
  private currentUserId: number;
  private currentTelegramAccountId: number;
  private currentProxyId: number;
  private currentTaskId: number;
  private currentContactId: number;
  private currentActivityLogId: number;

  constructor() {
    this.users = new Map();
    this.telegramAccounts = new Map();
    this.proxies = new Map();
    this.tasks = new Map();
    this.contacts = new Map();
    this.activityLogs = new Map();
    
    this.currentUserId = 1;
    this.currentTelegramAccountId = 1;
    this.currentProxyId = 1;
    this.currentTaskId = 1;
    this.currentContactId = 1;
    this.currentActivityLogId = 1;

    // Add a default user for testing
    this.createUser({
      username: "admin",
      password: "password123"
    });
    
    // Add sample telegram accounts
    this.createTelegramAccount({
      phoneNumber: "+1234567890",
      apiId: "12345",
      apiHash: "abcdef1234567890",
      userId: 1
    });
    
    // Add sample proxies
    this.createProxy({
      host: "proxy.example.com",
      port: 8080,
      username: "proxyuser",
      password: "proxypass",
      type: "socks5",
      userId: 1
    });
    
    // Add sample tasks
    this.createTask({
      name: "Add Members",
      type: "add_members",
      config: {
        source: "Crypto Signals Group",
        target: "My Crypto Group",
        accountIds: [1],
        delay: { min: 30, max: 60 }
      },
      userId: 1
    });
    
    this.createTask({
      name: "Group Posting",
      type: "group_posting",
      config: {
        message: "Check out our new project!",
        groups: ["Group1", "Group2", "Group3"],
        accountIds: [1],
        delay: { min: 60, max: 120 }
      },
      userId: 1
    });
    
    this.createTask({
      name: "Scrape Members",
      type: "scrape_members",
      config: {
        source: "AI Developers Hub",
        accountIds: [1],
        saveContacts: true
      },
      userId: 1
    });
    
    // Set task statuses
    this.updateTask(1, { status: "running", progress: 70 });
    this.updateTask(2, { status: "running", progress: 45 });
    this.updateTask(3, { status: "paused", progress: 28 });
    
    // Add sample activity logs
    this.createActivityLog({
      activity: "Added 15 members",
      details: "To Crypto Signals Group",
      userId: 1
    });
    
    this.createActivityLog({
      activity: "Account limited",
      details: "+1 555-123-4567",
      userId: 1
    });
    
    this.createActivityLog({
      activity: "Sent 85 messages",
      details: "Online users",
      userId: 1
    });
    
    this.createActivityLog({
      activity: "Scraped 230 members",
      details: "From Tech Enthusiasts Group",
      userId: 1
    });
    
    this.createActivityLog({
      activity: "Updated proxy list",
      details: "Added 12 new proxies",
      userId: 1
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Telegram account operations
  async getTelegramAccounts(userId: number): Promise<TelegramAccount[]> {
    return Array.from(this.telegramAccounts.values()).filter(
      (account) => account.userId === userId
    );
  }

  async getTelegramAccount(id: number): Promise<TelegramAccount | undefined> {
    return this.telegramAccounts.get(id);
  }

  async createTelegramAccount(insertAccount: InsertTelegramAccount): Promise<TelegramAccount> {
    const id = this.currentTelegramAccountId++;
    const now = new Date();
    const account: TelegramAccount = { 
      ...insertAccount, 
      id, 
      isActive: true,
      status: "available",
      sessionString: "",
      botToken: null,
      lastUsed: now,
      createdAt: now
    };
    this.telegramAccounts.set(id, account);
    return account;
  }

  async updateTelegramAccount(id: number, update: Partial<TelegramAccount>): Promise<TelegramAccount | undefined> {
    const account = this.telegramAccounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...update };
    this.telegramAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteTelegramAccount(id: number): Promise<boolean> {
    return this.telegramAccounts.delete(id);
  }

  // Proxy operations
  async getProxies(userId: number): Promise<Proxy[]> {
    return Array.from(this.proxies.values()).filter(
      (proxy) => proxy.userId === userId
    );
  }

  async getProxy(id: number): Promise<Proxy | undefined> {
    return this.proxies.get(id);
  }

  async createProxy(insertProxy: InsertProxy): Promise<Proxy> {
    const id = this.currentProxyId++;
    const now = new Date();
    const proxy: Proxy = { 
      id,
      host: insertProxy.host,
      port: insertProxy.port,
      username: insertProxy.username || null,
      password: insertProxy.password || null,
      type: insertProxy.type,
      userId: insertProxy.userId,
      isActive: true,
      status: "unchecked",
      lastChecked: now
    };
    this.proxies.set(id, proxy);
    return proxy;
  }

  async updateProxy(id: number, update: Partial<Proxy>): Promise<Proxy | undefined> {
    const proxy = this.proxies.get(id);
    if (!proxy) return undefined;
    
    const updatedProxy = { ...proxy, ...update };
    this.proxies.set(id, updatedProxy);
    return updatedProxy;
  }

  async deleteProxy(id: number): Promise<boolean> {
    return this.proxies.delete(id);
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    const task: Task = { 
      ...insertTask, 
      id, 
      status: "pending",
      progress: 0,
      startTime: null,
      endTime: null,
      createdAt: now
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, update: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...update };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Contact operations
  async getContacts(userId: number, filter?: { isBlacklisted?: boolean, isWhitelisted?: boolean }): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(contact => {
      if (contact.userId !== userId) return false;
      
      if (filter) {
        if (filter.isBlacklisted !== undefined && contact.isBlacklisted !== filter.isBlacklisted) return false;
        if (filter.isWhitelisted !== undefined && contact.isWhitelisted !== filter.isWhitelisted) return false;
      }
      
      return true;
    });
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const now = new Date();
    const contact: Contact = { 
      id,
      telegramId: insertContact.telegramId || null,
      username: insertContact.username || null,
      firstName: insertContact.firstName || null,
      lastName: insertContact.lastName || null,
      phone: insertContact.phone || null,
      groupSource: insertContact.groupSource || null,
      userId: insertContact.userId,
      isBlacklisted: false,
      isWhitelisted: false,
      createdAt: now
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: number, update: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact = { ...contact, ...update };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Activity log operations
  async getActivityLogs(userId: number, limit?: number): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => {
        const timeA = a.timestamp ? a.timestamp.getTime() : 0;
        const timeB = b.timestamp ? b.timestamp.getTime() : 0;
        return timeB - timeA;
      });
    
    return limit ? logs.slice(0, limit) : logs;
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentActivityLogId++;
    const now = new Date();
    const log: ActivityLog = { 
      id,
      userId: insertLog.userId,
      activity: insertLog.activity,
      taskId: insertLog.taskId || null,
      details: insertLog.details || null,
      timestamp: now
    };
    this.activityLogs.set(id, log);
    return log;
  }
}

// Import the DatabaseStorage implementation
import { DatabaseStorage } from "./database-storage";

// Decide which storage to use based on environment
const useDatabase = process.env.DATABASE_URL !== undefined;

// Create the appropriate storage instance
export const storage = useDatabase 
  ? new DatabaseStorage() 
  : new MemStorage();
