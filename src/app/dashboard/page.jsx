// 'use client';

// import React, { useState, useEffect } from 'react';
// import { 
//   DollarSign, 
//   TrendingUp, 
//   TrendingDown,
//   Calendar,
//   PieChart,
//   FileText,
//   BarChart3,
//   Download,
//   RefreshCw,
//   ChevronDown,
//   Filter,
//   PlusCircle,
//   Tag
// } from 'lucide-react';

// // API base URL
// const API_BASE_URL = 'http://localhost:5001/api';

// // Months for dropdown
// const MONTHS = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December'
// ];

// export default function DashboardPage() {
//   const [dashboardData, setDashboardData] = useState({
//     // Selected Period
//     selectedYear: new Date().getFullYear(),
//     selectedMonth: new Date().getMonth() + 1, // 1-12
//     selectedYearForYearly: new Date().getFullYear(),
    
//     // Summary Data
//     monthlySummary: {
//       total: 0,
//       employeeSalaries: 0,
//       officeRent: 0,
//       utilities: 0,
//       officeSupplies: 0,
//       softwareSubscriptions: 0,
//       transportExpenses: 0,
//       extraExpenses: 0,
//       categoryBreakdown: []
//     },
    
//     yearlySummary: {
//       total: 0,
//       monthlyBreakdown: [],
//       categoryTotals: []
//     },
    
//     // Category-wise Breakdown
//     categoryBreakdown: [],
    
//     // Recent Expenses
//     recentExpenses: [],
    
//     // Loading states
//     isLoading: false,
//     isLoadingYearly: false,
    
//     // Error states
//     error: null
//   });

//   // Generate year options (last 5 years + current year + next year)
//   const currentYear = new Date().getFullYear();
//   const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

//   // Fetch all data when component mounts or selections change
//   useEffect(() => {
//     fetchMonthlySummary();
//     fetchYearlySummary();
//     fetchRecentExpenses();
//   }, [dashboardData.selectedYear, dashboardData.selectedMonth, dashboardData.selectedYearForYearly]);

//   // Fetch monthly summary data
//   const fetchMonthlySummary = async () => {
//     try {
//       setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
      
//       const { selectedYear, selectedMonth } = dashboardData;
      
//       // Fetch all data for the selected month
//       const [
//         employeesRes,
//         rentsRes,
//         billsRes,
//         suppliesRes,
//         softwareRes,
//         transportRes,
//         extraRes
//       ] = await Promise.all([
//         fetch(`${API_BASE_URL}/employees`),
//         fetch(`${API_BASE_URL}/office-rents`),
//         fetch(`${API_BASE_URL}/bills/month/${selectedYear}/${selectedMonth}`),
//         fetch(`${API_BASE_URL}/office-supplies`),
//         fetch(`${API_BASE_URL}/software-subscriptions`),
//         fetch(`${API_BASE_URL}/transport-expenses`),
//         fetch(`${API_BASE_URL}/extra-expenses`)
//       ]);

//       // Parse responses
//       const employeesData = await employeesRes.json();
//       const rentsData = await rentsRes.json();
//       const billsData = await billsRes.json();
//       const suppliesData = await suppliesRes.json();
//       const softwareData = await softwareRes.json();
//       const transportData = await transportRes.json();
//       const extraData = await extraRes.json();

//       // Filter data for selected month
//       const monthEmployees = employeesData.data?.filter(emp => {
//         const empDate = new Date(emp.salaryDate);
//         return empDate.getFullYear() === selectedYear && 
//                empDate.getMonth() + 1 === selectedMonth;
//       }) || [];
      
//       const monthRents = rentsData.data?.filter(rent => {
//         const rentDate = new Date(rent.date);
//         return rentDate.getFullYear() === selectedYear && 
//                rentDate.getMonth() + 1 === selectedMonth;
//       }) || [];
      
//       const monthSupplies = suppliesData.data?.filter(supply => {
//         const supplyDate = new Date(supply.date);
//         return supplyDate.getFullYear() === selectedYear && 
//                supplyDate.getMonth() + 1 === selectedMonth;
//       }) || [];
      
//       const monthSoftware = softwareData.data?.filter(software => {
//         const softwareDate = new Date(software.date);
//         return softwareDate.getFullYear() === selectedYear && 
//                softwareDate.getMonth() + 1 === selectedMonth;
//       }) || [];
      
//       const monthTransport = transportData.data?.filter(transport => {
//         const transportDate = new Date(transport.date);
//         return transportDate.getFullYear() === selectedYear && 
//                transportDate.getMonth() + 1 === selectedMonth;
//       }) || [];
      
//       const monthExtra = extraData.data?.filter(extra => {
//         const extraDate = new Date(extra.date);
//         return extraDate.getFullYear() === selectedYear && 
//                extraDate.getMonth() + 1 === selectedMonth;
//       }) || [];

//       // Calculate totals
//       const employeeSalaries = monthEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0);
//       const officeRent = monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0);
//       const utilities = billsData.data?.reduce((sum, bill) => sum + (bill.amount || 0), 0) || 0;
//       const officeSupplies = monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0);
//       const softwareSubscriptions = monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0);
//       const transportExpenses = monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0);
//       const extraExpenses = monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0);

//       const total = employeeSalaries + officeRent + utilities + officeSupplies + 
//                     softwareSubscriptions + transportExpenses + extraExpenses;

