


// 'use client';

// import React, { useState, useEffect, useMemo } from "react";
// import { useRouter } from 'next/navigation';
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export default function OfficeRent() {
//   const router = useRouter();
  
//   // Authentication state
//   const [user, setUser] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);
  
//   const [formData, setFormData] = useState({
//     date: "",
//     rent: "",
//     paymentMethod: "cash",
//     note: ""
//   });

//   const [rents, setRents] = useState([]);
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

//   // Payment methods
//   const paymentMethods = [
//     "cash", "bank_transfer", "credit_card", "debit_card", "online", "other"
//   ];

//   // Check authentication on mount
//   useEffect(() => {
//     checkAuthentication();
//   }, []);

//   // Fetch office rents after authentication
//   useEffect(() => {
//     if (user && !authLoading) {
//       fetchOfficeRents();
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
      
//       // Check if user has permission (admin or moderator)
//       if (!['admin', 'moderator'].includes(parsedUser.role)) {
//         setMessage({ 
//           type: 'error', 
//           text: 'Access denied. You do not have permission to manage office rents.' 
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

//   // Update years and months when rents change
//   useEffect(() => {
//     if (rents.length > 0) {
//       const uniqueYears = Array.from(
//         new Set(
//           rents.map(rent => {
//             const date = new Date(rent.date);
//             return date.getFullYear();
//           })
//         )
//       ).sort((a, b) => b - a);

//       setYears(uniqueYears);

//       if (filterYear !== "all") {
//         const yearRents = rents.filter(rent => {
//           const date = new Date(rent.date);
//           return date.getFullYear().toString() === filterYear;
//         });

//         const uniqueMonths = Array.from(
//           new Set(
//             yearRents.map(rent => {
//               const date = new Date(rent.date);
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
//   }, [rents, filterYear]);

//   // Fetch all office rents and sort by date descending
//   const fetchOfficeRents = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_URL}/office-rents`, {
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
//         const sortedRents = [...data.data].sort((a, b) => {
//           const dateA = new Date(a.date);
//           const dateB = new Date(b.date);
//           return dateB.getTime() - dateA.getTime();
//         });
        
//         setRents(sortedRents);
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: data.error || 'Failed to load office rents' 
//         });
//       }
//     } catch (error) {
//       setMessage({ 
//         type: 'error', 
//         text: `Error: ${error.message}` 
//       });
//       console.error("Error fetching office rents:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Generate PDF report
//   const generatePDF = () => {
//     if (filteredRents.length === 0) {
//       setMessage({ 
//         type: 'error', 
//         text: "No rent records to download for the selected filters" 
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
//       doc.text("Office Rent Report", pageWidth / 2, 20, { align: "center" });
      
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
//       doc.text(`Total Records: ${filteredRents.length}`, 14, 42);
      
//       // Add user info
//       if (user) {
//         doc.text(`Generated by: ${user.name} (${user.role})`, 14, 48);
//       }
      
//       // Prepare table data
//       const tableData = filteredRents.map(rent => {
//         const rentDate = new Date(rent.date);
//         const paymentMethod = rent.paymentMethod || 'cash';
//         const note = rent.note || '-';
        
//         return [
//           rentDate.toLocaleDateString(),
//           `BDT ${rent.rent.toFixed(2)}`,
//           paymentMethod.replace('_', ' ').toUpperCase(),
//           note,
//           `${monthNames[rentDate.getMonth()]} ${rentDate.getFullYear()}`
//         ];
//       });
      
//       // Add table using autoTable
//       autoTable(doc, {
//         startY: user ? 55 : 50,
//         head: [['Date', 'Amount (BDT)', 'Payment Method', 'Note', 'Month-Year']],
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
//           0: { cellWidth: 25 },
//           1: { cellWidth: 25 },
//           2: { cellWidth: 30 },
//           3: { cellWidth: 50 },
//           4: { cellWidth: 30 }
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
//       doc.text(`Total Records: ${filteredRents.length}`, 14, lastY + 8);
//       doc.text(`Total Amount: BDT ${totalAmount.toFixed(2)}`, 14, lastY + 16);
      
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
//       const filename = `office_rent_${timestamp}${filterSuffix}.pdf`;
      
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
//         text: `Failed to generate PDF: ${error.message}. Please make sure all rent records have valid data.` 
//       });
//     }
//   };

//   // Function to check for duplicate month-year entries
//   const checkForDuplicateMonthYear = (selectedDate, currentEditingId = null) => {
//     if (!selectedDate) return false;
    
//     const inputDate = new Date(selectedDate);
//     const inputYear = inputDate.getFullYear();
//     const inputMonth = inputDate.getMonth();
    
//     // Filter out the current record being edited
//     const filteredRents = currentEditingId 
//       ? rents.filter(rent => rent._id !== currentEditingId)
//       : rents;
    
//     const isDuplicate = filteredRents.some(rent => {
//       const rentDate = new Date(rent.date);
//       const rentYear = rentDate.getFullYear();
//       const rentMonth = rentDate.getMonth();
      
//       return rentYear === inputYear && rentMonth === inputMonth;
//     });
    
//     return isDuplicate;
//   };

//   // Fetch single rent for editing
//   const fetchRentForEdit = async (id) => {
//     try {
//       setLoading(true);
//       setMessage({ type: '', text: '' });
      
//       const response = await fetch(`${API_URL}/office-rents/${id}`, {
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
//         const rent = data.data;
//         setFormData({
//           date: rent.date.split('T')[0],
//           rent: rent.rent.toString(),
//           paymentMethod: rent.paymentMethod || "cash",
//           note: rent.note || ""
//         });
//         setEditingId(id);
//         setMessage({ 
//           type: 'info', 
//           text: `Editing rent record from ${new Date(rent.date).toLocaleDateString()}` 
//         });
        
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: data.message || 'Failed to load rent data' 
//         });
//       }
//     } catch (error) {
//       setMessage({ 
//         type: 'error', 
//         text: `Failed to load rent record: ${error.message}` 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     // Clear duplicate warning when date changes
//     if (name === 'date') {
//       if (message.text.includes('already exists') || message.text.includes('duplicate')) {
//         setMessage({ type: '', text: '' });
//       }
      
//       // Check for duplicate when editing
//       if (editingId && value) {
//         const isDuplicate = checkForDuplicateMonthYear(value, editingId);
//         if (isDuplicate) {
//           const inputDate = new Date(value);
//           const monthName = monthNames[inputDate.getMonth()];
//           const year = inputDate.getFullYear();
//           setMessage({ 
//             type: 'error', 
//             text: `❌ Cannot edit: A rent record for ${monthName} ${year} already exists. Please choose a different date.` 
//           });
//         }
//       }
//     }
    
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       if (!formData.date) {
//         throw new Error("Please select a date");
//       }

//       // Check for duplicate month-year
//       const isDuplicate = checkForDuplicateMonthYear(formData.date, editingId);
      
//       if (isDuplicate) {
//         const inputDate = new Date(formData.date);
//         const monthName = monthNames[inputDate.getMonth()];
//         const year = inputDate.getFullYear();
        
//         if (editingId) {
//           throw new Error(`Cannot update: A rent record for ${monthName} ${year} already exists. Please keep the original date or choose a different one.`);
//         } else {
//           throw new Error(`A rent record for ${monthName} ${year} already exists. Please edit the existing record instead.`);
//         }
//       }

//       const url = editingId 
//         ? `${API_URL}/office-rents/${editingId}`
//         : `${API_URL}/office-rents`;
      
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
//           text: `✅ Office rent ${actionText} successfully!` 
//         });
        
//         setFormData({
//           date: "",
//           rent: "",
//           paymentMethod: "cash",
//           note: ""
//         });
        
//         setEditingId(null);
        
//         fetchOfficeRents();
        
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
//       rent: "",
//       paymentMethod: "cash",
//       note: ""
//     });
//     setEditingId(null);
//     setMessage({ type: '', text: '' });
//   };

//   // Delete rent record
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this rent record?")) {
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/office-rents/${id}`, {
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
//         fetchOfficeRents();
//       } else {
//         setMessage({ 
//           type: 'error', 
//           text: `❌ ${data.message || data.error}` 
//         });
//       }
//     } catch (error) {
//       setMessage({ 
//         type: 'error', 
//         text: `❌ Failed to delete rent record: ${error.message}` 
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

//   // Filter rents based on selected year and month and sort by date descending
//   const filteredRents = useMemo(() => {
//     const filtered = rents.filter(rent => {
//       const date = new Date(rent.date);
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
//   }, [rents, filterYear, filterMonth]);

//   // Calculate total for filtered rents
//   const calculateFilteredTotal = () => {
//     return filteredRents.reduce((total, rent) => total + rent.rent, 0);
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

//   // Format payment method for display
//   const formatPaymentMethod = (method) => {
//     return method
//       .split('_')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//   };

//   // Get existing month-year for warning
//   const getExistingMonthsWarning = () => {
//     if (rents.length === 0) return null;
    
//     const selectedDate = new Date(formData.date);
//     if (isNaN(selectedDate.getTime())) return null;
    
//     const selectedYear = selectedDate.getFullYear();
//     const selectedMonth = selectedDate.getMonth();
    
//     const existingMonths = rents
//       .map(rent => {
//         const rentDate = new Date(rent.date);
//         return {
//           year: rentDate.getFullYear(),
//           month: rentDate.getMonth(),
//           monthName: monthNames[rentDate.getMonth()],
//           id: rent._id
//         };
//       })
//       .filter(item => 
//         item.year === selectedYear && item.month === selectedMonth
//       );
    
//     return existingMonths.length > 0 ? existingMonths[0] : null;
//   };

//   // Check if date has duplicate warning for new entries
//   const existingMonthWarning = !editingId ? getExistingMonthsWarning() : null;

//   // Check if editing date causes duplicate
//   const editingDuplicateWarning = editingId ? (() => {
//     if (!formData.date) return null;
    
//     const selectedDate = new Date(formData.date);
//     if (isNaN(selectedDate.getTime())) return null;
    
//     const selectedYear = selectedDate.getFullYear();
//     const selectedMonth = selectedDate.getMonth();
    
//     // Find the original record being edited
//     const originalRecord = rents.find(rent => rent._id === editingId);
//     if (!originalRecord) return null;
    
//     const originalDate = new Date(originalRecord.date);
//     const originalYear = originalDate.getFullYear();
//     const originalMonth = originalDate.getMonth();
    
//     // Check if date has changed
//     const dateChanged = selectedYear !== originalYear || selectedMonth !== originalMonth;
    
//     if (!dateChanged) return null;
    
//     // Check for duplicates excluding current record
//     const isDuplicate = rents.some(rent => {
//       if (rent._id === editingId) return false;
      
//       const rentDate = new Date(rent.date);
//       const rentYear = rentDate.getFullYear();
//       const rentMonth = rentDate.getMonth();
      
//       return rentYear === selectedYear && rentMonth === selectedMonth;
//     });
    
//     return isDuplicate ? {
//       monthName: monthNames[selectedMonth],
//       year: selectedYear
//     } : null;
//   })() : null;

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
//     <div className="max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
//         Office Rent Management
//       </h1>

//       {message.text && (
//         <div className={`mb-6 p-4 rounded-lg ${
//           message.type === 'error' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' :
//           message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' :
//           'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
//         }`}>
//           <div className="flex items-center">
//             <span className="mr-2">
//               {message.type === 'error' ? '❌' :
//                message.type === 'success' ? '✅' : 'ℹ️'}
//             </span>
//             <span>{message.text}</span>
//           </div>
//         </div>
//       )}

//       {/* User Info Banner */}
//       <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-blue-600">Logged in as: <span className="font-semibold">{user.name}</span></p>
//             <p className="text-xs text-blue-500">Role: <span className="font-medium capitalize">{user.role}</span></p>
//           </div>
//           <div className="text-sm text-blue-700">
//             <span className="px-2 py-1 bg-blue-100 rounded-full">Office Rent Management</span>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-8">
//         {/* Left: Rent Form */}
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-gray-800">
//               {editingId ? 'Edit Rent Record' : 'Add New Rent'}
//             </h2>
//             {editingId && (
//               <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
//                 Editing Mode
//               </span>
//             )}
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Date */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Rent Date *
//               </label>
//               <input
//                 type="date"
//                 name="date"
//                 value={formData.date}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                   (existingMonthWarning && !editingId) || (editingDuplicateWarning && editingId)
//                     ? 'border-red-500 bg-red-50' 
//                     : 'border-gray-300'
//                 }`}
//                 required
//                 disabled={loading}
//               />
              
//               {/* Warning for new entries */}
//               {existingMonthWarning && !editingId && (
//                 <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
//                   ⚠️ <strong>Warning:</strong> A rent record for {existingMonthWarning.monthName} {existingMonthWarning.year} already exists. 
//                   <span> Please edit the existing record instead.</span>
//                 </div>
//               )}
              
//               {/* Warning for editing duplicates */}
//               {editingDuplicateWarning && editingId && (
//                 <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
//                   ⚠️ <strong>Cannot Update:</strong> A rent record for {editingDuplicateWarning.monthName} {editingDuplicateWarning.year} already exists. 
//                   <span> Please keep the original date or choose a different one.</span>
//                 </div>
//               )}
              
//               <p className="text-xs text-gray-500 mt-1">
//                 Only one rent record per month is allowed
//               </p>
//             </div>

//             {/* Rent Amount */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Rent Amount (BDT) *
//               </label>
//               <input
//                 type="number"
//                 name="rent"
//                 placeholder="Enter rent amount in BDT"
//                 value={formData.rent}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 required
//                 min="0"
//                 step="0.01"
//                 disabled={loading}
//               />
//             </div>

//             {/* Payment Method */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Payment Method
//               </label>
//               <select
//                 name="paymentMethod"
//                 value={formData.paymentMethod}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 disabled={loading}
//               >
//                 {paymentMethods.map(method => (
//                   <option key={method} value={method}>
//                     {formatPaymentMethod(method)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Note */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Note (Optional)
//               </label>
//               <textarea
//                 name="note"
//                 placeholder="Add any additional notes about this rent payment (e.g., transaction ID, reference number, payment details)"
//                 value={formData.note}
//                 onChange={handleChange}
//                 rows="3"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 disabled={loading}
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Optional: Add reference number, transaction ID, or any other details
//               </p>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex space-x-4">
//               <button
//                 type="submit"
//                 disabled={loading || 
//                   (existingMonthWarning && !editingId) || 
//                   (editingDuplicateWarning && editingId)
//                 }
//                 className={`flex-1 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
//                   editingId ? 'bg-green-600 hover:bg-green-700 text-white' : 
//                   (existingMonthWarning && !editingId) || (editingDuplicateWarning && editingId) 
//                     ? 'bg-gray-400 cursor-not-allowed' : 
//                   'bg-blue-600 hover:bg-blue-700 text-white'
//                 }`}
//               >
//                 {loading ? (
//                   <>
//                     <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     {editingId ? 'Updating...' : 'Saving...'}
//                   </>
//                 ) : (
//                   (existingMonthWarning && !editingId) 
//                     ? 'Duplicate Month - Edit Existing' 
//                     : (editingDuplicateWarning && editingId)
//                       ? 'Duplicate - Cannot Update'
//                       : editingId 
//                         ? 'Update Rent Record' 
//                         : 'Save Rent to Database'
//                 )}
//               </button>
              
//               {editingId && (
//                 <button
//                   type="button"
//                   onClick={cancelEdit}
//                   disabled={loading}
//                   className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </form>
//         </div>

//         {/* Right: Rent Records */}
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-gray-800">
//               {filterYear !== "all" || filterMonth !== "all" ? 'Filtered Rent Records' : 'All Rent Records'}
//               <span className="text-lg font-normal text-gray-600 ml-2">
//                 ({filteredRents.length} records)
//               </span>
//             </h2>
//             <div className="flex items-center space-x-2">
//               {/* PDF Download Button */}
//               {filteredRents.length > 0 && (
//                 <button
//                   onClick={generatePDF}
//                   className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center"
//                   title="Download PDF Report"
//                 >
//                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                   </svg>
//                   Download PDF
//                 </button>
//               )}
              
//               <button
//                 onClick={fetchOfficeRents}
//                 disabled={loading}
//                 className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
//               >
//                 Refresh
//               </button>
//             </div>
//           </div>

//           {/* Sort Indicator */}
//           <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
//             <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
//             </svg>
//             <p className="text-sm text-blue-800">
//               <strong>Sorted by:</strong> Date (Newest to Oldest)
//             </p>
//           </div>

//           {/* Filter Section */}
//           <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//             <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//               <div className="flex flex-wrap gap-4">
//                 {/* Year Filter */}
//                 <div>
//                   <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">
//                     Year
//                   </label>
//                   <select
//                     id="yearFilter"
//                     value={filterYear}
//                     onChange={handleYearChange}
//                     className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   >
//                     <option value="all">All Years</option>
//                     {years.map(year => (
//                       <option key={year} value={year}>{year}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Month Filter */}
//                 <div>
//                   <label htmlFor="monthFilter" className="block text-sm font-medium text-gray-700 mb-1">
//                     Month
//                   </label>
//                   <select
//                     id="monthFilter"
//                     value={filterMonth}
//                     onChange={handleMonthChange}
//                     disabled={filterYear === "all"}
//                     className={`w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
//                       filterYear === "all" ? 'bg-gray-100 cursor-not-allowed' : ''
//                     }`}
//                   >
//                     <option value="all">All Months</option>
//                     {months.map(month => (
//                       <option key={month} value={month}>
//                         {monthNames[month - 1]}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Active Filters Display */}
//                 {(filterYear !== "all" || filterMonth !== "all") && (
//                   <div className="flex items-center space-x-2">
//                     <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
//                       <span className="text-sm text-blue-700">
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
//                 {(filterYear !== "all" || filterMonth !== "all") && (
//                   <div className="flex items-end">
//                     <button
//                       onClick={resetFilters}
//                       className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
//                     >
//                       Reset Filters
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Results Count */}
//               <div className="ml-auto text-right">
//                 <span className="text-sm text-gray-600">
//                   Showing {filteredRents.length} of {rents.length} record(s)
//                 </span>
//                 {filterYear !== "all" || filterMonth !== "all" ? (
//                   <div className="text-sm font-medium text-green-600 mt-1">
//                     Filtered Total: {formatCurrency(calculateFilteredTotal())}
//                   </div>
//                 ) : null}
//               </div>
//             </div>
//           </div>

//           {/* Duplicate Warning Notice */}
//           {existingMonthWarning && !editingId && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//               <div className="flex items-center">
//                 <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//                 <p className="text-sm text-red-800">
//                   <strong>Duplicate Month Detected:</strong> You cannot add another rent record for {existingMonthWarning.monthName} {existingMonthWarning.year}. 
//                   Please edit the existing record below or choose a different date.
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Edit Duplicate Warning Notice */}
//           {editingDuplicateWarning && editingId && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//               <div className="flex items-center">
//                 <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//                 <p className="text-sm text-red-800">
//                   <strong>Cannot Update:</strong> Changing date to {editingDuplicateWarning.monthName} {editingDuplicateWarning.year} would create a duplicate. 
//                   Please keep the original date or choose a different one.
//                 </p>
//               </div>
//             </div>
//           )}

//           {loading ? (
//             <div className="text-center py-8">
//               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//               <p className="mt-2 text-gray-600">Loading rent records...</p>
//             </div>
//           ) : filteredRents.length === 0 ? (
//             <div className="text-center py-8">
//               <div className="text-gray-400 mb-4">
//                 <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
//                 </svg>
//               </div>
//               <h3 className="text-lg font-medium text-gray-700 mb-2">
//                 {filterYear === "all" && filterMonth === "all" 
//                   ? "No rent records yet"
//                   : "No rent records found for the selected filters"
//                 }
//               </h3>
//               <p className="text-gray-500">
//                 {filterYear === "all" && filterMonth === "all" 
//                   ? "Add your first rent record using the form!"
//                   : "Try changing your filter criteria."
//                 }
//               </p>
//               {(filterYear !== "all" || filterMonth !== "all") && (
//                 <button
//                   onClick={resetFilters}
//                   className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                 >
//                   Reset Filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date
//                         <div className="text-xs font-normal text-gray-400 mt-1">Month-Year</div>
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Amount (BDT)
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Payment Method
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Note
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Created
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredRents.map((rent, index) => {
//                       const rentDate = new Date(rent.date);
//                       const monthYear = `${monthNames[rentDate.getMonth()]} ${rentDate.getFullYear()}`;
                      
//                       return (
//                         <tr key={rent._id} className={`hover:bg-gray-50 ${editingId === rent._id ? 'bg-blue-50' : ''}`}>
//                           <td className="px-4 py-3">
//                             <div className="font-medium text-gray-900">
//                               {formatDate(rent.date)}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               {monthYear}
//                             </div>
//                             {index === 0 && (
//                               <div className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
//                                 Newest
//                               </div>
//                             )}
//                             {index === filteredRents.length - 1 && filteredRents.length > 1 && (
//                               <div className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
//                                 Oldest
//                               </div>
//                             )}
//                           </td>
//                           <td className="px-4 py-3">
//                             <div className="font-medium text-gray-900">
//                               {formatCurrency(rent.rent)}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3">
//                             <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                               rent.paymentMethod === 'cash' ? 'bg-yellow-100 text-yellow-800' :
//                               rent.paymentMethod === 'bank_transfer' ? 'bg-blue-100 text-blue-800' :
//                               rent.paymentMethod === 'credit_card' ? 'bg-purple-100 text-purple-800' :
//                               rent.paymentMethod === 'debit_card' ? 'bg-indigo-100 text-indigo-800' :
//                               rent.paymentMethod === 'online' ? 'bg-teal-100 text-teal-800' :
//                               'bg-gray-100 text-gray-800'
//                             }`}>
//                               {formatPaymentMethod(rent.paymentMethod || 'cash')}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3">
//                             <div className="text-sm text-gray-600 max-w-xs truncate" title={rent.note}>
//                               {rent.note || "-"}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3">
//                             <div className="text-sm text-gray-500">
//                               {formatDate(rent.createdAt)}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3">
//                             <div className="flex space-x-2">
//                               <button
//                                 onClick={() => fetchRentForEdit(rent._id)}
//                                 className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
//                               >
//                                 Edit
//                               </button>
//                               <button
//                                 onClick={() => handleDelete(rent._id)}
//                                 className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
//                               >
//                                 Delete
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                   {/* Table Footer with Total */}
//                   <tfoot className="bg-gray-50">
//                     <tr>
//                       <td className="px-4 py-3 text-sm font-semibold text-gray-900">
//                         Filtered Total
//                         {(filterYear !== "all" || filterMonth !== "all") && (
//                           <div className="text-xs font-normal text-gray-500 mt-1">
//                             {filterYear !== "all" && `Year: ${filterYear}`}
//                             {filterYear !== "all" && filterMonth !== "all" && " • "}
//                             {filterMonth !== "all" && `Month: ${monthNames[parseInt(filterMonth) - 1]}`}
//                           </div>
//                         )}
//                         <div className="text-xs font-normal text-blue-500 mt-1">
//                           Sorted: Newest to Oldest
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="font-bold text-gray-900">
//                           {formatCurrency(calculateFilteredTotal())}
//                         </div>
//                       </td>
//                       <td colSpan="4" className="px-4 py-3 text-sm text-gray-500">
//                         {filteredRents.length} record(s)
//                         {filteredRents.length > 0 && (
//                           <div className="text-xs text-gray-400 mt-1">
//                             Showing {Math.min(filteredRents.length, 10)} of {filteredRents.length} records
//                           </div>
//                         )}
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>

//               {/* Summary Stats */}
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-1 gap-4">
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <h4 className="text-sm font-medium text-blue-900">
//                     {filterYear !== "all" || filterMonth !== "all" ? "Filtered Total" : "Total Amount"}
//                   </h4>
//                   <p className="text-2xl font-bold text-blue-700">
//                     {formatCurrency(calculateFilteredTotal())}
//                   </p>
//                 </div>
//               </div>
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
          <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function OfficeRent() {
  const router = useRouter();
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Toast state
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    date: "",
    rent: "",
    paymentMethod: "cash",
    note: ""
  });

  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
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

  // Payment methods
  const paymentMethods = [
    "cash", "bank_transfer", "credit_card", "debit_card", "online", "other"
  ];

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

  // Fetch office rents after authentication
  useEffect(() => {
    if (user && !authLoading) {
      fetchOfficeRents();
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
      
      // Check if user has permission (admin or moderator)
      if (!['admin', 'moderator'].includes(parsedUser.role)) {
        setMessage({ 
          type: 'error', 
          text: 'Access denied. You do not have permission to manage office rents.' 
        });
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

  // Update years and months when rents change
  useEffect(() => {
    if (rents.length > 0) {
      const uniqueYears = Array.from(
        new Set(
          rents.map(rent => {
            const date = new Date(rent.date);
            return date.getFullYear();
          })
        )
      ).sort((a, b) => b - a);

      setYears(uniqueYears);

      if (filterYear !== "all") {
        const yearRents = rents.filter(rent => {
          const date = new Date(rent.date);
          return date.getFullYear().toString() === filterYear;
        });

        const uniqueMonths = Array.from(
          new Set(
            yearRents.map(rent => {
              const date = new Date(rent.date);
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
  }, [rents, filterYear]);

  // Fetch all office rents and sort by date descending
  const fetchOfficeRents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/office-rents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const sortedRents = [...data.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        
        setRents(sortedRents);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to load office rents' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.message}` 
      });
      console.error("Error fetching office rents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF report
  const generatePDF = () => {
    if (filteredRents.length === 0) {
      showToast("No rent records to download for the selected filters", 'error');
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
      doc.text("Office Rent Report", pageWidth / 2, 20, { align: "center" });
      
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
      doc.text(`Total Records: ${filteredRents.length}`, 14, 42);
      
      // Add user info
      if (user) {
        doc.text(`Generated by: ${user.name} (${user.role})`, 14, 48);
      }
      
      // Prepare table data
      const tableData = filteredRents.map(rent => {
        const rentDate = new Date(rent.date);
        const paymentMethod = rent.paymentMethod || 'cash';
        const note = rent.note || '-';
        
        return [
          rentDate.toLocaleDateString(),
          `BDT ${rent.rent.toFixed(2)}`,
          paymentMethod.replace('_', ' ').toUpperCase(),
          note,
          `${monthNames[rentDate.getMonth()]} ${rentDate.getFullYear()}`
        ];
      });
      
      // Add table using autoTable
      autoTable(doc, {
        startY: user ? 55 : 50,
        head: [['Date', 'Amount (BDT)', 'Payment Method', 'Note', 'Month-Year']],
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
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 50 },
          4: { cellWidth: 30 }
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
      doc.text(`Total Records: ${filteredRents.length}`, 14, lastY + 8);
      doc.text(`Total Amount: BDT ${totalAmount.toFixed(2)}`, 14, lastY + 16);
      
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
      const filename = `office_rent_${timestamp}${filterSuffix}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      // Show success toast
      showToast(`PDF downloaded successfully: ${filename}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast(`Failed to generate PDF: ${error.message}`, 'error');
    }
  };

  // Function to check for duplicate month-year entries
  const checkForDuplicateMonthYear = (selectedDate, currentEditingId = null) => {
    if (!selectedDate) return false;
    
    const inputDate = new Date(selectedDate);
    const inputYear = inputDate.getFullYear();
    const inputMonth = inputDate.getMonth();
    
    // Filter out the current record being edited
    const filteredRents = currentEditingId 
      ? rents.filter(rent => rent._id !== currentEditingId)
      : rents;
    
    const isDuplicate = filteredRents.some(rent => {
      const rentDate = new Date(rent.date);
      const rentYear = rentDate.getFullYear();
      const rentMonth = rentDate.getMonth();
      
      return rentYear === inputYear && rentMonth === inputMonth;
    });
    
    return isDuplicate;
  };

  // Fetch single rent for editing
  const fetchRentForEdit = async (id) => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await fetch(`${API_URL}/office-rents/${id}`, {
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
        const rent = data.data;
        setFormData({
          date: rent.date.split('T')[0],
          rent: rent.rent.toString(),
          paymentMethod: rent.paymentMethod || "cash",
          note: rent.note || ""
        });
        setEditingId(id);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast(data.message || 'Failed to load rent data', 'error');
      }
    } catch (error) {
      showToast(`Failed to load rent record: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear duplicate warning when date changes
    if (name === 'date') {
      if (message.text.includes('already exists') || message.text.includes('duplicate')) {
        setMessage({ type: '', text: '' });
      }
      
      // Check for duplicate when editing
      if (editingId && value) {
        const isDuplicate = checkForDuplicateMonthYear(value, editingId);
        if (isDuplicate) {
          const inputDate = new Date(value);
          const monthName = monthNames[inputDate.getMonth()];
          const year = inputDate.getFullYear();
          setMessage({ 
            type: 'error', 
            text: `Cannot edit: A rent record for ${monthName} ${year} already exists. Please choose a different date.` 
          });
        }
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!formData.date) {
        throw new Error("Please select a date");
      }

      // Check for duplicate month-year
      const isDuplicate = checkForDuplicateMonthYear(formData.date, editingId);
      
      if (isDuplicate) {
        const inputDate = new Date(formData.date);
        const monthName = monthNames[inputDate.getMonth()];
        const year = inputDate.getFullYear();
        
        if (editingId) {
          throw new Error(`Cannot update: A rent record for ${monthName} ${year} already exists. Please keep the original date or choose a different one.`);
        } else {
          throw new Error(`A rent record for ${monthName} ${year} already exists. Please edit the existing record instead.`);
        }
      }

      const url = editingId 
        ? `${API_URL}/office-rents/${editingId}`
        : `${API_URL}/office-rents`;
      
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
        showToast(`Office rent ${actionText} successfully!`);
        
        setFormData({
          date: "",
          rent: "",
          paymentMethod: "cash",
          note: ""
        });
        
        setEditingId(null);
        
        fetchOfficeRents();
        
      } else {
        setMessage({ 
          type: 'error', 
          text: `${data.message || data.error}` 
        });
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({ 
        type: 'error', 
        text: `${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setFormData({
      date: "",
      rent: "",
      paymentMethod: "cash",
      note: ""
    });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  // Delete rent record
  const handleDelete = async (id) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this rent record?");
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/office-rents/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        showToast("Rent record deleted successfully!");
        if (editingId === id) {
          cancelEdit();
        }
        fetchOfficeRents();
      } else {
        showToast(data.message || data.error, 'error');
      }
    } catch (error) {
      showToast(`Failed to delete rent record: ${error.message}`, 'error');
    }
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
    setFilterMonth("all");
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterYear("all");
    setFilterMonth("all");
  };

  // Filter rents based on selected year and month and sort by date descending
  const filteredRents = useMemo(() => {
    const filtered = rents.filter(rent => {
      const date = new Date(rent.date);
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
  }, [rents, filterYear, filterMonth]);

  // Calculate total for filtered rents
  const calculateFilteredTotal = () => {
    return filteredRents.reduce((total, rent) => total + rent.rent, 0);
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

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    return method
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get existing month-year for warning
  const getExistingMonthsWarning = () => {
    if (rents.length === 0) return null;
    
    const selectedDate = new Date(formData.date);
    if (isNaN(selectedDate.getTime())) return null;
    
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    
    const existingMonths = rents
      .map(rent => {
        const rentDate = new Date(rent.date);
        return {
          year: rentDate.getFullYear(),
          month: rentDate.getMonth(),
          monthName: monthNames[rentDate.getMonth()],
          id: rent._id
        };
      })
      .filter(item => 
        item.year === selectedYear && item.month === selectedMonth
      );
    
    return existingMonths.length > 0 ? existingMonths[0] : null;
  };

  // Check if date has duplicate warning for new entries
  const existingMonthWarning = !editingId ? getExistingMonthsWarning() : null;

  // Check if editing date causes duplicate
  const editingDuplicateWarning = editingId ? (() => {
    if (!formData.date) return null;
    
    const selectedDate = new Date(formData.date);
    if (isNaN(selectedDate.getTime())) return null;
    
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    
    // Find the original record being edited
    const originalRecord = rents.find(rent => rent._id === editingId);
    if (!originalRecord) return null;
    
    const originalDate = new Date(originalRecord.date);
    const originalYear = originalDate.getFullYear();
    const originalMonth = originalDate.getMonth();
    
    // Check if date has changed
    const dateChanged = selectedYear !== originalYear || selectedMonth !== originalMonth;
    
    if (!dateChanged) return null;
    
    // Check for duplicates excluding current record
    const isDuplicate = rents.some(rent => {
      if (rent._id === editingId) return false;
      
      const rentDate = new Date(rent.date);
      const rentYear = rentDate.getFullYear();
      const rentMonth = rentDate.getMonth();
      
      return rentYear === selectedYear && rentMonth === selectedMonth;
    });
    
    return isDuplicate ? {
      monthName: monthNames[selectedMonth],
      year: selectedYear
    } : null;
  })() : null;

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
    <div className="max-w-7xl mx-auto">
      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Office Rent Management
      </h1>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' :
          message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' :
          'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {message.type === 'error' ? '❌' :
               message.type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* User Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600">Logged in as: <span className="font-semibold">{user.name}</span></p>
            <p className="text-xs text-blue-500">Role: <span className="font-medium capitalize">{user.role}</span></p>
          </div>
          <div className="text-sm text-blue-700">
            <span className="px-2 py-1 bg-blue-100 rounded-full">Office Rent Management</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Left: Rent Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingId ? 'Edit Rent Record' : 'Add New Rent'}
            </h2>
            {editingId && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                Editing Mode
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  (existingMonthWarning && !editingId) || (editingDuplicateWarning && editingId)
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                required
                disabled={loading}
              />
              
              {/* Warning for new entries */}
              {existingMonthWarning && !editingId && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  ⚠️ <strong>Warning:</strong> A rent record for {existingMonthWarning.monthName} {existingMonthWarning.year} already exists. 
                  <span> Please edit the existing record instead.</span>
                </div>
              )}
              
              {/* Warning for editing duplicates */}
              {editingDuplicateWarning && editingId && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  ⚠️ <strong>Cannot Update:</strong> A rent record for {editingDuplicateWarning.monthName} {editingDuplicateWarning.year} already exists. 
                  <span> Please keep the original date or choose a different one.</span>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Only one rent record per month is allowed
              </p>
            </div>

            {/* Rent Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent Amount (BDT) *
              </label>
              <input
                type="number"
                name="rent"
                placeholder="Enter rent amount in BDT"
                value={formData.rent}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.01"
                disabled={loading}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>
                    {formatPaymentMethod(method)}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (Optional)
              </label>
              <textarea
                name="note"
                placeholder="Add any additional notes about this rent payment (e.g., transaction ID, reference number, payment details)"
                value={formData.note}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Add reference number, transaction ID, or any other details
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || 
                  (existingMonthWarning && !editingId) || 
                  (editingDuplicateWarning && editingId)
                }
                className={`flex-1 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                  editingId ? 'bg-green-600 hover:bg-green-700 text-white' : 
                  (existingMonthWarning && !editingId) || (editingDuplicateWarning && editingId) 
                    ? 'bg-gray-400 cursor-not-allowed' : 
                  'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingId ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  (existingMonthWarning && !editingId) 
                    ? 'Duplicate Month - Edit Existing' 
                    : (editingDuplicateWarning && editingId)
                      ? 'Duplicate - Cannot Update'
                      : editingId 
                        ? 'Update Rent Record' 
                        : 'Save Rent to Database'
                )}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Rent Records */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {filterYear !== "all" || filterMonth !== "all" ? 'Filtered Rent Records' : 'All Rent Records'}
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({filteredRents.length} records)
              </span>
            </h2>
            <div className="flex items-center space-x-2">
              {/* PDF Download Button */}
              {filteredRents.length > 0 && (
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center"
                  title="Download PDF Report"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download PDF
                </button>
              )}
              
              <button
                onClick={fetchOfficeRents}
                disabled={loading}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Sort Indicator */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
            </svg>
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
              <div className="ml-auto text-right">
                <span className="text-sm text-gray-600">
                  Showing {filteredRents.length} of {rents.length} record(s)
                </span>
                {filterYear !== "all" || filterMonth !== "all" ? (
                  <div className="text-sm font-medium text-green-600 mt-1">
                    Filtered Total: {formatCurrency(calculateFilteredTotal())}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Duplicate Warning Notice */}
          {existingMonthWarning && !editingId && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">
                  <strong>Duplicate Month Detected:</strong> You cannot add another rent record for {existingMonthWarning.monthName} {existingMonthWarning.year}. 
                  Please edit the existing record below or choose a different date.
                </p>
              </div>
            </div>
          )}

          {/* Edit Duplicate Warning Notice */}
          {editingDuplicateWarning && editingId && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">
                  <strong>Cannot Update:</strong> Changing date to {editingDuplicateWarning.monthName} {editingDuplicateWarning.year} would create a duplicate. 
                  Please keep the original date or choose a different one.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading rent records...</p>
            </div>
          ) : filteredRents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {filterYear === "all" && filterMonth === "all" 
                  ? "No rent records yet"
                  : "No rent records found for the selected filters"
                }
              </h3>
              <p className="text-gray-500">
                {filterYear === "all" && filterMonth === "all" 
                  ? "Add your first rent record using the form!"
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
                        Date
                        <div className="text-xs font-normal text-gray-400 mt-1">Month-Year</div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount (BDT)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRents.map((rent, index) => {
                      const rentDate = new Date(rent.date);
                      const monthYear = `${monthNames[rentDate.getMonth()]} ${rentDate.getFullYear()}`;
                      
                      return (
                        <tr key={rent._id} className={`hover:bg-gray-50 ${editingId === rent._id ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {formatDate(rent.date)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {monthYear}
                            </div>
                            {index === 0 && (
                              <div className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                Newest
                              </div>
                            )}
                            {index === filteredRents.length - 1 && filteredRents.length > 1 && (
                              <div className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                                Oldest
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {formatCurrency(rent.rent)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              rent.paymentMethod === 'cash' ? 'bg-yellow-100 text-yellow-800' :
                              rent.paymentMethod === 'bank_transfer' ? 'bg-blue-100 text-blue-800' :
                              rent.paymentMethod === 'credit_card' ? 'bg-purple-100 text-purple-800' :
                              rent.paymentMethod === 'debit_card' ? 'bg-indigo-100 text-indigo-800' :
                              rent.paymentMethod === 'online' ? 'bg-teal-100 text-teal-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {formatPaymentMethod(rent.paymentMethod || 'cash')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600 max-w-xs truncate" title={rent.note}>
                              {rent.note || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-500">
                              {formatDate(rent.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => fetchRentForEdit(rent._id)}
                                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(rent._id)}
                                className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                              >
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
                          Sorted: Newest to Oldest
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(calculateFilteredTotal())}
                        </div>
                      </td>
                      <td colSpan="4" className="px-4 py-3 text-sm text-gray-500">
                        {filteredRents.length} record(s)
                        {filteredRents.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            Showing {Math.min(filteredRents.length, 10)} of {filteredRents.length} records
                          </div>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900">
                    {filterYear !== "all" || filterMonth !== "all" ? "Filtered Total" : "Total Amount"}
                  </h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(calculateFilteredTotal())}
                  </p>
                </div>
              </div>
            </>
          )}

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