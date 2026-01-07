


// "use client";

// import React, { useState, useEffect, useMemo, useRef } from "react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export default function TransportExpensePage() {
//   const [transports, setTransports] = useState([
//     {
//       id: crypto.randomUUID(),
//       transportName: "",
//       cost: "",
//       date: "",
//       paymentMethod: "",
//       note: "",
//     },
//   ]);

//   const [storedTransports, setStoredTransports] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({
//     transportName: "",
//     cost: "",
//     date: "",
//     paymentMethod: "",
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

//   // Currency symbol for Bangladeshi Taka
//   const currencySymbol = "৳";

//   // Fetch stored transport expenses on component mount
//   useEffect(() => {
//     fetchStoredTransports();
//   }, []);

//   // Update available years and months when storedTransports changes
//   useEffect(() => {
//     if (storedTransports.length > 0) {
//       // Extract unique years from stored transports
//       const years = Array.from(
//         new Set(
//           storedTransports.map(expense => {
//             const date = new Date(expense.date);
//             return date.getFullYear();
//           })
//         )
//       ).sort((a, b) => b - a);

//       setAvailableYears(years);

//       // If a year is selected, update available months
//       if (filterYear !== "all") {
//         const yearExpenses = storedTransports.filter(expense => {
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
//   }, [storedTransports, filterYear]);

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

//   // Helper function to get authentication headers
//   const getAuthHeaders = () => {
//     // Try to get token from localStorage first, then cookies
//     const token = localStorage.getItem('auth_token') || 
//                   document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
    
//     const headers = {
//       'Content-Type': 'application/json',
//     };
    
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }
    
//     return headers;
//   };

//   const fetchStoredTransports = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const headers = getAuthHeaders();
      
//       const response = await fetch('http://localhost:5004/api/transport-expenses', {
//         headers: headers
//       });
      
//       const data = await response.json();
      
//       if (response.ok && data.success) {
//         // Sort transports by date in descending order (newest first)
//         const sortedTransports = [...data.data].sort((a, b) => {
//           const dateA = new Date(a.date);
//           const dateB = new Date(b.date);
//           return dateB.getTime() - dateA.getTime();
//         });
//         setStoredTransports(sortedTransports);
//       } else {
//         if (response.status === 401 || response.status === 403) {
//           setError('Authentication required. Please login to view transport expenses.');
//           // Clear stored transports if unauthorized
//           setStoredTransports([]);
//         } else {
//           setError(data.message || 'Failed to load transport expenses');
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching transport expenses:', error);
//       setError('Network error. Please check if server is running.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter and sort transports based on selected filters
//   const filteredTransports = useMemo(() => {
//     let filtered = storedTransports;

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

//     // Already sorted in fetchStoredTransports, but ensure sorting here too
//     return [...filtered].sort((a, b) => {
//       const dateA = new Date(a.date);
//       const dateB = new Date(b.date);
//       return dateB.getTime() - dateA.getTime();
//     });
//   }, [storedTransports, filterDate, filterYear, filterMonth]);

//   // Generate PDF function
//   const generatePDF = () => {
//     if (filteredTransports.length === 0) {
//       setError("No transport expenses to download");
//       return;
//     }

//     try {
//       // Create new PDF document
//       const doc = new jsPDF();
      
//       // Title - Use "BDT" instead of the symbol for compatibility
//       const pageWidth = doc.internal.pageSize.getWidth();
//       doc.setFontSize(20);
//       doc.setTextColor(40);
//       doc.setFont("helvetica", "bold");
//       doc.text("Transport Expenses Report", pageWidth / 2, 20, { align: "center" });
      
//       // Company/Report Info
//       doc.setFontSize(11);
//       doc.setFont("helvetica", "normal");
//       doc.setTextColor(100);
//       doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
//       // Filter information
//       let filterInfo = "All Transport Expenses";
//       if (filterDate) {
//         filterInfo = `Date: ${new Date(filterDate).toLocaleDateString()}`;
//       } else if (filterYear !== "all" || filterMonth !== "all") {
//         filterInfo = `Filter: ${filterYear !== "all" ? `Year: ${filterYear}` : ""} ${filterMonth !== "all" ? `Month: ${monthNames[parseInt(filterMonth) - 1]}` : ""}`;
//       }
//       doc.text(`Report Type: ${filterInfo}`, 14, 36);
//       doc.text(`Total Records: ${filteredTransports.length}`, 14, 42);
      
