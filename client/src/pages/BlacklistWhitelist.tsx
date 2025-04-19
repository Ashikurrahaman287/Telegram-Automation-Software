import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface Contact {
  id: number;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  groupSource: string;
  isBlacklisted: boolean;
  isWhitelisted: boolean;
  createdAt: string;
  userId: number;
}

const BlacklistWhitelist: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("blacklist");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [bulkContactsText, setBulkContactsText] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Get the contacts with the appropriate filter
  const { data: blacklistedContacts, isLoading: isLoadingBlacklist } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", { blacklisted: true }],
  });
  
  const { data: whitelistedContacts, isLoading: isLoadingWhitelist } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", { whitelisted: true }],
  });
  
  const { data: allContacts, isLoading: isLoadingAllContacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });
  
  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => {
      return apiRequest("PUT", `/api/contacts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact Updated",
        description: "Contact has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const createContactMutation = useMutation({
    mutationFn: (contactData: any) => {
      return apiRequest("POST", "/api/contacts", contactData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact Added",
        description: "Contact has been added successfully",
      });
      setBulkContactsText("");
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleRemoveFromBlacklist = (contactId: number) => {
    updateContactMutation.mutate({
      id: contactId,
      data: { isBlacklisted: false }
    });
  };
  
  const handleRemoveFromWhitelist = (contactId: number) => {
    updateContactMutation.mutate({
      id: contactId,
      data: { isWhitelisted: false }
    });
  };
  
  const handleAddToBlacklist = (contactId: number) => {
    updateContactMutation.mutate({
      id: contactId,
      data: { isBlacklisted: true, isWhitelisted: false }
    });
  };
  
  const handleAddToWhitelist = (contactId: number) => {
    updateContactMutation.mutate({
      id: contactId,
      data: { isWhitelisted: true, isBlacklisted: false }
    });
  };
  
  const handleToggleSelectContact = (contactId: number) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(selectedContactIds.filter(id => id !== contactId));
    } else {
      setSelectedContactIds([...selectedContactIds, contactId]);
    }
  };
  
  const handleSelectAll = (contacts: Contact[] | undefined) => {
    if (!contacts) return;
    
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(contacts.map(contact => contact.id));
    }
  };
  
  const handleBulkAddContacts = () => {
    if (!bulkContactsText.trim()) {
      toast({
        title: "No Contacts",
        description: "Please enter contact data to import",
        variant: "destructive",
      });
      return;
    }
    
    const lines = bulkContactsText.trim().split("\n");
    const successfulContacts: string[] = [];
    const failedContacts: string[] = [];
    
    // Process each line
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Try to parse contact
      try {
        // Determine if it's a username or ID
        let telegramId = trimmedLine;
        let username = "";
        
        if (trimmedLine.startsWith("@")) {
          username = trimmedLine.substring(1);
          telegramId = "id_" + Math.random().toString(36).substring(2, 10);
        }
        
        // Add to blacklist or whitelist based on active tab
        createContactMutation.mutate({
          telegramId,
          username,
          firstName: "",
          lastName: "",
          phone: "",
          groupSource: "Manual Import",
          isBlacklisted: activeTab === "blacklist",
          isWhitelisted: activeTab === "whitelist"
        });
        
        successfulContacts.push(trimmedLine);
      } catch (error) {
        failedContacts.push(trimmedLine);
      }
    });
    
    if (successfulContacts.length > 0) {
      toast({
        title: "Contacts Added",
        description: `Successfully added ${successfulContacts.length} contacts${failedContacts.length > 0 ? `, ${failedContacts.length} failed` : ""}`,
      });
    } else if (failedContacts.length > 0) {
      toast({
        title: "Failed to Add Contacts",
        description: "Could not parse any of the provided contact data.",
        variant: "destructive",
      });
    }
  };
  
  const handleBulkActions = (action: 'blacklist' | 'whitelist' | 'remove') => {
    if (selectedContactIds.length === 0) {
      toast({
        title: "No Contacts Selected",
        description: "Please select contacts to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    // Perform the action on each selected contact
    selectedContactIds.forEach(contactId => {
      if (action === 'blacklist') {
        updateContactMutation.mutate({
          id: contactId,
          data: { isBlacklisted: true, isWhitelisted: false }
        });
      } else if (action === 'whitelist') {
        updateContactMutation.mutate({
          id: contactId,
          data: { isWhitelisted: true, isBlacklisted: false }
        });
      } else if (action === 'remove') {
        if (activeTab === 'blacklist') {
          updateContactMutation.mutate({
            id: contactId,
            data: { isBlacklisted: false }
          });
        } else {
          updateContactMutation.mutate({
            id: contactId,
            data: { isWhitelisted: false }
          });
        }
      }
    });
    
    toast({
      title: "Bulk Action Complete",
      description: `Action performed on ${selectedContactIds.length} contacts`,
    });
    
    // Clear selection
    setSelectedContactIds([]);
  };
  
  // Filter the contacts based on search query
  const filterContacts = (contacts: Contact[] | undefined) => {
    if (!contacts) return [];
    if (!searchQuery) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      (contact.username && contact.username.toLowerCase().includes(query)) ||
      (contact.firstName && contact.firstName.toLowerCase().includes(query)) ||
      (contact.lastName && contact.lastName.toLowerCase().includes(query)) ||
      (contact.telegramId && contact.telegramId.toLowerCase().includes(query))
    );
  };
  
  const filteredBlacklist = filterContacts(blacklistedContacts);
  const filteredWhitelist = filterContacts(whitelistedContacts);
  const filteredAllContacts = filterContacts(allContacts?.filter(c => !c.isBlacklisted && !c.isWhitelisted));
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">Blacklist & Whitelist</h1>
        <p className="text-neutral-500">Manage contacts that you want to specifically include or exclude</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Contact Lists</CardTitle>
              <CardDescription>
                Manage contacts in your blacklist and whitelist
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <i className="fas fa-plus mr-2"></i>
                    Add Contacts
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add Contacts to {activeTab === "blacklist" ? "Blacklist" : "Whitelist"}</DialogTitle>
                    <DialogDescription>
                      Enter usernames or IDs to add to your {activeTab === "blacklist" ? "blacklist" : "whitelist"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulk-contacts">Contact List</Label>
                      <Textarea 
                        id="bulk-contacts"
                        placeholder="Enter usernames or IDs, one per line"
                        value={bulkContactsText}
                        onChange={(e) => setBulkContactsText(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-neutral-500">
                        Enter one username or ID per line (e.g., @username or 123456789)
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBulkAddContacts}
                      disabled={createContactMutation.isPending}
                    >
                      {createContactMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Adding...
                        </>
                      ) : (
                        <>Add to {activeTab === "blacklist" ? "Blacklist" : "Whitelist"}</>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <Tabs defaultValue="blacklist" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
                <TabsTrigger value="whitelist">Whitelist</TabsTrigger>
                <TabsTrigger value="all">All Contacts</TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="pt-6">
              {/* Blacklist Tab */}
              <TabsContent value="blacklist" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="select-all-blacklist" 
                      checked={selectedContactIds.length > 0 && blacklistedContacts && selectedContactIds.length === blacklistedContacts.length}
                      onCheckedChange={() => handleSelectAll(blacklistedContacts)}
                    />
                    <Label htmlFor="select-all-blacklist">Select All</Label>
                  </div>
                  
                  {selectedContactIds.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neutral-500">
                        {selectedContactIds.length} selected
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleBulkActions('whitelist')}
                      >
                        Move to Whitelist
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleBulkActions('remove')}
                      >
                        Remove from Blacklist
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingBlacklist ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            <div className="flex flex-col items-center justify-center">
                              <i className="fas fa-spinner fa-spin text-lg mb-2 text-primary"></i>
                              <p>Loading blacklisted contacts...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredBlacklist && filteredBlacklist.length > 0 ? (
                        filteredBlacklist.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedContactIds.includes(contact.id)}
                                onCheckedChange={() => handleToggleSelectContact(contact.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {contact.username ? `@${contact.username}` : "N/A"}
                            </TableCell>
                            <TableCell>
                              {contact.firstName || contact.lastName ? 
                                `${contact.firstName || ""} ${contact.lastName || ""}`.trim() : 
                                "N/A"}
                            </TableCell>
                            <TableCell>{contact.groupSource || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleAddToWhitelist(contact.id)}
                                >
                                  <i className="fas fa-exchange-alt mr-1"></i>
                                  Move to Whitelist
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRemoveFromBlacklist(contact.id)}
                                >
                                  <i className="fas fa-times mr-1 text-error"></i>
                                  Remove
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            <p className="text-neutral-500">No blacklisted contacts found</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setIsAddDialogOpen(true)}
                            >
                              <i className="fas fa-plus mr-1"></i>
                              Add to Blacklist
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="text-sm text-neutral-500">
                  Blacklisted contacts will be excluded from all operations
                </div>
              </TabsContent>
              
              {/* Whitelist Tab */}
              <TabsContent value="whitelist" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="select-all-whitelist" 
                      checked={selectedContactIds.length > 0 && whitelistedContacts && selectedContactIds.length === whitelistedContacts.length}
                      onCheckedChange={() => handleSelectAll(whitelistedContacts)}
                    />
                    <Label htmlFor="select-all-whitelist">Select All</Label>
                  </div>
                  
                  {selectedContactIds.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neutral-500">
                        {selectedContactIds.length} selected
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleBulkActions('blacklist')}
                      >
                        Move to Blacklist
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleBulkActions('remove')}
                      >
                        Remove from Whitelist
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingWhitelist ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            <div className="flex flex-col items-center justify-center">
                              <i className="fas fa-spinner fa-spin text-lg mb-2 text-primary"></i>
                              <p>Loading whitelisted contacts...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredWhitelist && filteredWhitelist.length > 0 ? (
                        filteredWhitelist.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedContactIds.includes(contact.id)}
                                onCheckedChange={() => handleToggleSelectContact(contact.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {contact.username ? `@${contact.username}` : "N/A"}
                            </TableCell>
                            <TableCell>
                              {contact.firstName || contact.lastName ? 
                                `${contact.firstName || ""} ${contact.lastName || ""}`.trim() : 
                                "N/A"}
                            </TableCell>
                            <TableCell>{contact.groupSource || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleAddToBlacklist(contact.id)}
                                >
                                  <i className="fas fa-exchange-alt mr-1"></i>
                                  Move to Blacklist
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRemoveFromWhitelist(contact.id)}
                                >
                                  <i className="fas fa-times mr-1 text-error"></i>
                                  Remove
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            <p className="text-neutral-500">No whitelisted contacts found</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setIsAddDialogOpen(true)}
                            >
                              <i className="fas fa-plus mr-1"></i>
                              Add to Whitelist
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="text-sm text-neutral-500">
                  Whitelisted contacts will be prioritized in operations
                </div>
              </TabsContent>
              
              {/* All Contacts Tab */}
              <TabsContent value="all" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="select-all-contacts" 
                      checked={selectedContactIds.length > 0 && filteredAllContacts && selectedContactIds.length === filteredAllContacts.length}
                      onCheckedChange={() => handleSelectAll(filteredAllContacts)}
                    />
                    <Label htmlFor="select-all-contacts">Select All</Label>
                  </div>
                  
                  {selectedContactIds.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neutral-500">
                        {selectedContactIds.length} selected
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleBulkActions('blacklist')}
                      >
                        Add to Blacklist
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleBulkActions('whitelist')}
                      >
                        Add to Whitelist
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingAllContacts ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            <div className="flex flex-col items-center justify-center">
                              <i className="fas fa-spinner fa-spin text-lg mb-2 text-primary"></i>
                              <p>Loading contacts...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredAllContacts && filteredAllContacts.length > 0 ? (
                        filteredAllContacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedContactIds.includes(contact.id)}
                                onCheckedChange={() => handleToggleSelectContact(contact.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {contact.username ? `@${contact.username}` : "N/A"}
                            </TableCell>
                            <TableCell>
                              {contact.firstName || contact.lastName ? 
                                `${contact.firstName || ""} ${contact.lastName || ""}`.trim() : 
                                "N/A"}
                            </TableCell>
                            <TableCell>{contact.groupSource || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <i className="fas fa-ellipsis-v"></i>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleAddToBlacklist(contact.id)}>
                                    <i className="fas fa-ban mr-2 text-error"></i>
                                    <span>Add to Blacklist</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAddToWhitelist(contact.id)}>
                                    <i className="fas fa-check-circle mr-2 text-secondary"></i>
                                    <span>Add to Whitelist</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            <p className="text-neutral-500">No contacts found</p>
                            <p className="text-sm text-neutral-400 mt-1">
                              Try using the Member Scraping tool to find users
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
          
          <CardFooter className="border-t">
            <div className="w-full flex flex-col space-y-2">
              <div className="flex justify-between">
                <div className="text-sm text-neutral-500">
                  <span className="font-medium">Blacklist:</span> {blacklistedContacts?.length || 0} contacts
                </div>
                <div className="text-sm text-neutral-500">
                  <span className="font-medium">Whitelist:</span> {whitelistedContacts?.length || 0} contacts
                </div>
                <div className="text-sm text-neutral-500">
                  <span className="font-medium">Total Contacts:</span> {allContacts?.length || 0}
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Blacklist & Whitelist Usage</CardTitle>
            <CardDescription>
              How these lists are used in your automation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <i className="fas fa-ban text-error mr-2"></i>
                  Blacklist
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>Blacklisted contacts will be excluded from all mass operations</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>Use for competitors, spam accounts, or people who requested no contact</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>You can manually add contacts or import them in bulk</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>Blacklisted contacts will show a warning if you try to add them to operations</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <i className="fas fa-check-circle text-secondary mr-2"></i>
                  Whitelist
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>Whitelisted contacts are prioritized in all operations</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>Use for important contacts, VIPs, or engaged customers</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>Whitelisted contacts can be added to special campaign groups</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>You can filter operations to only target whitelisted contacts</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BlacklistWhitelist;