//       // Create category breakdown for chart
//       const categoryBreakdown = [
//         { category: 'Employee Salaries', amount: employeeSalaries, color: '#3B82F6' },
//         { category: 'Office Rent', amount: officeRent, color: '#10B981' },
//         { category: 'Utilities', amount: utilities, color: '#F59E0B' },
//         { category: 'Office Supplies', amount: officeSupplies, color: '#8B5CF6' },
//         { category: 'Software', amount: softwareSubscriptions, color: '#EC4899' },
//         { category: 'Transport', amount: transportExpenses, color: '#06B6D4' },
//         { category: 'Extra Expenses', amount: extraExpenses, color: '#EF4444' }
//       ].filter(item => item.amount > 0);

//       setDashboardData(prev => ({
//         ...prev,
//         monthlySummary: {
//           total,
//           employeeSalaries,
//           officeRent,
//           utilities,
//           officeSupplies,
//           softwareSubscriptions,
//           transportExpenses,
//           extraExpenses,
//           categoryBreakdown
//         },
//         isLoading: false
//       }));

//     } catch (error) {
//       console.error('Error fetching monthly summary:', error);
//       setDashboardData(prev => ({ 
//         ...prev, 
//         error: 'Failed to load monthly summary data',
//         isLoading: false 
//       }));
//     }
//   };

//   // Fetch yearly summary data
//   const fetchYearlySummary = async () => {
//     try {
//       setDashboardData(prev => ({ ...prev, isLoadingYearly: true }));
      
//       const { selectedYearForYearly } = dashboardData;
      
//       // Fetch all data for the selected year
//       const [
//         employeesRes,
//         rentsRes,
//         billsRes,
//         suppliesRes,
//         softwareRes,
//         transportRes,
//         extraRes
//       ] = await Promise.all([
//         fetch(`${API_BASE_URL}/employees`),
//         fetch(`${API_BASE_URL}/office-rents`),
//         fetch(`${API_BASE_URL}/bills`),
//         fetch(`${API_BASE_URL}/office-supplies`),
//         fetch(`${API_BASE_URL}/software-subscriptions`),
//         fetch(`${API_BASE_URL}/transport-expenses`),
//         fetch(`${API_BASE_URL}/extra-expenses`)
//       ]);

//       // Parse responses
//       const employeesData = await employeesRes.json();
//       const rentsData = await rentsRes.json();
//       const billsData = await billsRes.json();
//       const suppliesData = await suppliesRes.json();
//       const softwareData = await softwareRes.json();
//       const transportData = await transportRes.json();
//       const extraData = await extraRes.json();

//       // Filter data for selected year
//       const yearEmployees = employeesData.data?.filter(emp => {
//         const empDate = new Date(emp.salaryDate);
//         return empDate.getFullYear() === selectedYearForYearly;
//       }) || [];
      
//       const yearRents = rentsData.data?.filter(rent => {
//         const rentDate = new Date(rent.date);
//         return rentDate.getFullYear() === selectedYearForYearly;
//       }) || [];
      
//       const yearBills = billsData.data?.filter(bill => bill.year === selectedYearForYearly) || [];
      
//       const yearSupplies = suppliesData.data?.filter(supply => {
//         const supplyDate = new Date(supply.date);
//         return supplyDate.getFullYear() === selectedYearForYearly;
//       }) || [];
      
//       const yearSoftware = softwareData.data?.filter(software => {
//         const softwareDate = new Date(software.date);
//         return softwareDate.getFullYear() === selectedYearForYearly;
//       }) || [];
      
//       const yearTransport = transportData.data?.filter(transport => {
//         const transportDate = new Date(transport.date);
//         return transportDate.getFullYear() === selectedYearForYearly;
//       }) || [];
      
//       const yearExtra = extraData.data?.filter(extra => {
//         const extraDate = new Date(extra.date);
//         return extraDate.getFullYear() === selectedYearForYearly;
//       }) || [];

//       // Calculate monthly breakdown
//       const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
//         const month = i + 1;
//         const monthName = MONTHS[i].substring(0, 3);
        
//         // Calculate for each month
//         const monthEmployees = yearEmployees.filter(emp => {
//           const empDate = new Date(emp.salaryDate);
//           return empDate.getMonth() + 1 === month;
//         });
//         const monthRents = yearRents.filter(rent => {
//           const rentDate = new Date(rent.date);
//           return rentDate.getMonth() + 1 === month;
//         });
//         const monthBills = yearBills.filter(bill => bill.month === month);
//         const monthSupplies = yearSupplies.filter(supply => {
//           const supplyDate = new Date(supply.date);
//           return supplyDate.getMonth() + 1 === month;
//         });
//         const monthSoftware = yearSoftware.filter(software => {
//           const softwareDate = new Date(software.date);
//           return softwareDate.getMonth() + 1 === month;
//         });
//         const monthTransport = yearTransport.filter(transport => {
//           const transportDate = new Date(transport.date);
//           return transportDate.getMonth() + 1 === month;
//         });
//         const monthExtra = yearExtra.filter(extra => {
//           const extraDate = new Date(extra.date);
//           return extraDate.getMonth() + 1 === month;
//         });

//         const total = 
//           monthEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0) +
//           monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0) +
//           monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0) +
//           monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0) +
//           monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0) +
//           monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0) +
//           monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0);

//         return {
//           month,
//           monthName,
//           total,
//           employeeSalaries: monthEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0),
//           officeRent: monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0),
//           utilities: monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0),
//           officeSupplies: monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0),
//           softwareSubscriptions: monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0),
//           transportExpenses: monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0),
//           extraExpenses: monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0)
//         };
//       });

