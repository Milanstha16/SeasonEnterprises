// src/components/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

// User type with role and optional profile picture
export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  profilePicture?: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to safely load JSON from localStorage
const loadFromStorage = <T,>(key: string): T | null => {
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = loadFromStorage<User>("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
  }, []);

  // Sync state with localStorage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        setToken(e.newValue);
      } else if (e.key === "user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      } else if (e.key === null) {
        // localStorage cleared
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Login method: save user + token to state and localStorage
  const login = (token: string, user: User): void => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Logout method: clear user + token from state and localStorage
  const logout = (): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Memoize context value to optimize renders
  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to get the full auth context (user + token + methods)
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// Hook to get just the user object
export const useUser = (): User | null => {
  const { user } = useAuth();
  return user;
};
