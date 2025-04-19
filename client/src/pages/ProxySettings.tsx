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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Network } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { formatDistanceToNow } from "@/lib/utils";

interface Proxy {
  id: number;
  host: string;
  port: number;
  username: string | null;
  password: string | null;
  type: string;
  isActive: boolean;
  lastChecked: string | null;
  status: string;
  userId: number;
}

const ProxySettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [checkingProxies, setCheckingProxies] = useState<number[]>([]);
  
  // Form state for adding new proxy
  const [proxyHost, setProxyHost] = useState("");
  const [proxyPort, setProxyPort] = useState("");
  const [proxyUsername, setProxyUsername] = useState("");
  const [proxyPassword, setProxyPassword] = useState("");
  const [proxyType, setProxyType] = useState("socks5");
  const [bulkProxies, setBulkProxies] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<{
    host?: string;
    port?: string;
  }>({});

  const { data: proxies, isLoading } = useQuery<Proxy[]>({
    queryKey: ["/api/proxies"],
  });

  const createProxyMutation = useMutation({
    mutationFn: (proxyData: any) => {
      return apiRequest("POST", "/api/proxies", proxyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
      toast({
        title: "Proxy Added",
        description: "New proxy has been added successfully",
      });
      // Reset form
      setProxyHost("");
      setProxyPort("");
      setProxyUsername("");
      setProxyPassword("");
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

  const updateProxyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => {
      return apiRequest("PUT", `/api/proxies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
      toast({
        title: "Proxy Updated",
        description: "Proxy has been updated successfully",
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

  const deleteProxyMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/proxies/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
      toast({
        title: "Proxy Deleted",
        description: "Proxy has been deleted successfully",
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

  // Simulate checking a proxy - in a real app, this would send a request to the server
  const checkProxyMutation = useMutation({
    mutationFn: (id: number) => {
      setCheckingProxies(prev => [...prev, id]);
      
      // Simulate API call to check proxy
      return new Promise<{success: boolean, status: string}>((resolve) => {
        setTimeout(() => {
          // Simulate success/failure
          const success = Math.random() > 0.3;
          const status = success ? "working" : (Math.random() > 0.5 ? "slow" : "dead");
          resolve({ success, status });
        }, 1500);
      });
    },
    onSuccess: async (result, id) => {
      // Update proxy status
      await updateProxyMutation.mutate({
        id,
        data: {
          status: result.status,
          lastChecked: new Date().toISOString()
        }
      });
      
      setCheckingProxies(prev => prev.filter(proxyId => proxyId !== id));
      
      toast({
        title: "Proxy Check Complete",
        description: result.success 
          ? "Proxy is working correctly" 
          : "Proxy check failed or connection is slow",
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: Error, id) => {
      setCheckingProxies(prev => prev.filter(proxyId => proxyId !== id));
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCheckProxy = (id: number) => {
    checkProxyMutation.mutate(id);
  };

  const handleToggleProxyActive = (proxy: Proxy) => {
    updateProxyMutation.mutate({
      id: proxy.id,
      data: { isActive: !proxy.isActive }
    });
  };

  const handleDeleteProxy = (id: number) => {
    deleteProxyMutation.mutate(id);
  };

  const handleAddProxy = () => {
    // Validate form
    const errors: {host?: string; port?: string} = {};
    
    if (!proxyHost) {
      errors.host = "Host is required";
    }
    
    if (!proxyPort) {
      errors.port = "Port is required";
    } else if (isNaN(parseInt(proxyPort))) {
      errors.port = "Port must be a number";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    
    createProxyMutation.mutate({
      host: proxyHost,
      port: parseInt(proxyPort),
      username: proxyUsername || null,
      password: proxyPassword || null,
      type: proxyType
    });
  };

  const handleAddBulkProxies = () => {
    if (!bulkProxies.trim()) {
      toast({
        title: "No Proxies",
        description: "Please enter proxy data to import",
        variant: "destructive",
      });
      return;
    }
    
    const lines = bulkProxies.trim().split("\n");
    const successfulProxies: string[] = [];
    const failedProxies: string[] = [];
    
    // Process each line
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      try {
        // Try to parse proxy format like ip:port:username:password or ip:port
        const parts = trimmedLine.split(":");
        
        if (parts.length >= 2) {
          const host = parts[0];
          const port = parseInt(parts[1]);
          
          if (host && !isNaN(port)) {
            const username = parts.length > 2 ? parts[2] : null;
            const password = parts.length > 3 ? parts[3] : null;
            
            // In a real app, we'd batch these or handle them better
            createProxyMutation.mutate({
              host,
              port,
              username,
              password,
              type: proxyType
            });
            
            successfulProxies.push(trimmedLine);
          } else {
            failedProxies.push(trimmedLine);
          }
        } else {
          failedProxies.push(trimmedLine);
        }
      } catch (error) {
        failedProxies.push(trimmedLine);
      }
    });
    
    if (successfulProxies.length > 0) {
      toast({
        title: "Proxies Added",
        description: `Successfully added ${successfulProxies.length} proxies${failedProxies.length > 0 ? `, ${failedProxies.length} failed` : ""}`,
      });
      setBulkProxies("");
    } else if (failedProxies.length > 0) {
      toast({
        title: "Failed to Add Proxies",
        description: "Could not parse any of the provided proxy data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleCheckAllProxies = () => {
    if (!proxies) return;
    
    toast({
      title: "Checking All Proxies",
      description: "Starting status check for all proxies. This may take a while.",
    });
    
    // Check proxies sequentially to avoid rate limiting
    const checkNext = (index: number) => {
      if (index >= proxies.length) return;
      
      const proxy = proxies[index];
      checkProxyMutation.mutate(proxy.id);
      
      // Check next proxy after a delay
      setTimeout(() => checkNext(index + 1), 2000);
    };
    
    checkNext(0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "working":
        return <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary border-secondary">Working</Badge>;
      case "slow":
        return <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning border-warning">Slow</Badge>;
      case "dead":
        return <Badge variant="outline" className="bg-error bg-opacity-10 text-error border-error">Dead</Badge>;
      default:
        return <Badge variant="outline" className="bg-neutral-200 text-neutral-600">Unchecked</Badge>;
    }
  };

  const filteredProxies = proxies?.filter(proxy => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return proxy.isActive;
    if (activeTab === "working") return proxy.status === "working";
    if (activeTab === "slow") return proxy.status === "slow";
    if (activeTab === "dead") return proxy.status === "dead";
    return true;
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">Proxy Settings</h1>
        <p className="text-neutral-500">Manage proxies for your Telegram automation</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Proxy List</CardTitle>
              <CardDescription>
                Manage and monitor your proxy connections
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCheckAllProxies}
                disabled={isLoading || !proxies || proxies.length === 0}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Check All Proxies
              </Button>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <i className="fas fa-plus mr-2"></i>
                    Add Proxy
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Proxy</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new proxy server
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="single">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="single">Single Proxy</TabsTrigger>
                      <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="single" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="proxy-host">Host/IP</Label>
                          <Input 
                            id="proxy-host" 
                            value={proxyHost}
                            onChange={(e) => setProxyHost(e.target.value)}
                            placeholder="e.g., 192.168.1.1"
                          />
                          {formErrors.host && (
                            <p className="text-xs text-error">{formErrors.host}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proxy-port">Port</Label>
                          <Input 
                            id="proxy-port" 
                            value={proxyPort}
                            onChange={(e) => setProxyPort(e.target.value)}
                            placeholder="e.g., 8080"
                          />
                          {formErrors.port && (
                            <p className="text-xs text-error">{formErrors.port}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="proxy-type">Proxy Type</Label>
                        <Select value={proxyType} onValueChange={setProxyType}>
                          <SelectTrigger id="proxy-type">
                            <SelectValue placeholder="Select proxy type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="socks5">SOCKS5</SelectItem>
                            <SelectItem value="socks4">SOCKS4</SelectItem>
                            <SelectItem value="http">HTTP</SelectItem>
                            <SelectItem value="https">HTTPS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="proxy-username">Username (Optional)</Label>
                        <Input 
                          id="proxy-username" 
                          value={proxyUsername}
                          onChange={(e) => setProxyUsername(e.target.value)}
                          placeholder="Username if required"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="proxy-password">Password (Optional)</Label>
                        <Input 
                          id="proxy-password" 
                          type="password"
                          value={proxyPassword}
                          onChange={(e) => setProxyPassword(e.target.value)}
                          placeholder="Password if required"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="bulk" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="bulk-proxies">Proxy List</Label>
                        <Textarea 
                          id="bulk-proxies"
                          placeholder="Enter proxies (IP:PORT:USERNAME:PASSWORD or IP:PORT), one per line"
                          value={bulkProxies}
                          onChange={(e) => setBulkProxies(e.target.value)}
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-neutral-500">
                          Format: IP:PORT or IP:PORT:USERNAME:PASSWORD, one proxy per line
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bulk-proxy-type">Proxy Type</Label>
                        <Select value={proxyType} onValueChange={setProxyType}>
                          <SelectTrigger id="bulk-proxy-type">
                            <SelectValue placeholder="Select proxy type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="socks5">SOCKS5</SelectItem>
                            <SelectItem value="socks4">SOCKS4</SelectItem>
                            <SelectItem value="http">HTTP</SelectItem>
                            <SelectItem value="https">HTTPS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={bulkProxies ? handleAddBulkProxies : handleAddProxy}
                      disabled={createProxyMutation.isPending}
                    >
                      {createProxyMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Adding...
                        </>
                      ) : (
                        <>Add Proxy</>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="working">Working</TabsTrigger>
                <TabsTrigger value="slow">Slow</TabsTrigger>
                <TabsTrigger value="dead">Dead</TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Host:Port</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Checked</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-32">
                          <div className="flex flex-col items-center justify-center">
                            <i className="fas fa-spinner fa-spin text-2xl mb-2 text-primary"></i>
                            <p>Loading proxies...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredProxies && filteredProxies.length > 0 ? (
                      filteredProxies.map((proxy) => (
                        <TableRow key={proxy.id}>
                          <TableCell className="font-medium">
                            {proxy.host}:{proxy.port}
                            {proxy.username && (
                              <span className="text-xs text-neutral-500 block">
                                Auth: {proxy.username}:●●●●●●●●
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="uppercase text-sm">{proxy.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{getStatusBadge(proxy.status)}</span>
                              {proxy.isActive ? (
                                <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary border-secondary">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-neutral-200 text-neutral-600 border-neutral-400">
                                  Disabled
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {proxy.lastChecked ? formatDistanceToNow(new Date(proxy.lastChecked)) : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCheckProxy(proxy.id)}
                                disabled={checkingProxies.includes(proxy.id)}
                              >
                                {checkingProxies.includes(proxy.id) ? (
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
                                  <DropdownMenuItem onClick={() => handleToggleProxyActive(proxy)}>
                                    {proxy.isActive ? (
                                      <>
                                        <i className="fas fa-ban mr-2 text-error"></i>
                                        <span>Disable Proxy</span>
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-check-circle mr-2 text-secondary"></i>
                                        <span>Enable Proxy</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <i className="fas fa-edit mr-2 text-primary"></i>
                                    <span>Edit Proxy</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteProxy(proxy.id)}
                                    className="text-error focus:text-error"
                                  >
                                    <i className="fas fa-trash-alt mr-2"></i>
                                    <span>Delete Proxy</span>
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
                          <p className="text-neutral-500">No proxies found</p>
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
              {proxies ? (
                <span>
                  Showing {filteredProxies?.length || 0} of {proxies.length} proxies
                </span>
              ) : (
                <span>Loading proxy information...</span>
              )}
            </div>
            
            {proxies && proxies.length > 0 && (
              <div className="flex space-x-4 items-center">
                <div className="flex items-center space-x-1">
                  <span className="h-3 w-3 rounded-full bg-secondary"></span>
                  <span className="text-xs text-neutral-600">Working: {proxies.filter(p => p.status === "working").length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-3 w-3 rounded-full bg-warning"></span>
                  <span className="text-xs text-neutral-600">Slow: {proxies.filter(p => p.status === "slow").length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-3 w-3 rounded-full bg-error"></span>
                  <span className="text-xs text-neutral-600">Dead: {proxies.filter(p => p.status === "dead").length}</span>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
        
        <Alert>
          <Network className="h-4 w-4" />
          <AlertTitle>Using Proxies</AlertTitle>
          <AlertDescription>
            Proxies help distribute your Telegram requests and reduce the risk of limitations. 
            Regularly check proxy status to ensure optimal performance.
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
};

export default ProxySettings;
