import React from "react";
import StatusCards from "@/components/dashboard/StatusCards";
import ActiveTasks from "@/components/dashboard/ActiveTasks";
import AccountSummary from "@/components/dashboard/AccountSummary";
import ActionCenter from "@/components/dashboard/ActionCenter";
import RecentActivity from "@/components/dashboard/RecentActivity";

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-dark">Dashboard Overview</h1>
        <p className="text-neutral-500">Monitor and manage your Telegram automation tasks</p>
      </div>

      <StatusCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActiveTasks />
          <AccountSummary />
        </div>

        <div>
          <ActionCenter />
          <RecentActivity />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
