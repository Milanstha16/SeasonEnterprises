import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

const UsersList = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      const userList = Array.isArray(data) ? data : data.users;

      if (Array.isArray(userList)) {
        setUsers(userList);
        setFilteredUsers(userList);
      } else {
        setError("Unexpected data format received");
      }
    } catch (err) {
      console.error(err);
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  useEffect(() => {
    let tempUsers = [...users];

    if (roleFilter !== "all") {
      tempUsers = tempUsers.filter((u) => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tempUsers = tempUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(tempUsers);
  }, [searchQuery, roleFilter, users]);

  return (
    <div className="p-6 bg-indigo-50 min-h-screen">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        
        {/* Title + Count */}
        <h1 className="text-3xl font-bold text-black">
          Users 
          <span className="text-lg font-medium text-gray-600 ml-2">
            ({filteredUsers.length})
          </span>
        </h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded w-full md:w-64"
          />
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as "all" | "admin" | "user")
            }
            className="border px-3 py-2 rounded"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 mb-4 bg-red-100 p-3 rounded border border-red-200">
          {error}
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-6">
          <span className="animate-spin border-4 border-t-4 border-indigo-600 rounded-full w-12 h-12" />
        </div>
      ) : filteredUsers.length > 0 ? (
        <ul className="space-y-4">
          {filteredUsers.map((user) => (
            <li
              key={user._id}
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center border border-indigo-100"
            >
              <div>
                <p className="font-semibold text-black">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-green-200 text-green-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <Link to={`/admin/users/${user._id}`}>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  View
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-black text-lg">No users found.</p>
      )}
    </div>
  );
};

export default UsersList;