//       // Prepare table data - Use "BDT" instead of ৳ symbol
//       const tableData = filteredTransports.map(expense => [
//         expense.transportName,
//         new Date(expense.date).toLocaleDateString(),
//         `BDT ${expense.cost.toFixed(2)}`, // Changed from currencySymbol
//         expense.paymentMethod,
//         expense.note || "-"
//       ]);
      
//       // Add table using autoTable
//       autoTable(doc, {
//         startY: 50,
//         head: [['Transport Name', 'Date', 'Cost (BDT)', 'Payment Method', 'Note']], // Changed header
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
//           0: { cellWidth: 40 },
//           1: { cellWidth: 30 },
//           2: { cellWidth: 30 },
//           3: { cellWidth: 35 },
//           4: { cellWidth: 40 }
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
//       const totalCost = calculateFilteredTotal();
//       const lastY = doc.lastAutoTable.finalY + 10;
      
//       // Add summary section - Use "BDT" instead of ৳ symbol
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor(40);
//       doc.text("SUMMARY", 14, lastY);
      
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       doc.text(`Total Transport Expenses: ${filteredTransports.length}`, 14, lastY + 8);
//       doc.text(`Total Cost: BDT ${totalCost.toFixed(2)}`, 14, lastY + 16); // Changed
      
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
//       const filterSuffix = isFilterActive ? '_filtered' : '';
//       const filename = `transport_expenses_${timestamp}${filterSuffix}.pdf`;
      
//       // Save the PDF
//       doc.save(filename);
      
//       // Show success message
//       setSuccess(`PDF downloaded successfully: ${filename}`);
      
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       setError('Failed to generate PDF. Please try again.');
//     }
//   };

//   const updateField = (id, field, value) => {
//     setTransports(prev =>
//       prev.map(item =>
//         item.id === id ? { ...item, [field]: value } : item
//       )
//     );
//   };

//   const addTransport = () => {
//     setTransports(prev => [
//       ...prev,
//       {
//         id: crypto.randomUUID(),
//         transportName: "",
//         cost: "",
//         date: "",
//         paymentMethod: "",
//         note: "",
//       },
//     ]);
//   };

//   const removeTransport = (id) => {
//     if (transports.length === 1) return;
//     setTransports(prev => prev.filter(item => item.id !== id));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError("");
//     setSuccess("");

//     // Filter out empty rows
//     const validTransports = transports.filter(
//       item => item.transportName.trim() && item.cost && item.date
//     );

//     if (validTransports.length === 0) {
//       setError("Please add at least one transport expense");
//       setSaving(false);
//       return;
//     }

//     try {
//       const headers = getAuthHeaders();

//       const response = await fetch('http://localhost:5004/api/transport-expenses', {
//         method: 'POST',
//         headers: headers,
//         body: JSON.stringify(validTransports),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setSuccess(`Successfully saved ${data.data.length} transport expense(s)`);
//         // Reset form
//         setTransports([{
//           id: crypto.randomUUID(),
//           transportName: "",
//           cost: "",
//           date: "",
//           paymentMethod: "",
//           note: "",
//         }]);
//         // Refresh stored expenses
//         fetchStoredTransports();
        
//         if (data.warnings && data.warnings.length > 0) {
//           console.warn('Warnings:', data.warnings);
//         }
//       } else {
//         // Check if it's an authentication error
//         if (response.status === 401 || response.status === 403) {
//           setError('Authentication failed. Please login to save transport expenses.');
//         } else {
//           setError(data.message || 'Failed to save transport expenses');
//         }
//       }
//     } catch (error) {
//       console.error('Error saving transport expenses:', error);
//       setError('Network error. Please check if server is running.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleEditTransport = (expense) => {
//     setEditingId(expense._id);
//     setEditForm({
//       transportName: expense.transportName,
//       date: new Date(expense.date).toISOString().split('T')[0],
//       cost: expense.cost.toString(),
//       paymentMethod: expense.paymentMethod,
//       note: expense.note || ""
//     });
//   };

