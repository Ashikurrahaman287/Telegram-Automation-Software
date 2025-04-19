import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

interface SearchResult {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

const UserSearch: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [searchType, setSearchType] = useState<"username" | "name" | "all">("all");
  const [limit, setLimit] = useState(20);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<TelegramAccount[]>({
    queryKey: ["/api/telegram-accounts"],
  });

  const searchMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest("POST", "/api/telegram/search-users", data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        toast({
          title: "No results",
          description: "Your search did not return any results. Try a different query.",
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${data.length} users matching your query`,
        });
      }
      setIsSearching(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSearching(false);
    }
  });

  const saveContactsMutation = useMutation({
    mutationFn: (contacts: any[]) => {
      // Create batch of contacts
      return Promise.all(contacts.map(contact => 
        apiRequest("POST", "/api/contacts", {
          telegramId: contact.id,
          username: contact.username,
          firstName: contact.firstName,
          lastName: contact.lastName,
          groupSource: "Search results",
          userId: 1 // In a real app, this would come from auth
        })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contacts Saved",
        description: `${selectedResults.length} contacts have been saved to your database`,
      });
      setSelectedResults([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    if (!searchQuery) {
      toast({
        title: "Missing Information",
        description: "Please enter a search query",
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

    setIsSearching(true);
    setSearchResults([]);
    searchMutation.mutate({
      accountId: parseInt(selectedAccountId),
      query: searchQuery,
      limit: limit
    });
  };

  const handleSaveSelected = () => {
    if (selectedResults.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one user to save",
        variant: "destructive",
      });
      return;
    }

    const contactsToSave = searchResults.filter(result => 
      selectedResults.includes(result.id)
    );
    
    saveContactsMutation.mutate(contactsToSave);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(searchResults.map(result => result.id));
    } else {
      setSelectedResults([]);
    }
  };

  const toggleSelectResult = (id: string) => {
    if (selectedResults.includes(id)) {
      setSelectedResults(selectedResults.filter(resultId => resultId !== id));
    } else {
      setSelectedResults([...selectedResults, id]);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">User Search</h1>
        <p className="text-neutral-500">Search for users by username, name, or other criteria</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Search Criteria</CardTitle>
              <CardDescription>
                Configure your search parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    id="search-query"
                    placeholder="Enter username or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Search Type</Label>
                <RadioGroup 
                  value={searchType} 
                  onValueChange={(value) => setSearchType(value as "username" | "name" | "all")}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="username" id="search-username" />
                    <Label htmlFor="search-username" className="cursor-pointer">Search by username</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="name" id="search-name" />
                    <Label htmlFor="search-name" className="cursor-pointer">Search by name</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="search-all" />
                    <Label htmlFor="search-all" className="cursor-pointer">Search all fields</Label>
                  </div>
                </RadioGroup>
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
                <Label htmlFor="limit">Result Limit</Label>
                <Select value={limit.toString()} onValueChange={(val) => setLimit(parseInt(val))}>
                  <SelectTrigger id="limit">
                    <SelectValue placeholder="Select limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 results</SelectItem>
                    <SelectItem value="20">20 results</SelectItem>
                    <SelectItem value="50">50 results</SelectItem>
                    <SelectItem value="100">100 results</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSearchQuery("")}>Clear</Button>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery || !selectedAccountId}
              >
                {isSearching ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search mr-2"></i>
                    Search
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Users matching your search criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchResults.length > 0 && (
                <div className="mb-4 flex items-center">
                  <Checkbox
                    id="select-all"
                    checked={selectedResults.length === searchResults.length && searchResults.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <Label htmlFor="select-all" className="ml-2">Select All</Label>
                  <div className="ml-auto">
                    <span className="text-sm text-neutral-500">
                      {selectedResults.length} of {searchResults.length} selected
                    </span>
                  </div>
                </div>
              )}

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isSearching ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          <div className="flex flex-col items-center">
                            <i className="fas fa-spinner fa-spin text-2xl mb-2 text-primary"></i>
                            <p>Searching Telegram for users...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedResults.includes(result.id)}
                              onCheckedChange={() => toggleSelectResult(result.id)}
                            />
                          </TableCell>
                          <TableCell>{result.username || "N/A"}</TableCell>
                          <TableCell>{result.firstName || "N/A"}</TableCell>
                          <TableCell>{result.lastName || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-user-plus mr-1"></i> Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          <div className="flex flex-col items-center">
                            <Search className="h-10 w-10 text-neutral-300 mb-2" />
                            <p className="text-neutral-500">Enter a search query and click Search to find users</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {searchResults.length > 0 && (
              <CardFooter className="flex justify-between border-t pt-4">
                <span className="text-sm text-neutral-500">{searchResults.length} result(s) found</span>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <i className="fas fa-file-export mr-2"></i>
                    Export
                  </Button>
                  <Button 
                    onClick={handleSaveSelected}
                    disabled={selectedResults.length === 0}
                  >
                    <i className="fas fa-save mr-2"></i>
                    Save Selected
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserSearch;
