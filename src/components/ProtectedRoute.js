// // src/components/ProtectedRoute.js
// 'use client';

// import { useAuth } from '@/app/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export default function ProtectedRoute({ 
//   children, 
//   requiredRoles = [], // Array of allowed roles, empty means all authenticated users
//   redirectTo = '/'
// }) {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading) {
//       // Check if user is not logged in
//       if (!user) {
//         router.push(redirectTo);
//         return;
//       }
      
//       // Check if user has required role (if specified)
//       if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
//         router.push('/unauthorized');
//       }
//     }
//   }, [user, loading, requiredRoles, router, redirectTo]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (!user || (requiredRoles.length > 0 && !requiredRoles.includes(user.role))) {
//     return null;
//   }

//   return children;
// }

'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], // Array of allowed roles, empty means all authenticated users
  redirectTo = '/'
}) {
  const { user, loading, isAuthenticated, hasAnyRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [accessGranted, setAccessGranted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setCheckingAuth(true);
      
      // Wait for auth to finish loading
      if (loading) {
        setCheckingAuth(false);
        return;
      }

      // Check if user is authenticated (from context or localStorage)
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        console.log('Not authenticated, redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }
      
      // Check role requirements if specified
      if (requiredRoles.length > 0) {
        const hasRequiredRole = hasAnyRole(requiredRoles);
        if (!hasRequiredRole) {
          console.log('Insufficient permissions, redirecting to unauthorized');
          router.push('/unauthorized');
          return;
        }
      }

      // All checks passed
      setAccessGranted(true);
      setCheckingAuth(false);
    };

    checkAccess();
  }, [user, loading, requiredRoles, router, redirectTo, pathname, isAuthenticated, hasAnyRole]);

  // Show loading spinner
  if (loading || checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!accessGranted) {
    return null;
  }

  return children;
}