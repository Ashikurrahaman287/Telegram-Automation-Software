import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "@/lib/utils";
import AddAccountModal from "@/components/account/AddAccountModal";

interface TelegramAccount {
  id: number;
  phoneNumber: string;
  apiId: string;
  apiHash: string;
  sessionString: string;
  isActive: boolean;
  status: string;
  lastUsed: string;
  createdAt: string;
  userId: number;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "available":
      return <CheckCircle className="h-5 w-5 text-secondary" />;
    case "limited":
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    case "banned":
      return <XCircle className="h-5 w-5 text-error" />;
    default:
      return <Clock className="h-5 w-5 text-neutral-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "available":
      return <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary border-secondary">Available</Badge>;
    case "limited":
      return <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning border-warning">Limited</Badge>;
    case "banned":
      return <Badge variant="outline" className="bg-error bg-opacity-10 text-error border-error">Banned</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const AccountStatus: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [checkingAccounts, setCheckingAccounts] = useState<number[]>([]);

  const { data: accounts, isLoading } = useQuery<TelegramAccount[]>({
    queryKey: ["/api/telegram-accounts"],
  });

  const checkAccountStatusMutation = useMutation({
    mutationFn: (accountId: number) => {
      return apiRequest("POST", `/api/telegram-accounts/${accountId}/check-login`, {});
    },
    onMutate: (accountId) => {
      setCheckingAccounts(prev => [...prev, accountId]);
    },
    onSuccess: async (response, accountId) => {
      const data = await response.json();
      
      // Update account status
      const updateResponse = await apiRequest("PUT", `/api/telegram-accounts/${accountId}`, {
        status: data.loggedIn ? "available" : "limited",
        lastUsed: new Date().toISOString()
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/telegram-accounts"] });
      toast({
        title: "Status Check Complete",
        description: data.loggedIn 
          ? "Account is active and available" 
          : `Account has issues: ${data.error || "Unknown error"}`,
        variant: data.loggedIn ? "default" : "destructive",
      });
      
      setCheckingAccounts(prev => prev.filter(id => id !== accountId));
    },
    onError: (error: Error, accountId) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setCheckingAccounts(prev => prev.filter(id => id !== accountId));
    }
  });

  const toggleAccountActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => {
      return apiRequest("PUT", `/api/telegram-accounts/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telegram-accounts"] });
      toast({
        title: "Account Updated",
        description: "Account status has been updated successfully",
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

  const handleCheckAccountStatus = (accountId: number) => {
    checkAccountStatusMutation.mutate(accountId);
  };

  const handleToggleAccountActive = (account: TelegramAccount) => {
    toggleAccountActiveMutation.mutate({ 
      id: account.id, 
      isActive: !account.isActive 
    });
  };

  const handleCheckAllAccounts = () => {
    if (!accounts) return;
    
    toast({
      title: "Checking All Accounts",
      description: "Starting status check for all accounts. This may take a while.",
    });
    
    // Check accounts sequentially to avoid rate limiting
    const checkNext = (index: number) => {
      if (index >= accounts.length) return;
      
      const account = accounts[index];
      checkAccountStatusMutation.mutate(account.id);
      
      // Check next account after a delay
      setTimeout(() => checkNext(index + 1), 3000);
    };
    
    checkNext(0);
  };

  const filteredAccounts = accounts?.filter(account => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return account.isActive;
    if (activeTab === "available") return account.status === "available";
    if (activeTab === "limited") return account.status === "limited";
    if (activeTab === "banned") return account.status === "banned";
    return true;
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">Account Status</h1>
        <p className="text-neutral-500">Monitor and manage your Telegram account status</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Telegram Accounts</CardTitle>
              <CardDescription>
                Check and manage your automation accounts
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCheckAllAccounts}
                disabled={isLoading || !accounts || accounts.length === 0}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Check All Accounts
              </Button>
              <AddAccountModal 
                trigger={
                  <Button>
                    <i className="fas fa-plus mr-2"></i>
                    Add Account
                  </Button>
                }
              />
            </div>
          </CardHeader>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="limited">Limited</TabsTrigger>
                <TabsTrigger value="banned">Banned</TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>API Status</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-32">
                          <div className="flex flex-col items-center justify-center">
                            <i className="fas fa-spinner fa-spin text-2xl mb-2 text-primary"></i>
                            <p>Loading accounts...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredAccounts && filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.phoneNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(account.status)}
                              <span>{getStatusBadge(account.status)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {account.isActive ? (
                              <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary border-secondary">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-neutral-200 text-neutral-600 border-neutral-400">
                                Disabled
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {account.lastUsed ? formatDistanceToNow(new Date(account.lastUsed)) : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCheckAccountStatus(account.id)}
                                disabled={checkingAccounts.includes(account.id)}
                              >
                                {checkingAccounts.includes(account.id) ? (
                                  <i className="fas fa-spinner fa-spin mr-1"></i>
                                ) : (
                                  <i className="fas fa-sync-alt mr-1"></i>
                                )}
                                Check
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <i className="fas fa-ellipsis-v"></i>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleToggleAccountActive(account)}>
                                    {account.isActive ? (
                                      <>
                                        <i className="fas fa-ban mr-2 text-error"></i>
                                        <span>Disable Account</span>
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-check-circle mr-2 text-secondary"></i>
                                        <span>Enable Account</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <i className="fas fa-edit mr-2 text-primary"></i>
                                    <span>Edit Account</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <i className="fas fa-trash-alt mr-2 text-error"></i>
                                    <span>Delete Account</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          <p className="text-neutral-500">No accounts found</p>
                          {activeTab !== "all" && (
                            <p className="text-sm text-neutral-400 mt-1">
                              Try selecting a different status filter
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Tabs>
          
          <CardFooter className="border-t flex justify-between items-center">
            <div className="text-sm text-neutral-500">
              {accounts ? (
                <span>
                  Showing {filteredAccounts?.length || 0} of {accounts.length} accounts
                </span>
              ) : (
                <span>Loading account information...</span>
              )}
            </div>
            
            {accounts && accounts.length > 0 && (
              <div className="flex space-x-4 items-center">
                <div className="flex items-center space-x-1">
                  <span className="h-3 w-3 rounded-full bg-secondary"></span>
                  <span className="text-xs text-neutral-600">Available: {accounts.filter(a => a.status === "available").length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-3 w-3 rounded-full bg-warning"></span>
                  <span className="text-xs text-neutral-600">Limited: {accounts.filter(a => a.status === "limited").length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-3 w-3 rounded-full bg-error"></span>
                  <span className="text-xs text-neutral-600">Banned: {accounts.filter(a => a.status === "banned").length}</span>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default AccountStatus;
