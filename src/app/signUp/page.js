// 'use client';

// import { useState } from 'react';
// import { 
//   DollarSign, 
//   Building, 
//   Mail, 
//   Lock, 
//   Eye, 
//   EyeOff,
//   User,
//   Shield,
//   Check,
//   ArrowRight,
//   ArrowLeft,
//   ChevronDown,
//   AlertCircle,
//   CheckCircle,
//   Loader2
// } from 'lucide-react';
// import Link from 'next/link';

// export default function SignUpPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [showRoleDropdown, setShowRoleDropdown] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
  
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     role: 'moderator',
//     password: '',
//     confirmPassword: '',
//     agreeTerms: false
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
    
//     // Clear errors when user starts typing
//     if (errorMessage) setErrorMessage('');
//   };

//   const selectRole = (role) => {
//     setFormData(prev => ({ ...prev, role }));
//     setShowRoleDropdown(false);
//   };

//   const validateForm = () => {
//     // Clear previous messages
//     setErrorMessage('');
//     setSuccessMessage('');

//     // Basic validation
//     if (!formData.name.trim()) {
//       setErrorMessage('Name is required');
//       return false;
//     }

//     if (!formData.email.trim()) {
//       setErrorMessage('Email is required');
//       return false;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       setErrorMessage('Please enter a valid email address');
//       return false;
//     }

//     if (!formData.password) {
//       setErrorMessage('Password is required');
//       return false;
//     }

//     if (formData.password.length < 8) {
//       setErrorMessage('Password must be at least 8 characters');
//       return false;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setErrorMessage('Passwords do not match');
//       return false;
//     }

//     if (!formData.agreeTerms) {
//       setErrorMessage('Please agree to the terms and conditions');
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate form
//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);
//     setErrorMessage('');

//     // Create newUser object
//     const newUser = {
//       name: formData.name.trim(),
//       email: formData.email.trim().toLowerCase(),
//       password: formData.password,
//       role: formData.role,
//     };

//     try {
//       console.log('Sending signup request:', { ...newUser, password: '[HIDDEN]' });
      
//       const resp = await fetch("/api/signup", {
//         method: "POST",
//         body: JSON.stringify(newUser),
//         headers: {
//           "Content-Type": "application/json"
//         }
//       });
      
//       console.log('Response status:', resp.status);
      
//       // Try to parse response as JSON
//       let data;
//       try {
//         data = await resp.json();
//         console.log('Response data:', data);
//       } catch (jsonError) {
//         console.error('Failed to parse JSON response:', jsonError);
//         throw new Error(`Server error (${resp.status}). Please try again.`);
//       }
      
//       if (resp.ok) {
//         // Success
//         setSuccessMessage('Account created successfully! Redirecting to login...');
        
//         // Reset form
//         setTimeout(() => {
//           setFormData({
//             name: '',
//             email: '',
//             role: 'moderator',
//             password: '',
//             confirmPassword: '',
//             agreeTerms: false
//           });
          
//           // Redirect to login page after 2 seconds
//           setTimeout(() => {
//             window.location.href = '/';
//           }, 2000);
//         }, 1500);
        
//       } else {
//         // API returned an error
//         const errorMsg = data.message || `Signup failed (status: ${resp.status})`;
//         setErrorMessage(errorMsg);
//       }
      
//     } catch (error) {
//       console.error('Error in signup:', error);
//       setErrorMessage(error.message || 'Network error. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const roleOptions = [
//     { value: 'admin', label: 'Administrator', description: 'Full system access', icon: <Shield size={18} /> },
//     { value: 'moderator', label: 'Moderator', description: 'Limited access', icon: <User size={18} /> }
//   ];

//   const selectedRole = roleOptions.find(r => r.value === formData.role);

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

//       <main className="min-h-screen flex items-center justify-center py-20">
//         <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12">
//           {/* Left Column - Hero */}
//           <div className="space-y-10">
//             <div>
//               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
//                 <Shield className="w-4 h-4 mr-2" />
//                 Enterprise-grade security
//               </div>
              
//               <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
//                 Create Your
//                 <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
//                   Account Now
//                 </span>
//               </h1>
              
//               <p className="text-xl text-gray-600 mt-6 max-w-2xl">
//                 Join thousands of companies managing their office finances efficiently. 
//                 Get started with your free account today.
//               </p>
//             </div>

