// SalaryDashboard.js
"use client";

import React, { useState, useEffect } from "react";

export default function SalaryDashboard() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [totals, setTotals] = useState(null);

  const API_URL = "http://localhost:5001/api";

  // Fetch salaries for selected month/year
  const fetchSalaries = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await fetch(`${API_URL}/salary/month/${month}/${year}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSalaries(data.data);
        setTotals(data.totals);
        setMessage({ 
          type: 'success', 
          text: `Loaded ${data.count} salary records` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to load salary data' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Cannot connect to backend: ${error.message}` 
      });
      console.error("Error fetching salaries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate all salaries for the month
  const calculateAllSalaries = async () => {
    if (!window.confirm(`Calculate salaries for ${getMonthName(month)} ${year}?`)) {
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await fetch(`${API_URL}/salary/calculate-all`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ month, year }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message 
        });
        // Refresh salary list
        fetchSalaries();
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to calculate salaries' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error calculating salaries: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark salary as paid
  const markAsPaid = async (salaryId) => {
    try {
      const response = await fetch(`${API_URL}/salary/pay/${salaryId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentDate: new Date().toISOString()
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message 
        });
        // Refresh salary list
        fetchSalaries();
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to mark as paid' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.message}` 
      });
    }
  };

  // Helper function to get month name
  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  useEffect(() => {
    fetchSalaries();
  }, [month, year]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Salary & Payroll Management
        </h1>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : 'bg-red-100 border border-red-300 text-red-800'}`}>
            <div className="flex items-center">
              <span className="mr-2">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Month/Year Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={calculateAllSalaries}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-200 disabled:opacity-50"
              >
                Calculate All Salaries
              </button>
              
              <button
                onClick={fetchSalaries}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Totals Summary */}
        {totals && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-sm text-gray-500">Total Basic Salary</div>
              <div className="text-2xl font-bold text-gray-800">
                ৳{totals.totalBasicSalary.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-sm text-gray-500">Total Overtime</div>
              <div className="text-2xl font-bold text-yellow-600">
                ৳{totals.totalOvertime.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-sm text-gray-500">Total Allowances</div>
              <div className="text-2xl font-bold text-green-600">
                ৳{totals.totalAllowances.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-sm text-gray-500">Total Deductions</div>
              <div className="text-2xl font-bold text-red-600">
                ৳{totals.totalDeductions.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-sm text-gray-500">Net Payroll</div>
              <div className="text-2xl font-bold text-blue-600">
                ৳{totals.totalNetSalary.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Salary List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Salary List for {getMonthName(month)} {year}
            </h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              {salaries.length} Employees
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading salary data...</p>
            </div>
          ) : salaries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No salary records found</h3>
              <p className="text-gray-500">Calculate salaries for this month using the button above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salaries.map((salary) => (
                    <tr key={salary._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {salary.employeeId?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {salary.employeeId?.designation}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="flex space-x-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {salary.presentDays}P
                            </span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {salary.absentDays}A
                            </span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              {salary.lateDays}L
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {salary.overtimeHours} OT
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Basic:</span>
                            <span className="font-medium">৳{salary.basicSalary.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Overtime:</span>
                            <span className="text-yellow-600">+৳{salary.overtimePay.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Allowances:</span>
                            <span className="text-green-600">+৳{salary.allowances.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Deductions:</span>
                            <span className="text-red-600">-৳{salary.deductions.toLocaleString()}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="font-bold text-lg text-blue-600">
                          ৳{salary.netSalary.toLocaleString()}
                        </div>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                          salary.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : salary.status === 'calculated'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {salary.status.toUpperCase()}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {salary.status === 'calculated' && (
                            <button
                              onClick={() => markAsPaid(salary._id)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              Mark as Paid
                            </button>
                          )}
                          <button
                            onClick={() => window.open(`/salary-slip/${salary._id}`, '_blank')}
                            className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                          >
                            View Payslip
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}