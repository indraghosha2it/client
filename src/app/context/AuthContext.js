// 'use client';

// import { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// const AuthContext = createContext({});

// export const useAuth = () => useContext(AuthContext);

// export default function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     checkUser();
//   }, []);

//   const checkUser = async () => {
//     try {
//       const res = await fetch('/api/auth/me');
//       const data = await res.json();
//       setUser(data.user);
//     } catch (error) {
//       console.error('Error checking user:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const res = await fetch('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || 'Login failed');
//       }

//       setUser(data.user);
//       return { success: true, data };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   };

//   const logout = async () => {
//     await fetch('/api/logout', { method: 'POST' });
//     setUser(null);
//     router.push('/');
//   };

//   const value = {
//     user,
//     loading,
//     login,
//     logout,
//     checkUser,
//     isAuthenticated: !!user,
//     isAdmin: user?.role === 'admin',
//     isModerator: user?.role === 'moderator',
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// src/context/AuthContext.js




// 2
'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check auth status on component mount
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Sync with localStorage on mount
  useEffect(() => {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const parsedUser = JSON.parse(localUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing localStorage user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // const checkUserLoggedIn = async () => {
  //   try {
  //     // First check localStorage for quick state restoration
  //     const localUser = localStorage.getItem('user');
  //     if (localUser) {
  //       try {
  //         const parsedUser = JSON.parse(localUser);
  //         setUser(parsedUser);
  //       } catch (error) {
  //         console.error('Error parsing localStorage user:', error);
  //         localStorage.removeItem('user');
  //       }
  //     }
      
  //     // Always verify with the server to ensure token is valid
  //     const res = await fetch('/api/me', {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include'
  //     });
      
  //     if (res.ok) {
  //       const data = await res.json();
  //       const userData = data.data;
        
  //       // Update state and localStorage with fresh data
  //       setUser(userData);
  //       localStorage.setItem('user', JSON.stringify(userData));
        
  //       // If localStorage was empty but server has user, update localStorage
  //       if (!localUser && userData) {
  //         localStorage.setItem('user', JSON.stringify(userData));
  //       }
  //     } else {
  //       // Clear invalid/expired auth data
  //       setUser(null);
  //       localStorage.removeItem('user');
  //       localStorage.removeItem('auth_token');
  //       localStorage.removeItem('isAuthenticated');
  //     }
  //   } catch (error) {
  //     console.error('Error checking auth status:', error);
  //     // Don't clear localStorage on network errors
  //     // Keep cached user data for offline functionality
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const login = async (email, password) => {
  //   try {
  //     setLoading(true);
  //     const res = await fetch('/api/login', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email, password }),
  //       credentials: 'include'
  //     });

  //     const data = await res.json();

  //     if (res.ok) {
  //       // Extract user data from response
  //       const userData = data.data || data.user;
        
  //       // Validate user data
  //       if (!userData || !userData.role) {
  //         throw new Error('Invalid user data received from server');
  //       }

  //       // Update state immediately
  //       setUser(userData);
        
  //       // Store in localStorage for persistence
  //       localStorage.setItem('user', JSON.stringify(userData));
  //       if (data.token) {
  //         localStorage.setItem('auth_token', data.token);
  //       }
  //       localStorage.setItem('isAuthenticated', 'true');

  //       // Force a re-check to ensure consistency
  //       await checkUserLoggedIn();

  //       return { 
  //         success: true, 
  //         data: userData,
  //         role: userData.role,
  //         message: 'Login successful'
  //       };
  //     } else {
  //       // Clear any existing auth data on failed login
  //       setUser(null);
  //       localStorage.removeItem('user');
  //       localStorage.removeItem('auth_token');
  //       localStorage.removeItem('isAuthenticated');
        
  //       return { 
  //         success: false, 
  //         message: data.message || data.error || 'Login failed' 
  //       };
  //     }
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     return { 
  //       success: false, 
  //       message: error.message || 'Network error during login' 
  //     };
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // frontend/src/context/AuthContext.js
const login = async (email, password) => {
  try {
    const res = await fetch('http://localhost:5004/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // IMPORTANT: Send/receive cookies
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('auth_token', data.token);
      
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error' };
  }
};

const checkUserLoggedIn = async () => {
  try {
    const res = await fetch('http://localhost:5004/api/auth/me', {
      credentials: 'include'
    });
    
    if (res.ok) {
      const data = await res.json();
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
    } else {
      setUser(null);
      localStorage.removeItem('user');
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    setUser(null);
  } finally {
    setLoading(false);
  }
};
  
  const logout = async () => {
    try {
      setLoading(true);
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear all auth data
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('isAuthenticated');
      setLoading(false);
      
      // Use window.location for full page reload to reset all states
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        const userData = data.data;
        
        // Update state and localStorage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true, user: userData };
      } else {
        // Clear invalid auth data
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('isAuthenticated');
        
        return { success: false };
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      return { success: false, error: error.message };
    }
  };

  const hasRole = (requiredRole) => {
    if (!user) {
      // Check localStorage as fallback
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          return parsedUser.role === requiredRole;
        } catch {
          return false;
        }
      }
      return false;
    }
    return user.role === requiredRole;
  };

  const hasAnyRole = (roles) => {
    if (!user) {
      // Check localStorage as fallback
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          return roles.includes(parsedUser.role);
        } catch {
          return false;
        }
      }
      return false;
    }
    return roles.includes(user.role);
  };

  const isAuthenticated = () => {
    if (user) return true;
    
    // Check localStorage as fallback
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        return !!JSON.parse(localUser);
      } catch {
        return false;
      }
    }
    return false;
  };

  // const getCurrentUser = () => {
  //   if (user) return user;
    
  //   // Fallback to localStorage
  //   const localUser = localStorage.getItem('user');
  //   if (localUser) {
  //     try {
  //       return JSON.parse(localUser);
  //     } catch {
  //       return null;
  //     }
  //   }
  //   return null;
  // };


  const getCurrentUser = () => {
  // Return the React state user first (always available)
  if (user) return user;
  
  // Only access localStorage on the client side
  if (typeof window !== 'undefined') {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        return JSON.parse(localUser);
      } catch {
        return null;
      }
    }
  }
  return null;
};
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        hasRole,
        hasAnyRole,
        isAuthenticated,
        getCurrentUser,
        setUser,
        checkUserLoggedIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};