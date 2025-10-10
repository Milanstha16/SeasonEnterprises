import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const UsersList = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      const userList = Array.isArray(data) ? data : data.users;

      if (Array.isArray(userList)) {
        setUsers(userList);
        setFilteredUsers(userList); // Set initial list
      } else {
        setError("Unexpected data format received");
      }
    } catch (err) {
      console.error(err);
      setError("Could not load users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter whenever role or search changes
  useEffect(() => {
    let tempUsers = [...users];

    // Filter by role
    if (roleFilter !== "all") {
      tempUsers = tempUsers.filter((u) => u.role === roleFilter);
    }

    // Filter by search query
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
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>
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
            onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "user")}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {filteredUsers.length > 0 ? (
        <ul>
          {filteredUsers.map((user) => (
            <li key={user._id} className="border-b py-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span className="text-xs bg-gray-200 rounded px-2 py-0.5">
                    {user.role}
                  </span>
                </div>
                <Link to={`/admin/users/${user._id}`}>
                  <Button size="sm">View</Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default UsersList;
