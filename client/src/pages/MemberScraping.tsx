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
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface TelegramAccount {
  id: number;
  phoneNumber: string;
  status: string;
  isActive: boolean;
}

const MemberScraping: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [groupUsername, setGroupUsername] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [limit, setLimit] = useState(100);
  const [saveContacts, setSaveContacts] = useState(true);
  
  // Scraped members state
  const [scrapedMembers, setScrapedMembers] = useState<any[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<TelegramAccount[]>({
    queryKey: ["/api/telegram-accounts"],
  });
  
  const scrapeMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest("POST", "/api/telegram/scrape-members", data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setScrapedMembers(data);
      toast({
        title: "Success",
        description: `Scraped ${data.length} members from the group`,
      });
      setIsScraping(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsScraping(false);
    }
  });
  
  const saveContactsMutation = useMutation({
    mutationFn: (contacts: any[]) => {
      // Create a task for saving contacts
      return apiRequest("POST", "/api/tasks", {
        name: "Save Scraped Contacts",
        type: "save_contacts",
        config: {
          source: groupUsername,
          contacts: contacts,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Contacts Saved",
        description: `${scrapedMembers.length} contacts have been saved to your database`,
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
  
  const handleScrape = () => {
    if (!groupUsername) {
      toast({
        title: "Missing Information",
        description: "Please enter a group username",
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
    
    setIsScraping(true);
    scrapeMutation.mutate({
      accountId: parseInt(selectedAccountId),
      groupUsername: groupUsername.startsWith('@') ? groupUsername : '@' + groupUsername,
      limit
    });
  };
  
  const handleSaveContacts = () => {
    if (scrapedMembers.length === 0) {
      toast({
        title: "No Members",
        description: "There are no members to save",
        variant: "destructive",
      });
      return;
    }
    
    saveContactsMutation.mutate(scrapedMembers);
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">Member Scraping</h1>
        <p className="text-neutral-500">Extract member data from Telegram groups</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Configuration</CardTitle>
              <CardDescription>
                Configure the scraping parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group">Group Username</Label>
                <Input 
                  id="group" 
                  placeholder="@group_username" 
                  value={groupUsername}
                  onChange={(e) => setGroupUsername(e.target.value)}
                />
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
                          disabled={!account.isActive}
                        >
                          {account.phoneNumber} {!account.isActive && "(Inactive)"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No accounts available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit">Limit ({limit} members)</Label>
                <Slider
                  id="limit"
                  min={10}
                  max={1000}
                  step={10}
                  value={[limit]}
                  onValueChange={(values) => setLimit(values[0])}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="save-contacts"
                  checked={saveContacts}
                  onCheckedChange={setSaveContacts}
                />
                <Label htmlFor="save-contacts">Save contacts to database</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Clear</Button>
              <Button 
                onClick={handleScrape} 
                disabled={isScraping || !groupUsername || !selectedAccountId}
              >
                {isScraping ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Scraping...
                  </>
                ) : (
                  <>
                    <i className="fas fa-users mr-2"></i>
                    Start Scraping
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Scraped Members</CardTitle>
              <CardDescription>
                Members extracted from the group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>
                  {scrapedMembers.length > 0 
                    ? `Total ${scrapedMembers.length} members scraped` 
                    : "No members scraped yet"}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scrapedMembers.length > 0 ? (
                    scrapedMembers.map((member, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{member.username || "N/A"}</TableCell>
                        <TableCell>{member.firstName || "N/A"}</TableCell>
                        <TableCell>{member.lastName || "N/A"}</TableCell>
                        <TableCell>
                          <span className={`text-xs rounded-full px-2 py-1 ${member.isOnline 
                            ? "bg-secondary bg-opacity-10 text-secondary" 
                            : "bg-neutral-200 text-neutral-600"}`}
                          >
                            {member.isOnline ? "Online" : "Offline"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : isScraping ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Scraping members...
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No members scraped yet. Configure and start scraping.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {scrapedMembers.length > 0 && (
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline">
                  <i className="fas fa-file-export mr-2"></i>
                  Export CSV
                </Button>
                <Button onClick={handleSaveContacts} disabled={!saveContacts}>
                  <i className="fas fa-save mr-2"></i>
                  Save to Database
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default MemberScraping;