//       // Calculate category totals for the year
//       const categoryTotals = [
//         { category: 'Employee Salaries', amount: yearEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0), color: '#3B82F6' },
//         { category: 'Office Rent', amount: yearRents.reduce((sum, rent) => sum + (rent.rent || 0), 0), color: '#10B981' },
//         { category: 'Utilities', amount: yearBills.reduce((sum, bill) => sum + (bill.amount || 0), 0), color: '#F59E0B' },
//         { category: 'Office Supplies', amount: yearSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0), color: '#8B5CF6' },
//         { category: 'Software', amount: yearSoftware.reduce((sum, software) => sum + (software.amount || 0), 0), color: '#EC4899' },
//         { category: 'Transport', amount: yearTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0), color: '#06B6D4' },
//         { category: 'Extra Expenses', amount: yearExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0), color: '#EF4444' }
//       ].filter(item => item.amount > 0);

//       const total = categoryTotals.reduce((sum, item) => sum + item.amount, 0);

//       setDashboardData(prev => ({
//         ...prev,
//         yearlySummary: {
//           total,
//           monthlyBreakdown,
//           categoryTotals
//         },
//         isLoadingYearly: false
//       }));

//     } catch (error) {
//       console.error('Error fetching yearly summary:', error);
//       setDashboardData(prev => ({ 
//         ...prev, 
//         error: 'Failed to load yearly summary data',
//         isLoadingYearly: false 
//       }));
//     }
//   };

//   // Fetch recent expenses
//   const fetchRecentExpenses = async () => {
//     try {
//       // Combine recent expenses from all categories
//       const recentExpenses = [];
//       const now = new Date();
//       const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
//       // Helper function to add expenses
//       const addExpenses = (data, type, nameField, amountField, dateField) => {
//         if (data.data && Array.isArray(data.data)) {
//           data.data.forEach(item => {
//             const date = new Date(item[dateField]);
//             if (date >= oneMonthAgo) {
//               recentExpenses.push({
//                 id: item._id,
//                 category: type,
//                 name: item[nameField] || 'Unknown',
//                 amount: item[amountField] || 0,
//                 date: date,
//                 payment: item.paymentMethod || 'Unknown'
//               });
//             }
//           });
//         }
//       };

//       // Fetch all expense types
//       const [
//         employeesRes,
//         rentsRes,
//         billsRes,
//         suppliesRes,
//         softwareRes,
//         transportRes,
//         extraRes
//       ] = await Promise.all([
//         fetch(`${API_BASE_URL}/employees`),
//         fetch(`${API_BASE_URL}/office-rents`),
//         fetch(`${API_BASE_URL}/bills`),
//         fetch(`${API_BASE_URL}/office-supplies`),
//         fetch(`${API_BASE_URL}/software-subscriptions`),
//         fetch(`${API_BASE_URL}/transport-expenses`),
//         fetch(`${API_BASE_URL}/extra-expenses`)
//       ]);

//       const employeesData = await employeesRes.json();
//       const rentsData = await rentsRes.json();
//       const billsData = await billsRes.json();
//       const suppliesData = await suppliesRes.json();
//       const softwareData = await softwareRes.json();
//       const transportData = await transportRes.json();
//       const extraData = await extraRes.json();

//       // Add all expenses
//       addExpenses(employeesData, 'Employee Salary', 'name', 'calculatedSalary', 'salaryDate');
//       addExpenses(rentsData, 'Office Rent', 'type', 'rent', 'date');
//       addExpenses(billsData, 'Utility Bill', 'name', 'amount', 'date');
//       addExpenses(suppliesData, 'Office Supply', 'name', 'price', 'date');
//       addExpenses(softwareData, 'Software', 'softwareName', 'amount', 'date');
//       addExpenses(transportData, 'Transport', 'transportName', 'cost', 'date');
//       addExpenses(extraData, 'Extra Expense', 'expenseName', 'amount', 'date');

//       // Sort by date descending and take top 10
//       recentExpenses.sort((a, b) => b.date - a.date);
//       const topRecent = recentExpenses.slice(0, 10);

//       setDashboardData(prev => ({
//         ...prev,
//         recentExpenses: topRecent
//       }));

//     } catch (error) {
//       console.error('Error fetching recent expenses:', error);
//     }
//   };

//   // Calculate percentage for category breakdown
//   const calculatePercentage = (amount) => {
//     const total = dashboardData.monthlySummary.total;
//     return total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
//   };

//   // Handle year/month change
//   const handleMonthYearChange = (type, value) => {
//     setDashboardData(prev => ({
//       ...prev,
//       [type]: parseInt(value)
//     }));
//   };

//   // Handle refresh
//   const handleRefresh = () => {
//     fetchMonthlySummary();
//     fetchYearlySummary();
//     fetchRecentExpenses();
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       {/* Header */}
//       <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Expense Dashboard</h1>
//           <p className="text-gray-600 mt-2">Track and analyze your office expenses</p>
//         </div>
//         <button
//           onClick={handleRefresh}
//           className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <RefreshCw className="w-4 h-4 mr-2" />
//           Refresh Data
//         </button>
//       </div>

//       {/* Error Display */}
//       {dashboardData.error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
//             <p className="text-red-700">{dashboardData.error}</p>
//           </div>
//         </div>
//       )}

