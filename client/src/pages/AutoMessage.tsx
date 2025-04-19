import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TelegramAccount {
  id: number;
  phoneNumber: string;
  status: string;
  isActive: boolean;
}

interface Contact {
  id: number;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  isBlacklisted: boolean;
  isWhitelisted: boolean;
}

const AutoMessage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [messageTemplate, setMessageTemplate] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [delayMin, setDelayMin] = useState(30);
  const [delayMax, setDelayMax] = useState(60);
  const [onlyOnline, setOnlyOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("contacts");

  // Process state
  const [isSending, setIsSending] = useState(false);

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<TelegramAccount[]>({
    queryKey: ["/api/telegram-accounts"],
  });

  const { data: contacts, isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const sendMessagesMutation = useMutation({
    mutationFn: (data: any) => {
      // Create a task for sending messages
      return apiRequest("POST", "/api/tasks", {
        name: "Auto Message",
        type: "auto_message",
        config: {
          message: messageTemplate,
          accountIds: [parseInt(selectedAccountId)],
          userIds: selectedContacts,
          onlyOnline: onlyOnline,
          delay: { min: delayMin, max: delayMax }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Created",
        description: `Started sending messages to ${selectedContacts.length} contacts`,
      });
      setIsSending(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSending(false);
    }
  });

  const handleSendMessages = () => {
    if (!messageTemplate) {
      toast({
        title: "Missing Information",
        description: "Please enter a message template",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAccountId) {
      toast({
        title: "Missing Information",
        description: "Please select a Telegram account",
        variant: "destructive",
      });
      return;
    }

    if (selectedContacts.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one contact",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    sendMessagesMutation.mutate({});
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">Auto Message</h1>
        <p className="text-neutral-500">Automatically send messages to Telegram users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Message Configuration</CardTitle>
              <CardDescription>
                Configure your message template and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message-template">Message Template</Label>
                <Textarea
                  id="message-template"
                  placeholder="Enter your message here..."
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-neutral-500">
                  Use {"{name}"} to personalize with first name, {"{username}"} for username
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Telegram Account</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
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

              <div className="space-y-2">
                <Label>Delay Between Messages ({delayMin}s - {delayMax}s)</Label>
                <Slider
                  min={5}
                  max={300}
                  step={5}
                  value={[delayMin, delayMax]}
                  onValueChange={(values) => {
                    setDelayMin(values[0]);
                    setDelayMax(values[1]);
                  }}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Setting a higher delay reduces the risk of account limitations
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="only-online"
                  checked={onlyOnline}
                  onCheckedChange={setOnlyOnline}
                />
                <Label htmlFor="only-online">Only message online users</Label>
              </div>

              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Sending too many messages too quickly may result in account limitations. Use multiple accounts and set appropriate delays.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setMessageTemplate("")}>Clear</Button>
              <Button
                onClick={handleSendMessages}
                disabled={isSending || !messageTemplate || !selectedAccountId || selectedContacts.length === 0}
              >
                {isSending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-comment mr-2"></i>
                    Start Sending
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Recipients</CardTitle>
              <CardDescription>
                Choose users to receive your message
              </CardDescription>
            </CardHeader>
            <Tabs defaultValue="contacts" value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="contacts">Contact Database</TabsTrigger>
                  <TabsTrigger value="manual">Manual Input</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="contacts" className="px-6 py-4">
                <div className="mb-4 flex items-center">
                  <Checkbox
                    id="select-all"
                    checked={contacts?.length === selectedContacts.length && contacts?.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedContacts(contacts?.map(contact => contact.telegramId) || []);
                      } else {
                        setSelectedContacts([]);
                      }
                    }}
                  />
                  <Label htmlFor="select-all" className="ml-2">Select All</Label>
                  <div className="ml-auto">
                    <span className="text-sm text-neutral-500">
                      {selectedContacts.length} of {contacts?.length || 0} selected
                    </span>
                  </div>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingContacts ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Loading contacts...
                          </TableCell>
                        </TableRow>
                      ) : contacts && contacts.length > 0 ? (
                        contacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedContacts.includes(contact.telegramId)}
                                onCheckedChange={() => {
                                  if (selectedContacts.includes(contact.telegramId)) {
                                    setSelectedContacts(selectedContacts.filter(id => id !== contact.telegramId));
                                  } else {
                                    setSelectedContacts([...selectedContacts, contact.telegramId]);
                                  }
                                }}
                                disabled={contact.isBlacklisted}
                              />
                            </TableCell>
                            <TableCell>{contact.username || "N/A"}</TableCell>
                            <TableCell>{contact.firstName || "N/A"}</TableCell>
                            <TableCell>{contact.lastName || "N/A"}</TableCell>
                            <TableCell>
                              {contact.isBlacklisted ? (
                                <span className="text-xs rounded-full px-2 py-1 bg-error bg-opacity-10 text-error">
                                  Blacklisted
                                </span>
                              ) : contact.isWhitelisted ? (
                                <span className="text-xs rounded-full px-2 py-1 bg-secondary bg-opacity-10 text-secondary">
                                  Whitelisted
                                </span>
                              ) : (
                                <span className="text-xs rounded-full px-2 py-1 bg-neutral-200 text-neutral-600">
                                  Normal
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            No contacts available. Scrape members first.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="px-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-users">User IDs or Usernames</Label>
                    <Textarea
                      id="manual-users"
                      placeholder="Enter usernames or IDs, one per line"
                      className="font-mono"
                      rows={10}
                      disabled
                    />
                    <p className="text-xs text-neutral-500">
                      Enter usernames or IDs, one per line. Coming soon.
                    </p>
                  </div>
                  <Button disabled>Parse Input</Button>
                </div>
              </TabsContent>
            </Tabs>
            <CardFooter className="border-t px-6 py-4">
              <div className="w-full">
                <h4 className="font-medium mb-2">Message Preview</h4>
                <div className="bg-neutral-50 p-4 rounded-md border">
                  {messageTemplate ? (
                    <p className="whitespace-pre-wrap">{messageTemplate}</p>
                  ) : (
                    <p className="text-neutral-400">No message template yet. Enter a message to see preview.</p>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AutoMessage;
