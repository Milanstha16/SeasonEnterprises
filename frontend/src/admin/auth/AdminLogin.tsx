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
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "Login failed");

      const { token, user } = data;

      if (user.role !== "admin") {
        setError("Access denied: Admins only");
        setLoading(false);
        return;
      }

      // Save token and user in auth context
      login(token, user);

      // ✅ Redirect to admin dashboard
      navigate("/admin");
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
        autoComplete="off" // 👈 disables browser autofill globally
        className="w-full max-w-md p-10 bg-white border border-indigo-200 shadow-2xl rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <FaUserShield className="mr-2 text-4xl text-indigo-700" />
          <h2 className="text-3xl font-extrabold text-indigo-700">Admin Login</h2>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="p-3 mb-4 text-sm font-semibold text-center text-red-600 bg-red-100 border border-red-200 rounded-lg"
          >
            {error}
          </div>
        )}

        {/* Email */}
        <label
          htmlFor="admin-email"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          placeholder="Enter admin email"
          className="w-full p-3 mb-4 text-gray-900 rounded-lg shadow-sm bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="new-email" // 👈 disables autofill on this field
        />

        {/* Password */}
        <label
          htmlFor="admin-password"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          placeholder="Enter password"
          className="w-full p-3 mb-6 text-gray-900 rounded-lg shadow-sm bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password" // 👈 disables autofill on this field
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-lg font-semibold text-white rounded-lg transition-all duration-300 transform ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-700 hover:bg-indigo-800 hover:scale-[1.02]"
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-gray-500">
          Admin access only. Unauthorized login attempts are monitored.
        </p>
      </form>
    </section>
  );
}
