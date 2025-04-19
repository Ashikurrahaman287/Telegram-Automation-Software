import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createTelegramClient } from "./telegram-client";
import { insertTelegramAccountSchema, insertProxySchema, insertTaskSchema, insertContactSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // In a real app, we would use a proper authentication system
    res.json({ id: user.id, username: user.username });
  });

  // Telegram account routes
  app.get('/api/telegram-accounts', async (req: Request, res: Response) => {
    // In a real app, we would get the user ID from the session
    const userId = 1;
    const accounts = await storage.getTelegramAccounts(userId);
    res.json(accounts);
  });

  app.post('/api/telegram-accounts', async (req: Request, res: Response) => {
    try {
      const userId = 1; // In a real app, get from session
      const parsedData = insertTelegramAccountSchema.parse({
        ...req.body,
        userId
      });
      
      const account = await storage.createTelegramAccount(parsedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put('/api/telegram-accounts/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const account = await storage.updateTelegramAccount(
        parseInt(id),
        req.body
      );
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete('/api/telegram-accounts/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await storage.deleteTelegramAccount(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    res.status(204).send();
  });

  // Check telegram account login status
  app.post('/api/telegram-accounts/:id/check-login', async (req: Request, res: Response) => {
    const { id } = req.params;
    const account = await storage.getTelegramAccount(parseInt(id));
    
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    try {
      const client = createTelegramClient({ account });
      const status = await client.checkLoginStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to check login status" });
    }
  });

  // Proxy routes
  app.get('/api/proxies', async (req: Request, res: Response) => {
    const userId = 1; // In a real app, get from session
    const proxies = await storage.getProxies(userId);
    res.json(proxies);
  });

  app.post('/api/proxies', async (req: Request, res: Response) => {
    try {
      const userId = 1; // In a real app, get from session
      const parsedData = insertProxySchema.parse({
        ...req.body,
        userId
      });
      
      const proxy = await storage.createProxy(parsedData);
      res.status(201).json(proxy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put('/api/proxies/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const proxy = await storage.updateProxy(
        parseInt(id),
        req.body
      );
      
      if (!proxy) {
        return res.status(404).json({ message: "Proxy not found" });
      }
      
      res.json(proxy);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete('/api/proxies/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await storage.deleteProxy(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ message: "Proxy not found" });
    }
    
    res.status(204).send();
  });

  // Task routes
  app.get('/api/tasks', async (req: Request, res: Response) => {
    const userId = 1; // In a real app, get from session
    const tasks = await storage.getTasks(userId);
    res.json(tasks);
  });

  app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
      const userId = 1; // In a real app, get from session
      const parsedData = insertTaskSchema.parse({
        ...req.body,
        userId
      });
      
      const task = await storage.createTask(parsedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put('/api/tasks/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const task = await storage.updateTask(
        parseInt(id),
        req.body
      );
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await storage.deleteTask(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(204).send();
  });

  // Contact routes
  app.get('/api/contacts', async (req: Request, res: Response) => {
    const userId = 1; // In a real app, get from session
    
    const filter: { isBlacklisted?: boolean; isWhitelisted?: boolean } = {};
    if (req.query.blacklisted) {
      filter.isBlacklisted = req.query.blacklisted === 'true';
    }
    if (req.query.whitelisted) {
      filter.isWhitelisted = req.query.whitelisted === 'true';
    }
    
    const contacts = await storage.getContacts(userId, filter);
    res.json(contacts);
  });

  app.post('/api/contacts', async (req: Request, res: Response) => {
    try {
      const userId = 1; // In a real app, get from session
      const parsedData = insertContactSchema.parse({
        ...req.body,
        userId
      });
      
      const contact = await storage.createContact(parsedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put('/api/contacts/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const contact = await storage.updateContact(
        parseInt(id),
        req.body
      );
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete('/api/contacts/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await storage.deleteContact(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }
    
    res.status(204).send();
  });

  // Activity logs
  app.get('/api/activity-logs', async (req: Request, res: Response) => {
    const userId = 1; // In a real app, get from session
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const logs = await storage.getActivityLogs(userId, limit);
    res.json(logs);
  });

  // Telegram operations
  app.post('/api/telegram/scrape-members', async (req: Request, res: Response) => {
    const { accountId, groupUsername, limit } = req.body;
    
    if (!accountId || !groupUsername) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const account = await storage.getTelegramAccount(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    if (!account.isActive) {
      return res.status(400).json({ message: "Account is not active" });
    }
    
    try {
      // Get proxy if specified
      let proxy = undefined;
      if (req.body.proxyId) {
        proxy = await storage.getProxy(req.body.proxyId);
      }
      
      // Create new task
      const task = await storage.createTask({
        name: `Scrape members from ${groupUsername}`,
        type: "scrape_members",
        config: { accountId, groupUsername, limit },
        userId: 1 // In a real app, get from session
      });
      
      // Update task status
      await storage.updateTask(task.id, { status: "running", startTime: new Date() });
      
      // Initialize client
      const client = createTelegramClient({ account, proxy });
      await client.initialize();
      
      // Scrape members
      const members = await client.scrapeMembers({
        groupUsername,
        limit: limit || 100
      });
      
      // Save scraped members to contacts
      for (const member of members) {
        try {
          await storage.createContact({
            telegramId: member.id,
            username: member.username,
            firstName: member.firstName,
            lastName: member.lastName,
            phone: member.phone,
            groupSource: groupUsername,
            userId: 1 // In a real app, get from session
          });
        } catch (err) {
          console.error("Error saving contact:", err);
          // Continue with next member
        }
      }
      
      // Update last used time for account
      await storage.updateTelegramAccount(accountId, { lastUsed: new Date() });
      
      // Update task status
      await storage.updateTask(task.id, { 
        status: "completed", 
        progress: 100,
        endTime: new Date() 
      });
      
      // Add activity log
      await storage.createActivityLog({
        taskId: task.id,
        activity: `Scraped ${members.length} members from ${groupUsername}`,
        details: `Group: ${groupUsername}, Using account: ${account.phoneNumber}`,
        userId: 1, // In a real app, get from session
      });
      
      res.json({ 
        success: true, 
        count: members.length,
        taskId: task.id
      });
    } catch (error) {
      console.error("Error scraping members:", error);
      
      // Add activity log for error
      await storage.createActivityLog({
        activity: `Failed to scrape members from ${groupUsername}`,
        details: error instanceof Error ? error.message : String(error),
        userId: 1, // In a real app, get from session
      });
      
      res.status(500).json({ 
        message: "Failed to scrape members",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Add members to a group
  app.post('/api/telegram/add-members', async (req: Request, res: Response) => {
    const { accountId, groupId, userIds, delay } = req.body;
    
    if (!accountId || !groupId || !userIds || !delay) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const account = await storage.getTelegramAccount(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    if (!account.isActive) {
      return res.status(400).json({ message: "Account is not active" });
    }
    
    try {
      // Get proxy if specified
      let proxy = undefined;
      if (req.body.proxyId) {
        proxy = await storage.getProxy(req.body.proxyId);
      }
      
      // Create new task
      const task = await storage.createTask({
        name: `Add members to ${groupId}`,
        type: "add_members",
        config: { accountId, groupId, userIds, delay },
        userId: 1 // In a real app, get from session
      });
      
      // Update task status
      await storage.updateTask(task.id, { status: "running", startTime: new Date() });
      
      // Initialize client
      const client = createTelegramClient({ account, proxy });
      await client.initialize();
      
      // Add members
      const result = await client.addMembers({
        groupId,
        userIds,
        delay
      });
      
      // Update last used time for account
      await storage.updateTelegramAccount(accountId, { lastUsed: new Date() });
      
      // Update task status
      await storage.updateTask(task.id, { 
        status: "completed", 
        progress: 100,
        endTime: new Date() 
      });
      
      // Add activity log
      await storage.createActivityLog({
        taskId: task.id,
        activity: `Added ${result.added} members to ${groupId}`,
        details: `Successfully added: ${result.added}, Errors: ${result.errors}`,
        userId: 1, // In a real app, get from session
      });
      
      res.json({ 
        ...result,
        taskId: task.id
      });
    } catch (error) {
      console.error("Error adding members:", error);
      
      // Add activity log for error
      await storage.createActivityLog({
        activity: `Failed to add members to ${groupId}`,
        details: error instanceof Error ? error.message : String(error),
        userId: 1, // In a real app, get from session
      });
      
      res.status(500).json({ 
        message: "Failed to add members",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Send messages to users
  app.post('/api/telegram/send-messages', async (req: Request, res: Response) => {
    const { accountId, users, message, delay } = req.body;
    
    if (!accountId || !users || !message || !delay) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const account = await storage.getTelegramAccount(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    if (!account.isActive) {
      return res.status(400).json({ message: "Account is not active" });
    }
    
    try {
      // Get proxy if specified
      let proxy = undefined;
      if (req.body.proxyId) {
        proxy = await storage.getProxy(req.body.proxyId);
      }
      
      // Create new task
      const task = await storage.createTask({
        name: `Send messages to ${users.length} users`,
        type: "send_messages",
        config: { accountId, users, message, delay },
        userId: 1 // In a real app, get from session
      });
      
      // Update task status
      await storage.updateTask(task.id, { status: "running", startTime: new Date() });
      
      // Initialize client
      const client = createTelegramClient({ account, proxy });
      await client.initialize();
      
      // Send messages
      const result = await client.sendMessages({
        users,
        message,
        delay
      });
      
      // Update last used time for account
      await storage.updateTelegramAccount(accountId, { lastUsed: new Date() });
      
      // Update task status
      await storage.updateTask(task.id, { 
        status: "completed", 
        progress: 100,
        endTime: new Date() 
      });
      
      // Add activity log
      await storage.createActivityLog({
        taskId: task.id,
        activity: `Sent messages to ${result.sent} users`,
        details: `Successfully sent: ${result.sent}, Errors: ${result.errors}`,
        userId: 1, // In a real app, get from session
      });
      
      res.json({ 
        ...result,
        taskId: task.id
      });
    } catch (error) {
      console.error("Error sending messages:", error);
      
      // Add activity log for error
      await storage.createActivityLog({
        activity: `Failed to send messages`,
        details: error instanceof Error ? error.message : String(error),
        userId: 1, // In a real app, get from session
      });
      
      res.status(500).json({ 
        message: "Failed to send messages",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Upload avatar to account
  app.post('/api/telegram/upload-avatar', async (req: Request, res: Response) => {
    const { accountId, avatarPath } = req.body;
    
    if (!accountId || !avatarPath) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const account = await storage.getTelegramAccount(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    if (!account.isActive) {
      return res.status(400).json({ message: "Account is not active" });
    }
    
    try {
      // Get proxy if specified
      let proxy = undefined;
      if (req.body.proxyId) {
        proxy = await storage.getProxy(req.body.proxyId);
      }
      
      // Create new task
      const task = await storage.createTask({
        name: `Upload avatar to account ${account.phoneNumber}`,
        type: "upload_avatar",
        config: { accountId, avatarPath },
        userId: 1 // In a real app, get from session
      });
      
      // Update task status
      await storage.updateTask(task.id, { status: "running", startTime: new Date() });
      
      // Initialize client
      const client = createTelegramClient({ account, proxy });
      await client.initialize();
      
      // Upload avatar
      const success = await client.uploadAvatar({ avatarPath });
      
      // Update last used time for account
      await storage.updateTelegramAccount(accountId, { lastUsed: new Date() });
      
      // Update task status
      await storage.updateTask(task.id, { 
        status: success ? "completed" : "failed", 
        progress: success ? 100 : 0,
        endTime: new Date() 
      });
      
      // Add activity log
      await storage.createActivityLog({
        taskId: task.id,
        activity: success ? `Successfully uploaded avatar` : "Failed to upload avatar",
        details: `Account: ${account.phoneNumber}, Avatar path: ${avatarPath}`,
        userId: 1, // In a real app, get from session
      });
      
      res.json({ 
        success,
        taskId: task.id
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      
      // Add activity log for error
      await storage.createActivityLog({
        activity: `Failed to upload avatar`,
        details: error instanceof Error ? error.message : String(error),
        userId: 1, // In a real app, get from session
      });
      
      res.status(500).json({ 
        message: "Failed to upload avatar",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Search for users on Telegram
  app.post('/api/telegram/search-users', async (req: Request, res: Response) => {
    const { accountId, query, limit } = req.body;
    
    if (!accountId || !query) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const account = await storage.getTelegramAccount(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    if (!account.isActive) {
      return res.status(400).json({ message: "Account is not active" });
    }
    
    try {
      // Get proxy if specified
      let proxy = undefined;
      if (req.body.proxyId) {
        proxy = await storage.getProxy(req.body.proxyId);
      }
      
      // Create task
      const task = await storage.createTask({
        name: `Search for users with query: ${query}`,
        type: "search_users",
        config: { accountId, query, limit },
        userId: 1 // In a real app, get from session
      });
      
      // Update task status
      await storage.updateTask(task.id, { status: "running", startTime: new Date() });
      
      // Initialize client
      const client = createTelegramClient({ account, proxy });
      await client.initialize();
      
      // Search users
      const users = await client.searchUsers({
        query,
        limit: limit || 20
      });
      
      // Update last used time for account
      await storage.updateTelegramAccount(accountId, { lastUsed: new Date() });
      
      // Update task status
      await storage.updateTask(task.id, { 
        status: "completed", 
        progress: 100,
        endTime: new Date() 
      });
      
      // Add activity log
      await storage.createActivityLog({
        taskId: task.id,
        activity: `Found ${users.length} users with query: ${query}`,
        details: `Account: ${account.phoneNumber}, Query: ${query}`,
        userId: 1, // In a real app, get from session
      });
      
      res.json({ 
        users,
        taskId: task.id
      });
    } catch (error) {
      console.error("Error searching users:", error);
      
      // Add activity log for error
      await storage.createActivityLog({
        activity: `Failed to search users with query: ${query}`,
        details: error instanceof Error ? error.message : String(error),
        userId: 1, // In a real app, get from session
      });
      
      res.status(500).json({ 
        message: "Failed to search users",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Post to multiple groups
  app.post('/api/telegram/post-to-groups', async (req: Request, res: Response) => {
    const { accountId, groups, message, delay } = req.body;
    
    if (!accountId || !groups || !message || !delay) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const account = await storage.getTelegramAccount(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    if (!account.isActive) {
      return res.status(400).json({ message: "Account is not active" });
    }
    
    try {
      // Get proxy if specified
      let proxy = undefined;
      if (req.body.proxyId) {
        proxy = await storage.getProxy(req.body.proxyId);
      }
      
      // Create task
      const task = await storage.createTask({
        name: `Post to ${groups.length} groups`,
        type: "post_to_groups",
        config: { accountId, groups, message, delay },
        userId: 1 // In a real app, get from session
      });
      
      // Update task status
      await storage.updateTask(task.id, { status: "running", startTime: new Date() });
      
      // Initialize client
      const client = createTelegramClient({ account, proxy });
      await client.initialize();
      
      // Post to groups
      const result = await client.postToGroups({
        groups,
        message,
        delay
      });
      
      // Update last used time for account
      await storage.updateTelegramAccount(accountId, { lastUsed: new Date() });
      
      // Update task status
      await storage.updateTask(task.id, { 
        status: "completed", 
        progress: 100,
        endTime: new Date() 
      });
      
      // Add activity log
      await storage.createActivityLog({
        taskId: task.id,
        activity: `Posted to ${result.success} groups`,
        details: `Successfully posted: ${result.success}, Errors: ${result.errors}`,
        userId: 1, // In a real app, get from session
      });
      
      res.json({ 
        ...result,
        taskId: task.id
      });
    } catch (error) {
      console.error("Error posting to groups:", error);
      
      // Add activity log for error
      await storage.createActivityLog({
        activity: `Failed to post to groups`,
        details: error instanceof Error ? error.message : String(error),
        userId: 1, // In a real app, get from session
      });
      
      res.status(500).json({ 
        message: "Failed to post to groups",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create http server
  const httpServer = createServer(app);
  return httpServer;
}