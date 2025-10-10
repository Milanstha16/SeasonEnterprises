import React from "react";

const AdminDashboard = () => {
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
          <p className="text-3xl font-bold text-black mt-2">1,024</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-sm font-medium text-black">Monthly Sales</h2>
          <p className="text-3xl font-bold text-black mt-2">$45,000</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-sm font-medium text-black">Revenue</h2>
          <p className="text-3xl font-bold text-black mt-2">$120,300</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-sm font-medium text-black">Performance</h2>
          <p className="text-3xl font-bold text-black mt-2">+12.5%</p>
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
              {[
                { name: "Jane Doe", email: "jane@example.com", status: "Active" },
                { name: "John Smith", email: "john@example.com", status: "Pending" },
                { name: "Alice Johnson", email: "alice@example.com", status: "Active" },
              ].map((user, index) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-xl font-semibold text-black mb-4">Recent Activity</h2>
          <ul className="space-y-4 text-sm text-black">
            <li>✅ User <strong>Jane Doe</strong> signed up.</li>
            <li>🛒 Order #1234 has been placed.</li>
            <li>📈 Monthly report generated.</li>
            <li>🔧 Admin settings updated by <strong>Admin</strong>.</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
