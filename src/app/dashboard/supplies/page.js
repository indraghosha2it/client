"use client";

import React, { useState, useEffect } from "react";

export default function OfficeSupplyPage() {
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

  // Fetch stored supplies on component mount
  useEffect(() => {
    fetchStoredSupplies();
  }, []);

  const fetchStoredSupplies = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/office-supplies');
      const data = await response.json();
      if (data.success) {
        setStoredSupplies(data.data);
      }
    } catch (error) {
      console.error('Error fetching supplies:', error);
      setError('Failed to load stored supplies');
    } finally {
      setLoading(false);
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
      const response = await fetch('http://localhost:5001/api/office-supplies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validSupplies),
      });

      const data = await response.json();

      if (response.ok && data.success) {
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
      const response = await fetch(`http://localhost:5001/api/office-supplies/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          date: editForm.date,
          price: parseFloat(editForm.price),
          paymentMethod: editForm.paymentMethod
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
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
      const response = await fetch(`http://localhost:5001/api/office-supplies/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate total
  const calculateTotal = () => {
    return storedSupplies.reduce((total, supply) => total + supply.price, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Office Supply Expense Management
        </h2>

      

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
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-3 text-sm font-semibold text-gray-600 px-1">
              <div className="col-span-4">Supply Name</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Payment Method</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {supplies.map((supply, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center">
                {/* Supply Name */}
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="e.g., Printer Paper, Pens, etc."
                    value={supply.name}
                    onChange={(e) =>
                      updateSupplyField(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Price */}
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={supply.price}
                    onChange={(e) =>
                      updateSupplyField(index, "price", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Date */}
                <div className="col-span-3">
                  <input
                    type="date"
                    value={supply.date}
                    max={getTodayDate()}
                    onChange={(e) =>
                      updateSupplyField(index, "date", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="col-span-2">
                  <select
                    value={supply.paymentMethod}
                    onChange={(e) =>
                      updateSupplyField(index, "paymentMethod", e.target.value)
                    }
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

                {/* Remove Button */}
                <div className="col-span-1">
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

            {/* Add More Supplies Button */}
            <button
              type="button"
              onClick={addSupply}
              className="w-full border border-dashed border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              + Add More Supplies
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-2 rounded-md transition-colors ${
                saving
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {saving ? 'Saving...' : 'Save Supplies'}
            </button>
          </form>
        </div>

        {/* Edit Form Section - Now appears inline */}
        {editingId && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-blue-300">
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
            
            {/* {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )} */}

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
                  Price *
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Stored Office Supplies</h3>
            <button
              onClick={fetchStoredSupplies}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
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
                        Price
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
                    {storedSupplies.map((supply) => (
                      <tr key={supply._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {supply.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(supply.date)}
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
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(calculateTotal())}
                        </div>
                      </td>
                      <td colSpan="2" className="px-6 py-4 text-sm text-gray-500">
                        {storedSupplies.length} item(s)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900">Total Items</h4>
                  <p className="text-2xl font-bold text-blue-700">{storedSupplies.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900">Total Cost</h4>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(calculateTotal())}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-900">Average per Item</h4>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(storedSupplies.length > 0 ? calculateTotal() / storedSupplies.length : 0)}
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