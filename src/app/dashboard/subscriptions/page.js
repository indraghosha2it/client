"use client";

import React, { useState, useEffect } from "react";

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

  // Fetch stored subscriptions on component mount
  useEffect(() => {
    fetchStoredSubscriptions();
  }, []);

  const fetchStoredSubscriptions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('http://localhost:5001/api/software-subscriptions');
      const data = await response.json();
      if (data.success) {
        setStoredSubscriptions(data.data);
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate total
  const calculateTotal = () => {
    return storedSubscriptions.reduce((total, sub) => total + sub.amount, 0);
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
            <div className="grid grid-cols-12 gap-3 text-sm font-semibold text-gray-600 px-1">
              <div className="col-span-3">Software Name</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Payment Method</div>
              <div className="col-span-2">Note (Optional)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-12 gap-3 items-center"
              >
                {/* Software Name */}
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="e.g. Adobe, Figma, Slack"
                    value={sub.softwareName}
                    onChange={(e) =>
                      updateField(sub.id, "softwareName", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Amount */}
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={sub.amount}
                    onChange={(e) =>
                      updateField(sub.id, "amount", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <input
                    type="date"
                    value={sub.date}
                    max={getTodayDate()}
                    onChange={(e) =>
                      updateField(sub.id, "date", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="col-span-2">
                  <select
                    value={sub.paymentMethod}
                    onChange={(e) =>
                      updateField(sub.id, "paymentMethod", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Optional note"
                    value={sub.note}
                    onChange={(e) =>
                      updateField(sub.id, "note", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Remove */}
                <div className="col-span-1">
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

            {/* Add More */}
            <button
              type="button"
              onClick={addSubscription}
              className="w-full border border-dashed border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              + Add More Subscriptions
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-2 rounded-md transition-colors ${
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-blue-300">
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
                  Amount *
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Stored Software Subscriptions</h3>
            <button
              onClick={fetchStoredSubscriptions}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
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
                        Amount
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
                    {storedSubscriptions.map((subscription) => (
                      <tr key={subscription._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.softwareName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(subscription.date)}
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
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(calculateTotal())}
                        </div>
                      </td>
                      <td colSpan="3" className="px-6 py-4 text-sm text-gray-500">
                        {storedSubscriptions.length} subscription(s)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900">Total Subscriptions</h4>
                  <p className="text-2xl font-bold text-blue-700">{storedSubscriptions.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900">Total Cost</h4>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(calculateTotal())}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-900">Average per Subscription</h4>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(storedSubscriptions.length > 0 ? calculateTotal() / storedSubscriptions.length : 0)}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-900">Unique Software</h4>
                  <p className="text-2xl font-bold text-yellow-700">
                    {[...new Set(storedSubscriptions.map(sub => sub.softwareName))].length}
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