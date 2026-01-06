// "use client";

// import React, { useState, useEffect, useMemo, useRef } from "react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export default function OfficeSupplyPage() {
//   const [supplies, setSupplies] = useState([
//     { name: "", date: "", price: "", paymentMethod: "" },
//   ]);
//   const [storedSupplies, setStoredSupplies] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({
//     name: "",
//     date: "",
//     price: "",
//     paymentMethod: ""
//   });

//   // Filter states
//   const [selectedYear, setSelectedYear] = useState("all");
//   const [selectedMonth, setSelectedMonth] = useState("all");
//   const [years, setYears] = useState([]);
//   const [months, setMonths] = useState([]);

//   // Ref for edit form
//   const editFormRef = useRef(null);

//   // Month names for display
//   const monthNames = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   // Currency symbol for Bangladeshi Taka
//   const currencySymbol = "৳";

//   // Fetch stored supplies on component mount
//   useEffect(() => {
//     fetchStoredSupplies();
//   }, []);

//   // Update years and months when supplies change
//   useEffect(() => {
//     if (storedSupplies.length > 0) {
//       const uniqueYears = Array.from(
//         new Set(
//           storedSupplies.map(supply => {
//             const date = new Date(supply.date);
//             return date.getFullYear();
//           })
//         )
//       ).sort((a, b) => b - a); // Sort descending (newest first)

//       setYears(uniqueYears);

//       // If a year is selected, update available months
//       if (selectedYear !== "all") {
//         const yearSupplies = storedSupplies.filter(supply => {
//           const date = new Date(supply.date);
//           return date.getFullYear().toString() === selectedYear;
//         });

//         const uniqueMonths = Array.from(
//           new Set(
//             yearSupplies.map(supply => {
//               const date = new Date(supply.date);
//               return date.getMonth() + 1; // Months are 0-indexed in JS
//             })
//           )
//         ).sort((a, b) => a - b);

//         setMonths(uniqueMonths);
//       } else {
//         setMonths([]);
//       }
//     } else {
//       setYears([]);
//       setMonths([]);
//     }
//   }, [storedSupplies, selectedYear]);

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

//   const fetchStoredSupplies = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await fetch('http://localhost:5004/api/office-supplies');
//       const data = await response.json();
//       if (data.success) {
//         // Sort supplies by date in descending order (newest first)
//         const sortedSupplies = [...data.data].sort((a, b) => {
//           const dateA = new Date(a.date);
//           const dateB = new Date(b.date);
//           return dateB.getTime() - dateA.getTime();
//         });
//         setStoredSupplies(sortedSupplies);
//       } else {
//         setError(data.message || 'Failed to load stored supplies');
//       }
//     } catch (error) {
//       console.error('Error fetching supplies:', error);
//       setError('Failed to load stored supplies');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter supplies based on selected year and month
//   const filteredSupplies = useMemo(() => {
//     return storedSupplies.filter(supply => {
//       const date = new Date(supply.date);
//       const year = date.getFullYear().toString();
//       const month = (date.getMonth() + 1).toString(); // Convert to 1-indexed month

//       // Apply year filter
//       if (selectedYear !== "all" && year !== selectedYear) {
//         return false;
//       }

//       // Apply month filter
//       if (selectedMonth !== "all" && month !== selectedMonth) {
//         return false;
//       }

//       return true;
//     });
//   }, [storedSupplies, selectedYear, selectedMonth]);

//   // Generate PDF function
//   const generatePDF = () => {
//     if (filteredSupplies.length === 0) {
//       setError("No supplies to download");
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
//       doc.text("Office Supplies Report", pageWidth / 2, 20, { align: "center" });
      
//       // Company/Report Info
//       doc.setFontSize(11);
//       doc.setFont("helvetica", "normal");
//       doc.setTextColor(100);
//       doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
//       // Filter information - Format: "December 2025"
//       let filterInfo = "All Supplies";
//       if (selectedYear !== "all" && selectedMonth !== "all") {
//         filterInfo = `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`;
//       } else if (selectedYear !== "all") {
//         filterInfo = `Year: ${selectedYear}`;
//       } else if (selectedMonth !== "all") {
//         filterInfo = `Month: ${monthNames[parseInt(selectedMonth) - 1]}`;
//       }
//       doc.text(`Report Type: ${filterInfo}`, 14, 36);
//       doc.text(`Total Records: ${filteredSupplies.length}`, 14, 42);
      
//       // Prepare table data - Use "BDT" instead of ৳ symbol
//       const tableData = filteredSupplies.map(supply => [
//         supply.name,
//         new Date(supply.date).toLocaleDateString(),
//         `BDT ${supply.price.toFixed(2)}`,
//         supply.paymentMethod
//       ]);
      
