
// 'use client';

// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { useRouter } from 'next/navigation';
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export default function ExtraExpensesPage() {
//   const router = useRouter();
  
//   // Authentication state
//   const [user, setUser] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);

//   const [expenses, setExpenses] = useState([
//     {
//       id: crypto.randomUUID(),
//       expenseName: "",
//       amount: "",
//       date: "",
//       paymentMethod: "Cash", // Changed from "cash" to "Cash"
//       note: "",
//     },
//   ]);

//   const [storedExpenses, setStoredExpenses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({
//     expenseName: "",
//     amount: "",
//     date: "",
//     paymentMethod: "Cash", // Changed from "cash" to "Cash"
//     note: ""
//   });

//   // Filter states
//   const [filterDate, setFilterDate] = useState("");
//   const [filterMonth, setFilterMonth] = useState("all");
//   const [filterYear, setFilterYear] = useState("all");
//   const [availableYears, setAvailableYears] = useState([]);
//   const [availableMonths, setAvailableMonths] = useState([]);

//   // Mobile menu state
//   const [showMobileFilters, setShowMobileFilters] = useState(false);

//   // Ref for edit form
//   const editFormRef = useRef(null);

//   // Month names for display
//   const monthNames = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   // Backend API URL
//   const API_URL = "http://localhost:5004/api";

//   // Payment methods - MUST MATCH BACKEND ENUM
//   const paymentMethods = [
//     "Cash", 
//     "Bank Transfer", 
//     "Mobile Banking", 
//     "Card"
//   ];

//   // Check authentication on mount
//   useEffect(() => {
//     checkAuthentication();
//   }, []);

//   // Fetch extra expenses after authentication
//   useEffect(() => {
//     if (user && !authLoading) {
//       fetchStoredExpenses();
//     }
//   }, [user, authLoading]);

//   // Check if user is authenticated
//   const checkAuthentication = async () => {
//     const userData = localStorage.getItem('user');
//     const token = localStorage.getItem('auth_token');
    
//     if (!userData || !token) {
//       router.push('/');
//       return;
//     }
    
//     try {
//       const parsedUser = JSON.parse(userData);
      
//       // Check if user has permission (admin or moderator)
//       if (!['admin', 'moderator'].includes(parsedUser.role)) {
//         setMessage({ 
//           type: 'error', 
//           text: 'Access denied. You do not have permission to manage extra expenses.' 
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

//   // Helper function to get auth headers
//   const getAuthHeaders = () => {
//     const token = localStorage.getItem('auth_token');
//     const headers = {
//       'Content-Type': 'application/json',
//     };
    
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }
    
//     return headers;
//   };

//   // Update available years and months when storedExpenses changes
//   useEffect(() => {
//     if (storedExpenses.length > 0) {
//       // Extract unique years from stored expenses
//       const years = Array.from(
//         new Set(
//           storedExpenses.map(expense => {
//             const date = new Date(expense.date);
//             return date.getFullYear();
//           })
//         )
//       ).sort((a, b) => b - a);

//       setAvailableYears(years);

//       // If a year is selected, update available months
//       if (filterYear !== "all") {
//         const yearExpenses = storedExpenses.filter(expense => {
//           const date = new Date(expense.date);
//           return date.getFullYear().toString() === filterYear;
//         });

//         const months = Array.from(
//           new Set(
//             yearExpenses.map(expense => {
//               const date = new Date(expense.date);
//               return date.getMonth() + 1;
//             })
//           )
//         ).sort((a, b) => a - b);

//         setAvailableMonths(months);
//       } else {
//         setAvailableMonths([]);
//         setFilterMonth("all");
//       }
//     } else {
//       setAvailableYears([]);
//       setAvailableMonths([]);
//     }
//   }, [storedExpenses, filterYear]);

//   // Scroll to edit form when editingId changes
//   useEffect(() => {
//     if (editingId && editFormRef.current) {
//       setTimeout(() => {
//         editFormRef.current?.scrollIntoView({ 
//           behavior: 'smooth', 
//           block: 'center' 
//         });
//       }, 100);
//     }
//   }, [editingId]);

