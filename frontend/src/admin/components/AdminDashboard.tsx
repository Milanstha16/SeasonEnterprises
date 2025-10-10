import React, { useEffect, useState } from "react";

const POLL_INTERVAL = 10000; // 10 seconds

const AdminDashboard = () => {
  // State for stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    monthlySales: 0,
    revenue: 0,
    performance: 0,
  });

  // State for recent users
  const [recentUsers, setRecentUsers] = useState([]);

  // State for recent activity logs
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();

      // Ensure all required fields exist, add dummy data if needed
      setStats({
        totalUsers: data.totalUsers || 0,
        monthlySales: data.monthlySales || 0,  // dummy
        revenue: data.revenue || 0,            // dummy
        performance: data.performance || 0,       // dummy (percent)
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch recent users
  const fetchRecentUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/recent-users");
      if (!res.ok) throw new Error("Failed to fetch recent users");
      const data = await res.json();

      // Add default status "Active" to each user
      const usersWithStatus = data.map(user => ({
        ...user,
        status: "Active",
      }));

      setRecentUsers(usersWithStatus);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch recent activity logs
  const fetchRecentActivity = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/recent-activity");
      if (!res.ok) throw new Error("Failed to fetch recent activity");
      const data = await res.json();
      setRecentActivity(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
    fetchRecentActivity();

    const interval = setInterval(() => {
      fetchStats();
      fetchRecentUsers();
      fetchRecentActivity();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black">Admin Dashboard</h1>
        <p className="text-black">Overview of recent activity and statistics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-5 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-sm font-medium text-black">Total Users</h2>
          <p className="text-3xl font-bold text-black mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-sm font-medium text-black">Monthly Sales</h2>
          <p className="text-3xl font-bold text-black mt-2">${stats.monthlySales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-sm font-medium text-black">Revenue</h2>
          <p className="text-3xl font-bold text-black mt-2">${stats.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-sm font-medium text-black">Performance</h2>
          <p className="text-3xl font-bold text-black mt-2">{stats.performance > 0 ? "+" : ""}{stats.performance}%</p>
        </div>
      </div>

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-xl font-semibold text-black mb-4">Recent Users</h2>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-100 text-black uppercase text-xs">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr><td colSpan={3} className="p-3 text-center">No recent users</td></tr>
              ) : (
                recentUsers.map((user, index) => (
                  <tr key={index} className="border-b hover:bg-indigo-50">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
