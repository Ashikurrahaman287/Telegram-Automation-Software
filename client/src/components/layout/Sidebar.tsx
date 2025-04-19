import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarItem {
  icon: string;
  label: string;
  path: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Dashboard",
    items: [
      { icon: "fa-tachometer-alt", label: "Overview", path: "/" }
    ]
  },
  {
    title: "User Operations",
    items: [
      { icon: "fa-users", label: "Member Scraping", path: "/member-scraping" },
      { icon: "fa-user-plus", label: "Add Members", path: "/add-members" },
      { icon: "fa-comment", label: "Auto Message", path: "/auto-message" },
      { icon: "fa-image", label: "Avatar Upload", path: "/avatar-upload" },
      { icon: "fa-search", label: "User Search", path: "/user-search" },
      { icon: "fa-bullhorn", label: "Group Posting", path: "/group-posting" }
    ]
  },
  {
    title: "Account Management",
    items: [
      { icon: "fa-user-check", label: "Account Status", path: "/account-status" },
      { icon: "fa-user-cog", label: "Manual Control", path: "/manual-control" }
    ]
  },
  {
    title: "Settings",
    items: [
      { icon: "fa-cogs", label: "Global Settings", path: "/settings" },
      { icon: "fa-shield-alt", label: "Proxy Settings", path: "/proxy-settings" },
      { icon: "fa-list-alt", label: "Blacklist/Whitelist", path: "/blacklist-whitelist" }
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [location] = useLocation();

  return (
    <div 
      id="sidebar" 
      className={cn(
        "bg-dark text-white flex-shrink-0 transition-all duration-300 shadow-lg",
        isOpen ? "w-64" : "w-0 lg:w-20"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-dark-light">
        <div className={cn("flex items-center space-x-2", !isOpen && "lg:justify-center")}>
          <i className="fab fa-telegram text-2xl text-primary"></i>
          {isOpen && <h1 className="font-bold text-lg whitespace-nowrap">Telegram Automation</h1>}
        </div>
        <button 
          id="sidebar-toggle" 
          className="lg:hidden text-neutral-300 hover:text-white"
          onClick={toggleSidebar}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
      
      <div className="p-2 overflow-y-auto h-[calc(100vh-64px)]">
        {isOpen ? (
          <>
            {sidebarSections.map((section, idx) => (
              <div key={idx}>
                <div className="text-neutral-400 text-xs uppercase mt-4 mb-2 px-4">{section.title}</div>
                {section.items.map((item, itemIdx) => (
                  <Link key={itemIdx} href={item.path} className={location === item.path ? "sidebar-item-active" : "sidebar-item"}>
                    <i className={`fas ${item.icon} w-5`}></i>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </>
        ) : (
          <>
            {sidebarSections.map((section, idx) => (
              <div key={idx} className="my-6">
                {section.items.map((item, itemIdx) => (
                  <Link 
                    key={itemIdx} 
                    href={item.path} 
                    className={cn(
                      "flex justify-center p-3 rounded-lg mb-2",
                      location === item.path 
                        ? "bg-dark-light text-white" 
                        : "text-neutral-300 hover:bg-dark-light hover:text-white"
                    )}
                    title={item.label}
                  >
                    <i className={`fas ${item.icon}`}></i>
                  </Link>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
