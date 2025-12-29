// "use client";

// import { SessionProvider } from "next-auth/react";

// const AuthProvider = ({ children }) => {
//   return (
//     <SessionProvider>
//       {children}
//     </SessionProvider>
//   );
// };

// export default AuthProvider;


// src/services/AuthProvider.jsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is in localStorage
    const storedUser = localStorage.getItem("office-cost-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("office-cost-user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // For now, just store in state
    // Later you'll call your API
    const userData = {
      id: Date.now().toString(),
      email,
      name: email.split("@")[0],
      role: "user"
    };
    
    setUser(userData);
    localStorage.setItem("office-cost-user", JSON.stringify(userData));
    
    return { success: true, user: userData };
  };

  const signup = async (userData) => {
    // This will be called from your signup form
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      role: userData.role || "user"
    };
    
    setUser(newUser);
    localStorage.setItem("office-cost-user", JSON.stringify(newUser));
    
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("office-cost-user");
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}