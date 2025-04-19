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
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";

interface TelegramAccount {
  id: number;
  phoneNumber: string;
  status: string;
  isActive: boolean;
}

const GroupPosting: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [message, setMessage] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [delayMin, setDelayMin] = useState(60);
  const [delayMax, setDelayMax] = useState(120);
  const [groupsList, setGroupsList] = useState("");
  const [parsedGroups, setParsedGroups] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("compose");
  const [includeMedia, setIncludeMedia] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Process state
  const [isPosting, setIsPosting] = useState(false);

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<TelegramAccount[]>({
    queryKey: ["/api/telegram-accounts"],
  });

  const postToGroupsMutation = useMutation({
    mutationFn: (data: any) => {
      // Create a task for group posting
      return apiRequest("POST", "/api/tasks", {
        name: "Group Posting",
        type: "group_posting",
        config: {
          message: message,
          accountIds: [parseInt(selectedAccountId)],
          groups: parsedGroups,
          includeMedia: includeMedia,
          mediaCount: selectedFiles?.length || 0,
          delay: { min: delayMin, max: delayMax }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Created",
        description: `Started posting to ${parsedGroups.length} groups`,
      });
      setIsPosting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsPosting(false);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleParseGroups = () => {
    if (!groupsList.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter group usernames or links",
        variant: "destructive",
      });
      return;
    }

    const groups = groupsList
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        // Extract username from various formats
        if (line.includes('t.me/')) {
          return line.split('t.me/')[1].split('/')[0];
        } else if (line.startsWith('@')) {
          return line.substring(1);
        }
        return line;
      });

    setParsedGroups(groups);
    
    toast({
      title: "Groups Parsed",
      description: `${groups.length} groups have been parsed successfully`,
    });
    
    setActiveTab("preview");
  };

  const handlePost = () => {
    if (!message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a message to post",
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

    if (parsedGroups.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add and parse at least one group",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    postToGroupsMutation.mutate({});
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">Group Posting</h1>
        <p className="text-neutral-500">Post messages to multiple Telegram groups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Post Configuration</CardTitle>
              <CardDescription>
                Create and configure your post
              </CardDescription>
            </CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="compose" className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Message Content</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={10}
                    />
                    <p className="text-xs text-neutral-500">
                      You can use basic formatting with *bold*, _italic_, and `code` styles
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-media"
                        checked={includeMedia}
                        onCheckedChange={setIncludeMedia}
                      />
                      <Label htmlFor="include-media">Include media attachments</Label>
                    </div>

                    {includeMedia && (
                      <div className="mt-2">
                        <Input
                          id="media"
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleFileChange}
                        />
                        {selectedFiles && selectedFiles.length > 0 && (
                          <p className="text-xs text-neutral-500 mt-1">
                            {selectedFiles.length} file(s) selected
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Button onClick={() => setActiveTab("groups")}>
                    Continue to Groups <i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="groups" className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groups-list">Group Usernames or Links</Label>
                    <Textarea
                      id="groups-list"
                      placeholder="Enter group usernames or links, one per line..."
                      value={groupsList}
                      onChange={(e) => setGroupsList(e.target.value)}
                      rows={10}
                      className="font-mono"
                    />
                    <p className="text-xs text-neutral-500">
                      Format: @username, t.me/username, or just username - one per line
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("compose")}>
                      <i className="fas fa-arrow-left mr-2"></i> Back to Compose
                    </Button>
                    <Button onClick={handleParseGroups}>
                      Parse Groups <i className="fas fa-check ml-2"></i>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="p-6">
                <div className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-md border">
                    <h4 className="font-medium mb-2">Message Preview</h4>
                    <p className="whitespace-pre-wrap">{message}</p>
                    {includeMedia && selectedFiles && selectedFiles.length > 0 && (
                      <div className="mt-2 text-sm text-primary">
                        <i className="fas fa-paperclip mr-1"></i> {selectedFiles.length} media attachment(s)
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Groups to Post ({parsedGroups.length})</h4>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-white">
                      {parsedGroups.length > 0 ? (
                        <ul className="space-y-1">
                          {parsedGroups.map((group, index) => (
                            <li key={index} className="text-sm">
                              <i className="fas fa-users text-primary mr-2"></i> {group}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-neutral-500 text-sm p-2">No groups added yet</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("groups")}>
                      <i className="fas fa-arrow-left mr-2"></i> Back to Groups
                    </Button>
                    <Button onClick={handlePost} disabled={isPosting}>
                      {isPosting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i> Posting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i> Start Posting
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Posting Settings</CardTitle>
              <CardDescription>
                Configure account and timing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label>Delay Between Posts ({delayMin}s - {delayMax}s)</Label>
                <Slider
                  min={30}
                  max={300}
                  step={10}
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

              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Posting to too many groups too quickly may trigger Telegram's anti-spam measures. Use appropriate delays.
                </AlertDescription>
              </Alert>

              <Separator className="my-2" />

              <div>
                <h4 className="font-medium mb-2">Posting Tips</h4>
                <ul className="text-sm text-neutral-600 space-y-2">
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>Make sure your account is a member of all target groups</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>Avoid repetitive or spammy content to prevent account limitations</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>Use formatting to make your posts more engaging</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-secondary mt-0.5 mr-2"></i>
                    <span>Space out posting sessions to maintain account health</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default GroupPosting;
