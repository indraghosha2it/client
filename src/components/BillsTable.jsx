"use client";

import React, { useState, useEffect } from "react";

export default function BillsTable() {
  const [billsByMonth, setBillsByMonth] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [billTypes, setBillTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthDetails, setMonthDetails] = useState([]);
  const [activeView, setActiveView] = useState("monthly"); // "monthly" or "detailed"

  // API base URL
  const API_URL = "http://localhost:5004/api";

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bills grouped by month
      const billsResponse = await fetch(`${API_URL}/bills/by-month`);
      const billsData = await billsResponse.json();
      
      if (billsData.success) {
        setBillsByMonth(billsData.data);
        
        // Calculate month details for table
        const details = billsData.data.map(month => {
          return {
            month: month.monthName,
            total: month.total,
            ...month.billTypes
          };
        });
        setMonthDetails(details);
      }
      
      // Fetch all individual bills
      const allBillsResponse = await fetch(`${API_URL}/bills`);
      const allBillsData = await allBillsResponse.json();
      
      if (allBillsData.success) {
        setAllBills(allBillsData.data);
      }
      
      // Fetch unique bill types
      const typesResponse = await fetch(`${API_URL}/bills/types`);
      const typesData = await typesResponse.json();
      
      if (typesData.success) {
        setBillTypes(typesData.data);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle delete bill
  const handleDeleteBill = async (id) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    
    try {
      const response = await fetch(`${API_URL}/bills/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Bill deleted successfully');
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Error deleting bill');
    }
  };

  // Get month name from month-year string
  const getMonthName = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading bills data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Utility Bills Overview</h1>
          <p className="text-gray-600 mt-2">Monthly breakdown of utility expenses</p>
        </div>

        {/* Toggle Views */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveView("monthly")}
            className={`px-4 py-2 rounded-md ${
              activeView === "monthly"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Monthly View
          </button>
          <button
            onClick={() => setActiveView("detailed")}
            className={`px-4 py-2 rounded-md ${
              activeView === "detailed"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Detailed View
          </button>
        </div>

        {/* Monthly Summary Table */}
        {activeView === "monthly" && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-8 overflow-x-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Bills Summary</h2>
            
            {billsByMonth.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No bills data available. Add some bills to see the monthly breakdown.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      {billTypes.map((type, index) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {type}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billsByMonth.map((monthData, index) => (
                      <tr 
                        key={index}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedMonth(monthData.month)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {monthData.monthName}
                        </td>
                        {billTypes.map((type, typeIndex) => (
                          <td key={typeIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(monthData.billTypes[type] || 0)}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formatCurrency(monthData.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Total Row */}
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        Overall Total
                      </td>
                      {billTypes.map((type, typeIndex) => {
                        const typeTotal = billsByMonth.reduce((sum, month) => 
                          sum + (month.billTypes[type] || 0), 0
                        );
                        return (
                          <td key={typeIndex} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                            {formatCurrency(typeTotal)}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                        {formatCurrency(billsByMonth.reduce((sum, month) => sum + month.total, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Detailed View */}
        {activeView === "detailed" && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {selectedMonth ? `Bills for ${getMonthName(selectedMonth)}` : 'All Bills'}
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allBills
                    .filter(bill => !selectedMonth || new Date(bill.date).toISOString().slice(0, 7) === selectedMonth)
                    .map((bill) => {
                      const billDate = new Date(bill.date);
                      const billMonthYear = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
                      
                      return (
                        <tr key={bill._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bill.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(bill.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(bill.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getMonthName(billMonthYear)}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleDeleteBill(bill._id)}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            
            {allBills.filter(bill => !selectedMonth || new Date(bill.date).toISOString().slice(0, 7) === selectedMonth).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No bills found
              </div>
            )}
            
            {selectedMonth && (
              <div className="mt-4">
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-md hover:bg-blue-50"
                >
                  ← Back to all bills
                </button>
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Months</h3>
            <p className="text-3xl font-bold text-blue-600">{billsByMonth.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bills</h3>
            <p className="text-3xl font-bold text-green-600">{allBills.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Spent</h3>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(billsByMonth.reduce((sum, month) => sum + month.total, 0))}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Avg/Month</h3>
            <p className="text-3xl font-bold text-orange-600">
              {formatCurrency(
                billsByMonth.length > 0 
                  ? billsByMonth.reduce((sum, month) => sum + month.total, 0) / billsByMonth.length 
                  : 0
              )}
            </p>
          </div>
        </div>

        {/* Month Filter */}
        {selectedMonth && activeView === "monthly" && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-blue-800">
                  Viewing bills for {getMonthName(selectedMonth)}
                </h3>
                <p className="text-blue-600 text-sm">
                  Click on any month in the table to filter
                </p>
              </div>
              <button
                onClick={() => setSelectedMonth(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}