//   const handleCancelEdit = () => {
//     setEditingId(null);
//     setEditForm({
//       transportName: "",
//       cost: "",
//       date: "",
//       paymentMethod: "",
//       note: ""
//     });
//   };

//   const handleUpdateTransport = async () => {
//     if (!editingId) return;

//     // Validation
//     if (!editForm.transportName.trim() || !editForm.cost || !editForm.date) {
//       setError("Please fill all required fields");
//       return;
//     }

//     setSaving(true);
//     setError("");
//     setSuccess("");

//     try {
//       const headers = getAuthHeaders();

//       const response = await fetch(`http://localhost:5004/api/transport-expenses/${editingId}`, {
//         method: 'PUT',
//         headers: headers,
//         body: JSON.stringify({
//           transportName: editForm.transportName,
//           date: editForm.date,
//           cost: parseFloat(editForm.cost),
//           paymentMethod: editForm.paymentMethod,
//           note: editForm.note
//         }),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setSuccess('Transport expense updated successfully');
//         // Refresh the list
//         fetchStoredTransports();
//         // Reset edit mode
//         setEditingId(null);
//         setEditForm({
//           transportName: "",
//           cost: "",
//           date: "",
//           paymentMethod: "",
//           note: ""
//         });
//       } else {
//         if (response.status === 401 || response.status === 403) {
//           setError('Authentication failed. Please login to update transport expenses.');
//         } else {
//           setError(data.message || 'Failed to update transport expense');
//         }
//       }
//     } catch (error) {
//       console.error('Error updating transport expense:', error);
//       setError('Failed to update transport expense');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDeleteTransport = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this transport expense?')) return;

//     try {
//       const headers = getAuthHeaders();

//       const response = await fetch(`http://localhost:5004/api/transport-expenses/${id}`, {
//         method: 'DELETE',
//         headers: headers
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setSuccess('Transport expense deleted successfully');
//         // Refresh the list
//         fetchStoredTransports();
//       } else {
//         if (response.status === 401 || response.status === 403) {
//           setError('Authentication failed. Please login to delete transport expenses.');
//         } else {
//           setError(data.message || 'Failed to delete transport expense');
//         }
//       }
//     } catch (error) {
//       console.error('Error deleting transport expense:', error);
//       setError('Failed to delete transport expense');
//     }
//   };

//   const getTodayDate = () => new Date().toISOString().split("T")[0];

//   // Format date for display
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   // Format currency in Bangladeshi Taka (৳)
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-BD', {
//       style: 'currency',
//       currency: 'BDT',
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount);
//   };

//   // Calculate total for filtered transports
//   const calculateFilteredTotal = () => {
//     return filteredTransports.reduce((total, expense) => total + expense.cost, 0);
//   };

//   // Calculate total for all transports
//   const calculateTotal = () => {
//     return storedTransports.reduce((total, expense) => total + expense.cost, 0);
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
//     return transports.reduce((total, expense) => {
//       const amount = parseFloat(expense.cost) || 0;
//       return total + amount;
//     }, 0);
//   };

//   // Check if user is authenticated
//   const isAuthenticated = () => {
//     const token = localStorage.getItem('auth_token') || 
//                   document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
//     return !!token;
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-3 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6 md:mb-8">
//           <h2 className="text-xl md:text-2xl font-semibold text-center text-gray-800">
//             Transport Expense Management
//           </h2>
//           <p className="text-sm md:text-base text-center text-gray-600 mt-2">
//             Track and manage all your transportation expenses
//           </p>
          
//           {/* Authentication Status */}
//           {!isAuthenticated() && (
//             <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
//               <p className="text-yellow-700 text-sm">
//                 ⚠️ <strong>Authentication Required:</strong> You need to login to save and manage transport expenses.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Form Section */}
//         <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Add New Transport Expenses</h3>
//             <button
//               onClick={addTransport}
//               className="md:hidden px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-sm"
//             >
//               + Add
//             </button>
//           </div>
          
