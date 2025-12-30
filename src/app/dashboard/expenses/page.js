// "use client";

// import React, { useState, useEffect, useMemo } from "react";

// export default function BillsPage() {
//   // Form state
//   const [bills, setBills] = useState([
//     { name: "Electricity Bill", amount: "", date: "", paymentMethod: "", isFixed: true },
//     { name: "Water Bill", amount: "", date: "", paymentMethod: "", isFixed: true },
//     { name: "Internet Bill", amount: "", date: "", paymentMethod: "", isFixed: true },
//     { name: "Gas Bill", amount: "", date: "", paymentMethod: "", isFixed: true },
//   ]);
  
//   // Data state
//   const [allBills, setAllBills] = useState([]);
//   const [billsByMonth, setBillsByMonth] = useState([]);
//   const [billTypes, setBillTypes] = useState([]);
//   const [stats, setStats] = useState(null);
  
//   // UI state
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [activeView, setActiveView] = useState("form"); // "form" or "table"
//   const [selectedMonth, setSelectedMonth] = useState(null);
//   const [filterYear, setFilterYear] = useState("all");
//   const [filterMonth, setFilterMonth] = useState("all");
//   const [editingMonth, setEditingMonth] = useState(null);
//   const [editFormData, setEditFormData] = useState([]);
//   const [isEditMode, setIsEditMode] = useState(false);

//   // Filter states
//   const [years, setYears] = useState([]);
//   const [months, setMonths] = useState([]);

//   // API base URL
//   const API_URL = "http://localhost:5001/api";

//   // Month names for display
//   const monthNames = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   // Fetch all data when component mounts
//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   // Update years and months when bills change
//   useEffect(() => {
//     if (allBills.length > 0) {
//       // Extract unique years from bills
//       const uniqueYears = Array.from(
//         new Set(
//           allBills.map(bill => {
//             const date = new Date(bill.date);
//             return date.getFullYear();
//           })
//         )
//       ).sort((a, b) => b - a); // Sort descending (newest first)

//       setYears(uniqueYears);

//       // If a year is selected, update available months
//       if (filterYear !== "all") {
//         const yearBills = allBills.filter(bill => {
//           const date = new Date(bill.date);
//           return date.getFullYear().toString() === filterYear;
//         });

//         const uniqueMonths = Array.from(
//           new Set(
//             yearBills.map(bill => {
//               const date = new Date(bill.date);
//               return date.getMonth() + 1; // Months are 0-indexed in JS
//             })
//           )
//         ).sort((a, b) => a - b);

//         setMonths(uniqueMonths);
//       } else {
//         setMonths([]);
//         setFilterMonth("all");
//       }
//     } else {
//       setYears([]);
//       setMonths([]);
//     }
//   }, [allBills, filterYear]);

//   // Fetch all necessary data
//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
//       setMessage({ type: '', text: '' });

//       // Fetch all bills
//       const billsResponse = await fetch(`${API_URL}/bills`);
//       const billsData = await billsResponse.json();
      
//       if (billsData.success) {
//         setAllBills(billsData.data);
//       }

//       // Fetch bills by month
//       const monthResponse = await fetch(`${API_URL}/bills/by-month`);
//       const monthData = await monthResponse.json();
      
//       if (monthData.success) {
//         setBillsByMonth(monthData.data);
//       }

//       // Fetch bill types
//       const typesResponse = await fetch(`${API_URL}/bills/types`);
//       const typesData = await typesResponse.json();
      
//       if (typesData.success) {
//         setBillTypes(typesData.data);
//       }

//       // Fetch statistics
//       const statsResponse = await fetch(`${API_URL}/bills/stats`);
//       const statsData = await statsResponse.json();
      
//       if (statsData.success) {
//         setStats(statsData.data);
//       }

//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setMessage({ 
//         type: 'error', 
//         text: `Cannot connect to backend: ${error.message}. Make sure backend is running on port 5001!` 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Form functions
//   const updateBillField = (index, field, value) => {
//     const updatedBills = [...bills];
//     updatedBills[index][field] = value;
//     setBills(updatedBills);
//   };

//   const addBillField = () => {
//     setBills([
//       ...bills,
//       { name: "Other Bill", amount: "", date: "", paymentMethod: "", isFixed: false },
//     ]);
//   };

//   const removeBillField = (index) => {
//     if (bills[index].isFixed) return;
//     setBills(bills.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: '', text: '' });
    
//     try {
//       // Filter out bills with empty amounts
//       const billsToSave = bills.filter(bill => bill.amount !== "" && bill.amount !== "0");
      
//       if (billsToSave.length === 0) {
//         setMessage({ 
//           type: 'error', 
//           text: "Please enter at least one bill amount" 
//         });
//         setLoading(false);
//         return;
//       }
      
//       // Check for duplicates in the same form
//       const billNames = billsToSave.map(bill => bill.name);
//       const hasDuplicates = new Set(billNames).size !== billNames.length;
      
//       if (hasDuplicates) {
//         setMessage({ 
//           type: 'error', 
//           text: "❌ Duplicate bill names detected in the form. Please remove duplicates before saving." 
//         });
//         setLoading(false);
//         return;
//       }
      
//       // Format data for API
//       const formattedBills = billsToSave.map(bill => ({
//         ...bill,
//         amount: parseFloat(bill.amount),
//         date: bill.date || new Date().toISOString().split('T')[0],
//         paymentMethod: bill.paymentMethod.toLowerCase().replace(' ', '_')
//       }));
      
//       // Send to backend
//       const response = await fetch(`${API_URL}/bills`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formattedBills)
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         let messageText = `✅ Successfully saved ${formattedBills.length} bill(s)!`;
        
//         // Add duplicate warnings if any
//         if (data.duplicates && data.duplicates.length > 0) {
//           messageText += `\n\n⚠️ Some bills were duplicates and not saved:\n`;
//           data.duplicates.forEach(duplicate => {
//             messageText += `• ${duplicate.message}\n`;
//           });
//         }
        
//         // Add error messages if any
//         if (data.errors && data.errors.length > 0) {
//           messageText += `\n\n❌ Errors:\n`;
//           data.errors.forEach(error => {
//             messageText += `• ${error.message}\n`;
//           });
//         }
        
//         setMessage({ 
//           type: data.duplicates || data.errors ? 'warning' : 'success', 
//           text: messageText 
//         });
        
//         // Reset form for non-fixed bills
//         const resetBills = bills.map(bill => 
//           bill.isFixed 
//             ? { ...bill, amount: "", date: "", paymentMethod: "" }
//             : null
//         ).filter(Boolean);
        
//         setBills(resetBills);
        