//       // Add table using autoTable
//       autoTable(doc, {
//         startY: 50,
//         head: [['Supply Name', 'Date', 'Price (BDT)', 'Payment Method']],
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
//           0: { cellWidth: 50 },
//           1: { cellWidth: 35 },
//           2: { cellWidth: 35 },
//           3: { cellWidth: 40 }
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
//       const totalPrice = calculateTotal();
//       const lastY = doc.lastAutoTable.finalY + 10;
      
//       // Add summary section - Use "BDT" instead of ৳ symbol
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor(40);
//       doc.text("SUMMARY", 14, lastY);
      
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       doc.text(`Total Supply Items: ${filteredSupplies.length}`, 14, lastY + 8);
//       doc.text(`Total Cost: BDT ${totalPrice.toFixed(2)}`, 14, lastY + 16);
      
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
//       const isFilterActive = selectedYear !== "all" || selectedMonth !== "all";
//       const filterSuffix = isFilterActive ? '_filtered' : '';
//       const filename = `office_supplies_${timestamp}${filterSuffix}.pdf`;
      
//       // Save the PDF
//       doc.save(filename);
      
//       // Show success message
//       setSuccess(`PDF downloaded successfully: ${filename}`);
      
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       setError('Failed to generate PDF. Please try again.');
//     }
//   };

//   const updateSupplyField = (index, field, value) => {
//     const updatedSupplies = [...supplies];
//     updatedSupplies[index][field] = value;
//     setSupplies(updatedSupplies);
//   };

//   const addSupply = () => {
//     setSupplies([
//       ...supplies,
//       { name: "", date: "", price: "", paymentMethod: "" },
//     ]);
//   };

//   const removeSupply = (index) => {
//     if (supplies.length === 1) return;
//     setSupplies(supplies.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError("");
//     setSuccess("");

//     // Filter out empty rows
//     const validSupplies = supplies.filter(
//       supply => supply.name.trim() && supply.price && supply.date
//     );

//     if (validSupplies.length === 0) {
//       setError("Please add at least one supply item");
//       setSaving(false);
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:5004/api/office-supplies', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(validSupplies),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setSuccess(`Successfully saved ${data.data.length} supply item(s)`);
//         // Reset form
//         setSupplies([{ name: "", date: "", price: "", paymentMethod: "" }]);
//         // Refresh stored supplies
//         fetchStoredSupplies();
        
//         // Show warnings if any
//         if (data.warnings && data.warnings.length > 0) {
//           console.warn('Warnings:', data.warnings);
//         }
//       } else {
//         setError(data.message || 'Failed to save supplies');
//       }
//     } catch (error) {
//       console.error('Error saving supplies:', error);
//       setError('Network error. Please check if server is running.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleEditSupply = (supply) => {
//     setEditingId(supply._id);
//     setEditForm({
//       name: supply.name,
//       date: new Date(supply.date).toISOString().split('T')[0],
//       price: supply.price.toString(),
//       paymentMethod: supply.paymentMethod
//     });
//   };

//   const handleCancelEdit = () => {
//     setEditingId(null);
//     setEditForm({
//       name: "",
//       date: "",
//       price: "",
//       paymentMethod: ""
//     });
//   };

//   const handleUpdateSupply = async () => {
//     if (!editingId) return;

//     // Validation
//     if (!editForm.name.trim() || !editForm.price || !editForm.date) {
//       setError("Please fill all required fields");
//       return;
//     }

//     setSaving(true);
//     setError("");
//     setSuccess("");

//     try {
//       const response = await fetch(`http://localhost:5004/api/office-supplies/${editingId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: editForm.name,
//           date: editForm.date,
//           price: parseFloat(editForm.price),
//           paymentMethod: editForm.paymentMethod
//         }),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setSuccess('Supply item updated successfully');
//         // Refresh the list
//         fetchStoredSupplies();
//         // Reset edit mode
//         setEditingId(null);
//         setEditForm({
//           name: "",
//           date: "",
//           price: "",
//           paymentMethod: ""
//         });
//       } else {
//         setError(data.message || 'Failed to update supply item');
//       }
//     } catch (error) {
//       console.error('Error updating supply:', error);
//       setError('Failed to update supply item');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDeleteSupply = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this item?')) return;

//     try {
//       const response = await fetch(`http://localhost:5004/api/office-supplies/${id}`, {
//         method: 'DELETE',
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setSuccess('Supply item deleted successfully');
//         // Refresh the list
//         fetchStoredSupplies();
//       } else {
//         setError(data.message || 'Failed to delete supply item');
//       }
//     } catch (error) {
//       console.error('Error deleting supply:', error);
//       setError('Failed to delete supply item');
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

