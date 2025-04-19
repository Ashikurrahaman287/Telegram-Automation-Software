import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Validation schema for the add account form
const accountSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  apiId: z.string().min(1, "API ID is required"),
  apiHash: z.string().min(16, "API hash must be at least 16 characters"),
  botToken: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AddAccountModalProps {
  trigger?: React.ReactNode;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ trigger }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      phoneNumber: "",
      apiId: "",
      apiHash: "",
      botToken: "",
    },
  });

  const addAccountMutation = useMutation({
    mutationFn: async (data: AccountFormValues) => {
      const response = await apiRequest("POST", "/api/telegram-accounts", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add account");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telegram-accounts"] });
      toast({
        title: "Account Added",
        description: "Telegram account has been added successfully",
      });
      form.reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountFormValues) => {
    addAccountMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Account</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Telegram Account</DialogTitle>
          <DialogDescription>
            Add a new Telegram account for automation. You will need your Telegram API credentials.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+12345678900" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter with country code (e.g. +1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="apiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1234567" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Numeric API ID from my.telegram.org
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="apiHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Hash</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="a1b2c3d4e5f6g7h8i9j0..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    API Hash from my.telegram.org
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="botToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Token (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123456789:ABCDefGhIJKlmnOPQRstUVwxyZ" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional Bot API token from @BotFather
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={addAccountMutation.isPending}
              >
                {addAccountMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Adding...
                  </>
                ) : (
                  "Add Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountModal;