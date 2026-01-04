"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // Single bill edit state
  const [editingBillId, setEditingBillId] = useState(null);
  const [editBillForm, setEditBillForm] = useState({
    name: "",
    amount: "",
    date: "",
    paymentMethod: "",
    note: "", // Added note field
    isFixed: false
  });

  // Filter states
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);

  // Duplicate check state
  const [duplicateChecks, setDuplicateChecks] = useState({});

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

  // Helper function to check for duplicate bills
  const checkForDuplicateBills = async (billName, date, excludeBillId = null) => {
    if (!billName.trim() || !date) {
      return { isDuplicate: false, monthYear: null, existingBill: null };
    }
    
    const billDate = new Date(date);
    const monthYear = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
    
    try {
      const response = await fetch(
        `${API_URL}/bills/month/${billDate.getFullYear()}/${billDate.getMonth() + 1}`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        const existingBill = data.data.find(bill => {
          const isSameName = bill.name.toLowerCase() === billName.toLowerCase();
          const isDifferentBill = excludeBillId ? bill._id !== excludeBillId : true;
          return isSameName && isDifferentBill;
        });
        
        return {
          isDuplicate: !!existingBill,
          monthYear,
          existingBill
        };
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
    }
    
    return { isDuplicate: false, monthYear: null, existingBill: null };
  };

  // Check bill duplicate for form validation
  const checkBillDuplicate = async (billName, date, index) => {
    if (!billName.trim() || !date) {
      setDuplicateChecks(prev => ({
        ...prev,
        [index]: false
      }));
      return;
    }
    
    const result = await checkForDuplicateBills(billName, date);
    setDuplicateChecks(prev => ({
      ...prev,
      [index]: result.isDuplicate
    }));
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
    
    // Check for duplicates when name or date changes
    if ((field === "name" || field === "date") && value) {
      if (field === "name") {
        checkBillDuplicate(value, updatedBills[index].date, index);
      } else if (field === "date") {
        checkBillDuplicate(updatedBills[index].name, value, index);
      }
    }
  };

  const addBillField = () => {
    const newBill = { 
      name: "", 
      amount: "", 
      date: getTodayDate(), 
      paymentMethod: "", 
      note: "", // Added note field
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
    
    // Remove duplicate check for this index
    const newDuplicateChecks = { ...duplicateChecks };
    delete newDuplicateChecks[index];
    setDuplicateChecks(newDuplicateChecks);
    
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
        note: "", // Added note field
        isFixed: false 
      }]);
      setDuplicateChecks({});
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
      
      // Check for existing bills in the same month
      const billsByMonthYear = {};
      const duplicateCheckPromises = [];
      
      // Group bills by month-year and check for duplicates
      for (const bill of billsToSave) {
        const date = new Date(bill.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!billsByMonthYear[monthYear]) {
          billsByMonthYear[monthYear] = [];
        }
        billsByMonthYear[monthYear].push(bill);
        
        // Check for duplicates
        duplicateCheckPromises.push(checkForDuplicateBills(bill.name, bill.date));
      }
      
      // Wait for all duplicate checks to complete
      const duplicateResults = await Promise.all(duplicateCheckPromises);
      
      // Check if any duplicates were found
      const hasExistingDuplicates = duplicateResults.some(result => result.isDuplicate);
      const duplicateMessages = [];
      
      duplicateResults.forEach((result, index) => {
        if (result.isDuplicate) {
          duplicateMessages.push(
            `"${billsToSave[index].name}" already exists in ${getMonthName(result.monthYear)}`
          );
        }
      });
      
      if (hasExistingDuplicates) {
        setMessage({ 
          type: 'error', 
          text: `❌ Cannot save: Some bills already exist in their respective months:\n\n• ${duplicateMessages.join('\n• ')}` 
        });
        setLoading(false);
        return;
      }
      
      // Format data for API - including note field
      const formattedBills = billsToSave.map(bill => ({
        ...bill,
        amount: parseFloat(bill.amount),
        date: bill.date || new Date().toISOString().split('T')[0],
        paymentMethod: bill.paymentMethod.toLowerCase().replace(' ', '_'),
        note: bill.note || "" // Include note field
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

  // Single bill editing functions
  const handleEditBill = (bill) => {
    setEditingBillId(bill._id);
    setEditBillForm({
      name: bill.name,
      amount: bill.amount.toString(),
      date: new Date(bill.date).toISOString().split('T')[0],
      paymentMethod: bill.paymentMethod,
      note: bill.note || "", // Added note field
      isFixed: bill.isFixed || false
    });
    
    // Scroll to the edit form
    setTimeout(() => {
      document.getElementById('bill-edit-form')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
  };

  const handleCancelEditBill = () => {
    setEditingBillId(null);
    setEditBillForm({
      name: "",
      amount: "",
      date: "",
      paymentMethod: "",
      note: "", // Added note field
      isFixed: false
    });
  };

  const handleUpdateBill = async () => {
    if (!editingBillId) return;

    // Validation
    if (!editBillForm.name || !editBillForm.amount || !editBillForm.date || !editBillForm.paymentMethod) {
      setMessage({ 
        type: 'error', 
        text: "Please fill in all required fields" 
      });
      return;
    }

    // Check for duplicates before updating
    try {
      const result = await checkForDuplicateBills(editBillForm.name, editBillForm.date, editingBillId);
      
      if (result.isDuplicate) {
        setMessage({ 
          type: 'error', 
          text: `❌ Cannot update: A bill named "${editBillForm.name}" already exists in ${getMonthName(result.monthYear)}. Please use a different name.` 
        });
        return;
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      setMessage({ 
        type: 'error', 
        text: "⚠️ Error checking for duplicates. Please try again." 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/bills/${editingBillId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editBillForm.name,
          amount: parseFloat(editBillForm.amount),
          date: editBillForm.date,
          paymentMethod: editBillForm.paymentMethod.toLowerCase().replace(' ', '_'),
          note: editBillForm.note || "" // Include note field
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ 
          type: 'success', 
          text: '✅ Bill updated successfully!' 
        });
        
        // Reset edit mode
        handleCancelEditBill();
        
        // Refresh data
        fetchAllData();
        
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ Error: ${data.message || data.error}` 
        });
      }
    } catch (error) {
      console.error('Error updating bill:', error);
      setMessage({ 
        type: 'error', 
        text: `❌ Error updating bill: ${error.message}` 
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
          note: bill.note || "", // Added note field
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
        note: "", // Added note field
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
      // Filter out empty bills
      const billsToSave = editFormData.filter(bill => 
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
      
      // Check for duplicates in edit form (case insensitive)
      const billNames = billsToSave.map(bill => bill.name.toLowerCase());
      const hasDuplicates = new Set(billNames).size !== billNames.length;
      
      if (hasDuplicates) {
        setMessage({ 
          type: 'error', 
          text: "❌ Duplicate bill names detected. Please remove duplicates before saving." 
        });
        setLoading(false);
        return;
      }
      
      // Check if any bills conflict with existing bills
      const [year, month] = editingMonth.split('-');
      const response = await fetch(`${API_URL}/bills/month/${year}/${month}`);
      const existingData = await response.json();
      
      if (existingData.success && existingData.data) {
        // Get current bill IDs being edited
        const existingBillIds = editFormData
          .filter(bill => bill._id)
          .map(bill => bill._id);
        
        // Find conflicting bills (same name but different ID)
        const conflicts = billsToSave.filter(newBill => {
          const existingBill = existingData.data.find(existingBill =>
            existingBill.name.toLowerCase() === newBill.name.toLowerCase() &&
            !existingBillIds.includes(existingBill._id)
          );
          return existingBill;
        });
        
        if (conflicts.length > 0) {
          const conflictMessages = conflicts.map(bill => 
            `"${bill.name}" already exists in ${getMonthName(editingMonth)}`
          );
          
          setMessage({ 
            type: 'error', 
            text: `❌ Cannot save: Some bills already exist in ${getMonthName(editingMonth)}:\n\n• ${conflictMessages.join('\n• ')}` 
          });
          setLoading(false);
          return;
        }
      }
      
      // Format data for API - including note field
      const formattedBills = billsToSave.map(bill => ({
        ...bill,
        amount: parseFloat(bill.amount),
        date: bill.date || new Date().toISOString().split('T')[0],
        paymentMethod: bill.paymentMethod.toLowerCase().replace(' ', '_'),
        note: bill.note || "" // Include note field
      }));
      
      // Send update request
      const updateResponse = await fetch(`${API_URL}/bills/update-month`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthYear: editingMonth,
          bills: formattedBills
        })
      });
      
      const data = await updateResponse.json();
      
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

  // Generate PDF report
  const generatePDF = () => {
    if (filteredBills.length === 0) {
      setMessage({ 
        type: 'error', 
        text: "No bills to download for the selected filters" 
      });
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
      doc.text("Utility Bills Report", pageWidth / 2, 20, { align: "center" });
      
      // Report Info
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
      // Filter information
      let filterInfo = "All Bills";
      if (filterYear !== "all" && filterMonth !== "all") {
        filterInfo = `${monthNames[parseInt(filterMonth) - 1]} ${filterYear}`;
      } else if (filterYear !== "all") {
        filterInfo = `Year: ${filterYear}`;
      } else if (filterMonth !== "all") {
        filterInfo = `Month: ${monthNames[parseInt(filterMonth) - 1]}`;
      }
      doc.text(`Report Type: ${filterInfo}`, 14, 36);
      doc.text(`Total Records: ${filteredBills.length}`, 14, 42);
      
      // Prepare table data - Using BDT instead of ৳ symbol for compatibility
      const tableData = filteredBills.map(bill => [
        bill.name,
        new Date(bill.date).toLocaleDateString(),
        `BDT ${bill.amount.toFixed(2)}`,
        bill.paymentMethod.replace('_', ' ').toUpperCase(),
        getMonthName(`${new Date(bill.date).getFullYear()}-${String(new Date(bill.date).getMonth() + 1).padStart(2, '0')}`),
        bill.note || "-" // Include note in PDF
      ]);
      
      // Add table using autoTable
      autoTable(doc, {
        startY: 50,
        head: [['Bill Name', 'Date', 'Amount (BDT)', 'Payment Method', 'Month', 'Note']],
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
          4: { cellWidth: 30 },
          5: { cellWidth: 35 }
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
      
      // Add summary section - Using BDT
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40);
      doc.text("SUMMARY", 14, lastY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Bills: ${filteredBills.length}`, 14, lastY + 8);
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
      const filename = `utility_bills_${timestamp}${filterSuffix}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      // Show success message
      setMessage({ 
        type: 'success', 
        text: `PDF downloaded successfully: ${filename}` 
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to generate PDF. Please try again.' 
      });
    }
  };

  // Helper functions
  const getTodayDate = () => new Date().toISOString().split("T")[0];
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
    if (!monthYear) return '';
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
      note: "", // Added note field
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

        {/* Stats Cards - Modified for BDT and removed average */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Spent</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalAmount)}
              </div>
              <div className="text-xs text-gray-400 mt-1">BDT</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Bills</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalBills}
              </div>
              <div className="text-xs text-gray-400 mt-1">Bills</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Months Tracked</div>
              <div className="text-2xl font-bold text-orange-600">
                {billsByMonth.length}
              </div>
              <div className="text-xs text-gray-400 mt-1">Months</div>
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
                  <div className="grid grid-cols-13 gap-3 text-sm font-medium text-gray-500 mb-4">
                    <div className="col-span-3">Bill Name *</div>
                    <div className="col-span-2">Amount (BDT) *</div>
                    <div className="col-span-2">Date *</div>
                    <div className="col-span-2">Payment Method *</div>
                    <div className="col-span-3">Note (Optional)</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>
                )}

                {/* Bill Rows */}
                {bills.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No bills added yet. Use "Quick Add" buttons or "Add Bill" button to start.
                  </div>
                ) : (
                  bills.map((bill, index) => {
                    const billDate = new Date(bill.date);
                    const monthYear = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
                    
                    return (
                      <div key={index} className="grid grid-cols-13 gap-3 items-center mb-4">
                        {/* Bill Name */}
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={bill.name}
                            onChange={(e) => updateBillField(index, "name", e.target.value)}
                            onBlur={(e) => {
                              updateBillField(index, "name", e.target.value);
                              checkBillDuplicate(e.target.value, bill.date, index);
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                              duplicateChecks[index] ? 'border-red-500 bg-red-50' : ''
                            }`}
                            placeholder="Enter bill name"
                            list="bill-suggestions"
                            required
                          />
                          <datalist id="bill-suggestions">
                            {commonBillTypes.map((type, i) => (
                              <option key={i} value={type} />
                            ))}
                          </datalist>
                          {duplicateChecks[index] && (
                            <p className="text-xs text-red-600 mt-1">
                              ⚠️ This bill already exists in {getMonthName(monthYear)}
                            </p>
                          )}
                        </div>

                        {/* Amount - Changed to BDT */}
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
                        <div className="col-span-2">
                          <input
                            type="date"
                            value={bill.date}
                            max={getTodayDate()}
                            onChange={(e) => {
                              updateBillField(index, "date", e.target.value);
                              checkBillDuplicate(bill.name, e.target.value, index);
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                              duplicateChecks[index] ? 'border-red-500 bg-red-50' : ''
                            }`}
                            required
                          />
                        </div>

                        {/* Payment Method */}
                        <div className="col-span-2">
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

                        {/* Note Field (Optional) */}
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={bill.note || ""}
                            onChange={(e) => updateBillField(index, "note", e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Optional note (e.g., 'Paid late', 'Discount applied')"
                          />
                       
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
                    );
                  })
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
                    disabled={loading || bills.length === 0 || Object.values(duplicateChecks).some(check => check)}
                    className={`flex-1 py-2 rounded-md transition-colors ${
                      loading || bills.length === 0 || Object.values(duplicateChecks).some(check => check)
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
                    <div className="flex items-center space-x-4">
                      <span className={`${
                        Object.values(duplicateChecks).some(check => check) 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                      }`}>
                        {Object.values(duplicateChecks).filter(check => check).length} duplicate(s) detected
                      </span>
                      <span className="text-green-600">
                        {bills.filter(b => b.name && b.amount && b.paymentMethod).length} ready to save
                      </span>
                    </div>
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
                    <div className="text-red-600 font-medium mt-1">
                      ⚠️ Note: Duplicate bill names are not allowed in the same month.
                    </div>
                  </div>
                </div>

                {/* Edit Form Header */}
                <div className="grid grid-cols-13 gap-3 text-sm font-medium text-gray-500 mb-4">
                  <div className="col-span-3">Bill Name</div>
                  <div className="col-span-2">Amount (BDT)</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Payment Method</div>
                  <div className="col-span-3">Note (Optional)</div>
                  <div className="col-span-1">Action</div>
                </div>

                {/* Edit Bill Rows */}
                {editFormData.map((bill, index) => (
                  <div key={index} className="grid grid-cols-13 gap-3 items-center mb-4">
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

                    {/* Amount - Changed to BDT */}
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
                    <div className="col-span-2">
                      <input
                        type="date"
                        value={bill.date}
                        max={getTodayDate()}
                        onChange={(e) => handleEditChange(index, "date", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="col-span-2">
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

                    {/* Note Field (Optional) */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={bill.note || ""}
                        onChange={(e) => handleEditChange(index, "note", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional note"
                      />
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

            {/* Edit Single Bill Form */}
            {editingBillId && (
              <div id="bill-edit-form" className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    ✏️ Edit Bill
                  </h2>
                  <button
                    onClick={handleCancelEditBill}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-3 mb-4">
                  {/* Bill Name */}
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bill Name *
                    </label>
                    <input
                      type="text"
                      value={editBillForm.name}
                      onChange={(e) => setEditBillForm({...editBillForm, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Enter bill name"
                    />
                  </div>

                  {/* Amount - Changed to BDT */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (BDT) *
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={editBillForm.amount}
                      onChange={(e) => setEditBillForm({...editBillForm, amount: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={editBillForm.date}
                      max={getTodayDate()}
                      onChange={(e) => setEditBillForm({...editBillForm, date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={editBillForm.paymentMethod}
                      onChange={(e) => setEditBillForm({...editBillForm, paymentMethod: e.target.value})}
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

                  {/* Note Field (Optional) */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={editBillForm.note || ""}
                      onChange={(e) => setEditBillForm({...editBillForm, note: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional note"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="col-span-1 flex items-end">
                    <button
                      onClick={handleUpdateBill}
                      disabled={loading}
                      className={`w-full py-2 rounded-md transition-colors ${
                        loading
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mt-4">
                  <p className="text-red-600 font-medium">
                    ⚠️ Note: The bill name must be unique for this month. If you change the date to a different month, the bill name must not already exist in that month.
                  </p>
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
                
                {/* PDF Download Button */}
                <div className="flex space-x-2">
                  {filteredBills.length > 0 && (
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
                </div>
              </div>
                
              {/* Year and Month Filter */}
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
                  <div className="ml-auto">
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
                        Amount (BDT)
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
                        Note
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs">
                            <div className="truncate" title={bill.note || "No note"}>
                              {bill.note || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditBill(bill)}
                                className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                title="Edit this bill"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBill(bill._id)}
                                className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete this bill"
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
                      <td colSpan="1" className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {filterYear !== "all" || filterMonth !== "all" ? "Filtered Total" : "Total"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(calculateFilteredTotal())}
                      </td>
                      <td colSpan="5" className="px-6 py-4 text-sm text-gray-500">
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

              {/* Summary Stats - Removed Average per Bill */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900">
                    {filterYear !== "all" || filterMonth !== "all" ? "Filtered Bills" : "Total Bills"}
                  </h4>
                  <p className="text-2xl font-bold text-blue-700">{filteredBills.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900">
                    {filterYear !== "all" || filterMonth !== "all" ? "Filtered Total Cost" : "Total Cost"}
                  </h4>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(calculateFilteredTotal())}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}