//             {/* Benefits */}
//             <div className="space-y-4">
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
//                   <Check className="w-4 h-4 text-green-600" />
//                 </div>
//                 <span className="text-gray-700">Free 14-day trial</span>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
//                   <Check className="w-4 h-4 text-green-600" />
//                 </div>
//                 <span className="text-gray-700">No credit card required</span>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
//                   <Check className="w-4 h-4 text-green-600" />
//                 </div>
//                 <span className="text-gray-700">Cancel anytime</span>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Signup Form */}
//           <div className="relative">
//             {/* Glowing background effect */}
//             <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
            
//             <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden">
//               {/* Form Header */}
//               <div className="p-8 border-b border-gray-100">
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
//                     <Building className="text-white" size={24} />
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
//                     <p className="text-gray-600 mt-1">Fill in your details to get started</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Success Message */}
//               {successMessage && (
//                 <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
//                   <div className="flex items-center space-x-2">
//                     <CheckCircle className="w-5 h-5 text-green-600" />
//                     <p className="text-green-700 font-medium">{successMessage}</p>
//                   </div>
//                 </div>
//               )}

//               {/* Error Message */}
//               {errorMessage && (
//                 <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
//                   <div className="flex items-center space-x-2">
//                     <AlertCircle className="w-5 h-5 text-red-600" />
//                     <p className="text-red-700 font-medium">{errorMessage}</p>
//                   </div>
//                 </div>
//               )}

//               {/* Signup Form */}
//               <form onSubmit={handleSubmit} className="p-8 space-y-6">
//                 {/* Name Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Full Name
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <User size={20} />
//                     </div>
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
//                       placeholder="Enter your full name"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Email Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <Mail size={20} />
//                     </div>
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Role Dropdown */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Select Role
//                   </label>
//                   <div className="relative">
//                     <button
//                       type="button"
//                       onClick={() => setShowRoleDropdown(!showRoleDropdown)}
//                       className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 flex items-center justify-between text-left"
//                     >
//                       <div className="flex items-center space-x-3">
//                         <div className="text-gray-400">
//                           {selectedRole.icon}
//                         </div>
//                         <div>
//                           <div className="font-medium text-gray-900">{selectedRole.label}</div>
//                           <div className="text-sm text-gray-500">{selectedRole.description}</div>
//                         </div>
//                       </div>
//                       <ChevronDown className={`text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} size={20} />
//                     </button>

//                     {/* Dropdown Menu */}
//                     {showRoleDropdown && (
//                       <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
//                         {roleOptions.map((role) => (
//                           <button
//                             key={role.value}
//                             type="button"
//                             onClick={() => selectRole(role.value)}
//                             className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
//                               formData.role === role.value ? 'bg-blue-50' : ''
//                             }`}
//                           >
//                             <div className="flex items-center space-x-3">
//                               <div className={`p-2 rounded-lg ${
//                                 formData.role === role.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
//                               }`}>
//                                 {role.icon}
//                               </div>
//                               <div className="text-left">
//                                 <div className="font-medium text-gray-900">{role.label}</div>
//                                 <div className="text-sm text-gray-500">{role.description}</div>
//                               </div>
//                             </div>
//                             {formData.role === role.value && (
//                               <Check className="text-blue-600" size={18} />
//                             )}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Password Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Password
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <Lock size={20} />
//                     </div>
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       name="password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
//                       placeholder="Create a strong password"
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
//                   <p className="mt-2 text-xs text-gray-500">
//                     Must be at least 8 characters with letters and numbers
//                   </p>
//                 </div>

//                 {/* Confirm Password Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Confirm Password
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <Lock size={20} />
//                     </div>
//                     <input
//                       type={showConfirmPassword ? 'text' : 'password'}
//                       name="confirmPassword"
//                       value={formData.confirmPassword}
//                       onChange={handleChange}
//                       className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
//                       placeholder="Confirm your password"
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Terms and Conditions */}
//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     name="agreeTerms"
//                     checked={formData.agreeTerms}
//                     onChange={handleChange}
//                     className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                     required
//                   />
//                   <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-700">
//                     I agree to the{' '}
//                     <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
//                       Terms of Service
//                     </a>{' '}
//                     and{' '}
//                     <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
//                       Privacy Policy
//                     </a>
//                   </label>
//                 </div>

