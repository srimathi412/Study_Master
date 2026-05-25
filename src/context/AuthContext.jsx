import React, { createContext, useContext, useEffect, useState } from "react";
import { registerUser, loginUser, logoutUser } from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on refresh
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const res = await fetch(`${apiBase}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Invalid credentials" };
    }
  };

  // REGISTER
  const register = async (userData) => {
    try {
      const newUser = await registerUser(userData);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Registration failed" };
    }
  };

  // LOGOUT
  const logout = () => {
    logoutUser();
    setUser(null);
    window.location.href = '/login';
  };

  // UPDATE PROFILE (mock for now since we didn't build an endpoint for it yet, or skip)
  const updateProfile = async (updatedUser) => {
    // In a real app you'd call an API endpoint here.
    setUser(updatedUser);
    return { success: true, message: "Profile updated locally (add API later)" };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