//       {/* Monthly Summary Section */}
//       <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//           <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Monthly Expense Summary</h2>
//           <div className="flex space-x-4">
//             <div className="relative">
//               <select
//                 value={dashboardData.selectedYear}
//                 onChange={(e) => handleMonthYearChange('selectedYear', e.target.value)}
//                 className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 {yearOptions.map(year => (
//                   <option key={year} value={year}>{year}</option>
//                 ))}
//               </select>
//               <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
//             </div>
//             <div className="relative">
//               <select
//                 value={dashboardData.selectedMonth}
//                 onChange={(e) => handleMonthYearChange('selectedMonth', e.target.value)}
//                 className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 {MONTHS.map((month, index) => (
//                   <option key={index + 1} value={index + 1}>{month}</option>
//                 ))}
//               </select>
//               <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
//             </div>
//           </div>
//         </div>

//         {dashboardData.isLoading ? (
//           <div className="flex justify-center items-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//           </div>
//         ) : (
//           <>
//             {/* Monthly Total Card */}
//             <div className="bg-blue-50 rounded-xl p-6 mb-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-blue-600 text-sm font-medium">
//                     {MONTHS[dashboardData.selectedMonth - 1]} {dashboardData.selectedYear}
//                   </p>
//                   <h3 className="text-3xl font-bold text-gray-900 mt-2">
//                     {formatCurrency(dashboardData.monthlySummary.total)}
//                   </h3>
//                   <p className="text-gray-600 text-sm mt-2">Total Monthly Expenses</p>
//                 </div>
//                 <div className="p-3 bg-blue-100 rounded-full">
//                   <DollarSign className="w-8 h-8 text-blue-600" />
//                 </div>
//               </div>
//             </div>

//             {/* Category Breakdown */}
//             <div className="mb-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
//               <div className="space-y-4">
//                 {dashboardData.monthlySummary.categoryBreakdown.map((item, index) => (
//                   <div key={index} className="space-y-2">
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">{item.category}</span>
//                       <span className="font-semibold text-gray-900">
//                         {formatCurrency(item.amount)}
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div 
//                         className="h-2 rounded-full" 
//                         style={{ 
//                           width: `${calculatePercentage(item.amount)}%`,
//                           backgroundColor: item.color 
//                         }}
//                       ></div>
//                     </div>
//                     <div className="flex justify-between text-sm text-gray-500">
//                       <span>{calculatePercentage(item.amount)}% of total</span>
//                       <span>{item.category === 'Utilities' ? 'Bills & Utilities' : ''}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Detailed Monthly Breakdown */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {[
//                 { label: 'Employee Salaries', value: dashboardData.monthlySummary.employeeSalaries, color: 'blue' },
//                 { label: 'Office Rent', value: dashboardData.monthlySummary.officeRent, color: 'green' },
//                 { label: 'Utilities', value: dashboardData.monthlySummary.utilities, color: 'yellow' },
//                 { label: 'Office Supplies', value: dashboardData.monthlySummary.officeSupplies, color: 'purple' },
//                 { label: 'Software', value: dashboardData.monthlySummary.softwareSubscriptions, color: 'pink' },
//                 { label: 'Transport', value: dashboardData.monthlySummary.transportExpenses, color: 'cyan' },
//                 { label: 'Extra Expenses', value: dashboardData.monthlySummary.extraExpenses, color: 'red' },
//               ].filter(item => item.value > 0).map((item, index) => (
//                 <div key={index} className="bg-gray-50 rounded-lg p-4">
//                   <p className="text-gray-500 text-sm">{item.label}</p>
//                   <p className="text-xl font-bold text-gray-900 mt-1">
//                     {formatCurrency(item.value)}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Yearly Summary Section */}
//       <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//           <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Yearly Expense Summary</h2>
//           <div className="relative">
//             <select
//               value={dashboardData.selectedYearForYearly}
//               onChange={(e) => handleMonthYearChange('selectedYearForYearly', e.target.value)}
//               className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               {yearOptions.map(year => (
//                 <option key={year} value={year}>{year}</option>
//               ))}
//             </select>
//             <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
//           </div>
//         </div>

//         {dashboardData.isLoadingYearly ? (
//           <div className="flex justify-center items-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//           </div>
//         ) : (
//           <>
//             {/* Yearly Total Card */}
//             <div className="bg-green-50 rounded-xl p-6 mb-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-green-600 text-sm font-medium">Year {dashboardData.selectedYearForYearly}</p>
//                   <h3 className="text-3xl font-bold text-gray-900 mt-2">
//                     {formatCurrency(dashboardData.yearlySummary.total)}
//                   </h3>
//                   <p className="text-gray-600 text-sm mt-2">Total Yearly Expenses</p>
//                 </div>
//                 <div className="p-3 bg-green-100 rounded-full">
//                   <Calendar className="w-8 h-8 text-green-600" />
//                 </div>
//               </div>
//             </div>

