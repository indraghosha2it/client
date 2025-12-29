'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Building, 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  PieChart,
  Calendar,
  PlusCircle,
  Download,
  BarChart3,
  Tag
} from 'lucide-react';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    currentMonthTotal: 0,
    previousMonthTotal: 0,
    ytdTotal: 0,
    categoryBreakdown: [],
    recentExpenses: [],
    isLoading: true
  });

  // Mock data for initial display
  useEffect(() => {
    const mockData = {
      currentMonthTotal: 154250,
      previousMonthTotal: 142800,
      ytdTotal: 1851000,
      categoryBreakdown: [
        { category: 'Employee Salaries', amount: 85000, percentage: 55, color: '#3B82F6' },
        { category: 'Office Rent', amount: 30000, percentage: 19.5, color: '#10B981' },
        { category: 'Utilities', amount: 15000, percentage: 9.7, color: '#F59E0B' },
        { category: 'Software', amount: 12500, percentage: 8.1, color: '#8B5CF6' },
        { category: 'Others', amount: 11750, percentage: 7.7, color: '#EF4444' }
      ],
      recentExpenses: [
        { id: 1, category: 'Employee Salaries', amount: 85000, date: '2024-01-31', payment: 'Bank Transfer' },
        { id: 2, category: 'Office Rent', amount: 30000, date: '2024-01-30', payment: 'Online' },
        { id: 3, category: 'Internet Bill', amount: 2500, date: '2024-01-28', payment: 'Credit Card' },
        { id: 4, category: 'Office Supplies', amount: 1500, date: '2024-01-25', payment: 'Cash' }
      ]
    };
    
    setTimeout(() => {
      setDashboardData({ ...mockData, isLoading: false });
    }, 1000);
  }, []);

  const percentageChange = ((dashboardData.currentMonthTotal - dashboardData.previousMonthTotal) / dashboardData.previousMonthTotal * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Track your office expenses in real-time</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Current Month Total */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Current Month</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                ₹{dashboardData.currentMonthTotal.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {parseFloat(percentageChange) >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={`text-sm font-medium ${parseFloat(percentageChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentageChange}% from last month
            </span>
          </div>
        </div>

        {/* YTD Total */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Year to Date</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                ₹{dashboardData.ytdTotal.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">Jan 2024 - Present</p>
        </div>

        {/* Average Daily Cost */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg Daily Cost</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                ₹{Math.round(dashboardData.currentMonthTotal / 30).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">Based on current month</p>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Categories</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {dashboardData.categoryBreakdown.length}
              </h3>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <PieChart className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">Active expense categories</p>
        </div>
      </div>

      {/* Charts and Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Category Breakdown</h2>
            <PieChart className="w-6 h-6 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {dashboardData.categoryBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">{item.category}</span>
                  <span className="font-semibold text-gray-900">₹{item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{item.percentage}% of total</span>
                  <span>{((item.amount / dashboardData.currentMonthTotal) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Expenses</h2>
            <FileText className="w-6 h-6 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {dashboardData.recentExpenses.map((expense) => (
              <div key={expense.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">{expense.category}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(expense.date).toLocaleDateString('en-IN', { 
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })} • {expense.payment}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{expense.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <button className="w-full mt-6 py-3 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors">
            View All Expenses →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/dashboard/expenses/add'}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200">
              <PlusCircle className="w-8 h-8 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">Add Expense</span>
            <span className="text-sm text-gray-500 mt-1">Record new cost</span>
          </button>

          <button className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group">
            <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:bg-green-200">
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <span className="font-semibold text-gray-900">Generate Report</span>
            <span className="text-sm text-gray-500 mt-1">Monthly PDF</span>
          </button>

          <button className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group">
            <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <span className="font-semibold text-gray-900">View Analytics</span>
            <span className="text-sm text-gray-500 mt-1">Trends & insights</span>
          </button>

          <button className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group">
            <div className="p-3 bg-orange-100 rounded-full mb-3 group-hover:bg-orange-200">
              <Tag className="w-8 h-8 text-orange-600" />
            </div>
            <span className="font-semibold text-gray-900">Manage Categories</span>
            <span className="text-sm text-gray-500 mt-1">Add/Edit categories</span>
          </button>
        </div>
      </div>
    </div>
  );
}