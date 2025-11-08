import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchUser = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data: User = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      setError("Could not load user.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Delete failed");
      }
      navigate("/admin/users");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) return <p className="p-6 text-center">Loading user details...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
  if (!user) return <p className="p-6 text-center">No user data available.</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="space-y-3 text-gray-700">
        <div>
          <span className="font-semibold">Name:</span> {user.name}
        </div>
        <div>
          <span className="font-semibold">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-semibold">Role:</span>{" "}
          <span className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${
            user.role === "admin" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-700"
          }`}>
            {user.role}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete User"}
        </Button>
      </div>
    </div>
  );
};

export default UserDetails;
