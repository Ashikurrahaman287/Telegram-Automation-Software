import { TelegramAccount, Proxy } from "@shared/schema";
import { Telegraf } from "telegraf";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import * as fs from 'fs';
import * as path from 'path';

// Random delay utility function
function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Interfaces for Telegram client configuration and operations
interface TelegramClientConfig {
  account: TelegramAccount;
  proxy?: Proxy;
}

interface ScrapeMembersOptions {
  groupUsername: string;
  limit?: number;
}

interface AddMembersOptions {
  groupId: string;
  userIds: string[];
  delay: { min: number; max: number };
}

interface SendMessageOptions {
  users: string[];
  message: string;
  delay: { min: number; max: number };
}

interface UploadAvatarOptions {
  avatarPath: string;
}

interface SearchUsersOptions {
  query: string;
  limit?: number;
}

interface PostToGroupOptions {
  groups: string[];
  message: string;
  delay: { min: number; max: number };
}

// Main interface for Telegram client operations
export interface TelegramClientInterface {
  initialize(): Promise<boolean>;
  checkLoginStatus(): Promise<{ loggedIn: boolean; error?: string }>;
  scrapeMembers(options: ScrapeMembersOptions): Promise<any[]>;
  addMembers(options: AddMembersOptions): Promise<{ added: number; errors: number }>;
  sendMessages(options: SendMessageOptions): Promise<{ sent: number; errors: number }>;
  uploadAvatar(options: UploadAvatarOptions): Promise<boolean>;
  searchUsers(options: SearchUsersOptions): Promise<any[]>;
  postToGroups(options: PostToGroupOptions): Promise<{ success: number; errors: number }>;
}

// Real implementation of Telegram client using Telegram API libraries
export class RealTelegramClient implements TelegramClientInterface {
  private config: TelegramClientConfig;
  private client: TelegramClient | null = null;
  private bot: Telegraf | null = null;
  private isInitialized: boolean = false;
  
  constructor(config: TelegramClientConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<boolean> {
    try {
      const { apiId, apiHash, sessionString, phoneNumber } = this.config.account;
      
      console.log(`Initializing Telegram client for account ${phoneNumber}`);
      
      // Set up proxy configuration if provided
      let proxyConfig = undefined;
      if (this.config.proxy) {
        const { host, port, username, password, type } = this.config.proxy;
        proxyConfig = {
          socksType: type === 'socks5' ? 5 as const : 4 as const,
          ip: host,
          port: port,
          username: username || undefined,
          password: password || undefined
        };
        console.log(`Using proxy ${host}:${port}`);
      }
      
      // Initialize TelegramClient with MTProto
      const stringSession = new StringSession(sessionString || "");
      this.client = new TelegramClient(
        stringSession, 
        parseInt(apiId), 
        apiHash, 
        {
          connectionRetries: 3,
          proxy: proxyConfig
        }
      );
      
      // Connect to Telegram
      await this.client.connect();
      
      // Initialize Telegraf bot if needed for some operations
      if (this.config.account.botToken) {
        this.bot = new Telegraf(this.config.account.botToken);
        await this.bot.launch();
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing Telegram client:", error);
      return false;
    }
  }
  
  async checkLoginStatus(): Promise<{ loggedIn: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.client) {
        return { loggedIn: false, error: "Client not initialized" };
      }
      
      // Check if user is authorized
      const isAuthorized = await this.client.checkAuthorization();
      return { loggedIn: isAuthorized };
    } catch (error) {
      console.error("Error checking login status:", error);
      return { loggedIn: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
  
  async scrapeMembers(options: ScrapeMembersOptions): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.client) {
        throw new Error("Client not initialized");
      }
      
      console.log(`Scraping members from group ${options.groupUsername}`);
      
      // Get the entity (channel/group) by username
      const entity = await this.client.getEntity(options.groupUsername);
      
      // Get participants from the channel/group
      const participants = await this.client.getParticipants(entity, {
        limit: options.limit || 100
      });
      
      // Transform participants data to the expected format
      return participants.map((participant) => ({
        id: participant.id.toString(),
        username: participant.username || null,
        firstName: participant.firstName || null,
        lastName: participant.lastName || null,
        phone: null, // Phone numbers not available from getParticipants
        isOnline: participant.status && 
                  participant.status.className === "UserStatusOnline"
      }));
    } catch (error) {
      console.error("Error scraping members:", error);
      return [];
    }
  }
  
