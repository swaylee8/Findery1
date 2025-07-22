import { useState } from "react";
import { User } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("scroll-sold-user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("scroll-sold-user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("scroll-sold-user");
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: false,
    login,
    logout,
  };
}
