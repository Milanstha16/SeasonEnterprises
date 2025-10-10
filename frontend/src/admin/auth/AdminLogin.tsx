import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";
import { useAuth } from "@/components/context/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Use AuthContext

  useEffect(() => {
    window.scrollTo(0, 0);
    setFadeIn(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Call backend login route
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Login failed");
        return;
      }

      const { token, user } = data;

      // Check admin role
      if (user.role !== "admin") {
        setError("Access denied: Admins only");
        return;
      }

      // Save token and user in AuthContext
      login(token, user);

      // Redirect to admin dashboard
      navigate("/admin");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login");
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
          className="w-full py-3 text-lg font-semibold text-white transition-transform bg-indigo-700 rounded-lg hover:bg-indigo-800 hover:scale-105"
        >
          Log In
        </button>
      </form>
    </section>
  );
}
