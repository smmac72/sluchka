import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
    loading: true
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      
      if (token && user) {
        // Set auth headers for all future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // Optionally validate token by making a request to the server
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`);
          if (response.data) {
            setAuth({
              isAuthenticated: true,
              token,
              user: { ...user, ...response.data },
              loading: false
            });
            return;
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          // Token is invalid, proceed to logout
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          delete axios.defaults.headers.common["Authorization"];
        }
      }
      
      setAuth({
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false
      });
    };
    
    initAuth();
  }, []);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    
    // Set auth header for all future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    setAuth({
      isAuthenticated: true,
      token,
      user,
      loading: false
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Remove auth header
    delete axios.defaults.headers.common["Authorization"];
    
    setAuth({
      isAuthenticated: false,
      token: null,
      user: null,
      loading: false
    });
  };

  const updateUser = (updatedUser) => {
    const user = { ...auth.user, ...updatedUser };
    localStorage.setItem("user", JSON.stringify(user));
    
    setAuth({
      ...auth,
      user
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
