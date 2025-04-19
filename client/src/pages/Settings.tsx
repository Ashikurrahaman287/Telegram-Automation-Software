import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

const Settings: React.FC = () => {
  const { toast } = useToast();
  
  // General settings
  const [defaultDelay, setDefaultDelay] = useState<[number, number]>([30, 60]);
  const [autoCheckStatus, setAutoCheckStatus] = useState(true);
  const [concurrentTasks, setConcurrentTasks] = useState(2);
  const [saveLogFiles, setSaveLogFiles] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  
  // Automation settings
  const [automationMode, setAutomationMode] = useState<"safe" | "balanced" | "aggressive">("balanced");
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [retryFailed, setRetryFailed] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);
  const [rotateProxies, setRotateProxies] = useState(true);
  const [proxyRotationInterval, setProxyRotationInterval] = useState(60);
  
  // Security settings
  const [encryptSessions, setEncryptSessions] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [limitedAccountHandling, setLimitedAccountHandling] = useState<"disable" | "pause" | "ignore">("pause");
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupInterval, setBackupInterval] = useState(24);
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully",
    });
  };
  
  const getAutomationSpeedLabel = () => {
    switch (automationMode) {
      case "safe": return "Safe (Slow but secure)";
      case "balanced": return "Balanced (Recommended)";
      case "aggressive": return "Aggressive (Fast but risky)";
      default: return "Balanced";
    }
  };
  
  const getMinDelayValue = () => {
    switch (automationMode) {
      case "safe": return 60;
      case "balanced": return 30;
      case "aggressive": return 10;
      default: return 30;
    }
  };
  
  const getMaxDelayValue = () => {
    switch (automationMode) {
      case "safe": return 180;
      case "balanced": return 90;
      case "aggressive": return 30;
      default: return 90;
    }
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">Global Settings</h1>
        <p className="text-neutral-500">Configure general application settings</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic application behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Operation Delay</Label>
                  <div className="flex items-center">
                    <span className="text-sm text-neutral-500 w-12">{defaultDelay[0]}s</span>
                    <Slider
                      min={5}
                      max={300}
                      step={5}
                      value={defaultDelay}
                      onValueChange={setDefaultDelay}
                      className="mx-2 flex-1"
                    />
                    <span className="text-sm text-neutral-500 w-12">{defaultDelay[1]}s</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Default delay between operations (e.g., messages, adds)
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-check-status" className="font-medium">Auto Check Account Status</Label>
                    <p className="text-sm text-neutral-500">Periodically check account status</p>
                  </div>
                  <Switch
                    id="auto-check-status"
                    checked={autoCheckStatus}
                    onCheckedChange={setAutoCheckStatus}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="concurrent-tasks">Concurrent Tasks</Label>
                  <Select value={concurrentTasks.toString()} onValueChange={(v) => setConcurrentTasks(parseInt(v))}>
                    <SelectTrigger id="concurrent-tasks">
                      <SelectValue placeholder="Select concurrent tasks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 task</SelectItem>
                      <SelectItem value="2">2 tasks</SelectItem>
                      <SelectItem value="3">3 tasks</SelectItem>
                      <SelectItem value="4">4 tasks</SelectItem>
                      <SelectItem value="5">5 tasks</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-500">
                    Number of tasks that can run simultaneously
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="save-log-files" className="font-medium">Save Log Files</Label>
                    <p className="text-sm text-neutral-500">Save operation logs to disk</p>
                  </div>
                  <Switch
                    id="save-log-files"
                    checked={saveLogFiles}
                    onCheckedChange={setSaveLogFiles}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-notifications" className="font-medium">Enable Notifications</Label>
                    <p className="text-sm text-neutral-500">Show notifications for important events</p>
                  </div>
                  <Switch
                    id="enable-notifications"
                    checked={enableNotifications}
                    onCheckedChange={setEnableNotifications}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Interface</CardTitle>
                  <CardDescription>
                    Customize the appearance and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select defaultValue="light">
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ru">Russian</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="datetime-format">Date & Time Format</Label>
                    <Select defaultValue="12h">
                      <SelectTrigger id="datetime-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Manage application data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline">
                      <i className="fas fa-file-export mr-2"></i>
                      Export Data
                    </Button>
                    <Button variant="outline">
                      <i className="fas fa-file-import mr-2"></i>
                      Import Data
                    </Button>
                    <Button variant="outline">
                      <i className="fas fa-trash-alt mr-2"></i>
                      Clear Cache
                    </Button>
                    <Button variant="outline" className="text-error hover:text-error">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Reset App
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="automation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>
                  Configure how automation tasks are performed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Automation Speed</Label>
                  <RadioGroup 
                    value={automationMode} 
                    onValueChange={(v) => setAutomationMode(v as "safe" | "balanced" | "aggressive")}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="safe" id="safe" />
                      <Label htmlFor="safe" className="cursor-pointer">Safe (Slow but secure)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="balanced" id="balanced" />
                      <Label htmlFor="balanced" className="cursor-pointer">Balanced (Recommended)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="aggressive" id="aggressive" />
                      <Label htmlFor="aggressive" className="cursor-pointer">Aggressive (Fast but risky)</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-neutral-500">
                    {automationMode === "aggressive" && (
                      <span className="text-error">Warning: Aggressive mode may lead to account limitations!</span>
                    )}
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-reconnect" className="font-medium">Auto Reconnect</Label>
                    <p className="text-sm text-neutral-500">Automatically reconnect when disconnected</p>
                  </div>
                  <Switch
                    id="auto-reconnect"
                    checked={autoReconnect}
                    onCheckedChange={setAutoReconnect}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="retry-failed" className="font-medium">Retry Failed Operations</Label>
                    <p className="text-sm text-neutral-500">Automatically retry failed operations</p>
                  </div>
                  <Switch
                    id="retry-failed"
                    checked={retryFailed}
                    onCheckedChange={setRetryFailed}
                  />
                </div>
                
                {retryFailed && (
                  <div className="space-y-2 pl-6 border-l-2 border-neutral-200">
                    <Label htmlFor="max-retries">Maximum Retry Attempts</Label>
                    <Select value={maxRetries.toString()} onValueChange={(v) => setMaxRetries(parseInt(v))}>
                      <SelectTrigger id="max-retries">
                        <SelectValue placeholder="Select max retries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 attempt</SelectItem>
                        <SelectItem value="2">2 attempts</SelectItem>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rotate-proxies" className="font-medium">Rotate Proxies</Label>
                    <p className="text-sm text-neutral-500">Automatically rotate proxies during operations</p>
                  </div>
                  <Switch
                    id="rotate-proxies"
                    checked={rotateProxies}
                    onCheckedChange={setRotateProxies}
                  />
                </div>
                
                {rotateProxies && (
                  <div className="space-y-2 pl-6 border-l-2 border-neutral-200">
                    <Label htmlFor="proxy-rotation-interval">Proxy Rotation Interval (minutes)</Label>
                    <Select 
                      value={proxyRotationInterval.toString()} 
                      onValueChange={(v) => setProxyRotationInterval(parseInt(v))}
                    >
                      <SelectTrigger id="proxy-rotation-interval">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Default Message Templates</CardTitle>
                  <CardDescription>
                    Configure default message templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Welcome Message</Label>
                    <Textarea
                      id="welcome-message"
                      placeholder="Enter default welcome message template..."
                      rows={3}
                      defaultValue="Hello {name}! Thank you for connecting with me. How can I help you today?"
                    />
                    <p className="text-xs text-neutral-500">
                      Use {"{name}"} to insert the recipient's name
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="group-invite">Group Invitation Message</Label>
                    <Textarea
                      id="group-invite"
                      placeholder="Enter default group invitation message..."
                      rows={3}
                      defaultValue="Hi {name}, I'd like to invite you to join our group {group}. We discuss topics that might interest you."
                    />
                    <p className="text-xs text-neutral-500">
                      Use {"{name}"} for name and {"{group}"} for group name
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Task Scheduling</CardTitle>
                  <CardDescription>
                    Configure automated task scheduling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-scheduling" className="font-medium">Enable Task Scheduling</Label>
                      <p className="text-sm text-neutral-500">Schedule tasks to run automatically</p>
                    </div>
                    <Switch
                      id="enable-scheduling"
                      defaultChecked={false}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quiet-hours">Quiet Hours</Label>
                    <div className="flex items-center space-x-2">
                      <Select defaultValue="22">
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="From" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span>to</span>
                      <Select defaultValue="8">
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="To" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-neutral-500">
                      No tasks will run during quiet hours
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="encrypt-sessions" className="font-medium">Encrypt Session Data</Label>
                    <p className="text-sm text-neutral-500">Encrypt Telegram session files</p>
                  </div>
                  <Switch
                    id="encrypt-sessions"
                    checked={encryptSessions}
                    onCheckedChange={setEncryptSessions}
                  />
                </div>
                
                {encryptSessions && (
                  <div className="space-y-2 pl-6 border-l-2 border-neutral-200">
                    <Label htmlFor="encryption-key">Encryption Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="encryption-key"
                        type="password"
                        placeholder="Enter encryption key"
                        value={encryptionKey}
                        onChange={(e) => setEncryptionKey(e.target.value)}
                      />
                      <Button variant="outline" size="sm" className="whitespace-nowrap">
                        Generate Key
                      </Button>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Keep this key safe. You'll need it to decrypt your sessions.
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Limited Account Handling</Label>
                  <RadioGroup 
                    value={limitedAccountHandling} 
                    onValueChange={(v) => setLimitedAccountHandling(v as "disable" | "pause" | "ignore")}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="disable" id="disable" />
                      <Label htmlFor="disable" className="cursor-pointer">Disable Account</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pause" id="pause" />
                      <Label htmlFor="pause" className="cursor-pointer">Pause Tasks Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ignore" id="ignore" />
                      <Label htmlFor="ignore" className="cursor-pointer">Ignore (Not Recommended)</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-neutral-500">
                    How to handle accounts when they get limited by Telegram
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup" className="font-medium">Automatic Backup</Label>
                    <p className="text-sm text-neutral-500">Regularly backup all data</p>
                  </div>
                  <Switch
                    id="auto-backup"
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>
                
                {autoBackup && (
                  <div className="space-y-2 pl-6 border-l-2 border-neutral-200">
                    <Label htmlFor="backup-interval">Backup Interval (hours)</Label>
                    <Select 
                      value={backupInterval.toString()} 
                      onValueChange={(v) => setBackupInterval(parseInt(v))}
                    >
                      <SelectTrigger id="backup-interval">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">Every 12 hours</SelectItem>
                        <SelectItem value="24">Every 24 hours</SelectItem>
                        <SelectItem value="48">Every 48 hours</SelectItem>
                        <SelectItem value="168">Every week</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-neutral-500">
                      Backup location: ./backups/
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rate Limiting Protection</CardTitle>
                  <CardDescription>
                    Configure settings to avoid Telegram limitations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Maximum operations per account per day</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max-messages" className="text-sm">Messages</Label>
                        <Input
                          id="max-messages"
                          type="number"
                          min="1"
                          max="500"
                          defaultValue="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-adds" className="text-sm">Member Adds</Label>
                        <Input
                          id="max-adds"
                          type="number"
                          min="1"
                          max="200"
                          defaultValue="50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-joins" className="text-sm">Group Joins</Label>
                        <Input
                          id="max-joins"
                          type="number"
                          min="1"
                          max="100"
                          defaultValue="20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-searches" className="text-sm">Searches</Label>
                        <Input
                          id="max-searches"
                          type="number"
                          min="1"
                          max="300"
                          defaultValue="100"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-cooldown" className="font-medium">Enable Account Cooldown</Label>
                      <p className="text-sm text-neutral-500">Rest accounts after heavy usage</p>
                    </div>
                    <Switch
                      id="enable-cooldown"
                      defaultChecked={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cooldown-threshold">Cooldown After (% of daily limit)</Label>
                    <Select defaultValue="80">
                      <SelectTrigger id="cooldown-threshold">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50% of limit</SelectItem>
                        <SelectItem value="65">65% of limit</SelectItem>
                        <SelectItem value="80">80% of limit</SelectItem>
                        <SelectItem value="90">90% of limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cooldown-period">Cooldown Period</Label>
                    <Select defaultValue="6">
                      <SelectTrigger id="cooldown-period">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 hours</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Security</CardTitle>
                  <CardDescription>
                    Advanced security configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="use-random-ua" className="font-medium">Use Random User Agents</Label>
                      <p className="text-sm text-neutral-500">Randomize client signatures</p>
                    </div>
                    <Switch
                      id="use-random-ua"
                      defaultChecked={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hide-online" className="font-medium">Hide Online Status</Label>
                      <p className="text-sm text-neutral-500">Hide online status when possible</p>
                    </div>
                    <Switch
                      id="hide-online"
                      defaultChecked={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="automatic-logout" className="font-medium">Automatic Logout</Label>
                      <p className="text-sm text-neutral-500">Log out after inactivity</p>
                    </div>
                    <Switch
                      id="automatic-logout"
                      defaultChecked={false}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Settings;
