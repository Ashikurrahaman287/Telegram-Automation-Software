import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "@/lib/utils";

interface ActivityLog {
  id: number;
  activity: string;
  details: string;
  timestamp: string;
  userId: number;
  taskId?: number;
}

const getActivityIcon = (activity: string) => {
  if (activity.includes("Added")) return "fa-user-plus";
  if (activity.includes("Account")) return "fa-exclamation-triangle";
  if (activity.includes("Sent")) return "fa-comment";
  if (activity.includes("Scraped")) return "fa-users";
  if (activity.includes("Updated")) return "fa-sync";
  if (activity.includes("Task")) return "fa-tasks";
  return "fa-bell";
};

const getActivityColor = (activity: string) => {
  if (activity.includes("Added")) return "bg-primary bg-opacity-10 text-primary";
  if (activity.includes("Account") && activity.includes("limited")) return "bg-error bg-opacity-10 text-error";
  if (activity.includes("Sent")) return "bg-secondary bg-opacity-10 text-secondary";
  if (activity.includes("Scraped")) return "bg-warning bg-opacity-10 text-warning";
  if (activity.includes("Updated")) return "bg-primary bg-opacity-10 text-primary";
  if (activity.includes("Task")) return "bg-primary bg-opacity-10 text-primary";
  return "bg-primary bg-opacity-10 text-primary";
};

const RecentActivity: React.FC = () => {
  const { data: activities, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs", { limit: 5 }],
  });

  return (
    <Card className="mt-6">
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <CardTitle className="font-semibold text-dark">Recent Activity</CardTitle>
      </CardHeader>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-neutral-500">Loading activities...</div>
        ) : activities && activities.length > 0 ? (
          activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className={`p-4 ${index < activities.length - 1 ? 'border-b border-neutral-100' : ''} hover:bg-neutral-50`}
            >
              <div className="flex items-start">
                <div className={`${getActivityColor(activity.activity)} p-2 rounded mr-3`}>
                  <i className={`fas ${getActivityIcon(activity.activity)}`}></i>
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.activity}</p>
                  <p className="text-xs text-neutral-500">{activity.details}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp))}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-neutral-500">No recent activities</div>
        )}
      </div>
      <CardFooter className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
        <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-dark">
          View All Activity
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentActivity;