//   // Calculate total for filtered supplies
//   const calculateTotal = () => {
//     return filteredSupplies.reduce((total, supply) => total + supply.price, 0);
//   };

//   // Calculate form total
//   const calculateFormTotal = () => {
//     return supplies.reduce((total, supply) => {
//       const price = parseFloat(supply.price) || 0;
//       return total + price;
//     }, 0);
//   };

//   // Handle year filter change
//   const handleYearChange = (e) => {
//     setSelectedYear(e.target.value);
//     setSelectedMonth("all"); // Reset month when year changes
//   };

//   // Handle month filter change
//   const handleMonthChange = (e) => {
//     setSelectedMonth(e.target.value);
//   };

//   // Reset all filters
//   const resetFilters = () => {
//     setSelectedYear("all");
//     setSelectedMonth("all");
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         <h2 className="text-2xl font-semibold text-center mb-6">
//           Office Supply Expense Management
//         </h2>

//         {/* Form Section */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h3 className="text-lg font-semibold mb-4">Add New Supplies</h3>
          
//           {/* Messages */}
//           {error && !editingId && (
//             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//               {error}
//             </div>
//           )}
//           {success && !editingId && (
//             <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
//               {success}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Header Row - Desktop only */}
//             <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-semibold text-gray-600 px-1">
//               <div className="col-span-4">Supply Name</div>
//               <div className="col-span-2">Price (৳)</div>
//               <div className="col-span-3">Date</div>
//               <div className="col-span-2">Payment Method</div>
//               <div className="col-span-1 text-center">Action</div>
//             </div>

//             {supplies.map((supply, index) => (
//               <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-center p-3 md:p-0 md:border-0 border border-gray-200 rounded-md mb-3 md:mb-0">
//                 {/* Mobile View - Vertical Layout */}
//                 <div className="md:hidden space-y-3 w-full">
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Supply Name *
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="e.g., Printer Paper, Pens, etc."
//                         value={supply.name}
//                         onChange={(e) =>
//                           updateSupplyField(index, "name", e.target.value)
//                         }
//                         className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Price (৳) *
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="Price in ৳"
//                         value={supply.price}
//                         onChange={(e) =>
//                           updateSupplyField(index, "price", e.target.value)
//                         }
//                         className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                         step="0.01"
//                         min="0"
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
//                         value={supply.date}
//                         max={getTodayDate()}
//                         onChange={(e) =>
//                           updateSupplyField(index, "date", e.target.value)
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
//                         value={supply.paymentMethod}
//                         onChange={(e) =>
//                           updateSupplyField(index, "paymentMethod", e.target.value)
//                         }
//                         className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                       >
//                         <option value="">Select Method</option>
//                         <option value="Cash">Cash</option>
//                         <option value="Bank Transfer">Bank Transfer</option>
//                         <option value="Mobile Banking">Mobile Banking</option>
//                         <option value="Card">Card</option>
//                       </select>
//                     </div>
//                   </div>
                  
//                   {supplies.length > 1 && (
//                     <div className="pt-2">
//                       <button
//                         type="button"
//                         onClick={() => removeSupply(index)}
//                         className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
//                       >
//                         Remove This Entry
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Desktop View - Grid Layout */}
//                 {/* Supply Name */}
//                 <div className="hidden md:block col-span-4">
//                   <input
//                     type="text"
//                     placeholder="e.g., Printer Paper, Pens, etc."
//                     value={supply.name}
//                     onChange={(e) =>
//                       updateSupplyField(index, "name", e.target.value)
//                     }
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     required
//                   />
//                 </div>

//                 {/* Price */}
//                 <div className="hidden md:block col-span-2">
//                   <input
//                     type="number"
//                     placeholder="Price in ৳"
//                     value={supply.price}
//                     onChange={(e) =>
//                       updateSupplyField(index, "price", e.target.value)
//                     }
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     required
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>

//                 {/* Date */}
//                 <div className="hidden md:block col-span-3">
//                   <input
//                     type="date"
//                     value={supply.date}
//                     max={getTodayDate()}
//                     onChange={(e) =>
//                       updateSupplyField(index, "date", e.target.value)
//                     }
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     required
//                   />
//                 </div>

//                 {/* Payment Method */}
//                 <div className="hidden md:block col-span-2">
//                   <select
//                     value={supply.paymentMethod}
//                     onChange={(e) =>
//                       updateSupplyField(index, "paymentMethod", e.target.value)
//                     }
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     required
//                   >
//                     <option value="">Select Method</option>
//                     <option value="Cash">Cash</option>
//                     <option value="Bank Transfer">Bank Transfer</option>
//                     <option value="Mobile Banking">Mobile Banking</option>
//                     <option value="Card">Card</option>
//                   </select>
//                 </div>

