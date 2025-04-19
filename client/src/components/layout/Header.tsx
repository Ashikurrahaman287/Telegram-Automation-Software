import React from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { toast } = useToast();
  
  const showNotification = () => {
    toast({
      title: "New notification",
      description: "You have a new task completed.",
    });
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center px-6 py-3">
        <div className="flex items-center lg:hidden">
          <button 
            id="mobile-sidebar-toggle" 
            className="text-neutral-500 hover:text-dark"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
        
        <div className="flex items-center ml-auto space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <button className="flex items-center space-x-1 text-neutral-600 hover:text-dark">
                    <i className="fas fa-bolt text-warning"></i>
                    <span className="text-sm">15 operations remaining</span>
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Available automation operations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative text-neutral-600 hover:text-dark">
                  <i className="fas fa-bell"></i>
                  <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="font-medium">Account limit reached</div>
                  <div className="text-sm text-neutral-500">One of your accounts has reached its daily limit</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="font-medium">Task completed</div>
                  <div className="text-sm text-neutral-500">Member scraping task finished</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="font-medium">New proxy available</div>
                  <div className="text-sm text-neutral-500">10 new proxies have been added to the proxy pool</div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="border-l border-neutral-200 h-6 mx-2"></div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="font-medium text-sm">JD</span>
                </div>
                <span className="text-sm font-medium text-neutral-600">John Doe</span>
                <i className="fas fa-chevron-down text-xs text-neutral-400"></i>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <i className="fas fa-user mr-2 text-neutral-500"></i>
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <i className="fas fa-cog mr-2 text-neutral-500"></i>
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <i className="fas fa-question-circle mr-2 text-neutral-500"></i>
                <span>Help</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <i className="fas fa-sign-out-alt mr-2 text-neutral-500"></i>
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
