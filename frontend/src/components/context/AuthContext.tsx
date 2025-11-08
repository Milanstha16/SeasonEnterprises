import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

/* -------------------------------------------------------------------------- */
/*                               👤 User Type                                 */
/* -------------------------------------------------------------------------- */
export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  profilePicture?: string | null;
};

/* -------------------------------------------------------------------------- */
/*                           🔐 Context Type Setup                             */
/* -------------------------------------------------------------------------- */
type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*                            🧩 Helper Functions                              */
/* -------------------------------------------------------------------------- */
const loadFromStorage = <T,>(key: string): T | null => {
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/*                              👥 Auth Provider                               */
/* -------------------------------------------------------------------------- */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load initial state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = loadFromStorage<User>("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") setToken(e.newValue);
      if (e.key === "user") setUser(e.newValue ? JSON.parse(e.newValue) : null);
      if (e.key === null) {
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                          🔑 Login / Logout Logic                           */
  /* -------------------------------------------------------------------------- */
  const login = (token: string, user: User) => {
    const normalizedUser: User = {
      ...user,
      profilePicture: user.profilePicture ?? null,
    };

    setToken(token);
    setUser(normalizedUser);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  /* -------------------------------------------------------------------------- */
  /*                        🔄 Update User Information                           */
  /* -------------------------------------------------------------------------- */
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                               💡 Memoized Value                            */
  /* -------------------------------------------------------------------------- */
  const value = useMemo(() => ({ user, token, login, logout, updateUser }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* -------------------------------------------------------------------------- */
/*                          🪄 Custom Access Hooks                              */
/* -------------------------------------------------------------------------- */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const useUser = (): User | null => {
  const { user } = useAuth();
  return user;
};