//                 {/* Submit Button */}
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       <span>Creating Account...</span>
//                     </>
//                   ) : (
//                     <>
//                       <span>Create Account</span>
//                       <ArrowRight size={18} />
//                     </>
//                   )}
//                 </button>

//                 {/* Login Link */}
//                 <div className="pt-2 border-t border-gray-100">
//                   <p className="text-center text-gray-600">
//                     Already have an account?{' '}
//                     <Link 
//                       href="/" 
//                       className="text-blue-600 hover:text-blue-700 font-semibold hover:underline inline-flex items-center space-x-1"
//                     >
//                       <ArrowLeft size={16} />
//                       <span>Sign in instead</span>
//                     </Link>
//                   </p>
//                 </div>
//               </form>

//               {/* Footer Note */}
//               <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100">
//                 <p className="text-xs text-gray-500 text-center">
//                   By creating an account, you agree to our{' '}
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
  User,
  Shield,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'moderator',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const selectRole = (role) => {
    setFormData(prev => ({ ...prev, role }));
    setShowRoleDropdown(false);
  };

  const validateForm = () => {
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    // Basic validation
    if (!formData.name.trim()) {
      setErrorMessage('Name is required');
      return false;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setErrorMessage('Password is required');
      return false;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('Please agree to the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Create newUser object
    const newUser = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
    };

    try {
      console.log('Sending signup request:', { ...newUser, password: '[HIDDEN]' });
      
     // In your handleSubmit function, update the fetch call:
const resp = await fetch("/api/signup", {
  method: "POST",
  body: JSON.stringify(newUser),
  headers: {
    "Content-Type": "application/json"
  },
  // Add mode and credentials
  // mode: 'cors',
  // credentials: 'same-origin'
});
      
      console.log('Response status:', resp.status);
      
      let data;
      try {
        data = await resp.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error(`Server error (${resp.status}). Please try again.`);
      }
      
      if (resp.ok) {
        // Success
        setSuccessMessage('Account created successfully! Redirecting to login...');
        
        // Reset form
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            role: 'moderator',
            password: '',
            confirmPassword: '',
            agreeTerms: false
          });
          
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }, 1500);
        
      } else {
        // API returned an error
        const errorMsg = data.message || `Signup failed (status: ${resp.status})`;
        setErrorMessage(errorMsg);
        
        // Special handling for common errors
        if (resp.status === 409) {
          setErrorMessage('User with this email already exists');
        } else if (resp.status === 400) {
          setErrorMessage(data.message || 'Please check your information');
        }
      }
      
    } catch (error) {
      console.error('Error in signup:', error);
      setErrorMessage(error.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Administrator', description: 'Full system access', icon: <Shield size={18} /> },
    { value: 'moderator', label: 'Moderator', description: 'Limited access', icon: <User size={18} /> }
  ];

  const selectedRole = roleOptions.find(r => r.value === formData.role);

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
                Create Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Account Now
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mt-6 max-w-2xl">
                Join thousands of companies managing their office finances efficiently. 
                Get started with your free account today.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">No credit card required</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right Column - Signup Form */}
          <div className="relative">
            {/* Glowing background effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
            
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden">
              {/* Form Header */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <Building className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
                    <p className="text-gray-600 mt-1">Fill in your details to get started</p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-700 font-medium">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 font-medium">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Role
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-gray-400">
                          {selectedRole.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{selectedRole.label}</div>
                          <div className="text-sm text-gray-500">{selectedRole.description}</div>
                        </div>
                      </div>
                      <ChevronDown className={`text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {showRoleDropdown && (
                      <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {roleOptions.map((role) => (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => selectRole(role.value)}
                            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                              formData.role === role.value ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                formData.role === role.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {role.icon}
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-gray-900">{role.label}</div>
                                <div className="text-sm text-gray-500">{role.description}</div>
                              </div>
                            </div>
                            {formData.role === role.value && (
                              <Check className="text-blue-600" size={18} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Must be at least 8 characters with letters and numbers
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Login Link */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-center text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      href="/" 
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline inline-flex items-center space-x-1"
                    >
                      <ArrowLeft size={16} />
                      <span>Sign in instead</span>
                    </Link>
                  </p>
                </div>
              </form>

              {/* Footer Note */}
              <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our{' '}
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