  async addMembers(options: AddMembersOptions): Promise<{ added: number; errors: number }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.client) {
        throw new Error("Client not initialized");
      }
      
      console.log(`Adding ${options.userIds.length} members to group ${options.groupId}`);
      
      // Get the target group/channel
      const targetEntity = await this.client.getEntity(options.groupId);
      
      let added = 0;
      let errors = 0;
      
      // Process each user ID
      for (const userId of options.userIds) {
        try {
          // Get user entity
          const userEntity = await this.client.getEntity(userId);
          
          // Invite user to channel/group
          await this.client.invoke(new Api.channels.InviteToChannel({
            channel: targetEntity,
            users: [userEntity]
          }));
          
          added++;
          
          // Apply random delay between operations
          const delay = getRandomDelay(options.delay.min, options.delay.max);
          await new Promise(resolve => setTimeout(resolve, delay));
        } catch (err) {
          console.error(`Error adding user ${userId} to group:`, err);
          errors++;
        }
      }
      
      return { added, errors };
    } catch (error) {
      console.error("Error adding members:", error);
      return { added: 0, errors: options.userIds.length };
    }
  }
  
  async sendMessages(options: SendMessageOptions): Promise<{ sent: number; errors: number }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.client) {
        throw new Error("Client not initialized");
      }
      
      console.log(`Sending messages to ${options.users.length} users`);
      
      let sent = 0;
      let errors = 0;
      
      // Process each user
      for (const user of options.users) {
        try {
          // Get user entity
          const userEntity = await this.client.getEntity(user);
          
          // Send message
          await this.client.sendMessage(userEntity, {
            message: options.message
          });
          
          sent++;
          
          // Apply random delay between operations
          const delay = getRandomDelay(options.delay.min, options.delay.max);
          await new Promise(resolve => setTimeout(resolve, delay));
        } catch (err) {
          console.error(`Error sending message to user ${user}:`, err);
          errors++;
        }
      }
      
      return { sent, errors };
    } catch (error) {
      console.error("Error sending messages:", error);
      return { sent: 0, errors: options.users.length };
    }
  }
  
  async uploadAvatar(options: UploadAvatarOptions): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.client) {
        throw new Error("Client not initialized");
      }
      
      console.log(`Uploading avatar ${options.avatarPath}`);
      
      // Check if file exists
      if (!fs.existsSync(options.avatarPath)) {
        throw new Error(`Avatar file not found: ${options.avatarPath}`);
      }
      
      // Upload the photo
      const fileName = path.basename(options.avatarPath);
      const fileBuffer = fs.readFileSync(options.avatarPath);
      
      // Create a custom file object
      const customFile = {
        name: fileName,
        size: fileBuffer.length,
        buffer: fileBuffer,
        path: options.avatarPath
      };
      
      await this.client.invoke(new Api.photos.UploadProfilePhoto({
        file: await this.client.uploadFile({
          file: customFile,
          workers: 1
        })
      }));
      
      return true;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return false;
    }
  }
  
  async searchUsers(options: SearchUsersOptions): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.client) {
        throw new Error("Client not initialized");
      }
      
      console.log(`Searching for users with query: ${options.query}`);
      
      // Search for users using the global search
      const result = await this.client.invoke(new Api.contacts.Search({
        q: options.query,
        limit: options.limit || 20
      }));
      
      // Transform the results to the expected format
      return result.users.map((user: any) => ({
        id: user.id.toString(),
        username: user.username || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phone: user.phone || null
      })).slice(0, options.limit || 20);
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }
  
  async postToGroups(options: PostToGroupOptions): Promise<{ success: number; errors: number }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.client) {
        throw new Error("Client not initialized");
      }
      
      console.log(`Posting message to ${options.groups.length} groups`);
      
      let success = 0;
      let errors = 0;
      
      // Process each group
      for (const group of options.groups) {
        try {
          // Get group entity
          const groupEntity = await this.client.getEntity(group);
          
          // Send message to the group
          await this.client.sendMessage(groupEntity, {
            message: options.message
          });
          
          success++;
          
          // Apply random delay between operations
          const delay = getRandomDelay(options.delay.min, options.delay.max);
          await new Promise(resolve => setTimeout(resolve, delay));
        } catch (err) {
          console.error(`Error posting to group ${group}:`, err);
          errors++;
        }
      }
      
      return { success, errors };
    } catch (error) {
      console.error("Error posting to groups:", error);
      return { success: 0, errors: options.groups.length };
    }
  }
}

