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
  Shield,
  Utensils  // Added for food costs
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
  const [pdfReady, setPdfReady] = useState(false);
  
  // Initialize PDF libraries on client side
  useEffect(() => {
    const initializePDF = async () => {
      if (typeof window !== 'undefined') {
        const [jsPDFModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable').catch(() => ({ default: null }))
        ]);
        setPdfReady(true);
      }
    };
    
    initializePDF();
  }, []);
  
  // Dashboard state - UPDATED to include food costs
  const [dashboardData, setDashboardData] = useState({
    // Selected Period
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    selectedYearForYearly: new Date().getFullYear(),
    
    // Summary Data - UPDATED to include food costs
    monthlySummary: {
      total: 0,
      officeRent: 0,
      utilities: 0,
      officeSupplies: 0,
      transportExpenses: 0,
      extraExpenses: 0,
      foodCosts: 0,  // Added food costs
      isLoading: false,
      error: null,
      categoryBreakdown: []  // Added for better organization
    },
    
    yearlySummary: {
      total: 0,
      isLoading: false,
      error: null,
      monthlyBreakdown: [],  // Added for better organization
      categoryTotals: []     // Added for better organization
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

  // Calculate percentage for yearly summary
  const calculateYearlyPercentage = (amount) => {
    const total = dashboardData.yearlySummary.total;
    return total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
  };

  // Fetch monthly summary data (UPDATED to include food costs)
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
      // No employees, no software subscriptions - ADDED FOOD COSTS
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/office-rents`, { headers }),
        fetch(`${API_BASE_URL}/bills/month/${selectedYear}/${selectedMonth}`, { headers }),
        fetch(`${API_BASE_URL}/office-supplies`, { headers }),
        fetch(`${API_BASE_URL}/transport-expenses`, { headers }),
        fetch(`${API_BASE_URL}/extra-expenses`, { headers }),
        fetch(`${API_BASE_URL}/food-costs`, { headers })  // Added food costs
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
      const monthFoodCosts = filterByMonth(data[5]?.data, 'date');  // Added food costs

      // Calculate totals (NO EMPLOYEE SALARIES, NO SOFTWARE SUBSCRIPTIONS) - INCLUDES FOOD COSTS
      const officeRent = monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0);
      const utilities = monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
      const officeSupplies = monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0);
      const transportExpenses = monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0);
      const extraExpenses = monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0);
      const foodCosts = monthFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0);  // Added food costs

      const total = officeRent + utilities + officeSupplies + transportExpenses + extraExpenses + foodCosts;

      // Create category breakdown for better organization
      const categoryBreakdown = [
        { category: 'House Rent', amount: officeRent, color: '#10B981' },
        { category: 'Utilities', amount: utilities, color: '#F59E0B' },
        { category: 'Office Supplies', amount: officeSupplies, color: '#8B5CF6' },
        { category: 'Transport Expenses', amount: transportExpenses, color: '#06B6D4' },
        { category: 'Extra Expenses', amount: extraExpenses, color: '#EF4444' },
        { category: 'Food Costs', amount: foodCosts, color: '#22C55E' }  // Added food costs
      ].filter(item => item.amount > 0);

      setDashboardData(prev => ({
        ...prev,
        monthlySummary: {
          total,
          officeRent,
          utilities,
          officeSupplies,
          transportExpenses,
          extraExpenses,
          foodCosts,  // Added food costs
          categoryBreakdown,  // Added category breakdown
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

  // Fetch yearly summary data (UPDATED to include food costs)
  const fetchYearlySummary = async () => {
    if (!user) return;
    
    try {
      setDashboardData(prev => ({ 
        ...prev, 
        yearlySummary: { ...prev.yearlySummary, isLoading: true, error: null } 
      }));
      
      const { selectedYearForYearly } = dashboardData;
      const headers = getAuthHeaders();
      
      // MODERATOR: Only fetch data that moderators can access - ADDED FOOD COSTS
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/office-rents`, { headers }),
        fetch(`${API_BASE_URL}/bills`, { headers }),
        fetch(`${API_BASE_URL}/office-supplies`, { headers }),
        fetch(`${API_BASE_URL}/transport-expenses`, { headers }),
        fetch(`${API_BASE_URL}/extra-expenses`, { headers }),
        fetch(`${API_BASE_URL}/food-costs`, { headers })  // Added food costs
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

      // Filter data for selected year (NO EMPLOYEE DATA) - INCLUDES FOOD COSTS
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
      const yearFoodCosts = filterByYear(data[5]?.data, 'date');  // Added food costs

      // Calculate monthly breakdown for the year
      const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthName = MONTHS[i].substring(0, 3);
        
        // Filter data for each month
        const filterByMonth = (items, dateField) => {
          return items.filter(item => {
            const date = new Date(item[dateField]);
            return date.getMonth() + 1 === month;
          });
        };

        const monthRents = filterByMonth(yearRents, 'date');
        const monthBills = yearBills.filter(bill => bill.month === month);
        const monthSupplies = filterByMonth(yearSupplies, 'date');
        const monthTransport = filterByMonth(yearTransport, 'date');
        const monthExtra = filterByMonth(yearExtra, 'date');
        const monthFoodCosts = filterByMonth(yearFoodCosts, 'date');  // Added food costs

        const total = 
          monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0) +
          monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0) +
          monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0) +
          monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0) +
          monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0) +
          monthFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0);  // Added food costs

        return {
          month,
          monthName,
          total,
          officeRent: monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0),
          utilities: monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0),
          officeSupplies: monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0),
          transportExpenses: monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0),
          extraExpenses: monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0),
          foodCosts: monthFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0)  // Added food costs
        };
      });

      // Calculate category totals for the year including food costs
      const categoryTotals = [
        { category: 'House Rent', amount: yearRents.reduce((sum, rent) => sum + (rent.rent || 0), 0), color: '#10B981' },
        { category: 'Utilities', amount: yearBills.reduce((sum, bill) => sum + (bill.amount || 0), 0), color: '#F59E0B' },
        { category: 'Office Supplies', amount: yearSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0), color: '#8B5CF6' },
        { category: 'Transport Expenses', amount: yearTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0), color: '#06B6D4' },
        { category: 'Extra Expenses', amount: yearExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0), color: '#EF4444' },
        { category: 'Food Costs', amount: yearFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0), color: '#22C55E' }  // Added food costs
      ].filter(item => item.amount > 0);

      // Calculate total for the year (NO EMPLOYEE SALARIES, NO SOFTWARE SUBSCRIPTIONS) - INCLUDES FOOD COSTS
      const total = 
        yearRents.reduce((sum, rent) => sum + (rent.rent || 0), 0) +
        yearBills.reduce((sum, bill) => sum + (bill.amount || 0), 0) +
        yearSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0) +
        yearTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0) +
        yearExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0) +
        yearFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0);  // Added food costs

      setDashboardData(prev => ({
        ...prev,
        yearlySummary: {
          total,
          monthlyBreakdown,      // Added monthly breakdown
          categoryTotals,        // Added category totals
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

  // Download Monthly Summary PDF (Enhanced version with food costs)
  const downloadMonthlyPDF = async () => {
    try {
      setDownloadingPDF(prev => ({ ...prev, monthly: true }));
      
      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf');
      const summary = dashboardData.monthlySummary;
      const monthName = MONTHS[dashboardData.selectedMonth - 1];
      const year = dashboardData.selectedYear;
      
      const doc = new jsPDF();
      
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
      
      // Create a table
      let yPosition = 80;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Table headers
      doc.setFont(undefined, 'bold');
      doc.text('Category', 20, yPosition);
      doc.text('Amount (BDT)', 120, yPosition);
      doc.text('Percentage', 180, yPosition);
      doc.setFont(undefined, 'normal');
      
      yPosition += 10;
      
      // Add a line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      // Table rows with all categories including food costs
      const categories = [
        { name: 'House Rent', amount: summary.officeRent },
        { name: 'Utilities', amount: summary.utilities },
        { name: 'Office Supplies', amount: summary.officeSupplies },
        { name: 'Transport Expenses', amount: summary.transportExpenses },
        { name: 'Extra Expenses', amount: summary.extraExpenses },
        { name: 'Food Costs', amount: summary.foodCosts }
      ];
      
      categories.forEach(category => {
        if (category.amount > 0) {
          const percentage = ((category.amount / summary.total) * 100).toFixed(1);
          doc.text(category.name, 20, yPosition);
          doc.text(formatAmount(category.amount), 120, yPosition);
          doc.text(`${percentage}%`, 180, yPosition);
          yPosition += 8;
        }
      });
      
      // Add total row
      yPosition += 5;
      doc.setDrawColor(100, 100, 100);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 8;
      
      doc.setFont(undefined, 'bold');
      doc.text('TOTAL', 20, yPosition);
      doc.text(formatAmount(summary.total), 120, yPosition);
      doc.text('100%', 180, yPosition);
      doc.setFont(undefined, 'normal');
      
      // Add food cost analysis
      yPosition += 20;
      doc.setFontSize(12);
      doc.setTextColor(34, 197, 94);  // Green color for food costs
      doc.text('Food Cost Analysis:', 20, yPosition);
      
      yPosition += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const dailyAverage = summary.foodCosts / 30;
      const weeklyAverage = summary.foodCosts / 4;
      
      doc.text(`• Daily Average: ${formatCurrency(dailyAverage)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Weekly Average: ${formatCurrency(weeklyAverage)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Percentage of Total: ${calculatePercentage(summary.foodCosts)}%`, 25, yPosition);
      
      // Add note about restricted access
      yPosition += 15;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Note: This is a moderator view. Employee salary data is not accessible.', 20, yPosition);
      yPosition += 6;
      doc.text('Contact administrator for full financial reports.', 20, yPosition);
      
      // Add footer
      doc.setFontSize(8);
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

  // Download Yearly Summary PDF (Enhanced version with food costs)
  const downloadYearlyPDF = async () => {
    try {
      setDownloadingPDF(prev => ({ ...prev, yearly: true }));
      
      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf');
      const year = dashboardData.selectedYearForYearly;
      const summary = dashboardData.yearlySummary;
      
      const doc = new jsPDF();
      
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
      
      // Create monthly breakdown table
      let yPosition = 80;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Table headers
      doc.setFont(undefined, 'bold');
      doc.text('Month', 20, yPosition);
      doc.text('Total (BDT)', 60, yPosition);
      doc.text('Food Costs', 120, yPosition);
      doc.text('% of Total', 180, yPosition);
      doc.setFont(undefined, 'normal');
      
      yPosition += 10;
      
      // Add a line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      // Table rows
      summary.monthlyBreakdown.forEach(month => {
        const monthPercentage = ((month.total / summary.total) * 100).toFixed(1);
        const foodPercentage = month.total > 0 ? ((month.foodCosts / month.total) * 100).toFixed(1) : '0.0';
        
        doc.text(month.monthName, 20, yPosition);
        doc.text(formatAmount(month.total), 60, yPosition);
        doc.text(formatAmount(month.foodCosts), 120, yPosition);
        doc.text(`${foodPercentage}%`, 180, yPosition);
        yPosition += 8;
      });
      
      // Add total row
      yPosition += 5;
      doc.setDrawColor(100, 100, 100);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 8;
      
      doc.setFont(undefined, 'bold');
      doc.text('YEAR TOTAL', 20, yPosition);
      doc.text(formatAmount(summary.total), 60, yPosition);
      doc.text(formatAmount(summary.categoryTotals.find(c => c.category === 'Food Costs')?.amount || 0), 120, yPosition);
      const yearlyFoodPercentage = summary.total > 0 ? 
        ((summary.categoryTotals.find(c => c.category === 'Food Costs')?.amount || 0) / summary.total * 100).toFixed(1) : '0.0';
      doc.text(`${yearlyFoodPercentage}%`, 180, yPosition);
      doc.setFont(undefined, 'normal');
      
      // Add food cost summary
      yPosition += 20;
      doc.setFontSize(12);
      doc.setTextColor(34, 197, 94);  // Green color for food costs
      doc.text('Food Cost Summary:', 20, yPosition);
      
      yPosition += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const totalFoodCosts = summary.categoryTotals.find(c => c.category === 'Food Costs')?.amount || 0;
      const avgMonthlyFood = totalFoodCosts / 12;
      const avgDailyFood = totalFoodCosts / 365;
      
      doc.text(`• Total Food Costs: ${formatCurrency(totalFoodCosts)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Average Monthly: ${formatCurrency(avgMonthlyFood)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Average Daily: ${formatCurrency(avgDailyFood)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Percentage of Yearly Total: ${calculateYearlyPercentage(totalFoodCosts)}%`, 25, yPosition);
      
      // Add note about restricted access
      yPosition += 15;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Note: This is a moderator view. Employee salary data is not accessible.', 20, yPosition);
      yPosition += 6;
      doc.text('Contact administrator for full financial reports.', 20, yPosition);
      
      // Add footer
      doc.setFontSize(8);
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

      {/* Monthly Summary Section - UPDATED to include food costs */}
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

            {/* Category Breakdown - UPDATED to include food costs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-4">
                {dashboardData.monthlySummary.categoryBreakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700">{item.category}</span>
                        {item.category === 'Food Costs' && (
                          <Utensils className="w-4 h-4 ml-2 text-green-500" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${calculatePercentage(item.amount)}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{calculatePercentage(item.amount)}% of total</span>
                      <span>BDT {formatAmount(item.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Summary Stats - UPDATED to include food costs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-sm">Office Expenses</p>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">🏢</span>
                </div>
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
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-sm">Operational Costs</p>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">🚗</span>
                </div>
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
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-sm">Food & Miscellaneous</p>
                  <div className="flex items-center">
                    <Utensils className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">📝</span>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboardData.monthlySummary.foodCosts + dashboardData.monthlySummary.extraExpenses)}
                </p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span>Food: {formatCurrency(dashboardData.monthlySummary.foodCosts)}</span>
                  <span className="mx-2">•</span>
                  <span>Extra: {formatCurrency(dashboardData.monthlySummary.extraExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Detailed Category Cards - UPDATED to include food costs */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'House Rent', value: dashboardData.monthlySummary.officeRent, color: 'green', icon: '🏢' },
                { label: 'Utilities', value: dashboardData.monthlySummary.utilities, color: 'yellow', icon: '💡' },
                { label: 'Office Supplies', value: dashboardData.monthlySummary.officeSupplies, color: 'purple', icon: '📦' },
                { label: 'Transport Expenses', value: dashboardData.monthlySummary.transportExpenses, color: 'cyan', icon: '🚗' },
                { label: 'Extra Expenses', value: dashboardData.monthlySummary.extraExpenses, color: 'red', icon: '📝' },
                { label: 'Food Costs', value: dashboardData.monthlySummary.foodCosts, color: 'green', icon: '🍽️' },
              ].map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">{item.icon}</span>
                    <p className="text-gray-700 text-sm font-medium">{item.label}</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(item.value)}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">
                      {item.value > 0 ? `${calculatePercentage(item.value)}% of total` : 'No data'}
                    </p>
                    {item.label === 'Food Costs' && (
                      <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Daily: {formatCurrency(item.value / 30)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Yearly Summary Section - UPDATED to include food costs */}
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

            {/* Monthly Breakdown Chart - UPDATED to show food costs */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h3>
                <div className="flex items-center text-sm text-green-600">
                  <Utensils className="w-4 h-4 mr-1" />
                  <span>Food costs highlighted</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {dashboardData.yearlySummary.monthlyBreakdown.map((month, index) => {
                  const foodPercentage = month.total > 0 ? (month.foodCosts / month.total) * 100 : 0;
                  const totalPercentage = month.total > 0 ? 
                    (month.total / Math.max(...dashboardData.yearlySummary.monthlyBreakdown.map(m => m.total || 1))) * 100 : 0;
                  
                  return (
                    <div key={index} className="text-center">
                      <div className="text-sm text-gray-500 mb-1">{month.monthName}</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(month.total)}
                      </div>
                      <div className="mt-2 relative">
                        <div 
                          className="h-2 bg-gray-200 rounded-full"
                          style={{ 
                            width: '100%',
                            position: 'relative'
                          }}
                        >
                          {/* Total expense bar */}
                          <div 
                            className="h-2 bg-blue-600 rounded-full absolute top-0 left-0"
                            style={{ 
                              width: `${Math.min(totalPercentage, 100)}%`
                            }}
                          ></div>
                          
                          {/* Food cost portion (shown on top of total) */}
                          {month.foodCosts > 0 && (
                            <div 
                              className="h-2 bg-green-500 rounded-full absolute top-0 left-0"
                              style={{ 
                                width: `${Math.min(totalPercentage * (foodPercentage / 100), 100)}%`
                              }}
                            ></div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div>Total: BDT {formatAmount(month.total)}</div>
                        {month.foodCosts > 0 && (
                          <div className="text-green-600">
                            Food: BDT {formatAmount(month.foodCosts)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Yearly Category Totals - UPDATED to include food costs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Yearly Category Totals (BDT)</h3>
                <div className="flex items-center">
                  <Utensils className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-gray-600">Food costs included</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.yearlySummary.categoryTotals.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium text-gray-700">{item.category}</span>
                      {item.category === 'Food Costs' && (
                        <Utensils className="w-4 h-4 ml-2 text-green-500" />
                      )}
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(item.amount)}
                    </p>
                    <div className="text-sm text-gray-500 mt-1">
                      <div>BDT {formatAmount(item.amount)}</div>
                      <div>{calculateYearlyPercentage(item.amount)}% of yearly total</div>
                      {item.category === 'Food Costs' && (
                        <div className="text-green-600 mt-1">
                          Daily: {formatCurrency(item.amount / 365)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yearly Stats - UPDATED to include food costs */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-sm">Monthly Average</p>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">📅</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboardData.yearlySummary.total / 12)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Average expense per month
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-sm">Food Cost Average</p>
                  <Utensils className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    (dashboardData.yearlySummary.categoryTotals.find(c => c.category === 'Food Costs')?.amount || 0) / 12
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Average monthly food costs
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-sm">Quarterly Average</p>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">📊</span>
                </div>
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

      {/* Quick Stats Cards - Added Food Costs */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Total Monthly Food Costs</div>
            <Utensils className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(dashboardData.monthlySummary.foodCosts)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {dashboardData.monthlySummary.foodCosts > 0 
              ? `${calculatePercentage(dashboardData.monthlySummary.foodCosts)}% of monthly total`
              : 'No food cost data'
            }
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Daily Food Average</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(dashboardData.monthlySummary.foodCosts / 30)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Based on 30 days
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Food % of Monthly Total</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {calculatePercentage(dashboardData.monthlySummary.foodCosts)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            For {MONTHS[dashboardData.selectedMonth - 1]}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Yearly Food Costs</div>
            <div className="flex items-center">
              <Utensils className="w-4 h-4 text-green-500" />
              <Calendar className="w-4 h-4 text-gray-400 ml-1" />
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-1">
            {formatCurrency(
              dashboardData.yearlySummary.categoryTotals.find(item => item.category === 'Food Costs')?.amount || 0
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Total for {dashboardData.selectedYearForYearly}
          </div>
        </div>
      </div>

      {/* Access Restrictions Note */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-yellow-600 mr-2" />
          <div>
            <p className="text-yellow-700 font-medium">Moderator Access Restrictions</p>
            <p className="text-yellow-600 text-sm mt-1">
              As a moderator, you cannot access employee salary data, software subscription details, 
              or other sensitive financial information. Contact an administrator for full access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}