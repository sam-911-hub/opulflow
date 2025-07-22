"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserActivity, getCreditUsage } from "@/services/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const activity = await getUserActivity(user.uid);
      setActivityData(activity);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const creditUsageData = [
    { name: 'AI', value: activityData.filter(a => a.service === 'ai').length },
    { name: 'Leads', value: activityData.filter(a => a.service === 'leads').length },
    { name: 'Exports', value: activityData.filter(a => a.service === 'exports').length },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border p-4 rounded-lg">
        <h3 className="font-medium mb-4">Credit Usage (Last 30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={creditUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border p-4 rounded-lg">
        <h3 className="font-medium mb-4">Recent Activity</h3>
        {activityData.slice(0, 5).map((item, index) => (
          <div key={index} className="py-2 border-b">
            <p className="text-sm">
              <span className="capitalize">{item.type}</span> - {item.service} ({item.amount} credits)
            </p>
            <p className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}