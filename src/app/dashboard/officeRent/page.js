"use client";

import React, { useState, useEffect, useMemo } from "react";

export default function OfficeRent() {
  const [formData, setFormData] = useState({
    date: "",
    rent: "",
    status: "paid",
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

  const API_URL = "http://localhost:5001/api";

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Payment methods
  const paymentMethods = [
    "cash", "bank_transfer", "credit_card", "debit_card", "online", "other"
  ];

  // Fetch office rents when page loads
  useEffect(() => {
    fetchOfficeRents();
  }, []);

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
      const response = await fetch(`${API_URL}/office-rents`);
      
      if (!response.ok) {
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
        text: `Cannot connect to backend: ${error.message}` 
      });
      console.error("Error fetching office rents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to check for duplicate month-year entries (both for new and edit)
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
      
      const response = await fetch(`${API_URL}/office-rents/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const rent = data.data;
        setFormData({
          date: rent.date.split('T')[0],
          rent: rent.rent.toString(),
          status: rent.status,
          paymentMethod: rent.paymentMethod || "cash",
          note: rent.note || ""
        });
        setEditingId(id);
        setMessage({ 
          type: 'info', 
          text: `Editing rent record from ${new Date(rent.date).toLocaleDateString()}` 
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Failed to load rent data' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Failed to load rent record: ${error.message}` 
      });
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
            text: `❌ Cannot edit: A rent record for ${monthName} ${year} already exists. Please choose a different date.` 
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

      // Check for duplicate month-year (for both new entries and edits)
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
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        const actionText = editingId ? "updated" : "saved";
        setMessage({ 
          type: 'success', 
          text: `✅ Office rent ${actionText} successfully!` 
        });
        
        setFormData({
          date: "",
          rent: "",
          status: "paid",
          paymentMethod: "cash",
          note: ""
        });
        
        setEditingId(null);
        
        fetchOfficeRents();
        
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ ${data.message || data.error}` 
        });
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({ 
        type: 'error', 
        text: `❌ ${error.message}` 
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
      status: "paid",
      paymentMethod: "cash",
      note: ""
    });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  // Delete rent record
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rent record?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/office-rents/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${data.message}` 
        });
        if (editingId === id) {
          cancelEdit();
        }
        fetchOfficeRents();
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ ${data.message || data.error}` 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ Failed to delete rent record: ${error.message}` 
      });
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

  // Calculate total paid and unpaid for filtered rents
  const calculateFilteredStats = () => {
    const paid = filteredRents.filter(rent => rent.status === 'paid')
      .reduce((total, rent) => total + rent.rent, 0);
    const unpaid = filteredRents.filter(rent => rent.status === 'unpaid')
      .reduce((total, rent) => total + rent.rent, 0);
    
    return { paid, unpaid };
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
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
                  Rent Amount *
                </label>
                <input
                  type="number"
                  name="rent"
                  placeholder="Enter rent amount"
                  value={formData.rent}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
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
                  placeholder="Add any additional notes about this rent payment"
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
                      Filtered Total: ₹{calculateFilteredTotal().toLocaleString()}
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

            {/* Filtered Stats */}
            {(filterYear !== "all" || filterMonth !== "all") && filteredRents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900">Total Paid</h4>
                  <p className="text-xl font-bold text-green-700">
                    ₹{calculateFilteredStats().paid.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-red-900">Total Unpaid</h4>
                  <p className="text-xl font-bold text-red-700">
                    ₹{calculateFilteredStats().unpaid.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900">Filtered Total</h4>
                  <p className="text-xl font-bold text-blue-700">
                    ₹{calculateFilteredTotal().toLocaleString()}
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
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                                ₹{rent.rent.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${rent.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {rent.status === 'paid' ? 'Paid' : 'Unpaid'}
                              </span>
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
                            ₹{calculateFilteredTotal().toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col text-xs text-gray-600">
                            <span className="font-medium">
                              {filteredRents.filter(r => r.status === 'paid').length} Paid
                            </span>
                            <span className="font-medium">
                              {filteredRents.filter(r => r.status === 'unpaid').length} Unpaid
                            </span>
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
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}