//                 {/* Remove Button */}
//                 <div className="hidden md:block col-span-1">
//                   {supplies.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeSupply(index)}
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

//             {/* Add More Supplies Button */}
//             <button
//               type="button"
//               onClick={addSupply}
//               className="hidden md:block w-full border border-dashed border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
//             >
//               + Add More Supplies
//             </button>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={saving}
//               className={`w-full py-3 md:py-2 rounded-md transition-colors text-sm md:text-base ${
//                 saving
//                   ? 'bg-blue-400 cursor-not-allowed'
//                   : 'bg-blue-600 hover:bg-blue-700'
//               } text-white`}
//             >
//               {saving ? 'Saving...' : 'Save Supplies'}
//             </button>
//           </form>
//         </div>

//         {/* Edit Form Section */}
//         {editingId && (
//           <div 
//             ref={editFormRef}
//             className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-blue-300"
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-blue-700">
//                 ✏️ Edit Supply Item
//               </h3>
//               <button
//                 onClick={handleCancelEdit}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ✕ Close
//               </button>
//             </div>
            
//             <div className="grid grid-cols-12 gap-3 items-center">
//               {/* Supply Name */}
//               <div className="col-span-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Supply Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={editForm.name}
//                   onChange={(e) => setEditForm({...editForm, name: e.target.value})}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                   placeholder="e.g., Printer Paper"
//                 />
//               </div>

//               {/* Price */}
//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Price (৳) *
//                 </label>
//                 <input
//                   type="number"
//                   value={editForm.price}
//                   onChange={(e) => setEditForm({...editForm, price: e.target.value})}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                   step="0.01"
//                   min="0"
//                   placeholder="0.00"
//                 />
//               </div>

//               {/* Date */}
//               <div className="col-span-3">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={editForm.date}
//                   max={getTodayDate()}
//                   onChange={(e) => setEditForm({...editForm, date: e.target.value})}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Payment Method */}
//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Payment Method *
//                 </label>
//                 <select
//                   value={editForm.paymentMethod}
//                   onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   <option value="">Select Method</option>
//                   <option value="Cash">Cash</option>
//                   <option value="Bank Transfer">Bank Transfer</option>
//                   <option value="Mobile Banking">Mobile Banking</option>
//                   <option value="Card">Card</option>
//                 </select>
//               </div>

//               {/* Action Buttons */}
//               <div className="col-span-1 flex space-x-2 pt-6">
//                 <button
//                   onClick={handleUpdateSupply}
//                   disabled={saving}
//                   className={`flex-1 py-2 rounded-md transition-colors ${
//                     saving
//                       ? 'bg-blue-400 cursor-not-allowed'
//                       : 'bg-blue-600 hover:bg-blue-700'
//                   } text-white`}
//                 >
//                   {saving ? 'Updating...' : 'Update'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Stored Supplies Table Section */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h3 className="text-lg font-semibold">Stored Office Supplies</h3>
//               <div className="mt-1 text-sm text-gray-600">
//                 {selectedYear !== "all" || selectedMonth !== "all" ? (
//                   <span>
//                     Showing {filteredSupplies.length} of {storedSupplies.length} item(s)
//                   </span>
//                 ) : (
//                   <span>Total: {storedSupplies.length} item(s)</span>
//                 )}
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               {/* PDF Download Button */}
//               {filteredSupplies.length > 0 && (
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
//                 onClick={fetchStoredSupplies}
//                 disabled={loading}
//                 className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
//               >
//                 {loading ? 'Refreshing...' : 'Refresh'}
//               </button>
//             </div>
//           </div>

//           {/* Filter Section */}
//           <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//             <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//               <div className="flex items-center space-x-2">
//                 <span className="text-sm font-medium text-gray-700">Filter by:</span>
//               </div>
              
//               <div className="flex flex-wrap gap-4">
//                 {/* Year Filter */}
//                 <div>
//                   <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">
//                     Year
//                   </label>
//                   <select
//                     id="yearFilter"
//                     value={selectedYear}
//                     onChange={handleYearChange}
//                     className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
//                     value={selectedMonth}
//                     onChange={handleMonthChange}
//                     disabled={selectedYear === "all"}
//                     className={`w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                       selectedYear === "all" ? 'bg-gray-100 cursor-not-allowed' : ''
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
//                 {(selectedYear !== "all" || selectedMonth !== "all") && (
//                   <div className="flex items-center space-x-2">
//                     <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
//                       <span className="text-sm text-blue-700">
//                         {selectedYear !== "all" && selectedMonth !== "all" 
//                           ? `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`
//                           : selectedYear !== "all" 
//                           ? `Year: ${selectedYear}`
//                           : `Month: ${monthNames[parseInt(selectedMonth) - 1]}`
//                         }
//                       </span>
//                       <button
//                         onClick={() => resetFilters()}
//                         className="text-blue-500 hover:text-blue-700"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* Reset Filters Button */}
//                 {(selectedYear !== "all" || selectedMonth !== "all") && (
//                   <div className="flex items-end">
//                     <button
//                       onClick={resetFilters}
//                       className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
//                     >
//                       Reset Filters
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Results Count */}
//               <div className="ml-auto">
//                 <span className="text-sm text-gray-600">
//                   Showing {filteredSupplies.length} of {storedSupplies.length} item(s)
//                 </span>
//               </div>
//             </div>
//           </div>

