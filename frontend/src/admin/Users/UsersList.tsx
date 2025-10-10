import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const UsersList = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
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
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Could not load users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link to="/admin/users/new">
          <Button>Add User</Button>
        </Link>
      </div>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <ul>
        {users.map((user) => (
          <li key={user._id} className="border-b py-2">
            <div className="flex justify-between">
              <span>{user.name}</span>
              <Link to={`/admin/users/${user._id}`}>
                <Button size="sm">View</Button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