//           {/* Messages */}
//           {error && !editingId && (
//             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
//               {error}
//             </div>
//           )}
//           {success && !editingId && (
//             <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
//               {success}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Header Row - Hidden on mobile, visible on tablet+ */}
//             <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-semibold text-gray-600 px-1">
//               <div className="col-span-3">Transportation Name</div>
//               <div className="col-span-2">Cost (৳)</div>
//               <div className="col-span-2">Date</div>
//               <div className="col-span-2">Payment Method</div>
//               <div className="col-span-2">Note (Optional)</div>
//               <div className="col-span-1 text-center">Action</div>
//             </div>

//             {transports.map((item) => (
//               <div
//                 key={item.id}
//                 className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-center p-3 md:p-0 md:border-0 border border-gray-200 rounded-md mb-3 md:mb-0"
//               >
//                 {/* Mobile View - Vertical Layout */}
//                 <div className="md:hidden space-y-3 w-full">
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Transportation Name *
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="e.g. Bus, Uber, Fuel"
//                         value={item.transportName}
//                         onChange={(e) =>
//                           updateField(item.id, "transportName", e.target.value)
//                         }
//                         className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Cost (৳) *
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="Cost in ৳"
//                         value={item.cost}
//                         onChange={(e) =>
//                           updateField(item.id, "cost", e.target.value)
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
//                         <option value="Cash">Cash</option>
//                         <option value="Bank Transfer">Bank Transfer</option>
//                         <option value="Mobile Banking">Mobile Banking</option>
//                         <option value="Card">Card</option>
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
                  
//                   {transports.length > 1 && (
//                     <div className="pt-2">
//                       <button
//                         type="button"
//                         onClick={() => removeTransport(item.id)}
//                         className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
//                       >
//                         Remove This Entry
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Desktop View - Grid Layout */}
//                 {/* Transportation Name */}
//                 <div className="hidden md:block col-span-3">
//                   <input
//                     type="text"
//                     placeholder="e.g. Bus, Uber, Fuel"
//                     value={item.transportName}
//                     onChange={(e) =>
//                       updateField(item.id, "transportName", e.target.value)
//                     }
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     required
//                   />
//                 </div>

//                 {/* Cost */}
//                 <div className="hidden md:block col-span-2">
//                   <input
//                     type="number"
//                     placeholder="Cost in ৳"
//                     value={item.cost}
//                     onChange={(e) =>
//                       updateField(item.id, "cost", e.target.value)
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
//                     <option value="Cash">Cash</option>
//                     <option value="Bank Transfer">Bank Transfer</option>
//                     <option value="Mobile Banking">Mobile Banking</option>
//                     <option value="Card">Card</option>
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
//                   {transports.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeTransport(item.id)}
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
//                 onClick={addTransport}
//                 className="hidden md:block w-full border border-dashed border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
//               >
//                 + Add More Transport
//               </button>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={saving || !isAuthenticated()}
//                 className={`w-full py-3 md:py-2 rounded-md transition-colors text-sm md:text-base ${
//                   saving
//                     ? 'bg-blue-400 cursor-not-allowed'
//                     : !isAuthenticated()
//                     ? 'bg-gray-400 cursor-not-allowed'
//                     : 'bg-blue-600 hover:bg-blue-700'
//                 } text-white`}
//               >
//                 {!isAuthenticated() ? (
//                   'Login Required to Save'
//                 ) : saving ? (
//                   <span className="flex items-center justify-center">
//                     <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 mr-2 text-white" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Saving...
//                   </span>
//                 ) : (
//                   'Save Transport Expenses'
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
//                 ✏️ Edit Transport Expense
//               </h3>
//               <button
//                 onClick={handleCancelEdit}
//                 className="text-gray-500 hover:text-gray-700 text-sm md:text-base"
//               >
//                 ✕ Close
//               </button>
//             </div>
            