//   const fetchStoredExpenses = async () => {
//     setLoading(true);
//     setMessage({ type: '', text: '' });
//     try {
//       const headers = getAuthHeaders();
//       const response = await fetch(`${API_URL}/extra-expenses`, {
//         headers: headers,
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         if (response.status === 401 || response.status === 403) {
//           setMessage({ 
//             type: 'error', 
//             text: 'Authentication failed. Please login again.' 
//           });
//           localStorage.clear();
//           router.push('/');
//           return;
//         }
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       if (data.success) {
//         // Sort expenses by date in descending order (newest first)
//         const sortedExpenses = [...data.data].sort((a, b) => {
//           const dateA = new Date(a.date);
//           const dateB = new Date(b.date);
//           return dateB.getTime() - dateA.getTime();
//         });
//         setStoredExpenses(sortedExpenses);
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: data.message || 'Failed to load extra expenses' 
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching extra expenses:', error);
//       setMessage({ 
//         type: 'error', 
//         text: `Network error: ${error.message}` 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter and sort expenses based on selected filters
//   const filteredExpenses = useMemo(() => {
//     let filtered = storedExpenses;

//     // Apply date filter
//     if (filterDate) {
//       filtered = filtered.filter(expense => {
//         const expenseDate = new Date(expense.date).toISOString().split('T')[0];
//         return expenseDate === filterDate;
//       });
//     }

//     // Apply year filter
//     if (filterYear !== "all") {
//       filtered = filtered.filter(expense => {
//         const date = new Date(expense.date);
//         return date.getFullYear().toString() === filterYear;
//       });
//     }

//     // Apply month filter
//     if (filterMonth !== "all") {
//       filtered = filtered.filter(expense => {
//         const date = new Date(expense.date);
//         return (date.getMonth() + 1).toString() === filterMonth;
//       });
//     }

//     // Already sorted in fetchStoredExpenses, but ensure sorting here too
//     return [...filtered].sort((a, b) => {
//       const dateA = new Date(a.date);
//       const dateB = new Date(b.date);
//       return dateB.getTime() - dateA.getTime();
//     });
//   }, [storedExpenses, filterDate, filterYear, filterMonth]);

//   // Generate PDF function
//   const generatePDF = () => {
//     if (filteredExpenses.length === 0) {
//       setMessage({ 
//         type: 'error', 
//         text: "No extra expenses to download" 
//       });
//       return;
//     }

//     try {
//       // Create new PDF document
//       const doc = new jsPDF();
//       const pageWidth = doc.internal.pageSize.getWidth();
      
//       doc.setFontSize(20);
//       doc.setTextColor(40);
//       doc.setFont("helvetica", "bold");
//       doc.text("Extra Expenses Report", pageWidth / 2, 20, { align: "center" });
      
//       doc.setFontSize(11);
//       doc.setFont("helvetica", "normal");
//       doc.setTextColor(100);
//       doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
//       let filterInfo = "All Extra Expenses";
//       if (filterDate) {
//         filterInfo = `Date: ${new Date(filterDate).toLocaleDateString()}`;
//       } else if (filterYear !== "all" || filterMonth !== "all") {
//         filterInfo = `Filter: ${filterYear !== "all" ? `Year: ${filterYear}` : ""} ${filterMonth !== "all" ? `Month: ${monthNames[parseInt(filterMonth) - 1]}` : ""}`;
//       }
//       doc.text(`Report Type: ${filterInfo}`, 14, 36);
//       doc.text(`Total Records: ${filteredExpenses.length}`, 14, 42);
      
//       // Add user info
//       if (user) {
//         doc.text(`Generated by: ${user.name} (${user.role})`, 14, 48);
//       }
      
//       // Prepare table data
//       const tableData = filteredExpenses.map(expense => [
//         expense.expenseName,
//         new Date(expense.date).toLocaleDateString(),
//         `BDT ${expense.amount.toFixed(2)}`,
//         expense.paymentMethod || 'Cash',
//         expense.note || "-",
//         `${monthNames[new Date(expense.date).getMonth()]} ${new Date(expense.date).getFullYear()}`
//       ]);
      
//       // Add table using autoTable
//       autoTable(doc, {
//         startY: user ? 55 : 50,
//         head: [['Expense Name', 'Date', 'Amount (BDT)', 'Payment Method', 'Note', 'Month-Year']],
//         body: tableData,
//         headStyles: {
//           fillColor: [41, 128, 185],
//           textColor: 255,
//           fontStyle: 'bold'
//         },
//         styles: {
//           fontSize: 10,
//           cellPadding: 3
//         },
//         columnStyles: {
//           0: { cellWidth: 35 },
//           1: { cellWidth: 25 },
//           2: { cellWidth: 25 },
//           3: { cellWidth: 30 },
//           4: { cellWidth: 40 },
//           5: { cellWidth: 30 }
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
//       doc.text(`Total Expenses: ${filteredExpenses.length}`, 14, lastY + 8);
//       doc.text(`Total Amount: BDT ${totalAmount.toFixed(2)}`, 14, lastY + 16);
//       doc.text(`Average per Expense: BDT ${(totalAmount / filteredExpenses.length).toFixed(2)}`, 14, lastY + 24);
      
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
//       const isFilterActive = filterDate || filterYear !== "all" || filterMonth !== "all";
//       const filterSuffix = isFilterActive ? '_filtered' : '';
//       const filename = `extra_expenses_${timestamp}${filterSuffix}.pdf`;
      
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
//         text: 'Failed to generate PDF. Please try again.' 
//       });
//     }
//   };

//   const updateField = (id, field, value) => {
//     setExpenses(prev =>
//       prev.map(item =>
//         item.id === id ? { ...item, [field]: value } : item
//       )
//     );
//   };

//   const addExpense = () => {
//     setExpenses(prev => [
//       ...prev,
//       {
//         id: crypto.randomUUID(),
//         expenseName: "",
//         amount: "",
//         date: "",
//         paymentMethod: "Cash",
//         note: "",
//       },
//     ]);
//   };

//   const removeExpense = (id) => {
//     if (expenses.length === 1) return;
//     setExpenses(prev => prev.filter(item => item.id !== id));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setMessage({ type: '', text: '' });

//     // Filter out empty rows
//     const validExpenses = expenses.filter(
//       item => item.expenseName.trim() && item.amount && item.date
//     );

//     if (validExpenses.length === 0) {
//       setMessage({ 
//         type: 'error', 
//         text: "Please add at least one extra expense" 
//       });
//       setSaving(false);
//       return;
//     }

//     try {
//       // Prepare data for backend
//       const expensesToSave = validExpenses.map(expense => ({
//         expenseName: expense.expenseName.trim(),
//         amount: parseFloat(expense.amount),
//         date: expense.date,
//         paymentMethod: expense.paymentMethod || "Cash",
//         note: expense.note || ""
//       }));

//       console.log('Sending data:', expensesToSave); // Debug log

//       const headers = getAuthHeaders();
//       const response = await fetch(`${API_URL}/extra-expenses`, {
//         method: 'POST',
//         headers: headers,
//         body: JSON.stringify(expensesToSave),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Server response error:', errorText);
        
//         if (response.status === 401 || response.status === 403) {
//           setMessage({ 
//             type: 'error', 
//             text: 'Authentication failed. Please login again.' 
//           });
//           localStorage.clear();
//           setTimeout(() => router.push('/'), 2000);
//           return;
//         }
        
//         // Try to parse error message
//         try {
//           const errorData = JSON.parse(errorText);
//           setMessage({ 
//             type: 'error', 
//             text: errorData.message || `Server error: ${response.status}` 
//           });
//         } catch {
//           setMessage({ 
//             type: 'error', 
//             text: `Server error: ${response.status} - ${errorText}` 
//           });
//         }
//         return;
//       }

//       const data = await response.json();
//       console.log('Server response:', data); // Debug log

//       if (data.success) {
//         setMessage({ 
//           type: 'success', 
//           text: `Successfully saved ${data.data.length} extra expense(s)` 
//         });
//         // Reset form
//         setExpenses([{
//           id: crypto.randomUUID(),
//           expenseName: "",
//           amount: "",
//           date: "",
//           paymentMethod: "Cash",
//           note: "",
//         }]);
//         // Refresh stored expenses
//         fetchStoredExpenses();
        
//         if (data.warnings && data.warnings.length > 0) {
//           console.warn('Warnings:', data.warnings);
//         }
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: data.message || 'Failed to save extra expenses' 
//         });
//       }
//     } catch (error) {
//       console.error('Error saving extra expenses:', error);
//       setMessage({ 
//         type: 'error', 
//         text: `Network error: ${error.message}` 
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleEditExpense = (expense) => {
//     setEditingId(expense._id);
//     setEditForm({
//       expenseName: expense.expenseName,
//       date: new Date(expense.date).toISOString().split('T')[0],
//       amount: expense.amount.toString(),
//       paymentMethod: expense.paymentMethod || "Cash",
//       note: expense.note || ""
//     });
//   };

//   const handleCancelEdit = () => {
//     setEditingId(null);
//     setEditForm({
//       expenseName: "",
//       amount: "",
//       date: "",
//       paymentMethod: "Cash",
//       note: ""
//     });
//     setMessage({ type: '', text: '' });
//   };

//   const handleUpdateExpense = async () => {
//     if (!editingId) return;

//     // Validation
//     if (!editForm.expenseName.trim() || !editForm.amount || !editForm.date) {
//       setMessage({ 
//         type: 'error', 
//         text: "Please fill all required fields" 
//       });
//       return;
//     }

//     setSaving(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const updateData = {
//         expenseName: editForm.expenseName.trim(),
//         date: editForm.date,
//         amount: parseFloat(editForm.amount),
//         paymentMethod: editForm.paymentMethod || "Cash",
//         note: editForm.note || ""
//       };

//       console.log('Updating expense:', updateData); // Debug log

//       const headers = getAuthHeaders();
//       const response = await fetch(`${API_URL}/extra-expenses/${editingId}`, {
//         method: 'PUT',
//         headers: headers,
//         body: JSON.stringify(updateData),
//       });

//       if (!response.ok) {
//         if (response.status === 401 || response.status === 403) {
//           setMessage({ 
//             type: 'error', 
//             text: 'Authentication failed. Please login again.' 
//           });
//           localStorage.clear();
//           setTimeout(() => router.push('/'), 2000);
//           return;
//         }
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         setMessage({ 
//           type: 'success', 
//           text: 'Extra expense updated successfully' 
//         });
//         // Refresh the list
//         fetchStoredExpenses();
//         // Reset edit mode
//         setEditingId(null);
//         setEditForm({
//           expenseName: "",
//           amount: "",
//           date: "",
//           paymentMethod: "Cash",
//           note: ""
//         });
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: data.message || 'Failed to update extra expense' 
//         });
//       }
//     } catch (error) {
//       console.error('Error updating extra expense:', error);
//       setMessage({ 
//         type: 'error', 
//         text: `Error: ${error.message}` 
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDeleteExpense = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this extra expense?')) return;

//     try {
//       const headers = getAuthHeaders();
//       const response = await fetch(`${API_URL}/extra-expenses/${id}`, {
//         method: 'DELETE',
//         headers: headers,
//       });

//       if (!response.ok) {
//         if (response.status === 401 || response.status === 403) {
//           setMessage({ 
//             type: 'error', 
//             text: 'Authentication failed. Please login again.' 
//           });
//           localStorage.clear();
//           setTimeout(() => router.push('/'), 2000);
//           return;
//         }
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         setMessage({ 
//           type: 'success', 
//           text: 'Extra expense deleted successfully' 
//         });
//         // Refresh the list
//         fetchStoredExpenses();
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: data.message || 'Failed to delete extra expense' 
//         });
//       }
//     } catch (error) {
//       console.error('Error deleting extra expense:', error);
//       setMessage({ 
//         type: 'error', 
//         text: `Error: ${error.message}` 
//       });
//     }
//   };

//   const getTodayDate = () => new Date().toISOString().split("T")[0];

//   // Format date for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   // Format payment method for display
//   const formatPaymentMethod = (method) => {
//     if (!method) return "Cash";
//     return method;
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

//   // Calculate total for filtered expenses
//   const calculateFilteredTotal = () => {
//     return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
//   };

//   // Calculate total for all expenses
//   const calculateTotal = () => {
//     return storedExpenses.reduce((total, expense) => total + expense.amount, 0);
//   };

//   // Reset all filters
//   const resetFilters = () => {
//     setFilterDate("");
//     setFilterMonth("all");
//     setFilterYear("all");
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

//   // Check if any filter is active
//   const isFilterActive = filterDate || filterYear !== "all" || filterMonth !== "all";

//   // Toggle mobile filters
//   const toggleMobileFilters = () => {
//     setShowMobileFilters(!showMobileFilters);
//   };

//   // Calculate form total
//   const calculateFormTotal = () => {
//     return expenses.reduce((total, expense) => {
//       const amount = parseFloat(expense.amount) || 0;
//       return total + amount;
//     }, 0);
//   };

//   // Show loading while auth is being checked
//   if (authLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return null; // Will redirect
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-3 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6 md:mb-8">
//           <h2 className="text-xl md:text-2xl font-semibold text-center text-gray-800">
//             Extra Expenses Management
//           </h2>
//           <p className="text-sm md:text-base text-center text-gray-600 mt-2">
//             Track and manage all your extra miscellaneous expenses
//           </p>
//         </div>

//         {/* User Info Banner */}
//         <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-blue-600">Logged in as: <span className="font-semibold">{user.name}</span></p>
//               <p className="text-xs text-blue-500">Role: <span className="font-medium capitalize">{user.role}</span></p>
//             </div>
//             <div className="text-sm text-blue-700">
//               <span className="px-2 py-1 bg-blue-100 rounded-full">Extra Expenses Management</span>
//             </div>
//           </div>
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

//         {/* Form Section */}
//         <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Add New Extra Expenses</h3>
//             <button
//               onClick={addExpense}
//               className="md:hidden px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-sm"
//             >
//               + Add
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Header Row - Hidden on mobile, visible on tablet+ */}
//             <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-semibold text-gray-600 px-1">
//               <div className="col-span-3">Expense Name</div>
//               <div className="col-span-2">Amount (BDT)</div>
//               <div className="col-span-2">Date</div>
//               <div className="col-span-2">Payment Method</div>
//               <div className="col-span-2">Note (Optional)</div>
//               <div className="col-span-1 text-center">Action</div>
//             </div>

//             {expenses.map((item) => (
//               <div
//                 key={item.id}
//                 className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-center p-3 md:p-0 md:border-0 border border-gray-200 rounded-md mb-3 md:mb-0"
//               >
//                 {/* Mobile View - Vertical Layout */}
//                 <div className="md:hidden space-y-3 w-full">
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Expense Name *
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="e.g. Office Party, Stationery"
//                         value={item.expenseName}
//                         onChange={(e) =>
//                           updateField(item.id, "expenseName", e.target.value)
//                         }
//                         className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Amount (BDT) *
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="Amount in BDT"
//                         value={item.amount}
//                         onChange={(e) =>
//                           updateField(item.id, "amount", e.target.value)
//                         }
//                         className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                         min="0"
//                         step="0.01"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Date *
//                       </label>
//                       <input
//                         type="date"
//                         value={item.date}
//                         max={getTodayDate()}
//                         onChange={(e) =>
//                           updateField(item.id, "date", e.target.value)
//                         }
//                         className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Payment Method *
//                       </label>
//                       <select
//                         value={item.paymentMethod}
//                         onChange={(e) =>
//                           updateField(item.id, "paymentMethod", e.target.value)
//                         }
//                         className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                       >
//                         <option value="">Select</option>
//                         {paymentMethods.map(method => (
//                           <option key={method} value={method}>
//                             {method}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Note (Optional)
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Optional note"
//                       value={item.note}
//                       onChange={(e) =>
//                         updateField(item.id, "note", e.target.value)
//                       }
//                       className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
                  
//                   {expenses.length > 1 && (
//                     <div className="pt-2">
//                       <button
//                         type="button"
//                         onClick={() => removeExpense(item.id)}
//                         className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
//                       >
//                         Remove This Entry
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Desktop View - Grid Layout */}
//                 {/* Expense Name */}
//                 <div className="hidden md:block col-span-3">
//                   <input
//                     type="text"
//                     placeholder="e.g. Office Party, Stationery"
//                     value={item.expenseName}
//                     onChange={(e) =>
//                       updateField(item.id, "expenseName", e.target.value)
//                     }
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     required
//                   />
//                 </div>

//                 {/* Amount */}
//                 <div className="hidden md:block col-span-2">
//                   <input
//                     type="number"
//                     placeholder="Amount in BDT"
//                     value={item.amount}
//                     onChange={(e) =>
//                       updateField(item.id, "amount", e.target.value)
//                     }
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     required
//                     min="0"
//                     step="0.01"
//                   />
//                 </div>

//                 {/* Date */}
//                 <div className="hidden md:block col-span-2">
//                   <input
//                     type="date"
//                     value={item.date}
//                     max={getTodayDate()}
//                     onChange={(e) =>
//                       updateField(item.id, "date", e.target.value)
//                     }
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     required
//                   />
//                 </div>

//                 {/* Payment Method */}
//                 <div className="hidden md:block col-span-2">
//                   <select
//                     value={item.paymentMethod}
//                     onChange={(e) =>
//                       updateField(item.id, "paymentMethod", e.target.value)
//                     }
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     required
//                   >
//                     <option value="">Select</option>
//                     {paymentMethods.map(method => (
//                       <option key={method} value={method}>
//                         {method}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Note (Optional) */}
//                 <div className="hidden md:block col-span-2">
//                   <input
//                     type="text"
//                     placeholder="Optional note"
//                     value={item.note}
//                     onChange={(e) =>
//                       updateField(item.id, "note", e.target.value)
//                     }
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                   />
//                 </div>

//                 {/* Remove - Desktop */}
//                 <div className="hidden md:block col-span-1">
//                   {expenses.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeExpense(item.id)}
//                       className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
//                     >
//                       ✕
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {/* Form Total */}
//             <div className="flex justify-end mb-3">
//               <div className="text-lg font-semibold text-blue-700">
//                 Form Total: {formatCurrency(calculateFormTotal())}
//               </div>
//             </div>

//             {/* Add More Button */}
//             <div className="flex flex-col md:flex-row gap-3 mt-3">
//               <button
//                 type="button"
//                 onClick={addExpense}
//                 className="hidden md:block w-full border border-dashed border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
//               >
//                 + Add More Expenses
//               </button>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={saving}
//                 className={`w-full py-3 md:py-2 rounded-md transition-colors text-sm md:text-base ${
//                   saving
//                     ? 'bg-blue-400 cursor-not-allowed'
//                     : 'bg-blue-600 hover:bg-blue-700'
//                 } text-white`}
//               >
//                 {saving ? (
//                   <span className="flex items-center justify-center">
//                     <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 mr-2 text-white" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Saving...
//                   </span>
//                 ) : (
//                   'Save Extra Expenses'
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Edit Form Section with ref */}
//         {editingId && (
//           <div 
//             ref={editFormRef} 
//             className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8 border-2 border-blue-300"
//             id="edit-form-section"
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-base md:text-lg font-semibold text-blue-700">
//                 ✏️ Edit Extra Expense
//               </h3>
//               <button
//                 onClick={handleCancelEdit}
//                 className="text-gray-500 hover:text-gray-700 text-sm md:text-base"
//               >
//                 ✕ Close
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-start">
//               {/* Expense Name */}
//               <div className="md:col-span-3">
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
//                   Expense Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={editForm.expenseName}
//                   onChange={(e) => setEditForm({...editForm, expenseName: e.target.value})}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                   required
//                   placeholder="e.g., Office Party, Stationery"
//                 />
//               </div>

//               {/* Amount */}
//               <div className="md:col-span-2 mt-3 md:mt-0">
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
//                   Amount (BDT) *
//                 </label>
//                 <input
//                   type="number"
//                   value={editForm.amount}
//                   onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                   required
//                   step="0.01"
//                   min="0"
//                   placeholder="0.00"
//                 />
//               </div>

//               {/* Date */}
//               <div className="md:col-span-2 mt-3 md:mt-0">
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
//                   Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={editForm.date}
//                   max={getTodayDate()}
//                   onChange={(e) => setEditForm({...editForm, date: e.target.value})}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                   required
//                 />
//               </div>

//               {/* Payment Method */}
//               <div className="md:col-span-2 mt-3 md:mt-0">
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
//                   Payment Method *
//                 </label>
//                 <select
//                   value={editForm.paymentMethod}
//                   onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                   required
//                 >
//                   <option value="">Select Method</option>
//                   {paymentMethods.map(method => (
//                     <option key={method} value={method}>
//                       {method}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Note */}
//               <div className="md:col-span-2 mt-3 md:mt-0">
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
//                   Note (Optional)
//                 </label>
//                 <input
//                   type="text"
//                   value={editForm.note}
//                   onChange={(e) => setEditForm({...editForm, note: e.target.value})}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                   placeholder="Optional note"
//                 />
//               </div>

//               {/* Action Buttons */}
//               <div className="md:col-span-1 flex space-x-2 pt-6 md:pt-0 md:items-end">
//                 <button
//                   onClick={handleUpdateExpense}
//                   disabled={saving}
//                   className={`flex-1 py-3 md:py-2 rounded-md transition-colors text-sm md:text-base ${
//                     saving
//                       ? 'bg-blue-400 cursor-not-allowed'
//                       : 'bg-blue-600 hover:bg-blue-700'
//                   } text-white`}
//                 >
//                   {saving ? (
//                     <span className="flex items-center justify-center ">
//                       <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Updating...
//                     </span>
//                   ) : (
//                     'Update'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Stored Extra Expenses Table Section */}
//         <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
//           <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
//             <div>
//               <h3 className="text-lg font-semibold">Stored Extra Expenses</h3>
//               <div className="mt-1 text-sm text-gray-600">
//                 {isFilterActive ? (
//                   <span>
//                     Showing {filteredExpenses.length} of {storedExpenses.length} expense(s)
//                   </span>
//                 ) : (
//                   <span>Total: {storedExpenses.length} expense(s)</span>
//                 )}
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               {/* PDF Download Button */}
//               {filteredExpenses.length > 0 && (
//                 <button
//                   onClick={generatePDF}
//                   className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center text-sm md:text-base"
//                   title="Download PDF Report"
//                 >
//                   <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                   </svg>
//                   Download PDF
//                 </button>
//               )}
              
//               {/* Mobile Filters Toggle */}
//               <button
//                 onClick={toggleMobileFilters}
//                 className="md:hidden px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors flex items-center"
//               >
//                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
//                 </svg>
//                 Filters
//               </button>
              
//               <button
//                 onClick={fetchStoredExpenses}
//                 disabled={loading}
//                 className="px-3 md:px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm md:text-base"
//               >
//                 {loading ? 'Refreshing...' : 'Refresh'}
//               </button>
//             </div>
//           </div>

//           {/* Filter Section */}
//           <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block mb-4 md:mb-6 p-4 bg-gray-50 rounded-lg`}>
//             <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:space-x-4">
//               <div className="flex items-center space-x-2">
//                 <span className="text-sm font-medium text-gray-700">Filter by:</span>
//                 <button
//                   onClick={toggleMobileFilters}
//                   className="md:hidden text-gray-500 hover:text-gray-700"
//                 >
//                   ✕
//                 </button>
//               </div>
              
//               <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4">
//                 {/* Date Filter */}
//                 <div className="w-full md:w-auto">
//                   <label htmlFor="filterDate" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
//                     Specific Date
//                   </label>
//                   <input
//                     type="date"
//                     id="filterDate"
//                     value={filterDate}
//                     onChange={(e) => setFilterDate(e.target.value)}
//                     className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     max={getTodayDate()}
//                   />
//                 </div>

//                 {/* Year Filter */}
//                 <div className="w-full md:w-auto">
//                   <label htmlFor="filterYear" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
//                     Year
//                   </label>
//                   <select
//                     id="filterYear"
//                     value={filterYear}
//                     onChange={handleYearChange}
//                     className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   >
//                     <option value="all">All Years</option>
//                     {availableYears.map(year => (
//                       <option key={year} value={year}>{year}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Month Filter */}
//                 <div className="w-full md:w-auto">
//                   <label htmlFor="filterMonth" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
//                     Month
//                   </label>
//                   <select
//                     id="filterMonth"
//                     value={filterMonth}
//                     onChange={handleMonthChange}
//                     disabled={filterYear === "all"}
//                     className={`w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
//                       filterYear === "all" ? 'bg-gray-100 cursor-not-allowed' : ''
//                     }`}
//                   >
//                     <option value="all">All Months</option>
//                     {availableMonths.map(month => (
//                       <option key={month} value={month}>
//                         {monthNames[month - 1]}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Active Filters Display */}
//                 {isFilterActive && (
//                   <div className="flex items-center space-x-2 w-full md:w-auto">
//                     <div className="flex flex-wrap items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
//                       <span className="text-xs text-blue-700">
//                         {filterDate && `Date: ${new Date(filterDate).toLocaleDateString()}`}
//                         {filterDate && (filterYear !== "all" || filterMonth !== "all") && ", "}
//                         {filterYear !== "all" && `Year: ${filterYear}`}
//                         {filterYear !== "all" && filterMonth !== "all" && ", "}
//                         {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
//                       </span>
//                       <button
//                         onClick={() => resetFilters()}
//                         className="text-blue-500 hover:text-blue-700 text-sm"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* Reset Filters Button */}
//                 {isFilterActive && (
//                   <div className="w-full md:w-auto flex md:items-end">
//                     <button
//                       onClick={resetFilters}
//                       className="w-full md:w-auto px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
//                     >
//                       Reset Filters
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Results Count - Desktop only */}
//               <div className="hidden md:block ml-auto text-right">
//                 <span className="text-sm text-gray-600">
//                   Showing {filteredExpenses.length} of {storedExpenses.length} record(s)
//                 </span>
//                 {isFilterActive && (
//                   <div className="text-sm font-medium text-green-600 mt-1">
//                     Filtered Total: {formatCurrency(calculateFilteredTotal())}
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             {/* Results Count - Mobile only */}
//             <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">
//                   Showing {filteredExpenses.length} of {storedExpenses.length}
//                 </span>
//                 {isFilterActive && (
//                   <span className="text-sm font-medium text-green-600">
//                     Total: {formatCurrency(calculateFilteredTotal())}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Sort Indicator */}
//           <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
//             <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
//             </svg>
//             <p className="text-xs md:text-sm text-blue-800">
//               <strong>Sorted by:</strong> Date (Newest to Oldest)
//             </p>
//           </div>

//           {loading ? (
//             <div className="text-center py-8">
//               <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto"></div>
//               <p className="mt-2 text-gray-600 text-sm md:text-base">Loading extra expenses...</p>
//             </div>
//           ) : filteredExpenses.length === 0 ? (
//             <div className="text-center py-8 text-gray-500 text-sm md:text-base">
//               {isFilterActive ? (
//                 <div>
//                   <p>No extra expenses found for the selected filters.</p>
//                   <button
//                     onClick={resetFilters}
//                     className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                   >
//                     Reset Filters
//                   </button>
//                 </div>
//               ) : (
//                 "No extra expenses stored yet. Add some using the form above."
//               )}
//             </div>
//           ) : (
//             <>
//               {/* Mobile Card View */}
//               <div className="md:hidden space-y-4">
//                 {filteredExpenses.map((expense, index) => (
//                   <div key={expense._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                     <div className="flex justify-between items-start mb-3">
//                       <div>
//                         <h4 className="font-medium text-gray-900">{expense.expenseName}</h4>
//                         <div className="text-xs text-gray-500 mt-1">
//                           {formatDate(expense.date)}
//                           {index === 0 && (
//                             <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
//                               Newest
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="font-bold text-green-700">{formatCurrency(expense.amount)}</div>
//                         <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
//                           expense.paymentMethod === 'Cash' ? 'bg-yellow-100 text-yellow-800' :
//                           expense.paymentMethod === 'Bank Transfer' ? 'bg-blue-100 text-blue-800' :
//                           expense.paymentMethod === 'Mobile Banking' ? 'bg-teal-100 text-teal-800' :
//                           expense.paymentMethod === 'Card' ? 'bg-purple-100 text-purple-800' :
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                           {formatPaymentMethod(expense.paymentMethod || 'Cash')}
//                         </span>
//                       </div>
//                     </div>
                    
//                     {expense.note && (
//                       <div className="text-sm text-gray-600 mb-3">
//                         <span className="font-medium">Note:</span> {expense.note}
//                       </div>
//                     )}
                    
//                     <div className="flex space-x-2 pt-3 border-t border-gray-200">
//                       <button
//                         onClick={() => handleEditExpense(expense)}
//                         className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm flex items-center justify-center"
//                       >
//                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
//                         </svg>
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDeleteExpense(expense._id)}
//                         className="flex-1 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm flex items-center justify-center"
//                       >
//                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
//                         </svg>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))}
                
//                 {/* Mobile Summary */}
//                 <div className="bg-gray-50 rounded-lg p-4 mt-4">
//                   <div className="flex justify-between items-center mb-2">
//                     <span className="font-semibold text-gray-900">
//                       {isFilterActive ? "Filtered Total" : "Total"}
//                     </span>
//                     <span className="font-bold text-gray-900">{formatCurrency(calculateFilteredTotal())}</span>
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {filteredExpenses.length} expense(s)
//                   </div>
//                 </div>
//               </div>

//               {/* Desktop Table View */}
//               <div className="hidden md:block overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Expense Name
//                       </th>
//                       <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Amount (BDT)
//                       </th>
//                       <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Payment Method
//                       </th>
//                       <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Note
//                       </th>
//                       <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredExpenses.map((expense, index) => (
//                       <tr key={expense._id} className="hover:bg-gray-50">
//                         <td className="px-4 md:px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">
//                             {expense.expenseName}
//                           </div>
//                         </td>
//                         <td className="px-4 md:px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {formatDate(expense.date)}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {monthNames[new Date(expense.date).getMonth()]} {new Date(expense.date).getFullYear()}
//                           </div>
//                           {index === 0 && (
//                             <div className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
//                               Newest
//                             </div>
//                           )}
//                           {index === filteredExpenses.length - 1 && filteredExpenses.length > 1 && (
//                             <div className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
//                               Oldest
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-4 md:px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900 font-medium">
//                             {formatCurrency(expense.amount)}
//                           </div>
//                         </td>
//                         <td className="px-4 md:px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             expense.paymentMethod === 'Cash' ? 'bg-yellow-100 text-yellow-800' :
//                             expense.paymentMethod === 'Bank Transfer' ? 'bg-blue-100 text-blue-800' :
//                             expense.paymentMethod === 'Mobile Banking' ? 'bg-teal-100 text-teal-800' :
//                             expense.paymentMethod === 'Card' ? 'bg-purple-100 text-purple-800' :
//                             'bg-gray-100 text-gray-800'
//                           }`}>
//                             {formatPaymentMethod(expense.paymentMethod || 'Cash')}
//                           </span>
//                         </td>
//                         <td className="px-4 md:px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-600 max-w-xs truncate">
//                             {expense.note || "-"}
//                           </div>
//                         </td>
//                         <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           <div className="flex space-x-2">
//                             <button
//                               onClick={() => handleEditExpense(expense)}
//                               className="text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded flex items-center"
//                             >
//                               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
//                               </svg>
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => handleDeleteExpense(expense._id)}
//                               className="text-red-600 hover:text-red-900 transition-colors px-3 py-1 bg-red-50 hover:bg-red-100 rounded flex items-center"
//                             >
//                               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
//                               </svg>
//                               Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot className="bg-gray-50">
//                     <tr>
//                       <td colSpan="2" className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-900">
//                         {isFilterActive ? "Filtered Total" : "Total"}
//                         {isFilterActive && (
//                           <div className="text-xs font-normal text-gray-500 mt-1">
//                             {filterDate && `Date: ${new Date(filterDate).toLocaleDateString()}`}
//                             {filterDate && (filterYear !== "all" || filterMonth !== "all") && " • "}
//                             {filterYear !== "all" && `Year: ${filterYear}`}
//                             {filterYear !== "all" && filterMonth !== "all" && " • "}
//                             {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
//                           </div>
//                         )}
//                         <div className="text-xs font-normal text-blue-500 mt-1">
//                           Sorted: Newest to Oldest
//                         </div>
//                       </td>
//                       <td className="px-4 md:px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-bold text-gray-900">
//                           {formatCurrency(calculateFilteredTotal())}
//                         </div>
//                       </td>
//                       <td colSpan="3" className="px-4 md:px-6 py-4 text-sm text-gray-500">
//                         {filteredExpenses.length} expense(s)
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
              
//               {/* Summary Stats */}
//               <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
//                 <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
//                   <h4 className="text-xs md:text-sm font-medium text-blue-900">
//                     {isFilterActive ? "Filtered Expenses" : "Total Expenses"}
//                   </h4>
//                   <p className="text-xl md:text-2xl font-bold text-blue-700">{filteredExpenses.length}</p>
//                 </div>
//                 <div className="bg-green-50 p-3 md:p-4 rounded-lg">
//                   <h4 className="text-xs md:text-sm font-medium text-green-900">
//                     {isFilterActive ? "Filtered Cost" : "Total Cost"}
//                   </h4>
//                   <p className="text-xl md:text-2xl font-bold text-green-700">{formatCurrency(calculateFilteredTotal())}</p>
//                 </div>
//                 <div className="bg-purple-50 p-3 md:p-4 rounded-lg">
//                   <h4 className="text-xs md:text-sm font-medium text-purple-900">Average per Expense</h4>
//                   <p className="text-xl md:text-2xl font-bold text-purple-700">
//                     {formatCurrency(filteredExpenses.length > 0 ? calculateFilteredTotal() / filteredExpenses.length : 0)}
//                   </p>
//                 </div>
//                 <div className="bg-yellow-50 p-3 md:p-4 rounded-lg">
//                   <h4 className="text-xs md:text-sm font-medium text-yellow-900">Expense Types</h4>
//                   <p className="text-xl md:text-2xl font-bold text-yellow-700">
//                     {[...new Set(filteredExpenses.map(expense => expense.expenseName))].length}
//                   </p>
//                 </div>
//               </div>

//               {/* Expense Type Breakdown */}
//               {filteredExpenses.length > 0 && (
//                 <div className="mt-6 md:mt-8">
//                   <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
//                     {isFilterActive ? "Filtered Expense Type Breakdown" : "Expense Type Breakdown"}
//                   </h4>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
//                     {Object.entries(
//                       filteredExpenses.reduce((acc, expense) => {
//                         acc[expense.expenseName] = (acc[expense.expenseName] || 0) + expense.amount;
//                         return acc;
//                       }, {})
//                     ).map(([expenseName, totalAmount]) => (
//                       <div key={expenseName} className="bg-gray-50 p-3 md:p-4 rounded-lg">
//                         <div className="flex justify-between items-center">
//                           <span className="text-xs md:text-sm font-medium text-gray-700 truncate mr-2">{expenseName}</span>
//                           <span className="text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(totalAmount)}</span>
//                         </div>
//                         <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
//                           <div 
//                             className="bg-blue-600 h-2 rounded-full" 
//                             style={{ 
//                               width: `${(totalAmount / calculateFilteredTotal()) * 100}%` 
//                             }}
//                           ></div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  CalendarDays,
  User,
  Shield,
  Info,
  Plus,
  Filter
} from "lucide-react";

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 
                  type === 'error' ? 'bg-red-50 border-red-200' :
                  type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  type === 'info' ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200';
  
  const textColor = type === 'success' ? 'text-green-800' : 
                    type === 'error' ? 'text-red-800' :
                    type === 'warning' ? 'text-yellow-800' :
                    type === 'info' ? 'text-blue-800' :
                    'text-gray-800';
  
  const iconColor = type === 'success' ? 'text-green-600' : 
                    type === 'error' ? 'text-red-600' :
                    type === 'warning' ? 'text-yellow-600' :
                    type === 'info' ? 'text-blue-600' :
                    'text-gray-600';

  const icons = {
    success: <CheckCircle className={`w-5 h-5 ${iconColor}`} />,
    error: <AlertCircle className={`w-5 h-5 ${iconColor}`} />,
    warning: <AlertCircle className={`w-5 h-5 ${iconColor}`} />,
    info: <Info className={`w-5 h-5 ${iconColor}`} />
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${bgColor} animate-slide-in`}>
      <div className="flex items-center space-x-3">
        {icons[type]}
        <div className="flex-1">
          <p className={`font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// Permission Denied Toast Component
const PermissionDeniedToast = ({ action = "perform this action", requiredRole = "admin", onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-4 animate-slide-in">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Permission Denied</h3>
            <p className="text-sm text-red-700 mt-1">
              You don't have permission to {action}. 
              This action requires <span className="font-bold">{requiredRole}</span> role.
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-red-400 hover:text-red-600"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Toast Component
const DeleteConfirmationToast = ({ 
  itemName, 
  itemType = "extra expense", 
  onConfirm, 
  onCancel,
  userRole = "user"
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onCancel, 300);
    }, 10000);

    return () => clearTimeout(timer);
  }, [onCancel]);

  const canDelete = ['admin', 'moderator'].includes(userRole);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 animate-slide-in">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-full ${canDelete ? 'bg-red-100' : 'bg-yellow-100'} flex items-center justify-center`}>
              {canDelete ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Shield className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {canDelete ? `Delete ${itemType} Record?` : 'Permission Required'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {canDelete ? (
                  <>Are you sure you want to delete <span className="font-medium">{itemName}</span>? This action cannot be undone.</>
                ) : (
                  <>Only administrators and moderators can delete {itemType} records. Your role: <span className="font-medium capitalize">{userRole}</span></>
                )}
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
          {canDelete ? (
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
          ) : (
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onCancel, 300);
              }}
              className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ExtraExpensesPage() {
  const router = useRouter();
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState(null);
  const [permissionToast, setPermissionToast] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [expenses, setExpenses] = useState([
    {
      id: crypto.randomUUID(),
      expenseName: "",
      amount: "",
      date: "",
      paymentMethod: "Cash",
      note: "",
    },
  ]);

  const [storedExpenses, setStoredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    expenseName: "",
    amount: "",
    date: "",
    paymentMethod: "Cash",
    note: ""
  });

  // Filter states
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);

  // Mobile menu state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Ref for edit form
  const editFormRef = useRef(null);

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Backend API URL
  const API_URL = "http://localhost:5004/api";

  // Payment methods - MUST MATCH BACKEND ENUM
  const paymentMethods = [
    "Cash", 
    "Bank Transfer", 
    "Mobile Banking", 
    "Card"
  ];

  // Show toast function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Clear toast
  const clearToast = () => {
    setToast(null);
  };

  // Show permission denied toast
  const showPermissionToast = (action = "perform this action", requiredRole = "admin") => {
    setPermissionToast({ action, requiredRole });
  };

  // Clear permission toast
  const clearPermissionToast = () => {
    setPermissionToast(null);
  };

  // Show delete confirmation
  const showDeleteConfirmation = (itemName, itemType, onConfirm) => {
    setDeleteConfirmation({
      itemName,
      itemType,
      onConfirm,
      userRole: user?.role
    });
  };

  // Clear delete confirmation
  const clearDeleteConfirmation = () => {
    setDeleteConfirmation(null);
  };

  // Check user permissions
  const checkPermission = (action) => {
    if (!user) return false;
    
    switch (action) {
      case 'delete':
        return ['admin', 'moderator'].includes(user.role);
      case 'edit':
        return ['admin', 'moderator', 'user'].includes(user.role);
      case 'create':
        return ['admin', 'moderator', 'user'].includes(user.role);
      default:
        return false;
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Fetch extra expenses after authentication
  useEffect(() => {
    if (user && !authLoading) {
      fetchStoredExpenses();
    }
  }, [user, authLoading]);

  // Check if user is authenticated
  const checkAuthentication = async () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (!userData || !token) {
      showToast('Please login to access the extra expenses management system', 'error');
      setTimeout(() => router.push('/'), 2000);
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      
      // Check if user has permission (admin or moderator)
      if (!['admin', 'moderator'].includes(parsedUser.role)) {
        showToast('Access denied. You do not have permission to manage extra expenses.', 'error');
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }
      
      setUser(parsedUser);
      setAuthLoading(false);
      showToast(`Welcome back, ${parsedUser.name}!`, 'success');
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  };

  // Helper function to get auth headers
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

  // Update available years and months when storedExpenses changes
  useEffect(() => {
    if (storedExpenses.length > 0) {
      // Extract unique years from stored expenses
      const years = Array.from(
        new Set(
          storedExpenses.map(expense => {
            const date = new Date(expense.date);
            return date.getFullYear();
          })
        )
      ).sort((a, b) => b - a);

      setAvailableYears(years);

      // If a year is selected, update available months
      if (filterYear !== "all") {
        const yearExpenses = storedExpenses.filter(expense => {
          const date = new Date(expense.date);
          return date.getFullYear().toString() === filterYear;
        });

        const months = Array.from(
          new Set(
            yearExpenses.map(expense => {
              const date = new Date(expense.date);
              return date.getMonth() + 1;
            })
          )
        ).sort((a, b) => a - b);

        setAvailableMonths(months);
      } else {
        setAvailableMonths([]);
        setFilterMonth("all");
      }
    } else {
      setAvailableYears([]);
      setAvailableMonths([]);
    }
  }, [storedExpenses, filterYear]);

  // Scroll to edit form when editingId changes
  useEffect(() => {
    if (editingId && editFormRef.current) {
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [editingId]);

  const fetchStoredExpenses = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/extra-expenses`, {
        headers: headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Authentication failed. Please login again.', 'error');
          localStorage.clear();
          router.push('/');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Sort expenses by date in descending order (newest first)
        const sortedExpenses = [...data.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        setStoredExpenses(sortedExpenses);
        // showToast(`Loaded ${sortedExpenses.length} extra expense(s)`, 'success');
      } else {
        showToast(data.message || 'Failed to load extra expenses', 'error');
      }
    } catch (error) {
      console.error('Error fetching extra expenses:', error);
      showToast(`Network error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort expenses based on selected filters
  const filteredExpenses = useMemo(() => {
    let filtered = storedExpenses;

    // Apply date filter
    if (filterDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date).toISOString().split('T')[0];
        return expenseDate === filterDate;
      });
    }

    // Apply year filter
    if (filterYear !== "all") {
      filtered = filtered.filter(expense => {
        const date = new Date(expense.date);
        return date.getFullYear().toString() === filterYear;
      });
    }

    // Apply month filter
    if (filterMonth !== "all") {
      filtered = filtered.filter(expense => {
        const date = new Date(expense.date);
        return (date.getMonth() + 1).toString() === filterMonth;
      });
    }

    // Already sorted in fetchStoredExpenses, but ensure sorting here too
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [storedExpenses, filterDate, filterYear, filterMonth]);

  // Generate PDF function
  const generatePDF = () => {
    if (filteredExpenses.length === 0) {
      showToast("No extra expenses to download", "warning");
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text("Extra Expenses Report", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
      let filterInfo = "All Extra Expenses";
      if (filterDate) {
        filterInfo = `Date: ${new Date(filterDate).toLocaleDateString()}`;
      } else if (filterYear !== "all" || filterMonth !== "all") {
        filterInfo = `Filter: ${filterYear !== "all" ? `Year: ${filterYear}` : ""} ${filterMonth !== "all" ? `Month: ${monthNames[parseInt(filterMonth) - 1]}` : ""}`;
      }
      doc.text(`Report Type: ${filterInfo}`, 14, 36);
      doc.text(`Total Records: ${filteredExpenses.length}`, 14, 42);
      
      // Add user info
      if (user) {
        doc.text(`Generated by: ${user.name} (${user.role})`, 14, 48);
      }
      
      // Prepare table data
      const tableData = filteredExpenses.map(expense => [
        expense.expenseName,
        new Date(expense.date).toLocaleDateString(),
        `BDT ${expense.amount.toFixed(2)}`,
        expense.paymentMethod || 'Cash',
        expense.note || "-",
        `${monthNames[new Date(expense.date).getMonth()]} ${new Date(expense.date).getFullYear()}`
      ]);
      
      // Add table using autoTable
      autoTable(doc, {
        startY: user ? 55 : 50,
        head: [['Expense Name', 'Date', 'Amount (BDT)', 'Payment Method', 'Note', 'Month-Year']],
        body: tableData,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 40 },
          5: { cellWidth: 30 }
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
      doc.text(`Total Expenses: ${filteredExpenses.length}`, 14, lastY + 8);
      doc.text(`Total Amount: BDT ${totalAmount.toFixed(2)}`, 14, lastY + 16);
      doc.text(`Average per Expense: BDT ${(totalAmount / filteredExpenses.length).toFixed(2)}`, 14, lastY + 24);
      
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
      const isFilterActive = filterDate || filterYear !== "all" || filterMonth !== "all";
      const filterSuffix = isFilterActive ? '_filtered' : '';
      const filename = `extra_expenses_${timestamp}${filterSuffix}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      // Show success message
      showToast(`PDF report downloaded successfully!`, "success");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast(`Failed to generate PDF: ${error.message}`, 'error');
    }
  };

  const updateField = (id, field, value) => {
    setExpenses(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addExpense = () => {
    setExpenses(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        expenseName: "",
        amount: "",
        date: "",
        paymentMethod: "Cash",
        note: "",
      },
    ]);
  };

  const removeExpense = (id) => {
    if (expenses.length === 1) return;
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check create permission
    if (!checkPermission('create')) {
      showPermissionToast('create extra expense records', 'user');
      return;
    }

    setSaving(true);

    // Filter out empty rows
    const validExpenses = expenses.filter(
      item => item.expenseName.trim() && item.amount && item.date
    );

    if (validExpenses.length === 0) {
      showToast("Please add at least one extra expense", 'error');
      setSaving(false);
      return;
    }

    try {
      // Prepare data for backend
      const expensesToSave = validExpenses.map(expense => ({
        expenseName: expense.expenseName.trim(),
        amount: parseFloat(expense.amount),
        date: expense.date,
        paymentMethod: expense.paymentMethod || "Cash",
        note: expense.note || ""
      }));

      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/extra-expenses`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(expensesToSave),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Authentication failed. Please login again.', 'error');
          localStorage.clear();
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          showToast(errorData.message || `Server error: ${response.status}`, 'error');
        } catch {
          showToast(`Server error: ${response.status} - ${errorText}`, 'error');
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast(`✅ Successfully saved ${data.data.length} extra expense(s)!`, 'success');
        // Reset form
        setExpenses([{
          id: crypto.randomUUID(),
          expenseName: "",
          amount: "",
          date: "",
          paymentMethod: "Cash",
          note: "",
        }]);
        // Refresh stored expenses
        fetchStoredExpenses();
        
        if (data.warnings && data.warnings.length > 0) {
          console.warn('Warnings:', data.warnings);
        }
      } else {
        showToast(`❌ ${data.message || 'Failed to save extra expenses'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving extra expenses:', error);
      showToast(`❌ Network error: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditExpense = (expense) => {
    // Check edit permission
    if (!checkPermission('edit')) {
      showPermissionToast('edit extra expense records', 'user');
      return;
    }

    setEditingId(expense._id);
    setEditForm({
      expenseName: expense.expenseName,
      date: new Date(expense.date).toISOString().split('T')[0],
      amount: expense.amount.toString(),
      paymentMethod: expense.paymentMethod || "Cash",
      note: expense.note || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      expenseName: "",
      amount: "",
      date: "",
      paymentMethod: "Cash",
      note: ""
    });
    showToast('Edit mode cancelled', 'info');
  };

  const handleUpdateExpense = async () => {
    if (!editingId) return;

    // Check edit permission
    if (!checkPermission('edit')) {
      showPermissionToast('edit extra expense records', 'user');
      return;
    }

    // Validation
    if (!editForm.expenseName.trim() || !editForm.amount || !editForm.date) {
      showToast("Please fill all required fields", 'error');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        expenseName: editForm.expenseName.trim(),
        date: editForm.date,
        amount: parseFloat(editForm.amount),
        paymentMethod: editForm.paymentMethod || "Cash",
        note: editForm.note || ""
      };

      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/extra-expenses/${editingId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Authentication failed. Please login again.', 'error');
          localStorage.clear();
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast('✅ Extra expense updated successfully!', 'success');
        // Refresh the list
        fetchStoredExpenses();
        // Reset edit mode
        setEditingId(null);
        setEditForm({
          expenseName: "",
          amount: "",
          date: "",
          paymentMethod: "Cash",
          note: ""
        });
      } else {
        showToast(`❌ ${data.message || 'Failed to update extra expense'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating extra expense:', error);
      showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (expense) => {
    showDeleteConfirmation(
      `extra expense "${expense.expenseName}" from ${formatDate(expense.date)} (${formatCurrency(expense.amount)})`,
      "extra expense",
      () => handleDeleteConfirm(expense._id)
    );
  };

  const handleDeleteConfirm = async (id) => {
    // Check delete permission
    if (!checkPermission('delete')) {
      showPermissionToast('delete extra expense records', 'moderator');
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/extra-expenses/${id}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast('Authentication failed. Please login again.', 'error');
          localStorage.clear();
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast('✅ Extra expense deleted successfully!', 'success');
        // Refresh the list
        fetchStoredExpenses();
      } else {
        showToast(`❌ ${data.message || 'Failed to delete extra expense'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting extra expense:', error);
      showToast(`❌ Error: ${error.message}`, 'error');
    }
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    if (!method) return "Cash";
    return method;
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

  // Calculate total for filtered expenses
  const calculateFilteredTotal = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // Calculate total for all expenses
  const calculateTotal = () => {
    return storedExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterDate("");
    setFilterMonth("all");
    setFilterYear("all");
    showToast('All filters reset', 'info');
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
    setFilterMonth("all");
    const year = e.target.value === "all" ? "All Years" : e.target.value;
    showToast(`Filtered by year: ${year}`, 'info');
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
    const monthName = e.target.value === "all" ? "All Months" : monthNames[parseInt(e.target.value) - 1];
    showToast(`Filtered by month: ${monthName}`, 'info');
  };

  // Check if any filter is active
  const isFilterActive = filterDate || filterYear !== "all" || filterMonth !== "all";

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  // Calculate form total
  const calculateFormTotal = () => {
    return expenses.reduce((total, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return total + amount;
    }, 0);
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notifications */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
        
        {/* Permission Denied Toast */}
        {permissionToast && (
          <PermissionDeniedToast 
            action={permissionToast.action}
            requiredRole={permissionToast.requiredRole}
            onClose={clearPermissionToast}
          />
        )}
        
        {/* Delete Confirmation Toast */}
        {deleteConfirmation && (
          <DeleteConfirmationToast 
            itemName={deleteConfirmation.itemName}
            itemType={deleteConfirmation.itemType}
            onConfirm={deleteConfirmation.onConfirm}
            onCancel={clearDeleteConfirmation}
            userRole={deleteConfirmation.userRole}
          />
        )}

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800">
            Extra Expenses Management
          </h2>
          <p className="text-sm md:text-base text-center text-gray-600 mt-2">
            Track and manage all your extra miscellaneous expenses
          </p>
        </div>

        {/* User Info Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">{user.name}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Role: <span className="font-medium capitalize ml-1">{user.role}</span>
                </p>
              </div>
            </div>
            <div className="text-sm text-blue-700">
              <span className="px-2 py-1 bg-blue-200 rounded-full flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Extra Expenses Management
              </span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <Plus className="w-6 h-6 mr-2 text-blue-600" />
              Add New Extra Expenses
            </h3>
            <button
              onClick={addExpense}
              className="md:hidden px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header Row - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-semibold text-gray-600 px-1">
              <div className="col-span-3">Expense Name *</div>
              <div className="col-span-2">Amount (BDT) *</div>
              <div className="col-span-2">Date *</div>
              <div className="col-span-2">Payment Method *</div>
              <div className="col-span-2">Note (Optional)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {expenses.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-center p-4 md:p-0 md:border-0 border border-gray-200 rounded-lg mb-4 md:mb-0 bg-gray-50"
              >
                {/* Mobile View - Vertical Layout */}
                <div className="md:hidden space-y-3 w-full">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Expense Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Office Party, Stationery"
                        value={item.expenseName}
                        onChange={(e) =>
                          updateField(item.id, "expenseName", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Amount (BDT) *
                      </label>
                      <input
                        type="number"
                        placeholder="Amount in BDT"
                        value={item.amount}
                        onChange={(e) =>
                          updateField(item.id, "amount", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={item.date}
                        max={getTodayDate()}
                        onChange={(e) =>
                          updateField(item.id, "date", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Payment Method *
                      </label>
                      <select
                        value={item.paymentMethod}
                        onChange={(e) =>
                          updateField(item.id, "paymentMethod", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select</option>
                        {paymentMethods.map(method => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Optional note"
                      value={item.note}
                      onChange={(e) =>
                        updateField(item.id, "note", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {expenses.length > 1 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => removeExpense(item.id)}
                        className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove This Entry
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop View - Grid Layout */}
                {/* Expense Name */}
                <div className="hidden md:block col-span-3">
                  <input
                    type="text"
                    placeholder="e.g. Office Party, Stationery"
                    value={item.expenseName}
                    onChange={(e) =>
                      updateField(item.id, "expenseName", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Amount */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="number"
                    placeholder="Amount in BDT"
                    value={item.amount}
                    onChange={(e) =>
                      updateField(item.id, "amount", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Date */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="date"
                    value={item.date}
                    max={getTodayDate()}
                    onChange={(e) =>
                      updateField(item.id, "date", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="hidden md:block col-span-2">
                  <select
                    value={item.paymentMethod}
                    onChange={(e) =>
                      updateField(item.id, "paymentMethod", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note (Optional) */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="text"
                    placeholder="Optional note"
                    value={item.note}
                    onChange={(e) =>
                      updateField(item.id, "note", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Remove - Desktop */}
                <div className="hidden md:block col-span-1">
                  {expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpense(item.id)}
                      className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Form Total */}
            <div className="flex justify-end mb-3">
              <div className="text-lg font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                Form Total: {formatCurrency(calculateFormTotal())}
              </div>
            </div>

            {/* Add More Button */}
            <div className="flex flex-col md:flex-row gap-3 mt-3">
                <button
                 type="button"
                onClick={addExpense}
                className="hidden md:block w-full border border-dashed border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
               >
                 + Add More Expenses
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3 md:py-3 rounded-lg transition-colors text-sm md:text-base font-medium ${
                  saving
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white flex items-center justify-center`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Save Extra Expenses
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Edit Form Section with ref */}
        {editingId && (
          <div 
            ref={editFormRef} 
            className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 border-2 border-blue-400"
            id="edit-form-section"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-bold text-blue-700 flex items-center">
                <Edit className="w-6 h-6 mr-2" />
                Edit Extra Expense
              </h3>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full flex items-center">
                <Edit className="w-4 h-4 mr-1" />
                Editing Mode
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-start">
              {/* Expense Name */}
              <div className="md:col-span-3">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Expense Name *
                </label>
                <input
                  type="text"
                  value={editForm.expenseName}
                  onChange={(e) => setEditForm({...editForm, expenseName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                  placeholder="e.g., Office Party, Stationery"
                />
              </div>

              {/* Amount */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Amount (BDT) *
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  max={getTodayDate()}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Select Method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Optional note"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-1 flex space-x-2 pt-6 md:pt-0 md:items-end">
                <button
                  onClick={handleUpdateExpense}
                  disabled={saving}
                  className={`flex-1 py-3 md:py-2 rounded-lg transition-colors text-sm md:text-base font-medium ${
                    saving
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white flex items-center justify-center`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition duration-200 flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stored Extra Expenses Table Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                {isFilterActive ? 'Filtered Extra Expenses' : 'All Extra Expenses'}
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({filteredExpenses.length} records)
                </span>
              </h3>
              <div className="mt-1 text-sm text-gray-600">
                {isFilterActive ? (
                  <span>
                    Showing {filteredExpenses.length} of {storedExpenses.length} expense(s)
                  </span>
                ) : (
                  <span>Total: {storedExpenses.length} expense(s)</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* PDF Download Button */}
              {filteredExpenses.length > 0 && (
                <button
                  onClick={generatePDF}
                  className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center text-sm md:text-base font-medium"
                  title="Download PDF Report"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Download PDF
                </button>
              )}
              
              {/* Mobile Filters Toggle */}
              <button
                onClick={toggleMobileFilters}
                className="md:hidden px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <button
                onClick={fetchStoredExpenses}
                disabled={loading}
                className="px-3 md:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm md:text-base font-medium flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Sort Indicator */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2" />
            <p className="text-xs md:text-sm text-blue-800">
              <strong>Sorted by:</strong> Date (Newest to Oldest)
            </p>
          </div>

          {/* Filter Section */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block mb-4 md:mb-6 p-4 bg-gray-50 rounded-lg`}>
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                <button
                  onClick={toggleMobileFilters}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4">
                {/* Date Filter */}
                <div className="w-full md:w-auto">
                  <label htmlFor="filterDate" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Specific Date
                  </label>
                  <input
                    type="date"
                    id="filterDate"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    max={getTodayDate()}
                  />
                </div>

                {/* Year Filter */}
                <div className="w-full md:w-auto">
                  <label htmlFor="filterYear" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    id="filterYear"
                    value={filterYear}
                    onChange={handleYearChange}
                    className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Month Filter */}
                <div className="w-full md:w-auto">
                  <label htmlFor="filterMonth" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    id="filterMonth"
                    value={filterMonth}
                    onChange={handleMonthChange}
                    disabled={filterYear === "all"}
                    className={`w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      filterYear === "all" ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="all">All Months</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>
                        {monthNames[month - 1]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Filters Display */}
                {isFilterActive && (
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <div className="flex flex-wrap items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                      <span className="text-xs text-green-700">
                        {filterDate && `Date: ${new Date(filterDate).toLocaleDateString()}`}
                        {filterDate && (filterYear !== "all" || filterMonth !== "all") && ", "}
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
                {isFilterActive && (
                  <div className="w-full md:w-auto flex md:items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full md:w-auto px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count - Desktop only */}
              <div className="hidden md:block ml-auto text-right">
                <span className="text-sm text-gray-600">
                  Showing {filteredExpenses.length} of {storedExpenses.length} record(s)
                </span>
                {isFilterActive && (
                  <div className="text-sm font-medium text-green-600 mt-1">
                    Filtered Total: {formatCurrency(calculateFilteredTotal())}
                  </div>
                )}
              </div>
            </div>
            
            {/* Results Count - Mobile only */}
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Showing {filteredExpenses.length} of {storedExpenses.length}
                </span>
                {isFilterActive && (
                  <span className="text-sm font-medium text-green-600">
                    Total: {formatCurrency(calculateFilteredTotal())}
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm md:text-base">Loading extra expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm md:text-base">
              {isFilterActive ? (
                <div>
                  <p>No extra expenses found for the selected filters.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                "No extra expenses stored yet. Add some using the form above."
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredExpenses.map((expense, index) => (
                  <div key={expense._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{expense.expenseName}</h4>
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(expense.date)}
                          {index === 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              Newest
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700">{formatCurrency(expense.amount)}</div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                          expense.paymentMethod === 'Cash' ? 'bg-yellow-100 text-yellow-800' :
                          expense.paymentMethod === 'Bank Transfer' ? 'bg-blue-100 text-blue-800' :
                          expense.paymentMethod === 'Mobile Banking' ? 'bg-teal-100 text-teal-800' :
                          expense.paymentMethod === 'Card' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formatPaymentMethod(expense.paymentMethod || 'Cash')}
                        </span>
                      </div>
                    </div>
                    
                    {expense.note && (
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Note:</span> {expense.note}
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        disabled={!checkPermission('edit')}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!checkPermission('edit') ? "Requires user role or higher" : ""}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(expense)}
                        disabled={!checkPermission('delete')}
                        className="flex-1 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!checkPermission('delete') ? "Requires moderator or admin role" : ""}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Mobile Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">
                      {isFilterActive ? "Filtered Total" : "Total"}
                    </span>
                    <span className="font-bold text-gray-900">{formatCurrency(calculateFilteredTotal())}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {filteredExpenses.length} expense(s)
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expense Name
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount (BDT)
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense, index) => (
                      <tr key={expense._id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.expenseName}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(expense.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {monthNames[new Date(expense.date).getMonth()]} {new Date(expense.date).getFullYear()}
                          </div>
                          {index === 0 && (
                            <div className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Newest
                            </div>
                          )}
                          {index === filteredExpenses.length - 1 && filteredExpenses.length > 1 && (
                            <div className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                              Oldest
                            </div>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-bold">
                            {formatCurrency(expense.amount)}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            expense.paymentMethod === 'Cash' ? 'bg-yellow-100 text-yellow-800' :
                            expense.paymentMethod === 'Bank Transfer' ? 'bg-blue-100 text-blue-800' :
                            expense.paymentMethod === 'Mobile Banking' ? 'bg-teal-100 text-teal-800' :
                            expense.paymentMethod === 'Card' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formatPaymentMethod(expense.paymentMethod || 'Cash')}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {expense.note || "-"}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditExpense(expense)}
                              disabled={!checkPermission('edit')}
                              className="text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              title={!checkPermission('edit') ? "Requires user role or higher" : ""}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(expense)}
                              disabled={!checkPermission('delete')}
                              className="text-red-600 hover:text-red-900 transition-colors px-3 py-1 bg-red-50 hover:bg-red-100 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              title={!checkPermission('delete') ? "Requires moderator or admin role" : ""}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-900">
                        {isFilterActive ? "Filtered Total" : "Total"}
                        {isFilterActive && (
                          <div className="text-xs font-normal text-gray-500 mt-1">
                            {filterDate && `Date: ${new Date(filterDate).toLocaleDateString()}`}
                            {filterDate && (filterYear !== "all" || filterMonth !== "all") && " • "}
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
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(calculateFilteredTotal())}
                        </div>
                        {filteredExpenses.length > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            Average: {formatCurrency(calculateFilteredTotal() / filteredExpenses.length)}
                          </div>
                        )}
                      </td>
                      <td colSpan="3" className="px-4 md:px-6 py-4 text-sm text-gray-500">
                        {filteredExpenses.length} expense(s)
                        {filteredExpenses.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            Showing {Math.min(filteredExpenses.length, 10)} of {filteredExpenses.length} records
                          </div>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                  <h4 className="text-xs md:text-sm font-medium text-blue-900">
                    {isFilterActive ? "Filtered Expenses" : "Total Expenses"}
                  </h4>
                  <p className="text-xl md:text-2xl font-bold text-blue-700">{filteredExpenses.length}</p>
                </div>
                <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                  <h4 className="text-xs md:text-sm font-medium text-green-900">
                    {isFilterActive ? "Filtered Cost" : "Total Cost"}
                  </h4>
                  <p className="text-xl md:text-2xl font-bold text-green-700">{formatCurrency(calculateFilteredTotal())}</p>
                </div>
                <div className="bg-purple-50 p-3 md:p-4 rounded-lg">
                  <h4 className="text-xs md:text-sm font-medium text-purple-900">Average per Expense</h4>
                  <p className="text-xl md:text-2xl font-bold text-purple-700">
                    {formatCurrency(filteredExpenses.length > 0 ? calculateFilteredTotal() / filteredExpenses.length : 0)}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 md:p-4 rounded-lg">
                  <h4 className="text-xs md:text-sm font-medium text-yellow-900">Expense Types</h4>
                  <p className="text-xl md:text-2xl font-bold text-yellow-700">
                    {[...new Set(filteredExpenses.map(expense => expense.expenseName))].length}
                  </p>
                </div>
              </div>

              {/* Expense Type Breakdown */}
              {filteredExpenses.length > 0 && (
                <div className="mt-6 md:mt-8">
                  <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                    {isFilterActive ? "Filtered Expense Type Breakdown" : "Expense Type Breakdown"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {Object.entries(
                      filteredExpenses.reduce((acc, expense) => {
                        acc[expense.expenseName] = (acc[expense.expenseName] || 0) + expense.amount;
                        return acc;
                      }, {})
                    ).map(([expenseName, totalAmount]) => (
                      <div key={expenseName} className="bg-gray-50 p-3 md:p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-xs md:text-sm font-medium text-gray-700 truncate mr-2">{expenseName}</span>
                          <span className="text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(totalAmount / calculateFilteredTotal()) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
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