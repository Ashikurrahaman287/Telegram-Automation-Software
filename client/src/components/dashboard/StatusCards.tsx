import React from "react";
import { Card } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  value: string;
  trend: {
    value: string;
    direction: "up" | "down" | "flat";
  };
  icon: string;
  color: "primary" | "secondary" | "warning" | "error";
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, trend, icon, color }) => {
  const getBorderColor = () => {
    switch (color) {
      case "primary": return "border-primary";
      case "secondary": return "border-secondary";
      case "warning": return "border-warning";
      case "error": return "border-error";
      default: return "border-primary";
    }
  };
  
  const getIconBgColor = () => {
    switch (color) {
      case "primary": return "bg-primary bg-opacity-10";
      case "secondary": return "bg-secondary bg-opacity-10";
      case "warning": return "bg-warning bg-opacity-10";
      case "error": return "bg-error bg-opacity-10";
      default: return "bg-primary bg-opacity-10";
    }
  };
  
  const getIconColor = () => {
    switch (color) {
      case "primary": return "text-primary";
      case "secondary": return "text-secondary";
      case "warning": return "text-warning";
      case "error": return "text-error";
      default: return "text-primary";
    }
  };
  
  const getTrendColor = () => {
    switch (trend.direction) {
      case "up": return "text-secondary";
      case "down": return "text-error";
      case "flat": return "text-warning";
      default: return "text-secondary";
    }
  };
  
  const getTrendIcon = () => {
    switch (trend.direction) {
      case "up": return "fa-arrow-up";
      case "down": return "fa-arrow-down";
      case "flat": return "fa-arrow-right";
      default: return "fa-arrow-up";
    }
  };

  return (
    <Card className={`p-6 border-l-4 ${getBorderColor()}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-neutral-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className={`text-xs ${getTrendColor()} mt-1`}>
            <i className={`fas ${getTrendIcon()}`}></i> {trend.value}
          </p>
        </div>
        <div className={`${getIconBgColor()} p-3 rounded-lg`}>
          <i className={`fas ${icon} ${getIconColor()}`}></i>
        </div>
      </div>
    </Card>
  );
};

const StatusCards: React.FC = () => {
  const statusCards: StatusCardProps[] = [
    {
      title: "Active Accounts",
      value: "24/30",
      trend: {
        value: "3 new today",
        direction: "up"
      },
      icon: "fa-user-check",
      color: "primary"
    },
    {
      title: "Messages Sent",
      value: "1,248",
      trend: {
        value: "85 today",
        direction: "up"
      },
      icon: "fa-comment",
      color: "secondary"
    },
    {
      title: "Users Added",
      value: "358",
      trend: {
        value: "Steady",
        direction: "flat"
      },
      icon: "fa-user-plus",
      color: "warning"
    },
    {
      title: "Banned Accounts",
      value: "6",
      trend: {
        value: "2 this week",
        direction: "up"
      },
      icon: "fa-user-slash",
      color: "error"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statusCards.map((card, index) => (
        <StatusCard key={index} {...card} />
      ))}
    </div>
  );
};

export default StatusCards;