//             {/* Monthly Breakdown Chart */}
//             <div className="mb-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
//               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//                 {dashboardData.yearlySummary.monthlyBreakdown.map((month, index) => (
//                   <div key={index} className="text-center">
//                     <div className="text-sm text-gray-500 mb-1">{month.monthName}</div>
//                     <div className="text-lg font-bold text-gray-900">
//                       {formatCurrency(month.total)}
//                     </div>
//                     <div className="mt-2">
//                       <div 
//                         className="h-2 bg-blue-200 rounded-full"
//                         style={{ 
//                           width: '100%',
//                           backgroundColor: month.total > 0 ? '#93C5FD' : '#E5E7EB'
//                         }}
//                       >
//                         <div 
//                           className="h-2 bg-blue-600 rounded-full"
//                           style={{ 
//                             width: `${Math.min((month.total / Math.max(...dashboardData.yearlySummary.monthlyBreakdown.map(m => m.total || 1))) * 100, 100)}%`
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Yearly Category Totals */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Yearly Category Totals</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {dashboardData.yearlySummary.categoryTotals.map((item, index) => (
//                   <div key={index} className="bg-gray-50 rounded-lg p-4">
//                     <div className="flex items-center mb-2">
//                       <div 
//                         className="w-3 h-3 rounded-full mr-2"
//                         style={{ backgroundColor: item.color }}
//                       ></div>
//                       <span className="font-medium text-gray-700">{item.category}</span>
//                     </div>
//                     <p className="text-xl font-bold text-gray-900">
//                       {formatCurrency(item.amount)}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Recent Expenses Section */}
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-bold text-gray-900">Recent Expenses</h2>
//           <FileText className="w-6 h-6 text-gray-500" />
//         </div>
        
//         <div className="space-y-4">
//           {dashboardData.recentExpenses.map((expense) => (
//             <div key={expense.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h4 className="font-semibold text-gray-900">{expense.category}</h4>
//                   <p className="text-sm text-gray-500 mt-1">
//                     {expense.name} • {expense.payment}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     {expense.date.toLocaleDateString('en-IN', { 
//                       day: 'numeric',
//                       month: 'short',
//                       year: 'numeric'
//                     })}
//                   </p>
//                 </div>
//                 <span className="text-xl font-bold text-gray-900">
//                   {formatCurrency(expense.amount)}
//                 </span>
//               </div>
//             </div>
//           ))}
          
//           {dashboardData.recentExpenses.length === 0 && (
//             <div className="text-center py-8 text-gray-500">
//               No recent expenses found
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
//         <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <button 
//             onClick={() => window.location.href = '/dashboard/expenses/add'}
//             className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
//           >
//             <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200">
//               <PlusCircle className="w-8 h-8 text-blue-600" />
//             </div>
//             <span className="font-semibold text-gray-900">Add Expense</span>
//             <span className="text-sm text-gray-500 mt-1">Record new cost</span>
//           </button>

//           <button 
//             onClick={() => {
//               // Generate report functionality
//               const month = MONTHS[dashboardData.selectedMonth - 1];
//               const year = dashboardData.selectedYear;
//               alert(`Generating report for ${month} ${year}...`);
//             }}
//             className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
//           >
//             <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:bg-green-200">
//               <Download className="w-8 h-8 text-green-600" />
//             </div>
//             <span className="font-semibold text-gray-900">Generate Report</span>
//             <span className="text-sm text-gray-500 mt-1">Monthly PDF</span>
//           </button>

//           <button 
//             onClick={() => window.location.href = '/dashboard/analytics'}
//             className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
//           >
//             <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200">
//               <BarChart3 className="w-8 h-8 text-purple-600" />
//             </div>
//             <span className="font-semibold text-gray-900">View Analytics</span>
//             <span className="text-sm text-gray-500 mt-1">Trends & insights</span>
//           </button>

//           <button 
//             onClick={() => window.location.href = '/dashboard/categories'}
//             className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
//           >
//             <div className="p-3 bg-orange-100 rounded-full mb-3 group-hover:bg-orange-200">
//               <Tag className="w-8 h-8 text-orange-600" />
//             </div>
//             <span className="font-semibold text-gray-900">Manage Categories</span>
//             <span className="text-sm text-gray-500 mt-1">Add/Edit categories</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  PieChart,
  FileText,
  BarChart3,
  Download,
  RefreshCw,
  ChevronDown,
  Filter,
  PlusCircle,
  Tag,
  AlertCircle
} from 'lucide-react';

// API base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Months for dropdown
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    // Selected Period
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1, // 1-12
    selectedYearForYearly: new Date().getFullYear(),
    
    // Summary Data
    monthlySummary: {
      total: 0,
      employeeSalaries: 0,
      officeRent: 0,
      utilities: 0,
      officeSupplies: 0,
      softwareSubscriptions: 0,
      transportExpenses: 0,
      extraExpenses: 0,
      categoryBreakdown: []
    },
    
    yearlySummary: {
      total: 0,
      monthlyBreakdown: [],
      categoryTotals: []
    },
    
    // Category-wise Breakdown
    categoryBreakdown: [],
    
    // Recent Expenses
    recentExpenses: [],
    
    // Loading states
    isLoading: false,
    isLoadingYearly: false,
    
    // Error states
    error: null
  });

  // Generate year options (last 5 years + current year + next year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  // Fetch all data when component mounts or selections change
  useEffect(() => {
    fetchMonthlySummary();
    fetchYearlySummary();
    fetchRecentExpenses();
  }, [dashboardData.selectedYear, dashboardData.selectedMonth, dashboardData.selectedYearForYearly]);

  // Fetch monthly summary data
  const fetchMonthlySummary = async () => {
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { selectedYear, selectedMonth } = dashboardData;
      
      // Fetch all data for the selected month
      const [
        employeesRes,
        rentsRes,
        billsRes,
        suppliesRes,
        softwareRes,
        transportRes,
        extraRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`),
        fetch(`${API_BASE_URL}/office-rents`),
        fetch(`${API_BASE_URL}/bills/month/${selectedYear}/${selectedMonth}`),
        fetch(`${API_BASE_URL}/office-supplies`),
        fetch(`${API_BASE_URL}/software-subscriptions`),
        fetch(`${API_BASE_URL}/transport-expenses`),
        fetch(`${API_BASE_URL}/extra-expenses`)
      ]);

      // Parse responses
      const employeesData = await employeesRes.json();
      const rentsData = await rentsRes.json();
      const billsData = await billsRes.json();
      const suppliesData = await suppliesRes.json();
      const softwareData = await softwareRes.json();
      const transportData = await transportRes.json();
      const extraData = await extraRes.json();

      // Filter data for selected month
      const monthEmployees = employeesData.data?.filter(emp => {
        const empDate = new Date(emp.salaryDate);
        return empDate.getFullYear() === selectedYear && 
               empDate.getMonth() + 1 === selectedMonth;
      }) || [];
      
      const monthRents = rentsData.data?.filter(rent => {
        const rentDate = new Date(rent.date);
        return rentDate.getFullYear() === selectedYear && 
               rentDate.getMonth() + 1 === selectedMonth;
      }) || [];
      
      const monthSupplies = suppliesData.data?.filter(supply => {
        const supplyDate = new Date(supply.date);
        return supplyDate.getFullYear() === selectedYear && 
               supplyDate.getMonth() + 1 === selectedMonth;
      }) || [];
      
      const monthSoftware = softwareData.data?.filter(software => {
        const softwareDate = new Date(software.date);
        return softwareDate.getFullYear() === selectedYear && 
               softwareDate.getMonth() + 1 === selectedMonth;
      }) || [];
      
      const monthTransport = transportData.data?.filter(transport => {
        const transportDate = new Date(transport.date);
        return transportDate.getFullYear() === selectedYear && 
               transportDate.getMonth() + 1 === selectedMonth;
      }) || [];
      
      const monthExtra = extraData.data?.filter(extra => {
        const extraDate = new Date(extra.date);
        return extraDate.getFullYear() === selectedYear && 
               extraDate.getMonth() + 1 === selectedMonth;
      }) || [];

      // Calculate totals
      const employeeSalaries = monthEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0);
      const officeRent = monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0);
      const utilities = billsData.data?.reduce((sum, bill) => sum + (bill.amount || 0), 0) || 0;
      const officeSupplies = monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0);
      const softwareSubscriptions = monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0);
      const transportExpenses = monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0);
      const extraExpenses = monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0);

      const total = employeeSalaries + officeRent + utilities + officeSupplies + 
                    softwareSubscriptions + transportExpenses + extraExpenses;

      // Create category breakdown for chart
      const categoryBreakdown = [
        { category: 'Employee Salaries', amount: employeeSalaries, color: '#3B82F6' },
        { category: 'Office Rent', amount: officeRent, color: '#10B981' },
        { category: 'Utilities', amount: utilities, color: '#F59E0B' },
        { category: 'Office Supplies', amount: officeSupplies, color: '#8B5CF6' },
        { category: 'Software', amount: softwareSubscriptions, color: '#EC4899' },
        { category: 'Transport', amount: transportExpenses, color: '#06B6D4' },
        { category: 'Extra Expenses', amount: extraExpenses, color: '#EF4444' }
      ].filter(item => item.amount > 0);

      setDashboardData(prev => ({
        ...prev,
        monthlySummary: {
          total,
          employeeSalaries,
          officeRent,
          utilities,
          officeSupplies,
          softwareSubscriptions,
          transportExpenses,
          extraExpenses,
          categoryBreakdown
        },
        isLoading: false
      }));

    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      setDashboardData(prev => ({ 
        ...prev, 
        error: 'Failed to load monthly summary data',
        isLoading: false 
      }));
    }
  };

  // Fetch yearly summary data
  const fetchYearlySummary = async () => {
    try {
      setDashboardData(prev => ({ ...prev, isLoadingYearly: true }));
      
      const { selectedYearForYearly } = dashboardData;
      
      // Fetch all data for the selected year
      const [
        employeesRes,
        rentsRes,
        billsRes,
        suppliesRes,
        softwareRes,
        transportRes,
        extraRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`),
        fetch(`${API_BASE_URL}/office-rents`),
        fetch(`${API_BASE_URL}/bills`),
        fetch(`${API_BASE_URL}/office-supplies`),
        fetch(`${API_BASE_URL}/software-subscriptions`),
        fetch(`${API_BASE_URL}/transport-expenses`),
        fetch(`${API_BASE_URL}/extra-expenses`)
      ]);

      // Parse responses
      const employeesData = await employeesRes.json();
      const rentsData = await rentsRes.json();
      const billsData = await billsRes.json();
      const suppliesData = await suppliesRes.json();
      const softwareData = await softwareRes.json();
      const transportData = await transportRes.json();
      const extraData = await extraRes.json();

      // Filter data for selected year
      const yearEmployees = employeesData.data?.filter(emp => {
        const empDate = new Date(emp.salaryDate);
        return empDate.getFullYear() === selectedYearForYearly;
      }) || [];
      
      const yearRents = rentsData.data?.filter(rent => {
        const rentDate = new Date(rent.date);
        return rentDate.getFullYear() === selectedYearForYearly;
      }) || [];
      
      const yearBills = billsData.data?.filter(bill => bill.year === selectedYearForYearly) || [];
      
      const yearSupplies = suppliesData.data?.filter(supply => {
        const supplyDate = new Date(supply.date);
        return supplyDate.getFullYear() === selectedYearForYearly;
      }) || [];
      
      const yearSoftware = softwareData.data?.filter(software => {
        const softwareDate = new Date(software.date);
        return softwareDate.getFullYear() === selectedYearForYearly;
      }) || [];
      
      const yearTransport = transportData.data?.filter(transport => {
        const transportDate = new Date(transport.date);
        return transportDate.getFullYear() === selectedYearForYearly;
      }) || [];
      
      const yearExtra = extraData.data?.filter(extra => {
        const extraDate = new Date(extra.date);
        return extraDate.getFullYear() === selectedYearForYearly;
      }) || [];

      // Calculate monthly breakdown
      const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthName = MONTHS[i].substring(0, 3);
        
        // Calculate for each month
        const monthEmployees = yearEmployees.filter(emp => {
          const empDate = new Date(emp.salaryDate);
          return empDate.getMonth() + 1 === month;
        });
        const monthRents = yearRents.filter(rent => {
          const rentDate = new Date(rent.date);
          return rentDate.getMonth() + 1 === month;
        });
        const monthBills = yearBills.filter(bill => bill.month === month);
        const monthSupplies = yearSupplies.filter(supply => {
          const supplyDate = new Date(supply.date);
          return supplyDate.getMonth() + 1 === month;
        });
        const monthSoftware = yearSoftware.filter(software => {
          const softwareDate = new Date(software.date);
          return softwareDate.getMonth() + 1 === month;
        });
        const monthTransport = yearTransport.filter(transport => {
          const transportDate = new Date(transport.date);
          return transportDate.getMonth() + 1 === month;
        });
        const monthExtra = yearExtra.filter(extra => {
          const extraDate = new Date(extra.date);
          return extraDate.getMonth() + 1 === month;
        });

        const total = 
          monthEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0) +
          monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0) +
          monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0) +
          monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0) +
          monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0) +
          monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0) +
          monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0);

        return {
          month,
          monthName,
          total,
          employeeSalaries: monthEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0),
          officeRent: monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0),
          utilities: monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0),
          officeSupplies: monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0),
          softwareSubscriptions: monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0),
          transportExpenses: monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0),
          extraExpenses: monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0)
        };
      });

      // Calculate category totals for the year
      const categoryTotals = [
        { category: 'Employee Salaries', amount: yearEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0), color: '#3B82F6' },
        { category: 'Office Rent', amount: yearRents.reduce((sum, rent) => sum + (rent.rent || 0), 0), color: '#10B981' },
        { category: 'Utilities', amount: yearBills.reduce((sum, bill) => sum + (bill.amount || 0), 0), color: '#F59E0B' },
        { category: 'Office Supplies', amount: yearSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0), color: '#8B5CF6' },
        { category: 'Software', amount: yearSoftware.reduce((sum, software) => sum + (software.amount || 0), 0), color: '#EC4899' },
        { category: 'Transport', amount: yearTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0), color: '#06B6D4' },
        { category: 'Extra Expenses', amount: yearExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0), color: '#EF4444' }
      ].filter(item => item.amount > 0);

      const total = categoryTotals.reduce((sum, item) => sum + item.amount, 0);

      setDashboardData(prev => ({
        ...prev,
        yearlySummary: {
          total,
          monthlyBreakdown,
          categoryTotals
        },
        isLoadingYearly: false
      }));

    } catch (error) {
      console.error('Error fetching yearly summary:', error);
      setDashboardData(prev => ({ 
        ...prev, 
        error: 'Failed to load yearly summary data',
        isLoadingYearly: false 
      }));
    }
  };

  // Fetch recent expenses
  const fetchRecentExpenses = async () => {
    try {
      // Combine recent expenses from all categories
      const recentExpenses = [];
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      // Helper function to add expenses
      const addExpenses = (data, type, nameField, amountField, dateField) => {
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach(item => {
            const date = new Date(item[dateField]);
            if (date >= oneMonthAgo) {
              recentExpenses.push({
                id: item._id,
                category: type,
                name: item[nameField] || 'Unknown',
                amount: item[amountField] || 0,
                date: date,
                payment: item.paymentMethod || 'Unknown'
              });
            }
          });
        }
      };

      // Fetch all expense types
      const [
        employeesRes,
        rentsRes,
        billsRes,
        suppliesRes,
        softwareRes,
        transportRes,
        extraRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`),
        fetch(`${API_BASE_URL}/office-rents`),
        fetch(`${API_BASE_URL}/bills`),
        fetch(`${API_BASE_URL}/office-supplies`),
        fetch(`${API_BASE_URL}/software-subscriptions`),
        fetch(`${API_BASE_URL}/transport-expenses`),
        fetch(`${API_BASE_URL}/extra-expenses`)
      ]);

      const employeesData = await employeesRes.json();
      const rentsData = await rentsRes.json();
      const billsData = await billsRes.json();
      const suppliesData = await suppliesRes.json();
      const softwareData = await softwareRes.json();
      const transportData = await transportRes.json();
      const extraData = await extraRes.json();

      // Add all expenses
      addExpenses(employeesData, 'Employee Salary', 'name', 'calculatedSalary', 'salaryDate');
      addExpenses(rentsData, 'Office Rent', 'type', 'rent', 'date');
      addExpenses(billsData, 'Utility Bill', 'name', 'amount', 'date');
      addExpenses(suppliesData, 'Office Supply', 'name', 'price', 'date');
      addExpenses(softwareData, 'Software', 'softwareName', 'amount', 'date');
      addExpenses(transportData, 'Transport', 'transportName', 'cost', 'date');
      addExpenses(extraData, 'Extra Expense', 'expenseName', 'amount', 'date');

      // Sort by date descending and take top 10
      recentExpenses.sort((a, b) => b.date - a.date);
      const topRecent = recentExpenses.slice(0, 10);

      setDashboardData(prev => ({
        ...prev,
        recentExpenses: topRecent
      }));

    } catch (error) {
      console.error('Error fetching recent expenses:', error);
    }
  };

  // Calculate percentage for category breakdown
  const calculatePercentage = (amount) => {
    const total = dashboardData.monthlySummary.total;
    return total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
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
    fetchMonthlySummary();
    fetchYearlySummary();
    fetchRecentExpenses();
  };

  // Format currency in BDT (Taka)
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'BDT 0';
    
    // Format with BDT symbol and proper number formatting
    const formattedAmount = new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    return `BDT ${formattedAmount}`;
  };

  // Format currency without symbol (for display where needed)
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0.00';
    
    return new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Dashboard</h1>
          <p className="text-gray-600 mt-2">Track and analyze your office expenses in BDT (Taka)</p>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Error Display */}
      {dashboardData.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{dashboardData.error}</p>
          </div>
        </div>
      )}

      {/* Monthly Summary Section */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Monthly Expense Summary</h2>
          <div className="flex space-x-4">
            <div className="relative">
              <select
                value={dashboardData.selectedYear}
                onChange={(e) => handleMonthYearChange('selectedYear', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              >
                {MONTHS.map((month, index) => (
                  <option key={index + 1} value={index + 1}>{month}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {dashboardData.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Monthly Total Card */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    {MONTHS[dashboardData.selectedMonth - 1]} {dashboardData.selectedYear}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(dashboardData.monthlySummary.total)}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">Total Monthly Expenses (BDT)</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-4">
                {dashboardData.monthlySummary.categoryBreakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">{item.category}</span>
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

            {/* Detailed Monthly Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Employee Salaries', value: dashboardData.monthlySummary.employeeSalaries, color: 'blue' },
                { label: 'Office Rent', value: dashboardData.monthlySummary.officeRent, color: 'green' },
                { label: 'Utilities', value: dashboardData.monthlySummary.utilities, color: 'yellow' },
                { label: 'Office Supplies', value: dashboardData.monthlySummary.officeSupplies, color: 'purple' },
                { label: 'Software', value: dashboardData.monthlySummary.softwareSubscriptions, color: 'pink' },
                { label: 'Transport', value: dashboardData.monthlySummary.transportExpenses, color: 'cyan' },
                { label: 'Extra Expenses', value: dashboardData.monthlySummary.extraExpenses, color: 'red' },
              ].filter(item => item.value > 0).map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">{item.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Yearly Summary Section */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Yearly Expense Summary</h2>
          <div className="relative">
            <select
              value={dashboardData.selectedYearForYearly}
              onChange={(e) => handleMonthYearChange('selectedYearForYearly', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {dashboardData.isLoadingYearly ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Yearly Total Card */}
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Year {dashboardData.selectedYearForYearly}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(dashboardData.yearlySummary.total)}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">Total Yearly Expenses (BDT)</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Monthly Breakdown Chart */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {dashboardData.yearlySummary.monthlyBreakdown.map((month, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-gray-500 mb-1">{month.monthName}</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(month.total)}
                    </div>
                    <div className="mt-2">
                      <div 
                        className="h-2 bg-blue-200 rounded-full"
                        style={{ 
                          width: '100%',
                          backgroundColor: month.total > 0 ? '#93C5FD' : '#E5E7EB'
                        }}
                      >
                        <div 
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ 
                            width: `${Math.min((month.total / Math.max(...dashboardData.yearlySummary.monthlyBreakdown.map(m => m.total || 1))) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      BDT {formatAmount(month.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yearly Category Totals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Yearly Category Totals (BDT)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData.yearlySummary.categoryTotals.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium text-gray-700">{item.category}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(item.amount)}
                    </p>
                    <div className="text-sm text-gray-500 mt-1">
                      BDT {formatAmount(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Expenses Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Expenses (Past 30 Days)</h2>
          <FileText className="w-6 h-6 text-gray-500" />
        </div>
        
        <div className="space-y-4">
          {dashboardData.recentExpenses.map((expense) => (
            <div key={expense.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900">{expense.category}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {expense.name} • {expense.payment}
                  </p>
                  <p className="text-sm text-gray-500">
                    {expense.date.toLocaleDateString('en-BD', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-900 block">
                    {formatCurrency(expense.amount)}
                  </span>
                  <span className="text-sm text-gray-500 block">
                    BDT {formatAmount(expense.amount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {dashboardData.recentExpenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recent expenses found in the past 30 days
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/dashboard/expenses/add'}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200">
              <PlusCircle className="w-8 h-8 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">Add Expense</span>
            <span className="text-sm text-gray-500 mt-1">Record new cost in BDT</span>
          </button>

          <button 
            onClick={() => {
              // Generate report functionality
              const month = MONTHS[dashboardData.selectedMonth - 1];
              const year = dashboardData.selectedYear;
              alert(`Generating BDT expense report for ${month} ${year}...`);
            }}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:bg-green-200">
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <span className="font-semibold text-gray-900">Generate Report</span>
            <span className="text-sm text-gray-500 mt-1">Monthly PDF (BDT)</span>
          </button>

          <button 
            onClick={() => window.location.href = '/dashboard/analytics'}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <span className="font-semibold text-gray-900">View Analytics</span>
            <span className="text-sm text-gray-500 mt-1">Trends & insights in BDT</span>
          </button>

          <button 
            onClick={() => window.location.href = '/dashboard/categories'}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="p-3 bg-orange-100 rounded-full mb-3 group-hover:bg-orange-200">
              <Tag className="w-8 h-8 text-orange-600" />
            </div>
            <span className="font-semibold text-gray-900">Manage Categories</span>
            <span className="text-sm text-gray-500 mt-1">Add/Edit expense categories</span>
          </button>
        </div>
      </div>

     
    </div>
  );
}