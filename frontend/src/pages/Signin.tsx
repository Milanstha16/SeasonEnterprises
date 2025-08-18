import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // reset error on submit

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || "Login failed");
        return;
      }

      const { token, user } = data;

      // Update auth context
      login(token, user);

      // Redirect to shop or account page
      navigate("/shop");
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Helmet>
        <title>Sign In - Season Enterprises</title>
        <meta
          name="description"
          content="Sign in to your account at Season Enterprises to start shopping."
        />
        <link rel="canonical" href="/signin" />
      </Helmet>

      <div className="w-full max-w-md px-6 py-10 border rounded-lg shadow-sm bg-white">
        <h1 className="font-display text-3xl mb-2 text-center">Sign In</h1>

        {error && (
          <p className="mb-4 text-red-600 font-semibold text-center">{error}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded bg-muted text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded bg-muted text-sm"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignIn;
