import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AccountSummaryItemProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  categories: {
    label: string;
    value: number;
    color: string;
    percentage: number;
  }[];
}

const AccountSummaryItem: React.FC<AccountSummaryItemProps> = ({ 
  title, 
  subtitle, 
  icon, 
  iconColor, 
  categories 
}) => {
  return (
    <div className="flex-1 border border-neutral-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-neutral-500 text-sm">{title}</p>
          <h3 className="font-bold">{subtitle}</h3>
        </div>
        <div className={`text-lg ${iconColor}`}>
          <i className={`fas ${icon}`}></i>
        </div>
      </div>
      {categories.map((category, index) => (
        <div key={index} className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-neutral-500">{category.label}</span>
            <span className={`text-xs font-medium ${category.color}`}>{category.value}</span>
          </div>
          <div className="bg-neutral-200 rounded-full h-1.5">
            <div 
              className={`${category.color} h-1.5 rounded-full`} 
              style={{ width: `${category.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const AccountSummary: React.FC = () => {
  const accountStatusData = {
    title: "Account Status",
    subtitle: "Overall Health",
    icon: "fa-check-circle",
    iconColor: "text-secondary",
    categories: [
      { label: "Active", value: 24, color: "text-secondary", percentage: 80 },
      { label: "Limited", value: 5, color: "text-warning", percentage: 16 },
      { label: "Banned", value: 1, color: "text-error", percentage: 4 }
    ]
  };
  
  const proxyStatusData = {
    title: "Proxy Status",
    subtitle: "Connection Health",
    icon: "fa-exclamation-circle",
    iconColor: "text-warning",
    categories: [
      { label: "Working", value: 18, color: "text-secondary", percentage: 60 },
      { label: "Slow", value: 8, color: "text-warning", percentage: 27 },
      { label: "Dead", value: 4, color: "text-error", percentage: 13 }
    ]
  };

  return (
    <Card className="mt-6">
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <CardTitle className="font-semibold text-dark">Account Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <AccountSummaryItem {...accountStatusData} />
          <AccountSummaryItem {...proxyStatusData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSummary;