// Mock implementation for development and testing
export class MockTelegramClient implements TelegramClientInterface {
  private config: TelegramClientConfig;
  private isInitialized: boolean = false;
  
  constructor(config: TelegramClientConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<boolean> {
    console.log(`Initializing Mock Telegram client for account ${this.config.account.phoneNumber}`);
    
    if (this.config.proxy) {
      console.log(`Using proxy ${this.config.proxy.host}:${this.config.proxy.port}`);
    }
    
    this.isInitialized = true;
    return true;
  }
  
  async checkLoginStatus(): Promise<{ loggedIn: boolean; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return { loggedIn: true };
  }
  
  async scrapeMembers(options: ScrapeMembersOptions): Promise<any[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log(`Scraping members from group ${options.groupUsername}`);
    
    // Mock data
    return Array(10).fill(0).map((_, i) => ({
      id: `user${i}`,
      username: `user${i}`,
      firstName: `First${i}`,
      lastName: `Last${i}`,
      phone: null,
      isOnline: Math.random() > 0.5
    }));
  }
  
  async addMembers(options: AddMembersOptions): Promise<{ added: number; errors: number }> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log(`Adding ${options.userIds.length} members to group ${options.groupId}`);
    
    return {
      added: Math.floor(options.userIds.length * 0.8),
      errors: Math.floor(options.userIds.length * 0.2)
    };
  }
  
  async sendMessages(options: SendMessageOptions): Promise<{ sent: number; errors: number }> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log(`Sending messages to ${options.users.length} users`);
    
    return {
      sent: Math.floor(options.users.length * 0.9),
      errors: Math.floor(options.users.length * 0.1)
    };
  }
  
  async uploadAvatar(options: UploadAvatarOptions): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log(`Uploading avatar ${options.avatarPath}`);
    
    return true;
  }
  
  async searchUsers(options: SearchUsersOptions): Promise<any[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log(`Searching for users with query: ${options.query}`);
    
    return Array(5).fill(0).map((_, i) => ({
      id: `search${i}`,
      username: `${options.query}${i}`,
      firstName: `${options.query.charAt(0).toUpperCase() + options.query.slice(1)}${i}`,
      lastName: `Last${i}`,
      phone: null
    }));
  }
  
  async postToGroups(options: PostToGroupOptions): Promise<{ success: number; errors: number }> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log(`Posting message to ${options.groups.length} groups`);
    
    return {
      success: Math.floor(options.groups.length * 0.85),
      errors: Math.floor(options.groups.length * 0.15)
    };
  }
}

// Factory function to create appropriate Telegram client based on environment
export function createTelegramClient(config: TelegramClientConfig): TelegramClientInterface {
  // In development mode, return the mock client
  if (process.env.NODE_ENV === 'development') {
    return new MockTelegramClient(config);
  }
  
  // In production, return the real client
  return new RealTelegramClient(config);
}
