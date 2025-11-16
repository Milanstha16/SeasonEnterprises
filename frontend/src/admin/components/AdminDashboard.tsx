import React, { useEffect, useState } from "react";

const POLL_INTERVAL = 10000; // 10 seconds

interface Stats {
  totalUsers: number;
  monthlySales: number;
  revenue: number;
  performance: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    monthlySales: 0,
    revenue: 0,
    performance: 0,
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  /* ---------------------------- Fetch Functions --------------------------- */
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats({
        totalUsers: data.totalUsers || 0,
        monthlySales: data.monthlySales || 0,
        revenue: data.revenue || 0,
        performance: data.performance || 0,
      });
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/recent-users`);
      if (!res.ok) throw new Error("Failed to fetch recent users");
      const data: User[] = await res.json();
      setRecentUsers(data);
    } catch (err) {
      console.error("Recent users fetch error:", err);
    }
  };

  /* ---------------------------- Lifecycle --------------------------- */
  useEffect(() => {
    fetchStats();
    fetchRecentUsers();

    const interval = setInterval(() => {
      fetchStats();
      fetchRecentUsers();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  /* ---------------------------- Render --------------------------- */
  return (
    <div className="p-6 bg-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black">Admin Dashboard</h1>
        <p className="text-black">Overview of recent activity and statistics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Total Users", value: stats.totalUsers },
          { title: "Monthly Sales", value: `$${stats.monthlySales.toLocaleString()}` },
          { title: "Revenue", value: `$${stats.revenue.toLocaleString()}` },
          {
            title: "Performance",
            value: `${stats.performance > 0 ? "+" : ""}${stats.performance}%`,
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl shadow-lg border border-indigo-100"
          >
            <h2 className="text-sm font-medium text-black">{card.title}</h2>
            <p className="text-3xl font-bold text-black mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Users Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
        <h2 className="text-xl font-semibold text-black mb-4">Recent Users</h2>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-indigo-100 text-black uppercase text-xs">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-3 text-center">
                  No recent users
                </td>
              </tr>
            ) : (
              recentUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-indigo-50">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
