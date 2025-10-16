import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";
import { useAuth } from "@/components/context/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    setFadeIn(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Login failed");
      }

      const { token, user } = data;

      if (user.role !== "admin") {
        setError("Access denied: Admins only");
        return;
      }

      // Save token and user in auth context
      login(token, user);

      // ✅ Redirect to admin dashboard
      return navigate("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-100 to-purple-200 transition-opacity duration-700 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md p-10 bg-white border border-indigo-200 shadow-2xl rounded-2xl"
      >
        <div className="flex items-center justify-center mb-6">
          <FaUserShield className="mr-2 text-4xl text-indigo-700" />
          <h2 className="text-3xl font-extrabold text-indigo-700">Admin Login</h2>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm font-semibold text-center text-red-600 bg-red-100 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          placeholder="admin email"
          className="w-full p-3 mb-4 text-gray-900 rounded-lg shadow-sm bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          placeholder="Enter password"
          className="w-full p-3 mb-6 text-gray-900 rounded-lg shadow-sm bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-lg font-semibold text-white rounded-lg transition-transform ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-700 hover:bg-indigo-800 hover:scale-105"
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </section>
  );
}
