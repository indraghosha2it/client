// app/dashboard/moderatorDashboard/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Calendar,
  RefreshCw,
  ChevronDown,
  FileDown,
  AlertCircle,
  BarChart3,
  PieChart,
  Shield
} from 'lucide-react';

// API base URL
const API_BASE_URL = 'http://localhost:5004/api';

// Months for dropdown
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ModeratorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState({ monthly: false, yearly: false });
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState({
    // Selected Period
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    selectedYearForYearly: new Date().getFullYear(),
    
    // Summary Data
    monthlySummary: {
      total: 0,
      officeRent: 0,
      utilities: 0,
      officeSupplies: 0,
      transportExpenses: 0,
      extraExpenses: 0,
      isLoading: false,
      error: null
    },
    
    yearlySummary: {
      total: 0,
      isLoading: false,
      error: null
    }
  });

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Fetch data after authentication
  useEffect(() => {
    if (user && !authLoading) {
      fetchMonthlySummary();
      fetchYearlySummary();
    }
  }, [user, authLoading, dashboardData.selectedYear, dashboardData.selectedMonth, dashboardData.selectedYearForYearly]);

  // Check if user is authenticated and is moderator
  const checkAuthentication = () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (!userData || !token) {
      router.push('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setAuthLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  };

  // Helper function to get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Generate year options (last 5 years + current year + next year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  // Format currency in BDT (Taka)
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'BDT 0';
    
    const formattedAmount = new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    return `BDT ${formattedAmount}`;
  };

  // Format amount without symbol
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0.00';
    
    return new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate percentage for category breakdown
  const calculatePercentage = (amount) => {
    const total = dashboardData.monthlySummary.total;
    return total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
  };

  // Fetch monthly summary data (MODERATOR VERSION - NO EMPLOYEE DATA)
  const fetchMonthlySummary = async () => {
    if (!user) return;
    
    try {
      setDashboardData(prev => ({ 
        ...prev, 
        monthlySummary: { ...prev.monthlySummary, isLoading: true, error: null } 
      }));
      
      const { selectedYear, selectedMonth } = dashboardData;
      const headers = getAuthHeaders();
      
      // MODERATOR: Only fetch data that moderators can access
      // No employees, no software subscriptions
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/office-rents`, { headers }),
        fetch(`${API_BASE_URL}/bills/month/${selectedYear}/${selectedMonth}`, { headers }),
        fetch(`${API_BASE_URL}/office-supplies`, { headers }),
        fetch(`${API_BASE_URL}/transport-expenses`, { headers }),
        fetch(`${API_BASE_URL}/extra-expenses`, { headers })
      ]);

      // Check for authentication errors
      const authFailed = responses.some(response => 
        response.status === 'fulfilled' && 
        (response.value.status === 401 || response.value.status === 403)
      );

      if (authFailed) {
        throw new Error('Authentication failed. Please login again.');
      }

      // Parse responses
      const data = await Promise.all(
        responses.map(async (response) => {
          if (response.status === 'fulfilled') {
            try {
              return await response.value.json();
            } catch (error) {
              console.error('Error parsing response:', error);
              return { success: false, data: [] };
            }
          }
          return { success: false, data: [] };
        })
      );

      // Filter data for selected month
      const filterByMonth = (items, dateField) => {
        if (!items || !Array.isArray(items)) return [];
        return items.filter(item => {
          if (!item[dateField]) return false;
          const date = new Date(item[dateField]);
          return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
        });
      };

      const monthRents = filterByMonth(data[0]?.data, 'date');
      const monthBills = data[1]?.data || [];
      const monthSupplies = filterByMonth(data[2]?.data, 'date');
      const monthTransport = filterByMonth(data[3]?.data, 'date');
      const monthExtra = filterByMonth(data[4]?.data, 'date');

      // Calculate totals (NO EMPLOYEE SALARIES, NO SOFTWARE SUBSCRIPTIONS)
      const officeRent = monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0);
      const utilities = monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
      const officeSupplies = monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0);
      const transportExpenses = monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0);
      const extraExpenses = monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0);

      const total = officeRent + utilities + officeSupplies + transportExpenses + extraExpenses;

      setDashboardData(prev => ({
        ...prev,
        monthlySummary: {
          total,
          officeRent,
          utilities,
          officeSupplies,
          transportExpenses,
          extraExpenses,
          isLoading: false,
          error: null
        }
      }));

    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      
      if (error.message === 'Authentication failed. Please login again.') {
        localStorage.clear();
        router.push('/');
        return;
      }
      
      setDashboardData(prev => ({ 
        ...prev, 
        monthlySummary: { 
          ...prev.monthlySummary, 
          error: error.message || 'Failed to load monthly summary data',
          isLoading: false 
        }
      }));
    }
  };

  // Fetch yearly summary data (MODERATOR VERSION - NO EMPLOYEE DATA)
  const fetchYearlySummary = async () => {
    if (!user) return;
    
    try {
      setDashboardData(prev => ({ 
        ...prev, 
        yearlySummary: { ...prev.yearlySummary, isLoading: true, error: null } 
      }));
      
      const { selectedYearForYearly } = dashboardData;
      const headers = getAuthHeaders();
      
      // MODERATOR: Only fetch data that moderators can access
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/office-rents`, { headers }),
        fetch(`${API_BASE_URL}/bills`, { headers }),
        fetch(`${API_BASE_URL}/office-supplies`, { headers }),
        fetch(`${API_BASE_URL}/transport-expenses`, { headers }),
        fetch(`${API_BASE_URL}/extra-expenses`, { headers })
      ]);

      // Check for authentication errors
      const authFailed = responses.some(response => 
        response.status === 'fulfilled' && 
        (response.value.status === 401 || response.value.status === 403)
      );

      if (authFailed) {
        throw new Error('Authentication failed. Please login again.');
      }

      // Parse responses
      const data = await Promise.all(
        responses.map(async (response) => {
          if (response.status === 'fulfilled') {
            try {
              return await response.value.json();
            } catch (error) {
              console.error('Error parsing response:', error);
              return { success: false, data: [] };
            }
          }
          return { success: false, data: [] };
        })
      );

      // Filter data for selected year (NO EMPLOYEE DATA)
      const filterByYear = (items, dateField) => {
        if (!items || !Array.isArray(items)) return [];
        return items.filter(item => {
          if (!item[dateField]) return false;
          const date = new Date(item[dateField]);
          return date.getFullYear() === selectedYearForYearly;
        });
      };

      const yearRents = filterByYear(data[0]?.data, 'date');
      const yearBills = (data[1]?.data || []).filter(bill => bill.year === selectedYearForYearly);
      const yearSupplies = filterByYear(data[2]?.data, 'date');
      const yearTransport = filterByYear(data[3]?.data, 'date');
      const yearExtra = filterByYear(data[4]?.data, 'date');

      // Calculate total for the year (NO EMPLOYEE SALARIES, NO SOFTWARE SUBSCRIPTIONS)
      const total = 
        yearRents.reduce((sum, rent) => sum + (rent.rent || 0), 0) +
        yearBills.reduce((sum, bill) => sum + (bill.amount || 0), 0) +
        yearSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0) +
        yearTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0) +
        yearExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0);

      setDashboardData(prev => ({
        ...prev,
        yearlySummary: {
          total,
          isLoading: false,
          error: null
        }
      }));

    } catch (error) {
      console.error('Error fetching yearly summary:', error);
      
      if (error.message === 'Authentication failed. Please login again.') {
        localStorage.clear();
        router.push('/');
        return;
      }
      
      setDashboardData(prev => ({ 
        ...prev, 
        yearlySummary: { 
          ...prev.yearlySummary, 
          error: error.message || 'Failed to load yearly summary data',
          isLoading: false 
        }
      }));
    }
  };

  // Download Monthly Summary PDF (Simple version)
  const downloadMonthlyPDF = async () => {
    try {
      setDownloadingPDF(prev => ({ ...prev, monthly: true }));
      
      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const monthName = MONTHS[dashboardData.selectedMonth - 1];
      const year = dashboardData.selectedYear;
      const summary = dashboardData.monthlySummary;
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(`Monthly Expense Summary - ${monthName} ${year}`, 105, 20, { align: 'center' });
      
      // Add subtitle
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Moderator View - Limited Access', 105, 30, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' });
      doc.text(`Generated by: ${user?.name || 'Moderator'}`, 105, 46, { align: 'center' });
      
      // Add total summary
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.text(`Total Monthly Expenses: ${formatCurrency(summary.total)}`, 105, 60, { align: 'center' });
      
      // Add a simple table with available data
      let yPosition = 80;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Office Rent
      if (summary.officeRent > 0) {
        doc.text(`Office Rent: ${formatCurrency(summary.officeRent)}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Utilities
      if (summary.utilities > 0) {
        doc.text(`Utilities: ${formatCurrency(summary.utilities)}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Office Supplies
      if (summary.officeSupplies > 0) {
        doc.text(`Office Supplies: ${formatCurrency(summary.officeSupplies)}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Transport Expenses
      if (summary.transportExpenses > 0) {
        doc.text(`Transport Expenses: ${formatCurrency(summary.transportExpenses)}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Extra Expenses
      if (summary.extraExpenses > 0) {
        doc.text(`Extra Expenses: ${formatCurrency(summary.extraExpenses)}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Add note about restricted access
      yPosition += 20;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Note: This is a moderator view. Some data may be restricted.', 20, yPosition);
      doc.text('Contact administrator for full access.', 20, yPosition + 6);
      
      // Add footer
      doc.text(`Page 1 of 1`, 195, 285, { align: 'right' });
      doc.text('Confidential - Moderator Expenses Report', 15, 285);
      
      // Save the PDF
      doc.save(`Monthly_Expense_Summary_Moderator_${monthName}_${year}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(prev => ({ ...prev, monthly: false }));
    }
  };

  // Download Yearly Summary PDF (Simple version)
  const downloadYearlyPDF = async () => {
    try {
      setDownloadingPDF(prev => ({ ...prev, yearly: true }));
      
      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const year = dashboardData.selectedYearForYearly;
      const summary = dashboardData.yearlySummary;
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(`Yearly Expense Summary - ${year}`, 105, 20, { align: 'center' });
      
      // Add subtitle
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Moderator View - Limited Access', 105, 30, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' });
      doc.text(`Generated by: ${user?.name || 'Moderator'}`, 105, 46, { align: 'center' });
      
      // Add total summary
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94);
      doc.text(`Total Yearly Expenses: ${formatCurrency(summary.total)}`, 105, 60, { align: 'center' });
      
      // Add note about restricted access
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Note: This is a moderator view. Employee salary data is not accessible.', 20, 80);
      doc.text('Contact administrator for full financial reports.', 20, 90);
      
      // Add average monthly
      const avgMonthly = summary.total / 12;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Average Monthly Expense: ${formatCurrency(avgMonthly)}`, 20, 110);
      
      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page 1 of 1`, 195, 285, { align: 'right' });
      doc.text('Confidential - Moderator Yearly Report', 15, 285);
      
      // Save the PDF
      doc.save(`Yearly_Expense_Summary_Moderator_${year}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(prev => ({ ...prev, yearly: false }));
    }
  };

  // Handle year/month change
  const handleMonthYearChange = (type, value) => {
    setDashboardData(prev => ({
      ...prev,
      [type]: parseInt(value)
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    if (!user) return;
    fetchMonthlySummary();
    fetchYearlySummary();
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moderator Dashboard</h1>
              <p className="text-gray-600 mt-1">Limited access expense overview (No employee data)</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {user.role?.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              Restricted Access
            </span>
          </div>
        </div>
        
        {/* User Info */}
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">Moderator Role</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={dashboardData.monthlySummary.isLoading || dashboardData.yearlySummary.isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${dashboardData.monthlySummary.isLoading ? 'animate-spin' : ''}`} />
            {dashboardData.monthlySummary.isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {(dashboardData.monthlySummary.error || dashboardData.yearlySummary.error) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <p className="text-red-700 font-medium">Data Loading Error</p>
              <p className="text-red-600 text-sm mt-1">
                {dashboardData.monthlySummary.error || dashboardData.yearlySummary.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Summary Section */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <PieChart className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Monthly Expense Summary</h2>
            </div>
            <button
              onClick={downloadMonthlyPDF}
              disabled={downloadingPDF.monthly || dashboardData.monthlySummary.isLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className={`w-4 h-4 mr-2 ${downloadingPDF.monthly ? 'animate-spin' : ''}`} />
              {downloadingPDF.monthly ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <select
                value={dashboardData.selectedYear}
                onChange={(e) => handleMonthYearChange('selectedYear', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={dashboardData.monthlySummary.isLoading}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={dashboardData.selectedMonth}
                onChange={(e) => handleMonthYearChange('selectedMonth', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={dashboardData.monthlySummary.isLoading}
              >
                {MONTHS.map((month, index) => (
                  <option key={index + 1} value={index + 1}>{month}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {dashboardData.monthlySummary.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Monthly Total Card */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <p className="text-blue-600 text-sm font-medium">
                      {MONTHS[dashboardData.selectedMonth - 1]} {dashboardData.selectedYear}
                    </p>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(dashboardData.monthlySummary.total)}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">Total Monthly Expenses (BDT)</p>
                  <p className="text-blue-500 text-xs mt-1">Excluding employee salaries</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Office Expenses</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboardData.monthlySummary.officeRent + dashboardData.monthlySummary.officeSupplies)}
                </p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span>Rent: {formatCurrency(dashboardData.monthlySummary.officeRent)}</span>
                  <span className="mx-2">•</span>
                  <span>Supplies: {formatCurrency(dashboardData.monthlySummary.officeSupplies)}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Operational Costs</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboardData.monthlySummary.utilities + dashboardData.monthlySummary.transportExpenses)}
                </p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span>Utilities: {formatCurrency(dashboardData.monthlySummary.utilities)}</span>
                  <span className="mx-2">•</span>
                  <span>Transport: {formatCurrency(dashboardData.monthlySummary.transportExpenses)}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Miscellaneous</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboardData.monthlySummary.extraExpenses)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Extra expenses for {MONTHS[dashboardData.selectedMonth - 1]}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Yearly Summary Section */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Yearly Expense Summary</h2>
            </div>
            <button
              onClick={downloadYearlyPDF}
              disabled={downloadingPDF.yearly || dashboardData.yearlySummary.isLoading}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className={`w-4 h-4 mr-2 ${downloadingPDF.yearly ? 'animate-spin' : ''}`} />
              {downloadingPDF.yearly ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
          <div className="relative">
            <select
              value={dashboardData.selectedYearForYearly}
              onChange={(e) => handleMonthYearChange('selectedYearForYearly', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={dashboardData.yearlySummary.isLoading}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {dashboardData.yearlySummary.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Yearly Total Card */}
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <p className="text-green-600 text-sm font-medium">Year {dashboardData.selectedYearForYearly}</p>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(dashboardData.yearlySummary.total)}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">Total Yearly Expenses (BDT)</p>
                  <p className="text-green-500 text-xs mt-1">Excluding employee salaries</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Yearly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Monthly Average</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboardData.yearlySummary.total / 12)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Average expense per month
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Year Comparison</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboardData.yearlySummary.total)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Total for {dashboardData.selectedYearForYearly}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Quarterly Average</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboardData.yearlySummary.total / 4)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Average expense per quarter
                </p>
              </div>
            </div>
          </>
        )}
      </div>

    
    </div>
  );
}