import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  color: "primary" | "secondary" | "warning" | "dark";
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, title, subtitle, color, onClick }) => {
  const getBgColor = () => {
    switch (color) {
      case "primary": return "bg-primary hover:bg-primary-dark";
      case "secondary": return "bg-secondary hover:bg-secondary-dark";
      case "warning": return "bg-warning hover:bg-warning-dark";
      case "dark": return "bg-dark hover:bg-dark-dark";
      default: return "bg-primary hover:bg-primary-dark";
    }
  };
  
  const getSubtitleColor = () => {
    switch (color) {
      case "primary": return "text-primary-light";
      case "secondary": return "text-secondary-light";
      case "warning": return "text-warning-light";
      case "dark": return "text-neutral-300";
      default: return "text-primary-light";
    }
  };

  return (
    <button 
      className={cn(
        "text-white rounded-lg p-4 transition-colors text-left",
        getBgColor()
      )}
      onClick={onClick}
    >
      <i className={`fas ${icon} text-2xl mb-3`}></i>
      <p className="font-medium">{title}</p>
      <p className={cn("text-xs mt-1", getSubtitleColor())}>{subtitle}</p>
    </button>
  );
};

const ActionCenter: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const actions: ActionButtonProps[] = [
    {
      icon: "fa-user-plus",
      title: "Add Members",
      subtitle: "From your database",
      color: "primary",
      onClick: () => setLocation("/add-members")
    },
    {
      icon: "fa-comment",
      title: "Send Messages",
      subtitle: "To online users",
      color: "secondary",
      onClick: () => setLocation("/auto-message")
    },
    {
      icon: "fa-users",
      title: "Scrape Users",
      subtitle: "From target groups",
      color: "warning",
      onClick: () => setLocation("/member-scraping")
    },
    {
      icon: "fa-cogs",
      title: "Settings",
      subtitle: "Configure tool",
      color: "dark",
      onClick: () => setLocation("/settings")
    }
  ];

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <CardTitle className="font-semibold text-dark">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <ActionButton key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionCenter;