//             {error && (
//               <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
//                 {error}
//               </div>
//             )}
//             {success && (
//               <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
//                 {success}
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-start">
//               {/* Transport Name */}
//               <div className="md:col-span-3">
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
//                   Transportation Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={editForm.transportName}
//                   onChange={(e) => setEditForm({...editForm, transportName: e.target.value})}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                   required
//                   placeholder="e.g., Bus, Uber, Fuel"
//                 />
//               </div>

//               {/* Cost */}
//               <div className="md:col-span-2 mt-3 md:mt-0">
//                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
//                   Cost (৳) *
//                 </label>
//                 <input
//                   type="number"
//                   value={editForm.cost}
//                   onChange={(e) => setEditForm({...editForm, cost: e.target.value})}
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
//                   <option value="Cash">Cash</option>
//                   <option value="Bank Transfer">Bank Transfer</option>
//                   <option value="Mobile Banking">Mobile Banking</option>
//                   <option value="Card">Card</option>
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
//                   onClick={handleUpdateTransport}
//                   disabled={saving || !isAuthenticated()}
//                   className={`flex-1 py-3 md:py-2 rounded-md transition-colors text-sm md:text-base ${
//                     saving
//                       ? 'bg-blue-400 cursor-not-allowed'
//                       : !isAuthenticated()
//                       ? 'bg-gray-400 cursor-not-allowed'
//                       : 'bg-blue-600 hover:bg-blue-700'
//                   } text-white`}
//                 >
//                   {!isAuthenticated() ? (
//                     'Login Required'
//                   ) : saving ? (
//                     <span className="flex items-center justify-center">
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

//         {/* Stored Transport Expenses Table Section */}
//         <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
//           <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
//             <div>
//               <h3 className="text-lg font-semibold">Stored Transport Expenses</h3>
//               <div className="mt-1 text-sm text-gray-600">
//                 {isFilterActive ? (
//                   <span>
//                     Showing {filteredTransports.length} of {storedTransports.length} expense(s)
//                   </span>
//                 ) : (
//                   <span>Total: {storedTransports.length} expense(s)</span>
//                 )}
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               {/* PDF Download Button */}
//               {filteredTransports.length > 0 && (
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
//                 onClick={fetchStoredTransports}
//                 disabled={loading}
//                 className="px-3 md:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-sm md:text-base"
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
//                   Showing {filteredTransports.length} of {storedTransports.length} record(s)
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
//                   Showing {filteredTransports.length} of {storedTransports.length}
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
//               <p className="mt-2 text-gray-600 text-sm md:text-base">Loading transport expenses...</p>
//             </div>
//           ) : !isAuthenticated() ? (
//             <div className="text-center py-8 text-gray-500 text-sm md:text-base">
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
//                 <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
//                 </svg>
//                 <h4 className="text-lg font-semibold text-yellow-700 mb-2">Authentication Required</h4>
//                 <p className="text-yellow-600 mb-4">Please login to view transport expenses.</p>
//                 <button
//                   onClick={() => window.location.href = '/login'} // Adjust login route as needed
//                   className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
//                 >
//                   Go to Login
//                 </button>
//               </div>
//             </div>
//           ) : filteredTransports.length === 0 ? (
//             <div className="text-center py-8 text-gray-500 text-sm md:text-base">
//               {isFilterActive ? (
//                 <div>
//                   <p>No transport expenses found for the selected filters.</p>
//                   <button
//                     onClick={resetFilters}
//                     className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                   >
//                     Reset Filters
//                   </button>
//                 </div>
//               ) : (
//                 "No transport expenses stored yet. Add some using the form above."
//               )}
//             </div>
//           ) : (
//             <>
//               {/* Mobile Card View */}
//               <div className="md:hidden space-y-4">
//                 {filteredTransports.map((expense, index) => (
//                   <div key={expense._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                     <div className="flex justify-between items-start mb-3">
//                       <div>
//                         <h4 className="font-medium text-gray-900">{expense.transportName}</h4>
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
//                         <div className="font-bold text-green-700">{formatCurrency(expense.cost)}</div>
//                         <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
//                           {expense.paymentMethod}
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
//                         onClick={() => handleEditTransport(expense)}
//                         disabled={!isAuthenticated()}
//                         className={`flex-1 py-2 rounded-md transition-colors text-sm flex items-center justify-center ${
//                           !isAuthenticated()
//                             ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                             : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
//                         }`}
//                       >
//                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
//                         </svg>
//                         {!isAuthenticated() ? 'Login to Edit' : 'Edit'}
//                       </button>
//                       <button
//                         onClick={() => handleDeleteTransport(expense._id)}
//                         disabled={!isAuthenticated()}
//                         className={`flex-1 py-2 rounded-md transition-colors text-sm flex items-center justify-center ${
//                           !isAuthenticated()
//                             ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                             : 'bg-red-50 text-red-600 hover:bg-red-100'
//                         }`}
//                       >
//                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
//                         </svg>
//                         {!isAuthenticated() ? 'Login to Delete' : 'Delete'}
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
//                     {filteredTransports.length} expense(s)
//                   </div>
//                 </div>
//               </div>

