import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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

interface TelegramAccount {
  id: number;
  phoneNumber: string;
  status: string;
  isActive: boolean;
}

const AvatarUpload: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<TelegramAccount[]>({
    queryKey: ["/api/telegram-accounts"],
  });
  
  const uploadAvatarMutation = useMutation({
    mutationFn: (data: any) => {
      // In a real implementation, this would upload files to the server
      // and create tasks for avatar uploads
      return apiRequest("POST", "/api/tasks", {
        name: "Upload Avatars",
        type: "upload_avatars",
        config: {
          accountIds: selectedAccounts.map(id => parseInt(id)),
          avatarPaths: Array.from(Array(selectedFiles?.length || 0).keys()).map(i => `/tmp/avatar_${i}.jpg`)
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Created",
        description: `Started uploading avatars to ${selectedAccounts.length} accounts`,
      });
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };
  
  const handleToggleAccount = (accountId: string) => {
    if (selectedAccounts.includes(accountId)) {
      setSelectedAccounts(selectedAccounts.filter(id => id !== accountId));
    } else {
      setSelectedAccounts([...selectedAccounts, accountId]);
    }
  };
  
  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select avatar images to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedAccounts.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one Telegram account",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        selectedAccounts.forEach(id => {
          const idNum = parseInt(id);
          if (!newProgress[idNum] || newProgress[idNum] < 100) {
            newProgress[idNum] = (newProgress[idNum] || 0) + Math.floor(Math.random() * 10);
            if (newProgress[idNum] > 100) newProgress[idNum] = 100;
          }
        });
        
        // Check if all uploads are complete
        const allComplete = selectedAccounts.every(id => newProgress[parseInt(id)] >= 100);
        if (allComplete) {
          clearInterval(interval);
          
          // Call the mutation after "uploading" is done
          uploadAvatarMutation.mutate({});
        }
        
        return newProgress;
      });
    }, 500);
    
    // Cleanup if component unmounts during upload
    return () => clearInterval(interval);
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">Avatar Upload</h1>
        <p className="text-neutral-500">Update profile pictures for your Telegram accounts</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Configuration</CardTitle>
              <CardDescription>
                Select avatar images to upload
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-10 w-10 mx-auto mb-2 text-neutral-400" />
                <h3 className="font-medium mb-1">Drag and drop avatar images</h3>
                <p className="text-sm text-neutral-500 mb-4">
                  Or click to browse files
                </p>
                <Input 
                  id="avatars" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button asChild>
                  <Label htmlFor="avatars">Select Images</Label>
                </Button>
                
                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-4 text-left">
                    <p className="text-sm font-medium mb-2">{selectedFiles.length} images selected:</p>
                    <ul className="text-xs text-neutral-600 space-y-1">
                      {Array.from(selectedFiles).map((file, index) => (
                        <li key={index} className="truncate">
                          • {file.name} ({Math.round(file.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Changing avatars too frequently may trigger Telegram's anti-spam measures. Use with caution.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedFiles(null)}>Clear</Button>
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || !selectedFiles || selectedFiles.length === 0 || selectedAccounts.length === 0}
              >
                {isUploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-image mr-2"></i>
                    Start Upload
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Accounts</CardTitle>
              <CardDescription>
                Choose accounts to update avatars for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingAccounts ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Loading accounts...
                        </TableCell>
                      </TableRow>
                    ) : accounts && accounts.length > 0 ? (
                      accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={selectedAccounts.includes(account.id.toString())} 
                              onChange={() => handleToggleAccount(account.id.toString())}
                              disabled={!account.isActive || account.status !== "available"}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>{account.phoneNumber}</TableCell>
                          <TableCell>
                            <span className={`text-xs rounded-full px-2 py-1 ${
                              account.status === "available" 
                                ? "bg-secondary bg-opacity-10 text-secondary" 
                                : "bg-error bg-opacity-10 text-error"
                            }`}>
                              {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {isUploading && selectedAccounts.includes(account.id.toString()) ? (
                              <div className="flex items-center">
                                <Progress 
                                  value={uploadProgress[account.id] || 0} 
                                  className="h-2 w-full mr-2" 
                                />
                                <span className="text-xs text-neutral-500 whitespace-nowrap">
                                  {uploadProgress[account.id] || 0}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-500">Not started</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No accounts available. Add Telegram accounts first.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Separator />
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedAccounts([])}
                  disabled={isUploading}
                >
                  Clear Selection
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    if (accounts) {
                      setSelectedAccounts(
                        accounts
                          .filter(account => account.isActive && account.status === "available")
                          .map(account => account.id.toString())
                      );
                    }
                  }}
                  disabled={isUploading || !accounts || accounts.length === 0}
                >
                  Select All Available
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AvatarUpload;
