"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SoftwareSubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([
    {
      id: crypto.randomUUID(),
      softwareName: "",
      amount: "",
      date: "",
      paymentMethod: "",
      note: "",
    },
  ]);

  const [storedSubscriptions, setStoredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    softwareName: "",
    amount: "",
    date: "",
    paymentMethod: "",
    note: ""
  });

  // Filter states
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);

  // Ref for edit form
  const editFormRef = useRef(null);

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Currency symbol for Bangladeshi Taka
  const currencySymbol = "৳";

  // Fetch stored subscriptions on component mount
  useEffect(() => {
    fetchStoredSubscriptions();
  }, []);

  // Update years and months when subscriptions change
  useEffect(() => {
    if (storedSubscriptions.length > 0) {
      const uniqueYears = Array.from(
        new Set(
          storedSubscriptions.map(sub => {
            const date = new Date(sub.date);
            return date.getFullYear();
          })
        )
      ).sort((a, b) => b - a); // Sort descending (newest first)

      setYears(uniqueYears);

      // If a year is selected, update available months
      if (selectedYear !== "all") {
        const yearSubscriptions = storedSubscriptions.filter(sub => {
          const date = new Date(sub.date);
          return date.getFullYear().toString() === selectedYear;
        });

        const uniqueMonths = Array.from(
          new Set(
            yearSubscriptions.map(sub => {
              const date = new Date(sub.date);
              return date.getMonth() + 1; // Months are 0-indexed in JS
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
  }, [storedSubscriptions, selectedYear]);

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

  const fetchStoredSubscriptions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('http://localhost:5001/api/software-subscriptions');
      const data = await response.json();
      if (data.success) {
        // Sort subscriptions by date in descending order (newest first)
        const sortedSubscriptions = [...data.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        setStoredSubscriptions(sortedSubscriptions);
      } else {
        setError(data.message || 'Failed to load subscriptions');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Network error. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Filter subscriptions based on selected year and month
  const filteredSubscriptions = useMemo(() => {
    return storedSubscriptions.filter(sub => {
      const date = new Date(sub.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString(); // Convert to 1-indexed month

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
  }, [storedSubscriptions, selectedYear, selectedMonth]);

  // Generate PDF function
  const generatePDF = () => {
    if (filteredSubscriptions.length === 0) {
      setError("No subscriptions to download");
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
      doc.text("Software Subscriptions Report", pageWidth / 2, 20, { align: "center" });
      
      // Company/Report Info
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
      // Filter information
      let filterInfo = "All Subscriptions";
      if (selectedYear !== "all" || selectedMonth !== "all") {
        filterInfo = `Filter: ${selectedYear !== "all" ? `Year: ${selectedYear}` : ""} ${selectedMonth !== "all" ? `Month: ${monthNames[parseInt(selectedMonth) - 1]}` : ""}`;
      }
      doc.text(`Report Type: ${filterInfo}`, 14, 36);
      doc.text(`Total Records: ${filteredSubscriptions.length}`, 14, 42);
      
      // Prepare table data - Use "BDT" instead of ৳ symbol
      const tableData = filteredSubscriptions.map(subscription => [
        subscription.softwareName,
        new Date(subscription.date).toLocaleDateString(),
        `BDT ${subscription.amount.toFixed(2)}`,
        subscription.paymentMethod,
        subscription.note || "-"
      ]);
      
      // Add table using autoTable
      autoTable(doc, {
        startY: 50,
        head: [['Software Name', 'Date', 'Amount (BDT)', 'Payment Method', 'Note']],
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
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 35 },
          4: { cellWidth: 40 }
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
      const totalAmount = calculateTotal();
      const lastY = doc.lastAutoTable.finalY + 10;
      
      // Add summary section - Use "BDT" instead of ৳ symbol
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40);
      doc.text("SUMMARY", 14, lastY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Subscriptions: ${filteredSubscriptions.length}`, 14, lastY + 8);
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
      const isFilterActive = selectedYear !== "all" || selectedMonth !== "all";
      const filterSuffix = isFilterActive ? '_filtered' : '';
      const filename = `software_subscriptions_${timestamp}${filterSuffix}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      // Show success message
      setSuccess(`PDF downloaded successfully: ${filename}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const updateField = (id, field, value) => {
    setSubscriptions(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addSubscription = () => {
    setSubscriptions(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        softwareName: "",
        amount: "",
        date: "",
        paymentMethod: "",
        note: "",
      },
    ]);
  };

  const removeSubscription = (id) => {
    if (subscriptions.length === 1) return;
    setSubscriptions(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Filter out empty rows
    const validSubscriptions = subscriptions.filter(
      sub => sub.softwareName.trim() && sub.amount && sub.date
    );

    if (validSubscriptions.length === 0) {
      setError("Please add at least one subscription");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/software-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validSubscriptions),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Successfully saved ${data.data.length} subscription(s)`);
        // Reset form
        setSubscriptions([{
          id: crypto.randomUUID(),
          softwareName: "",
          amount: "",
          date: "",
          paymentMethod: "",
          note: "",
        }]);
        // Refresh stored subscriptions
        fetchStoredSubscriptions();
        
        // Show warnings if any
        if (data.warnings && data.warnings.length > 0) {
          console.warn('Warnings:', data.warnings);
        }
      } else {
        setError(data.message || 'Failed to save subscriptions');
      }
    } catch (error) {
      console.error('Error saving subscriptions:', error);
      setError('Network error. Please check if server is running.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubscription = (subscription) => {
    setEditingId(subscription._id);
    setEditForm({
      softwareName: subscription.softwareName,
      date: new Date(subscription.date).toISOString().split('T')[0],
      amount: subscription.amount.toString(),
      paymentMethod: subscription.paymentMethod,
      note: subscription.note || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      softwareName: "",
      amount: "",
      date: "",
      paymentMethod: "",
      note: ""
    });
  };

  const handleUpdateSubscription = async () => {
    if (!editingId) return;

    // Validation
    if (!editForm.softwareName.trim() || !editForm.amount || !editForm.date) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`http://localhost:5001/api/software-subscriptions/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          softwareName: editForm.softwareName,
          date: editForm.date,
          amount: parseFloat(editForm.amount),
          paymentMethod: editForm.paymentMethod,
          note: editForm.note
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Subscription updated successfully');
        // Refresh the list
        fetchStoredSubscriptions();
        // Reset edit mode
        setEditingId(null);
        setEditForm({
          softwareName: "",
          amount: "",
          date: "",
          paymentMethod: "",
          note: ""
        });
      } else {
        setError(data.message || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/software-subscriptions/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Subscription deleted successfully');
        // Refresh the list
        fetchStoredSubscriptions();
      } else {
        setError(data.message || 'Failed to delete subscription');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setError('Failed to delete subscription');
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

  // Calculate total for filtered subscriptions
  const calculateTotal = () => {
    return filteredSubscriptions.reduce((total, sub) => total + sub.amount, 0);
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedMonth("all"); // Reset month when year changes
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

  // Calculate form total
  const calculateFormTotal = () => {
    return subscriptions.reduce((total, subscription) => {
      const amount = parseFloat(subscription.amount) || 0;
      return total + amount;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Software Subscriptions Management
        </h2>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Add New Subscriptions</h3>
          
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
            {/* Header Row */}
            <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-semibold text-gray-600 px-1">
              <div className="col-span-3">Software Name</div>
              <div className="col-span-2">Amount (৳)</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Payment Method</div>
              <div className="col-span-2">Note (Optional)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-center p-3 md:p-0 md:border-0 border border-gray-200 rounded-md mb-3 md:mb-0"
              >
                {/* Mobile View - Vertical Layout */}
                <div className="md:hidden space-y-3 w-full">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Software Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Adobe, Figma, Slack"
                        value={sub.softwareName}
                        onChange={(e) =>
                          updateField(sub.id, "softwareName", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Amount (৳) *
                      </label>
                      <input
                        type="number"
                        placeholder="Amount in ৳"
                        value={sub.amount}
                        onChange={(e) =>
                          updateField(sub.id, "amount", e.target.value)
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
                        value={sub.date}
                        max={getTodayDate()}
                        onChange={(e) =>
                          updateField(sub.id, "date", e.target.value)
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
                        value={sub.paymentMethod}
                        onChange={(e) =>
                          updateField(sub.id, "paymentMethod", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Mobile Banking">Mobile Banking</option>
                        <option value="Card">Card</option>
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
                      value={sub.note}
                      onChange={(e) =>
                        updateField(sub.id, "note", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {subscriptions.length > 1 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => removeSubscription(sub.id)}
                        className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        Remove This Entry
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop View - Grid Layout */}
                {/* Software Name */}
                <div className="hidden md:block col-span-3">
                  <input
                    type="text"
                    placeholder="e.g. Adobe, Figma, Slack"
                    value={sub.softwareName}
                    onChange={(e) =>
                      updateField(sub.id, "softwareName", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Amount */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="number"
                    placeholder="Amount in ৳"
                    value={sub.amount}
                    onChange={(e) =>
                      updateField(sub.id, "amount", e.target.value)
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
                    value={sub.date}
                    max={getTodayDate()}
                    onChange={(e) =>
                      updateField(sub.id, "date", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="hidden md:block col-span-2">
                  <select
                    value={sub.paymentMethod}
                    onChange={(e) =>
                      updateField(sub.id, "paymentMethod", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                {/* Note (Optional) */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="text"
                    placeholder="Optional note"
                    value={sub.note}
                    onChange={(e) =>
                      updateField(sub.id, "note", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Remove - Desktop */}
                <div className="hidden md:block col-span-1">
                  {subscriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubscription(sub.id)}
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

            {/* Add More */}
            <button
              type="button"
              onClick={addSubscription}
              className="hidden md:block w-full border border-dashed border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              + Add More Subscriptions
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 md:py-2 rounded-md transition-colors text-sm md:text-base ${
                saving
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {saving ? 'Saving...' : 'Save Subscriptions'}
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
                ✏️ Edit Software Subscription
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Close
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}

            <div className="grid grid-cols-12 gap-3 items-start">
              {/* Software Name */}
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Software Name *
                </label>
                <input
                  type="text"
                  value={editForm.softwareName}
                  onChange={(e) => setEditForm({...editForm, softwareName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Adobe Creative Cloud"
                />
              </div>

              {/* Amount */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (৳) *
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div className="col-span-2">
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

              {/* Note */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional note"
                />
              </div>

              {/* Action Buttons */}
              <div className="col-span-1 flex space-x-2 pt-6">
                <button
                  onClick={handleUpdateSubscription}
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

        {/* Stored Subscriptions Table Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Stored Software Subscriptions</h3>
              <div className="mt-1 text-sm text-gray-600">
                {selectedYear !== "all" || selectedMonth !== "all" ? (
                  <span>
                    Showing {filteredSubscriptions.length} of {storedSubscriptions.length} subscription(s)
                  </span>
                ) : (
                  <span>Total: {storedSubscriptions.length} subscription(s)</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* PDF Download Button */}
              {filteredSubscriptions.length > 0 && (
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
                onClick={fetchStoredSubscriptions}
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
                        {selectedYear !== "all" && `Year: ${selectedYear}`}
                        {selectedYear !== "all" && selectedMonth !== "all" && ", "}
                        {selectedMonth !== "all" && `Month: ${monthNames[parseInt(selectedMonth) - 1]}`}
                      </span>
                      <button
                        onClick={resetFilters}
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
                  Showing {filteredSubscriptions.length} of {storedSubscriptions.length} subscription(s)
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading subscriptions...</p>
            </div>
          ) : storedSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No subscriptions stored yet. Add some using the form above.
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No subscriptions found for the selected filters. Try changing your filter criteria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Software Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount (৳)
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
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.softwareName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(subscription.date)}
                            <div className="text-xs text-gray-500">
                              {monthNames[new Date(subscription.date).getMonth()]} {new Date(subscription.date).getFullYear()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatCurrency(subscription.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {subscription.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {subscription.note || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSubscription(subscription)}
                              className="text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubscription(subscription._id)}
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
                            {selectedYear !== "all" && `Year: ${selectedYear}`}
                            {selectedYear !== "all" && selectedMonth !== "all" && " • "}
                            {selectedMonth !== "all" && `Month: ${monthNames[parseInt(selectedMonth) - 1]}`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(calculateTotal())}
                        </div>
                      </td>
                      <td colSpan="3" className="px-6 py-4 text-sm text-gray-500">
                        {filteredSubscriptions.length} subscription(s)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Removed Average per Subscription stat */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900">
                    {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Subscriptions" : "Total Subscriptions"}
                  </h4>
                  <p className="text-2xl font-bold text-blue-700">{filteredSubscriptions.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900">
                    {selectedYear !== "all" || selectedMonth !== "all" ? "Filtered Total Cost" : "Total Cost"}
                  </h4>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(calculateTotal())}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-900">Unique Software</h4>
                  <p className="text-2xl font-bold text-yellow-700">
                    {[...new Set(filteredSubscriptions.map(sub => sub.softwareName))].length}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}