//           {loading ? (
//             <div className="text-center py-8">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//               <p className="mt-2 text-gray-600">Loading supplies...</p>
//             </div>
//           ) : storedSupplies.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               No supplies stored yet. Add some using the form above.
//             </div>
//           ) : filteredSupplies.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               No supplies found for the selected filters. Try changing your filter criteria.
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Supply Name
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Price (৳)
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
//                     {filteredSupplies.map((supply) => (
//                       <tr key={supply._id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">
//                             {supply.name}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {formatDate(supply.date)}
//                             <div className="text-xs text-gray-500">
//                               {monthNames[new Date(supply.date).getMonth()]} {new Date(supply.date).getFullYear()}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900 font-medium">
//                             {formatCurrency(supply.price)}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
//                             {supply.paymentMethod}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           <div className="flex space-x-2">
//                             <button
//                               onClick={() => handleEditSupply(supply)}
//                               className="text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded"
//                             >
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => handleDeleteSupply(supply._id)}
//                               className="text-red-600 hover:text-red-900 transition-colors px-3 py-1 bg-red-50 hover:bg-red-100 rounded"
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot className="bg-gray-50">
//                     <tr>
//                       <td colSpan="2" className="px-6 py-4 text-sm font-semibold text-gray-900">
//                         {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Total" : "Total"}
//                         {(selectedYear !== "all" || selectedMonth !== "all") && (
//                           <div className="text-xs font-normal text-gray-500 mt-1">
//                             {selectedYear !== "all" && selectedMonth !== "all" 
//                               ? `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`
//                               : selectedYear !== "all" 
//                               ? `Year: ${selectedYear}`
//                               : `Month: ${monthNames[parseInt(selectedMonth) - 1]}`
//                             }
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-bold text-gray-900">
//                           {formatCurrency(calculateTotal())}
//                         </div>
//                       </td>
//                       <td colSpan="2" className="px-6 py-4 text-sm text-gray-500">
//                         {filteredSupplies.length} item(s)
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
              
