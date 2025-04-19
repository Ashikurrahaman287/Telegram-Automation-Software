import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TelegramAccount {
  id: number;
  phoneNumber: string;
  status: string;
  isActive: boolean;
}

const ManualControl: React.FC = () => {
  const { toast } = useToast();
  
  // Form state
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("command");
  const [commandOutput, setCommandOutput] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [command, setCommand] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  
  // Terminal interaction simulation
  const addToOutput = (text: string, isCommand: boolean = false) => {
    setCommandOutput(prev => [...prev, isCommand ? `> ${text}` : text]);
  };
  
  const clearOutput = () => {
    setCommandOutput([]);
  };
  
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<TelegramAccount[]>({
    queryKey: ["/api/telegram-accounts"],
  });
  
  const connectMutation = useMutation({
    mutationFn: (accountId: number) => {
      // In a real app, this would establish a connection to the Telegram client
      return apiRequest("POST", `/api/telegram-accounts/${accountId}/check-login`, {});
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      if (data.loggedIn) {
        setIsConnected(true);
        addToOutput("Connected to Telegram client successfully!");
        addToOutput("Client is ready to receive commands.");
        addToOutput("Type 'help' to see available commands.");
        
        toast({
          title: "Connected",
          description: "Successfully connected to Telegram client",
        });
      } else {
        addToOutput("Failed to connect: " + (data.error || "Unknown error"));
        
        toast({
          title: "Connection Failed",
          description: data.error || "Failed to connect to Telegram client",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      addToOutput(`Error: ${error.message}`);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const sendCommandMutation = useMutation({
    mutationFn: (command: string) => {
      // In a real app, this would send a command to the Telegram client
      // This is a mock implementation
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          if (command.toLowerCase() === 'help') {
            resolve(`Available commands:
- help: Show this help message
- info: Show account information
- status: Check account status
- contacts: List recent contacts
- groups: List joined groups
- send <username> <message>: Send a message to a user
- join <group>: Join a group by username or invite link
- leave <group>: Leave a group by username`);
          } else if (command.toLowerCase() === 'info') {
            const account = accounts?.find(a => a.id.toString() === selectedAccountId);
            resolve(`Account Information:
Phone: ${account?.phoneNumber || 'Unknown'}
Status: ${account?.status || 'Unknown'}
Active: ${account?.isActive ? 'Yes' : 'No'}
Session: Available`);
          } else if (command.toLowerCase() === 'status') {
            resolve('Account is active and not limited by Telegram');
          } else if (command.toLowerCase().startsWith('contacts')) {
            resolve(`Recent Contacts:
@user1 - John Doe (last seen 5 minutes ago)
@user2 - Jane Smith (online)
@user3 - Alex Johnson (last seen yesterday)
@user4 - Sam Wilson (last seen recently)`);
          } else if (command.toLowerCase().startsWith('groups')) {
            resolve(`Joined Groups:
@cryptosignals - Crypto Signals (150 members)
@developerhub - Developer Hub (2340 members)
@marketingtips - Marketing Tips (876 members)
@designcommunity - Design Community (1254 members)`);
          } else if (command.toLowerCase().startsWith('send')) {
            resolve('Message sent successfully');
          } else if (command.toLowerCase().startsWith('join')) {
            const group = command.split(' ')[1];
            resolve(`Joined group ${group} successfully`);
          } else if (command.toLowerCase().startsWith('leave')) {
            const group = command.split(' ')[1];
            resolve(`Left group ${group} successfully`);
          } else {
            resolve(`Unknown command: ${command}. Type 'help' to see available commands.`);
          }
        }, 500);
      });
    },
    onSuccess: (response) => {
      addToOutput(response);
    },
    onError: (error: Error) => {
      addToOutput(`Error: ${error.message}`);
    }
  });
  
  const handleConnect = () => {
    if (!selectedAccountId) {
      toast({
        title: "Missing Information",
        description: "Please select a Telegram account",
        variant: "destructive",
      });
      return;
    }
    
    clearOutput();
    addToOutput("Connecting to Telegram client...");
    connectMutation.mutate(parseInt(selectedAccountId));
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    addToOutput("Disconnected from Telegram client.");
    
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from Telegram client",
    });
  };
  
  const handleSendCommand = () => {
    if (!command.trim()) return;
    
    addToOutput(command, true);
    sendCommandMutation.mutate(command);
    setCommand("");
  };
  
  const handleSendMessage = () => {
    if (!recipient.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both recipient and message",
        variant: "destructive",
      });
      return;
    }
    
    addToOutput(`Sending message to ${recipient}...`);
    sendCommandMutation.mutate(`send ${recipient} ${message}`);
    
    // Clear the form
    setMessage("");
    setRecipient("");
    
    // Switch to command tab to see output
    setActiveTab("command");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    }
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">Manual Control</h1>
        <p className="text-neutral-500">Directly interact with your Telegram accounts</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Account Selection</CardTitle>
              <CardDescription>
                Choose an account to control manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Telegram Account</Label>
                <Select 
                  value={selectedAccountId} 
                  onValueChange={setSelectedAccountId}
                  disabled={isConnected}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingAccounts ? (
                      <SelectItem value="loading" disabled>Loading accounts...</SelectItem>
                    ) : accounts && accounts.length > 0 ? (
                      accounts.map(account => (
                        <SelectItem
                          key={account.id}
                          value={account.id.toString()}
                          disabled={!account.isActive || account.status !== "available"}
                        >
                          {account.phoneNumber} {account.status !== "available" && `(${account.status})`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No accounts available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between">
                {isConnected ? (
                  <Button 
                    variant="destructive" 
                    onClick={handleDisconnect}
                    className="w-full"
                  >
                    <i className="fas fa-plug fa-flip-vertical mr-2"></i>
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    onClick={handleConnect} 
                    disabled={!selectedAccountId || connectMutation.isPending}
                    className="w-full"
                  >
                    {connectMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plug mr-2"></i>
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Manual Mode Warning</AlertTitle>
                <AlertDescription>
                  Use manual control with caution. Improper commands may lead to account limitations or bans.
                </AlertDescription>
              </Alert>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Quick Commands</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!isConnected}
                    onClick={() => {
                      addToOutput("help", true);
                      sendCommandMutation.mutate("help");
                    }}
                  >
                    <i className="fas fa-question-circle mr-1"></i> Help
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!isConnected}
                    onClick={() => {
                      addToOutput("info", true);
                      sendCommandMutation.mutate("info");
                    }}
                  >
                    <i className="fas fa-info-circle mr-1"></i> Info
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!isConnected}
                    onClick={() => {
                      addToOutput("status", true);
                      sendCommandMutation.mutate("status");
                    }}
                  >
                    <i className="fas fa-heartbeat mr-1"></i> Status
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!isConnected}
                    onClick={() => {
                      addToOutput("contacts", true);
                      sendCommandMutation.mutate("contacts");
                    }}
                  >
                    <i className="fas fa-address-book mr-1"></i> Contacts
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!isConnected}
                    onClick={() => {
                      addToOutput("groups", true);
                      sendCommandMutation.mutate("groups");
                    }}
                    className="col-span-2"
                  >
                    <i className="fas fa-users mr-1"></i> List Groups
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Manual Control Interface</CardTitle>
              <CardDescription>
                Interact with your Telegram account directly
              </CardDescription>
            </CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="command">Command Terminal</TabsTrigger>
                  <TabsTrigger value="message">Send Message</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="command" className="p-0">
                <div className="border-t">
                  <div className="p-4 bg-dark text-white font-mono rounded-t-none rounded-b-md">
                    <ScrollArea className="h-[350px]">
                      {commandOutput.length > 0 ? (
                        commandOutput.map((line, index) => (
                          <div key={index} className={`text-sm ${line.startsWith('>') ? 'text-primary-light font-bold' : 'text-neutral-300'}`}>
                            {line}
                          </div>
                        ))
                      ) : (
                        <div className="text-neutral-400 flex items-center justify-center h-full">
                          <div className="text-center">
                            <Terminal className="mx-auto h-12 w-12 mb-2 opacity-30" />
                            <p>No output yet. Connect to an account to start.</p>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                    
                    <div className="mt-4 flex items-center space-x-2">
                      <div className="text-primary-light mr-1">
                        <i className="fas fa-chevron-right"></i>
                      </div>
                      <Input
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isConnected ? "Type a command..." : "Connect to an account first..."}
                        disabled={!isConnected}
                        className="border-dark-light bg-dark-light text-white placeholder:text-neutral-500"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleSendCommand}
                        disabled={!isConnected || !command.trim()}
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="message" className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient (Username or Phone)</Label>
                    <Input
                      id="recipient"
                      placeholder="@username or +1234567890"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      disabled={!isConnected}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message-text">Message</Label>
                    <Textarea
                      id="message-text"
                      placeholder="Enter your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      disabled={!isConnected}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!isConnected || !recipient.trim() || !message.trim()}
                    >
                      <i className="fas fa-paper-plane mr-2"></i>
                      Send Message
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ManualControl;
