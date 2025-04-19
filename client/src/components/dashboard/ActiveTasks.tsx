import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Task {
  id: number;
  name: string;
  type: string;
  status: string;
  progress: number;
  config: any;
}

const getTaskIcon = (type: string) => {
  switch (type) {
    case "add_members": return "fa-user-plus text-primary";
    case "group_posting": return "fa-bullhorn text-secondary";
    case "scrape_members": return "fa-users text-warning";
    case "auto_message": return "fa-comment text-primary";
    default: return "fa-tasks text-primary";
  }
};

const getTaskStatusBadge = (status: string) => {
  switch (status) {
    case "running":
      return "text-xs font-medium bg-primary bg-opacity-10 text-primary rounded-full px-2 py-1";
    case "paused":
      return "text-xs font-medium bg-warning bg-opacity-10 text-warning rounded-full px-2 py-1";
    case "completed":
      return "text-xs font-medium bg-secondary bg-opacity-10 text-secondary rounded-full px-2 py-1";
    case "failed":
      return "text-xs font-medium bg-error bg-opacity-10 text-error rounded-full px-2 py-1";
    default:
      return "text-xs font-medium bg-neutral-200 text-neutral-500 rounded-full px-2 py-1";
  }
};

const getTaskProgressColor = (status: string) => {
  switch (status) {
    case "running": return "bg-primary";
    case "paused": return "bg-warning";
    case "completed": return "bg-secondary";
    case "failed": return "bg-error";
    default: return "bg-neutral-400";
  }
};

const ActiveTasks: React.FC = () => {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row items-center justify-between">
        <CardTitle className="font-semibold text-dark">Active Tasks</CardTitle>
        <Button size="sm" variant="link" className="text-primary hover:text-primary-dark">
          <i className="fas fa-plus mr-1"></i> New Task
        </Button>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
              <th className="px-6 py-3 font-medium">Task</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Progress</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-neutral-500">
                  Loading tasks...
                </td>
              </tr>
            ) : tasks && tasks.length > 0 ? (
              tasks.map(task => (
                <tr key={task.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <i className={`fas ${getTaskIcon(task.type)} mr-3`}></i>
                      <div>
                        <p className="font-medium text-sm">{task.name}</p>
                        <p className="text-xs text-neutral-500">
                          Target: {task.config.target || task.config.source || (task.config.groups && `Multiple Groups (${task.config.groups.length})`)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={getTaskStatusBadge(task.status)}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full bg-neutral-200 rounded-full h-2 mr-2">
                        <div 
                          className={`${getTaskProgressColor(task.status)} h-2 rounded-full`} 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-neutral-500">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-neutral-400 hover:text-error mr-3">
                            <i className={task.status === 'paused' ? "fas fa-play-circle" : "fas fa-stop-circle"}></i>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{task.status === 'paused' ? 'Resume task' : 'Pause task'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-neutral-400 hover:text-primary">
                            <i className="fas fa-eye"></i>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View task details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-neutral-500">
                  No active tasks. Create a new task to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <CardFooter className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
        <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-dark">
          View All Tasks
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActiveTasks;