//               {/* Desktop Table View */}
//               <div className="hidden md:block overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Transport Name
//                       </th>
//                       <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Cost (৳)
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
//                     {filteredTransports.map((expense, index) => (
//                       <tr key={expense._id} className="hover:bg-gray-50">
//                         <td className="px-4 md:px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">
//                             {expense.transportName}
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
//                           {index === filteredTransports.length - 1 && filteredTransports.length > 1 && (
//                             <div className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
//                               Oldest
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-4 md:px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900 font-medium">
//                             {formatCurrency(expense.cost)}
//                           </div>
//                         </td>
//                         <td className="px-4 md:px-6 py-4 whitespace-nowrap">
//                           <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
//                             {expense.paymentMethod}
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
//                               onClick={() => handleEditTransport(expense)}
//                               disabled={!isAuthenticated()}
//                               className={`text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 rounded flex items-center ${
//                                 !isAuthenticated()
//                                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                   : 'bg-blue-50 hover:bg-blue-100'
//                               }`}
//                             >
//                               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
//                               </svg>
//                               {!isAuthenticated() ? 'Login to Edit' : 'Edit'}
//                             </button>
//                             <button
//                               onClick={() => handleDeleteTransport(expense._id)}
//                               disabled={!isAuthenticated()}
//                               className={`text-red-600 hover:text-red-900 transition-colors px-3 py-1 rounded flex items-center ${
//                                 !isAuthenticated()
//                                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                   : 'bg-red-50 hover:bg-red-100'
//                               }`}
//                             >
//                               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
//                               </svg>
//                               {!isAuthenticated() ? 'Login to Delete' : 'Delete'}
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
//                         {filteredTransports.length} expense(s)
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
//                   <p className="text-xl md:text-2xl font-bold text-blue-700">{filteredTransports.length}</p>
//                 </div>
//                 <div className="bg-green-50 p-3 md:p-4 rounded-lg">
//                   <h4 className="text-xs md:text-sm font-medium text-green-900">
//                     {isFilterActive ? "Filtered Cost" : "Total Cost"}
//                   </h4>
//                   <p className="text-xl md:text-2xl font-bold text-green-700">{formatCurrency(calculateFilteredTotal())}</p>
//                 </div>
//                 <div className="bg-yellow-50 p-3 md:p-4 rounded-lg">
//                   <h4 className="text-xs md:text-sm font-medium text-yellow-900">Transport Types</h4>
//                   <p className="text-xl md:text-2xl font-bold text-yellow-700">
//                     {[...new Set(filteredTransports.map(expense => expense.transportName))].length}
//                   </p>
//                 </div>
//               </div>

