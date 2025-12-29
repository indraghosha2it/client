// 'use client';

// import { useState } from 'react';
// import { 
//   DollarSign, 
//   Building, 
//   Mail, 
//   Lock, 
//   Eye, 
//   EyeOff, 
//   Shield,
//   TrendingUp,
//   BarChart3,
//   FileText,
//   Users,
//   Check,
//   ArrowRight
// } from 'lucide-react';
// import Link from 'next/link';

// export default function HomePage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [loginData, setLoginData] = useState({
//     email: '',
//     password: ''
//   });

//   const handleLoginSubmit = (e) => {
//     e.preventDefault();
//     console.log('Login attempt:', loginData);
//     alert('Login functionality will be implemented next!');
//   };

//   const handleChange = (e) => {
//     setLoginData({
//       ...loginData,
//       [e.target.name]: e.target.value
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/50">
//       {/* Modern Header */}
//       <header className="absolute top-0 left-0 right-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
//                 <DollarSign className="text-white" size={22} />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">CostMaster</h1>
//                 <p className="text-xs text-gray-600 font-medium">Finance Intelligence</p>
//               </div>
//             </div>
            
           
//           </div>
//         </div>
//       </header>

//       <main className="min-h-screen flex items-center justify-center  py-20">
//         <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12">
//           {/* Left Column - Hero */}
//           <div className="space-y-10">
//             <div>
//               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
//                 <Shield className="w-4 h-4 mr-2" />
//                 Enterprise-grade security
//               </div>
              
//               <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
//                 Master Your
//                 <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
//                   Office Finances
//                 </span>
//               </h1>
              
//               <p className="text-xl text-gray-600 mt-6 max-w-2xl">
//                 Track expenses, analyze profits, and get actionable insights with our 
//                 intelligent office cost management platform.
//               </p>
//             </div>

//             {/* Features */}
           

          
//           </div>

//           {/* Right Column - Login Form */}
//           <div className="relative">
//             {/* Glowing background effect */}
//             <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
            
//             <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden">
//               {/* Form Header */}
//               <div className="p-8 border-b border-gray-100">
//                 <div className="flex items-center gap-2 ">
//                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
//                     <Building className="text-white" size={24} />
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
                    
//                   </div>
                  
//                 </div>
                
                
//               </div>

//               {/* Login Form */}
//               <form onSubmit={handleLoginSubmit} className="p-8 space-y-6">
//                 {/* Email Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address
//                   </label>
//                   <div className="relative group">
//                     <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
//                       <Mail size={20} />
//                     </div>
//                     <input
//                       type="email"
//                       name="email"
//                       value={loginData.email}
//                       onChange={handleChange}
//                       className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Password Field */}
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Password
//                     </label>
                   
//                   </div>
//                   <div className="relative group">
//                     <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
//                       <Lock size={20} />
//                     </div>
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       name="password"
//                       value={loginData.password}
//                       onChange={handleChange}
//                       className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
//                       placeholder="Enter your password"
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </button>
//                   </div>
//                 </div>

                

//                 {/* Submit Button */}
//                 <button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
//                 >
//                   <span>Sign In</span>
//                   <ArrowRight size={18} />
//                 </button>

//                 {/* Sign Up Link */}
//                 <div className="pt-2 border-t border-gray-100">
//                   <p className="text-center text-gray-600">
//                     Don't have an account?{' '}
//                     <Link 
//                       href="/signUp" 
//                       className="text-blue-600 hover:text-blue-700 font-semibold hover:underline inline-flex items-center space-x-1"
//                     >
//                       <span>Create account</span>
//                       <ArrowRight size={16} />
//                     </Link>
//                   </p>
//                 </div>

               
//               </form>

//               {/* Footer Note */}
//               <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100">
//                 <p className="text-xs text-gray-500 text-center">
//                   By signing in, you agree to our{' '}
//                   <a href="#" className="text-blue-600 hover:underline">Terms</a> and{' '}
//                   <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


'use client';

import { useState } from 'react';
import { 
  DollarSign, 
  Building, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Make API call to authenticate user
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user data in localStorage or session
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');

      // Role-based redirect
      if (data.user.role === 'admin') {
        router.push('/dashboard');
      } else if (data.user.role === 'moderator') {
        router.push('/signUp');
      } else {
        // Handle other roles or default to a dashboard
        router.push('');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/50">
      {/* Modern Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CostMaster</h1>
                <p className="text-xs text-gray-600 font-medium">Finance Intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen flex items-center justify-center py-20">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12">
          {/* Left Column - Hero */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Shield className="w-4 h-4 mr-2" />
                Enterprise-grade security
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Master Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Office Finances
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mt-6 max-w-2xl">
                Track expenses, analyze profits, and get actionable insights with our 
                intelligent office cost management platform.
              </p>
            </div>

            {/* Features */}
          </div>

          {/* Right Column - Login Form */}
          <div className="relative">
            {/* Glowing background effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
            
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden">
              {/* Form Header */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <Building className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
                    <p className="text-sm text-gray-500 mt-1">Enter your credentials to access your dashboard</p>
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="p-8 space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Sign Up Link */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                      href="/signUp" 
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Create account</span>
                      <ArrowRight size={16} />
                    </Link>
                  </p>
                </div>

               
              </form>

              {/* Footer Note */}
              <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}