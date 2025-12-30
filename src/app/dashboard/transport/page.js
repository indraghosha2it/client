"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

export default function TransportExpensePage() {
  const [transports, setTransports] = useState([
    {
      id: crypto.randomUUID(),
      transportName: "",
      cost: "",
      date: "",
      paymentMethod: "",
      note: "",
    },
  ]);

  const [storedTransports, setStoredTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    transportName: "",
    cost: "",
    date: "",
    paymentMethod: "",
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

  // Fetch stored transport expenses on component mount
  useEffect(() => {
    fetchStoredTransports();
  }, []);

  // Update available years and months when storedTransports changes
  useEffect(() => {
    if (storedTransports.length > 0) {
      // Extract unique years from stored transports
      const years = Array.from(
        new Set(
          storedTransports.map(expense => {
            const date = new Date(expense.date);
            return date.getFullYear();
          })
        )
      ).sort((a, b) => b - a);

      setAvailableYears(years);

      // If a year is selected, update available months
      if (filterYear !== "all") {
        const yearExpenses = storedTransports.filter(expense => {
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
  }, [storedTransports, filterYear]);

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

  const fetchStoredTransports = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('http://localhost:5001/api/transport-expenses');
      const data = await response.json();
      if (data.success) {
        // Sort transports by date in descending order (newest first)
        const sortedTransports = [...data.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        setStoredTransports(sortedTransports);
      } else {
        setError(data.message || 'Failed to load transport expenses');
      }
    } catch (error) {
      console.error('Error fetching transport expenses:', error);
      setError('Network error. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort transports based on selected filters
  const filteredTransports = useMemo(() => {
    let filtered = storedTransports;

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

    // Already sorted in fetchStoredTransports, but ensure sorting here too
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [storedTransports, filterDate, filterYear, filterMonth]);

  const updateField = (id, field, value) => {
    setTransports(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addTransport = () => {
    setTransports(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        transportName: "",
        cost: "",
        date: "",
        paymentMethod: "",
        note: "",
      },
    ]);
  };

  const removeTransport = (id) => {
    if (transports.length === 1) return;
    setTransports(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Filter out empty rows
    const validTransports = transports.filter(
      item => item.transportName.trim() && item.cost && item.date
    );

    if (validTransports.length === 0) {
      setError("Please add at least one transport expense");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/transport-expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validTransports),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Successfully saved ${data.data.length} transport expense(s)`);
        // Reset form
        setTransports([{
          id: crypto.randomUUID(),
          transportName: "",
          cost: "",
          date: "",
          paymentMethod: "",
          note: "",
        }]);
        // Refresh stored expenses
        fetchStoredTransports();
        
        if (data.warnings && data.warnings.length > 0) {
          console.warn('Warnings:', data.warnings);
        }
      } else {
        setError(data.message || 'Failed to save transport expenses');
      }
    } catch (error) {
      console.error('Error saving transport expenses:', error);
      setError('Network error. Please check if server is running.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTransport = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      transportName: expense.transportName,
      date: new Date(expense.date).toISOString().split('T')[0],
      cost: expense.cost.toString(),
      paymentMethod: expense.paymentMethod,
      note: expense.note || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      transportName: "",
      cost: "",
      date: "",
      paymentMethod: "",
      note: ""
    });
  };

  const handleUpdateTransport = async () => {
    if (!editingId) return;

    // Validation
    if (!editForm.transportName.trim() || !editForm.cost || !editForm.date) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`http://localhost:5001/api/transport-expenses/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transportName: editForm.transportName,
          date: editForm.date,
          cost: parseFloat(editForm.cost),
          paymentMethod: editForm.paymentMethod,
          note: editForm.note
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Transport expense updated successfully');
        // Refresh the list
        fetchStoredTransports();
        // Reset edit mode
        setEditingId(null);
        setEditForm({
          transportName: "",
          cost: "",
          date: "",
          paymentMethod: "",
          note: ""
        });
      } else {
        setError(data.message || 'Failed to update transport expense');
      }
    } catch (error) {
      console.error('Error updating transport expense:', error);
      setError('Failed to update transport expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transport expense?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/transport-expenses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Transport expense deleted successfully');
        // Refresh the list
        fetchStoredTransports();
      } else {
        setError(data.message || 'Failed to delete transport expense');
      }
    } catch (error) {
      console.error('Error deleting transport expense:', error);
      setError('Failed to delete transport expense');
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate total for filtered transports
  const calculateFilteredTotal = () => {
    return filteredTransports.reduce((total, expense) => total + expense.cost, 0);
  };

  // Calculate total for all transports
  const calculateTotal = () => {
    return storedTransports.reduce((total, expense) => total + expense.cost, 0);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterDate("");
    setFilterMonth("all");
    setFilterYear("all");
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

  // Check if any filter is active
  const isFilterActive = filterDate || filterYear !== "all" || filterMonth !== "all";

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-center text-gray-800">
            Transport Expense Management
          </h2>
          <p className="text-sm md:text-base text-center text-gray-600 mt-2">
            Track and manage all your transportation expenses
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add New Transport Expenses</h3>
            <button
              onClick={addTransport}
              className="md:hidden px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-sm"
            >
              + Add
            </button>
          </div>
          
          {/* Messages */}
          {error && !editingId && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && !editingId && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header Row - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-semibold text-gray-600 px-1">
              <div className="col-span-3">Transportation Name</div>
              <div className="col-span-2">Cost</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Payment Method</div>
              <div className="col-span-2">Note (Optional)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {transports.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-center p-3 md:p-0 md:border-0 border border-gray-200 rounded-md mb-3 md:mb-0"
              >
                {/* Mobile View - Vertical Layout */}
                <div className="md:hidden space-y-3 w-full">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Transportation Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bus, Uber, Fuel"
                        value={item.transportName}
                        onChange={(e) =>
                          updateField(item.id, "transportName", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cost *
                      </label>
                      <input
                        type="number"
                        placeholder="Cost"
                        value={item.cost}
                        onChange={(e) =>
                          updateField(item.id, "cost", e.target.value)
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
                      value={item.note}
                      onChange={(e) =>
                        updateField(item.id, "note", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {transports.length > 1 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => removeTransport(item.id)}
                        className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        Remove This Entry
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop View - Grid Layout */}
                {/* Transportation Name */}
                <div className="hidden md:block col-span-3">
                  <input
                    type="text"
                    placeholder="e.g. Bus, Uber, Fuel"
                    value={item.transportName}
                    onChange={(e) =>
                      updateField(item.id, "transportName", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Cost */}
                <div className="hidden md:block col-span-2">
                  <input
                    type="number"
                    placeholder="Cost"
                    value={item.cost}
                    onChange={(e) =>
                      updateField(item.id, "cost", e.target.value)
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
                    value={item.note}
                    onChange={(e) =>
                      updateField(item.id, "note", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Remove - Desktop */}
                <div className="hidden md:block col-span-1">
                  {transports.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTransport(item.id)}
                      className="w-full py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add More Button */}
            <div className="flex flex-col md:flex-row gap-3 mt-3">
              <button
                type="button"
                onClick={addTransport}
                className="hidden md:block w-full border border-dashed border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
              >
                + Add More Transport
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
                {saving ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Transport Expenses'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Edit Form Section with ref */}
        {editingId && (
          <div 
            ref={editFormRef} 
            className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8 border-2 border-blue-300"
            id="edit-form-section"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base md:text-lg font-semibold text-blue-700">
                ✏️ Edit Transport Expense
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 text-sm md:text-base"
              >
                ✕ Close
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-3 items-start">
              {/* Transport Name */}
              <div className="md:col-span-3">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Transportation Name *
                </label>
                <input
                  type="text"
                  value={editForm.transportName}
                  onChange={(e) => setEditForm({...editForm, transportName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                  placeholder="e.g., Bus, Uber, Fuel"
                />
              </div>

              {/* Cost */}
              <div className="md:col-span-2 mt-3 md:mt-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Cost *
                </label>
                <input
                  type="number"
                  value={editForm.cost}
                  onChange={(e) => setEditForm({...editForm, cost: e.target.value})}
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
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Banking">Mobile Banking</option>
                  <option value="Card">Card</option>
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
                  onClick={handleUpdateTransport}
                  disabled={saving}
                  className={`flex-1 py-3 md:py-2 rounded-md transition-colors text-sm md:text-base ${
                    saving
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stored Transport Expenses Table Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold">Stored Transport Expenses</h3>
              <div className="mt-1 text-sm text-gray-600">
                {isFilterActive ? (
                  <span>
                    Showing {filteredTransports.length} of {storedTransports.length} expense(s)
                  </span>
                ) : (
                  <span>Total: {storedTransports.length} expense(s)</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mobile Filters Toggle */}
              <button
                onClick={toggleMobileFilters}
                className="md:hidden px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Filters
              </button>
              
              <button
                onClick={fetchStoredTransports}
                disabled={loading}
                className="px-3 md:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-sm md:text-base"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
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
                  ✕
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
                    <div className="flex flex-wrap items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="text-xs text-blue-700">
                        {filterDate && `Date: ${new Date(filterDate).toLocaleDateString()}`}
                        {filterDate && (filterYear !== "all" || filterMonth !== "all") && ", "}
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
                {isFilterActive && (
                  <div className="w-full md:w-auto flex md:items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full md:w-auto px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count - Desktop only */}
              <div className="hidden md:block ml-auto text-right">
                <span className="text-sm text-gray-600">
                  Showing {filteredTransports.length} of {storedTransports.length} record(s)
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
                  Showing {filteredTransports.length} of {storedTransports.length}
                </span>
                {isFilterActive && (
                  <span className="text-sm font-medium text-green-600">
                    Total: {formatCurrency(calculateFilteredTotal())}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sort Indicator */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
            </svg>
            <p className="text-xs md:text-sm text-blue-800">
              <strong>Sorted by:</strong> Date (Newest to Oldest)
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm md:text-base">Loading transport expenses...</p>
            </div>
          ) : filteredTransports.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm md:text-base">
              {isFilterActive ? (
                <div>
                  <p>No transport expenses found for the selected filters.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                "No transport expenses stored yet. Add some using the form above."
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredTransports.map((expense, index) => (
                  <div key={expense._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{expense.transportName}</h4>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(expense.date)}
                          {index === 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              Newest
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700">{formatCurrency(expense.cost)}</div>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                          {expense.paymentMethod}
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
                        onClick={() => handleEditTransport(expense)}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTransport(expense._id)}
                        className="flex-1 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
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
                    {filteredTransports.length} expense(s)
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transport Name
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
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
                    {filteredTransports.map((expense, index) => (
                      <tr key={expense._id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.transportName}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(expense.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {monthNames[new Date(expense.date).getMonth()]} {new Date(expense.date).getFullYear()}
                          </div>
                          {index === 0 && (
                            <div className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              Newest
                            </div>
                          )}
                          {index === filteredTransports.length - 1 && filteredTransports.length > 1 && (
                            <div className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                              Oldest
                            </div>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatCurrency(expense.cost)}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {expense.paymentMethod}
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
                              onClick={() => handleEditTransport(expense)}
                              className="text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTransport(expense._id)}
                              className="text-red-600 hover:text-red-900 transition-colors px-3 py-1 bg-red-50 hover:bg-red-100 rounded flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
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
                          Sorted: Newest to Oldest
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(calculateFilteredTotal())}
                        </div>
                      </td>
                      <td colSpan="3" className="px-4 md:px-6 py-4 text-sm text-gray-500">
                        {filteredTransports.length} expense(s)
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
                  <p className="text-xl md:text-2xl font-bold text-blue-700">{filteredTransports.length}</p>
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
                    {formatCurrency(filteredTransports.length > 0 ? calculateFilteredTotal() / filteredTransports.length : 0)}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 md:p-4 rounded-lg">
                  <h4 className="text-xs md:text-sm font-medium text-yellow-900">Transport Types</h4>
                  <p className="text-xl md:text-2xl font-bold text-yellow-700">
                    {[...new Set(filteredTransports.map(expense => expense.transportName))].length}
                  </p>
                </div>
              </div>

              {/* Transport Type Breakdown */}
              {filteredTransports.length > 0 && (
                <div className="mt-6 md:mt-8">
                  <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                    {isFilterActive ? "Filtered Transport Type Breakdown" : "Transport Type Breakdown"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {Object.entries(
                      filteredTransports.reduce((acc, expense) => {
                        acc[expense.transportName] = (acc[expense.transportName] || 0) + expense.cost;
                        return acc;
                      }, {})
                    ).map(([transportName, totalCost]) => (
                      <div key={transportName} className="bg-gray-50 p-3 md:p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-xs md:text-sm font-medium text-gray-700 truncate mr-2">{transportName}</span>
                          <span className="text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(totalCost / calculateFilteredTotal()) * 100}%` 
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
    </div>
  );
}