//               {/* Transport Type Breakdown */}
//               {filteredTransports.length > 0 && (
//                 <div className="mt-6 md:mt-8">
//                   <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
//                     {isFilterActive ? "Filtered Transport Type Breakdown" : "Transport Type Breakdown"}
//                   </h4>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
//                     {Object.entries(
//                       filteredTransports.reduce((acc, expense) => {
//                         acc[expense.transportName] = (acc[expense.transportName] || 0) + expense.cost;
//                         return acc;
//                       }, {})
//                     ).map(([transportName, totalCost]) => (
//                       <div key={transportName} className="bg-gray-50 p-3 md:p-4 rounded-lg">
//                         <div className="flex justify-between items-center">
//                           <span className="text-xs md:text-sm font-medium text-gray-700 truncate mr-2">{transportName}</span>
//                           <span className="text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(totalCost)}</span>
//                         </div>
//                         <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
//                           <div 
//                             className="bg-blue-600 h-2 rounded-full" 
//                             style={{ 
//                               width: `${(totalCost / calculateFilteredTotal()) * 100}%` 
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
  CalendarDays,
  User,
  Shield,
  Info
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
  itemType = "food cost", 
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

export default function FoodCost() {
  const router = useRouter();
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Toast state
  const [toast, setToast] = useState(null);
  const [permissionToast, setPermissionToast] = useState(null);
  
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
      showToast('Please login to access the food cost management system', 'error');
      setTimeout(() => router.push('/'), 2000);
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
      showToast(`Welcome back, ${parsedUser.name}!`, 'success');
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
          showToast('Session expired. Please login again.', 'error');
          setTimeout(() => router.push('/'), 2000);
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
        // showToast(`Loaded ${sortedCosts.length} food cost records`, 'success');
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
      showToast("No food cost records to download for the selected filters", "warning");
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
      showToast(`PDF report downloaded successfully!`, "success");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast(`Failed to generate PDF: ${error.message}`, 'error');
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
    // Check edit permission
    if (!checkPermission('edit')) {
      showPermissionToast('edit food cost records', 'user');
      return;
    }

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
            `Food cost for ${new Date(value).toLocaleDateString()} already exists. Please edit the existing record instead.`,
            'warning'
          );
        }
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check create permission
    if (!checkPermission('create')) {
      showPermissionToast('create food cost records', 'user');
      return;
    }

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
          throw new Error(`Cannot update: A food cost record for ${dateStr} already exists.`);
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
        if (editingId) {
          showToast(`✅ Food cost record updated successfully!`, 'success');
        } else {
          showToast(`✅ New food cost record saved successfully!`, 'success');
        }
        
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
    showToast('Edit mode cancelled', 'info');
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
    // Check delete permission
    if (!checkPermission('delete')) {
      showPermissionToast('delete food cost records', 'moderator');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/food-costs/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        showToast(`✅ Food cost record deleted successfully!`, 'success');
        if (editingId === id) {
          cancelEdit();
        }
        fetchFoodCosts();
      } else {
        showToast(`❌ ${data.message || data.error}`, 'error');
      }
    } catch (error) {
      showToast(`❌ Failed to delete food cost record: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
    setFilterMonth("all");
    showToast(`Filtered by year: ${e.target.value === "all" ? "All Years" : e.target.value}`, 'info');
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
    const monthName = e.target.value === "all" ? "All Months" : monthNames[parseInt(e.target.value) - 1];
    showToast(`Filtered by month: ${monthName}`, 'info');
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterYear("all");
    setFilterMonth("all");
    showToast('All filters reset', 'info');
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Food Cost Management
          </h1>
          <p className="text-gray-600 mt-2">Track and manage daily food expenses</p>
        </div>

        {/* User Info Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-800 font-medium">{user.name}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Role: <span className="font-medium capitalize ml-1">{user.role}</span>
                </p>
              </div>
            </div>
            <div className="text-sm text-green-700">
              <span className="px-2 py-1 bg-green-200 rounded-full flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Food Cost Management
              </span>
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
                    <FileText className="w-6 h-6 mr-2 text-green-600" />
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
                  <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
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
                  <FileText className="w-16 h-16 mx-auto" />
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
                            <TrendingUp className="w-4 h-4 mr-1" />
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
                                <TrendingUp className="w-4 h-4 mr-2" />
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
                                  disabled={!checkPermission('edit')}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(cost)}
                                  className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!checkPermission('delete')}
                                  title={!checkPermission('delete') ? "Requires moderator or admin role" : ""}
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
                      <TrendingUp className="w-5 h-5 mr-2" />
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
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
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