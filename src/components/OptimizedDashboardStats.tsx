"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function OptimizedDashboardStats() {
  const { data: dashboardData, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !dashboardData) {
    // Fallback to basic stats
    const fallbackStats = [
      { title: "Total Leads", value: 0, icon: "👥", color: "from-blue-500 to-blue-600", bg: "from-blue-50 to-blue-100" },
      { title: "Active Pipelines", value: 0, icon: "📈", color: "from-green-500 to-green-600", bg: "from-green-50 to-green-100" },
      { title: "Email Sequences", value: 0, icon: "📧", color: "from-purple-500 to-purple-600", bg: "from-purple-50 to-purple-100" },
      { title: "Total Credits", value: 0, icon: "💳", color: "from-amber-500 to-amber-600", bg: "from-amber-50 to-amber-100" }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fallbackStats.map((stat, index) => (
          <Card key={index} className={`bg-gradient-to-br ${stat.bg} border-0 shadow-xl hover:scale-105 transition-transform duration-200`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="text-lg">{stat.icon}</span>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {index === 3 ? 'Available credits' : 'Active items'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Leads",
      value: dashboardData.stats.totalLeads,
      icon: "👥",
      color: "from-blue-500 to-blue-600",
      bg: "from-blue-50 to-blue-100"
    },
    {
      title: "Active Pipelines", 
      value: dashboardData.stats.totalPipelines,
      icon: "📈",
      color: "from-green-500 to-green-600",
      bg: "from-green-50 to-green-100"
    },
    {
      title: "Email Sequences",
      value: dashboardData.stats.totalSequences,
      icon: "📧",
      color: "from-purple-500 to-purple-600", 
      bg: "from-purple-50 to-purple-100"
    },
    {
      title: "Total Credits",
      value: Object.values(dashboardData.user.credits).reduce((a, b) => a + b, 0),
      icon: "💳",
      color: "from-amber-500 to-amber-600",
      bg: "from-amber-50 to-amber-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`bg-gradient-to-br ${stat.bg} border-0 shadow-xl hover:scale-105 transition-transform duration-200`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <span className="text-lg">{stat.icon}</span>
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {index === 3 ? 'Available credits' : 'Active items'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}