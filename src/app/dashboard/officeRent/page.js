"use client";

import React, { useState, useEffect } from "react";

export default function OfficeRent() {
  const [formData, setFormData] = useState({
    date: "",
    rent: "",
    status: "paid",
  });

  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalUnpaid: 0,
    totalRecords: 0,
    totalAmount: 0
  });

  const API_URL = "http://localhost:5000/api";

  // Fetch office rents when page loads
  useEffect(() => {
    fetchOfficeRents();
    fetchSummary();
  }, []);

  // Fetch all office rents
  const fetchOfficeRents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/office-rents`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRents(data.data);
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

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/office-rents/summary`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSummary(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
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
          date: rent.date.split('T')[0], // Format date for input
          rent: rent.rent.toString(),
          status: rent.status
        });
        setEditingId(id);
        setMessage({ 
          type: 'info', 
          text: `Editing rent record from ${new Date(rent.date).toLocaleDateString()}` 
        });
        
        // Scroll to form
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
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
        
        // Reset form
        setFormData({
          date: "",
          rent: "",
          status: "paid",
        });
        
        setEditingId(null);
        
        // Refresh data
        fetchOfficeRents();
        fetchSummary();
        
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
        text: `❌ Failed to save office rent: ${error.message}` 
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
        // If we're editing this record, cancel edit mode
        if (editingId === id) {
          cancelEdit();
        }
        // Refresh data
        fetchOfficeRents();
        fetchSummary();
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

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Office Rent Management
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">Total Records</div>
            <div className="text-2xl font-bold">{summary.totalRecords}</div>
          </div>
          <div className="bg-green-50 rounded-xl shadow p-4">
            <div className="text-sm text-green-600">Total Paid</div>
            <div className="text-2xl font-bold text-green-700">
              ₹{summary.totalPaid.toLocaleString()}
            </div>
          </div>
          <div className="bg-red-50 rounded-xl shadow p-4">
            <div className="text-sm text-red-600">Total Unpaid</div>
            <div className="text-2xl font-bold text-red-700">
              ₹{summary.totalUnpaid.toLocaleString()}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl shadow p-4">
            <div className="text-sm text-blue-600">Total Amount</div>
            <div className="text-2xl font-bold text-blue-700">
              ₹{summary.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

            {/* Message Display */}
            {message.text && (
              <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : message.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' : 'bg-blue-100 border border-blue-300 text-blue-800'}`}>
                <div className="flex items-center">
                  <span className="mr-2">
                    {message.type === 'success' ? '✅' : 
                     message.type === 'error' ? '❌' : 
                     '📝'}
                  </span>
                  <span>{message.text}</span>
                </div>
              </div>
            )}

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
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

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${editingId ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
                    editingId ? 'Update Rent Record' : 'Save Rent to Database'
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
                Rent Records ({rents.length})
              </h2>
              <button
                onClick={fetchOfficeRents}
                disabled={loading}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading rent records...</p>
              </div>
            ) : rents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No rent records yet</h3>
                <p className="text-gray-500">Add your first rent record using the form on the left!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    {rents.map((rent) => (
                      <tr key={rent._id} className={`hover:bg-gray-50 ${editingId === rent._id ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {formatDate(rent.date)}
                          </div>
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Database Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Database Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Data stored in MongoDB Atlas collection: <code className="bg-gray-200 px-1 rounded">officerents</code></p>
                <p>• Each record has unique ID and timestamps</p>
                <p>• CRUD operations fully functional</p>
                <p>• Status tracking with color coding</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}