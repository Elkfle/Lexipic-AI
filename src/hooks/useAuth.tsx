// src/hooks/useAuth.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, loginUser, registerUser } from "../api/auth";

type User = { id: string; email: string; name: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("lexipic_token")
  );
  const [loading, setLoading] = useState(true);

  // Cuando haya token, pedir /me
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchMe(token);
        if (data.ok) {
          setUser(data.user);
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem("lexipic_token");
        }
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem("lexipic_token");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const register = async (email: string, password: string, name: string) => {
    const data = await registerUser({ email, password, name });
    if (data.ok) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("lexipic_token", data.token);
      return true;
    }
    return false;
  };

  const login = async (email: string, password: string) => {
    const data = await loginUser({ email, password });
    if (data.ok) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("lexipic_token", data.token);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("lexipic_token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