//               {/* Summary Stats - Removed Average per Item */}
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <h4 className="text-sm font-medium text-blue-900">
//                     {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Items" : "Total Items"}
//                   </h4>
//                   <p className="text-2xl font-bold text-blue-700">{filteredSupplies.length}</p>
//                 </div>
//                 <div className="bg-green-50 p-4 rounded-lg">
//                   <h4 className="text-sm font-medium text-green-900">
//                     {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Total Cost" : "Total Cost"}
//                   </h4>
//                   <p className="text-2xl font-bold text-green-700">{formatCurrency(calculateTotal())}</p>
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

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from 'next/navigation';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OfficeSupplyPage() {
  const router = useRouter();
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Form state
  const [supplies, setSupplies] = useState([
    { name: "", date: "", price: "", paymentMethod: "" },
  ]);
  const [storedSupplies, setStoredSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    date: "",
    price: "",
    paymentMethod: ""
  });

  // Filter states
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);

  // Ref for edit form
  const editFormRef = useRef(null);

  // API URL
  const API_URL = "http://localhost:5004/api";

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Currency symbol for Bangladeshi Taka
  const currencySymbol = "৳";

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Initialize data after authentication
  useEffect(() => {
    if (user && !authLoading) {
      fetchStoredSupplies();
    }
  }, [user, authLoading]);

  // Update years and months when supplies change
  useEffect(() => {
    if (storedSupplies.length > 0) {
      const uniqueYears = Array.from(
        new Set(
          storedSupplies.map(supply => {
            const date = new Date(supply.date);
            return date.getFullYear();
          })
        )
      ).sort((a, b) => b - a);

      setYears(uniqueYears);

      // If a year is selected, update available months
      if (selectedYear !== "all") {
        const yearSupplies = storedSupplies.filter(supply => {
          const date = new Date(supply.date);
          return date.getFullYear().toString() === selectedYear;
        });

        const uniqueMonths = Array.from(
          new Set(
            yearSupplies.map(supply => {
              const date = new Date(supply.date);
              return date.getMonth() + 1;
            })
          )
        ).sort((a, b) => a - b);

        setMonths(uniqueMonths);
      } else {
        setMonths([]);
      }
    } else {
      setYears([]);
      setMonths([]);
    }
  }, [storedSupplies, selectedYear]);

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

  // Check if user is authenticated
  const checkAuthentication = () => {
    const userData = localStorage.getItem('user');
    const isAuth = localStorage.getItem('isAuthenticated');
    const authToken = localStorage.getItem('auth_token');
    
    if (!userData || !isAuth || !authToken) {
      router.push('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      
      // Check if user has permission (admin or moderator)
      if (!['admin', 'moderator', 'user'].includes(parsedUser.role)) {
        setError('Access denied. You do not have permission to manage office supplies.');
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

  // Function to handle logout
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    sessionStorage.clear();
    
    // Clear any cookies if needed
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Redirect to login page
    router.push('/');
  };

  const fetchStoredSupplies = async () => {
    setLoading(true);
    setError("");
    try {
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/office-supplies`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Sort supplies by date in descending order (newest first)
        const sortedSupplies = [...data.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        setStoredSupplies(sortedSupplies);
      } else {
        setError(data.message || 'Failed to load stored supplies');
      }
    } catch (error) {
      console.error('Error fetching supplies:', error);
      setError('Failed to load stored supplies');
    } finally {
      setLoading(false);
    }
  };

  // Filter supplies based on selected year and month
  const filteredSupplies = useMemo(() => {
    return storedSupplies.filter(supply => {
      const date = new Date(supply.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString();

      // Apply year filter
      if (selectedYear !== "all" && year !== selectedYear) {
        return false;
      }

      // Apply month filter
      if (selectedMonth !== "all" && month !== selectedMonth) {
        return false;
      }

      return true;
    });
  }, [storedSupplies, selectedYear, selectedMonth]);

  // Generate PDF function
  const generatePDF = () => {
    if (filteredSupplies.length === 0) {
      setError("No supplies to download");
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Title - Use "BDT" instead of the symbol for compatibility
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text("Office Supplies Report", pageWidth / 2, 20, { align: "center" });
      
      // Company/Report Info
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
      // Filter information
      let filterInfo = "All Supplies";
      if (selectedYear !== "all" && selectedMonth !== "all") {
        filterInfo = `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`;
      } else if (selectedYear !== "all") {
        filterInfo = `Year: ${selectedYear}`;
      } else if (selectedMonth !== "all") {
        filterInfo = `Month: ${monthNames[parseInt(selectedMonth) - 1]}`;
      }
      doc.text(`Report Type: ${filterInfo}`, 14, 36);
      doc.text(`Total Records: ${filteredSupplies.length}`, 14, 42);
      
      // Add user info
      if (user) {
        doc.text(`Generated by: ${user.name} (${user.role})`, 14, 48);
      }
      
      // Prepare table data - Use "BDT" instead of ৳ symbol
      const tableData = filteredSupplies.map(supply => [
        supply.name,
        new Date(supply.date).toLocaleDateString(),
        `BDT ${supply.price.toFixed(2)}`,
        supply.paymentMethod
      ]);
      
      // Add table using autoTable
      autoTable(doc, {
        startY: user ? 55 : 50,
        head: [['Supply Name', 'Date', 'Price (BDT)', 'Payment Method']],
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
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 40 }
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
      const totalPrice = calculateTotal();
      const lastY = doc.lastAutoTable.finalY + 10;
      
      // Add summary section - Use "BDT" instead of ৳ symbol
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40);
      doc.text("SUMMARY", 14, lastY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Supply Items: ${filteredSupplies.length}`, 14, lastY + 8);
      doc.text(`Total Cost: BDT ${totalPrice.toFixed(2)}`, 14, lastY + 16);
      
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
      const isFilterActive = selectedYear !== "all" || selectedMonth !== "all";
      const filterSuffix = isFilterActive ? '_filtered' : '';
      const filename = `office_supplies_${timestamp}${filterSuffix}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      // Show success message
      setSuccess(`PDF downloaded successfully: ${filename}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const updateSupplyField = (index, field, value) => {
    const updatedSupplies = [...supplies];
    updatedSupplies[index][field] = value;
    setSupplies(updatedSupplies);
  };

  const addSupply = () => {
    setSupplies([
      ...supplies,
      { name: "", date: "", price: "", paymentMethod: "" },
    ]);
  };

  const removeSupply = (index) => {
    if (supplies.length === 1) return;
    setSupplies(supplies.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Filter out empty rows
    const validSupplies = supplies.filter(
      supply => supply.name.trim() && supply.price && supply.date
    );

    if (validSupplies.length === 0) {
      setError("Please add at least one supply item");
      setSaving(false);
      return;
    }

    try {
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/office-supplies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(validSupplies),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(`Successfully saved ${data.data.length} supply item(s)`);
        // Reset form
        setSupplies([{ name: "", date: "", price: "", paymentMethod: "" }]);
        // Refresh stored supplies
        fetchStoredSupplies();
        
        // Show warnings if any
        if (data.warnings && data.warnings.length > 0) {
          console.warn('Warnings:', data.warnings);
        }
      } else {
        setError(data.message || 'Failed to save supplies');
      }
    } catch (error) {
      console.error('Error saving supplies:', error);
      setError('Network error. Please check if server is running.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSupply = (supply) => {
    setEditingId(supply._id);
    setEditForm({
      name: supply.name,
      date: new Date(supply.date).toISOString().split('T')[0],
      price: supply.price.toString(),
      paymentMethod: supply.paymentMethod
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      date: "",
      price: "",
      paymentMethod: ""
    });
  };

  const handleUpdateSupply = async () => {
    if (!editingId) return;

    // Validation
    if (!editForm.name.trim() || !editForm.price || !editForm.date) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/office-supplies/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editForm.name,
          date: editForm.date,
          price: parseFloat(editForm.price),
          paymentMethod: editForm.paymentMethod
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Supply item updated successfully');
        // Refresh the list
        fetchStoredSupplies();
        // Reset edit mode
        setEditingId(null);
        setEditForm({
          name: "",
          date: "",
          price: "",
          paymentMethod: ""
        });
      } else {
        setError(data.message || 'Failed to update supply item');
      }
    } catch (error) {
      console.error('Error updating supply:', error);
      setError('Failed to update supply item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupply = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/office-supplies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Supply item deleted successfully');
        // Refresh the list
        fetchStoredSupplies();
      } else {
        setError(data.message || 'Failed to delete supply item');
      }
    } catch (error) {
      console.error('Error deleting supply:', error);
      setError('Failed to delete supply item');
    }
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency in Bangladeshi Taka (৳)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate total for filtered supplies
  const calculateTotal = () => {
    return filteredSupplies.reduce((total, supply) => total + supply.price, 0);
  };

  // Calculate form total
  const calculateFormTotal = () => {
    return supplies.reduce((total, supply) => {
      const price = parseFloat(supply.price) || 0;
      return total + price;
    }, 0);
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedMonth("all");
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedYear("all");
    setSelectedMonth("all");
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Office Supply Expense Management</h1>
              <p className="text-gray-600 mt-2">Track and manage your office supplies</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as: <span className="font-semibold">{user.name}</span></p>
                <p className="text-xs text-gray-500">Role: <span className="font-medium capitalize">{user.role}</span></p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* User Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Office Supplies Management
                </div>
                <div className="text-sm text-blue-700">
                  Track office supply purchases and expenses
                </div>
              </div>
              <div className="text-sm text-blue-600">
                <span className="font-medium">Access Level:</span> {user.role}
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Add New Supplies</h3>
          
          {/* Messages */}
          {error && !editingId && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          {success && !editingId && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header Row - Desktop only */}
            <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-semibold text-gray-600 px-1">
              <div className="col-span-4">Supply Name</div>
              <div className="col-span-2">Price (৳)</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Payment Method</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {supplies.map((supply, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-center p-3 md:p-0 md:border-0 border border-gray-200 rounded-md mb-3 md:mb-0">
                {/* Mobile View - Vertical Layout */}
                <div className="md:hidden space-y-3 w-full">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Supply Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Printer Paper, Pens, etc."
                        value={supply.name}
                        onChange={(e) =>
                          updateSupplyField(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Price (৳) *
                      </label>
                      <input
                        type="number"
                        placeholder="Price in ৳"
                        value={supply.price}
                        onChange={(e) =>
                          updateSupplyField(index, "price", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        step="0.01"
                        min="0"
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
                        value={supply.date}
                        max={getTodayDate()}
                        onChange={(e) =>
                          updateSupplyField(index, "date", e.target.value)
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
                        value={supply.paymentMethod}
                        onChange={(e) =>
                          updateSupplyField(index, "paymentMethod", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Method</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Mobile Banking">Mobile Banking</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                  </div>
                  
                  {supplies.length > 1 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => removeSupply(index)}
                        className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        Remove This Entry
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop View - Grid Layout */}
                {/* Supply Name */}
                <div className="hidden md:block col-span-4">
                  <input
                    type="text"
                    placeholder="e.g., Printer Paper, Pens, etc."
                    value={supply.name}
                    onChange={(e) =>
                      updateSupplyField(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Price */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="number"
                    placeholder="Price in ৳"
                    value={supply.price}
                    onChange={(e) =>
                      updateSupplyField(index, "price", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Date */}
                <div className="hidden md:block col-span-3">
                  <input
                    type="date"
                    value={supply.date}
                    max={getTodayDate()}
                    onChange={(e) =>
                      updateSupplyField(index, "date", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="hidden md:block col-span-2">
                  <select
                    value={supply.paymentMethod}
                    onChange={(e) =>
                      updateSupplyField(index, "paymentMethod", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                {/* Remove Button */}
                <div className="hidden md:block col-span-1">
                  {supplies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSupply(index)}
                      className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Form Total */}
            <div className="flex justify-end mb-3">
              <div className="text-lg font-semibold text-blue-700">
                Form Total: {formatCurrency(calculateFormTotal())}
              </div>
            </div>

            {/* Add More Supplies Button */}
            <button
              type="button"
              onClick={addSupply}
              className="hidden md:block w-full border border-dashed border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              + Add More Supplies
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 md:py-2 rounded-md transition-colors text-sm md:text-base ${
                saving
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {saving ? 'Saving...' : 'Save Supplies'}
            </button>
          </form>
        </div>

        {/* Edit Form Section */}
        {editingId && (
          <div 
            ref={editFormRef}
            className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-blue-300"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-700">
                ✏️ Edit Supply Item
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="grid grid-cols-12 gap-3 items-center">
              {/* Supply Name */}
              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supply Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Printer Paper"
                />
              </div>

              {/* Price */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (৳) *
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  max={getTodayDate()}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Banking">Mobile Banking</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="col-span-1 flex space-x-2 pt-6">
                <button
                  onClick={handleUpdateSupply}
                  disabled={saving}
                  className={`flex-1 py-2 rounded-md transition-colors ${
                    saving
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stored Supplies Table Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Stored Office Supplies</h3>
              <div className="mt-1 text-sm text-gray-600">
                {selectedYear !== "all" || selectedMonth !== "all" ? (
                  <span>
                    Showing {filteredSupplies.length} of {storedSupplies.length} item(s)
                  </span>
                ) : (
                  <span>Total: {storedSupplies.length} item(s)</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* PDF Download Button */}
              {filteredSupplies.length > 0 && (
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
                onClick={fetchStoredSupplies}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Year Filter */}
                <div>
                  <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    id="yearFilter"
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    disabled={selectedYear === "all"}
                    className={`w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      selectedYear === "all" ? 'bg-gray-100 cursor-not-allowed' : ''
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
                {(selectedYear !== "all" || selectedMonth !== "all") && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                      <span className="text-sm text-blue-700">
                        {selectedYear !== "all" && selectedMonth !== "all" 
                          ? `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`
                          : selectedYear !== "all" 
                          ? `Year: ${selectedYear}`
                          : `Month: ${monthNames[parseInt(selectedMonth) - 1]}`
                        }
                      </span>
                      <button
                        onClick={() => resetFilters()}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Reset Filters Button */}
                {(selectedYear !== "all" || selectedMonth !== "all") && (
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count */}
              <div className="ml-auto">
                <span className="text-sm text-gray-600">
                  Showing {filteredSupplies.length} of {storedSupplies.length} item(s)
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading supplies...</p>
            </div>
          ) : storedSupplies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No supplies stored yet. Add some using the form above.
            </div>
          ) : filteredSupplies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No supplies found for the selected filters. Try changing your filter criteria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supply Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price (৳)
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
                    {filteredSupplies.map((supply) => (
                      <tr key={supply._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {supply.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(supply.date)}
                            <div className="text-xs text-gray-500">
                              {monthNames[new Date(supply.date).getMonth()]} {new Date(supply.date).getFullYear()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatCurrency(supply.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {supply.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSupply(supply)}
                              className="text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSupply(supply._id)}
                              className="text-red-600 hover:text-red-900 transition-colors px-3 py-1 bg-red-50 hover:bg-red-100 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Total" : "Total"}
                        {(selectedYear !== "all" || selectedMonth !== "all") && (
                          <div className="text-xs font-normal text-gray-500 mt-1">
                            {selectedYear !== "all" && selectedMonth !== "all" 
                              ? `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`
                              : selectedYear !== "all" 
                              ? `Year: ${selectedYear}`
                              : `Month: ${monthNames[parseInt(selectedMonth) - 1]}`
                            }
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(calculateTotal())}
                        </div>
                      </td>
                      <td colSpan="2" className="px-6 py-4 text-sm text-gray-500">
                        {filteredSupplies.length} item(s)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900">
                    {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Items" : "Total Items"}
                  </h4>
                  <p className="text-2xl font-bold text-blue-700">{filteredSupplies.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900">
                    {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Total Cost" : "Total Cost"}
                  </h4>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(calculateTotal())}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


