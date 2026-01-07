


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
//     if (successMessage) setSuccessMessage('');
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
      
//      // In your handleSubmit function, update the fetch call:
// const resp = await fetch("/api/signup", {
//   method: "POST",
//   body: JSON.stringify(newUser),
//   headers: {
//     "Content-Type": "application/json"
//   },
//   // Add mode and credentials
//   // mode: 'cors',
//   // credentials: 'same-origin'
// });
      
//       console.log('Response status:', resp.status);
      
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
//         setSuccessMessage('Account created successfully!');
        
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
//             window.location.href = '';
//           }, 2000);
//         }, 1500);
        
//       } else {
//         // API returned an error
//         const errorMsg = data.message || `Signup failed (status: ${resp.status})`;
//         setErrorMessage(errorMsg);
        
//         // Special handling for common errors
//         if (resp.status === 409) {
//           setErrorMessage('User with this email already exists');
//         } else if (resp.status === 400) {
//           setErrorMessage(data.message || 'Please check your information');
//         }
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
//        <div className="m-4">
//           <div className="flex justify-between items-center ">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
//               <p className="text-gray-600 mt-2">Track and manage your Users</p>
//             </div>
           
//           </div>

//         </div>
     

//       <main className="min-h-screen flex items-center justify-center py-4">
//         <div className="w-full max-w-6xl grid lg:grid-cols-1 gap-12">
        

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
//                     <h2 className="text-2xl font-bold text-gray-900">Create User Account</h2>
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

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  User,
  Shield,
  Check,
  ArrowRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Edit,
  Search,
  RefreshCw,
  X,
  UserPlus,
  Save,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${bgColor} animate-slide-in`}>
      <div className="flex items-center space-x-3">
        {type === 'success' ? (
          <CheckCircle className={`w-5 h-5 ${iconColor}`} />
        ) : (
          <AlertCircle className={`w-5 h-5 ${iconColor}`} />
        )}
        <div>
          <p className={`font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default function SignUpPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Toast states
  const [toast, setToast] = useState(null);
  
  // Signup form states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'moderator',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  // User table states
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'moderator',
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state (for toast)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const API_BASE_URL = 'http://localhost:5004/api';

  // Show toast function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Clear toast
  const clearToast = () => {
    setToast(null);
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (!userData || !token) {
      router.push('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setAuthLoading(false);
      
      // Only admin can access this page
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders()
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        router.push('/');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
        setFilteredUsers(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = users;
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      );
    }
    
    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  // Handle signup form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const selectRole = (role) => {
    setFormData(prev => ({ ...prev, role }));
    setShowRoleDropdown(false);
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) {
      showToast('Name is required', 'error');
      return false;
    }

    if (!formData.email.trim()) {
      showToast('Email is required', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return false;
    }

    if (!formData.password) {
      showToast('Password is required', 'error');
      return false;
    }

    if (formData.password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return false;
    }

    if (!formData.agreeTerms) {
      showToast('Please agree to the terms and conditions', 'error');
      return false;
    }

    return true;
  };

  // Handle signup form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Create newUser object
    const newUser = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
    };

    try {
      const resp = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newUser)
      });
      
      let data;
      try {
        data = await resp.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error(`Server error (${resp.status}). Please try again.`);
      }
      
      if (resp.ok) {
        // Success
        showToast('User account created successfully!');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          role: 'moderator',
          password: '',
          confirmPassword: '',
          agreeTerms: false
        });
        
        // Refresh users list
        fetchUsers();
        
      } else {
        // API returned an error
        let errorMsg = data.message || `Signup failed (status: ${resp.status})`;
        
        // Special handling for common errors
        if (resp.status === 409) {
          errorMsg = 'User with this email already exists';
        } else if (resp.status === 400) {
          errorMsg = data.message || 'Please check your information';
        } else if (resp.status === 403) {
          errorMsg = 'You do not have permission to create users';
        }
        
        showToast(errorMsg, 'error');
      }
      
    } catch (error) {
      console.error('Error in signup:', error);
      showToast(error.message || 'Network error. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing a user
  const handleEditClick = (userItem) => {
    setEditingId(userItem._id);
    setEditFormData({
      name: userItem.name,
      email: userItem.email,
      role: userItem.role,
    });
    
    // Scroll to edit form section with smooth animation
    setTimeout(() => {
      const editSection = document.getElementById('edit-form-section');
      if (editSection) {
        editSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      name: '',
      email: '',
      role: 'moderator',
    });
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle user edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingId) return;
    
    try {
      setEditLoading(true);
      
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
      };
      
      const response = await fetch(`${API_BASE_URL}/users/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      
      const data = await response.json();
      
      if (data.success) {
        showToast('User updated successfully');
        
        // Update local state
        setUsers(users.map(u => 
          u._id === editingId ? data.data : u
        ));
        
        // Reset edit mode
        cancelEdit();
      }
    } catch (error) {
      showToast(error.message || 'Failed to update user', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Show delete confirmation toast
  const handleDeleteClick = (userItem) => {
    setDeleteConfirmation({
      userId: userItem._id,
      userName: userItem.name,
      userEmail: userItem.email
    });
  };

  // Handle user deletion
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${deleteConfirmation.userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      
      const data = await response.json();
      
      if (data.success) {
        showToast('User deleted successfully');
        
        // Update local state
        setUsers(users.filter(u => u._id !== deleteConfirmation.userId));
        
        // Clear delete confirmation
        setDeleteConfirmation(null);
      }
    } catch (error) {
      showToast(error.message || 'Failed to delete user', 'error');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Role badge styling
  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      moderator: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  // Role options - removed "user" option
  const roleOptions = [
    { value: 'admin', label: 'Administrator', description: 'Full system access', icon: <Shield size={18} /> },
    { value: 'moderator', label: 'Moderator', description: 'Limited access', icon: <User size={18} /> }
  ];

  const selectedRole = roleOptions.find(r => r.value === formData.role);
  const selectedEditRole = roleOptions.find(r => r.value === editFormData.role);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/50 p-4 md:p-6">
      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      
      {/* Delete Confirmation Toast */}
      {deleteConfirmation && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 animate-slide-in">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delete User?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to delete <span className="font-medium">{deleteConfirmation.userName}</span> ({deleteConfirmation.userEmail})? This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-2">Create and manage system users</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-1 gap-8">
          {/* Create User Form */}
          <div className="relative">
            {/* Glowing background effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
            
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden">
              {/* Form Header */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <UserPlus className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
                    <p className="text-gray-600 mt-1">Fill in details to create a new user account</p>
                  </div>
                </div>
              </div>

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
                      placeholder="Enter user's full name"
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
                      placeholder="Enter user's email address"
                      required
                    />
                  </div>
                </div>

                {/* Role Dropdown - without "user" option */}
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

                    {/* Dropdown Menu - only admin and moderator */}
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
                      placeholder="Confirm the password"
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
                    I confirm that all information is correct
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
                      <span>Create User Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Edit User Form - without status field */}
          {editingId && (
            <div id="edit-form-section" className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                        <Edit className="text-white" size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                        <p className="text-gray-600 text-sm">Update user information</p>
                      </div>
                    </div>
                    <button
                      onClick={cancelEdit}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Cancel Edit"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Role Field - without "user" option */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        name="role"
                        value={editFormData.role}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="admin">Administrator</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          <span>Update User</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Users Table Section */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Table Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">System Users</h2>
                  <p className="text-gray-600 mt-1">Manage all user accounts</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>

            {/* Filters and Search - without status filter */}
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Users
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Role Filter - without "user" option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Administrator</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table - without status column */}
            <div className="p-6">
              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                  <p className="text-gray-500">
                    {searchTerm || roleFilter !== 'all' 
                      ? 'Try changing your filters or search term' 
                      : 'No users have been created yet. Create your first user above.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((userItem) => (
                          <tr key={userItem._id} className={`hover:bg-gray-50 ${editingId === userItem._id ? 'bg-blue-50' : ''}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-semibold">
                                  {userItem.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {userItem.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {userItem.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getRoleBadge(userItem.role)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(userItem.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditClick(userItem)}
                                  disabled={editingId}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(userItem)}
                                  disabled={userItem._id === user?._id || editingId}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                  title={userItem._id === user?._id ? "Cannot delete your own account" : ""}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  {filteredUsers.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            Showing {filteredUsers.length} of {users.length} user(s)
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {filteredUsers.length} user(s) found
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}