

// 'use client';

// import React, { useState, useEffect, useMemo } from "react";
// import { useRouter } from 'next/navigation';
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export default function FoodCost() {
//   const router = useRouter();
  
//   // Authentication state
//   const [user, setUser] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);
  
//   const [formData, setFormData] = useState({
//     date: "",
//     cost: "",
//     note: ""
//   });

//   const [foodCosts, setFoodCosts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [editingId, setEditingId] = useState(null);
  
//   // Filter states
//   const [filterYear, setFilterYear] = useState("all");
//   const [filterMonth, setFilterMonth] = useState("all");
//   const [years, setYears] = useState([]);
//   const [months, setMonths] = useState([]);

//   const API_URL = "http://localhost:5004/api";

//   // Month names for display
//   const monthNames = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   // Check authentication on mount
//   useEffect(() => {
//     checkAuthentication();
//   }, []);

//   // Fetch food costs after authentication
//   useEffect(() => {
//     if (user && !authLoading) {
//       fetchFoodCosts();
//     }
//   }, [user, authLoading]);

//   // Check if user is authenticated
//   const checkAuthentication = () => {
//     const userData = localStorage.getItem('user');
//     const isAuth = localStorage.getItem('isAuthenticated');
    
//     if (!userData || !isAuth) {
//       router.push('/');
//       return;
//     }
    
//     try {
//       const parsedUser = JSON.parse(userData);
      
//       // Check if user has permission (admin, moderator, or user)
//       if (!['admin', 'moderator', 'user'].includes(parsedUser.role)) {
//         setMessage({ 
//           type: 'error', 
//           text: 'Access denied. You do not have permission to manage food costs.' 
//         });
//         setTimeout(() => router.push('/dashboard'), 2000);
//         return;
//       }
      
//       setUser(parsedUser);
//       setAuthLoading(false);
//     } catch (error) {
//       console.error('Error parsing user data:', error);
//       router.push('/');
//     }
//   };

//   // Update years and months when food costs change
//   useEffect(() => {
//     if (foodCosts.length > 0) {
//       const uniqueYears = Array.from(
//         new Set(
//           foodCosts.map(cost => {
//             const date = new Date(cost.date);
//             return date.getFullYear();
//           })
//         )
//       ).sort((a, b) => b - a);

//       setYears(uniqueYears);

//       if (filterYear !== "all") {
//         const yearCosts = foodCosts.filter(cost => {
//           const date = new Date(cost.date);
//           return date.getFullYear().toString() === filterYear;
//         });

//         const uniqueMonths = Array.from(
//           new Set(
//             yearCosts.map(cost => {
//               const date = new Date(cost.date);
//               return date.getMonth() + 1;
//             })
//           )
//         ).sort((a, b) => b - a);

//         setMonths(uniqueMonths);
//       } else {
//         setMonths([]);
//         setFilterMonth("all");
//       }
//     } else {
//       setYears([]);
//       setMonths([]);
//     }
//   }, [foodCosts, filterYear]);

//   // Fetch all food costs and sort by date descending
//   const fetchFoodCosts = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_URL}/food-costs`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
//         },
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         if (response.status === 401 || response.status === 403) {
//           throw new Error('Authentication required. Please login again.');
//         }
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.success) {
//         const sortedCosts = [...data.data].sort((a, b) => {
//           const dateA = new Date(a.date);
//           const dateB = new Date(b.date);
//           return dateB.getTime() - dateA.getTime();
//         });
        
//         setFoodCosts(sortedCosts);
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: data.error || 'Failed to load food costs' 
//         });
//       }
//     } catch (error) {
//       setMessage({ 
//         type: 'error', 
//         text: `Error: ${error.message}` 
//       });
//       console.error("Error fetching food costs:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Generate PDF report
//   const generatePDF = () => {
//     if (filteredFoodCosts.length === 0) {
//       setMessage({ 
//         type: 'error', 
//         text: "No food cost records to download for the selected filters" 
//       });
//       return;
//     }

//     try {
//       // Create new PDF document
//       const doc = new jsPDF();
      
//       // Title
//       const pageWidth = doc.internal.pageSize.getWidth();
//       doc.setFontSize(20);
//       doc.setTextColor(40);
//       doc.setFont("helvetica", "bold");
//       doc.text("Food Cost Report", pageWidth / 2, 20, { align: "center" });
      
//       // Report Info
//       doc.setFontSize(11);
//       doc.setFont("helvetica", "normal");
//       doc.setTextColor(100);
//       doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
//       // Filter information
//       let filterInfo = "All Records";
//       if (filterYear !== "all" && filterMonth !== "all") {
//         filterInfo = `${monthNames[parseInt(filterMonth) - 1]} ${filterYear}`;
//       } else if (filterYear !== "all") {
//         filterInfo = `Year: ${filterYear}`;
//       } else if (filterMonth !== "all") {
//         filterInfo = `Month: ${monthNames[parseInt(filterMonth) - 1]}`;
//       }
//       doc.text(`Report Type: ${filterInfo}`, 14, 36);
//       doc.text(`Total Records: ${filteredFoodCosts.length}`, 14, 42);
      
//       // Add user info
//       if (user) {
//         doc.text(`Generated by: ${user.name} (${user.role})`, 14, 48);
//       }
      
//       // Prepare table data
//       const tableData = filteredFoodCosts.map(cost => {
//         const costDate = new Date(cost.date);
//         const note = cost.note || '-';
        
//         return [
//           costDate.toLocaleDateString(),
//           `BDT ${cost.cost.toFixed(2)}`,
//           note,
//           `${monthNames[costDate.getMonth()]} ${costDate.getFullYear()}`
//         ];
//       });
      
//       // Add table using autoTable
//       autoTable(doc, {
//         startY: user ? 55 : 50,
//         head: [['Date', 'Amount (BDT)', 'Note', 'Month-Year']],
//         body: tableData,
//         headStyles: {
//           fillColor: [60, 179, 113], // Green color
//           textColor: 255,
//           fontStyle: 'bold'
//         },
//         styles: {
//           fontSize: 10,
//           cellPadding: 3
//         },
//         columnStyles: {
//           0: { cellWidth: 25 },
//           1: { cellWidth: 25 },
//           2: { cellWidth: 80 },
//           3: { cellWidth: 30 }
//         },
//         didDrawPage: function (data) {
//           // Footer
//           const pageCount = doc.internal.getNumberOfPages();
//           doc.setFontSize(10);
//           doc.setTextColor(150);
//           doc.text(
//             `Page ${data.pageNumber} of ${pageCount}`,
//             pageWidth / 2,
//             doc.internal.pageSize.getHeight() - 10,
//             { align: "center" }
//           );
//         }
//       });
      
//       // Calculate totals
//       const totalAmount = calculateFilteredTotal();
//       const lastY = doc.lastAutoTable.finalY + 10;
      
//       // Add summary section
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor(40);
//       doc.text("SUMMARY", 14, lastY);
      
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       doc.text(`Total Records: ${filteredFoodCosts.length}`, 14, lastY + 8);
//       doc.text(`Total Amount: BDT ${totalAmount.toFixed(2)}`, 14, lastY + 16);
//       doc.text(`Average Daily Cost: BDT ${(totalAmount / filteredFoodCosts.length).toFixed(2)}`, 14, lastY + 24);
      
//       // Add generated date at bottom
//       doc.setFontSize(9);
//       doc.setTextColor(100);
//       doc.text(
//         `Report generated on ${new Date().toLocaleString()}`,
//         pageWidth / 2,
//         doc.internal.pageSize.getHeight() - 20,
//         { align: "center" }
//       );
      
//       // Generate filename with timestamp
//       const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
//       const isFilterActive = filterYear !== "all" || filterMonth !== "all";
//       const filterSuffix = isFilterActive ? '_filtered' : '';
//       const filename = `food_cost_${timestamp}${filterSuffix}.pdf`;
      
//       // Save the PDF
//       doc.save(filename);
      
//       // Show success message
//       setMessage({ 
//         type: 'success', 
//         text: `PDF downloaded successfully: ${filename}` 
//       });
      
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       setMessage({ 
//         type: 'error', 
//         text: `Failed to generate PDF: ${error.message}. Please make sure all food cost records have valid data.` 
//       });
//     }
//   };

//   // Function to check for duplicate day entries
//   const checkForDuplicateDay = async (selectedDate, currentEditingId = null) => {
//     if (!selectedDate) return false;
    
//     try {
//       const response = await fetch(`${API_URL}/food-costs/check-date?date=${selectedDate}`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
//         },
//         credentials: 'include'
//       });
      
//       const data = await response.json();
      
//       if (data.success && data.exists) {
//         // If editing, only return true if it's a different record
//         if (currentEditingId && data.data._id === currentEditingId) {
//           return false; // Same record, not a duplicate
//         }
//         return data.data; // Return existing record data
//       }
      
//       return false;
//     } catch (error) {
//       console.error('Error checking duplicate:', error);
//       return false;
//     }
//   };

//   // Fetch single food cost for editing
//   const fetchFoodCostForEdit = async (id) => {
//     try {
//       setLoading(true);
//       setMessage({ type: '', text: '' });
      
//       const response = await fetch(`${API_URL}/food-costs/${id}`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
//         },
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.success) {
//         const cost = data.data;
//         setFormData({
//           date: cost.date.split('T')[0],
//           cost: cost.cost.toString(),
//           note: cost.note || ""
//         });
//         setEditingId(id);
//         setMessage({ 
//           type: 'info', 
//           text: `Editing food cost record from ${new Date(cost.date).toLocaleDateString()}` 
//         });
        
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: data.message || 'Failed to load food cost data' 
//         });
//       }
//     } catch (error) {
//       setMessage({ 
//         type: 'error', 
//         text: `Failed to load food cost record: ${error.message}` 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = async (e) => {
//     const { name, value } = e.target;
    
//     // Clear duplicate warning when date changes
//     if (name === 'date' && (message.text.includes('already exists') || message.text.includes('duplicate'))) {
//       setMessage({ type: '', text: '' });
//     }
    
//     setFormData({ ...formData, [name]: value });
//   };

//   // Check for duplicate when date is selected
//   const handleDateChange = async (e) => {
//     const { value } = e.target;
    
//     // Clear previous messages
//     setMessage({ type: '', text: '' });
    
//     setFormData({ ...formData, date: value });
    
//     // Check for duplicate after a short delay
//     if (value && !editingId) {
//       setTimeout(async () => {
//         const duplicate = await checkForDuplicateDay(value);
//         if (duplicate) {
//           setMessage({
//             type: 'error',
//             text: `⚠️ Food cost for ${new Date(value).toLocaleDateString()} already exists. Please edit the existing record instead.`
//           });
//         }
//       }, 500);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       if (!formData.date) {
//         throw new Error("Please select a date");
//       }
//       if (!formData.cost || parseFloat(formData.cost) <= 0) {
//         throw new Error("Please enter a valid cost amount");
//       }

//       // Check for duplicate day
//       const duplicate = await checkForDuplicateDay(formData.date, editingId);
      
//       if (duplicate) {
//         const dateStr = new Date(formData.date).toLocaleDateString();
        
//         if (editingId) {
//           throw new Error(`Cannot update: A food cost record for ${dateStr} already exists. Please keep the original date or choose a different one.`);
//         } else {
//           throw new Error(`A food cost record for ${dateStr} already exists. Please edit the existing record instead.`);
//         }
//       }

//       const url = editingId 
//         ? `${API_URL}/food-costs/${editingId}`
//         : `${API_URL}/food-costs`;
      
//       const method = editingId ? "PUT" : "POST";
      
//       const response = await fetch(url, {
//         method: method,
//         headers: {
//           "Content-Type": "application/json",
//           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
//         },
//         credentials: 'include',
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || `HTTP error! status: ${response.status}`);
//       }

//       if (data.success) {
//         const actionText = editingId ? "updated" : "saved";
//         setMessage({ 
//           type: 'success', 
//           text: `✅ Food cost ${actionText} successfully!` 
//         });
        
//         setFormData({
//           date: "",
//           cost: "",
//           note: ""
//         });
        
//         setEditingId(null);
        
//         fetchFoodCosts();
        
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: `❌ ${data.message || data.error}` 
//         });
//       }

//     } catch (error) {
//       console.error("Error submitting form:", error);
//       setMessage({ 
//         type: 'error', 
//         text: `❌ ${error.message}` 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cancel edit mode
//   const cancelEdit = () => {
//     setFormData({
//       date: "",
//       cost: "",
//       note: ""
//     });
//     setEditingId(null);
//     setMessage({ type: '', text: '' });
//   };

//   // Delete food cost record
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this food cost record?")) {
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/food-costs/${id}`, {
//         method: "DELETE",
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
//         },
//         credentials: 'include'
//       });

//       const data = await response.json();

//       if (data.success) {
//         setMessage({ 
//           type: 'success', 
//           text: `✅ ${data.message}` 
//         });
//         if (editingId === id) {
//           cancelEdit();
//         }
//         fetchFoodCosts();
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: `❌ ${data.message || data.error}` 
//         });
//       }
//     } catch (error) {
//       setMessage({ 
//         type: 'error', 
//         text: `❌ Failed to delete food cost record: ${error.message}` 
//       });
//     }
//   };

//   // Handle year filter change
//   const handleYearChange = (e) => {
//     setFilterYear(e.target.value);
//     setFilterMonth("all");
//   };

//   // Handle month filter change
//   const handleMonthChange = (e) => {
//     setFilterMonth(e.target.value);
//   };

//   // Reset all filters
//   const resetFilters = () => {
//     setFilterYear("all");
//     setFilterMonth("all");
//   };

//   // Filter food costs based on selected year and month and sort by date descending
//   const filteredFoodCosts = useMemo(() => {
//     const filtered = foodCosts.filter(cost => {
//       const date = new Date(cost.date);
//       const year = date.getFullYear().toString();
//       const month = (date.getMonth() + 1).toString();

//       if (filterYear !== "all" && year !== filterYear) {
//         return false;
//       }

//       if (filterMonth !== "all" && month !== filterMonth) {
//         return false;
//       }

//       return true;
//     });

//     return [...filtered].sort((a, b) => {
//       const dateA = new Date(a.date);
//       const dateB = new Date(b.date);
//       return dateB.getTime() - dateA.getTime();
//     });
//   }, [foodCosts, filterYear, filterMonth]);

//   // Calculate total for filtered food costs
//   const calculateFilteredTotal = () => {
//     return filteredFoodCosts.reduce((total, cost) => total + cost.cost, 0);
//   };

//   // Calculate average daily cost
//   const calculateAverageDailyCost = () => {
//     if (filteredFoodCosts.length === 0) return 0;
//     return calculateFilteredTotal() / filteredFoodCosts.length;
//   };

//   // Format currency in Bangladeshi Taka (BDT)
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-BD', {
//       style: 'currency',
//       currency: 'BDT',
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount);
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   // Get current date in YYYY-MM-DD format
//   const getCurrentDate = () => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, '0');
//     const day = String(now.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   // Show loading while auth is being checked
//   if (authLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return null; // Will redirect
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">
//             Food Cost Management
//           </h1>
//           <p className="text-gray-600 mt-2">Track and manage daily food expenses</p>
//         </div>

//         {/* Message Display */}
//         {message.text && (
//           <div className={`mb-6 p-4 rounded-lg ${
//             message.type === 'error' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' :
//             message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' :
//             'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
//           }`}>
//             <div className="flex items-center">
//               <span className="mr-2">
//                 {message.type === 'error' ? '❌' :
//                  message.type === 'success' ? '✅' : 'ℹ️'}
//               </span>
//               <span>{message.text}</span>
//             </div>
//           </div>
//         )}

//         {/* User Info Banner */}
//         <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-green-600">Logged in as: <span className="font-semibold">{user.name}</span></p>
//               <p className="text-xs text-green-500">Role: <span className="font-medium capitalize">{user.role}</span></p>
//             </div>
//             <div className="text-sm text-green-700">
//               <span className="px-2 py-1 bg-green-200 rounded-full">Food Cost Management</span>
//             </div>
//           </div>
//         </div>

//         {/* Main Content - Two Columns */}
//         <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          
//           {/* Left Column - Form */}
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 {editingId ? 'Edit Food Cost Record' : 'Add New Food Cost'}
//               </h2>
//               {editingId && (
//                 <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
//                   Editing Mode
//                 </span>
//               )}
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Date Field with Duplicate Warning */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Date *
//                 </label>
//                 <input
//                   type="date"
//                   name="date"
//                   value={formData.date}
//                   onChange={handleDateChange}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
//                     message.text.includes('already exists') && !editingId
//                       ? 'border-red-500 bg-red-50' 
//                       : 'border-gray-300'
//                   }`}
//                   required
//                   disabled={loading}
//                   max={getCurrentDate()} // Cannot select future dates
//                 />
                
//                 {message.text.includes('already exists') && !editingId && (
//                   <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
//                     ⚠️ <strong>Duplicate Date:</strong> Food cost for {formData.date ? new Date(formData.date).toLocaleDateString() : 'this date'} already exists. 
//                     <span className="block mt-1">Please edit the existing record instead or choose a different date.</span>
//                   </div>
//                 )}
                
//                 <p className="text-xs text-gray-500 mt-1">
//                   Only one food cost entry per day is allowed
//                 </p>
//               </div>

//               {/* Cost Amount */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Cost Amount (BDT) *
//                 </label>
//                 <div className="relative">
//                   <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
//                     ৳
//                   </span>
//                   <input
//                     type="number"
//                     name="cost"
//                     placeholder="0.00"
//                     value={formData.cost}
//                     onChange={handleChange}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                     required
//                     min="0"
//                     step="0.01"
//                     disabled={loading}
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Enter the total food cost in Bangladeshi Taka (BDT)
//                 </p>
//               </div>

//               {/* Note Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Note (Optional)
//                 </label>
//                 <textarea
//                   name="note"
//                   placeholder="Add details about the food expense (e.g., breakfast, lunch, dinner, items purchased, restaurant name, number of people)"
//                   value={formData.note}
//                   onChange={handleChange}
//                   rows="4"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   disabled={loading}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Optional: Add description, meal details, or other information
//                 </p>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex space-x-4">
//                 <button
//                   type="submit"
//                   disabled={loading || (message.text.includes('already exists') && !editingId)}
//                   className={`flex-1 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
//                     editingId ? 'bg-green-600 hover:bg-green-700 text-white' : 
//                     message.text.includes('already exists') && !editingId 
//                       ? 'bg-gray-400 cursor-not-allowed' : 
//                     'bg-blue-600 hover:bg-blue-700 text-white'
//                   }`}
//                 >
//                   {loading ? (
//                     <>
//                       <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       {editingId ? 'Updating...' : 'Saving...'}
//                     </>
//                   ) : (
//                     message.text.includes('already exists') && !editingId 
//                       ? 'Duplicate Date - Edit Existing' 
//                       : editingId 
//                         ? 'Update Food Cost' 
//                         : 'Save Food Cost'
//                   )}
//                 </button>
                
//                 {editingId && (
//                   <button
//                     type="button"
//                     onClick={cancelEdit}
//                     disabled={loading}
//                     className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
//                   >
//                     Cancel
//                   </button>
//                 )}
//               </div>
//             </form>

//           </div>

//           {/* Right Column - Food Cost Records */}
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 {filterYear !== "all" || filterMonth !== "all" ? 'Filtered Food Costs' : 'All Food Costs'}
//                 <span className="text-lg font-normal text-gray-600 ml-2">
//                   ({filteredFoodCosts.length} records)
//                 </span>
//               </h2>
//               <div className="flex items-center space-x-2">
//                 {/* PDF Download Button */}
//                 {filteredFoodCosts.length > 0 && (
//                   <button
//                     onClick={generatePDF}
//                     className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center"
//                     title="Download PDF Report"
//                   >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                     </svg>
//                     Download PDF
//                   </button>
//                 )}
                
//                 <button
//                   onClick={fetchFoodCosts}
//                   disabled={loading}
//                   className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
//                 >
//                   Refresh
//                 </button>
//               </div>
//             </div>

//             {/* Sort Indicator */}
//             <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
//               <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
//               </svg>
//               <p className="text-sm text-blue-800">
//                 <strong>Sorted by:</strong> Date (Newest to Oldest)
//               </p>
//             </div>

//             {/* Filter Section */}
//             <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//               <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//                 <div className="flex flex-wrap gap-4">
//                   {/* Year Filter */}
//                   <div>
//                     <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">
//                       Year
//                     </label>
//                     <select
//                       id="yearFilter"
//                       value={filterYear}
//                       onChange={handleYearChange}
//                       className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
//                     >
//                       <option value="all">All Years</option>
//                       {years.map(year => (
//                         <option key={year} value={year}>{year}</option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Month Filter */}
//                   <div>
//                     <label htmlFor="monthFilter" className="block text-sm font-medium text-gray-700 mb-1">
//                       Month
//                     </label>
//                     <select
//                       id="monthFilter"
//                       value={filterMonth}
//                       onChange={handleMonthChange}
//                       disabled={filterYear === "all"}
//                       className={`w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm ${
//                         filterYear === "all" ? 'bg-gray-100 cursor-not-allowed' : ''
//                       }`}
//                     >
//                       <option value="all">All Months</option>
//                       {months.map(month => (
//                         <option key={month} value={month}>
//                           {monthNames[month - 1]}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Active Filters Display */}
//                   {(filterYear !== "all" || filterMonth !== "all") && (
//                     <div className="flex items-center space-x-2">
//                       <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
//                         <span className="text-sm text-green-700">
//                           {filterYear !== "all" && `Year: ${filterYear}`}
//                           {filterYear !== "all" && filterMonth !== "all" && ", "}
//                           {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
//                         </span>
//                         <button
//                           onClick={() => resetFilters()}
//                           className="text-green-500 hover:text-green-700 text-sm"
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     </div>
//                   )}

//                   {/* Reset Filters Button */}
//                   {(filterYear !== "all" || filterMonth !== "all") && (
//                     <div className="flex items-end">
//                       <button
//                         onClick={resetFilters}
//                         className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
//                       >
//                         Reset Filters
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Results Count */}
//                 <div className="ml-auto text-right">
//                   <span className="text-sm text-gray-600">
//                     Showing {filteredFoodCosts.length} of {foodCosts.length} record(s)
//                   </span>
//                   {filterYear !== "all" || filterMonth !== "all" ? (
//                     <div className="text-sm font-medium text-green-600 mt-1">
//                       Filtered Total: {formatCurrency(calculateFilteredTotal())}
//                     </div>
//                   ) : null}
//                 </div>
//               </div>
//             </div>

//             {loading ? (
//               <div className="text-center py-8">
//                 <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
//                 <p className="mt-2 text-gray-600">Loading food cost records...</p>
//               </div>
//             ) : filteredFoodCosts.length === 0 ? (
//               <div className="text-center py-8">
//                 <div className="text-gray-400 mb-4">
//                   <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
//                   </svg>
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-700 mb-2">
//                   {filterYear === "all" && filterMonth === "all" 
//                     ? "No food cost records yet"
//                     : "No food cost records found for the selected filters"
//                   }
//                 </h3>
//                 <p className="text-gray-500">
//                   {filterYear === "all" && filterMonth === "all" 
//                     ? "Add your first food cost record using the form!"
//                     : "Try changing your filter criteria."
//                   }
//                 </p>
//                 {(filterYear !== "all" || filterMonth !== "all") && (
//                   <button
//                     onClick={resetFilters}
//                     className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                   >
//                     Reset Filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                           <div className="text-xs font-normal text-gray-400 mt-1">Month-Year</div>
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Amount (BDT)
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Note
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Created
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredFoodCosts.map((cost, index) => {
//                         const costDate = new Date(cost.date);
//                         const monthYear = `${monthNames[costDate.getMonth()]} ${costDate.getFullYear()}`;
                        
//                         return (
//                           <tr key={cost._id} className={`hover:bg-gray-50 ${editingId === cost._id ? 'bg-green-50' : ''}`}>
//                             <td className="px-4 py-3">
//                               <div className="font-medium text-gray-900">
//                                 {formatDate(cost.date)}
//                               </div>
//                               <div className="text-xs text-gray-500">
//                                 {monthYear}
//                               </div>
//                               {index === 0 && (
//                                 <div className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
//                                   Newest
//                                 </div>
//                               )}
//                               {index === filteredFoodCosts.length - 1 && filteredFoodCosts.length > 1 && (
//                                 <div className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
//                                   Oldest
//                                 </div>
//                               )}
//                             </td>
//                             <td className="px-4 py-3">
//                               <div className="font-bold text-green-700">
//                                 {formatCurrency(cost.cost)}
//                               </div>
//                             </td>
//                             <td className="px-4 py-3">
//                               <div className="text-sm text-gray-600 max-w-xs truncate" title={cost.note}>
//                                 {cost.note || "-"}
//                               </div>
//                             </td>
//                             <td className="px-4 py-3">
//                               <div className="text-sm text-gray-500">
//                                 {formatDate(cost.createdAt)}
//                               </div>
//                             </td>
//                             <td className="px-4 py-3">
//                               <div className="flex space-x-2">
//                                 <button
//                                   onClick={() => fetchFoodCostForEdit(cost._id)}
//                                   className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
//                                 >
//                                   Edit
//                                 </button>
//                                 <button
//                                   onClick={() => handleDelete(cost._id)}
//                                   className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
//                                 >
//                                   Delete
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                     {/* Table Footer with Total */}
//                     <tfoot className="bg-gray-50">
//                       <tr>
//                         <td className="px-4 py-3 text-sm font-semibold text-gray-900">
//                           Filtered Total
//                           {(filterYear !== "all" || filterMonth !== "all") && (
//                             <div className="text-xs font-normal text-gray-500 mt-1">
//                               {filterYear !== "all" && `Year: ${filterYear}`}
//                               {filterYear !== "all" && filterMonth !== "all" && " • "}
//                               {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
//                             </div>
//                           )}
//                           <div className="text-xs font-normal text-blue-500 mt-1">
//                             Sorted: Newest to Oldest
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="font-bold text-green-700">
//                             {formatCurrency(calculateFilteredTotal())}
//                           </div>
//                           {filteredFoodCosts.length > 0 && (
//                             <div className="text-xs text-green-600 mt-1">
//                               Average: {formatCurrency(calculateAverageDailyCost())}
//                             </div>
//                           )}
//                         </td>
//                         <td colSpan="3" className="px-4 py-3 text-sm text-gray-500">
//                           {filteredFoodCosts.length} record(s)
//                           {filteredFoodCosts.length > 0 && (
//                             <div className="text-xs text-gray-400 mt-1">
//                               Showing {Math.min(filteredFoodCosts.length, 10)} of {filteredFoodCosts.length} records
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>

//                 {/* Summary Stats */}
//                 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="bg-green-50 p-4 rounded-lg">
//                     <h4 className="text-sm font-medium text-green-900">
//                       {filterYear !== "all" || filterMonth !== "all" ? "Filtered Total" : "Total Amount"}
//                     </h4>
//                     <p className="text-2xl font-bold text-green-700">
//                       {formatCurrency(calculateFilteredTotal())}
//                     </p>
//                   </div>
//                   <div className="bg-blue-50 p-4 rounded-lg">
//                     <h4 className="text-sm font-medium text-blue-900">
//                       Average Daily Cost
//                     </h4>
//                     <p className="text-2xl font-bold text-blue-700">
//                       {formatCurrency(calculateAverageDailyCost())}
//                     </p>
//                     <p className="text-xs text-blue-600 mt-1">
//                       Based on {filteredFoodCosts.length} day(s)
//                     </p>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Quick Stats */}
//         <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-sm text-gray-500">Total Records</div>
//             <div className="text-2xl font-bold text-gray-800">{foodCosts.length}</div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-sm text-gray-500">Total Amount</div>
//             <div className="text-2xl font-bold text-green-600">
//               {formatCurrency(foodCosts.reduce((total, cost) => total + cost.cost, 0))}
//             </div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-sm text-gray-500">Average Per Day</div>
//             <div className="text-2xl font-bold text-blue-600">
//               {foodCosts.length > 0 
//                 ? formatCurrency(foodCosts.reduce((total, cost) => total + cost.cost, 0) / foodCosts.length)
//                 : formatCurrency(0)
//               }
//             </div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-sm text-gray-500">Current Month</div>
//             <div className="text-2xl font-bold text-purple-600">
//               {formatCurrency(
//                 foodCosts
//                   .filter(cost => {
//                     const now = new Date();
//                     const costDate = new Date(cost.date);
//                     return costDate.getMonth() === now.getMonth() && 
//                            costDate.getFullYear() === now.getFullYear();
//                   })
//                   .reduce((total, cost) => total + cost.cost, 0)
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  Download,
  Trash2,
  Edit,
  FileText,
  RefreshCw,
  Calendar,

  Clipboard,
  Clock,
  TrendingUp,
  CalendarDays
} from "lucide-react";

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

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 
                  type === 'error' ? 'bg-red-50 border-red-200' :
                  type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200';
  const textColor = type === 'success' ? 'text-green-700' : 
                    type === 'error' ? 'text-red-700' :
                    type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700';
  const iconColor = type === 'success' ? 'text-green-600' : 
                    type === 'error' ? 'text-red-600' :
                    type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600';

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${bgColor} animate-slide-in`}>
      <div className="flex items-center space-x-3">
        {type === 'success' ? (
          <CheckCircle className={`w-5 h-5 ${iconColor}`} />
        ) : type === 'error' ? (
          <AlertCircle className={`w-5 h-5 ${iconColor}`} />
        ) : type === 'warning' ? (
          <AlertCircle className={`w-5 h-5 ${iconColor}`} />
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

// Delete Confirmation Toast Component
const DeleteConfirmationToast = ({ 
  itemName, 
  itemType = "food cost", 
  onConfirm, 
  onCancel 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onCancel, 300);
    }, 10000); // Longer timeout for confirmation

    return () => clearTimeout(timer);
  }, [onCancel]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 animate-slide-in">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)} Record?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete <span className="font-medium">{itemName}</span>? 
                This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onCancel, 300);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onCancel, 300);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setIsVisible(false);
              onConfirm();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FoodCost() {
  const router = useRouter();
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Toast state
  const [toast, setToast] = useState(null);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  const [formData, setFormData] = useState({
    date: "",
    cost: "",
    note: ""
  });

  const [foodCosts, setFoodCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Filter states
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);

  const API_URL = "http://localhost:5004/api";

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Show toast function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Clear toast
  const clearToast = () => {
    setToast(null);
  };

  // Show delete confirmation
  const showDeleteConfirmation = (itemName, itemType, onConfirm) => {
    setDeleteConfirmation({
      itemName,
      itemType,
      onConfirm
    });
  };

  // Clear delete confirmation
  const clearDeleteConfirmation = () => {
    setDeleteConfirmation(null);
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Fetch food costs after authentication
  useEffect(() => {
    if (user && !authLoading) {
      fetchFoodCosts();
    }
  }, [user, authLoading]);

  // Check if user is authenticated
  const checkAuthentication = () => {
    const userData = localStorage.getItem('user');
    const isAuth = localStorage.getItem('isAuthenticated');
    
    if (!userData || !isAuth) {
      router.push('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      
      // Check if user has permission (admin, moderator, or user)
      if (!['admin', 'moderator', 'user'].includes(parsedUser.role)) {
        showToast('Access denied. You do not have permission to manage food costs.', 'error');
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }
      
      setUser(parsedUser);
      setAuthLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  };

  // Update years and months when food costs change
  useEffect(() => {
    if (foodCosts.length > 0) {
      const uniqueYears = Array.from(
        new Set(
          foodCosts.map(cost => {
            const date = new Date(cost.date);
            return date.getFullYear();
          })
        )
      ).sort((a, b) => b - a);

      setYears(uniqueYears);

      if (filterYear !== "all") {
        const yearCosts = foodCosts.filter(cost => {
          const date = new Date(cost.date);
          return date.getFullYear().toString() === filterYear;
        });

        const uniqueMonths = Array.from(
          new Set(
            yearCosts.map(cost => {
              const date = new Date(cost.date);
              return date.getMonth() + 1;
            })
          )
        ).sort((a, b) => b - a);

        setMonths(uniqueMonths);
      } else {
        setMonths([]);
        setFilterMonth("all");
      }
    } else {
      setYears([]);
      setMonths([]);
    }
  }, [foodCosts, filterYear]);

  // Fetch all food costs and sort by date descending
  const fetchFoodCosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/food-costs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Authentication required. Please login again.', 'error');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const sortedCosts = [...data.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        
        setFoodCosts(sortedCosts);
        // showToast('Food costs loaded successfully', 'success');
      } else {
        showToast(data.error || 'Failed to load food costs', 'error');
      }
    } catch (error) {
      showToast(`Error: ${error.message}`, 'error');
      console.error("Error fetching food costs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF report
  const generatePDF = () => {
    if (filteredFoodCosts.length === 0) {
      showToast("No food cost records to download for the selected filters", "error");
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Title
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text("Food Cost Report", pageWidth / 2, 20, { align: "center" });
      
      // Report Info
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
      // Filter information
      let filterInfo = "All Records";
      if (filterYear !== "all" && filterMonth !== "all") {
        filterInfo = `${monthNames[parseInt(filterMonth) - 1]} ${filterYear}`;
      } else if (filterYear !== "all") {
        filterInfo = `Year: ${filterYear}`;
      } else if (filterMonth !== "all") {
        filterInfo = `Month: ${monthNames[parseInt(filterMonth) - 1]}`;
      }
      doc.text(`Report Type: ${filterInfo}`, 14, 36);
      doc.text(`Total Records: ${filteredFoodCosts.length}`, 14, 42);
      
      // Add user info
      if (user) {
        doc.text(`Generated by: ${user.name} (${user.role})`, 14, 48);
      }
      
      // Prepare table data
      const tableData = filteredFoodCosts.map(cost => {
        const costDate = new Date(cost.date);
        const note = cost.note || '-';
        
        return [
          costDate.toLocaleDateString(),
          `BDT ${cost.cost.toFixed(2)}`,
          note,
          `${monthNames[costDate.getMonth()]} ${costDate.getFullYear()}`
        ];
      });
      
      // Add table using autoTable
      autoTable(doc, {
        startY: user ? 55 : 50,
        head: [['Date', 'Amount (BDT)', 'Note', 'Month-Year']],
        body: tableData,
        headStyles: {
          fillColor: [60, 179, 113], // Green color
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 80 },
          3: { cellWidth: 30 }
        },
        didDrawPage: function (data) {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        }
      });
      
      // Calculate totals
      const totalAmount = calculateFilteredTotal();
      const lastY = doc.lastAutoTable.finalY + 10;
      
      // Add summary section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40);
      doc.text("SUMMARY", 14, lastY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Records: ${filteredFoodCosts.length}`, 14, lastY + 8);
      doc.text(`Total Amount: BDT ${totalAmount.toFixed(2)}`, 14, lastY + 16);
      doc.text(`Average Daily Cost: BDT ${(totalAmount / filteredFoodCosts.length).toFixed(2)}`, 14, lastY + 24);
      
      // Add generated date at bottom
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Report generated on ${new Date().toLocaleString()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: "center" }
      );
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const isFilterActive = filterYear !== "all" || filterMonth !== "all";
      const filterSuffix = isFilterActive ? '_filtered' : '';
      const filename = `food_cost_${timestamp}${filterSuffix}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      // Show success message
      showToast(`PDF downloaded successfully: ${filename}`, "success");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast(`Failed to generate PDF: ${error.message}. Please make sure all food cost records have valid data.`, 'error');
    }
  };

  // Function to check for duplicate day entries
  const checkForDuplicateDay = async (selectedDate, currentEditingId = null) => {
    if (!selectedDate) return false;
    
    try {
      const response = await fetch(`${API_URL}/food-costs/check-date?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.exists) {
        // If editing, only return true if it's a different record
        if (currentEditingId && data.data._id === currentEditingId) {
          return false; // Same record, not a duplicate
        }
        return data.data; // Return existing record data
      }
      
      return false;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }
  };

  // Fetch single food cost for editing
  const fetchFoodCostForEdit = async (id) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/food-costs/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const cost = data.data;
        setFormData({
          date: cost.date.split('T')[0],
          cost: cost.cost.toString(),
          note: cost.note || ""
        });
        setEditingId(id);
        showToast(`Editing food cost record from ${new Date(cost.date).toLocaleDateString()}`, 'info');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast(data.message || 'Failed to load food cost data', 'error');
      }
    } catch (error) {
      showToast(`Failed to load food cost record: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Check for duplicate when date is selected
  const handleDateChange = async (e) => {
    const { value } = e.target;
    
    setFormData({ ...formData, date: value });
    
    // Check for duplicate after a short delay
    if (value && !editingId) {
      setTimeout(async () => {
        const duplicate = await checkForDuplicateDay(value);
        if (duplicate) {
          showToast(
            `⚠️ Food cost for ${new Date(value).toLocaleDateString()} already exists. Please edit the existing record instead.`,
            'warning'
          );
        }
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.date) {
        throw new Error("Please select a date");
      }
      if (!formData.cost || parseFloat(formData.cost) <= 0) {
        throw new Error("Please enter a valid cost amount");
      }

      // Check for duplicate day
      const duplicate = await checkForDuplicateDay(formData.date, editingId);
      
      if (duplicate) {
        const dateStr = new Date(formData.date).toLocaleDateString();
        
        if (editingId) {
          throw new Error(`Cannot update: A food cost record for ${dateStr} already exists. Please keep the original date or choose a different one.`);
        } else {
          throw new Error(`A food cost record for ${dateStr} already exists. Please edit the existing record instead.`);
        }
      }

      const url = editingId 
        ? `${API_URL}/food-costs/${editingId}`
        : `${API_URL}/food-costs`;
      
      const method = editingId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        const actionText = editingId ? "updated" : "saved";
        showToast(`✅ Food cost ${actionText} successfully!`, 'success');
        
        setFormData({
          date: "",
          cost: "",
          note: ""
        });
        
        setEditingId(null);
        
        fetchFoodCosts();
        
      } else {
        showToast(`❌ ${data.message || data.error}`, 'error');
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      showToast(`❌ ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setFormData({
      date: "",
      cost: "",
      note: ""
    });
    setEditingId(null);
    showToast('Edit cancelled', 'info');
  };

  // Delete food cost record
  const handleDeleteClick = (cost) => {
    showDeleteConfirmation(
      `food cost record for ${formatDate(cost.date)} (${formatCurrency(cost.cost)})`,
      "food cost",
      () => handleDeleteConfirm(cost._id)
    );
  };

  const handleDeleteConfirm = async (id) => {
    try {
      const response = await fetch(`${API_URL}/food-costs/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        showToast(`✅ ${data.message || 'Food cost record deleted successfully'}`, 'success');
        if (editingId === id) {
          cancelEdit();
        }
        fetchFoodCosts();
      } else {
        showToast(`❌ ${data.message || data.error}`, 'error');
      }
    } catch (error) {
      showToast(`❌ Failed to delete food cost record: ${error.message}`, 'error');
    }
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
    setFilterMonth("all");
    // showToast('Year filter applied', 'info');
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
    // showToast('Month filter applied', 'info');
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterYear("all");
    setFilterMonth("all");
    showToast('Filters reset', 'info');
  };

  // Filter food costs based on selected year and month and sort by date descending
  const filteredFoodCosts = useMemo(() => {
    const filtered = foodCosts.filter(cost => {
      const date = new Date(cost.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString();

      if (filterYear !== "all" && year !== filterYear) {
        return false;
      }

      if (filterMonth !== "all" && month !== filterMonth) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [foodCosts, filterYear, filterMonth]);

  // Calculate total for filtered food costs
  const calculateFilteredTotal = () => {
    return filteredFoodCosts.reduce((total, cost) => total + cost.cost, 0);
  };

  // Calculate average daily cost
  const calculateAverageDailyCost = () => {
    if (filteredFoodCosts.length === 0) return 0;
    return calculateFilteredTotal() / filteredFoodCosts.length;
  };

  // Format currency in Bangladeshi Taka (BDT)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notifications */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
        
        {/* Delete Confirmation Toast */}
        {deleteConfirmation && (
          <DeleteConfirmationToast 
            itemName={deleteConfirmation.itemName}
            itemType={deleteConfirmation.itemType}
            onConfirm={deleteConfirmation.onConfirm}
            onCancel={clearDeleteConfirmation}
          />
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Food Cost Management
          </h1>
          <p className="text-gray-600 mt-2">Track and manage daily food expenses</p>
        </div>

        {/* User Info Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Logged in as: <span className="font-semibold">{user.name}</span></p>
              <p className="text-xs text-green-500">Role: <span className="font-medium capitalize">{user.role}</span></p>
            </div>
            <div className="text-sm text-green-700">
              <span className="px-2 py-1 bg-green-200 rounded-full">Food Cost Management</span>
            </div>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          
          {/* Left Column - Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                {editingId ? (
                  <>
                    <Edit className="w-6 h-6 mr-2 text-green-600" />
                    Edit Food Cost Record
                  </>
                ) : (
                  <>
                    
                    Add New Food Cost
                  </>
                )}
              </h2>
              {editingId && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full flex items-center">
                  <Edit className="w-4 h-4 mr-1" />
                  Editing Mode
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Field with Duplicate Warning */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    toast?.type === 'warning' && !editingId
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-300'
                  }`}
                  required
                  disabled={loading}
                  max={getCurrentDate()} // Cannot select future dates
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only one food cost entry per day is allowed
                </p>
              </div>

              {/* Cost Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
               
                  Cost Amount (BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ৳
                  </span>
                  <input
                    type="number"
                    name="cost"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the total food cost in Bangladeshi Taka (BDT)
                </p>
              </div>

              {/* Note Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clipboard className="w-5 h-5 mr-2 text-gray-400" />
                  Note (Optional)
                </label>
                <textarea
                  name="note"
                  placeholder="Add details about the food expense (e.g., breakfast, lunch, dinner, items purchased, restaurant name, number of people)"
                  value={formData.note}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add description, meal details, or other information
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading || (toast?.type === 'warning' && !editingId)}
                  className={`flex-1 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                    editingId ? 'bg-green-600 hover:bg-green-700 text-white' : 
                    toast?.type === 'warning' && !editingId 
                      ? 'bg-gray-400 cursor-not-allowed' : 
                    'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {editingId ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    toast?.type === 'warning' && !editingId 
                      ? 'Duplicate Date - Edit Existing' 
                      : editingId 
                        ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Update Food Cost
                          </>
                        )
                        : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Save Food Cost
                          </>
                        )
                  )}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition duration-200 flex items-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                )}
              </div>
            </form>

          </div>

          {/* Right Column - Food Cost Records */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-green-600" />
                {filterYear !== "all" || filterMonth !== "all" ? 'Filtered Food Costs' : 'All Food Costs'}
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({filteredFoodCosts.length} records)
                </span>
              </h2>
              <div className="flex items-center space-x-2">
                {/* PDF Download Button */}
                {filteredFoodCosts.length > 0 && (
                  <button
                    onClick={generatePDF}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center"
                    title="Download PDF Report"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </button>
                )}
                
                <button
                  onClick={fetchFoodCosts}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium flex items-center"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Sort Indicator */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                <strong>Sorted by:</strong> Date (Newest to Oldest)
              </p>
            </div>

            {/* Filter Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex flex-wrap gap-4">
                  {/* Year Filter */}
                  <div>
                    <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      id="yearFilter"
                      value={filterYear}
                      onChange={handleYearChange}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    >
                      <option value="all">All Years</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Month Filter */}
                  <div>
                    <label htmlFor="monthFilter" className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      id="monthFilter"
                      value={filterMonth}
                      onChange={handleMonthChange}
                      disabled={filterYear === "all"}
                      className={`w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm ${
                        filterYear === "all" ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="all">All Months</option>
                      {months.map(month => (
                        <option key={month} value={month}>
                          {monthNames[month - 1]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Filters Display */}
                  {(filterYear !== "all" || filterMonth !== "all") && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                        <span className="text-sm text-green-700">
                          {filterYear !== "all" && `Year: ${filterYear}`}
                          {filterYear !== "all" && filterMonth !== "all" && ", "}
                          {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
                        </span>
                        <button
                          onClick={() => resetFilters()}
                          className="text-green-500 hover:text-green-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reset Filters Button */}
                  {(filterYear !== "all" || filterMonth !== "all") && (
                    <div className="flex items-end">
                      <button
                        onClick={resetFilters}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Results Count */}
                <div className="ml-auto text-right">
                  <span className="text-sm text-gray-600">
                    Showing {filteredFoodCosts.length} of {foodCosts.length} record(s)
                  </span>
                  {filterYear !== "all" || filterMonth !== "all" ? (
                    <div className="text-sm font-medium text-green-600 mt-1">
                      Filtered Total: {formatCurrency(calculateFilteredTotal())}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-600">Loading food cost records...</p>
              </div>
            ) : filteredFoodCosts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {filterYear === "all" && filterMonth === "all" 
                    ? "No food cost records yet"
                    : "No food cost records found for the selected filters"
                  }
                </h3>
                <p className="text-gray-500">
                  {filterYear === "all" && filterMonth === "all" 
                    ? "Add your first food cost record using the form!"
                    : "Try changing your filter criteria."
                  }
                </p>
                {(filterYear !== "all" || filterMonth !== "all") && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <CalendarDays className="w-4 h-4 mr-1" />
                            Date
                          </div>
                          <div className="text-xs font-normal text-gray-400 mt-1">Month-Year</div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                           
                            Amount (BDT)
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <Clipboard className="w-4 h-4 mr-1" />
                            Note
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Created
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredFoodCosts.map((cost, index) => {
                        const costDate = new Date(cost.date);
                        const monthYear = `${monthNames[costDate.getMonth()]} ${costDate.getFullYear()}`;
                        
                        return (
                          <tr key={cost._id} className={`hover:bg-gray-50 ${editingId === cost._id ? 'bg-green-50' : ''}`}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                {formatDate(cost.date)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {monthYear}
                              </div>
                              {index === 0 && (
                                <div className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded flex items-center">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Newest
                                </div>
                              )}
                              {index === filteredFoodCosts.length - 1 && filteredFoodCosts.length > 1 && (
                                <div className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                                  Oldest
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-green-700 flex items-center">
                           
                                {formatCurrency(cost.cost)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-600 max-w-xs truncate" title={cost.note}>
                                {cost.note || "-"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-500">
                                {formatDate(cost.createdAt)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => fetchFoodCostForEdit(cost._id)}
                                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex items-center"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(cost)}
                                  className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {/* Table Footer with Total */}
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          Filtered Total
                          {(filterYear !== "all" || filterMonth !== "all") && (
                            <div className="text-xs font-normal text-gray-500 mt-1">
                              {filterYear !== "all" && `Year: ${filterYear}`}
                              {filterYear !== "all" && filterMonth !== "all" && " • "}
                              {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
                            </div>
                          )}
                          <div className="text-xs font-normal text-blue-500 mt-1">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            Sorted: Newest to Oldest
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-green-700">
                            {formatCurrency(calculateFilteredTotal())}
                          </div>
                          {filteredFoodCosts.length > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              Average: {formatCurrency(calculateAverageDailyCost())}
                            </div>
                          )}
                        </td>
                        <td colSpan="3" className="px-4 py-3 text-sm text-gray-500">
                          {filteredFoodCosts.length} record(s)
                          {filteredFoodCosts.length > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              Showing {Math.min(filteredFoodCosts.length, 10)} of {filteredFoodCosts.length} records
                            </div>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 flex items-center">
                     
                      {filterYear !== "all" || filterMonth !== "all" ? "Filtered Total" : "Total Amount"}
                    </h4>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(calculateFilteredTotal())}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Average Daily Cost
                    </h4>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(calculateAverageDailyCost())}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Based on {filteredFoodCosts.length} day(s)
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Records</div>
              <div className="text-2xl font-bold text-gray-800">{foodCosts.length}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            
            <div>
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(foodCosts.reduce((total, cost) => total + cost.cost, 0))}
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Average Per Day</div>
              <div className="text-2xl font-bold text-purple-600">
                {foodCosts.length > 0 
                  ? formatCurrency(foodCosts.reduce((total, cost) => total + cost.cost, 0) / foodCosts.length)
                  : formatCurrency(0)
                }
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg mr-4">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Month</div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(
                  foodCosts
                    .filter(cost => {
                      const now = new Date();
                      const costDate = new Date(cost.date);
                      return costDate.getMonth() === now.getMonth() && 
                             costDate.getFullYear() === now.getFullYear();
                    })
                    .reduce((total, cost) => total + cost.cost, 0)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
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