//         // Refresh data
//         fetchAllData();
        
//         // Switch to table view
//         setActiveView("table");
        
//       } else {
//         // Handle errors
//         let errorMessage = `❌ Error: ${data.message || data.error}`;
        
//         if (data.duplicates && data.duplicates.length > 0) {
//           errorMessage += "\n\nDuplicate bills detected:\n";
//           data.duplicates.forEach(duplicate => {
//             errorMessage += `• ${duplicate.message}\n`;
//           });
//         }
        
//         if (data.errors && data.errors.length > 0) {
//           errorMessage += "\n\nErrors:\n";
//           data.errors.forEach(err => {
//             errorMessage += `• ${err.message}\n`;
//           });
//         }
        
//         setMessage({ 
//           type: 'error', 
//           text: errorMessage 
//         });
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setMessage({ 
//         type: 'error', 
//         text: "❌ Error saving bills. Please check if the server is running." 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Start editing a month
//   const startEditMonth = async (monthData) => {
//     try {
//       setLoading(true);
//       setMessage({ type: '', text: '' });
      
//       // Get bills for this specific month
//       const [year, month] = monthData.month.split('-');
//       const response = await fetch(`${API_URL}/bills/month/${year}/${month}`);
//       const data = await response.json();
      
//       if (data.success) {
//         // Set edit form data
//         const formattedBills = data.data.map(bill => ({
//           _id: bill._id,
//           name: bill.name,
//           amount: bill.amount.toString(),
//           date: new Date(bill.date).toISOString().split('T')[0],
//           paymentMethod: bill.paymentMethod,
//           isFixed: bill.isFixed || false
//         }));
        
//         // Add missing bill types (for fixed bills that might not exist yet)
//         const fixedBills = ["Electricity Bill", "Water Bill", "Internet Bill", "Gas Bill"];
//         fixedBills.forEach(billName => {
//           if (!formattedBills.find(bill => bill.name === billName)) {
//             formattedBills.push({
//               name: billName,
//               amount: "",
//               date: `${year}-${month.padStart(2, '0')}-15`,
//               paymentMethod: "bank_transfer",
//               isFixed: true
//             });
//           }
//         });
        
//         setEditFormData(formattedBills);
//         setEditingMonth(monthData.month);
//         setIsEditMode(true);
//         setSelectedMonth(monthData.month);
//         setFilterMonth(monthData.month);
        
//         setMessage({ 
//           type: 'info', 
//           text: `Editing bills for ${monthData.monthName}` 
//         });
        
//         // Scroll to edit form
//         setTimeout(() => {
//           document.getElementById('edit-form')?.scrollIntoView({ behavior: 'smooth' });
//         }, 100);
        
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: `Failed to load bills: ${data.message || data.error}` 
//         });
//       }
//     } catch (error) {
//       setMessage({ 
//         type: 'error', 
//         text: `Error loading month data: ${error.message}` 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle edit form changes
//   const handleEditChange = (index, field, value) => {
//     const updatedFormData = [...editFormData];
//     updatedFormData[index][field] = value;
//     setEditFormData(updatedFormData);
//   };

//   // Add new bill in edit mode
//   const addEditBillField = () => {
//     setEditFormData([
//       ...editFormData,
//       { 
//         name: "Other Bill", 
//         amount: "", 
//         date: new Date().toISOString().split('T')[0], 
//         paymentMethod: "bank_transfer", 
//         isFixed: false 
//       }
//     ]);
//   };

//   // Remove bill in edit mode
//   const removeEditBillField = (index) => {
//     if (editFormData[index].isFixed) return;
//     setEditFormData(editFormData.filter((_, i) => i !== index));
//   };

//   // Save edited month
//   const saveEditedMonth = async () => {
//     setLoading(true);
//     setMessage({ type: '', text: '' });
    
//     try {
//       // Check for duplicates in edit form
//       const billNames = editFormData
//         .filter(bill => bill.amount !== "" && bill.amount !== "0")
//         .map(bill => bill.name);
      
//       const hasDuplicates = new Set(billNames).size !== billNames.length;
      
//       if (hasDuplicates) {
//         setMessage({ 
//           type: 'error', 
//           text: "❌ Duplicate bill names detected. Please remove duplicates before saving." 
//         });
//         setLoading(false);
//         return;
//       }
      
//       // Filter out bills with empty amounts
//       const billsToSave = editFormData.filter(bill => bill.amount !== "" && bill.amount !== "0");
      
//       if (billsToSave.length === 0) {
//         setMessage({ 
//           type: 'error', 
//           text: "Please enter at least one bill amount" 
//         });
//         setLoading(false);
//         return;
//       }
      
//       // Format data for API
//       const formattedBills = billsToSave.map(bill => ({
//         ...bill,
//         amount: parseFloat(bill.amount),
//         date: bill.date || new Date().toISOString().split('T')[0],
//         paymentMethod: bill.paymentMethod.toLowerCase().replace(' ', '_')
//       }));
      
//       // Send update request
//       const response = await fetch(`${API_URL}/bills/update-month`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           monthYear: editingMonth,
//           bills: formattedBills
//         })
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         let messageText = `✅ Successfully updated ${editingMonth} bills!\n`;
//         messageText += `• Updated: ${data.data.updated}\n`;
//         messageText += `• Created: ${data.data.created}\n`;
//         messageText += `• Deleted: ${data.data.deleted}`;
        
//         if (data.data.details?.errors?.length > 0) {
//           messageText += `\n\n⚠️ Some issues:\n`;
//           data.data.details.errors.forEach(error => {
//             messageText += `• ${error.message}\n`;
//           });
//         }
        
//         setMessage({ 
//           type: 'success', 
//           text: messageText 
//         });
        
//         // Reset edit mode
//         cancelEditMode();
        
//         // Refresh data
//         fetchAllData();
        
//       } else {
//         let errorMessage = `❌ Error: ${data.message || data.error}`;
        
//         if (data.errors && data.errors.length > 0) {
//           errorMessage += "\nErrors:";
//           data.errors.forEach(err => {
//             errorMessage += `\n• ${err.message}`;
//           });
//         }
        
//         setMessage({ 
//           type: 'error', 
//           text: errorMessage 
//         });
//       }
//     } catch (error) {
//       console.error('Error updating month:', error);
//       setMessage({ 
//         type: 'error', 
//         text: `❌ Error updating month: ${error.message}` 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cancel edit mode
//   const cancelEditMode = () => {
//     setEditingMonth(null);
//     setEditFormData([]);
//     setIsEditMode(false);
//     setMessage({ type: '', text: '' });
//   };

//   // Delete entire month
//   const deleteMonth = async (monthData) => {
//     if (!confirm(`Are you sure you want to delete ALL bills for ${monthData.monthName}? This action cannot be undone!`)) {
//       return;
//     }
    
//     try {
//       setLoading(true);
//       const [year, month] = monthData.month.split('-');
      
//       const response = await fetch(`${API_URL}/bills/month/${year}/${month}`, {
//         method: 'DELETE'
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         setMessage({ 
//           type: 'success', 
//           text: `✅ ${data.message}` 
//         });
        
//         // Reset selections
//         setSelectedMonth(null);
//         setFilterYear("all");
//         setFilterMonth("all");
        
//         // Refresh data
//         fetchAllData();
        
//         // Cancel edit mode if editing this month
//         if (editingMonth === monthData.month) {
//           cancelEditMode();
//         }
        
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: `❌ Error: ${data.message || data.error}` 
//         });
//       }
//     } catch (error) {
//       console.error('Error deleting month:', error);
//       setMessage({ 
//         type: 'error', 
//         text: `❌ Error deleting month: ${error.message}` 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete single bill
//   const handleDeleteBill = async (id) => {
//     if (!confirm("Are you sure you want to delete this bill?")) return;
    
//     try {
//       const response = await fetch(`${API_URL}/bills/${id}`, {
//         method: 'DELETE'
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         setMessage({ 
//           type: 'success', 
//           text: '✅ Bill deleted successfully' 
//         });
//         fetchAllData(); // Refresh data
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: `❌ Error: ${data.message || data.error}` 
//         });
//       }
//     } catch (error) {
//       console.error('Error deleting bill:', error);
//       setMessage({ 
//         type: 'error', 
//         text: '❌ Error deleting bill' 
//       });
//     }
//   };

//   // Helper functions
//   const getTodayDate = () => new Date().toISOString().split("T")[0];
  
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(amount || 0);
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getMonthName = (monthYear) => {
//     const [year, month] = monthYear.split('-');
//     const date = new Date(year, month - 1);
//     return date.toLocaleString('default', { month: 'long', year: 'numeric' });
//   };

//   // Handle year filter change
//   const handleYearChange = (e) => {
//     setFilterYear(e.target.value);
//     setFilterMonth("all"); // Reset month when year changes
//     setSelectedMonth(null);
//   };

//   // Handle month filter change
//   const handleMonthChange = (e) => {
//     setFilterMonth(e.target.value);
//     setSelectedMonth(null);
//   };

//   // Reset all filters
//   const resetFilters = () => {
//     setFilterYear("all");
//     setFilterMonth("all");
//     setSelectedMonth(null);
//   };

//   // Filter bills based on selected year and month
//   const filteredBills = useMemo(() => {
//     return allBills.filter(bill => {
//       const date = new Date(bill.date);
//       const year = date.getFullYear().toString();
//       const month = (date.getMonth() + 1).toString().padStart(2, '0');
//       const monthYear = `${year}-${month}`;

//       // Apply year filter
//       if (filterYear !== "all" && year !== filterYear) {
//         return false;
//       }

//       // Apply month filter (when month is selected)
//       if (filterMonth !== "all" && filterMonth !== "all") {
//         if (filterMonth.includes('-')) {
//           // Month-year format (YYYY-MM)
//           return monthYear === filterMonth;
//         } else {
//           // Just month number
//           return (date.getMonth() + 1).toString() === filterMonth;
//         }
//       }

//       return true;
//     });
//   }, [allBills, filterYear, filterMonth]);

//   // Calculate total for filtered bills
//   const calculateFilteredTotal = () => {
//     return filteredBills.reduce((total, bill) => total + bill.amount, 0);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 text-center">
//           <h1 className="text-3xl font-bold text-gray-800">Utility Bills Management</h1>
//           <p className="text-gray-600 mt-2">Track and manage your monthly utility expenses</p>
//         </div>

//         {/* Message Display */}
//         {message.text && (
//           <div className={`mb-6 p-4 rounded-lg ${
//             message.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : 
//             message.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
//             message.type === 'warning' ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' :
//             'bg-blue-100 border border-blue-300 text-blue-800'
//           }`}>
//             <div className="flex justify-between items-center">
//               <div className="flex items-center">
//                 <span className="mr-2">
//                   {message.type === 'success' ? '✅' : 
//                    message.type === 'error' ? '❌' : 
//                    message.type === 'warning' ? '⚠️' :
//                    '📝'}
//                 </span>
//                 <span className="whitespace-pre-line">{message.text}</span>
//               </div>
//               <button
//                 onClick={() => setMessage({ type: '', text: '' })}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ✕
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Stats Cards */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//             <div className="bg-white rounded-lg shadow p-4">
//               <div className="text-sm text-gray-500">Total Spent</div>
//               <div className="text-2xl font-bold text-blue-600">
//                 {formatCurrency(stats.totalAmount)}
//               </div>
//             </div>
//             <div className="bg-white rounded-lg shadow p-4">
//               <div className="text-sm text-gray-500">Total Bills</div>
//               <div className="text-2xl font-bold text-green-600">
//                 {stats.totalBills}
//               </div>
//             </div>
//             <div className="bg-white rounded-lg shadow p-4">
//               <div className="text-sm text-gray-500">Avg per Bill</div>
//               <div className="text-2xl font-bold text-purple-600">
//                 {formatCurrency(stats.avgPerBill)}
//               </div>
//             </div>
//             <div className="bg-white rounded-lg shadow p-4">
//               <div className="text-sm text-gray-500">Months Tracked</div>
//               <div className="text-2xl font-bold text-orange-600">
//                 {billsByMonth.length}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Navigation Tabs */}
//         <div className="flex space-x-4 mb-8">
//           <button
//             onClick={() => setActiveView("form")}
//             className={`px-6 py-3 rounded-lg font-medium ${activeView === "form" ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
//           >
//             Add Bills
//           </button>
//           <button
//             onClick={() => setActiveView("table")}
//             className={`px-6 py-3 rounded-lg font-medium ${activeView === "table" ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
//           >
//             View Bills
//           </button>
//           <button
//             onClick={fetchAllData}
//             disabled={loading}
//             className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
//           >
//             {loading ? 'Refreshing...' : 'Refresh Data'}
//           </button>
//         </div>

//         {/* Form View */}
//         {activeView === "form" && (
//           <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Monthly Bills</h2>
            
//             <form onSubmit={handleSubmit}>
//               {/* Form Header */}
//               <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-500 mb-4">
//                 <div className="col-span-3">Bill Name</div>
//                 <div className="col-span-2">Amount ($)</div>
//                 <div className="col-span-3">Date</div>
//                 <div className="col-span-3">Payment Method</div>
//                 <div className="col-span-1">Action</div>
//               </div>

//               {/* Bill Rows */}
//               {bills.map((bill, index) => (
//                 <div key={index} className="grid grid-cols-12 gap-3 items-center mb-4">
//                   {/* Bill Name */}
//                   <div className="col-span-3">
//                     {bill.isFixed ? (
//                       <div className="px-3 py-2 border rounded-md bg-gray-50 text-gray-700">
//                         {bill.name}
//                       </div>
//                     ) : (
//                       <input
//                         type="text"
//                         value={bill.name}
//                         onChange={(e) => updateBillField(index, "name", e.target.value)}
//                         className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter bill name"
//                       />
//                     )}
//                   </div>

//                   {/* Amount */}
//                   <div className="col-span-2">
//                     <input
//                       type="number"
//                       placeholder="0.00"
//                       value={bill.amount}
//                       onChange={(e) => updateBillField(index, "amount", e.target.value)}
//                       className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                       min="0"
//                       step="0.01"
//                       required
//                     />
//                   </div>

//                   {/* Date */}
//                   <div className="col-span-3">
//                     <input
//                       type="date"
//                       value={bill.date}
//                       max={getTodayDate()}
//                       onChange={(e) => updateBillField(index, "date", e.target.value)}
//                       className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                   </div>

//                   {/* Payment Method */}
//                   <div className="col-span-3">
//                     <select
//                       value={bill.paymentMethod}
//                       onChange={(e) => updateBillField(index, "paymentMethod", e.target.value)}
//                       className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                       required
//                     >
//                       <option value="">Select Method</option>
//                       <option value="cash">Cash</option>
//                       <option value="bank_transfer">Bank Transfer</option>
//                       <option value="credit_card">Credit Card</option>
//                       <option value="debit_card">Debit Card</option>
//                       <option value="online">Online Payment</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>

//                   {/* Remove Button */}
//                   <div className="col-span-1">
//                     {!bill.isFixed && (
//                       <button
//                         type="button"
//                         onClick={() => removeBillField(index)}
//                         className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
//                       >
//                         ✕
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}

//               {/* Action Buttons */}
//               <div className="flex space-x-4 mt-6">
//                 <button
//                   type="button"
//                   onClick={addBillField}
//                   className="px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
//                 >
//                   + Add Another Bill
//                 </button>
                
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? 'Saving...' : 'Save All Bills'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* Table View */}
//         {activeView === "table" && (
//           <div className="space-y-8">
//             {/* Edit Month Form - Only shown when editing */}
//             {isEditMode && editingMonth && (
//               <div id="edit-form" className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-300">
//                 <div className="flex justify-between items-center mb-6">
//                   <h2 className="text-2xl font-bold text-gray-800">
//                     Editing: {getMonthName(editingMonth)}
//                   </h2>
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={cancelEditMode}
//                       className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={saveEditedMonth}
//                       disabled={loading}
//                       className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
//                     >
//                       {loading ? 'Saving...' : 'Save Changes'}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <div className="text-sm text-gray-600 mb-2">
//                     Update the bills for {getMonthName(editingMonth)}. Leave amount empty to remove a bill.
//                   </div>
//                 </div>

//                 {/* Edit Form Header */}
//                 <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-500 mb-4">
//                   <div className="col-span-3">Bill Name</div>
//                   <div className="col-span-2">Amount ($)</div>
//                   <div className="col-span-3">Date</div>
//                   <div className="col-span-3">Payment Method</div>
//                   <div className="col-span-1">Action</div>
//                 </div>

//                 {/* Edit Bill Rows */}
//                 {editFormData.map((bill, index) => (
//                   <div key={index} className="grid grid-cols-12 gap-3 items-center mb-4">
//                     {/* Bill Name */}
//                     <div className="col-span-3">
//                       {bill.isFixed ? (
//                         <div className="px-3 py-2 border rounded-md bg-gray-50 text-gray-700">
//                           {bill.name}
//                         </div>
//                       ) : (
//                         <input
//                           type="text"
//                           value={bill.name}
//                           onChange={(e) => handleEditChange(index, "name", e.target.value)}
//                           className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                           placeholder="Enter bill name"
//                         />
//                       )}
//                     </div>

//                     {/* Amount */}
//                     <div className="col-span-2">
//                       <input
//                         type="number"
//                         placeholder="0.00"
//                         value={bill.amount}
//                         onChange={(e) => handleEditChange(index, "amount", e.target.value)}
//                         className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                         min="0"
//                         step="0.01"
//                       />
//                     </div>

//                     {/* Date */}
//                     <div className="col-span-3">
//                       <input
//                         type="date"
//                         value={bill.date}
//                         max={getTodayDate()}
//                         onChange={(e) => handleEditChange(index, "date", e.target.value)}
//                         className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>

//                     {/* Payment Method */}
//                     <div className="col-span-3">
//                       <select
//                         value={bill.paymentMethod}
//                         onChange={(e) => handleEditChange(index, "paymentMethod", e.target.value)}
//                         className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="cash">Cash</option>
//                         <option value="bank_transfer">Bank Transfer</option>
//                         <option value="credit_card">Credit Card</option>
//                         <option value="debit_card">Debit Card</option>
//                         <option value="online">Online Payment</option>
//                         <option value="other">Other</option>
//                       </select>
//                     </div>

//                     {/* Remove Button */}
//                     <div className="col-span-1">
//                       {!bill.isFixed && (
//                         <button
//                           type="button"
//                           onClick={() => removeEditBillField(index)}
//                           className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
//                         >
//                           ✕
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}

//                 {/* Add Bill Button in Edit Mode */}
//                 <div className="flex space-x-4 mt-6">
//                   <button
//                     type="button"
//                     onClick={addEditBillField}
//                     className="px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
//                   >
//                     + Add Another Bill
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Detailed Bills Table */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold text-gray-800">
//                   {filterYear !== "all" || filterMonth !== "all" ? 'Filtered Bills' : 'All Bills'}
//                   {(filterYear !== "all" || filterMonth !== "all") && (
//                     <span className="text-lg font-normal text-gray-600 ml-2">
//                       ({filteredBills.length} bills)
//                     </span>
//                   )}
//                 </h2>
                
//                 {/* Year and Month Filter */}
//                 <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//                   <div className="flex flex-wrap gap-4">
//                     {/* Year Filter */}
//                     <div>
//                       <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">
//                         Year
//                       </label>
//                       <select
//                         id="yearFilter"
//                         value={filterYear}
//                         onChange={handleYearChange}
//                         className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                       >
//                         <option value="all">All Years</option>
//                         {years.map(year => (
//                           <option key={year} value={year}>{year}</option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Month Filter */}
//                     <div>
//                       <label htmlFor="monthFilter" className="block text-sm font-medium text-gray-700 mb-1">
//                         Month
//                       </label>
//                       <select
//                         id="monthFilter"
//                         value={filterMonth}
//                         onChange={handleMonthChange}
//                         disabled={filterYear === "all"}
//                         className={`w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
//                           filterYear === "all" ? 'bg-gray-100 cursor-not-allowed' : ''
//                         }`}
//                       >
//                         <option value="all">All Months</option>
//                         {months.map(month => (
//                           <option key={month} value={month}>
//                             {monthNames[month - 1]}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Active Filters Display */}
//                     {(filterYear !== "all" || filterMonth !== "all") && (
//                       <div className="flex items-center space-x-2">
//                         <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
//                           <span className="text-sm text-blue-700">
//                             {filterYear !== "all" && `Year: ${filterYear}`}
//                             {filterYear !== "all" && filterMonth !== "all" && ", "}
//                             {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
//                           </span>
//                           <button
//                             onClick={() => resetFilters()}
//                             className="text-blue-500 hover:text-blue-700 text-sm"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       </div>
//                     )}

//                     {/* Reset Filters Button */}
//                     {(filterYear !== "all" || filterMonth !== "all") && (
//                       <div className="flex items-end">
//                         <button
//                           onClick={resetFilters}
//                           className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
//                         >
//                           Reset Filters
//                         </button>
//                       </div>
//                     )}
//                   </div>

//                   {/* Results Count */}
//                   <div className="text-right">
//                     <span className="text-sm text-gray-600">
//                       Showing {filteredBills.length} of {allBills.length} bill(s)
//                     </span>
//                     {filterYear !== "all" || filterMonth !== "all" ? (
//                       <div className="text-sm font-medium text-green-600 mt-1">
//                         Total: {formatCurrency(calculateFilteredTotal())}
//                       </div>
//                     ) : null}
//                   </div>
//                 </div>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Bill Name
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Amount
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Month
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Payment Method
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredBills.map((bill) => {
//                       const billDate = new Date(bill.date);
//                       const billMonthYear = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
                      
//                       return (
//                         <tr key={bill._id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                             {bill.name}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {formatCurrency(bill.amount)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {formatDate(bill.date)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {getMonthName(billMonthYear)}
//                             <div className="text-xs text-gray-400">
//                               {monthNames[billDate.getMonth()]} {billDate.getFullYear()}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             <span className={`px-2 py-1 text-xs rounded-full ${
//                               bill.paymentMethod === 'cash' ? 'bg-yellow-100 text-yellow-800' :
//                               bill.paymentMethod === 'bank_transfer' ? 'bg-blue-100 text-blue-800' :
//                               bill.paymentMethod === 'credit_card' ? 'bg-purple-100 text-purple-800' :
//                               'bg-gray-100 text-gray-800'
//                             }`}>
//                               {bill.paymentMethod.replace('_', ' ').toUpperCase()}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             <button
//                               onClick={() => handleDeleteBill(bill._id)}
//                               className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
//                             >
//                               Delete
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                   {/* Table Footer with Total */}
//                   <tfoot className="bg-gray-50">
//                     <tr>
//                       <td colSpan="1" className="px-6 py-4 text-sm font-semibold text-gray-900">
//                         Filtered Total
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
//                         {formatCurrency(calculateFilteredTotal())}
//                       </td>
//                       <td colSpan="4" className="px-6 py-4 text-sm text-gray-500">
//                         {filterYear !== "all" && filterMonth !== "all" && (
//                           <div className="text-xs text-gray-600">
//                             Filtered by: Year {filterYear}, Month {monthNames[parseInt(filterMonth) - 1]}
//                           </div>
//                         )}
//                         {filterYear !== "all" && filterMonth === "all" && (
//                           <div className="text-xs text-gray-600">
//                             Filtered by: Year {filterYear}
//                           </div>
//                         )}
//                         {filterYear === "all" && filterMonth !== "all" && (
//                           <div className="text-xs text-gray-600">
//                             Filtered by: Month {monthNames[parseInt(filterMonth) - 1]}
//                           </div>
//                         )}
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
                
//                 {filteredBills.length === 0 && (
//                   <div className="text-center py-8 text-gray-500">
//                     {filterYear === "all" && filterMonth === "all" 
//                       ? "No bills found. Add some bills to get started."
//                       : "No bills found for the selected filters. Try changing your filter criteria."
//                     }
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Backend Status */}
//         {/* <div className="mt-4 text-center text-sm text-gray-500">
//           <p>Backend API: {API_URL} - {loading ? 'Connecting...' : 'Ready'}</p>
//         </div> */}
//       </div>
//     </div>
//   );
// }







"use client";

import React, { useState, useEffect, useMemo } from "react";

export default function BillsPage() {
  // Form state - Start with empty form, users can add bills as needed
  const [bills, setBills] = useState([]);
  
  // Data state
  const [allBills, setAllBills] = useState([]);
  const [billsByMonth, setBillsByMonth] = useState([]);
  const [billTypes, setBillTypes] = useState([]);
  const [stats, setStats] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeView, setActiveView] = useState("form"); // "form" or "table"
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [editingMonth, setEditingMonth] = useState(null);
  const [editFormData, setEditFormData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filter states
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);

  // API base URL
  const API_URL = "http://localhost:5001/api";

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Common bill types for suggestions
  const commonBillTypes = [
    "Electricity Bill", "Water Bill", "Internet Bill", "Gas Bill",
    "Phone Bill", "Cable TV", "Maintenance", "Cleaning",
    "Security", "Waste Management", "Other"
  ];

  // Initialize form with one empty bill when component mounts
  useEffect(() => {
    // Start with one empty bill row
    addBillField();
    
    // Fetch data
    fetchAllData();
  }, []);

  // Update years and months when bills change
  useEffect(() => {
    if (allBills.length > 0) {
      // Extract unique years from bills
      const uniqueYears = Array.from(
        new Set(
          allBills.map(bill => {
            const date = new Date(bill.date);
            return date.getFullYear();
          })
        )
      ).sort((a, b) => b - a); // Sort descending (newest first)

      setYears(uniqueYears);

      // If a year is selected, update available months
      if (filterYear !== "all") {
        const yearBills = allBills.filter(bill => {
          const date = new Date(bill.date);
          return date.getFullYear().toString() === filterYear;
        });

        const uniqueMonths = Array.from(
          new Set(
            yearBills.map(bill => {
              const date = new Date(bill.date);
              return date.getMonth() + 1; // Months are 0-indexed in JS
            })
          )
        ).sort((a, b) => a - b);

        setMonths(uniqueMonths);
      } else {
        setMonths([]);
        setFilterMonth("all");
      }
    } else {
      setYears([]);
      setMonths([]);
    }
  }, [allBills, filterYear]);

  // Fetch all necessary data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Fetch all bills
      const billsResponse = await fetch(`${API_URL}/bills`);
      const billsData = await billsResponse.json();
      
      if (billsData.success) {
        setAllBills(billsData.data);
      }

      // Fetch bills by month
      const monthResponse = await fetch(`${API_URL}/bills/by-month`);
      const monthData = await monthResponse.json();
      
      if (monthData.success) {
        setBillsByMonth(monthData.data);
      }

      // Fetch bill types
      const typesResponse = await fetch(`${API_URL}/bills/types`);
      const typesData = await typesResponse.json();
      
      if (typesData.success) {
        setBillTypes(typesData.data);
      }

      // Fetch statistics
      const statsResponse = await fetch(`${API_URL}/bills/stats`);
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ 
        type: 'error', 
        text: `Cannot connect to backend: ${error.message}. Make sure backend is running on port 5001!` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Form functions
  const updateBillField = (index, field, value) => {
    const updatedBills = [...bills];
    updatedBills[index][field] = value;
    
    // If bill name is changed to a common type, mark it as fixed
    if (field === "name" && commonBillTypes.includes(value)) {
      updatedBills[index].isFixed = true;
    }
    
    setBills(updatedBills);
  };

  const addBillField = () => {
    const newBill = { 
      name: "", 
      amount: "", 
      date: getTodayDate(), 
      paymentMethod: "", 
      isFixed: false 
    };
    setBills([...bills, newBill]);
  };

  const removeBillField = (index) => {
    if (bills.length <= 1) {
      setMessage({ 
        type: 'warning', 
        text: "You need at least one bill field. Clear the form instead." 
      });
      return;
    }
    setBills(bills.filter((_, i) => i !== index));
  };

const clearForm = (showConfirmation = true) => {
  if (!showConfirmation || bills.length === 0 || window.confirm("Are you sure you want to clear the form?")) {
    // Directly set to one empty bill instead of calling addBillField
    setBills([{ 
      name: "", 
      amount: "", 
      date: getTodayDate(), 
      paymentMethod: "", 
      isFixed: false 
    }]);
    setMessage({ 
      type: 'info', 
      text: "Form cleared. You can add bills again." 
    });
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Filter out bills with empty amounts or names
      const billsToSave = bills.filter(bill => 
        bill.name.trim() !== "" && 
        bill.amount !== "" && 
        bill.amount !== "0" &&
        bill.paymentMethod !== ""
      );
      
      if (billsToSave.length === 0) {
        setMessage({ 
          type: 'error', 
          text: "Please fill in all required fields for at least one bill." 
        });
        setLoading(false);
        return;
      }
      
      // Check for duplicates in the same form
      const billNames = billsToSave.map(bill => bill.name);
      const hasDuplicates = new Set(billNames).size !== billNames.length;
      
      if (hasDuplicates) {
        setMessage({ 
          type: 'error', 
          text: "❌ Duplicate bill names detected in the form. Please remove duplicates before saving." 
        });
        setLoading(false);
        return;
      }
      
      // Format data for API
      const formattedBills = billsToSave.map(bill => ({
        ...bill,
        amount: parseFloat(bill.amount),
        date: bill.date || new Date().toISOString().split('T')[0],
        paymentMethod: bill.paymentMethod.toLowerCase().replace(' ', '_')
      }));
      
      // Send to backend
      const response = await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedBills)
      });
      
      const data = await response.json();
      
      if (data.success) {
        let messageText = `✅ Successfully saved ${formattedBills.length} bill(s)!`;
        
        // Add duplicate warnings if any
        if (data.duplicates && data.duplicates.length > 0) {
          messageText += `\n\n⚠️ Some bills were duplicates and not saved:\n`;
          data.duplicates.forEach(duplicate => {
            messageText += `• ${duplicate.message}\n`;
          });
        }
        
        // Add error messages if any
        if (data.errors && data.errors.length > 0) {
          messageText += `\n\n❌ Errors:\n`;
          data.errors.forEach(error => {
            messageText += `• ${error.message}\n`;
          });
        }
        
        setMessage({ 
          type: data.duplicates || data.errors ? 'warning' : 'success', 
          text: messageText 
        });
        
        // Clear form after successful save
        clearForm(false);
        
        // Refresh data
        fetchAllData();
        
        // Switch to table view
        setActiveView("table");
        
      } else {
        // Handle errors
        let errorMessage = `❌ Error: ${data.message || data.error}`;
        
        if (data.duplicates && data.duplicates.length > 0) {
          errorMessage += "\n\nDuplicate bills detected:\n";
          data.duplicates.forEach(duplicate => {
            errorMessage += `• ${duplicate.message}\n`;
          });
        }
        
        if (data.errors && data.errors.length > 0) {
          errorMessage += "\n\nErrors:\n";
          data.errors.forEach(err => {
            errorMessage += `• ${err.message}\n`;
          });
        }
        
        setMessage({ 
          type: 'error', 
          text: errorMessage 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        type: 'error', 
        text: "❌ Error saving bills. Please check if the server is running." 
      });
    } finally {
      setLoading(false);
    }
  };

  // Start editing a month
  const startEditMonth = async (monthData) => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      // Get bills for this specific month
      const [year, month] = monthData.month.split('-');
      const response = await fetch(`${API_URL}/bills/month/${year}/${month}`);
      const data = await response.json();
      
      if (data.success) {
        // Set edit form data
        const formattedBills = data.data.map(bill => ({
          _id: bill._id,
          name: bill.name,
          amount: bill.amount.toString(),
          date: new Date(bill.date).toISOString().split('T')[0],
          paymentMethod: bill.paymentMethod,
          isFixed: bill.isFixed || false
        }));
        
        setEditFormData(formattedBills);
        setEditingMonth(monthData.month);
        setIsEditMode(true);
        setSelectedMonth(monthData.month);
        setFilterMonth(monthData.month);
        
        setMessage({ 
          type: 'info', 
          text: `Editing bills for ${monthData.monthName}` 
        });
        
        // Scroll to edit form
        setTimeout(() => {
          document.getElementById('edit-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
      } else {
        setMessage({ 
          type: 'error', 
          text: `Failed to load bills: ${data.message || data.error}` 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error loading month data: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit form changes
  const handleEditChange = (index, field, value) => {
    const updatedFormData = [...editFormData];
    updatedFormData[index][field] = value;
    setEditFormData(updatedFormData);
  };

  // Add new bill in edit mode
  const addEditBillField = () => {
    setEditFormData([
      ...editFormData,
      { 
        name: "", 
        amount: "", 
        date: new Date().toISOString().split('T')[0], 
        paymentMethod: "", 
        isFixed: false 
      }
    ]);
  };

  // Remove bill in edit mode
  const removeEditBillField = (index) => {
    if (editFormData.length <= 1) return;
    setEditFormData(editFormData.filter((_, i) => i !== index));
  };

  // Save edited month
  const saveEditedMonth = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Check for duplicates in edit form
      const billsToSave = editFormData.filter(bill => 
        bill.name.trim() !== "" && 
        bill.amount !== "" && 
        bill.amount !== "0" &&
        bill.paymentMethod !== ""
      );
      
      const billNames = billsToSave.map(bill => bill.name);
      const hasDuplicates = new Set(billNames).size !== billNames.length;
      
      if (hasDuplicates) {
        setMessage({ 
          type: 'error', 
          text: "❌ Duplicate bill names detected. Please remove duplicates before saving." 
        });
        setLoading(false);
        return;
      }
      
      if (billsToSave.length === 0) {
        setMessage({ 
          type: 'error', 
          text: "Please fill in all required fields for at least one bill." 
        });
        setLoading(false);
        return;
      }
      
      // Format data for API
      const formattedBills = billsToSave.map(bill => ({
        ...bill,
        amount: parseFloat(bill.amount),
        date: bill.date || new Date().toISOString().split('T')[0],
        paymentMethod: bill.paymentMethod.toLowerCase().replace(' ', '_')
      }));
      
      // Send update request
      const response = await fetch(`${API_URL}/bills/update-month`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthYear: editingMonth,
          bills: formattedBills
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        let messageText = `✅ Successfully updated ${editingMonth} bills!\n`;
        messageText += `• Updated: ${data.data.updated}\n`;
        messageText += `• Created: ${data.data.created}\n`;
        messageText += `• Deleted: ${data.data.deleted}`;
        
        if (data.data.details?.errors?.length > 0) {
          messageText += `\n\n⚠️ Some issues:\n`;
          data.data.details.errors.forEach(error => {
            messageText += `• ${error.message}\n`;
          });
        }
        
        setMessage({ 
          type: 'success', 
          text: messageText 
        });
        
        // Reset edit mode
        cancelEditMode();
        
        // Refresh data
        fetchAllData();
        
      } else {
        let errorMessage = `❌ Error: ${data.message || data.error}`;
        
        if (data.errors && data.errors.length > 0) {
          errorMessage += "\nErrors:";
          data.errors.forEach(err => {
            errorMessage += `\n• ${err.message}`;
          });
        }
        
        setMessage({ 
          type: 'error', 
          text: errorMessage 
        });
      }
    } catch (error) {
      console.error('Error updating month:', error);
      setMessage({ 
        type: 'error', 
        text: `❌ Error updating month: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit mode
  const cancelEditMode = () => {
    setEditingMonth(null);
    setEditFormData([]);
    setIsEditMode(false);
    setMessage({ type: '', text: '' });
  };

  // Delete single bill
  const handleDeleteBill = async (id) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    
    try {
      const response = await fetch(`${API_URL}/bills/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: '✅ Bill deleted successfully' 
        });
        fetchAllData(); // Refresh data
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ Error: ${data.message || data.error}` 
        });
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      setMessage({ 
        type: 'error', 
        text: '❌ Error deleting bill' 
      });
    }
  };

  // Helper functions
  const getTodayDate = () => new Date().toISOString().split("T")[0];
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMonthName = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
    setFilterMonth("all"); // Reset month when year changes
    setSelectedMonth(null);
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
    setSelectedMonth(null);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterYear("all");
    setFilterMonth("all");
    setSelectedMonth(null);
  };

  // Filter bills based on selected year and month
  const filteredBills = useMemo(() => {
    return allBills.filter(bill => {
      const date = new Date(bill.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthYear = `${year}-${month}`;

      // Apply year filter
      if (filterYear !== "all" && year !== filterYear) {
        return false;
      }

      // Apply month filter (when month is selected)
      if (filterMonth !== "all" && filterMonth !== "all") {
        if (filterMonth.includes('-')) {
          // Month-year format (YYYY-MM)
          return monthYear === filterMonth;
        } else {
          // Just month number
          return (date.getMonth() + 1).toString() === filterMonth;
        }
      }

      return true;
    });
  }, [allBills, filterYear, filterMonth]);

  // Calculate total for filtered bills
  const calculateFilteredTotal = () => {
    return filteredBills.reduce((total, bill) => total + bill.amount, 0);
  };

  // Quick add common bill types
  const quickAddBill = (billName) => {
    const newBill = {
      name: billName,
      amount: "",
      date: getTodayDate(),
      paymentMethod: "",
      isFixed: true
    };
    setBills([...bills, newBill]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Utility Bills Management</h1>
          <p className="text-gray-600 mt-2">Track and manage your monthly utility expenses</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : 
            message.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
            message.type === 'warning' ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' :
            'bg-blue-100 border border-blue-300 text-blue-800'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {message.type === 'success' ? '✅' : 
                   message.type === 'error' ? '❌' : 
                   message.type === 'warning' ? '⚠️' :
                   '📝'}
                </span>
                <span className="whitespace-pre-line">{message.text}</span>
              </div>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Spent</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalAmount)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Bills</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalBills}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Avg per Bill</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.avgPerBill)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Months Tracked</div>
              <div className="text-2xl font-bold text-orange-600">
                {billsByMonth.length}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveView("form")}
            className={`px-6 py-3 rounded-lg font-medium ${activeView === "form" ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Add Bills
          </button>
          <button
            onClick={() => setActiveView("table")}
            className={`px-6 py-3 rounded-lg font-medium ${activeView === "table" ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            View Bills
          </button>
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Form View */}
        {activeView === "form" && (
          <div className="space-y-6">
            {/* Quick Add Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Add Common Bills</h2>
              <div className="flex flex-wrap gap-2">
                {commonBillTypes.map((billType, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => quickAddBill(billType)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    + {billType}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Click any button above to quickly add a bill type to the form below.
              </p>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add Bills</h2>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={clearForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Clear Form
                  </button>
                </div>
              </div>
              
        
              
              <form onSubmit={handleSubmit}>
                {/* Form Header */}
                {bills.length > 0 && (
                  <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-500 mb-4">
                    <div className="col-span-3">Bill Name *</div>
                    <div className="col-span-2">Amount ($) *</div>
                    <div className="col-span-3">Date *</div>
                    <div className="col-span-3">Payment Method *</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>
                )}

                {/* Bill Rows */}
                {bills.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No bills added yet. Use "Quick Add" buttons or "Add Bill" button to start.
                  </div>
                ) : (
                  bills.map((bill, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-center mb-4">
                      {/* Bill Name */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={bill.name}
                          onChange={(e) => updateBillField(index, "name", e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter bill name"
                          list="bill-suggestions"
                          required
                        />
                        <datalist id="bill-suggestions">
                          {commonBillTypes.map((type, i) => (
                            <option key={i} value={type} />
                          ))}
                        </datalist>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="0.00"
                          value={bill.amount}
                          onChange={(e) => updateBillField(index, "amount", e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      {/* Date */}
                      <div className="col-span-3">
                        <input
                          type="date"
                          value={bill.date}
                          max={getTodayDate()}
                          onChange={(e) => updateBillField(index, "date", e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Payment Method */}
                      <div className="col-span-3">
                        <select
                          value={bill.paymentMethod}
                          onChange={(e) => updateBillField(index, "paymentMethod", e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Method *</option>
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="debit_card">Debit Card</option>
                          <option value="online">Online Payment</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeBillField(index)}
                          className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                          disabled={bills.length <= 1}
                          title={bills.length <= 1 ? "You need at least one bill" : "Remove this bill"}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-6">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={addBillField}
                      className="px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                    >
                      + Add Another Bill
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        quickAddBill("Electricity Bill");
                        quickAddBill("Water Bill");
                        quickAddBill("Internet Bill");
                        quickAddBill("Gas Bill");
                      }}
                      className="px-4 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-md hover:bg-green-50"
                    >
                      + Add Common Bills
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || bills.length === 0}
                    className={`flex-1 py-2 rounded-md transition-colors ${
                      loading || bills.length === 0
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {loading ? 'Saving...' : `Save ${bills.length} Bill(s)`}
                  </button>
                </div>

                {/* Form Status */}
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Total bills in form: <strong>{bills.length}</strong></span>
                    <span className="text-blue-600">
                      {bills.filter(b => b.name && b.amount && b.paymentMethod).length} ready to save
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table View */}
        {activeView === "table" && (
          <div className="space-y-8">
            {/* Edit Month Form - Only shown when editing */}
            {isEditMode && editingMonth && (
              <div id="edit-form" className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Editing: {getMonthName(editingMonth)}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={cancelEditMode}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditedMonth}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-2">
                    Update the bills for {getMonthName(editingMonth)}. Leave amount empty to remove a bill.
                  </div>
                </div>

                {/* Edit Form Header */}
                <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-500 mb-4">
                  <div className="col-span-3">Bill Name</div>
                  <div className="col-span-2">Amount ($)</div>
                  <div className="col-span-3">Date</div>
                  <div className="col-span-3">Payment Method</div>
                  <div className="col-span-1">Action</div>
                </div>

                {/* Edit Bill Rows */}
                {editFormData.map((bill, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center mb-4">
                    {/* Bill Name */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={bill.name}
                        onChange={(e) => handleEditChange(index, "name", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter bill name"
                      />
                    </div>

                    {/* Amount */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={bill.amount}
                        onChange={(e) => handleEditChange(index, "amount", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Date */}
                    <div className="col-span-3">
                      <input
                        type="date"
                        value={bill.date}
                        max={getTodayDate()}
                        onChange={(e) => handleEditChange(index, "date", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="col-span-3">
                      <select
                        value={bill.paymentMethod}
                        onChange={(e) => handleEditChange(index, "paymentMethod", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Method</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="online">Online Payment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => removeEditBillField(index)}
                        className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        disabled={editFormData.length <= 1}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Bill Button in Edit Mode */}
                <div className="flex space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={addEditBillField}
                    className="px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                  >
                    + Add Another Bill
                  </button>
                </div>
              </div>
            )}

            {/* Detailed Bills Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {filterYear !== "all" || filterMonth !== "all" ? 'Filtered Bills' : 'All Bills'}
                  {(filterYear !== "all" || filterMonth !== "all") && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      ({filteredBills.length} bills)
                    </span>
                  )}
                </h2>
                
                {/* Year and Month Filter */}
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
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        className={`w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
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
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                          <span className="text-sm text-blue-700">
                            {filterYear !== "all" && `Year: ${filterYear}`}
                            {filterYear !== "all" && filterMonth !== "all" && ", "}
                            {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
                          </span>
                          <button
                            onClick={() => resetFilters()}
                            className="text-blue-500 hover:text-blue-700 text-sm"
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
                  <div className="text-right">
                    <span className="text-sm text-gray-600">
                      Showing {filteredBills.length} of {allBills.length} bill(s)
                    </span>
                    {filterYear !== "all" || filterMonth !== "all" ? (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        Total: {formatCurrency(calculateFilteredTotal())}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bill Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBills.map((bill) => {
                      const billDate = new Date(bill.date);
                      const billMonthYear = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
                      
                      return (
                        <tr key={bill._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bill.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(bill.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(bill.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getMonthName(billMonthYear)}
                            <div className="text-xs text-gray-400">
                              {monthNames[billDate.getMonth()]} {billDate.getFullYear()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              bill.paymentMethod === 'cash' ? 'bg-yellow-100 text-yellow-800' :
                              bill.paymentMethod === 'bank_transfer' ? 'bg-blue-100 text-blue-800' :
                              bill.paymentMethod === 'credit_card' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {bill.paymentMethod.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleDeleteBill(bill._id)}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Table Footer with Total */}
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="1" className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Filtered Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(calculateFilteredTotal())}
                      </td>
                      <td colSpan="4" className="px-6 py-4 text-sm text-gray-500">
                        {filterYear !== "all" && filterMonth !== "all" && (
                          <div className="text-xs text-gray-600">
                            Filtered by: Year {filterYear}, Month {monthNames[parseInt(filterMonth) - 1]}
                          </div>
                        )}
                        {filterYear !== "all" && filterMonth === "all" && (
                          <div className="text-xs text-gray-600">
                            Filtered by: Year {filterYear}
                          </div>
                        )}
                        {filterYear === "all" && filterMonth !== "all" && (
                          <div className="text-xs text-gray-600">
                            Filtered by: Month {monthNames[parseInt(filterMonth) - 1]}
                          </div>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                
                {filteredBills.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {filterYear === "all" && filterMonth === "all" 
                      ? "No bills found. Add some bills to get started."
                      : "No bills found for the selected filters. Try changing your filter criteria."
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}