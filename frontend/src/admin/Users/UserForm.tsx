import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

const UserForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setForm({
        name: data.name,
        email: data.email,
        role: data.role,
        password: "",
      });
    } catch (err) {
      console.error(err);
      setError("Could not load user.");
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const method = id ? "PUT" : "POST";
      const endpoint = id ? `/api/users/${id}` : `/api/users`;
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Operation failed");
      }
      navigate("/admin/users");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{id ? "Edit User" : "Add User"}</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="password"
          name="password"
          placeholder="Password (leave blank to keep unchanged)"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : id ? "Update User" : "Add User"}
        </Button>
      </form>
    </div>
  );
};

export default UserForm;
